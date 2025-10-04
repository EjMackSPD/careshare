"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navigation from "@/app/components/Navigation";
import LeftNavigation from "@/app/components/LeftNavigation";
import Footer from "@/app/components/Footer";
import { Info, X } from "lucide-react";
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

const recommendedServices: Service[] = [
  {
    id: "1",
    title: "Regular Home Health Aide",
    description: "10-20 hours weekly",
  },
  {
    id: "2",
    title: "Medication Management",
    description: "Daily reminders",
    link: "/dashboard/medications",
  },
  {
    id: "3",
    title: "Transportation Services",
    description: "For medical appointments and essential errands",
  },
  {
    id: "4",
    title: "Meal Services",
    description: "Meal delivery 3-5 days/week",
  },
];

export default function CarePlanPage() {
  const [activeTab, setActiveTab] = useState("Current Care");
  const tabs = ["Current Care", "Important Documents", "Care Scenarios"];
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
  const [scenarioFormData, setScenarioFormData] = useState<any>({});

  // Fetch documents, care plan, and scenarios on mount
  useEffect(() => {
    fetchDocuments();
    fetchCarePlan();
    fetchScenarios();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/documents?familyId=demo-family-id");
      if (response.ok) {
        const data = await response.json();
        setDocuments(data);
      }
    } catch (error) {
      console.error("Error fetching documents:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCarePlan = async () => {
    try {
      const response = await fetch("/api/care-plan?familyId=demo-family-id");
      if (response.ok) {
        const data = await response.json();
        setCarePlan(data);
      }
    } catch (error) {
      console.error("Error fetching care plan:", error);
    }
  };

  const fetchScenarios = async () => {
    try {
      const response = await fetch(
        "/api/care-scenarios?familyId=demo-family-id"
      );
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
    try {
      const response = await fetch("/api/care-plan", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          familyId: "demo-family-id",
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
    try {
      const response = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newDocument,
          familyId: "demo-family-id",
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
        return "📋 Medical Records";
      case "LEGAL":
        return "⚖️ Legal Documents";
      case "INSURANCE":
        return "🏥 Insurance & Financial";
      case "FINANCIAL":
        return "💰 Financial Documents";
      case "OTHER":
        return "📁 Other Documents";
      default:
        return "📁 Documents";
    }
  };

  const renderScenarioContent = (scenario: CareScenario) => {
    try {
      const content = JSON.parse(scenario.content);
      const fields = getScenarioFields(scenario.type);

      return fields.map((field) => (
        <div key={field.key} className={styles.scenarioItem}>
          <strong>{field.label}:</strong>
          <p style={{ whiteSpace: "pre-wrap" }}>
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
      <Navigation showAuthLinks={true} />

      <div className={styles.layout}>
        <LeftNavigation />
        <main className={styles.main}>
          <div className={styles.pageHeader}>
            <div>
              <h1>Care Planning</h1>
              <p className={styles.subtitle}>
                Manage care details, documents, and future planning
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
              {/* Care Level & Needs */}
              <div className={styles.careLevelSection}>
                <h2>Care Level & Needs</h2>

                <div className={styles.careLevelGrid}>
                  <div className={styles.careLevelCard}>
                    <div className={styles.levelBadge}>
                      <span>{carePlan?.careLevel || "Not Set"}</span>
                      <Info size={16} />
                    </div>
                    <p className={styles.levelDescription}>
                      {carePlan?.careLevelDescription ||
                        "No care level description set. Click 'Edit Care Plan' to add details."}
                    </p>

                    <div className={styles.costEstimate}>
                      <strong>Estimated Monthly Costs</strong>
                      <p className={styles.costRange}>
                        {carePlan?.estimatedCostMin &&
                        carePlan?.estimatedCostMax
                          ? `$${(carePlan.estimatedCostMin / 100).toFixed(
                              0
                            )}k - $${(carePlan.estimatedCostMax / 100).toFixed(
                              0
                            )}k`
                          : "Not set"}
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
                <h2>Recommended Services</h2>
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
                            View & Manage →
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
                <h2>Daily Activities & Support</h2>
                <div className={styles.activitiesGrid}>
                  <div className={styles.activityCard}>
                    <div className={styles.activityIcon}>🛁</div>
                    <h3>Personal Care</h3>
                    <p>Needs assistance with bathing and dressing</p>
                    <span className={styles.supportLevel}>
                      Daily Support Required
                    </span>
                  </div>
                  <div className={styles.activityCard}>
                    <div className={styles.activityIcon}>🍽️</div>
                    <h3>Meal Preparation</h3>
                    <p>Can prepare simple meals with supervision</p>
                    <span className={styles.supportLevel}>
                      Occasional Support
                    </span>
                  </div>
                  <div className={styles.activityCard}>
                    <div className={styles.activityIcon}>🚗</div>
                    <h3>Transportation</h3>
                    <p>Requires transportation for appointments</p>
                    <span className={styles.supportLevel}>Weekly Support</span>
                  </div>
                  <div className={styles.activityCard}>
                    <div className={styles.activityIcon}>💊</div>
                    <h3>Medication</h3>
                    <p>Needs reminders and monitoring</p>
                    <span className={styles.supportLevel}>
                      Daily Support Required
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Important Documents Tab */}
          {activeTab === "Important Documents" && (
            <div className={styles.documentsSection}>
              <div className={styles.documentsHeader}>
                <h2>Important Documents</h2>
                <button
                  className={styles.uploadBtn}
                  onClick={() => setShowAddDocument(true)}
                >
                  + Upload Document
                </button>
              </div>

              {loading ? (
                <div style={{ textAlign: "center", padding: "3rem" }}>
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
                                <div className={styles.documentIcon}>📄</div>
                                <div className={styles.documentInfo}>
                                  <h4>{doc.name}</h4>
                                  <p>
                                    {doc.notes ||
                                      `Added ${new Date(
                                        doc.createdAt
                                      ).toLocaleDateString()}`}
                                  </p>
                                  <p
                                    style={{
                                      fontSize: "0.75rem",
                                      color: "#6c757d",
                                    }}
                                  >
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
                                    style={{
                                      color: "#dc3545",
                                      background: "none",
                                      border: "1px solid #dc3545",
                                      padding: "0.5rem 1rem",
                                      borderRadius: "0.375rem",
                                      cursor: "pointer",
                                      transition: "all 0.2s",
                                    }}
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
                    <div
                      style={{
                        textAlign: "center",
                        padding: "3rem",
                        color: "#6c757d",
                      }}
                    >
                      <p>
                        No documents yet. Click "+ Upload Document" to add your
                        first document.
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
                <h2>Care Scenarios & Planning</h2>
                <p className={styles.subtitle}>
                  Prepare for different situations and plan ahead
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
                            {scenario.icon || "📋"}
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
                            {scenario.icon || "📋"}
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
                style={{ maxWidth: "600px" }}
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
      <Footer />
    </div>
  );
}
