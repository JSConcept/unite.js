import { makeReactiveSet } from "../reactive/ReactiveSet.ts"
import { observeBySelector } from "../dom/Observer.ts";

//
import { writable } from "svelte/store"


//
export const switchClassSingle = (el, cname, condition) => {
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
export const isArrayLike = (a) => {
    return (Array.isArray(a) || (a!=null && typeof(a[Symbol.iterator])==='function' && typeof(a.length)==='number' &&typeof(a)!=='string'));
}

//
export const switchClass = (el, cname, condition)=>{
    if (isArrayLike(el)) {
        return Array.from(el).map((e)=>switchClassSingle(e, cname, condition));
    }
    return switchClassSingle(el, cname, condition);
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
        const task = this.tasks.get(ID);
        if (task) {
            task.inactive.set(false);
            task.detached = false;
        }
        this.focusTask(ID);
    }

    //
    minimizeTask(ID) {
        const p = this.priorityList.indexOf(ID);
        if (p >= 0) { this.priorityList.splice(p, 1); }
        this.tasks.get(ID)?.inactive?.set(true);
        if (location.hash == ID) {
            history.back();
            const crt = this.getCurrentTask()||"#";
            if (crt != location.hash) {
                location.hash = crt;
            }
        };
        this.orderLayers();
    }
    
    //
    detachTask(ID) {
        if (this.tasks.has(ID)) {
            this.tasks.get(ID).detached = true;
            this.focusTask(ID);
            this.orderLayers();
        }
    }

    //
    addTask(ID = "#settings", meta = {}) {
        if (!this.tasks.has(ID)) {
            this.priorityList.push(ID);
            this.tasks.set(ID, { detached: false, ...meta, inactive: writable(location.hash != ID) });
            if (ID != location.hash) {
                location.hash = ID;
            }
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
            const t = document.querySelectorAll(".ux-task-box[data-task=\"" + id + "\"]")

            //
            const p = this.getTaskPriority(id);
            f?.style?.setProperty?.("--z-index", p, "");

            //
            if (p >= 0) {
                switchClass(t, "ux-focus", p == (this.priorityList.length-1));
            }
            
            //
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
            if (ID != location.hash) {
                location.hash = ID;
            }
            this.orderLayers();
            return true;
        }
        return false;
    }
    
    //
    getCurrentTask() {
        return this.priorityList[this.priorityList.length-1] || "#";
    }

}
