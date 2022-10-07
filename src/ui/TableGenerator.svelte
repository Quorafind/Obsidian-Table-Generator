<script lang="ts">
    import Table from "./Table.svelte";
    import { Editor, Notice } from "obsidian";
    import { generateMarkdownTable } from "../utils/tableGeneratorModify";
    import type TableGeneratorPlugin from "../tableGeneratorIndex";

    export let editor: Editor;
    export let plugin: TableGeneratorPlugin;
    let hoverTableEnd: number[];
    let gridRow: number;
    let gridCol: number;

    $: if (hoverTableEnd) {
        // Generate Markdown Table Content
        setRowAndCol(hoverTableEnd);
    }

    let settings = {
        rowNum: plugin?.settings.rowCount ?? 8,
        colNum: plugin?.settings.columnCount ?? 8,
    }

    function setRowAndCol(end: number[]) {
        if (end.length === 0) {
            gridRow = 0;
            gridCol = 0;
            return;
        }
        if (!(hoverTableEnd[0] === 0 && hoverTableEnd[1] === 0)) {
            gridRow = hoverTableEnd[0];
            gridCol = hoverTableEnd[1];
        }
    }

    function insertTable(selectedGrid: number[]) {
        if (selectedGrid.length === 0 || selectedGrid[1] < 2) return;
        const markdownTable = generateMarkdownTable(selectedGrid);
        const cursor = editor.getCursor('from');
        const line = editor.getLine(cursor.line);
        if (line.length > 0) {
            editor.replaceRange(markdownTable, { line: cursor.line + 1, ch: 0 }, {
                line: cursor.line + 1,
                ch: markdownTable.length
            });
        } else {
            editor.replaceRange(markdownTable, { line: cursor.line, ch: 0 }, { line: cursor.line, ch: 0 });
        }
    }

</script>

<div class="table-generator">
    <div class="H1">Table Generator</div>
    <Table {...settings} {insertTable} {plugin}
           bind:hoverTableEnd={hoverTableEnd}/>
    <div class="input-table-generator">
        <div class="input-table-generator-row">
            ROW:
            <input class="row-input" bind:value={gridRow}>
        </div>
        <div class="input-table-generator-col">
            COL:
            <input class="col-input" bind:value={gridCol}>
        </div>
    </div>
    <button on:click={() => {
            if(/^\d+$/.test(gridRow.toString()) && /^\d+$/.test(gridCol.toString())) {
                console.log(gridRow, gridCol);
                insertTable([gridRow, gridCol]);
                plugin.hideTable();
            }else {
                new Notice("Please enter a valid number");
            }
        }}>Insert
    </button>
</div>

<style>
    .table-generator {
        padding-left: 5px;
        padding-right: 5px;
        width: 160px;
    }

    .input-table-generator {
        margin: 3px;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .input-table-generator-row, .input-table-generator-col {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    button {
        color: var(--color-base-40);
        border: var(--color-base-40) 1px solid;
        width: auto;
        height: auto;
        margin: 5px auto 5px;
        padding: 0px 10px;
        text-align: center;
        text-decoration: none;
        display: flex;
    }

    button:hover {
        color: var(--color-base-70);
    }

    input {
        width: 30px;
        height: 18px;
        border: 1px solid var(--color-base-50);
    }

    .H1 {
        margin-left: auto;
        margin-right: auto;
        text-align: center;
    }
</style>
