<script context="module">
    import {propsFilter} from "../utils/Utils.ts";
</script>

<div class="block-decor solid" {...propsFilter($$props)}>
    <div class="icon-wrap hl-1"  inert={true}>
        <div class="icon-box" inert={true}><slot name="icon"></slot></div>
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
