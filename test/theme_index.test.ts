import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

async function load() {
  vi.resetModules();
  return import("../src/helpers/theme_index");
}

function setThemes(themes: Record<string, any> | undefined) {
  document.querySelector("home-assistant")?.remove();
  if (themes === undefined) return;
  const el: any = document.createElement("home-assistant");
  el.hass = { themes: { themes } };
  document.body.appendChild(el);
}

describe("theme_may_style", () => {
  beforeEach(() => setThemes(undefined));
  afterEach(() => setThemes(undefined));

  it("assumes a theme may style anything until hass is reachable", async () => {
    const { theme_may_style } = await load();
    expect(theme_may_style("card")).toBe(true);
  });

  it("answers per type from the keys of every theme", async () => {
    setThemes({
      a: { "card-mod-card": "x" },
      b: { "card-mod-row-yaml": ".: y" },
    });
    const { theme_may_style } = await load();
    expect(theme_may_style("card")).toBe(true);
    expect(theme_may_style("row")).toBe(true);
    expect(theme_may_style("badge")).toBe(false);
    expect(theme_may_style("more-info")).toBe(false);
  });

  it("lets a debug key through so debug output still appears", async () => {
    setThemes({ a: { "card-mod-badge-debug": "true" } });
    const { theme_may_style } = await load();
    expect(theme_may_style("badge")).toBe(true);
  });

  it("follows the developer-tools alias for the tools type", async () => {
    setThemes({ a: { "card-mod-developer-tools-yaml": ".: z" } });
    const { theme_may_style } = await load();
    expect(theme_may_style("tools")).toBe(true);
  });

  it("covers a theme reached through card-mod-theme because every theme is indexed", async () => {
    setThemes({
      active: { "card-mod-theme": "shared" },
      shared: { "card-mod-view": "v" },
    });
    const { theme_may_style } = await load();
    expect(theme_may_style("view")).toBe(true);
  });

  it("refreshes on cm_update", async () => {
    setThemes({ a: {} });
    const { theme_may_style } = await load();
    expect(theme_may_style("card")).toBe(false);
    setThemes({ a: { "card-mod-card": "x" } });
    document.dispatchEvent(new Event("cm_update"));
    expect(theme_may_style("card")).toBe(true);
  });
});
