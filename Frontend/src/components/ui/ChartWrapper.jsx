import { useRef, useEffect } from 'react'
import { Chart, registerables } from 'chart.js'
import { cn } from '../../lib/utils'

Chart.register(...registerables)

const tokenColors = {
  pasture: '#1F4D3A',
  pastureLight: '#4CAE82',
  wheat: '#C8862B',
  wheatLight: '#E0A24A',
  clay: '#B23A2E',
  clayLight: '#E2675A',
  slate: '#6B7770',
  slateLight: '#9AA79E',
}

const segmentPalette = [
  '#1F4D3A', '#4CAE82', '#C8862B', '#E0A24A', '#B23A2E', '#E2675A', '#6B7770', '#9AA79E',
  '#2C6B4F', '#7CC9A0', '#D99B3E', '#F0C17A', '#C85B50', '#F0908A', '#8A9790', '#B8C4BB',
]

function isPieType(type) {
  return type === 'doughnut' || type === 'pie' || type === 'polarArea'
}

export function ChartWrapper({ type, data, options, className, height = 300 }) {
  const canvasRef = useRef(null)
  const chartRef = useRef(null)

  useEffect(() => {
    if (!canvasRef.current) return
    if (chartRef.current) chartRef.current.destroy()

    const ctx = canvasRef.current.getContext('2d')
    chartRef.current = new Chart(ctx, {
      type,
      data: {
        ...data,
        datasets: (data?.datasets || []).map((ds, i) => {
          const pie = isPieType(type)

          if (pie && ds.data && Array.isArray(ds.data) && !ds.backgroundColor) {
            return {
              ...ds,
              borderColor: ds.borderColor || '#ffffff',
              borderWidth: ds.borderWidth ?? 2,
              backgroundColor: ds.data.map((_, j) => segmentPalette[j % segmentPalette.length]),
            }
          }

          return {
            ...ds,
            borderColor: ds.borderColor || (i === 0 ? tokenColors.pasture : i === 1 ? tokenColors.wheat : tokenColors.clay),
            backgroundColor: ds.backgroundColor || (i === 0 ? tokenColors.pastureLight + '40' : i === 1 ? tokenColors.wheatLight + '40' : tokenColors.clayLight + '40'),
          }
        }),
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: { color: tokenColors.slate, font: { family: 'IBM Plex Sans' }, padding: 16, usePointStyle: true },
          },
        },
        scales: !isPieType(type) ? {
          x: { ticks: { color: tokenColors.slate }, grid: { color: tokenColors.slateLight + '20' } },
          y: { ticks: { color: tokenColors.slate }, grid: { color: tokenColors.slateLight + '20' } },
        } : undefined,
        ...options,
      },
    })

    return () => { if (chartRef.current) chartRef.current.destroy() }
  }, [type, data, options])

  return (
    <div className={cn('bg-white dark:bg-[#16201A] rounded-md border border-slate2-400/20 dark:border-slate2-600/20 p-4', className)}>
      <div style={{ height }}>
        <canvas ref={canvasRef} />
      </div>
    </div>
  )
}
