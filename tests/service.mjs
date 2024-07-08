

//
const provide = async (path = "") => {
    path = path?.url ?? path;
    const relPath = path.replace(location.origin, "");
    if (relPath.startsWith("/opfs")) {
        const params = relPath.split(/\?/i)?.[1] || relPath;
        const $path = new URLSearchParams(params).get("path");
        const parts = $path?.split?.("/") || $path || "";

        //
        let dir = await navigator?.storage
            ?.getDirectory?.()
            ?.catch?.(console.warn.bind(console));
        for (let I = 0; I < parts.length - 1; I++) {
            if (!parts[I]) continue;
            dir = await dir
                ?.getDirectoryHandle?.(parts[I], { create: false })
                ?.catch?.(console.warn.bind(console));
            if (!dir) break;
        }

        //
        const fileh = await dir?.getFileHandle?.(parts[parts.length - 1], {
            create: false,
        });
        return await fileh?.getFile?.();
    } else if (relPath.startsWith("/")) {
        return fetch(path).then((r) => r.blob());
    }
    return null;
};

// Config
const NETWORK_TIMEOUT_MS = 6000; // hosting, amvera
//const NETWORK_TIMEOUT_MS = 3000; //localhost, router
const RUNTIME = "idc-ls";

//
const isSameOrigin = (urlString) => {
    const urlOrigin = new URL(urlString).origin;
    return urlOrigin.startsWith(self.location.origin);
};

//
const _WARN_ = (...args) => {
    const real = args.filter((v) => v != null);
    if (real && real.length > 0) {
        console.warn(...real);
    }
    //return args[0];
    return null;
};

//
const attemp = (req, event) => {
    const sendResponse = async (response) => {
        let resp = null;
        try {
            resp = await response?.clone?.();
        } catch (e) {
            console.warn(e);
            resp = response;
        }
        const cache = await caches.open(RUNTIME);
        try {
            await cache.add(resp);
        } catch (e) {
            console.warn(e);
        }
        return resp;
    };

    //
    const relPath = (req?.url ?? req).replace(location.origin, "");
    if (relPath.startsWith("/opfs")) {
        return (async () => {
            const filex = provide(relPath);
            const result = sendResponse(new Response(await filex)).catch(
                (_) => null
            );
            event?.waitUntil?.(result);
            return result;
        })();
    } else {
        const fc = new Promise((resolve, reject) =>
            setTimeout(() => reject(null), NETWORK_TIMEOUT_MS)
        ).catch(_WARN_);
        const fp = fetch(req?.url ?? req, {
            cache: "no-store",
            signal: AbortSignal.timeout(NETWORK_TIMEOUT_MS + 8000),
            mode: isSameOrigin(req?.url ?? req) ? "same-origin" : "cors",
        })
            .then(sendResponse)
            .catch((_) => null);

        //
        const promised = Promise.race([fp, fc]).catch((_) => null);
        event?.waitUntil?.(promised);
        return promised;
    }
};

//
const fit = async (req, event) => {
    const cached = caches.open(RUNTIME).then((c) =>
        c.match(req, {
            ignoreSearch: true,
            ignoreMethod: true,
            ignoreVary: true,
        })
    );

    //
    for (let i = 0; i < 3; i++) {
        try {
            const resp = await attemp(req, event);
            if (resp) {
                return resp;
            }
        } catch (e) {
            console.warn(e);
        }
        console.warn("Attemp: " + i + ", failed, trying again...");
    }

    //
    event?.waitUntil?.(cached);

    //
    return attemp(req, event)
        .then((r) => r || cached)
        .catch((e) => {
            console.warn(e);
            return cached;
        });
};

//
const putCacheAll = (list) => {
    return Promise.allSettled(
        list.map(async (it) => {
            const cache = await caches.open(RUNTIME);
            try {
                await cache.add(it);
            } catch (e) {}
        })
    ).catch(_WARN_);
};

//
const preloadNeeded = (list) => {
    return putCacheAll(list);
};

//
const PRE_CACHE_FORCE = [
    /* webpackIgnore: true */ "/assets/wallpaper/0.jpg",
    /* webpackIgnore: true */ "/index.html",
    /* webpackIgnore: true */ "/favicon.png",
    /* webpackIgnore: true */ "/manifest-pwa.json",
].map((u) => new URL(u, self.location.origin).href);

//
self?.addEventListener?.("install", (event) => {
    event.waitUntil(preloadNeeded([...PRE_CACHE_FORCE]));
});

//
self?.addEventListener?.('activate', (event) => {
    event.waitUntil(self.clients.claim());
});

//
self?.addEventListener?.('fetch', (event) => {
    event.respondWith(fit(event.request, event));
});