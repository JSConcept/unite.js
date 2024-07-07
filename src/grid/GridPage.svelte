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
    $: size?.["@subscribe"]?.(0, (v)=>(target?.style?.setProperty?.("--grid-w", v, "")));
    $: size?.["@subscribe"]?.(1, (v)=>(target?.style?.setProperty?.("--grid-h", v, "")));
    
    //
    $: layout?.["@subscribe"]?.(0, (v)=>(target?.style?.setProperty?.("--columns", v, "")));
    $: layout?.["@subscribe"]?.(1, (v)=>(target?.style?.setProperty?.("--rows", v, "")));
    
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
