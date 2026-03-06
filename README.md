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
- Structured entry fields:
  - Name
  - Summary
  - Tags
  - Links (journal links, UUIDs, or URLs)
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

If you use the `blob/...` URL, Foundry receives HTML (`<!DOCTYPE ...>`) instead of JSON and throws the parsing error you saw.

Current module metadata:

- `url`: `https://github.com/sefaction/Foundry-worldbuilder`
- `manifest`: `https://raw.githubusercontent.com/sefaction/Foundry-worldbuilder/main/module.json`
- `download`: `https://github.com/sefaction/Foundry-worldbuilder/archive/refs/heads/main.zip`

## Development

No build step is required.

1. Symlink this folder into your Foundry `Data/modules/` directory as `scabard-worldbuilder`.
2. Enable the module in a world.
3. Open **Journal** and click **Worldbuilder**.

## Next ideas

- Relationship graph between entities.
- Direct links to Journal Entries and Actors.
- Timeline view for plot threads.
- Export/import JSON for campaign sharing.
