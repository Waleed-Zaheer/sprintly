"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { ListChecks } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import { toast } from "@/components/sonner";

type Sprint = {
  id: string;
  name: string;
  goal: string | null;
  startDate: string;
  endDate: string;
  status: "planned" | "active" | "completed";
};

const emptyForm = { name: "", goal: "", startDate: "", endDate: "" };

const STATUS_BADGE: Record<Sprint["status"], { variant: "default" | "secondary" | "outline"; className?: string }> = {
  planned: { variant: "secondary" },
  active: { variant: "default" },
  completed: { variant: "outline", className: "border-success/30 bg-success/10 text-success" },
};

export function SprintBoard() {
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      const res = await fetch("/api/sprints");
      const data = await res.json();
      setSprints(data.sprints ?? []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setCreating(true);
    try {
      const res = await fetch("/api/sprints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError("Couldn't create that sprint. Check your dates.");
        return;
      }
      setForm(emptyForm);
      setSprints((prev) => [data.sprint, ...prev]);
      toast.success("Sprint created", { description: data.sprint.name });
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardContent>
          <form onSubmit={handleCreate} className="grid gap-3 sm:grid-cols-2">
            <Input
              required
              placeholder="Sprint name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="sm:col-span-2"
            />
            <Input
              placeholder="Goal (optional)"
              value={form.goal}
              onChange={(e) => setForm({ ...form, goal: e.target.value })}
              className="sm:col-span-2"
            />
            <Input
              required
              type="date"
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
            />
            <Input
              required
              type="date"
              value={form.endDate}
              onChange={(e) => setForm({ ...form, endDate: e.target.value })}
            />
            {error && <p className="text-sm text-danger sm:col-span-2">{error}</p>}
            <Button type="submit" disabled={creating} className="sm:col-span-2">
              {creating ? "Creating…" : "Create sprint"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-28 w-full rounded-4xl" />
          <Skeleton className="h-28 w-full rounded-4xl" />
          <Skeleton className="h-28 w-full rounded-4xl" />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {sprints.map((sprint, i) => (
            <motion.div
              key={sprint.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: i * 0.05 }}
            >
              <Link href={`/dashboard/sprints/${sprint.id}`} className="block">
                <Card className="transition-shadow hover:shadow-lg hover:ring-primary/30">
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">{sprint.name}</h3>
                      <Badge {...STATUS_BADGE[sprint.status]}>{sprint.status}</Badge>
                    </div>
                    {sprint.goal && <p className="mt-1 text-sm text-muted">{sprint.goal}</p>}
                    <p className="mt-3 text-xs text-muted">
                      {format(new Date(sprint.startDate), "MMM d")} – {format(new Date(sprint.endDate), "MMM d, yyyy")}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
      {!loading && sprints.length === 0 && (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ListChecks />
            </EmptyMedia>
            <EmptyTitle>No sprints yet</EmptyTitle>
            <EmptyDescription>
              Create your first sprint above to start planning and tracking time against it.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
    </div>
  );
}
