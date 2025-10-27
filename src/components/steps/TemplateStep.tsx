import React from "react";
import Image from "next/image";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, Check } from "lucide-react";
import { templates, themes } from "../../../data/constants";
import { PortfolioData } from "@/types/PortfolioTypes";

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
  const TemplatePreview = ({
    template,
  }: {
    template: (typeof templates)[0];
  }) => {
    const getPreviewImage = () => {
      const baseUrl = "/preview-images";
      const templateImageMap: { [key: string]: string } = {
        "clean-mono": "Clean Mono.png",
        "dark-minimalist": "Dark Minimalist.png",
        "dark-tech": "Dark Tech.png",
        "modern-ai-focused": "Modern AI Focused.png",
      };
      const imageName = templateImageMap[template.id];
      return imageName
        ? `${baseUrl}/${imageName}`
        : `${baseUrl}/Clean Mono.png`;
    };

    const getTemplateComponent = () => {
      const templateProps = {
        preview: true as const,
        data: getPortfolioData(),
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
      ) => (
        <div className="w-full h-full scale-[0.15] origin-top-left transform transition-transform duration-200 overflow-hidden">
          <div className="w-[800px] h-[1000px]">
            <Component {...templateProps} />
          </div>
        </div>
      );

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
        <div className="aspect-[4/5] bg-muted/20 flex items-center justify-center p-2">
          <div className="w-full h-full overflow-hidden rounded-lg bg-background shadow-sm relative">
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <Image
                src={getPreviewImage()}
                alt={`${template.name} preview`}
                fill
                className="object-cover object-top"
                priority={true}
                quality={90}
                onLoad={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.opacity = "1";
                  const loadingDiv = target.parentElement?.querySelector(
                    ".loading-placeholder"
                  ) as HTMLElement;
                  if (loadingDiv) {
                    loadingDiv.style.opacity = "0";
                    setTimeout(() => {
                      loadingDiv.style.display = "none";
                    }, 200);
                  }
                }}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = "none";
                  const fallbackDiv =
                    target.nextElementSibling as HTMLElement;
                  if (fallbackDiv) {
                    fallbackDiv.style.display = "block";
                  }
                }}
                style={{ opacity: 0, transition: "opacity 200ms" }}
                unoptimized
              />
              <div className="loading-placeholder absolute inset-0 flex items-center justify-center bg-gray-100 transition-opacity duration-200">
                <div className="text-gray-400 text-sm">
                  Loading preview...
                </div>
              </div>
              <div className="w-full h-full" style={{ display: "none" }}>
                {getTemplateComponent()}
              </div>
            </div>
            <div className="absolute top-2 right-2 px-2 py-1 bg-black/80 text-white text-xs rounded-md backdrop-blur-sm">
              {themes.find((t) => t.id === selectedTheme)?.name ||
                selectedTheme}
            </div>
            <div className="absolute bottom-2 left-2 flex gap-1">
                <div className="px-2 py-1 bg-white/10 text-white text-xs rounded-md backdrop-blur-md border border-white/20">
                {template.layout}
                </div>
            </div>
          </div>
        </div>
        <div className="p-4 border-t bg-card">
          <h3 className="font-semibold text-center text-sm">
            {template.name}
          </h3>
          <p className="text-xs text-muted-foreground text-center mt-1 leading-relaxed">
            {template.description}
          </p>
          <Button
            variant="outline"
            size="sm"
            className="w-full mt-3 h-8 text-xs"
            onClick={(e) => {
              e.stopPropagation();
              setPreviewTemplate(template.id);
            }}
          >
            <Eye className="h-3 w-3 mr-1" />
            Preview
          </Button>
        </div>
        {selectedTemplate === template.id && (
          <div className="absolute top-3 right-3 bg-primary text-primary-foreground rounded-full p-1.5 shadow-sm">
            <Check className="h-3 w-3" />
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <Card className="bg-card border-0 shadow-sm">
        <CardHeader className="pb-6">
          <CardTitle className="text-xl text-foreground">Choose a Template</CardTitle>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Select a design that best fits your professional style
          </p>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="grid grid-cols-2 max-[400px]:grid-cols-1 gap-4 sm:gap-6 lg:gap-8">
            {templates.map((template) => (
              <TemplatePreview key={template.id} template={template} />
            ))}
          </div>
          <div className="pt-4 border-t">
            <h3 className="text-lg font-semibold mb-4">Color Theme</h3>
            <div className="flex flex-wrap gap-4">
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
                    className={`w-12 h-12 rounded-full ${getThemeButtonStyle()} flex items-center justify-center transition-all duration-200 hover:scale-110 hover:shadow-md ${
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

