<script type="ts">
    import * as icons from 'lucide-svelte';
    
    //
    export let name = "";
    
    //
    const camelize = (str) => {
        return str.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase());
    }
    
    //
    const fup = (str)=>{
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
</script>

<script context="module">
    import {propsFilter} from "../utils/Utils.ts";
</script>

<svelte:component inert=true class="ux-icon" this={icons[fup(camelize(name))]} {...propsFilter($$props)} />
