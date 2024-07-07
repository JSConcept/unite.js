<script>
    import {observeBySelector} from "dom/Observer";
    import GridItem from "grid/GridItem.svelte";
    import GridItemLabel from "grid/GridItemLabel.svelte";
    
    //
    export let gridPage = {};
    export let items = new Map([]);
    export let type = "items";
    
    //
    let target = null;
    let list = [];
    
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
        observeBySelector(target, ".ux-grid-item", (mut)=>{
            //mut.addedNodes
        });
    });
</script>

<!-- -->
<div bind:this={target} data-id={gridPage.id} class="ux-grid">
    
    {#each list as L (L)}
        {#if type == "labels"}
            <GridItemLabel type={type} gridItem={items.get(L)}></GridItemLabel>
        {:else}
            <GridItem type={type} gridItem={items.get(L)}></GridItem>
        {/if}
    {/each}
    
</div>
