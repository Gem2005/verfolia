import React from "react";

function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/10 flex items-center justify-center">
      <div className="flex flex-col items-center space-y-8">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-secondary/30 rounded-full blur-xl animate-pulse"></div>
          <div className="relative w-16 h-16 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          </div>
        </div>
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold text-foreground">
            Loading Verfolia
          </h3>
          <p className="text-muted-foreground text-sm">
            Please wait while we set things up
          </p>
        </div>
      </div>
    </div>
  );
}

export default Loading;
