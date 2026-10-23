(() => {
  'use strict';

  const C = window.PORTFOLIO;
  if (!C) {
    console.error('content.js did not load. Check the script path in index.html.');
    return;
  }

  /* ---------- Small helpers ---------- */

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const DEFAULT_GRADIENT = 'from-brand-500 to-accent-500';
  const IMAGE_CLASS = 'absolute inset-0 h-full w-full object-cover';

  /**
   * Create an element. Props: class, text, any attribute, and on<event> handlers.
   * Falsy values (false, null, undefined) are skipped. Children may be nodes,
   * strings, or arrays of either.
   */
  function h(tag, props = {}, ...children) {
    const node = document.createElement(tag);
    Object.entries(props).forEach(([key, value]) => {
      if (value === false || value == null) return;
      if (key === 'text') node.textContent = value;
      else if (key === 'class') node.className = value;
      else if (key.startsWith('on')) node.addEventListener(key.slice(2), value);
      else node.setAttribute(key, value === true ? '' : value);
    });
    children.flat().forEach((child) => {
      if (child == null || child === false) return;
      node.append(child instanceof Node ? child : document.createTextNode(String(child)));
    });
    return node;
  }

  /** localStorage can throw in private mode or when blocked, so every access is guarded. */
  const storage = {
    get(key) {
      try { return localStorage.getItem(key); } catch { return null; }
    },
    set(key, value) {
      try { localStorage.setItem(key, value); } catch { /* ignore */ }
    }
  };

  const initialsOf = (name) =>
    name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('');

  const levelLabel = (value) =>
    value < 30 ? 'Learning' : value < 60 ? 'Practising' : value < 85 ? 'Comfortable' : 'Strong';

  const isExternal = (url) => /^https?:\/\//i.test(url);

  /** Social and contact links, skipping any that were left empty in content.js. */
  function contactLinks(owner) {
    const list = [];
    if (owner.email) list.push({ label: 'Email', href: `mailto:${owner.email}` });
    (owner.links || []).forEach((link) => {
      if (link.url) list.push({ label: link.label, href: link.url });
    });
    return list;
  }

  function linkPill({ label, href }) {
    const external = isExternal(href);
    return h('li', {},
      h('a', {
        href,
        class: 'pill',
        target: external ? '_blank' : false,
        rel: external ? 'noopener noreferrer' : false
      }, label)
    );
  }

  /** Loads an image in the background. It is only added once it has loaded, so a broken path never shows. */
  function attachImage(container, src, alt) {
  if (!src) return;
  const img = new Image();
  img.alt = alt;
  img.className = IMAGE_CLASS;
  img.onload = () => container.append(img);
  img.src = src;
}

  /* ---------- Rendering ---------- */

  function renderOwner() {
    const o = C.owner;
    document.title = `${o.name} | Portfolio`;
    $('#brand').textContent = o.name;
    $('#hero-name').textContent = o.name;
    $('#hero-intro').textContent = o.intro;
    $('#footer-name').textContent = o.name;

    $('#email-link').href = `mailto:${o.email}`;
    $('#email-link').textContent = o.email;

    $('#avatar-initials').textContent = o.initials || initialsOf(o.name);
    if (o.photo) {
      const img = new Image();
      img.alt = `Photo of ${o.name}`;
      img.className = IMAGE_CLASS;
      img.onload = () => {
        $('#avatar-initials').classList.add('hidden');
        $('#avatar').append(img);
      };
      img.src = o.photo;
    }

    const links = contactLinks(o);
    $('#socials').replaceChildren(...links.map(linkPill));
    $('#contact-links').replaceChildren(...links.filter((l) => l.label !== 'Email').map(linkPill));
  }

  function renderAbout() {
    const a = C.about;
    $('#about-text').replaceChildren(
      ...a.paragraphs.map((text) =>
        h('p', { class: 'leading-relaxed text-slate-600 dark:text-slate-300', text })
      )
    );
    $('#about-facts').replaceChildren(
      ...a.facts.map((fact) =>
        h('div', { class: 'flex flex-col gap-1 border-b border-slate-200 pb-4 last:border-0 last:pb-0 dark:border-slate-800' },
          h('dt', { class: 'text-sm text-slate-500 dark:text-slate-400', text: fact.label }),
          h('dd', { class: 'font-semibold', text: fact.value })
        )
      )
    );
    $('#about-interests').replaceChildren(
      ...a.interests.map((text) => h('span', { class: 'pill-soft', text }))
    );
  }

  function skillRow(skill) {
    return h('div', {},
      h('div', { class: 'mb-2 flex items-center justify-between text-sm' },
        h('span', { class: 'font-medium', text: skill.name }),
        h('span', { class: 'text-slate-500 dark:text-slate-400', text: levelLabel(skill.level) })
      ),
      h('div', {
        class: 'h-2.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800',
        role: 'meter',
        'aria-label': skill.name,
        'aria-valuemin': 0,
        'aria-valuemax': 100,
        'aria-valuenow': skill.level
      },
        h('div', {
          class: 'skill-fill h-full rounded-full bg-gradient-to-r from-brand-500 to-accent-500',
          'data-level': skill.level
        })
      )
    );
  }

  function renderSkills() {
    $('#skills-grid').replaceChildren(
      ...C.skills.map((group) =>
        h('div', { class: 'reveal card p-6' },
          h('h3', { class: 'font-display text-lg font-semibold', text: group.category }),
          h('div', { class: 'mt-5 space-y-5' }, group.items.map(skillRow))
        )
      )
    );
    $('#tools-list').replaceChildren(...C.tools.map((text) => h('span', { class: 'pill-soft', text })));
  }

  /* ---------- Projects: filters, cards, details dialog ---------- */

  let activeFilter = 'All';

  function renderProjectFilters() {
    const categories = ['All', ...new Set(C.projects.map((p) => p.category))];
    $('#filters').replaceChildren(
      ...categories.map((category) =>
        h('button', {
          type: 'button',
          class: 'filter-btn',
          'data-filter': category,
          'aria-pressed': 'false',
          onclick: () => {
            activeFilter = category;
            renderProjects();
          },
          text: category
        })
      )
    );
  }

  function projectCard(project) {
    const media = h('div', {
      class: `relative aspect-video overflow-hidden bg-gradient-to-br ${project.gradient || DEFAULT_GRADIENT}`
    },
      h('span', {
        class: 'absolute inset-0 flex items-center justify-center font-display text-6xl font-bold text-white/70',
        'aria-hidden': 'true',
        text: project.title.charAt(0)
      })
    );
    attachImage(media, project.image, `Screenshot of ${project.title}`);

    return h('article', { class: 'reveal project-card flex flex-col overflow-hidden rounded-2xl' },
      media,
      h('div', { class: 'flex flex-1 flex-col p-6' },
        h('span', {
          class: 'text-xs font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400',
          text: project.category
        }),
        h('h3', { class: 'mt-2 font-display text-xl font-semibold', text: project.title }),
        h('p', {
          class: 'mt-2 flex-1 text-sm leading-relaxed text-slate-600 dark:text-slate-400',
          text: project.summary
        }),
        h('div', { class: 'mt-4 flex flex-wrap gap-2' },
          project.tags.map((tag) => h('span', { class: 'pill-soft', text: tag }))
        ),
        h('button', {
          type: 'button',
          class: 'mt-5 self-start text-sm font-semibold text-brand-600 hover:underline dark:text-brand-400',
          onclick: () => openProject(project)
        }, 'View details \u2192')
      )
    );
  }

  function renderProjects() {
    const list = C.projects.filter((p) => activeFilter === 'All' || p.category === activeFilter);
    const grid = $('#projects-grid');
    grid.replaceChildren(...list.map(projectCard));
    $('#projects-empty').classList.toggle('hidden', list.length > 0);

    $$('.filter-btn').forEach((btn) => {
      const on = btn.dataset.filter === activeFilter;
      btn.classList.toggle('is-active', on);
      btn.setAttribute('aria-pressed', String(on));
    });

    observeReveals(grid);
  }

  function linkButton({ label, href }) {
    const external = isExternal(href);
    return h('a', {
      href,
      class: 'btn btn-secondary inline-flex !py-2 text-sm',
      target: external ? '_blank' : false,
      rel: external ? 'noopener noreferrer' : false
    }, label);
  }

  function openProject(project) {
    const dialog = $('#project-modal');

    const media = $('#modal-media');
    media.className = `relative aspect-video w-full overflow-hidden bg-gradient-to-br ${project.gradient || DEFAULT_GRADIENT}`;
    media.replaceChildren();
    attachImage(media, project.image, `Screenshot of ${project.title}`);

    $('#modal-category').textContent = project.category;
    const status = $('#modal-status');
    status.textContent = project.status || '';
    status.classList.toggle('hidden', !project.status);

    $('#modal-title').textContent = project.title;
    $('#modal-body').replaceChildren(
      ...project.description.map((text) => h('p', { text }))
    );
    $('#modal-contribution').textContent = project.contribution;
    $('#modal-tags').replaceChildren(...project.tags.map((text) => h('span', { class: 'pill-soft', text })));

    const links = [
      project.link && { label: 'View live project', href: project.link },
      project.repo && { label: 'View source code', href: project.repo }
    ].filter(Boolean);
    $('#modal-links').replaceChildren(...links.map(linkButton));
    $('#modal-links').classList.toggle('hidden', links.length === 0);

    document.body.classList.add('overflow-hidden');
    dialog.showModal();
  }

  function setupProjectModal() {
    const dialog = $('#project-modal');
    $('#modal-close').addEventListener('click', () => dialog.close());
    // Clicking the backdrop (outside the content box) closes the dialog.
    dialog.addEventListener('click', (e) => {
      if (e.target === dialog) dialog.close();
    });
    dialog.addEventListener('close', () => document.body.classList.remove('overflow-hidden'));
  }

  /* ---------- Theme ---------- */

  function setupTheme() {
    const root = document.documentElement;
    const button = $('#theme-toggle');

    const paint = () => {
      const dark = root.classList.contains('dark');
      $('#icon-moon').classList.toggle('hidden', dark);
      $('#icon-sun').classList.toggle('hidden', !dark);
      button.setAttribute('aria-pressed', String(dark));
    };

    button.addEventListener('click', () => {
      const dark = root.classList.toggle('dark');
      storage.set('theme', dark ? 'dark' : 'light');
      paint();
    });

    paint();
  }

  /* ---------- Mobile menu ---------- */

  function setupMenu() {
    const button = $('#menu-toggle');
    const menu = $('#mobile-menu');

    const setOpen = (open) => {
      menu.classList.toggle('hidden', !open);
      button.setAttribute('aria-expanded', String(open));
      button.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      $('#icon-menu').classList.toggle('hidden', open);
      $('#icon-close').classList.toggle('hidden', !open);
    };

    button.addEventListener('click', () => setOpen(menu.classList.contains('hidden')));
    menu.addEventListener('click', (e) => {
      if (e.target.closest('a')) setOpen(false);
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') setOpen(false);
    });
    window.matchMedia('(min-width: 768px)').addEventListener('change', (e) => {
      if (e.matches) setOpen(false);
    });
  }

  /* ---------- Scroll effects: progress bar, header, back-to-top ---------- */

  function setupScrollEffects() {
    const header = $('#site-header');
    const progress = $('#progress');
    const backTop = $('#back-to-top');
    let queued = false;

    const update = () => {
      queued = false;
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;

      progress.style.width = max > 0 ? `${(y / max) * 100}%` : '0%';
      header.classList.toggle('header-scrolled', y > 16);
      backTop.classList.toggle('is-shown', y > 500);
    };

    window.addEventListener('scroll', () => {
      if (!queued) {
        queued = true;
        requestAnimationFrame(update);
      }
    }, { passive: true });

    backTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });

    update();
  }

  /* ---------- Highlight the nav link for the section in view ---------- */

  function setupActiveLinks() {
    const links = $$('[data-nav]');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = `#${entry.target.id}`;
        links.forEach((link) => {
          const active = link.getAttribute('href') === id;
          link.classList.toggle('is-active', active);
          if (active) link.setAttribute('aria-current', 'location');
          else link.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });

    $$('main section[id]').forEach((section) => observer.observe(section));
  }

  /* ---------- Scroll reveal and skill meters ---------- */

  /** Fills every skill meter inside a node. */
  function animateSkills(node) {
    $$('.skill-fill', node).forEach((bar) => {
      bar.style.width = `${bar.dataset.level}%`;
    });
  }

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      animateSkills(entry.target);
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12 });

  function observeReveals(root = document) {
    $$('.reveal:not(.is-visible)', root).forEach((node) => {
      if (reduceMotion) {
        node.classList.add('is-visible');
        animateSkills(node);
      } else {
        revealObserver.observe(node);
      }
    });
  }

  /* ---------- Typing animation in the hero ---------- */

  function startTyping(words) {
    const target = $('#typed');
    if (!words.length) return;
    if (reduceMotion) {
      target.textContent = words[0];
      return;
    }

    let wordIndex = 0;
    let charIndex = 0;
    let deleting = false;

    const tick = () => {
      const word = words[wordIndex];
      charIndex += deleting ? -1 : 1;
      target.textContent = word.slice(0, charIndex);

      let delay = deleting ? 40 : 90;
      if (!deleting && charIndex === word.length) {
        deleting = true;
        delay = 1600;
      } else if (deleting && charIndex === 0) {
        deleting = false;
        wordIndex = (wordIndex + 1) % words.length;
        delay = 300;
      }
      setTimeout(tick, delay);
    };

    tick();
  }

  /* ---------- Contact form: validates, then opens the visitor's email app ---------- */

  function setupContactForm() {
    const form = $('#contact-form');
    const status = $('#form-status');

    const rules = {
      name: (v) => v.length >= 2 || 'Please enter your name.',
      email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || 'Please enter a valid email address.',
      message: (v) => v.length >= 10 || 'Please write at least 10 characters.'
    };

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      let firstInvalid = null;
      Object.entries(rules).forEach(([name, check]) => {
        const field = form.querySelector(`[name="${name}"]`);
        const result = check(field.value.trim());
        const valid = result === true;
        field.setAttribute('aria-invalid', String(!valid));
        $(`[data-error-for="${name}"]`, form).textContent = valid ? '' : result;
        if (!valid && !firstInvalid) firstInvalid = field;
      });

      if (firstInvalid) {
        status.textContent = '';
        firstInvalid.focus();
        return;
      }

      const value = (name) => form.querySelector(`[name="${name}"]`).value.trim();
      const name = value('name');
      const email = value('email');
      const subject = value('subject') || `Portfolio contact from ${name}`;
      const body = `${value('message')}\n\n— ${name} (${email})`;

      window.location.href =
        `mailto:${C.owner.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

      status.textContent =
        `Your email app should open with the message ready to send. If it does not, email me directly at ${C.owner.email}.`;
    });
  }

  /* ---------- Copy email ---------- */

  function setupCopyEmail() {
    const button = $('#copy-email');
    const original = button.textContent;

    const copyWithFallback = (text) => {
      const field = h('textarea', { readonly: true, style: 'position:fixed;opacity:0' });
      field.value = text;
      document.body.append(field);
      field.select();
      let ok = false;
      try { ok = document.execCommand('copy'); } catch { ok = false; }
      field.remove();
      return ok;
    };

    button.addEventListener('click', async () => {
      let ok = false;
      try {
        await navigator.clipboard.writeText(C.owner.email);
        ok = true;
      } catch {
        ok = copyWithFallback(C.owner.email);
      }
      button.textContent = ok ? 'Copied!' : 'Copy failed';
      setTimeout(() => { button.textContent = original; }, 1800);
    });
  }

  /* ---------- Resume: only shown when the file exists ---------- */

  async function setupResume() {
    const path = C.owner.resume;
    if (!path) return;

    try {
      const response = await fetch(path, { method: 'HEAD' });
      if (!response.ok) return;
    } catch {
      return;
    }

    const button = $('#resume-btn');
    button.href = path;
    button.classList.replace('hidden', 'inline-flex');
  }

  /* ---------- Start up ---------- */

  function init() {
    renderOwner();
    renderAbout();
    renderSkills();
    renderProjectFilters();
    renderProjects();

    startTyping(C.owner.roles);
    observeReveals();

    setupTheme();
    setupMenu();
    setupScrollEffects();
    setupActiveLinks();
    setupProjectModal();
    setupContactForm();
    setupCopyEmail();
    setupResume();

    $('#year').textContent = new Date().getFullYear();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
