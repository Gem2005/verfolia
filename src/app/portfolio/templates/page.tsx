import React from "react";
import { PortfolioTemplatePreview } from "@/components/templates";

export default function TemplatesPage() {
  const templates = [
    {
      name: "Dark Minimalist",
      description:
        "A sleek dark-themed template for developers focused on blockchain and software engineering.",
      image: "/preview-images/dark-minimalist-preview.jpg",
      slug: "dark-minimalist",
      isNew: true,
    },
    {
      name: "Clean Mono",
      description:
        "A clean monospaced typography template with a focus on readability and projects.",
      image: "/preview-images/clean-mono-preview.jpg",
      slug: "clean-mono",
      isNew: true,
    },
    {
      name: "Modern AI Focused",
      description:
        "A modern, colorful template designed for AI and healthcare professionals.",
      image: "/preview-images/modern-ai-preview.jpg",
      slug: "modern-ai-focused",
      isNew: true,
    },
    {
      name: "Dark Tech",
      description:
        "A dark futuristic theme with GitHub contributions and project highlights.",
      image: "/preview-images/dark-tech-preview.jpg",
      slug: "dark-tech",
      isNew: true,
    },
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold mb-4">Portfolio Templates</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Choose from our professionally designed portfolio templates to
          showcase your work and skills.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {templates.map((template) => (
          <PortfolioTemplatePreview
            key={template.slug}
            name={template.name}
            description={template.description}
            image={template.image}
            slug={template.slug}
            isNew={template.isNew}
          />
        ))}
      </div>
    </div>
  );
}
