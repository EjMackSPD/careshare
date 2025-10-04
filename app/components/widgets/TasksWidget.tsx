"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "./Widget.module.css";

type Task = {
  id: string;
  title: string;
  dueDate: string;
  priority: string;
  assignments: Array<{
    user: {
      name: string | null;
      email: string;
    };
  }>;
};

export default function TasksWidget() {
  const [upcomingTasks, setUpcomingTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTasks() {
      try {
        // Fetch families
        const familiesRes = await fetch("/api/families");
        if (!familiesRes.ok) return;
        const families = await familiesRes.json();
        const familiesArray = Array.isArray(families) ? families : [];

        if (familiesArray.length > 0) {
          const family = familiesArray[0];
          
          // Fetch tasks for the family
          const tasksRes = await fetch(`/api/families/${family.id}/tasks`);
          if (tasksRes.ok) {
            const tasksData = await tasksRes.json();
            // Filter to incomplete tasks, sort by due date, take first 4
            const incompleteTasks = tasksData
              .filter((task: any) => task.status !== "COMPLETED")
              .sort((a: any, b: any) => {
                if (!a.dueDate) return 1;
                if (!b.dueDate) return -1;
                return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
              })
              .slice(0, 4);
            
            setUpcomingTasks(incompleteTasks);
          }
        }
      } catch (error) {
        console.error("Error fetching tasks:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchTasks();
  }, []);
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
        {loading ? (
          <div style={{ padding: "2rem", textAlign: "center", color: "#6c757d" }}>
            Loading tasks...
          </div>
        ) : upcomingTasks.length === 0 ? (
          <div style={{ padding: "2rem", textAlign: "center", color: "#6c757d" }}>
            No upcoming tasks
          </div>
        ) : (
          <>
            <div className={styles.tasksList}>
              {upcomingTasks.map((task) => {
                const assignee = task.assignments?.[0]?.user;
                const assigneeName = assignee?.name || assignee?.email || "Unassigned";
                const formattedDate = task.dueDate
                  ? new Date(task.dueDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  : "No due date";

                return (
                  <div key={task.id} className={styles.taskItem}>
                    <div className={styles.taskInfo}>
                      <h4 className={styles.taskTitle}>{task.title}</h4>
                      <p className={styles.taskMeta}>
                        <span className={styles.taskAssignee}>{assigneeName}</span>
                        <span className={styles.taskDivider}>•</span>
                        <span className={styles.taskDue}>Due: {formattedDate}</span>
                      </p>
                    </div>
                    <div
                      className={styles.priorityDot}
                      style={{ background: getPriorityColor(task.priority) }}
                      title={`${task.priority} Priority`}
                    />
                  </div>
                );
              })}
            </div>
            <Link href="/dashboard/tasks" className={styles.viewAllLink}>
              View all tasks →
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
