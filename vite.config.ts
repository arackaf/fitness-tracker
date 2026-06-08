import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

import { tanstackStart } from "@tanstack/react-start/plugin/vite";

import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { nitro } from "nitro/vite";

const config = defineConfig({
  plugins: [
    tsconfigPaths({ projects: ["./tsconfig.json"] }),
    tailwindcss(),
    tanstackStart(),
    viteReact(),
    nitro({
      rollupConfig: {
        external: [
          /^@sentry\//,
          "better-auth",
          /^@better-auth\//,
          "kysely",
          "@noble/ciphers",
          "@noble/hashes",
          "jose",
        ],
      },
    }),
  ],
  ssr: {
    external: [
      "better-auth",
      /^@better-auth\//,
      "kysely",
      "@noble/ciphers",
      "@noble/hashes",
      "jose",
    ],
  },
});

export default config;
