'use client'

import { useState } from 'react'
import Navigation from '@/app/components/Navigation'
import LeftNavigation from '@/app/components/LeftNavigation'
import { BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts'
import styles from './page.module.css'

type Bill = {
  id: string
  name: string
  amount: number
  dueDate: string
  frequency: string
}

type Contribution = {
  name: string
  amount: number
  percentage: number
  initial: string
  color: string
}

const expenseTrends = [
  { month: 'May', amount: 0 },
  { month: 'Jun', amount: 0 },
  { month: 'Jul', amount: 0 },
  { month: 'Aug', amount: 0 },
  { month: 'Sep', amount: 3.6 },
  { month: 'Oct', amount: 0.35 },
]

const expenseBreakdown = [
  { name: 'Medical', value: 1.55, percentage: 41, color: '#6366f1' },
  { name: 'Groceries', value: 0.79, percentage: 21, color: '#a855f7' },
  { name: 'Housing', value: 1.46, percentage: 38, color: '#10b981' },
]

const upcomingBills: Bill[] = [
  { id: '1', name: 'Rent', amount: 12.00, dueDate: 'Oct 7, 2025', frequency: 'Monthly' },
  { id: '2', name: 'Internet Service', amount: 0.66, dueDate: 'Oct 12, 2025', frequency: 'Monthly' },
  { id: '3', name: 'Medicare Supplement', amount: 1.85, dueDate: 'Oct 17, 2025', frequency: 'Monthly' },
]

const familyContributions: Contribution[] = [
  { name: 'John Johnson', amount: 0.00, percentage: 0, initial: 'JJ', color: '#6366f1' },
  { name: 'Sarah Johnson', amount: 0.00, percentage: 0, initial: 'SJ', color: '#ec4899' },
  { name: 'Michael Johnson', amount: 0.00, percentage: 0, initial: 'MJ', color: '#10b981' },
]

export default function FinancesPage() {
  const [activeTab, setActiveTab] = useState('Overview')
  const tabs = ['Overview', 'Expenses', 'Bills', 'Family Contributions']

  const monthlyBudget = 2400.00
  const spent = 0.35
  const remaining = 2399.65

  return (
    <div className={styles.container}>
      <Navigation showAuthLinks={true} />
      
      <div className={styles.layout}>
        <LeftNavigation />
        <main className={styles.main}>
          <div className={styles.pageHeader}>
            <div>
              <h1>Finances</h1>
              <p className={styles.subtitle}>Manage expenses, bills, and budgeting for care</p>
            </div>
            <div className={styles.headerButtons}>
              <button className={styles.addExpenseBtn}>+ Add Expense</button>
              <button className={styles.addBillBtn}>📄 Add Bill</button>
            </div>
          </div>

          {/* Tabs */}
          <div className={styles.tabs}>
            {tabs.map((tab) => (
              <button
                key={tab}
                className={`${styles.tab} ${activeTab === tab ? styles.activeTab : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Monthly Budget Overview */}
          <div className={styles.budgetOverview}>
            <h2>Monthly Budget Overview</h2>
            <div className={styles.budgetCards}>
              <div className={styles.budgetCard}>
                <p className={styles.budgetLabel}>Monthly Budget</p>
                <h3 className={styles.budgetAmount}>${monthlyBudget.toFixed(2)}</h3>
              </div>
              <div className={styles.budgetCard}>
                <p className={styles.budgetLabel}>Spent This Month</p>
                <h3 className={styles.budgetAmount}>${spent.toFixed(2)}</h3>
              </div>
              <div className={styles.budgetCard}>
                <p className={styles.budgetLabel}>Remaining</p>
                <h3 className={styles.budgetAmount} style={{color: '#10b981'}}>${remaining.toFixed(2)}</h3>
              </div>
            </div>

            <div className={styles.progressSection}>
              <div className={styles.progressLabels}>
                <span>0%</span>
                <span className={styles.spentLabel}>0% spent</span>
                <span>100%</span>
              </div>
              <div className={styles.progressBar}>
                <div className={styles.progressFill} style={{width: `${(spent / monthlyBudget) * 100}%`}}></div>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className={styles.chartsGrid}>
            <div className={styles.chartCard}>
              <h3>Expense Trends</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={expenseTrends}>
                  <XAxis dataKey="month" stroke="#6c757d" />
                  <YAxis stroke="#6c757d" />
                  <Tooltip />
                  <Bar dataKey="amount" fill="#6366f1" radius={[8, 8, 0, 0]} animationDuration={1000} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className={styles.chartCard}>
              <h3>Expense Breakdown</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={expenseBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                    animationBegin={0}
                    animationDuration={800}
                  >
                    {expenseBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className={styles.legend}>
                {expenseBreakdown.map((item) => (
                  <div key={item.name} className={styles.legendItem}>
                    <div className={styles.legendDot} style={{background: item.color}}></div>
                    <span>{item.name}</span>
                    <strong>${item.value.toFixed(2)} ({item.percentage}%)</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className={styles.bottomGrid}>
            {/* Upcoming Bills */}
            <div className={styles.billsCard}>
              <h3>Upcoming Bills</h3>
              <div className={styles.billsList}>
                {upcomingBills.map((bill) => (
                  <div key={bill.id} className={styles.billItem}>
                    <div className={styles.billInfo}>
                      <h4>{bill.name}</h4>
                      <p>Due: {bill.dueDate} • {bill.frequency}</p>
                    </div>
                    <div className={styles.billAmount}>${bill.amount.toFixed(2)}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Family Contributions */}
            <div className={styles.contributionsCard}>
              <h3>Family Contributions</h3>
              <div className={styles.contributionsList}>
                {familyContributions.map((member) => (
                  <div key={member.name} className={styles.contributionItem}>
                    <div className={styles.memberInfo}>
                      <div className={styles.memberAvatar} style={{background: member.color}}>
                        {member.initial}
                      </div>
                      <span className={styles.memberName}>{member.name}</span>
                    </div>
                    <div className={styles.contributionDetails}>
                      <div className={styles.contributionBar}>
                        <div className={styles.contributionFill} style={{width: `${member.percentage}%`, background: member.color}}></div>
                      </div>
                      <div className={styles.contributionAmount}>
                        <span>${member.amount.toFixed(2)}</span>
                        <span className={styles.percentage}>{member.percentage}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

