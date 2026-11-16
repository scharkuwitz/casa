import { describe, expect, it } from "vitest";
import {
  dateOnly,
  idSchema,
  parseListQuery,
  todoDatesSchema,
  todoSchema,
} from "@/lib/validation";

const base = {
  title: "  Write tests  ",
  description: "",
  status: "TODO",
  startDate: "2026-11-10",
  endDate: "2026-11-12",
  categoryId: "",
};

describe("todoSchema", () => {
  it("trims the title and accepts a valid todo", () => {
    const r = todoSchema.safeParse(base);
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.title).toBe("Write tests");
  });

  it("rejects an empty title", () => {
    expect(todoSchema.safeParse({ ...base, title: "   " }).success).toBe(false);
  });

  it("rejects an unknown status", () => {
    expect(todoSchema.safeParse({ ...base, status: "NOPE" }).success).toBe(
      false,
    );
  });

  it("rejects endDate before startDate but allows equal dates", () => {
    expect(
      todoSchema.safeParse({ ...base, endDate: "2026-11-09" }).success,
    ).toBe(false);
    expect(
      todoSchema.safeParse({ ...base, endDate: "2026-11-10" }).success,
    ).toBe(true);
  });

  it("rejects malformed dates", () => {
    expect(
      todoSchema.safeParse({ ...base, startDate: "10/11/2026" }).success,
    ).toBe(false);
  });
});

describe("todoDatesSchema", () => {
  it("enforces endDate >= startDate", () => {
    expect(
      todoDatesSchema.safeParse({
        startDate: "2026-11-10",
        endDate: "2026-11-01",
      }).success,
    ).toBe(false);
    expect(
      todoDatesSchema.safeParse({
        startDate: "2026-11-10",
        endDate: "2026-11-11",
      }).success,
    ).toBe(true);
  });
});

describe("idSchema", () => {
  it.each(["abc123", "a_b-c"])("accepts %s", (id) => {
    expect(idSchema.safeParse(id).success).toBe(true);
  });
  it.each(["", "../etc", "a/b", "a b", "x".repeat(65)])("rejects %j", (id) => {
    expect(idSchema.safeParse(id).success).toBe(false);
  });
});

describe("parseListQuery", () => {
  it("returns defaults for empty input", () => {
    expect(parseListQuery({})).toEqual({
      status: undefined,
      category: undefined,
      sort: "start",
      dir: "asc",
      view: "list",
    });
  });

  it("parses valid params", () => {
    expect(
      parseListQuery({
        status: "DONE",
        category: "cat1",
        sort: "title",
        dir: "desc",
        view: "gantt",
      }),
    ).toEqual({
      status: "DONE",
      category: "cat1",
      sort: "title",
      dir: "desc",
      view: "gantt",
    });
  });

  it("falls back on bogus values", () => {
    expect(
      parseListQuery({
        status: "bogus",
        category: "../x",
        sort: "password",
        dir: "up",
        view: "kanban",
      }),
    ).toEqual(parseListQuery({}));
  });

  it("uses the first value of repeated params", () => {
    expect(parseListQuery({ status: ["IN_PROGRESS", "DONE"] }).status).toBe(
      "IN_PROGRESS",
    );
  });
});

describe("dateOnly", () => {
  it.each(["2026-13-45", "2026-02-30", "garbage", ""])(
    "rejects %j without throwing",
    (s) => {
      expect(dateOnly.safeParse(s).success).toBe(false);
    },
  );
  it("parses to UTC midnight", () => {
    const r = dateOnly.parse("2026-11-10");
    expect(r.toISOString()).toBe("2026-11-10T00:00:00.000Z");
  });
});
