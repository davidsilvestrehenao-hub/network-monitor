import process from 'node:process';globalThis._importMeta_=globalThis._importMeta_||{url:"file:///_entry.js",env:process.env};import destr from 'file:///Users/david/Documents/Projects/network-monitor/node_modules/destr/dist/index.mjs';
import { defineEventHandler, handleCacheHeaders, splitCookiesString, createEvent, fetchWithEvent, isEvent, eventHandler, setHeaders, sendRedirect, proxyRequest, getRequestURL, setResponseStatus, getResponseHeader, setResponseHeaders, send, getRequestHeader, appendResponseHeader, removeResponseHeader, createError, setResponseHeader, createApp, createRouter as createRouter$1, toNodeListener, lazyEventHandler } from 'file:///Users/david/Documents/Projects/network-monitor/node_modules/nitropack/node_modules/h3/dist/index.mjs';
import { createHooks } from 'file:///Users/david/Documents/Projects/network-monitor/node_modules/hookable/dist/index.mjs';
import { createFetch, Headers as Headers$1 } from 'file:///Users/david/Documents/Projects/network-monitor/node_modules/ofetch/dist/node.mjs';
import { fetchNodeRequestHandler, callNodeRequestHandler } from 'file:///Users/david/Documents/Projects/network-monitor/node_modules/node-mock-http/dist/index.mjs';
import { parseURL, withoutBase, joinURL, getQuery, withQuery, decodePath, withLeadingSlash, withoutTrailingSlash } from 'file:///Users/david/Documents/Projects/network-monitor/node_modules/ufo/dist/index.mjs';
import { createStorage, prefixStorage } from 'file:///Users/david/Documents/Projects/network-monitor/node_modules/unstorage/dist/index.mjs';
import unstorage_47drivers_47fs from 'file:///Users/david/Documents/Projects/network-monitor/node_modules/unstorage/drivers/fs.mjs';
import unstorage_47drivers_47fs_45lite from 'file:///Users/david/Documents/Projects/network-monitor/node_modules/unstorage/drivers/fs-lite.mjs';
import { digest } from 'file:///Users/david/Documents/Projects/network-monitor/node_modules/nitropack/node_modules/ohash/dist/index.mjs';
import { klona } from 'file:///Users/david/Documents/Projects/network-monitor/node_modules/klona/dist/index.mjs';
import defu, { defuFn } from 'file:///Users/david/Documents/Projects/network-monitor/node_modules/defu/dist/defu.mjs';
import { snakeCase } from 'file:///Users/david/Documents/Projects/network-monitor/node_modules/scule/dist/index.mjs';
import { AsyncLocalStorage } from 'node:async_hooks';
import { getContext } from 'file:///Users/david/Documents/Projects/network-monitor/node_modules/unctx/dist/index.mjs';
import { toRouteMatcher, createRouter } from 'file:///Users/david/Documents/Projects/network-monitor/node_modules/radix3/dist/index.mjs';
import _HHQ6PALebcRabpJs4h3PC6jXF81QQ8Jp6oyWsZuWw from 'file:///Users/david/Documents/Projects/network-monitor/node_modules/vinxi/lib/app-fetch.js';
import _UC47q1O82Z2W4Iv9XpPdXmzzM7VVz7QWK0nGg8mifY from 'file:///Users/david/Documents/Projects/network-monitor/node_modules/vinxi/lib/app-manifest.js';
import { promises } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'file:///Users/david/Documents/Projects/network-monitor/node_modules/pathe/dist/index.mjs';
import { parseSetCookie } from 'file:///Users/david/Documents/Projects/network-monitor/node_modules/cookie-es/dist/index.mjs';
import { fromJSON, crossSerializeStream, getCrossReferenceHeader } from 'file:///Users/david/Documents/Projects/network-monitor/node_modules/seroval/dist/esm/production/index.mjs';
import { CustomEventPlugin, DOMExceptionPlugin, EventPlugin, FormDataPlugin, HeadersPlugin, ReadableStreamPlugin, RequestPlugin, ResponsePlugin, URLSearchParamsPlugin, URLPlugin } from 'file:///Users/david/Documents/Projects/network-monitor/node_modules/seroval-plugins/dist/esm/production/web.mjs';
import { sharedConfig, lazy, createComponent, catchError, onCleanup } from 'file:///Users/david/Documents/Projects/network-monitor/node_modules/solid-js/dist/server.js';
import { renderToString, getRequestEvent, isServer, ssrElement, escape, mergeProps, ssr, createComponent as createComponent$1, ssrHydrationKey, NoHydration, ssrAttribute } from 'file:///Users/david/Documents/Projects/network-monitor/node_modules/solid-js/web/dist/server.js';
import { provideRequestEvent } from 'file:///Users/david/Documents/Projects/network-monitor/node_modules/solid-js/web/storage/dist/storage.js';
import { H3Event, setHeader, appendResponseHeader as appendResponseHeader$1, getRequestIP, parseCookies, getResponseStatus, getResponseStatusText, getCookie, setCookie, getResponseHeader as getResponseHeader$1, setResponseHeader as setResponseHeader$1, removeResponseHeader as removeResponseHeader$1, getResponseHeaders, getRequestURL as getRequestURL$1, getRequestWebStream, sendRedirect as sendRedirect$1, setResponseStatus as setResponseStatus$1, eventHandler as eventHandler$1 } from 'file:///Users/david/Documents/Projects/network-monitor/node_modules/h3/dist/index.mjs';

const serverAssets = [{"baseName":"server","dir":"/Users/david/Documents/Projects/network-monitor/assets"}];

const assets$1 = createStorage();

for (const asset of serverAssets) {
  assets$1.mount(asset.baseName, unstorage_47drivers_47fs({ base: asset.dir, ignore: (asset?.ignore || []) }));
}

const storage = createStorage({});

storage.mount('/assets', assets$1);

storage.mount('data', unstorage_47drivers_47fs_45lite({"driver":"fsLite","base":"./.data/kv"}));
storage.mount('root', unstorage_47drivers_47fs({"driver":"fs","readOnly":true,"base":"/Users/david/Documents/Projects/network-monitor"}));
storage.mount('src', unstorage_47drivers_47fs({"driver":"fs","readOnly":true,"base":"/Users/david/Documents/Projects/network-monitor"}));
storage.mount('build', unstorage_47drivers_47fs({"driver":"fs","readOnly":false,"base":"/Users/david/Documents/Projects/network-monitor/.vinxi"}));
storage.mount('cache', unstorage_47drivers_47fs({"driver":"fs","readOnly":false,"base":"/Users/david/Documents/Projects/network-monitor/.vinxi/cache"}));

function useStorage(base = "") {
  return base ? prefixStorage(storage, base) : storage;
}

const Hasher = /* @__PURE__ */ (() => {
  class Hasher2 {
    buff = "";
    #context = /* @__PURE__ */ new Map();
    write(str) {
      this.buff += str;
    }
    dispatch(value) {
      const type = value === null ? "null" : typeof value;
      return this[type](value);
    }
    object(object) {
      if (object && typeof object.toJSON === "function") {
        return this.object(object.toJSON());
      }
      const objString = Object.prototype.toString.call(object);
      let objType = "";
      const objectLength = objString.length;
      objType = objectLength < 10 ? "unknown:[" + objString + "]" : objString.slice(8, objectLength - 1);
      objType = objType.toLowerCase();
      let objectNumber = null;
      if ((objectNumber = this.#context.get(object)) === void 0) {
        this.#context.set(object, this.#context.size);
      } else {
        return this.dispatch("[CIRCULAR:" + objectNumber + "]");
      }
      if (typeof Buffer !== "undefined" && Buffer.isBuffer && Buffer.isBuffer(object)) {
        this.write("buffer:");
        return this.write(object.toString("utf8"));
      }
      if (objType !== "object" && objType !== "function" && objType !== "asyncfunction") {
        if (this[objType]) {
          this[objType](object);
        } else {
          this.unknown(object, objType);
        }
      } else {
        const keys = Object.keys(object).sort();
        const extraKeys = [];
        this.write("object:" + (keys.length + extraKeys.length) + ":");
        const dispatchForKey = (key) => {
          this.dispatch(key);
          this.write(":");
          this.dispatch(object[key]);
          this.write(",");
        };
        for (const key of keys) {
          dispatchForKey(key);
        }
        for (const key of extraKeys) {
          dispatchForKey(key);
        }
      }
    }
    array(arr, unordered) {
      unordered = unordered === void 0 ? false : unordered;
      this.write("array:" + arr.length + ":");
      if (!unordered || arr.length <= 1) {
        for (const entry of arr) {
          this.dispatch(entry);
        }
        return;
      }
      const contextAdditions = /* @__PURE__ */ new Map();
      const entries = arr.map((entry) => {
        const hasher = new Hasher2();
        hasher.dispatch(entry);
        for (const [key, value] of hasher.#context) {
          contextAdditions.set(key, value);
        }
        return hasher.toString();
      });
      this.#context = contextAdditions;
      entries.sort();
      return this.array(entries, false);
    }
    date(date) {
      return this.write("date:" + date.toJSON());
    }
    symbol(sym) {
      return this.write("symbol:" + sym.toString());
    }
    unknown(value, type) {
      this.write(type);
      if (!value) {
        return;
      }
      this.write(":");
      if (value && typeof value.entries === "function") {
        return this.array(
          [...value.entries()],
          true
          /* ordered */
        );
      }
    }
    error(err) {
      return this.write("error:" + err.toString());
    }
    boolean(bool) {
      return this.write("bool:" + bool);
    }
    string(string) {
      this.write("string:" + string.length + ":");
      this.write(string);
    }
    function(fn) {
      this.write("fn:");
      if (isNativeFunction(fn)) {
        this.dispatch("[native]");
      } else {
        this.dispatch(fn.toString());
      }
    }
    number(number) {
      return this.write("number:" + number);
    }
    null() {
      return this.write("Null");
    }
    undefined() {
      return this.write("Undefined");
    }
    regexp(regex) {
      return this.write("regex:" + regex.toString());
    }
    arraybuffer(arr) {
      this.write("arraybuffer:");
      return this.dispatch(new Uint8Array(arr));
    }
    url(url) {
      return this.write("url:" + url.toString());
    }
    map(map) {
      this.write("map:");
      const arr = [...map];
      return this.array(arr, false);
    }
    set(set) {
      this.write("set:");
      const arr = [...set];
      return this.array(arr, false);
    }
    bigint(number) {
      return this.write("bigint:" + number.toString());
    }
  }
  for (const type of [
    "uint8array",
    "uint8clampedarray",
    "unt8array",
    "uint16array",
    "unt16array",
    "uint32array",
    "unt32array",
    "float32array",
    "float64array"
  ]) {
    Hasher2.prototype[type] = function(arr) {
      this.write(type + ":");
      return this.array([...arr], false);
    };
  }
  function isNativeFunction(f) {
    if (typeof f !== "function") {
      return false;
    }
    return Function.prototype.toString.call(f).slice(
      -15
      /* "[native code] }".length */
    ) === "[native code] }";
  }
  return Hasher2;
})();
function serialize(object) {
  const hasher = new Hasher();
  hasher.dispatch(object);
  return hasher.buff;
}
function hash(value) {
  return digest(typeof value === "string" ? value : serialize(value)).replace(/[-_]/g, "").slice(0, 10);
}

function defaultCacheOptions() {
  return {
    name: "_",
    base: "/cache",
    swr: true,
    maxAge: 1
  };
}
function defineCachedFunction(fn, opts = {}) {
  opts = { ...defaultCacheOptions(), ...opts };
  const pending = {};
  const group = opts.group || "nitro/functions";
  const name = opts.name || fn.name || "_";
  const integrity = opts.integrity || hash([fn, opts]);
  const validate = opts.validate || ((entry) => entry.value !== void 0);
  async function get(key, resolver, shouldInvalidateCache, event) {
    const cacheKey = [opts.base, group, name, key + ".json"].filter(Boolean).join(":").replace(/:\/$/, ":index");
    let entry = await useStorage().getItem(cacheKey).catch((error) => {
      console.error(`[cache] Cache read error.`, error);
      useNitroApp().captureError(error, { event, tags: ["cache"] });
    }) || {};
    if (typeof entry !== "object") {
      entry = {};
      const error = new Error("Malformed data read from cache.");
      console.error("[cache]", error);
      useNitroApp().captureError(error, { event, tags: ["cache"] });
    }
    const ttl = (opts.maxAge ?? 0) * 1e3;
    if (ttl) {
      entry.expires = Date.now() + ttl;
    }
    const expired = shouldInvalidateCache || entry.integrity !== integrity || ttl && Date.now() - (entry.mtime || 0) > ttl || validate(entry) === false;
    const _resolve = async () => {
      const isPending = pending[key];
      if (!isPending) {
        if (entry.value !== void 0 && (opts.staleMaxAge || 0) >= 0 && opts.swr === false) {
          entry.value = void 0;
          entry.integrity = void 0;
          entry.mtime = void 0;
          entry.expires = void 0;
        }
        pending[key] = Promise.resolve(resolver());
      }
      try {
        entry.value = await pending[key];
      } catch (error) {
        if (!isPending) {
          delete pending[key];
        }
        throw error;
      }
      if (!isPending) {
        entry.mtime = Date.now();
        entry.integrity = integrity;
        delete pending[key];
        if (validate(entry) !== false) {
          let setOpts;
          if (opts.maxAge && !opts.swr) {
            setOpts = { ttl: opts.maxAge };
          }
          const promise = useStorage().setItem(cacheKey, entry, setOpts).catch((error) => {
            console.error(`[cache] Cache write error.`, error);
            useNitroApp().captureError(error, { event, tags: ["cache"] });
          });
          if (event?.waitUntil) {
            event.waitUntil(promise);
          }
        }
      }
    };
    const _resolvePromise = expired ? _resolve() : Promise.resolve();
    if (entry.value === void 0) {
      await _resolvePromise;
    } else if (expired && event && event.waitUntil) {
      event.waitUntil(_resolvePromise);
    }
    if (opts.swr && validate(entry) !== false) {
      _resolvePromise.catch((error) => {
        console.error(`[cache] SWR handler error.`, error);
        useNitroApp().captureError(error, { event, tags: ["cache"] });
      });
      return entry;
    }
    return _resolvePromise.then(() => entry);
  }
  return async (...args) => {
    const shouldBypassCache = await opts.shouldBypassCache?.(...args);
    if (shouldBypassCache) {
      return fn(...args);
    }
    const key = await (opts.getKey || getKey)(...args);
    const shouldInvalidateCache = await opts.shouldInvalidateCache?.(...args);
    const entry = await get(
      key,
      () => fn(...args),
      shouldInvalidateCache,
      args[0] && isEvent(args[0]) ? args[0] : void 0
    );
    let value = entry.value;
    if (opts.transform) {
      value = await opts.transform(entry, ...args) || value;
    }
    return value;
  };
}
function cachedFunction(fn, opts = {}) {
  return defineCachedFunction(fn, opts);
}
function getKey(...args) {
  return args.length > 0 ? hash(args) : "";
}
function escapeKey(key) {
  return String(key).replace(/\W/g, "");
}
function defineCachedEventHandler(handler, opts = defaultCacheOptions()) {
  const variableHeaderNames = (opts.varies || []).filter(Boolean).map((h) => h.toLowerCase()).sort();
  const _opts = {
    ...opts,
    getKey: async (event) => {
      const customKey = await opts.getKey?.(event);
      if (customKey) {
        return escapeKey(customKey);
      }
      const _path = event.node.req.originalUrl || event.node.req.url || event.path;
      let _pathname;
      try {
        _pathname = escapeKey(decodeURI(parseURL(_path).pathname)).slice(0, 16) || "index";
      } catch {
        _pathname = "-";
      }
      const _hashedPath = `${_pathname}.${hash(_path)}`;
      const _headers = variableHeaderNames.map((header) => [header, event.node.req.headers[header]]).map(([name, value]) => `${escapeKey(name)}.${hash(value)}`);
      return [_hashedPath, ..._headers].join(":");
    },
    validate: (entry) => {
      if (!entry.value) {
        return false;
      }
      if (entry.value.code >= 400) {
        return false;
      }
      if (entry.value.body === void 0) {
        return false;
      }
      if (entry.value.headers.etag === "undefined" || entry.value.headers["last-modified"] === "undefined") {
        return false;
      }
      return true;
    },
    group: opts.group || "nitro/handlers",
    integrity: opts.integrity || hash([handler, opts])
  };
  const _cachedHandler = cachedFunction(
    async (incomingEvent) => {
      const variableHeaders = {};
      for (const header of variableHeaderNames) {
        const value = incomingEvent.node.req.headers[header];
        if (value !== void 0) {
          variableHeaders[header] = value;
        }
      }
      const reqProxy = cloneWithProxy(incomingEvent.node.req, {
        headers: variableHeaders
      });
      const resHeaders = {};
      let _resSendBody;
      const resProxy = cloneWithProxy(incomingEvent.node.res, {
        statusCode: 200,
        writableEnded: false,
        writableFinished: false,
        headersSent: false,
        closed: false,
        getHeader(name) {
          return resHeaders[name];
        },
        setHeader(name, value) {
          resHeaders[name] = value;
          return this;
        },
        getHeaderNames() {
          return Object.keys(resHeaders);
        },
        hasHeader(name) {
          return name in resHeaders;
        },
        removeHeader(name) {
          delete resHeaders[name];
        },
        getHeaders() {
          return resHeaders;
        },
        end(chunk, arg2, arg3) {
          if (typeof chunk === "string") {
            _resSendBody = chunk;
          }
          if (typeof arg2 === "function") {
            arg2();
          }
          if (typeof arg3 === "function") {
            arg3();
          }
          return this;
        },
        write(chunk, arg2, arg3) {
          if (typeof chunk === "string") {
            _resSendBody = chunk;
          }
          if (typeof arg2 === "function") {
            arg2(void 0);
          }
          if (typeof arg3 === "function") {
            arg3();
          }
          return true;
        },
        writeHead(statusCode, headers2) {
          this.statusCode = statusCode;
          if (headers2) {
            if (Array.isArray(headers2) || typeof headers2 === "string") {
              throw new TypeError("Raw headers  is not supported.");
            }
            for (const header in headers2) {
              const value = headers2[header];
              if (value !== void 0) {
                this.setHeader(
                  header,
                  value
                );
              }
            }
          }
          return this;
        }
      });
      const event = createEvent(reqProxy, resProxy);
      event.fetch = (url, fetchOptions) => fetchWithEvent(event, url, fetchOptions, {
        fetch: useNitroApp().localFetch
      });
      event.$fetch = (url, fetchOptions) => fetchWithEvent(event, url, fetchOptions, {
        fetch: globalThis.$fetch
      });
      event.waitUntil = incomingEvent.waitUntil;
      event.context = incomingEvent.context;
      event.context.cache = {
        options: _opts
      };
      const body = await handler(event) || _resSendBody;
      const headers = event.node.res.getHeaders();
      headers.etag = String(
        headers.Etag || headers.etag || `W/"${hash(body)}"`
      );
      headers["last-modified"] = String(
        headers["Last-Modified"] || headers["last-modified"] || (/* @__PURE__ */ new Date()).toUTCString()
      );
      const cacheControl = [];
      if (opts.swr) {
        if (opts.maxAge) {
          cacheControl.push(`s-maxage=${opts.maxAge}`);
        }
        if (opts.staleMaxAge) {
          cacheControl.push(`stale-while-revalidate=${opts.staleMaxAge}`);
        } else {
          cacheControl.push("stale-while-revalidate");
        }
      } else if (opts.maxAge) {
        cacheControl.push(`max-age=${opts.maxAge}`);
      }
      if (cacheControl.length > 0) {
        headers["cache-control"] = cacheControl.join(", ");
      }
      const cacheEntry = {
        code: event.node.res.statusCode,
        headers,
        body
      };
      return cacheEntry;
    },
    _opts
  );
  return defineEventHandler(async (event) => {
    if (opts.headersOnly) {
      if (handleCacheHeaders(event, { maxAge: opts.maxAge })) {
        return;
      }
      return handler(event);
    }
    const response = await _cachedHandler(
      event
    );
    if (event.node.res.headersSent || event.node.res.writableEnded) {
      return response.body;
    }
    if (handleCacheHeaders(event, {
      modifiedTime: new Date(response.headers["last-modified"]),
      etag: response.headers.etag,
      maxAge: opts.maxAge
    })) {
      return;
    }
    event.node.res.statusCode = response.code;
    for (const name in response.headers) {
      const value = response.headers[name];
      if (name === "set-cookie") {
        event.node.res.appendHeader(
          name,
          splitCookiesString(value)
        );
      } else {
        if (value !== void 0) {
          event.node.res.setHeader(name, value);
        }
      }
    }
    return response.body;
  });
}
function cloneWithProxy(obj, overrides) {
  return new Proxy(obj, {
    get(target, property, receiver) {
      if (property in overrides) {
        return overrides[property];
      }
      return Reflect.get(target, property, receiver);
    },
    set(target, property, value, receiver) {
      if (property in overrides) {
        overrides[property] = value;
        return true;
      }
      return Reflect.set(target, property, value, receiver);
    }
  });
}
const cachedEventHandler = defineCachedEventHandler;

const inlineAppConfig = {};



const appConfig$1 = defuFn(inlineAppConfig);

function getEnv(key, opts) {
  const envKey = snakeCase(key).toUpperCase();
  return destr(
    process.env[opts.prefix + envKey] ?? process.env[opts.altPrefix + envKey]
  );
}
function _isObject(input) {
  return typeof input === "object" && !Array.isArray(input);
}
function applyEnv(obj, opts, parentKey = "") {
  for (const key in obj) {
    const subKey = parentKey ? `${parentKey}_${key}` : key;
    const envValue = getEnv(subKey, opts);
    if (_isObject(obj[key])) {
      if (_isObject(envValue)) {
        obj[key] = { ...obj[key], ...envValue };
        applyEnv(obj[key], opts, subKey);
      } else if (envValue === void 0) {
        applyEnv(obj[key], opts, subKey);
      } else {
        obj[key] = envValue ?? obj[key];
      }
    } else {
      obj[key] = envValue ?? obj[key];
    }
    if (opts.envExpansion && typeof obj[key] === "string") {
      obj[key] = _expandFromEnv(obj[key]);
    }
  }
  return obj;
}
const envExpandRx = /\{\{([^{}]*)\}\}/g;
function _expandFromEnv(value) {
  return value.replace(envExpandRx, (match, key) => {
    return process.env[key] || match;
  });
}

const _inlineRuntimeConfig = {
  "app": {
    "baseURL": "/"
  },
  "nitro": {
    "routeRules": {
      "/_build/assets/**": {
        "headers": {
          "cache-control": "public, immutable, max-age=31536000"
        }
      }
    }
  }
};
const envOptions = {
  prefix: "NITRO_",
  altPrefix: _inlineRuntimeConfig.nitro.envPrefix ?? process.env.NITRO_ENV_PREFIX ?? "_",
  envExpansion: _inlineRuntimeConfig.nitro.envExpansion ?? process.env.NITRO_ENV_EXPANSION ?? false
};
const _sharedRuntimeConfig = _deepFreeze(
  applyEnv(klona(_inlineRuntimeConfig), envOptions)
);
function useRuntimeConfig(event) {
  {
    return _sharedRuntimeConfig;
  }
}
_deepFreeze(klona(appConfig$1));
function _deepFreeze(object) {
  const propNames = Object.getOwnPropertyNames(object);
  for (const name of propNames) {
    const value = object[name];
    if (value && typeof value === "object") {
      _deepFreeze(value);
    }
  }
  return Object.freeze(object);
}
new Proxy(/* @__PURE__ */ Object.create(null), {
  get: (_, prop) => {
    console.warn(
      "Please use `useRuntimeConfig()` instead of accessing config directly."
    );
    const runtimeConfig = useRuntimeConfig();
    if (prop in runtimeConfig) {
      return runtimeConfig[prop];
    }
    return void 0;
  }
});

const nitroAsyncContext = getContext("nitro-app", {
  asyncContext: true,
  AsyncLocalStorage: AsyncLocalStorage 
});

const config = useRuntimeConfig();
const _routeRulesMatcher = toRouteMatcher(
  createRouter({ routes: config.nitro.routeRules })
);
function createRouteRulesHandler(ctx) {
  return eventHandler((event) => {
    const routeRules = getRouteRules(event);
    if (routeRules.headers) {
      setHeaders(event, routeRules.headers);
    }
    if (routeRules.redirect) {
      let target = routeRules.redirect.to;
      if (target.endsWith("/**")) {
        let targetPath = event.path;
        const strpBase = routeRules.redirect._redirectStripBase;
        if (strpBase) {
          targetPath = withoutBase(targetPath, strpBase);
        }
        target = joinURL(target.slice(0, -3), targetPath);
      } else if (event.path.includes("?")) {
        const query = getQuery(event.path);
        target = withQuery(target, query);
      }
      return sendRedirect(event, target, routeRules.redirect.statusCode);
    }
    if (routeRules.proxy) {
      let target = routeRules.proxy.to;
      if (target.endsWith("/**")) {
        let targetPath = event.path;
        const strpBase = routeRules.proxy._proxyStripBase;
        if (strpBase) {
          targetPath = withoutBase(targetPath, strpBase);
        }
        target = joinURL(target.slice(0, -3), targetPath);
      } else if (event.path.includes("?")) {
        const query = getQuery(event.path);
        target = withQuery(target, query);
      }
      return proxyRequest(event, target, {
        fetch: ctx.localFetch,
        ...routeRules.proxy
      });
    }
  });
}
function getRouteRules(event) {
  event.context._nitro = event.context._nitro || {};
  if (!event.context._nitro.routeRules) {
    event.context._nitro.routeRules = getRouteRulesForPath(
      withoutBase(event.path.split("?")[0], useRuntimeConfig().app.baseURL)
    );
  }
  return event.context._nitro.routeRules;
}
function getRouteRulesForPath(path) {
  return defu({}, ..._routeRulesMatcher.matchAll(path).reverse());
}

function _captureError(error, type) {
  console.error(`[${type}]`, error);
  useNitroApp().captureError(error, { tags: [type] });
}
function trapUnhandledNodeErrors() {
  process.on(
    "unhandledRejection",
    (error) => _captureError(error, "unhandledRejection")
  );
  process.on(
    "uncaughtException",
    (error) => _captureError(error, "uncaughtException")
  );
}
function joinHeaders(value) {
  return Array.isArray(value) ? value.join(", ") : String(value);
}
function normalizeFetchResponse(response) {
  if (!response.headers.has("set-cookie")) {
    return response;
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: normalizeCookieHeaders(response.headers)
  });
}
function normalizeCookieHeader(header = "") {
  return splitCookiesString(joinHeaders(header));
}
function normalizeCookieHeaders(headers) {
  const outgoingHeaders = new Headers();
  for (const [name, header] of headers) {
    if (name === "set-cookie") {
      for (const cookie of normalizeCookieHeader(header)) {
        outgoingHeaders.append("set-cookie", cookie);
      }
    } else {
      outgoingHeaders.set(name, joinHeaders(header));
    }
  }
  return outgoingHeaders;
}

function defineNitroErrorHandler(handler) {
  return handler;
}

const errorHandler$0 = defineNitroErrorHandler(
  function defaultNitroErrorHandler(error, event) {
    const res = defaultHandler(error, event);
    setResponseHeaders(event, res.headers);
    setResponseStatus(event, res.status, res.statusText);
    return send(event, JSON.stringify(res.body, null, 2));
  }
);
function defaultHandler(error, event, opts) {
  const isSensitive = error.unhandled || error.fatal;
  const statusCode = error.statusCode || 500;
  const statusMessage = error.statusMessage || "Server Error";
  const url = getRequestURL(event, { xForwardedHost: true, xForwardedProto: true });
  if (statusCode === 404) {
    const baseURL = "/";
    if (/^\/[^/]/.test(baseURL) && !url.pathname.startsWith(baseURL)) {
      const redirectTo = `${baseURL}${url.pathname.slice(1)}${url.search}`;
      return {
        status: 302,
        statusText: "Found",
        headers: { location: redirectTo },
        body: `Redirecting...`
      };
    }
  }
  if (isSensitive && !opts?.silent) {
    const tags = [error.unhandled && "[unhandled]", error.fatal && "[fatal]"].filter(Boolean).join(" ");
    console.error(`[request error] ${tags} [${event.method}] ${url}
`, error);
  }
  const headers = {
    "content-type": "application/json",
    // Prevent browser from guessing the MIME types of resources.
    "x-content-type-options": "nosniff",
    // Prevent error page from being embedded in an iframe
    "x-frame-options": "DENY",
    // Prevent browsers from sending the Referer header
    "referrer-policy": "no-referrer",
    // Disable the execution of any js
    "content-security-policy": "script-src 'none'; frame-ancestors 'none';"
  };
  setResponseStatus(event, statusCode, statusMessage);
  if (statusCode === 404 || !getResponseHeader(event, "cache-control")) {
    headers["cache-control"] = "no-cache";
  }
  const body = {
    error: true,
    url: url.href,
    statusCode,
    statusMessage,
    message: isSensitive ? "Server Error" : error.message,
    data: isSensitive ? void 0 : error.data
  };
  return {
    status: statusCode,
    statusText: statusMessage,
    headers,
    body
  };
}

const errorHandlers = [errorHandler$0];

async function errorHandler(error, event) {
  for (const handler of errorHandlers) {
    try {
      await handler(error, event, { defaultHandler });
      if (event.handled) {
        return; // Response handled
      }
    } catch(error) {
      // Handler itself thrown, log and continue
      console.error(error);
    }
  }
  // H3 will handle fallback
}

const appConfig = {"name":"vinxi","routers":[{"name":"public","type":"static","base":"/","dir":"./public","root":"/Users/david/Documents/Projects/network-monitor","order":0,"outDir":"/Users/david/Documents/Projects/network-monitor/.vinxi/build/public"},{"name":"ssr","type":"http","link":{"client":"client"},"handler":"src/entry-server.tsx","extensions":["js","jsx","ts","tsx"],"target":"server","root":"/Users/david/Documents/Projects/network-monitor","base":"/","outDir":"/Users/david/Documents/Projects/network-monitor/.vinxi/build/ssr","order":1},{"name":"client","type":"client","base":"/_build","handler":"src/entry-client.tsx","extensions":["js","jsx","ts","tsx"],"target":"browser","root":"/Users/david/Documents/Projects/network-monitor","outDir":"/Users/david/Documents/Projects/network-monitor/.vinxi/build/client","order":2},{"name":"server-fns","type":"http","base":"/_server","handler":"node_modules/@solidjs/start/dist/runtime/server-handler.js","target":"server","root":"/Users/david/Documents/Projects/network-monitor","outDir":"/Users/david/Documents/Projects/network-monitor/.vinxi/build/server-fns","order":3}],"server":{"compressPublicAssets":{"brotli":true},"routeRules":{"/_build/assets/**":{"headers":{"cache-control":"public, immutable, max-age=31536000"}}},"experimental":{"asyncContext":true},"preset":"bun","prerender":{}},"root":"/Users/david/Documents/Projects/network-monitor"};
				const buildManifest = {"ssr":{"_auth-BG2QS10l.js":{"file":"assets/auth-BG2QS10l.js","name":"auth","imports":["_http-B4IvXL16.js"]},"_http-B4IvXL16.js":{"file":"assets/http-B4IvXL16.js","name":"http"},"src/routes/api/auth/[...solidauth].ts?pick=GET":{"file":"_...solidauth_.js","name":"_...solidauth_","src":"src/routes/api/auth/[...solidauth].ts?pick=GET","isEntry":true,"isDynamicEntry":true,"imports":["_auth-BG2QS10l.js","_http-B4IvXL16.js"]},"src/routes/api/auth/[...solidauth].ts?pick=POST":{"file":"_...solidauth_2.js","name":"_...solidauth_","src":"src/routes/api/auth/[...solidauth].ts?pick=POST","isEntry":true,"isDynamicEntry":true,"imports":["_auth-BG2QS10l.js","_http-B4IvXL16.js"]},"src/routes/api/docs.ts?pick=GET":{"file":"docs.js","name":"docs","src":"src/routes/api/docs.ts?pick=GET","isEntry":true,"isDynamicEntry":true},"src/routes/api/prpc/[prpc].ts?pick=GET":{"file":"_prpc_.js","name":"_prpc_","src":"src/routes/api/prpc/[prpc].ts?pick=GET","isEntry":true,"isDynamicEntry":true,"imports":["_auth-BG2QS10l.js","_http-B4IvXL16.js"]},"src/routes/api/prpc/[prpc].ts?pick=POST":{"file":"_prpc_2.js","name":"_prpc_","src":"src/routes/api/prpc/[prpc].ts?pick=POST","isEntry":true,"isDynamicEntry":true},"src/routes/api/trpc/[trpc].ts?pick=GET":{"file":"_trpc_.js","name":"_trpc_","src":"src/routes/api/trpc/[trpc].ts?pick=GET","isEntry":true,"isDynamicEntry":true},"src/routes/api/trpc/[trpc].ts?pick=POST":{"file":"_trpc_2.js","name":"_trpc_","src":"src/routes/api/trpc/[trpc].ts?pick=POST","isEntry":true,"isDynamicEntry":true},"virtual:$vinxi/handler/ssr":{"file":"ssr.js","name":"ssr","src":"virtual:$vinxi/handler/ssr","isEntry":true,"imports":["_http-B4IvXL16.js"],"dynamicImports":["src/routes/api/docs.ts?pick=GET","src/routes/api/docs.ts?pick=GET","src/routes/api/docs.ts?pick=GET","src/routes/api/docs.ts?pick=GET","src/routes/api/auth/[...solidauth].ts?pick=GET","src/routes/api/auth/[...solidauth].ts?pick=GET","src/routes/api/auth/[...solidauth].ts?pick=GET","src/routes/api/auth/[...solidauth].ts?pick=GET","src/routes/api/auth/[...solidauth].ts?pick=POST","src/routes/api/auth/[...solidauth].ts?pick=POST","src/routes/api/prpc/[prpc].ts?pick=GET","src/routes/api/prpc/[prpc].ts?pick=GET","src/routes/api/prpc/[prpc].ts?pick=GET","src/routes/api/prpc/[prpc].ts?pick=GET","src/routes/api/prpc/[prpc].ts?pick=POST","src/routes/api/prpc/[prpc].ts?pick=POST","src/routes/api/trpc/[trpc].ts?pick=GET","src/routes/api/trpc/[trpc].ts?pick=GET","src/routes/api/trpc/[trpc].ts?pick=GET","src/routes/api/trpc/[trpc].ts?pick=GET","src/routes/api/trpc/[trpc].ts?pick=POST","src/routes/api/trpc/[trpc].ts?pick=POST"]}},"client":{"_Navigation-C0zpTr2U.js":{"file":"assets/Navigation-C0zpTr2U.js","name":"Navigation","imports":["_web-DWs2y45l.js","_index-D0yHUZy9.js"]},"_container-CPLhW4lJ.js":{"file":"assets/container-CPLhW4lJ.js","name":"container","imports":["_web-DWs2y45l.js"]},"_index-C_OXL9IE.js":{"file":"assets/index-C_OXL9IE.js","name":"index","imports":["_web-DWs2y45l.js"]},"_index-D0yHUZy9.js":{"file":"assets/index-D0yHUZy9.js","name":"index","imports":["_web-DWs2y45l.js"]},"_web-DWs2y45l.js":{"file":"assets/web-DWs2y45l.js","name":"web"},"src/routes/alerts.tsx?pick=default&pick=$css":{"file":"assets/alerts-CmQb3K8K.js","name":"alerts","src":"src/routes/alerts.tsx?pick=default&pick=$css","isEntry":true,"isDynamicEntry":true,"imports":["_web-DWs2y45l.js","_container-CPLhW4lJ.js","_Navigation-C0zpTr2U.js","_index-D0yHUZy9.js"]},"src/routes/api-docs.tsx?pick=default&pick=$css":{"file":"assets/api-docs-psUGna-C.js","name":"api-docs","src":"src/routes/api-docs.tsx?pick=default&pick=$css","isEntry":true,"isDynamicEntry":true,"imports":["_web-DWs2y45l.js"]},"src/routes/api-test.tsx?pick=default&pick=$css":{"file":"assets/api-test-w8q6odO5.js","name":"api-test","src":"src/routes/api-test.tsx?pick=default&pick=$css","isEntry":true,"isDynamicEntry":true,"imports":["_web-DWs2y45l.js"]},"src/routes/api/swagger.tsx?pick=default&pick=$css":{"file":"assets/swagger-Dp40dFts.js","name":"swagger","src":"src/routes/api/swagger.tsx?pick=default&pick=$css","isEntry":true,"isDynamicEntry":true,"imports":["_web-DWs2y45l.js"]},"src/routes/charts.tsx?pick=default&pick=$css":{"file":"assets/charts-BBVsFB48.js","name":"charts","src":"src/routes/charts.tsx?pick=default&pick=$css","isEntry":true,"isDynamicEntry":true,"imports":["_web-DWs2y45l.js","_container-CPLhW4lJ.js","_Navigation-C0zpTr2U.js","_index-C_OXL9IE.js","_index-D0yHUZy9.js"]},"src/routes/dashboard.tsx?pick=default&pick=$css":{"file":"assets/dashboard-BGIudRU0.js","name":"dashboard","src":"src/routes/dashboard.tsx?pick=default&pick=$css","isEntry":true,"isDynamicEntry":true,"imports":["_web-DWs2y45l.js","_container-CPLhW4lJ.js","_Navigation-C0zpTr2U.js","_index-C_OXL9IE.js","_index-D0yHUZy9.js"]},"src/routes/index.tsx?pick=default&pick=$css":{"file":"assets/index-B9KKzenf.js","name":"index","src":"src/routes/index.tsx?pick=default&pick=$css","isEntry":true,"isDynamicEntry":true,"imports":["_index-D0yHUZy9.js","_web-DWs2y45l.js"]},"src/routes/notifications.tsx?pick=default&pick=$css":{"file":"assets/notifications-ZMcAT3ky.js","name":"notifications","src":"src/routes/notifications.tsx?pick=default&pick=$css","isEntry":true,"isDynamicEntry":true,"imports":["_web-DWs2y45l.js","_container-CPLhW4lJ.js","_Navigation-C0zpTr2U.js","_index-D0yHUZy9.js"]},"src/routes/settings.tsx?pick=default&pick=$css":{"file":"assets/settings-SNghGxtz.js","name":"settings","src":"src/routes/settings.tsx?pick=default&pick=$css","isEntry":true,"isDynamicEntry":true,"imports":["_web-DWs2y45l.js","_container-CPLhW4lJ.js","_Navigation-C0zpTr2U.js","_index-D0yHUZy9.js"]},"src/routes/targets.tsx?pick=default&pick=$css":{"file":"assets/targets-5DvLf6LR.js","name":"targets","src":"src/routes/targets.tsx?pick=default&pick=$css","isEntry":true,"isDynamicEntry":true,"imports":["_web-DWs2y45l.js","_container-CPLhW4lJ.js","_Navigation-C0zpTr2U.js","_index-D0yHUZy9.js"]},"virtual:$vinxi/handler/client":{"file":"assets/client-C95NAguV.js","name":"client","src":"virtual:$vinxi/handler/client","isEntry":true,"imports":["_web-DWs2y45l.js","_index-D0yHUZy9.js","_container-CPLhW4lJ.js"],"dynamicImports":["src/routes/alerts.tsx?pick=default&pick=$css","src/routes/api-docs.tsx?pick=default&pick=$css","src/routes/api-test.tsx?pick=default&pick=$css","src/routes/charts.tsx?pick=default&pick=$css","src/routes/dashboard.tsx?pick=default&pick=$css","src/routes/index.tsx?pick=default&pick=$css","src/routes/notifications.tsx?pick=default&pick=$css","src/routes/settings.tsx?pick=default&pick=$css","src/routes/targets.tsx?pick=default&pick=$css","src/routes/api/swagger.tsx?pick=default&pick=$css"],"css":["assets/client-BqC2FJRv.css"]}},"server-fns":{"_EventBus-DczTgM9x.js":{"file":"assets/EventBus-DczTgM9x.js","name":"EventBus"},"_auth-lxAQ3sd1.js":{"file":"assets/auth-lxAQ3sd1.js","name":"auth","imports":["_http-dBtNME8h.js","_utils-CVcNPmWW.js"]},"_http-dBtNME8h.js":{"file":"assets/http-dBtNME8h.js","name":"http"},"_server-fns-C8-WT3ir.js":{"file":"assets/server-fns-C8-WT3ir.js","name":"server-fns","imports":["_http-dBtNME8h.js"],"dynamicImports":["src/routes/api/docs.ts?pick=GET","src/routes/api/docs.ts?pick=GET","src/routes/api/docs.ts?pick=GET","src/routes/api/docs.ts?pick=GET","src/routes/api/auth/[...solidauth].ts?pick=GET","src/routes/api/auth/[...solidauth].ts?pick=GET","src/routes/api/auth/[...solidauth].ts?pick=GET","src/routes/api/auth/[...solidauth].ts?pick=GET","src/routes/api/auth/[...solidauth].ts?pick=POST","src/routes/api/auth/[...solidauth].ts?pick=POST","src/routes/api/prpc/[prpc].ts?pick=GET","src/routes/api/prpc/[prpc].ts?pick=GET","src/routes/api/prpc/[prpc].ts?pick=GET","src/routes/api/prpc/[prpc].ts?pick=GET","src/routes/api/prpc/[prpc].ts?pick=POST","src/routes/api/prpc/[prpc].ts?pick=POST","src/routes/api/trpc/[trpc].ts?pick=GET","src/routes/api/trpc/[trpc].ts?pick=GET","src/routes/api/trpc/[trpc].ts?pick=GET","src/routes/api/trpc/[trpc].ts?pick=GET","src/routes/api/trpc/[trpc].ts?pick=POST","src/routes/api/trpc/[trpc].ts?pick=POST","src/app.tsx"]},"_utils-CVcNPmWW.js":{"file":"assets/utils-CVcNPmWW.js","name":"utils"},"src/app.tsx":{"file":"assets/app-C1fILmjj.js","name":"app","src":"src/app.tsx","isDynamicEntry":true,"imports":["_server-fns-C8-WT3ir.js","_utils-CVcNPmWW.js","_EventBus-DczTgM9x.js","_http-dBtNME8h.js"],"css":["assets/app-BqC2FJRv.css"]},"src/routes/api/auth/[...solidauth].ts?pick=GET":{"file":"_...solidauth_.js","name":"_...solidauth_","src":"src/routes/api/auth/[...solidauth].ts?pick=GET","isEntry":true,"isDynamicEntry":true,"imports":["_auth-lxAQ3sd1.js","_http-dBtNME8h.js","_utils-CVcNPmWW.js"]},"src/routes/api/auth/[...solidauth].ts?pick=POST":{"file":"_...solidauth_2.js","name":"_...solidauth_","src":"src/routes/api/auth/[...solidauth].ts?pick=POST","isEntry":true,"isDynamicEntry":true,"imports":["_auth-lxAQ3sd1.js","_http-dBtNME8h.js","_utils-CVcNPmWW.js"]},"src/routes/api/docs.ts?pick=GET":{"file":"docs.js","name":"docs","src":"src/routes/api/docs.ts?pick=GET","isEntry":true,"isDynamicEntry":true},"src/routes/api/prpc/[prpc].ts?pick=GET":{"file":"_prpc_.js","name":"_prpc_","src":"src/routes/api/prpc/[prpc].ts?pick=GET","isEntry":true,"isDynamicEntry":true,"imports":["_auth-lxAQ3sd1.js","_EventBus-DczTgM9x.js","_http-dBtNME8h.js","_utils-CVcNPmWW.js"]},"src/routes/api/prpc/[prpc].ts?pick=POST":{"file":"_prpc_2.js","name":"_prpc_","src":"src/routes/api/prpc/[prpc].ts?pick=POST","isEntry":true,"isDynamicEntry":true},"src/routes/api/trpc/[trpc].ts?pick=GET":{"file":"_trpc_.js","name":"_trpc_","src":"src/routes/api/trpc/[trpc].ts?pick=GET","isEntry":true,"isDynamicEntry":true},"src/routes/api/trpc/[trpc].ts?pick=POST":{"file":"_trpc_2.js","name":"_trpc_","src":"src/routes/api/trpc/[trpc].ts?pick=POST","isEntry":true,"isDynamicEntry":true},"virtual:$vinxi/handler/server-fns":{"file":"server-fns.js","name":"server-fns","src":"virtual:$vinxi/handler/server-fns","isEntry":true,"imports":["_server-fns-C8-WT3ir.js","_http-dBtNME8h.js"]}}};

				const routeManifest = {"ssr":{},"client":{},"server-fns":{}};

        function createProdApp(appConfig) {
          return {
            config: { ...appConfig, buildManifest, routeManifest },
            getRouter(name) {
              return appConfig.routers.find(router => router.name === name)
            }
          }
        }

        function plugin(app) {
          const prodApp = createProdApp(appConfig);
          globalThis.app = prodApp;
        }

const chunks = {};
			 



			 function app() {
				 globalThis.$$chunks = chunks;
			 }

const plugins = [
  plugin,
_HHQ6PALebcRabpJs4h3PC6jXF81QQ8Jp6oyWsZuWw,
_UC47q1O82Z2W4Iv9XpPdXmzzM7VVz7QWK0nGg8mifY,
app
];

const assets = {
  "/favicon.ico": {
    "type": "image/vnd.microsoft.icon",
    "etag": "\"298-hdW7/pL89QptiszdYCHH67XxLxs\"",
    "mtime": "2025-09-28T06:59:18.361Z",
    "size": 664,
    "path": "../../.output/public/favicon.ico"
  },
  "/manifest.json": {
    "type": "application/json",
    "etag": "\"775-P8FHMokVNgdXhI3c+Q7aPW2314I\"",
    "mtime": "2025-09-28T06:59:18.361Z",
    "size": 1909,
    "path": "../../.output/public/manifest.json"
  },
  "/manifest.json.br": {
    "type": "application/json",
    "encoding": "br",
    "etag": "\"1c9-XcGYhaYU/R0RWAyS0CetLC2VPQg\"",
    "mtime": "2025-09-28T06:59:18.439Z",
    "size": 457,
    "path": "../../.output/public/manifest.json.br"
  },
  "/manifest.json.gz": {
    "type": "application/json",
    "encoding": "gzip",
    "etag": "\"252-SBVksP+ghMWytF94Fw/sGysV9Ho\"",
    "mtime": "2025-09-28T06:59:18.439Z",
    "size": 594,
    "path": "../../.output/public/manifest.json.gz"
  },
  "/sw.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"a14-s8Bul6QrRWkO5qpXkNwQeRBIq1M\"",
    "mtime": "2025-09-28T06:59:18.361Z",
    "size": 2580,
    "path": "../../.output/public/sw.js"
  },
  "/sw.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"30b-gE5TAb7X2T9gQl9TfnMdA91wNYs\"",
    "mtime": "2025-09-28T06:59:18.439Z",
    "size": 779,
    "path": "../../.output/public/sw.js.br"
  },
  "/sw.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"3ad-dfUQmLKPHikgKw3/FTwVORUhrfQ\"",
    "mtime": "2025-09-28T06:59:18.439Z",
    "size": 941,
    "path": "../../.output/public/sw.js.gz"
  },
  "/assets/auth-BG2QS10l.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1409-ciMqTmnRIJ+kfJT/rIhgsRtxuqA\"",
    "mtime": "2025-09-28T06:59:18.362Z",
    "size": 5129,
    "path": "../../.output/public/assets/auth-BG2QS10l.js"
  },
  "/assets/auth-BG2QS10l.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"7d1-2o2BIM8lacnv8x1JLJ/JAoHUS1U\"",
    "mtime": "2025-09-28T06:59:18.439Z",
    "size": 2001,
    "path": "../../.output/public/assets/auth-BG2QS10l.js.br"
  },
  "/assets/auth-BG2QS10l.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"8c5-ndJTJrTPxsNZv1EcKV3R9uugdNE\"",
    "mtime": "2025-09-28T06:59:18.439Z",
    "size": 2245,
    "path": "../../.output/public/assets/auth-BG2QS10l.js.gz"
  },
  "/assets/http-B4IvXL16.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"6da-42pEA0Ibz5mJmIWMilpfhE54AOc\"",
    "mtime": "2025-09-28T06:59:18.362Z",
    "size": 1754,
    "path": "../../.output/public/assets/http-B4IvXL16.js"
  },
  "/assets/http-B4IvXL16.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"2e2-ZmdblS8PGhF/HZ2vIPjyQRktp9E\"",
    "mtime": "2025-09-28T06:59:18.439Z",
    "size": 738,
    "path": "../../.output/public/assets/http-B4IvXL16.js.br"
  },
  "/assets/http-B4IvXL16.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"352-J2VIcRF9wCbCrWa4sBDFxI4g1Go\"",
    "mtime": "2025-09-28T06:59:18.439Z",
    "size": 850,
    "path": "../../.output/public/assets/http-B4IvXL16.js.gz"
  },
  "/_build/.vite/manifest.json": {
    "type": "application/json",
    "etag": "\"13f0-0bsP1VVOyfIc14n45Oog2B5chjk\"",
    "mtime": "2025-09-28T06:59:18.364Z",
    "size": 5104,
    "path": "../../.output/public/_build/.vite/manifest.json"
  },
  "/_build/.vite/manifest.json.br": {
    "type": "application/json",
    "encoding": "br",
    "etag": "\"265-LpbALSez5UU5HAGZFPHcuZ89T3Y\"",
    "mtime": "2025-09-28T06:59:18.439Z",
    "size": 613,
    "path": "../../.output/public/_build/.vite/manifest.json.br"
  },
  "/_build/.vite/manifest.json.gz": {
    "type": "application/json",
    "encoding": "gzip",
    "etag": "\"2c6-RT3S+GPcMdY1we4a8cN6+rT4u3g\"",
    "mtime": "2025-09-28T06:59:18.439Z",
    "size": 710,
    "path": "../../.output/public/_build/.vite/manifest.json.gz"
  },
  "/_server/assets/EventBus-DczTgM9x.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"322-qYkCOJ8/duQF6RHl028DqDgHqrc\"",
    "mtime": "2025-09-28T06:59:18.366Z",
    "size": 802,
    "path": "../../.output/public/_server/assets/EventBus-DczTgM9x.js"
  },
  "/_server/assets/app-BqC2FJRv.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"5819-n2C2AfaGAuq8jLRnv7mJgPVbLjs\"",
    "mtime": "2025-09-28T06:59:18.366Z",
    "size": 22553,
    "path": "../../.output/public/_server/assets/app-BqC2FJRv.css"
  },
  "/_server/assets/app-BqC2FJRv.css.br": {
    "type": "text/css; charset=utf-8",
    "encoding": "br",
    "etag": "\"e85-vy+qxlfCEN6n85GU7OU1foAYo9U\"",
    "mtime": "2025-09-28T06:59:18.440Z",
    "size": 3717,
    "path": "../../.output/public/_server/assets/app-BqC2FJRv.css.br"
  },
  "/_server/assets/app-BqC2FJRv.css.gz": {
    "type": "text/css; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"1105-KX2g1zQw9UEZDmptgjuYjPqvBDo\"",
    "mtime": "2025-09-28T06:59:18.440Z",
    "size": 4357,
    "path": "../../.output/public/_server/assets/app-BqC2FJRv.css.gz"
  },
  "/_server/assets/app-C1fILmjj.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"7cb7-6n6aOCzIJt1+PunFSwaA1nbG/ek\"",
    "mtime": "2025-09-28T06:59:18.366Z",
    "size": 31927,
    "path": "../../.output/public/_server/assets/app-C1fILmjj.js"
  },
  "/_server/assets/app-C1fILmjj.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"22f3-/pSCiwgIttZ2E+2iIDaWe0WTvG4\"",
    "mtime": "2025-09-28T06:59:18.441Z",
    "size": 8947,
    "path": "../../.output/public/_server/assets/app-C1fILmjj.js.br"
  },
  "/_server/assets/app-C1fILmjj.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"26ec-9XZwXDa7hw3t6ahyeRwf/5KrgWk\"",
    "mtime": "2025-09-28T06:59:18.441Z",
    "size": 9964,
    "path": "../../.output/public/_server/assets/app-C1fILmjj.js.gz"
  },
  "/_server/assets/auth-lxAQ3sd1.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1127-G086u/l16HUdDBcGrvKHY+PWNto\"",
    "mtime": "2025-09-28T06:59:18.366Z",
    "size": 4391,
    "path": "../../.output/public/_server/assets/auth-lxAQ3sd1.js"
  },
  "/_server/assets/auth-lxAQ3sd1.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"681-Q66Tm14NYappkm7Gg90nOkjidjU\"",
    "mtime": "2025-09-28T06:59:18.440Z",
    "size": 1665,
    "path": "../../.output/public/_server/assets/auth-lxAQ3sd1.js.br"
  },
  "/_server/assets/auth-lxAQ3sd1.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"765-XaoqjkUV4JsZ1kjF0FVXjh6lPTM\"",
    "mtime": "2025-09-28T06:59:18.440Z",
    "size": 1893,
    "path": "../../.output/public/_server/assets/auth-lxAQ3sd1.js.gz"
  },
  "/_server/assets/http-dBtNME8h.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"751-CDaXcATNvagvPElVr3IgR04G1NI\"",
    "mtime": "2025-09-28T06:59:18.366Z",
    "size": 1873,
    "path": "../../.output/public/_server/assets/http-dBtNME8h.js"
  },
  "/_server/assets/http-dBtNME8h.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"30e-giCQcCXt3Umfc5Zfi4xijBiP06M\"",
    "mtime": "2025-09-28T06:59:18.440Z",
    "size": 782,
    "path": "../../.output/public/_server/assets/http-dBtNME8h.js.br"
  },
  "/_server/assets/http-dBtNME8h.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"392-8nP0vaEacMI3RwqBbOOZuY9Piyk\"",
    "mtime": "2025-09-28T06:59:18.440Z",
    "size": 914,
    "path": "../../.output/public/_server/assets/http-dBtNME8h.js.gz"
  },
  "/_server/assets/server-fns-C8-WT3ir.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"317d-vMfpGZiscqE++69qYbRVW93KGHc\"",
    "mtime": "2025-09-28T06:59:18.366Z",
    "size": 12669,
    "path": "../../.output/public/_server/assets/server-fns-C8-WT3ir.js"
  },
  "/_server/assets/server-fns-C8-WT3ir.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"fc8-LLJz7/6XTBef5isbDou9Cz8qmVQ\"",
    "mtime": "2025-09-28T06:59:18.442Z",
    "size": 4040,
    "path": "../../.output/public/_server/assets/server-fns-C8-WT3ir.js.br"
  },
  "/_server/assets/server-fns-C8-WT3ir.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"1174-prDF3OGjILJggfJMEWChq5Vw1gY\"",
    "mtime": "2025-09-28T06:59:18.441Z",
    "size": 4468,
    "path": "../../.output/public/_server/assets/server-fns-C8-WT3ir.js.gz"
  },
  "/_server/assets/utils-CVcNPmWW.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"4a4-rqzxQ13wR+LebjqVgtR1ujLxgzM\"",
    "mtime": "2025-09-28T06:59:18.366Z",
    "size": 1188,
    "path": "../../.output/public/_server/assets/utils-CVcNPmWW.js"
  },
  "/_server/assets/utils-CVcNPmWW.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"27a-ruNGMLSonPyhFDx/Y3UdBkO+U2s\"",
    "mtime": "2025-09-28T06:59:18.441Z",
    "size": 634,
    "path": "../../.output/public/_server/assets/utils-CVcNPmWW.js.br"
  },
  "/_server/assets/utils-CVcNPmWW.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"2d0-AfqLBzHEHPurnILuCeXpylachvo\"",
    "mtime": "2025-09-28T06:59:18.441Z",
    "size": 720,
    "path": "../../.output/public/_server/assets/utils-CVcNPmWW.js.gz"
  },
  "/_build/assets/Navigation-C0zpTr2U.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"c5a-NszmflmLvkbtKmPI/LPq7kJz34A\"",
    "mtime": "2025-09-28T06:59:18.364Z",
    "size": 3162,
    "path": "../../.output/public/_build/assets/Navigation-C0zpTr2U.js"
  },
  "/_build/assets/Navigation-C0zpTr2U.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"46b-HEuzjpsb5NmiTpZIRyLD4y2CO7U\"",
    "mtime": "2025-09-28T06:59:18.439Z",
    "size": 1131,
    "path": "../../.output/public/_build/assets/Navigation-C0zpTr2U.js.br"
  },
  "/_build/assets/Navigation-C0zpTr2U.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"515-kNq4YIb6rDq/GEYXaejIT3bNNY4\"",
    "mtime": "2025-09-28T06:59:18.439Z",
    "size": 1301,
    "path": "../../.output/public/_build/assets/Navigation-C0zpTr2U.js.gz"
  },
  "/_build/assets/alerts-CmQb3K8K.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"5a6c-O2t9ov1G7jm8l/A7sB0VQ1BPp6Y\"",
    "mtime": "2025-09-28T06:59:18.364Z",
    "size": 23148,
    "path": "../../.output/public/_build/assets/alerts-CmQb3K8K.js"
  },
  "/_build/assets/alerts-CmQb3K8K.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"1348-8hUUGBxOPiwBjcnpybp7mPU1BVE\"",
    "mtime": "2025-09-28T06:59:18.440Z",
    "size": 4936,
    "path": "../../.output/public/_build/assets/alerts-CmQb3K8K.js.br"
  },
  "/_build/assets/alerts-CmQb3K8K.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"16c3-t6S0E+6pPosWNzM2oWxrp97GvKw\"",
    "mtime": "2025-09-28T06:59:18.440Z",
    "size": 5827,
    "path": "../../.output/public/_build/assets/alerts-CmQb3K8K.js.gz"
  },
  "/_build/assets/api-docs-psUGna-C.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"eca-2jqekAupsLYqofnZJoRW7Y/9wiQ\"",
    "mtime": "2025-09-28T06:59:18.364Z",
    "size": 3786,
    "path": "../../.output/public/_build/assets/api-docs-psUGna-C.js"
  },
  "/_build/assets/api-docs-psUGna-C.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"32a-I/xhO5zqaqtq7o9nNe52q+M30/M\"",
    "mtime": "2025-09-28T06:59:18.439Z",
    "size": 810,
    "path": "../../.output/public/_build/assets/api-docs-psUGna-C.js.br"
  },
  "/_build/assets/api-docs-psUGna-C.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"3ea-WV4PPUuHEx6GwqU5o+p4IQBmAB4\"",
    "mtime": "2025-09-28T06:59:18.439Z",
    "size": 1002,
    "path": "../../.output/public/_build/assets/api-docs-psUGna-C.js.gz"
  },
  "/_build/assets/api-test-w8q6odO5.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"f17-DX32jZWxpp0/h7D2E7ow51ajolo\"",
    "mtime": "2025-09-28T06:59:18.364Z",
    "size": 3863,
    "path": "../../.output/public/_build/assets/api-test-w8q6odO5.js"
  },
  "/_build/assets/api-test-w8q6odO5.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"4ef-LL319LIcigw1LieHtefpzAuzsBc\"",
    "mtime": "2025-09-28T06:59:18.439Z",
    "size": 1263,
    "path": "../../.output/public/_build/assets/api-test-w8q6odO5.js.br"
  },
  "/_build/assets/api-test-w8q6odO5.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"5cb-sWrizSA0eilwtyBjmnxl9YHeS9A\"",
    "mtime": "2025-09-28T06:59:18.439Z",
    "size": 1483,
    "path": "../../.output/public/_build/assets/api-test-w8q6odO5.js.gz"
  },
  "/_build/assets/charts-BBVsFB48.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2c2e-jCXLtiuvQ2ni+lEmx/lWtqMTplY\"",
    "mtime": "2025-09-28T06:59:18.364Z",
    "size": 11310,
    "path": "../../.output/public/_build/assets/charts-BBVsFB48.js"
  },
  "/_build/assets/charts-BBVsFB48.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"ab2-o9OM6m29XZOELzaqwONivviYiN4\"",
    "mtime": "2025-09-28T06:59:18.440Z",
    "size": 2738,
    "path": "../../.output/public/_build/assets/charts-BBVsFB48.js.br"
  },
  "/_build/assets/charts-BBVsFB48.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"c41-Sgw98WhHAzubXWDpCLtD+YcPhoI\"",
    "mtime": "2025-09-28T06:59:18.440Z",
    "size": 3137,
    "path": "../../.output/public/_build/assets/charts-BBVsFB48.js.gz"
  },
  "/_build/assets/client-BqC2FJRv.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"5819-n2C2AfaGAuq8jLRnv7mJgPVbLjs\"",
    "mtime": "2025-09-28T06:59:18.364Z",
    "size": 22553,
    "path": "../../.output/public/_build/assets/client-BqC2FJRv.css"
  },
  "/_build/assets/client-BqC2FJRv.css.br": {
    "type": "text/css; charset=utf-8",
    "encoding": "br",
    "etag": "\"e85-vy+qxlfCEN6n85GU7OU1foAYo9U\"",
    "mtime": "2025-09-28T06:59:18.440Z",
    "size": 3717,
    "path": "../../.output/public/_build/assets/client-BqC2FJRv.css.br"
  },
  "/_build/assets/client-BqC2FJRv.css.gz": {
    "type": "text/css; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"1105-KX2g1zQw9UEZDmptgjuYjPqvBDo\"",
    "mtime": "2025-09-28T06:59:18.440Z",
    "size": 4357,
    "path": "../../.output/public/_build/assets/client-BqC2FJRv.css.gz"
  },
  "/_build/assets/client-C95NAguV.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"aaf5-YubtlRkjPbsG6iordwscxiB0EUM\"",
    "mtime": "2025-09-28T06:59:18.364Z",
    "size": 43765,
    "path": "../../.output/public/_build/assets/client-C95NAguV.js"
  },
  "/_build/assets/client-C95NAguV.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"316c-sD+WOCWcoxQ60urAutvrEGpRZ0c\"",
    "mtime": "2025-09-28T06:59:18.440Z",
    "size": 12652,
    "path": "../../.output/public/_build/assets/client-C95NAguV.js.br"
  },
  "/_build/assets/client-C95NAguV.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"36f7-huOPqeTKN5zDZYiIW5m0anRg56w\"",
    "mtime": "2025-09-28T06:59:18.440Z",
    "size": 14071,
    "path": "../../.output/public/_build/assets/client-C95NAguV.js.gz"
  },
  "/_build/assets/container-CPLhW4lJ.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"3639-+j/WbU5vKClu32gNhq/WnfZuaJU\"",
    "mtime": "2025-09-28T06:59:18.364Z",
    "size": 13881,
    "path": "../../.output/public/_build/assets/container-CPLhW4lJ.js"
  },
  "/_build/assets/container-CPLhW4lJ.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"950-onwClO4L7tBX4EakO9qPujJ2f4Y\"",
    "mtime": "2025-09-28T06:59:18.440Z",
    "size": 2384,
    "path": "../../.output/public/_build/assets/container-CPLhW4lJ.js.br"
  },
  "/_build/assets/container-CPLhW4lJ.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"a9a-rsw8MRSgDzFxn6hzUqGoR8G9dEU\"",
    "mtime": "2025-09-28T06:59:18.440Z",
    "size": 2714,
    "path": "../../.output/public/_build/assets/container-CPLhW4lJ.js.gz"
  },
  "/_build/assets/dashboard-BGIudRU0.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"24da-SH/KvT/xzUctJCrVh8XGWQJReM4\"",
    "mtime": "2025-09-28T06:59:18.364Z",
    "size": 9434,
    "path": "../../.output/public/_build/assets/dashboard-BGIudRU0.js"
  },
  "/_build/assets/dashboard-BGIudRU0.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"b8e-yZQaHfOdOllt/keaZ94e94oPFhc\"",
    "mtime": "2025-09-28T06:59:18.440Z",
    "size": 2958,
    "path": "../../.output/public/_build/assets/dashboard-BGIudRU0.js.br"
  },
  "/_build/assets/dashboard-BGIudRU0.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"d40-Dl32Fh7yyzL2wvy2OBmwpMCE/DQ\"",
    "mtime": "2025-09-28T06:59:18.440Z",
    "size": 3392,
    "path": "../../.output/public/_build/assets/dashboard-BGIudRU0.js.gz"
  },
  "/_build/assets/index-B9KKzenf.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"89-Nbww6tzfn4DwBR0qhevmihnyEjw\"",
    "mtime": "2025-09-28T06:59:18.364Z",
    "size": 137,
    "path": "../../.output/public/_build/assets/index-B9KKzenf.js"
  },
  "/_build/assets/index-C_OXL9IE.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1ffdc-xTw71mcIXnlqOIjDvDslYoQpOGs\"",
    "mtime": "2025-09-28T06:59:18.365Z",
    "size": 131036,
    "path": "../../.output/public/_build/assets/index-C_OXL9IE.js"
  },
  "/_build/assets/index-C_OXL9IE.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"a093-iTmTh3LI8yjasgvFPIgsLeUxYJU\"",
    "mtime": "2025-09-28T06:59:18.500Z",
    "size": 41107,
    "path": "../../.output/public/_build/assets/index-C_OXL9IE.js.br"
  },
  "/_build/assets/index-C_OXL9IE.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"b56c-EhRWBQ9wZlcgKAJCc8k/12j5iCU\"",
    "mtime": "2025-09-28T06:59:18.441Z",
    "size": 46444,
    "path": "../../.output/public/_build/assets/index-C_OXL9IE.js.gz"
  },
  "/_build/assets/index-D0yHUZy9.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"348a-OyFr1kjmYImPbR9rqxxpOcBVhGc\"",
    "mtime": "2025-09-28T06:59:18.365Z",
    "size": 13450,
    "path": "../../.output/public/_build/assets/index-D0yHUZy9.js"
  },
  "/_build/assets/index-D0yHUZy9.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"1445-UHw8bFUV2JMbmTqzJgtGaATwR5k\"",
    "mtime": "2025-09-28T06:59:18.440Z",
    "size": 5189,
    "path": "../../.output/public/_build/assets/index-D0yHUZy9.js.br"
  },
  "/_build/assets/index-D0yHUZy9.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"1658-oue12JRDcz01Q0lgGLMn1+AvYqg\"",
    "mtime": "2025-09-28T06:59:18.440Z",
    "size": 5720,
    "path": "../../.output/public/_build/assets/index-D0yHUZy9.js.gz"
  },
  "/_build/assets/notifications-ZMcAT3ky.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"3539-qi0JtZQERZFTiGua4AJtVk1Ak6g\"",
    "mtime": "2025-09-28T06:59:18.364Z",
    "size": 13625,
    "path": "../../.output/public/_build/assets/notifications-ZMcAT3ky.js"
  },
  "/_build/assets/notifications-ZMcAT3ky.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"e33-Ls6goNkHNU0d9mcjE5EuzfAxhRo\"",
    "mtime": "2025-09-28T06:59:18.440Z",
    "size": 3635,
    "path": "../../.output/public/_build/assets/notifications-ZMcAT3ky.js.br"
  },
  "/_build/assets/notifications-ZMcAT3ky.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"1050-jAMbUiMS26rnrtAPxYhdTgNEvtI\"",
    "mtime": "2025-09-28T06:59:18.440Z",
    "size": 4176,
    "path": "../../.output/public/_build/assets/notifications-ZMcAT3ky.js.gz"
  },
  "/_build/assets/settings-SNghGxtz.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"41aa-TdZr70a9w2YAcScwUXUCxQcOAc0\"",
    "mtime": "2025-09-28T06:59:18.365Z",
    "size": 16810,
    "path": "../../.output/public/_build/assets/settings-SNghGxtz.js"
  },
  "/_build/assets/settings-SNghGxtz.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"112b-4V5sRJZajSetxB1cdI5MHGM+5bs\"",
    "mtime": "2025-09-28T06:59:18.440Z",
    "size": 4395,
    "path": "../../.output/public/_build/assets/settings-SNghGxtz.js.br"
  },
  "/_build/assets/settings-SNghGxtz.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"1420-gTw0UuUoWLpJMsfUw2ddvtifAXI\"",
    "mtime": "2025-09-28T06:59:18.440Z",
    "size": 5152,
    "path": "../../.output/public/_build/assets/settings-SNghGxtz.js.gz"
  },
  "/_build/assets/swagger-Dp40dFts.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"b2e-W4hGEzJgTn24goB/VNpz+AJE1dY\"",
    "mtime": "2025-09-28T06:59:18.365Z",
    "size": 2862,
    "path": "../../.output/public/_build/assets/swagger-Dp40dFts.js"
  },
  "/_build/assets/swagger-Dp40dFts.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"411-E/YJr9lAgjgdEi7d6af5mipXkWA\"",
    "mtime": "2025-09-28T06:59:18.440Z",
    "size": 1041,
    "path": "../../.output/public/_build/assets/swagger-Dp40dFts.js.br"
  },
  "/_build/assets/swagger-Dp40dFts.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"4de-FdS/CZFEnCtglAxe1L8jybUVXNE\"",
    "mtime": "2025-09-28T06:59:18.440Z",
    "size": 1246,
    "path": "../../.output/public/_build/assets/swagger-Dp40dFts.js.gz"
  },
  "/_build/assets/targets-5DvLf6LR.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"3d5a-avfpuagzDH/nh0+ka3+paUDjvJc\"",
    "mtime": "2025-09-28T06:59:18.365Z",
    "size": 15706,
    "path": "../../.output/public/_build/assets/targets-5DvLf6LR.js"
  },
  "/_build/assets/targets-5DvLf6LR.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"df2-9cT54NYgfyc32IA0BRTZVjh3DVE\"",
    "mtime": "2025-09-28T06:59:18.440Z",
    "size": 3570,
    "path": "../../.output/public/_build/assets/targets-5DvLf6LR.js.br"
  },
  "/_build/assets/targets-5DvLf6LR.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"1038-RDPY5L6rX5KkxL+Y1u8lJN4VTy4\"",
    "mtime": "2025-09-28T06:59:18.440Z",
    "size": 4152,
    "path": "../../.output/public/_build/assets/targets-5DvLf6LR.js.gz"
  },
  "/_build/assets/web-DWs2y45l.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"634b-nMw8gy8m7lXHVg5albKf9B4N8+o\"",
    "mtime": "2025-09-28T06:59:18.365Z",
    "size": 25419,
    "path": "../../.output/public/_build/assets/web-DWs2y45l.js"
  },
  "/_build/assets/web-DWs2y45l.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"22d3-K24qETw9MaKAo7m+cDeyd4wYkfk\"",
    "mtime": "2025-09-28T06:59:18.440Z",
    "size": 8915,
    "path": "../../.output/public/_build/assets/web-DWs2y45l.js.br"
  },
  "/_build/assets/web-DWs2y45l.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"262c-UoNaroJPnYDBuJtnRjVmV3wfVeI\"",
    "mtime": "2025-09-28T06:59:18.440Z",
    "size": 9772,
    "path": "../../.output/public/_build/assets/web-DWs2y45l.js.gz"
  }
};

function readAsset (id) {
  const serverDir = dirname(fileURLToPath(globalThis._importMeta_.url));
  return promises.readFile(resolve(serverDir, assets[id].path))
}

const publicAssetBases = {};

function isPublicAssetURL(id = '') {
  if (assets[id]) {
    return true
  }
  for (const base in publicAssetBases) {
    if (id.startsWith(base)) { return true }
  }
  return false
}

function getAsset (id) {
  return assets[id]
}

const METHODS = /* @__PURE__ */ new Set(["HEAD", "GET"]);
const EncodingMap = { gzip: ".gz", br: ".br" };
const _zSw6yC = eventHandler((event) => {
  if (event.method && !METHODS.has(event.method)) {
    return;
  }
  let id = decodePath(
    withLeadingSlash(withoutTrailingSlash(parseURL(event.path).pathname))
  );
  let asset;
  const encodingHeader = String(
    getRequestHeader(event, "accept-encoding") || ""
  );
  const encodings = [
    ...encodingHeader.split(",").map((e) => EncodingMap[e.trim()]).filter(Boolean).sort(),
    ""
  ];
  if (encodings.length > 1) {
    appendResponseHeader(event, "Vary", "Accept-Encoding");
  }
  for (const encoding of encodings) {
    for (const _id of [id + encoding, joinURL(id, "index.html" + encoding)]) {
      const _asset = getAsset(_id);
      if (_asset) {
        asset = _asset;
        id = _id;
        break;
      }
    }
  }
  if (!asset) {
    if (isPublicAssetURL(id)) {
      removeResponseHeader(event, "Cache-Control");
      throw createError({ statusCode: 404 });
    }
    return;
  }
  const ifNotMatch = getRequestHeader(event, "if-none-match") === asset.etag;
  if (ifNotMatch) {
    setResponseStatus(event, 304, "Not Modified");
    return "";
  }
  const ifModifiedSinceH = getRequestHeader(event, "if-modified-since");
  const mtimeDate = new Date(asset.mtime);
  if (ifModifiedSinceH && asset.mtime && new Date(ifModifiedSinceH) >= mtimeDate) {
    setResponseStatus(event, 304, "Not Modified");
    return "";
  }
  if (asset.type && !getResponseHeader(event, "Content-Type")) {
    setResponseHeader(event, "Content-Type", asset.type);
  }
  if (asset.etag && !getResponseHeader(event, "ETag")) {
    setResponseHeader(event, "ETag", asset.etag);
  }
  if (asset.mtime && !getResponseHeader(event, "Last-Modified")) {
    setResponseHeader(event, "Last-Modified", mtimeDate.toUTCString());
  }
  if (asset.encoding && !getResponseHeader(event, "Content-Encoding")) {
    setResponseHeader(event, "Content-Encoding", asset.encoding);
  }
  if (asset.size > 0 && !getResponseHeader(event, "Content-Length")) {
    setResponseHeader(event, "Content-Length", asset.size);
  }
  return readAsset(id);
});

function T$1(e) {
  let n;
  const s = u$1(e), a = { duplex: "half", method: e.method, headers: e.headers };
  return e.node.req.body instanceof ArrayBuffer ? new Request(s, { ...a, body: e.node.req.body }) : new Request(s, { ...a, get body() {
    return n || (n = E$1(e), n);
  } });
}
function v$1(e) {
  var _a;
  return (_a = e.web) != null ? _a : e.web = { request: T$1(e), url: u$1(e) }, e.web.request;
}
function k$1() {
  return P$2();
}
const r = Symbol("$HTTPEvent");
function w$1(e) {
  return typeof e == "object" && (e instanceof H3Event || (e == null ? void 0 : e[r]) instanceof H3Event || (e == null ? void 0 : e.__is_event__) === true);
}
function t$1(e) {
  return function(...n) {
    var _a;
    let s = n[0];
    if (w$1(s)) n[0] = s instanceof H3Event || s.__is_event__ ? s : s[r];
    else {
      if (!((_a = globalThis.app.config.server.experimental) == null ? void 0 : _a.asyncContext)) throw new Error("AsyncLocalStorage was not enabled. Use the `server.experimental.asyncContext: true` option in your app configuration to enable it. Or, pass the instance of HTTPEvent that you have as the first argument to the function.");
      if (s = k$1(), !s) throw new Error("No HTTPEvent found in AsyncLocalStorage. Make sure you are using the function within the server runtime.");
      n.unshift(s);
    }
    return e(...n);
  };
}
const u$1 = t$1(getRequestURL$1), U$1 = t$1(getRequestIP), I$2 = t$1(setResponseStatus$1), N$2 = t$1(getResponseStatus), B$2 = t$1(getResponseStatusText), F$1 = t$1(getResponseHeaders), M$2 = t$1(getResponseHeader$1), O$1 = t$1(setResponseHeader$1), z$2 = t$1(appendResponseHeader$1), D = t$1(sendRedirect$1), G$1 = t$1(parseCookies), J$1 = t$1(getCookie), K$1 = t$1(setCookie), Q$1 = t$1(setHeader), E$1 = t$1(getRequestWebStream), V$1 = t$1(removeResponseHeader$1), X$1 = t$1(v$1);
function _$1() {
  var _a;
  return getContext("nitro-app", { asyncContext: !!((_a = globalThis.app.config.server.experimental) == null ? void 0 : _a.asyncContext), AsyncLocalStorage: AsyncLocalStorage });
}
function P$2() {
  return _$1().use().event;
}

var __defProp$1 = Object.defineProperty;
var __defNormalProp$1 = (obj, key, value) => key in obj ? __defProp$1(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField$1 = (obj, key, value) => __defNormalProp$1(obj, typeof key !== "symbol" ? key + "" : key, value);
const S$1 = "Invariant Violation", { setPrototypeOf: we = function(e, r) {
  return e.__proto__ = r, e;
} } = Object;
class q extends Error {
  constructor(r = S$1) {
    super(typeof r == "number" ? `${S$1}: ${r} (see https://github.com/apollographql/invariant-packages)` : r);
    __publicField$1(this, "framesToPop", 1);
    __publicField$1(this, "name", S$1);
    we(this, q.prototype);
  }
}
function Se(e, r) {
  if (!e) throw new q(r);
}
const R = "solidFetchEvent";
function Re(e) {
  return { request: X$1(e), response: be(e), clientAddress: U$1(e), locals: {}, nativeEvent: e };
}
function Pe(e) {
  return { ...e };
}
function ve(e) {
  if (!e.context[R]) {
    const r = Re(e);
    e.context[R] = r;
  }
  return e.context[R];
}
function I$1(e, r) {
  for (const [t, n] of r.entries()) z$2(e, t, n);
}
class ke {
  constructor(r) {
    __publicField$1(this, "event");
    this.event = r;
  }
  get(r) {
    const t = M$2(this.event, r);
    return Array.isArray(t) ? t.join(", ") : t || null;
  }
  has(r) {
    return this.get(r) !== null;
  }
  set(r, t) {
    return O$1(this.event, r, t);
  }
  delete(r) {
    return V$1(this.event, r);
  }
  append(r, t) {
    z$2(this.event, r, t);
  }
  getSetCookie() {
    const r = M$2(this.event, "Set-Cookie");
    return Array.isArray(r) ? r : [r];
  }
  forEach(r) {
    return Object.entries(F$1(this.event)).forEach(([t, n]) => r(Array.isArray(n) ? n.join(", ") : n, t, this));
  }
  entries() {
    return Object.entries(F$1(this.event)).map(([r, t]) => [r, Array.isArray(t) ? t.join(", ") : t])[Symbol.iterator]();
  }
  keys() {
    return Object.keys(F$1(this.event))[Symbol.iterator]();
  }
  values() {
    return Object.values(F$1(this.event)).map((r) => Array.isArray(r) ? r.join(", ") : r)[Symbol.iterator]();
  }
  [Symbol.iterator]() {
    return this.entries()[Symbol.iterator]();
  }
}
function be(e) {
  return { get status() {
    return N$2(e);
  }, set status(r) {
    I$2(e, r);
  }, get statusText() {
    return B$2(e);
  }, set statusText(r) {
    I$2(e, N$2(e), r);
  }, headers: new ke(e) };
}
const _ = [{ page: true, path: "/alerts", filePath: "/Users/david/Documents/Projects/network-monitor/src/routes/alerts.tsx" }, { page: true, path: "/api-docs", filePath: "/Users/david/Documents/Projects/network-monitor/src/routes/api-docs.tsx" }, { page: true, path: "/api-test", filePath: "/Users/david/Documents/Projects/network-monitor/src/routes/api-test.tsx" }, { page: true, path: "/charts", filePath: "/Users/david/Documents/Projects/network-monitor/src/routes/charts.tsx" }, { page: true, path: "/dashboard", filePath: "/Users/david/Documents/Projects/network-monitor/src/routes/dashboard.tsx" }, { page: true, path: "/", filePath: "/Users/david/Documents/Projects/network-monitor/src/routes/index.tsx" }, { page: true, path: "/notifications", filePath: "/Users/david/Documents/Projects/network-monitor/src/routes/notifications.tsx" }, { page: true, path: "/settings", filePath: "/Users/david/Documents/Projects/network-monitor/src/routes/settings.tsx" }, { page: true, path: "/targets", filePath: "/Users/david/Documents/Projects/network-monitor/src/routes/targets.tsx" }, { page: false, $GET: { src: "src/routes/api/docs.ts?pick=GET", build: () => import('../build/docs.mjs'), import: () => import('../build/docs.mjs') }, $HEAD: { src: "src/routes/api/docs.ts?pick=GET", build: () => import('../build/docs.mjs'), import: () => import('../build/docs.mjs') }, path: "/api/docs", filePath: "/Users/david/Documents/Projects/network-monitor/src/routes/api/docs.ts" }, { page: true, path: "/api/swagger", filePath: "/Users/david/Documents/Projects/network-monitor/src/routes/api/swagger.tsx" }, { page: false, $GET: { src: "src/routes/api/auth/[...solidauth].ts?pick=GET", build: () => import('../build/_...solidauth_.mjs'), import: () => import('../build/_...solidauth_.mjs') }, $HEAD: { src: "src/routes/api/auth/[...solidauth].ts?pick=GET", build: () => import('../build/_...solidauth_.mjs'), import: () => import('../build/_...solidauth_.mjs') }, $POST: { src: "src/routes/api/auth/[...solidauth].ts?pick=POST", build: () => import('../build/_...solidauth_2.mjs'), import: () => import('../build/_...solidauth_2.mjs') }, path: "/api/auth/*solidauth", filePath: "/Users/david/Documents/Projects/network-monitor/src/routes/api/auth/[...solidauth].ts" }, { page: false, $GET: { src: "src/routes/api/prpc/[prpc].ts?pick=GET", build: () => import('../build/_prpc_.mjs'), import: () => import('../build/_prpc_.mjs') }, $HEAD: { src: "src/routes/api/prpc/[prpc].ts?pick=GET", build: () => import('../build/_prpc_.mjs'), import: () => import('../build/_prpc_.mjs') }, $POST: { src: "src/routes/api/prpc/[prpc].ts?pick=POST", build: () => import('../build/_prpc_2.mjs'), import: () => import('../build/_prpc_2.mjs') }, path: "/api/prpc/:prpc", filePath: "/Users/david/Documents/Projects/network-monitor/src/routes/api/prpc/[prpc].ts" }, { page: false, $GET: { src: "src/routes/api/trpc/[trpc].ts?pick=GET", build: () => import('../build/_trpc_.mjs'), import: () => import('../build/_trpc_.mjs') }, $HEAD: { src: "src/routes/api/trpc/[trpc].ts?pick=GET", build: () => import('../build/_trpc_.mjs'), import: () => import('../build/_trpc_.mjs') }, $POST: { src: "src/routes/api/trpc/[trpc].ts?pick=POST", build: () => import('../build/_trpc_2.mjs'), import: () => import('../build/_trpc_2.mjs') }, path: "/api/trpc/:trpc", filePath: "/Users/david/Documents/Projects/network-monitor/src/routes/api/trpc/[trpc].ts" }], $e = Ee(_.filter((e) => e.page));
function Ee(e) {
  function r(t, n, o, a) {
    const i = Object.values(t).find((c) => o.startsWith(c.id + "/"));
    return i ? (r(i.children || (i.children = []), n, o.slice(i.id.length)), t) : (t.push({ ...n, id: o, path: o.replace(/\([^)/]+\)/g, "").replace(/\/+/g, "/") }), t);
  }
  return e.sort((t, n) => t.path.length - n.path.length).reduce((t, n) => r(t, n, n.path, n.path), []);
}
function Te(e) {
  return e.$HEAD || e.$GET || e.$POST || e.$PUT || e.$PATCH || e.$DELETE;
}
createRouter({ routes: _.reduce((e, r) => {
  if (!Te(r)) return e;
  let t = r.path.replace(/\([^)/]+\)/g, "").replace(/\/+/g, "/").replace(/\*([^/]*)/g, (n, o) => `**:${o}`).split("/").map((n) => n.startsWith(":") || n.startsWith("*") ? n : encodeURIComponent(n)).join("/");
  if (/:[^/]*\?/g.test(t)) throw new Error(`Optional parameters are not supported in API routes: ${t}`);
  if (e[t]) throw new Error(`Duplicate API routes for "${t}" found at "${e[t].route.path}" and "${r.path}"`);
  return e[t] = { route: r }, e;
}, {}) });
var je = " ";
const Ae = { style: (e) => ssrElement("style", e.attrs, () => e.children, true), link: (e) => ssrElement("link", e.attrs, void 0, true), script: (e) => e.attrs.src ? ssrElement("script", mergeProps(() => e.attrs, { get id() {
  return e.key;
} }), () => ssr(je), true) : null, noscript: (e) => ssrElement("noscript", e.attrs, () => escape(e.children), true) };
function Ue(e, r) {
  let { tag: t, attrs: { key: n, ...o } = { key: void 0 }, children: a } = e;
  return Ae[t]({ attrs: { ...o, nonce: r }, key: n, children: a });
}
function qe(e, r, t, n = "default") {
  return lazy(async () => {
    var _a;
    {
      const a = (await e.import())[n], c = (await ((_a = r.inputs) == null ? void 0 : _a[e.src].assets())).filter((p) => p.tag === "style" || p.attrs.rel === "stylesheet");
      return { default: (p) => [...c.map((f) => Ue(f)), createComponent(a, p)] };
    }
  });
}
function z$1() {
  function e(t) {
    return { ...t, ...t.$$route ? t.$$route.require().route : void 0, info: { ...t.$$route ? t.$$route.require().route.info : {}, filesystem: true }, component: t.$component && qe(t.$component, globalThis.MANIFEST.client, globalThis.MANIFEST.ssr), children: t.children ? t.children.map(e) : void 0 };
  }
  return $e.map(e);
}
let L$1;
const Qe = isServer ? () => getRequestEvent().routes : () => L$1 || (L$1 = z$1());
function De(e) {
  const r = J$1(e.nativeEvent, "flash");
  if (r) try {
    let t = JSON.parse(r);
    if (!t || !t.result) return;
    const n = [...t.input.slice(0, -1), new Map(t.input[t.input.length - 1])], o = t.error ? new Error(t.result) : t.result;
    return { input: n, url: t.url, pending: false, result: t.thrown ? void 0 : o, error: t.thrown ? o : void 0 };
  } catch (t) {
    console.error(t);
  } finally {
    K$1(e.nativeEvent, "flash", "", { maxAge: 0 });
  }
}
async function He(e) {
  const r = globalThis.MANIFEST.client;
  return globalThis.MANIFEST.ssr, e.response.headers.set("Content-Type", "text/html"), Object.assign(e, { manifest: await r.json(), assets: [...await r.inputs[r.handler].assets()], router: { submission: De(e) }, routes: z$1(), complete: false, $islands: /* @__PURE__ */ new Set() });
}
const Ce = /* @__PURE__ */ new Set([301, 302, 303, 307, 308]);
function Oe(e) {
  return e.status && Ce.has(e.status) ? e.status : 302;
}
const Fe = {};
function Ie(e) {
  const r = new TextEncoder().encode(e), t = r.length, n = t.toString(16), o = "00000000".substring(0, 8 - n.length) + n, a = new TextEncoder().encode(`;0x${o};`), i = new Uint8Array(12 + t);
  return i.set(a), i.set(r, 12), i;
}
function G(e, r) {
  return new ReadableStream({ start(t) {
    crossSerializeStream(r, { scopeId: e, plugins: [CustomEventPlugin, DOMExceptionPlugin, EventPlugin, FormDataPlugin, HeadersPlugin, ReadableStreamPlugin, RequestPlugin, ResponsePlugin, URLSearchParamsPlugin, URLPlugin], onSerialize(n, o) {
      t.enqueue(Ie(o ? `(${getCrossReferenceHeader(e)},${n})` : n));
    }, onDone() {
      t.close();
    }, onError(n) {
      t.error(n);
    } });
  } });
}
async function Le(e) {
  const r = ve(e), t = r.request, n = t.headers.get("X-Server-Id"), o = t.headers.get("X-Server-Instance"), a = t.headers.has("X-Single-Flight"), i = new URL(t.url);
  let c, l;
  if (n) Se(typeof n == "string", "Invalid server function"), [c, l] = n.split("#");
  else if (c = i.searchParams.get("id"), l = i.searchParams.get("name"), !c || !l) return new Response(null, { status: 404 });
  const p = Fe[c];
  let f;
  if (!p) return new Response(null, { status: 404 });
  f = await p.importer();
  const J = f[p.functionName];
  let d = [];
  if (!o || e.method === "GET") {
    const s = i.searchParams.get("args");
    if (s) {
      const u = JSON.parse(s);
      (u.t ? fromJSON(u, { plugins: [CustomEventPlugin, DOMExceptionPlugin, EventPlugin, FormDataPlugin, HeadersPlugin, ReadableStreamPlugin, RequestPlugin, ResponsePlugin, URLSearchParamsPlugin, URLPlugin] }) : u).forEach((h) => d.push(h));
    }
  }
  if (e.method === "POST") {
    const s = t.headers.get("content-type"), u = e.node.req, h = u instanceof ReadableStream, K = u.body instanceof ReadableStream, D = h && u.locked || K && u.body.locked, H = h ? u : u.body;
    if ((s == null ? void 0 : s.startsWith("multipart/form-data")) || (s == null ? void 0 : s.startsWith("application/x-www-form-urlencoded"))) d.push(await (D ? t : new Request(t, { ...t, body: H })).formData());
    else if (s == null ? void 0 : s.startsWith("application/json")) {
      const V = D ? t : new Request(t, { ...t, body: H });
      d = fromJSON(await V.json(), { plugins: [CustomEventPlugin, DOMExceptionPlugin, EventPlugin, FormDataPlugin, HeadersPlugin, ReadableStreamPlugin, RequestPlugin, ResponsePlugin, URLSearchParamsPlugin, URLPlugin] });
    }
  }
  try {
    let s = await provideRequestEvent(r, async () => (sharedConfig.context = { event: r }, r.locals.serverFunctionMeta = { id: c + "#" + l }, J(...d)));
    if (a && o && (s = await N$1(r, s)), s instanceof Response) {
      if (s.headers && s.headers.has("X-Content-Raw")) return s;
      o && (s.headers && I$1(e, s.headers), s.status && (s.status < 300 || s.status >= 400) && I$2(e, s.status), s.customBody ? s = await s.customBody() : s.body == null && (s = null));
    }
    return o ? (Q$1(e, "content-type", "text/javascript"), G(o, s)) : M$1(s, t, d);
  } catch (s) {
    if (s instanceof Response) a && o && (s = await N$1(r, s)), s.headers && I$1(e, s.headers), s.status && (!o || s.status < 300 || s.status >= 400) && I$2(e, s.status), s.customBody ? s = s.customBody() : s.body == null && (s = null), Q$1(e, "X-Error", "true");
    else if (o) {
      const u = s instanceof Error ? s.message : typeof s == "string" ? s : "true";
      Q$1(e, "X-Error", u.replace(/[\r\n]+/g, ""));
    } else s = M$1(s, t, d, true);
    return o ? (Q$1(e, "content-type", "text/javascript"), G(o, s)) : s;
  }
}
function M$1(e, r, t, n) {
  const o = new URL(r.url), a = e instanceof Error;
  let i = 302, c;
  return e instanceof Response ? (c = new Headers(e.headers), e.headers.has("Location") && (c.set("Location", new URL(e.headers.get("Location"), o.origin + "").toString()), i = Oe(e))) : c = new Headers({ Location: new URL(r.headers.get("referer")).toString() }), e && c.append("Set-Cookie", `flash=${encodeURIComponent(JSON.stringify({ url: o.pathname + o.search, result: a ? e.message : e, thrown: n, error: a, input: [...t.slice(0, -1), [...t[t.length - 1].entries()]] }))}; Secure; HttpOnly;`), new Response(null, { status: i, headers: c });
}
let P$1;
function Ge(e) {
  var _a;
  const r = new Headers(e.request.headers), t = G$1(e.nativeEvent), n = e.response.headers.getSetCookie();
  r.delete("cookie");
  let o = false;
  return ((_a = e.nativeEvent.node) == null ? void 0 : _a.req) && (o = true, e.nativeEvent.node.req.headers.cookie = ""), n.forEach((a) => {
    if (!a) return;
    const { maxAge: i, expires: c, name: l, value: p } = parseSetCookie(a);
    if (i != null && i <= 0) {
      delete t[l];
      return;
    }
    if (c != null && c.getTime() <= Date.now()) {
      delete t[l];
      return;
    }
    t[l] = p;
  }), Object.entries(t).forEach(([a, i]) => {
    r.append("cookie", `${a}=${i}`), o && (e.nativeEvent.node.req.headers.cookie += `${a}=${i};`);
  }), r;
}
async function N$1(e, r) {
  let t, n = new URL(e.request.headers.get("referer")).toString();
  r instanceof Response && (r.headers.has("X-Revalidate") && (t = r.headers.get("X-Revalidate").split(",")), r.headers.has("Location") && (n = new URL(r.headers.get("Location"), new URL(e.request.url).origin + "").toString()));
  const o = Pe(e);
  return o.request = new Request(n, { headers: Ge(e) }), await provideRequestEvent(o, async () => {
    await He(o), P$1 || (P$1 = (await import('../build/app-C1fILmjj.mjs')).default), o.router.dataOnly = t || true, o.router.previousUrl = e.request.headers.get("referer");
    try {
      renderToString(() => {
        sharedConfig.context.event = o, P$1();
      });
    } catch (c) {
      console.log(c);
    }
    const a = o.router.data;
    if (!a) return r;
    let i = false;
    for (const c in a) a[c] === void 0 ? delete a[c] : i = true;
    return i && (r instanceof Response ? r.customBody && (a._$value = r.customBody()) : (a._$value = r, r = new Response(null, { status: 200 })), r.customBody = () => a, r.headers.set("X-Single-Flight", "true")), r;
  });
}
const Ye = eventHandler$1(Le);

function S(e) {
  let n;
  const s = u(e), r = { duplex: "half", method: e.method, headers: e.headers };
  return e.node.req.body instanceof ArrayBuffer ? new Request(s, { ...r, body: e.node.req.body }) : new Request(s, { ...r, get body() {
    return n || (n = v(e), n);
  } });
}
function x$1(e) {
  var _a;
  return (_a = e.web) != null ? _a : e.web = { request: S(e), url: u(e) }, e.web.request;
}
function T() {
  return E();
}
const a = Symbol("$HTTPEvent");
function $(e) {
  return typeof e == "object" && (e instanceof H3Event || (e == null ? void 0 : e[a]) instanceof H3Event || (e == null ? void 0 : e.__is_event__) === true);
}
function t(e) {
  return function(...n) {
    var _a;
    let s = n[0];
    if ($(s)) n[0] = s instanceof H3Event || s.__is_event__ ? s : s[a];
    else {
      if (!((_a = globalThis.app.config.server.experimental) == null ? void 0 : _a.asyncContext)) throw new Error("AsyncLocalStorage was not enabled. Use the `server.experimental.asyncContext: true` option in your app configuration to enable it. Or, pass the instance of HTTPEvent that you have as the first argument to the function.");
      if (s = T(), !s) throw new Error("No HTTPEvent found in AsyncLocalStorage. Make sure you are using the function within the server runtime.");
      n.unshift(s);
    }
    return e(...n);
  };
}
const u = t(getRequestURL$1), A = t(getRequestIP), W$1 = t(setResponseStatus$1), L = t(getResponseStatus), U = t(getResponseStatusText), I = t(getResponseHeaders), N = t(getResponseHeader$1), k = t(setResponseHeader$1), B$1 = t(appendResponseHeader$1), F = t(sendRedirect$1), v = t(getRequestWebStream), M = t(removeResponseHeader$1), O = t(x$1);
function w() {
  var _a;
  return getContext("nitro-app", { asyncContext: !!((_a = globalThis.app.config.server.experimental) == null ? void 0 : _a.asyncContext), AsyncLocalStorage: AsyncLocalStorage });
}
function E() {
  return w().use().event;
}

var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, key + "" , value);
const W = isServer ? (t) => {
  const e = getRequestEvent();
  return e.response.status = t.code, e.response.statusText = t.text, onCleanup(() => !e.nativeEvent.handled && !e.complete && (e.response.status = 200)), null;
} : (t) => null;
var B = ["<span", ' style="font-size:1.5em;text-align:center;position:fixed;left:0px;bottom:55%;width:100%;">500 | Internal Server Error</span>'];
const J = (t) => {
  let e = false;
  const r = catchError(() => t.children, (s) => {
    console.error(s), e = !!s;
  });
  return e ? [ssr(B, ssrHydrationKey()), createComponent$1(W, { code: 500 })] : r;
};
var z = " ";
const K = { style: (t) => ssrElement("style", t.attrs, () => t.children, true), link: (t) => ssrElement("link", t.attrs, void 0, true), script: (t) => t.attrs.src ? ssrElement("script", mergeProps(() => t.attrs, { get id() {
  return t.key;
} }), () => ssr(z), true) : null, noscript: (t) => ssrElement("noscript", t.attrs, () => escape(t.children), true) };
function Y(t, e) {
  let { tag: r, attrs: { key: s, ...n } = { key: void 0 }, children: o } = t;
  return K[r]({ attrs: { ...n, nonce: e }, key: s, children: o });
}
var y = ["<script", ">", "<\/script>"], b = ["<script", ' type="module"', "><\/script>"];
const Q = ssr("<!DOCTYPE html>");
function V(t) {
  const e = getRequestEvent(), r = e.nonce;
  return createComponent$1(NoHydration, { get children() {
    return [Q, createComponent$1(J, { get children() {
      return createComponent$1(t.document, { get assets() {
        return e.assets.map((s) => Y(s));
      }, get scripts() {
        return r ? [ssr(y, ssrHydrationKey() + ssrAttribute("nonce", escape(r, true), false), `window.manifest = ${JSON.stringify(e.manifest)}`), ssr(b, ssrHydrationKey(), ssrAttribute("src", escape(globalThis.MANIFEST.client.inputs[globalThis.MANIFEST.client.handler].output.path, true), false))] : [ssr(y, ssrHydrationKey(), `window.manifest = ${JSON.stringify(e.manifest)}`), ssr(b, ssrHydrationKey(), ssrAttribute("src", escape(globalThis.MANIFEST.client.inputs[globalThis.MANIFEST.client.handler].output.path, true), false))];
      } });
    } })];
  } });
}
const x = [{ page: true, path: "/alerts", filePath: "/Users/david/Documents/Projects/network-monitor/src/routes/alerts.tsx" }, { page: true, path: "/api-docs", filePath: "/Users/david/Documents/Projects/network-monitor/src/routes/api-docs.tsx" }, { page: true, path: "/api-test", filePath: "/Users/david/Documents/Projects/network-monitor/src/routes/api-test.tsx" }, { page: true, path: "/charts", filePath: "/Users/david/Documents/Projects/network-monitor/src/routes/charts.tsx" }, { page: true, path: "/dashboard", filePath: "/Users/david/Documents/Projects/network-monitor/src/routes/dashboard.tsx" }, { page: true, path: "/", filePath: "/Users/david/Documents/Projects/network-monitor/src/routes/index.tsx" }, { page: true, path: "/notifications", filePath: "/Users/david/Documents/Projects/network-monitor/src/routes/notifications.tsx" }, { page: true, path: "/settings", filePath: "/Users/david/Documents/Projects/network-monitor/src/routes/settings.tsx" }, { page: true, path: "/targets", filePath: "/Users/david/Documents/Projects/network-monitor/src/routes/targets.tsx" }, { page: false, $GET: { src: "src/routes/api/docs.ts?pick=GET", build: () => import('../build/docs2.mjs'), import: () => import('../build/docs2.mjs') }, $HEAD: { src: "src/routes/api/docs.ts?pick=GET", build: () => import('../build/docs2.mjs'), import: () => import('../build/docs2.mjs') }, path: "/api/docs", filePath: "/Users/david/Documents/Projects/network-monitor/src/routes/api/docs.ts" }, { page: true, path: "/api/swagger", filePath: "/Users/david/Documents/Projects/network-monitor/src/routes/api/swagger.tsx" }, { page: false, $GET: { src: "src/routes/api/auth/[...solidauth].ts?pick=GET", build: () => import('../build/_...solidauth_3.mjs'), import: () => import('../build/_...solidauth_3.mjs') }, $HEAD: { src: "src/routes/api/auth/[...solidauth].ts?pick=GET", build: () => import('../build/_...solidauth_3.mjs'), import: () => import('../build/_...solidauth_3.mjs') }, $POST: { src: "src/routes/api/auth/[...solidauth].ts?pick=POST", build: () => import('../build/_...solidauth_22.mjs'), import: () => import('../build/_...solidauth_22.mjs') }, path: "/api/auth/*solidauth", filePath: "/Users/david/Documents/Projects/network-monitor/src/routes/api/auth/[...solidauth].ts" }, { page: false, $GET: { src: "src/routes/api/prpc/[prpc].ts?pick=GET", build: () => import('../build/_prpc_3.mjs'), import: () => import('../build/_prpc_3.mjs') }, $HEAD: { src: "src/routes/api/prpc/[prpc].ts?pick=GET", build: () => import('../build/_prpc_3.mjs'), import: () => import('../build/_prpc_3.mjs') }, $POST: { src: "src/routes/api/prpc/[prpc].ts?pick=POST", build: () => import('../build/_prpc_22.mjs'), import: () => import('../build/_prpc_22.mjs') }, path: "/api/prpc/:prpc", filePath: "/Users/david/Documents/Projects/network-monitor/src/routes/api/prpc/[prpc].ts" }, { page: false, $GET: { src: "src/routes/api/trpc/[trpc].ts?pick=GET", build: () => import('../build/_trpc_3.mjs'), import: () => import('../build/_trpc_3.mjs') }, $HEAD: { src: "src/routes/api/trpc/[trpc].ts?pick=GET", build: () => import('../build/_trpc_3.mjs'), import: () => import('../build/_trpc_3.mjs') }, $POST: { src: "src/routes/api/trpc/[trpc].ts?pick=POST", build: () => import('../build/_trpc_22.mjs'), import: () => import('../build/_trpc_22.mjs') }, path: "/api/trpc/:trpc", filePath: "/Users/david/Documents/Projects/network-monitor/src/routes/api/trpc/[trpc].ts" }];
X(x.filter((t) => t.page));
function X(t) {
  function e(r, s, n, o) {
    const i = Object.values(r).find((a) => n.startsWith(a.id + "/"));
    return i ? (e(i.children || (i.children = []), s, n.slice(i.id.length)), r) : (r.push({ ...s, id: n, path: n.replace(/\([^)/]+\)/g, "").replace(/\/+/g, "/") }), r);
  }
  return t.sort((r, s) => r.path.length - s.path.length).reduce((r, s) => e(r, s, s.path, s.path), []);
}
function Z(t, e) {
  const r = et.lookup(t);
  if (r && r.route) {
    const s = r.route, n = e === "HEAD" ? s.$HEAD || s.$GET : s[`$${e}`];
    if (n === void 0) return;
    const o = s.page === true && s.$component !== void 0;
    return { handler: n, params: r.params, isPage: o };
  }
}
function tt(t) {
  return t.$HEAD || t.$GET || t.$POST || t.$PUT || t.$PATCH || t.$DELETE;
}
const et = createRouter({ routes: x.reduce((t, e) => {
  if (!tt(e)) return t;
  let r = e.path.replace(/\([^)/]+\)/g, "").replace(/\/+/g, "/").replace(/\*([^/]*)/g, (s, n) => `**:${n}`).split("/").map((s) => s.startsWith(":") || s.startsWith("*") ? s : encodeURIComponent(s)).join("/");
  if (/:[^/]*\?/g.test(r)) throw new Error(`Optional parameters are not supported in API routes: ${r}`);
  if (t[r]) throw new Error(`Duplicate API routes for "${r}" found at "${t[r].route.path}" and "${e.path}"`);
  return t[r] = { route: e }, t;
}, {}) }), P = "solidFetchEvent";
function rt(t) {
  return { request: O(t), response: nt(t), clientAddress: A(t), locals: {}, nativeEvent: t };
}
function st(t) {
  if (!t.context[P]) {
    const e = rt(t);
    t.context[P] = e;
  }
  return t.context[P];
}
class ot {
  constructor(e) {
    __publicField(this, "event");
    this.event = e;
  }
  get(e) {
    const r = N(this.event, e);
    return Array.isArray(r) ? r.join(", ") : r || null;
  }
  has(e) {
    return this.get(e) !== null;
  }
  set(e, r) {
    return k(this.event, e, r);
  }
  delete(e) {
    return M(this.event, e);
  }
  append(e, r) {
    B$1(this.event, e, r);
  }
  getSetCookie() {
    const e = N(this.event, "Set-Cookie");
    return Array.isArray(e) ? e : [e];
  }
  forEach(e) {
    return Object.entries(I(this.event)).forEach(([r, s]) => e(Array.isArray(s) ? s.join(", ") : s, r, this));
  }
  entries() {
    return Object.entries(I(this.event)).map(([e, r]) => [e, Array.isArray(r) ? r.join(", ") : r])[Symbol.iterator]();
  }
  keys() {
    return Object.keys(I(this.event))[Symbol.iterator]();
  }
  values() {
    return Object.values(I(this.event)).map((e) => Array.isArray(e) ? e.join(", ") : e)[Symbol.iterator]();
  }
  [Symbol.iterator]() {
    return this.entries()[Symbol.iterator]();
  }
}
function nt(t) {
  return { get status() {
    return L(t);
  }, set status(e) {
    W$1(t, e);
  }, get statusText() {
    return U(t);
  }, set statusText(e) {
    W$1(t, L(t), e);
  }, headers: new ot(t) };
}
const at = /* @__PURE__ */ new Set([301, 302, 303, 307, 308]);
function it(t) {
  return t.status && at.has(t.status) ? t.status : 302;
}
function ct(t, e, r = {}, s) {
  return eventHandler$1({ handler: (n) => {
    const o = st(n);
    return provideRequestEvent(o, async () => {
      const i = Z(new URL(o.request.url).pathname, o.request.method);
      if (i) {
        const l = await i.handler.import(), g = o.request.method === "HEAD" ? l.HEAD || l.GET : l[o.request.method];
        o.params = i.params || {}, sharedConfig.context = { event: o };
        const v = await g(o);
        if (v !== void 0) return v;
        if (o.request.method !== "GET") throw new Error(`API handler for ${o.request.method} "${o.request.url}" did not return a response.`);
        if (!i.isPage) return;
      }
      const a = await e(o), h = typeof r == "function" ? await r(a) : { ...r };
      h.mode, h.nonce && (a.nonce = h.nonce);
      {
        const l = renderToString(() => (sharedConfig.context.event = a, t(a)), h);
        if (a.complete = true, a.response && a.response.headers.get("Location")) {
          const g = it(a.response);
          return F(n, a.response.headers.get("Location"), g);
        }
        return l;
      }
    });
  } });
}
function pt(t, e, r) {
  return ct(t, ut, e);
}
async function ut(t) {
  const e = globalThis.MANIFEST.client;
  return Object.assign(t, { manifest: await e.json(), assets: [...await e.inputs[e.handler].assets()], routes: [], complete: false, $islands: /* @__PURE__ */ new Set() });
}
var dt = ['<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><link rel="icon" href="/favicon.ico">', "</head>"], lt = ["<html", ' lang="en">', '<body><div id="app">', "</div><!--$-->", "<!--/--></body></html>"];
const $t = pt(() => createComponent$1(V, { document: ({ assets: t, children: e, scripts: r }) => ssr(lt, ssrHydrationKey(), createComponent$1(NoHydration, { get children() {
  return ssr(dt, escape(t));
} }), escape(e), escape(r)) }));

const handlers = [
  { route: '', handler: _zSw6yC, lazy: false, middleware: true, method: undefined },
  { route: '/_server', handler: Ye, lazy: false, middleware: true, method: undefined },
  { route: '/', handler: $t, lazy: false, middleware: true, method: undefined }
];

function createNitroApp() {
  const config = useRuntimeConfig();
  const hooks = createHooks();
  const captureError = (error, context = {}) => {
    const promise = hooks.callHookParallel("error", error, context).catch((error_) => {
      console.error("Error while capturing another error", error_);
    });
    if (context.event && isEvent(context.event)) {
      const errors = context.event.context.nitro?.errors;
      if (errors) {
        errors.push({ error, context });
      }
      if (context.event.waitUntil) {
        context.event.waitUntil(promise);
      }
    }
  };
  const h3App = createApp({
    debug: destr(false),
    onError: (error, event) => {
      captureError(error, { event, tags: ["request"] });
      return errorHandler(error, event);
    },
    onRequest: async (event) => {
      event.context.nitro = event.context.nitro || { errors: [] };
      const fetchContext = event.node.req?.__unenv__;
      if (fetchContext?._platform) {
        event.context = {
          _platform: fetchContext?._platform,
          // #3335
          ...fetchContext._platform,
          ...event.context
        };
      }
      if (!event.context.waitUntil && fetchContext?.waitUntil) {
        event.context.waitUntil = fetchContext.waitUntil;
      }
      event.fetch = (req, init) => fetchWithEvent(event, req, init, { fetch: localFetch });
      event.$fetch = (req, init) => fetchWithEvent(event, req, init, {
        fetch: $fetch
      });
      event.waitUntil = (promise) => {
        if (!event.context.nitro._waitUntilPromises) {
          event.context.nitro._waitUntilPromises = [];
        }
        event.context.nitro._waitUntilPromises.push(promise);
        if (event.context.waitUntil) {
          event.context.waitUntil(promise);
        }
      };
      event.captureError = (error, context) => {
        captureError(error, { event, ...context });
      };
      await nitroApp$1.hooks.callHook("request", event).catch((error) => {
        captureError(error, { event, tags: ["request"] });
      });
    },
    onBeforeResponse: async (event, response) => {
      await nitroApp$1.hooks.callHook("beforeResponse", event, response).catch((error) => {
        captureError(error, { event, tags: ["request", "response"] });
      });
    },
    onAfterResponse: async (event, response) => {
      await nitroApp$1.hooks.callHook("afterResponse", event, response).catch((error) => {
        captureError(error, { event, tags: ["request", "response"] });
      });
    }
  });
  const router = createRouter$1({
    preemptive: true
  });
  const nodeHandler = toNodeListener(h3App);
  const localCall = (aRequest) => callNodeRequestHandler(
    nodeHandler,
    aRequest
  );
  const localFetch = (input, init) => {
    if (!input.toString().startsWith("/")) {
      return globalThis.fetch(input, init);
    }
    return fetchNodeRequestHandler(
      nodeHandler,
      input,
      init
    ).then((response) => normalizeFetchResponse(response));
  };
  const $fetch = createFetch({
    fetch: localFetch,
    Headers: Headers$1,
    defaults: { baseURL: config.app.baseURL }
  });
  globalThis.$fetch = $fetch;
  h3App.use(createRouteRulesHandler({ localFetch }));
  for (const h of handlers) {
    let handler = h.lazy ? lazyEventHandler(h.handler) : h.handler;
    if (h.middleware || !h.route) {
      const middlewareBase = (config.app.baseURL + (h.route || "/")).replace(
        /\/+/g,
        "/"
      );
      h3App.use(middlewareBase, handler);
    } else {
      const routeRules = getRouteRulesForPath(
        h.route.replace(/:\w+|\*\*/g, "_")
      );
      if (routeRules.cache) {
        handler = cachedEventHandler(handler, {
          group: "nitro/routes",
          ...routeRules.cache
        });
      }
      router.use(h.route, handler, h.method);
    }
  }
  h3App.use(config.app.baseURL, router.handler);
  {
    const _handler = h3App.handler;
    h3App.handler = (event) => {
      const ctx = { event };
      return nitroAsyncContext.callAsync(ctx, () => _handler(event));
    };
  }
  const app = {
    hooks,
    h3App,
    router,
    localCall,
    localFetch,
    captureError
  };
  return app;
}
function runNitroPlugins(nitroApp2) {
  for (const plugin of plugins) {
    try {
      plugin(nitroApp2);
    } catch (error) {
      nitroApp2.captureError(error, { tags: ["plugin"] });
      throw error;
    }
  }
}
const nitroApp$1 = createNitroApp();
function useNitroApp() {
  return nitroApp$1;
}
runNitroPlugins(nitroApp$1);

const nitroApp = useNitroApp();
const localFetch = nitroApp.localFetch;
const closePrerenderer = () => nitroApp.hooks.callHook("close");
trapUnhandledNodeErrors();

export { D, F, Qe as Q, closePrerenderer as c, localFetch as l };
//# sourceMappingURL=nitro.mjs.map
