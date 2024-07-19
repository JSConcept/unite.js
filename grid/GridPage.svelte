<script type="ts" lang="ts">
    import {onMount} from 'svelte';
    import {observeBorderBox, observeBySelector} from "../dom/Observer.ts";
    import GridItem from "./GridItem.svelte";
    import GridItemLabel from "./GridItemLabel.svelte";
    import type {GridItemType, GridPageType} from "./GridItemUtils.ts";
    //import {state} from "./GridState";
    
    //
    export let gridPage: GridPageType | undefined | null = null;//state.grids.get("backup");
    export let actionMap = new Map();
    
    //
    export let items = new Map<string, GridItemType>([]);
    export let type = "items";
    export let list = new Set<string>;
    
    //
    let target: HTMLElement | null = null;
    
    //
    $: gridPage?.["@subscribe"]?.((v)=>{
        list = v;
    }, "list");
    
    //
    $: gridPage?.["@subscribe"]?.((v)=>{
        const idc = 0;
        target?.style?.setProperty?.(["--grid-w", "--grid-h"][idc], (v?.[0] || 0) as unknown as string, "")
        target?.style?.setProperty?.(["--grid-h", "--grid-w"][idc], (v?.[1] || 0) as unknown as string, "")
    }, "size");
    
    //
    $: gridPage?.["@subscribe"]?.((v)=>{
        target?.style?.setProperty?.("--columns", v[0] || 4, "")
        target?.style?.setProperty?.("--rows", v[1] || 8, "")
    }, "layout");
    
    //
    $: gridPage?.size?.["@subscribe"]?.((v, idx)=>{
        //if (matchMedia("(orientation: landscape)").matches) { idx = 1 - idx; };
        target?.style?.setProperty?.(["--grid-w", "--grid-h"][idx], v || 0, "");
    });
    
    //
    $: gridPage?.layout?.["@subscribe"]?.((v, idx)=>{
        target?.style?.setProperty?.(["--columns", "--rows"][idx], v || [4, 8][idx] || 0, "")
    });
    
    
    //
    const onItemClick = (ev)=>{
        const target = ev.target as HTMLElement;
        actionMap?.get?.(target.dataset.action as string)?.({
            initiator: target
        });
    }
    
    
    //
    onMount(()=>{
        target?.style?.setProperty?.("--columns", (gridPage?.layout?.[0] || 4) as unknown as string, "")
        target?.style?.setProperty?.("--rows", (gridPage?.layout?.[1] || 8) as unknown as string, "")
        
        //
        observeBySelector(target, ".ux-grid-item", (_)=>{
            //mut.addedNodes
        });
        
        //
        observeBorderBox(target, (box)=>{
            if (gridPage) {
                gridPage.size[0] = box.inlineSize;
                gridPage.size[1] = box.blockSize;
                
                //
                const idc = 0;
                target?.style?.setProperty?.(["--grid-w", "--grid-h"][idc], (gridPage?.size?.[0] || 0) as unknown as string, "")
                target?.style?.setProperty?.(["--grid-h", "--grid-w"][idc], (gridPage?.size?.[1] || 0) as unknown as string, "")
            }
        })
    });
</script>

<!-- -->
<div bind:this={target} data-id={gridPage?.id||""} class="ux-grid-page stretch grid-based-box ux-transparent">
    
    <!-- -->
    {#each list as L (L)}
        {#if type == "labels"}
            <GridItemLabel type={type} gridItem={items.get(L)}></GridItemLabel>
        {:else}
            <GridItem onClick={onItemClick} type={type} gridItem={items.get(L)}></GridItem>
        {/if}
    {/each}
    
</div>
