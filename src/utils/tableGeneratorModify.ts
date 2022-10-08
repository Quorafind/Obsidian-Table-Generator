export const generateMarkdownTable = (selectedGrid: number[]) => {
    let table = "";
    let secondLine = "";
    let normalLine = "";
    if (selectedGrid.length === 0) return table;

    for (let i = 0; i < Number(selectedGrid[1]); i++) {
        secondLine += "|:-----";
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
    return table;
}
