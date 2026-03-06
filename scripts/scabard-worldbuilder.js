const MODULE_ID = "scabard-worldbuilder";
const SETTING_WORLD_DATA = "worldData";

const CATEGORY_CONFIG = {
  locations: { label: "SCABARD-WORLDBUILDER.CategoriesLocations" },
  characters: { label: "SCABARD-WORLDBUILDER.CategoriesCharacters", supportsConnections: true },
  factions: { label: "SCABARD-WORLDBUILDER.CategoriesFactions" },
  plots: { label: "SCABARD-WORLDBUILDER.CategoriesPlots" }
};

const INVERSE_CONNECTIONS = {
  mother: "child",
  father: "child",
  parent: "child",
  child: "parent",
  spouse: "spouse",
  sibling: "sibling",
  "half-sibling": "half-sibling"
};

function defaultWorldData() {
  return {
    locations: [],
    characters: [],
    factions: [],
    plots: []
  };
}

function normalizeName(name) {
  return String(name ?? "").trim().toLowerCase();
}

function parseConnections(raw) {
  return String(raw ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const separator = line.indexOf(":");
      if (separator < 0) {
        return { type: "related", target: line };
      }

      const type = line.slice(0, separator).trim() || "related";
      const target = line.slice(separator + 1).trim();
      return { type, target };
    })
    .filter((connection) => connection.target.length);
}

function toTitleCase(value) {
  return String(value ?? "")
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

function addConnection(edgeIndex, source, type, target, inferred = true) {
  if (!source || !target) return;

  const key = `${normalizeName(source)}|${normalizeName(type)}|${normalizeName(target)}`;
  if (edgeIndex.has(key)) return;

  edgeIndex.set(key, {
    source,
    type: toTitleCase(type),
    target,
    inferred
  });
}

function buildCharacterConnectionIndex(characters) {
  const byName = new Map();
  const edges = new Map();

  for (const character of characters) {
    const name = String(character.name ?? "").trim();
    if (!name) continue;
    byName.set(normalizeName(name), character);
  }

  for (const character of characters) {
    const source = String(character.name ?? "").trim();
    if (!source) continue;

    const mother = String(character.mother ?? "").trim();
    const father = String(character.father ?? "").trim();

    if (mother) {
      addConnection(edges, source, "mother", mother);
      addConnection(edges, mother, "child", source);
    }

    if (father) {
      addConnection(edges, source, "father", father);
      addConnection(edges, father, "child", source);
    }

    for (const connection of parseConnections(character.connections)) {
      addConnection(edges, source, connection.type, connection.target, false);
      const inverse = INVERSE_CONNECTIONS[normalizeName(connection.type)];
      if (inverse) {
        addConnection(edges, connection.target, inverse, source);
      }
    }
  }

  for (let i = 0; i < characters.length; i += 1) {
    const characterA = characters[i];
    const nameA = String(characterA.name ?? "").trim();
    if (!nameA) continue;

    for (let j = i + 1; j < characters.length; j += 1) {
      const characterB = characters[j];
      const nameB = String(characterB.name ?? "").trim();
      if (!nameB) continue;

      const sameMother =
        characterA.mother && characterB.mother && normalizeName(characterA.mother) === normalizeName(characterB.mother);
      const sameFather =
        characterA.father && characterB.father && normalizeName(characterA.father) === normalizeName(characterB.father);

      if (!sameMother && !sameFather) continue;

      const distinctKnownParents =
        characterA.mother &&
        characterB.mother &&
        characterA.father &&
        characterB.father &&
        normalizeName(characterA.mother) === normalizeName(characterB.mother) &&
        normalizeName(characterA.father) !== normalizeName(characterB.father);

      const relation = distinctKnownParents ? "half-sibling" : "sibling";
      addConnection(edges, nameA, relation, nameB);
      addConnection(edges, nameB, relation, nameA);
    }
  }

  const connectionIndex = {};
  for (const character of characters) {
    const name = String(character.name ?? "").trim();
    if (!name) continue;

    const normalizedName = normalizeName(name);
    connectionIndex[normalizedName] = Array.from(edges.values())
      .filter((edge) => normalizeName(edge.source) === normalizedName)
      .sort((a, b) => a.type.localeCompare(b.type) || a.target.localeCompare(b.target));
  }

  return connectionIndex;
}

class ScabardWorldbuilderApp extends FormApplication {
  constructor(object = {}, options = {}) {
    super(object, options);
    this.activeTab = options.activeTab || "locations";
    this.worldData = foundry.utils.deepClone(game.settings.get(MODULE_ID, SETTING_WORLD_DATA));
  }

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      id: "scabard-worldbuilder-app",
      classes: ["scabard-worldbuilder"],
      template: "modules/scabard-worldbuilder/templates/worldbuilder-app.hbs",
      width: 900,
      height: 700,
      title: game.i18n.localize("SCABARD-WORLDBUILDER.AppTitle"),
      submitOnClose: true,
      closeOnSubmit: false,
      resizable: true
    });
  }

  getData() {
    const characterConnections = buildCharacterConnectionIndex(this.worldData.characters || []);

    const categories = Object.entries(CATEGORY_CONFIG).map(([key, config]) => {
      const entries = (this.worldData[key] || []).map((entry) => {
        if (!config.supportsConnections) return entry;

        const name = String(entry.name ?? "").trim();
        return {
          ...entry,
          inferredConnections: characterConnections[normalizeName(name)] || []
        };
      });

      return {
        key,
        label: game.i18n.localize(config.label),
        entries,
        supportsConnections: Boolean(config.supportsConnections),
        active: key === this.activeTab
      };
    });

    return {
      categories,
      fieldLabels: {
        name: game.i18n.localize("SCABARD-WORLDBUILDER.FieldsName"),
        summary: game.i18n.localize("SCABARD-WORLDBUILDER.FieldsSummary"),
        tags: game.i18n.localize("SCABARD-WORLDBUILDER.FieldsTags"),
        links: game.i18n.localize("SCABARD-WORLDBUILDER.FieldsLinks"),
        mother: game.i18n.localize("SCABARD-WORLDBUILDER.FieldsMother"),
        father: game.i18n.localize("SCABARD-WORLDBUILDER.FieldsFather"),
        connections: game.i18n.localize("SCABARD-WORLDBUILDER.FieldsConnections")
      },
      inferredConnectionsLabel: game.i18n.localize("SCABARD-WORLDBUILDER.InferredConnections"),
      noConnectionsLabel: game.i18n.localize("SCABARD-WORLDBUILDER.NoConnections"),
      connectionFormatHint: game.i18n.localize("SCABARD-WORLDBUILDER.ConnectionFormatHint"),
      addEntryLabel: game.i18n.localize("SCABARD-WORLDBUILDER.AddEntry"),
      saveLabel: game.i18n.localize("SCABARD-WORLDBUILDER.Save")
    };
  }

  activateListeners(html) {
    super.activateListeners(html);

    html.find("[data-action='switch-tab']").on("click", this.#onSwitchTab.bind(this));
    html.find("[data-action='add-entry']").on("click", this.#onAddEntry.bind(this));
    html.find("[data-action='delete-entry']").on("click", this.#onDeleteEntry.bind(this));
  }

  async _updateObject(_event, formData) {
    const expanded = foundry.utils.expandObject(formData);
    const normalized = defaultWorldData();

    for (const key of Object.keys(CATEGORY_CONFIG)) {
      const inputRows = expanded?.[key] ?? {};
      const rows = Object.keys(inputRows)
        .map((index) => Number.parseInt(index, 10))
        .filter((index) => Number.isInteger(index))
        .sort((a, b) => a - b)
        .map((index) => inputRows[index])
        .filter((row) => row && Object.values(row).some((value) => String(value ?? "").trim().length));

      normalized[key] = rows.map((row) => {
        const data = {
          name: String(row.name ?? ""),
          summary: String(row.summary ?? ""),
          tags: String(row.tags ?? ""),
          links: String(row.links ?? "")
        };

        if (key === "characters") {
          data.mother = String(row.mother ?? "");
          data.father = String(row.father ?? "");
          data.connections = String(row.connections ?? "");
        }

        return data;
      });
    }

    this.worldData = normalized;
    await game.settings.set(MODULE_ID, SETTING_WORLD_DATA, normalized);
    ui.notifications.info(game.i18n.localize("SCABARD-WORLDBUILDER.Saved"));
  }

  #onSwitchTab(event) {
    event.preventDefault();
    const tab = event.currentTarget.dataset.tab;
    if (!tab || !CATEGORY_CONFIG[tab]) return;

    this.activeTab = tab;
    this.render();
  }

  #onAddEntry(event) {
    event.preventDefault();
    const type = event.currentTarget.dataset.type;
    if (!type || !CATEGORY_CONFIG[type]) return;

    const baseEntry = { name: "", summary: "", tags: "", links: "" };
    if (type === "characters") {
      baseEntry.mother = "";
      baseEntry.father = "";
      baseEntry.connections = "";
    }

    this.worldData[type].push(baseEntry);
    this.activeTab = type;
    this.render();
  }

  #onDeleteEntry(event) {
    event.preventDefault();
    const type = event.currentTarget.dataset.type;
    const index = Number.parseInt(event.currentTarget.dataset.index, 10);
    if (!type || !CATEGORY_CONFIG[type] || !Number.isInteger(index)) return;

    this.worldData[type].splice(index, 1);
    this.activeTab = type;
    this.render();
  }
}

function openWorldbuilder(activeTab = "characters") {
  new ScabardWorldbuilderApp({}, { activeTab }).render(true);
}

Hooks.once("init", () => {
  game.settings.register(MODULE_ID, SETTING_WORLD_DATA, {
    name: "SCABARD-WORLDBUILDER.SettingsDataName",
    hint: "SCABARD-WORLDBUILDER.SettingsDataHint",
    scope: "world",
    config: false,
    type: Object,
    default: defaultWorldData()
  });

  game.settings.registerMenu(MODULE_ID, "openWorldbuilder", {
    name: "SCABARD-WORLDBUILDER.SettingsMenuName",
    label: "SCABARD-WORLDBUILDER.SettingsMenuLabel",
    hint: "SCABARD-WORLDBUILDER.SettingsMenuHint",
    icon: "fas fa-book-atlas",
    type: ScabardWorldbuilderApp,
    restricted: true
  });
});

Hooks.on("renderJournalDirectory", (_app, html) => {
  const footer = html.find(".directory-footer, .directory-footer.action-buttons").first();
  if (!footer.length || footer.find(".scabard-worldbuilder-open").length) return;

  const button = $(`
    <button type="button" class="scabard-worldbuilder-open">
      <i class="fas fa-book-atlas"></i> ${game.i18n.localize("SCABARD-WORLDBUILDER.OpenButton")}
    </button>
  `);

  button.on("click", () => openWorldbuilder("characters"));

  footer.append(button);
});

Hooks.on("renderSettings", (_app, html) => {
  const settingsSection = html.find("#settings-game, .settings-sidebar, .settings-list").first();
  if (!settingsSection.length || html.find(".scabard-worldbuilder-settings-open").length) return;

  const button = $(`
    <button type="button" class="scabard-worldbuilder-settings-open">
      <i class="fas fa-book-atlas"></i> ${game.i18n.localize("SCABARD-WORLDBUILDER.OpenButton")}
    </button>
  `);

  button.on("click", () => openWorldbuilder("characters"));
  settingsSection.append(button);
});

Hooks.on("getSceneControlButtons", (controls) => {
  const notesControl = controls.find((control) => control.name === "notes");
  if (!notesControl) return;

  notesControl.tools ??= [];
  if (notesControl.tools.some((tool) => tool.name === "open-worldbuilder")) return;

  notesControl.tools.push({
    name: "open-worldbuilder",
    title: "SCABARD-WORLDBUILDER.SceneControlOpen",
    icon: "fas fa-book-atlas",
    button: true,
    visible: game.user?.isGM ?? false,
    onClick: () => openWorldbuilder("characters")
  });
});
