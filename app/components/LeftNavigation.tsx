"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  LayoutDashboard,
  CheckSquare,
  Calendar,
  Wallet,
  Heart,
  BookOpen,
  Users,
  UsersRound,
  Gift,
  UtensilsCrossed,
  Infinity,
  CreditCard,
  Menu,
  X,
  UserCircle,
  LogOut,
  ChevronDown,
  ChevronUp,
  Settings,
  Database,
  FileText,
  Shield,
} from "lucide-react";
import styles from "./LeftNavigation.module.css";

const mainMenuItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/tasks", label: "Tasks", icon: CheckSquare },
  { href: "/dashboard/calendar", label: "Calendar", icon: Calendar },
  { href: "/dashboard/finances", label: "Finances", icon: Wallet },
  { href: "/dashboard/care-plan", label: "Care Plan", icon: Heart },
  { href: "/dashboard/resources", label: "Resources", icon: BookOpen },
];

const familyMenuItems = [
  { href: "/family", label: "Families", icon: UsersRound },
  {
    href: "/dashboard/family-collaboration",
    label: "Family Chat",
    icon: Users,
  },
  { href: "/dashboard/legacy", label: "Live Forever", icon: Infinity },
];

const marketplaceMenuItems = [
  { href: "/dashboard/gifts", label: "Gift Marketplace", icon: Gift },
  { href: "/dashboard/food", label: "Food Delivery", icon: UtensilsCrossed },
  { href: "/dashboard/subscription", label: "Subscription", icon: CreditCard },
];

const adminMenuItems = [
  { href: "/admin/users", label: "Manage Users", icon: Users },
  { href: "/admin/families", label: "Manage Families", icon: UsersRound },
  { href: "/admin/blog", label: "Blog Management", icon: BookOpen },
  { href: "/admin/content", label: "Content Management", icon: FileText },
  { href: "/admin/database", label: "Database Tools", icon: Database },
  { href: "/admin/settings", label: "System Settings", icon: Settings },
];

const accountMenuItems = [
  { href: "/profile", label: "My Profile", icon: UserCircle },
  { href: "/api/auth/signout", label: "Sign Out", icon: LogOut },
];

type Family = {
  id: string;
  name: string;
  elderName: string | null;
  membersCount?: number;
};

export default function LeftNavigation() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [families, setFamilies] = useState<Family[]>([]);
  const [selectedFamilyId, setSelectedFamilyId] = useState<string | null>(null);
  const [showFamilyDropdown, setShowFamilyDropdown] = useState(false);

  // Check if user is admin
  const isAdmin =
    session?.user?.email === "admin@careshare.app" ||
    session?.user?.email === "demo@careshare.app";

  // Fetch user's families
  useEffect(() => {
    async function fetchFamilies() {
      try {
        const res = await fetch("/api/families");
        if (res.ok) {
          const data = await res.json();
          setFamilies(data);
          // Set first family as default if none selected
          if (data.length > 0 && !selectedFamilyId) {
            setSelectedFamilyId(data[0].id);
          }
        }
      } catch (error) {
        console.error("Error fetching families:", error);
      }
    }
    if (session) {
      fetchFamilies();
    }
  }, [session, selectedFamilyId]);

  // Determine which sections should be expanded based on current page
  const isFamilyPage =
    pathname?.startsWith("/family") ||
    pathname?.startsWith("/dashboard/family-collaboration") ||
    pathname?.startsWith("/dashboard/legacy");

  const isMarketplacePage =
    pathname?.startsWith("/dashboard/gifts") ||
    pathname?.startsWith("/dashboard/food") ||
    pathname?.startsWith("/dashboard/subscription");

  const isAdminPage = pathname?.startsWith("/admin");

  const [expandedSections, setExpandedSections] = useState({
    main: true,
    family: isFamilyPage,
    marketplace: isMarketplacePage,
    admin: isAdminPage,
  });

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  const toggleSection = (
    section: "main" | "family" | "marketplace" | "admin"
  ) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Update expanded sections when pathname changes
  useEffect(() => {
    const isFamilyPage =
      pathname?.startsWith("/family") ||
      pathname?.startsWith("/dashboard/family-collaboration") ||
      pathname?.startsWith("/dashboard/legacy");

    const isMarketplacePage =
      pathname?.startsWith("/dashboard/gifts") ||
      pathname?.startsWith("/dashboard/food") ||
      pathname?.startsWith("/dashboard/subscription");

    const isAdminPage = pathname?.startsWith("/admin");

    setExpandedSections({
      main: true,
      family: isFamilyPage,
      marketplace: isMarketplacePage,
      admin: isAdminPage,
    });
  }, [pathname]);

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        className={styles.menuButton}
        onClick={toggleMenu}
        aria-label="Toggle navigation menu"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className={styles.overlay}
          onClick={closeMenu}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${isOpen ? styles.open : ""}`}>
        <nav className={styles.nav}>
          {/* Family Selector */}
          {families.length > 0 && (
            <div className={styles.familySelector}>
              <button
                className={styles.familySelectorButton}
                onClick={() => setShowFamilyDropdown(!showFamilyDropdown)}
              >
                <div className={styles.familyInfo}>
                  <div className={styles.familyAvatar}>
                    {families
                      .find((f) => f.id === selectedFamilyId)
                      ?.name?.[0]?.toUpperCase() || "F"}
                  </div>
                  <div className={styles.familyDetails}>
                    <strong>
                      {families.find((f) => f.id === selectedFamilyId)?.name ||
                        "Select Family"}
                    </strong>
                    <span>
                      {families.find((f) => f.id === selectedFamilyId)
                        ?.elderName || "Care Family"}
                    </span>
                  </div>
                </div>
                {families.length > 1 && (
                  <ChevronDown
                    size={18}
                    style={{
                      transform: showFamilyDropdown
                        ? "rotate(180deg)"
                        : "rotate(0)",
                      transition: "transform 0.2s",
                    }}
                  />
                )}
              </button>

              {/* Family Dropdown */}
              {showFamilyDropdown && families.length > 1 && (
                <div className={styles.familyDropdown}>
                  {families.map((family) => (
                    <button
                      key={family.id}
                      className={`${styles.familyOption} ${
                        selectedFamilyId === family.id ? styles.selected : ""
                      }`}
                      onClick={() => {
                        setSelectedFamilyId(family.id);
                        setShowFamilyDropdown(false);
                      }}
                    >
                      <div className={styles.familyOptionAvatar}>
                        {family.name[0].toUpperCase()}
                      </div>
                      <div className={styles.familyOptionInfo}>
                        <strong>{family.name}</strong>
                        <span>{family.elderName || "Care Family"}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {families.length > 0 && <div className={styles.divider} />}

          {/* Main Menu Section */}
          <div className={styles.menuSection}>
            <button
              className={styles.sectionHeader}
              onClick={() => toggleSection("main")}
            >
              <div className={styles.sectionTitle}>
                <LayoutDashboard size={18} strokeWidth={2.5} />
                <span>Main Menu</span>
              </div>
              {expandedSections.main ? (
                <ChevronUp size={18} />
              ) : (
                <ChevronDown size={18} />
              )}
            </button>
            <div
              className={`${styles.sectionContent} ${
                expandedSections.main ? styles.expanded : styles.collapsed
              }`}
            >
              {mainMenuItems.map((item) => {
                const Icon = item.icon;
                // For dashboard, only highlight when exactly on /dashboard
                // For others, highlight when on that page or subpages
                const isActive =
                  item.href === "/dashboard"
                    ? pathname === "/dashboard"
                    : pathname === item.href ||
                      pathname?.startsWith(item.href + "/");

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`${styles.navItem} ${
                      isActive ? styles.active : ""
                    }`}
                    onClick={closeMenu}
                  >
                    <Icon size={20} strokeWidth={2} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Family Section */}
          <div className={styles.menuSection}>
            <button
              className={styles.sectionHeader}
              onClick={() => toggleSection("family")}
            >
              <div className={styles.sectionTitle}>
                <UsersRound size={18} strokeWidth={2.5} />
                <span>Family</span>
              </div>
              {expandedSections.family ? (
                <ChevronUp size={18} />
              ) : (
                <ChevronDown size={18} />
              )}
            </button>
            <div
              className={`${styles.sectionContent} ${
                expandedSections.family ? styles.expanded : styles.collapsed
              }`}
            >
              {familyMenuItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.href ||
                  pathname?.startsWith(item.href + "/");

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`${styles.navItem} ${
                      isActive ? styles.active : ""
                    }`}
                    onClick={closeMenu}
                  >
                    <Icon size={20} strokeWidth={2} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Marketplace Section */}
          <div className={styles.menuSection}>
            <button
              className={styles.sectionHeader}
              onClick={() => toggleSection("marketplace")}
            >
              <div className={styles.sectionTitle}>
                <Gift size={18} strokeWidth={2.5} />
                <span>Marketplace</span>
              </div>
              {expandedSections.marketplace ? (
                <ChevronUp size={18} />
              ) : (
                <ChevronDown size={18} />
              )}
            </button>
            <div
              className={`${styles.sectionContent} ${
                expandedSections.marketplace
                  ? styles.expanded
                  : styles.collapsed
              }`}
            >
              {marketplaceMenuItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.href ||
                  pathname?.startsWith(item.href + "/");

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`${styles.navItem} ${
                      isActive ? styles.active : ""
                    }`}
                    onClick={closeMenu}
                  >
                    <Icon size={20} strokeWidth={2} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Admin Section - Only visible to admins */}
          {isAdmin && (
            <div className={styles.menuSection}>
              <button
                className={styles.sectionHeader}
                onClick={() => toggleSection("admin")}
              >
                <div className={styles.sectionTitle}>
                  <Shield size={18} strokeWidth={2.5} />
                  <span>Admin</span>
                </div>
                {expandedSections.admin ? (
                  <ChevronUp size={18} />
                ) : (
                  <ChevronDown size={18} />
                )}
              </button>
              <div
                className={`${styles.sectionContent} ${
                  expandedSections.admin ? styles.expanded : styles.collapsed
                }`}
              >
                {adminMenuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    pathname === item.href ||
                    pathname?.startsWith(item.href + "/");

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`${styles.navItem} ${
                        isActive ? styles.active : ""
                      }`}
                      onClick={closeMenu}
                    >
                      <Icon size={20} strokeWidth={2} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Mobile-only account items */}
          <div className={styles.mobileAccountSection}>
            <div className={styles.divider}></div>
            {accountMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`${styles.navItem} ${
                    isActive ? styles.active : ""
                  }`}
                  onClick={closeMenu}
                >
                  <Icon size={20} strokeWidth={2} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </aside>
    </>
  );
}
