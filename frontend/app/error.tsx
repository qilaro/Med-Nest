"use client";

import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-[#f9f9f9] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 max-w-md text-center">
        <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-navy mb-2">Something went wrong</h2>
        <p className="text-muted-foreground mb-6 text-sm">
          {error.message || "An unexpected error occurred. Please try again."}
        </p>
        <Button onClick={reset} className="font-bold">
          Try again
        </Button>
      </div>
    </div>
  );
}
