import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '../../lib/utils'
import { EmptyState } from './EmptyState'
import { TableRowSkeleton } from './Skeleton'

export function DataTable({
  columns,
  data,
  loading,
  emptyTitle,
  emptyDescription,
  emptyAction,
  pagination,
  onPageChange,
  sortable,
  onSort,
  onRowClick,
  renderMobileCard,
  className,
}) {
  const [sortField, setSortField] = useState(null)
  const [sortDir, setSortDir] = useState('asc')

  const handleSort = (field) => {
    if (!sortable) return
    const dir = sortField === field && sortDir === 'asc' ? 'desc' : 'asc'
    setSortField(field)
    setSortDir(dir)
    onSort?.(field, dir)
  }

  const sortIcon = (field) => {
    if (sortField !== field) return null
    return sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
  }

  if (loading) {
    return (
      <div className={cn('bg-white dark:bg-[#16201A] rounded-md border border-slate2-400/20 dark:border-slate2-600/20', className)}>
        <div className="hidden md:block">
          {Array.from({ length: 5 }).map((_, i) => (
            <TableRowSkeleton key={i} cols={columns.length} />
          ))}
        </div>
        <div className="md:hidden space-y-2 p-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="p-3 rounded-sm border border-slate2-400/10 dark:border-slate2-600/10 space-y-2">
              <div className="h-4 w-2/3 animate-pulse rounded-sm bg-slate2-400/20 dark:bg-slate2-600/20" />
              <div className="h-3 w-1/2 animate-pulse rounded-sm bg-slate2-400/20 dark:bg-slate2-600/20" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className={cn('bg-white dark:bg-[#16201A] rounded-md border border-slate2-400/20 dark:border-slate2-600/20', className)}>
        <EmptyState title={emptyTitle} description={emptyDescription} action={emptyAction} />
      </div>
    )
  }

  return (
    <div className={cn('bg-white dark:bg-[#16201A] rounded-md border border-slate2-400/20 dark:border-slate2-600/20', className)}>
      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm" role={sortable ? 'grid' : 'table'}>
          <thead>
            <tr className="border-b border-slate2-400/20 dark:border-slate2-600/20 bg-mist-50 dark:bg-mist-900">
              {columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className={cn(
                    'px-4 py-3 text-left text-xs font-medium text-slate2-400 dark:text-slate2-600 uppercase tracking-wider',
                    sortable && col.sortKey && 'cursor-pointer select-none hover:text-ink-900 dark:hover:text-ink-100'
                  )}
                  onClick={() => col.sortKey && handleSort(col.sortKey)}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.label}
                    {col.sortKey && sortIcon(col.sortKey)}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate2-400/10 dark:divide-slate2-600/10">
            {data.map((row, i) => (
              <tr
                key={row.id || i}
                className={cn(
                  'hover:bg-mist-50 dark:hover:bg-mist-900/50 transition-colors',
                  onRowClick && 'cursor-pointer'
                )}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3 text-ink-900 dark:text-ink-100 whitespace-nowrap">
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      {renderMobileCard && (
        <div className="md:hidden divide-y divide-slate2-400/10 dark:divide-slate2-600/10">
          {data.map((row, i) => (
            <div
              key={row.id || i}
              className={cn(
                'p-3 hover:bg-mist-50 dark:hover:bg-mist-900/50 transition-colors',
                onRowClick && 'cursor-pointer'
              )}
              onClick={() => onRowClick?.(row)}
            >
              {renderMobileCard(row)}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="px-4 py-3 border-t border-slate2-400/20 dark:border-slate2-600/20 flex items-center justify-between text-xs text-slate2-400 dark:text-slate2-600">
          <span>
            Showing {((pagination.page - 1) * pagination.limit) + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange?.(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="px-3 py-1 rounded-sm border border-slate2-400/20 dark:border-slate2-600/20 disabled:opacity-30 hover:bg-mist-50 dark:hover:bg-mist-900"
            >
              Prev
            </button>
            <span className="px-2">{pagination.page} / {pagination.totalPages}</span>
            <button
              onClick={() => onPageChange?.(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="px-3 py-1 rounded-sm border border-slate2-400/20 dark:border-slate2-600/20 disabled:opacity-30 hover:bg-mist-50 dark:hover:bg-mist-900"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
