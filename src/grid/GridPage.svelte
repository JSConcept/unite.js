<script type="ts">
    import {observeBySelector} from "dom/Observer";
    import GridItem from "grid/GridItem.svelte";
    import GridItemLabel from "grid/GridItemLabel.svelte";
    import type {GridItemType} from "grid/GridItemUtils";
    import {onMount} from 'svelte';
    
    // @ts-ignore
    export let gridPage: GridPageType = {};
    export let items = new Map<string, GridItemType>([]);
    export let type = "items";
    export let list = new Set<string>;
    
    //
    let target: HTMLElement | null = null;
    
    //
    $: gridPage?.["@subscribe"]?.((v)=>{
        list = v;
    }, "list");
    
    //
    $: gridPage?.["@subscribe"]?.((v)=>{
        target?.style?.setProperty?.("--grid-w", v[0], "")
        target?.style?.setProperty?.("--grid-w", v[1], "")
    }, "size");
    
    //
    $: gridPage?.["@subscribe"]?.((v)=>{
        target?.style?.setProperty?.("--columns", v[0], "")
        target?.style?.setProperty?.("--rows", v[1], "")
    }, "layout");
    
    //
    onMount(()=>{
        observeBySelector(target, ".ux-grid-item", (_)=>{
            //mut.addedNodes
        });
    });
</script>

<!-- -->
<div bind:this={target} data-id={gridPage?.id||""} class="ux-grid stretch grid-based-box">
    
    {#each list as L (L)}
        {#if type == "labels"}
            <GridItemLabel type={type} gridItem={items.get(L)}></GridItemLabel>
        {:else}
            <GridItem type={type} gridItem={items.get(L)}></GridItem>
        {/if}
    {/each}
    
</div>
