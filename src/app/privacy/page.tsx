import { LegalLayout, LegalSection } from "@/components/legal/LegalLayout";

export const metadata = { title: "Privacy Policy — Sprintly" };

export default function PrivacyPage() {
  return (
    <LegalLayout title="Privacy Policy" lastUpdated="August 17, 2026">
      <LegalSection title="1. Who we are">
        <p>
          Sprintly (&quot;we&quot;, &quot;us&quot;) provides a sprint-planning and time-tracking application for
          individuals and companies. This policy explains what personal data we collect, why, and what you can do
          about it. If you have questions, contact us at{" "}
          <a href="mailto:privacy@sprintly.app" className="text-primary hover:text-primary-hover">
            privacy@sprintly.app
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection title="2. What we collect">
        <p>We collect only what the product needs to function, plus a small amount of security/anti-abuse data:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>Account information:</strong> name, email address, hashed password (we never store your
            password in plain text), and phone number if you provide one.
          </li>
          <li>
            <strong>Company information:</strong> for Enterprise accounts, the company name and its list of members.
          </li>
          <li>
            <strong>Product data:</strong> the sprints, tasks, and time entries you create — this is the content the
            product exists to store, and is visible only to you (and your teammates, for company accounts).
          </li>
          <li>
            <strong>Billing information:</strong> handled by our payment processor, Stripe. We store a Stripe
            customer/subscription ID, never your full card number.
          </li>
          <li>
            <strong>Push notification subscription:</strong> if you enable browser/desktop notifications, we store
            the subscription endpoint your browser gives us so we can deliver alerts (e.g. sprint deadlines).
          </li>
          <li>
            <strong>Sign-up IP address and coarse location (country/region/city):</strong> captured once, at account
            creation, from a third-party IP-geolocation lookup. We use this exclusively to detect abuse — for
            example, one person creating many accounts from the same IP address to bypass trial limits — and it is
            visible only to platform administrators, never to other users.
          </li>
          <li>
            <strong>Cookies:</strong> a single, strictly-necessary session cookie that keeps you logged in. See
            Section 6.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="3. How we use it">
        <ul className="list-disc space-y-1 pl-5">
          <li>To provide the core product — authentication, sprints, tasks, time tracking, billing.</li>
          <li>To send transactional notifications you&apos;ve opted into (sprint deadlines, trial status).</li>
          <li>To detect and act on abuse of trial/free plans (the IP data described above).</li>
          <li>To communicate with you about your account, e.g. billing or security notices.</li>
        </ul>
        <p>We do not sell your personal data, and we do not use it for advertising.</p>
      </LegalSection>

      <LegalSection title="4. Who we share it with">
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>Stripe</strong> — payment processing, for paid plans.
          </li>
          <li>
            <strong>ipapi.co</strong> — a third-party IP geolocation lookup used at sign-up (see Section 2).
          </li>
          <li>
            <strong>Our hosting/infrastructure providers</strong> — to run the application and store data.
          </li>
        </ul>
        <p>We don&apos;t share your data with anyone else, except where required by law.</p>
      </LegalSection>

      <LegalSection title="5. Data retention & your rights">
        <p>
          We keep your account data for as long as your account is active. If you&apos;d like your account and
          associated data deleted, contact us and we&apos;ll process the request, subject to any records we&apos;re
          legally required to retain (e.g. billing records). Depending on where you live, you may have additional
          rights to access, correct, or export your data — contact us to exercise them.
        </p>
      </LegalSection>

      <LegalSection title="6. Cookies">
        <p>
          Sprintly currently uses a single strictly-necessary cookie: an authentication session cookie, so you stay
          logged in between visits. It isn&apos;t used for tracking, advertising, or analytics, and it isn&apos;t
          shared with third parties. Because it&apos;s strictly necessary for the service to function, it&apos;s set
          regardless of the choice you make in the cookie banner — the banner exists to be transparent about this,
          not to gate the cookie itself.
        </p>
      </LegalSection>

      <LegalSection title="7. Children">
        <p>Sprintly isn&apos;t directed at children, and we don&apos;t knowingly collect data from anyone under 16.</p>
      </LegalSection>

      <LegalSection title="8. Changes to this policy">
        <p>
          We may update this policy as the product changes. We&apos;ll update the &quot;Last updated&quot; date
          above when we do.
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
