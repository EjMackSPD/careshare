'use client'

import { useState, useEffect } from 'react'
import Navigation from '@/app/components/Navigation'
import LeftNavigation from '@/app/components/LeftNavigation'
import { BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts'
import { X, ArrowRight, ArrowLeft } from 'lucide-react'
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

type FamilyMember = {
  id: string
  userId: string
  user: {
    id: string
    name: string | null
    email: string
  }
}

type CostAllocation = {
  userId: string
  name: string
  amount: number
  percentage: number
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
  
  // Add Bill Modal States
  const [showAddBill, setShowAddBill] = useState(false)
  const [billStep, setBillStep] = useState(1) // 1: Details, 2: Allocation
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([])
  const [loading, setLoading] = useState(false)
  
  // Bill Form Data
  const [billData, setBillData] = useState({
    name: '',
    amount: '',
    dueDate: '',
    frequency: 'One-time',
    category: 'Medical'
  })
  
  // File upload
  const [uploadedFile, setUploadedFile] = useState<{
    url: string
    fileName: string
  } | null>(null)
  const [uploading, setUploading] = useState(false)
  
  // Cost Allocation
  const [allocationType, setAllocationType] = useState<'estate' | 'family' | 'split'>('estate')
  const [splitType, setSplitType] = useState<'equal' | 'percentage' | 'custom'>('equal')
  const [allocations, setAllocations] = useState<CostAllocation[]>([])

  const monthlyBudget = 2400.00
  const spent = 0.35
  const remaining = 2399.65

  // File upload handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Upload failed')
      }

      const data = await res.json()
      setUploadedFile({
        url: data.url,
        fileName: data.fileName
      })
    } catch (error) {
      console.error('Error uploading file:', error)
      alert(error instanceof Error ? error.message : 'Failed to upload file')
    } finally {
      setUploading(false)
    }
  }

  // Fetch family members
  useEffect(() => {
    async function fetchMembers() {
      try {
        const res = await fetch('/api/families')
        if (!res.ok) return
        const families = await res.json()
        if (families.length > 0) {
          const membersRes = await fetch(`/api/families/${families[0].id}/members`)
          if (membersRes.ok) {
            const members = await membersRes.json()
            setFamilyMembers(members)
            initializeAllocations(members)
          }
        }
      } catch (error) {
        console.error('Error fetching members:', error)
      }
    }
    fetchMembers()
  }, [])

  const initializeAllocations = (members: FamilyMember[]) => {
    const total = parseFloat(billData.amount) || 0
    const equalAmount = members.length > 0 ? total / members.length : 0
    
    setAllocations(
      members.map(member => ({
        userId: member.userId,
        name: member.user.name || member.user.email,
        amount: equalAmount,
        percentage: members.length > 0 ? 100 / members.length : 0
      }))
    )
  }

  const handleAllocationTypeChange = (type: 'estate' | 'family' | 'split') => {
    setAllocationType(type)
    if (type === 'family' && familyMembers.length > 0) {
      const total = parseFloat(billData.amount) || 0
      const equalAmount = familyMembers.length > 0 ? total / familyMembers.length : 0
      setAllocations(
        familyMembers.map(member => ({
          userId: member.userId,
          name: member.user.name || member.user.email,
          amount: equalAmount,
          percentage: 100 / familyMembers.length
        }))
      )
    }
  }

  const handleSplitTypeChange = (type: 'equal' | 'percentage' | 'custom') => {
    setSplitType(type)
    const total = parseFloat(billData.amount) || 0
    
    if (type === 'equal' && familyMembers.length > 0) {
      const equalAmount = total / familyMembers.length
      setAllocations(allocations.map(a => ({
        ...a,
        amount: equalAmount,
        percentage: 100 / familyMembers.length
      })))
    }
  }

  const updateAllocation = (userId: string, field: 'amount' | 'percentage', value: number) => {
    const total = parseFloat(billData.amount) || 0
    
    setAllocations(allocations.map(a => {
      if (a.userId === userId) {
        if (field === 'amount') {
          return { ...a, amount: value, percentage: (value / total) * 100 }
        } else {
          return { ...a, percentage: value, amount: (value / 100) * total }
        }
      }
      return a
    }))
  }

  const getTotalAllocated = () => {
    return allocations.reduce((sum, a) => sum + a.amount, 0)
  }

  const getTotalPercentage = () => {
    return allocations.reduce((sum, a) => sum + a.percentage, 0)
  }

  const isAllocationValid = () => {
    const total = parseFloat(billData.amount) || 0
    const allocated = getTotalAllocated()
    return Math.abs(total - allocated) < 0.01 // Allow for small rounding differences
  }

  const handleSubmitBill = async () => {
    setLoading(true)
    try {
      // Get first family (for demo purposes)
      const familiesRes = await fetch('/api/families')
      if (!familiesRes.ok) throw new Error('Failed to fetch families')
      const familiesData = await familiesRes.json()
      
      if (!familiesData.families || familiesData.families.length === 0) {
        throw new Error('No family found')
      }
      
      const familyId = familiesData.families[0].id
      
      // Create cost
      const costData = {
        description: billData.name,
        amount: parseFloat(billData.amount),
        dueDate: billData.dueDate ? new Date(billData.dueDate).toISOString() : null,
        status: 'PENDING',
        receiptUrl: uploadedFile?.url || null,
        fileName: uploadedFile?.fileName || null
      }
      
      const costRes = await fetch(`/api/families/${familyId}/costs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(costData)
      })
      
      if (!costRes.ok) {
        const error = await costRes.json()
        throw new Error(error.error || 'Failed to create cost')
      }
      
      // Success - close modal and reset
      setShowAddBill(false)
      setBillStep(1)
      setBillData({
        name: '',
        amount: '',
        dueDate: '',
        frequency: 'One-time',
        category: 'Medical'
      })
      setAllocationType('estate')
      setUploadedFile(null)
      
      alert('Bill added successfully!')
    } catch (error) {
      console.error('Error submitting bill:', error)
      alert(error instanceof Error ? error.message : 'Failed to add bill')
    } finally {
      setLoading(false)
    }
  }

  const canProceedToStep2 = billData.name && billData.amount && billData.dueDate

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
              <button className={styles.addBillBtn} onClick={() => setShowAddBill(true)}>📄 Add Bill</button>
            </div>
          </div>

          {/* Add Bill Modal */}
          {showAddBill && (
            <div className={styles.modal} onClick={() => setShowAddBill(false)}>
              <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                  <h2>{billStep === 1 ? 'Add Bill - Details' : 'Add Bill - Allocate Costs'}</h2>
                  <button className={styles.closeBtn} onClick={() => setShowAddBill(false)}>
                    <X size={24} />
                  </button>
                </div>

                {/* Step Indicator */}
                <div className={styles.stepIndicator}>
                  <div className={`${styles.step} ${billStep >= 1 ? styles.activeStep : ''}`}>
                    <div className={styles.stepNumber}>1</div>
                    <span>Bill Details</span>
                  </div>
                  <div className={styles.stepLine}></div>
                  <div className={`${styles.step} ${billStep >= 2 ? styles.activeStep : ''}`}>
                    <div className={styles.stepNumber}>2</div>
                    <span>Cost Allocation</span>
                  </div>
                </div>

                {billStep === 1 ? (
                  /* Step 1: Bill Details */
                  <div className={styles.modalBody}>
                    <div className={styles.formGroup}>
                      <label>Bill Name *</label>
                      <input
                        type="text"
                        value={billData.name}
                        onChange={(e) => setBillData({ ...billData, name: e.target.value })}
                        placeholder="e.g., Electric Bill, Rent, Medical Expense"
                      />
                    </div>

                    <div className={styles.formRow}>
                      <div className={styles.formGroup}>
                        <label>Amount *</label>
                        <div className={styles.amountInput}>
                          <span className={styles.currencySymbol}>$</span>
                          <input
                            type="number"
                            step="0.01"
                            value={billData.amount}
                            onChange={(e) => setBillData({ ...billData, amount: e.target.value })}
                            placeholder="0.00"
                          />
                        </div>
                      </div>

                      <div className={styles.formGroup}>
                        <label>Due Date *</label>
                        <input
                          type="date"
                          value={billData.dueDate}
                          onChange={(e) => setBillData({ ...billData, dueDate: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className={styles.formRow}>
                      <div className={styles.formGroup}>
                        <label>Frequency</label>
                        <select
                          value={billData.frequency}
                          onChange={(e) => setBillData({ ...billData, frequency: e.target.value })}
                        >
                          <option value="One-time">One-time</option>
                          <option value="Weekly">Weekly</option>
                          <option value="Monthly">Monthly</option>
                          <option value="Quarterly">Quarterly</option>
                          <option value="Yearly">Yearly</option>
                        </select>
                      </div>

                      <div className={styles.formGroup}>
                        <label>Category</label>
                        <select
                          value={billData.category}
                          onChange={(e) => setBillData({ ...billData, category: e.target.value })}
                        >
                          <option value="Medical">Medical</option>
                          <option value="Housing">Housing</option>
                          <option value="Groceries">Groceries</option>
                          <option value="Utilities">Utilities</option>
                          <option value="Transportation">Transportation</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>

                    <div className={styles.formGroup}>
                      <label>Receipt/Bill (Optional)</label>
                      <div className={styles.fileUpload}>
                        <input
                          type="file"
                          id="receipt-upload"
                          accept="image/*,.pdf"
                          onChange={handleFileUpload}
                          disabled={uploading}
                          className={styles.fileInput}
                        />
                        <label htmlFor="receipt-upload" className={styles.fileLabel}>
                          {uploading ? 'Uploading...' : uploadedFile ? 'Change File' : 'Choose File'}
                        </label>
                        <span className={styles.fileHint}>
                          {uploadedFile 
                            ? uploadedFile.fileName 
                            : 'Upload receipt, bill, or invoice (PDF, JPG, PNG - Max 10MB)'
                          }
                        </span>
                        {uploadedFile && (
                          <button
                            type="button"
                            onClick={() => setUploadedFile(null)}
                            className={styles.removeFileBtn}
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>

                    <div className={styles.billSummary}>
                      <h3>Bill Summary</h3>
                      <div className={styles.summaryItem}>
                        <span>Total Amount:</span>
                        <strong>${parseFloat(billData.amount || '0').toFixed(2)}</strong>
                      </div>
                      {uploadedFile && (
                        <div className={styles.summaryItem}>
                          <span>Receipt:</span>
                          <a href={uploadedFile.url} target="_blank" rel="noopener noreferrer" className={styles.receiptLink}>
                            View Uploaded Receipt
                          </a>
                        </div>
                      )}
                    </div>

                    <div className={styles.modalActions}>
                      <button 
                        className={styles.cancelBtn}
                        onClick={() => setShowAddBill(false)}
                      >
                        Cancel
                      </button>
                      <button 
                        className={styles.nextBtn}
                        onClick={() => {
                          setBillStep(2)
                          if (familyMembers.length > 0) {
                            initializeAllocations(familyMembers)
                          }
                        }}
                        disabled={!canProceedToStep2}
                      >
                        Next: Allocate Costs
                        <ArrowRight size={18} />
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Step 2: Cost Allocation */
                  <div className={styles.modalBody}>
                    <div className={styles.allocationHeader}>
                      <h3>Who should pay this bill?</h3>
                      <p>Total to allocate: <strong>${parseFloat(billData.amount || '0').toFixed(2)}</strong></p>
                    </div>

                    <div className={styles.allocationTypes}>
                      <button
                        className={`${styles.allocationType} ${allocationType === 'estate' ? styles.activeAllocationType : ''}`}
                        onClick={() => handleAllocationTypeChange('estate')}
                      >
                        <div className={styles.allocationIcon}>🏛️</div>
                        <div>
                          <strong>Estate/Individual</strong>
                          <p>Paid from care recipient's funds</p>
                        </div>
                      </button>

                      <button
                        className={`${styles.allocationType} ${allocationType === 'family' ? styles.activeAllocationType : ''}`}
                        onClick={() => handleAllocationTypeChange('family')}
                      >
                        <div className={styles.allocationIcon}>👥</div>
                        <div>
                          <strong>Family Members</strong>
                          <p>Split among family members</p>
                        </div>
                      </button>
                    </div>

                    {allocationType === 'family' && (
                      <div className={styles.splitOptions}>
                        <h4>Split Method</h4>
                        <div className={styles.splitButtons}>
                          <button
                            className={`${styles.splitBtn} ${splitType === 'equal' ? styles.activeSplitBtn : ''}`}
                            onClick={() => handleSplitTypeChange('equal')}
                          >
                            Equal Split
                          </button>
                          <button
                            className={`${styles.splitBtn} ${splitType === 'percentage' ? styles.activeSplitBtn : ''}`}
                            onClick={() => handleSplitTypeChange('percentage')}
                          >
                            By Percentage
                          </button>
                          <button
                            className={`${styles.splitBtn} ${splitType === 'custom' ? styles.activeSplitBtn : ''}`}
                            onClick={() => handleSplitTypeChange('custom')}
                          >
                            Custom Amount
                          </button>
                        </div>

                        <div className={styles.allocationslist}>
                          {allocations.map((allocation) => (
                            <div key={allocation.userId} className={styles.allocationRow}>
                              <div className={styles.memberName}>{allocation.name}</div>
                              <div className={styles.allocationInputs}>
                                {splitType === 'equal' ? (
                                  <div className={styles.allocationDisplay}>
                                    ${allocation.amount.toFixed(2)} ({allocation.percentage.toFixed(1)}%)
                                  </div>
                                ) : splitType === 'percentage' ? (
                                  <div className={styles.inputGroup}>
                                    <input
                                      type="number"
                                      value={allocation.percentage}
                                      onChange={(e) => updateAllocation(allocation.userId, 'percentage', parseFloat(e.target.value) || 0)}
                                      className={styles.percentageInput}
                                    />
                                    <span>% = ${allocation.amount.toFixed(2)}</span>
                                  </div>
                                ) : (
                                  <div className={styles.inputGroup}>
                                    <span>$</span>
                                    <input
                                      type="number"
                                      step="0.01"
                                      value={allocation.amount}
                                      onChange={(e) => updateAllocation(allocation.userId, 'amount', parseFloat(e.target.value) || 0)}
                                      className={styles.amountInputSmall}
                                    />
                                    <span>({allocation.percentage.toFixed(1)}%)</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className={`${styles.allocationSummary} ${!isAllocationValid() ? styles.invalid : ''}`}>
                          <div className={styles.summaryRow}>
                            <span>Total Allocated:</span>
                            <strong>${getTotalAllocated().toFixed(2)} ({getTotalPercentage().toFixed(1)}%)</strong>
                          </div>
                          <div className={styles.summaryRow}>
                            <span>Remaining:</span>
                            <strong>${(parseFloat(billData.amount) - getTotalAllocated()).toFixed(2)}</strong>
                          </div>
                          {!isAllocationValid() && (
                            <div className={styles.errorMessage}>
                              ⚠️ Total allocation must equal bill amount
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <div className={styles.modalActions}>
                      <button 
                        className={styles.backBtn}
                        onClick={() => setBillStep(1)}
                      >
                        <ArrowLeft size={18} />
                        Back
                      </button>
                      <button 
                        className={styles.submitBtn}
                        onClick={handleSubmitBill}
                        disabled={allocationType === 'family' && !isAllocationValid()}
                      >
                        Add Bill
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

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

          {/* Overview Tab */}
          {activeTab === 'Overview' && (
            <>
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
            </>
          )}

          {/* Expenses Tab */}
          {activeTab === 'Expenses' && (
            <>
              <div className={styles.chartCard}>
                <h3>Expense Trends (Last 6 Months)</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={expenseTrends}>
                    <XAxis dataKey="month" stroke="#6c757d" />
                    <YAxis stroke="#6c757d" />
                    <Tooltip />
                    <Bar dataKey="amount" fill="#6366f1" radius={[8, 8, 0, 0]} animationDuration={1000} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className={styles.expensesTable}>
                <h3>Expense Breakdown by Category</h3>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Category</th>
                      <th>Amount</th>
                      <th>Percentage</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenseBreakdown.map((expense) => (
                      <tr key={expense.name}>
                        <td>
                          <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                            <div className={styles.legendDot} style={{background: expense.color}}></div>
                            {expense.name}
                          </div>
                        </td>
                        <td>${expense.value.toFixed(2)}</td>
                        <td>{expense.percentage}%</td>
                        <td><span className={styles.statusBadge}>Tracked</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* Bills Tab */}
          {activeTab === 'Bills' && (
            <div className={styles.billsSection}>
              <div className={styles.billsHeader}>
                <h3>All Bills</h3>
                <p className={styles.subtitle}>Manage recurring and one-time bills</p>
              </div>
              
              <div className={styles.billsGrid}>
                {upcomingBills.map((bill) => (
                  <div key={bill.id} className={styles.billCard}>
                    <div className={styles.billCardHeader}>
                      <h4>{bill.name}</h4>
                      <span className={styles.billBadge}>{bill.frequency}</span>
                    </div>
                    <div className={styles.billCardBody}>
                      <div className={styles.billCardAmount}>${bill.amount.toFixed(2)}</div>
                      <p className={styles.billCardDue}>Due: {bill.dueDate}</p>
                    </div>
                    <div className={styles.billCardActions}>
                      <button className={styles.payBtn}>Mark as Paid</button>
                      <button className={styles.editBtn}>Edit</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Family Contributions Tab */}
          {activeTab === 'Family Contributions' && (
            <div className={styles.contributionsSection}>
              <div className={styles.contributionsHeader}>
                <h3>Family Contributions Overview</h3>
                <p className={styles.subtitle}>Track how care costs are shared among family members</p>
              </div>

              <div className={styles.contributionsSummary}>
                <div className={styles.summaryCard}>
                  <p className={styles.summaryLabel}>Total Family Contributions</p>
                  <h3 className={styles.summaryAmount}>
                    ${familyContributions.reduce((sum, m) => sum + m.amount, 0).toFixed(2)}
                  </h3>
                </div>
                <div className={styles.summaryCard}>
                  <p className={styles.summaryLabel}>Active Contributors</p>
                  <h3 className={styles.summaryAmount}>{familyContributions.filter(m => m.amount > 0).length}</h3>
                </div>
              </div>

              <div className={styles.contributionsDetailList}>
                {familyContributions.map((member) => (
                  <div key={member.name} className={styles.contributionDetailCard}>
                    <div className={styles.contributionCardHeader}>
                      <div className={styles.memberInfo}>
                        <div className={styles.memberAvatar} style={{background: member.color}}>
                          {member.initial}
                        </div>
                        <div>
                          <h4 className={styles.memberName}>{member.name}</h4>
                          <p className={styles.memberRole}>Family Member</p>
                        </div>
                      </div>
                      <div className={styles.contributionCardAmount}>
                        <h3>${member.amount.toFixed(2)}</h3>
                        <span className={styles.percentage}>{member.percentage}%</span>
                      </div>
                    </div>
                    <div className={styles.contributionBar}>
                      <div className={styles.contributionFill} style={{width: `${member.percentage}%`, background: member.color}}></div>
                    </div>
                    <div className={styles.contributionCardFooter}>
                      <button className={styles.viewHistoryBtn}>View History</button>
                      <button className={styles.adjustBtn}>Adjust Split</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

