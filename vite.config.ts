
//
const useBabel = true;
const sourceMapsInProduction = true;

//
import {svelte} from "@sveltejs/vite-plugin-svelte";
import legacy from "@vitejs/plugin-legacy";
import autoprefixer from "autoprefixer";
import path from "node:path";
import sveltePreprocess from "svelte-preprocess";
import {defineConfig, type UserConfig} from "vite";
import VitePluginBrowserSync from 'vite-plugin-browser-sync';
import prefetchPlugin from 'vite-plugin-bundle-prefetch';
import {compression} from "vite-plugin-compression2";
import {nodePolyfills} from "vite-plugin-node-polyfills";
import {VitePWA} from "vite-plugin-pwa";
import {viteStaticCopy} from "vite-plugin-static-copy";
import certificate from "./https/certificate.mjs";
import pkg from "./package.json";
import tsconfig from "./tsconfig.json";
import dts from "vite-plugin-dts";

//
const __dirname = import.meta.dirname;

//
const r = (s) => {
    return s;
};

/*process.env = {
    ...process.env,
    ...loadEnv(mode, process.cwd())
};*/

//
const production = process.env.NODE_ENV === 'production';
const config = <UserConfig>defineConfig({
    root: "./",
    resolve: {
        alias: {
            "@": r("/src"),
            "@src": r("/src")
        },
    },
    plugins: [
        //analyzer(),
        nodePolyfills(),
        compression({
            algorithm: 'brotliCompress'
        }),
        prefetchPlugin(),
        VitePluginBrowserSync(),
        svelte({
            emitCss: production,
            preprocess: sveltePreprocess(),
        }),
        VitePWA({
            injectRegister: null,
            registerType: "autoUpdate",
            devOptions: {
                enabled: true,
                resolveTempFolder: () => {
                    return "./webapp";
                },
            },
            workbox: {
                clientsClaim: true,
                skipWaiting: true,
            },
        }),
        viteStaticCopy({
            targets: [
                {
                    src: "./assets/*",
                    dest: "./assets", // 2️⃣
                },
                {
                    src: "./src/copying/*",
                    dest: "./", // 2️⃣
                },
                {
                    src: "./https/*",
                    dest: "./https/", // 2️⃣
                },
            ],
        }), dts()
    ],
    server: {
        cors: true,
        host: "0.0.0.0",
        port: 8000,
        https: {
            ...certificate,
        },
        headers: {
            "Service-Worker-Allowed": "/",
            "Permissions-Policy": "fullscreen=*, window-management=*",
            "Cross-Origin-Embedder-Policy": "require-corp",
            "Cross-Origin-Opener-Policy": "same-origin"
        }
    },
    esbuild: {
        target: "esnext"
    },
    build: {
        modulePreload: true,
        target: ["esnext", "es2020"],
        sourcemap: sourceMapsInProduction,
        outDir: "./webapp",
        emptyOutDir: true,
        rollupOptions: {
            input: "./index.html"
        },
    },
    css: {
        postcss: {
            plugins: [autoprefixer()],
        },
    },

    optimizeDeps: {
        esbuildOptions: {target: "esnext", supported: {bigint: true}},
    },
});

// Babel
if (useBabel) {
    config.plugins?.unshift(
        legacy({
            targets: pkg.browserslist,
        }),
    );
}

// Load path aliases from the tsconfig.json file
const aliases = tsconfig.compilerOptions.paths;

for (const alias in aliases) {
    const paths = aliases[alias].map((p: string) => path.resolve(__dirname, p));

    // Our tsconfig uses glob path formats, whereas vite just wants directories
    // We'll need to transform the glob format into a format acceptable to vite

    const viteAlias = alias.replace(/(\\|\/)\*$/, '');
    const vitePaths = paths.map((p: string) => p.replace(/(\\|\/)\*$/, ''));

    if (!config.resolve) config.resolve = {};
    if (!config.resolve.alias) config.resolve.alias = {};

    if (config.resolve && config.resolve.alias && !(viteAlias in config.resolve.alias)) {
        config.resolve.alias[viteAlias] = vitePaths.length > 1 ? vitePaths : vitePaths[0];
    }
}

//
export default config;
