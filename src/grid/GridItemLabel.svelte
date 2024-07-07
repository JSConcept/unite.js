<script>
    export let gridItem = {};
    export let type = "";
    
    //
    let target = null;
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
