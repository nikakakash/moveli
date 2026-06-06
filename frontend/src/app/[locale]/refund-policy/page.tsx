import { getTranslations, getLocale } from "next-intl/server";
import { StaticPageLayout } from "@/components/static/static-page-layout";

export default async function RefundPolicyPage() {
  const t = await getTranslations("pages");
  const locale = await getLocale();
  const isKa = locale === "ka";

  return (
    <StaticPageLayout title={t("refundPolicy")} subtitle={t("refundLastUpdated")}>
      {isKa ? <RefundKa /> : <RefundEn />}
    </StaticPageLayout>
  );
}

function RefundEn() {
  return (
    <>
      <Section title="14-day return right">
        <p>
          Under Georgia's Consumer Protection Law (2022, Article 30), you may return any
          product purchased online within <strong>14 calendar days</strong> of delivery,
          without giving a reason. This is your legal right for all distance purchases.
        </p>
      </Section>

      <Section title="Conditions for return">
        <ul className="list-disc pl-5 space-y-1">
          <li>The product must be in its original condition, unused, and in its original packaging.</li>
          <li>All tags, labels, and accessories must be included.</li>
          <li>You are responsible for the cost of return shipping unless the product is defective.</li>
        </ul>
      </Section>

      <Section title="Exceptions">
        <p>The following products cannot be returned under the 14-day rule:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Sealed hygiene or personal care products that have been opened.</li>
          <li>Personalized or custom-made products.</li>
          <li>Perishable goods (food, flowers).</li>
          <li>Sealed audio, video, or software products that have been unsealed.</li>
          <li>Newspapers, magazines, and periodicals.</li>
        </ul>
      </Section>

      <Section title="Defective products">
        <p>
          If you receive a defective product, contact us immediately. Under Georgian law
          (Article 34), you are entitled to:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Repair</strong> — we arrange repair at no cost to you.</li>
          <li><strong>Replacement</strong> — a new identical product.</li>
          <li><strong>Price reduction</strong> — partial refund proportional to the defect.</li>
          <li><strong>Full refund</strong> — if repair or replacement is not possible.</li>
        </ul>
        <p className="mt-2">
          The seller is liable for defects appearing within <strong>2 years</strong> of delivery.
          During the first 6 months, the defect is presumed to have existed at delivery.
        </p>
      </Section>

      <Section title="How to request a return">
        <ol className="list-decimal pl-5 space-y-1">
          <li>Contact us at <strong>support@moveli.ge</strong> with your order number.</li>
          <li>We'll confirm eligibility and provide return instructions.</li>
          <li>Ship the product back in its original packaging.</li>
          <li>Once we receive and inspect the item, we process the refund.</li>
        </ol>
      </Section>

      <Section title="Refund timeline">
        <p>
          Refunds are processed within <strong>14 days</strong> of receiving the returned
          product. The refund is issued to your original payment method. Cash on delivery
          refunds are made via bank transfer — we will contact you for your bank details.
        </p>
      </Section>
    </>
  );
}

function RefundKa() {
  return (
    <>
      <Section title="14-დღიანი დაბრუნების უფლება">
        <p>
          საქართველოს მომხმარებელთა დაცვის კანონის (2022, მუხლი 30) თანახმად, თქვენ
          შეგიძლიათ ონლაინ შეძენილი ნებისმიერი პროდუქტი დააბრუნოთ მიწოდებიდან <strong>14
          კალენდარული დღის</strong> განმავლობაში, მიზეზის მითითების გარეშე. ეს არის
          თქვენი კანონიერი უფლება ყველა დისტანციური შეძენისას.
        </p>
      </Section>

      <Section title="დაბრუნების პირობები">
        <ul className="list-disc pl-5 space-y-1">
          <li>პროდუქტი უნდა იყოს ორიგინალ მდგომარეობაში, გამოუყენებელი და ორიგინალ შეფუთვაში.</li>
          <li>ყველა ეტიკეტი, ნიშანი და აქსესუარი უნდა იყოს თანდართული.</li>
          <li>დაბრუნების ტრანსპორტირების ხარჯი თქვენზეა, გარდა იმ შემთხვევისა, როცა პროდუქტი დეფექტიანია.</li>
        </ul>
      </Section>

      <Section title="გამონაკლისები">
        <p>შემდეგი პროდუქტები 14-დღიანი წესით ვერ დაბრუნდება:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>დალუქული ჰიგიენური ან პირადი მოვლის პროდუქტები, რომლებიც გახსნილია.</li>
          <li>პერსონალიზებული ან ინდივიდუალურად დამზადებული პროდუქტები.</li>
          <li>მალფუჭებადი საქონელი (საკვები, ყვავილები).</li>
          <li>დალუქული აუდიო, ვიდეო ან პროგრამული პროდუქტები, რომლებიც გახსნილია.</li>
          <li>გაზეთები, ჟურნალები და პერიოდული გამოცემები.</li>
        </ul>
      </Section>

      <Section title="დეფექტიანი პროდუქტები">
        <p>
          თუ მიიღებთ დეფექტიან პროდუქტს, დაუყოვნებლივ დაგვიკავშირდით. საქართველოს
          კანონმდებლობის (მუხლი 34) მიხედვით, თქვენ გაქვთ უფლება:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>შეკეთება</strong> — ჩვენ მოვაწყობთ შეკეთებას უფასოდ.</li>
          <li><strong>ჩანაცვლება</strong> — ახალი იდენტური პროდუქტი.</li>
          <li><strong>ფასის შემცირება</strong> — ნაწილობრივი ანაზღაურება დეფექტის პროპორციულად.</li>
          <li><strong>სრული ანაზღაურება</strong> — თუ შეკეთება ან ჩანაცვლება შეუძლებელია.</li>
        </ul>
        <p className="mt-2">
          გამყიდველი პასუხისმგებელია მიწოდებიდან <strong>2 წლის</strong> განმავლობაში
          გამოვლენილ დეფექტებზე. პირველი 6 თვის განმავლობაში, დეფექტი ითვლება
          მიწოდების დროს არსებულად.
        </p>
      </Section>

      <Section title="როგორ მოვითხოვოთ დაბრუნება">
        <ol className="list-decimal pl-5 space-y-1">
          <li>დაგვიკავშირდით <strong>support@moveli.ge</strong>-ზე შეკვეთის ნომრით.</li>
          <li>დავადასტურებთ უფლებამოსილებას და მოგაწვდით დაბრუნების ინსტრუქციებს.</li>
          <li>გაგზავნეთ პროდუქტი ორიგინალ შეფუთვაში.</li>
          <li>მიღებისა და შემოწმების შემდეგ, ვამუშავებთ ანაზღაურებას.</li>
        </ol>
      </Section>

      <Section title="ანაზღაურების ვადები">
        <p>
          ანაზღაურება მუშავდება დაბრუნებული პროდუქტის მიღებიდან <strong>14 დღეში</strong>.
          ანაზღაურება ხდება ორიგინალ გადახდის მეთოდით. ნაღდი ანგარიშსწორების შეკვეთების
          ანაზღაურება ხდება საბანკო გადარიცხვით — დაგიკავშირდებით საბანკო რეკვიზიტების მისაღებად.
        </p>
      </Section>
    </>
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
