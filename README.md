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

Foundry supports automatic module install/update when your `module.json` includes valid `manifest` and `download` URLs.

This repo is configured with the **expected GitHub-hosted pattern**:

- `url`: `https://github.com/your-github-user/scabard-worldbuilder`
- `manifest`: `https://raw.githubusercontent.com/your-github-user/scabard-worldbuilder/main/module.json`
- `download`: `https://github.com/your-github-user/scabard-worldbuilder/releases/download/v0.2.1/scabard-worldbuilder.zip`

Before publishing, replace `your-github-user` with your actual GitHub account/org and publish a matching release zip for each version.

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
