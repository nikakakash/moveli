import { OrderDetailContent } from "@/components/account/order-detail-content";

export default async function OrderDetailPage(
  props: { params: Promise<{ id: string }> }
) {
  const { id } = await props.params;
  return <OrderDetailContent orderId={id} />;
}
