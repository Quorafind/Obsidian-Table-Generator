<script lang="ts">
    import type { Editor } from "obsidian";
    import TableGeneratorComponent from "./basic/TableGeneratorComponent.svelte";
    import { checkBlankLine, generateMarkdownTable } from "../utils/markdownTable";
    import type TableGeneratorPlugin from "../tableGeneratorIndex";
    import AlignItems from "./basic/AlignItems.svelte";

    export let editor: Editor;
    export let plugin: TableGeneratorPlugin;
    let currentAlign: AlignMode = plugin?.settings.defaultAlignment ?? 'left';

    async function handleAlignModeUpdate(event: any) {
        currentAlign = event.detail;
        // @ts-ignore
        plugin?.settings?.defaultAlignment = currentAlign;
        await plugin?.saveSettings();
    }

    function insertTable(selectedGrid: number[]) {
        if (selectedGrid.length === 0 || selectedGrid[1] < 2) return;
        const basicTable = generateMarkdownTable(selectedGrid, currentAlign);
        let markdownTable = basicTable;
        const cursor = editor.getCursor('from');
        const line = editor.getLine(cursor.line);

        if(cursor.line !== 0 && (line.trim().length !== 0)) {
            markdownTable = '\n' + markdownTable;
        }

        if (cursor.line !== editor.lastLine() && !checkBlankLine(editor, cursor.line + 1)) {
            markdownTable = markdownTable + '\n';
        } else if (cursor.line === editor.lastLine()) {
            markdownTable = '\n' + markdownTable;
        }

        if (line.trim().length > 0) {
            editor.replaceRange(markdownTable, { line: cursor.line + 1, ch: 0 }, {
                line: cursor.line + 1,
                ch: 0
            });
        } else {
            editor.replaceRange(markdownTable, { line: cursor.line, ch: 0 }, { line: cursor.line, ch: 0 });
        }
    }

</script>

<TableGeneratorComponent title="Table Generator" {plugin} onInsert={insertTable}>
    <AlignItems align={currentAlign} on:update={handleAlignModeUpdate} slot="headerControls" />
</TableGeneratorComponent>

<style></style>
