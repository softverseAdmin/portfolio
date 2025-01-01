"use client"

import React, { useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, Play, Plus, Share2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import project1 from '../assets/project1.png'
import project2 from '../assets/project2.png'
import project4 from '../assets/project4.png'
import project0 from '../assets/project0.png'
const projects = [
  {
    id: 1,
    title: "Healthcare Data Analytics Platform",
    description: "Led development of a comprehensive medical data management system in a 10-person team. Implemented data aggregation and analytics using AWS services, Tableau, and RStudio. Handled full development lifecycle from requirements gathering to integration testing. Resolved complex technical issues through international support channels.",
    duration: "Jul 2020 - Dec 2022",
    tech: "AWS (Lambda, EC2, S3, DynamoDB, CloudWatch), Python, JavaScript, XSL, Tableau, RStudio, Windows Server, Amazon Linux",
    imageUrl: project1
  },
  {
    id: 2,
    title: "Electronic Medical Records System",
    description: "Led development of an electronic medical records system in a 7-person team. Conducted detailed user requirement gathering and implemented optimal solutions based on user feedback. Performed system investigation, coding, and unit testing to ensure reliability and performance improvements. Achieved high user satisfaction through careful attention to requirements.",
    duration: "Mar 2023 - Jun 2024",
    tech: "PHP, AWS, Windows, VS Code",
    imageUrl: project2
  },
  {
    id: 3,
    title: "Healthcare Staff Shift Management System",
    description: "Designed architecture and technical specifications for a healthcare facility staff scheduling system. Created comprehensive system design documents utilizing GCP services including Cloud Storage, Dataflow, and BigQuery for data processing and analytics. Implemented facility-specific shift creation workflows and scheduling optimization.",
    duration: "Jul 2024 - Present", 
    tech: "Google Cloud Platform (Cloud Storage, Dataflow, BigQuery), Python, Windows",
    imageUrl: project4
  },
  {
    id: 4,
    title: "Nepal Travel Blog",
    description: "Custom WordPress theme development for a travel blog focused on Nepal's culture, destinations and experiences. Implemented responsive design, custom post types for travel guides, photo galleries and interactive maps. Created engaging user experience with jQuery animations and custom widgets.",
    duration: "Jan 2023 - Mar 2023",
    tech: "WordPress, PHP, jQuery, Custom Theme Development, Adobe XD, CSS3, MySQL",
    imageUrl: project0
  }
]

export default function ProjectSection() {
  const [currentIndex, setCurrentIndex] = useState(0)

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % projects.length)
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + projects.length) % projects.length)
  }

  const handleScrollToSkills = () => {
    const skillsSection = document.getElementById('skills-section');
    if (skillsSection) {
      skillsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleScrollToContact = () => {
    const contactSection = document.getElementById('contact-section');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleScroll = (e) => {
    if (e.deltaY < 0) {
      // Scrolling up
      handleScrollToSkills();
    } else if (e.deltaY > 0) {
      // Scrolling down
      handleScrollToContact();
    }
  };

  return (
    <section 
      className="relative min-h-screen align-middle" 
      id="projects-section"
      onWheel={handleScroll}
    >
      <div className="p-10 flex items-center">
          <span className="w-full border-t border-solid border-white"></span>
          <h2 className="text-4xl font-bold text-center mx-4">Projects</h2>
          <span className="w-full border-t border-solid border-white"></span>
      </div>
      <div className="relative w-full h-[calc(100vh-6rem)]">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0"
          >
            <div 
              className="w-full h-full bg-no-repeat bg-cover bg-center"
              style={{backgroundImage: `url(${projects[currentIndex].imageUrl})`}}
            >
              <div className="absolute inset-0 bg-black bg-opacity-50 grid grid-cols-1 lg:grid-cols-2 py-20 md:py-28 lg:py-32 xl:py-56 px-3 md:px-4 lg:px-8">
                <div className="flex flex-col gap-5 md:gap-8">
                  <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="flex flex-col gap-4"
                  >
                    <h2 className="text-xl md:text-3xl lg:text-4xl font-semibold">{projects[currentIndex].title}</h2>
                    <p>{projects[currentIndex].description}</p>
                    <div className="flex gap-3">
                      <p>{projects[currentIndex].duration}</p>
                      <p><strong className="font-bold">Tech Stack:</strong> <span>{projects[currentIndex].tech}</span></p>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="hidden lg:block absolute top-1/4 -right-8 bg-slate-700 py-5 pl-5 rounded-xl z-[1] w-[450px]">
        <div className="grid grid-cols-2 gap-3">
          {projects.map((project, index) => (
            <motion.div
              key={project.id}
              whileHover={{ scale: 1.05 }}
              className={`cursor-pointer ${index === currentIndex ? 'ring-2 ring-blue-500' : ''}`}
              onClick={() => setCurrentIndex(index)}
            >
              <Image 
                src={project.imageUrl} 
                alt={project.title} 
                width={256} 
                height={288} 
                className="object-cover rounded-xl"
              />
            </motion.div>
          ))}
        </div>
        <div className="flex flex-row gap-3 pt-4">
          <button 
            className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            onClick={prevSlide}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button 
            className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            onClick={nextSlide}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="hidden lg:block absolute top-1/4 -right-8 bg-slate-700 py-5 pl-5 rounded-xl z-[1] w-[450px]">
        <div className="grid grid-cols-2 gap-3">
          {projects.map((project, index) => (
            <motion.div
              key={project.id}
              whileHover={{ scale: 1.05 }}
              className={`cursor-pointer ${index === currentIndex ? 'ring-2 ring-blue-500' : ''}`}
              onClick={() => setCurrentIndex(index)}
            >
              <Image 
                src={project.imageUrl} 
                alt={project.title} 
                width={256} 
                height={288} 
                className="object-cover rounded-xl"
              />
            </motion.div>
          ))}
        </div>
        <div className="flex flex-row gap-3 pt-4">
          <button 
            className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            onClick={prevSlide}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button 
            className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            onClick={nextSlide}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
      <button 
        onClick={handleScrollToContact}
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
    </section>
  )
}
