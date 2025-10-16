"use client";
import { Card, CardContent } from "@/components/ui/card";
import { ExternalLink } from "lucide-react";
import Link from "next/link";

interface PortfolioTemplatePreviewProps {
  name: string;
  description: string;
  image: string;
  slug: string;
  isNew?: boolean;
}

export function PortfolioTemplatePreview({
  name,
  description,
  image,
  slug,
  isNew = false,
}: PortfolioTemplatePreviewProps) {
  return (
    <Card className="overflow-hidden group relative transition-all duration-300 hover:shadow-lg border-2 border-transparent hover:border-primary/20">
      <div className="relative h-64 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image}
          alt={`${name} template preview`}
          className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105 group-hover:object-bottom"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

        <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <Link
            href={`/portfolio/templates/${slug}?preview=true`}
            target="_blank"
            className="flex items-center justify-center gap-2 w-full py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Preview <ExternalLink size={16} />
          </Link>
        </div>

        {isNew && (
          <div className="absolute top-2 right-2 bg-primary text-primary-foreground px-2 py-1 rounded-md text-xs font-medium">
            New
          </div>
        )}
      </div>

      <CardContent className="p-4">
        <h3 className="font-semibold text-lg">{name}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
