import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Line, Bar } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler } from 'chart.js'
import productionService from '../services/productionService'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler)

export default function ProductionPage() {
  const [logs, setLogs] = useState([])
  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('dashboard')
  const navigate = useNavigate()

  const fetchData = async () => {
    try {
      const [logRes, dashRes] = await Promise.all([
        productionService.list({ limit: 50 }),
        productionService.dashboard(),
      ])
      setLogs(logRes.data.data)
      setDashboard(dashRes.data.data)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchData() }, [])

  const chartData = () => {
    if (!dashboard) return null
    const milkDates = dashboard.by_date
      .filter(d => d.production_type === 'Milk')
      .sort((a, b) => a.log_date.localeCompare(b.log_date))
      .slice(-30)

    return {
      labels: milkDates.map(d => d.log_date?.split('T')[0]),
      datasets: [{
        label: 'Milk Production (L)',
        data: milkDates.map(d => parseFloat(d.daily_total)),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.3,
      }],
    }
  }

  const summaryData = () => {
    if (!dashboard) return null
    return {
      labels: dashboard.summary.map(s => `${s.production_type} (${s.animal_count} animals)`),
      datasets: [{
        label: 'Total Production',
        data: dashboard.summary.map(s => parseFloat(s.total_quantity)),
        backgroundColor: ['#3b82f6', '#10b981', '#f59e0b'],
      }],
    }
  }

  if (loading) return <div className="p-6 text-center text-gray-500">Loading...</div>

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Production</h1>
        <button onClick={() => navigate('/production/add')}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium">
          + Log Production
        </button>
      </div>

      <div className="flex gap-1 mb-6 bg-white rounded-lg shadow p-1 w-fit">
        {['dashboard', 'logs'].map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded text-sm font-medium capitalize ${tab === t ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'dashboard' && dashboard && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {dashboard.summary.map((s) => (
              <div key={s.production_type} className="bg-white rounded-xl shadow p-5">
                <p className="text-sm text-gray-500">{s.production_type}</p>
                <p className="text-2xl font-bold mt-1">{parseFloat(s.total_quantity).toLocaleString()} <span className="text-sm font-normal text-gray-400">{s.production_type === 'Milk' ? 'L' : s.production_type === 'Wool' ? 'kg' : 'kg'}</span></p>
                <p className="text-xs text-gray-400 mt-1">{s.total_logs} logs &middot; {s.animal_count} animals</p>
              </div>
            ))}
            {dashboard.summary.length === 0 && <div className="col-span-full text-center py-8 text-gray-400">No production data yet.</div>}
          </div>

          {dashboard.by_date.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow p-6">
                <h3 className="font-medium text-gray-700 mb-4">Milk Trend (30 days)</h3>
                {chartData() && <Line data={chartData()} options={{ responsive: true, plugins: { legend: { display: false } } }} />}
              </div>
              <div className="bg-white rounded-xl shadow p-6">
                <h3 className="font-medium text-gray-700 mb-4">Production Summary</h3>
                {summaryData() && <Bar data={summaryData()} options={{ responsive: true, plugins: { legend: { display: false } } }} />}
              </div>
            </div>
          )}

          {dashboard.top_animals.length > 0 && (
            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="font-medium text-gray-700 mb-4">Top Producing Animals</h3>
              <table className="w-full text-sm">
                <thead className="text-gray-600 border-b">
                  <tr>
                    <th className="text-left py-2">Animal</th>
                    <th className="text-left py-2">Species</th>
                    <th className="text-left py-2">Type</th>
                    <th className="text-right py-2">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboard.top_animals.map((a, i) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="py-2"><Link to={`/animals/${a.id}`} className="text-blue-600 hover:underline">{a.tag_number}</Link></td>
                      <td className="py-2">{a.species}</td>
                      <td className="py-2">{a.production_type}</td>
                      <td className="py-2 text-right font-medium">{parseFloat(a.total_production).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === 'logs' && (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Date</th>
                <th className="px-4 py-3 text-left font-medium">Animal</th>
                <th className="px-4 py-3 text-left font-medium">Type</th>
                <th className="px-4 py-3 text-right font-medium">Quantity</th>
                <th className="px-4 py-3 text-left font-medium">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {logs.map((l) => (
                <tr key={l.id}>
                  <td className="px-4 py-3">{l.log_date?.split('T')[0]}</td>
                  <td className="px-4 py-3"><Link to={`/animals/${l.animal_id}`} className="text-blue-600 hover:underline">{l.animal_tag}</Link></td>
                  <td className="px-4 py-3">{l.production_type}</td>
                  <td className="px-4 py-3 text-right font-medium">{l.quantity} {l.unit}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs max-w-xs truncate">{l.notes || '—'}</td>
                </tr>
              ))}
              {logs.length === 0 && <tr><td colSpan="5" className="px-4 py-8 text-center text-gray-500">No production logs yet.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
