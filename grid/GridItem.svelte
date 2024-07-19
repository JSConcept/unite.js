<script type="ts" lang="ts">
    import {onMount} from 'svelte';
    import LucideIcon from "../design/WLucideIcon.svelte";
    import GestureControl from "../interact/Gesture.ts";
    import type {GridItemType} from "./GridItemUtils.ts";

    // @ts-ignore
    export let gridItem: GridItemType = {};
    export let type = "items";

    //
    let target: HTMLElement | null = null;
    let icon = gridItem.icon || "";
    let href = gridItem.href || "";
    let action = gridItem.action || "";

    //
    $: gridItem?.["@subscribe"]?.((v)=>{
        target?.style?.setProperty?.("--cell-x", v[0], "")
        target?.style?.setProperty?.("--cell-y", v[1], "")
    }, "cell");

    //
    $: gridItem?.["@subscribe"]?.((v)=>{ href = v; }, "href");
    $: gridItem?.["@subscribe"]?.((v)=>{ icon = v; }, "icon");
    $: gridItem?.["@subscribe"]?.((v)=>{ action = v; }, "action");
    
    //
    export let whenMount = ()=>{};
    export let onClick = (_: PointerEvent | MouseEvent)=>{}
    
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

<!-- svelte-ignore a11y_no_static_element_interactions -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<div on:click={onClick} bind:this={target} data-id={gridItem.id} data-action={action||""} data-href={href||""} data-type={type} data-ctx="grid-item" class="ux-grid-item wavy-shaped ux-accent-inverse">
    <!--<slot></slot>-->
    <LucideIcon name={icon}></LucideIcon>
</div>
