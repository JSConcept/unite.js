<script>
    import LucideIcon from '../design/WLucideIcon.svelte';
    import {onMount} from 'svelte';
    import {writable} from "svelte/store";

    //
    export let fieldName = "";
    let value = $$props?.value || writable(0);
    let container = null;
    let element = null;

    //
    const _whenChange = (ev)=>{
        const el = ev.target;
        value?.set?.(el.valueAsNumber);
        container.style.setProperty("--value-mod", (el.valueAsNumber - el.min) / (el.max - el.min), "");
    }

    //
    onMount(()=>{
        const el = element;
        container.style.setProperty("--value-mod", (el.valueAsNumber - el.min) / (el.max - el.min), "");
    });
</script>

<!-- -->
<script context="module">
    import {propsFilter} from "@unite/utils/utils.mjs";
</script>

<!-- -->
<label bind:this={container} class="ux-switch hl-1">
    <input 
        on:change={_whenChange} 
        on:input={_whenChange} 
        bind:value={$value} 
        bind:this={element}
        type="range" 
        data-name={fieldName} 
        min={-1} max={1} step={1}
        {...propsFilter($$props)}>
    <div class="track hl-1"></div>
    <div class="thumb icon-sign hl-2"><LucideIcon name={"circle"}/></div>
</label>
