<script type="ts" lang="ts">
    import {onMount} from 'svelte';
    import {observeBorderBox, observeBySelector} from "../dom/Observer.ts";
    import GridItem from "./GridItem.svelte";
    import GridItemLabel from "./GridItemLabel.svelte";
    import type {GridItemType, GridPageType} from "./GridItemUtils.ts";
    import {state} from "./GridState";
    
    //
    export let gridPage: GridPageType | undefined = state.grids.get("backup");
    
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
        target?.style?.setProperty?.("--grid-w", v[0], "")
        target?.style?.setProperty?.("--grid-h", v[1], "")
    }, "size");
    
    //
    $: gridPage?.["@subscribe"]?.((v)=>{
        target?.style?.setProperty?.("--columns", v[0] || 4, "")
        target?.style?.setProperty?.("--rows", v[1] || 8, "")
    }, "layout");
    
    //
    onMount(()=>{
        //
        const idc = matchMedia("(orientation: portrait)").matches ? 0 : 1;
        if (gridPage && target) {
            gridPage.size = [target["clientWidth", "clientHeight"][idc], target["clientHeight", "clientWidth"][idc]];
        }

        //
        target?.style?.setProperty?.("--columns", (gridPage?.layout?.[0] || 4) as unknown as string, "")
        target?.style?.setProperty?.("--rows", (gridPage?.layout?.[1] || 8) as unknown as string, "")
        
        //
        target?.style?.setProperty?.("--grid-w", (gridPage?.size?.[0] || 0) as unknown as string, "")
        target?.style?.setProperty?.("--grid-h", (gridPage?.size?.[1] || 0) as unknown as string, "")

        //
        observeBySelector(target, ".ux-grid-item", (_)=>{
            //mut.addedNodes
        });
        
        //
        observeBorderBox(target, (box)=>{
            if (gridPage) {
                gridPage.size = [box.inlineSize, box.blockSize];
                
                //
                const idc = matchMedia("(orientation: portrait)").matches ? 0 : 1;
                target?.style?.setProperty?.(["--grid-w", "--grid-h"][idc], (gridPage?.size?.[0] || 0) as unknown as string, "")
                target?.style?.setProperty?.(["--grid-h", "--grid-w"][idc], (gridPage?.size?.[1] || 0) as unknown as string, "")
            }
        })
    });
</script>

<!-- -->
<div bind:this={target} data-id={gridPage?.id||""} class="ux-grid stretch grid-based-box orientation-adaptive">
    
    {#each list as L (L)}
        {#if type == "labels"}
            <GridItemLabel type={type} gridItem={items.get(L)}></GridItemLabel>
        {:else}
            <GridItem type={type} gridItem={items.get(L)}></GridItem>
        {/if}
    {/each}
    
</div>
