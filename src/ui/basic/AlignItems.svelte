<script lang="ts">
    import { onMount, createEventDispatcher } from "svelte";
    import { setIcon } from "obsidian";

    export let align: AlignMode = 'left';

    const dispatch = createEventDispatcher();
    const alignments: AlignMode[] = ['left', 'center', 'right'];

    let refs: RefsObject = {};

    onMount(() => {
        setIcon(refs['left']!, 'align-left');
        setIcon(refs['center']!, 'align-center');
        setIcon(refs['right']!, 'align-right');
    });

    function click(update: AlignMode) {
        align = update;
        dispatch('update', align);
    }
</script>

<div class="table-generator-align-group">
    {#each alignments as alignment (alignment)}
        <div
            bind:this={refs[alignment]}
            class="table-generator-align-icon"
            class:active={align === alignment}
            on:click={() => click(alignment)}
        ></div>
    {/each}
</div>

<style>
    .table-generator-align-group {
        display: flex;
        align-items: center;
        flex-direction: row;
        gap: var(--size-2-2);
    }

    .table-generator-align-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: var(--radius-s);
        padding: var(--size-2-1);
    }

    .table-generator-align-icon:not(.active):hover {
        background-color: var(--background-modifier-hover);
    }

    .table-generator-align-icon.active {
        background-color: var(--background-modifier-border-hover);
    }
</style>
