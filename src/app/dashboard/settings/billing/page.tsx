import { BillingPanel } from "@/components/dashboard/BillingPanel";

export default function BillingPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-heading text-2xl font-semibold">Billing</h1>
      <p className="mt-1 text-muted">Manage your subscription and payment details.</p>

      <div className="mt-6">
        <BillingPanel />
      </div>
    </div>
  );
}
