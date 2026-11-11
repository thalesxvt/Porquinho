import { cn } from '../../lib/utils'

export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn('animate-pulse rounded-lg bg-slate-200/70', className)} />
  )
}

export function KPICardSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-surface">
      <div className="flex items-start justify-between">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-9 w-9 rounded-xl" />
      </div>
      <Skeleton className="mt-3 h-7 w-32" />
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
        <Skeleton className="h-4 w-12 rounded-md" />
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
  )
}

export function TableRowSkeleton() {
  return (
    <tr className="border-b border-slate-100">
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-9 rounded-xl shrink-0" />
          <div className="flex flex-col gap-1.5 flex-1">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-3 w-20 sm:hidden" />
          </div>
        </div>
      </td>
      <td className="px-5 py-4 hidden sm:table-cell"><Skeleton className="h-4 w-20" /></td>
      <td className="px-5 py-4 hidden md:table-cell"><Skeleton className="h-6 w-24 rounded-full" /></td>
      <td className="px-5 py-4 text-right"><Skeleton className="ml-auto h-4 w-24" /></td>
      <td className="px-5 py-4 text-right"><Skeleton className="ml-auto h-7 w-14 rounded-lg" /></td>
    </tr>
  )
}

export function ChartSkeleton() {
  return (
    <div className="flex h-64 w-full flex-col justify-end gap-3 p-4">
      <div className="flex items-end gap-3 h-full">
        <Skeleton className="h-3/4 flex-1 rounded-t-lg" />
        <Skeleton className="h-1/2 flex-1 rounded-t-lg" />
        <Skeleton className="h-5/6 flex-1 rounded-t-lg" />
        <Skeleton className="h-2/3 flex-1 rounded-t-lg" />
        <Skeleton className="h-4/5 flex-1 rounded-t-lg" />
        <Skeleton className="h-3/5 flex-1 rounded-t-lg" />
      </div>
      <div className="flex justify-between border-t border-slate-100 pt-2">
        <Skeleton className="h-3 w-8" />
        <Skeleton className="h-3 w-8" />
        <Skeleton className="h-3 w-8" />
        <Skeleton className="h-3 w-8" />
      </div>
    </div>
  )
}
