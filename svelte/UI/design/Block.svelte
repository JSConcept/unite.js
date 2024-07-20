<script context="module">
    import {propsFilter} from "../../../scripts/utils/Utils.ts";
</script>

<script lang="ts" type="ts">
    //
    export let onClick = (_: MouseEvent | PointerEvent)=>{
    
    }
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div on:click={onClick} class="ux-block-decor ux-default-theme hl-1 hl-2h" {...propsFilter($$props)}>
    <div class="icon-wrap hl-1" inert={true}>
        <slot name="icon"></slot>
    </div>
    
    <div class="label-box" inert={true}>
        <slot></slot>
    </div>
    
    <div class="in-element">
        <slot name="element"></slot>
    </div>

    <!--<div class="description">
    
    </div>-->
</div>
