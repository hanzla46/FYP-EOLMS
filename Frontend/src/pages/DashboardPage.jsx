import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Doughnut, Bar } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js'
import api from '../services/api'

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend)

export default function DashboardPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/dashboard').then(res => setData(res.data.data)).catch(console.error).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="p-6 text-center text-gray-500">Loading...</div>
  if (!data) return <div className="p-6 text-center text-gray-500">Failed to load dashboard.</div>

  const speciesChart = {
    labels: data.species_breakdown.map(s => s.species),
    datasets: [{
      data: data.species_breakdown.map(s => parseInt(s.count)),
      backgroundColor: ['#3b82f6', '#10b981', '#f59e0b'],
    }],
  }

  const productionChart = {
    labels: data.production_30d.map(p => p.production_type),
    datasets: [{
      label: '30-Day Total',
      data: data.production_30d.map(p => parseFloat(p.total)),
      backgroundColor: ['#3b82f6', '#10b981', '#f59e0b'],
    }],
  }

  const severityColors = { Critical: 'border-red-500 bg-red-50', Warning: 'border-yellow-500 bg-yellow-50', Info: 'border-blue-500 bg-blue-50' }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Link to="/animals" className="bg-white rounded-xl shadow p-5 hover:shadow-md transition">
          <p className="text-sm text-gray-500">Animals</p>
          <p className="text-3xl font-bold mt-1">{data.animals.total}</p>
          <div className="flex gap-3 mt-2 text-xs text-gray-400">
            <span className="text-green-600">{data.animals.active} active</span>
            {data.animals.quarantined > 0 && <span className="text-yellow-600">{data.animals.quarantined} quarantined</span>}
            {data.animals.pregnant > 0 && <span className="text-purple-600">{data.animals.pregnant} pregnant</span>}
          </div>
        </Link>

        <Link to="/breeding" className="bg-white rounded-xl shadow p-5 hover:shadow-md transition">
          <p className="text-sm text-gray-500">Pregnancies</p>
          <p className="text-3xl font-bold mt-1">{data.breeding.active_pregnancies}</p>
          <p className="text-xs text-gray-400 mt-2">
            {data.breeding.calving_due > 0 ? `${data.breeding.calving_due} due within 14 days` : 'None due soon'}
          </p>
        </Link>

        <Link to="/inventory" className="bg-white rounded-xl shadow p-5 hover:shadow-md transition">
          <p className="text-sm text-gray-500">Inventory</p>
          <p className="text-3xl font-bold mt-1">{data.inventory.total}</p>
          <p className={`text-xs mt-2 ${data.inventory.low_stock > 0 ? 'text-red-600 font-medium' : 'text-gray-400'}`}>
            {data.inventory.low_stock > 0 ? `${data.inventory.low_stock} low stock` : 'All stocked'}
          </p>
        </Link>

        <Link to="/finance" className="bg-white rounded-xl shadow p-5 hover:shadow-md transition">
          <p className="text-sm text-gray-500">Revenue (30d)</p>
          <p className={`text-2xl font-bold mt-1 ${data.finance_30d.net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            PKR {parseFloat(data.finance_30d.net).toLocaleString()}
          </p>
          <div className="flex gap-3 mt-2 text-xs">
            <span className="text-green-600">+PKR {parseFloat(data.finance_30d.income).toLocaleString()}</span>
            <span className="text-red-500">-PKR {parseFloat(data.finance_30d.expenses).toLocaleString()}</span>
          </div>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="font-medium text-gray-700 mb-4">Species Breakdown</h3>
              <div className="w-48 mx-auto">
                <Doughnut data={speciesChart} options={{ responsive: true, plugins: { legend: { position: 'bottom' } } }} />
              </div>
            </div>
            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="font-medium text-gray-700 mb-4">Production (30d)</h3>
              {data.production_30d.length > 0 ? (
                <Bar data={productionChart} options={{ responsive: true, plugins: { legend: { display: false } } }} />
              ) : (
                <p className="text-gray-400 text-sm text-center py-8">No production data</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-700">Critical Alerts</h3>
            <Link to="/alerts" className="text-xs text-blue-600 hover:underline">View all</Link>
          </div>
          {data.alerts.recent.length > 0 ? (
            <div className="space-y-3">
              {data.alerts.recent.map(a => (
                <div key={a.id} className={`border-l-4 ${severityColors[a.severity] || 'border-gray-300'} rounded-r-lg p-3`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                      a.severity === 'Critical' ? 'bg-red-100 text-red-800' :
                      a.severity === 'Warning' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'
                    }`}>{a.severity}</span>
                    <span className="text-xs text-gray-400">{a.alert_type}</span>
                  </div>
                  <p className="text-sm text-gray-700">{a.message}</p>
                  <p className="text-xs text-gray-400 mt-1">{new Date(a.created_at).toLocaleString()}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm text-center py-4">No alerts</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Link to="/health/new" className="bg-white rounded-xl shadow p-4 hover:shadow-md transition flex items-center gap-3">
          <span className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-lg">+</span>
          <div><p className="font-medium text-sm">New Health Record</p><p className="text-xs text-gray-400">Clinical entry</p></div>
        </Link>
        <Link to="/production/add" className="bg-white rounded-xl shadow p-4 hover:shadow-md transition flex items-center gap-3">
          <span className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-lg">+</span>
          <div><p className="font-medium text-sm">Log Production</p><p className="text-xs text-gray-400">Milk/Weight/Wool</p></div>
        </Link>
        <Link to="/animals/register" className="bg-white rounded-xl shadow p-4 hover:shadow-md transition flex items-center gap-3">
          <span className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 text-lg">+</span>
          <div><p className="font-medium text-sm">Register Animal</p><p className="text-xs text-gray-400">New livestock</p></div>
        </Link>
        <Link to="/finance" className="bg-white rounded-xl shadow p-4 hover:shadow-md transition flex items-center gap-3">
          <span className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600 text-lg">$</span>
          <div><p className="font-medium text-sm">Finance</p><p className="text-xs text-gray-400">P&L summary</p></div>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link to="/animals" className="bg-white rounded-xl shadow p-4 text-center hover:shadow-md transition">
          <p className="text-lg font-bold">{data.health.total}</p>
          <p className="text-sm text-gray-500">Total Health Records</p>
        </Link>
        <Link to="/users" className="bg-white rounded-xl shadow p-4 text-center hover:shadow-md transition">
          <p className="text-lg font-bold">{data.users.total}</p>
          <p className="text-sm text-gray-500">System Users</p>
        </Link>
        <Link to="/alerts" className="bg-white rounded-xl shadow p-4 text-center hover:shadow-md transition">
          <p className="text-lg font-bold text-red-600">{data.alerts.unread}</p>
          <p className="text-sm text-gray-500">Unread Notifications</p>
        </Link>
      </div>
    </div>
  )
}
