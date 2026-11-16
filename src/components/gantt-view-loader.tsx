"use client";

import dynamic from "next/dynamic";

// frappe-gantt touches `document`/SVG at construction, so it must never render on the server.
export const GanttViewLoader = dynamic(
  () => import("@/components/gantt-view").then((m) => m.GanttView),
  {
    ssr: false,
    loading: () => (
      <p className="text-muted-foreground text-sm">Loading chart…</p>
    ),
  },
);
