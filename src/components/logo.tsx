import { Camera, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogoProps {
  variant?: "default" | "white";
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
}

export function Logo({
  variant = "default",
  size = "md",
  showText = true,
  className,
}: LogoProps) {
  const sizeClasses = {
    sm: {
      container: "gap-2",
      icon: "h-6 w-6",
      check: "h-3 w-3",
      checkOffset: "-right-0.5 -bottom-0.5",
      text: "text-lg",
    },
    md: {
      container: "gap-3",
      icon: "h-8 w-8",
      check: "h-4 w-4",
      checkOffset: "-right-1 -bottom-1",
      text: "text-xl",
    },
    lg: {
      container: "gap-4",
      icon: "h-12 w-12",
      check: "h-6 w-6",
      checkOffset: "-right-1.5 -bottom-1.5",
      text: "text-3xl",
    },
  };

  const colorClasses = {
    default: {
      icon: "text-primary",
      check: "text-accent",
      text: "text-foreground",
    },
    white: {
      icon: "text-white",
      check: "text-white/80",
      text: "text-white",
    },
  };

  const sizes = sizeClasses[size];
  const colors = colorClasses[variant];

  return (
    <div className={cn("flex items-center", sizes.container, className)}>
      <div className="relative">
        <Camera className={cn(sizes.icon, colors.icon)} strokeWidth={2} />
        <CheckCircle
          className={cn(
            sizes.check,
            colors.check,
            "absolute",
            sizes.checkOffset,
            "fill-current"
          )}
          strokeWidth={0}
        />
      </div>
      {showText && (
        <span
          className={cn(
            sizes.text,
            colors.text,
            "font-bold tracking-tight"
          )}
        >
          PBQC
        </span>
      )}
    </div>
  );
}
