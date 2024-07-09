// Require the framework
import Fastify from "fastify";

// Require library to exit fastify process, gracefully (if possible)
import closeWithGrace from "close-with-grace";

// Import your application
import appService, { options } from "./router.mjs";

//
export const server = async () => {
    // Instantiate Fastify with some config
    const app = Fastify({
        ...options,
        logger: true,
    });

    // Register your application as a normal plugin.
    app.register(appService);

    // delay is the number of milliseconds for the graceful close to finish
    const closeListeners = closeWithGrace(
        { delay: process.env.FASTIFY_CLOSE_GRACE_DELAY || 500 },
        async function ({ signal, err, manual }) {
            if (err) {
                app.log.error(err);
            }
            await app.close();
        }
    );

    //
    app.addHook("onClose", async (instance, done) => {
        closeListeners.uninstall();
        done();
    });

    //
    return app;
};

//
export default server;
