import type { Editor } from "obsidian";
import { requireApiVersion } from "obsidian";

export function getLineHeight(editor: Editor, pos: number) {
    const lineInfo = (editor as any).cm.state.doc.lineAt(pos);
    const lineDOM = (editor as any).cm.domAtPos(lineInfo.from);
    return (lineDOM.node as HTMLElement).offsetHeight; // 这将返回行的高度
}

export const random = (e: number) => {
    const t = [];
    for (let n = 0; n < e; n++) {
        t.push((16 * Math.random() | 0).toString(16));
    }
    return t.join("")
}

export function reverseCalculation(n: {
    x: number;
    y: number;
}, t: any) {
    const r = t.scale;
    const cx = t.canvasRect.cx;
    const cy = t.canvasRect.cy;
    const x = t.x;
    const y = t.y;

    const eClientX = (n.x - x) * r + cx;
    const eClientY = (n.y - y) * r + cy;

    return {
        clientX: eClientX,
        clientY: eClientY
    };
}

export function calculateEditor(editor: Editor, tableGeneratorBoard: HTMLElement | null) {
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

    const lineHeight = getLineHeight(editor, editor.posToOffset(cursor));

    const calculateTop = (requireApiVersion("0.15.0") ?
        activeDocument : document)?.body.getBoundingClientRect().height - (coords.top || 0) - (coords.height || lineHeight);
    return {
        top: calculateTop || 0,
        left: coords.left || 0,
        bottom: coords.bottom || 0,
        height: coords.height || lineHeight
    }
}
