// Validation functions
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ""));
};

export const validateUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === "https:";
  } catch {
    return false;
  }
};

export const validateWordCount = (
  text: string,
  min: number,
  max: number
): boolean => {
  const wordCount = text
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0).length;
  return wordCount >= min && wordCount <= max;
};

export const validateGPA = (gpa: string): boolean => {
  if (!gpa.trim()) return true; // GPA is optional
  
  // Handle different GPA formats (4.0 scale, 10.0 scale, percentage, letter grades, etc.)
  const gpaStr = gpa.trim().toLowerCase();
  
  // Check if it's a letter grade (A-F with optional +/-)
  if (/^[a-f][+-]?$/i.test(gpaStr)) {
    return true;
  }
  
  // Check if it's a percentage (e.g., "85%")
  if (gpaStr.includes('%')) {
    const percentage = parseFloat(gpaStr.replace('%', ''));
    return !isNaN(percentage) && percentage >= 0 && percentage <= 100;
  }
  
  // Check if it's a fraction (e.g., "8.7 / 10" or "3.8/4.0")
  if (gpaStr.includes('/')) {
    const parts = gpaStr.split('/');
    if (parts.length === 2) {
      const numerator = parseFloat(parts[0]);
      const denominator = parseFloat(parts[1]);
      return !isNaN(numerator) && !isNaN(denominator) && 
             numerator >= 0 && denominator > 0 && numerator <= denominator;
    }
  }
  
  // Check if it's a decimal number (4.0 scale or 10.0 scale)
  const gpaNum = parseFloat(gpaStr);
  if (!isNaN(gpaNum)) {
    // Allow common GPA scales: 4.0, 5.0, 10.0, and percentage without %
    return gpaNum >= 0 && gpaNum <= 100;
  }
  
  return false;
};

export const validateYear = (year: string): boolean => {
  if (!year.trim()) return false;
  const yearNum = parseInt(year);
  const currentYear = new Date().getFullYear();
  return !isNaN(yearNum) && yearNum >= 1950 && yearNum <= currentYear + 10;
};

export const validateDateRange = (
  startDate: string,
  endDate: string
): boolean => {
  if (!startDate || !endDate) return true; // Skip validation if either date is missing
  
  // Parse YYYY-MM format
  const parseYYYYMM = (dateStr: string): Date | null => {
    if (/^\d{4}-\d{2}$/.test(dateStr)) {
      const [year, month] = dateStr.split('-').map(Number);
      if (year && month >= 1 && month <= 12) {
        return new Date(year, month - 1, 1);
      }
    }
    return null;
  };
  
  // Try parsing as YYYY-MM first, then fall back to regular Date parsing
  let start = parseYYYYMM(startDate);
  let end = parseYYYYMM(endDate);
  
  if (!start) start = new Date(startDate);
  if (!end) end = new Date(endDate);
  
  // Validate the dates are valid
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return true; // Skip validation if dates are invalid
  
  return start <= end;
};

export const validateSkill = (skill: string): boolean => {
  return skill.trim().length >= 1 && skill.trim().length <= 50;
};

export const validateProficiency = (proficiency: string): boolean => {
  const validLevels = [
    "beginner",
    "intermediate",
    "proficient",
    "fluent",
    "native",
  ];
  return validLevels.includes(proficiency.toLowerCase());
};
