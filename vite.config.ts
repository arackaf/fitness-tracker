/// <reference types="vitest/config" />
import { defineConfig } from "vite";

import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import tsconfigPaths from "vite-tsconfig-paths";

import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { cloudflare } from "@cloudflare/vite-plugin";

const config = defineConfig({
  plugins: [
    !process.env.VITEST && cloudflare({ viteEnvironment: { name: "ssr" } }),
    tsconfigPaths({ projects: ["./tsconfig.json"] }),
    tailwindcss(),
    tanstackStart(),
    viteReact(),
  ],
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    environment: "node",
  },
});

export default config;
