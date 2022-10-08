import { App, Editor, MarkdownView, Menu, Plugin, PluginSettingTab, requireApiVersion, Setting } from 'obsidian';
import TableGenerator from "./ui/TableGenerator.svelte";
import "./css/tableGeneratorDefault.css";

interface TableGeneratorPluginSettings {
    rowCount: number;
    columnCount: number;
}

interface Coords {
    top: number;
    left: number;
    bottom: number;
    height: number;
}

const DEFAULT_SETTINGS: TableGeneratorPluginSettings = {
    rowCount: 8,
    columnCount: 8
}

export default class TableGeneratorPlugin extends Plugin {
    tableGeneratorEl: HTMLElement | null = null;
    tableGeneratorComponent: TableGenerator;
    settings: TableGeneratorPluginSettings;

    async onload() {
        this.registerEvent(
            this.app.workspace.on("editor-menu", (menu: Menu, editor: Editor, view: MarkdownView) => this.handleCreateTableGeneratorInMenu(menu, editor, view))
        );

        // Register Settings Stuff
        await this.registerSettings();

        // Check click and cancel the menu if the click is outside the menu
        this.registerDomEvent(window, 'click', (evt: MouseEvent) => this.handleHideTableGeneratorMenu(evt));
        // Handle same mouseevent in multi windows when used in newer version like 0.15.0
        if (requireApiVersion("0.15.0")) this.registerTableGeneratorMenu();

        this.addCommand({
            id: 'create-table-genertator',
            name: 'Create Table Generator',
            editorCallback: (editor: Editor, view: MarkdownView) => {
                if ((requireApiVersion("0.15.0") ? activeDocument : document)?.body.contains(this.tableGeneratorEl)) return;

                this.createTableGeneratorMenu(editor, this);
                this.showTableGeneratorView(editor, this.tableGeneratorEl);
            }

        });
    }

    hideTable() {
        this.tableGeneratorEl?.detach();
    }

    handleHideTableGeneratorMenu(evt: MouseEvent) {
        const target = evt.target as HTMLElement;

        if (!this.tableGeneratorEl || !target) return;
        if (target.classList.contains("table-generator-menu") ||
            target.parentElement?.classList.contains("table-generator-menu") ||
            target.tagName == "BUTTON") return;
        if (this.tableGeneratorEl?.contains(target)) return;
        if (!document.body.contains(this.tableGeneratorEl)) return;

        this.tableGeneratorEl.detach();
    }

    handleCreateTableGeneratorInMenu(menu: Menu, editor: Editor, view: MarkdownView) {
        menu.addItem((item) => {
            const itemDom = (item as any).dom as HTMLElement;
            itemDom.addClass("table-generator-menu");
            item
                .setTitle("Table Generator")
                .setIcon("table")
                .onClick(async () => {
                    this.createTableGeneratorMenu(editor, this);
                    this.showTableGeneratorView(editor, this.tableGeneratorEl);
                });
        });
    }

    createTableGeneratorMenu(editor: Editor, plugin: TableGeneratorPlugin) {
        // Check if this tableGeneratorEl is already created, if so delete it;
        // Used for Multi popout windows.
        if (this.tableGeneratorEl && !activeDocument.body.contains(this.tableGeneratorEl)) this.tableGeneratorEl.detach();

        this.tableGeneratorEl = (requireApiVersion("0.15.0") ? activeDocument : document)?.body.createEl("div", { cls: "table-generator-view" });

        this.tableGeneratorEl.hide();

        this.tableGeneratorComponent = new TableGenerator({
            target: this.tableGeneratorEl,
            props: { editor: editor, plugin: plugin }
        });
    }

    showTableGeneratorView(editor: Editor, tableGeneratorBoard: HTMLElement | null) {
        if (!tableGeneratorBoard) return;

        const cursor = editor.getCursor('from');
        let coords: Coords;

        // Get the cursor position using the appropriate CM5 or CM6 interface
        if ((editor as any).cursorCoords) {
            coords = (editor as any).cursorCoords(true, 'window');
        } else if ((editor as any).coordsAtPos) {
            const offset = editor.posToOffset(cursor);
            coords = (editor as any).cm.coordsAtPos?.(offset) ?? (editor as any).coordsAtPos(offset);
        } else {
            return;
        }

        const calculateTop = (requireApiVersion("0.15.0") ?
            activeDocument : document)?.body.getBoundingClientRect().height - coords.top - coords.height;
        tableGeneratorBoard.style.transform = "translate(" + (coords.left) + "px, " + "-" + (calculateTop) + "px" + ")";
        tableGeneratorBoard.style.display = 'unset';
    }

    async registerSettings() {
        await this.loadSettings();
        this.addSettingTab(new TableGeneratorSettingTab(this.app, this));
        this.registerInterval(window.setTimeout(() => {
                this.saveSettings();
            }, 100)
        );
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
