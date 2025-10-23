import React, { useState, useEffect, useRef } from 'react'; // Import useEffect, useRef
import { useTheme } from '../../contexts/ThemeContext';
import { X, Globe, ChevronDown } from 'lucide-react'; // Import Globe, ChevronDown

const themes = [
    { name: 'Light', value: 'light', bg: 'bg-white', border: 'border-gray-300' },
    { name: 'Dark', value: 'dark', bg: 'bg-gray-800', border: 'border-gray-600' },
    { name: 'Blue', value: 'blue', bg: 'bg-blue-600', border: 'border-blue-800' },
];

const fonts = [
    { name: 'Inter', value: 'font-inter' }, { name: 'Roboto', value: 'font-roboto' },
    { name: 'Open Sans', value: 'font-opensans' }, { name: 'Poppins', value: 'font-poppins' },
    { name: 'Montserrat', value: 'font-montserrat' }, { name: 'Nunito', value: 'font-nunito' },
    { name: 'Lato', value: 'font-lato' }, { name: 'Playfair Display', value: 'font-playfair' },
    { name: 'Source Sans Pro', value: 'font-sourcesans' }, { name: 'Ubuntu', value: 'font-ubuntu' },
];

// Define languages directly in this component or import from a shared config
const languages = [
    { code: 'en', name: 'English' }, { code: 'hi', name: 'Hindi (हिन्दी)' },
    { code: 'ta', name: 'Tamil (தமிழ்)' }, { code: 'te', name: 'Telugu (తెలుగు)' },
    { code: 'ml', name: 'Malayalam (മലയാളം)' }, { code: 'kn', name: 'Kannada (ಕನ್ನಡ)' },
    { code: 'ur', name: 'Urdu (اردو)' }, { code: 'gu', name: 'Gujarati (ગુજરાતી)' },
];

const SettingsPanel = ({ isOpen, onClose }) => {
    const { theme, setTheme, font, setFont } = useTheme();
    const [isLangMenuOpen, setIsLangMenuOpen] = useState(false); // State for language dropdown
    const langMenuRef = useRef(null); // Ref for closing dropdown on outside click

    // Close language dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (langMenuRef.current && !langMenuRef.current.contains(event.target)) {
                setIsLangMenuOpen(false);
            }
        };
        if (isOpen) { // Only add listener when panel is open
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]); // Re-run when panel opens/closes

    // Function to change language using Google Translate widget
    const changeLanguage = (langCode) => {
        const googleTranslateSelect = document.querySelector('select.goog-te-combo');
        if (googleTranslateSelect) {
            googleTranslateSelect.value = langCode;
            googleTranslateSelect.dispatchEvent(new Event('change'));
        } else {
             // Fallback if widget isn't ready (might require page reload)
            document.cookie = `googtrans=/en/${langCode}; path=/`;
            window.location.reload();
        }
        setIsLangMenuOpen(false); // Close dropdown after selection
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
            <div className="w-full max-w-sm h-full bg-white dark:bg-gray-900 shadow-xl p-6 overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold dark:text-white">Settings</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                        <X size={24} className="dark:text-gray-300" />
                    </button>
                </div>

                {/* Theme Selection */}
                <div className="mb-8">
                    <h3 className="text-lg font-semibold mb-3 dark:text-gray-200">Theme</h3>
                    <div className="grid grid-cols-3 gap-3">
                        {themes.map((t) => (
                            <button
                                key={t.value}
                                onClick={() => setTheme(t.value)}
                                className={`p-4 rounded-lg border-2 text-center transition ${
                                    theme === t.value ? 'border-primary ring-2 ring-primary ring-offset-2 dark:ring-offset-gray-900' : t.border + ' hover:border-gray-400 dark:hover:border-gray-500'
                                }`}
                            >
                                <div className={`w-8 h-8 mx-auto rounded mb-2 ${t.bg} border ${t.border}`}></div>
                                <span className="text-sm font-medium dark:text-gray-300">{t.name}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Font Family Selection */}
                <div className="mb-8">
                    <h3 className="text-lg font-semibold mb-3 dark:text-gray-200">Font Family</h3>
                    <div className="flex flex-wrap gap-3">
                        {fonts.map((f) => (
                            <button
                                key={f.value}
                                onClick={() => setFont(f.value)}
                                className={`px-4 py-2 rounded-lg border text-sm transition ${
                                    font === f.value ? 'bg-primary text-white border-primary' : 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                }`}
                            >
                                {f.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ✅ Language Selection */}
                <div className="relative" ref={langMenuRef}>
                    <h3 className="text-lg font-semibold mb-3 dark:text-gray-200">Language</h3>
                    <button
                        onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                        className="w-full flex justify-between items-center p-3 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                    >
                        <span className="flex items-center gap-2">
                           <Globe size={20}/> Current: English {/* You can make this dynamic later */}
                        </span>
                        <ChevronDown size={20} className={`transition-transform ${isLangMenuOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isLangMenuOpen && (
                        <div className="absolute left-0 right-0 mt-1 w-full max-h-48 overflow-y-auto bg-white dark:bg-gray-700 rounded-lg shadow-xl py-2 z-10 border dark:border-gray-600">
                            {languages.map((lang) => (
                                <button
                                    key={lang.code}
                                    onClick={() => changeLanguage(lang.code)}
                                    className="w-full text-left px-4 py-2 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                                >
                                    {lang.name}
                                </button>
                            ))}
                        </div>
                    )}
                     {/* Hidden Google Translate element needed for the widget */}
                     <div id="google_translate_element" style={{ display: 'none' }}></div>
                </div>

            </div>
        </div>
    );
};

export default SettingsPanel;