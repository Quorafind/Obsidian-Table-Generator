export function setTableGeneratorMenuPosition(tableGeneratorBoard: HTMLElement | null, coords: Coords, displayMode: "canvas" | "editor") {
    if(!tableGeneratorBoard) return;

    setTimeout(()=>{
        tableGeneratorBoard.style.display = 'block';
        switch (displayMode) {
            case "canvas":
                tableGeneratorBoard.style.top = `${coords.top}px`;
                tableGeneratorBoard.style.left = `${coords.left}px`;
                break;
            case "editor":
                tableGeneratorBoard.style.transform = `translate(${coords.left}px,-${coords.top}px`;
                break;
        }
    })
}

export function handleHideTableGeneratorMenu(evt: MouseEvent, tableGeneratorEl: HTMLElement | null) {
    const target = evt.target as HTMLElement;

    if (!tableGeneratorEl || !target) return;
    if (target.classList.contains("table-generator-menu") ||
        target.parentElement?.classList.contains("table-generator-menu") ||
        target.tagName == "BUTTON") return;
    if (tableGeneratorEl?.contains(target)) return;
    if (!document.body.contains(tableGeneratorEl)) return;

    tableGeneratorEl.detach();
}
