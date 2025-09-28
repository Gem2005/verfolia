import { Sparkles, User, Briefcase, GraduationCap, Code, FolderOpen, Award } from "lucide-react";

export const steps = [
  { id: 0, title: "Template", description: "Choose a template", icon: Sparkles },
  { id: 1, title: "Personal Info", description: "Basic information", icon: User },
  { id: 2, title: "Experience", description: "Work experience (required)", icon: Briefcase },
  {
    id: 3,
    title: "Education",
    description: "Educational background (optional)",
    icon: GraduationCap,
  },
  { id: 4, title: "Skills", description: "Technical skills (optional)", icon: Code },
  { id: 5, title: "Projects", description: "Project details (optional)", icon: FolderOpen },
  { id: 6, title: "Additional", description: "Extra sections (optional)", icon: Award },
];

export const templates = [
  {
    id: "clean-mono",
    name: "Clean Mono",
    hasPhoto: true,
    description: "Elegant mono profile with clarity",
    layout: "clean-mono",
  },
  {
    id: "dark-minimalist",
    name: "Dark Minimalist",
    hasPhoto: true,
    description: "Dark, focused, minimal profile",
    layout: "dark-minimalist",
  },
  {
    id: "dark-tech",
    name: "Dark Tech",
    hasPhoto: true,
    description: "Techy dark theme with emphasis",
    layout: "dark-tech",
  },
  {
    id: "modern-ai-focused",
    name: "Modern AI Focused",
    hasPhoto: true,
    description: "Modern AI-oriented presentation",
    layout: "modern-ai-focused",
  },
];

export const themes = [
  { id: "black", name: "Black", color: "bg-black" },
  { id: "dark-gray", name: "Dark Gray", color: "bg-gray-800" },
  { id: "navy-blue", name: "Navy Blue", color: "bg-blue-900" },
  { id: "professional", name: "Professional", color: "bg-gray-700" },
  { id: "white", name: "White", color: "bg-white" },
];