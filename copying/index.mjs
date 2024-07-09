import { options } from "./router.mjs";
import server from "./server.mjs";

//
const app = await server();

// Start listening.
try {
    app.listen({ ...options, port: process.env.PORT || 8000 }, (err) => {
        if (err) {
            app.log.error(err);
        }
    })?.catch?.(console.warn.bind(console));
} catch (e) {
    console.warn(e);
}
