<script lang="ts" type="ts">
    import type {Readable, Writable} from "svelte/store";
    import {propsFilter} from "../utils/Utils.ts";
    import {writable} from "svelte/store";
    
    //
    export let focused: Writable<boolean> | Readable<boolean> = writable(false);
    
    //
    const FocusSelector = ".ux-modal-frame, .ux-modal, .ux-editor, input";
    
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
        if (!(modalFrame == target || target.matches(FocusSelector) || target.closest(FocusSelector))) {
            // @ts-ignore
            focused?.set?.(false);
        }
    });
    
</script>

<!-- -->
{#if $focused}
    <div class="ux-modal-frame" bind:this={modalFrame} {...propsFilter($$props)}>
        <div class="cut-space">
            <slot></slot>
        </div>
    </div>
{/if}
