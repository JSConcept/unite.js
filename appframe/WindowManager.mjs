import { makeReactiveSet } from "../reactive/ReactiveSet.ts"
import { observeBySelector } from "../dom/Observer.ts";

//
import { writable } from "svelte/store"

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
        this.tasks.get(ID)?.inactive?.set(false);
        this.focusTask(ID);
    }

    //
    minimizeTask(ID) {
        this.tasks.get(ID)?.inactive?.set(true);
        this.orderLayers();
    }

    //
    addTask(ID = "#settings", meta = {}) {
        if (!this.tasks.has(ID)) {
            this.priorityList.push(ID);
            this.tasks.set(ID, { ...meta, inactive: writable(location.hash != ID) });
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

            //
            f?.style?.setProperty?.("--z-index", this.getTaskPriority(id), "");
            //f?.classList?.remove?.("ux-hidden");

            //
            //if (S?.inactive) {
                //f?.classList?.add?.("ux-hidden");
            //}
        });
    }

    //
    focusTask(ID) {
        const p = this.getTaskPriority(ID);
        if (p >= 0) {
            location.hash = ID;
            this.priorityList.splice(p, 1);
            this.priorityList.push(ID);
            this.tasks.get(ID).inactive.set(false);
            this.orderLayers();
            return true;
        }
        return false;
    }
    
    //
    getCurrentTask() {
        return this.priorityList[this.priorityList.length-1];
    }

}
