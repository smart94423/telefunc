import { Plugin } from "vite";
import type { InputOption } from "rollup";
import { assert, isObject } from "../server/utils";

export { build };

function build(): Plugin {
  return {
    name: "telefunc:build",
    apply: "build",
    config: (config) => {
      if (!isSSR(config)) {
        return;
      }
      const viteEntry = getViteEntry();
      const input = {
        ...viteEntry,
        ...normalizeRollupInput(config.build?.rollupOptions?.input),
      };
      return {
        build: {
          rollupOptions: { input },
        },
        ssr: { external: ["vite-plugin-ssr"] },
      };
    },
  };
}

function normalizeRollupInput(input?: InputOption): Record<string, string> {
  if (!input) {
    return {};
  }
  /*
  if (typeof input === "string") {
    return { [input]: input };
  }
  if (Array.isArray(input)) {
    return Object.fromEntries(input.map((i) => [i, i]));
  }
  */
  assert(isObject(input))
  return input;
}

function getViteEntry() {
  const fileName = "importTelefuncFiles";
  const pluginDist = `../../../dist`;
  const esmPath = require.resolve(`${pluginDist}/esm/vite/${fileName}.js`);
  const viteEntry = {
    [fileName]: esmPath
  }
  return viteEntry;
}

function isSSR(config: { build?: { ssr?: boolean | string } }): boolean {
  return !!config?.build?.ssr;
}
