import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import AccessibleRecipientView from "../../components/AccessibleRecipientView";

export default async function CarePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const membership = await prisma.familyMember.findFirst({
    where: {
      userId: user.id,
      role: "CARE_RECIPIENT",
    },
    include: {
      family: true,
    },
  });

  if (!membership) {
    redirect("/dashboard");
  }

  const familyId = membership.familyId;

  const [members, events, tasks, messages] = await Promise.all([
    prisma.familyMember.findMany({
      where: { familyId },
      include: {
        user: {
          select: { name: true, email: true },
        },
      },
    }),
    prisma.event.findMany({
      where: {
        familyId,
        eventDate: { gte: new Date() },
      },
      orderBy: { eventDate: "asc" },
      take: 5,
    }),
    prisma.task.findMany({
      where: {
        familyId,
        status: { not: "COMPLETED" },
      },
      orderBy: { dueDate: "asc" },
      take: 5,
    }),
    prisma.message.findMany({
      where: { familyId },
      include: {
        user: {
          select: { name: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  return (
    <AccessibleRecipientView
      userName={user.name || "there"}
      familyName={membership.family.name}
      members={members.map((member) => ({
        id: member.id,
        name: member.user.name || member.user.email,
        role: member.role,
      }))}
      events={events.map((event) => ({
        id: event.id,
        title: event.title,
        eventDate: event.eventDate.toISOString(),
        location: event.location,
      }))}
      tasks={tasks.map((task) => ({
        id: task.id,
        title: task.title,
        dueDate: task.dueDate ? task.dueDate.toISOString() : null,
      }))}
      messages={messages.map((message) => ({
        id: message.id,
        text: message.message,
        authorName: message.user.name || "A family member",
        createdAt: message.createdAt.toISOString(),
      }))}
    />
  );
}
