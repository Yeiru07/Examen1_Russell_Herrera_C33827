
import { defineConfig } from "vite";

const prod = process.env.NODE_ENV === "production";

export default defineConfig({
    base: prod ? "/Examen1_Russell_Herrera_C33827/" : "./",
    mode: prod ? "production" : "development",
    server: {
        port: 1234
    },
    build: {
        outDir: "dist",
        emptyOutDir: true
    }
});
