import React, { useEffect, useState } from 'react';
import { useResume } from '@/context/ResumeContext';

interface ScrollSpyProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
  sectionRefs: React.RefObject<{ [key: string]: HTMLDivElement | null }>;
}

const ScrollSpy = ({ 
  containerRef, 
  sectionRefs 
}: ScrollSpyProps) => {
  const { sections } = useResume();
  const [activeSection, setActiveSection] = useState<string>('');

  const sectionTitles = sections.reduce((acc, section) => {
    acc[section.id] = section.displayName;
    return acc;
  }, {} as Record<string, string>);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      
      const { scrollTop } = containerRef.current;
      const scrollPosition = scrollTop + 155; // Adding offset to improve detection

      // Find the section that is currently in view
      const activeSectionId = sections
        .filter(section => section.selected)
        .find(section => {
          const ref = sectionRefs.current[section.id];
          if (!ref) return false;
          
          const offsetTop = ref.offsetTop;
          const offsetHeight = ref.offsetHeight;
          
          return scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight;
        })?.id || '';
      
      if (activeSectionId !== activeSection) {
        setActiveSection(activeSectionId);
      }
    };

    const formContainer = containerRef.current;
    if (formContainer) {
      formContainer.addEventListener('scroll', handleScroll);
      // Initialize active section on mount
      handleScroll();
    }

    return () => {
      if (formContainer) {
        formContainer.removeEventListener('scroll', handleScroll);
      }
    };
  }, [sections, activeSection, containerRef, sectionRefs]);

  const scrollToSection = (e: React.UIEvent<HTMLElement>, sectionId: string) => {
    e.preventDefault();

    const ref = sectionRefs.current[sectionId];
    if (ref && containerRef.current) {
      containerRef.current.scrollTo({
        top: ref.offsetTop - 133, // Offset by navbar, scrollspy nav, and padding height for better visual appearance
        behavior: 'instant'
      });
    }
  };

  const sortedSections = [...sections].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className="
      sticky top-0 z-10 
      bg-white dark:bg-zinc-900 border-b border-gray-300 dark:border-zinc-800
      flex overflow-x-auto justify-center
      px-4 w-full
      [&::-webkit-scrollbar]:h-1.5
      [&::-webkit-scrollbar-track]:bg-zinc-300
      [&::-webkit-scrollbar-thumb]:bg-zinc-400
      dark:[&::-webkit-scrollbar-track]:bg-zinc-800
      dark:[&::-webkit-scrollbar-thumb]:bg-zinc-600">
      <ul className="flex flex-nowrap min-w-max lg:min-w-0 lg:w-full text-sm text-center font-semibold">
        {sortedSections
          .filter(section => section.selected)
          .map(section => (
            <li className="whitespace-nowrap" key={section.id}>
                <a href={section.href}
                   onClick={e => scrollToSection(e, section.id)}
                   className={`
                    lg:w-full
                    inline-block px-3 pt-3 pb-2.5
                    text-gray-900 dark:text-gray-100
                    border-b-4 border-transparent
                    ${ activeSection === section.id
                      ? "active text-purple-800 dark:text-purple-400 border-purple-700! bg-purple-800/0 dark:bg-purple-800/0"
                      : "hover:bg-gray-100 dark:hover:bg-zinc-800 dark:hover:text-gray-200"}`}
                  >{sectionTitles[section.id] || "Section Title"}</a>
            </li>
          ))}
    </ul>
    </div>
  );
};

export default ScrollSpy;