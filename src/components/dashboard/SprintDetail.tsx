"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { ArrowLeft, CheckCircle2, Circle, ListChecks, PlayCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import { toast } from "@/components/sonner";
import { cn } from "@/lib/utils";

type Sprint = {
  id: string;
  name: string;
  goal: string | null;
  startDate: string;
  endDate: string;
  status: "planned" | "active" | "completed";
};

type Task = {
  id: string;
  title: string;
  description: string | null;
  status: "todo" | "in_progress" | "done";
  estimateMinutes: number | null;
};

const STATUS_BADGE: Record<Sprint["status"], { variant: "default" | "secondary" | "outline"; className?: string }> = {
  planned: { variant: "secondary" },
  active: { variant: "default" },
  completed: { variant: "outline", className: "border-success/30 bg-success/10 text-success" },
};

export function SprintDetail({ sprintId }: { sprintId: string }) {
  const [sprint, setSprint] = useState<Sprint | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [title, setTitle] = useState("");
  const [creating, setCreating] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);

  async function load() {
    try {
      const res = await fetch(`/api/sprints/${sprintId}`);
      if (res.status === 404) {
        setNotFound(true);
        return;
      }
      const data = await res.json();
      setSprint(data.sprint);
      setTasks(data.tasks ?? []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sprintId]);

  async function handleAddTask(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setCreating(true);
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sprintId, title }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Couldn't add that task.");
        return;
      }
      setTasks((prev) => [...prev, data.task]);
      setTitle("");
    } finally {
      setCreating(false);
    }
  }

  async function toggleTask(task: Task) {
    const nextStatus = task.status === "done" ? "todo" : "done";
    setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, status: nextStatus } : t)));
    const res = await fetch(`/api/tasks/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus }),
    });
    if (!res.ok) {
      setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, status: task.status } : t)));
      toast.error("Couldn't update that task.");
    }
  }

  async function advanceStatus(next: Sprint["status"]) {
    if (!sprint) return;
    setStatusUpdating(true);
    try {
      const res = await fetch(`/api/sprints/${sprint.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Couldn't update the sprint.");
        return;
      }
      setSprint(data.sprint);
      toast.success(next === "active" ? "Sprint started" : "Sprint marked complete");
    } finally {
      setStatusUpdating(false);
    }
  }

  if (notFound) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <ListChecks />
          </EmptyMedia>
          <EmptyTitle>Sprint not found</EmptyTitle>
          <EmptyDescription>
            It may have been removed, or you don&apos;t have access to it.{" "}
            <Link href="/dashboard/sprints">Back to sprints</Link>
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-24 w-full rounded-4xl" />
        <Skeleton className="h-40 w-full rounded-4xl" />
      </div>
    );
  }

  if (!sprint) return null;

  const doneCount = tasks.filter((t) => t.status === "done").length;

  return (
    <div className="space-y-6">
      <Link href="/dashboard/sprints" className="inline-flex items-center gap-1 text-sm text-muted hover:text-foreground">
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to sprints
      </Link>

      <Card>
        <CardContent>
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-heading text-xl font-semibold">{sprint.name}</h1>
                <Badge {...STATUS_BADGE[sprint.status]}>{sprint.status}</Badge>
              </div>
              {sprint.goal && <p className="mt-1 text-sm text-muted">{sprint.goal}</p>}
              <p className="mt-2 text-xs text-muted">
                {format(new Date(sprint.startDate), "MMM d")} – {format(new Date(sprint.endDate), "MMM d, yyyy")}
              </p>
            </div>

            {sprint.status === "planned" && (
              <Button onClick={() => advanceStatus("active")} disabled={statusUpdating}>
                <PlayCircle className="h-4 w-4" />
                Start sprint
              </Button>
            )}
            {sprint.status === "active" && (
              <Button onClick={() => advanceStatus("completed")} disabled={statusUpdating} variant="outline">
                <CheckCircle2 className="h-4 w-4" />
                Mark complete
              </Button>
            )}
          </div>

          {tasks.length > 0 && (
            <p className="mt-4 text-xs text-muted">
              {doneCount} of {tasks.length} tasks done
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <form onSubmit={handleAddTask} className="flex items-center gap-3">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Add a task…"
              className="flex-1"
            />
            <Button type="submit" disabled={creating || !title.trim()}>
              {creating ? "Adding…" : "Add"}
            </Button>
          </form>

          {tasks.length === 0 ? (
            <Empty className="mt-6 p-8">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <ListChecks />
                </EmptyMedia>
                <EmptyTitle>No tasks yet</EmptyTitle>
                <EmptyDescription>Break this sprint down into tasks above.</EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <ul className="mt-4 space-y-1">
              {tasks.map((task) => (
                <li key={task.id}>
                  <button
                    type="button"
                    onClick={() => toggleTask(task)}
                    className="flex w-full items-center gap-3 rounded-2xl px-2 py-2 text-left text-sm transition-colors hover:bg-secondary"
                  >
                    {task.status === "done" ? (
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
                    ) : (
                      <Circle className="h-4 w-4 shrink-0 text-muted" />
                    )}
                    <span className={cn("flex-1", task.status === "done" && "text-muted line-through")}>
                      {task.title}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
