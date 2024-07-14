<script type="ts" lang="ts">
	import {readableHash} from '../dom/Realtime.ts';
	import LucideIcon from '../design/WLucideIcon.svelte';
	import AxGesture from "../interact/Gesture.ts";
	import {fade} from "svelte/transition";
	import { observeBySelector } from "../dom/Observer.ts";

	//
	export let hashIdName = $$props.hashIdName || "#app";
	
	//
	//let pointerIdDrag = -1;
	let frameElement: HTMLElement | null = null;
	
	// outdated due gestures control
	/*document.documentElement.addEventListener("m-dragging", (ev)=>{
		const dt = ev.detail;
		if (frameElement && frameElement?.parentNode && dt.pointer.id == pointerIdDrag && (dt.holding.element.deref() == frameElement)) {
			const wDiff = ((frameElement?.parentNode as HTMLElement|null)?.offsetWidth || 0) - frameElement.clientWidth;
			const hDiff = ((frameElement?.parentNode as HTMLElement|null)?.offsetHeight || 0) - frameElement.clientHeight;

			// change drag-state (correction)
			dt.holding.modified[0] = Math.min(Math.max(dt.holding.shifting[0], -wDiff/2), wDiff/2);
			dt.holding.modified[1] = Math.min(Math.max(dt.holding.shifting[1], -hDiff/2), hDiff/2);
		}
	});*/
	
	document.documentElement.addEventListener("contextmenu", (ev)=>{
		const target = ev.target as HTMLElement;
		if ((target?.matches?.(".ux-app-frame") || target?.closest?.(".ux-app-frame")) && !target.matches("input[type=\"text\"]")) {
			ev.stopPropagation();
			ev.stopImmediatePropagation();
			ev.preventDefault();
		}
	}, {capture: true});
	
	//
	document.documentElement.addEventListener("click", (ev)=>{
		const target = ev.target as HTMLElement;
		if (target.matches(".back-button")) {
			
			//
			const content = frameElement?.querySelector?.(".ux-content");
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

	//
	let gestureControl: AxGesture | null = null;

    //
    const observer = new MutationObserver((mutationsList, _)=>{
        for (let mutation of mutationsList) {
            if (mutation.type == "childList") {
                const validOf = Array.from(mutation.addedNodes).filter((n)=>(n == frameElement)) as HTMLElement[];
                for (const frameElement of validOf) {
					gestureControl = new AxGesture(frameElement);
					
					//
					if (gestureControl) {
						gestureControl.draggable({
							handler: frameElement.querySelector(".ux-title-handle")
						});
						
						//
						gestureControl.resizable({
							handler: frameElement.querySelector(".ux-resize")
						});
						
						// TODO! fix typescript typing
						// center manually
						
						// @ts-ignore
						frameElement.style.setProperty("--drag-x", -(frameElement.clientWidth / 2) + frameElement.parentNode.offsetWidth / 2, "");
						
						// @ts-ignore
						frameElement.style.setProperty("--drag-y", -(frameElement.clientHeight / 2) + frameElement.parentNode.offsetHeight / 2, "");
					}
                }
            }
        }
    });
    
    //
	observeBySelector(document.body, ".ux-app-frame:has(" + hashIdName + ")", ({addedNodes})=>{
		frameElement ||= addedNodes[0];
	});
    
    //
    observer.observe(document.body, {
		childList: true,
		subtree: true
	});
</script>

<script context="module">
    import {propsFilter} from "../utils/Utils.ts";
</script>

<!-- -->
{#if $readableHash == hashIdName || location.hash == hashIdName}
	<div {...propsFilter($$props)} bind:this={frameElement} class="ux-frame ux-app-frame ux-default-theme ux-accent hl-1" transition:fade={{ delay: 0, duration: 100 }}>

		<div class="titlebar ux-solid hl-1">
			<div class="back-button hl-2 hl-3h ux-solid" style="grid-column: back-button; aspect-ratio: 1 / 1;">
				<LucideIcon inert={true} slot="icon" name={"arrow-left"}/>
			</div>
			<div class="ux-title-handle ux-solid">
				
			</div>
			<div class="menu-button accent hl-2 hl-3h ux-solid" style="grid-column: menu-button; aspect-ratio: 1 / 1;">
				<LucideIcon inert={true} slot="icon" name={"menu"}/>
			</div>
		</div>
		
		<slot></slot>
		
		<!--<div class="content-box stretch ux-solid-transparent">
			<slot></slot>
		</div>-->

		<div class="ux-resize ux-solid-transparent">
			
		</div>

	</div>
{/if}

<style type="scss">
	
</style>
