import { expect, it } from "vitest";
import { STATUS_PROGRESS } from "@/lib/todo-ui";
import { TODO_STATUSES } from "@/lib/validation";

it("maps status to Gantt progress", () => {
  expect(STATUS_PROGRESS).toEqual({
    TODO: 0,
    IN_PROGRESS: 50,
    DONE: 100,
    CANCELLED: 0,
  });
});

it("covers every status", () => {
  expect(Object.keys(STATUS_PROGRESS).sort()).toEqual(
    [...TODO_STATUSES].sort(),
  );
});
