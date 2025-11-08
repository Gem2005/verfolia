"use client";

import { useState, useEffect, useCallback } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { AnimatedBackground } from "@/components/layout/animated-background";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Plus,
  Edit,
  Trash2,
  Download,
  Share2,
  FileText,
  Globe,
  Lock,
  Upload,
  Eye,
  Clock,
  TrendingUp,
  BarChart3,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import {
  resumeService,
  type Resume as ResumeType,
} from "@/services/resume-service";
import { toast } from "sonner";
import { ResumeSuccessModal } from "@/components/modals/ResumeSuccessModal";

interface AnalyticsData {
  totalViews: number;
  avgViewDuration: number;
  mostViewedResume: {
    title: string;
    views: number;
    avgDuration: number;
  } | null;
}

export default function Dashboard() {
  const { user, loading: authLoading, checkAuth } = useAuth();
  const [resumes, setResumes] = useState<ResumeType[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [resumeToDelete, setResumeToDelete] = useState<string | null>(null);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    totalViews: 0,
    avgViewDuration: 0,
    mostViewedResume: null,
  });

  // Success modal state
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successSlug, setSuccessSlug] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);

  // Force auth check on mount (important after server-side redirect from login)
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const loadResumes = useCallback(async () => {
    if (!user) return;

    try {
      if (!initialLoadComplete) {
        setLoading(true);
      }

      const userResumes = await resumeService.getUserResumes(user.id);
      setResumes(userResumes);
      setInitialLoadComplete(true);
      
      // Load analytics data
      await loadAnalytics(userResumes);
    } catch (error) {
      console.error("Error loading resumes:", error);
      toast.error("Failed to load resumes");
      setResumes([]);
    } finally {
      setLoading(false);
    }
  }, [user, initialLoadComplete]);

  const loadAnalytics = async (userResumes: ResumeType[]) => {
    if (userResumes.length === 0) {
      setAnalyticsData({
        totalViews: 0,
        avgViewDuration: 0,
        mostViewedResume: null,
      });
      return;
    }

    try {
      // Fetch all analytics data in one request
      const response = await fetch('/api/analytics/dashboard');
      
      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }

      const data = await response.json();

      setAnalyticsData({
        totalViews: data.totalViews || 0,
        avgViewDuration: data.avgViewDuration || 0,
        mostViewedResume: data.mostViewedResume,
      });
    } catch (error) {
      console.error("Error loading analytics:", error);
      // Set default values on error
      setAnalyticsData({
        totalViews: 0,
        avgViewDuration: 0,
        mostViewedResume: null,
      });
    }
  };

  useEffect(() => {
    if (!authLoading && user && !initialLoadComplete) {
      loadResumes();
    }
  }, [authLoading, user, loadResumes, initialLoadComplete]);

  // Check for success message from create-resume page and show modal
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const success = params.get('success');
    const slug = params.get('slug');
    const isEdit = params.get('isEdit');
    
    if (success === 'true' && slug && user) {
      setSuccessSlug(slug);
      setIsEditMode(isEdit === 'true');
      setShowSuccessModal(true);
      
      // Clean up the URL
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
      
      // Reload resumes to show the updated data
      loadResumes();
    }
  }, [user, loadResumes]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatDuration = (seconds: number): string => {
    if (seconds === 0) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const openDeleteDialog = (id: string) => {
    setResumeToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteResume = async () => {
    if (!resumeToDelete) return;

    try {
      toast.loading("Deleting resume...");
      
      // Call the API endpoint to delete resume (which handles both DB and storage)
      const response = await fetch(`/api/resumes/${resumeToDelete}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.dismiss();
        toast.success("Resume and associated files deleted successfully");
        loadResumes();
      } else {
        const error = await response.json();
        toast.dismiss();
        toast.error(error.error || "Failed to delete resume");
      }
    } catch (error) {
      console.error("Error deleting resume:", error);
      toast.dismiss();
      toast.error("Failed to delete resume");
    } finally {
      setDeleteDialogOpen(false);
      setResumeToDelete(null);
    }
  };

  const handleToggleVisibility = async (id: string) => {
    try {
      const resume = resumes.find((r) => r.id === id);
      if (!resume) return;

      await resumeService.updateResume(id, {
        ...resume,
        is_public: !resume.is_public,
      });

      setResumes(
        resumes.map((resume) =>
          resume.id === id
            ? { ...resume, is_public: !resume.is_public }
            : resume
        )
      );

      toast.success(`Resume made ${!resume.is_public ? "public" : "private"}`);
    } catch (error) {
      console.error("Error updating resume visibility:", error);
      toast.error("Failed to update resume visibility");
    }
  };

  const handleDownloadResume = async (resumeId: string) => {
    try {
      toast.loading("Generating PDF...");
      
      const response = await fetch(`/api/resumes/${resumeId}/download`, {
        method: 'GET',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to download resume');
      }

      // Get the PDF blob
      const blob = await response.blob();
      
      // Get filename from Content-Disposition header
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = 'resume.pdf';
      
      if (contentDisposition) {
        // Extract filename from header - handle both quoted and unquoted filenames
        const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
        const matches = filenameRegex.exec(contentDisposition);
        if (matches != null && matches[1]) {
          filename = matches[1].replace(/['"]/g, '');
        }
      }
      
      // Ensure the filename ends with .pdf
      if (!filename.endsWith('.pdf')) {
        filename = filename.replace(/\.pdf_?$/i, '') + '.pdf';
      }
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.dismiss();
      toast.success("Resume downloaded successfully!");
    } catch (error) {
      console.error("Error downloading resume:", error);
      toast.dismiss();
      toast.error(error instanceof Error ? error.message : "Failed to download resume");
    }
  };

  const handleCopyShareLink = async (slug: string) => {
    const shareUrl = `${window.location.origin}/resume/${slug}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Share link copied to clipboard!");
    } catch (error) {
      console.error("Error copying link:", error);
      toast.error("Failed to copy link");
    }
  };

  if (loading) {
    return (
      <AppLayout>
          <div className="bg-background min-h-screen">
            <div className="container mx-auto px-4 py-8 mt-16">
              <div className="animate-pulse space-y-8">
                <div className="flex justify-between items-center">
                  <div className="space-y-2">
                    <div className="h-8 bg-muted rounded w-64"></div>
                    <div className="h-4 bg-muted rounded w-96"></div>
                  </div>
                  <div className="h-10 bg-muted rounded w-40"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-card p-6 rounded-lg">
                      <div className="space-y-3">
                        <div className="h-4 bg-muted rounded w-24"></div>
                        <div className="h-8 bg-muted rounded w-16"></div>
                        <div className="h-3 bg-muted rounded w-32"></div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="bg-card p-6 rounded-lg space-y-4">
                      <div className="space-y-2">
                        <div className="h-6 bg-muted rounded w-3/4"></div>
                        <div className="h-4 bg-muted rounded w-1/2"></div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-4 bg-muted rounded w-full"></div>
                        <div className="h-4 bg-muted rounded w-full"></div>
                      </div>
                      <div className="flex gap-2">
                        <div className="h-8 bg-muted rounded w-16"></div>
                        <div className="h-8 bg-muted rounded w-20"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
        <div className="relative min-h-screen bg-background">
          <AnimatedBackground />

          <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-16 sm:pb-24 z-20">
            {/* Enhanced Header */}
            <div className="mb-8 sm:mb-12">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#3498DB]/10 dark:bg-[#3498DB]/15 border border-[#3498DB]/30 dark:border-[#3498DB]/40 mb-2">
                    <div className="w-2 h-2 bg-[#3498DB] dark:bg-[#3498DB] rounded-full animate-pulse"></div>
                    <span className="text-xs font-medium text-[#2C3E50] dark:text-[#ECF0F1]">Welcome back!</span>
                  </div>
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold">
                    <span className="bg-gradient-to-r from-[#2C3E50] via-[#34495E] to-[#3498DB] dark:from-[#ECF0F1] dark:via-[#3498DB] dark:to-[#E74C3C] bg-clip-text text-transparent">
                      Resume Hub
                    </span>
                  </h1>
                  <p className="text-base sm:text-lg text-[#34495E] dark:text-[#ECF0F1]/80 max-w-2xl">
                    Your professional portfolio at a glance. Create, manage, and analyze your resumes with powerful insights.
                  </p>
                </div>
                
                <div className="flex flex-wrap gap-3">
                  <Button 
                    asChild 
                    size="lg" 
                    className="rounded-2xl bg-gradient-to-r from-[#2C3E50] to-[#3498DB] hover:from-[#34495E] hover:to-[#2C8BBD] text-white shadow-lg shadow-[#3498DB]/25 hover:shadow-xl hover:shadow-[#3498DB]/30 transition-all duration-300"
                  >
                    <Link href="/create-resume">
                      <Plus className="h-5 w-5 mr-2" />
                      Create New
                    </Link>
                  </Button>
                  
                  <Button 
                    asChild 
                    variant="outline" 
                    size="lg" 
                    className="rounded-2xl border-2 border-[#3498DB]/30 dark:border-[#3498DB]/50 bg-[#3498DB]/5 dark:bg-[#3498DB]/10 hover:bg-[#3498DB]/10 dark:hover:bg-[#3498DB]/20 text-[#2C3E50] dark:text-[#ECF0F1] shadow-sm hover:shadow-md transition-all duration-300"
                  >
                    <Link href="/upload-resume">
                      <Upload className="h-5 w-5 mr-2" />
                      Upload PDF
                    </Link>
                  </Button>
                </div>
              </div>
            </div>

            {/* Analytics Section */}
            <div className="mb-12">

              {/* Enhanced Stats Cards with Glassmorphism */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Total Resumes Card */}
                <Card className="relative overflow-hidden border-2 border-[#3498DB]/30 dark:border-[#3498DB]/50 bg-white dark:bg-[#2C3E50]/90 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-500 group hover:scale-[1.02]">
                <div className="absolute inset-0 bg-gradient-to-br from-[#3498DB]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <CardHeader className="relative pb-2">
                  <div className="flex items-center justify-between mb-3">
                    <CardTitle className="text-base font-bold text-[#2C3E50] dark:text-[#ECF0F1]">
                      Total Resumes
                    </CardTitle>
                    <div className="p-3 rounded-2xl bg-gradient-to-br from-[#2C3E50] to-[#3498DB] shadow-lg shadow-[#3498DB]/25 group-hover:shadow-xl group-hover:shadow-[#3498DB]/30 transition-all duration-300 group-hover:scale-110">
                      <FileText className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <div className="text-4xl font-bold bg-gradient-to-br from-[#2C3E50] to-[#3498DB] dark:from-[#3498DB] dark:to-[#E74C3C] bg-clip-text text-transparent">
                    {resumes.length}
                  </div>
                </CardHeader>
                <CardContent className="relative pt-0 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-[#3498DB]/10 dark:bg-[#3498DB]/20 border border-[#3498DB]/30 dark:border-[#3498DB]/50">
                      <Globe className="h-3.5 w-3.5 text-[#3498DB] dark:text-[#3498DB]" />
                      <span className="font-bold text-base text-[#2C3E50] dark:text-[#ECF0F1]">{resumes.filter((r) => r.is_public).length}</span>
                      <span className="text-xs text-[#34495E] dark:text-[#ECF0F1]/80">Public</span>
                    </div>
                    <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-[#34495E]/10 dark:bg-[#34495E]/20 border border-[#34495E]/30 dark:border-[#34495E]/50">
                      <Lock className="h-3.5 w-3.5 text-[#34495E] dark:text-[#ECF0F1]" />
                      <span className="font-bold text-base text-[#2C3E50] dark:text-[#ECF0F1]">{resumes.filter((r) => !r.is_public).length}</span>
                      <span className="text-xs text-[#34495E] dark:text-[#ECF0F1]/80">Private</span>
                    </div>
                  </div>
                  <div className="pt-2 px-3 py-2 rounded-xl bg-[#ECF0F1]/50 dark:bg-[#34495E]/20 border border-[#ECF0F1]/50 dark:border-[#34495E]/30">
                    <p className="text-xs text-[#34495E] dark:text-[#ECF0F1]/80 leading-relaxed">
                      {resumes.length === 0 
                        ? "Start building your professional portfolio"
                        : resumes.length === 1
                        ? "Great start! Create more resumes for different roles"
                        : `Managing ${resumes.length} professional resumes`
                      }
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Analytics Overview Card */}
              <Card className="relative overflow-hidden border-2 border-[#3498DB]/30 dark:border-[#3498DB]/50 bg-white dark:bg-[#2C3E50]/90 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-500 group hover:scale-[1.02]">
                <div className="absolute inset-0 bg-gradient-to-br from-[#3498DB]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <CardHeader className="relative pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-bold text-[#2C3E50] dark:text-[#ECF0F1]">
                      Analytics Overview
                    </CardTitle>
                    <div className="p-3 rounded-2xl bg-gradient-to-br from-[#3498DB] to-[#2C8BBD] shadow-lg shadow-[#3498DB]/25 group-hover:shadow-xl group-hover:shadow-[#3498DB]/30 transition-all duration-300 group-hover:scale-110">
                      <BarChart3 className="h-5 w-5 text-white" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="relative space-y-2 pt-0">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-[#3498DB]/10 dark:bg-[#3498DB]/20 border border-[#3498DB]/30 dark:border-[#3498DB]/50">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-[#3498DB]/20 dark:bg-[#3498DB]/30">
                        <Eye className="h-4 w-4 text-[#3498DB] dark:text-[#3498DB]" />
                      </div>
                      <span className="text-xs font-medium text-[#34495E] dark:text-[#ECF0F1]/80">Total Views</span>
                    </div>
                    <div className="text-2xl font-bold bg-gradient-to-br from-[#2C3E50] to-[#3498DB] dark:from-[#3498DB] dark:to-[#E74C3C] bg-clip-text text-transparent">
                      {analyticsData.totalViews.toLocaleString()}
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-[#34495E]/10 dark:bg-[#34495E]/20 border border-[#34495E]/30 dark:border-[#34495E]/50">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-[#34495E]/20 dark:bg-[#34495E]/30">
                        <Clock className="h-4 w-4 text-[#34495E] dark:text-[#ECF0F1]" />
                      </div>
                      <span className="text-xs font-medium text-[#34495E] dark:text-[#ECF0F1]/80">Avg Duration</span>
                    </div>
                    <div className="text-2xl font-bold bg-gradient-to-br from-[#E74C3C] to-[#3498DB] dark:from-[#E74C3C] dark:to-[#3498DB] bg-clip-text text-transparent">
                      {analyticsData.avgViewDuration > 0
                        ? formatDuration(analyticsData.avgViewDuration)
                        : "0:00"}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Top Performer Card */}
              <Card className="relative overflow-hidden border-2 border-[#3498DB]/30 dark:border-[#3498DB]/50 bg-white dark:bg-[#2C3E50]/90 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-500 group hover:scale-[1.02] sm:col-span-2 lg:col-span-1">
                <div className="absolute inset-0 bg-gradient-to-br from-[#3498DB]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <CardHeader className="relative pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-bold text-[#2C3E50] dark:text-[#ECF0F1]">
                      Top Performer
                    </CardTitle>
                    <div className="p-3 rounded-2xl bg-gradient-to-br from-[#2C3E50] to-[#3498DB] shadow-lg shadow-[#3498DB]/25 group-hover:shadow-xl group-hover:shadow-[#3498DB]/30 transition-all duration-300 group-hover:scale-110">
                      <TrendingUp className="h-5 w-5 text-white" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="relative pt-0">
                  {analyticsData.mostViewedResume ? (
                    <div className="space-y-2">
                      <div className="p-2.5 rounded-xl bg-[#ECF0F1]/50 dark:bg-[#34495E]/20 border border-[#ECF0F1]/50 dark:border-[#34495E]/30">
                        <p className="text-sm font-semibold text-[#2C3E50] dark:text-[#ECF0F1] truncate" title={analyticsData.mostViewedResume.title}>
                          {analyticsData.mostViewedResume.title}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="p-3 rounded-xl bg-[#3498DB]/10 dark:bg-[#3498DB]/20 border border-[#3498DB]/30 dark:border-[#3498DB]/50">
                          <div className="flex items-center gap-1.5 mb-1">
                            <Eye className="h-3.5 w-3.5 text-[#3498DB] dark:text-[#3498DB]" />
                            <span className="text-xs font-medium text-[#34495E] dark:text-[#ECF0F1]/80">Views</span>
                          </div>
                          <p className="text-2xl font-bold bg-gradient-to-br from-[#2C3E50] to-[#3498DB] dark:from-[#3498DB] dark:to-[#E74C3C] bg-clip-text text-transparent">
                            {analyticsData.mostViewedResume.views.toLocaleString()}
                          </p>
                        </div>
                        <div className="p-3 rounded-xl bg-[#34495E]/10 dark:bg-[#34495E]/20 border border-[#34495E]/30 dark:border-[#34495E]/50">
                          <div className="flex items-center gap-1.5 mb-1">
                            <Clock className="h-3.5 w-3.5 text-[#34495E] dark:text-[#ECF0F1]" />
                            <span className="text-xs font-medium text-[#34495E] dark:text-[#ECF0F1]/80">Avg Time</span>
                          </div>
                          <p className="text-2xl font-bold bg-gradient-to-br from-[#E74C3C] to-[#3498DB] dark:from-[#E74C3C] dark:to-[#3498DB] bg-clip-text text-transparent">
                            {formatDuration(analyticsData.mostViewedResume.avgDuration)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-24 text-center">
                      <div className="p-2.5 rounded-full bg-[#ECF0F1] dark:bg-[#34495E]/50">
                        <TrendingUp className="h-5 w-5 text-[#34495E]" />
                      </div>
                      <p className="text-xs font-medium text-[#34495E] dark:text-[#ECF0F1]/80">No analytics data yet</p>
                      <p className="text-xs text-[#34495E]/80 dark:text-[#ECF0F1]/60">Share your resume to start tracking</p>
                    </div>
                  )}
                </CardContent>
              </Card>
              </div>
            </div>

            {/* Resume Cards Section */}
            <div>
              <div className="mb-6">
                <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-[#2C3E50] via-[#34495E] to-[#3498DB] dark:from-[#ECF0F1] dark:via-[#3498DB] dark:to-[#E74C3C] bg-clip-text text-transparent mb-2">
                  Your Resumes
                </h2>
                <p className="text-sm sm:text-base text-[#34495E] dark:text-[#ECF0F1]/80">
                  Manage, edit, and share your professional resumes
                </p>
              </div>

            {/* Resume Grid */}
            {resumes.length === 0 ? (
              <Card className="relative overflow-hidden border-2 border-[#3498DB]/30 dark:border-[#3498DB]/50 bg-white dark:bg-[#2C3E50]/90 backdrop-blur-xl shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-[#3498DB]/5 to-transparent"></div>
                <CardContent className="relative py-20 px-6">
                  <div className="max-w-lg mx-auto text-center space-y-6">
                    <div className="relative inline-block">
                      <div className="absolute inset-0 bg-gradient-to-br from-[#2C3E50] to-[#3498DB] rounded-3xl blur-2xl opacity-20 animate-pulse"></div>
                      <div className="relative w-24 h-24 bg-gradient-to-br from-[#2C3E50] to-[#3498DB] rounded-3xl flex items-center justify-center mx-auto shadow-xl shadow-[#3498DB]/25">
                        <FileText className="h-12 w-12 text-white" />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <h3 className="text-3xl font-bold bg-gradient-to-r from-[#2C3E50] via-[#34495E] to-[#3498DB] dark:from-[#ECF0F1] dark:via-[#3498DB] dark:to-[#E74C3C] bg-clip-text text-transparent">
                        Start Your Journey
                      </h3>
                      <p className="text-lg text-[#34495E] dark:text-[#ECF0F1]/80">
                        Create your first professional resume and unlock powerful analytics to track your success
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                      <Button asChild size="lg" className="rounded-2xl bg-gradient-to-r from-[#2C3E50] to-[#3498DB] hover:from-[#34495E] hover:to-[#2C8BBD] text-white shadow-lg shadow-[#3498DB]/25 hover:shadow-xl hover:shadow-[#3498DB]/30 transition-all duration-300">
                        <Link href="/create-resume">
                          <Plus className="h-5 w-5 mr-2" />
                          Create Your First Resume
                        </Link>
                      </Button>
                      <Button asChild variant="outline" size="lg" className="rounded-2xl border-2 border-[#3498DB]/30 dark:border-[#3498DB]/50 bg-[#3498DB]/5 dark:bg-[#3498DB]/10 hover:bg-[#3498DB]/10 dark:hover:bg-[#3498DB]/20 text-[#2C3E50] dark:text-[#ECF0F1] shadow-sm hover:shadow-md transition-all duration-300">
                        <Link href="/upload-resume">
                          <Upload className="h-5 w-5 mr-2" />
                          Or Upload PDF
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {resumes.map((resume) => (
                  <Card
                    key={resume.id}
                    className="group relative overflow-hidden border-2 border-[#ECF0F1]/70 dark:border-[#34495E]/50 bg-white dark:bg-[#2C3E50]/90 backdrop-blur-xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] hover:border-[#3498DB]/50 dark:hover:border-[#3498DB]/50 max-w-full"
                  >
                    {/* Hover gradient overlay */}
                    <div className="absolute inset-0 bg-[#3498DB]/0 group-hover:bg-[#3498DB]/5 transition-all duration-500"></div>
                    
                    <CardHeader className="relative pb-4 overflow-hidden">
                      <div className="grid grid-cols-[1fr_auto] gap-3 mb-3">
                        <div className="min-w-0">
                          <h3 
                            className="text-xl font-bold text-[#2C3E50] dark:text-[#ECF0F1] group-hover:text-[#3498DB] dark:group-hover:text-[#3498DB] transition-colors mb-2 overflow-hidden text-ellipsis whitespace-nowrap" 
                            title={resume.title}
                          >
                            {resume.title}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-[#34495E] dark:text-[#ECF0F1]/80 flex-wrap">
                            <span className="px-2.5 py-1 rounded-lg bg-[#ECF0F1] dark:bg-[#34495E]/50 font-medium">
                              {resume.template_id.charAt(0).toUpperCase() + resume.template_id.slice(1)}
                            </span>
                            <span className="text-[#34495E]/60 dark:text-[#ECF0F1]/40">•</span>
                            <span className="px-2.5 py-1 rounded-lg bg-[#ECF0F1] dark:bg-[#34495E]/50 font-medium">
                              {resume.theme_id.charAt(0).toUpperCase() + resume.theme_id.slice(1)}
                            </span>
                          </div>
                        </div>
                        <Badge
                          variant={resume.is_public ? "default" : "secondary"}
                          className={`shrink-0 px-2.5 py-1 rounded-lg text-xs font-semibold shadow-sm whitespace-nowrap flex items-center ${
                            resume.is_public 
                              ? "bg-gradient-to-r from-[#2C3E50] to-[#3498DB] text-white border-0" 
                              : "bg-gradient-to-r from-[#ECF0F1] to-[#34495E]/20 dark:from-[#34495E]/50 dark:to-[#2C3E50]/50 text-[#2C3E50] dark:text-[#ECF0F1] border-[#ECF0F1] dark:border-[#34495E]/30"
                          }`}
                        >
                          {resume.is_public ? (
                            <>
                              <Globe className="h-3 w-3 mr-1" />
                              Public
                            </>
                          ) : (
                            <>
                              <Lock className="h-3 w-3 mr-1" />
                              Private
                            </>
                          )}
                        </Badge>
                      </div>

                      {/* Date Info */}
                      <div className="space-y-2 pt-3 border-t border-[#ECF0F1] dark:border-[#34495E]/50">
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-2 text-[#34495E] dark:text-[#ECF0F1]/80">
                            <div className="p-1.5 rounded-lg bg-[#3498DB]/20 dark:bg-[#3498DB]/30">
                              <Plus className="h-3.5 w-3.5 text-[#3498DB] dark:text-[#3498DB]" />
                            </div>
                            Created
                          </span>
                          <span className="font-semibold text-[#2C3E50] dark:text-[#ECF0F1]">{formatDate(resume.created_at)}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-2 text-[#34495E] dark:text-[#ECF0F1]/80">
                            <div className="p-1.5 rounded-lg bg-[#E74C3C]/20 dark:bg-[#E74C3C]/30">
                              <Edit className="h-3.5 w-3.5 text-[#E74C3C] dark:text-[#E74C3C]" />
                            </div>
                            Updated
                          </span>
                          <span className="font-semibold text-[#2C3E50] dark:text-[#ECF0F1]">{formatDate(resume.updated_at)}</span>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="relative pt-0 space-y-4">
                      {/* Primary Actions */}
                      <div className="grid grid-cols-2 gap-2.5">
                        <Button 
                          asChild 
                          size="default" 
                          className="rounded-xl bg-gradient-to-r from-[#2C3E50] to-[#3498DB] hover:from-[#34495E] hover:to-[#2C8BBD] text-white shadow-md shadow-[#3498DB]/20 hover:shadow-lg hover:shadow-[#3498DB]/25 transition-all duration-300 font-semibold"
                        >
                          <Link href={`/create-resume?edit=${resume.id}`}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Link>
                        </Button>

                        <Button 
                          asChild 
                          size="default" 
                          className="rounded-xl bg-gradient-to-r from-[#3498DB] to-[#2C8BBD] hover:from-[#2C8BBD] hover:to-[#3498DB] text-white shadow-md shadow-[#3498DB]/20 hover:shadow-lg hover:shadow-[#3498DB]/25 transition-all duration-300 font-semibold"
                        >
                          <Link href={`/analytics?resumeId=${resume.id}`}>
                            <BarChart3 className="h-4 w-4 mr-2" />
                            Analytics
                          </Link>
                        </Button>
                      </div>

                      {/* Secondary Actions */}
                      <div className="grid grid-cols-2 gap-2.5">
                        <Button 
                          asChild 
                          variant="outline" 
                          size="default" 
                          className="rounded-xl border-2 border-[#3498DB]/30 dark:border-[#3498DB]/50 bg-[#3498DB]/5 dark:bg-[#3498DB]/10 hover:bg-[#3498DB]/10 dark:hover:bg-[#3498DB]/20 text-[#2C3E50] dark:text-[#ECF0F1] shadow-sm hover:shadow-md transition-all duration-300 font-semibold"
                        >
                          <Link href={`/resume/${resume.slug}`} target="_blank">
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Link>
                        </Button>

                        <Button
                          size="default"
                          variant="outline"
                          onClick={() => handleToggleVisibility(resume.id)}
                          className={`rounded-xl border-2 shadow-sm hover:shadow-md transition-all duration-300 font-semibold ${
                            resume.is_public 
                              ? "border-[#34495E]/30 dark:border-[#34495E]/50 bg-[#34495E]/5 dark:bg-[#34495E]/10 hover:bg-[#34495E]/10 dark:hover:bg-[#34495E]/20 text-[#2C3E50] dark:text-[#ECF0F1]"
                              : "border-[#3498DB]/30 dark:border-[#3498DB]/50 bg-[#3498DB]/5 dark:bg-[#3498DB]/10 hover:bg-[#3498DB]/10 dark:hover:bg-[#3498DB]/20 text-[#2C3E50] dark:text-[#ECF0F1]"
                          }`}
                        >
                          {resume.is_public ? (
                            <>
                              <Lock className="h-4 w-4 mr-2" />
                              Make Private
                            </>
                          ) : (
                            <>
                              <Globe className="h-4 w-4 mr-2" />
                              Make Public
                            </>
                          )}
                        </Button>
                      </div>

                      {/* Utility Actions */}
                      <div className="flex items-center justify-between pt-3 border-t border-[#ECF0F1] dark:border-[#34495E]/50">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDownloadResume(resume.id)}
                          className="text-[#34495E] dark:text-[#ECF0F1]/80 hover:text-[#3498DB] dark:hover:text-[#3498DB] hover:bg-[#3498DB]/10 dark:hover:bg-[#3498DB]/20 rounded-xl font-semibold transition-all duration-300"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>

                        {resume.is_public && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleCopyShareLink(resume.slug)}
                            className="text-[#34495E] dark:text-[#ECF0F1]/80 hover:text-[#3498DB] dark:hover:text-[#3498DB] hover:bg-[#3498DB]/10 dark:hover:bg-[#3498DB]/20 rounded-xl font-semibold transition-all duration-300"
                          >
                            <Share2 className="h-4 w-4 mr-2" />
                            Share Link
                          </Button>
                        )}

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openDeleteDialog(resume.id)}
                          className="text-[#34495E]/80 dark:text-[#ECF0F1]/70 hover:text-[#E74C3C] dark:hover:text-[#E74C3C] hover:bg-[#E74C3C]/10 dark:hover:bg-[#E74C3C]/20 rounded-xl font-semibold transition-all duration-300"
                        >
                          <Trash2 className="h-4 w-4 mr-1.5" />
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
            </div>
          </div>
        </div>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent className="bg-white/95 dark:bg-[#2C3E50]/95 backdrop-blur-xl border-2 border-[#E74C3C]/30 dark:border-[#E74C3C]/50 shadow-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-xl font-bold text-[#2C3E50] dark:text-[#ECF0F1] flex items-center gap-3">
                <div className="p-3 rounded-full bg-[#E74C3C]/10 dark:bg-[#E74C3C]/20">
                  <Trash2 className="h-6 w-6 text-[#E74C3C]" />
                </div>
                Delete Resume
              </AlertDialogTitle>
              <AlertDialogDescription className="text-base text-[#34495E] dark:text-[#ECF0F1]/80 leading-relaxed">
                Are you sure you want to delete this resume? This action cannot be undone and will also delete any uploaded files associated with this resume.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="gap-3 pt-6">
              <AlertDialogCancel className="rounded-xl border-2 border-[#34495E]/30 dark:border-[#34495E]/50 bg-[#ECF0F1]/50 dark:bg-[#34495E]/10 hover:bg-[#ECF0F1]/70 dark:hover:bg-[#34495E]/20 text-[#2C3E50] dark:text-[#ECF0F1] font-semibold transition-all duration-300">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDeleteResume}
                className="rounded-xl bg-gradient-to-r from-[#E74C3C] to-[#C73A2B] hover:from-[#C73A2B] hover:to-[#A93226] text-white font-semibold shadow-lg shadow-[#E74C3C]/25 hover:shadow-xl hover:shadow-[#E74C3C]/30 transition-all duration-300"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Resume
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Success Modal */}
        <ResumeSuccessModal
          isOpen={showSuccessModal}
          onClose={() => setShowSuccessModal(false)}
          resumeSlug={successSlug}
          isEditMode={isEditMode}
        />
    </AppLayout>
  );
}

