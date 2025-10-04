"use client";

import Link from "next/link";
import styles from "./Widget.module.css";

const upcomingTasks = [
  {
    id: "1",
    title: "Pick up prescriptions",
    assignedTo: "Sarah Miller",
    dueDate: "Oct 5",
    priority: "HIGH" as const,
  },
  {
    id: "2",
    title: "Refill insulin prescription",
    assignedTo: "John Johnson",
    dueDate: "Oct 6",
    priority: "HIGH" as const,
  },
  {
    id: "3",
    title: "Grocery shopping for the week",
    assignedTo: "Robert James",
    dueDate: "Oct 8",
    priority: "MEDIUM" as const,
  },
  {
    id: "4",
    title: "Transportation to physical therapy",
    assignedTo: "John Johnson",
    dueDate: "Oct 9",
    priority: "MEDIUM" as const,
  },
];

export default function TasksWidget() {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return "#ef4444";
      case "MEDIUM":
        return "#f59e0b";
      case "LOW":
        return "#10b981";
      default:
        return "#6c757d";
    }
  };

  return (
    <div className={styles.widget}>
      <div className={styles.widgetHeader}>
        <h3>Tasks & Responsibilities</h3>
        <Link href="/dashboard/tasks" className={styles.addButton}>
          + Add Task
        </Link>
      </div>

      <div className={styles.widgetContent}>
        <div className={styles.tasksList}>
          {upcomingTasks.map((task) => (
            <div key={task.id} className={styles.taskItem}>
              <div className={styles.taskInfo}>
                <h4 className={styles.taskTitle}>{task.title}</h4>
                <p className={styles.taskMeta}>
                  <span className={styles.taskAssignee}>{task.assignedTo}</span>
                  <span className={styles.taskDivider}>•</span>
                  <span className={styles.taskDue}>Due: {task.dueDate}</span>
                </p>
              </div>
              <div
                className={styles.priorityDot}
                style={{ background: getPriorityColor(task.priority) }}
                title={`${task.priority} Priority`}
              />
            </div>
          ))}
        </div>
        <Link href="/dashboard/tasks" className={styles.viewAllLink}>
          View all tasks →
        </Link>
      </div>
    </div>
  );
}
