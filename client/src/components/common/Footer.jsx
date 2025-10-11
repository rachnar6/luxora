// client/src/components/common/Footer.jsx
// Simple Footer component

import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-dark text-light p-4 text-center shadow-inner mt-auto">
      <div className="container mx-auto">
        <p>&copy; {new Date().getFullYear()} LUXORA </p>
        <p className="text-sm mt-1">All rights reserved</p>
      </div>
    </footer>
  );
};

export default Footer;
