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
    $: size?.["@subscribe"]?.((v)=>(target?.style?.setProperty?.("--grid-w", v, "")), 0);
    $: size?.["@subscribe"]?.((v)=>(target?.style?.setProperty?.("--grid-h", v, "")), 1);
    
    //
    $: layout?.["@subscribe"]?.((v)=>(target?.style?.setProperty?.("--columns", v, "")), 0);
    $: layout?.["@subscribe"]?.((v)=>(target?.style?.setProperty?.("--rows", v, "")), 1);
    
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
