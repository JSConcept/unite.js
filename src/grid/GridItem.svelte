<script>
    export let cell = [0, 0];
    export let id = "";
    export let label = "";
    export let pointerId = -1;

    //
    let target = null;

    //
    $: cell?.["@subscribe"]?.(0, (v)=>(target?.style?.setProperty?.("--cell-x", v, "")));
    $: cell?.["@subscribe"]?.(1, (v)=>(target?.style?.setProperty?.("--cell-y", v, "")));
</script>

<!-- -->
<div bind:this={target} data-id={id} class="ux-grid-item">
    <slot></slot>
</div>
