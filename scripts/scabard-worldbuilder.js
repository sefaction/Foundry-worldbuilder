const MODULE_ID = "scabard-worldbuilder";
const SETTING_WORLD_DATA = "worldData";

const CATEGORY_CONFIG = {
  locations: { label: "SCABARD-WORLDBUILDER.CategoriesLocations" },
  characters: { label: "SCABARD-WORLDBUILDER.CategoriesCharacters" },
  factions: { label: "SCABARD-WORLDBUILDER.CategoriesFactions" },
  plots: { label: "SCABARD-WORLDBUILDER.CategoriesPlots" }
};

function defaultWorldData() {
  return {
    locations: [],
    characters: [],
    factions: [],
    plots: []
  };
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
    const categories = Object.entries(CATEGORY_CONFIG).map(([key, config]) => ({
      key,
      label: game.i18n.localize(config.label),
      entries: this.worldData[key] || [],
      active: key === this.activeTab
    }));

    return {
      categories,
      activeTab: this.activeTab,
      fieldLabels: {
        name: game.i18n.localize("SCABARD-WORLDBUILDER.FieldsName"),
        summary: game.i18n.localize("SCABARD-WORLDBUILDER.FieldsSummary"),
        tags: game.i18n.localize("SCABARD-WORLDBUILDER.FieldsTags"),
        links: game.i18n.localize("SCABARD-WORLDBUILDER.FieldsLinks")
      },
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

      normalized[key] = rows.map((row) => ({
        name: String(row.name ?? ""),
        summary: String(row.summary ?? ""),
        tags: String(row.tags ?? ""),
        links: String(row.links ?? "")
      }));
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

    this.worldData[type].push({ name: "", summary: "", tags: "", links: "" });
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
  const footer = html.find(".directory-footer");
  if (!footer.length || footer.find(".scabard-worldbuilder-open").length) return;

  const button = $(`
    <button type="button" class="scabard-worldbuilder-open">
      <i class="fas fa-book-atlas"></i> ${game.i18n.localize("SCABARD-WORLDBUILDER.OpenButton")}
    </button>
  `);

  button.on("click", () => {
    new ScabardWorldbuilderApp().render(true);
  });

  footer.append(button);
});
