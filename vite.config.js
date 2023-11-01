//@ts-check
import {defineConfig} from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: ["wc/listo-lists-manager.ts", "wc/listo-list.ts"],
      formats: ["es"],
    },
    outDir: "assets/js/build",
    target: ["es2022"],
    rollupOptions: {
      external: ["lit", "rxjs"],
    },
  },
});
