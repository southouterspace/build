import * as React from 'react'
import { cn } from '@/lib/utils'

function Field({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="field"
      className={cn('grid gap-2', className)}
      {...props}
    />
  )
}

function FieldLabel({
  className,
  ...props
}: React.ComponentProps<'label'>) {
  return (
    <label
      data-slot="label"
      className={cn(
        'flex items-center gap-2 text-sm font-medium leading-none select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50',
        className
      )}
      {...props}
    />
  )
}

function FieldDescription({
  className,
  ...props
}: React.ComponentProps<'p'>) {
  return (
    <p
      data-slot="description"
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  )
}

function FieldError({
  className,
  children,
  ...props
}: React.ComponentProps<'p'>) {
  if (!children) return null

  return (
    <p
      data-slot="error"
      className={cn('text-sm font-medium text-destructive', className)}
      role="alert"
      {...props}
    >
      {children}
    </p>
  )
}

export { Field, FieldLabel, FieldDescription, FieldError }
