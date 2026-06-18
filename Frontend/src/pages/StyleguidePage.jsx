import { Badge, StatusPill } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card, CardContent, CardHeader } from '../components/ui/Card'
import { Input, Select, Textarea } from '../components/ui/Input'
import { StatCard } from '../components/ui/StatCard'
import { TagBadge } from '../components/ui/TagBadge'
import { Tabs } from '../components/ui/Tabs'
import { EmptyState } from '../components/ui/EmptyState'
import { PawPrint, Heart, TrendingUp } from 'lucide-react'

export default function StyleguidePage() {
  return (
    <div className="space-y-8">
      <h1 className="text-xl font-semibold text-ink-900 dark:text-ink-100">Style Guide</h1>

      <section>
        <h2 className="text-sm font-semibold text-slate2-400 uppercase tracking-wider mb-4">Color Tokens</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Pasture', shades: [100, 400, 500, 600], color: 'pasture' },
            { label: 'Wheat', shades: [100, 400, 500], color: 'wheat' },
            { label: 'Clay', shades: [100, 400, 600], color: 'clay' },
            { label: 'Mist', shades: [50, 900], color: 'mist' },
            { label: 'Ink', shades: [900, 100], color: 'ink' },
            { label: 'Slate 2', shades: [400, 600], color: 'slate2' },
          ].map(({ label, shades, color }) => (
            <div key={color} className="space-y-1">
              <span className="text-xs font-medium text-slate2-400">{label}</span>
              {shades.map(s => (
                <div key={s} className={`h-8 rounded-sm flex items-center justify-between px-2 bg-${color}-${s} ${s < 400 ? 'text-ink-900' : s === 400 || s === 500 ? 'text-white' : 'text-ink-100'}`}>
                  <span className="text-[10px] font-mono">{color}-{s}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold text-slate2-400 uppercase tracking-wider mb-4">Buttons</h2>
        <div className="flex flex-wrap gap-3 items-center">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="outline">Outline</Button>
          <Button size="sm">Small</Button>
          <Button size="lg">Large</Button>
          <Button disabled>Disabled</Button>
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold text-slate2-400 uppercase tracking-wider mb-4">Status Pills</h2>
        <div className="flex flex-wrap gap-2">
          <StatusPill status="Active" />
          <StatusPill status="Healthy" />
          <StatusPill status="Calved" />
          <StatusPill status="Completed" />
          <StatusPill status="Pending" />
          <StatusPill status="Pregnant" />
          <StatusPill status="Bred" />
          <StatusPill status="Quarantined" />
          <StatusPill status="Suspected" />
          <StatusPill status="Critical" />
          <StatusPill status="Failed" />
          <StatusPill status="Deceased" />
          <StatusPill status="Sold" />
          <StatusPill status="Inactive" />
          <StatusPill status="Disabled" />
        </div>
        <div className="flex flex-wrap gap-2 mt-4">
          <Badge variant="success">Success</Badge>
          <Badge variant="pending">Pending</Badge>
          <Badge variant="critical">Critical</Badge>
          <Badge variant="neutral">Neutral</Badge>
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold text-slate2-400 uppercase tracking-wider mb-4">Tag Badge</h2>
        <div className="flex flex-wrap gap-3 items-center">
          <TagBadge tag="LIV-26-00123" species="Cattle" />
          <TagBadge tag="LIV-26-00456" species="Sheep" />
          <TagBadge tag="LIV-26-00789" species="Goat" />
          <TagBadge tag="LIV-26-00123" species="Cattle" to="/" />
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold text-slate2-400 uppercase tracking-wider mb-4">Inputs</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md">
          <Input label="Text Input" placeholder="Enter text..." />
          <Input label="With Error" placeholder="Error state" error="This field is required" />
          <Select label="Select">
            <option>Option 1</option>
            <option>Option 2</option>
          </Select>
          <Select label="Select with Error" error="Please select an option">
            <option>Option 1</option>
          </Select>
          <Textarea label="Textarea" placeholder="Enter description..." rows={3} />
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold text-slate2-400 uppercase tracking-wider mb-4">Cards</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader><h3 className="font-medium text-ink-900 dark:text-ink-100">Card with Header</h3></CardHeader>
            <CardContent><p className="text-sm text-slate2-400">Card content goes here.</p></CardContent>
          </Card>
          <Card>
            <CardContent className="py-6">
              <p className="text-sm text-slate2-400">Card without header.</p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold text-slate2-400 uppercase tracking-wider mb-4">Stat Cards</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard title="Animals" value="100" icon={PawPrint} variant="pasture" />
          <StatCard title="Pending" value="15" icon={Heart} variant="wheat" />
          <StatCard title="Critical" value="3" icon={TrendingUp} variant="clay" />
          <StatCard title="Total" value="1,234" icon={PawPrint} variant="default" />
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold text-slate2-400 uppercase tracking-wider mb-4">Tabs</h2>
        <Tabs
          tabs={[{ key: 'one', label: 'Tab One' }, { key: 'two', label: 'Tab Two' }]}
          activeTab="one"
          onChange={() => {}}
        />
      </section>

      <section>
        <h2 className="text-sm font-semibold text-slate2-400 uppercase tracking-wider mb-4">Empty State</h2>
        <EmptyState
          icon={PawPrint}
          title="No records found"
          description="There are no records to display at this time. Add some data to get started."
          action={<Button size="sm">Add Record</Button>}
        />
      </section>
    </div>
  )
}
