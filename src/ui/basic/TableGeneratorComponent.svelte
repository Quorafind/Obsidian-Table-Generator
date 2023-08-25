<script lang="ts">
    import Table from "./Table.svelte";
    import { Notice } from "obsidian";
    import type TableGeneratorPlugin from "../../tableGeneratorIndex";

    export let title: string;
    export let plugin: TableGeneratorPlugin;
    export let onInsert: (selectedGrid: number[]) => void;

    let hoverTableEnd: number[];
    let gridRow: number;
    let gridCol: number;

    $: if (hoverTableEnd) {
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
</script>

<div class="table-generator">
    <div class="table-generator-header">
        <div class="H1">
            {title}
        </div>
        <slot name="headerControls"></slot>
    </div>
    <Table rowNum={settings.rowNum} colNum={settings.colNum} insertTable={onInsert} {plugin}
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
    <slot name="sizeControls"></slot>
    <button on:click={() => {
            if(/^\d+$/.test(gridRow.toString()) && /^\d+$/.test(gridCol.toString())) {
                onInsert([gridRow, gridCol]);
            } else {
                new Notice("Please enter a valid number");
            }
        }}>Insert
    </button>
</div>

<style>
    .table-generator {
        padding-left: 5px;
        padding-right: 5px;
        width: 220px;
    }

    .table-generator-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: var(--size-4-1);
        margin-bottom: var(--size-4-1);
    }

    .input-table-generator {
        margin-left: var(--size-2-2);
        margin-right: var(--size-2-2);
        margin-top: var(--size-4-2);
        margin-bottom: var(--size-4-2);
        display: flex;
        justify-content: space-around;
        align-items: center;
    }

    .input-table-generator-row, .input-table-generator-col {
        display: flex;
        justify-content: space-around;
        align-items: center;
    }

    button {
        width: 80px;
        height: 20px;
        margin: var(--size-4-1) auto var(--size-4-2);
        padding: 0px 10px;
        text-align: center;
        text-decoration: none;
        display: flex;
        align-items: center;
    }

    input {
        width: 40px;
        height: 18px;
        border: 1px solid var(--color-base-50);
        margin-left: var(--size-2-2);
        border-radius: var(--radius-m);
        text-align: center;
    }

    .H1 {
        margin-left: auto;
        margin-right: auto;
        text-align: center;
    }
</style>
