<script lang="ts" type="ts">
    import type {Readable, Writable} from "svelte/store";
    import {propsFilter} from "../utils/Utils.ts";
    import {writable} from "svelte/store";
    import {fade} from "svelte/transition";
    
    //
    export let focused: Writable<boolean> | Readable<boolean> = writable(false);
    
    //
    const FocusSelector = ".ux-modal-frame, .ux-modal, .ux-editor, input";
    const DNBSelector = "input[type=\"text\"], .ux-editor, input";
    
    //
    let modalFrame: HTMLElement | null = null;
    
    //
    document.documentElement.addEventListener("contextmenu", (ev)=>{
		const target = ev.target as HTMLElement;
		if ((target?.matches?.(".ux-modal-frame") || target?.closest?.(".ux-modal-frame")) && !target.matches("input[type=\"text\"]")) {
			ev.stopPropagation();
			ev.stopImmediatePropagation();
			ev.preventDefault();
		}
	}, {capture: true});
    
    //
    document.addEventListener("click", (ev)=>{
        const target: HTMLElement = ev.target as HTMLElement;
        
        //
        if (!(modalFrame == target || target.matches(FocusSelector) || target.closest(FocusSelector)) && !(document?.activeElement?.matches(DNBSelector) || target.matches(DNBSelector) || target.closest(DNBSelector))) {
            // @ts-ignore
            focused?.set?.(false);
        }
    });
    
</script>

<!-- -->
{#if $focused}
    <div class="ux-modal-frame" transition:fade={{ delay: 0, duration: 100 }} bind:this={modalFrame} {...propsFilter($$props)}>
        <div class="cut-space">
            <slot></slot>
        </div>
    </div>
{/if}
