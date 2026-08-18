/**
 * TopLoader — a thin progress bar pinned to the top of the viewport that
 * animates while a page is loading (an `nprogress`-style indicator).
 * Mount it once near the app root; it auto-starts and auto-completes on
 * every Next.js App Router navigation. The imperative `topLoader` API
 * (`start`/`set`/`inc`/`done`, from src/lib/top-loader.ts) can also be
 * called from anywhere — e.g. wrap a real data fetch so the bar tracks
 * actual load time instead of just the route swap.
 *
 * Adapted from the my-snippets registry for Next.js App Router: the
 * original used react-router-dom's useLocation, which fires on both the
 * start AND end of a navigation. Next.js's router hooks (usePathname /
 * useSearchParams) only tell you a navigation just *finished* — there's no
 * built-in "navigation is starting" signal — so this version detects the
 * start of a navigation itself, by listening for clicks on same-origin
 * links app-wide (the same technique the popular nextjs-toploader package
 * uses). Mount this inside a <Suspense> boundary: useSearchParams()
 * otherwise forces every page that renders it into dynamic rendering.
 *
 * Depends on:
 *   - src/lib/top-loader.ts (the store + imperative topLoader API)
 *   - src/lib/utils.ts (cn helper)
 */
"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Loader2Icon } from "lucide-react";

import { topLoader, topLoaderStore } from "@/lib/top-loader";
import { cn } from "@/lib/utils";

type TopLoaderProps = {
  /** CSS color for the bar/spinner - defaults to the theme's `--color-primary`. */
  color?: string;
  /** Bar thickness in px. */
  height?: number;
  /** Show a small spinning indicator in the top-right corner while loading. */
  showSpinner?: boolean;
  /** How often (ms) the bar trickles forward while "loading". */
  crawlSpeed?: number;
  /** Transition duration (ms) for width/opacity changes. */
  speed?: number;
  /** Glow under the bar. `true` for the default glow, a CSS box-shadow string for a custom one, `false` to disable. */
  shadow?: boolean | string;
  /** Starting progress (0-1) when a load starts. */
  initialPosition?: number;
  zIndex?: number;
  className?: string;
};

function isModifiedClick(event: MouseEvent) {
  return event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
}

export function TopLoader({
  color,
  height = 3,
  showSpinner = true,
  crawlSpeed = 200,
  speed = 200,
  shadow = true,
  initialPosition = 0.08,
  zIndex = 1600,
  className,
}: TopLoaderProps = {}) {
  const [state, setState] = useState(topLoaderStore.state);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => topLoaderStore.subscribe(setState), []);

  useEffect(() => {
    if (state.status !== "loading") return;
    const id = window.setInterval(() => topLoader.inc(), crawlSpeed);
    return () => window.clearInterval(id);
  }, [state.status, crawlSpeed]);

  useEffect(() => {
    if (state.status !== "done") return;
    const id = window.setTimeout(() => topLoaderStore.reset(), speed + 200);
    return () => window.clearTimeout(id);
  }, [state.status, speed]);

  // Navigation just finished (pathname or search params changed) — complete the bar.
  const locationKey = `${pathname}${searchParams.toString()}`;
  const prevLocationKeyRef = useRef(locationKey);
  useEffect(() => {
    if (prevLocationKeyRef.current === locationKey) return;
    prevLocationKeyRef.current = locationKey;
    topLoader.done();
  }, [locationKey]);

  // Navigation is about to start — detected via same-origin link clicks,
  // since Next.js's router has no direct "navigation starting" event.
  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (isModifiedClick(event)) return;
      const anchor = (event.target as HTMLElement).closest("a");
      if (!anchor) return;
      if (anchor.target === "_blank" || anchor.hasAttribute("download")) return;

      let url: URL;
      try {
        url = new URL(anchor.href, window.location.href);
      } catch {
        return;
      }
      if (url.origin !== window.location.origin) return;
      if (url.pathname + url.search === window.location.pathname + window.location.search) return;

      topLoader.start(initialPosition);
    }

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [initialPosition]);

  const visible = state.status !== "initial";
  const glowColor = color ?? "var(--color-primary)";
  const boxShadow =
    shadow === false ? undefined : typeof shadow === "string" ? shadow : `0 0 10px ${glowColor}, 0 0 5px ${glowColor}`;

  return (
    <div
      aria-hidden
      data-slot="top-loader"
      data-status={state.status}
      style={{ zIndex }}
      className={cn("pointer-events-none fixed inset-x-0 top-0", className)}
    >
      <div
        data-slot="top-loader-bar"
        className={cn(!color && "bg-primary")}
        style={{
          width: `${state.progress}%`,
          height,
          backgroundColor: color,
          opacity: visible ? 1 : 0,
          boxShadow,
          transition: `width ${speed}ms ease, opacity ${speed}ms ease`,
        }}
      />
      {showSpinner && (
        <Loader2Icon
          data-slot="top-loader-spinner"
          className={cn("fixed top-3 right-3 size-4 animate-spin", !color && "text-primary")}
          style={{ color, opacity: visible ? 1 : 0, transition: `opacity ${speed}ms ease` }}
        />
      )}
    </div>
  );
}
