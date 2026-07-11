"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  UserPlus,
  Send,
  Calendar,
  Mail,
  MessageCircle,
} from "lucide-react";
import styles from "./page.module.css";

const caregiverRoles = new Set(["OWNER", "PRIMARY_CAREGIVER", "FAMILY_ADMIN"]);

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

// Team members and events are fetched from the database

const avatarColors = [
  "#287fae",
  "#0f766e",
  "#1d648d",
  "#c7771d",
  "#115e59",
  "#3f565d",
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

function formatDayLabel(dateStr: string): string {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

export default function FamilyCollaborationPage() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [familyId, setFamilyId] = useState<string | null>(null);
  const [elderName, setElderName] = useState<string>("your care recipient");
  const [familyMembers, setFamilyMembers] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [taskDistribution, setTaskDistribution] = useState<any[]>([]);
  const [showRebalance, setShowRebalance] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setCurrentUserId(data?.user?.id ?? null))
      .catch(() => setCurrentUserId(null));
  }, []);

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
          if (family.careRecipient?.name) {
            setElderName(family.careRecipient.name);
          } else if (family.name) {
            setElderName(family.name);
          }

          // Fetch family members
          const membersRes = await fetch(`/api/families/${family.id}/members`);
          if (membersRes.ok) {
            const membersData = await membersRes.json();
            const members = membersData.members ?? [];
            setFamilyMembers(members);

            // Fetch tasks
            const tasksRes = await fetch(`/api/families/${family.id}/tasks`);
            if (tasksRes.ok) {
              const tasksData = await tasksRes.json();
              setTasks(tasksData);
              calculateTaskDistribution(tasksData, members);
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
                .slice(0, 3)
                .map((evt: any) => ({
                  id: evt.id,
                  title: evt.title,
                  description: evt.description || "",
                  date: new Date(evt.eventDate).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  }),
                  category: mapEventType(evt.type),
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

  function calculateTaskDistribution(tasksData: any[], membersData: any[]) {
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
      .map((member) => {
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
  }

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

    // Poll for new messages every 5 seconds
    const interval = setInterval(fetchMessages, 5000);

    return () => clearInterval(interval);
  }, [familyId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ block: "end" });
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
      // API returns newest-first; oldest-first is what we render, so append.
      setMessages((prev) => [...prev, newMessage]);
      setMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  // Messages come back newest-first from the API; render oldest-first like a real chat.
  const orderedMessages = [...messages].reverse();

  let lastDayLabel = "";
  let lastSenderId = "";

  return (
    <div className={styles.container}>
      <div className={styles.layout}>
        <main className={styles.main}>
          <div className={styles.pageHeader}>
            <div>
              <h1>Family Chat</h1>
              <p className={styles.subtitle}>
                Everyone helping care for {elderName}, in one place
              </p>
            </div>
            <button className={styles.inviteBtn}>
              <UserPlus size={18} />
              Invite Family Member
            </button>
          </div>

          <div className={styles.topGrid}>
            {/* Family Communication */}
            <div className={styles.chatCard}>
              <div className={styles.chatCardHeader}>
                <MessageCircle size={18} className={styles.chatCardHeaderIcon} />
                <div>
                  <h2>Family thread</h2>
                  <p className={styles.cardSubtitle}>
                    Updates and notes about {elderName}&apos;s care
                  </p>
                </div>
              </div>

              <div className={styles.messagesArea}>
                {loading ? (
                  <div className={styles.loadingState}>Loading messages...</div>
                ) : orderedMessages.length === 0 ? (
                  <div className={styles.emptyState}>
                    <MessageCircle size={32} className={styles.emptyStateIcon} />
                    <p>No messages yet</p>
                    <span>Share an update to start the conversation</span>
                  </div>
                ) : (
                  orderedMessages.map((msg) => {
                    const isSelf = msg.user.id === currentUserId;
                    const dayLabel = formatDayLabel(msg.createdAt);
                    const showDayDivider = dayLabel !== lastDayLabel;
                    const showHeader =
                      showDayDivider || msg.user.id !== lastSenderId;
                    lastDayLabel = dayLabel;
                    lastSenderId = msg.user.id;

                    const initials = getInitials(msg.user.name, msg.user.email);
                    const color = getAvatarColor(msg.user.id);

                    return (
                      <div key={msg.id}>
                        {showDayDivider && (
                          <div className={styles.dayDivider}>
                            <span>{dayLabel}</span>
                          </div>
                        )}
                        <div
                          className={`${styles.messageRow} ${
                            isSelf ? styles.messageRowSelf : ""
                          }`}
                        >
                          {!isSelf && (
                            <div
                              className={styles.messageAvatar}
                              style={{
                                background: color,
                                visibility: showHeader ? "visible" : "hidden",
                              }}
                            >
                              {initials}
                            </div>
                          )}
                          <div className={styles.messageWrapper}>
                            {showHeader && !isSelf && (
                              <div className={styles.messageMeta}>
                                <span className={styles.messageSender}>
                                  {msg.user.name || msg.user.email}
                                </span>
                              </div>
                            )}
                            <div
                              className={`${styles.messageContent} ${
                                isSelf ? styles.messageContentSelf : ""
                              }`}
                            >
                              {msg.message}
                            </div>
                            <span className={styles.messageTime}>
                              {new Date(msg.createdAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className={styles.messageInput}>
                <input
                  type="text"
                  placeholder="Share an update with the family..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  disabled={sending || !familyId}
                />
                <button
                  onClick={handleSendMessage}
                  className={styles.sendBtn}
                  disabled={sending || !message.trim() || !familyId}
                  aria-label="Send message"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>

            {/* Caregiving Team */}
            <div className={styles.sideCol}>
              <div className={styles.card}>
                <h2>Care Team</h2>
                <p className={styles.cardSubtitle}>
                  {familyMembers.length} people helping care for {elderName}
                </p>

                <div className={styles.teamList}>
                  {familyMembers.map((member) => {
                    const memberColor = getAvatarColor(member.userId);
                    const initials = getInitials(
                      member.user.name,
                      member.user.email
                    );

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
                            {caregiverRoles.has(member.role)
                              ? "Care Team Lead"
                              : member.role.replaceAll("_", " ")}
                          </div>
                        </div>
                        <Mail
                          size={15}
                          className={styles.memberEmailIcon}
                          aria-label={member.user.email}
                        />
                      </Link>
                    );
                  })}
                  {familyMembers.length === 0 && (
                    <p className={styles.emptyText}>No family members yet</p>
                  )}
                </div>
              </div>

              {upcomingEvents.length > 0 && (
                <div className={styles.card}>
                  <h2>Coming up</h2>
                  <div className={styles.upcomingList}>
                    {upcomingEvents.map((event) => (
                      <div key={event.id} className={styles.upcomingItem}>
                        <div className={styles.upcomingDate}>
                          <Calendar size={14} />
                          {event.date}
                        </div>
                        <div className={styles.upcomingTitle}>{event.title}</div>
                        <span className={styles.upcomingCategory}>
                          {event.category}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
