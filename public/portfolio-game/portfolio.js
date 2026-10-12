export const PORTFOLIO={
  about:{eyebrow:'03 / WHO IS RABIN?',title:'Rabin Adhikari',body:`<p>I’m a software engineer and project lead based in Tokyo, originally from Nepal. I have approximately six to seven years of software engineering experience, across backend development, frontend applications, cloud systems, and AI integration.</p><div class="content-grid"><div class="content-block"><h3>People & products</h3><p>I work with customers and engineers to understand a problem, choose an approach, and carry it through implementation, review, and testing.</p></div><div class="content-block"><h3>Japan & Nepal</h3><p>I’ve lived in Japan for around ten years and use Japanese in everyday work. My long-term goal is to build connections between teams in Japan and Nepal.</p></div></div><div class="tags"><span class="tag">Tokyo, Japan</span><span class="tag">Full-stack development</span><span class="tag">Project leadership</span><span class="tag">Healthcare technology</span></div>`},
  experience:{eyebrow:'04 / THE JOURNEY',title:'Building. Delivering. Leading.',body:`<div class="project-entry"><h3>HOGY Medical · Product development</h3><p>Project leadership and implementation, with work involving OPERA-Note Connect, a cloud service for sharing operating-room nursing knowledge. Working alongside external development teams and supporting knowledge transfer.</p></div><div class="project-entry"><h3>PERSOL Cross Technology · Software engineering</h3><p>Backend, frontend, and DevOps responsibilities. Work spanning requirements, implementation, testing, customer communication, code reviews, and support for other engineers.</p></div><div class="project-entry"><h3>Healthcare research data management</h3><p>Around three years on a medical research data-management project, taking a substantial role in both implementation and coordinating delivery.</p></div><div class="project-entry"><h3>A broader engineering background</h3><p>Projects involving care-facility analytics, shift management, manufacturing task management, web crawling, and AI scoring.</p></div>`},
  softlearn:{eyebrow:'05 / WHAT I BUILD · PERSONAL PRODUCT',title:'SoftLearn',body:`<p>A learning platform I’ve been building with experiences for students, teachers, and companies.</p><div class="content-grid"><div class="content-block"><h3>The problem</h3><p>Give learners a structured way to follow courses, work through lessons, and understand their progress.</p></div><div class="content-block"><h3>My contribution</h3><p>Product planning, backend and frontend development, role-based experiences, and deployment work.</p></div></div><h3>Engineering approach</h3><p>Django and PostgreSQL for the application backend, with React and Vite for the interface. The course experience includes assessments and progression through lessons.</p><div class="tags"><span class="tag">Django</span><span class="tag">React</span><span class="tag">Vite</span><span class="tag">PostgreSQL</span><span class="tag">Product ownership</span></div>`},
  healthcare:{eyebrow:'05 / WHAT I BUILD · HEALTHCARE',title:'Medical research data management',body:`<p>A healthcare data-management project that formed a significant part of my engineering and delivery experience.</p><div class="content-grid"><div class="content-block"><h3>The problem</h3><p>Support the handling and management of medical research data in an application used by people working in healthcare.</p></div><div class="content-block"><h3>My contribution</h3><p>Application development, customer communication, reviews, coordination, and helping the team carry work from requirements through testing.</p></div></div><h3>What it taught me</h3><p>Clear communication matters as much as implementation. I learned to connect technical decisions with how people actually use a product.</p><div class="tags"><span class="tag">Healthcare</span><span class="tag">Application development</span><span class="tag">Delivery coordination</span><span class="tag">Reviews</span></div>`},
  ai:{eyebrow:'05 / WHAT I BUILD · AI INTEGRATION',title:'Web crawling & AI scoring',body:`<p>A project combining web-data collection with AI-assisted scoring.</p><div class="content-grid"><div class="content-block"><h3>The workflow</h3><p>Collect web content, process it into usable data, and integrate AI into the scoring workflow.</p></div><div class="content-block"><h3>My focus</h3><p>Backend development, data processing, and connecting AI services to application behavior.</p></div></div><h3>Applied AI</h3><p>My AI experience centers on integrating AI into useful applications and workflows.</p><div class="tags"><span class="tag">Python</span><span class="tag">Data processing</span><span class="tag">Web crawling</span><span class="tag">AI integration</span></div>`},
  skills:{eyebrow:'06 / HOW I BUILD',title:'Across the stack',body:`<div class="content-grid"><div class="content-block"><h3>Application development</h3><p>Python, PHP, JavaScript, TypeScript, React, Next.js, Django, and NestJS.</p></div><div class="content-block"><h3>Cloud & delivery</h3><p>AWS, GCP, Docker, GitHub Actions, deployment, and operational support.</p></div><div class="content-block"><h3>Data</h3><p>PostgreSQL, MySQL, BigQuery, Looker Studio, and data-processing workflows.</p></div><div class="content-block"><h3>Team delivery</h3><p>Requirements, customer communication, reviews, scheduling, and supporting engineers.</p></div></div><h3>How I like to work</h3><p>Use established libraries where they fit. Follow the project’s patterns, keep code readable, and make decisions that the next engineer can understand.</p>`},
  future:{eyebrow:'08 / BEYOND THE CODE',title:'Looking ahead',body:`<p>I want to keep growing as a project lead and engineer while building products with a clear purpose.</p><p>Over time, I’d like to work globally, return to Nepal, and create a company that collaborates with teams in Japan.</p><p>Healthcare technology, practical AI applications, and learning products are areas I’m particularly interested in.</p>`},
  contact:{eyebrow:'09 / LET’S CONNECT',title:'Let’s stay connected.',body:`<p>You’ve seen a little of my world. If you’d like to learn more about my background or discuss working together, visit my LinkedIn profile.</p><div class="modal-links"><a href="https://www.linkedin.com/in/rabin-adhikari-52573320b/" target="_blank" rel="noopener noreferrer">LinkedIn ↗</a></div><p class="small-note">Rabin Adhikari · Tokyo, Japan</p>`}
};

PORTFOLIO.fun={eyebrow:'07 / A LITTLE FUN',title:'Take a garden break.',body:'<p>Try basketball on the west court, football in the garden, or bowling and the suspended training bag to the east. These activities are optional. You can continue the story whenever you like.</p><p>Pick up a ball with E. Hold ACT or J to charge a throw, then release. Q puts an object down. Repair & reset in settings restores the games and damaged objects.</p>'};

export const CHAPTERS=[
  {id:'about',step:'03 / WHO IS RABIN?',room:'The living room',title:'A little about me',point:[-4,4],route:[[0,4],[-4,4]],text:'I’m Rabin Adhikari, a software engineer and project lead based in Tokyo. I came to Japan from Nepal and have spent around ten years building my life here. I like turning complicated problems into products that people can actually use.'},
  {id:'experience',step:'04 / THE JOURNEY',room:'The study',title:'From building to leading',point:[-6.8,-4.5],route:[[0,4],[0,-4.5],[-6.8,-4.5]],text:'My experience spans backend, frontend, and DevOps work. At PERSOL Cross Technology, I worked on delivery, reviews, customer communication, and supporting other engineers. My healthcare work includes a medical research data-management project. I now bring that experience to product development at HOGY Medical.'},
  {id:'projects',step:'05 / WHAT I BUILD',room:'The project studio',title:'Work with a purpose',point:[6.2,-4.5],route:[[0,-4.5],[6.2,-4.5]],text:'Here are some of the projects I’ve worked on: healthcare data management, web crawling with AI scoring, and SoftLearn, my own learning platform. Walk up to the screens to read about the problem, my contribution, and the technology behind each one.'},
  {id:'skills',step:'06 / HOW I BUILD',room:'The technology room',title:'How I build',point:[6.2,4],route:[[0,-4.5],[0,4],[6.2,4]],text:'I work across Python, PHP, JavaScript and TypeScript, React, Django, cloud infrastructure, and databases. AWS is a particular strength, and I also work with GCP. I value clear architecture, useful libraries, and readable code that a team can maintain.'},
  {id:'fun',step:'07 / A LITTLE FUN · OPTIONAL',room:'The garden',title:'A little fun',point:[-3.5,-13],route:[[0,4],[0,-4.5],[0,-12],[-3.5,-13]],text:'We’ve talked a lot about work. Want to try something fun? Basketball is on the west court; football, bowling, and the training bag are in the garden. Play for a while, or come with me upstairs. You don’t have to complete a game to continue.'},
  {id:'future',step:'08 / BEYOND THE CODE',room:'The upstairs retreat',title:'Beyond the code',point:[6.7,-3.6],route:[[0,4],[8.6,4],[8.6,8.35],[10.15,8.35],[10.15,1.55],[10.15,-3.6],[6.7,-3.6]],text:'I want to keep growing as a project lead and engineer while building products with a clear purpose. Over time, I’d like to work globally, return to Nepal, and create a company that collaborates with teams in Japan. Healthcare technology, practical AI applications, and learning products are areas I’m particularly interested in.'},
  {id:'contact',step:'09 / LET’S CONNECT',room:'The rear terrace',title:'Let’s connect',point:[0,-15],route:[[0,4],[0,-4.5],[0,-12],[0,-15]],text:'Thanks for visiting. If you have an interesting idea or project, I’d be happy to connect. My LinkedIn profile is on the terrace desk. You can finish your visit here, replay the invitation, or stay and explore.'}
];

export const STORY_PREVIEWS={
  ...Object.fromEntries(CHAPTERS.map(c=>[c.id,c.text])),
  softlearn:'SoftLearn is my personal learning platform. I’m building the student, teacher, and company experiences with Django, React, Vite, and PostgreSQL.',
  healthcare:'I worked on medical research data management for around three years, contributing to implementation, customer communication, reviews, and coordinating delivery.',
  ai:'This project brought together web crawling, data processing, and AI-assisted scoring. My focus was the backend and integrating AI into the application workflow.'
};

PORTFOLIO.projects={eyebrow:'05 / WHAT I BUILD',title:'Work with a purpose.',body:`<p>${STORY_PREVIEWS.projects}</p>${['softlearn','healthcare','ai'].map(id=>`<div class="project-entry"><h3>${PORTFOLIO[id].title}</h3><p>${STORY_PREVIEWS[id]}</p><button class="gold-button project-read" data-id="${id}">Read the project →</button></div>`).join('')}`};

export const TECH_TOPICS={
  api:{title:'API & application services',text:'My backend work includes Python, Django, PHP, and NestJS. I connect application services with the interfaces people use, and carry work through requirements, implementation, reviews, and testing.'},
  cloud:{title:'Cloud & delivery',text:'I work with AWS and GCP, alongside Docker and GitHub Actions. My experience includes deployment and operational support, as well as communicating with the engineers responsible for delivery.'},
  data:{title:'Data & reporting',text:'My data work includes PostgreSQL, MySQL, BigQuery, Looker Studio, and data-processing workflows. Healthcare data management and web-data collection are two examples you can explore in the project studio.'},
  ai:{title:'Applied AI',text:STORY_PREVIEWS.ai}
};

// Scripted answers use the supplied portfolio content. No external model is needed.
export const CONVERSATIONS={
  about:[
    {question:'What motivates you?',answer:'I like turning complicated problems into products that people can actually use. Healthcare technology, practical AI applications, and learning products are areas I’m particularly interested in.'},
    {question:'How has your work grown?',answer:STORY_PREVIEWS.experience},
    {question:'What do you enjoy building?',answer:STORY_PREVIEWS.projects}
  ],
  experience:[
    {question:'What did you do at PERSOL?',answer:'I worked across backend, frontend, and DevOps, including requirements, implementation, testing, customer communication, reviews, and supporting other engineers.'},
    {question:'What is your healthcare experience?',answer:STORY_PREVIEWS.healthcare}
  ],
  projects:[
    {question:'Tell me about SoftLearn.',answer:STORY_PREVIEWS.softlearn,content:'softlearn'},
    {question:'What was your healthcare role?',answer:STORY_PREVIEWS.healthcare,content:'healthcare'},
    {question:'How did you use AI?',answer:STORY_PREVIEWS.ai,content:'ai'}
  ],
  softlearn:[
    {question:'Who is it for?',answer:'SoftLearn has experiences for students, teachers, and companies. Learners follow courses, work through lessons, and understand their progress.'},
    {question:'What did you build?',answer:'My contribution includes product planning, backend and frontend development, role-based experiences, and deployment work.'},
    {question:'What powers it?',answer:'Django and PostgreSQL support the backend, with React and Vite for the interface. The course experience includes assessments and progression through lessons.'}
  ],
  healthcare:[
    {question:'What problem did it address?',answer:'The application supports the handling and management of medical research data for people working in healthcare.'},
    {question:'What was your contribution?',answer:STORY_PREVIEWS.healthcare},
    {question:'What did you learn?',answer:'Clear communication matters as much as implementation. I learned to connect technical decisions with how people actually use a product.'}
  ],
  ai:[
    {question:'How did the workflow work?',answer:'Collect web content, process it into usable data, and integrate AI into the scoring workflow.'},
    {question:'What was your focus?',answer:'Backend development, data processing, and connecting AI services to application behavior.'}
  ],
  skills:Object.entries(TECH_TOPICS).map(([id,c])=>({question:`Explain ${id.toUpperCase()}.`,answer:c.text})),
  future:[{question:'What would you like to do next?',answer:STORY_PREVIEWS.future}],
  fun:[{question:'How do the garden games work?',answer:'Pick up a ball with E, aim, and hold ACT or J to charge a throw. Football can be kicked with ACT. Bowling uses the blue ball and six pins. Repair & reset restores the scene whenever you need it.'}],
  contact:[{question:'How can we connect?',answer:'You can visit my supplied LinkedIn profile from the contact desk. Feel free to keep exploring after the tour.'}]
};

export const INVITATION={
  ringing:{title:'An invitation',text:'Your phone is ringing. You’re parked at the start of a quiet neighbourhood road.',action:'Answer the phone →'},
  call:{title:'Someone you should meet',text:'Caller: “I’ve found someone you should meet.”\nVisitor: “Who?”\nCaller: “Rabin Adhikari. A developer who turns ideas into working products.”',action:'Set the destination →'},
  destination:{title:'Destination · Rabin’s house',text:'Take the winding road to Rabin’s home. Follow your map, park in the driveway, then walk to the glass entrance and ring the bell.',action:'Start the drive →'},
  driving:{title:'Drive to Rabin’s house',text:'Follow the road and your map. W/S accelerate or reverse, A/D steer, and Space brakes.',action:'Continue driving →'},
  parked:{title:'You’ve arrived',text:'Stop in the driveway. Press E to step out, then walk to the glass entrance and ring the bell.',action:'Exit the SUV →'}
};

export function portfolioSummary(){
  return `<p>Full-stack engineer and project lead based in Tokyo. Approximately six to seven years of engineering experience, with work across healthcare, cloud, and AI integration.</p><div class="tags"><span class="tag">Python</span><span class="tag">TypeScript</span><span class="tag">React</span><span class="tag">Django</span><span class="tag">AWS</span></div><h3>Experience</h3><p>Product development at HOGY Medical. Previously, engineering work at PERSOL Cross Technology across backend, frontend, DevOps, and delivery.</p><h3>Selected work</h3>${['softlearn','healthcare','ai'].map(id=>`<div class="project-entry"><h3>${PORTFOLIO[id].title}</h3><p>${STORY_PREVIEWS[id]}</p><button class="gold-button project-read" data-id="${id}">Read the project →</button></div>`).join('')}<div class="modal-links"><button class="project-read" data-id="about">About</button><button class="project-read" data-id="experience">Experience</button><button class="project-read" data-id="skills">Skills</button><button class="project-read" data-id="future">Future plans</button><a href="https://www.linkedin.com/in/rabin-adhikari-52573320b/" target="_blank" rel="noopener noreferrer">LinkedIn ↗</a><button id="quick-enter">Explore the house →</button></div>`;
}
