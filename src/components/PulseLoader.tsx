import React from "react";
import { cn } from "@/lib/utils";

interface PulseLoaderProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const PulseLoader: React.FC<PulseLoaderProps> = ({ size = "md", className }) => {
  const sizeClasses = {
    sm: "h-2 w-2",
    md: "h-3 w-3",
    lg: "h-4 w-4"
  };

  return (
    <div className={cn("flex items-center justify-center gap-1", className)}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={cn(
            sizeClasses[size],
            "rounded-full bg-primary animate-pulse"
          )}
          style={{
            animationDelay: `${i * 150}ms`,
            animationDuration: "600ms"
          }}
        />
      ))}
    </div>
  );
};

export const PageLoader: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="relative">
          <div className="h-16 w-16 rounded-full border-4 border-primary/20 mx-auto" />
          <div className="absolute inset-0 h-16 w-16 rounded-full border-4 border-primary border-t-transparent mx-auto animate-spin" />
        </div>
        <p className="text-muted-foreground animate-pulse">Loading...</p>
      </div>
    </div>
  );
};

export const InlineLoader: React.FC<{ text?: string }> = ({ text = "Loading" }) => {
  return (
    <div className="flex items-center gap-2 text-muted-foreground">
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-primary"
            style={{
              animation: "pulse 1s ease-in-out infinite",
              animationDelay: `${i * 150}ms`
            }}
          />
        ))}
      </div>
      <span className="text-sm">{text}</span>
    </div>
  );
};

export default PulseLoader;
