import { redirect } from "next/navigation";

export default async function AccountPage(
  props: { params: Promise<{ locale: string }> }
) {
  const { locale } = await props.params;
  const prefix = locale === "ka" ? "" : `/${locale}`;
  redirect(`${prefix}/account/orders`);
}
