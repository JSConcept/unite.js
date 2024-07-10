<script lang="ts" type="ts">
    import Block from "design/Block.svelte";
    import WLucideIcon from "design/WLucideIcon.svelte";

    //
    export let ctxName: string = "default";
    export let actionList: Map<string, Function> = new Map<string, Function>([]);
    export let ctxList: [{
        icon: "wallpaper",
        name: "Test",
        action: "unknown"
    }];
    
    //
    let initiator: HTMLElement | null = null;
    
    //
    document.addEventListener("contextmenu", (ev)=>{
        const target = ev.target as HTMLElement;
        if (target.matches("*[data-ctx=\""+ctxName+"\"]")) {
            ev.stopPropagation();
            ev.preventDefault();
            initiator = target
        }
    });
    
    //
    document.addEventListener("click", (ev)=>{
        const target = ev.target as HTMLElement;
        if (target.matches(".ux-context-menu *[data-action]")) {
            ev.stopPropagation();
            ev.preventDefault();
            actionList?.get?.(target.dataset.action as string)?.({
                initiator
            });
        }
    });

</script>

{#if initiator}
    <div class="ux-modal-frame ux-context-menu">
        {#each ctxList as L}
            <Block style="--decor-size: 2rem">
                <WLucideIcon name={L.icon} slot="icon"></WLucideIcon>
                <span>{L.name}</span>
                <div slot="element"></div>
            </Block>
        {/each}
    </div>
{/if}
