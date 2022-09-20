import type TableGeneratorPlugin from "./tableGeneratorIndex";
import type { App, Editor, MarkdownView, Menu } from "obsidian";

export interface Coords {
    top: number;
    left: number;
    bottom: number;
}

export const tableGeneratorMenu = ( editor: Editor, tableGeneratorBoard: HTMLElement) => {
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

    tableGeneratorBoard.style.left = `${ coords.left }px`;
    tableGeneratorBoard.style.top = `${ coords.top + 15 }px`;
    tableGeneratorBoard.style.display = 'unset';
}
