import AppShell from "@/app/components/AppShell";

export default function FamilyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
