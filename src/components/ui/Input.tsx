'use client'

import * as React from 'react'
import { cn } from '@/lib/cn'

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        'h-11 w-full rounded-2xl border border-border bg-bg/40 px-4 text-text placeholder:text-subtext/80 outline-none transition focus:border-pink/60 focus:ring-2 focus:ring-pink/20',
        className
      )}
      {...props}
    />
  )
}

