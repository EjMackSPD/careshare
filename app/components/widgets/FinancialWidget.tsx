'use client'

import Link from 'next/link'
import styles from './Widget.module.css'

type FinancialWidgetProps = {
  monthlyBudget?: number
  spent?: number
  remaining?: number
}

export default function FinancialWidget({ 
  monthlyBudget = 2400, 
  spent = 0, 
  remaining = 2400 
}: FinancialWidgetProps) {
  const percentSpent = (spent / monthlyBudget) * 100

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
            <strong style={{color: '#2563eb'}}>${remaining.toFixed(2)}</strong>
          </div>
        </div>

        <div className={styles.progressBar}>
          <div className={styles.progressFill} style={{width: `${percentSpent}%`}}></div>
        </div>
        <p className={styles.progressLabel}>{percentSpent.toFixed(0)}% spent</p>

        <div className={styles.upcomingBills}>
          <strong>Upcoming Bills</strong>
          <p className={styles.emptyText}>No upcoming bills.</p>
        </div>

        <Link href="/dashboard/finances" className={styles.viewAllLink}>View all bills</Link>
      </div>
    </div>
  )
}

