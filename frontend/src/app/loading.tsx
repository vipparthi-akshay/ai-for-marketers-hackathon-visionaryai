"use client";

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 bg-primary rounded-lg animate-pulse" />
        <div className="text-sm text-muted-foreground">Loading...</div>
      </div>
    </div>
  );
}
