<script type="ts" lang="ts">
    import { observeBySelector} from "../dom/Observer.ts";
    import { MOC, propsFilter } from "../utils/Utils.ts";
    import LucideIcon from "../design/LucideIcon.svelte";
    import {writable} from "svelte/store";

    //
    let input: HTMLInputElement | null = null, copyButton: HTMLButtonElement | null = null, pasteButton: HTMLButtonElement | null = null, fieldEdit: HTMLDivElement | null = null;

    //
    export let targetInput: HTMLInputElement | null = null;
    export let value = writable("");
    
    //
    const stillInFocus = (el)=>{
        // @ts-ignore
        return el && MOC(el, ".ux-editor, input") && (!document?.activeElement || MOC(document?.activeElement, ".ux-editor, input"));
    }

    //
    observeBySelector(document.documentElement, ".ux-editor", (mut)=>{
        fieldEdit = mut.addedNodes[0];
        input = fieldEdit?.querySelector("input") || null;
        copyButton = fieldEdit?.querySelector(".field-copy") || null;
        pasteButton = fieldEdit?.querySelector(".field-paste") || null;
        
        //
        if (document.activeElement != input) { input?.focus?.(); }
    });

    //
    const unfocus = (target: HTMLInputElement | null)=>{
        if (!stillInFocus(target || targetInput)) {

            // @ts-ignore
            navigator?.virtualKeyboard?.hide?.();
            
            // @ts-ignore
            document.activeElement?.blur?.();
            
            //
            input?.blur?.();
            
            //
            targetInput = null;
        }
    }

    //
    const refocus = (from)=>{
        //if (target?.matches("input"))
        if (input && document.activeElement == input) return;
        
        //
        if ((from as HTMLElement)?.matches?.("input:is([type=\"text\"])") && targetInput != input && from != input) {
            targetInput = from;
        }
        
        //
        requestAnimationFrame(()=>{
            if (input && document.activeElement != input) {
                input.value = targetInput?.value || "";
                input.focus();
            }
        });
    }
    
    //
    const reflect = ()=>{
        if (input && targetInput) {
            targetInput.value = input.value;
            targetInput.dispatchEvent(new Event("input", {
                bubbles: false,
                cancelable: true,
            }))
        }
    }

    //
    document.addEventListener("focusout", ({target})=>{
        if (target == input) { unfocus(target as HTMLInputElement); }
    });

    //
    document.addEventListener("focusin", ({target})=>{
        if ((target as HTMLElement)?.matches?.("input:is([type=\"text\"])") && target != input) {
            refocus(target);
        }
    });

    //
    document.addEventListener("click", (ev)=>{
        const target = ev.target;

        //
        if (stillInFocus(target)) {
            refocus(target);
        } else 
        if (stillInFocus(document?.activeElement)) {
            refocus(document?.activeElement);
        } else {
            unfocus(target as HTMLInputElement);
        }
        
        //
        if ([input, copyButton, pasteButton].indexOf(document?.activeElement as any) >= 0) {
            ev.preventDefault();
        }
        
        //
        requestAnimationFrame(()=>{
            if (input && document.activeElement == input) {
                if (target == copyButton && (input?.selectionStart||0) < (input?.selectionEnd||0)) {
                    navigator.clipboard.writeText(input.value.substring(input.selectionStart||0, input.selectionEnd||0));
                }
                
                // 
                if (target == pasteButton && (input?.selectionStart||0) <= (input?.selectionEnd||0)) {
                    navigator.clipboard.readText().then(
                        (clipText) => {
                            const oldStart = input?.selectionStart||0;
                            const paste = (input?.value?.substring(0, input?.selectionStart||0)||"") + (clipText || "") + (input?.value?.substring?.(input?.selectionEnd||0)||"");
                            if (input) { input.value = paste; };

                            //
                            input?.setSelectionRange(
                                oldStart + clipText.length, 
                                oldStart + clipText.length
                            );

                            //
                            input?.dispatchEvent(new Event("input", {
                                bubbles: false,
                                cancelable: true,
                            }))
                        },
                    );
                }
            }
        })
        
    });

</script>


{#if targetInput}
    <div 
        bind:this={fieldEdit} 
        class="ux-editor fixed" 
        {...propsFilter($$props)}
    >
        <div class="field-content stretch solid apply-color-theme" style="grid-row: field-edit;">
            <div class="field-wrap solid apply-color-theme">
                <input 
                autofocus={true}
                on:input={reflect}
                on:change={reflect}
                bind:value={$value}
                bind:this={input} 
                type="text"
            />
            </div>
            <button type="button" tabindex="-1" bind:this={copyButton} class="field-copy solid hl-1 hl-2h apply-color-theme pe-enable">
                <LucideIcon name="copy" tabindex="-1" inert={true}></LucideIcon>
            </button>
            <button type="button" tabindex="-1" bind:this={pasteButton} class="field-paste solid hl-1 hl-2h apply-color-theme pe-enable">
                <LucideIcon name="clipboard" tabindex="-1" inert={true}></LucideIcon>
            </button>
        </div>
    </div>
{/if}
