<script type="ts">
    import {onMount} from 'svelte';
    import {GridItemType} from "./GridItemUtils";
    
    // @ts-ignore
    export let gridItem: GridItemType = {};
    export let type = "";
    
    //
    let target: HTMLElement | null = null;
    let label = null;

    //
    $: gridItem?.["@subscribe"]?.((v)=>{
        target?.style?.setProperty?.("--cell-x", v[0], "")
        target?.style?.setProperty?.("--cell-y", v[1], "")
    }, "cell");
    
    //
    $: gridItem?.["@subscribe"]?.((v)=>{
        label = v;
    }, "label");

    //
    export let whenMount = ()=>{};
    
    //
    onMount(whenMount);
</script>

<!-- -->
<div bind:this={target} data-id={gridItem.id} data-type={type} class="ux-grid-item-label">
    {label||""}
</div>
