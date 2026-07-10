import { prisma } from "@/lib/prisma"

// A compact signature of a family's care data. When any of the underlying
// records change (count or latest updatedAt), the signature changes — so cached
// AI output keyed on it is invalidated automatically. Messages are only included
// for the chat assistant (the dashboard highlight never reads them).
export async function getFamilyDataVersion(
  familyId: string,
  options: { includeMessages?: boolean } = {}
): Promise<string> {
  const [family, tasks, events, notes, meds, carePlan, careRecipient, messages] =
    await Promise.all([
      prisma.family.findUnique({
        where: { id: familyId },
        select: { updatedAt: true },
      }),
      prisma.task.aggregate({ where: { familyId }, _max: { updatedAt: true }, _count: { _all: true } }),
      prisma.event.aggregate({ where: { familyId }, _max: { updatedAt: true }, _count: { _all: true } }),
      prisma.note.aggregate({ where: { familyId }, _max: { updatedAt: true }, _count: { _all: true } }),
      prisma.medication.aggregate({ where: { familyId }, _max: { updatedAt: true }, _count: { _all: true } }),
      prisma.carePlan.aggregate({ where: { familyId }, _max: { updatedAt: true }, _count: { _all: true } }),
      prisma.careRecipient.aggregate({ where: { familyId }, _max: { updatedAt: true }, _count: { _all: true } }),
      options.includeMessages
        ? prisma.message.aggregate({ where: { familyId }, _max: { updatedAt: true }, _count: { _all: true } })
        : Promise.resolve(null),
    ])

  const t = (d: Date | null | undefined) => (d ? d.getTime() : 0)
  const parts = [
    `f${t(family?.updatedAt)}`,
    `t${tasks._count._all}.${t(tasks._max.updatedAt)}`,
    `e${events._count._all}.${t(events._max.updatedAt)}`,
    `n${notes._count._all}.${t(notes._max.updatedAt)}`,
    `m${meds._count._all}.${t(meds._max.updatedAt)}`,
    `p${carePlan._count._all}.${t(carePlan._max.updatedAt)}`,
    `r${careRecipient._count._all}.${t(careRecipient._max.updatedAt)}`,
  ]
  if (messages) {
    parts.push(`msg${messages._count._all}.${t(messages._max.updatedAt)}`)
  }
  return parts.join("|")
}
