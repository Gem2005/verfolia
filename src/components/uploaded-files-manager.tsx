'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { FileText, Trash2, Calendar, FileCheck, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface UploadedFile {
  id: string;
  original_filename: string;
  file_size_bytes: number;
  mime_type: string;
  is_used: boolean;
  associated_resume_id: string | null;
  uploaded_at: string;
  parsed_data: Record<string, unknown> | null;
}

interface FileStats {
  total: number;
  used: number;
  unused: number;
  totalSize: number;
}

export function UploadedFilesManager() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [stats, setStats] = useState<FileStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<{ id: string; filename: string } | null>(null);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/uploaded-files');
      
      if (!response.ok) {
        throw new Error('Failed to fetch files');
      }
      
      const data = await response.json();
      setFiles(data.files || []);
      setStats(data.stats || null);
    } catch (error) {
      console.error('Error fetching files:', error);
      toast.error('Failed to load uploaded files');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openDeleteDialog = (fileId: string, filename: string) => {
    setFileToDelete({ id: fileId, filename });
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!fileToDelete) return;

    setDeletingIds((prev) => new Set(prev).add(fileToDelete.id));

    try {
      const response = await fetch(`/api/uploaded-files/${fileToDelete.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete file');
      }

      toast.success('File deleted successfully');

      // Remove from local state
      setFiles((prev) => prev.filter((f) => f.id !== fileToDelete.id));
      
      // Update stats
      if (stats) {
        setStats({
          ...stats,
          total: stats.total - 1,
          unused: stats.unused - 1,
        });
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete file');
    } finally {
      setDeletingIds((prev) => {
        const next = new Set(prev);
        next.delete(fileToDelete.id);
        return next;
      });
      setDeleteDialogOpen(false);
      setFileToDelete(null);
    }
  };

  const handleUseFile = async (file: UploadedFile) => {
    try {
      // Check if we have parsed data
      if (!file.parsed_data) {
        toast.error('This file has no parsed data. Please upload it again.');
        return;
      }

      // Create a unique key for sessionStorage
      const prefillKey = `resume_${Date.now()}`;
      
      // Transform snake_case keys to camelCase for create-resume page
      const parsedData = file.parsed_data as Record<string, unknown>;
      
      // Transform personalInfo: map snake_case to camelCase
      const personalInfoRaw = (parsedData.personal_info || {}) as Record<string, unknown>;
      const personalInfo = {
        firstName: personalInfoRaw.first_name || '',
        lastName: personalInfoRaw.last_name || '',
        email: personalInfoRaw.email || '',
        phone: personalInfoRaw.phone || '',
        location: personalInfoRaw.location || '',
        summary: parsedData.summary || '',
        title: personalInfoRaw.title || '',
        photo: personalInfoRaw.photo || '',
        linkedinUrl: personalInfoRaw.linkedin || '',
        githubUrl: personalInfoRaw.github || '',
      };
      
      // Transform projects: technologies -> techStack, url -> sourceUrl
      const projects = Array.isArray(parsedData.projects) 
        ? (parsedData.projects as Array<Record<string, unknown>>).map((proj, idx) => ({
            id: `project-${idx}`,
            name: proj.name || '',
            description: proj.description || '',
            techStack: Array.isArray(proj.technologies) ? proj.technologies : [],
            sourceUrl: proj.url || '',
            demoUrl: proj.demo_url || proj.demoUrl || '',
          }))
        : [];
      
      // Transform experience: add IDs and ensure all fields exist
      const experience = Array.isArray(parsedData.experience)
        ? (parsedData.experience as Array<Record<string, unknown>>).map((exp, idx) => ({
            id: `exp-${idx}`,
            position: exp.position || '',
            company: exp.company || '',
            location: exp.location || '',
            startDate: exp.start_date || exp.startDate || '',
            endDate: exp.end_date || exp.endDate || '',
            current: exp.current || false,
            description: exp.description || '',
          }))
        : [];
      
      // Transform education: add IDs and map fields
      const education = Array.isArray(parsedData.education)
        ? (parsedData.education as Array<Record<string, unknown>>).map((edu, idx) => ({
            id: `edu-${idx}`,
            degree: edu.degree || '',
            field: edu.field || '',
            institution: edu.institution || '',
            location: edu.location || '',
            startDate: edu.start_date || edu.startDate || '',
            endDate: edu.end_date || edu.endDate || '',
            gpa: edu.gpa || '',
          }))
        : [];
      
      // Transform certifications: add IDs
      const certifications = Array.isArray(parsedData.certifications)
        ? (parsedData.certifications as Array<Record<string, unknown>>).map((cert, idx) => ({
            id: `cert-${idx}`,
            name: cert.name || '',
            issuer: cert.issuer || '',
            date: cert.date || '',
            url: cert.url || '',
          }))
        : [];
      
      // Transform languages: add IDs
      const languages = Array.isArray(parsedData.languages)
        ? (parsedData.languages as Array<Record<string, unknown>>).map((lang, idx) => ({
            id: `lang-${idx}`,
            name: lang.name || lang.language || '',
            proficiency: lang.proficiency || '',
          }))
        : [];
      
      // Transform custom sections: add IDs and ensure items array exists
      const customSections = Array.isArray(parsedData.custom_sections)
        ? (parsedData.custom_sections as Array<Record<string, unknown>>).map((section, idx) => {
            // Check if section has items array structure or just content
            const items = Array.isArray(section.items)
              ? (section.items as Array<Record<string, unknown>>).map((item) => ({
                  title: item.title || '',
                  subtitle: item.subtitle || '',
                  description: item.description || '',
                  date: item.date || '',
                  location: item.location || '',
                  details: Array.isArray(item.details) ? item.details as string[] : [],
                }))
              : section.content // If no items array, create one item from content
              ? [{
                  title: '',
                  subtitle: '',
                  description: section.content as string || '',
                  date: '',
                  location: '',
                  details: [],
                }]
              : [];
            
            return {
              id: `custom-${idx}`,
              title: section.title || '',
              items,
            };
          })
        : [];
      
      const transformedData = {
        title: file.original_filename.replace(/\.[^/.]+$/, ''), // Remove extension
        personalInfo,
        summary: parsedData.summary || '',
        experience,
        education,
        skills: Array.isArray(parsedData.skills) ? parsedData.skills : [],
        projects,
        certifications,
        languages,
        customSections,
        uploadedFileId: file.id, // Store the file ID for tracking
        uploadedFile: {
          id: file.id,
          filePath: file.id, // The file ID can be used as path reference
          fileUrl: '', // Not stored in uploaded_resume_files table
          fileSize: file.file_size_bytes,
          originalFilename: file.original_filename,
        },
        mimeType: file.mime_type,
        originalFilename: file.original_filename,
      };
      
      sessionStorage.setItem(prefillKey, JSON.stringify(transformedData));
      
      toast.success('File selected! Redirecting to resume builder...');
      
      // Redirect to create-resume page with prefill parameter
      window.location.href = `/create-resume?prefill=${prefillKey}`;
    } catch (error) {
      console.error('Error using file:', error);
      toast.error('Failed to use this file. Please try again.');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatTotalSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    if (bytes < 1024 * 1024 * 1024)
      return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
  };

  if (loading) {
    return (
      <Card className="bg-background/80 backdrop-blur-sm border-border/50">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-foreground text-lg sm:text-xl mb-2">
                Your Uploaded Resumes
              </CardTitle>
              <CardDescription className="text-muted-foreground text-sm sm:text-base">
                Loading your files...
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-background/80 backdrop-blur-sm border-border/50">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div className="flex-1">
            <CardTitle className="text-foreground text-lg sm:text-xl mb-2">
              Your Uploaded Resumes
            </CardTitle>
            <CardDescription className="text-muted-foreground text-sm sm:text-base">
              {files.length === 0
                ? 'No uploaded files yet. Upload a resume to get started.'
                : stats
                ? `${stats.total} file${stats.total !== 1 ? 's' : ''} (${stats.used} used, ${stats.unused} available) • ${formatTotalSize(stats.totalSize)} total`
                : `${files.length} file${files.length !== 1 ? 's' : ''}`}
            </CardDescription>
          </div>
          {files.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={fetchFiles}
              disabled={loading}
              className="shrink-0"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {files.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Upload a resume to get started</p>
          </div>
        ) : (
          <div className="space-y-3">
            {files.map((file) => (
              <div
                key={file.id}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border rounded-lg hover:bg-accent transition-colors gap-3"
              >
                <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                  <FileText className="w-8 h-8 sm:w-10 sm:h-10 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate text-sm sm:text-base" title={file.original_filename}>
                      {file.original_filename}
                    </p>
                    <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground mt-1 flex-wrap">
                      <span>{formatFileSize(file.file_size_bytes)}</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDistanceToNow(new Date(file.uploaded_at), {
                          addSuffix: true,
                        })}
                      </span>
                      {file.is_used && (
                        <span className="flex items-center gap-1 text-green-600 font-medium">
                          <FileCheck className="w-3 h-3" />
                          <span className="hidden xs:inline">Used in resume</span>
                          <span className="xs:hidden">Used</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 sm:ml-4 w-full sm:w-auto">
                  {!file.is_used && (
                    <Button 
                      onClick={() => handleUseFile(file)} 
                      size="sm"
                      className="flex-1 sm:flex-initial"
                    >
                      Use This File
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openDeleteDialog(file.id, file.original_filename)}
                    disabled={file.is_used || deletingIds.has(file.id)}
                    title={
                      file.is_used
                        ? 'Cannot delete file used in resume. Delete the resume first.'
                        : 'Delete file'
                    }
                    className="flex-shrink-0"
                  >
                    {deletingIds.has(file.id) ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-white/95 dark:bg-[#2C3E50]/95 backdrop-blur-xl border-2 border-[#E74C3C]/30 dark:border-[#E74C3C]/50 shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold text-[#2C3E50] dark:text-[#ECF0F1] flex items-center gap-3">
              <div className="p-3 rounded-full bg-[#E74C3C]/10 dark:bg-[#E74C3C]/20">
                <Trash2 className="h-6 w-6 text-[#E74C3C]" />
              </div>
              Delete File
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base text-[#34495E] dark:text-[#ECF0F1]/80 leading-relaxed">
              Are you sure you want to delete &ldquo;{fileToDelete?.filename}&rdquo;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3 pt-6">
            <AlertDialogCancel className="rounded-xl border-2 border-[#ECF0F1]/70 dark:border-[#34495E]/50 bg-gradient-to-r from-[#ECF0F1]/50 to-[#34495E]/10 dark:from-[#34495E]/30 dark:to-[#2C3E50]/30 hover:from-[#ECF0F1]/70 hover:to-[#34495E]/20 dark:hover:from-[#34495E]/40 dark:hover:to-[#2C3E50]/40 text-[#2C3E50] dark:text-[#ECF0F1] font-semibold transition-all duration-300">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="rounded-xl bg-gradient-to-r from-[#E74C3C] to-[#C73A2B] hover:from-[#C73A2B] hover:to-[#A93226] text-white font-semibold shadow-lg shadow-[#E74C3C]/25 hover:shadow-xl hover:shadow-[#E74C3C]/30 transition-all duration-300"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete File
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
