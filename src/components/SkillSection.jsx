"use client"
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import ProgrammingLang from "./svgSkillContent/programmingLang";
import Frameworks from "./svgSkillContent/frameworks";
import Servers from "./svgSkillContent/servers";
import Databases from "./svgSkillContent/databases";
import CmsSvg from "./svgSkillContent/cms";
const SkillSection = () => {
  const tabs = [
    { icon: "💻", label: "LANGUAGES", content: <ProgrammingLang /> },
    { icon: "🛠", label: "FRAMEWORKS", content: <Frameworks /> },
    { icon: "☁️", label: "CLOUD/INFRASTRUCTURE", content: <Servers /> },
    { icon: "🗄️", label: "DATABASES", content: <Databases /> },
    { icon: "📝", label: "CMS", content: <CmsSvg /> }  
  ];

  const [selectedTab, setSelectedTab] = useState(tabs[0]);

  const handleScrollToProjects = () => {
    const projectsSection = document.getElementById('projects-section');
    if (projectsSection) {
      projectsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleScrollToHero = () => {
    const heroSection = document.getElementById('hero-section');
    if (heroSection) {
      heroSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleScroll = (e) => {
    if (e.deltaY < 0) {
      // Scrolling up
      handleScrollToHero();
    } else if (e.deltaY > 0) {
      // Scrolling down
      handleScrollToProjects();
    }
  };

  return (
    <div 
      className="min-h-screen flex items-start justify-center p-4 md:p-8 relative" 
      id="skills-section"
      onWheel={handleScroll}
    >
      <div className="w-full max-w-7xl bg-white/5 backdrop-blur-sm rounded-lg overflow-hidden">
        <nav className="bg-white/10 p-2">
          <ul className="flex flex-wrap md:flex-nowrap gap-2">
            {tabs.map((item) => (
              <motion.li
                key={item.label}
                className={`flex-1 min-w-[150px] relative px-2 md:px-4 py-2 rounded-t-lg cursor-pointer text-sm md:text-base ${
                  item === selectedTab ? 'bg-white/20' : 'hover:bg-white/10'
                }`}
                onClick={() => setSelectedTab(item)}
              >
                <span className="flex items-center justify-center gap-1 md:gap-2">
                  {item.icon} <span className="hidden sm:inline">{item.label}</span>
                </span>
                {item === selectedTab && (
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-white"
                    layoutId="underline"
                  />
                )}
              </motion.li>
            ))}
          </ul>
        </nav>
        <main className=" overflow-x-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedTab.label}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -10, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="text-center text-sm md:text-lg"
            >
              {selectedTab.content}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      <button 
        onClick={handleScrollToProjects}
        className="scroll-me animate-pulse absolute left-1/2 bottom-8 transform -translate-x-1/2 text-center align-middle"
        title="Scroll to Projects Section"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="24" 
          height="24" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          className="animate-bounce"
        >
          <path d="M7 13l5 5 5-5"/>
          <path d="M7 6l5 5 5-5"/>
        </svg>
      </button>
    </div>
  );
};

export default SkillSection;
