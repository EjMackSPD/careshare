"use client";

import React, { useState, useEffect } from "react";
import Navigation from "@/app/components/Navigation";
import LeftNavigation from "@/app/components/LeftNavigation";
import Footer from "@/app/components/Footer";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import {
  X,
  ArrowRight,
  ArrowLeft,
  Download,
  Edit2,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import styles from "./page.module.css";

type Bill = {
  id: string;
  name: string;
  amount: number;
  amountPaid: number;
  dueDate: string;
  frequency: string;
  category: string;
  status: "pending" | "paid" | "partial";
};

type Contribution = {
  id: string;
  name: string;
  amount: number;
  percentage: number;
  initial: string;
  color: string;
};

type FamilyMember = {
  id: string;
  userId: string;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
};

type CostAllocation = {
  userId: string;
  name: string;
  amount: number;
  percentage: number;
};

const CATEGORY_COLORS: { [key: string]: string } = {
  Medical: "#6366f1",
  Groceries: "#a855f7",
  Housing: "#10b981",
  Utilities: "#f59e0b",
  Transportation: "#ef4444",
  Other: "#6c757d",
};

export default function FinancesPage() {
  const [activeTab, setActiveTab] = useState("Overview");
  const tabs = ["Overview", "Expenses", "Bills", "Family Contributions"];

  // Add Bill Modal States
  const [showAddBill, setShowAddBill] = useState(false);
  const [billStep, setBillStep] = useState(1); // 1: Details, 2: Allocation
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(false);

  // Edit Bill States
  const [editingBill, setEditingBill] = useState<Bill | null>(null);
  const [showEditBill, setShowEditBill] = useState(false);

  // History Modal State
  const [showHistory, setShowHistory] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Contribution | null>(
    null
  );

  // Adjust Split Modal State
  const [showAdjustSplit, setShowAdjustSplit] = useState(false);
  const [adjustingMember, setAdjustingMember] = useState<Contribution | null>(
    null
  );

  // Budget Edit Modal State
  const [showBudgetEdit, setShowBudgetEdit] = useState(false);
  const [tempBudget, setTempBudget] = useState("");

  // Bills Search and Filter
  const [billSearchQuery, setBillSearchQuery] = useState("");
  const [selectedMonth, setSelectedMonth] = useState<number>(9); // October = 9 (current month)

  // Expense Trends Navigation (3-month window)
  const [trendsStartIndex, setTrendsStartIndex] = useState(11); // Start at Oct (index 11, showing Aug, Sep, Oct)

  // Expense Breakdown Navigation (single month)
  const [breakdownMonthIndex, setBreakdownMonthIndex] = useState(9); // October = 9 (current month)

  // Bill Form Data
  const [billData, setBillData] = useState({
    name: "",
    amount: "",
    dueDate: "",
    frequency: "One-time",
    category: "Medical",
  });

  // File upload
  const [uploadedFile, setUploadedFile] = useState<{
    url: string;
    fileName: string;
  } | null>(null);
  const [uploading, setUploading] = useState(false);

  // Cost Allocation
  const [allocationType, setAllocationType] = useState<
    "estate" | "family" | "split"
  >("estate");
  const [splitType, setSplitType] = useState<"equal" | "percentage" | "custom">(
    "equal"
  );
  const [allocations, setAllocations] = useState<CostAllocation[]>([]);

  // Dynamic Bills Data - Full Year Historical, Current, and Future
  const [bills, setBills] = useState<Bill[]>([
    // NOVEMBER 2024
    {
      id: "2024-11-1",
      name: "Rent - November 2024",
      amount: 1200.0,
      amountPaid: 1200.0,
      dueDate: "2024-11-01",
      frequency: "Monthly",
      category: "Housing",
      status: "paid",
    },
    {
      id: "2024-11-2",
      name: "Electric Bill - November",
      amount: 132.0,
      amountPaid: 132.0,
      dueDate: "2024-11-05",
      frequency: "Monthly",
      category: "Utilities",
      status: "paid",
    },
    {
      id: "2024-11-3",
      name: "Internet Service - November",
      amount: 66.0,
      amountPaid: 66.0,
      dueDate: "2024-11-08",
      frequency: "Monthly",
      category: "Utilities",
      status: "paid",
    },
    {
      id: "2024-11-4",
      name: "Groceries - November Week 1",
      amount: 165.0,
      amountPaid: 165.0,
      dueDate: "2024-11-10",
      frequency: "Weekly",
      category: "Groceries",
      status: "paid",
    },
    {
      id: "2024-11-5",
      name: "Prescription Medications - November",
      amount: 235.0,
      amountPaid: 235.0,
      dueDate: "2024-11-12",
      frequency: "Monthly",
      category: "Medical",
      status: "paid",
    },
    {
      id: "2024-11-6",
      name: "Home Care Services - November",
      amount: 600.0,
      amountPaid: 600.0,
      dueDate: "2024-11-15",
      frequency: "Monthly",
      category: "Medical",
      status: "paid",
    },
    {
      id: "2024-11-7",
      name: "Gas & Water - November",
      amount: 88.0,
      amountPaid: 88.0,
      dueDate: "2024-11-20",
      frequency: "Monthly",
      category: "Utilities",
      status: "paid",
    },

    // DECEMBER 2024
    {
      id: "2024-12-1",
      name: "Rent - December 2024",
      amount: 1200.0,
      amountPaid: 1200.0,
      dueDate: "2024-12-01",
      frequency: "Monthly",
      category: "Housing",
      status: "paid",
    },
    {
      id: "2024-12-2",
      name: "Electric Bill - December",
      amount: 158.0,
      amountPaid: 158.0,
      dueDate: "2024-12-05",
      frequency: "Monthly",
      category: "Utilities",
      status: "paid",
    },
    {
      id: "2024-12-3",
      name: "Internet Service - December",
      amount: 66.0,
      amountPaid: 66.0,
      dueDate: "2024-12-08",
      frequency: "Monthly",
      category: "Utilities",
      status: "paid",
    },
    {
      id: "2024-12-4",
      name: "Groceries - December Week 1",
      amount: 195.0,
      amountPaid: 195.0,
      dueDate: "2024-12-10",
      frequency: "Weekly",
      category: "Groceries",
      status: "paid",
    },
    {
      id: "2024-12-5",
      name: "Prescription Medications - December",
      amount: 240.0,
      amountPaid: 240.0,
      dueDate: "2024-12-12",
      frequency: "Monthly",
      category: "Medical",
      status: "paid",
    },
    {
      id: "2024-12-6",
      name: "Holiday Meal Service",
      amount: 320.0,
      amountPaid: 320.0,
      dueDate: "2024-12-20",
      frequency: "One-time",
      category: "Groceries",
      status: "paid",
    },
    {
      id: "2024-12-7",
      name: "Home Care Services - December",
      amount: 600.0,
      amountPaid: 600.0,
      dueDate: "2024-12-15",
      frequency: "Monthly",
      category: "Medical",
      status: "paid",
    },
    {
      id: "2024-12-8",
      name: "Gas & Water - December",
      amount: 105.0,
      amountPaid: 105.0,
      dueDate: "2024-12-20",
      frequency: "Monthly",
      category: "Utilities",
      status: "paid",
    },

    // JANUARY 2025
    {
      id: "2025-01-1",
      name: "Rent - January 2025",
      amount: 1200.0,
      amountPaid: 1200.0,
      dueDate: "2025-01-01",
      frequency: "Monthly",
      category: "Housing",
      status: "paid",
    },
    {
      id: "2025-01-2",
      name: "Electric Bill - January",
      amount: 175.0,
      amountPaid: 175.0,
      dueDate: "2025-01-05",
      frequency: "Monthly",
      category: "Utilities",
      status: "paid",
    },
    {
      id: "2025-01-3",
      name: "Internet Service - January",
      amount: 66.0,
      amountPaid: 66.0,
      dueDate: "2025-01-08",
      frequency: "Monthly",
      category: "Utilities",
      status: "paid",
    },
    {
      id: "2025-01-4",
      name: "Groceries - January Week 1",
      amount: 170.0,
      amountPaid: 170.0,
      dueDate: "2025-01-10",
      frequency: "Weekly",
      category: "Groceries",
      status: "paid",
    },
    {
      id: "2025-01-5",
      name: "Prescription Medications - January",
      amount: 245.0,
      amountPaid: 245.0,
      dueDate: "2025-01-12",
      frequency: "Monthly",
      category: "Medical",
      status: "paid",
    },
    {
      id: "2025-01-6",
      name: "Home Care Services - January",
      amount: 600.0,
      amountPaid: 600.0,
      dueDate: "2025-01-15",
      frequency: "Monthly",
      category: "Medical",
      status: "paid",
    },
    {
      id: "2025-01-7",
      name: "Gas & Water - January",
      amount: 115.0,
      amountPaid: 115.0,
      dueDate: "2025-01-20",
      frequency: "Monthly",
      category: "Utilities",
      status: "paid",
    },

    // FEBRUARY 2025
    {
      id: "2025-02-1",
      name: "Rent - February",
      amount: 1200.0,
      amountPaid: 1200.0,
      dueDate: "2025-02-01",
      frequency: "Monthly",
      category: "Housing",
      status: "paid",
    },
    {
      id: "2025-02-2",
      name: "Electric Bill - February",
      amount: 165.0,
      amountPaid: 165.0,
      dueDate: "2025-02-05",
      frequency: "Monthly",
      category: "Utilities",
      status: "paid",
    },
    {
      id: "2025-02-3",
      name: "Internet Service - February",
      amount: 66.0,
      amountPaid: 66.0,
      dueDate: "2025-02-08",
      frequency: "Monthly",
      category: "Utilities",
      status: "paid",
    },
    {
      id: "2025-02-4",
      name: "Groceries - February Week 1",
      amount: 160.0,
      amountPaid: 160.0,
      dueDate: "2025-02-10",
      frequency: "Weekly",
      category: "Groceries",
      status: "paid",
    },
    {
      id: "2025-02-5",
      name: "Prescription Medications - February",
      amount: 240.0,
      amountPaid: 240.0,
      dueDate: "2025-02-12",
      frequency: "Monthly",
      category: "Medical",
      status: "paid",
    },
    {
      id: "2025-02-6",
      name: "Specialist Visit Co-pay",
      amount: 50.0,
      amountPaid: 50.0,
      dueDate: "2025-02-14",
      frequency: "One-time",
      category: "Medical",
      status: "paid",
    },
    {
      id: "2025-02-7",
      name: "Home Care Services - February",
      amount: 600.0,
      amountPaid: 600.0,
      dueDate: "2025-02-15",
      frequency: "Monthly",
      category: "Medical",
      status: "paid",
    },
    {
      id: "2025-02-8",
      name: "Gas & Water - February",
      amount: 98.0,
      amountPaid: 98.0,
      dueDate: "2025-02-20",
      frequency: "Monthly",
      category: "Utilities",
      status: "paid",
    },

    // MARCH 2025
    {
      id: "2025-03-1",
      name: "Rent - March",
      amount: 1200.0,
      amountPaid: 1200.0,
      dueDate: "2025-03-01",
      frequency: "Monthly",
      category: "Housing",
      status: "paid",
    },
    {
      id: "2025-03-2",
      name: "Electric Bill - March",
      amount: 142.0,
      amountPaid: 142.0,
      dueDate: "2025-03-05",
      frequency: "Monthly",
      category: "Utilities",
      status: "paid",
    },
    {
      id: "2025-03-3",
      name: "Internet Service - March",
      amount: 66.0,
      amountPaid: 66.0,
      dueDate: "2025-03-08",
      frequency: "Monthly",
      category: "Utilities",
      status: "paid",
    },
    {
      id: "2025-03-4",
      name: "Groceries - March Week 1",
      amount: 175.0,
      amountPaid: 175.0,
      dueDate: "2025-03-10",
      frequency: "Weekly",
      category: "Groceries",
      status: "paid",
    },
    {
      id: "2025-03-5",
      name: "Prescription Medications - March",
      amount: 245.0,
      amountPaid: 245.0,
      dueDate: "2025-03-12",
      frequency: "Monthly",
      category: "Medical",
      status: "paid",
    },
    {
      id: "2025-03-6",
      name: "Home Care Services - March",
      amount: 600.0,
      amountPaid: 600.0,
      dueDate: "2025-03-15",
      frequency: "Monthly",
      category: "Medical",
      status: "paid",
    },
    {
      id: "2025-03-7",
      name: "Gas & Water - March",
      amount: 92.0,
      amountPaid: 92.0,
      dueDate: "2025-03-20",
      frequency: "Monthly",
      category: "Utilities",
      status: "paid",
    },
    {
      id: "2025-03-8",
      name: "Transportation Services - March",
      amount: 125.0,
      amountPaid: 125.0,
      dueDate: "2025-03-25",
      frequency: "Monthly",
      category: "Transportation",
      status: "paid",
    },

    // APRIL 2025
    {
      id: "2025-04-1",
      name: "Rent - April",
      amount: 1200.0,
      amountPaid: 1200.0,
      dueDate: "2025-04-01",
      frequency: "Monthly",
      category: "Housing",
      status: "paid",
    },
    {
      id: "2025-04-2",
      name: "Electric Bill - April",
      amount: 128.0,
      amountPaid: 128.0,
      dueDate: "2025-04-05",
      frequency: "Monthly",
      category: "Utilities",
      status: "paid",
    },
    {
      id: "2025-04-3",
      name: "Internet Service - April",
      amount: 66.0,
      amountPaid: 66.0,
      dueDate: "2025-04-08",
      frequency: "Monthly",
      category: "Utilities",
      status: "paid",
    },
    {
      id: "2025-04-4",
      name: "Groceries - April Week 1",
      amount: 168.0,
      amountPaid: 168.0,
      dueDate: "2025-04-10",
      frequency: "Weekly",
      category: "Groceries",
      status: "paid",
    },
    {
      id: "2025-04-5",
      name: "Prescription Medications - April",
      amount: 245.0,
      amountPaid: 245.0,
      dueDate: "2025-04-12",
      frequency: "Monthly",
      category: "Medical",
      status: "paid",
    },
    {
      id: "2025-04-6",
      name: "Home Care Services - April",
      amount: 600.0,
      amountPaid: 600.0,
      dueDate: "2025-04-15",
      frequency: "Monthly",
      category: "Medical",
      status: "paid",
    },
    {
      id: "2025-04-7",
      name: "Gas & Water - April",
      amount: 85.0,
      amountPaid: 85.0,
      dueDate: "2025-04-20",
      frequency: "Monthly",
      category: "Utilities",
      status: "paid",
    },
    {
      id: "2025-04-8",
      name: "Transportation Services - April",
      amount: 120.0,
      amountPaid: 120.0,
      dueDate: "2025-04-25",
      frequency: "Monthly",
      category: "Transportation",
      status: "paid",
    },

    // MAY 2025
    {
      id: "2025-05-1",
      name: "Rent - May",
      amount: 1200.0,
      amountPaid: 1200.0,
      dueDate: "2025-05-01",
      frequency: "Monthly",
      category: "Housing",
      status: "paid",
    },
    {
      id: "2025-05-2",
      name: "Electric Bill - May",
      amount: 115.0,
      amountPaid: 115.0,
      dueDate: "2025-05-05",
      frequency: "Monthly",
      category: "Utilities",
      status: "paid",
    },
    {
      id: "2025-05-3",
      name: "Internet Service - May",
      amount: 66.0,
      amountPaid: 66.0,
      dueDate: "2025-05-08",
      frequency: "Monthly",
      category: "Utilities",
      status: "paid",
    },
    {
      id: "2025-05-4",
      name: "Groceries - May Week 1",
      amount: 172.0,
      amountPaid: 172.0,
      dueDate: "2025-05-10",
      frequency: "Weekly",
      category: "Groceries",
      status: "paid",
    },
    {
      id: "2025-05-5",
      name: "Prescription Medications - May",
      amount: 250.0,
      amountPaid: 250.0,
      dueDate: "2025-05-12",
      frequency: "Monthly",
      category: "Medical",
      status: "paid",
    },
    {
      id: "2025-05-6",
      name: "Home Care Services - May",
      amount: 600.0,
      amountPaid: 600.0,
      dueDate: "2025-05-15",
      frequency: "Monthly",
      category: "Medical",
      status: "paid",
    },
    {
      id: "2025-05-7",
      name: "Gas & Water - May",
      amount: 78.0,
      amountPaid: 78.0,
      dueDate: "2025-05-20",
      frequency: "Monthly",
      category: "Utilities",
      status: "paid",
    },
    {
      id: "2025-05-8",
      name: "Transportation Services - May",
      amount: 115.0,
      amountPaid: 115.0,
      dueDate: "2025-05-25",
      frequency: "Monthly",
      category: "Transportation",
      status: "paid",
    },

    // JUNE 2025
    {
      id: "2025-06-1",
      name: "Rent - June",
      amount: 1200.0,
      amountPaid: 1200.0,
      dueDate: "2025-06-01",
      frequency: "Monthly",
      category: "Housing",
      status: "paid",
    },
    {
      id: "2025-06-2",
      name: "Electric Bill - June",
      amount: 145.0,
      amountPaid: 145.0,
      dueDate: "2025-06-05",
      frequency: "Monthly",
      category: "Utilities",
      status: "paid",
    },
    {
      id: "2025-06-3",
      name: "Internet Service - June",
      amount: 66.0,
      amountPaid: 66.0,
      dueDate: "2025-06-08",
      frequency: "Monthly",
      category: "Utilities",
      status: "paid",
    },
    {
      id: "2025-06-4",
      name: "Groceries - June Week 1",
      amount: 180.0,
      amountPaid: 180.0,
      dueDate: "2025-06-10",
      frequency: "Weekly",
      category: "Groceries",
      status: "paid",
    },
    {
      id: "2025-06-5",
      name: "Prescription Medications - June",
      amount: 245.0,
      amountPaid: 245.0,
      dueDate: "2025-06-12",
      frequency: "Monthly",
      category: "Medical",
      status: "paid",
    },
    {
      id: "2025-06-6",
      name: "Home Care Services - June",
      amount: 600.0,
      amountPaid: 600.0,
      dueDate: "2025-06-15",
      frequency: "Monthly",
      category: "Medical",
      status: "paid",
    },
    {
      id: "2025-06-7",
      name: "Gas & Water - June",
      amount: 95.0,
      amountPaid: 95.0,
      dueDate: "2025-06-20",
      frequency: "Monthly",
      category: "Utilities",
      status: "paid",
    },
    {
      id: "2025-06-8",
      name: "Transportation Services - June",
      amount: 130.0,
      amountPaid: 130.0,
      dueDate: "2025-06-25",
      frequency: "Monthly",
      category: "Transportation",
      status: "paid",
    },

    // JULY 2025
    {
      id: "2025-07-1",
      name: "Rent - July",
      amount: 1200.0,
      amountPaid: 1200.0,
      dueDate: "2025-07-01",
      frequency: "Monthly",
      category: "Housing",
      status: "paid",
    },
    {
      id: "2025-07-2",
      name: "Electric Bill - July",
      amount: 165.0,
      amountPaid: 165.0,
      dueDate: "2025-07-05",
      frequency: "Monthly",
      category: "Utilities",
      status: "paid",
    },
    {
      id: "2025-07-3",
      name: "Internet Service - July",
      amount: 66.0,
      amountPaid: 66.0,
      dueDate: "2025-07-08",
      frequency: "Monthly",
      category: "Utilities",
      status: "paid",
    },
    {
      id: "2025-07-4",
      name: "Groceries - July Week 1",
      amount: 185.0,
      amountPaid: 185.0,
      dueDate: "2025-07-10",
      frequency: "Weekly",
      category: "Groceries",
      status: "paid",
    },
    {
      id: "2025-07-5",
      name: "Prescription Medications - July",
      amount: 250.0,
      amountPaid: 250.0,
      dueDate: "2025-07-12",
      frequency: "Monthly",
      category: "Medical",
      status: "paid",
    },
    {
      id: "2025-07-6",
      name: "Home Care Services - July",
      amount: 600.0,
      amountPaid: 600.0,
      dueDate: "2025-07-15",
      frequency: "Monthly",
      category: "Medical",
      status: "paid",
    },
    {
      id: "2025-07-7",
      name: "Gas & Water - July",
      amount: 105.0,
      amountPaid: 105.0,
      dueDate: "2025-07-20",
      frequency: "Monthly",
      category: "Utilities",
      status: "paid",
    },
    {
      id: "2025-07-8",
      name: "Transportation Services - July",
      amount: 135.0,
      amountPaid: 135.0,
      dueDate: "2025-07-25",
      frequency: "Monthly",
      category: "Transportation",
      status: "paid",
    },

    // AUGUST 2025
    {
      id: "2025-08-1",
      name: "Rent - August",
      amount: 1200.0,
      amountPaid: 1200.0,
      dueDate: "2025-08-01",
      frequency: "Monthly",
      category: "Housing",
      status: "paid",
    },
    {
      id: "2025-08-2",
      name: "Electric Bill - August",
      amount: 158.0,
      amountPaid: 158.0,
      dueDate: "2025-08-05",
      frequency: "Monthly",
      category: "Utilities",
      status: "paid",
    },
    {
      id: "2025-08-3",
      name: "Internet Service - August",
      amount: 66.0,
      amountPaid: 66.0,
      dueDate: "2025-08-08",
      frequency: "Monthly",
      category: "Utilities",
      status: "paid",
    },
    {
      id: "2025-08-4",
      name: "Groceries - August Week 1",
      amount: 175.0,
      amountPaid: 175.0,
      dueDate: "2025-08-10",
      frequency: "Weekly",
      category: "Groceries",
      status: "paid",
    },
    {
      id: "2025-08-5",
      name: "Prescription Medications - August",
      amount: 245.0,
      amountPaid: 245.0,
      dueDate: "2025-08-12",
      frequency: "Monthly",
      category: "Medical",
      status: "paid",
    },
    {
      id: "2025-08-6",
      name: "Home Care Services - August",
      amount: 600.0,
      amountPaid: 600.0,
      dueDate: "2025-08-15",
      frequency: "Monthly",
      category: "Medical",
      status: "paid",
    },
    {
      id: "2025-08-7",
      name: "Gas & Water - August",
      amount: 95.0,
      amountPaid: 95.0,
      dueDate: "2025-08-20",
      frequency: "Monthly",
      category: "Utilities",
      status: "paid",
    },
    {
      id: "2025-08-8",
      name: "Transportation Services - August",
      amount: 120.0,
      amountPaid: 120.0,
      dueDate: "2025-08-25",
      frequency: "Monthly",
      category: "Transportation",
      status: "paid",
    },

    // SEPTEMBER 2025
    {
      id: "2025-09-1",
      name: "Rent - September",
      amount: 1200.0,
      amountPaid: 1200.0,
      dueDate: "2025-09-01",
      frequency: "Monthly",
      category: "Housing",
      status: "paid",
    },
    {
      id: "2025-09-2",
      name: "Electric Bill - September",
      amount: 145.0,
      amountPaid: 145.0,
      dueDate: "2025-09-05",
      frequency: "Monthly",
      category: "Utilities",
      status: "paid",
    },
    {
      id: "2025-09-3",
      name: "Internet Service - September",
      amount: 66.0,
      amountPaid: 66.0,
      dueDate: "2025-09-08",
      frequency: "Monthly",
      category: "Utilities",
      status: "paid",
    },
    {
      id: "2025-09-4",
      name: "Groceries - September Week 1",
      amount: 180.0,
      amountPaid: 180.0,
      dueDate: "2025-09-10",
      frequency: "Weekly",
      category: "Groceries",
      status: "paid",
    },
    {
      id: "2025-09-5",
      name: "Prescription Medications - September",
      amount: 250.0,
      amountPaid: 250.0,
      dueDate: "2025-09-12",
      frequency: "Monthly",
      category: "Medical",
      status: "paid",
    },
    {
      id: "2025-09-6",
      name: "Doctor Appointment Co-pay",
      amount: 35.0,
      amountPaid: 35.0,
      dueDate: "2025-09-15",
      frequency: "One-time",
      category: "Medical",
      status: "paid",
    },
    {
      id: "2025-09-7",
      name: "Home Care Services - September",
      amount: 600.0,
      amountPaid: 600.0,
      dueDate: "2025-09-15",
      frequency: "Monthly",
      category: "Medical",
      status: "paid",
    },
    {
      id: "2025-09-8",
      name: "Gas & Water - September",
      amount: 88.0,
      amountPaid: 88.0,
      dueDate: "2025-09-20",
      frequency: "Monthly",
      category: "Utilities",
      status: "paid",
    },
    {
      id: "2025-09-9",
      name: "Transportation Services - September",
      amount: 115.0,
      amountPaid: 115.0,
      dueDate: "2025-09-25",
      frequency: "Monthly",
      category: "Transportation",
      status: "paid",
    },

    // CURRENT MONTH (October - Mix of Paid and Pending)
    {
      id: "c1",
      name: "Rent - October",
      amount: 1200.0,
      amountPaid: 1200.0,
      dueDate: "2025-10-01",
      frequency: "Monthly",
      category: "Housing",
      status: "paid",
    },
    {
      id: "c2",
      name: "Internet Service - October",
      amount: 66.0,
      amountPaid: 66.0,
      dueDate: "2025-10-03",
      frequency: "Monthly",
      category: "Utilities",
      status: "paid",
    },
    {
      id: "c3",
      name: "Electric Bill - October",
      amount: 155.0,
      amountPaid: 155.0,
      dueDate: "2025-10-05",
      frequency: "Monthly",
      category: "Utilities",
      status: "paid",
    },
    {
      id: "c4",
      name: "Groceries - Week 1",
      amount: 175.0,
      amountPaid: 175.0,
      dueDate: "2025-10-06",
      frequency: "Weekly",
      category: "Groceries",
      status: "paid",
    },
    {
      id: "c5",
      name: "Medicare Supplement - October",
      amount: 185.0,
      amountPaid: 92.5,
      dueDate: "2025-10-08",
      frequency: "Monthly",
      category: "Medical",
      status: "partial",
    },
    {
      id: "c6",
      name: "Prescription Medications",
      amount: 245.0,
      amountPaid: 0,
      dueDate: "2025-10-12",
      frequency: "Monthly",
      category: "Medical",
      status: "pending",
    },
    {
      id: "c7",
      name: "Groceries - Week 2",
      amount: 165.0,
      amountPaid: 0,
      dueDate: "2025-10-13",
      frequency: "Weekly",
      category: "Groceries",
      status: "pending",
    },
    {
      id: "c8",
      name: "Physical Therapy Session",
      amount: 75.0,
      amountPaid: 0,
      dueDate: "2025-10-15",
      frequency: "One-time",
      category: "Medical",
      status: "pending",
    },
    {
      id: "c9",
      name: "Home Care Services",
      amount: 600.0,
      amountPaid: 0,
      dueDate: "2025-10-18",
      frequency: "Monthly",
      category: "Medical",
      status: "pending",
    },
    {
      id: "c10",
      name: "Groceries - Week 3",
      amount: 180.0,
      amountPaid: 0,
      dueDate: "2025-10-20",
      frequency: "Weekly",
      category: "Groceries",
      status: "pending",
    },
    {
      id: "c11",
      name: "Gas & Water Bill",
      amount: 105.0,
      amountPaid: 0,
      dueDate: "2025-10-22",
      frequency: "Monthly",
      category: "Utilities",
      status: "pending",
    },
    {
      id: "c12",
      name: "Transportation Services",
      amount: 120.0,
      amountPaid: 60.0,
      dueDate: "2025-10-25",
      frequency: "Monthly",
      category: "Transportation",
      status: "partial",
    },

    // FUTURE (November and beyond)
    {
      id: "f1",
      name: "Rent - November",
      amount: 1200.0,
      amountPaid: 0,
      dueDate: "2025-11-01",
      frequency: "Monthly",
      category: "Housing",
      status: "pending",
    },
    {
      id: "f2",
      name: "Annual Insurance Premium",
      amount: 1200.0,
      amountPaid: 0,
      dueDate: "2025-11-15",
      frequency: "Yearly",
      category: "Medical",
      status: "pending",
    },
    {
      id: "f3",
      name: "Quarterly Property Tax",
      amount: 450.0,
      amountPaid: 0,
      dueDate: "2025-11-30",
      frequency: "Quarterly",
      category: "Housing",
      status: "pending",
    },
    {
      id: "f4",
      name: "Rent - December",
      amount: 1200.0,
      amountPaid: 0,
      dueDate: "2025-12-01",
      frequency: "Monthly",
      category: "Housing",
      status: "pending",
    },
    {
      id: "f5",
      name: "Holiday Meal Service",
      amount: 350.0,
      amountPaid: 0,
      dueDate: "2025-12-20",
      frequency: "One-time",
      category: "Groceries",
      status: "pending",
    },
  ]);

  // Family Contributions
  const [familyContributions, setFamilyContributions] = useState<
    Contribution[]
  >([]);

  // Monthly budget state
  const [monthlyBudget, setMonthlyBudget] = useState(3500.0);

  // Fetch contributions function (reusable)
  const fetchContributions = React.useCallback(async () => {
    try {
      const response = await fetch(
        "/api/contributions?familyId=demo-family-id"
      );
      if (response.ok) {
        const data = await response.json();
        // Map database fields to match frontend type
        const mappedData = data.map((contrib: any) => ({
          id: contrib.id,
          name: contrib.memberName,
          amount: contrib.amount,
          percentage: contrib.percentage,
          initial: contrib.initial,
          color: contrib.color,
        }));
        setFamilyContributions(mappedData);
      }
    } catch (error) {
      console.error("Error fetching contributions:", error);
    }
  }, []);

  // Fetch family contributions on mount
  React.useEffect(() => {
    fetchContributions();
  }, [fetchContributions]);

  // Calculate dynamic values
  const totalBillAmount = bills.reduce((sum, bill) => sum + bill.amount, 0);
  const totalPaid = bills.reduce((sum, bill) => sum + bill.amountPaid, 0);
  const totalRemaining = totalBillAmount - totalPaid;
  const spent = totalPaid; // Keep in regular dollars
  const remaining = monthlyBudget - spent;
  const averageShortfall = Math.max(
    0,
    (totalBillAmount -
      familyContributions.reduce((sum, c) => sum + c.amount, 0)) /
      6
  ); // Average over 6 months

  // Calculate recommended budget based on historical spending
  // In a real app, this would use actual historical data
  const recommendedBudget = React.useMemo(() => {
    // Calculate average spending based on bills
    const totalMonthlyBills = bills.reduce((sum, bill) => {
      if (bill.frequency === "Monthly") return sum + bill.amount;
      if (bill.frequency === "Weekly") return sum + bill.amount * 4;
      if (bill.frequency === "Yearly") return sum + bill.amount / 12;
      if (bill.frequency === "Quarterly") return sum + bill.amount / 3;
      return sum + bill.amount; // One-time
    }, 0);

    // Add 20% buffer for unexpected expenses
    return Math.ceil(totalMonthlyBills * 1.2);
  }, [bills]);

  // Calculate expense breakdown by category
  const expenseBreakdown = React.useMemo(() => {
    // Determine the year for the selected month
    // Nov (10) and Dec (11) are 2024, rest are 2025
    const year = breakdownMonthIndex >= 10 ? 2024 : 2025;

    // Filter bills for the selected month
    const monthBills = bills.filter((bill) => {
      const billDate = new Date(bill.dueDate);
      return (
        billDate.getMonth() === breakdownMonthIndex &&
        billDate.getFullYear() === year &&
        bill.status !== "pending"
      );
    });

    const categoryTotals: { [key: string]: number } = {};
    monthBills.forEach((bill) => {
      categoryTotals[bill.category] =
        (categoryTotals[bill.category] || 0) + bill.amountPaid;
    });

    const total = Object.values(categoryTotals).reduce(
      (sum, val) => sum + val,
      0
    );
    return Object.entries(categoryTotals).map(([name, value]) => ({
      name,
      value: value, // Keep in regular dollars
      percentage: total > 0 ? Math.round((value / total) * 100) : 0,
      color: CATEGORY_COLORS[name] || CATEGORY_COLORS.Other,
    }));
  }, [bills, breakdownMonthIndex]);

  // Calculate expense trends by category (all 12 months)
  const allExpenseTrends = React.useMemo(() => {
    const months = [
      "Nov '24",
      "Dec '24",
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
    ];
    const monthIndices = [10, 11, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9]; // Nov 2024 through Oct 2025

    // Calculate spending per month broken down by category
    return months.map((month, index) => {
      const monthIndex = monthIndices[index];
      const year = index < 2 ? 2024 : 2025; // Nov-Dec are 2024, rest are 2025

      const monthBills = bills.filter((bill) => {
        const billDate = new Date(bill.dueDate);
        return (
          billDate.getMonth() === monthIndex &&
          billDate.getFullYear() === year &&
          bill.status !== "pending"
        );
      });

      // Group by category
      const categoryTotals: { [key: string]: number } = {};
      monthBills.forEach((bill) => {
        categoryTotals[bill.category] =
          (categoryTotals[bill.category] || 0) + bill.amountPaid;
      });

      return {
        month,
        Medical: categoryTotals.Medical || 0,
        Housing: categoryTotals.Housing || 0,
        Groceries: categoryTotals.Groceries || 0,
        Utilities: categoryTotals.Utilities || 0,
        Transportation: categoryTotals.Transportation || 0,
        Other: categoryTotals.Other || 0,
      };
    });
  }, [bills]);

  // Get 3-month window for display
  const expenseTrends = React.useMemo(() => {
    const startIdx = Math.max(0, trendsStartIndex - 2); // Show 3 months: start-2, start-1, start
    return allExpenseTrends.slice(startIdx, startIdx + 3);
  }, [allExpenseTrends, trendsStartIndex]);

  // Calculate upcoming bills (next 30 days)
  const upcomingBills = React.useMemo(() => {
    const today = new Date();
    const thirtyDaysFromNow = new Date(today);
    thirtyDaysFromNow.setDate(today.getDate() + 30);

    return bills
      .filter((bill) => {
        const dueDate = new Date(bill.dueDate);
        return (
          bill.status !== "paid" &&
          dueDate >= today &&
          dueDate <= thirtyDaysFromNow
        );
      })
      .sort(
        (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      )
      .slice(0, 5); // Show max 5 upcoming bills
  }, [bills]);

  const upcomingBillsDateRange = React.useMemo(() => {
    const today = new Date();
    const thirtyDaysFromNow = new Date(today);
    thirtyDaysFromNow.setDate(today.getDate() + 30);

    const formatDate = (date: Date) => {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    };

    return `${formatDate(today)} - ${formatDate(thirtyDaysFromNow)}`;
  }, []);

  // File upload handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Upload failed");
      }

      const data = await res.json();
      setUploadedFile({
        url: data.url,
        fileName: data.fileName,
      });
    } catch (error) {
      console.error("Error uploading file:", error);
      alert(error instanceof Error ? error.message : "Failed to upload file");
    } finally {
      setUploading(false);
    }
  };

  // Fetch family members
  useEffect(() => {
    async function fetchMembers() {
      try {
        const res = await fetch("/api/families");
        if (!res.ok) return;
        const families = await res.json();
        if (families.length > 0) {
          const membersRes = await fetch(
            `/api/families/${families[0].id}/members`
          );
          if (membersRes.ok) {
            const members = await membersRes.json();
            setFamilyMembers(members);
            initializeAllocations(members);
          }
        }
      } catch (error) {
        console.error("Error fetching members:", error);
      }
    }
    fetchMembers();
  }, []);

  const initializeAllocations = (members: FamilyMember[]) => {
    const total = parseFloat(billData.amount) || 0;
    const equalAmount = members.length > 0 ? total / members.length : 0;

    setAllocations(
      members.map((member) => ({
        userId: member.userId,
        name: member.user.name || member.user.email,
        amount: equalAmount,
        percentage: members.length > 0 ? 100 / members.length : 0,
      }))
    );
  };

  const handleAllocationTypeChange = (type: "estate" | "family" | "split") => {
    setAllocationType(type);
    if (type === "family" && familyMembers.length > 0) {
      const total = parseFloat(billData.amount) || 0;
      const equalAmount =
        familyMembers.length > 0 ? total / familyMembers.length : 0;
      setAllocations(
        familyMembers.map((member) => ({
          userId: member.userId,
          name: member.user.name || member.user.email,
          amount: equalAmount,
          percentage: 100 / familyMembers.length,
        }))
      );
    }
  };

  const handleSplitTypeChange = (type: "equal" | "percentage" | "custom") => {
    setSplitType(type);
    const total = parseFloat(billData.amount) || 0;

    if (type === "equal" && familyMembers.length > 0) {
      const equalAmount = total / familyMembers.length;
      setAllocations(
        allocations.map((a) => ({
          ...a,
          amount: equalAmount,
          percentage: 100 / familyMembers.length,
        }))
      );
    }
  };

  const updateAllocation = (
    userId: string,
    field: "amount" | "percentage",
    value: number
  ) => {
    const total = parseFloat(billData.amount) || 0;

    setAllocations(
      allocations.map((a) => {
        if (a.userId === userId) {
          if (field === "amount") {
            return { ...a, amount: value, percentage: (value / total) * 100 };
          } else {
            return { ...a, percentage: value, amount: (value / 100) * total };
          }
        }
        return a;
      })
    );
  };

  const getTotalAllocated = () => {
    return allocations.reduce((sum, a) => sum + a.amount, 0);
  };

  const getTotalPercentage = () => {
    return allocations.reduce((sum, a) => sum + a.percentage, 0);
  };

  const isAllocationValid = () => {
    const total = parseFloat(billData.amount) || 0;
    const allocated = getTotalAllocated();
    return Math.abs(total - allocated) < 0.01; // Allow for small rounding differences
  };

  const handleSubmitBill = async () => {
    setLoading(true);
    try {
      // Create new bill
      const newBill: Bill = {
        id: Date.now().toString(),
        name: billData.name,
        amount: parseFloat(billData.amount),
        amountPaid: 0,
        dueDate: billData.dueDate,
        frequency: billData.frequency,
        category: billData.category,
        status: "pending",
      };

      // Add to bills state
      setBills([...bills, newBill]);

      // Success - close modal and reset
      setShowAddBill(false);
      setBillStep(1);
      setBillData({
        name: "",
        amount: "",
        dueDate: "",
        frequency: "One-time",
        category: "Medical",
      });
      setAllocationType("estate");
      setUploadedFile(null);

      alert("Bill added successfully!");
    } catch (error) {
      console.error("Error submitting bill:", error);
      alert(error instanceof Error ? error.message : "Failed to add bill");
    } finally {
      setLoading(false);
    }
  };

  const canProceedToStep2 =
    billData.name && billData.amount && billData.dueDate;

  // Handler for marking bill as paid
  const handleMarkAsPaid = (bill: Bill) => {
    if (confirm(`Mark "${bill.name}" as paid ($${bill.amount.toFixed(2)})?`)) {
      setBills(
        bills.map((b) =>
          b.id === bill.id
            ? { ...b, amountPaid: b.amount, status: "paid" as const }
            : b
        )
      );
      alert(`✓ ${bill.name} marked as paid!`);
    }
  };

  // Handler for editing bill
  const handleEditBill = (bill: Bill) => {
    setEditingBill(bill);
    setBillData({
      name: bill.name,
      amount: bill.amount.toString(),
      dueDate: bill.dueDate,
      frequency: bill.frequency,
      category: bill.category,
    });
    setShowEditBill(true);
  };

  // Handler for saving edited bill
  const handleSaveEdit = () => {
    if (editingBill) {
      setBills(
        bills.map((b) =>
          b.id === editingBill.id
            ? {
                ...b,
                name: billData.name,
                amount: parseFloat(billData.amount),
                dueDate: billData.dueDate,
                frequency: billData.frequency,
                category: billData.category,
              }
            : b
        )
      );
      alert(`✓ ${billData.name} updated successfully!`);
      setShowEditBill(false);
      setEditingBill(null);
      setBillData({
        name: "",
        amount: "",
        dueDate: "",
        frequency: "One-time",
        category: "Medical",
      });
    }
  };

  // Handler for viewing history
  const handleViewHistory = (member: Contribution) => {
    setSelectedMember(member);
    setShowHistory(true);
  };

  // Handler for adjusting split
  const handleAdjustSplit = (member: Contribution) => {
    setAdjustingMember(member);
    setShowAdjustSplit(true);
  };

  // Handler for updating a member's contribution amount
  const handleContributionAmountChange = (
    memberId: string,
    newAmount: number
  ) => {
    const totalContributions = familyContributions.reduce(
      (sum, m) => sum + m.amount,
      0
    );
    const newTotal =
      totalContributions - (adjustingMember?.amount || 0) + newAmount;

    // Update the adjusting member
    const updatedContributions = familyContributions.map((m) => {
      if (m.id === memberId) {
        return {
          ...m,
          amount: newAmount,
          percentage: Math.round((newAmount / newTotal) * 100),
        };
      }
      // Recalculate percentages for all members
      return {
        ...m,
        percentage: Math.round((m.amount / newTotal) * 100),
      };
    });

    setFamilyContributions(updatedContributions);
    setAdjustingMember(
      updatedContributions.find((m) => m.id === memberId) || null
    );
  };

  // Handler for updating a member's contribution percentage
  const handleContributionPercentageChange = (
    memberId: string,
    newPercentage: number
  ) => {
    const totalContributions = familyContributions.reduce(
      (sum, m) => sum + m.amount,
      0
    );
    const newAmount = (newPercentage / 100) * totalContributions;

    // Calculate the difference
    const oldAmount = adjustingMember?.amount || 0;
    const difference = newAmount - oldAmount;

    // Distribute the difference among other members proportionally
    const otherMembers = familyContributions.filter((m) => m.id !== memberId);
    const otherMembersTotal = otherMembers.reduce(
      (sum, m) => sum + m.amount,
      0
    );

    const updatedContributions = familyContributions.map((m) => {
      if (m.id === memberId) {
        return {
          ...m,
          amount: newAmount,
          percentage: newPercentage,
        };
      }
      // Adjust other members proportionally
      const proportion =
        otherMembersTotal > 0 ? m.amount / otherMembersTotal : 0;
      const adjustment = difference * proportion;
      const adjustedAmount = Math.max(0, m.amount - adjustment);

      return {
        ...m,
        amount: adjustedAmount,
        percentage: Math.round((adjustedAmount / totalContributions) * 100),
      };
    });

    setFamilyContributions(updatedContributions);
    setAdjustingMember(
      updatedContributions.find((m) => m.id === memberId) || null
    );
  };

  // Handler for saving adjusted split
  const handleSaveSplit = async () => {
    if (!adjustingMember) return;

    try {
      const response = await fetch("/api/contributions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          familyId: "demo-family-id",
          contributions: familyContributions.map((m) => ({
            id: m.id,
            amount: m.amount,
            percentage: m.percentage,
          })),
        }),
      });

      if (response.ok) {
        const updatedContributions = await response.json();
        // Map database fields to match frontend type
        const mappedData = updatedContributions.map((contrib: any) => ({
          id: contrib.id,
          name: contrib.memberName,
          amount: contrib.amount,
          percentage: contrib.percentage,
          initial: contrib.initial,
          color: contrib.color,
        }));
        setFamilyContributions(mappedData);
        setShowAdjustSplit(false);
        setAdjustingMember(null);
      }
    } catch (error) {
      console.error("Error saving contributions:", error);
      alert("Failed to save contribution adjustments");
    }
  };

  // Handler for opening budget edit
  const handleEditBudget = () => {
    setTempBudget(monthlyBudget.toString());
    setShowBudgetEdit(true);
  };

  // Handler for saving budget
  const handleSaveBudget = () => {
    const newBudget = parseFloat(tempBudget);
    if (newBudget > 0) {
      setMonthlyBudget(newBudget);
      setShowBudgetEdit(false);
      alert(`✓ Monthly budget updated to $${newBudget.toFixed(2)}`);
    } else {
      alert("Please enter a valid budget amount");
    }
  };

  // Handler for using recommended budget
  const handleUseRecommended = () => {
    setTempBudget(recommendedBudget.toString());
  };

  // Filter bills by search and month
  const filteredBills = React.useMemo(() => {
    return bills.filter((bill) => {
      const billDate = new Date(bill.dueDate);
      const matchesMonth =
        selectedMonth === -1 || billDate.getMonth() === selectedMonth;
      const matchesSearch =
        billSearchQuery === "" ||
        bill.name.toLowerCase().includes(billSearchQuery.toLowerCase()) ||
        bill.category.toLowerCase().includes(billSearchQuery.toLowerCase());

      return matchesMonth && matchesSearch;
    });
  }, [bills, selectedMonth, billSearchQuery]);

  // Get month name
  const getMonthName = (monthIndex: number) => {
    if (monthIndex === -1) return "All Months";
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    return months[monthIndex];
  };

  // Month navigation handlers
  const handlePreviousMonth = () => {
    setSelectedMonth((prev) => (prev === -1 ? 11 : prev === 0 ? -1 : prev - 1));
  };

  const handleNextMonth = () => {
    setSelectedMonth((prev) => (prev === -1 ? 0 : prev === 11 ? -1 : prev + 1));
  };

  // Expense Trends Navigation (3-month window)
  const handlePreviousTrends = () => {
    if (trendsStartIndex > 2) {
      setTrendsStartIndex(trendsStartIndex - 3);
    }
  };

  const handleNextTrends = () => {
    if (trendsStartIndex < 11) {
      setTrendsStartIndex(Math.min(11, trendsStartIndex + 3));
    }
  };

  const getTrendsMonthRange = () => {
    const startIdx = Math.max(0, trendsStartIndex - 2);
    const months = allExpenseTrends.slice(startIdx, startIdx + 3);
    if (months.length === 0) return "";
    if (months.length === 1) return months[0].month;
    return `${months[0].month} - ${months[months.length - 1].month}`;
  };

  // Expense Breakdown Navigation (single month)
  const handlePreviousBreakdown = () => {
    if (breakdownMonthIndex > 10) {
      // Can go back to Nov (10)
      setBreakdownMonthIndex(breakdownMonthIndex - 1);
    } else if (breakdownMonthIndex > 0) {
      // Can go back from Jan-Oct (0-9)
      setBreakdownMonthIndex(breakdownMonthIndex - 1);
    }
  };

  const handleNextBreakdown = () => {
    if (breakdownMonthIndex < 9) {
      // Can go forward up to Oct (9) in 2025
      setBreakdownMonthIndex(breakdownMonthIndex + 1);
    } else if (breakdownMonthIndex >= 10 && breakdownMonthIndex < 11) {
      // Can go from Nov to Dec in 2024
      setBreakdownMonthIndex(breakdownMonthIndex + 1);
    } else if (breakdownMonthIndex === 11) {
      // From Dec 2024 to Jan 2025
      setBreakdownMonthIndex(0);
    }
  };

  const getBreakdownMonthName = () => {
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const year = breakdownMonthIndex >= 10 ? 2024 : 2025;
    return `${monthNames[breakdownMonthIndex]} ${year}`;
  };

  // Handler for clicking on an upcoming bill
  const handleBillClick = (bill: Bill) => {
    // Switch to Bills tab
    setActiveTab("Bills");
    // Set month filter to the bill's month
    const billDate = new Date(bill.dueDate);
    setSelectedMonth(billDate.getMonth());
    // Optionally set search to highlight the bill
    setBillSearchQuery(bill.name);
  };

  // Handler for downloading contribution report
  const handleDownloadReport = () => {
    const csvContent = [
      ["Family Member", "Amount Contributed", "Percentage", "Status"],
      ...familyContributions.map((member) => [
        member.name,
        `$${member.amount.toFixed(2)}`,
        `${member.percentage}%`,
        member.amount > 0 ? "Active" : "Inactive",
      ]),
      [],
      ["Summary"],
      [
        "Total Contributions",
        `$${familyContributions
          .reduce((sum, m) => sum + m.amount, 0)
          .toFixed(2)}`,
      ],
      ["Total Bills", `$${totalBillAmount.toFixed(2)}`],
      ["Average Monthly Shortfall", `$${averageShortfall.toFixed(2)}`],
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `family-contributions-${
      new Date().toISOString().split("T")[0]
    }.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className={styles.container}>
      <Navigation showAuthLinks={true} />

      <div className={styles.layout}>
        <LeftNavigation />
        <main className={styles.main}>
          <div className={styles.pageHeader}>
            <div>
              <h1>Finances</h1>
              <p className={styles.subtitle}>
                Manage expenses, bills, and budgeting for care
              </p>
            </div>
            <div className={styles.headerButtons}>
              <button
                className={styles.addBillBtn}
                onClick={() => setShowAddBill(true)}
              >
                📄 Add Bill
              </button>
            </div>
          </div>

          {/* Add Bill Modal */}
          {showAddBill && (
            <div className={styles.modal} onClick={() => setShowAddBill(false)}>
              <div
                className={styles.modalContent}
                onClick={(e) => e.stopPropagation()}
              >
                <div className={styles.modalHeader}>
                  <h2>
                    {billStep === 1
                      ? "Add Bill - Details"
                      : "Add Bill - Allocate Costs"}
                  </h2>
                  <button
                    className={styles.closeBtn}
                    onClick={() => setShowAddBill(false)}
                  >
                    <X size={24} />
                  </button>
                </div>

                {/* Step Indicator */}
                <div className={styles.stepIndicator}>
                  <div
                    className={`${styles.step} ${
                      billStep >= 1 ? styles.activeStep : ""
                    }`}
                  >
                    <div className={styles.stepNumber}>1</div>
                    <span>Bill Details</span>
                  </div>
                  <div className={styles.stepLine}></div>
                  <div
                    className={`${styles.step} ${
                      billStep >= 2 ? styles.activeStep : ""
                    }`}
                  >
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
                        onChange={(e) =>
                          setBillData({ ...billData, name: e.target.value })
                        }
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
                            onChange={(e) =>
                              setBillData({
                                ...billData,
                                amount: e.target.value,
                              })
                            }
                            placeholder="0.00"
                          />
                        </div>
                      </div>

                      <div className={styles.formGroup}>
                        <label>Due Date *</label>
                        <input
                          type="date"
                          value={billData.dueDate}
                          onChange={(e) =>
                            setBillData({
                              ...billData,
                              dueDate: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>

                    <div className={styles.formRow}>
                      <div className={styles.formGroup}>
                        <label>Frequency</label>
                        <select
                          value={billData.frequency}
                          onChange={(e) =>
                            setBillData({
                              ...billData,
                              frequency: e.target.value,
                            })
                          }
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
                          onChange={(e) =>
                            setBillData({
                              ...billData,
                              category: e.target.value,
                            })
                          }
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
                        <label
                          htmlFor="receipt-upload"
                          className={styles.fileLabel}
                        >
                          {uploading
                            ? "Uploading..."
                            : uploadedFile
                            ? "Change File"
                            : "Choose File"}
                        </label>
                        <span className={styles.fileHint}>
                          {uploadedFile
                            ? uploadedFile.fileName
                            : "Upload receipt, bill, or invoice (PDF, JPG, PNG - Max 10MB)"}
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
                        <strong>
                          ${parseFloat(billData.amount || "0").toFixed(2)}
                        </strong>
                      </div>
                      {uploadedFile && (
                        <div className={styles.summaryItem}>
                          <span>Receipt:</span>
                          <a
                            href={uploadedFile.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.receiptLink}
                          >
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
                          setBillStep(2);
                          if (familyMembers.length > 0) {
                            initializeAllocations(familyMembers);
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
                      <p>
                        Total to allocate:{" "}
                        <strong>
                          ${parseFloat(billData.amount || "0").toFixed(2)}
                        </strong>
                      </p>
                    </div>

                    <div className={styles.allocationTypes}>
                      <button
                        className={`${styles.allocationType} ${
                          allocationType === "estate"
                            ? styles.activeAllocationType
                            : ""
                        }`}
                        onClick={() => handleAllocationTypeChange("estate")}
                      >
                        <div className={styles.allocationIcon}>🏛️</div>
                        <div>
                          <strong>Estate/Individual</strong>
                          <p>Paid from care recipient's funds</p>
                        </div>
                      </button>

                      <button
                        className={`${styles.allocationType} ${
                          allocationType === "family"
                            ? styles.activeAllocationType
                            : ""
                        }`}
                        onClick={() => handleAllocationTypeChange("family")}
                      >
                        <div className={styles.allocationIcon}>👥</div>
                        <div>
                          <strong>Family Members</strong>
                          <p>Split among family members</p>
                        </div>
                      </button>
                    </div>

                    {allocationType === "family" && (
                      <div className={styles.splitOptions}>
                        <h4>Split Method</h4>
                        <div className={styles.splitButtons}>
                          <button
                            className={`${styles.splitBtn} ${
                              splitType === "equal" ? styles.activeSplitBtn : ""
                            }`}
                            onClick={() => handleSplitTypeChange("equal")}
                          >
                            Equal Split
                          </button>
                          <button
                            className={`${styles.splitBtn} ${
                              splitType === "percentage"
                                ? styles.activeSplitBtn
                                : ""
                            }`}
                            onClick={() => handleSplitTypeChange("percentage")}
                          >
                            By Percentage
                          </button>
                          <button
                            className={`${styles.splitBtn} ${
                              splitType === "custom"
                                ? styles.activeSplitBtn
                                : ""
                            }`}
                            onClick={() => handleSplitTypeChange("custom")}
                          >
                            Custom Amount
                          </button>
                        </div>

                        <div className={styles.allocationslist}>
                          {allocations.map((allocation) => (
                            <div
                              key={allocation.userId}
                              className={styles.allocationRow}
                            >
                              <div className={styles.memberName}>
                                {allocation.name}
                              </div>
                              <div className={styles.allocationInputs}>
                                {splitType === "equal" ? (
                                  <div className={styles.allocationDisplay}>
                                    ${allocation.amount.toFixed(2)} (
                                    {allocation.percentage.toFixed(1)}%)
                                  </div>
                                ) : splitType === "percentage" ? (
                                  <div className={styles.inputGroup}>
                                    <input
                                      type="number"
                                      value={allocation.percentage}
                                      onChange={(e) =>
                                        updateAllocation(
                                          allocation.userId,
                                          "percentage",
                                          parseFloat(e.target.value) || 0
                                        )
                                      }
                                      className={styles.percentageInput}
                                    />
                                    <span>
                                      % = ${allocation.amount.toFixed(2)}
                                    </span>
                                  </div>
                                ) : (
                                  <div className={styles.inputGroup}>
                                    <span>$</span>
                                    <input
                                      type="number"
                                      step="0.01"
                                      value={allocation.amount}
                                      onChange={(e) =>
                                        updateAllocation(
                                          allocation.userId,
                                          "amount",
                                          parseFloat(e.target.value) || 0
                                        )
                                      }
                                      className={styles.amountInputSmall}
                                    />
                                    <span>
                                      ({allocation.percentage.toFixed(1)}%)
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>

                        <div
                          className={`${styles.allocationSummary} ${
                            !isAllocationValid() ? styles.invalid : ""
                          }`}
                        >
                          <div className={styles.summaryRow}>
                            <span>Total Allocated:</span>
                            <strong>
                              ${getTotalAllocated().toFixed(2)} (
                              {getTotalPercentage().toFixed(1)}%)
                            </strong>
                          </div>
                          <div className={styles.summaryRow}>
                            <span>Remaining:</span>
                            <strong>
                              $
                              {(
                                parseFloat(billData.amount) -
                                getTotalAllocated()
                              ).toFixed(2)}
                            </strong>
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
                        disabled={
                          allocationType === "family" && !isAllocationValid()
                        }
                      >
                        Add Bill
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Edit Bill Modal */}
          {showEditBill && editingBill && (
            <div
              className={styles.modal}
              onClick={() => setShowEditBill(false)}
            >
              <div
                className={styles.modalContent}
                onClick={(e) => e.stopPropagation()}
              >
                <div className={styles.modalHeader}>
                  <h2>Edit Bill</h2>
                  <button
                    className={styles.closeBtn}
                    onClick={() => setShowEditBill(false)}
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className={styles.modalBody}>
                  <div className={styles.formGroup}>
                    <label>Bill Name</label>
                    <input
                      type="text"
                      value={billData.name}
                      onChange={(e) =>
                        setBillData({ ...billData, name: e.target.value })
                      }
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Amount</label>
                    <div className={styles.amountInput}>
                      <span className={styles.currencySymbol}>$</span>
                      <input
                        type="number"
                        step="0.01"
                        value={billData.amount}
                        onChange={(e) =>
                          setBillData({ ...billData, amount: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Due Date</label>
                    <input
                      type="date"
                      value={billData.dueDate}
                      onChange={(e) =>
                        setBillData({ ...billData, dueDate: e.target.value })
                      }
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Frequency</label>
                    <select
                      value={billData.frequency}
                      onChange={(e) =>
                        setBillData({ ...billData, frequency: e.target.value })
                      }
                    >
                      <option value="One-time">One-time</option>
                      <option value="Weekly">Weekly</option>
                      <option value="Monthly">Monthly</option>
                      <option value="Quarterly">Quarterly</option>
                      <option value="Yearly">Yearly</option>
                    </select>
                  </div>

                  <div className={styles.modalActions}>
                    <button
                      className={styles.cancelBtn}
                      onClick={() => setShowEditBill(false)}
                    >
                      Cancel
                    </button>
                    <button
                      className={styles.submitBtn}
                      onClick={handleSaveEdit}
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* View History Modal */}
          {showHistory && selectedMember && (
            <div className={styles.modal} onClick={() => setShowHistory(false)}>
              <div
                className={styles.modalContent}
                onClick={(e) => e.stopPropagation()}
              >
                <div className={styles.modalHeader}>
                  <h2>{selectedMember.name} - Contribution History</h2>
                  <button
                    className={styles.closeBtn}
                    onClick={() => setShowHistory(false)}
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className={styles.modalBody}>
                  <div className={styles.historyStats}>
                    <div className={styles.historyStat}>
                      <p className={styles.statLabel}>Total Contributed</p>
                      <h3 className={styles.statValue}>
                        ${selectedMember.amount.toFixed(2)}
                      </h3>
                    </div>
                    <div className={styles.historyStat}>
                      <p className={styles.statLabel}>Contribution Share</p>
                      <h3 className={styles.statValue}>
                        {selectedMember.percentage}%
                      </h3>
                    </div>
                  </div>

                  <h3>Recent Contributions</h3>
                  <div className={styles.historyList}>
                    <div className={styles.historyItem}>
                      <div className={styles.historyInfo}>
                        <h4>Monthly Care Support</h4>
                        <p>September 2025</p>
                      </div>
                      <div className={styles.historyAmount}>$0.00</div>
                    </div>
                    <div className={styles.emptyState}>
                      <p>No contribution history yet</p>
                    </div>
                  </div>

                  <div className={styles.modalActions}>
                    <button
                      className={styles.cancelBtn}
                      onClick={() => setShowHistory(false)}
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Adjust Split Modal */}
          {showAdjustSplit && adjustingMember && (
            <div
              className={styles.modal}
              onClick={() => setShowAdjustSplit(false)}
            >
              <div
                className={styles.modalContent}
                onClick={(e) => e.stopPropagation()}
                style={{ maxWidth: "600px" }}
              >
                <div className={styles.modalHeader}>
                  <h2>Adjust Monthly Contribution Splits</h2>
                  <button
                    className={styles.closeBtn}
                    onClick={() => setShowAdjustSplit(false)}
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className={styles.modalBody}>
                  <p className={styles.modalDescription}>
                    Adjust each family member's contribution. Changes to one
                    member will automatically adjust others proportionally to
                    maintain 100%.
                  </p>

                  <div className={styles.contributionAdjustments}>
                    {familyContributions.map((member) => (
                      <div key={member.id} className={styles.adjustmentRow}>
                        <div className={styles.adjustmentHeader}>
                          <div
                            className={styles.adjustmentAvatar}
                            style={{ background: member.color }}
                          >
                            {member.initial}
                          </div>
                          <div className={styles.adjustmentInfo}>
                            <h4>{member.name}</h4>
                            <p>${member.amount.toFixed(2)}/month</p>
                          </div>
                        </div>
                        <div className={styles.adjustmentInputs}>
                          <div className={styles.inputGroup}>
                            <label>Amount</label>
                            <input
                              type="number"
                              min="0"
                              step="10"
                              value={member.amount}
                              onChange={(e) =>
                                handleContributionAmountChange(
                                  member.id,
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              className={styles.amountInput}
                            />
                          </div>
                          <div className={styles.inputGroup}>
                            <label>Percentage</label>
                            <div className={styles.percentageWrapper}>
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={member.percentage}
                                onChange={(e) =>
                                  handleContributionPercentageChange(
                                    member.id,
                                    parseInt(e.target.value) || 0
                                  )
                                }
                                className={styles.percentageInput}
                              />
                              <span>%</span>
                            </div>
                          </div>
                        </div>
                        <div className={styles.previewBar}>
                          <div
                            className={styles.previewFill}
                            style={{
                              width: `${member.percentage}%`,
                              background: member.color,
                            }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className={styles.totalSummary}>
                    <div className={styles.summaryRow}>
                      <span>Total Monthly Contributions:</span>
                      <strong>
                        $
                        {familyContributions
                          .reduce((sum, m) => sum + m.amount, 0)
                          .toFixed(2)}
                      </strong>
                    </div>
                    <div className={styles.summaryRow}>
                      <span>Total Percentage:</span>
                      <strong>
                        {familyContributions.reduce(
                          (sum, m) => sum + m.percentage,
                          0
                        )}
                        %
                      </strong>
                    </div>
                  </div>

                  <div className={styles.modalActions}>
                    <button
                      className={styles.cancelBtn}
                      onClick={() => {
                        setShowAdjustSplit(false);
                        // Reload contributions to reset any unsaved changes
                        fetchContributions();
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      className={styles.submitBtn}
                      onClick={handleSaveSplit}
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Budget Edit Modal */}
          {showBudgetEdit && (
            <div
              className={styles.modal}
              onClick={() => setShowBudgetEdit(false)}
            >
              <div
                className={styles.modalContent}
                onClick={(e) => e.stopPropagation()}
              >
                <div className={styles.modalHeader}>
                  <h2>Edit Monthly Budget</h2>
                  <button
                    className={styles.closeBtn}
                    onClick={() => setShowBudgetEdit(false)}
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className={styles.modalBody}>
                  <div className={styles.budgetRecommendation}>
                    <div className={styles.recommendationHeader}>
                      <h4>💡 Smart Recommendation</h4>
                      <p>Based on your recurring bills and spending patterns</p>
                    </div>
                    <div className={styles.recommendationCard}>
                      <div className={styles.recommendationAmount}>
                        <span className={styles.recommendationLabel}>
                          Recommended Budget:
                        </span>
                        <span className={styles.recommendationValue}>
                          ${recommendedBudget.toFixed(2)}/month
                        </span>
                      </div>
                      <p className={styles.recommendationExplanation}>
                        This includes all your recurring bills plus a 20% buffer
                        for unexpected expenses
                      </p>
                      <button
                        className={styles.useRecommendedBtn}
                        onClick={handleUseRecommended}
                      >
                        Use Recommended Budget
                      </button>
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Monthly Budget Amount</label>
                    <div className={styles.amountInput}>
                      <span className={styles.currencySymbol}>$</span>
                      <input
                        type="number"
                        step="0.01"
                        value={tempBudget}
                        onChange={(e) => setTempBudget(e.target.value)}
                        placeholder="0.00"
                        autoFocus
                      />
                    </div>
                  </div>

                  <div className={styles.budgetComparison}>
                    <div className={styles.comparisonRow}>
                      <span>Current Budget:</span>
                      <strong>${monthlyBudget.toFixed(2)}</strong>
                    </div>
                    <div className={styles.comparisonRow}>
                      <span>New Budget:</span>
                      <strong style={{ color: "#2563eb" }}>
                        $
                        {tempBudget
                          ? parseFloat(tempBudget).toFixed(2)
                          : "0.00"}
                      </strong>
                    </div>
                    {tempBudget && parseFloat(tempBudget) !== monthlyBudget && (
                      <div className={styles.comparisonRow}>
                        <span>Change:</span>
                        <strong
                          style={{
                            color:
                              parseFloat(tempBudget) > monthlyBudget
                                ? "#10b981"
                                : "#ef4444",
                          }}
                        >
                          {parseFloat(tempBudget) > monthlyBudget ? "+" : ""}$
                          {(parseFloat(tempBudget) - monthlyBudget).toFixed(2)}
                        </strong>
                      </div>
                    )}
                  </div>

                  <div className={styles.modalActions}>
                    <button
                      className={styles.cancelBtn}
                      onClick={() => setShowBudgetEdit(false)}
                    >
                      Cancel
                    </button>
                    <button
                      className={styles.submitBtn}
                      onClick={handleSaveBudget}
                    >
                      Save Budget
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className={styles.tabs}>
            {tabs.map((tab) => (
              <button
                key={tab}
                className={`${styles.tab} ${
                  activeTab === tab ? styles.activeTab : ""
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Overview Tab */}
          {activeTab === "Overview" && (
            <>
              {/* Monthly Budget Overview */}
              <div className={styles.budgetOverview}>
                <div className={styles.budgetHeader}>
                  <h2>Monthly Budget Overview</h2>
                  <button
                    className={styles.editBudgetBtn}
                    onClick={handleEditBudget}
                  >
                    <Edit2 size={16} />
                    Edit Budget
                  </button>
                </div>
                <div className={styles.budgetCards}>
                  <div className={styles.budgetCard}>
                    <p className={styles.budgetLabel}>Monthly Budget</p>
                    <h3 className={styles.budgetAmount}>
                      ${monthlyBudget.toFixed(2)}
                    </h3>
                  </div>
                  <div className={styles.budgetCard}>
                    <p className={styles.budgetLabel}>Spent This Month</p>
                    <h3 className={styles.budgetAmount}>${spent.toFixed(2)}</h3>
                  </div>
                  <div className={styles.budgetCard}>
                    <p className={styles.budgetLabel}>Remaining</p>
                    <h3
                      className={styles.budgetAmount}
                      style={{ color: remaining >= 0 ? "#10b981" : "#ef4444" }}
                    >
                      ${remaining.toFixed(2)}
                    </h3>
                  </div>
                  <div className={styles.budgetCard}>
                    <p className={styles.budgetLabel}>Avg Monthly Shortfall</p>
                    <h3
                      className={styles.budgetAmount}
                      style={{
                        color: averageShortfall > 0 ? "#ef4444" : "#10b981",
                      }}
                    >
                      ${averageShortfall.toFixed(2)}
                    </h3>
                  </div>
                </div>

                <div className={styles.progressSection}>
                  <div className={styles.progressLabels}>
                    <span>0%</span>
                    <span className={styles.spentLabel}>0% spent</span>
                    <span>100%</span>
                  </div>
                  <div className={styles.progressBar}>
                    <div
                      className={styles.progressFill}
                      style={{ width: `${(spent / monthlyBudget) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Charts Section */}
              <div className={styles.chartsGrid}>
                <div className={styles.chartCard}>
                  <div className={styles.chartHeader}>
                    <h3>Expense Trends</h3>
                    <div className={styles.trendsNavigation}>
                      <button
                        className={styles.trendsNavBtn}
                        onClick={handlePreviousTrends}
                        disabled={trendsStartIndex <= 2}
                      >
                        <ChevronLeft size={20} />
                      </button>
                      <span className={styles.trendsRange}>
                        {getTrendsMonthRange()}
                      </span>
                      <button
                        className={styles.trendsNavBtn}
                        onClick={handleNextTrends}
                        disabled={trendsStartIndex >= 11}
                      >
                        <ChevronRight size={20} />
                      </button>
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={expenseTrends}>
                      <XAxis dataKey="month" stroke="#6c757d" />
                      <YAxis
                        stroke="#6c757d"
                        tickFormatter={(value) => `$${value}`}
                      />
                      <Tooltip
                        formatter={(value: number) => `$${value.toFixed(2)}`}
                      />
                      <Bar
                        dataKey="Medical"
                        stackId="a"
                        fill={CATEGORY_COLORS.Medical}
                      />
                      <Bar
                        dataKey="Housing"
                        stackId="a"
                        fill={CATEGORY_COLORS.Housing}
                      />
                      <Bar
                        dataKey="Groceries"
                        stackId="a"
                        fill={CATEGORY_COLORS.Groceries}
                      />
                      <Bar
                        dataKey="Utilities"
                        stackId="a"
                        fill={CATEGORY_COLORS.Utilities}
                      />
                      <Bar
                        dataKey="Transportation"
                        stackId="a"
                        fill={CATEGORY_COLORS.Transportation}
                      />
                      <Bar
                        dataKey="Other"
                        stackId="a"
                        fill={CATEGORY_COLORS.Other}
                        radius={[8, 8, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                  <div className={styles.chartLegend}>
                    {Object.entries(CATEGORY_COLORS).map(
                      ([category, color]) => (
                        <div key={category} className={styles.legendItem}>
                          <div
                            className={styles.legendDot}
                            style={{ background: color }}
                          ></div>
                          <span>{category}</span>
                        </div>
                      )
                    )}
                  </div>
                </div>

                <div className={styles.chartCard}>
                  <div className={styles.chartHeader}>
                    <h3>Expense Breakdown</h3>
                    <div className={styles.trendsNavigation}>
                      <button
                        className={styles.trendsNavBtn}
                        onClick={handlePreviousBreakdown}
                        disabled={breakdownMonthIndex === 10}
                      >
                        <ChevronLeft size={20} />
                      </button>
                      <span className={styles.trendsRange}>
                        {getBreakdownMonthName()}
                      </span>
                      <button
                        className={styles.trendsNavBtn}
                        onClick={handleNextBreakdown}
                        disabled={breakdownMonthIndex === 9}
                      >
                        <ChevronRight size={20} />
                      </button>
                    </div>
                  </div>
                  {expenseBreakdown.length > 0 ? (
                    <>
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
                          <Tooltip
                            formatter={(value: number) =>
                              `$${value.toFixed(2)}`
                            }
                          />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className={styles.legend}>
                        {expenseBreakdown.map((item) => (
                          <div key={item.name} className={styles.legendItem}>
                            <div
                              className={styles.legendDot}
                              style={{ background: item.color }}
                            ></div>
                            <span>{item.name}</span>
                            <strong>
                              ${item.value.toFixed(2)} ({item.percentage}%)
                            </strong>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className={styles.emptyChartState}>
                      <p>No expense data for {getBreakdownMonthName()}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Section */}
              <div className={styles.bottomGrid}>
                {/* Upcoming Bills */}
                <div className={styles.billsCard}>
                  <div className={styles.cardHeader}>
                    <div>
                      <h3>Upcoming Bills</h3>
                      <p className={styles.cardSubtitle}>
                        Next 30 Days • {upcomingBillsDateRange}
                      </p>
                    </div>
                    <button
                      className={styles.viewAllLink}
                      onClick={() => {
                        setActiveTab("Bills");
                        setSelectedMonth(-1);
                        setBillSearchQuery("");
                      }}
                    >
                      View All →
                    </button>
                  </div>
                  <div className={styles.billsList}>
                    {upcomingBills.length > 0 ? (
                      upcomingBills.map((bill) => (
                        <div
                          key={bill.id}
                          className={styles.billItem}
                          onClick={() => handleBillClick(bill)}
                          role="button"
                          tabIndex={0}
                        >
                          <div className={styles.billInfo}>
                            <h4>{bill.name}</h4>
                            <p>
                              Due: {new Date(bill.dueDate).toLocaleDateString()}{" "}
                              • {bill.frequency}
                            </p>
                            {bill.amountPaid > 0 && (
                              <p
                                style={{
                                  fontSize: "0.85rem",
                                  color: "#10b981",
                                }}
                              >
                                Paid: ${bill.amountPaid.toFixed(2)} / $
                                {bill.amount.toFixed(2)}
                              </p>
                            )}
                          </div>
                          <div className={styles.billAmount}>
                            <div>${bill.amount.toFixed(2)}</div>
                            {bill.amountPaid > 0 && (
                              <div
                                style={{
                                  fontSize: "0.85rem",
                                  color: "#6c757d",
                                }}
                              >
                                Remaining: $
                                {(bill.amount - bill.amountPaid).toFixed(2)}
                              </div>
                            )}
                            <ArrowRight
                              size={18}
                              className={styles.billItemArrow}
                            />
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className={styles.emptyState}>
                        <p>No bills due in the next 30 days</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Family Contributions */}
                <div className={styles.contributionsCard}>
                  <div>
                    <h3>Family Contributions</h3>
                    <p className={styles.cardSubtitle}>Monthly Contributions</p>
                  </div>
                  <div className={styles.contributionsList}>
                    {familyContributions.map((member) => (
                      <div
                        key={member.name}
                        className={styles.contributionItem}
                      >
                        <div className={styles.memberInfo}>
                          <div
                            className={styles.memberAvatar}
                            style={{ background: member.color }}
                          >
                            {member.initial}
                          </div>
                          <span className={styles.memberName}>
                            {member.name}
                          </span>
                        </div>
                        <div className={styles.contributionDetails}>
                          <div className={styles.contributionBar}>
                            <div
                              className={styles.contributionFill}
                              style={{
                                width: `${member.percentage}%`,
                                background: member.color,
                              }}
                            ></div>
                          </div>
                          <div className={styles.contributionAmount}>
                            <span>${member.amount.toFixed(2)}/mo</span>
                            <span className={styles.percentage}>
                              {member.percentage}%
                            </span>
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
          {activeTab === "Expenses" && (
            <>
              <div className={styles.chartCard}>
                <div className={styles.chartHeader}>
                  <h3>Expense Trends</h3>
                  <div className={styles.trendsNavigation}>
                    <button
                      className={styles.trendsNavBtn}
                      onClick={handlePreviousTrends}
                      disabled={trendsStartIndex <= 2}
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <span className={styles.trendsRange}>
                      {getTrendsMonthRange()}
                    </span>
                    <button
                      className={styles.trendsNavBtn}
                      onClick={handleNextTrends}
                      disabled={trendsStartIndex >= 11}
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={expenseTrends}>
                    <XAxis dataKey="month" stroke="#6c757d" />
                    <YAxis
                      stroke="#6c757d"
                      tickFormatter={(value) => `$${value}`}
                    />
                    <Tooltip
                      formatter={(value: number) => `$${value.toFixed(2)}`}
                    />
                    <Bar
                      dataKey="Medical"
                      stackId="a"
                      fill={CATEGORY_COLORS.Medical}
                    />
                    <Bar
                      dataKey="Housing"
                      stackId="a"
                      fill={CATEGORY_COLORS.Housing}
                    />
                    <Bar
                      dataKey="Groceries"
                      stackId="a"
                      fill={CATEGORY_COLORS.Groceries}
                    />
                    <Bar
                      dataKey="Utilities"
                      stackId="a"
                      fill={CATEGORY_COLORS.Utilities}
                    />
                    <Bar
                      dataKey="Transportation"
                      stackId="a"
                      fill={CATEGORY_COLORS.Transportation}
                    />
                    <Bar
                      dataKey="Other"
                      stackId="a"
                      fill={CATEGORY_COLORS.Other}
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
                <div className={styles.chartLegend}>
                  {Object.entries(CATEGORY_COLORS).map(([category, color]) => (
                    <div key={category} className={styles.legendItem}>
                      <div
                        className={styles.legendDot}
                        style={{ background: color }}
                      ></div>
                      <span>{category}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.expensesTable}>
                <div className={styles.tableHeader}>
                  <h3>Expense Breakdown by Category</h3>
                  <div className={styles.trendsNavigation}>
                    <button
                      className={styles.trendsNavBtn}
                      onClick={handlePreviousBreakdown}
                      disabled={breakdownMonthIndex === 10}
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <span className={styles.trendsRange}>
                      {getBreakdownMonthName()}
                    </span>
                    <button
                      className={styles.trendsNavBtn}
                      onClick={handleNextBreakdown}
                      disabled={breakdownMonthIndex === 9}
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>
                </div>
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
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "0.5rem",
                            }}
                          >
                            <div
                              className={styles.legendDot}
                              style={{ background: expense.color }}
                            ></div>
                            {expense.name}
                          </div>
                        </td>
                        <td>${expense.value.toFixed(2)}</td>
                        <td>{expense.percentage}%</td>
                        <td>
                          <span className={styles.statusBadge}>Tracked</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* Bills Tab */}
          {activeTab === "Bills" && (
            <div className={styles.billsSection}>
              <div className={styles.billsHeader}>
                <div>
                  <h3>All Bills</h3>
                  <p className={styles.subtitle}>
                    Manage recurring and one-time bills
                  </p>
                </div>
              </div>

              {/* Search and Month Navigation */}
              <div className={styles.billsControls}>
                <div className={styles.searchBox}>
                  <Search size={20} className={styles.searchIcon} />
                  <input
                    type="text"
                    placeholder="Search bills by name or category..."
                    value={billSearchQuery}
                    onChange={(e) => setBillSearchQuery(e.target.value)}
                    className={styles.searchInput}
                  />
                  {billSearchQuery && (
                    <button
                      className={styles.clearSearch}
                      onClick={() => setBillSearchQuery("")}
                    >
                      <X size={18} />
                    </button>
                  )}
                </div>

                <div className={styles.monthNavigation}>
                  <button
                    className={styles.monthNavBtn}
                    onClick={handlePreviousMonth}
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <span className={styles.currentMonth}>
                    {getMonthName(selectedMonth)}
                  </span>
                  <button
                    className={styles.monthNavBtn}
                    onClick={handleNextMonth}
                  >
                    <ChevronRight size={20} />
                  </button>
                  <button
                    className={styles.viewAllBtn}
                    onClick={() => setSelectedMonth(-1)}
                  >
                    View All
                  </button>
                </div>
              </div>

              <div className={styles.billsResultsInfo}>
                <p>
                  Showing {filteredBills.length} of {bills.length} bills
                  {billSearchQuery && ` matching "${billSearchQuery}"`}
                </p>
              </div>

              <div className={styles.billsGrid}>
                {filteredBills.length > 0 ? (
                  filteredBills.map((bill) => (
                    <div key={bill.id} className={styles.billCard}>
                      <div className={styles.billCardHeader}>
                        <h4>{bill.name}</h4>
                        <span
                          className={`${styles.billBadge} ${
                            styles[bill.status]
                          }`}
                        >
                          {bill.status === "paid"
                            ? "✓ Paid"
                            : bill.status === "partial"
                            ? "Partial"
                            : "Pending"}
                        </span>
                      </div>
                      <div className={styles.billCardBody}>
                        <div className={styles.billCardAmount}>
                          ${bill.amount.toFixed(2)}
                        </div>
                        <p className={styles.billCardDue}>
                          Due: {new Date(bill.dueDate).toLocaleDateString()}
                        </p>
                        {bill.amountPaid > 0 && (
                          <div className={styles.paymentProgress}>
                            <div className={styles.progressBar}>
                              <div
                                className={styles.progressFill}
                                style={{
                                  width: `${
                                    (bill.amountPaid / bill.amount) * 100
                                  }%`,
                                }}
                              ></div>
                            </div>
                            <p className={styles.paymentText}>
                              ${bill.amountPaid.toFixed(2)} paid • $
                              {(bill.amount - bill.amountPaid).toFixed(2)}{" "}
                              remaining
                            </p>
                          </div>
                        )}
                      </div>
                      <div className={styles.billCardActions}>
                        {bill.status !== "paid" && (
                          <button
                            className={styles.payBtn}
                            onClick={() => handleMarkAsPaid(bill)}
                          >
                            {bill.status === "partial"
                              ? "Mark Rest as Paid"
                              : "Mark as Paid"}
                          </button>
                        )}
                        <button
                          className={styles.editBtn}
                          onClick={() => handleEditBill(bill)}
                        >
                          Edit
                        </button>
                        {bill.status === "paid" && (
                          <span className={styles.paidLabel}>✓ Fully Paid</span>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className={styles.emptyState}>
                    <h4>No bills found</h4>
                    <p>
                      {billSearchQuery
                        ? `No bills match "${billSearchQuery}"`
                        : `No bills for ${getMonthName(selectedMonth)}`}
                    </p>
                    {(billSearchQuery || selectedMonth !== -1) && (
                      <button
                        className={styles.resetFiltersBtn}
                        onClick={() => {
                          setBillSearchQuery("");
                          setSelectedMonth(-1);
                        }}
                      >
                        Clear Filters
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Family Contributions Tab */}
          {activeTab === "Family Contributions" && (
            <div className={styles.contributionsSection}>
              <div className={styles.contributionsHeader}>
                <div>
                  <h3>Family Contributions Overview</h3>
                  <p className={styles.subtitle}>
                    Track monthly care costs and how they are shared among
                    family members
                  </p>
                </div>
                <button
                  className={styles.downloadBtn}
                  onClick={handleDownloadReport}
                >
                  <Download size={18} />
                  Download Report
                </button>
              </div>

              <div className={styles.contributionsSummary}>
                <div className={styles.summaryCard}>
                  <p className={styles.summaryLabel}>
                    Total Monthly Contributions
                  </p>
                  <h3 className={styles.summaryAmount}>
                    $
                    {familyContributions
                      .reduce((sum, m) => sum + m.amount, 0)
                      .toFixed(2)}
                  </h3>
                </div>
                <div className={styles.summaryCard}>
                  <p className={styles.summaryLabel}>Active Contributors</p>
                  <h3 className={styles.summaryAmount}>
                    {familyContributions.filter((m) => m.amount > 0).length}
                  </h3>
                </div>
              </div>

              <div className={styles.contributionsDetailList}>
                {familyContributions.map((member) => (
                  <div
                    key={member.name}
                    className={styles.contributionDetailCard}
                  >
                    <div className={styles.contributionCardHeader}>
                      <div className={styles.memberInfo}>
                        <div
                          className={styles.memberAvatar}
                          style={{ background: member.color }}
                        >
                          {member.initial}
                        </div>
                        <div>
                          <h4 className={styles.memberName}>{member.name}</h4>
                          <p className={styles.memberRole}>Family Member</p>
                        </div>
                      </div>
                      <div className={styles.contributionCardAmount}>
                        <h3>
                          ${member.amount.toFixed(2)}
                          <span className={styles.perMonth}>/month</span>
                        </h3>
                        <span className={styles.percentage}>
                          {member.percentage}%
                        </span>
                      </div>
                    </div>
                    <div className={styles.contributionBar}>
                      <div
                        className={styles.contributionFill}
                        style={{
                          width: `${member.percentage}%`,
                          background: member.color,
                        }}
                      ></div>
                    </div>
                    <div className={styles.contributionCardFooter}>
                      <button
                        className={styles.viewHistoryBtn}
                        onClick={() => handleViewHistory(member)}
                      >
                        View History
                      </button>
                      <button
                        className={styles.adjustBtn}
                        onClick={() => handleAdjustSplit(member)}
                      >
                        Adjust Split
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
      <Footer />
    </div>
  );
}
