var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
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
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target, mod));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  default: () => src_default
});
module.exports = __toCommonJS(src_exports);
var import_extensions_sdk = require("@directus/extensions-sdk");

// src/useIS24.ts
var import_oauth_1 = __toESM(require("oauth-1.0a"), 1);

// src/SECRETS.ts
var USER_ID = "87049";
var CLIENT_KEY = "MarxImmobilienKey";
var CLIENT_SECRET = "mVMz54XhbdYyAsKu";
var API_KEY = "81c95c2c-af80-44ef-a046-43985569823b";
var API_SECRET = "qGODA1RpLeiLawf++jJmc8hIgB+e04qed+RWTOeXuFCD99OEMVjjGrBWogOpJ6CqnbRplb4swho5TzKjFCuDKZLrzeJaL7/sRiPsFsKnRWA=";
var API_TOKEN = {
  key: API_KEY,
  secret: API_SECRET
};

// src/useIS24.ts
var import_crypto = __toESM(require("crypto"), 1);
var __oauth;
var useIS24 = () => {
  const baseURL = "https://rest.immobilienscout24.de/restapi/api";
  const baseHEAD = { Accept: "application/json" };
  if (!__oauth) {
    __oauth = new import_oauth_1.default({
      consumer: { key: CLIENT_KEY, secret: CLIENT_SECRET },
      signature_method: "HMAC-SHA1",
      hash_function: (base_string, key) => import_crypto.default.createHmac("sha1", key).update(base_string).digest("base64")
    });
  }
  const listRealEstates = async () => {
    const url = [baseURL, "/offer/v1.0/user/", USER_ID, "/realestate?publishchannel=IS24"].join("");
    const headers = { ...baseHEAD, ...__oauth.toHeader(__oauth.authorize({ url, method: "GET" }, API_TOKEN)) };
    const response = await fetch(url, { headers, method: "GET" });
    const result = await response.json();
    return result;
  };
  return {
    listRealEstates
  };
};

// src/index.ts
var src_default = (0, import_extensions_sdk.defineEndpoint)({
  id: "is24",
  handler: (router) => {
    router.get("/", async (req, res) => {
      const { listRealEstates } = useIS24();
      const result = await listRealEstates();
      res.json(result);
    });
  }
});
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {});
