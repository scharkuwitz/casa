// frappe-gantt ships no types; this covers only the surface used in components/gantt-view.tsx.
declare module "frappe-gantt" {
  export interface GanttTask {
    id: string;
    name: string;
    start: string;
    end: string;
    progress?: number;
    custom_class?: string;
    [extra: string]: unknown;
  }
  export interface GanttOptions {
    view_mode?: string;
    readonly_progress?: boolean;
    today_button?: boolean;
    language?: string;
    bar_corner_radius?: number;
    scroll_to?: "start" | "end" | "today" | string;
    popup_on?: "click" | "hover";
    popup?: (ctx: { task: GanttTask; chart: Gantt }) => string | false | void;
    on_click?: (task: GanttTask) => void;
    on_date_change?: (task: GanttTask, start: Date, end: Date) => void;
  }
  export default class Gantt {
    constructor(
      element: HTMLElement | string,
      tasks: GanttTask[],
      options?: GanttOptions,
    );
    change_view_mode(mode?: string, maintainPos?: boolean): void;
    refresh(tasks: GanttTask[]): void;
  }
}
