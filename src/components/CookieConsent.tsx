"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { X, Cookie, Shield, BarChart3 } from 'lucide-react';
import { storageHelpers } from '@/utils/storage';

interface CookieConsentProps {
  onAccept?: () => void;
  onDecline?: () => void;
  onCustomize?: () => void;
}

export function CookieConsent({ onAccept, onDecline, onCustomize }: CookieConsentProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Show consent banner if user hasn't made a choice
    const hasConsent = storageHelpers.hasAnalyticsConsent();
    if (!hasConsent) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    storageHelpers.setAnalyticsConsent(true);
    setIsVisible(false);
    onAccept?.();
  };

  const handleDecline = () => {
    storageHelpers.setAnalyticsConsent(false);
    setIsVisible(false);
    onDecline?.();
  };

  const handleCustomize = () => {
    setShowDetails(!showDetails);
    onCustomize?.();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 max-w-md mx-auto lg:left-auto lg:right-4 lg:max-w-sm">
      <Card className="shadow-lg border-border/80 backdrop-blur-sm bg-background/95">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Cookie className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <div className="flex-1 space-y-3">
              <div>
                <h3 className="font-semibold text-sm mb-1">Cookie Preferences</h3>
                <p className="text-xs text-muted-foreground">
                  We use cookies to enhance your experience and analyze usage patterns.
                </p>
              </div>

              {showDetails && (
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                    <Shield className="h-3 w-3 text-green-500" />
                    <div>
                      <strong>Essential:</strong> Required for basic functionality
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                    <BarChart3 className="h-3 w-3 text-blue-500" />
                    <div>
                      <strong>Analytics:</strong> Help us improve the platform
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  onClick={handleAccept}
                  className="flex-1 text-xs h-8"
                >
                  Accept All
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={handleDecline}
                  className="flex-1 text-xs h-8"
                >
                  Decline
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={handleCustomize}
                  className="px-2 h-8"
                >
                  {showDetails ? 'Less' : 'More'}
                </Button>
              </div>
            </div>
            
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsVisible(false)}
              className="h-6 w-6 p-0 hover:bg-muted"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Hook for using cookie consent in components
export function useCookieConsent() {
  const [hasConsent, setHasConsent] = useState<boolean | null>(null);

  useEffect(() => {
    const consent = storageHelpers.getAnalyticsConsent();
    setHasConsent(consent);
  }, []);

  const updateConsent = (consent: boolean) => {
    storageHelpers.setAnalyticsConsent(consent);
    setHasConsent(consent);
  };

  return {
    hasConsent,
    updateConsent,
    hasDecided: hasConsent !== null
  };
}