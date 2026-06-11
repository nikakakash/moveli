import type { Metadata } from "next";
import { AdminGuard } from "@/components/admin/admin-guard";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

// Keep the admin area out of search indexes. Real access control is the server-side
// [Authorize(Roles="Admin")] on every admin API endpoint; this is discoverability hardening.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminGuard>
      <div className="flex min-h-screen bg-gray-50">
        <AdminSidebar />
        <main className="flex-1 p-8">{children}</main>
      </div>
    </AdminGuard>
  );
}
