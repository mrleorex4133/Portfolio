window.PORTFOLIO = {
  owner: {
    name: "Leonilo Ondangan",
    initials: "YN",                         // shown if the photo is missing
    roles: [                                // typed out in the hero section
      "Web developer in training",
      "Front-end enthusiast",
      "Lifelong learner"
    ],
    intro:
      "I am a student learning to build clean, accessible websites. I enjoy turning an idea into a layout people can use easily, and I am working to strengthen my skills through class projects and regular practice.",
    photo: "images/Leonilo.png",            // "" to use initials instead
    email: "ondanganleonilo61@gmail.com",
    resume: "assets/Leonilo.pdf",            // "" hides the resume button
    links: [
      { label: "GitHub", url: "https://github.com/mrleorex4133" },         // e.g. "https://github.com/your-username"
      { label: "TikTok", url: "" }        // e.g. "https://www.TikTok.com/in/your-name"
    ]
  },

  about: {
    paragraphs: [
      "I am currently studying web development and building small projects to practise what I learn in class. Most of my work so far focuses on HTML structure, responsive CSS, and simple JavaScript interactions.",
      "I learn best by building something real, then reading the errors, fixing them, and explaining what changed. I use AI tools to get unstuck, but I check every suggestion and make sure I understand the code before I keep it.",
      "My goal is to become a front-end developer who can take a design from a sketch to a working, accessible page."
    ],
    facts: [
      { label: "Studying", value: "Bachelor of Science In Information Technology" },
      { label: "Focus", value: "Front-end web development" },
      { label: "Currently", value: "Building class projects and practice sites" }
    ],
    interests: ["Web design", "Accessibility", "Problem solving", "Clean layouts"]
  },

  // Levels: 0–29 Learning · 30–59 Practising · 60–84 Comfortable · 85+ Strong
  skills: [
    {
      category: "Front-end",
      items: [
        { name: "HTML", level: 80 },
        { name: "CSS and Tailwind", level: 65 },
        { name: "JavaScript", level: 55 }
      ]
    },
    {
      category: "Design",
      items: [
        { name: "Responsive layouts", level: 60 },
        { name: "Colour and typography", level: 45 }
      ]
    },
    {
      category: "Workflow",
      items: [
        { name: "Git and GitHub", level: 50 },
        { name: "Publishing a website", level: 40 }
      ]
    }
  ],

  tools: ["VS Code", "Git and GitHub", "Browser developer tools", "Tailwind CSS"],

  /* Projects — each one shows a card, and a details dialog when opened.
     - image: a screenshot path such as "images/project-1.png" (optional)
     - gradient: colour used behind the card when no screenshot loads
     - link: the live website (optional), repo: the source code (optional)
     The entries below are examples. Replace them with your own work. */
  projects: [
    {
      id: "budget-tracker",
      title: "IT Research Repository",
      category: "Web",
      status: "Class project",
      summary: "A comprehensive web-based repository designed to address research data disorganization through centralized thesis and capstone management for the IT Department.",
      description: [
        "This project lets a user repository research for IT students.",
        "The layout was built in web first, and the data is kept in the browser while the page is open."
      ],
      contribution: "Built the layout, the entry form, and the JavaScript that calculates totals and category summaries.",
      tags: ["HTML", "CSS", "JavaScript"],
      image: "images/Repository.png",
      gradient: "from-indigo-500 to-sky-500",
      link: "",
      repo: ""
    },
    {
      id: "recipe-finder",
      title: "Dash",
      category: "Web",
      status: "Practice project",
      summary: "A indie racing game built on HTML, CSS and Javascript.",
      description: [
        "User type racing game for website only",
        "The project was a practice project for Game development."
      ],
      contribution: "Designed the search interface and wrote the filtering logic.",
      tags: ["HTML", "JavaScript", "CSS"],
      image: "images/Dash.png",
      gradient: "from-rose-500 to-amber-500",
      link: "",
      repo: ""
    },
    {
      id: "brand-kit",
      title: "Toothsaver",
      category: "Design",
      status: "Group project",
      summary: "A simple dental clinic website for any barangay place.",
      description: [
        "Accept an appointment from barangay residents for a dental clinic or check up."
      ],
      contribution: "Created the colour palette and typography guide, and worked with the team on the logo concepts.",
      tags: ["CSS", "Javascript", "HTML"],
      image: "images/Toothsaver.jpg",
      gradient: "from-emerald-500 to-teal-500",
      link: "",
      repo: ""
    }
  ]
};
