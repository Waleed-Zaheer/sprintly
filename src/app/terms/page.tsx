import { LegalLayout, LegalSection } from "@/components/legal/LegalLayout";

export const metadata = { title: "Terms of Service — Sprintly" };

export default function TermsPage() {
  return (
    <LegalLayout title="Terms of Service" lastUpdated="August 17, 2026">
      <LegalSection title="1. Acceptance of terms">
        <p>
          By creating an account or using Sprintly, you agree to these Terms of Service. If you&apos;re accepting
          them on behalf of a company (an Enterprise account), you confirm you have the authority to do so.
        </p>
      </LegalSection>

      <LegalSection title="2. The service">
        <p>
          Sprintly is a sprint-planning and time-tracking tool. We offer a Free plan (24-hour trial), an Individual
          plan (7-day free trial, then a monthly subscription), and an Enterprise plan (monthly subscription, up to
          50 team members). Plan details and pricing are shown on our pricing page and may change with notice.
        </p>
      </LegalSection>

      <LegalSection title="3. Your account">
        <ul className="list-disc space-y-1 pl-5">
          <li>You&apos;re responsible for keeping your login credentials secure.</li>
          <li>You must provide accurate information when you register.</li>
          <li>
            One person or entity may not create multiple accounts to repeatedly claim free trials or otherwise
            circumvent plan limits. We use sign-up IP data to help detect this (see our{" "}
            <a href="/privacy" className="text-primary hover:text-primary-hover">
              Privacy Policy
            </a>
            ).
          </li>
          <li>For Enterprise accounts, the account owner is responsible for who they invite and each seat&apos;s use.</li>
        </ul>
      </LegalSection>

      <LegalSection title="4. Billing">
        <ul className="list-disc space-y-1 pl-5">
          <li>Paid plans are billed monthly in advance via Stripe.</li>
          <li>Trials convert to a paid subscription unless cancelled before the trial ends.</li>
          <li>You can cancel or change your plan at any time from the billing page; changes take effect per Stripe&apos;s standard proration rules.</li>
          <li>Fees are non-refundable except where required by law.</li>
        </ul>
      </LegalSection>

      <LegalSection title="5. Acceptable use">
        <p>You agree not to:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Use the service for anything unlawful, or to store/transmit content you don&apos;t have the right to.</li>
          <li>Attempt to gain unauthorized access to any part of the service, or interfere with its normal operation.</li>
          <li>Create multiple accounts to abuse free trials or plan limits.</li>
          <li>Resell or provide the service to third parties without our agreement.</li>
        </ul>
      </LegalSection>

      <LegalSection title="6. Suspension and termination">
        <p>
          We may restrict or disable an account that violates these terms — including multi-accounting to abuse
          trials, as described above — with or without notice, at our discretion. You may cancel your account at
          any time; your data is handled per our{" "}
          <a href="/privacy" className="text-primary hover:text-primary-hover">
            Privacy Policy
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection title="7. Intellectual property">
        <p>
          We own Sprintly&apos;s software, design, and branding. You own the sprints, tasks, and time-tracking data
          you create — we only use it to provide the service to you.
        </p>
      </LegalSection>

      <LegalSection title="8. Disclaimer & limitation of liability">
        <p>
          Sprintly is provided &quot;as is&quot;, without warranties of any kind. To the maximum extent permitted by
          law, we aren&apos;t liable for indirect, incidental, or consequential damages arising from your use of the
          service.
        </p>
      </LegalSection>

      <LegalSection title="9. Governing law">
        <p>
          [Placeholder — specify the jurisdiction whose laws govern these terms, and where disputes will be
          resolved, before publishing this page.]
        </p>
      </LegalSection>

      <LegalSection title="10. Changes to these terms">
        <p>We may update these terms as the product changes. Continued use after an update means you accept the revised terms.</p>
      </LegalSection>

      <LegalSection title="11. Contact">
        <p>
          Questions about these terms?{" "}
          <a href="mailto:hello@sprintly.app" className="text-primary hover:text-primary-hover">
            hello@sprintly.app
          </a>
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
