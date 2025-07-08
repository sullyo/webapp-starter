"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import type * as React from "react";

export function SubmitButton({
  children,
  isSubmitting,
  disabled,
  variant = "default",
  ...props
}: {
  children: React.ReactNode;
  isSubmitting?: boolean;
  disabled?: boolean;
} & React.ComponentProps<"button"> &
  VariantProps<typeof Button>) {
  return (
    <Button
      disabled={isSubmitting || disabled}
      variant={variant}
      {...props}
      className={cn(props.className, "relative grid place-items-center")}
    >
      <div className={cn("grid-absolute", { "opacity-0": isSubmitting })}>{children}</div>
      {isSubmitting && (
        <div className="grid-absolute-center">
          <Loader2 className="size-4 animate-spin" />
          {/* <Spinner size="sm" fill={variant === "default" ? "light" : "dark"} /> */}
        </div>
      )}
    </Button>
  );
}
