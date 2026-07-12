"use client";

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-500 rounded-xl animate-pulse" />
        <div className="text-sm text-muted-foreground">Loading...</div>
      </div>
    </div>
  );
}
