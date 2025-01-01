"use client"
import { useEffect, useState } from "react";
import HeroSection from "@/components/HeroSection";
import LazyLoad from "@/components/lazyLoad";
import SkillSection from "@/components/SkillSection";
import ProjectSection from "@/components/ProjectSection";
import ContactForm from "@/components/contactForm";
import Footer from "@/components/FooterSection";
export default function Home() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {isLoading ? (
        <LazyLoad />
      ) : (
        <div className="flex min-h-screen w-full bg-black">
          <div className="text-white">
            <HeroSection />
            <SkillSection />
            <ProjectSection />
            {/* <BackgroundAnimation /> */}
            <ContactForm />
            <Footer />
          </div>
          
        </div>
      )}
    </>
  );
}
