import { RegisterForm } from "@/components/auth/RegisterForm";
import type { Plan } from "@/lib/db/schema";
import { plans } from "@/lib/db/schema";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string }>;
}) {
  const { plan } = await searchParams;
  const defaultPlan: Plan = plans.includes(plan as Plan) ? (plan as Plan) : "free";

  return <RegisterForm defaultPlan={defaultPlan} />;
}
