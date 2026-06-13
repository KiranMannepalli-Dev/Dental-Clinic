// Route group layout for admin — passes children straight through.
// The actual admin shell (sidebar, topbar, auth guard) lives in admin/layout.tsx.
export default function AdminGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
