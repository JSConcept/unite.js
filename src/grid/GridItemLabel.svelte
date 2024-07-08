<script type="ts" lang="ts">
    import {onMount} from 'svelte';
    import {GridItemType} from "./GridItemUtils";
    
    // @ts-ignore
    export let gridItem: GridItemType = {};
    export let type = "labels";
    
    //
    let target: HTMLElement | null = null;
    let label = gridItem?.label || "";

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
    onMount(()=>{
        //
        target?.style?.setProperty?.("--cell-x", (gridItem?.cell?.[0] || 0) as unknown as string, "")
        target?.style?.setProperty?.("--cell-y", (gridItem?.cell?.[1] || 0) as unknown as string, "")
        
        //
        whenMount();
    });
</script>

<!-- -->
<div bind:this={target} data-id={gridItem.id} data-type={type} class="ux-grid-item-label">
    {label||""}
</div>
