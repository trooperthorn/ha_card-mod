import { describe, expect, it, vi } from "vitest";

async function load() {
  vi.resetModules();
  return import("../src/helpers/icon_usage");
}

describe("icon usage tracking", () => {
  it("stays off for styles that never mention the icon variables", async () => {
    const { icon_vars_in_use, note_styles } = await load();
    note_styles({ ".": "ha-card { color: red; }" });
    note_styles(undefined);
    note_styles(null);
    expect(icon_vars_in_use()).toBe(false);
  });

  it("turns on once and dispatches cm_icons_enabled when a style uses --card-mod-icon", async () => {
    const { icon_vars_in_use, note_styles } = await load();
    const seen = vi.fn();
    document.addEventListener("cm_icons_enabled", seen);
    note_styles({ ".": ":host { --card-mod-icon-color: red; }" });
    note_styles({ ".": ":host { --card-mod-icon: mdi:home; }" });
    document.removeEventListener("cm_icons_enabled", seen);
    expect(icon_vars_in_use()).toBe(true);
    expect(seen).toHaveBeenCalledTimes(1);
  });

  it("turns on for a theme key named card-mod-icon*", async () => {
    const { icon_vars_in_use, note_theme_keys } = await load();
    note_theme_keys(["card-mod-card", "card-mod-icon-color"]);
    expect(icon_vars_in_use()).toBe(true);
  });

  it("treats an unserialisable style as using icons", async () => {
    const { icon_vars_in_use, note_styles } = await load();
    const cyc: any = {};
    cyc.self = cyc;
    note_styles(cyc);
    expect(icon_vars_in_use()).toBe(true);
  });
});
