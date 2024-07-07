<script>
    import {observeBySelector} from "dom/Observer";
    import GridPage from "grid/GridPage.svelte";
    
    //
    export let grids = new Map([]);
    export let items = new Map([]);
    
    //
    let target = null;
    
    //
    onMount(()=>{
        observeBySelector(target, ".ux-grid-item", (mut)=>{
            //mut.addedNodes
        });
    });
</script>

<!-- -->
<div bind:this={target} class="ux-grid-pages">
    
    {#each grids.entries() as [I, G]}
        <GridPage {...G} items={items}></GridPage>
    {/each}
    
</div>
