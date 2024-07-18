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
    export let box = null;

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
    
    
    //
    const shiftStatus = {
        pointerId: -1,
        wasShift: false,
        timeout: null,
        startXY: [0, 0]
    }
    
    //
    document.addEventListener("pointerdown", (ev)=>{
        if (ev.target == box && !matchMedia("(orientation: portrait) or (width < 9in)").matches) {
            cancelDetach();
            shiftStatus.pointerId = ev.pointerId;
            shiftStatus.startXY = [ev.clientX, ev.clientY];
        }
    });
    
    //
    const cancelDetach = ()=>{
        if (shiftStatus.timeout) {
            clearTimeout(shiftStatus.timeout);
        }
        shiftStatus.timeout = null;
        shiftStatus.pointerId = -1;
        shiftStatus.wasShift = false;
    }
    
    //
    const triggerDetach = ()=>{
        shiftStatus.timeout = null;
        shiftStatus.pointerId = -1;
        shiftStatus.wasShift = false;
        
        //
        windowManager?.detachTask(id);
        
        //
        const frameElement = document.querySelector(id)?.closest?.(".ux-app-frame");
        frameElement.style.setProperty("--drag-x", -(frameElement.clientWidth / 2) + frameElement.parentNode.offsetWidth / 2, "");
        frameElement.style.setProperty("--drag-y", -(frameElement.clientHeight / 2) + frameElement.parentNode.offsetHeight / 2, "");
    }
    
    //
    document.addEventListener("pointermove", (ev)=>{
        if (ev.pointerId == shiftStatus.pointerId) {
            const shiftH = ev.clientY - shiftStatus.startXY[1];
            if (shiftH >= 20 && !shiftStatus.wasShift) {
                shiftStatus.wasShift = true;
                shiftStatus.timeout = setTimeout(triggerDetach, 300);
            } else 
            if (shiftH < 20 && shiftStatus.wasShift) {
                cancelDetach();
            }
        }
    });
    
    //
    document.addEventListener("pointerup", (ev)=>{ if (ev.pointerId == shiftStatus.pointerId) { cancelDetach(); } });
    document.addEventListener("pointercancel", (ev)=>{ if (ev.pointerId == shiftStatus.pointerId) { cancelDetach(); } });
</script>

<!--{#if !$inactive}-->
    <button bind:this={box} on:click={focusOn} class={`ux-task-box hl-1h ${$inactive ? "ux-inactive" : "ux-active"}`} data-task={id}>
        <div inert={true} class="ux-task-icon"><LucideIcon inert={true} slot="icon" name={icon}/></div>
        <div inert={true} class="ux-task-label">{label||"Task"}</div>
    </button>
<!--{/if}-->
