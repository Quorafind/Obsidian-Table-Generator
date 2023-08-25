<script lang="ts">
    import type TableGeneratorPlugin from "../tableGeneratorIndex";
    import { random } from "../utils/tablePOS";
    import TableGeneratorComponent from "./basic/TableGeneratorComponent.svelte";
    import SizeControls from "./basic/SizeControls.svelte";

    export let canvas: any;
    export let coords: {
        x: number;
        y: number;
    };
    export let plugin: TableGeneratorPlugin;

    let width = plugin.settings.defaultCardWidth || 160;
    let height = plugin.settings.defaultCardHeight || 160;

    function handleSizeUpdate(event: any) {
        height = parseInt(event.detail.height,10);
        width = parseInt(event.detail.width,10);

        plugin.settings.defaultCardHeight = height;
        plugin.settings.defaultCardWidth = width;
        plugin.saveSettings();
    }

    async function insertTable(selectedGrid: number[]) {
        if (selectedGrid.length === 0 || selectedGrid[1] < 2) return;
        const canvasFile = await plugin.app.vault.cachedRead(canvas.view.file);
        const canvasFileData = JSON.parse(canvasFile);
        console.log(selectedGrid);
        for (let i = 0; i < selectedGrid[0]; i++) {
            for (let j = 0; j < selectedGrid[1]; j++) {
                canvasFileData.nodes.push({
                    id: random(16),
                    x: coords.x + j * (width + 10) + 40,
                    y: coords.y + i * (height + 10) + 40,
                    width: width,
                    height: height,
                    type: "text",
                    text: "",
                })
            }
        }
        console.log(canvasFileData);
        setTimeout(() => {
            canvas.setData(canvasFileData);
            canvas.requestSave();
        }, 100);
    }

</script>

<TableGeneratorComponent title="Card Generator" {plugin} onInsert={insertTable}>
    <SizeControls slot="sizeControls" width={width} height={height} on:sizeUpdate={handleSizeUpdate}></SizeControls>
</TableGeneratorComponent>

<style></style>
