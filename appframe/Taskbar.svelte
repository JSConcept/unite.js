
<script type="ts" lang="ts">
    import LucideIcon from '../design/WLucideIcon.svelte.ts';

    //
    export let windowManager: any = null;

    //
    let frameElement: HTMLElement | null = null;
    
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
                    history.back();
                }
			}
		}
	})
    
</script>

<!-- -->
<script context="module">
    import {propsFilter} from "../utils/Utils.ts";
</script>

<!-- -->
<div {...propsFilter($$props)} bind:this={frameElement} class="ux-taskbar-container ux-solid-transparent" transition:fade={{ delay: 0, duration: 100 }}>

    <div class="titlebar ux-solid hl-1">
        <div class="back-button hl-2 hl-3h ux-solid" style="grid-column: back-button; aspect-ratio: 1 / 1;">
            <LucideIcon inert={true} slot="icon" name={"arrow-left"}/>
        </div>
        <div class="ux-title-handle ux-solid hl-1">

        </div>
        <div class="menu-button accent hl-2 hl-3h ux-solid" style="grid-column: menu-button; aspect-ratio: 1 / 1;">
            <LucideIcon inert={true} slot="icon" name={"menu"}/>
        </div>
    </div>

    <slot></slot>

</div>
