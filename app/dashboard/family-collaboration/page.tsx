"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navigation from "@/app/components/Navigation";
import LeftNavigation from "@/app/components/LeftNavigation";
import Footer from "@/app/components/Footer";
import {
  UserPlus,
  MoreVertical,
  Send,
  Calendar,
  Mail,
  Phone,
} from "lucide-react";
import styles from "./page.module.css";

// Map database EventType to display type
const mapEventType = (dbType: string): string => {
  const typeMap: { [key: string]: string } = {
    APPOINTMENT: "Healthcare",
    VISIT: "Social Visit",
    FOOD_DELIVERY: "Food Delivery",
    BIRTHDAY: "Birthday",
    OTHER: "Other",
  };
  return typeMap[dbType] || dbType;
};

type TeamMember = {
  id: string;
  name: string;
  initials: string;
  color: string;
  active: boolean;
};

type MessageType = {
  id: string;
  message: string;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
};

type Event = {
  id: string;
  title: string;
  description: string;
  date: string;
  category: string;
  categoryColor: string;
  attendees: string[];
};

// Team members and events are now fetched from database

const avatarColors = [
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
  "#10b981",
  "#f59e0b",
  "#06b6d4",
];

function getInitials(name: string | null, email: string): string {
  if (name) {
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }
  return email.substring(0, 2).toUpperCase();
}

function getAvatarColor(userId: string): string {
  // Use userId to generate consistent color
  const hash = userId
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return avatarColors[hash % avatarColors.length];
}

export default function FamilyCollaborationPage() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [familyId, setFamilyId] = useState<string | null>(null);
  const [familyMembers, setFamilyMembers] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [taskDistribution, setTaskDistribution] = useState<any[]>([]);
  const [showRebalance, setShowRebalance] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const previousMessageCountRef = useRef(0);
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);

  // Fetch user's first family and members
  useEffect(() => {
    async function fetchFamily() {
      try {
        const res = await fetch("/api/families");
        if (!res.ok) throw new Error("Failed to fetch families");
        const families = await res.json();

        // API returns array directly
        const familiesArray = Array.isArray(families) ? families : [];

        if (familiesArray.length > 0) {
          const family = familiesArray[0];
          setFamilyId(family.id);

          // Fetch family members
          const membersRes = await fetch(`/api/families/${family.id}/members`);
          if (membersRes.ok) {
            const membersData = await membersRes.json();
            setFamilyMembers(membersData);

            // Fetch tasks
            const tasksRes = await fetch(`/api/families/${family.id}/tasks`);
            if (tasksRes.ok) {
              const tasksData = await tasksRes.json();
              setTasks(tasksData);
              calculateTaskDistribution(tasksData, membersData);
            }

            // Fetch upcoming events
            const eventsRes = await fetch(`/api/families/${family.id}/events`);
            if (eventsRes.ok) {
              const eventsData = await eventsRes.json();
              // Filter to upcoming events and take first 2
              const upcoming = eventsData
                .filter((evt: any) => new Date(evt.eventDate) >= new Date())
                .sort(
                  (a: any, b: any) =>
                    new Date(a.eventDate).getTime() -
                    new Date(b.eventDate).getTime()
                )
                .slice(0, 2)
                .map((evt: any) => ({
                  id: evt.id,
                  title: evt.title,
                  description: evt.description || "",
                  date: new Date(evt.eventDate).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  }),
                  category: mapEventType(evt.type), // Convert DB type to display type
                  categoryColor: "#6366f1",
                  attendees: ["FM"], // Can be enhanced later
                }));
              setUpcomingEvents(upcoming);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching families:", error);
      }
    }
    fetchFamily();
  }, []);

  const calculateTaskDistribution = (tasksData: any[], membersData: any[]) => {
    // Count tasks per member
    const memberTaskCounts: { [key: string]: number } = {};
    const totalTasks = tasksData.filter((t) => t.status !== "COMPLETED").length;

    if (totalTasks === 0) {
      setTaskDistribution([]);
      return;
    }

    tasksData.forEach((task) => {
      if (task.status === "COMPLETED") return;

      task.assignments?.forEach((assignment: any) => {
        memberTaskCounts[assignment.userId] =
          (memberTaskCounts[assignment.userId] || 0) + 1;
      });
    });

    const distribution = membersData
      .map((member, index) => {
        const taskCount = memberTaskCounts[member.userId] || 0;
        const percentage = totalTasks > 0 ? (taskCount / totalTasks) * 100 : 0;
        const color = getAvatarColor(member.userId);

        return {
          userId: member.userId,
          name: member.user.name || member.user.email,
          taskCount,
          percentage: Math.round(percentage),
          color,
        };
      })
      .sort((a, b) => b.taskCount - a.taskCount);

    setTaskDistribution(distribution);
  };

  const handleReassignTask = async (taskId: string, newUserId: string) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assignedMembers: [newUserId],
          title: tasks.find((t) => t.id === taskId)?.title,
          description: tasks.find((t) => t.id === taskId)?.description,
          priority: tasks.find((t) => t.id === taskId)?.priority,
          status: tasks.find((t) => t.id === taskId)?.status,
        }),
      });

      if (!res.ok) throw new Error("Failed to reassign task");

      // Refresh tasks
      if (familyId) {
        const tasksRes = await fetch(`/api/families/${familyId}/tasks`);
        if (tasksRes.ok) {
          const tasksData = await tasksRes.json();
          setTasks(tasksData);
          calculateTaskDistribution(tasksData, familyMembers);
        }
      }
    } catch (error) {
      console.error("Error reassigning task:", error);
      alert("Failed to reassign task");
    }
  };

  // Fetch messages when familyId is available
  useEffect(() => {
    if (!familyId) return;

    async function fetchMessages() {
      try {
        const res = await fetch(`/api/families/${familyId}/messages`);
        if (!res.ok) throw new Error("Failed to fetch messages");
        const data = await res.json();
        setMessages(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching messages:", error);
        setLoading(false);
      }
    }

    fetchMessages();

    // Poll for new messages every 3 seconds
    const interval = setInterval(fetchMessages, 3000);

    return () => clearInterval(interval);
  }, [familyId]);

  // Update previous message count (for future enhancements)
  useEffect(() => {
    previousMessageCountRef.current = messages.length;
  }, [messages.length]);

  const handleSendMessage = async () => {
    if (!message.trim() || !familyId || sending) return;

    setSending(true);
    try {
      const res = await fetch(`/api/families/${familyId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: message.trim() }),
      });

      if (!res.ok) throw new Error("Failed to send message");

      const newMessage = await res.json();
      setMessages((prev) => [newMessage, ...prev]); // Add new message at the top
      setMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className={styles.container}>
      <Navigation showAuthLinks={true} />

      <div className={styles.layout}>
        <LeftNavigation />
        <main className={styles.main}>
          <div className={styles.pageHeader}>
            <div>
              <h1>Family Collaboration</h1>
              <p className={styles.subtitle}>
                Connect and coordinate with your caregiving team
              </p>
            </div>
            <button className={styles.inviteBtn}>
              <UserPlus size={18} />
              Invite Family Member
            </button>
          </div>

          <div className={styles.topGrid}>
            {/* Caregiving Team */}
            <div className={styles.card}>
              <h2>Caregiving Team</h2>
              <p className={styles.cardSubtitle}>
                People helping with Martha Johnson's care
              </p>

              <div className={styles.teamList}>
                {familyMembers.map((member) => {
                  const memberColor = getAvatarColor(member.userId);
                  const initials = (member.user.name || member.user.email)
                    .charAt(0)
                    .toUpperCase();

                  return (
                    <Link
                      key={member.id}
                      href={`/family/${familyId}/members/${member.userId}`}
                      className={styles.teamMember}
                    >
                      <div
                        className={styles.avatar}
                        style={{ background: memberColor }}
                      >
                        {initials}
                      </div>
                      <div className={styles.memberInfo}>
                        <div className={styles.memberName}>
                          {member.user.name || member.user.email}
                        </div>
                        <div className={styles.memberRole}>
                          {member.role === "CARE_MANAGER"
                            ? "⭐ Care Manager"
                            : "Family Member"}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>

              <button className={styles.inviteMemberBtn}>
                <UserPlus size={16} />
                Invite Family Member
              </button>
            </div>

            {/* Family Communication */}
            <div className={styles.card}>
              <h2>Family Communication</h2>
              <p className={styles.cardSubtitle}>
                Messages about Martha Johnson's care
              </p>

              <div className={styles.messagesArea}>
                {loading ? (
                  <div className={styles.loadingState}>Loading messages...</div>
                ) : messages.length === 0 ? (
                  <div className={styles.emptyState}>
                    <p>No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const initials = getInitials(msg.user.name, msg.user.email);
                    const color = getAvatarColor(msg.user.id);
                    return (
                      <div key={msg.id} className={styles.messageBubble}>
                        <div
                          className={styles.messageAvatar}
                          style={{ background: color }}
                        >
                          {initials}
                        </div>
                        <div className={styles.messageWrapper}>
                          <div className={styles.messageMeta}>
                            <span className={styles.messageSender}>
                              {msg.user.name || msg.user.email}
                            </span>
                            <span className={styles.messageTime}>
                              {new Date(msg.createdAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                          <div className={styles.messageContent}>
                            {msg.message}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <div className={styles.messageInput}>
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) =>
                    e.key === "Enter" && !e.shiftKey && handleSendMessage()
                  }
                  disabled={sending || !familyId}
                />
                <button
                  onClick={handleSendMessage}
                  className={styles.sendBtn}
                  disabled={sending || !message.trim() || !familyId}
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* Task Distribution */}
          <div className={styles.card}>
            <h2>Task Distribution</h2>
            <p className={styles.cardSubtitle}>
              Active task workload across family members
            </p>

            <div className={styles.taskBars}>
              {taskDistribution.length === 0 ? (
                <p className={styles.emptyText}>
                  No active tasks to distribute
                </p>
              ) : (
                taskDistribution.map((person) => (
                  <div key={person.userId} className={styles.taskRow}>
                    <div className={styles.taskName}>
                      {person.name}
                      <span className={styles.taskCount}>
                        ({person.taskCount} tasks)
                      </span>
                    </div>
                    <div className={styles.taskBarContainer}>
                      <div
                        className={styles.taskBar}
                        style={{
                          width: `${person.percentage}%`,
                          background: person.color,
                        }}
                      ></div>
                    </div>
                    <div className={styles.taskPercentage}>
                      {person.percentage}%
                    </div>
                  </div>
                ))
              )}
            </div>

            {tasks.filter((t) => t.status !== "COMPLETED").length > 0 && (
              <button
                className={styles.rebalanceBtn}
                onClick={() => setShowRebalance(true)}
              >
                Rebalance Tasks
              </button>
            )}
          </div>

          {/* Upcoming Family Events */}
          <div className={styles.eventsSection}>
            <h2>Upcoming Family Events</h2>

            <div className={styles.eventsGrid}>
              {upcomingEvents.map((event) => (
                <div key={event.id} className={styles.eventCard}>
                  <div className={styles.eventHeader}>
                    <span
                      className={styles.eventCategory}
                      style={{ background: event.categoryColor }}
                    >
                      {event.category}
                    </span>
                    <div className={styles.eventDate}>
                      <Calendar size={14} />
                      {event.date}
                    </div>
                  </div>
                  <h3>{event.title}</h3>
                  <p>{event.description}</p>
                  <div className={styles.eventAttendees}>
                    {event.attendees.map((attendee: string, idx: number) => (
                      <div key={idx} className={styles.attendeeAvatar}>
                        {attendee}
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <div className={styles.scheduleEventCard}>
                <Calendar size={48} className={styles.calendarIcon} />
                <h3>Plan a Family Event</h3>
                <p>Schedule time together to coordinate care and connect</p>
                <button className={styles.scheduleBtn}>Schedule Event</button>
              </div>
            </div>
          </div>

          {/* Family Contact Information */}
          <div className={styles.contactSection}>
            <h2>Family Contact Information</h2>

            <div className={styles.contactGrid}>
              {familyMembers.map((member) => {
                const memberColor = getAvatarColor(member.userId);
                const initials = getInitials(
                  member.user.name,
                  member.user.email
                );

                return (
                  <div key={member.id} className={styles.contactCard}>
                    <div
                      className={styles.contactAvatar}
                      style={{ background: memberColor }}
                    >
                      {initials}
                    </div>
                    <h3>{member.user.name || member.user.email}</h3>
                    <div className={styles.contactInfo}>
                      <Mail size={14} />
                      <span>{member.user.email}</span>
                    </div>
                    <div className={styles.contactInfo}>
                      <Phone size={14} />
                      <span>
                        {member.role === "CARE_MANAGER"
                          ? "Primary Contact"
                          : "Contact info not available"}
                      </span>
                    </div>
                  </div>
                );
              })}
              {familyMembers.length === 0 && (
                <div
                  style={{
                    padding: "2rem",
                    color: "#6c757d",
                    gridColumn: "1 / -1",
                  }}
                >
                  No family members yet
                </div>
              )}
            </div>
          </div>

          {/* Rebalance Tasks Modal */}
          {showRebalance && (
            <div
              className={styles.modal}
              onClick={() => setShowRebalance(false)}
            >
              <div
                className={styles.modalContent}
                onClick={(e) => e.stopPropagation()}
              >
                <div className={styles.modalHeader}>
                  <h2>Rebalance Tasks</h2>
                  <p>
                    Quickly reassign tasks to balance workload across family
                    members
                  </p>
                </div>

                <div className={styles.rebalanceList}>
                  {tasks
                    .filter((t) => t.status !== "COMPLETED")
                    .map((task) => {
                      const currentAssignee = task.assignments?.[0];
                      const assignedName = currentAssignee
                        ? familyMembers.find(
                            (m) => m.userId === currentAssignee.userId
                          )?.user.name || currentAssignee.user.name
                        : "Unassigned";

                      return (
                        <div key={task.id} className={styles.rebalanceItem}>
                          <div className={styles.taskInfo}>
                            <h4>{task.title}</h4>
                            <p className={styles.taskMeta}>
                              <span
                                className={`${styles.priorityBadge} ${
                                  styles[`priority${task.priority}`]
                                }`}
                              >
                                {task.priority}
                              </span>
                              {task.dueDate && (
                                <span>
                                  Due:{" "}
                                  {new Date(task.dueDate).toLocaleDateString()}
                                </span>
                              )}
                            </p>
                          </div>
                          <div className={styles.reassignControl}>
                            <label>Assign to:</label>
                            <select
                              value={currentAssignee?.userId || ""}
                              onChange={(e) =>
                                handleReassignTask(task.id, e.target.value)
                              }
                              className={styles.memberSelect}
                            >
                              <option value="">Unassigned</option>
                              {familyMembers.map((member) => (
                                <option
                                  key={member.userId}
                                  value={member.userId}
                                >
                                  {member.user.name || member.user.email}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      );
                    })}
                </div>

                <div className={styles.modalActions}>
                  <button
                    className={styles.doneBtn}
                    onClick={() => setShowRebalance(false)}
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
