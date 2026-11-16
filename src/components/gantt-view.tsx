"use client";

// Relative path: the package `exports` map does not expose its CSS subpath.
import "../../node_modules/frappe-gantt/dist/frappe-gantt.css";
import Gantt from "frappe-gantt";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useEffectEvent,
  useRef,
  useState,
  useTransition,
} from "react";
import { Button } from "@/components/ui/button";
import { STATUS_LABEL, STATUS_PROGRESS } from "@/lib/todo-ui";
import type { TodoStatusValue } from "@/lib/validation";
import { updateTodoDates } from "@/server/todos";

export type GanttTodo = {
  id: string;
  title: string;
  /** "YYYY-MM-DD" (inclusive) */
  start: string;
  end: string;
  status: TodoStatusValue;
};

const MODES = ["Day", "Week", "Month"] as const;
const MODE_LABEL: Record<(typeof MODES)[number], string> = {
  Day: "Өдөр",
  Week: "7 хоног",
  Month: "Сар",
};
type Mode = (typeof MODES)[number];

const escapeHtml = (s: string) =>
  s.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );

/** Local-time Date -> "YYYY-MM-DD" (frappe-gantt parses date strings as local time). */
const ymd = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const signature = (todos: GanttTodo[]) =>
  todos
    .map((t) => `${t.id}|${t.start}|${t.end}|${t.status}|${t.title}`)
    .join("\n");

export function GanttView({ todos }: { todos: GanttTodo[] }) {
  const router = useRouter();
  const host = useRef<HTMLDivElement>(null);
  const chart = useRef<Gantt | null>(null);
  // What the chart currently shows; lets us skip a rebuild when the server echoes our own drag back.
  const shown = useRef("");
  const dates = useRef(new Map<string, { start: string; end: string }>());
  // frappe-gantt fires `click` after every drag-release; track pointer travel to tell the two apart.
  const pointer = useRef({ downX: 0, moved: false });
  const saved = useRef(new Map<string, { start: string; end: string }>());
  const pending = useRef(new Map<string, { start: string; end: string }>());
  const titles = useRef(new Map<string, string>());
  const [mode, setMode] = useState<Mode>("Day");
  const [notice, setNotice] = useState<{ ok: boolean; text: string }>();
  const [, startTransition] = useTransition();

  // frappe-gantt hardcodes the English "Today" label.
  const translateToday = () => {
    const b = host.current?.querySelector(".today-button");
    if (b) b.textContent = "Өнөөдөр";
  };

  useEffect(() => {
    const sig = signature(todos);
    if (!host.current || (chart.current && shown.current === sig)) return;
    shown.current = sig;
    titles.current = new Map(todos.map((t) => [t.id, t.title]));
    dates.current = new Map(
      todos.map((t) => [t.id, { start: t.start, end: t.end }]),
    );
    saved.current = new Map(dates.current);
    pending.current.clear();

    const tasks = todos.map((t) => ({
      id: t.id,
      // frappe-gantt assigns `name` via innerHTML for bar labels, so it must be escaped here.
      name: escapeHtml(t.title),
      start: t.start,
      end: t.end,
      progress: STATUS_PROGRESS[t.status],
      custom_class: `gantt-${t.status.toLowerCase()}`,
      status: t.status,
    }));
    host.current.innerHTML = "";
    chart.current = new Gantt(host.current, tasks, {
      view_mode: mode,
      readonly_progress: true,
      today_button: true,
      scroll_to: "start",
      language: "mn",
      bar_corner_radius: 0,
      popup_on: "hover",
      popup: (ctx) => {
        const status = ctx.task.status as TodoStatusValue;
        const d = dates.current.get(ctx.task.id);
        return `<div class="title">${escapeHtml(titles.current.get(ctx.task.id) ?? "")}</div><div class="details">${escapeHtml(
          STATUS_LABEL[status],
        )}<br/>${d ? `${d.start} → ${d.end}` : ""}</div>`;
      },
      on_click: (task) =>
        !pointer.current.moved && router.push(`/todos/${task.id}`),
      // Fires on every snap step while dragging, so only record here; `flush` saves on release.
      on_date_change: (task, start, end) => {
        const next = { start: ymd(start), end: ymd(end) };
        const cur = dates.current.get(task.id);
        if (cur && cur.start === next.start && cur.end === next.end) return;
        dates.current.set(task.id, next);
        pending.current.set(task.id, next);
        shown.current = signature(
          todos.map((t) => ({ ...t, ...(dates.current.get(t.id) ?? {}) })),
        );
        setNotice({ ok: true, text: "Суллаад хадгална…" });
      },
    });
    translateToday();
  }, [todos, mode, router]);

  const flush = useEffectEvent(() => {
    const batch = [...pending.current];
    pending.current.clear();
    if (!batch.length) return;
    setNotice({ ok: true, text: "Хадгалж байна…" });
    startTransition(async () => {
      let failure: string | undefined;
      for (const [id, d] of batch) {
        const res = await updateTodoDates(id, d.start, d.end);
        if (res?.ok) saved.current.set(id, d);
        else {
          failure = res?.message ?? "Хугацааг хадгалж чадсангүй.";
          const back = saved.current.get(id);
          if (back) dates.current.set(id, back);
        }
      }
      if (failure) {
        setNotice({ ok: false, text: failure });
        shown.current = ""; // force a rebuild from server data
        router.refresh();
      } else setNotice({ ok: true, text: "Хугацаа хадгалагдлаа." });
    });
  });

  useEffect(() => {
    const onUp = () => setTimeout(flush, 50);
    document.addEventListener("pointerup", onUp);
    return () => document.removeEventListener("pointerup", onUp);
  }, []);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const down = (e: PointerEvent) =>
      (pointer.current = { downX: e.clientX, moved: false });
    const move = (e: PointerEvent) => {
      if (Math.abs(e.clientX - pointer.current.downX) > 4)
        pointer.current.moved = true;
    };
    el.addEventListener("pointerdown", down, true);
    el.addEventListener("pointermove", move, true);
    return () => {
      el.removeEventListener("pointerdown", down, true);
      el.removeEventListener("pointermove", move, true);
    };
  }, []);

  useEffect(() => {
    chart.current?.change_view_mode(mode, true);
    translateToday();
  }, [mode]);

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        {MODES.map((m) => (
          <Button
            key={m}
            type="button"
            size="sm"
            variant={m === mode ? "default" : "outline"}
            aria-pressed={m === mode}
            onClick={() => setMode(m)}
          >
            {MODE_LABEL[m]}
          </Button>
        ))}
        <span
          role="status"
          className={`text-sm ${notice?.ok === false ? "text-destructive" : "text-muted-foreground"}`}
        >
          {notice?.text ?? "Баарыг чирж хугацааг шилжүүлнэ, дарж нээнэ."}
        </span>
      </div>
      <div ref={host} className="gantt-host overflow-hidden border" />
    </div>
  );
}
