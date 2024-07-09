<script type="ts" lang="ts">
    import {onMount} from 'svelte';
    import {observeBySelector} from "../dom/Observer.ts";
    import {grabForDrag} from "../interact/PointerAPI";
    import {createReactiveSet} from "../reactive/ReactiveSet";
    import {MOC, zoomOf} from "../utils/Utils";
    import {animationSequence, GridItemType, GridPageType, putToCell} from "./GridItemUtils";
    import GridPage from "./GridPage.svelte";
    
    // TODO! make it optional...
    // Make it as `export`s!
    import {state} from "./GridState";
    
    //
    export let current = "main";
    
    //
    export let lists = state.lists;
    export let grids = state.grids;
    export let items = state.items;
    export let backup = createReactiveSet<string>([]);
    
    //
    let target: HTMLElement | null = null;
    
    //
    const initGrab = (ev)=> {
        ev?.stopPropagation?.();
        if (ev.target?.dataset?.id) {
            backup.add(ev.target.dataset.id as string);
            const item = items.get(ev.target.dataset.id);
            if (item) { item.pointerId = ev.pointerId; }
            
            // may broke multi-touch dragging! (if unsupported partial redraw)
            backup = backup; // trigger re-draw
        }
    }
    
    //
    const grabItem = (ev)=>{
        //
        const dragState = {
            pointerId: ev.pointerId,
            startX: ev.clientX / zoomOf(),
            startY: ev.clientY / zoomOf()
        };

        //
        const grabEvent: ["pointermove", (e: PointerEvent)=>any, AddEventListenerOptions] = ["pointermove", (evm: PointerEvent)=>{
            if (dragState.pointerId == evm.pointerId && Math.hypot(
                dragState.startX - (evm.clientX / zoomOf()), 
                dragState.startY - (evm.clientY / zoomOf())
            ) >= 10) {
                initGrab(evm); document.documentElement.removeEventListener(...grabEvent);
            }
        }, {capture: true, passive: true}];

        //
        document.documentElement.addEventListener(...grabEvent);
        document.documentElement.addEventListener("pointerup", ()=>{
            document.documentElement.removeEventListener(...grabEvent);
        }, {once: true});
    }
    
    //
    document.addEventListener("long-press", (ev)=>{
        if (MOC(ev.target, ".ux-grid-item[data-type=\"items\"]")) {
            grabItem(ev.detail);
        }
    });
    
    //
    const placeElement = async ({pointer, holding})=>{
        const el = holding.element.deref();
        const id = el.dataset.id;
        
        //
        const bbox = el.parentNode.getBoundingClientRect();
        const xy: [number, number] = [pointer.current[0] - (bbox?.left || 0), pointer.current[1] - (bbox?.top || 0)];
        
        //
        const prev = [...(items?.get?.(id)?.cell || [0, 0])];
        const item: GridItemType = items.get(id) as unknown as GridItemType;
        const page: GridPageType = grids.get(current) as unknown as GridPageType;
        
        //
        putToCell({ items, item, page }, xy);
        if (item) { item.pointerId = -1; }
        
        //
        el.style.setProperty("--p-cell-x", prev[0], "");
        el.style.setProperty("--p-cell-y", prev[1], "");
        el.style.setProperty("--cell-x", (item?.cell?.[0] || 0) as unknown as string, "");
        el.style.setProperty("--cell-y", (item?.cell?.[1] || 0) as unknown as string, "");
        
        //
        await el.animate(animationSequence(), {
            fill: "forwards",
            duration: 150,
            rangeStart: "cover 0%",
            rangeEnd: "cover 100%",
        }).finished;
        
        //
        const real = target?.querySelector?.(".ux-grid-item[data-type=\"items\"][data-id=\"" + el.dataset.id + "\"]") as HTMLElement;
        if (real) {
            real.classList.remove("ux-hidden");
            real.style.setProperty("--cell-x", (item?.cell?.[0] || 0) as unknown as string, "");
            real.style.setProperty("--cell-y", (item?.cell?.[1] || 0) as unknown as string, "");
        }
        
        //
        if (!lists?.get?.(current)?.has?.(id)) {
            const oldList = Array.from(lists.values()).find((L)=>{
                return L.has(id);
            });
            
            //
            if (oldList) {
                oldList.delete(id);
                lists?.get?.(current)?.add?.(id);
                
                // trigger re-draw
                lists = lists;
                items = items;
            }
        }

        // trigger icon state change (localStorage)
        if (item) items?.set?.(id, item);

        // trigger dis-appear of backup elements
        // may broke multi-touch dragging! (if unsupported partial redraw)
        backup.delete(id);
        backup = backup;
    }
    
    //
    document.addEventListener("m-dragend", (ev)=>{
        if (MOC(ev.target, ".ux-grid-item[data-type=\"backup\"]")) {
            placeElement(ev.detail);
        }
    });
    
    //
    onMount(()=>{
        observeBySelector(target, ".ux-grid-item[data-type=\"backup\"]", (mut)=>{
            mut.addedNodes.map((el)=>{
                const real = target?.querySelector?.(".ux-grid-item[data-type=\"items\"][data-id=\"" + el.dataset.id + "\"]");
                if (!real?.classList?.contains?.("ux-hidden")) {
                    real?.classList?.add?.("ux-hidden");
                }
                
                //
                const item = items.get(el.dataset.id);
                grabForDrag(el, item);
                
                //
                el.style.setProperty("--cell-x", item?.cell[0] || 0, "");
                el.style.setProperty("--cell-y", item?.cell[1] || 0, "");
                el.style.setProperty("--p-cell-x", item?.cell[0] || 0, "");
                el.style.setProperty("--p-cell-y", item?.cell[1] || 0, "");
            });
        });
        
        //
        observeBySelector(target, ".ux-grid-item[data-type=\"items\"]", (mut)=>{
            mut.addedNodes.map((el)=>{
                const visual = target?.querySelector?.(".ux-grid-item[data-type=\"backup\"][data-id=\"" + el.dataset.id + "\"]");
                if (visual) {
                    // avoid re-appear
                    if (!el.classList.contains("ux-hidden")) {
                        el.classList.add("ux-hidden");
                    }
                }
            });
        });
    });
</script>

<!-- -->
<div bind:this={target} class="ux-grid-pages stretch grid-based-box ux-transparent">
    <GridPage list={lists.get(current)} gridPage={grids.get(current)} items={items} type="labels"></GridPage>
    <GridPage list={lists.get(current)} gridPage={grids.get(current)} items={items} type="items"></GridPage>
    <GridPage list={backup} items={items} type="backup"></GridPage>
</div>
