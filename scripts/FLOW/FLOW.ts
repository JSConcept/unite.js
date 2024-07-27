import PromiseStack from '../utils/PromiseStack';

// FLOW - is web worker library core (low-level)...
export default class FLOW {
    #worker: Worker | null = null;
    #promiseStack: PromiseStack | null = null;
    #imports = {};

    //
    constructor(worker) {
        this.#worker = worker || new Worker("./FLOW-Unit.ts");
        this.#promiseStack = new PromiseStack();
        this.#imports = {};

        //
        const self: WorkerGlobalScope | Worker | null = this.#worker;
        self?.addEventListener("message", (ev)=>{
            const {cmd, uuid, dir} = ev.data;
            if (dir == "req") {
                if (cmd == "import") {
                    import(ev.data.source).then((m)=>{
                        Object.assign(this.#imports, m);
                        self?.postMessage({ cmd, uuid, dir: "res", result: "ok" });
                    });
                } else
                if (cmd == "call") {
                    // call with FLOW "this" context
                    const syncOrAsync = this.#imports[ev.data.name]?.apply(self, ev.data.args);
                    const resolveWith = (pass)=>{
                        const [result, transfer] = pass;
                        self?.postMessage({ cmd, uuid, dir: "res", result }, [...new Set(transfer||[])] as StructuredSerializeOptions);
                    }

                    //
                    if (syncOrAsync instanceof Promise || typeof syncOrAsync?.then == "function") {
                        syncOrAsync.then(resolveWith);
                    } else {
                        resolveWith(syncOrAsync);
                    }
                }
            } else
            if (dir == "res") {
                this.#promiseStack?.resolveBy?.(uuid, ev.data.result);
            }
        });
    }

    //
    importToSelf(module) {
        Object.assign(this.#imports, module);
        return this;
    }

    //
    importToUnit(source) {
        const pair = this.#promiseStack?.create();
        this.#worker?.postMessage?.({
            cmd: "import",
            dir: "req",
            uuid: pair?.[0] || "",
            source
        });
        return pair?.[1];
    }

    //
    callTask(args = [], transfer = []) {
        const pair = this.#promiseStack?.create();
        this.#worker?.postMessage?.({
            cmd: "call",
            dir: "req",
            uuid: pair?.[0] || "",
            args
        }, [...new Set(transfer||[])] as StructuredSerializeOptions);
        return pair?.[1];
    }
}
