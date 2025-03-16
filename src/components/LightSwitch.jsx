import React, { useState, useEffect } from 'react';

function LightSwitch() {
  const themes = ['system', 'light', 'dark'];
  const [currentTheme, setCurrentTheme] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved && themes.includes(saved) ? saved : 'system'; // Default to system
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', '');
    
    if (currentTheme === 'system') {
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.setAttribute('data-theme', systemPrefersDark ? 'dark' : 'light');
    } else {
      document.documentElement.setAttribute('data-theme', currentTheme);
    }
    
    localStorage.setItem('theme', currentTheme);
  }, [currentTheme]);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme && themes.includes(savedTheme)) {
      setCurrentTheme(savedTheme);
    }
  }, []);

  const handleThemeChange = (theme) => {
    setCurrentTheme(theme);
  };

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      if (currentTheme === 'system') {
        document.documentElement.setAttribute('data-theme', '');
        document.documentElement.setAttribute('data-theme', mediaQuery.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [currentTheme]);

  return (
    <div className="relative z-0 inline-grid grid-cols-3 gap-0.5 rounded-full bg-gray-950/5 text-gray-950 dark:bg-white/10 dark:text-white border-1 border-gray-700 dark:border-zinc-600" role="radiogroup">
      <span
        className={`rounded-full p-0.5 size-6.5 cursor-pointer ${
          currentTheme === 'system' 
            ? "bg-white ring inset-ring ring-gray-950/10 inset-ring-white/10 dark:bg-zinc-700 dark:text-white dark:ring-transparent" 
            : ""
        }`}
        aria-label="System theme"
        role="radio"
        aria-checked={currentTheme === 'system'}
        tabIndex={currentTheme === 'system' ? 0 : -1}
        data-checked={currentTheme === 'system' ? "" : undefined}
        onClick={() => handleThemeChange('system')}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleThemeChange('system');
          }
        }}
      >
        <svg viewBox="0 0 28 28" fill="none">
          <path d="M7.5 8.5C7.5 7.94772 7.94772 7.5 8.5 7.5H19.5C20.0523 7.5 20.5 7.94772 20.5 8.5V16.5C20.5 17.0523 20.0523 17.5 19.5 17.5H8.5C7.94772 17.5 7.5 17.0523 7.5 16.5V8.5Z" stroke="currentColor"></path>
          <path d="M7.5 8.5C7.5 7.94772 7.94772 7.5 8.5 7.5H19.5C20.0523 7.5 20.5 7.94772 20.5 8.5V14.5C20.5 15.0523 20.0523 15.5 19.5 15.5H8.5C7.94772 15.5 7.5 15.0523 7.5 14.5V8.5Z" stroke="currentColor"></path>
          <path d="M16.5 20.5V17.5H11.5V20.5M16.5 20.5H11.5M16.5 20.5H17.5M11.5 20.5H10.5" stroke="currentColor" strokeLinecap="round"></path>
        </svg>
      </span>
      <span
        className={`rounded-full p-0.5 size-6.5 cursor-pointer ${
          currentTheme === 'light' 
            ? "bg-white ring inset-ring ring-gray-950/10 inset-ring-white/10 dark:bg-zinc-700 dark:text-black dark:ring-transparent" 
            : ""
        }`}
        aria-label="Light theme"
        role="radio"
        aria-checked={currentTheme === 'light'}
        tabIndex={currentTheme === 'light' ? 0 : -1}
        data-checked={currentTheme === 'light' ? "" : undefined}
        onClick={() => handleThemeChange('light')}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleThemeChange('light');
          }
        }}
      >
        <svg viewBox="0 0 28 28" fill="none">
          <circle cx="14" cy="14" r="3.5" stroke="currentColor"></circle>
          <path d="M14 8.5V6.5" stroke="currentColor" strokeLinecap="round"></path>
          <path d="M17.889 10.1115L19.3032 8.69727" stroke="currentColor" strokeLinecap="round"></path>
          <path d="M19.5 14L21.5 14" stroke="currentColor" strokeLinecap="round"></path>
          <path d="M17.889 17.8885L19.3032 19.3027" stroke="currentColor" strokeLinecap="round"></path>
          <path d="M14 21.5V19.5" stroke="currentColor" strokeLinecap="round"></path>
          <path d="M8.69663 19.3029L10.1108 17.8887" stroke="currentColor" strokeLinecap="round"></path>
          <path d="M6.5 14L8.5 14" stroke="currentColor" strokeLinecap="round"></path>
          <path d="M8.69663 8.69711L10.1108 10.1113" stroke="currentColor" strokeLinecap="round"></path>
        </svg>
      </span>
      <span
        className={`rounded-full p-0.5 size-6.5 cursor-pointer ${
          currentTheme === 'dark' 
            ? "bg-white ring inset-ring ring-gray-950/10 inset-ring-white/10 dark:bg-zinc-700 dark:text-white dark:ring-transparent" 
            : ""
        }`}
        aria-label="Dark theme"
        role="radio"
        aria-checked={currentTheme === 'dark'}
        tabIndex={currentTheme === 'dark' ? 0 : -1}
        data-checked={currentTheme === 'dark' ? "" : undefined}
        onClick={() => handleThemeChange('dark')}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleThemeChange('dark');
          }
        }}
      >
        <svg viewBox="0 0 28 28" fill="none">
          <path
            d="M10.5 9.99914C10.5 14.1413 13.8579 17.4991 18 17.4991C19.0332 17.4991 20.0176 17.2902 20.9132 16.9123C19.7761 19.6075 17.109 21.4991 14 21.4991C9.85786 21.4991 6.5 18.1413 6.5 13.9991C6.5 10.8902 8.39167 8.22304 11.0868 7.08594C10.7089 7.98159 10.5 8.96597 10.5 9.99914Z"
            stroke="currentColor"
            strokeLinejoin="round"
          ></path>
          <path
            d="M16.3561 6.50754L16.5 5.5L16.6439 6.50754C16.7068 6.94752 17.0525 7.29321 17.4925 7.35607L18.5 7.5L17.4925 7.64393C17.0525 7.70679 16.7068 8.05248 16.6439 8.49246L16.5 9.5L16.3561 8.49246C16.2932 8.05248 15.9475 7.70679 15.5075 7.64393L14.5 7.5L15.5075 7.35607C15.9475 7.29321 16.2932 6.94752 16.3561 6.50754Z"
            fill="currentColor"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
          ></path>
          <path
            d="M20.3561 11.5075L20.5 10.5L20.6439 11.5075C20.7068 11.9475 21.0525 12.2932 21.4925 12.3561L22.5 12.5L21.4925 12.6439C21.0525 12.7068 20.7068 13.0525 20.6439 13.4925L20.5 14.5L20.3561 13.4925C20.2932 13.0525 19.9475 12.7068 19.5075 12.6439L18.5 12.5L19.5075 12.3561C19.9475 12.2932 20.2932 11.9475 20.3561 11.5075Z"
            fill="currentColor"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
          ></path>
        </svg>
      </span>
    </div>
  );
}

export default LightSwitch;