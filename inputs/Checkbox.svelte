<script>
    import LucideIcon from '../design/WLucideIcon.svelte';
    import {onMount} from 'svelte';
    import {writable} from "svelte/store";

    //
    export let fieldName = "";
    export let value = $$props?.value || writable(false);
    export let element = null;
    export let container = null;

    //
    const _whenChange = (ev)=>{
        value?.set?.(ev.target.checked);
    }

    //
    onMount(()=>{
        //value?.set?.(element);
    });
</script>

<!-- -->
<script context="module">
    import {propsFilter} from "@unite/utils/utils.mjs";
</script>

<!-- -->
<label bind:this={container} class="ux-checkbox hl-2">
    <input 
        {...propsFilter($$props)}
        on:change={_whenChange}
        on:input={_whenChange}
        bind:this={element} bind:checked={$value} type="checkbox" data-name={fieldName}>
    <div class="icon-sign hl-2"><LucideIcon class="done lucide" name={"check"}/> <LucideIcon class="circle lucide" name={"circle"}/> </div>
</label>
