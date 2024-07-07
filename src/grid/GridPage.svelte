<script>
    import {observeBySelector} from "dom/Observer";
    import GridItem from "grid/GridItem.svelte";
    
    //
    export let list = [];
    export let layout = [];
    export let size = [];
    export let id = "";
    
    //
    export let items = new Map([]);
    
    //
    let target = null;
    
    //
    $: target?.style?.setProperty?.("--grid-w", size[0], "");
    $: target?.style?.setProperty?.("--grid-h", size[1], "");
    
    //
    $: target?.style?.setProperty?.("--columns", layout[0], "");
    $: target?.style?.setProperty?.("--rows", layout[1], "");
    
    //
    onMount(()=>{
        observeBySelector(target, ".ux-grid-item", (mut)=>{
            //mut.addedNodes
        });
    });
</script>

<div bind:this={target} data-id={id} class="ux-grid">
    
    {#each list as L}
        <GridItem {...items.get(L)}></GridItem>
    {/each}
    
</div>
