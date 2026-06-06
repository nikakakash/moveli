import { getTranslations, getLocale } from "next-intl/server";
import { StaticPageLayout } from "@/components/static/static-page-layout";

export default async function TermsPage() {
  const t = await getTranslations("pages");
  const locale = await getLocale();
  const isKa = locale === "ka";

  return (
    <StaticPageLayout title={t("terms")} subtitle={t("termsLastUpdated")}>
      {isKa ? <TermsKa /> : <TermsEn />}
    </StaticPageLayout>
  );
}

function TermsEn() {
  return (
    <>
      <Section title="1. General provisions">
        <p>
          These Terms and Conditions govern your use of the MOVELI online marketplace (moveli.ge)
          and any purchases made through it. By creating an account or placing an order, you agree
          to these terms. These terms are governed by the laws of Georgia, including the Civil Code,
          the Law on Electronic Commerce (2008), and the Consumer Protection Law (2022).
        </p>
      </Section>

      <Section title="2. Account registration">
        <p>
          You must be at least 18 years old to create an account. You are responsible for
          maintaining the confidentiality of your login credentials. You agree to provide
          accurate and current information. We reserve the right to suspend accounts that
          violate these terms.
        </p>
      </Section>

      <Section title="3. Orders and pricing">
        <p>
          All prices are displayed in Georgian Lari (₾) and include VAT where applicable.
          An order is confirmed when you receive an order confirmation email or notification.
          We reserve the right to cancel orders due to pricing errors, stock unavailability,
          or suspected fraud, with a full refund issued promptly.
        </p>
      </Section>

      <Section title="4. Payment">
        <p>
          We accept Visa, Mastercard, Apple Pay, Google Pay, and cash on delivery (Tbilisi only).
          All electronic payments are processed by certified Georgian payment service providers.
          We do not store your payment card information.
        </p>
      </Section>

      <Section title="5. Delivery">
        <p>
          Delivery timelines are estimates, not guarantees. Standard delivery within Tbilisi
          is 1–2 business days. Regional deliveries via Georgian Post take 2–5 business days.
          Risk of loss passes to you upon delivery. See our Shipping Policy for full details.
        </p>
      </Section>

      <Section title="6. Right of withdrawal">
        <p>
          In accordance with the Consumer Protection Law of Georgia (Article 30), you have
          the right to withdraw from a distance purchase within <strong>14 calendar days</strong> of
          receiving the goods, without providing a reason. The product must be returned in its
          original condition and packaging. See our Refund Policy for exceptions and procedures.
        </p>
      </Section>

      <Section title="7. Warranty and defective goods">
        <p>
          Under Georgian law (Consumer Protection Law, Article 34), the seller is liable for
          defects that appear within <strong>2 years</strong> of delivery. During the first 6 months,
          any defect is presumed to have existed at the time of delivery unless the seller
          proves otherwise. You may request repair, replacement, a price reduction, or a refund.
        </p>
      </Section>

      <Section title="8. Intellectual property">
        <p>
          All content on moveli.ge — including logos, text, images, and software — is the
          property of MOVELI or its licensors and is protected by Georgian and international
          copyright law. You may not reproduce, distribute, or create derivative works without
          our written permission.
        </p>
      </Section>

      <Section title="9. Limitation of liability">
        <p>
          MOVELI acts as a marketplace connecting buyers and sellers. While we verify sellers
          and enforce quality standards, we are not the manufacturer of products sold on our
          platform. Our liability is limited to the purchase price of the affected order.
          We are not liable for indirect, incidental, or consequential damages.
        </p>
      </Section>

      <Section title="10. Dispute resolution">
        <p>
          We encourage resolving disputes through our customer support team first. If a
          resolution cannot be reached, you may file a complaint with the Georgian National
          Competition Agency (competition.ge). Legal disputes are subject to the jurisdiction
          of the courts of Tbilisi, Georgia.
        </p>
      </Section>

      <Section title="11. Changes to terms">
        <p>
          We may modify these terms at any time. Material changes will be communicated
          30 days in advance via email or platform notification. Continued use after changes
          take effect constitutes acceptance.
        </p>
      </Section>
    </>
  );
}

function TermsKa() {
  return (
    <>
      <Section title="1. ზოგადი დებულებები">
        <p>
          ეს წესები და პირობები არეგულირებს MOVELI ონლაინ მარკეტპლეისის (moveli.ge)
          გამოყენებას და მის მეშვეობით განხორციელებულ შეძენებს. ანგარიშის შექმნით ან
          შეკვეთის განთავსებით თქვენ ეთანხმებით ამ წესებს. ეს წესები რეგულირდება
          საქართველოს კანონმდებლობით, მათ შორის სამოქალაქო კოდექსით, ელექტრონული
          კომერციის კანონით (2008) და მომხმარებელთა დაცვის კანონით (2022).
        </p>
      </Section>

      <Section title="2. ანგარიშის რეგისტრაცია">
        <p>
          ანგარიშის შესაქმნელად უნდა იყოთ მინიმუმ 18 წლის. თქვენ ხართ პასუხისმგებელი
          ავტორიზაციის მონაცემების კონფიდენციალურობაზე. თანხმდებით ზუსტი და მიმდინარე
          ინფორმაციის მოწოდებაზე. ვიტოვებთ უფლებას შევაჩეროთ ანგარიშები, რომლებიც
          არღვევენ ამ წესებს.
        </p>
      </Section>

      <Section title="3. შეკვეთები და ფასები">
        <p>
          ყველა ფასი ნაჩვენებია ქართულ ლარში (₾) და მოიცავს დღგ-ს სადაც ეს მოქმედებს.
          შეკვეთა დადასტურებულად ითვლება, როდესაც მიიღებთ შეკვეთის დადასტურების
          შეტყობინებას. ვიტოვებთ უფლებას გავაუქმოთ შეკვეთები ფასის შეცდომის, მარაგის
          ამოწურვის ან თაღლითობის ეჭვის შემთხვევაში, სრული თანხის დაუყოვნებლივ ანაზღაურებით.
        </p>
      </Section>

      <Section title="4. გადახდა">
        <p>
          ვიღებთ Visa-ს, Mastercard-ს, Apple Pay-ს, Google Pay-ს და ნაღდ ანგარიშსწორებას
          (მხოლოდ თბილისში). ყველა ელექტრონული გადახდა მუშავდება სერტიფიცირებული
          ქართული გადახდის სერვისებით. ჩვენ არ ვინახავთ თქვენი გადახდის ბარათის ინფორმაციას.
        </p>
      </Section>

      <Section title="5. მიწოდება">
        <p>
          მიწოდების ვადები შეფასებითია და არა გარანტია. თბილისში სტანდარტული მიწოდება — 1–2
          სამუშაო დღე. რეგიონებში საქართველოს ფოსტით — 2–5 სამუშაო დღე. დაკარგვის რისკი
          თქვენზე გადადის მიწოდების მომენტში. სრული დეტალებისთვის იხილეთ მიწოდების პოლიტიკა.
        </p>
      </Section>

      <Section title="6. უკან დახევის უფლება">
        <p>
          საქართველოს მომხმარებელთა დაცვის კანონის (მუხლი 30) შესაბამისად, თქვენ გაქვთ
          უფლება დისტანციური შეძენიდან უკან დაიხიოთ საქონლის მიღებიდან <strong>14 კალენდარული
          დღის</strong> განმავლობაში, მიზეზის მითითების გარეშე. პროდუქტი უნდა დაბრუნდეს
          ორიგინალ მდგომარეობაში და შეფუთვაში. გამონაკლისებისა და პროცედურებისთვის
          იხილეთ დაბრუნების პოლიტიკა.
        </p>
      </Section>

      <Section title="7. გარანტია და დეფექტიანი საქონელი">
        <p>
          საქართველოს კანონმდებლობის (მომხმარებელთა დაცვის კანონი, მუხლი 34) მიხედვით,
          გამყიდველი პასუხისმგებელია დეფექტებზე, რომლებიც ვლინდება მიწოდებიდან <strong>2
          წლის</strong> განმავლობაში. პირველი 6 თვის განმავლობაში, ნებისმიერი დეფექტი
          ითვლება მიწოდების დროს არსებულად, სანამ გამყიდველი სხვას არ დაამტკიცებს.
          შეგიძლიათ მოითხოვოთ შეკეთება, ჩანაცვლება, ფასის შემცირება ან ანაზღაურება.
        </p>
      </Section>

      <Section title="8. ინტელექტუალური საკუთრება">
        <p>
          moveli.ge-ზე არსებული ყველა კონტენტი — ლოგოები, ტექსტები, სურათები და
          პროგრამული უზრუნველყოფა — არის MOVELI-ს ან მისი ლიცენზიარების საკუთრება
          და დაცულია საქართველოს და საერთაშორისო საავტორო უფლებების კანონით.
        </p>
      </Section>

      <Section title="9. პასუხისმგებლობის შეზღუდვა">
        <p>
          MOVELI მოქმედებს როგორც მარკეტპლეისი, რომელიც აკავშირებს მყიდველებს და
          გამყიდველებს. მიუხედავად იმისა, რომ ვამოწმებთ გამყიდველებს და ვაწესებთ
          ხარისხის სტანდარტებს, ჩვენ არ ვართ პლატფორმაზე გაყიდული პროდუქტების
          მწარმოებელი. ჩვენი პასუხისმგებლობა შემოიფარგლება დაზარალებული შეკვეთის
          შესყიდვის ფასით.
        </p>
      </Section>

      <Section title="10. დავის გადაწყვეტა">
        <p>
          გირჩევთ, ჯერ ჩვენი მომხმარებელთა მხარდაჭერის გუნდის მეშვეობით გადაჭრათ
          დავები. თუ გადაწყვეტა ვერ მიიღწევა, შეგიძლიათ საჩივარი შეიტანოთ საქართველოს
          კონკურენციის ეროვნულ სააგენტოში (competition.ge). სამართლებრივი დავები
          ექვემდებარება თბილისის, საქართველოს სასამართლოების იურისდიქციას.
        </p>
      </Section>

      <Section title="11. წესების ცვლილებები">
        <p>
          შეგვიძლია შევცვალოთ ეს წესები ნებისმიერ დროს. მნიშვნელოვანი ცვლილებების
          შესახებ 30 დღით ადრე გეცნობებათ ელ-ფოსტით ან პლატფორმის შეტყობინებით.
          ცვლილებების ამოქმედების შემდეგ გამოყენების გაგრძელება ნიშნავს თანხმობას.
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
