<script>
    export let cell = [0, 0];
    export let id = "";
    export let label = "";
    export let pointerId = -1;

    //
    let target = null;

    //
    $: target?.style?.setProperty?.("--cell-x", cell[0], "");
    $: target?.style?.setProperty?.("--cell-y", cell[1], "");
</script>

<!-- -->
<div bind:this={target} data-id={id} class="ux-grid-item-label">
    {label||""}
</div>
