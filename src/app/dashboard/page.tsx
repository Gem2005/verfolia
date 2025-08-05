"use client";

import { useState, useEffect } from "react";
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
  Eye,
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

// Mock data - replace with actual API calls
const mockResumes = [
  {
    id: "53488185-773c-4fd4-b567-b8eb6c5086aa",
    title: "Software Engineer Resume",
    slug: "software-engineer-resume-1753195357-568a4595",
    template_id: "modern",
    is_public: true,
    created_at: "2025-07-22T14:42:37.006917Z",
    updated_at: "2025-07-22T14:42:37.006917Z",
  },
  {
    id: "53488185-773c-4fd4-b567-b8eb6c5086ab",
    title: "Frontend Developer CV",
    slug: "frontend-developer-cv-1753195357-568a4595",
    template_id: "classic",
    is_public: false,
    created_at: "2025-07-20T10:30:15.006917Z",
    updated_at: "2025-07-21T16:45:22.006917Z",
  },
];

interface Resume {
  id: string;
  title: string;
  slug: string;
  template_id: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export default function Dashboard() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setResumes(mockResumes);
      setLoading(false);
    }, 1000);
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleDeleteResume = (id: string) => {
    if (confirm("Are you sure you want to delete this resume?")) {
      setResumes(resumes.filter((resume) => resume.id !== id));
    }
  };

  const handleToggleVisibility = (id: string) => {
    setResumes(
      resumes.map((resume) =>
        resume.id === id ? { ...resume, is_public: !resume.is_public } : resume
      )
    );
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <AppLayout>
          <div className="container mt-24 mx-auto px-4 py-8">
            <div className="animate-pulse space-y-8">
              <div className="h-8 bg-gray-200 rounded w-1/4"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
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
        <div className="container mt-24 mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                Resume Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Manage and organize all your resumes in one place
              </p>
            </div>
            <Button asChild className="flex items-center gap-2">
              <Link href="/resume/new">
                <Plus className="h-4 w-4" />
                Create New Resume
              </Link>
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="border-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Resumes
                </CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{resumes.length}</div>
                <p className="text-xs text-muted-foreground">
                  {resumes.filter((r) => r.is_public).length} public,{" "}
                  {resumes.filter((r) => !r.is_public).length} private
                </p>
              </CardContent>
            </Card>

            <Card className="border-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Public Resumes
                </CardTitle>
                <Globe className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {resumes.filter((r) => r.is_public).length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Visible to employers
                </p>
              </CardContent>
            </Card>

            <Card className="border-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Recently Updated
                </CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
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
                <p className="text-xs text-muted-foreground">
                  Last modification
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Resume Grid */}
          {resumes.length === 0 ? (
            <Card className="border-0 text-center py-12">
              <CardContent>
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  No resumes yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Get started by creating your first professional resume
                </p>
                <Button asChild>
                  <Link href="/resume/new">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Resume
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {resumes.map((resume) => (
                <Card
                  key={resume.id}
                  className="group hover:shadow-lg transition-shadow border-0"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg truncate">
                          {resume.title}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          Template: {resume.template_id}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2 ml-2">
                        <Badge
                          variant={resume.is_public ? "default" : "secondary"}
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
                    <div className="space-y-3">
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        <div>Created: {formatDate(resume.created_at)}</div>
                        <div>Updated: {formatDate(resume.updated_at)}</div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/resume/${resume.slug}`}>
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Link>
                        </Button>

                        <Button asChild size="sm" variant="outline">
                          <Link href={`/resume/${resume.slug}/edit`}>
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
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

                      <div className="flex justify-between items-center pt-2 border-t">
                        <Button size="sm" variant="ghost">
                          <Download className="h-3 w-3 mr-1" />
                          Download
                        </Button>

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteResume(resume.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
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
