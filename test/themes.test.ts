import { describe, expect, it } from "vitest";
import {
  resolve_theme_name,
  theme_key_names,
  theme_styles_for_type,
} from "../src/helpers/themes";

describe("theme key aliases", () => {
  it("lists the tools keys and the developer-tools alias", () => {
    expect(theme_key_names("tools")).toEqual(["tools", "developer-tools"]);
    expect(theme_key_names("card")).toEqual(["card"]);
  });

  it("prefers the current key and falls back to the alias", () => {
    expect(theme_styles_for_type({ "card-mod-tools": "a" }, "tools")).toEqual({
      ".": "a",
    });
    expect(
      theme_styles_for_type({ "card-mod-developer-tools": "b" }, "tools"),
    ).toEqual({ ".": "b" });
    expect(
      theme_styles_for_type(
        { "card-mod-developer-tools-yaml": ".: c\n", "card-mod-tools": "d" },
        "tools",
      ),
    ).toEqual({ ".": "c" });
    expect(theme_styles_for_type({ "card-mod-card": "x" }, "tools")).toEqual(
      {},
    );
    expect(theme_styles_for_type(undefined, "tools")).toEqual({});
  });
});

describe("card-mod-theme indirection", () => {
  const themes = {
    active: { "card-mod-theme": "shared" },
    dangling: { "card-mod-theme": "missing" },
    shared: { "card-mod-card": "x" },
  };
  it("resolves to the named theme when it exists", () => {
    expect(resolve_theme_name(themes, "active")).toBe("shared");
  });
  it("keeps the current theme when the target is missing or absent", () => {
    expect(resolve_theme_name(themes, "dangling")).toBe("dangling");
    expect(resolve_theme_name(themes, "shared")).toBe("shared");
    expect(resolve_theme_name(themes, "nope")).toBe("nope");
  });
});
