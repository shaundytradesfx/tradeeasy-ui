import { cn } from "@/utils/cn";
import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline" | "ghost" | "shimmer";
  size?: "sm" | "md" | "lg";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    const buttonClasses = cn(
      "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
      {
        "bg-accent text-white hover:bg-accent/90": variant === "primary",
        "border border-input hover:bg-accent/10 hover:text-accent": variant === "outline",
        "hover:bg-accent/10 hover:text-accent": variant === "ghost",
        "relative inline-flex h-10 overflow-hidden rounded-md bg-slate-950 p-px": variant === "shimmer",
      },
      {
        "h-8 px-3": size === "sm",
        "h-10 px-4": size === "md",
        "h-12 px-6": size === "lg",
      },
      className
    );

    if (variant === "shimmer") {
      return (
        <button
          className={cn(
            "relative inline-flex h-10 overflow-hidden rounded-md bg-slate-950 p-[1px]",
            className
          )}
          ref={ref}
          {...props}
        >
          <span className="absolute inset-[-1000%] animate-[shimmer_2s_linear_infinite] bg-gradient-to-r from-transparent via-primary to-transparent" />
          <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-md bg-slate-950 px-3 py-1 text-sm font-medium text-white backdrop-blur-3xl">
            {props.children}
          </span>
        </button>
      );
    }

    return (
      <button className={buttonClasses} ref={ref} {...props}>
        {props.children}
      </button>
    );
  }
); 