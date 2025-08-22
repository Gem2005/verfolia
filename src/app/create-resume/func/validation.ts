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
  const gpaNum = parseFloat(gpa);
  return !isNaN(gpaNum) && gpaNum >= 0 && gpaNum <= 4.0;
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
  const start = new Date(startDate);
  const end = new Date(endDate);
  return start <= end;
};

export const validateSkill = (skill: string): boolean => {
  return skill.trim().length >= 2 && skill.trim().length <= 50;
};

export const validateProficiency = (proficiency: string): boolean => {
  const validLevels = [
    "Beginner",
    "Intermediate",
    "Advanced",
    "Fluent",
    "Native",
  ];
  return validLevels.includes(proficiency);
};
