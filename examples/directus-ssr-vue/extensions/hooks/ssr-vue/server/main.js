import { createSSRApp, useSSRContext, resolveComponent } from 'vue';
import { renderToString, ssrRenderComponent, ssrRenderAttrs } from 'vue/server-renderer';
import { createRouter, createMemoryHistory, createWebHistory } from 'vue-router';
import { createHead } from '@vueuse/head';

var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// ../../node_modules/.pnpm/tsup@5.12.8_typescript@4.7.0-beta/node_modules/tsup/assets/esm_shims.js
var init_esm_shims = __esm({
  "../../node_modules/.pnpm/tsup@5.12.8_typescript@4.7.0-beta/node_modules/tsup/assets/esm_shims.js"() {
  }
});

// src/utils/index.ts
var isNode, findDependencies, renderPreloadLinks, simpleLog;
var init_utils = __esm({
  "src/utils/index.ts"() {
    init_esm_shims();
    isNode = () => !!(typeof process !== "undefined" && process.versions && process.versions.node);
    findDependencies = (modules, manifest) => {
      const files = /* @__PURE__ */ new Set();
      for (const id of modules || []) {
        for (const file of manifest[id] || []) {
          files.add(file);
        }
      }
      return [...files];
    };
    renderPreloadLinks = (files) => {
      let link = "";
      for (const file of files || []) {
        if (file.endsWith(".js")) {
          link += `<link rel="modulepreload" crossorigin href="${file}">`;
        } else if (file.endsWith(".css")) {
          link += `<link rel="stylesheet" href="${file}">`;
        } else if (file.endsWith(".woff")) {
          link += ` <link rel="preload" href="${file}" as="font" type="font/woff" crossorigin>`;
        } else if (file.endsWith(".woff2")) {
          link += ` <link rel="preload" href="${file}" as="font" type="font/woff2" crossorigin>`;
        } else if (file.endsWith(".gif")) {
          link += ` <link rel="preload" href="${file}" as="image" type="image/gif">`;
        } else if (file.endsWith(".jpg") || file.endsWith(".jpeg")) {
          link += ` <link rel="preload" href="${file}" as="image" type="image/jpeg">`;
        } else if (file.endsWith(".png")) {
          link += ` <link rel="preload" href="${file}" as="image" type="image/png">`;
        }
      }
      return link;
    };
    simpleLog = (msg, level = "info") => {
      const now = new Date();
      const icon = {
        info: "\u{1F680}",
        error: "\u{1F41E}",
        warn: "\u26A0\uFE0F"
      }[level];
      console.log(`\x1B[35m[${now.getHours()}:${now.getMinutes()}]\x1B[0m - ${icon} ${msg}`);
    };
  }
});
var __defProp2, __defProps, __getOwnPropDescs, __getOwnPropSymbols, __hasOwnProp, __propIsEnum, __defNormalProp, __spreadValues, __spreadProps, HEAD_COUNT_KEY, HEAD_ATTRS_KEY, SELF_CLOSING_TAGS, htmlEscape, stringifyAttrs, tagToString, renderHeadToString;
var init_dist = __esm({
  "../../node_modules/.pnpm/@vueuse+head@0.7.6_vue@3.2.34/node_modules/@vueuse/head/dist/index.mjs"() {
    init_esm_shims();
    __defProp2 = Object.defineProperty;
    __defProps = Object.defineProperties;
    __getOwnPropDescs = Object.getOwnPropertyDescriptors;
    __getOwnPropSymbols = Object.getOwnPropertySymbols;
    __hasOwnProp = Object.prototype.hasOwnProperty;
    __propIsEnum = Object.prototype.propertyIsEnumerable;
    __defNormalProp = (obj, key, value) => key in obj ? __defProp2(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
    __spreadValues = (a, b) => {
      for (var prop in b || (b = {}))
        if (__hasOwnProp.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      if (__getOwnPropSymbols)
        for (var prop of __getOwnPropSymbols(b)) {
          if (__propIsEnum.call(b, prop))
            __defNormalProp(a, prop, b[prop]);
        }
      return a;
    };
    __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
    HEAD_COUNT_KEY = `head:count`;
    HEAD_ATTRS_KEY = `data-head-attrs`;
    SELF_CLOSING_TAGS = ["meta", "link", "base"];
    htmlEscape = (str) => str.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/'/g, "&#39;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    stringifyAttrs = (attributes) => {
      const handledAttributes = [];
      for (let [key, value] of Object.entries(attributes)) {
        if (key === "children" || key === "key") {
          continue;
        }
        if (value === false || value == null) {
          continue;
        }
        let attribute = htmlEscape(key);
        if (value !== true) {
          attribute += `="${htmlEscape(String(value))}"`;
        }
        handledAttributes.push(attribute);
      }
      return handledAttributes.length > 0 ? " " + handledAttributes.join(" ") : "";
    };
    tagToString = (tag) => {
      let attrs = stringifyAttrs(tag.props);
      if (SELF_CLOSING_TAGS.includes(tag.tag)) {
        return `<${tag.tag}${attrs}>`;
      }
      return `<${tag.tag}${attrs}>${tag.props.children || ""}</${tag.tag}>`;
    };
    renderHeadToString = (head) => {
      const tags = [];
      let titleTag = "";
      let htmlAttrs = {};
      let bodyAttrs = {};
      for (const tag of head.headTags) {
        if (tag.tag === "title") {
          titleTag = tagToString(tag);
        } else if (tag.tag === "htmlAttrs") {
          Object.assign(htmlAttrs, tag.props);
        } else if (tag.tag === "bodyAttrs") {
          Object.assign(bodyAttrs, tag.props);
        } else {
          tags.push(tagToString(tag));
        }
      }
      tags.push(`<meta name="${HEAD_COUNT_KEY}" content="${tags.length}">`);
      return {
        get headTags() {
          return titleTag + tags.join("");
        },
        get htmlAttrs() {
          return stringifyAttrs(__spreadProps(__spreadValues({}, htmlAttrs), {
            [HEAD_ATTRS_KEY]: Object.keys(htmlAttrs).join(",")
          }));
        },
        get bodyAttrs() {
          return stringifyAttrs(__spreadProps(__spreadValues({}, bodyAttrs), {
            [HEAD_ATTRS_KEY]: Object.keys(bodyAttrs).join(",")
          }));
        }
      };
    };
  }
});

// src/vue/entry-server.ts
var entry_server_exports = {};
__export(entry_server_exports, {
  default: () => entry_server_default
});
var simpleSSR, entry_server_default;
var init_entry_server = __esm({
  "src/vue/entry-server.ts"() {
    init_esm_shims();
    init_dist();
    init_utils();
    simpleSSR = async (App, { routes, initialState = {} }, hook) => {
      return async (url, manifest, context) => {
        const app = createSSRApp(App);
        const router = createRouter({
          history: createMemoryHistory(),
          routes
        });
        const { head } = await hook({
          app,
          router,
          initialState,
          ...context
        });
        app.use(router);
        router.push(url);
        await router.isReady();
        const ctx = {};
        const html = await renderToString(app, ctx);
        let preloadLinks = "";
        if (manifest) {
          const dependencies = findDependencies(ctx.modules, manifest);
          preloadLinks = renderPreloadLinks(dependencies);
        }
        const {
          headTags = "",
          htmlAttrs = "",
          bodyAttrs = ""
        } = renderHeadToString(head);
        return { html, preloadLinks, headTags, htmlAttrs, bodyAttrs, initialState };
      };
    };
    entry_server_default = simpleSSR;
  }
});

// src/vue/entry-client.ts
var entry_client_exports = {};
__export(entry_client_exports, {
  default: () => entry_client_default
});
var simpleSSR2, entry_client_default;
var init_entry_client = __esm({
  "src/vue/entry-client.ts"() {
    init_esm_shims();
    init_utils();
    simpleSSR2 = async (App, { routes, debug = false }, hook) => {
      const app = createSSRApp(App);
      const router = createRouter({
        history: createWebHistory(),
        routes
      });
      const initialState = window.__INITIAL_STATE__;
      await hook({ app, router, initialState, isClient: true });
      app.use(router);
      router.beforeEach(() => {
      });
      await router.isReady();
      if (!debug)
        app.mount("#app", true);
      else {
        let seconds = 3;
        simpleLog(`Debug mode is on`, "warn");
        simpleLog(`Hydrating app in ${seconds}`);
        const interval = setInterval(() => {
          seconds--;
          if (seconds > 0)
            simpleLog(`Hydrating app in ${seconds}`);
        }, 1e3);
        setTimeout(() => {
          clearInterval(interval);
          app.mount("#app", true);
          simpleLog(`App hydrated!`);
        }, 3e3);
      }
    };
    entry_client_default = simpleSSR2;
  }
});

// src/vue/index.ts
init_esm_shims();
init_utils();
var simpleSSR3 = async (app, options, hook) => {
  const { default: entry } = isNode() ? await Promise.resolve().then(() => (init_entry_server(), entry_server_exports)) : await Promise.resolve().then(() => (init_entry_client(), entry_client_exports));
  return await entry(app, options, hook);
};

var _export_sfc = (sfc, props) => {
  const target = sfc.__vccOpts || sfc;
  for (const [key, val] of props) {
    target[key] = val;
  }
  return target;
};

const _sfc_main$1 = {};

function _sfc_ssrRender$1(_ctx, _push, _parent, _attrs) {
  const _component_router_view = resolveComponent("router-view");

  _push(ssrRenderComponent(_component_router_view, _attrs, null, _parent));
}
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext()
  ;(ssrContext.modules || (ssrContext.modules = new Set())).add("src/App.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : undefined
};
var App = /*#__PURE__*/_export_sfc(_sfc_main$1, [['ssrRender',_sfc_ssrRender$1]]);

const routes = [
  {
    path: "/",
    component: () => Promise.resolve().then(function () { return Home$1; })
  }
];
var main = await simpleSSR3(App, { routes, debug: true }, async (ctx) => {
  const { app } = ctx;
  const head = createHead();
  app.use(head);
  return { head };
});

const _sfc_main = {};

function _sfc_ssrRender(_ctx, _push, _parent, _attrs) {
  _push(`<div${ssrRenderAttrs(_attrs)}>Home2</div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext()
  ;(ssrContext.modules || (ssrContext.modules = new Set())).add("src/pages/Home.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : undefined
};
var Home = /*#__PURE__*/_export_sfc(_sfc_main, [['ssrRender',_sfc_ssrRender]]);

var Home$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  'default': Home
}, Symbol.toStringTag, { value: 'Module' }));

export { main as default };
