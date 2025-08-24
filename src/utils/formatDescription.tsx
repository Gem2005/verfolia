import React from 'react';

/**
 * Formats a description text to support bullet points and line breaks
 * Converts text with bullet points (•, -, *) or line breaks into proper JSX
 */
export function formatDescription(description: string): React.ReactNode {
  if (!description) return null;

  // Split by line breaks and filter out empty lines
  const lines = description.split('\n').filter(line => line.trim());
  
  // If only one line, return as simple text
  if (lines.length === 1) {
    return <span>{description}</span>;
  }

  // Check if any line starts with bullet point indicators
  const hasBulletPoints = lines.some(line => 
    /^[\s]*[•\-\*]\s/.test(line.trim())
  );

  if (hasBulletPoints) {
    // Format as bullet list
    return (
      <ul className="list-disc list-inside space-y-1">
        {lines.map((line, index) => {
          const trimmedLine = line.trim();
          // Remove bullet point indicators if present
          const cleanLine = trimmedLine.replace(/^[•\-\*]\s*/, '');
          return (
            <li key={index} className="text-sm leading-relaxed">
              {cleanLine}
            </li>
          );
        })}
      </ul>
    );
  } else {
    // Format as paragraphs with line breaks
    return (
      <div className="space-y-2">
        {lines.map((line, index) => (
          <p key={index} className="text-sm leading-relaxed">
            {line.trim()}
          </p>
        ))}
      </div>
    );
  }
}

/**
 * Alternative formatting for descriptions that preserves original bullet styling
 */
export function formatDescriptionPreserveBullets(description: string): React.ReactNode {
  if (!description) return null;

  // Split by line breaks and filter out empty lines
  const lines = description.split('\n').filter(line => line.trim());
  
  // If only one line, return as simple text
  if (lines.length === 1) {
    return <span>{description}</span>;
  }

  // Format each line, preserving original bullet characters
  return (
    <div className="space-y-1">
      {lines.map((line, index) => {
        const trimmedLine = line.trim();
        const isBulletPoint = /^[\s]*[•\-\*]\s/.test(trimmedLine);
        
        return (
          <p 
            key={index} 
            className={`text-sm leading-relaxed ${isBulletPoint ? 'ml-2' : ''}`}
          >
            {trimmedLine}
          </p>
        );
      })}
    </div>
  );
}
