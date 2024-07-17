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
    export let taskListOpened = writable(false);

    //
    const focusOn = (ev)=>{
        if (matchMedia("(orientation: portrait) or (width < 9in)").matches && ev.target.closest(".ux-task-button")) {
            taskListOpened.set(true);
        } else {
            windowManager?.focusTask?.(id);
        }
    }

</script>

<!--{#if !$inactive}-->
    <button on:click={focusOn} class={`ux-task-box hl-1h ${$inactive ? "ux-inactive" : "ux-active"}`} data-task={id}>
        <div class="ux-task-icon"><LucideIcon inert={true} slot="icon" name={icon}/></div>
        <div class="ux-task-label">{label||"Task"}</div>
    </button>
<!--{/if}-->
