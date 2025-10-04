"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Heart,
  Users,
  Calendar,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Home,
  UserPlus,
  Settings,
} from "lucide-react";
import styles from "./page.module.css";

type Step = {
  id: number;
  title: string;
  description: string;
  icon: any;
};

const steps: Step[] = [
  {
    id: 1,
    title: "Welcome to CareShare",
    description: "Let's get you set up in just a few minutes",
    icon: Heart,
  },
  {
    id: 2,
    title: "About You",
    description: "Tell us a bit about yourself",
    icon: UserPlus,
  },
  {
    id: 3,
    title: "Care Recipient",
    description: "Who are you caring for?",
    icon: Heart,
  },
  {
    id: 4,
    title: "Family Members",
    description: "Who else is helping with care?",
    icon: Users,
  },
  {
    id: 5,
    title: "Preferences",
    description: "Customize your experience",
    icon: Settings,
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    // Step 2: About You
    role: "",
    relationship: "",
    
    // Step 3: Care Recipient
    recipientName: "",
    recipientAge: "",
    recipientConditions: [] as string[],
    
    // Step 4: Family Members
    familyMembers: [] as Array<{ name: string; email: string; role: string }>,
    
    // Step 5: Preferences
    notificationPreferences: {
      email: true,
      sms: false,
      push: true,
    },
  });

  const handleSkip = () => {
    router.push("/dashboard");
  };

  const handleNext = async () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    } else {
      await completeOnboarding();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const completeOnboarding = async () => {
    setLoading(true);
    try {
      // Save onboarding data to the database
      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push("/dashboard?welcome=true");
      }
    } catch (error) {
      console.error("Error completing onboarding:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className={styles.welcomeStep}>
            <div className={styles.welcomeIcon}>
              <Heart size={64} />
            </div>
            <h2>Welcome to CareShare, {session?.user?.name?.split(" ")[0]}!</h2>
            <p className={styles.welcomeText}>
              We're here to help you coordinate care for your loved ones. This quick
              setup will help us personalize your experience and get you started on
              the right foot.
            </p>
            <div className={styles.featuresList}>
              <div className={styles.featureItem}>
                <CheckCircle size={20} />
                <span>Takes only 2-3 minutes</span>
              </div>
              <div className={styles.featureItem}>
                <CheckCircle size={20} />
                <span>Personalized to your needs</span>
              </div>
              <div className={styles.featureItem}>
                <CheckCircle size={20} />
                <span>You can skip and come back later</span>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className={styles.formStep}>
            <h2>Tell us about yourself</h2>
            <p>This helps us understand your role in caregiving</p>

            <div className={styles.formGroup}>
              <label>What best describes your role?</label>
              <div className={styles.radioGroup}>
                {[
                  { value: "primary", label: "Primary Caregiver", desc: "Main person providing care" },
                  { value: "secondary", label: "Supporting Family Member", desc: "Helping with care coordination" },
                  { value: "manager", label: "Care Manager", desc: "Organizing and managing care" },
                  { value: "professional", label: "Professional Caregiver", desc: "Providing professional care services" },
                ].map((option) => (
                  <label
                    key={option.value}
                    className={`${styles.radioCard} ${
                      formData.role === option.value ? styles.selected : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={option.value}
                      checked={formData.role === option.value}
                      onChange={(e) =>
                        setFormData({ ...formData, role: e.target.value })
                      }
                    />
                    <div className={styles.radioCardContent}>
                      <strong>{option.label}</strong>
                      <span>{option.desc}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className={styles.formGroup}>
              <label>Your relationship to the care recipient</label>
              <select
                value={formData.relationship}
                onChange={(e) =>
                  setFormData({ ...formData, relationship: e.target.value })
                }
                className={styles.select}
              >
                <option value="">Select relationship...</option>
                <option value="child">Son/Daughter</option>
                <option value="spouse">Spouse/Partner</option>
                <option value="sibling">Sibling</option>
                <option value="grandchild">Grandchild</option>
                <option value="friend">Friend</option>
                <option value="professional">Professional Caregiver</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        );

      case 3:
        return (
          <div className={styles.formStep}>
            <h2>Who are you caring for?</h2>
            <p>Tell us about the person receiving care</p>

            <div className={styles.formGroup}>
              <label>Their name</label>
              <input
                type="text"
                value={formData.recipientName}
                onChange={(e) =>
                  setFormData({ ...formData, recipientName: e.target.value })
                }
                placeholder="e.g., Mom, Dad, Grandma Betty"
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Age (optional)</label>
              <input
                type="number"
                value={formData.recipientAge}
                onChange={(e) =>
                  setFormData({ ...formData, recipientAge: e.target.value })
                }
                placeholder="e.g., 75"
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Common care needs (optional)</label>
              <p className={styles.hint}>
                Select any that apply - this helps us provide relevant resources
              </p>
              <div className={styles.checkboxGroup}>
                {[
                  "Mobility assistance",
                  "Medication management",
                  "Medical appointments",
                  "Memory care",
                  "Daily living activities",
                  "Transportation",
                  "Meal preparation",
                  "Financial management",
                ].map((condition) => (
                  <label key={condition} className={styles.checkbox}>
                    <input
                      type="checkbox"
                      checked={formData.recipientConditions.includes(condition)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({
                            ...formData,
                            recipientConditions: [
                              ...formData.recipientConditions,
                              condition,
                            ],
                          });
                        } else {
                          setFormData({
                            ...formData,
                            recipientConditions:
                              formData.recipientConditions.filter(
                                (c) => c !== condition
                              ),
                          });
                        }
                      }}
                    />
                    <span>{condition}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className={styles.formStep}>
            <h2>Invite family members</h2>
            <p>
              Add other family members who will help coordinate care (you can always
              add more later)
            </p>

            <div className={styles.familyMembersList}>
              {formData.familyMembers.map((member, index) => (
                <div key={index} className={styles.familyMemberCard}>
                  <div className={styles.familyMemberInfo}>
                    <strong>{member.name}</strong>
                    <span>{member.email}</span>
                    <span className={styles.roleBadge}>{member.role}</span>
                  </div>
                  <button
                    onClick={() => {
                      const newMembers = [...formData.familyMembers];
                      newMembers.splice(index, 1);
                      setFormData({ ...formData, familyMembers: newMembers });
                    }}
                    className={styles.removeBtn}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <div className={styles.addMemberForm}>
              <h3>Add a family member</h3>
              <div className={styles.formRow}>
                <input
                  type="text"
                  placeholder="Name"
                  id="memberName"
                  className={styles.input}
                />
                <input
                  type="email"
                  placeholder="Email"
                  id="memberEmail"
                  className={styles.input}
                />
                <select id="memberRole" className={styles.select}>
                  <option value="FAMILY_MEMBER">Family Member</option>
                  <option value="CARE_MANAGER">Care Manager</option>
                  <option value="CONTRIBUTOR">Contributor</option>
                </select>
                <button
                  onClick={() => {
                    const name = (
                      document.getElementById("memberName") as HTMLInputElement
                    )?.value;
                    const email = (
                      document.getElementById("memberEmail") as HTMLInputElement
                    )?.value;
                    const role = (
                      document.getElementById("memberRole") as HTMLSelectElement
                    )?.value;

                    if (name && email) {
                      setFormData({
                        ...formData,
                        familyMembers: [
                          ...formData.familyMembers,
                          { name, email, role },
                        ],
                      });
                      (
                        document.getElementById("memberName") as HTMLInputElement
                      ).value = "";
                      (
                        document.getElementById("memberEmail") as HTMLInputElement
                      ).value = "";
                    }
                  }}
                  className={styles.addBtn}
                >
                  Add
                </button>
              </div>
            </div>

            <p className={styles.hint}>
              <Sparkles size={16} />
              Don't worry if you don't have everyone's info right now - you can invite
              them later from your dashboard
            </p>
          </div>
        );

      case 5:
        return (
          <div className={styles.formStep}>
            <h2>Set your preferences</h2>
            <p>Choose how you'd like to receive notifications</p>

            <div className={styles.preferenceGroup}>
              <label className={styles.preferenceCard}>
                <div className={styles.preferenceInfo}>
                  <strong>Email Notifications</strong>
                  <span>Receive updates and reminders via email</span>
                </div>
                <input
                  type="checkbox"
                  checked={formData.notificationPreferences.email}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      notificationPreferences: {
                        ...formData.notificationPreferences,
                        email: e.target.checked,
                      },
                    })
                  }
                  className={styles.toggle}
                />
              </label>

              <label className={styles.preferenceCard}>
                <div className={styles.preferenceInfo}>
                  <strong>SMS Notifications</strong>
                  <span>Get text messages for important updates</span>
                </div>
                <input
                  type="checkbox"
                  checked={formData.notificationPreferences.sms}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      notificationPreferences: {
                        ...formData.notificationPreferences,
                        sms: e.target.checked,
                      },
                    })
                  }
                  className={styles.toggle}
                />
              </label>

              <label className={styles.preferenceCard}>
                <div className={styles.preferenceInfo}>
                  <strong>Push Notifications</strong>
                  <span>Browser notifications for real-time updates</span>
                </div>
                <input
                  type="checkbox"
                  checked={formData.notificationPreferences.push}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      notificationPreferences: {
                        ...formData.notificationPreferences,
                        push: e.target.checked,
                      },
                    })
                  }
                  className={styles.toggle}
                />
              </label>
            </div>

            <div className={styles.completionMessage}>
              <CheckCircle size={48} className={styles.completionIcon} />
              <h3>You're all set!</h3>
              <p>
                Click finish to start coordinating care with your family on CareShare
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={styles.container}>
      {/* Progress Bar */}
      <div className={styles.progressBar}>
        <div
          className={styles.progressFill}
          style={{ width: `${(currentStep / steps.length) * 100}%` }}
        />
      </div>

      {/* Header */}
      <div className={styles.header}>
        <div className={styles.logo}>
          <Heart size={24} />
          <span>CareShare</span>
        </div>
        <button onClick={handleSkip} className={styles.skipBtn}>
          Skip to Dashboard
        </button>
      </div>

      {/* Main Content */}
      <div className={styles.content}>
        {/* Steps Indicator */}
        <div className={styles.stepsIndicator}>
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.id}
                className={`${styles.stepIndicator} ${
                  currentStep === step.id
                    ? styles.active
                    : currentStep > step.id
                    ? styles.completed
                    : ""
                }`}
              >
                <div className={styles.stepIcon}>
                  {currentStep > step.id ? (
                    <CheckCircle size={20} />
                  ) : (
                    <Icon size={20} />
                  )}
                </div>
                <div className={styles.stepInfo}>
                  <strong>{step.title}</strong>
                  <span>{step.description}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Step Content */}
        <div className={styles.stepContent}>{renderStepContent()}</div>

        {/* Navigation */}
        <div className={styles.navigation}>
          {currentStep > 1 && (
            <button onClick={handleBack} className={styles.backBtn}>
              <ArrowLeft size={20} />
              Back
            </button>
          )}
          <button
            onClick={handleNext}
            className={styles.nextBtn}
            disabled={loading}
          >
            {loading
              ? "Saving..."
              : currentStep === steps.length
              ? "Finish & Go to Dashboard"
              : "Continue"}
            {currentStep < steps.length && <ArrowRight size={20} />}
          </button>
        </div>
      </div>
    </div>
  );
}

