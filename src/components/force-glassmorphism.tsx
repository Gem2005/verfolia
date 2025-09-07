"use client";

import { useEffect } from 'react';

export function ForceGlassmorphism() {
  useEffect(() => {
    // Nuclear approach - force styles with JavaScript
    const forceStyles = () => {
      // Force body and html
      document.documentElement.style.setProperty('background', 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #312e81 100%)', 'important');
      document.documentElement.style.setProperty('min-height', '100vh', 'important');
      document.documentElement.style.setProperty('color', 'white', 'important');
      
      document.body.style.setProperty('background', 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #312e81 100%)', 'important');
      document.body.style.setProperty('min-height', '100vh', 'important');
      document.body.style.setProperty('color', 'white', 'important');
      document.body.style.setProperty('margin', '0', 'important');
      document.body.style.setProperty('padding', '0', 'important');

      // Force all divs
      const allDivs = document.querySelectorAll('div');
      allDivs.forEach(div => {
        if (!div.style.background || div.style.background === 'white' || div.style.background === 'rgb(255, 255, 255)') {
          div.style.setProperty('background', 'transparent', 'important');
        }
        div.style.setProperty('color', 'white', 'important');
      });

      // Force all buttons
      const allButtons = document.querySelectorAll('button');
      allButtons.forEach(button => {
        button.style.setProperty('background', 'rgba(255, 255, 255, 0.2)', 'important');
        button.style.setProperty('backdrop-filter', 'blur(10px)', 'important');
        button.style.setProperty('border', '1px solid rgba(255, 255, 255, 0.3)', 'important');
        button.style.setProperty('color', 'white', 'important');
      });

      // Force all nav elements
      const allNavs = document.querySelectorAll('nav');
      allNavs.forEach(nav => {
        nav.style.setProperty('background', 'rgba(255, 255, 255, 0.1)', 'important');
        nav.style.setProperty('backdrop-filter', 'blur(20px)', 'important');
        nav.style.setProperty('border', '1px solid rgba(255, 255, 255, 0.2)', 'important');
      });

      // Force all sections
      const allSections = document.querySelectorAll('section');
      allSections.forEach(section => {
        section.style.setProperty('background', 'transparent', 'important');
        section.style.setProperty('color', 'white', 'important');
      });

      // Force all main elements
      const allMains = document.querySelectorAll('main');
      allMains.forEach(main => {
        main.style.setProperty('background', 'transparent', 'important');
        main.style.setProperty('color', 'white', 'important');
      });

      // Force all links
      const allLinks = document.querySelectorAll('a');
      allLinks.forEach(link => {
        link.style.setProperty('color', 'white', 'important');
      });

      // Force all paragraphs
      const allParagraphs = document.querySelectorAll('p');
      allParagraphs.forEach(p => {
        p.style.setProperty('color', 'white', 'important');
      });

      // Force all headings
      const allHeadings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      allHeadings.forEach(heading => {
        heading.style.setProperty('color', 'white', 'important');
      });

      // Force all spans
      const allSpans = document.querySelectorAll('span');
      allSpans.forEach(span => {
        span.style.setProperty('color', 'white', 'important');
      });
    };

    // Apply immediately
    forceStyles();

    // Apply again after a short delay to catch any dynamically loaded content
    setTimeout(forceStyles, 100);
    setTimeout(forceStyles, 500);
    setTimeout(forceStyles, 1000);

    // Watch for DOM changes and reapply
    const observer = new MutationObserver(() => {
      forceStyles();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class']
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  return null;
}
