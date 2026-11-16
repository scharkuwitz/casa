import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  attachmentPath,
  contentDisposition,
  displayFileName,
  safeMimeType,
  todoUploadDir,
  uploadRoot,
} from "@/lib/storage";

const UUID = "123e4567-e89b-42d3-a456-426614174000";

describe("attachmentPath", () => {
  it("builds <root>/<todoId>/<stored name> inside the upload root", () => {
    const p = attachmentPath("todo1", `${UUID}.pdf`);
    expect(p).toBe(path.join(uploadRoot(), "todo1", `${UUID}.pdf`));
  });

  it("accepts a name without an extension", () => {
    expect(() => attachmentPath("todo1", UUID)).not.toThrow();
  });

  it.each([
    "../secret",
    `../${UUID}`,
    `${UUID}/../x`,
    "report.pdf",
    `${UUID}.PDF`,
    `${UUID}.`,
    "",
  ])("rejects stored name %j", (name) => {
    expect(() => attachmentPath("todo1", name)).toThrow();
  });

  it.each(["../x", "a/b", ""])("rejects todo id %j", (id) => {
    expect(() => attachmentPath(id, UUID)).toThrow();
    expect(() => todoUploadDir(id)).toThrow();
  });
});

describe("displayFileName", () => {
  it("strips directories (both separators)", () => {
    expect(displayFileName("../../etc/passwd")).toBe("passwd");
    expect(displayFileName("C:\\Users\\me\\a.txt")).toBe("a.txt");
  });
  it("strips control characters and trims", () => {
    expect(displayFileName("  a\u0000b\n.txt ")).toBe("ab.txt");
  });
  it("falls back to 'file' and bounds the length", () => {
    expect(displayFileName("")).toBe("file");
    expect(displayFileName("dir/")).toBe("file");
    expect(displayFileName("x".repeat(500))).toHaveLength(200);
  });
});

describe("safeMimeType", () => {
  it("echoes well-formed types", () => {
    expect(safeMimeType("image/png")).toBe("image/png");
    expect(safeMimeType("application/vnd.api+json")).toBe(
      "application/vnd.api+json",
    );
  });
  it.each(["", "text", "text/html; charset=utf-8", "a/b\r\nX: 1", "/x"])(
    "downgrades %j to octet-stream",
    (t) => {
      expect(safeMimeType(t)).toBe("application/octet-stream");
    },
  );
});

describe("contentDisposition", () => {
  it("is always an attachment with an ASCII fallback and UTF-8 name", () => {
    const h = contentDisposition('é"\\%.txt');
    expect(h.startsWith("attachment;")).toBe(true);
    expect(h).toContain('filename="_'); // é replaced
    expect(h).not.toMatch(/filename="[^"]*["\\%][^"]*";/);
    expect(h).toContain("filename*=UTF-8''%C3%A9%22%5C%25.txt");
  });
  it("cannot inject headers", () => {
    expect(contentDisposition("a\r\nSet-Cookie: x").includes("\n")).toBe(false);
  });
});
