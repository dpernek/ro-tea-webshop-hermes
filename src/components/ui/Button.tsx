import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import {
  ButtonHTMLAttributes,
  forwardRef,
  type ReactNode,
  cloneElement,
  isValidElement,
} from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  asChild?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled,
      asChild = false,
      ...props
    },
    ref
  ) => {
    const variants = {
      primary: "bg-brand text-white hover:bg-brand-dark shadow-sm hover:shadow",
      secondary: "bg-slate-900 text-white hover:bg-slate-800",
      outline:
        "border-2 border-slate-200 bg-transparent text-slate-900 hover:border-brand hover:text-brand",
      ghost: "bg-transparent text-slate-700 hover:bg-slate-100",
    };

    const sizes = {
      sm: "h-9 px-4 text-sm",
      md: "h-11 px-6 text-base",
      lg: "h-14 px-8 text-lg",
    };

    const classes = cn(
      "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60",
      variants[variant],
      sizes[size],
      className
    );

    if (asChild && isValidElement(children)) {
      return cloneElement(children, {
        className: cn(
          classes,
          (children.props as { className?: string }).className
        ),
        ...props,
      } as Record<string, unknown>);
    }

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={classes}
        {...props}
      >
        {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
