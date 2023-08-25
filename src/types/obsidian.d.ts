import "obsidian";

declare module "obsidian" {
    interface Menu {
        dom: HTMLElement;
    }

    interface App {
        plugins: any;
    }
}
