var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  default: () => src_default
});
module.exports = __toCommonJS(src_exports);

// ../../node_modules/.pnpm/tsup@5.12.8/node_modules/tsup/assets/cjs_shims.js
var getImportMetaUrl = () => typeof document === "undefined" ? new URL("file:" + __filename).href : document.currentScript && document.currentScript.src || new URL("main.js", document.baseURI).href;
var importMetaUrl = /* @__PURE__ */ getImportMetaUrl();

// src/index.ts
var import_path = require("path");
var import_url = require("url");
var import_extensions_sdk = require("@directus/extensions-sdk");
var import_server = require("@mrx-media/vite-vue-simple-ssr/server");
var src_default = (0, import_extensions_sdk.defineHook)(({ init }, { env }) => {
  init("routes.custom.before", async ({ app }) => {
    const root = env.VITE_ROOT ?? (0, import_path.dirname)((0, import_url.fileURLToPath)(importMetaUrl));
    const isProd = env.VITE_DEV ? !env.VITE_DEV : true;
    await (0, import_server.expressMiddleware)(app, { root, isProd });
  });
});
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {});
