import { getTranslations, getLocale } from "next-intl/server";
import { StaticPageLayout } from "@/components/static/static-page-layout";
import { Truck, Package, MapPin } from "@phosphor-icons/react/dist/ssr";

export default async function ShippingPolicyPage() {
  const t = await getTranslations("pages");
  const locale = await getLocale();
  const isKa = locale === "ka";

  return (
    <StaticPageLayout title={t("shippingPolicy")} subtitle={t("shippingLastUpdated")}>
      {isKa ? <ShippingKa /> : <ShippingEn />}
    </StaticPageLayout>
  );
}

function ShippingEn() {
  return (
    <>
      <div className="grid sm:grid-cols-3 gap-4 not-prose">
        <Card icon={Truck} title="Tbilisi" line1="Free over ₾100" line2="₾5 under ₾100" line3="1–2 business days" />
        <Card icon={Package} title="Regions" line1="₾15 via Georgian Post" line2="All regions covered" line3="2–5 business days" />
        <Card icon={MapPin} title="Pick up" line1="Free" line2="From our warehouse" line3="Same day if ordered by 14:00" />
      </div>

      <Section title="Delivery in Tbilisi">
        <p>
          Orders placed before 14:00 on business days are dispatched the same day. Orders
          placed after 14:00 or on weekends/holidays are dispatched the next business day.
          You will receive an SMS with tracking information once your order is shipped.
          Delivery is carried out by our courier partners.
        </p>
        <p>
          <strong>Free shipping</strong> applies to orders with a subtotal of ₾100 or more.
          For orders under ₾100, a flat shipping fee of ₾5 applies.
        </p>
      </Section>

      <Section title="Regional delivery">
        <p>
          We deliver to all regions of Georgia via <strong>Georgian Post</strong> (Sakartvelos Posta).
          A flat fee of ₾15 applies regardless of the package size or destination within Georgia.
          Delivery typically takes 2–5 business days depending on the destination.
        </p>
        <p>
          Tracking is available through Georgian Post's website once your parcel is dispatched.
          You will receive tracking details via SMS and email.
        </p>
      </Section>

      <Section title="Cash on delivery">
        <p>
          Cash on delivery is available for orders delivered by courier within Tbilisi.
          Pay the courier in cash when you receive your package. No additional fee applies.
          This option is not available for Georgian Post (regional) shipments.
        </p>
      </Section>

      <Section title="Failed delivery">
        <p>
          If delivery is attempted and you are not available, the courier will contact you
          to arrange a second delivery attempt. After two failed attempts, the package
          will be returned to our warehouse. We will contact you to arrange redelivery
          (additional shipping fees may apply).
        </p>
      </Section>

      <Section title="Order tracking">
        <p>
          Track your order anytime from the "My Orders" section of your account. Each order
          shows real-time status updates: Confirmed → Processing → Shipped → Delivered.
        </p>
      </Section>
    </>
  );
}

function ShippingKa() {
  return (
    <>
      <div className="grid sm:grid-cols-3 gap-4 not-prose">
        <Card icon={Truck} title="თბილისი" line1="უფასო ₾100-დან" line2="₾5 ₾100-ზე ქვემოთ" line3="1–2 სამუშაო დღე" />
        <Card icon={Package} title="რეგიონები" line1="₾15 ფოსტით" line2="ყველა რეგიონი" line3="2–5 სამუშაო დღე" />
        <Card icon={MapPin} title="თვითგატანა" line1="უფასო" line2="ჩვენი საწყობიდან" line3="იმავე დღეს 14:00-მდე" />
      </div>

      <Section title="მიწოდება თბილისში">
        <p>
          სამუშაო დღეებში 14:00-მდე განთავსებული შეკვეთები იგზავნება იმავე დღეს. 14:00-ის
          შემდეგ ან შაბათ-კვირას/სადღესასწაულო დღეებში განთავსებული შეკვეთები იგზავნება
          მომდევნო სამუშაო დღეს. SMS-ით მიიღებთ თრექინგის ინფორმაციას შეკვეთის გაგზავნისას.
          მიწოდებას ახორციელებენ ჩვენი კურიერი პარტნიორები.
        </p>
        <p>
          <strong>უფასო მიწოდება</strong> მოქმედებს ₾100 ან მეტი ღირებულების შეკვეთებზე.
          ₾100-ზე ნაკლები შეკვეთებისთვის მიწოდების ფიქსირებული საფასური ₾5.
        </p>
      </Section>

      <Section title="რეგიონალური მიწოდება">
        <p>
          ვაწვდით საქართველოს ყველა რეგიონში <strong>საქართველოს ფოსტის</strong> მეშვეობით.
          ფიქსირებული საფასური ₾15 მოქმედებს, მიუხედავად ამანათის ზომისა ან დანიშნულების
          ადგილისა საქართველოში. მიწოდებას ჩვეულებრივ 2–5 სამუშაო დღე სჭირდება.
        </p>
        <p>
          თრექინგი ხელმისაწვდომია საქართველოს ფოსტის ვებგვერდზე ამანათის გაგზავნის შემდეგ.
          თრექინგის დეტალებს მიიღებთ SMS-ით და ელ-ფოსტით.
        </p>
      </Section>

      <Section title="ნაღდი ანგარიშსწორება">
        <p>
          ნაღდი ანგარიშსწორება ხელმისაწვდომია თბილისში კურიერით მიწოდებულ შეკვეთებზე.
          გადაიხადეთ კურიერთან ნაღდი ანგარიშსწორებით ამანათის მიღებისას. დამატებითი
          საკომისიო არ მოქმედებს. ეს ვარიანტი არ არის ხელმისაწვდომი საქართველოს ფოსტით
          (რეგიონალური) გზავნილებისთვის.
        </p>
      </Section>

      <Section title="წარუმატებელი მიწოდება">
        <p>
          თუ მიწოდების მცდელობისას არ იქნებით ხელმისაწვდომი, კურიერი დაგიკავშირდებათ
          მეორე მიწოდების მცდელობის დასანიშნად. ორი წარუმატებელი მცდელობის შემდეგ,
          ამანათი დაბრუნდება ჩვენს საწყობში. დაგიკავშირდებით ხელახალი მიწოდების
          მოსაწყობად (შეიძლება მოქმედებდეს დამატებითი მიწოდების საფასური).
        </p>
      </Section>

      <Section title="შეკვეთის თრექინგი">
        <p>
          თვალი ადევნეთ შეკვეთას ნებისმიერ დროს „ჩემი შეკვეთები" განყოფილებიდან.
          თითოეული შეკვეთა აჩვენებს რეალურ დროში სტატუსის განახლებებს:
          დადასტურებული → მუშავდება → გაგზავნილი → მიწოდებული.
        </p>
      </Section>
    </>
  );
}

function Card({ icon: Icon, title, line1, line2, line3 }: {
  icon: typeof Truck;
  title: string;
  line1: string;
  line2: string;
  line3: string;
}) {
  return (
    <div className="bg-gray-50 rounded-xl p-5 text-center">
      <div className="w-10 h-10 rounded-lg bg-moveli-gradient-soft flex items-center justify-center mx-auto mb-3">
        <Icon size={20} className="text-moveli-purple-600" weight="fill" />
      </div>
      <h3 className="font-bold text-gray-900">{title}</h3>
      <p className="text-sm text-gray-600 mt-1">{line1}</p>
      <p className="text-xs text-gray-400">{line2}</p>
      <p className="text-xs text-moveli-purple-600 font-medium mt-1">{line3}</p>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-lg font-bold text-gray-900 mb-2">{title}</h2>
      <div className="text-sm text-gray-600 space-y-2">{children}</div>
    </section>
  );
}
