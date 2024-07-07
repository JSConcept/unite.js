<script>
    import {observeBySelector} from "dom/Observer";
    import GridPage from "grid/GridPage.svelte";
    import {createReactiveSet} from "reactive/ReactiveSet";
    import {animationSequence} from "./GridItemUtils";
    import * as state from "./GridState";
    
    //
    export let current = "";
    
    //
    export let lists = state.lists;
    export let grids = state.grids;
    export let items = state.items;
    export let backup = createReactiveSet([]);
    
    //
    let target = null;
    
    //
    const initGrab = (ev)=> {
        ev?.stopPropagation?.();
        if (ev.target?.dataset?.id) {
            backup.add(ev.target.dataset.id);
            
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
        const grabEvent = ["pointermove", (evm)=>{
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
    const placeElement = async ({pointer, holding})=>{
        const el = holding.element.deref();
        const id = el.dataset.id;
        
        //
        const bbox = el.parentNode.getBoundingClientRect();
        const xy = [pointer.current[0] - (bbox?.left || 0), pointer.current[1] - (bbox?.top || 0)];
        
        //
        const prev = [...items.get(id).cell];
        const cell = putToCell({ items, grids, item: items.get(id) }, xy);
        
        //
        el.style.setProperty("--p-cell-x", prev[0], "");
        el.style.setProperty("--p-cell-y", prev[1], "");
        
        //
        await el.animate(animationSequence(), {
            fill: "none",
            duration: 100,
            rangeStart: "cover 0%",
            rangeEnd: "cover 100%",
        }).finished;
        
        //
        const real = target.querySelector(".ux-grid-item[data-type=\"item\"][data-id=\"" + el.dataset.id + "\"]");
        real.classList.remove("ux-hidden");
        
        //
        if (!lists.get(current).has(id)) {
            const oldList = Array.from(lists.values()).find((L)=>{
                return L.has(id);
            });
            
            //
            if (oldList) {
                oldList.delete(id);
                lists.get(current).add(id);
                
                // trigger re-draw
                lists = lists;
            }
        }

        // trigger dis-appear of backup elements
        // may broke multi-touch dragging! (if unsupported partial redraw)
        backup.delete(id);
        backup = backup;
    }
    
    //
    document.addEventListener("m-dragend", (ev)=>{
        if (ev.target.matches(".ux-grid-item[data-type=\"backup\"]")) {
            placeElement(ev.detail);
        }
    });
    
    //
    onMount(()=>{
        observeBySelector(target, ".ux-grid-item[data-type=\"backup\"]", (mut)=>{
            mut.addedNodes.map((el)=>{
                const real = target.querySelector(".ux-grid-item[data-type=\"items\"][data-id=\"" + el.dataset.id + "\"]");
                if (!real.classList.contains("ux-hidden")) {
                    real.classList.add("ux-hidden");
                }
                grabForDrag(el, items.get(el.dataset.id));
            });
        });
        
        //
        observeBySelector(target, ".ux-grid-item[data-type=\"items\"]", (mut)=>{
            mut.addedNodes.map((el)=>{
                const visual = target.querySelector(".ux-grid-item[data-type=\"backup\"][data-id=\"" + el.dataset.id + "\"]");
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
<div bind:this={target} class="ux-grid-pages">
    <GridPage lists={lists} list={lists.get(current)} gridPage={grids.get(current)} items={items} type="labels"></GridPage>
    <GridPage lists={lists} list={lists.get(current)} gridPage={grids.get(current)} items={items} type="items"></GridPage>
    <GridPage lists={lists} list={backup} gridPage={"backup"} items={items} type="backup"></GridPage>
</div>
