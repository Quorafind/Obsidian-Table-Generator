import { requireApiVersion } from "obsidian";

export const hideTable = (defaultWindow?: boolean) => {
    if (requireApiVersion("0.15.0") && !defaultWindow) {
        if (activeDocument.body.contains(activeDocument.getElementsByClassName("table-generator-view")[0])) activeDocument.body.removeChild(activeDocument.getElementsByClassName("table-generator-view")[0]);
    } else {
        if (document.body.contains(document.getElementsByClassName("table-generator-view")[0])) document.body.removeChild(document.getElementsByClassName("table-generator-view")[0]);
    }
}

