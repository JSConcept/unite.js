<script type="ts" lang="ts">
    import {onMount} from 'svelte';
    import LucideIcon from "../design/WLucideIcon.svelte";
    import GestureControl from "../interact/Gesture.ts";
    import {GridItemType} from "./GridItemUtils.ts";

    // @ts-ignore
    export let gridItem: GridItemType = {};
    export let type = "items";
    
    //
    let target: HTMLElement | null = null;
    let icon = gridItem.icon;

    //
    $: gridItem?.["@subscribe"]?.((v)=>{
        target?.style?.setProperty?.("--cell-x", v[0], "")
        target?.style?.setProperty?.("--cell-y", v[1], "")
    }, "cell");

    //
    $: gridItem?.["@subscribe"]?.((v)=>{
        icon = v;
    }, "icon");

    //
    export let whenMount = ()=>{};
    
    //
    onMount(()=>{
        const gest = new GestureControl(target);
        
        //
        gest.longPress({
            anyPointer: true,
            mouseImmediate: true,
            minHoldTime: 60 * 3600,
            maxHoldTime: 100
        });
        
        //
        target?.style?.setProperty?.("--cell-x", (gridItem?.cell?.[0] || 0) as unknown as string, "")
        target?.style?.setProperty?.("--cell-y", (gridItem?.cell?.[1] || 0) as unknown as string, "")
        
        //
        whenMount();
    });
</script>

<!-- -->
<div bind:this={target} data-id={gridItem.id} data-type={type} data-ctx="default" class="ux-grid-item wavy-shaped">
    <!--<slot></slot>-->
    <LucideIcon name={icon}></LucideIcon>
</div>
