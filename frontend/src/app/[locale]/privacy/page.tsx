import { getTranslations, getLocale } from "next-intl/server";
import { StaticPageLayout } from "@/components/static/static-page-layout";

export default async function PrivacyPage() {
  const t = await getTranslations("pages");
  const locale = await getLocale();
  const isKa = locale === "ka";

  return (
    <StaticPageLayout title={t("privacy")} subtitle={t("privacyLastUpdated")}>
      {isKa ? <PrivacyKa /> : <PrivacyEn />}
    </StaticPageLayout>
  );
}

function PrivacyEn() {
  return (
    <>
      <Section title="1. Who we are">
        <p>
          MOVELI (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) is an online marketplace registered in Georgia.
          We are the data controller responsible for your personal data in accordance with
          Georgia&apos;s Law on Personal Data Protection (2011, as amended).
        </p>
      </Section>

      <Section title="2. What data we collect">
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Account information:</strong> name, email, phone number, password (hashed).</li>
          <li><strong>Order data:</strong> delivery address, order history, payment method (we never store card numbers).</li>
          <li><strong>Usage data:</strong> pages visited, search queries, device type, IP address.</li>
          <li><strong>Communications:</strong> messages you send to our support team.</li>
        </ul>
      </Section>

      <Section title="3. Why we process your data">
        <ul className="list-disc pl-5 space-y-1">
          <li>To fulfill your orders and deliver products.</li>
          <li>To manage your account and provide customer support.</li>
          <li>To improve our platform and personalize your experience.</li>
          <li>To send transactional notifications (order status, delivery updates).</li>
          <li>To comply with Georgian tax and accounting obligations (data retained for 6 years per the Tax Code).</li>
        </ul>
        <p className="mt-2">We will only send marketing communications with your explicit consent.</p>
      </Section>

      <Section title="4. How we protect your data">
        <p>
          All data is transmitted over encrypted connections (TLS/SSL). Passwords are
          stored using one-way cryptographic hashing. Payment processing is handled by
          certified third-party providers (TBC Pay, BOG iPay) — we never see or store
          your card details.
        </p>
      </Section>

      <Section title="5. Your rights">
        <p>Under Georgian data protection law (Articles 14–18), you have the right to:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Access your personal data and receive a copy.</li>
          <li>Correct inaccurate information.</li>
          <li>Request deletion of your data (where legally permissible).</li>
          <li>Object to processing for marketing purposes.</li>
          <li>Request data portability.</li>
        </ul>
        <p className="mt-2">
          To exercise these rights, contact us at <strong>support@moveli.ge</strong>.
          We will respond within 15 business days.
        </p>
      </Section>

      <Section title="6. Data sharing">
        <p>
          We share your data only with: delivery partners (to fulfill your order),
          payment processors (to process transactions), and government authorities
          (when legally required). We do not sell your personal data.
        </p>
      </Section>

      <Section title="7. Cookies">
        <p>
          We use essential cookies for site functionality (login sessions, cart state)
          and analytics cookies to understand how visitors use our platform. You can
          manage cookie preferences in your browser settings.
        </p>
      </Section>

      <Section title="8. Supervisory authority">
        <p>
          If you believe your data protection rights have been violated, you have the
          right to lodge a complaint with the Personal Data Protection Service of Georgia
          (personaldata.ge).
        </p>
      </Section>

      <Section title="9. Changes to this policy">
        <p>
          We may update this policy periodically. Material changes will be communicated
          via email or a notice on our website.
        </p>
      </Section>
    </>
  );
}

function PrivacyKa() {
  return (
    <>
      <Section title="1. ვინ ვართ ჩვენ">
        <p>
          MOVELI („ჩვენ&quot;, „ჩვენი&quot;) არის საქართველოში რეგისტრირებული ონლაინ მარკეტპლეისი.
          ჩვენ ვართ მონაცემთა დამმუშავებელი, რომელიც პასუხისმგებელია თქვენს პერსონალურ
          მონაცემებზე საქართველოს პერსონალურ მონაცემთა დაცვის კანონის შესაბამისად (2011, ცვლილებებით).
        </p>
      </Section>

      <Section title="2. რა მონაცემებს ვაგროვებთ">
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>ანგარიშის ინფორმაცია:</strong> სახელი, ელ-ფოსტა, ტელეფონი, პაროლი (დაშიფრული).</li>
          <li><strong>შეკვეთის მონაცემები:</strong> მიწოდების მისამართი, შეკვეთის ისტორია, გადახდის მეთოდი (ბარათის ნომრებს არასოდეს ვინახავთ).</li>
          <li><strong>გამოყენების მონაცემები:</strong> მონახულებული გვერდები, ძიების მოთხოვნები, მოწყობილობის ტიპი, IP მისამართი.</li>
          <li><strong>კომუნიკაცია:</strong> შეტყობინებები, რომლებსაც მხარდაჭერის გუნდს უგზავნით.</li>
        </ul>
      </Section>

      <Section title="3. რატომ ვამუშავებთ თქვენს მონაცემებს">
        <ul className="list-disc pl-5 space-y-1">
          <li>შეკვეთების შესრულებისა და პროდუქტების მიწოდებისთვის.</li>
          <li>ანგარიშის მართვისა და მომხმარებლის მხარდაჭერისთვის.</li>
          <li>პლატფორმის გაუმჯობესებისა და გამოცდილების პერსონალიზაციისთვის.</li>
          <li>ტრანზაქციული შეტყობინებების გასაგზავნად (შეკვეთის სტატუსი, მიწოდების განახლებები).</li>
          <li>საქართველოს საგადასახადო და ბუღალტრული ვალდებულებების შესასრულებლად (მონაცემები ინახება 6 წელი საგადასახადო კოდექსის მიხედვით).</li>
        </ul>
        <p className="mt-2">მარკეტინგულ კომუნიკაციას მხოლოდ თქვენი ცხადი თანხმობით ვაგზავნით.</p>
      </Section>

      <Section title="4. როგორ ვიცავთ თქვენს მონაცემებს">
        <p>
          ყველა მონაცემი გადაიცემა დაშიფრული კავშირით (TLS/SSL). პაროლები ინახება
          ცალმხრივი კრიპტოგრაფიული ჰეშირებით. გადახდის დამუშავებას ახორციელებენ
          სერტიფიცირებული მესამე მხარეები (TBC Pay, BOG iPay) — ჩვენ ბარათის დეტალებს
          არასოდეს ვხედავთ და არ ვინახავთ.
        </p>
      </Section>

      <Section title="5. თქვენი უფლებები">
        <p>საქართველოს მონაცემთა დაცვის კანონის (მუხლები 14–18) მიხედვით, თქვენ გაქვთ უფლება:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>მიიღოთ წვდომა თქვენს პერსონალურ მონაცემებზე და მიიღოთ ასლი.</li>
          <li>გაასწოროთ არაზუსტი ინფორმაცია.</li>
          <li>მოითხოვოთ მონაცემების წაშლა (კანონით ნებადართული შემთხვევებში).</li>
          <li>გააპროტესტოთ მარკეტინგული მიზნებით დამუშავება.</li>
          <li>მოითხოვოთ მონაცემთა პორტაბელურობა.</li>
        </ul>
        <p className="mt-2">
          ამ უფლებების გამოსაყენებლად დაგვიკავშირდით: <strong>support@moveli.ge</strong>.
          ვპასუხობთ 15 სამუშაო დღეში.
        </p>
      </Section>

      <Section title="6. მონაცემთა გაზიარება">
        <p>
          თქვენს მონაცემებს ვუზიარებთ მხოლოდ: მიწოდების პარტნიორებს (შეკვეთის შესასრულებლად),
          გადახდის პროცესორებს (ტრანზაქციების დასამუშავებლად) და სახელმწიფო ორგანოებს
          (კანონით მოთხოვნის შემთხვევაში). ჩვენ არ ვყიდით თქვენს პერსონალურ მონაცემებს.
        </p>
      </Section>

      <Section title="7. ქუქი-ფაილები">
        <p>
          ვიყენებთ აუცილებელ ქუქი-ფაილებს საიტის ფუნქციონირებისთვის (ავტორიზაციის სესიები,
          კალათის მდგომარეობა) და ანალიტიკურ ქუქი-ფაილებს მომხმარებლის ქცევის გასაგებად.
          ქუქი-ფაილების პარამეტრების მართვა შეგიძლიათ ბრაუზერის პარამეტრებში.
        </p>
      </Section>

      <Section title="8. საზედამხედველო ორგანო">
        <p>
          თუ მიგაჩნიათ, რომ დაირღვა თქვენი მონაცემთა დაცვის უფლებები, გაქვთ უფლება
          საჩივრით მიმართოთ საქართველოს პერსონალურ მონაცემთა დაცვის სამსახურს (personaldata.ge).
        </p>
      </Section>

      <Section title="9. პოლიტიკის ცვლილებები">
        <p>
          შეიძლება პერიოდულად განვაახლოთ ეს პოლიტიკა. მნიშვნელოვანი ცვლილებების შესახებ
          გეცნობებათ ელ-ფოსტით ან ვებგვერდზე განთავსებული შეტყობინებით.
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
