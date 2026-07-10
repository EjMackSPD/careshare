'use client'

import Link from 'next/link'
import styles from './Widget.module.css'

type UpcomingBill = {
  id: string
  description: string
  amount: number
  dueDate: string | null
}

type FinancialWidgetProps = {
  monthlyBudget?: number
  spent?: number
  remaining?: number
  upcomingBills?: UpcomingBill[]
}

export default function FinancialWidget({
  monthlyBudget = 2400,
  spent = 0,
  remaining = 2400,
  upcomingBills = [],
}: FinancialWidgetProps) {
  const percentSpent = monthlyBudget > 0 ? Math.min((spent / monthlyBudget) * 100, 100) : 0

  return (
    <div className={styles.widget}>
      <div className={styles.widgetHeader}>
        <h3>Financial Overview</h3>
        <Link href="/dashboard/finances" className={styles.addButton}>Add Expense</Link>
      </div>

      <div className={styles.widgetContent}>
        <div className={styles.financialStats}>
          <div className={styles.budgetRow}>
            <span>Monthly Budget</span>
            <strong>${monthlyBudget.toFixed(2)}</strong>
          </div>
          <div className={styles.budgetRow}>
            <span>Spent This Month</span>
            <strong>${spent.toFixed(2)}</strong>
          </div>
          <div className={styles.budgetRow}>
            <span>Remaining</span>
            <strong className={styles.remainingAmount}>${remaining.toFixed(2)}</strong>
          </div>
        </div>

        <div className={styles.progressBar}>
          <div className={styles.progressFill} style={{width: `${percentSpent}%`}}></div>
        </div>
        <p className={styles.progressLabel}>{percentSpent.toFixed(0)}% spent</p>

        <div className={styles.upcomingBills}>
          <strong>Upcoming Bills</strong>
          {upcomingBills.length === 0 ? (
            <p className={styles.emptyText}>No upcoming bills.</p>
          ) : (
            <ul className={styles.billsList}>
              {upcomingBills.slice(0, 3).map((bill) => (
                <li key={bill.id} className={styles.billItem}>
                  <span className={styles.billDescription}>{bill.description}</span>
                  <span className={styles.billAmount}>${bill.amount.toFixed(2)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <Link href="/dashboard/finances" className={styles.viewAllLink}>View all bills</Link>
      </div>
    </div>
  )
}

