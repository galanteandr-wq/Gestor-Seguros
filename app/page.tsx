import { Nav } from '@/components/Nav'
import { prisma } from '@/lib/prisma'
import { requireUserId } from '@/lib/auth'

async function getKpis(userId: string) {
  const total = await prisma.policy.count({ where: { userId } })
  const now = new Date()
  const in30 = new Date(now.getTime() + 30*24*60*60*1000)
  const vencidas = await prisma.policy.count({ where: { userId, fechaVencimiento: { lt: now } } })
  const proximas = await prisma.policy.count({ where: { userId, fechaVencimiento: { gte: now, lte: in30 } } })
  const activas = total - vencidas - proximas
  return { total, activas, proximas, vencidas }
}

export default async function Page() {
  const userId = await requireUserId()
  const kpis = await getKpis(userId)
  return (
    <div>
      <Nav />
      <div className="container py-6">
        <div className="grid gap-4 md:grid-cols-4">
          <div className="card p-4 kpi">
            <div className="text-sm text-gray-500">Total pólizas</div>
            <div className="mt-2 text-3xl font-semibold">{kpis.total}</div>
          </div>
          <div className="card p-4 kpi">
            <div className="text-sm text-gray-500">Activas (30+ días)</div>
            <div className="mt-2 text-3xl font-semibold">{kpis.activas}</div>
          </div>
          <div className="card p-4 kpi">
            <div className="text-sm text-gray-500">Próximas (≤30 días)</div>
            <div className="mt-2 text-3xl font-semibold">{kpis.proximas}</div>
          </div>
          <div className="card p-4 kpi">
            <div className="text-sm text-gray-500">Vencidas</div>
            <div className="mt-2 text-3xl font-semibold">{kpis.vencidas}</div>
          </div>
        </div>
        <div className="mt-6 card p-4">
          <div className="flex items-center justify-between">
            <div className="font-medium">Vencimientos recientes</div>
          </div>
          {/* TODO: mini tabla o gráfico */}
          <div className="text-sm text-gray-500 mt-2">Próximamente: gráfico y alertas por email.</div>
        </div>
      </div>
    </div>
  )
}
