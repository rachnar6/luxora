// src/components/common/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Globe, DollarSign } from 'lucide-react'; // Using icons for selectors

const Footer = () => {

  // Function to scroll window to the top smoothly
  const scrollToTop = () => {
    try {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    } catch (error) {
        console.error("Error scrolling to top:", error);
        // Fallback for very old browsers that don't support smooth scrolling
        window.scrollTo(0, 0);
    }
  };

  return (
    <footer className="text-white dark:text-gray-200"> {/* Ensure text color contrasts with background */}

      {/* 1. Back to Top Section */}
      <div
        onClick={scrollToTop} // Attach the onClick handler here
        className="bg-gray-700 hover:bg-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700 text-center py-4 cursor-pointer text-sm transition-colors"
      >
        Back to top
      </div>

      {/* 2. Main Footer Links Section */}
      <div className="bg-gray-800 dark:bg-gray-900 py-12 px-4 md:px-12">
        <div className="container mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 text-sm"> {/* Reduced text size */}

          {/* Column 1: Get to Know Us */}
          <div>
            <h3 className="font-bold text-base md:text-lg mb-3">Get to Know Us</h3> {/* Adjusted heading size */}
            <ul className="space-y-2 text-gray-300 dark:text-gray-400">
              {/* Ensure these routes are defined in App.jsx */}
              <li><Link to="/about" className="hover:underline">About Us</Link></li>
              <li><Link to="/careers" className="hover:underline">Careers</Link></li>
              <li><Link to="/press" className="hover:underline">Press Releases</Link></li>
              <li><Link to="/blog" className="hover:underline">Luxora Blog</Link></li>
            </ul>
          </div>

          {/* Column 2: Connect with Us */}
          <div>
            <h3 className="font-bold text-base md:text-lg mb-3">Connect with Us</h3>
            <ul className="space-y-2 text-gray-300 dark:text-gray-400">
              {/* External links - These should work */}
              <li><a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:underline">Facebook</a></li>
              <li><a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:underline">Twitter</a></li>
              <li><a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:underline">Instagram</a></li>
            </ul>
          </div>

          {/* Column 3: Make Money with Us */}
          <div>
            <h3 className="font-bold text-base md:text-lg mb-3">Make Money with Us</h3>
            <ul className="space-y-2 text-gray-300 dark:text-gray-400">
              {/* Ensure these routes are defined in App.jsx */}
              <li><Link to="/sell" className="hover:underline">Sell on Luxora</Link></li>
              <li><Link to="/affiliate" className="hover:underline">Become an Affiliate</Link></li>
              <li><Link to="/advertise" className="hover:underline">Advertise Your Products</Link></li>
              <li><Link to="/fulfillment" className="hover:underline">Fulfillment by Luxora</Link></li>
            </ul>
          </div>

          {/* Column 4: Let Us Help You */}
          <div>
            <h3 className="font-bold text-base md:text-lg mb-3">Let Us Help You</h3>
            <ul className="space-y-2 text-gray-300 dark:text-gray-400">
              {/* Ensure these routes are defined in App.jsx */}
              <li><Link to="/account" className="hover:underline">Your Account</Link></li>
              <li><Link to="/orders" className="hover:underline">Your Orders</Link></li>
              <li><Link to="/help" className="hover:underline">Help & FAQs</Link></li>
              <li><Link to="/shipping" className="hover:underline">Shipping & Returns</Link></li>
              <li><Link to="/contact-us" className="hover:underline">Contact Us</Link></li>
            </ul>
          </div>

        </div>
      </div>

      {/* 3. Logo, Language, Country Section */}
      <div className="bg-gray-800 dark:bg-gray-900 border-t border-gray-700 dark:border-gray-600 py-8"> {/* Adjusted border color */}
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-center gap-6">
          {/* Logo */}
          <Link to="/" className="text-3xl font-bold text-white">
            LUXORA
          </Link>
          {/* Language / Country Selectors (Placeholder Buttons) */}
          <div className="flex gap-4">
            {/* NOTE: These buttons currently do nothing when clicked */}
            <button type='button' className="border border-gray-500 rounded px-4 py-2 text-xs hover:bg-gray-700 flex items-center gap-2 transition-colors disabled:opacity-50" disabled title="Language selection not implemented">
              <Globe size={14} /> English
            </button>
            <button type='button' className="border border-gray-500 rounded px-4 py-2 text-xs hover:bg-gray-700 flex items-center gap-2 transition-colors disabled:opacity-50" disabled title="Currency selection not implemented">
              <DollarSign size={14} /> INR
            </button>
            <button type='button' className="border border-gray-500 rounded px-4 py-2 text-xs hover:bg-gray-700 flex items-center gap-2 transition-colors disabled:opacity-50" disabled title="Country selection not implemented">
              🇮🇳 India {/* Example using flag emoji */}
            </button>
          </div>
        </div>
      </div>

      {/* 4. Copyright Section */}
      <div className="bg-gray-900 dark:bg-black py-6 text-center text-gray-400 dark:text-gray-500 text-xs">
        <ul className="flex flex-wrap justify-center gap-4 sm:gap-6 mb-2 px-4"> {/* Added wrap and padding */}
           {/* Ensure these routes are defined in App.jsx */}
          <li><Link to="/conditions" className="hover:underline">Conditions of Use</Link></li>
          <li><Link to="/privacy" className="hover:underline">Privacy Notice</Link></li>
          <li><Link to="/interest-based-ads" className="hover:underline">Interest-Based Ads</Link></li>
        </ul>
        <p>&copy; {new Date().getFullYear()} Luxora.com, Inc. or its affiliates</p>
      </div>
    </footer>
  );
};

export default Footer;