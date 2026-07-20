import { TaskStatus } from "@prisma/client"
import { prisma } from "@/lib/prisma"

// UTC midnight of the current local calendar date — the key we store/query
// MedicationDose.takenOn (@db.Date) against.
export function todayKey(): Date {
  const d = new Date()
  return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
}

const DAILY_FREQUENCIES = new Set([
  "ONCE_DAILY",
  "TWICE_DAILY",
  "THREE_TIMES_DAILY",
  "FOUR_TIMES_DAILY",
])

export type MedsTodaySummary = {
  expected: number
  taken: number
  meds: Array<{ id: string; name: string; dosage: string; takenToday: boolean }>
}

// v1 adherence: "taken today" is a per-medication boolean for active daily meds.
export async function getMedsTodaySummary(
  familyId: string
): Promise<MedsTodaySummary> {
  const meds = await prisma.medication.findMany({
    where: { familyId, active: true },
    select: { id: true, name: true, dosage: true, frequency: true },
    orderBy: { name: "asc" },
  })
  const dailyMeds = meds.filter((m) => DAILY_FREQUENCIES.has(m.frequency))

  const doses = dailyMeds.length
    ? await prisma.medicationDose.findMany({
        where: {
          familyId,
          takenOn: todayKey(),
          medicationId: { in: dailyMeds.map((m) => m.id) },
        },
        select: { medicationId: true },
      })
    : []
  const takenIds = new Set(doses.map((d) => d.medicationId))

  return {
    expected: dailyMeds.length,
    taken: takenIds.size,
    meds: dailyMeds.map((m) => ({
      id: m.id,
      name: m.name,
      dosage: m.dosage,
      takenToday: takenIds.has(m.id),
    })),
  }
}

export type MyBalance = { owedToYou: number; youOwe: number; net: number }

// Net balance from shared costs: what others still owe on costs I fronted,
// minus what I still owe on costs someone else fronted. Costs with no known
// payer are ignored.
export async function getMyBalance(
  familyId: string,
  userId: string
): Promise<MyBalance> {
  const costs = await prisma.cost.findMany({
    where: { familyId, paidBy: { not: null } },
    select: {
      paidBy: true,
      splits: {
        where: { status: "PENDING" },
        select: { userId: true, amount: true },
      },
    },
  })

  let owedToYou = 0
  let youOwe = 0
  for (const cost of costs) {
    if (cost.paidBy === userId) {
      for (const s of cost.splits) if (s.userId !== userId) owedToYou += s.amount
    } else {
      for (const s of cost.splits) if (s.userId === userId) youOwe += s.amount
    }
  }
  return {
    owedToYou: Math.round(owedToYou * 100) / 100,
    youOwe: Math.round(youOwe * 100) / 100,
    net: Math.round((owedToYou - youOwe) * 100) / 100,
  }
}

export type TaskSummaryItem = {
  id: string
  title: string
  description: string | null
  priority: string
  status: string
  dueDate: string | null
  dueToday: boolean
  assignees: string[]
  assigneeIds: string[]
}

export type TasksSummary = {
  openCount: number
  dueTodayCount: number
  tasks: TaskSummaryItem[]
}

export async function getTasksSummary(familyId: string): Promise<TasksSummary> {
  const openWhere = {
    familyId,
    status: { in: [TaskStatus.TODO, TaskStatus.IN_PROGRESS] },
  }

  const [openCount, tasks] = await Promise.all([
    prisma.task.count({ where: openWhere }),
    prisma.task.findMany({
      where: openWhere,
      include: {
        assignments: {
          include: { user: { select: { name: true, email: true } } },
        },
      },
      orderBy: [{ dueDate: "asc" }, { priority: "desc" }],
      take: 4,
    }),
  ])

  const now = new Date()
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)

  let dueTodayCount = 0
  const items: TaskSummaryItem[] = tasks.map((t) => {
    const dueToday = !!t.dueDate && t.dueDate <= endOfToday
    if (dueToday) dueTodayCount++
    return {
      id: t.id,
      title: t.title,
      description: t.description,
      priority: t.priority,
      status: t.status,
      dueDate: t.dueDate ? t.dueDate.toISOString() : null,
      dueToday,
      assignees: t.assignments.map((a) => a.user.name || a.user.email),
      assigneeIds: t.assignments.map((a) => a.userId),
    }
  })

  return { openCount, dueTodayCount, tasks: items }
}
