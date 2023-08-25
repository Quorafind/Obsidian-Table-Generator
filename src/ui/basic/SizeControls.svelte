<script lang="ts">
    import { createEventDispatcher } from 'svelte';

    // 创建一个事件分发器
    const dispatch = createEventDispatcher();

    export let height = 160;
    export let width = 160;

    // 当 width 或 height 发生变化时，发送更新事件
    $: dispatch('sizeUpdate', { height,width  });

</script>

<div class="input-table-generator">
    <div class="input-table-generator-height">
        H:
        <input class="height-input" bind:value={height}>
    </div>
    <div class="input-table-generator-width">
        W:
        <input class="width-input" bind:value={width}>
    </div>
</div>

<style>
    .input-table-generator {
        margin-left: var(--size-2-2);
        margin-right: var(--size-2-2);
        margin-top: var(--size-4-2);
        margin-bottom: var(--size-4-2);
        display: flex;
        justify-content: space-around;
        align-items: center;
    }

    .input-table-generator-width, .input-table-generator-height {
        display: flex;
        justify-content: space-around;
        align-items: center;
    }

    input {
        width: 70px;
        height: 18px;
        border: 1px solid var(--color-base-50);
        margin-left: var(--size-2-2);
        border-radius: var(--radius-m);
        text-align: center;
    }
</style>
