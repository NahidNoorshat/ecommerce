"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function MaintenanceBanner() {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-background shadow-md border-b border-border">
      <div className="max-w-4xl mx-auto px-4 py-3">
        <Alert className="bg-indigo-50 dark:bg-slate-800 text-slate-800 dark:text-white">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <Info className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              <div>
                <AlertTitle className="text-base font-semibold">
                  Maintenance Mode
                </AlertTitle>
                <AlertDescription className="text-sm text-muted-foreground mt-1">
                  We’re currently upgrading the system. Some features may be
                  temporarily unavailable. Everything will be back soon!
                </AlertDescription>
              </div>
            </div>
            <Badge variant="outline" className="text-xs">
              Estimated: Few minutes
            </Badge>
          </div>
        </Alert>
      </div>
    </div>
  );
}
