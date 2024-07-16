<script>
    import {writable} from "svelte/store";
    import LucideIcon from '../design/WLucideIcon.svelte';

    //
    export let windowManager = null;
    
    //
    export let id = "#";
    export let label = "#task"; 
    export let inactive = writable(true);
    export let icon = "";

    //
    const focusOn = ()=>{
        windowManager?.focusTask?.(id);
    }

</script>

<!--{#if !$inactive}-->
    <div on:click={focusOn} class={`ux-task-box hl-1h ${$inactive ? "ux-inactive" : "ux-active"}`} data-task={id}>
        <div class="ux-task-icon"><LucideIcon inert={true} slot="icon" name={icon}/></div>
        <div class="ux-task-label">{label||"Task"}</div>
    </div>
<!--{/if}-->
