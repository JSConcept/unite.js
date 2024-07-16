import { makeReactiveSet } from "../reactive/ReactiveSet.ts"
import { observeBySelector } from "../dom/Observer.ts";

//
import { writable } from "svelte/store"


//
const switchClass = (el, cname, condition) => {
    //
    if (condition) {
        if (!el?.classList?.contains?.(cname)) {
            el?.classList?.add?.(cname);
        }
    } else {
        if (el?.classList?.contains?.(cname)) {
            el?.classList?.remove?.(cname);
        }
    }
}


//
export class WindowManager {
    constructor() {
        this.priorityList = [];
        this.tasks = makeReactiveSet(new Map([
            //["#settings", { inactive: writable(location.hash != "#settings") }]
        ]));
        
        //
        this.orderLayers();
        
        //
        observeBySelector(document.body, ".ux-app-frame, .ux-content", () => {
            this.orderLayers();
        });
    };

    //
    getTask(ID) {
        return this.tasks.get(ID);
    }

    //
    getTasks() {
        return this.tasks;
    }

    //
    restoreTask(ID) {
        const p = this.priorityList.indexOf(ID);
        this.tasks.get(ID)?.inactive?.set(false);
        this.focusTask(ID);
    }

    //
    minimizeTask(ID) {
        const p = this.priorityList.indexOf(ID);
        if (p >= 0) { this.priorityList.splice(p, 1); }
        this.tasks.get(ID)?.inactive?.set(true);
        this.orderLayers();
    }

    //
    addTask(ID = "#settings", meta = {}) {
        if (!this.tasks.has(ID)) {
            this.priorityList.push(ID);
            this.tasks.set(ID, { detached: false, ...meta, inactive: writable(location.hash != ID) });
            location.hash = ID;
            this.orderLayers();
        }
    }
    
    //
    getTaskPriority(ID) {
        return this.priorityList.indexOf(ID);
    }
    
    //
    orderLayers() {
        this.tasks.entries().forEach(([id,S])=>{
            const f = document.querySelector(id)?.closest?.(".ux-app-frame");
            const t = document.querySelector(".ux-task-box[data-task=\"" + id + "\"]")

            //
            const p = this.getTaskPriority(id);
            f?.style?.setProperty?.("--z-index", p, "");

            //
            switchClass(t, "ux-focus", p == (this.priorityList.length-1));
            switchClass(f, "ux-focus", p == (this.priorityList.length-1));
            switchClass(f, "ux-detached", S?.detached);
        });
    }

    //
    focusTask(ID) {
        if (this.tasks.has(ID)) {
            const p = this.getTaskPriority(ID);
            if (p >= 0) { this.priorityList.splice(p, 1); }
            this.priorityList.push(ID);
            this.tasks.get(ID).inactive.set(false);
            location.hash = ID;
            this.orderLayers();
            return true;
        }
        return false;
    }
    
    //
    getCurrentTask() {
        return this.priorityList[this.priorityList.length-1] || location.hash;
    }

}
