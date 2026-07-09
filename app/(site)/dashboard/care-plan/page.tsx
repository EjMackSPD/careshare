"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  CalendarDays,
  ClipboardCheck,
  FileText,
  HeartPulse,
  ShieldCheck,
  X,
} from "lucide-react";
import styles from "./page.module.css";

type Document = {
  id: string;
  name: string;
  category: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  uploadedByUser: {
    id: string;
    name: string | null;
    email: string;
  } | null;
};

type CarePlan = {
  id: string;
  familyId: string;
  careLevel: string;
  careLevelDescription: string | null;
  estimatedCostMin: number | null;
  estimatedCostMax: number | null;
  careNotes: string | null;
  createdAt: string;
  updatedAt: string;
};

type CareScenario = {
  id: string;
  familyId: string;
  type: string;
  title: string;
  icon: string | null;
  content: string; // JSON string
  createdAt: string;
  updatedAt: string;
};

type Service = {
  id: string;
  title: string;
  description: string;
  link?: string;
};

type FamilyWorkspace = {
  id: string;
  name: string;
  elderName?: string | null;
  careRecipient?: {
    name?: string | null;
  } | null;
};

const recommendedServices: Service[] = [
  {
    id: "1",
    title: "In-home support",
    description: "Personal care and household routines",
  },
  {
    id: "2",
    title: "Medication support",
    description: "Reminders, refills, and adherence checks",
    link: "/dashboard/medications",
  },
  {
    id: "3",
    title: "Appointment transportation",
    description: "Rides for medical visits and essential errands",
  },
  {
    id: "4",
    title: "Nutrition support",
    description: "Meal planning, delivery, and monitoring",
  },
];

const dailySupportItems = [
  {
    title: "Personal care",
    description: "Bathing, dressing, grooming, and safe mobility.",
    cadence: "Daily support",
    owner: "Caregiver",
  },
  {
    title: "Meals and hydration",
    description: "Simple meal preparation with regular check-ins.",
    cadence: "Routine support",
    owner: "Family lead",
  },
  {
    title: "Transportation",
    description: "Appointments, pharmacy runs, and essential errands.",
    cadence: "Weekly support",
    owner: "Coordinator",
  },
  {
    title: "Medication",
    description: "Reminders, monitoring, and refill coordination.",
    cadence: "Daily review",
    owner: "Care team",
  },
];

const formatCareLevel = (level?: string | null) => {
  if (!level) return "Not set";
  return level
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

const formatCurrency = (value?: number | null) => {
  if (!value) return "Not set";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
};

const formatCostRange = (plan: CarePlan | null) => {
  if (!plan?.estimatedCostMin && !plan?.estimatedCostMax) return "Not set";
  if (plan?.estimatedCostMin && plan?.estimatedCostMax) {
    return `${formatCurrency(plan.estimatedCostMin)} - ${formatCurrency(
      plan.estimatedCostMax
    )}/mo`;
  }
  return `${formatCurrency(plan?.estimatedCostMin || plan?.estimatedCostMax)}/mo`;
};

export default function CarePlanPage() {
  const [activeTab, setActiveTab] = useState("Current Care");
  const tabs = ["Current Care", "Important Documents", "Care Scenarios"];
  const [currentFamilyId, setCurrentFamilyId] = useState<string | null>(null);
  const [familyName, setFamilyName] = useState("Family workspace");
  const [careRecipientName, setCareRecipientName] = useState("Care recipient");
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDocument, setShowAddDocument] = useState(false);
  const [newDocument, setNewDocument] = useState({
    name: "",
    category: "MEDICAL",
    notes: "",
  });
  const [carePlan, setCarePlan] = useState<CarePlan | null>(null);
  const [showEditCarePlan, setShowEditCarePlan] = useState(false);
  const [editingCarePlan, setEditingCarePlan] = useState({
    careLevel: "MODERATE",
    careLevelDescription: "",
    estimatedCostMin: "",
    estimatedCostMax: "",
    careNotes: "",
  });
  const [scenarios, setScenarios] = useState<CareScenario[]>([]);
  const [editingScenario, setEditingScenario] = useState<CareScenario | null>(
    null
  );
  const [showEditScenario, setShowEditScenario] = useState(false);
  const [scenarioFormData, setScenarioFormData] = useState<
    Record<string, string>
  >({});

  // Load the active family first so real workspaces are not tied to demo data.
  useEffect(() => {
    let cancelled = false;

    const loadWorkspace = async () => {
      try {
        setLoading(true);
        const familyResponse = await fetch("/api/families");

        if (!familyResponse.ok) return;

        const families: FamilyWorkspace[] = await familyResponse.json();
        const family = families[0];

        if (!family || cancelled) return;

        setCurrentFamilyId(family.id);
        setFamilyName(family.name || "Family workspace");
        setCareRecipientName(
          family.careRecipient?.name || family.elderName || "Care recipient"
        );

        await Promise.all([
          fetchDocuments(family.id),
          fetchCarePlan(family.id),
          fetchScenarios(family.id),
        ]);
      } catch (error) {
        console.error("Error loading care plan workspace:", error);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadWorkspace();

    return () => {
      cancelled = true;
    };
  }, []);

  const fetchDocuments = async (familyId: string) => {
    try {
      const response = await fetch(`/api/documents?familyId=${familyId}`);
      if (response.ok) {
        const data = await response.json();
        setDocuments(data);
      }
    } catch (error) {
      console.error("Error fetching documents:", error);
    }
  };

  const fetchCarePlan = async (familyId: string) => {
    try {
      const response = await fetch(`/api/care-plan?familyId=${familyId}`);
      if (response.ok) {
        const data = await response.json();
        setCarePlan(data);
      }
    } catch (error) {
      console.error("Error fetching care plan:", error);
    }
  };

  const fetchScenarios = async (familyId: string) => {
    try {
      const response = await fetch(`/api/care-scenarios?familyId=${familyId}`);
      if (response.ok) {
        const data = await response.json();
        setScenarios(data);
      }
    } catch (error) {
      console.error("Error fetching scenarios:", error);
    }
  };

  const handleEditCarePlan = () => {
    if (carePlan) {
      setEditingCarePlan({
        careLevel: carePlan.careLevel,
        careLevelDescription: carePlan.careLevelDescription || "",
        estimatedCostMin: carePlan.estimatedCostMin?.toString() || "",
        estimatedCostMax: carePlan.estimatedCostMax?.toString() || "",
        careNotes: carePlan.careNotes || "",
      });
    }
    setShowEditCarePlan(true);
  };

  const handleSaveCarePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentFamilyId) return;

    try {
      const response = await fetch("/api/care-plan", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          familyId: currentFamilyId,
          ...editingCarePlan,
        }),
      });

      if (response.ok) {
        const updatedCarePlan = await response.json();
        setCarePlan(updatedCarePlan);
        setShowEditCarePlan(false);
      }
    } catch (error) {
      console.error("Error updating care plan:", error);
    }
  };

  const handleEditScenario = (scenario: CareScenario) => {
    setEditingScenario(scenario);
    try {
      const parsedContent = JSON.parse(scenario.content);
      setScenarioFormData(parsedContent);
    } catch (error) {
      console.error("Error parsing scenario content:", error);
      setScenarioFormData({});
    }
    setShowEditScenario(true);
  };

  const handleSaveScenario = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingScenario) return;

    try {
      const response = await fetch(
        `/api/care-scenarios/${editingScenario.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: editingScenario.title,
            icon: editingScenario.icon,
            content: JSON.stringify(scenarioFormData),
          }),
        }
      );

      if (response.ok) {
        const updatedScenario = await response.json();
        setScenarios(
          scenarios.map((s) =>
            s.id === updatedScenario.id ? updatedScenario : s
          )
        );
        setShowEditScenario(false);
        setEditingScenario(null);
        setScenarioFormData({});
      }
    } catch (error) {
      console.error("Error updating scenario:", error);
    }
  };

  const getScenarioFields = (type: string) => {
    switch (type) {
      case "MEDICAL_EMERGENCY":
        return [
          { key: "primaryContact", label: "Primary Contact" },
          { key: "hospitalPreference", label: "Hospital Preference" },
          {
            key: "familyContactOrder",
            label: "Family Contact Order",
            multiline: true,
          },
        ];
      case "HOSPITALIZATION":
        return [
          { key: "careCoordinator", label: "Care Coordinator" },
          { key: "homeCare", label: "Home Care During" },
          { key: "insuranceInfo", label: "Insurance Info" },
        ];
      case "INCREASED_CARE":
        return [
          { key: "triggerPoints", label: "Trigger Points", multiline: true },
          { key: "nextSteps", label: "Next Steps", multiline: true },
        ];
      case "ASSISTED_LIVING":
        return [
          {
            key: "preferredFacilities",
            label: "Preferred Facilities",
            multiline: true,
          },
          { key: "budgetAllocation", label: "Budget Allocation" },
        ];
      case "END_OF_LIFE":
        return [
          { key: "dnrStatus", label: "DNR Status" },
          { key: "hospicePreference", label: "Hospice Preference" },
          {
            key: "funeralArrangements",
            label: "Funeral Arrangements",
            multiline: true,
          },
          { key: "familyWishes", label: "Family Wishes", multiline: true },
        ];
      default:
        return [];
    }
  };

  const handleAddDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentFamilyId) return;

    try {
      const response = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newDocument,
          familyId: currentFamilyId,
        }),
      });

      if (response.ok) {
        const createdDocument = await response.json();
        setDocuments([createdDocument, ...documents]);
        setShowAddDocument(false);
        setNewDocument({ name: "", category: "MEDICAL", notes: "" });
      }
    } catch (error) {
      console.error("Error adding document:", error);
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    if (!confirm("Are you sure you want to delete this document?")) return;

    try {
      const response = await fetch(`/api/documents/${documentId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setDocuments(documents.filter((doc) => doc.id !== documentId));
      }
    } catch (error) {
      console.error("Error deleting document:", error);
    }
  };

  // Group documents by category
  const documentsByCategory = {
    MEDICAL: documents.filter((doc) => doc.category === "MEDICAL"),
    LEGAL: documents.filter((doc) => doc.category === "LEGAL"),
    INSURANCE: documents.filter((doc) => doc.category === "INSURANCE"),
    FINANCIAL: documents.filter((doc) => doc.category === "FINANCIAL"),
    OTHER: documents.filter((doc) => doc.category === "OTHER"),
  };

  const getCategoryTitle = (category: string) => {
    switch (category) {
      case "MEDICAL":
        return "Medical Records";
      case "LEGAL":
        return "Legal Documents";
      case "INSURANCE":
        return "Insurance";
      case "FINANCIAL":
        return "Financial Documents";
      case "OTHER":
        return "Other Documents";
      default:
        return "Documents";
    }
  };

  const renderScenarioContent = (scenario: CareScenario) => {
    try {
      const content = JSON.parse(scenario.content);
      const fields = getScenarioFields(scenario.type);

      return fields.map((field) => (
        <div key={field.key} className={styles.scenarioItem}>
          <strong>{field.label}:</strong>
          <p className={styles.preWrapText}>
            {content[field.key] || "Not set"}
          </p>
        </div>
      ));
    } catch (error) {
      return <p>Error loading scenario data</p>;
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.layout}>
        <main className={styles.main}>
          <div className={styles.pageHeader}>
            <div>
              <span className={styles.eyebrow}>Care coordination</span>
              <h1>Care Plan</h1>
              <p className={styles.subtitle}>
                Keep daily support, important records, and future decisions in
                one shared view.
              </p>
            </div>
            <button className={styles.editBtn} onClick={handleEditCarePlan}>
              Edit Care Plan
            </button>
          </div>

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

          {/* Current Care Tab */}
          {activeTab === "Current Care" && (
            <>
              <section className={styles.planHero}>
                <div>
                  <span className={styles.eyebrow}>Current workspace</span>
                  <h2>{careRecipientName}'s shared care plan</h2>
                  <p>
                    {familyName} can use this plan to stay aligned on routines,
                    support needs, documents, and decision points.
                  </p>
                </div>
                <div className={styles.planHeroStats}>
                  <div className={styles.heroStat}>
                    <span>Care level</span>
                    <strong>{formatCareLevel(carePlan?.careLevel)}</strong>
                  </div>
                  <div className={styles.heroStat}>
                    <span>Monthly estimate</span>
                    <strong>{formatCostRange(carePlan)}</strong>
                  </div>
                  <div className={styles.heroStat}>
                    <span>Documents</span>
                    <strong>{documents.length}</strong>
                  </div>
                </div>
              </section>

              {/* Care Level & Needs */}
              <div className={styles.careLevelSection}>
                <h2>Care Level & Needs</h2>

                <div className={styles.careLevelGrid}>
                  <div className={styles.careLevelCard}>
                    <div className={styles.levelBadge}>
                      <HeartPulse size={17} />
                      <span>{formatCareLevel(carePlan?.careLevel)}</span>
                    </div>
                    <p className={styles.levelDescription}>
                      {carePlan?.careLevelDescription ||
                        "No care level description set. Click 'Edit Care Plan' to add details."}
                    </p>

                    <div className={styles.costEstimate}>
                      <strong>Estimated Monthly Costs</strong>
                      <p className={styles.costRange}>
                        {formatCostRange(carePlan)}
                      </p>
                    </div>
                  </div>

                  <div className={styles.careNotesCard}>
                    <h3>Care Notes</h3>
                    <p>
                      {carePlan?.careNotes ||
                        "No care notes yet. Click 'Edit Care Plan' to add notes."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Recommended Services */}
              <div className={styles.servicesSection}>
                <h2>Recommended Support</h2>
                <div className={styles.servicesGrid}>
                  {recommendedServices.map((service) =>
                    service.link ? (
                      <Link
                        key={service.id}
                        href={service.link}
                        className={styles.serviceCardLink}
                      >
                        <div className={styles.serviceCard}>
                          <h3>{service.title}</h3>
                          <p>{service.description}</p>
                          <span className={styles.viewLink}>
                            View and manage
                          </span>
                        </div>
                      </Link>
                    ) : (
                      <div key={service.id} className={styles.serviceCard}>
                        <h3>{service.title}</h3>
                        <p>{service.description}</p>
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Daily Activities */}
              <div className={styles.activitiesSection}>
                <div className={styles.sectionHeadingRow}>
                  <div>
                    <h2>Daily Activities & Support</h2>
                    <p className={styles.subtitle}>
                      A quick view of the routine support areas that need shared
                      attention.
                    </p>
                  </div>
                </div>
                <div className={styles.activitiesGrid}>
                  {dailySupportItems.map((item) => (
                    <div key={item.title} className={styles.activityCard}>
                      <div className={styles.activityMain}>
                        <div className={styles.activityCheck}>
                          <ClipboardCheck size={17} />
                        </div>
                        <div>
                          <h3>{item.title}</h3>
                          <p>{item.description}</p>
                        </div>
                      </div>
                      <div className={styles.activityMeta}>
                        <span>{item.owner}</span>
                        <span className={styles.supportLevel}>{item.cadence}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Important Documents Tab */}
          {activeTab === "Important Documents" && (
            <div className={styles.documentsSection}>
              <div className={styles.documentsHeader}>
                <div>
                  <h2>Important Documents</h2>
                  <p className={styles.subtitle}>
                    Keep the records the family reaches for most often close at
                    hand.
                  </p>
                </div>
                <button
                  className={styles.uploadBtn}
                  onClick={() => setShowAddDocument(true)}
                >
                  Add Document
                </button>
              </div>

              {loading ? (
                <div className={styles.loadingState}>
                  Loading documents...
                </div>
              ) : (
                <div className={styles.documentCategories}>
                  {Object.entries(documentsByCategory).map(
                    ([category, categoryDocs]) =>
                      categoryDocs.length > 0 && (
                        <div key={category} className={styles.documentCategory}>
                          <div className={styles.categoryHeader}>
                            <h3>{getCategoryTitle(category)}</h3>
                            <span className={styles.documentCount}>
                              {categoryDocs.length} document
                              {categoryDocs.length !== 1 ? "s" : ""}
                            </span>
                          </div>
                          <div className={styles.documentsList}>
                            {categoryDocs.map((doc) => (
                              <div key={doc.id} className={styles.documentItem}>
                                <div className={styles.documentIcon}>
                                  <FileText size={22} />
                                </div>
                                <div className={styles.documentInfo}>
                                  <h4>{doc.name}</h4>
                                  <p>
                                    {doc.notes ||
                                      `Added ${new Date(
                                        doc.createdAt
                                      ).toLocaleDateString()}`}
                                  </p>
                                  <p className={styles.documentMeta}>
                                    Last updated:{" "}
                                    {new Date(
                                      doc.updatedAt
                                    ).toLocaleDateString()}
                                  </p>
                                </div>
                                <div className={styles.documentActions}>
                                  <button
                                    className={styles.deleteBtn}
                                    onClick={() => handleDeleteDocument(doc.id)}
                                  >
                                    Delete
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                  )}
                  {documents.length === 0 && (
                    <div className={styles.emptyState}>
                      <p>
                        No documents yet. Add the first record when you are
                        ready.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Add Document Modal */}
              {showAddDocument && (
                <div
                  className={styles.modal}
                  onClick={() => setShowAddDocument(false)}
                >
                  <div
                    className={styles.modalContent}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className={styles.modalHeader}>
                      <h2>Add New Document</h2>
                      <button
                        className={styles.closeBtn}
                        onClick={() => setShowAddDocument(false)}
                      >
                        <X size={24} />
                      </button>
                    </div>
                    <form onSubmit={handleAddDocument}>
                      <div className={styles.formGroup}>
                        <label>Document Name</label>
                        <input
                          type="text"
                          value={newDocument.name}
                          onChange={(e) =>
                            setNewDocument({
                              ...newDocument,
                              name: e.target.value,
                            })
                          }
                          required
                          placeholder="e.g., Medical History Summary"
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label>Category</label>
                        <select
                          value={newDocument.category}
                          onChange={(e) =>
                            setNewDocument({
                              ...newDocument,
                              category: e.target.value,
                            })
                          }
                        >
                          <option value="MEDICAL">Medical Records</option>
                          <option value="LEGAL">Legal Documents</option>
                          <option value="INSURANCE">Insurance</option>
                          <option value="FINANCIAL">Financial</option>
                          <option value="OTHER">Other</option>
                        </select>
                      </div>
                      <div className={styles.formGroup}>
                        <label>Notes</label>
                        <textarea
                          value={newDocument.notes}
                          onChange={(e) =>
                            setNewDocument({
                              ...newDocument,
                              notes: e.target.value,
                            })
                          }
                          rows={3}
                          placeholder="Add any additional notes or description..."
                        />
                      </div>
                      <div className={styles.formActions}>
                        <button
                          type="button"
                          onClick={() => setShowAddDocument(false)}
                          className={styles.cancelBtn}
                        >
                          Cancel
                        </button>
                        <button type="submit" className={styles.submitBtn}>
                          Add Document
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Care Scenarios Tab */}
          {activeTab === "Care Scenarios" && (
            <div className={styles.scenariosSection}>
              <div className={styles.scenariosHeader}>
                <h2>Care Scenarios</h2>
                <p className={styles.subtitle}>
                  Document shared preferences before the family needs them in a
                  hurry.
                </p>
              </div>

              {/* Emergency Scenarios */}
              <div className={styles.scenarioCategory}>
                <h3>Emergency Situations</h3>
                <div className={styles.scenariosGrid}>
                  {scenarios
                    .filter(
                      (s) =>
                        s.type === "MEDICAL_EMERGENCY" ||
                        s.type === "HOSPITALIZATION"
                    )
                    .map((scenario) => (
                      <div key={scenario.id} className={styles.scenarioCard}>
                        <div className={styles.scenarioHeader}>
                          <div className={styles.scenarioIcon}>
                            <ShieldCheck size={20} />
                          </div>
                          <h4>{scenario.title}</h4>
                        </div>
                        <div className={styles.scenarioContent}>
                          {renderScenarioContent(scenario)}
                        </div>
                        <button
                          className={styles.editScenarioBtn}
                          onClick={() => handleEditScenario(scenario)}
                        >
                          Edit Plan
                        </button>
                      </div>
                    ))}
                  {scenarios.filter(
                    (s) =>
                      s.type === "MEDICAL_EMERGENCY" ||
                      s.type === "HOSPITALIZATION"
                  ).length === 0 && (
                    <p className={styles.emptyText}>
                      No emergency scenarios configured
                    </p>
                  )}
                </div>
              </div>

              {/* Care Level Changes */}
              <div className={styles.scenarioCategory}>
                <h3>Care Level Changes</h3>
                <div className={styles.scenariosGrid}>
                  {scenarios
                    .filter(
                      (s) =>
                        s.type === "INCREASED_CARE" ||
                        s.type === "ASSISTED_LIVING"
                    )
                    .map((scenario) => (
                      <div key={scenario.id} className={styles.scenarioCard}>
                        <div className={styles.scenarioHeader}>
                          <div className={styles.scenarioIcon}>
                            <CalendarDays size={20} />
                          </div>
                          <h4>{scenario.title}</h4>
                        </div>
                        <div className={styles.scenarioContent}>
                          {renderScenarioContent(scenario)}
                        </div>
                        <button
                          className={styles.editScenarioBtn}
                          onClick={() => handleEditScenario(scenario)}
                        >
                          Edit Plan
                        </button>
                      </div>
                    ))}
                  {scenarios.filter(
                    (s) =>
                      s.type === "INCREASED_CARE" ||
                      s.type === "ASSISTED_LIVING"
                  ).length === 0 && (
                    <p className={styles.emptyText}>
                      No care level change scenarios configured
                    </p>
                  )}
                </div>
              </div>

              {/* End of Life Planning */}
              <div className={styles.scenarioCategory}>
                <h3>End of Life Preferences</h3>
                {scenarios.filter((s) => s.type === "END_OF_LIFE").length >
                0 ? (
                  scenarios
                    .filter((s) => s.type === "END_OF_LIFE")
                    .map((scenario) => (
                      <div key={scenario.id} className={styles.endOfLifeCard}>
                        <div className={styles.endOfLifeContent}>
                          {renderScenarioContent(scenario)}
                        </div>
                        <button
                          className={styles.editScenarioBtn}
                          onClick={() => handleEditScenario(scenario)}
                        >
                          Edit Preferences
                        </button>
                      </div>
                    ))
                ) : (
                  <p className={styles.emptyText}>
                    No end of life preferences configured
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Edit Care Plan Modal */}
          {showEditCarePlan && (
            <div
              className={styles.modal}
              onClick={() => setShowEditCarePlan(false)}
            >
              <div
                className={styles.modalContent}
                onClick={(e) => e.stopPropagation()}
              >
                <div className={styles.modalHeader}>
                  <h2>Edit Care Plan</h2>
                  <button
                    className={styles.closeBtn}
                    onClick={() => setShowEditCarePlan(false)}
                  >
                    <X size={24} />
                  </button>
                </div>
                <form onSubmit={handleSaveCarePlan}>
                  <div className={styles.formGroup}>
                    <label>Care Level</label>
                    <select
                      value={editingCarePlan.careLevel}
                      onChange={(e) =>
                        setEditingCarePlan({
                          ...editingCarePlan,
                          careLevel: e.target.value,
                        })
                      }
                    >
                      <option value="LOW">Low</option>
                      <option value="MODERATE">Moderate</option>
                      <option value="HIGH">High</option>
                      <option value="INTENSIVE">Intensive</option>
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label>Care Level Description</label>
                    <textarea
                      value={editingCarePlan.careLevelDescription}
                      onChange={(e) =>
                        setEditingCarePlan({
                          ...editingCarePlan,
                          careLevelDescription: e.target.value,
                        })
                      }
                      rows={3}
                      placeholder="Describe the level of care needed..."
                    />
                  </div>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>Estimated Min Cost ($/month)</label>
                      <input
                        type="number"
                        value={editingCarePlan.estimatedCostMin}
                        onChange={(e) =>
                          setEditingCarePlan({
                            ...editingCarePlan,
                            estimatedCostMin: e.target.value,
                          })
                        }
                        placeholder="2200"
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Estimated Max Cost ($/month)</label>
                      <input
                        type="number"
                        value={editingCarePlan.estimatedCostMax}
                        onChange={(e) =>
                          setEditingCarePlan({
                            ...editingCarePlan,
                            estimatedCostMax: e.target.value,
                          })
                        }
                        placeholder="2600"
                      />
                    </div>
                  </div>
                  <div className={styles.formGroup}>
                    <label>Care Notes</label>
                    <textarea
                      value={editingCarePlan.careNotes}
                      onChange={(e) =>
                        setEditingCarePlan({
                          ...editingCarePlan,
                          careNotes: e.target.value,
                        })
                      }
                      rows={4}
                      placeholder="Add any additional care notes or special considerations..."
                    />
                  </div>
                  <div className={styles.formActions}>
                    <button
                      type="button"
                      onClick={() => setShowEditCarePlan(false)}
                      className={styles.cancelBtn}
                    >
                      Cancel
                    </button>
                    <button type="submit" className={styles.submitBtn}>
                      Save Care Plan
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Edit Scenario Modal */}
          {showEditScenario && editingScenario && (
            <div
              className={styles.modal}
              onClick={() => setShowEditScenario(false)}
            >
              <div
                className={styles.modalContent}
                onClick={(e) => e.stopPropagation()}
                data-wide="true"
              >
                <div className={styles.modalHeader}>
                  <h2>Edit {editingScenario.title}</h2>
                  <button
                    className={styles.closeBtn}
                    onClick={() => setShowEditScenario(false)}
                  >
                    <X size={24} />
                  </button>
                </div>
                <form onSubmit={handleSaveScenario}>
                  {getScenarioFields(editingScenario.type).map((field) => (
                    <div key={field.key} className={styles.formGroup}>
                      <label>{field.label}</label>
                      {field.multiline ? (
                        <textarea
                          value={scenarioFormData[field.key] || ""}
                          onChange={(e) =>
                            setScenarioFormData({
                              ...scenarioFormData,
                              [field.key]: e.target.value,
                            })
                          }
                          rows={4}
                          placeholder={`Enter ${field.label.toLowerCase()}...`}
                        />
                      ) : (
                        <input
                          type="text"
                          value={scenarioFormData[field.key] || ""}
                          onChange={(e) =>
                            setScenarioFormData({
                              ...scenarioFormData,
                              [field.key]: e.target.value,
                            })
                          }
                          placeholder={`Enter ${field.label.toLowerCase()}...`}
                        />
                      )}
                    </div>
                  ))}
                  <div className={styles.formActions}>
                    <button
                      type="button"
                      onClick={() => setShowEditScenario(false)}
                      className={styles.cancelBtn}
                    >
                      Cancel
                    </button>
                    <button type="submit" className={styles.submitBtn}>
                      Save Scenario
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
