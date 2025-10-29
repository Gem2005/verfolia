"use client"

import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"
import { cn } from "@/lib/utils"

interface ProgressProps extends React.ComponentProps<typeof ProgressPrimitive.Root> {
  variant?: "default" | "slim" | "outline"
  indicatorClassName?: string
  indicatorStyle?: React.CSSProperties
}

function Progress({
  className,
  value,
  variant = "default",
  indicatorClassName,
  indicatorStyle,
  ...props
}: ProgressProps) {
  const isSlim = variant === "slim"
  const isOutline = variant === "outline"

  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn(
        "bg-gray-200 dark:bg-gray-700 relative w-full overflow-hidden rounded-full border border-gray-300 dark:border-gray-600 h-3",
        isSlim && "bg-background border-border",
        isOutline && "bg-gray-200 dark:bg-gray-700 relative w-full overflow-hidden rounded-full border h-3 border-gray-300 dark:border-gray-600",
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className={cn(
          "h-full bg-blue-600 dark:bg-blue-500 transition-all duration-500 ease-out",
          isSlim && "absolute top-1/2 -translate-y-1/2 h-[60%] rounded-full",
          indicatorClassName
        )}
        style={
          isSlim
            ? { left: "4px", width: `calc(${value || 0}% - 4px)`, ...indicatorStyle }
            : { width: `${value || 0}%`, ...indicatorStyle }
        }
      />
    </ProgressPrimitive.Root>
  )
}


export { Progress }
