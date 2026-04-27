export default function TermsPage() {
  return (
    <div className="max-w-[1000px] mx-auto px-6 py-16 space-y-12">
      
      {/* Header */}
      <div className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">
          Terms & Conditions
        </h1>
        <p className="text-gray-600 text-lg">
          Please read these terms carefully before using our website or placing an order.
        </p>
      </div>

      <Section title="1. General Considerations & Scope">
        <p>
          Indra Dress Point maintains this website as an online fashion store.
          The products offered on this website are intended for customers of legal age.
          Goods are sold only in normal household quantities.
        </p>
        <p>
          These terms apply to all purchases and all business relationships
          between Indra Dress Point and its customers.
          Any other terms are not accepted unless explicitly agreed.
        </p>
      </Section>

      <Section title="2. Use of Our Website">
        <p>
          During registration, customers are required to provide accurate and complete personal information.
          You are responsible for maintaining the confidentiality of your login credentials.
        </p>
        <p>
          Inside your account area, you may view orders, update personal details,
          and manage subscriptions such as newsletters.
        </p>
      </Section>

      <Section title="3. Prices & Payments">
        <p>
          The prices displayed on the product page at the time of ordering apply.
          Final prices including applicable taxes are shown in the shopping cart.
        </p>
        <p>
          We accept major credit and debit cards.
          Payments are processed securely through encrypted payment gateways.
        </p>
      </Section>

      <Section title="4. Vouchers & Discounts">
        <ul className="list-disc ml-6 space-y-2">
          <li>Valid only during the announced period or up to 1 year.</li>
          <li>Non-transferable and cannot be extended.</li>
          <li>Cannot be combined with other discount codes.</li>
          <li>Cannot be used for shipping charges.</li>
        </ul>
      </Section>

      <Section title="5. Delivery">
        <p>
          Orders are delivered to the shipping address provided by you.
          Please ensure availability during working hours.
        </p>
        <p>
          Standard delivery time is 4–6 working days.
          For multiple items, the longer delivery time applies.
        </p>
      </Section>

      <Section title="6. Returns & Refunds">
        <p>
          Items may be returned within 14 days of receipt for a refund,
          provided they are unused and in original packaging.
        </p>
        <p>
          Refunds are processed after inspection of returned items.
          Shipping charges are non-refundable.
        </p>
        <p>
          Reverse pickup will be arranged once per order.
          Additional shipping costs must be borne by the customer.
        </p>
      </Section>

      <Section title="7. Service & Complaints">
        <p>
          Customer satisfaction is important to us.
          For any service inquiries or complaints, please contact:
        </p>
        <p className="font-medium">
          📧 support@indradresspoint.com
        </p>
      </Section>

      <Section title="8. Data Security">
        <p>
          All personal data is handled confidentially and in accordance with applicable laws.
          We use secure encryption technologies to protect online transactions.
        </p>
      </Section>

      <Section title="9. Image Rights">
        <p>
          All images and content on this website are the property of Indra Dress Point.
          Unauthorized use is strictly prohibited.
        </p>
      </Section>

      <div className="border-t pt-8 text-sm text-gray-500">
        Last Updated: {new Date().toLocaleDateString()}
      </div>

    </div>
  );
}

function Section({ title, children }: any) {
  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold">{title}</h2>
      <div className="text-gray-700 space-y-3 leading-relaxed">
        {children}
      </div>
    </section>
  );
}