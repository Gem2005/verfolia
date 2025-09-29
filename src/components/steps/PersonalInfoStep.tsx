import React from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { User } from "lucide-react";
import { ResumeData } from "@/types/ResumeData";
import { ImageUpload } from "@/components/ui/image-upload";

interface PersonalInfoStepProps {
  resumeTitle: string;
  setResumeTitle: (title: string) => void;
  resumeData: ResumeData;
  setResumeData: React.Dispatch<React.SetStateAction<ResumeData>>;
  validationErrors: { [key: string]: string };
}

export const PersonalInfoStep: React.FC<PersonalInfoStepProps> = ({
  resumeTitle,
  setResumeTitle,
  resumeData,
  setResumeData,
  validationErrors,
}) => {
  return (
    <Card className="card-enhanced border-0 shadow-lg bg-card">
      <CardHeader className="pb-6">
        <CardTitle className="text-2xl font-bold text-foreground flex items-center gap-2">
          <User className="w-6 h-6 text-primary" />
          Personal Information
        </CardTitle>
        <p className="text-muted-foreground leading-relaxed">
          Tell us about yourself
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Resume Title - First Field */}
        <div className="space-y-2">
          <Label htmlFor="resumeTitle" className="text-sm font-medium text-foreground">
            Resume Title <span className="text-red-500">*</span>
          </Label>
          <Input
            id="resumeTitle"
            value={resumeTitle}
            onChange={(e) => setResumeTitle(e.target.value)}
            className={`input-enhanced h-11 ${
              validationErrors.resumeTitle ? "border-red-500" : ""
            }`}
            placeholder="e.g., John Doe - Senior Software Engineer"
          />
          {validationErrors.resumeTitle && (
            <p className="text-xs text-red-500">
              {validationErrors.resumeTitle}
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            This will be the title of your resume
          </p>
        </div>

        {/* Profile Photo Upload */}
        <ImageUpload
          value={resumeData.personalInfo.photo}
          onChange={(value) =>
            setResumeData((prev) => ({
              ...prev,
              personalInfo: {
                ...prev.personalInfo,
                photo: value,
              },
            }))
          }
          label="Profile Photo"
          description="Upload a professional headshot for your resume"
          maxSizeInMB={5}
          uploadToSupabase={true}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="firstName" className="text-sm font-medium text-foreground">
              First Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="firstName"
              value={resumeData.personalInfo.firstName}
              onChange={(e) =>
                setResumeData((prev) => ({
                  ...prev,
                  personalInfo: {
                    ...prev.personalInfo,
                    firstName: e.target.value,
                  },
                }))
              }
              className={`h-11 ${
                validationErrors.firstName ? "border-red-500" : ""
              }`}
              placeholder="Enter your first name"
            />
            {validationErrors.firstName && (
              <p className="text-xs text-red-500">
                {validationErrors.firstName}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName" className="text-sm font-medium text-glass-primary">
              Last Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="lastName"
              value={resumeData.personalInfo.lastName}
              onChange={(e) =>
                setResumeData((prev) => ({
                  ...prev,
                  personalInfo: {
                    ...prev.personalInfo,
                    lastName: e.target.value,
                  },
                }))
              }
              className={`glass-input h-11 ${
                validationErrors.lastName ? "border-red-500" : ""
              }`}
              placeholder="Enter your last name"
            />
            {validationErrors.lastName && (
              <p className="text-xs text-red-500">
                {validationErrors.lastName}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-glass-primary">
              Email <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              value={resumeData.personalInfo.email}
              onChange={(e) =>
                setResumeData((prev) => ({
                  ...prev,
                  personalInfo: {
                    ...prev.personalInfo,
                    email: e.target.value,
                  },
                }))
              }
              className={`glass-input h-11 ${
                validationErrors.email ? "border-red-500" : ""
              }`}
              placeholder="your.email@example.com"
            />
            {validationErrors.email && (
              <p className="text-xs text-red-500">{validationErrors.email}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-medium text-glass-primary">
              Phone
            </Label>
            <Input
              id="phone"
              value={resumeData.personalInfo.phone}
              onChange={(e) =>
                setResumeData((prev) => ({
                  ...prev,
                  personalInfo: {
                    ...prev.personalInfo,
                    phone: e.target.value,
                  },
                }))
              }
              className={`glass-input h-11 ${
                validationErrors.phone ? "border-red-500" : ""
              }`}
              placeholder="Enter your phone number"
            />
            {validationErrors.phone && (
              <p className="text-xs text-red-500">{validationErrors.phone}</p>
            )}
          </div>
        </div>

        {/* Current Designation */}
        <div className="space-y-2">
          <Label htmlFor="title" className="text-sm font-medium text-glass-primary">
            Current Designation <span className="text-red-500">*</span>
          </Label>
          <Input
            id="title"
            value={resumeData.personalInfo.title}
            onChange={(e) =>
              setResumeData((prev) => ({
                ...prev,
                personalInfo: {
                  ...prev.personalInfo,
                  title: e.target.value,
                },
              }))
            }
            className={`glass-input h-11 ${
              validationErrors.title ? "border-red-500" : ""
            }`}
            placeholder="e.g., Senior Software Engineer, Marketing Manager"
          />
          {validationErrors.title && (
            <p className="text-xs text-red-500">{validationErrors.title}</p>
          )}
          <p className="text-xs text-muted-foreground">
            Your current job title or professional designation
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="location" className="text-sm font-medium text-glass-primary">
            Location
          </Label>
          <Input
            id="location"
            value={resumeData.personalInfo.location}
            onChange={(e) =>
              setResumeData((prev) => ({
                ...prev,
                personalInfo: {
                  ...prev.personalInfo,
                  location: e.target.value,
                },
              }))
            }
            className={`h-11 ${
              validationErrors.location ? "border-red-500" : ""
            }`}
            placeholder="Enter your location"
          />
          {validationErrors.location && (
            <p className="text-xs text-red-500">
              {validationErrors.location}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="summary" className="text-sm font-medium text-glass-primary">
            Professional Summary
          </Label>
          <Textarea
            id="summary"
            rows={4}
            value={resumeData.personalInfo.summary}
            onChange={(e) =>
              setResumeData((prev) => ({
                ...prev,
                personalInfo: {
                  ...prev.personalInfo,
                  summary: e.target.value,
                },
              }))
            }
            className={`resize-none ${
              validationErrors.summary ? "border-red-500" : ""
            }`}
            placeholder="Write a brief summary of your professional experience and goals (20-100 words)"
          />
          {validationErrors.summary && (
            <p className="text-xs text-red-500">{validationErrors.summary}</p>
          )}
          <p className="text-xs text-muted-foreground">
            {resumeData.personalInfo.summary.trim()
              ? `${
                  resumeData.personalInfo.summary
                    .trim()
                    .split(/\s+/)
                    .filter((word) => word.length > 0).length
                } words`
              : "0 words"}{" "}
            (20-100 words recommended)
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="linkedin" className="text-sm font-medium text-glass-primary">
              LinkedIn URL
            </Label>
            <Input
              id="linkedin"
              value={resumeData.personalInfo.linkedinUrl}
              onChange={(e) =>
                setResumeData((prev) => ({
                  ...prev,
                  personalInfo: {
                    ...prev.personalInfo,
                    linkedinUrl: e.target.value,
                  },
                }))
              }
              className={`h-11 ${
                validationErrors.linkedinUrl ? "border-red-500" : ""
              }`}
              placeholder="https://linkedin.com/in/yourprofile"
            />
            {validationErrors.linkedinUrl && (
              <p className="text-xs text-red-500">
                {validationErrors.linkedinUrl}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="github" className="text-sm font-medium text-glass-primary">
              GitHub URL
            </Label>
            <Input
              id="github"
              value={resumeData.personalInfo.githubUrl}
              onChange={(e) =>
                setResumeData((prev) => ({
                  ...prev,
                  personalInfo: {
                    ...prev.personalInfo,
                    githubUrl: e.target.value,
                  },
                }))
              }
              className={`h-11 ${
                validationErrors.githubUrl ? "border-red-500" : ""
              }`}
              placeholder="https://github.com/yourusername"
            />
            {validationErrors.githubUrl && (
              <p className="text-xs text-red-500">
                {validationErrors.githubUrl}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
