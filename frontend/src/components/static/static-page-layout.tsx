import { StorefrontLayout } from "@/components/layout/storefront-layout";

interface Props {
  title: string;
  subtitle?: string;
  badge?: string;
  children: React.ReactNode;
}

export function StaticPageLayout({ title, subtitle, badge, children }: Props) {
  return (
    <StorefrontLayout>
      <div className="max-w-3xl mx-auto px-6 py-12">
        {badge && (
          <span className="inline-block bg-moveli-purple-50 text-moveli-purple-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
            {badge}
          </span>
        )}
        <h1 className="text-3xl font-extrabold text-gray-900">{title}</h1>
        {subtitle && (
          <p className="mt-2 text-gray-500">{subtitle}</p>
        )}
        <div className="mt-10 space-y-8 text-gray-700 leading-relaxed">
          {children}
        </div>
      </div>
    </StorefrontLayout>
  );
}
