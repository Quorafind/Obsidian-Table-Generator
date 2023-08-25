import type { Editor } from "obsidian";

const alignLineText = (align: AlignMode) => {
    switch (align) {
        case "left":
            return "|:-----";
        case "center":
            return "|:----:";
        case "right":
            return "|-----:";
        default:
            return "";
    }
}

export const generateMarkdownTable = (selectedGrid: number[], align: AlignMode) => {
    let table = "";
    let secondLine = "";
    let normalLine = "";
    const alignText = alignLineText(align);
    if (selectedGrid.length === 0) return table;

    for (let i = 0; i < Number(selectedGrid[1]); i++) {
        secondLine += alignText;
    }
    for (let i = 0; i < Number(selectedGrid[1]); i++) {
        normalLine += "|      ";
    }

    if (!selectedGrid[0]) {
        table = normalLine + "|\n" + secondLine + "|\n";
        return table;
    }
    for (let i = 0; i < Number(selectedGrid[0]) + 1; i++) {
        if (!i) table = table + normalLine + "|\n";
        if (i === 1) table = table + secondLine + "|\n";
        if (i > 1) table = table + normalLine + "|\n";
    }
    return table.trim();
}

export function checkBlankLine(editor: Editor, line: number) {
    const getLine = editor.getLine(line);
    if (getLine.trim().length > 0) return false;
    return true;
}
