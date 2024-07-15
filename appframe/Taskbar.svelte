
<script type="ts" lang="ts">
    import LucideIcon from '../design/WLucideIcon.svelte';
    import TaskBox from './TaskBox.svelte';
    import {writable} from "svelte/store";
    import { observeBySelector } from "../dom/Observer.ts";

    //
    export let windowManager: any = null;

    //
    let tasks = writable(windowManager.getTasks() ?? new Set([]));
    let frameElement: HTMLElement | null = null;
    
    //
    windowManager.getTasks()?.["@subscribe"]?.(()=>{
        tasks.set(windowManager.getTasks());
    });
    
    //
    document.documentElement.addEventListener("contextmenu", (ev)=>{
        const target = ev.target as HTMLElement;
        if ((target?.matches?.(".ux-taskbar") || target?.closest?.(".ux-taskbar")) && !target.matches("input[type=\"text\"]")) {
            ev.stopPropagation();
            ev.stopImmediatePropagation();
            ev.preventDefault();
        }
    }, {capture: true});
    
    //
	document.documentElement.addEventListener("click", (ev)=>{
		const target = ev.target as HTMLElement;
		if (target.matches(".back-button")) {
			// kuril i umer
			ev.stopPropagation();
			ev.stopImmediatePropagation();
			ev.preventDefault();
			
			//
			const content = frameElement?.querySelector?.(".ux-app-frame .ux-content" + (windowManager?.getCurrentTask?.() || location.hash));
			if (content) {
				const event = new CustomEvent("ux-back", {
                    cancelable: true,
                    bubbles: true,
                    detail: {}
                });
				
			    //
                if (content.dispatchEvent(event)) {
                    windowManager?.minimizeTask?.(location.hash);
                    history.back();
                }
			}
		}
	})
	
	//
    observeBySelector(document.body, ".ux-app-frame", ({})=>{
        tasks.set(windowManager.getTasks());
    });
    
</script>

<!-- -->
<script context="module">
    import {propsFilter} from "../utils/Utils.ts";
</script>

<!-- -->
<div {...propsFilter($$props)} bind:this={frameElement} class="ux-taskbar ux-solid-transparent" transition:fade={{ delay: 0, duration: 100 }}>

    <div class="titlebar ux-solid hl-1">
        <div class="back-button hl-2 hl-3h ux-solid" style="grid-column: back-button; aspect-ratio: 1 / 1;">
            <LucideIcon inert={true} slot="icon" name={"arrow-left"}/>
        </div>
        <div class="ux-title-handle ux-solid hl-1">
            {#each $tasks.entries() as task}
                <TaskBox windowManager={windowManager} id={task[0]} {...task[1]}></TaskBox>
                
            {/each}
        </div>
        <div class="menu-button accent hl-2 hl-3h ux-solid" style="grid-column: menu-button; aspect-ratio: 1 / 1;">
            <LucideIcon inert={true} slot="icon" name={"menu"}/>
        </div>
    </div>

    <slot></slot>

</div>
