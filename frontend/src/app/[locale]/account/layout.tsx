import { StorefrontLayout } from "@/components/layout/storefront-layout";
import { AccountSidebar } from "@/components/account/account-sidebar";
import { AuthGuard } from "@/components/account/auth-guard";

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <StorefrontLayout>
      <AuthGuard>
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1">
              <AccountSidebar />
            </div>
            <div className="lg:col-span-3">{children}</div>
          </div>
        </div>
      </AuthGuard>
    </StorefrontLayout>
  );
}
