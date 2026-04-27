export default function ReturnsPage() {
  return (
    <div className="max-w-[1000px] mx-auto px-6 py-16 space-y-12">
      {/* Header */}
      <div className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">
          Shipping & Returns
        </h1>
        <p className="text-gray-600 text-lg">
          We want you to feel confident shopping with Indra Dress Point. Here’s
          everything you need to know about delivery and returns.
        </p>
      </div>

      <Section title="1. Shipping (Delivery)">
        <ul className="list-disc ml-6 space-y-2">
          <li>
            <b>Delivery time:</b> Usually within <b>4–6 working days</b> from the
            date of order confirmation.
          </li>
          <li>
            For orders with multiple items, the <b>longest delivery timeline</b>{" "}
            applies.
          </li>
          <li>
            Delivery is made only to the <b>shipping address</b> provided during
            checkout.
          </li>
          <li>
            Please ensure someone is available to receive the parcel during{" "}
            <b>normal working hours</b>.
          </li>
        </ul>
      </Section>

      <Section title="2. Return Policy">
        <p>
          If you are not fully satisfied, you may request a return within{" "}
          <b>14 days</b> of receiving your order.
        </p>

        <div className="rounded-2xl border bg-gray-50 p-5 space-y-2">
          <p className="font-semibold">Return conditions</p>
          <ul className="list-disc ml-6 space-y-2 text-gray-700">
            <li>Item must be unused and in original condition.</li>
            <li>All original tags and packaging must be included.</li>
            <li>
              Items damaged due to customer handling (outside normal use) will
              not be accepted.
            </li>
          </ul>
        </div>
      </Section>

      <Section title="3. Damaged / Defective Items">
        <p>
          If your item has a manufacturing defect, you can request a return
          within <b>14 days</b> of receipt. Once we inspect the item, your refund
          will be processed.
        </p>
      </Section>

      <Section title="4. Reverse Pickup & Return Process">
        <ol className="list-decimal ml-6 space-y-2">
          <li>
            Email us within <b>14 days</b> of receiving the parcel.
          </li>
          <li>
            Pack the item securely with original tags and packaging.
          </li>
          <li>
            We will arrange a <b>reverse pickup once</b> for exchange or refund
            (where available).
          </li>
        </ol>

        <div className="rounded-2xl border bg-white p-5 mt-4 space-y-2">
          <p className="font-semibold">Important notes</p>
          <ul className="list-disc ml-6 space-y-2 text-gray-700">
            <li>
              If reverse pickup fails after <b>three attempts</b>, the refund
              request may be cancelled.
            </li>
            <li>
              If you choose self-shipping, the item must be dispatched within{" "}
              <b>two weeks</b> of initiating the return request.
            </li>
            <li>
              <b>Shipping charges are not reimbursed.</b>
            </li>
          </ul>
        </div>
      </Section>

      <Section title="5. Refunds">
        <p>
          Once your return is received and approved, refunds will be processed
          to your original payment method or as store credit (depending on your
          payment option and store policy).
        </p>
      </Section>

      <Section title="6. Need Help?">
        <p>
          If you need support regarding shipping or returns, contact us:
        </p>
        <p className="font-medium">📧 support@indradresspoint.com</p>
      </Section>

      <div className="border-t pt-8 text-sm text-gray-500">
        Last Updated: {new Date().toLocaleDateString()}
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold">{title}</h2>
      <div className="text-gray-700 space-y-3 leading-relaxed">{children}</div>
    </section>
  );
}