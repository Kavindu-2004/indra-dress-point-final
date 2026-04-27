export default function PrivacyPage() {
  return (
    <div className="max-w-[1000px] mx-auto px-6 py-16 space-y-12">
      {/* Header */}
      <div className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Privacy Policy</h1>
        <p className="text-gray-600 text-lg">
          Your privacy matters to us. This policy explains how Indra Dress Point
          collects, uses, and protects your personal information.
        </p>
      </div>

      <Section title="1. Information We Collect">
        <ul className="list-disc ml-6 space-y-2">
          <li>
            <b>Account Information:</b> name, email, profile photo (if you sign
            in with Google).
          </li>
          <li>
            <b>Order Information:</b> delivery address, phone number, order items,
            order totals, order status.
          </li>
          <li>
            <b>Payment Information:</b> we do not store card details. Payments are
            handled securely by our payment gateway.
          </li>
          <li>
            <b>Technical Data:</b> device/browser type, IP address, basic usage
            analytics (to improve performance).
          </li>
        </ul>
      </Section>

      <Section title="2. How We Use Your Information">
        <ul className="list-disc ml-6 space-y-2">
          <li>To create and manage your account.</li>
          <li>To process orders and deliveries.</li>
          <li>To send order updates (confirmation, shipped, delivered).</li>
          <li>To provide customer support and resolve issues.</li>
          <li>To improve site experience, security, and performance.</li>
        </ul>
      </Section>

      <Section title="3. Sharing of Information">
        <p>
          We do not sell your personal information. We only share information
          when necessary to provide services, such as:
        </p>
        <ul className="list-disc ml-6 space-y-2">
          <li>Delivery partners (only what’s needed to deliver your order).</li>
          <li>Payment providers (to complete secure payments).</li>
          <li>
            Legal requirements (if required by law or to prevent fraud/abuse).
          </li>
        </ul>
      </Section>

      <Section title="4. Cookies">
        <p>
          We may use cookies to improve your browsing experience (e.g., keeping
          you signed in, saving cart data). You can control cookies through your
          browser settings.
        </p>
      </Section>

      <Section title="5. Data Security">
        <p>
          We use industry-standard security measures to protect your information.
          Sensitive actions are performed using encrypted connections (HTTPS).
        </p>
        <p>
          However, no method of transmission over the internet is 100% secure.
          We continuously improve safeguards to keep your data protected.
        </p>
      </Section>

      <Section title="6. Your Rights">
        <ul className="list-disc ml-6 space-y-2">
          <li>You can request access to your personal data.</li>
          <li>You can request corrections to inaccurate data.</li>
          <li>You can request deletion of your account and associated data.</li>
          <li>
            You can opt out of marketing messages (if enabled in the future).
          </li>
        </ul>
      </Section>

      <Section title="7. Third-Party Services">
        <p>
          Our website may use trusted third-party services (example: Google
          login). These services may collect data according to their own
          privacy policies.
        </p>
      </Section>

      <Section title="8. Contact Us">
        <p>
          If you have questions about this Privacy Policy, contact us:
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