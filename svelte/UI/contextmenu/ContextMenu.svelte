<script lang="ts" type="ts">
    import Block from "../design/Block.svelte";
    import WLucideIcon from "../design/WLucideIcon.svelte";
    import Frame from "../design/Frame.svelte";
    import {writable} from "svelte/store";

    //
    import {zoomOf} from "../../../scripts/utils/Utils.ts";

    //
    export let ctxName: string = "default";
    export let actionMap: Map<string, Function> = new Map<string, Function>([]);
    export let ctxList = [{
        icon: "wallpaper",
        name: "Test",
        action: "unknown"
    }];
    
    //
    let initiator: HTMLElement | null = null;
    let hasInitiator = writable(!!initiator);
    
    //
    hasInitiator.subscribe((v)=>{
        if (!v) { initiator = null; }
    });
    
    //
    document.addEventListener("contextmenu", (ev)=>{
        const target = ev.target as HTMLElement;
        
        //
        if (target.matches(".ux-context-menu") || target.closest(".ux-context-menu")) {
            ev.stopPropagation();
            ev.preventDefault();
        }
        
        //
        if (target.matches("*[data-ctx=\""+ctxName+"\"]")) {
            ev.stopPropagation();
            ev.preventDefault();
            initiator = target;
            hasInitiator.set(!!initiator);
            
            //
            requestAnimationFrame(()=>{
                const ctxMenu: HTMLElement | null = document.querySelector(".ux-context-menu[data-ctx-name=\""+ctxName+"\"]");
                if (ctxMenu) {
                    ctxMenu.style.setProperty("--click-x", (ev.clientX / zoomOf()) as unknown as string, "");
                    ctxMenu.style.setProperty("--click-y", (ev.clientY / zoomOf()) as unknown as string, "");
                }
            })
        }
        
        //
        if (!(target.matches("*[data-ctx=\""+ctxName+"\"]"))) {
            initiator = null;
            hasInitiator.set(!!initiator);
        }
    });
    
    
    //
    const onClick = (ev)=>{
        const target = ev.target as HTMLElement;
        
        //
        actionMap?.get?.(target.dataset.action as string)?.({
            initiator
        });
        
        //
        initiator = null;
        hasInitiator.set(!!initiator);
    }
    
    
    //
    document.addEventListener("click", (ev)=>{
        const target = ev.target as HTMLElement;
        
        if (!(target.matches(".ux-context-menu[data-ctx-name=\"" + ctxName + "\"]") || target.closest(".ux-context-menu[data-ctx-name=\"" + ctxName + "\"]")) || target.matches("*[data-action]")) {
            requestAnimationFrame(()=>{
                initiator = null;
                hasInitiator.set(!!initiator);
            });
        }
    });

</script>

<Frame focused={hasInitiator} data-ctx-name={ctxName} class="ux-modal-frame ux-context-menu">
    {#each ctxList as L}
        <Block onClick={onClick} class="ux-block-decor ux-default-theme hl-1h" style="--decor-size: 2rem" data-action={L.action}>
            <WLucideIcon name={L.icon} slot="icon"></WLucideIcon>
            <span>{L.name}</span>
            <div slot="element"></div>
        </Block>
    {/each}
</Frame>
