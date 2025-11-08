"use client";

import { useState } from "react";
import { Copy, Eye, CheckCircle2, Sparkles, ExternalLink, Clock, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ResumeSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  resumeSlug: string;
  isEditMode?: boolean;
}

export const ResumeSuccessModal = ({
  isOpen,
  onClose,
  resumeSlug,
  isEditMode = false,
}: ResumeSuccessModalProps) => {
  const [copied, setCopied] = useState(false);
  
  const profileUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/resume/${resumeSlug}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    toast.success("Link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePreview = () => {
    window.open(profileUrl, "_blank");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[580px] max-w-[95vw] p-0 overflow-hidden border border-[#3498DB]/30 sm:border-2 dark:border-[#3498DB]/50 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header with gradient background */}
        <div className="relative bg-gradient-to-br from-[#2C3E50] via-[#34495E] to-[#3498DB] p-4 sm:p-8 text-white overflow-hidden">
          {/* Animated background elements */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-48 h-48 sm:w-72 sm:h-72 bg-[#3498DB] rounded-full mix-blend-overlay filter blur-3xl animate-pulse" />
            <div className="absolute bottom-0 left-0 w-40 h-40 sm:w-64 sm:h-64 bg-[#ECF0F1] rounded-full mix-blend-overlay filter blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          </div>

          <div className="relative z-10">
            <div className="flex justify-center mb-3 sm:mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-[#27AE60]/40 blur-xl animate-pulse" />
                <div className="relative bg-[#27AE60]/20 backdrop-blur-sm rounded-full p-3 sm:p-4 border-2 border-[#27AE60]/40">
                  <CheckCircle2 className="h-10 w-10 sm:h-14 sm:w-14 text-[#27AE60]" strokeWidth={2.5} />
                </div>
              </div>
            </div>

            <DialogHeader className="text-center space-y-2 sm:space-y-3">
              <DialogTitle className="text-xl sm:text-3xl font-bold text-white flex items-center justify-center gap-2 sm:gap-2.5 flex-wrap">
                {isEditMode ? (
                  <>
                    <Sparkles className="h-5 w-5 sm:h-7 sm:w-7 text-[#F39C12]" />
                    Resume Updated!
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5 sm:h-7 sm:w-7 text-[#F39C12]" />
                    <span className="text-center">Your Verfolia Link Is Ready!</span>
                  </>
                )}
              </DialogTitle>
              <DialogDescription className="text-[#ECF0F1]/90 text-sm sm:text-base leading-relaxed px-2 sm:px-0">
                {isEditMode 
                  ? "Your resume has been successfully updated and is live. Share it to start tracking insights!"
                  : "You've just created your interactive resume. Share your link and watch the analytics flow in!"
                }
              </DialogDescription>
            </DialogHeader>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 bg-white dark:bg-[#2C3E50]/50">
          {/* Live Link Section */}
          <div className="space-y-2 sm:space-y-3">
            <div className="flex items-center gap-2">
              <div className="relative flex h-2.5 w-2.5 sm:h-3 sm:w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#27AE60] opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 sm:h-3 sm:w-3 bg-[#27AE60]" />
              </div>
              <span className="text-xs sm:text-sm font-bold text-[#2C3E50] dark:text-[#ECF0F1] uppercase tracking-wider">
                Your Live Link
              </span>
            </div>
            <div className="bg-[#ECF0F1]/50 dark:bg-[#34495E]/50 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-[#3498DB]/20 sm:border-2 dark:border-[#3498DB]/30 backdrop-blur-sm">
              <div className="font-mono text-xs sm:text-sm text-[#2C3E50] dark:text-[#ECF0F1] break-all font-medium">
                verfolia.com/resume/<span className="text-[#3498DB] font-bold">{resumeSlug}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleCopyLink}
              className={cn(
                "flex-1 h-11 sm:h-12 font-semibold transition-all duration-300 rounded-lg sm:rounded-xl shadow-lg text-sm sm:text-base",
                copied
                  ? "bg-[#27AE60] hover:bg-[#229954] shadow-[#27AE60]/30"
                  : "bg-gradient-to-r from-[#2C3E50] to-[#3498DB] hover:from-[#34495E] hover:to-[#2C8BBD] shadow-[#3498DB]/25"
              )}
            >
              {copied ? (
                <>
                  <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  Copy Link
                </>
              )}
            </Button>
            <Button
              onClick={handlePreview}
              variant="outline"
              className="h-11 sm:h-12 font-semibold rounded-lg sm:rounded-xl border border-[#3498DB]/30 sm:border-2 dark:border-[#3498DB]/50 bg-[#3498DB]/5 dark:bg-[#3498DB]/10 hover:bg-[#3498DB]/10 dark:hover:bg-[#3498DB]/20 text-[#2C3E50] dark:text-[#ECF0F1] shadow-sm hover:shadow-md transition-all duration-300 text-sm sm:text-base"
            >
              <ExternalLink className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              Preview
            </Button>
          </div>

          {/* Stats Preview */}
          <div className="bg-gradient-to-br from-[#3498DB]/10 to-[#2C3E50]/5 dark:from-[#3498DB]/20 dark:to-[#34495E]/30 rounded-lg sm:rounded-xl p-4 sm:p-5 border border-[#3498DB]/20 sm:border-2 dark:border-[#3498DB]/30 backdrop-blur-sm">
            <div className="grid grid-cols-2 gap-4 sm:gap-6">
              <div className="text-center space-y-1.5 sm:space-y-2">
                <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-[#2C3E50] to-[#3498DB] dark:from-[#ECF0F1] dark:to-[#3498DB] bg-clip-text text-transparent">
                  0
                </div>
                <div className="text-xs font-semibold text-[#34495E] dark:text-[#ECF0F1]/70 uppercase tracking-wide">
                  <Eye className="inline-block h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1" />
                  Total Views
                </div>
              </div>
              <div className="text-center space-y-1.5 sm:space-y-2 border-l border-[#3498DB]/20 sm:border-l-2 dark:border-[#3498DB]/30">
                <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-[#3498DB] to-[#2C3E50] dark:from-[#3498DB] dark:to-[#ECF0F1] bg-clip-text text-transparent">
                  —
                </div>
                <div className="text-xs font-semibold text-[#34495E] dark:text-[#ECF0F1]/70 uppercase tracking-wide">
                  <Clock className="inline-block h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1" />
                  Avg. Time
                </div>
              </div>
            </div>
          </div>

          {/* Share Encouragement */}
          <div className="bg-gradient-to-r from-[#F39C12]/10 to-[#E67E22]/10 dark:from-[#F39C12]/20 dark:to-[#E67E22]/20 border border-[#F39C12]/30 sm:border-2 dark:border-[#F39C12]/40 rounded-lg sm:rounded-xl p-4 sm:p-5 space-y-3">
            <div className="flex items-start gap-2.5 sm:gap-3">
              <div className="flex-shrink-0 mt-0.5">
                <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-[#F39C12]/20 flex items-center justify-center">
                  <Share2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#F39C12]" />
                </div>
              </div>
              <div className="flex-1 space-y-2">
                <p className="text-xs sm:text-sm text-[#2C3E50] dark:text-[#ECF0F1] leading-relaxed font-medium">
                  <span className="font-bold text-[#2C3E50] dark:text-white">Share it anywhere</span> — LinkedIn bio, WhatsApp, Instagram bio, Twitter, Facebook, and email.
                </p>
                <p className="text-xs sm:text-sm font-bold text-[#E67E22] dark:text-[#F39C12] flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  Your first view gets recorded within minutes!
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
