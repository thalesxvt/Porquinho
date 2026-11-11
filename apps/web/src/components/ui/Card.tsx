import { HTMLAttributes, forwardRef } from 'react'
import { cn } from '../../lib/utils'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  interactive?: boolean
  subtle?: boolean
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, interactive = false, subtle = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'rounded-2xl border border-[#DDD7C0] bg-[#FAF8F2] transition-all duration-200',
          subtle ? 'bg-[#F6F2E5]/70 border-[#DDD7C0]/60' : 'bg-[#FAF8F2] shadow-surface',
          interactive &&
            'hover:shadow-surface-hover hover:border-[#758695] hover:-translate-y-0.5 cursor-pointer',
          className
        )}
        {...props}
      />
    )
  }
)
Card.displayName = 'Card'

export const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('flex items-center justify-between p-5 pb-3 sm:px-6 sm:pt-6', className)}
        {...props}
      />
    )
  }
)
CardHeader.displayName = 'CardHeader'

export const CardTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => {
    return (
      <h3
        ref={ref}
        className={cn('text-sm sm:text-base font-bold tracking-tight text-slate-900', className)}
        {...props}
      />
    )
  }
)
CardTitle.displayName = 'CardTitle'

export const CardDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => {
    return (
      <p
        ref={ref}
        className={cn('text-xs text-slate-500 font-medium mt-0.5', className)}
        {...props}
      />
    )
  }
)
CardDescription.displayName = 'CardDescription'

export const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('p-5 pt-2 sm:p-6 sm:pt-3', className)} {...props} />
    )
  }
)
CardContent.displayName = 'CardContent'

export const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('flex items-center justify-between border-t border-slate-100 p-4 sm:px-6', className)}
        {...props}
      />
    )
  }
)
CardFooter.displayName = 'CardFooter'
