import React from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
import { templates, themes } from "../../../data/constants";
import { PortfolioData } from "@/types/PortfolioTypes";
import { ResumeData } from "@/types/ResumeData";
import { getPortfolioData as transformResumeToPortfolio } from "@/components/PortfolioDataProvider";

// Import templates directly to prevent flashing
import { CleanMonoTemplate } from "@/components/templates/CleanMonoTemplate";
import { DarkMinimalistTemplate } from "@/components/templates/DarkMinimalistTemplate";
import { DarkTechTemplate } from "@/components/templates/DarkTechTemplate";
import { ModernAIFocusedTemplate } from "@/components/templates/ModernAIFocusedTemplate";

interface TemplateStepProps {
  selectedTemplate: string;
  selectedTheme: string;
  onTemplateSelect: (templateId: string) => void;
  onThemeSelect: (themeId: string) => void;
  getPortfolioData: () => PortfolioData;
  previewTemplate: string | null;
  setPreviewTemplate: (templateId: string | null) => void;
  isLoading: boolean;
}

export const TemplateStep: React.FC<TemplateStepProps> = ({
  selectedTemplate,
  selectedTheme,
  onTemplateSelect,
  onThemeSelect,
  getPortfolioData,
  previewTemplate,
  setPreviewTemplate,
  isLoading,
}) => {
  // Mock data for template previews - using data from PortfolioDataProvider
  const getMockData = (): PortfolioData => {
    // Create empty resume data structure with proper ResumeData type
    const emptyResumeData: ResumeData = {
      user_id: "",
      title: "",
      template_id: 1,
      theme_id: 1,
      is_public: false,
      slug: "",
      view_count: 0,
      personalInfo: {
        firstName: "",
        lastName: "",
        title: "",
        email: "",
        phone: "",
        location: "",
        summary: "",
        photo: "",
        githubUrl: "",
        linkedinUrl: "",
      },
      experience: [],
      skills: [],
      education: [],
      projects: [],
      certifications: [],
      languages: [],
      customSections: [],
    };
    
    // Get sample data by passing showSampleData=true
    return transformResumeToPortfolio(emptyResumeData, true);
  };

  const TemplatePreview = ({
    template,
  }: {
    template: (typeof templates)[0];
  }) => {
    const getTemplateComponent = () => {
      const portfolioData = getPortfolioData();
      // Use mock data if user data is empty/incomplete
      const hasUserData = portfolioData.personalInfo?.firstName || 
                          portfolioData.experience?.length > 0 || 
                          portfolioData.projects?.length > 0;
      
      const templateProps = {
        preview: true as const,
        data: hasUserData ? portfolioData : getMockData(),
        theme: selectedTheme,
      };

      // Template component wrapper with proper typing
      type TemplateProps = {
        preview?: boolean;
        data: PortfolioData;
        theme?: string;
        resumeId?: string;
      };

      const templateWrapper = (
        Component: React.ComponentType<TemplateProps>
      ) => {
        // Scale down the template to show more content in the preview
        const scale = 0.25; // 25% of original size
        const cardAspectRatio = 4 / 5;
        
        return (
          <div className="w-full h-full overflow-hidden pointer-events-none">
            <div 
              className="origin-top-left" 
              style={{
                width: `${100 / scale}%`,
                height: `${(100 / scale) * (1 / cardAspectRatio)}%`,
                transform: `scale(${scale})`,
              }}
            >
              <Component {...templateProps} />
            </div>
          </div>
        );
      };

      switch (template.id) {
        case "clean-mono":
          return templateWrapper(CleanMonoTemplate);
        case "dark-minimalist":
          return templateWrapper(DarkMinimalistTemplate);
        case "dark-tech":
          return templateWrapper(DarkTechTemplate);
        case "modern-ai-focused":
          return templateWrapper(ModernAIFocusedTemplate);
        default:
          return null;
      }
    };

    return (
      <div
        className={`relative rounded-xl border-2 transition-all duration-200 cursor-pointer overflow-hidden hover:shadow-lg will-change-transform ${
          selectedTemplate === template.id
            ? "ring-2 ring-primary border-primary shadow-md"
            : "border-border hover:border-muted-foreground/30"
        }`}
        onClick={() => onTemplateSelect(template.id)}
      >
        <div className="aspect-[4/5] bg-muted/20 flex items-start justify-start p-1 sm:p-1.5 overflow-hidden">
          <div className="w-full h-full overflow-hidden rounded-lg bg-background shadow-sm relative">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {getTemplateComponent()}
            </div>
          </div>
        </div>
        <div className="p-2 sm:p-3 border-t bg-card">
          <h3 className="font-semibold text-center text-xs sm:text-sm">
            {template.name}
          </h3>
        </div>
        {selectedTemplate === template.id && (
          <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 bg-primary text-primary-foreground rounded-full p-1 sm:p-1.5 shadow-sm">
            <Check className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <Card className="bg-card border-0 shadow-sm">
        <CardHeader className="pb-3 px-3 sm:px-4 pt-4 sm:pt-5">
          <CardTitle className="text-xl text-foreground">Choose a Template</CardTitle>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Select a design that best fits your professional style
          </p>
        </CardHeader>
        <CardContent className="space-y-4 px-3 sm:px-4 pb-4 sm:pb-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {templates.map((template) => (
              <TemplatePreview key={template.id} template={template} />
            ))}
          </div>
          <div className="pt-3 border-t">
            <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3">Color Theme</h3>
            <div className="flex flex-wrap gap-2.5 sm:gap-3">
              {themes.map((theme) => {
                const getThemeButtonStyle = () => {
                  switch (theme.id) {
                    case "black":
                      return "bg-black border-2 border-gray-600 hover:border-gray-400";
                    case "dark-gray":
                      return "bg-gray-800 border-2 border-gray-500 hover:border-gray-300";
                    case "navy-blue":
                      return "bg-blue-900 border-2 border-blue-600 hover:border-blue-400";
                    case "professional":
                      return "bg-slate-700 border-2 border-slate-500 hover:border-slate-300";
                    case "white":
                      return "bg-white border-2 border-gray-300 hover:border-gray-500";
                    default:
                      return "bg-gray-700 border-2 border-gray-500";
                  }
                };
                
                return (
                  <button
                    key={theme.id}
                    className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full ${getThemeButtonStyle()} flex items-center justify-center transition-all duration-200 hover:scale-110 hover:shadow-md ${
                      selectedTheme === theme.id
                        ? "ring-4 ring-offset-2 ring-primary shadow-lg scale-105"
                        : "shadow-sm"
                    }`}
                    onClick={() => onThemeSelect(theme.id)}
                    title={theme.name}
                  >
                    {selectedTheme === theme.id && (
                      <Check className={`h-4 w-4 ${
                        theme.id === "white" ? "text-gray-800" : "text-white"
                      } drop-shadow-sm`} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

