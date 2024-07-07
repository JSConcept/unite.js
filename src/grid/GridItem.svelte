<script>
    export let cell = [0, 0];
    export let id = "";
    export let label = "";
    export let pointerId = -1;

    //
    let target = null;

    //
    $: cell?.["@subscribe"]?.((v)=>(target?.style?.setProperty?.("--cell-x", v, "")), 0);
    $: cell?.["@subscribe"]?.((v)=>(target?.style?.setProperty?.("--cell-y", v, "")), 1);
</script>

<!-- -->
<div bind:this={target} data-id={id} class="ux-grid-item">
    <slot></slot>
</div>
