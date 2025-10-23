import React, { createContext, useState, useEffect, useContext } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
    const [font, setFont] = useState(() => localStorage.getItem('font') || 'font-inter'); // Default to Inter

    useEffect(() => {
        const root = window.document.documentElement;
        // Remove previous theme classes
        root.classList.remove('light', 'dark', 'blue');
        // Add current theme class
        root.classList.add(theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    // src/contexts/ThemeContext.jsx

useEffect(() => {
    const body = window.document.body;
    // Define all possible font classes used in your SettingsPanel
    const fontClasses = [
        'font-inter', 'font-roboto', 'font-opensans', 'font-poppins', 
        'font-montserrat', 'font-nunito', 'font-lato', 'font-playfair', 
        'font-sourcesans', 'font-ubuntu' 
        // Add any others if needed
    ];
    // Remove ALL possible previous font classes
    body.classList.remove(...fontClasses);
    // Add the currently selected font class (ensure 'font' state holds the correct class name)
    if (font) { // Add a check to ensure font is not empty
      body.classList.add(font);
    }
    localStorage.setItem('font', font);
}, [font]); 



    return (
        <ThemeContext.Provider value={{ theme, setTheme, font, setFont }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    return useContext(ThemeContext);
};