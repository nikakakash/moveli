"use client";

import { useAuthStore } from "@/stores/auth-store";
import { Link } from "@/i18n/navigation";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-moveli-purple-300 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || !user?.roles?.includes("Admin")) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Access denied</h2>
          <p className="text-gray-500 mb-6">You don&apos;t have permission to access this page.</p>
          <Link
            href="/"
            className="inline-flex bg-moveli-gradient text-white font-semibold px-6 py-3 rounded-lg"
          >
            Go home
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
