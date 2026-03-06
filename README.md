# Scabard-Style Worldbuilder (Foundry VTT Module)

This repository contains a Foundry VTT module that adds a lightweight worldbuilding workspace inspired by Scabard.com.

## Features

- World-level worldbuilding records for:
  - Locations
  - Characters
  - Factions
  - Plots
- Quick-open button in the Journal sidebar.
- Config menu entry in Module Settings.
- Structured entry fields with built-in hints.
- Actor/Journal linking so you can reuse data instead of repeating it.
- Character connection engine:
  - Direct relationships via `relationship: target` lines.
  - Parent fields (`Mother` / `Father`) that automatically create reverse `Child` links.
  - Inferred sibling logic:
    - Shared mother/father implies `Sibling`.
    - Shared mother with different known fathers implies `Half-Sibling`.

## Install/Update via Manifest URL (Foundry standard)

Foundry needs a **raw JSON** URL for module installation.

- ❌ Wrong (GitHub HTML page):
  - `https://github.com/sefaction/Foundry-worldbuilder/blob/main/module.json`
- ✅ Correct (raw JSON):
  - `https://raw.githubusercontent.com/sefaction/Foundry-worldbuilder/main/module.json`

If you use the `blob/...` URL, Foundry receives HTML (`<!DOCTYPE ...>`) instead of JSON and throws a parse error.

Current module metadata:

- `url`: `https://github.com/sefaction/Foundry-worldbuilder`
- `manifest`: `https://raw.githubusercontent.com/sefaction/Foundry-worldbuilder/main/module.json`
- `download`: `https://github.com/sefaction/Foundry-worldbuilder/archive/refs/heads/main.zip`

## Using linked Actors/Journals (recommended)

Each record now has:

- **Linked Actor** selector
- **Linked Journal Entry** selector
- **Import from Linked Docs** button

Clicking import will:

1. Pull summary-style text from the linked Actor or Journal into **Summary**.
2. Add UUID links for linked docs into **Links**.
3. Fill **Name** if empty.

This lets you keep canonical information on Actor sheets / Journal pages and avoid entering the same text twice.

## Development

No build step is required.

1. Symlink this folder into your Foundry `Data/modules/` directory as `scabard-worldbuilder`.
2. Enable the module in a world.
3. Open the module from any of these UI entry points:
   - **Journal sidebar** footer button: **Worldbuilder**
   - **Game Settings** tab button: **Worldbuilder**
   - **Scene Controls → Notes** tool: **Open Worldbuilder**
   - **Keyboard shortcut**: `Ctrl+Shift+W` (GM only)

If you still cannot find the UI launcher, run this macro command as GM:

`game.modules.get("scabard-worldbuilder")?.api?.openWorldbuilder("characters");`

## Next ideas

- Relationship graph between entities.
- Direct links to Journal Entries and Actors.
- Timeline view for plot threads.
- Export/import JSON for campaign sharing.
