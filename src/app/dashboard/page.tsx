"use client";

import { useState, useEffect, useCallback } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Edit,
  Trash2,
  Download,
  Share2,
  Calendar,
  FileText,
  Globe,
  Lock,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import {
  resumeService,
  type Resume as ResumeType,
} from "@/services/resume-service";
import { toast } from "sonner";

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const [resumes, setResumes] = useState<ResumeType[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  const loadResumes = useCallback(async () => {
    if (!user) return;

    try {
      // Only show loading on first load
      if (!initialLoadComplete) {
        setLoading(true);
      }

      const userResumes = await resumeService.getUserResumes(user.id);
      setResumes(userResumes);
      setInitialLoadComplete(true);
    } catch (error) {
      console.error("Error loading resumes:", error);
      toast.error("Failed to load resumes");
      // For now, set empty array if service fails
      setResumes([]);
    } finally {
      setLoading(false);
    }
  }, [user, initialLoadComplete]);

  useEffect(() => {
    if (!authLoading && user && !initialLoadComplete) {
      loadResumes();
    }
  }, [authLoading, user, loadResumes, initialLoadComplete]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleDeleteResume = async (id: string) => {
    if (!confirm("Are you sure you want to delete this resume?")) {
      return;
    }

    try {
      await resumeService.deleteResume(id);
      toast.success("Resume deleted successfully");
      loadResumes(); // Reload the list
    } catch (error) {
      console.error("Error deleting resume:", error);
      toast.error("Failed to delete resume");
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

  if (loading) {
    return (
      <ProtectedRoute>
        <AppLayout>
          <div className="container mx-auto px-4 py-8 mt-16">
            <div className="animate-pulse space-y-8">
              {/* Header Skeleton */}
              <div className="flex justify-between items-center">
                <div className="space-y-2">
                  <div className="h-8 bg-muted rounded w-64"></div>
                  <div className="h-4 bg-muted rounded w-96"></div>
                </div>
                <div className="h-10 bg-muted rounded w-40"></div>
              </div>

              {/* Stats Cards Skeleton */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-6 rounded-lg">
                    <div className="space-y-3">
                      <div className="h-4 bg-muted rounded w-24"></div>
                      <div className="h-8 bg-muted rounded w-16"></div>
                      <div className="h-3 bg-muted rounded w-32"></div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Resume Cards Skeleton */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="p-6 rounded-lg space-y-4">
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
        </AppLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <AppLayout>
        <div className="container mx-auto px-8 pt-28 pb-32">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-foreground">
                Resume Dashboard
              </h1>
              <p className="text-muted-foreground">
                Manage and organize all your resumes in one place
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={loadResumes}
                disabled={loading}
                className="shadow-sm"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg
                      className="animate-spin h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Refreshing...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                    Refresh
                  </span>
                )}
              </Button>
           <Button asChild className="flex items-center gap-2 shadow-sm">
  <Link href="/create-resume">
    <Plus className="h-4 w-4" />
    Create New
  </Link>
</Button>
<Button asChild variant="outline" className="flex items-center gap-2 shadow-sm">
  <Link href="/upload-resume">
    <Upload className="h-4 w-4" />
    Upload PDF
  </Link>
</Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Resumes
                </CardTitle>
                <FileText className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground font-mono">
                  {resumes.length}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {resumes.filter((r) => r.is_public).length} public,{" "}
                  {resumes.filter((r) => !r.is_public).length} private
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Public Resumes
                </CardTitle>
                <Globe className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground font-mono">
                  {resumes.filter((r) => r.is_public).length}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Visible to employers
                </p>
              </CardContent>
            </Card>

            <Card className=" shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Recently Updated
                </CardTitle>
                <Calendar className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground font-mono">
                  {resumes.length > 0
                    ? formatDate(
                        resumes.sort(
                          (a, b) =>
                            new Date(b.updated_at).getTime() -
                            new Date(a.updated_at).getTime()
                        )[0].updated_at
                      )
                    : "N/A"}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Last modification
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Resume Grid */}
          {resumes.length === 0 ? (
            <Card className="shadow-sm text-center py-16">
              <CardContent>
                <div className="max-w-md mx-auto">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2 font-serif">
                    No resumes yet
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Get started by creating your first professional resume with
                    our modern templates
                  </p>
                  <Button asChild size="lg" className="shadow-sm">
                    <Link href="/create-resume">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Resume
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {resumes.map((resume) => (
                <Card
                  key={resume.id}
                  className="group hover:shadow-lg transition-all duration-200 shadow-sm hover:scale-[1.02]"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg truncate text-foreground">
                          {resume.title}
                        </CardTitle>
                        <CardDescription className="mt-1 text-muted-foreground">
                          {resume.template_id.charAt(0).toUpperCase() +
                            resume.template_id.slice(1)}{" "}
                          Template
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2 ml-2">
                        <Badge
                          variant={resume.is_public ? "default" : "secondary"}
                          className="text-xs"
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
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-sm text-muted-foreground space-y-1">
                        <div className="flex items-center justify-between">
                          <span>Created:</span>
                          <span>{formatDate(resume.created_at)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Updated:</span>
                          <span>{formatDate(resume.updated_at)}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/create-resume?edit=${resume.id}`}>
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </Link>
                        </Button>

                        {resume.is_public && (
                          <Button asChild size="sm" variant="outline">
                            <Link
                              href={`/resume/${resume.slug}`}
                              target="_blank"
                            >
                              <Globe className="h-3 w-3 mr-1" />
                              View Public
                            </Link>
                          </Button>
                        )}

                        <Button asChild size="sm" variant="outline">
                          <Link href={`/analytics?resumeId=${resume.id}`}>
                            <FileText className="h-3 w-3 mr-1" />
                            Analytics
                          </Link>
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleToggleVisibility(resume.id)}
                        >
                          <Share2 className="h-3 w-3 mr-1" />
                          {resume.is_public ? "Make Private" : "Make Public"}
                        </Button>
                      </div>

                      <div className="flex justify-between items-center pt-3">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <Download className="h-3 w-3 mr-1" />
                          Download
                        </Button>

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteResume(resume.id)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}
