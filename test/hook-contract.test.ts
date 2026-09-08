import { describe, expect, it } from "vitest";

// Frontend tag shipped with Home Assistant 2026.9.1; every patched private hook must still exist there.
export const FRONTEND_TAG = "20260826.6";

const BASE = `https://raw.githubusercontent.com/home-assistant/frontend/${FRONTEND_TAG}/`;

const HOOKS: Array<{ file: string; needles: string[]; patch: string }> = [
  {
    file: "src/panels/lovelace/cards/hui-card.ts",
    needles: ["private _loadElement("],
    patch: "src/patch/hui-card.ts",
  },
  {
    file: "src/panels/lovelace/badges/hui-badge.ts",
    needles: ["_updateElement("],
    patch: "src/patch/hui-badge.ts",
  },
  {
    file: "src/panels/lovelace/cards/hui-entities-card.ts",
    needles: ["private _renderEntity("],
    patch: "src/patch/hui-entities-card.ts",
  },
  {
    file: "src/panels/lovelace/editor/hui-element-editor.ts",
    needles: ["private _handleUIConfigChanged(", "getConfigElement("],
    patch: "src/patch/hui-card-element-editor.ts",
  },
  {
    file: "src/panels/lovelace/editor/card-editor/hui-dialog-edit-card.ts",
    needles: ['<ha-button\n                    slot="secondaryAction"'],
    patch: "src/patch/hui-card-element-editor.ts",
  },
  {
    file: "src/dialogs/more-info/ha-more-info-dialog.ts",
    needles: ["<ha-adaptive-dialog"],
    patch: "src/patch/ha-more-info-dialog.ts",
  },
  {
    file: "src/panels/config/tools/ha-panel-tools.ts",
    needles: ['@customElement("ha-panel-tools")'],
    patch: "src/patch/ha-panel-tools.ts",
  },
  {
    file: "src/panels/lovelace/sections/hui-section.ts",
    needles: ["private _createCards("],
    patch: "src/patch/hui-section.ts",
  },
  {
    file: "src/panels/lovelace/cards/hui-glance-card.ts",
    needles: [".config=${entityConf}"],
    patch: "src/patch/hui-glance-card.ts",
  },
];

const offline = process.env.CARD_MOD_OFFLINE === "1";

async function reachable(): Promise<boolean> {
  if (offline) return false;
  try {
    const res = await fetch(BASE + "package.json", { method: "HEAD" });
    return res.ok;
  } catch {
    return false;
  }
}

describe(`hook contract against frontend ${FRONTEND_TAG}`, async () => {
  const online = await reachable();

  it.skipIf(!online).each(HOOKS)(
    "$patch still finds its hooks in $file",
    async ({ file, needles }) => {
      const res = await fetch(BASE + file);
      expect(res.ok, `${file} fetch status ${res.status}`).toBe(true);
      const text = await res.text();
      for (const needle of needles) {
        expect(text, `${file} lost ${JSON.stringify(needle)}`).toContain(
          needle,
        );
      }
    },
  );

  it.runIf(!online)("is skipped when the frontend tag is unreachable", () => {
    expect(online).toBe(false);
  });
});
