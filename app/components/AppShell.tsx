import Navigation from "./Navigation";
import LeftNavigation from "./LeftNavigation";
import styles from "./AppShell.module.css";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.shell}>
      <Navigation showAuthLinks={true} />
      <div className={styles.railLayout}>
        <LeftNavigation />
        <div className={styles.content}>{children}</div>
      </div>
    </div>
  );
}
