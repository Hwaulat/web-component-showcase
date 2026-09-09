import * as React from "react"
import { cn } from "@/utils/cn"
import { SortIcon } from "./sort"
import { createPortal } from "react-dom"

export type SortDir = 'ASC' | 'DESC'

interface SortState {
  sortKey: string
  sortDir: SortDir
}

interface TableContextType {
  sortKey: string
  sortDir: SortDir
  onSort: (column: string) => void
}

const TableSortContext = React.createContext<TableContextType | undefined>(undefined)

const MIN_COLUMN_WIDTH = 60

interface TableResizeContextType {
  widths: number[]
  onResizeStart: (index: number, event: React.PointerEvent<HTMLElement>) => void
}

const TableResizeContext = React.createContext<TableResizeContextType | null>(null)
const TableHeaderRowContext = React.createContext(false)

export const useSortContext = () => {
  const context = React.useContext(TableSortContext)
  if (!context) {
    throw new Error('useSortContext must be used within a Table component')
  }
  return context
}

type TableProps = React.ComponentProps<"table"> & {
  className?: string
  containerClassName?: string
  onSortChange?: (sortKey: string, sortDir: SortDir) => void
  initialSortKey?: string
  initialSortDir?: SortDir
  freezeHeader?: boolean
  fullHeight?: boolean
  resizable?: boolean
  minColumnWidth?: number
}

const FLOATING_SCROLLBAR_HEIGHT = 16

function FloatingScrollbar({ containerRef }: { containerRef: React.RefObject<HTMLDivElement | null> }) {
  const barRef = React.useRef<HTMLDivElement>(null)
  const [box, setBox] = React.useState<{ left: number; width: number; scrollWidth: number } | null>(null)

  React.useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let frame = 0

    const measure = () => {
      frame = 0
      const el = containerRef.current
      if (!el) return

      const rect = el.getBoundingClientRect()
      const overflows = el.scrollWidth - el.clientWidth > 1
      const bottomBelowFold = rect.bottom > window.innerHeight
      const inView = rect.top < window.innerHeight && rect.bottom > 0
      const modalOpen = document.querySelector('[role="dialog"][data-state="open"]') !== null

      if (!overflows || !bottomBelowFold || !inView || modalOpen) {
        setBox((prev) => (prev === null ? prev : null))
        return
      }

      setBox((prev) =>
        prev && prev.left === rect.left && prev.width === rect.width && prev.scrollWidth === el.scrollWidth
          ? prev
          : { left: rect.left, width: rect.width, scrollWidth: el.scrollWidth },
      )
      if (barRef.current && Math.abs(barRef.current.scrollLeft - el.scrollLeft) > 1) {
        barRef.current.scrollLeft = el.scrollLeft
      }
    }

    const schedule = () => {
      if (frame) return
      frame = requestAnimationFrame(measure)
    }

    measure()
    window.addEventListener("scroll", schedule, true)
    window.addEventListener("resize", schedule)
    container.addEventListener("scroll", schedule)

    const observer = new ResizeObserver(schedule)
    observer.observe(container)
    if (container.firstElementChild) observer.observe(container.firstElementChild)

    return () => {
      if (frame) cancelAnimationFrame(frame)
      window.removeEventListener("scroll", schedule, true)
      window.removeEventListener("resize", schedule)
      container.removeEventListener("scroll", schedule)
      observer.disconnect()
    }
  }, [containerRef])

  const handleBarScroll = () => {
    const el = containerRef.current
    const bar = barRef.current
    if (!el || !bar) return
    if (Math.abs(el.scrollLeft - bar.scrollLeft) > 1) el.scrollLeft = bar.scrollLeft
  }

  if (!box) return null

  return createPortal(
    <div
      ref={barRef}
      data-slot="table-floating-scrollbar"
      onScroll={handleBarScroll}
      style={{ left: box.left, width: box.width, height: FLOATING_SCROLLBAR_HEIGHT }}
      className="fixed bottom-0 z-10 overflow-x-auto overflow-y-hidden border-t border-gray-100 bg-white/90 backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800/90"
    >
      <div style={{ width: box.scrollWidth, height: 1 }} />
    </div>,
    document.body,
  )
}


const Table = ({
  className,
  containerClassName,
  onSortChange,
  initialSortKey = '',
  initialSortDir = 'ASC',
  freezeHeader = true,
  fullHeight = false,
  resizable = false,
  minColumnWidth = MIN_COLUMN_WIDTH,
  children,
  ...props
}: TableProps) => {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const tableRef = React.useRef<HTMLTableElement>(null)
  const [columnWidths, setColumnWidths] = React.useState<number[]>([])

  const [containerWidth, setContainerWidth] = React.useState(0)
  const containerWidthRef = React.useRef(0)
  containerWidthRef.current = containerWidth

  React.useLayoutEffect(() => {
    if (!resizable) return
    const container = containerRef.current
    if (!container) return
    const measure = () => setContainerWidth(container.clientWidth)
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(container)
    return () => observer.disconnect()
  }, [resizable])

  const getHeaderCells = React.useCallback(
    () => tableRef.current?.querySelectorAll<HTMLTableCellElement>('thead tr:first-child > th'),
    [],
  )

  React.useLayoutEffect(() => {
    if (!resizable) return
    const headerCells = getHeaderCells()
    if (!headerCells?.length) return
    if (columnWidths.length === headerCells.length) return
    if (columnWidths.length > 0) {
      setColumnWidths([])
      return
    }
    setColumnWidths(
      Array.from(headerCells, (cell) =>
        Math.max(minColumnWidth, Math.round(cell.getBoundingClientRect().width)),
      ),
    )
  })

  const handleResizeStart = React.useCallback(
    (index: number, event: React.PointerEvent<HTMLElement>) => {
      event.preventDefault()
      event.stopPropagation()

      const cell = getHeaderCells()?.[index]
      if (!cell) return

      const startX = event.clientX
      const startWidth = Math.round(cell.getBoundingClientRect().width)

      const handleMove = (moveEvent: PointerEvent) => {
        setColumnWidths((prev) => {
          if (!prev.length) return prev
          const isLastColumn = index === prev.length - 1
          const fillWidth = isLastColumn && containerWidthRef.current
            ? containerWidthRef.current - prev.reduce((total, width, i) => (i === index ? total : total + width), 0)
            : 0
          const lowerBound = Math.max(minColumnWidth, fillWidth)
          const nextWidth = Math.max(lowerBound, startWidth + (moveEvent.clientX - startX))
          if (prev[index] === nextWidth) return prev
          const next = [...prev]
          next[index] = nextWidth
          return next
        })
      }

      const handleEnd = () => {
        window.removeEventListener('pointermove', handleMove)
        window.removeEventListener('pointerup', handleEnd)
        window.removeEventListener('pointercancel', handleEnd)
        document.body.style.removeProperty('cursor')
        document.body.style.removeProperty('user-select')
      }

      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'
      window.addEventListener('pointermove', handleMove)
      window.addEventListener('pointerup', handleEnd)
      window.addEventListener('pointercancel', handleEnd)
    },
    [getHeaderCells, minColumnWidth],
  )

  const renderedWidths = React.useMemo(() => {
    if (!columnWidths.length || !containerWidth) return columnWidths
    const total = columnWidths.reduce((sum, width) => sum + width, 0)
    if (total >= containerWidth) return columnWidths
    const next = [...columnWidths]
    next[next.length - 1] = (next[next.length - 1] ?? 0) + (containerWidth - total)
    return next
  }, [columnWidths, containerWidth])

  const isResizable = resizable && columnWidths.length > 0

  const resizeContextValue = React.useMemo<TableResizeContextType | null>(
    () => (resizable ? { widths: columnWidths, onResizeStart: handleResizeStart } : null),
    [resizable, columnWidths, handleResizeStart],
  )

  const [sortState, setSortState] = React.useState<SortState>({
    sortKey: initialSortKey,
    sortDir: initialSortDir,
  })

  const handleSort = (column: string) => {
    const currentOrderBy = sortState.sortKey
    const currentSortType = sortState.sortDir

    let newSortKey = column
    let newSortDir: SortDir = 'ASC'

    if (currentOrderBy === column) {
      if (currentSortType === 'ASC') {
        newSortDir = 'DESC'
      } else if (currentSortType === 'DESC') {
        newSortKey = ''
        newSortDir = 'ASC'
      } else {
        newSortDir = 'ASC'
      }
    }

    setSortState({ sortKey: newSortKey, sortDir: newSortDir })
    onSortChange?.(newSortKey, newSortDir)
  }

  return (
    <TableSortContext.Provider value={{
      sortKey: sortState.sortKey,
      sortDir: sortState.sortDir,
      onSort: handleSort
    }}>
      <>
        <div
          ref={containerRef}
          data-slot="table-container"
          className={cn(
            "relative w-full overflow-x-auto",
            freezeHeader && "[&_thead]:sticky [&_thead]:top-0 [&_thead]:z-20",
            fullHeight && "min-h-0 overflow-auto",
            containerClassName
          )}
        >
          <table
            ref={tableRef}
            data-slot="table"
            style={isResizable ? { width: renderedWidths.reduce((total, width) => total + width, 0), tableLayout: 'fixed' } : undefined}
            className={cn(
              "min-w-full border-collapse [&_tr]:border-gray-100 dark:[&_tr]:border-gray-700 caption-bottom",
              isResizable && "!min-w-0 [&_td]:!min-w-0 [&_th]:!min-w-0 [&_th]:!w-auto [&_td]:overflow-hidden [&_td]:text-ellipsis [&_th]:overflow-hidden [&_th]:text-ellipsis",
              className
            )}
            {...props}
          >
            {isResizable && (
              <colgroup>
                {renderedWidths.map((width, index) => (
                  <col key={index} style={{ width }} />
                ))}
              </colgroup>
            )}
            <TableResizeContext.Provider value={resizeContextValue}>
              {children}
            </TableResizeContext.Provider>
          </table>
        </div>
        <FloatingScrollbar containerRef={containerRef} />
      </>
    </TableSortContext.Provider>
  );
}

const THead = ({ className, ...props }: React.ComponentProps<"thead">) => {
  return (
    <TableHeaderRowContext.Provider value={true}>
      <thead
        data-slot="table-header"
        className={cn("[&_tr]:border-b-0 [&_tr]:bg-muted dark:[&_tr]:bg-gray-700", className)}
        {...props}
      />
    </TableHeaderRowContext.Provider>
  );
}

const TBody = ({ className, ...props }: React.ComponentProps<"tbody">) => {
  return (
    <tbody
      data-slot="table-body"
      className={cn(className)}
      {...props}
    />
  );
}

const TFoot = ({ className, ...props }: React.ComponentProps<"tfoot">) => {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn("bg-gray-100 dark:bg-gray-700/40 border-t font-medium [&>tr]:last:border-b-0", className)}
      {...props}
    />
  );
}

type TrProps = React.ComponentProps<"tr"> & {
  noHover?: boolean
}

const Tr = ({ className, noHover, children, ...props }: TrProps) => {
  const isHeaderRow = React.useContext(TableHeaderRowContext)
  const resize = React.useContext(TableResizeContext)

  const content = isHeaderRow && resize
    ? React.Children.map(children, (child, index) =>
        React.isValidElement<ThProps>(child)
          ? React.cloneElement(child, { columnIndex: index })
          : child,
      )
    : children

  return (
    <tr
      data-slot="table-row"
      className={cn(
        "px-2 border-b transition-colors data-[state=selected]:bg-muted dark:data-[state=selected]:bg-gray-700/50",
        !noHover && (isHeaderRow
          ? "hover:bg-[#f3f3f7] dark:hover:bg-gray-600"
          : "hover:bg-muted/70 dark:hover:bg-gray-700/30"),
        className
      )}
      {...props}
    >
      {content}
    </tr>
  );
}

type ThProps = React.ComponentProps<"th"> & {
  sortable?: boolean
  column?: string
  columnIndex?: number
}

const Th = ({
  className,
  sortable,
  column,
  columnIndex,
  children,
  ...props
}: ThProps) => {
  const isSortable = sortable && column
  const { sortKey, sortDir, onSort } = useSortContext()
  const resize = React.useContext(TableResizeContext)
  const canResize = Boolean(resize) && typeof columnIndex === 'number'

  return (
    <th
      data-slot="table-head"
      className={cn(
        "px-2 py-4 font-semibold text-sm text-left text-gray-600 dark:text-gray-300 align-middle whitespace-nowrap border-0 [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        isSortable && "cursor-pointer select-none hover:text-gray-700 dark:hover:text-gray-200",
        canResize && "relative",
        className
      )}
      onClick={isSortable ? () => onSort(column) : undefined}
      {...props}
    >
      {isSortable ? (
        <>
          {children}
          <SortIcon
            column={column}
            sortKey={sortKey}
            sortDir={sortDir}
          />
        </>
      ) : (
        children
      )}
      {canResize && (
        <span
          data-slot="table-column-resizer"
          role="separator"
          aria-orientation="vertical"
          className="absolute right-0 top-0 h-full w-1.5 cursor-col-resize touch-none select-none hover:bg-blue-500/40 active:bg-blue-500/60"
          onPointerDown={(event) => resize?.onResizeStart(columnIndex as number, event)}
          onClick={(event) => event.stopPropagation()}
        />
      )}
    </th>
  );
}

const Td = ({ className, children, title, ...props }: React.ComponentProps<"td">) => {
  const isTruncated = className?.includes('truncate');
  const autoTitle = title ?? (isTruncated && typeof children === 'string' ? children : undefined);

  return (
    <td
      data-slot="table-cell"
      title={autoTitle}
      className={cn("px-2 py-3 align-top text-sm text-gray-900 dark:text-gray-100 whitespace-nowrap cursor-default border-0 [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]", className)}
      {...props}
    >
      {children}
    </td>
  );
}

const Tc = ({ className, ...props }: React.ComponentProps<"caption">) => {
  return (
    <caption
      data-slot="table-caption"
      className={cn("text-muted-foreground mt-4 text-sm", className)}
      {...props}
    />
  );
}

export {
  Table,
  THead,
  TBody,
  TFoot,
  Th,
  Tr,
  Td,
  Tc,
}