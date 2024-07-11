<script>
import LucideIcon from '../design/WLucideIcon.svelte';

//
let value = $$props?.value;
let input = null;

//
$: value = $$props?.value;

//
const onchangeInternal = (ev)=>{
    value?.set(input?.valueAsNumber);
}

</script>

<script context="module">
    import {propsFilter} from "../utils/Utils.ts";
</script>

<!-- -->
<div class="number-input ux-solid hl-ns round-ns" {...propsFilter($$props)}>
    <button type="button" on:click={()=>{
        input?.stepDown?.();
        onchangeInternal();
    }} class="ux-solid icon-wrap f-minus hl-1 hl-2h">
        <LucideIcon inert={true} name={"chevron-left"}/>
    </button>
    <div class="input-wrap hl-ms">
        <input on:change={onchangeInternal} on:input={onchangeInternal} {...propsFilter($$props)} bind:this={input} inert={true} value={$value} type="number" inputmode="numeric" pattern="\d*" virtualkeyboardpolicy="manual"/>
    </div>
    <button type="button" on:click={()=>{
        input?.stepUp?.();
        onchangeInternal();
    }} class="ux-solid icon-wrap f-plus hl-1 hl-2h">
        <LucideIcon inert={true} name={"chevron-right"}/>
    </button>
</div>
