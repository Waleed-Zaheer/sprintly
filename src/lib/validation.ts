import { z } from "zod";

// Optional form fields arrive as "" (not undefined) when a controlled input
// is left blank, and z.string().min(N).optional() only treats `undefined`
// as "not provided" — an empty string still fails .min(N). Preprocessing ""
// to undefined here makes these fields genuinely optional for real form
// submissions, not just for hand-built payloads that omit the key entirely.
const optionalTrimmedString = (min: number, max: number) =>
  z.preprocess((value) => (value === "" ? undefined : value), z.string().min(min).max(max).optional());

export const registerSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(8).max(128),
  phone: optionalTrimmedString(6, 20),
  plan: z.enum(["free", "individual", "enterprise"]).default("free"),
  companyName: optionalTrimmedString(2, 120),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const inviteSchema = z.object({
  email: z.string().email(),
});

export const sprintSchema = z.object({
  name: z.string().min(2).max(120),
  goal: z.string().max(500).optional(),
  startDate: z.string(),
  endDate: z.string(),
});

export const taskSchema = z.object({
  sprintId: z.string(),
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  assigneeId: z.string().optional(),
  estimateMinutes: z.number().int().positive().optional(),
});

export const sprintStatusSchema = z.object({
  status: z.enum(["planned", "active", "completed"]),
});

export const taskStatusSchema = z.object({
  status: z.enum(["todo", "in_progress", "done"]),
});

export const accountStatusUpdateSchema = z.object({
  status: z.enum(["active", "restricted", "disabled"]),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8).max(128),
});

export const acceptInviteSchema = z.object({
  name: z.string().min(2).max(80),
  password: z.string().min(8).max(128),
});
