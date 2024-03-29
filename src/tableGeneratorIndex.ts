import {
    App,
    Editor,
    MarkdownView,
    Menu,
    MenuItem,
    Plugin,
    PluginSettingTab,
    requireApiVersion,
    Setting
} from 'obsidian';
import TableGenerator from "./ui/TableGenerator.svelte";
import "./css/tableGeneratorDefault.css";
import { calculateEditor, reverseCalculation } from "./utils/tablePOS";
import { around } from "monkey-around";
import CardGenerator from "./ui/CardGenerator.svelte";
import { handleHideTableGeneratorMenu, setTableGeneratorMenuPosition } from "./utils/tableDOM";

interface TableGeneratorPluginSettings {
    rowCount: number;
    columnCount: number;
    defaultAlignment: AlignMode;
    defaultCardWidth: number;
    defaultCardHeight: number;
}



const DEFAULT_SETTINGS: TableGeneratorPluginSettings = {
    rowCount: 8,
    columnCount: 8,
    defaultAlignment: "left",
    defaultCardWidth: 160,
    defaultCardHeight: 160,
}

export default class TableGeneratorPlugin extends Plugin {
    tableGeneratorEl: HTMLElement | null = null;
    tableGeneratorComponent: TableGenerator;
    settings: TableGeneratorPluginSettings;

    async onload() {
        this.registerEvent(
            this.app.workspace.on("editor-menu", (menu: Menu, editor: Editor, view: MarkdownView) => this.handleCreateTableGeneratorInMenu(menu, editor, view))
        );

        await this.registerSettings();
        this.registerDomEvent(window, 'click', (evt: MouseEvent) => handleHideTableGeneratorMenu(evt, this.tableGeneratorEl));
        // Handle same mouseevent in multi windows when used in newer version like 0.15.0
        if (requireApiVersion("0.15.0")) this.registerTableGeneratorMenu();

        this.registerCommands();
        this.registerCanvasMenu();
    }

    hideTable() {
        this.tableGeneratorEl?.detach();
    }

    handleCreateTableGeneratorInMenu(menu: Menu, editor: Editor, view: MarkdownView) {
        menu.addItem((item) => {
            const itemDom = (item as any).dom as HTMLElement;
            itemDom.addClass("table-generator-menu");
            item
                .setTitle("Add Markdown Table")
                .setIcon("table")
                .setSection("action")
                .onClick(async () => {
                    this.createGeneratorMenu("table", { editor: editor }, this);
                    const coords = calculateEditor(editor, this.tableGeneratorEl);
                    if(!coords) return;
                    setTableGeneratorMenuPosition(this.tableGeneratorEl, coords, "editor");
                });
        });
    }

    createGeneratorMenu(
        type: "table" | "card",
        context: { editor?: Editor, canvas?: any, coords?: { x: number, y: number } },
        plugin: TableGeneratorPlugin
    ) {
        // Check if this tableGeneratorEl is already created, if so delete it;
        // Used for Multi popout windows.
        if (this.tableGeneratorEl) this.tableGeneratorEl.detach();

        this.tableGeneratorEl = (requireApiVersion("0.15.0") ? activeDocument : document)?.body.createEl("div", { cls: "table-generator-view" });
        this.tableGeneratorEl.hide();

        if (type === "table") {
            this.tableGeneratorComponent = new TableGenerator({
                target: this.tableGeneratorEl,
                props: { editor: context.editor, plugin: plugin }
            });
        } else if (type === "card") {
            this.tableGeneratorComponent = new CardGenerator({
                target: this.tableGeneratorEl,
                props: { canvas: context.canvas, coords: context.coords, plugin: plugin }
            });
        }
    }



    async registerSettings() {
        await this.loadSettings();
        this.addSettingTab(new TableGeneratorSettingTab(this.app, this));
        this.registerInterval(window.setTimeout(() => {
                this.saveSettings();
            }, 100)
        );
    }

    registerCanvasMenu() {
        const createCardTable = (canvas: any, e: Menu, t: {
            x: number;
            y: number;
        }, a: any) => {
            const { top, left } = e.dom.getBoundingClientRect();
            const data = reverseCalculation(t, canvas);
            console.log(data);
            setTimeout(()=>{
                this.createGeneratorMenu("card", { canvas: canvas, coords: t }, this);
                setTableGeneratorMenuPosition(this.tableGeneratorEl, { top: top , left: left, bottom: 0, height: 0 }, "canvas");
            }, 0);
        }

        const patchNode = () => {
            const canvasView = this.app.workspace.getLeavesOfType("canvas").first()?.view;
            // @ts-ignore
            const canvas = canvasView?.canvas;
            if(!canvas) return false;

            const uninstaller = around(canvas.constructor.prototype, {
                showCreationMenu: (next: any) =>
                    function (e: Menu, t:any, a:any) {
                        const result = next.call(this, e, t, a);
                        e.addSeparator().addItem((item: MenuItem) => {
                            item.setSection("create")
                                .setTitle("Add Card Table")
                                .setIcon("table")
                                .onClick(async () => {
                                    createCardTable(this, e, t, a);
                                });
                        });
                        return result;

                    },
            });
            this.register(uninstaller);

            console.log("Obsidian-Canvas-MindMap: canvas node patched");
            return true;
        }

        this.app.workspace.onLayoutReady(() => {
            if (!patchNode()) {
                const evt = this.app.workspace.on("layout-change", () => {
                    patchNode() && this.app.workspace.offref(evt);
                });
                this.registerEvent(evt);
            }
        });
    }

    registerCommands() {
        this.addCommand({
            id: 'create-table-genertator',
            name: 'Create Table Generator',
            editorCallback: (editor: Editor, view: MarkdownView) => {
                if ((requireApiVersion("0.15.0") ? activeDocument : document)?.body.contains(this.tableGeneratorEl)) return;

                this.createGeneratorMenu("table", { editor: editor }, this);
                const coords = calculateEditor(editor, this.tableGeneratorEl);
                if(!coords) return;
                setTableGeneratorMenuPosition(this.tableGeneratorEl, coords, "editor");
            }
        });
    }

    registerTableGeneratorMenu() {
        this.app.workspace.on('window-open', (leaf) => {
            this.registerDomEvent(leaf.doc, 'click', (evt: MouseEvent) => {
                const target = evt.target as HTMLElement;

                if (!this.tableGeneratorEl || !target) return;
                if (target.classList.contains("table-generator-menu") || target.parentElement?.classList.contains("table-generator-menu") || target.tagName == "BUTTON") return;
                if (this.tableGeneratorEl?.contains(target)) return;
                if (!activeDocument.body.contains(this.tableGeneratorEl)) return;

                this.tableGeneratorEl.detach();
            });
        });
    }

    onunload() {
        if (this.tableGeneratorEl) {
            this.tableGeneratorComponent.$destroy();
            this.tableGeneratorEl.detach();
        }
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }
}

class TableGeneratorSettingTab extends PluginSettingTab {
    plugin: TableGeneratorPlugin;

    constructor(app: App, plugin: TableGeneratorPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;

        containerEl.empty();

        containerEl.createEl('h2', { text: 'Table Generator' });

        let rowText: HTMLDivElement;
        new Setting(containerEl)
            .setName('Row Count')
            .setDesc('The number of rows in the table')
            .addSlider((slider) =>
                slider
                    .setLimits(2, 12, 1)
                    .setValue(this.plugin.settings.rowCount)
                    .onChange(async (value) => {
                        rowText.innerText = ` ${ value.toString() }`;
                        this.plugin.settings.rowCount = value;
                    }),
            )
            .settingEl.createDiv("", (el) => {
            rowText = el;
            el.className = "table-generator-setting-text";
            el.innerText = ` ${ this.plugin.settings.rowCount.toString() }`;
        });

        let columnText: HTMLDivElement;
        new Setting(containerEl)
            .setName('Columns Count')
            .setDesc('The number of columns in the table')
            .addSlider((slider) =>
                slider
                    .setLimits(2, 12, 1)
                    .setValue(this.plugin.settings.columnCount)
                    .onChange(async (value) => {
                        columnText.innerText = ` ${ value.toString() }`;
                        this.plugin.settings.columnCount = value;
                    }),
            )
            .settingEl.createDiv("", (el) => {
            columnText = el;
            el.className = "table-generator-setting-text";
            el.innerText = ` ${ this.plugin.settings.columnCount.toString() }`;
        });

        this.containerEl.createEl('h2', { text: 'Say Thank You' });

        new Setting(containerEl)
            .setName('Donate')
            .setDesc('If you like this plugin, consider donating to support continued development:')
            .addButton((bt) => {
                bt.buttonEl.outerHTML = `<a href="https://www.buymeacoffee.com/boninall"><img src="https://img.buymeacoffee.com/button-api/?text=Buy me a coffee&emoji=&slug=boninall&button_colour=6495ED&font_colour=ffffff&font_family=Inter&outline_colour=000000&coffee_colour=FFDD00"></a>`;
            });
    }
}
