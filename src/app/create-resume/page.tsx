'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Save, Upload, Trash2, Eye, FileText } from 'lucide-react';
import ReactCrop, { type Crop as CropType, type PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { useAuth } from '@/hooks/use-auth';
import { resumeService } from '@/services/resume-service';

interface PersonalInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  linkedinUrl: string;
  githubUrl: string;
  summary: string;
  photo?: string; // Base64 encoded image data
}

interface Experience {
  id: string;
  company: string;
  position: string;
  description: string;
}

interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  gpa: string;
}

interface Project {
  id: string;
  name: string;
  description: string;
  techStack: string[];
  startDate: string;
  endDate: string;
}

interface ResumeData {
  title: string;
  templateId: string;
  isPublic: boolean;
  personalInfo: PersonalInfo;
  experience: Experience[];
  education: Education[];
  skills: string[];
  projects: Project[];
  certifications: Array<{
    id: string;
    name: string;
    issuer: string;
  }>;
  languages: Array<{
    id: string;
    name: string;
  }>;
  customSections: Array<{
    id: string;
    title: string;
    description: string;
  }>;
}

export default function CreateResumePage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [selectedTheme, setSelectedTheme] = useState('black');
  const [selectedTemplate, setSelectedTemplate] = useState('classic');
  
  // Photo upload and crop states
  const [showCropDialog, setShowCropDialog] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string>('');
  const [crop, setCrop] = useState<CropType>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const imgRef = useRef<HTMLImageElement>(null);
  
  const themes = [
    { id: 'black', name: 'Black', colors: 'bg-black' },
    { id: 'dark-gray', name: 'Dark Gray', colors: 'bg-gray-800' },
    { id: 'navy-blue', name: 'Navy Blue', colors: 'bg-blue-900' },
    { id: 'professional', name: 'Professional', colors: 'bg-gray-700' }
  ];

  const templates = [
    { 
      id: 'classic', 
      name: 'Classic', 
      hasPhoto: false, 
      description: 'Traditional single-column layout',
      layout: 'single-column'
    },
    { 
      id: 'executive', 
      name: 'Executive', 
      hasPhoto: true, 
      description: 'Professional with photo header',
      layout: 'photo-header'
    },
    { 
      id: 'creative', 
      name: 'Creative', 
      hasPhoto: true, 
      description: 'Sidebar with photo and skills',
      layout: 'sidebar'
    },
    { 
      id: 'minimal', 
      name: 'Minimal', 
      hasPhoto: false, 
      description: 'Clean and spacious layout',
      layout: 'minimal'
    },
    { 
      id: 'corporate', 
      name: 'Corporate', 
      hasPhoto: true, 
      description: 'Formal business layout with photo',
      layout: 'corporate'
    }
  ];
  
  const [resumeData, setResumeData] = useState<ResumeData>({
    title: 'My Resume',
    templateId: 'classic',
    isPublic: true,
    personalInfo: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      location: '',
      linkedinUrl: '',
      githubUrl: '',
      summary: ''
    },
    experience: [],
    education: [],
    skills: [],
    projects: [],
    certifications: [],
    languages: [],
    customSections: []
  });

  // Update resume data when template changes
  useEffect(() => {
    updateResumeData('templateId', selectedTemplate);
  }, [selectedTemplate]);

  // Get theme styles
  const getThemeStyles = () => {
    switch (selectedTheme) {
      case 'black':
        return {
          sectionText: 'text-black',
          headerText: 'text-black'
        };
      case 'dark-gray':
        return {
          sectionText: 'text-gray-800',
          headerText: 'text-gray-900'
        };
      case 'navy-blue':
        return {
          sectionText: 'text-blue-900',
          headerText: 'text-blue-900'
        };
      case 'professional':
        return {
          sectionText: 'text-gray-700',
          headerText: 'text-gray-800'
        };
      default:
        return {
          sectionText: 'text-black',
          headerText: 'text-black'
        };
    }
  };

  const themeStyles = getThemeStyles();

  // Get current template
  const currentTemplate = templates.find(t => t.id === selectedTemplate) || templates[0];

  // Render different template layouts
  const renderResumePreview = () => {
    switch (currentTemplate.layout) {
      case 'single-column':
        return renderClassicLayout();
      case 'photo-header':
        return renderExecutiveLayout();
      case 'sidebar':
        return renderCreativeLayout();
      case 'minimal':
        return renderMinimalLayout();
      case 'corporate':
        return renderCorporateLayout();
      default:
        return renderClassicLayout();
    }
  };

  // Classic single-column layout
  const renderClassicLayout = () => (
    <div className="bg-white p-6 shadow-lg min-h-[700px] w-full max-w-none mx-auto">
      <div className="space-y-5">
        {/* Header */}
        <div className="text-center border-b border-gray-300 pb-5">
          <h1 className={`text-3xl font-bold ${themeStyles.headerText} mb-3`}>
            {resumeData.personalInfo.firstName} {resumeData.personalInfo.lastName}
          </h1>
          <div className="text-sm text-gray-600 space-y-1">
            <div className="flex justify-center items-center gap-1">
              {resumeData.personalInfo.email && <span>{resumeData.personalInfo.email}</span>}
              {resumeData.personalInfo.email && resumeData.personalInfo.phone && <span>•</span>}
              {resumeData.personalInfo.phone && <span>{resumeData.personalInfo.phone}</span>}
            </div>
            {resumeData.personalInfo.location && <div>{resumeData.personalInfo.location}</div>}
            <div className="flex justify-center gap-6 mt-2">
              {resumeData.personalInfo.linkedinUrl && (
                <a href={resumeData.personalInfo.linkedinUrl} className="text-blue-600 text-sm hover:underline">LinkedIn</a>
              )}
              {resumeData.personalInfo.githubUrl && (
                <a href={resumeData.personalInfo.githubUrl} className="text-blue-600 text-sm hover:underline">GitHub</a>
              )}
            </div>
          </div>
        </div>

        {/* Professional Summary */}
        {resumeData.personalInfo.summary && (
          <div>
            <h2 className={`text-lg font-semibold ${themeStyles.sectionText} mb-3 border-b border-gray-200 pb-1`}>
              PROFESSIONAL SUMMARY
            </h2>
            <p className="text-gray-700 text-sm leading-relaxed text-justify">{resumeData.personalInfo.summary}</p>
          </div>
        )}

        {/* Experience */}
        {resumeData.experience.length > 0 && (
          <div>
            <h2 className={`text-lg font-semibold ${themeStyles.sectionText} mb-4 border-b border-gray-200 pb-1`}>
              PROFESSIONAL EXPERIENCE
            </h2>
            <div className="space-y-4">
              {resumeData.experience.map((exp) => (
                <div key={exp.id} className="border-l-3 border-gray-200 pl-4">
                  <div className="mb-2">
                    <h3 className="font-semibold text-gray-900 text-base">{exp.position}</h3>
                    <p className="font-medium text-gray-700 text-sm">{exp.company}</p>
                  </div>
                  {exp.description && (
                    <p className="text-gray-700 text-sm leading-relaxed">{exp.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {resumeData.education.length > 0 && (
          <div>
            <h2 className={`text-lg font-semibold ${themeStyles.sectionText} mb-4 border-b border-gray-200 pb-1`}>
              EDUCATION
            </h2>
            <div className="space-y-3">
              {resumeData.education.map((edu) => (
                <div key={edu.id}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 text-sm">{edu.degree}</h3>
                      <p className="text-gray-700 text-sm">{edu.institution}</p>
                      {edu.field && <p className="text-gray-600 text-xs italic">{edu.field}</p>}
                    </div>
                    <div className="text-right text-xs text-gray-600">
                      <p className="font-medium">{edu.startDate} - {edu.endDate}</p>
                      {edu.gpa && <p>CGPA: {edu.gpa}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills */}
        {resumeData.skills.length > 0 && (
          <div>
            <h2 className={`text-lg font-semibold ${themeStyles.sectionText} mb-3 border-b border-gray-200 pb-1`}>
              TECHNICAL SKILLS
            </h2>
            <div className="flex flex-wrap gap-2">
              {resumeData.skills.map((skill) => (
                <span key={skill} className="px-3 py-1 bg-gray-100 text-gray-800 rounded-md text-sm font-medium border">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Projects */}
        {resumeData.projects.length > 0 && (
          <div>
            <h2 className={`text-lg font-semibold ${themeStyles.sectionText} mb-4 border-b border-gray-200 pb-1`}>
              PROJECTS
            </h2>
            <div className="space-y-4">
              {resumeData.projects.map((project) => (
                <div key={project.id}>
                  <h3 className="font-semibold text-gray-900 text-sm mb-1">{project.name}</h3>
                  {project.techStack.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {project.techStack.map((tech) => (
                        <span key={tech} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-medium border border-blue-200">
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                  {project.description && (
                    <p className="text-gray-700 text-sm leading-relaxed">{project.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Additional sections */}
        {(resumeData.certifications.length > 0 || resumeData.languages.length > 0 || resumeData.customSections.length > 0) && (
          <div className="space-y-4">
            {resumeData.certifications.length > 0 && (
              <div>
                <h2 className={`text-lg font-semibold ${themeStyles.sectionText} mb-3 border-b border-gray-200 pb-1`}>
                  CERTIFICATIONS
                </h2>
                <div className="space-y-2">
                  {resumeData.certifications.map((cert) => (
                    <div key={cert.id}>
                      <h3 className="font-medium text-gray-900 text-sm">{cert.name}</h3>
                      <p className="text-gray-700 text-xs">{cert.issuer}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {resumeData.languages.length > 0 && (
              <div>
                <h2 className={`text-lg font-semibold ${themeStyles.sectionText} mb-3 border-b border-gray-200 pb-1`}>
                  LANGUAGES
                </h2>
                <div className="flex flex-wrap gap-2">
                  {resumeData.languages.map((lang) => (
                    <span key={lang.id} className="px-3 py-1 bg-gray-100 text-gray-800 rounded-md text-sm font-medium border">
                      {lang.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {resumeData.customSections.map((section) => (
              section.title && (
                <div key={section.id}>
                  <h2 className={`text-lg font-semibold ${themeStyles.sectionText} mb-3 border-b border-gray-200 pb-1`}>
                    {section.title.toUpperCase()}
                  </h2>
                  {section.description && (
                    <p className="text-gray-700 text-sm leading-relaxed">{section.description}</p>
                  )}
                </div>
              )
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // Executive layout with photo header
  const renderExecutiveLayout = () => (
    <div className="bg-white p-4 shadow-lg min-h-[700px] w-full max-w-none mx-auto">
      <div className="space-y-3">
        {/* Header with Photo */}
        <div className="text-center border-b-2 pb-4">
          <div className="flex items-center justify-center gap-4 mb-3">
            <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
              {resumeData.personalInfo.photo ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img 
                  src={resumeData.personalInfo.photo} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-gray-500 text-xs">Photo</span>
              )}
            </div>
            <div>
              <h1 className={`text-xl font-bold ${themeStyles.headerText}`}>
                {resumeData.personalInfo.firstName} {resumeData.personalInfo.lastName}
              </h1>
              <div className="text-sm text-gray-600 mt-1">
                {resumeData.personalInfo.email && <div>{resumeData.personalInfo.email}</div>}
                {resumeData.personalInfo.phone && <div>{resumeData.personalInfo.phone}</div>}
                {resumeData.personalInfo.location && <div>{resumeData.personalInfo.location}</div>}
                <div className="flex justify-center gap-3 mt-1">
                  {resumeData.personalInfo.linkedinUrl && (
                    <a href={resumeData.personalInfo.linkedinUrl} className="text-blue-600 text-xs hover:underline">LinkedIn</a>
                  )}
                  {resumeData.personalInfo.githubUrl && (
                    <a href={resumeData.personalInfo.githubUrl} className="text-blue-600 text-xs hover:underline">GitHub</a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content sections */}
        {resumeData.personalInfo.summary && (
          <div>
            <h2 className={`text-base font-bold ${themeStyles.sectionText} mb-1`}>PROFESSIONAL SUMMARY</h2>
            <p className="text-gray-700 text-xs leading-relaxed">{resumeData.personalInfo.summary}</p>
          </div>
        )}

        {resumeData.experience.length > 0 && (
          <div>
            <h2 className={`text-base font-bold ${themeStyles.sectionText} mb-2`}>EXPERIENCE</h2>
            <div className="space-y-2">
              {resumeData.experience.map((exp) => (
                <div key={exp.id}>
                  <h3 className="font-bold text-gray-900 text-xs">{exp.position}</h3>
                  <p className="font-semibold text-gray-700 text-xs">{exp.company}</p>
                  {exp.description && (
                    <p className="text-gray-700 text-xs leading-relaxed mt-1">{exp.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {resumeData.education.length > 0 && (
          <div>
            <h2 className={`text-base font-bold ${themeStyles.sectionText} mb-2`}>EDUCATION</h2>
            <div className="space-y-1">
              {resumeData.education.map((edu) => (
                <div key={edu.id}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-gray-900 text-xs">{edu.degree}</h3>
                      <p className="text-gray-700 text-xs">{edu.institution}</p>
                      {edu.field && <p className="text-gray-600 text-xs italic">{edu.field}</p>}
                    </div>
                    <div className="text-right text-xs text-gray-600">
                      {edu.startDate && edu.endDate && <p>{edu.startDate} - {edu.endDate}</p>}
                      {edu.gpa && <p>CGPA: {edu.gpa}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills */}
        {resumeData.skills.length > 0 && (
          <div>
            <h2 className={`text-base font-bold ${themeStyles.sectionText} mb-2`}>SKILLS</h2>
            <div className="flex flex-wrap gap-1">
              {resumeData.skills.map((skill) => (
                <span key={skill} className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Projects */}
        {resumeData.projects.length > 0 && (
          <div>
            <h2 className={`text-base font-bold ${themeStyles.sectionText} mb-2`}>PROJECTS</h2>
            <div className="space-y-2">
              {resumeData.projects.map((project) => (
                <div key={project.id}>
                  <h3 className="font-bold text-gray-900 text-xs">{project.name}</h3>
                  {project.techStack.length > 0 && (
                    <div className="flex flex-wrap gap-1 my-1">
                      {project.techStack.map((tech) => (
                        <span key={tech} className="px-1 py-0.5 bg-blue-50 text-blue-700 rounded text-xs border border-blue-200">
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                  {project.description && (
                    <p className="text-gray-700 text-xs leading-relaxed">{project.description}</p>
                  )}
                  {(project.startDate || project.endDate) && (
                    <p className="text-xs text-gray-600 mt-1">
                      {project.startDate} - {project.endDate}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Certifications */}
        {resumeData.certifications.length > 0 && (
          <div>
            <h2 className={`text-base font-bold ${themeStyles.sectionText} mb-2`}>CERTIFICATIONS</h2>
            <div className="space-y-1">
              {resumeData.certifications.map((cert) => (
                <div key={cert.id}>
                  <h3 className="font-bold text-gray-900 text-xs">{cert.name}</h3>
                  <p className="text-gray-700 text-xs">{cert.issuer}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Languages */}
        {resumeData.languages.length > 0 && (
          <div>
            <h2 className={`text-base font-bold ${themeStyles.sectionText} mb-2`}>LANGUAGES</h2>
            <div className="flex flex-wrap gap-1">
              {resumeData.languages.map((lang) => (
                <span key={lang.id} className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs">
                  {lang.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Custom Sections */}
        {resumeData.customSections.map((section) => (
          section.title && (
            <div key={section.id}>
              <h2 className={`text-base font-bold ${themeStyles.sectionText} mb-2`}>{section.title.toUpperCase()}</h2>
              {section.description && (
                <p className="text-gray-700 text-xs leading-relaxed">{section.description}</p>
              )}
            </div>
          )
        ))}
      </div>
    </div>
  );

  // Creative sidebar layout
  const renderCreativeLayout = () => (
    <div className="bg-white shadow-lg min-h-[700px] w-full max-w-none mx-auto flex">
      <div className={`w-1/3 p-3 space-y-3 ${themeStyles.sectionText === 'text-blue-900' ? 'bg-blue-50' : 'bg-gray-50'}`}>
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-2 flex items-center justify-center overflow-hidden">
            {resumeData.personalInfo.photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img 
                src={resumeData.personalInfo.photo} 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-gray-500 text-xs">Photo</span>
            )}
          </div>
          <h1 className={`text-sm font-bold ${themeStyles.headerText}`}>
            {resumeData.personalInfo.firstName} {resumeData.personalInfo.lastName}
          </h1>
        </div>
        
        <div>
          <h2 className={`text-xs font-bold ${themeStyles.sectionText} mb-1`}>CONTACT</h2>
          <div className="text-xs space-y-1 text-gray-700">
            {resumeData.personalInfo.email && <div className="break-all">{resumeData.personalInfo.email}</div>}
            {resumeData.personalInfo.phone && <div>{resumeData.personalInfo.phone}</div>}
            {resumeData.personalInfo.location && <div>{resumeData.personalInfo.location}</div>}
            {resumeData.personalInfo.linkedinUrl && (
              <a href={resumeData.personalInfo.linkedinUrl} className="text-blue-600 text-xs break-all">LinkedIn</a>
            )}
            {resumeData.personalInfo.githubUrl && (
              <a href={resumeData.personalInfo.githubUrl} className="text-blue-600 text-xs break-all">GitHub</a>
            )}
          </div>
        </div>

        {/* Skills */}
        {resumeData.skills.length > 0 && (
          <div>
            <h2 className={`text-xs font-bold ${themeStyles.sectionText} mb-1`}>SKILLS</h2>
            <div className="space-y-1">
              {resumeData.skills.map((skill) => (
                <div key={skill} className="text-xs text-gray-700">• {skill}</div>
              ))}
            </div>
          </div>
        )}

        {/* Languages */}
        {resumeData.languages.length > 0 && (
          <div>
            <h2 className={`text-xs font-bold ${themeStyles.sectionText} mb-1`}>LANGUAGES</h2>
            <div className="space-y-1">
              {resumeData.languages.map((lang) => (
                <div key={lang.id} className="text-xs text-gray-700">• {lang.name}</div>
              ))}
            </div>
          </div>
        )}

        {/* Certifications */}
        {resumeData.certifications.length > 0 && (
          <div>
            <h2 className={`text-xs font-bold ${themeStyles.sectionText} mb-1`}>CERTIFICATIONS</h2>
            <div className="space-y-1">
              {resumeData.certifications.map((cert) => (
                <div key={cert.id} className="text-xs text-gray-700">
                  <div className="font-medium">{cert.name}</div>
                  <div className="text-gray-600">{cert.issuer}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <div className="w-2/3 p-3 space-y-3">
        {/* Summary */}
        {resumeData.personalInfo.summary && (
          <div>
            <h2 className={`text-sm font-bold ${themeStyles.sectionText} mb-1`}>SUMMARY</h2>
            <p className="text-xs text-gray-700 leading-relaxed">{resumeData.personalInfo.summary}</p>
          </div>
        )}

        {/* Experience */}
        {resumeData.experience.length > 0 && (
          <div>
            <h2 className={`text-sm font-bold ${themeStyles.sectionText} mb-2`}>EXPERIENCE</h2>
            <div className="space-y-2">
              {resumeData.experience.map((exp) => (
                <div key={exp.id}>
                  <h3 className="font-bold text-gray-900 text-xs">{exp.position}</h3>
                  <p className="font-semibold text-gray-700 text-xs">{exp.company}</p>
                  {exp.description && (
                    <p className="text-gray-700 text-xs leading-relaxed">{exp.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {resumeData.education.length > 0 && (
          <div>
            <h2 className={`text-sm font-bold ${themeStyles.sectionText} mb-2`}>EDUCATION</h2>
            <div className="space-y-1">
              {resumeData.education.map((edu) => (
                <div key={edu.id}>
                  <h3 className="font-bold text-gray-900 text-xs">{edu.degree}</h3>
                  <p className="text-gray-700 text-xs">{edu.institution}</p>
                  {edu.field && <p className="text-gray-600 text-xs italic">{edu.field}</p>}
                  <div className="text-xs text-gray-600">
                    {edu.startDate && edu.endDate && <span>{edu.startDate} - {edu.endDate}</span>}
                    {edu.gpa && <span className="ml-2">CGPA: {edu.gpa}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Projects */}
        {resumeData.projects.length > 0 && (
          <div>
            <h2 className={`text-sm font-bold ${themeStyles.sectionText} mb-2`}>PROJECTS</h2>
            <div className="space-y-2">
              {resumeData.projects.map((project) => (
                <div key={project.id}>
                  <h3 className="font-bold text-gray-900 text-xs">{project.name}</h3>
                  {project.techStack.length > 0 && (
                    <div className="flex flex-wrap gap-1 my-1">
                      {project.techStack.map((tech) => (
                        <span key={tech} className="px-1 py-0.5 bg-blue-50 text-blue-700 rounded text-xs border border-blue-200">
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                  {project.description && (
                    <p className="text-gray-700 text-xs leading-relaxed">{project.description}</p>
                  )}
                  {(project.startDate || project.endDate) && (
                    <p className="text-xs text-gray-600 mt-1">
                      {project.startDate} - {project.endDate}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Custom Sections */}
        {resumeData.customSections.map((section) => (
          section.title && (
            <div key={section.id}>
              <h2 className={`text-sm font-bold ${themeStyles.sectionText} mb-1`}>{section.title.toUpperCase()}</h2>
              {section.description && (
                <p className="text-gray-700 text-xs leading-relaxed">{section.description}</p>
              )}
            </div>
          )
        ))}
      </div>
    </div>
  );

  // Minimal layout
  const renderMinimalLayout = () => (
    <div className="bg-white p-6 shadow-lg min-h-[700px] w-full max-w-none mx-auto">
      <div className="space-y-6">
        <div className="text-left">
          <h1 className={`text-2xl font-light ${themeStyles.headerText} mb-1`}>
            {resumeData.personalInfo.firstName} {resumeData.personalInfo.lastName}
          </h1>
          <div className="text-sm text-gray-600 flex flex-wrap gap-4">
            {resumeData.personalInfo.email && <span>{resumeData.personalInfo.email}</span>}
            {resumeData.personalInfo.phone && <span>{resumeData.personalInfo.phone}</span>}
            {resumeData.personalInfo.location && <span>{resumeData.personalInfo.location}</span>}
          </div>
          <div className="flex gap-4 mt-2">
            {resumeData.personalInfo.linkedinUrl && (
              <a href={resumeData.personalInfo.linkedinUrl} className="text-blue-600 text-sm hover:underline">LinkedIn</a>
            )}
            {resumeData.personalInfo.githubUrl && (
              <a href={resumeData.personalInfo.githubUrl} className="text-blue-600 text-sm hover:underline">GitHub</a>
            )}
          </div>
        </div>

        {/* Summary */}
        {resumeData.personalInfo.summary && (
          <div>
            <p className="text-sm text-gray-700 leading-relaxed italic">{resumeData.personalInfo.summary}</p>
          </div>
        )}

        {/* Experience */}
        {resumeData.experience.length > 0 && (
          <div>
            <h2 className={`text-base font-light ${themeStyles.sectionText} mb-3 border-b border-gray-200 pb-1`}>Experience</h2>
            <div className="space-y-4">
              {resumeData.experience.map((exp) => (
                <div key={exp.id}>
                  <h3 className="font-medium text-gray-900 text-sm">{exp.position}</h3>
                  <p className="text-gray-600 text-sm">{exp.company}</p>
                  {exp.description && (
                    <p className="text-gray-700 text-xs leading-relaxed mt-1">{exp.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {resumeData.education.length > 0 && (
          <div>
            <h2 className={`text-base font-light ${themeStyles.sectionText} mb-3 border-b border-gray-200 pb-1`}>Education</h2>
            <div className="space-y-2">
              {resumeData.education.map((edu) => (
                <div key={edu.id}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900 text-sm">{edu.degree}</h3>
                      <p className="text-gray-600 text-sm">{edu.institution}</p>
                      {edu.field && <p className="text-gray-600 text-xs italic">{edu.field}</p>}
                    </div>
                    <div className="text-right text-xs text-gray-600">
                      {edu.startDate && edu.endDate && <p>{edu.startDate} - {edu.endDate}</p>}
                      {edu.gpa && <p>CGPA: {edu.gpa}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills */}
        {resumeData.skills.length > 0 && (
          <div>
            <h2 className={`text-base font-light ${themeStyles.sectionText} mb-3 border-b border-gray-200 pb-1`}>Skills</h2>
            <p className="text-sm text-gray-700">{resumeData.skills.join(' • ')}</p>
          </div>
        )}

        {/* Projects */}
        {resumeData.projects.length > 0 && (
          <div>
            <h2 className={`text-base font-light ${themeStyles.sectionText} mb-3 border-b border-gray-200 pb-1`}>Projects</h2>
            <div className="space-y-3">
              {resumeData.projects.map((project) => (
                <div key={project.id}>
                  <h3 className="font-medium text-gray-900 text-sm">{project.name}</h3>
                  {project.techStack.length > 0 && (
                    <p className="text-xs text-gray-600 italic mb-1">
                      {project.techStack.join(', ')}
                    </p>
                  )}
                  {project.description && (
                    <p className="text-gray-700 text-xs leading-relaxed">{project.description}</p>
                  )}
                  {(project.startDate || project.endDate) && (
                    <p className="text-xs text-gray-600 mt-1">
                      {project.startDate} - {project.endDate}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Certifications */}
        {resumeData.certifications.length > 0 && (
          <div>
            <h2 className={`text-base font-light ${themeStyles.sectionText} mb-3 border-b border-gray-200 pb-1`}>Certifications</h2>
            <div className="space-y-2">
              {resumeData.certifications.map((cert) => (
                <div key={cert.id}>
                  <h3 className="font-medium text-gray-900 text-sm">{cert.name}</h3>
                  <p className="text-gray-600 text-xs">{cert.issuer}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Languages */}
        {resumeData.languages.length > 0 && (
          <div>
            <h2 className={`text-base font-light ${themeStyles.sectionText} mb-3 border-b border-gray-200 pb-1`}>Languages</h2>
            <p className="text-sm text-gray-700">{resumeData.languages.map(lang => lang.name).join(' • ')}</p>
          </div>
        )}

        {/* Custom Sections */}
        {resumeData.customSections.map((section) => (
          section.title && (
            <div key={section.id}>
              <h2 className={`text-base font-light ${themeStyles.sectionText} mb-3 border-b border-gray-200 pb-1`}>{section.title}</h2>
              {section.description && (
                <p className="text-gray-700 text-sm leading-relaxed">{section.description}</p>
              )}
            </div>
          )
        ))}
      </div>
    </div>
  );

  // Corporate layout
  const renderCorporateLayout = () => (
    <div className="bg-white p-4 shadow-lg min-h-[700px] w-full max-w-none mx-auto">
      <div className="space-y-3">
        <div className="border-b-2 border-gray-800 pb-3">
          <div className="flex items-start gap-4">
            <div className="w-20 h-20 bg-gray-200 rounded-sm flex items-center justify-center overflow-hidden">
              {resumeData.personalInfo.photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img 
                  src={resumeData.personalInfo.photo} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-gray-500 text-xs">Photo</span>
              )}
            </div>
            <div className="flex-1">
              <h1 className={`text-xl font-bold ${themeStyles.headerText} mb-1`}>
                {resumeData.personalInfo.firstName} {resumeData.personalInfo.lastName}
              </h1>
              <div className="text-sm text-gray-600 space-y-1">
                {resumeData.personalInfo.email && <div>{resumeData.personalInfo.email}</div>}
                {resumeData.personalInfo.phone && <div>{resumeData.personalInfo.phone}</div>}
                {resumeData.personalInfo.location && <div>{resumeData.personalInfo.location}</div>}
                <div className="flex gap-3 mt-1">
                  {resumeData.personalInfo.linkedinUrl && (
                    <a href={resumeData.personalInfo.linkedinUrl} className="text-blue-600 text-xs hover:underline">LinkedIn</a>
                  )}
                  {resumeData.personalInfo.githubUrl && (
                    <a href={resumeData.personalInfo.githubUrl} className="text-blue-600 text-xs hover:underline">GitHub</a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Executive Summary */}
        {resumeData.personalInfo.summary && (
          <div>
            <h2 className={`text-base font-bold ${themeStyles.sectionText} mb-2 uppercase`}>Executive Summary</h2>
            <p className="text-gray-700 text-xs leading-relaxed">{resumeData.personalInfo.summary}</p>
          </div>
        )}

        {/* Professional Experience */}
        {resumeData.experience.length > 0 && (
          <div>
            <h2 className={`text-base font-bold ${themeStyles.sectionText} mb-2 uppercase`}>Professional Experience</h2>
            <div className="space-y-2">
              {resumeData.experience.map((exp) => (
                <div key={exp.id} className="border-l-2 border-gray-300 pl-3">
                  <h3 className="font-bold text-gray-900 text-xs">{exp.position}</h3>
                  <p className="font-semibold text-gray-700 text-xs">{exp.company}</p>
                  {exp.description && (
                    <p className="text-gray-700 text-xs leading-relaxed mt-1">{exp.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {resumeData.education.length > 0 && (
          <div>
            <h2 className={`text-base font-bold ${themeStyles.sectionText} mb-2 uppercase`}>Education</h2>
            <div className="space-y-1">
              {resumeData.education.map((edu) => (
                <div key={edu.id}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-gray-900 text-xs">{edu.degree}</h3>
                      <p className="text-gray-700 text-xs">{edu.institution}</p>
                      {edu.field && <p className="text-gray-600 text-xs italic">{edu.field}</p>}
                    </div>
                    <div className="text-right text-xs text-gray-600">
                      {edu.startDate && edu.endDate && <p>{edu.startDate} - {edu.endDate}</p>}
                      {edu.gpa && <p>CGPA: {edu.gpa}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Core Competencies */}
        {resumeData.skills.length > 0 && (
          <div>
            <h2 className={`text-base font-bold ${themeStyles.sectionText} mb-2 uppercase`}>Core Competencies</h2>
            <div className="grid grid-cols-2 gap-1">
              {resumeData.skills.map((skill) => (
                <div key={skill} className="text-xs text-gray-700">• {skill}</div>
              ))}
            </div>
          </div>
        )}

        {/* Projects */}
        {resumeData.projects.length > 0 && (
          <div>
            <h2 className={`text-base font-bold ${themeStyles.sectionText} mb-2 uppercase`}>Projects</h2>
            <div className="space-y-2">
              {resumeData.projects.map((project) => (
                <div key={project.id} className="border-l-2 border-gray-300 pl-3">
                  <h3 className="font-bold text-gray-900 text-xs">{project.name}</h3>
                  {project.techStack.length > 0 && (
                    <div className="flex flex-wrap gap-1 my-1">
                      {project.techStack.map((tech) => (
                        <span key={tech} className="px-1 py-0.5 bg-gray-100 text-gray-700 rounded text-xs border">
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                  {project.description && (
                    <p className="text-gray-700 text-xs leading-relaxed">{project.description}</p>
                  )}
                  {(project.startDate || project.endDate) && (
                    <p className="text-xs text-gray-600 mt-1">
                      {project.startDate} - {project.endDate}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Professional Certifications */}
        {resumeData.certifications.length > 0 && (
          <div>
            <h2 className={`text-base font-bold ${themeStyles.sectionText} mb-2 uppercase`}>Professional Certifications</h2>
            <div className="space-y-1">
              {resumeData.certifications.map((cert) => (
                <div key={cert.id}>
                  <h3 className="font-bold text-gray-900 text-xs">{cert.name}</h3>
                  <p className="text-gray-700 text-xs">{cert.issuer}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Languages */}
        {resumeData.languages.length > 0 && (
          <div>
            <h2 className={`text-base font-bold ${themeStyles.sectionText} mb-2 uppercase`}>Languages</h2>
            <div className="grid grid-cols-2 gap-1">
              {resumeData.languages.map((lang) => (
                <div key={lang.id} className="text-xs text-gray-700">• {lang.name}</div>
              ))}
            </div>
          </div>
        )}

        {/* Additional Sections */}
        {resumeData.customSections.map((section) => (
          section.title && (
            <div key={section.id}>
              <h2 className={`text-base font-bold ${themeStyles.sectionText} mb-2 uppercase`}>{section.title}</h2>
              {section.description && (
                <p className="text-gray-700 text-xs leading-relaxed">{section.description}</p>
              )}
            </div>
          )
        ))}
      </div>
    </div>
  );

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Photo upload and crop functions
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Image size should be less than 5MB');
        return;
      }
      
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setImageToCrop(reader.result?.toString() || '');
        setShowCropDialog(true);
      });
      reader.readAsDataURL(file);
    }
  };

  const onImageLoad = useCallback(() => {
    setCrop({
      unit: '%',
      width: 90,
      height: 90,
      x: 5,
      y: 5,
    });
  }, []);

  const getCroppedImg = useCallback(
    (image: HTMLImageElement, crop: PixelCrop): Promise<string> => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('No 2d context');
      }

      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;

      canvas.width = crop.width;
      canvas.height = crop.height;

      ctx.drawImage(
        image,
        crop.x * scaleX,
        crop.y * scaleY,
        crop.width * scaleX,
        crop.height * scaleY,
        0,
        0,
        crop.width,
        crop.height
      );

      return new Promise((resolve) => {
        canvas.toBlob((blob) => {
          if (!blob) {
            throw new Error('Canvas is empty');
          }
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        }, 'image/jpeg', 0.95);
      });
    },
    []
  );

  const handleCropComplete = async () => {
    if (completedCrop && imgRef.current) {
      try {
        const croppedImage = await getCroppedImg(imgRef.current, completedCrop);
        updateResumeData('personalInfo', {
          ...resumeData.personalInfo,
          photo: croppedImage
        });
        setShowCropDialog(false);
        setImageToCrop('');
        toast.success('Photo uploaded successfully!');
      } catch (error) {
        console.error('Error cropping image:', error);
        toast.error('Failed to crop image');
      }
    }
  };

  const removePhoto = () => {
    updateResumeData('personalInfo', {
      ...resumeData.personalInfo,
      photo: undefined
    });
    toast.success('Photo removed');
  };

  const updateResumeData = (section: string, data: unknown) => {
    setResumeData(prev => ({
      ...prev,
      [section]: data
    }));
  };

  const addExperience = () => {
    if (resumeData.experience.length >= 4) return; // Max 4 experiences
    const newExp: Experience = {
      id: Date.now().toString(),
      company: '',
      position: '',
      description: ''
    };
    updateResumeData('experience', [...resumeData.experience, newExp]);
  };

  const updateExperience = (id: string, field: string, value: unknown) => {
    const updated = resumeData.experience.map(exp => 
      exp.id === id ? { ...exp, [field]: value } : exp
    );
    updateResumeData('experience', updated);
  };

  const removeExperience = (id: string) => {
    const filtered = resumeData.experience.filter(exp => exp.id !== id);
    updateResumeData('experience', filtered);
  };

  const addEducation = () => {
    if (resumeData.education.length >= 3) return; // Max 3 education entries
    const newEdu: Education = {
      id: Date.now().toString(),
      institution: '',
      degree: '',
      field: '',
      startDate: '',
      endDate: '',
      gpa: ''
    };
    updateResumeData('education', [...resumeData.education, newEdu]);
  };

  const updateEducation = (id: string, field: string, value: unknown) => {
    const updated = resumeData.education.map(edu => 
      edu.id === id ? { ...edu, [field]: value } : edu
    );
    updateResumeData('education', updated);
  };

  const removeEducation = (id: string) => {
    const filtered = resumeData.education.filter(edu => edu.id !== id);
    updateResumeData('education', filtered);
  };

  const addProject = () => {
    if (resumeData.projects.length >= 4) return; // Max 4 projects
    const newProject: Project = {
      id: Date.now().toString(),
      name: '',
      description: '',
      techStack: [],
      startDate: '',
      endDate: ''
    };
    updateResumeData('projects', [...resumeData.projects, newProject]);
  };

  const updateProject = (id: string, field: string, value: unknown) => {
    const updated = resumeData.projects.map(proj => 
      proj.id === id ? { ...proj, [field]: value } : proj
    );
    updateResumeData('projects', updated);
  };

  const removeProject = (id: string) => {
    const filtered = resumeData.projects.filter(proj => proj.id !== id);
    updateResumeData('projects', filtered);
  };

  const addCertification = () => {
    if (resumeData.certifications.length >= 5) return; // Max 5 certifications
    const newCert = {
      id: Date.now().toString(),
      name: '',
      issuer: ''
    };
    updateResumeData('certifications', [...resumeData.certifications, newCert]);
  };

  const updateCertification = (id: string, field: string, value: unknown) => {
    const updated = resumeData.certifications.map(cert => 
      cert.id === id ? { ...cert, [field]: value } : cert
    );
    updateResumeData('certifications', updated);
  };

  const removeCertification = (id: string) => {
    const filtered = resumeData.certifications.filter(cert => cert.id !== id);
    updateResumeData('certifications', filtered);
  };

  const addLanguage = () => {
    const newLang = {
      id: Date.now().toString(),
      name: ''
    };
    updateResumeData('languages', [...resumeData.languages, newLang]);
  };

  const updateLanguage = (id: string, field: string, value: unknown) => {
    const updated = resumeData.languages.map(lang => 
      lang.id === id ? { ...lang, [field]: value } : lang
    );
    updateResumeData('languages', updated);
  };

  const removeLanguage = (id: string) => {
    const filtered = resumeData.languages.filter(lang => lang.id !== id);
    updateResumeData('languages', filtered);
  };

  const addCustomSection = () => {
    if (resumeData.customSections.length >= 2) return; // Max 2 custom sections
    const newSection = {
      id: Date.now().toString(),
      title: '',
      description: ''
    };
    updateResumeData('customSections', [...resumeData.customSections, newSection]);
  };

  const updateCustomSection = (id: string, field: string, value: unknown) => {
    const updated = resumeData.customSections.map(section => 
      section.id === id ? { ...section, [field]: value } : section
    );
    updateResumeData('customSections', updated);
  };

  const removeCustomSection = (id: string) => {
    const filtered = resumeData.customSections.filter(section => section.id !== id);
    updateResumeData('customSections', filtered);
  };

  const addSkill = (skill: string) => {
    if (skill.trim() && !resumeData.skills.includes(skill.trim())) {
      updateResumeData('skills', [...resumeData.skills, skill.trim()]);
    }
  };

  const removeSkill = (skill: string) => {
    const filtered = resumeData.skills.filter(s => s !== skill);
    updateResumeData('skills', filtered);
  };

  const saveResume = async () => {
    if (!user) return;
    
    setSaving(true);
    try {
      // Prepare resume data for saving
      const resumeDataToSave = {
        user_id: user.id,
        title: resumeData.title,
        template_id: selectedTemplate,
        theme_id: selectedTheme,
        is_public: resumeData.isPublic,
        personal_info: resumeData.personalInfo,
        experience: resumeData.experience,
        education: resumeData.education,
        skills: resumeData.skills,
        projects: resumeData.projects,
        certifications: resumeData.certifications,
        languages: resumeData.languages,
        custom_sections: resumeData.customSections
      };

      await resumeService.createResume(resumeDataToSave);

      toast.success('Resume saved successfully!');
      router.push(`/dashboard`);
    } catch (error) {
      console.error('Error saving resume:', error);
      toast.error('Failed to save resume. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-6 py-8">
        <div className="mb-6">
          {/* Header Title */}
          <div className="text-center mb-4">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-1">
              Create Resume
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
              Build your professional resume with real-time preview and modern design
            </p>
          </div>
          
          {/* Controls Row */}
          <div className="flex items-center justify-between">
            {/* Theme and Template Controls */}
            <div className="flex gap-3 items-center">
              <div className="flex flex-col gap-1">
                <Label className="text-xs font-medium">Theme</Label>
                <Select value={selectedTheme} onValueChange={setSelectedTheme}>
                  <SelectTrigger className="w-28 h-8">
                    <SelectValue placeholder="Theme" />
                  </SelectTrigger>
                  <SelectContent>
                    {themes.map((theme) => (
                      <SelectItem key={theme.id} value={theme.id}>
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${theme.colors}`}></div>
                          {theme.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex flex-col gap-1">
                <Label className="text-xs font-medium">Template</Label>
                <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                  <SelectTrigger className="w-32 h-8">
                    <SelectValue placeholder="Template" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <FileText className="w-3 h-3" />
                            {template.name}
                            {template.hasPhoto && <span className="text-xs bg-blue-100 text-blue-600 px-1 rounded">📸</span>}
                          </div>
                          <span className="text-xs text-gray-500">{template.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Save Resume Button */}
            <div className="flex gap-3 items-center">
              <Button onClick={saveResume} disabled={saving} size="sm" className="px-4">
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Save Resume'}
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Editor Section */}
          <div className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="personal">Personal</TabsTrigger>
                <TabsTrigger value="experience">Experience</TabsTrigger>
                <TabsTrigger value="education">Education</TabsTrigger>
                <TabsTrigger value="skills">Skills</TabsTrigger>
                <TabsTrigger value="projects">Projects</TabsTrigger>
                <TabsTrigger value="other">Other</TabsTrigger>
              </TabsList>

              <TabsContent value="personal">
                <Card>
                  <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Resume Title */}
                    <div>
                      <Label htmlFor="title">Resume Title</Label>
                      <Input
                        id="title"
                        value={resumeData.title}
                        onChange={(e) => {
                          const title = e.target.value;
                          updateResumeData('title', title);
                        }}
                        placeholder="e.g., Software Engineer Resume"
                      />
                    </div>

                    {/* Photo Upload Section */}
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-3">
                      <div className="text-center">
                        <Label className="text-sm font-medium mb-3 block">Profile Photo</Label>
                        {resumeData.personalInfo.photo ? (
                          <div className="space-y-3">
                            <div className="flex justify-center">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img 
                                src={resumeData.personalInfo.photo} 
                                alt="Profile" 
                                className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
                              />
                            </div>
                            <div className="flex gap-2 justify-center">
                              <Button variant="outline" size="sm" onClick={() => document.getElementById('photo-upload')?.click()}>
                                <Upload className="w-3 h-3 mr-1" />
                                Change
                              </Button>
                              <Button variant="destructive" size="sm" onClick={removePhoto}>
                                <Trash2 className="w-3 h-3 mr-1" />
                                Remove
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <div className="flex justify-center">
                              <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center border-2 border-gray-200">
                                <Upload className="w-6 h-6 text-gray-400" />
                              </div>
                            </div>
                            <Button variant="outline" size="sm" onClick={() => document.getElementById('photo-upload')?.click()}>
                              <Upload className="w-3 h-3 mr-1" />
                              Upload Photo
                            </Button>
                            <p className="text-xs text-gray-500">JPG, PNG up to 5MB</p>
                          </div>
                        )}
                        <input
                          id="photo-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          value={resumeData.personalInfo.firstName}
                          onChange={(e) => updateResumeData('personalInfo', {
                            ...resumeData.personalInfo,
                            firstName: e.target.value
                          })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          value={resumeData.personalInfo.lastName}
                          onChange={(e) => updateResumeData('personalInfo', {
                            ...resumeData.personalInfo,
                            lastName: e.target.value
                          })}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={resumeData.personalInfo.email}
                        onChange={(e) => updateResumeData('personalInfo', {
                          ...resumeData.personalInfo,
                          email: e.target.value
                        })}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          value={resumeData.personalInfo.phone}
                          onChange={(e) => updateResumeData('personalInfo', {
                            ...resumeData.personalInfo,
                            phone: e.target.value
                          })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="location">Location</Label>
                        <Input
                          id="location"
                          value={resumeData.personalInfo.location}
                          onChange={(e) => updateResumeData('personalInfo', {
                            ...resumeData.personalInfo,
                            location: e.target.value
                          })}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
                        <Input
                          id="linkedinUrl"
                          value={resumeData.personalInfo.linkedinUrl}
                          onChange={(e) => updateResumeData('personalInfo', {
                            ...resumeData.personalInfo,
                            linkedinUrl: e.target.value
                          })}
                          placeholder="https://linkedin.com/in/yourprofile"
                        />
                      </div>
                      <div>
                        <Label htmlFor="githubUrl">GitHub URL</Label>
                        <Input
                          id="githubUrl"
                          value={resumeData.personalInfo.githubUrl}
                          onChange={(e) => updateResumeData('personalInfo', {
                            ...resumeData.personalInfo,
                            githubUrl: e.target.value
                          })}
                          placeholder="https://github.com/yourusername"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="summary">Professional Summary</Label>
                      <Textarea
                        id="summary"
                        rows={4}
                        value={resumeData.personalInfo.summary}
                        onChange={(e) => {
                          const text = e.target.value;
                          const wordCount = text.trim().split(/\s+/).filter(word => word.length > 0).length;
                          if (wordCount <= 150 || text === '') {
                            updateResumeData('personalInfo', {
                              ...resumeData.personalInfo,
                              summary: text
                            });
                          }
                        }}
                        placeholder="Write a brief professional summary... (150 words max)"
                      />
                      <div className="text-right text-xs text-gray-500 mt-1">
                        {resumeData.personalInfo.summary.trim().split(/\s+/).filter(word => word.length > 0).length}/150 words
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="experience">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      Work Experience
                      <Button 
                        onClick={addExperience} 
                        size="sm"
                        disabled={resumeData.experience.length >= 4}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Experience ({resumeData.experience.length}/4)
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {resumeData.experience.map((exp, index) => (
                      <div key={exp.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-medium">Experience {index + 1}</h4>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => removeExperience(exp.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <Label>Company</Label>
                            <Input
                              value={exp.company}
                              onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                            />
                          </div>
                          <div>
                            <Label>Position</Label>
                            <Input
                              value={exp.position}
                              onChange={(e) => updateExperience(exp.id, 'position', e.target.value)}
                            />
                          </div>
                        </div>
                        <div>
                          <Label>Description</Label>
                          <Textarea
                            rows={3}
                            value={exp.description}
                            onChange={(e) => updateExperience(exp.id, 'description', e.target.value)}
                            placeholder="Describe your responsibilities and achievements..."
                          />
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="education">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      Education
                      <Button 
                        onClick={addEducation} 
                        size="sm"
                        disabled={resumeData.education.length >= 3}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Education ({resumeData.education.length}/3)
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {resumeData.education.map((edu, index) => (
                      <div key={edu.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-medium">Education {index + 1}</h4>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => removeEducation(edu.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <Label>Institution</Label>
                            <Input
                              value={edu.institution}
                              onChange={(e) => updateEducation(edu.id, 'institution', e.target.value)}
                            />
                          </div>
                          <div>
                            <Label>Degree</Label>
                            <Input
                              value={edu.degree}
                              onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 mb-4">
                          <div>
                            <Label>Field of Study</Label>
                            <Input
                              value={edu.field}
                              onChange={(e) => updateEducation(edu.id, 'field', e.target.value)}
                            />
                          </div>
                          <div>
                            <Label>Start Date</Label>
                            <Input
                              type="month"
                              value={edu.startDate}
                              onChange={(e) => updateEducation(edu.id, 'startDate', e.target.value)}
                            />
                          </div>
                          <div>
                            <Label>End Date</Label>
                            <Input
                              type="month"
                              value={edu.endDate}
                              onChange={(e) => updateEducation(edu.id, 'endDate', e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="mb-4">
                          <Label>CGPA</Label>
                          <Input
                            value={edu.gpa}
                            onChange={(e) => updateEducation(edu.id, 'gpa', e.target.value)}
                            placeholder="9.2/10.0"
                            required
                          />
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="skills">
                <Card>
                  <CardHeader>
                    <CardTitle>Skills</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <Label>Add Skill</Label>
                        <div className="flex gap-2">
                          <Input
                            placeholder="e.g., JavaScript, React, Node.js"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                addSkill(e.currentTarget.value);
                                e.currentTarget.value = '';
                              }
                            }}
                          />
                          <Button
                            onClick={(e) => {
                              const input = e.currentTarget.parentElement?.querySelector('input');
                              if (input) {
                                addSkill(input.value);
                                input.value = '';
                              }
                            }}
                          >
                            Add
                          </Button>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {resumeData.skills.map((skill) => (
                          <Badge key={skill} variant="secondary" className="flex items-center gap-2">
                            {skill}
                            <button
                              onClick={() => removeSkill(skill)}
                              className="text-red-500 hover:text-red-700"
                            >
                              ×
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="projects">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      Projects
                      <Button 
                        onClick={addProject} 
                        size="sm"
                        disabled={resumeData.projects.length >= 4}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Project ({resumeData.projects.length}/4)
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {resumeData.projects.map((project, index) => (
                      <div key={project.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-medium">Project {index + 1}</h4>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => removeProject(project.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <Label>Project Name</Label>
                            <Input
                              value={project.name}
                              onChange={(e) => updateProject(project.id, 'name', e.target.value)}
                            />
                          </div>
                          <div>
                            <Label>Tech Stack</Label>
                            <Input
                              value={project.techStack.join(', ')}
                              onChange={(e) => updateProject(project.id, 'techStack', 
                                e.target.value.split(',').map(t => t.trim()).filter(t => t)
                              )}
                              placeholder="React, Node.js, MongoDB"
                            />
                          </div>
                        </div>
                        <div>
                          <Label>Description</Label>
                          <Textarea
                            rows={3}
                            value={project.description}
                            onChange={(e) => updateProject(project.id, 'description', e.target.value)}
                            placeholder="Describe the project, your role, and key achievements..."
                          />
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="other">
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        Certifications
                        <Button 
                          onClick={addCertification} 
                          size="sm"
                          disabled={resumeData.certifications.length >= 5}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Certification ({resumeData.certifications.length}/5)
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {resumeData.certifications.map((cert, index) => (
                        <div key={cert.id} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="font-medium">Certification {index + 1}</h4>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => removeCertification(cert.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Certification Name</Label>
                              <Input
                                value={cert.name}
                                onChange={(e) => updateCertification(cert.id, 'name', e.target.value)}
                                placeholder="e.g., AWS Certified Solutions Architect"
                              />
                            </div>
                            <div>
                              <Label>Issuing Organization</Label>
                              <Input
                                value={cert.issuer}
                                onChange={(e) => updateCertification(cert.id, 'issuer', e.target.value)}
                                placeholder="e.g., Amazon Web Services"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        Languages
                        <Button onClick={addLanguage} size="sm">
                          <Plus className="w-4 h-4 mr-2" />
                          Add Language
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {resumeData.languages.map((lang, index) => (
                        <div key={lang.id} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="font-medium">Language {index + 1}</h4>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => removeLanguage(lang.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                          <div>
                            <div>
                              <Label>Language</Label>
                              <Input
                                value={lang.name}
                                onChange={(e) => updateLanguage(lang.id, 'name', e.target.value)}
                                placeholder="e.g., English, Spanish, French"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        Custom Sections
                        <Button 
                          onClick={addCustomSection} 
                          size="sm"
                          disabled={resumeData.customSections.length >= 2}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Section ({resumeData.customSections.length}/2)
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {resumeData.customSections.map((section, index) => (
                        <div key={section.id} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="font-medium">Custom Section {index + 1}</h4>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => removeCustomSection(section.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="space-y-4">
                            <div>
                              <Label>Section Title</Label>
                              <Input
                                value={section.title}
                                onChange={(e) => updateCustomSection(section.id, 'title', e.target.value)}
                                placeholder="e.g., Awards, Volunteer Experience, Publications"
                              />
                            </div>
                            <div>
                              <Label>Description</Label>
                              <Textarea
                                rows={4}
                                value={section.description}
                                onChange={(e) => updateCustomSection(section.id, 'description', e.target.value)}
                                placeholder="Describe your achievements, activities, or relevant information..."
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Live Preview Section */}
          <div className="lg:sticky lg:top-8">
            <Card className="h-fit max-h-[90vh] overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Eye className="w-4 h-4" />
                  Live Preview
                </CardTitle>
              </CardHeader>
              <CardContent className="p-1 overflow-auto max-h-[85vh]">
                <div className="w-full -mt-2 flex justify-center">
                  <div className="w-[85%] max-w-[600px]">
                    {renderResumePreview()}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Image Crop Dialog */}
      <Dialog open={showCropDialog} onOpenChange={setShowCropDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Crop Your Photo</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {imageToCrop && (
              <div className="flex justify-center">
                <ReactCrop
                  crop={crop}
                  onChange={(_, percentCrop) => setCrop(percentCrop)}
                  onComplete={(c) => setCompletedCrop(c)}
                  aspect={1}
                  circularCrop
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    ref={imgRef}
                    src={imageToCrop}
                    alt="Crop preview"
                    style={{ maxHeight: '400px', maxWidth: '100%' }}
                    onLoad={onImageLoad}
                  />
                </ReactCrop>
              </div>
            )}
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowCropDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCropComplete} disabled={!completedCrop}>
                <Upload className="w-4 h-4 mr-2" />
                Apply Crop
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
