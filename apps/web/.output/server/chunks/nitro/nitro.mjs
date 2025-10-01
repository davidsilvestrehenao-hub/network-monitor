import process from 'node:process';globalThis._importMeta_=globalThis._importMeta_||{url:"file:///_entry.js",env:process.env};import http, { Server as Server$1 } from 'node:http';
import https, { Server } from 'node:https';
import { EventEmitter } from 'node:events';
import { Buffer as Buffer$1 } from 'node:buffer';
import { promises, existsSync } from 'node:fs';
import { resolve as resolve$1, dirname as dirname$1, join } from 'node:path';
import { createHash } from 'node:crypto';
import { AsyncLocalStorage } from 'node:async_hooks';
import invariant from 'vinxi/lib/invariant';
import { virtualId, handlerModule, join as join$1 } from 'vinxi/lib/path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { fromJSON, crossSerializeStream, getCrossReferenceHeader } from 'seroval';
import { CustomEventPlugin, DOMExceptionPlugin, EventPlugin, FormDataPlugin, HeadersPlugin, ReadableStreamPlugin, RequestPlugin, ResponsePlugin, URLSearchParamsPlugin, URLPlugin } from 'seroval-plugins/web';
import { sharedConfig, lazy, createComponent, useContext, createContext as createContext$1, createMemo, createSignal, createEffect, createRenderEffect, on, runWithOwner, getOwner, startTransition, resetErrorBoundaries, batch, untrack, catchError, ErrorBoundary, Suspense, onCleanup, children, Show, createRoot } from 'solid-js';
import { renderToString, getRequestEvent, isServer, ssrElement, escape, mergeProps, ssr, createComponent as createComponent$1, ssrHydrationKey, renderToStream, NoHydration, useAssets, Hydration, ssrAttribute, HydrationScript, delegateEvents } from 'solid-js/web';
import { provideRequestEvent } from 'solid-js/web/storage';
import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import { Chart, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, TimeScale, Filler } from 'chart.js';

const suspectProtoRx = /"(?:_|\\u0{2}5[Ff]){2}(?:p|\\u0{2}70)(?:r|\\u0{2}72)(?:o|\\u0{2}6[Ff])(?:t|\\u0{2}74)(?:o|\\u0{2}6[Ff])(?:_|\\u0{2}5[Ff]){2}"\s*:/;
const suspectConstructorRx = /"(?:c|\\u0063)(?:o|\\u006[Ff])(?:n|\\u006[Ee])(?:s|\\u0073)(?:t|\\u0074)(?:r|\\u0072)(?:u|\\u0075)(?:c|\\u0063)(?:t|\\u0074)(?:o|\\u006[Ff])(?:r|\\u0072)"\s*:/;
const JsonSigRx = /^\s*["[{]|^\s*-?\d{1,16}(\.\d{1,17})?([Ee][+-]?\d+)?\s*$/;
function jsonParseTransform(key, value) {
  if (key === "__proto__" || key === "constructor" && value && typeof value === "object" && "prototype" in value) {
    warnKeyDropped(key);
    return;
  }
  return value;
}
function warnKeyDropped(key) {
  console.warn(`[destr] Dropping "${key}" key to prevent prototype pollution.`);
}
function destr(value, options = {}) {
  if (typeof value !== "string") {
    return value;
  }
  if (value[0] === '"' && value[value.length - 1] === '"' && value.indexOf("\\") === -1) {
    return value.slice(1, -1);
  }
  const _value = value.trim();
  if (_value.length <= 9) {
    switch (_value.toLowerCase()) {
      case "true": {
        return true;
      }
      case "false": {
        return false;
      }
      case "undefined": {
        return void 0;
      }
      case "null": {
        return null;
      }
      case "nan": {
        return Number.NaN;
      }
      case "infinity": {
        return Number.POSITIVE_INFINITY;
      }
      case "-infinity": {
        return Number.NEGATIVE_INFINITY;
      }
    }
  }
  if (!JsonSigRx.test(value)) {
    if (options.strict) {
      throw new SyntaxError("[destr] Invalid JSON");
    }
    return value;
  }
  try {
    if (suspectProtoRx.test(value) || suspectConstructorRx.test(value)) {
      if (options.strict) {
        throw new Error("[destr] Possible prototype pollution");
      }
      return JSON.parse(value, jsonParseTransform);
    }
    return JSON.parse(value);
  } catch (error) {
    if (options.strict) {
      throw error;
    }
    return value;
  }
}

const HASH_RE = /#/g;
const AMPERSAND_RE = /&/g;
const SLASH_RE = /\//g;
const EQUAL_RE = /=/g;
const PLUS_RE = /\+/g;
const ENC_CARET_RE = /%5e/gi;
const ENC_BACKTICK_RE = /%60/gi;
const ENC_PIPE_RE = /%7c/gi;
const ENC_SPACE_RE = /%20/gi;
const ENC_SLASH_RE = /%2f/gi;
function encode(text) {
  return encodeURI("" + text).replace(ENC_PIPE_RE, "|");
}
function encodeQueryValue(input) {
  return encode(typeof input === "string" ? input : JSON.stringify(input)).replace(PLUS_RE, "%2B").replace(ENC_SPACE_RE, "+").replace(HASH_RE, "%23").replace(AMPERSAND_RE, "%26").replace(ENC_BACKTICK_RE, "`").replace(ENC_CARET_RE, "^").replace(SLASH_RE, "%2F");
}
function encodeQueryKey(text) {
  return encodeQueryValue(text).replace(EQUAL_RE, "%3D");
}
function decode$1(text = "") {
  try {
    return decodeURIComponent("" + text);
  } catch {
    return "" + text;
  }
}
function decodePath(text) {
  return decode$1(text.replace(ENC_SLASH_RE, "%252F"));
}
function decodeQueryKey(text) {
  return decode$1(text.replace(PLUS_RE, " "));
}
function decodeQueryValue(text) {
  return decode$1(text.replace(PLUS_RE, " "));
}

function parseQuery(parametersString = "") {
  const object = /* @__PURE__ */ Object.create(null);
  if (parametersString[0] === "?") {
    parametersString = parametersString.slice(1);
  }
  for (const parameter of parametersString.split("&")) {
    const s = parameter.match(/([^=]+)=?(.*)/) || [];
    if (s.length < 2) {
      continue;
    }
    const key = decodeQueryKey(s[1]);
    if (key === "__proto__" || key === "constructor") {
      continue;
    }
    const value = decodeQueryValue(s[2] || "");
    if (object[key] === void 0) {
      object[key] = value;
    } else if (Array.isArray(object[key])) {
      object[key].push(value);
    } else {
      object[key] = [object[key], value];
    }
  }
  return object;
}
function encodeQueryItem(key, value) {
  if (typeof value === "number" || typeof value === "boolean") {
    value = String(value);
  }
  if (!value) {
    return encodeQueryKey(key);
  }
  if (Array.isArray(value)) {
    return value.map(
      (_value) => `${encodeQueryKey(key)}=${encodeQueryValue(_value)}`
    ).join("&");
  }
  return `${encodeQueryKey(key)}=${encodeQueryValue(value)}`;
}
function stringifyQuery(query) {
  return Object.keys(query).filter((k) => query[k] !== void 0).map((k) => encodeQueryItem(k, query[k])).filter(Boolean).join("&");
}

const PROTOCOL_STRICT_REGEX = /^[\s\w\0+.-]{2,}:([/\\]{1,2})/;
const PROTOCOL_REGEX = /^[\s\w\0+.-]{2,}:([/\\]{2})?/;
const PROTOCOL_RELATIVE_REGEX = /^([/\\]\s*){2,}[^/\\]/;
const JOIN_LEADING_SLASH_RE = /^\.?\//;
function hasProtocol(inputString, opts = {}) {
  if (typeof opts === "boolean") {
    opts = { acceptRelative: opts };
  }
  if (opts.strict) {
    return PROTOCOL_STRICT_REGEX.test(inputString);
  }
  return PROTOCOL_REGEX.test(inputString) || (opts.acceptRelative ? PROTOCOL_RELATIVE_REGEX.test(inputString) : false);
}
function hasTrailingSlash(input = "", respectQueryAndFragment) {
  {
    return input.endsWith("/");
  }
}
function withoutTrailingSlash(input = "", respectQueryAndFragment) {
  {
    return (hasTrailingSlash(input) ? input.slice(0, -1) : input) || "/";
  }
}
function withTrailingSlash(input = "", respectQueryAndFragment) {
  {
    return input.endsWith("/") ? input : input + "/";
  }
}
function hasLeadingSlash(input = "") {
  return input.startsWith("/");
}
function withLeadingSlash(input = "") {
  return hasLeadingSlash(input) ? input : "/" + input;
}
function withBase(input, base) {
  if (isEmptyURL(base) || hasProtocol(input)) {
    return input;
  }
  const _base = withoutTrailingSlash(base);
  if (input.startsWith(_base)) {
    return input;
  }
  return joinURL(_base, input);
}
function withoutBase(input, base) {
  if (isEmptyURL(base)) {
    return input;
  }
  const _base = withoutTrailingSlash(base);
  if (!input.startsWith(_base)) {
    return input;
  }
  const trimmed = input.slice(_base.length);
  return trimmed[0] === "/" ? trimmed : "/" + trimmed;
}
function withQuery(input, query) {
  const parsed = parseURL(input);
  const mergedQuery = { ...parseQuery(parsed.search), ...query };
  parsed.search = stringifyQuery(mergedQuery);
  return stringifyParsedURL(parsed);
}
function getQuery(input) {
  return parseQuery(parseURL(input).search);
}
function isEmptyURL(url) {
  return !url || url === "/";
}
function isNonEmptyURL(url) {
  return url && url !== "/";
}
function joinURL(base, ...input) {
  let url = base || "";
  for (const segment of input.filter((url2) => isNonEmptyURL(url2))) {
    if (url) {
      const _segment = segment.replace(JOIN_LEADING_SLASH_RE, "");
      url = withTrailingSlash(url) + _segment;
    } else {
      url = segment;
    }
  }
  return url;
}

const protocolRelative = Symbol.for("ufo:protocolRelative");
function parseURL(input = "", defaultProto) {
  const _specialProtoMatch = input.match(
    /^[\s\0]*(blob:|data:|javascript:|vbscript:)(.*)/i
  );
  if (_specialProtoMatch) {
    const [, _proto, _pathname = ""] = _specialProtoMatch;
    return {
      protocol: _proto.toLowerCase(),
      pathname: _pathname,
      href: _proto + _pathname,
      auth: "",
      host: "",
      search: "",
      hash: ""
    };
  }
  if (!hasProtocol(input, { acceptRelative: true })) {
    return parsePath(input);
  }
  const [, protocol = "", auth, hostAndPath = ""] = input.replace(/\\/g, "/").match(/^[\s\0]*([\w+.-]{2,}:)?\/\/([^/@]+@)?(.*)/) || [];
  let [, host = "", path = ""] = hostAndPath.match(/([^#/?]*)(.*)?/) || [];
  if (protocol === "file:") {
    path = path.replace(/\/(?=[A-Za-z]:)/, "");
  }
  const { pathname, search, hash } = parsePath(path);
  return {
    protocol: protocol.toLowerCase(),
    auth: auth ? auth.slice(0, Math.max(0, auth.length - 1)) : "",
    host,
    pathname,
    search,
    hash,
    [protocolRelative]: !protocol
  };
}
function parsePath(input = "") {
  const [pathname = "", search = "", hash = ""] = (input.match(/([^#?]*)(\?[^#]*)?(#.*)?/) || []).splice(1);
  return {
    pathname,
    search,
    hash
  };
}
function stringifyParsedURL(parsed) {
  const pathname = parsed.pathname || "";
  const search = parsed.search ? (parsed.search.startsWith("?") ? "" : "?") + parsed.search : "";
  const hash = parsed.hash || "";
  const auth = parsed.auth ? parsed.auth + "@" : "";
  const host = parsed.host || "";
  const proto = parsed.protocol || parsed[protocolRelative] ? (parsed.protocol || "") + "//" : "";
  return proto + auth + host + pathname + search + hash;
}

const NODE_TYPES = {
  NORMAL: 0,
  WILDCARD: 1,
  PLACEHOLDER: 2
};

function createRouter$1(options = {}) {
  const ctx = {
    options,
    rootNode: createRadixNode(),
    staticRoutesMap: {}
  };
  const normalizeTrailingSlash = (p) => options.strictTrailingSlash ? p : p.replace(/\/$/, "") || "/";
  if (options.routes) {
    for (const path in options.routes) {
      insert(ctx, normalizeTrailingSlash(path), options.routes[path]);
    }
  }
  return {
    ctx,
    lookup: (path) => lookup(ctx, normalizeTrailingSlash(path)),
    insert: (path, data) => insert(ctx, normalizeTrailingSlash(path), data),
    remove: (path) => remove(ctx, normalizeTrailingSlash(path))
  };
}
function lookup(ctx, path) {
  const staticPathNode = ctx.staticRoutesMap[path];
  if (staticPathNode) {
    return staticPathNode.data;
  }
  const sections = path.split("/");
  const params = {};
  let paramsFound = false;
  let wildcardNode = null;
  let node = ctx.rootNode;
  let wildCardParam = null;
  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];
    if (node.wildcardChildNode !== null) {
      wildcardNode = node.wildcardChildNode;
      wildCardParam = sections.slice(i).join("/");
    }
    const nextNode = node.children.get(section);
    if (nextNode === void 0) {
      if (node && node.placeholderChildren.length > 1) {
        const remaining = sections.length - i;
        node = node.placeholderChildren.find((c) => c.maxDepth === remaining) || null;
      } else {
        node = node.placeholderChildren[0] || null;
      }
      if (!node) {
        break;
      }
      if (node.paramName) {
        params[node.paramName] = section;
      }
      paramsFound = true;
    } else {
      node = nextNode;
    }
  }
  if ((node === null || node.data === null) && wildcardNode !== null) {
    node = wildcardNode;
    params[node.paramName || "_"] = wildCardParam;
    paramsFound = true;
  }
  if (!node) {
    return null;
  }
  if (paramsFound) {
    return {
      ...node.data,
      params: paramsFound ? params : void 0
    };
  }
  return node.data;
}
function insert(ctx, path, data) {
  let isStaticRoute = true;
  const sections = path.split("/");
  let node = ctx.rootNode;
  let _unnamedPlaceholderCtr = 0;
  const matchedNodes = [node];
  for (const section of sections) {
    let childNode;
    if (childNode = node.children.get(section)) {
      node = childNode;
    } else {
      const type = getNodeType(section);
      childNode = createRadixNode({ type, parent: node });
      node.children.set(section, childNode);
      if (type === NODE_TYPES.PLACEHOLDER) {
        childNode.paramName = section === "*" ? `_${_unnamedPlaceholderCtr++}` : section.slice(1);
        node.placeholderChildren.push(childNode);
        isStaticRoute = false;
      } else if (type === NODE_TYPES.WILDCARD) {
        node.wildcardChildNode = childNode;
        childNode.paramName = section.slice(
          3
          /* "**:" */
        ) || "_";
        isStaticRoute = false;
      }
      matchedNodes.push(childNode);
      node = childNode;
    }
  }
  for (const [depth, node2] of matchedNodes.entries()) {
    node2.maxDepth = Math.max(matchedNodes.length - depth, node2.maxDepth || 0);
  }
  node.data = data;
  if (isStaticRoute === true) {
    ctx.staticRoutesMap[path] = node;
  }
  return node;
}
function remove(ctx, path) {
  let success = false;
  const sections = path.split("/");
  let node = ctx.rootNode;
  for (const section of sections) {
    node = node.children.get(section);
    if (!node) {
      return success;
    }
  }
  if (node.data) {
    const lastSection = sections.at(-1) || "";
    node.data = null;
    if (Object.keys(node.children).length === 0 && node.parent) {
      node.parent.children.delete(lastSection);
      node.parent.wildcardChildNode = null;
      node.parent.placeholderChildren = [];
    }
    success = true;
  }
  return success;
}
function createRadixNode(options = {}) {
  return {
    type: options.type || NODE_TYPES.NORMAL,
    maxDepth: 0,
    parent: options.parent || null,
    children: /* @__PURE__ */ new Map(),
    data: options.data || null,
    paramName: options.paramName || null,
    wildcardChildNode: null,
    placeholderChildren: []
  };
}
function getNodeType(str) {
  if (str.startsWith("**")) {
    return NODE_TYPES.WILDCARD;
  }
  if (str[0] === ":" || str === "*") {
    return NODE_TYPES.PLACEHOLDER;
  }
  return NODE_TYPES.NORMAL;
}

function toRouteMatcher(router) {
  const table = _routerNodeToTable("", router.ctx.rootNode);
  return _createMatcher(table, router.ctx.options.strictTrailingSlash);
}
function _createMatcher(table, strictTrailingSlash) {
  return {
    ctx: { table },
    matchAll: (path) => _matchRoutes(path, table, strictTrailingSlash)
  };
}
function _createRouteTable() {
  return {
    static: /* @__PURE__ */ new Map(),
    wildcard: /* @__PURE__ */ new Map(),
    dynamic: /* @__PURE__ */ new Map()
  };
}
function _matchRoutes(path, table, strictTrailingSlash) {
  if (strictTrailingSlash !== true && path.endsWith("/")) {
    path = path.slice(0, -1) || "/";
  }
  const matches = [];
  for (const [key, value] of _sortRoutesMap(table.wildcard)) {
    if (path === key || path.startsWith(key + "/")) {
      matches.push(value);
    }
  }
  for (const [key, value] of _sortRoutesMap(table.dynamic)) {
    if (path.startsWith(key + "/")) {
      const subPath = "/" + path.slice(key.length).split("/").splice(2).join("/");
      matches.push(..._matchRoutes(subPath, value));
    }
  }
  const staticMatch = table.static.get(path);
  if (staticMatch) {
    matches.push(staticMatch);
  }
  return matches.filter(Boolean);
}
function _sortRoutesMap(m) {
  return [...m.entries()].sort((a, b) => a[0].length - b[0].length);
}
function _routerNodeToTable(initialPath, initialNode) {
  const table = _createRouteTable();
  function _addNode(path, node) {
    if (path) {
      if (node.type === NODE_TYPES.NORMAL && !(path.includes("*") || path.includes(":"))) {
        if (node.data) {
          table.static.set(path, node.data);
        }
      } else if (node.type === NODE_TYPES.WILDCARD) {
        table.wildcard.set(path.replace("/**", ""), node.data);
      } else if (node.type === NODE_TYPES.PLACEHOLDER) {
        const subTable = _routerNodeToTable("", node);
        if (node.data) {
          subTable.static.set("/", node.data);
        }
        table.dynamic.set(path.replace(/\/\*|\/:\w+/, ""), subTable);
        return;
      }
    }
    for (const [childPath, child] of node.children.entries()) {
      _addNode(`${path}/${childPath}`.replace("//", "/"), child);
    }
  }
  _addNode(initialPath, initialNode);
  return table;
}

function isPlainObject(value) {
  if (value === null || typeof value !== "object") {
    return false;
  }
  const prototype = Object.getPrototypeOf(value);
  if (prototype !== null && prototype !== Object.prototype && Object.getPrototypeOf(prototype) !== null) {
    return false;
  }
  if (Symbol.iterator in value) {
    return false;
  }
  if (Symbol.toStringTag in value) {
    return Object.prototype.toString.call(value) === "[object Module]";
  }
  return true;
}

function _defu(baseObject, defaults, namespace = ".", merger) {
  if (!isPlainObject(defaults)) {
    return _defu(baseObject, {}, namespace, merger);
  }
  const object = Object.assign({}, defaults);
  for (const key in baseObject) {
    if (key === "__proto__" || key === "constructor") {
      continue;
    }
    const value = baseObject[key];
    if (value === null || value === void 0) {
      continue;
    }
    if (merger && merger(object, key, value, namespace)) {
      continue;
    }
    if (Array.isArray(value) && Array.isArray(object[key])) {
      object[key] = [...value, ...object[key]];
    } else if (isPlainObject(value) && isPlainObject(object[key])) {
      object[key] = _defu(
        value,
        object[key],
        (namespace ? `${namespace}.` : "") + key.toString(),
        merger
      );
    } else {
      object[key] = value;
    }
  }
  return object;
}
function createDefu(merger) {
  return (...arguments_) => (
    // eslint-disable-next-line unicorn/no-array-reduce
    arguments_.reduce((p, c) => _defu(p, c, "", merger), {})
  );
}
const defu = createDefu();
const defuFn = createDefu((object, key, currentValue) => {
  if (object[key] !== void 0 && typeof currentValue === "function") {
    object[key] = currentValue(object[key]);
    return true;
  }
});

function o(n){throw new Error(`${n} is not implemented yet!`)}let i$1 = class i extends EventEmitter{__unenv__={};readableEncoding=null;readableEnded=true;readableFlowing=false;readableHighWaterMark=0;readableLength=0;readableObjectMode=false;readableAborted=false;readableDidRead=false;closed=false;errored=null;readable=false;destroyed=false;static from(e,t){return new i(t)}constructor(e){super();}_read(e){}read(e){}setEncoding(e){return this}pause(){return this}resume(){return this}isPaused(){return  true}unpipe(e){return this}unshift(e,t){}wrap(e){return this}push(e,t){return  false}_destroy(e,t){this.removeAllListeners();}destroy(e){return this.destroyed=true,this._destroy(e),this}pipe(e,t){return {}}compose(e,t){throw new Error("Method not implemented.")}[Symbol.asyncDispose](){return this.destroy(),Promise.resolve()}async*[Symbol.asyncIterator](){throw o("Readable.asyncIterator")}iterator(e){throw o("Readable.iterator")}map(e,t){throw o("Readable.map")}filter(e,t){throw o("Readable.filter")}forEach(e,t){throw o("Readable.forEach")}reduce(e,t,r){throw o("Readable.reduce")}find(e,t){throw o("Readable.find")}findIndex(e,t){throw o("Readable.findIndex")}some(e,t){throw o("Readable.some")}toArray(e){throw o("Readable.toArray")}every(e,t){throw o("Readable.every")}flatMap(e,t){throw o("Readable.flatMap")}drop(e,t){throw o("Readable.drop")}take(e,t){throw o("Readable.take")}asIndexedPairs(e){throw o("Readable.asIndexedPairs")}};let l$2 = class l extends EventEmitter{__unenv__={};writable=true;writableEnded=false;writableFinished=false;writableHighWaterMark=0;writableLength=0;writableObjectMode=false;writableCorked=0;closed=false;errored=null;writableNeedDrain=false;writableAborted=false;destroyed=false;_data;_encoding="utf8";constructor(e){super();}pipe(e,t){return {}}_write(e,t,r){if(this.writableEnded){r&&r();return}if(this._data===void 0)this._data=e;else {const s=typeof this._data=="string"?Buffer$1.from(this._data,this._encoding||t||"utf8"):this._data,a=typeof e=="string"?Buffer$1.from(e,t||this._encoding||"utf8"):e;this._data=Buffer$1.concat([s,a]);}this._encoding=t,r&&r();}_writev(e,t){}_destroy(e,t){}_final(e){}write(e,t,r){const s=typeof t=="string"?this._encoding:"utf8",a=typeof t=="function"?t:typeof r=="function"?r:void 0;return this._write(e,s,a),true}setDefaultEncoding(e){return this}end(e,t,r){const s=typeof e=="function"?e:typeof t=="function"?t:typeof r=="function"?r:void 0;if(this.writableEnded)return s&&s(),this;const a=e===s?void 0:e;if(a){const u=t===s?void 0:t;this.write(a,u,s);}return this.writableEnded=true,this.writableFinished=true,this.emit("close"),this.emit("finish"),this}cork(){}uncork(){}destroy(e){return this.destroyed=true,delete this._data,this.removeAllListeners(),this}compose(e,t){throw new Error("Method not implemented.")}[Symbol.asyncDispose](){return Promise.resolve()}};const c=class{allowHalfOpen=true;_destroy;constructor(e=new i$1,t=new l$2){Object.assign(this,e),Object.assign(this,t),this._destroy=m$1(e._destroy,t._destroy);}};function _$2(){return Object.assign(c.prototype,i$1.prototype),Object.assign(c.prototype,l$2.prototype),c}function m$1(...n){return function(...e){for(const t of n)t(...e);}}const g$2=_$2();class A extends g$2{__unenv__={};bufferSize=0;bytesRead=0;bytesWritten=0;connecting=false;destroyed=false;pending=false;localAddress="";localPort=0;remoteAddress="";remoteFamily="";remotePort=0;autoSelectFamilyAttemptedAddresses=[];readyState="readOnly";constructor(e){super();}write(e,t,r){return  false}connect(e,t,r){return this}end(e,t,r){return this}setEncoding(e){return this}pause(){return this}resume(){return this}setTimeout(e,t){return this}setNoDelay(e){return this}setKeepAlive(e,t){return this}address(){return {}}unref(){return this}ref(){return this}destroySoon(){this.destroy();}resetAndDestroy(){const e=new Error("ERR_SOCKET_CLOSED");return e.code="ERR_SOCKET_CLOSED",this.destroy(e),this}}let y$1 = class y extends i$1{aborted=false;httpVersion="1.1";httpVersionMajor=1;httpVersionMinor=1;complete=true;connection;socket;headers={};trailers={};method="GET";url="/";statusCode=200;statusMessage="";closed=false;errored=null;readable=false;constructor(e){super(),this.socket=this.connection=e||new A;}get rawHeaders(){const e=this.headers,t=[];for(const r in e)if(Array.isArray(e[r]))for(const s of e[r])t.push(r,s);else t.push(r,e[r]);return t}get rawTrailers(){return []}setTimeout(e,t){return this}get headersDistinct(){return p$1(this.headers)}get trailersDistinct(){return p$1(this.trailers)}};function p$1(n){const e={};for(const[t,r]of Object.entries(n))t&&(e[t]=(Array.isArray(r)?r:[r]).filter(Boolean));return e}let w$2 = class w extends l$2{statusCode=200;statusMessage="";upgrading=false;chunkedEncoding=false;shouldKeepAlive=false;useChunkedEncodingByDefault=false;sendDate=false;finished=false;headersSent=false;strictContentLength=false;connection=null;socket=null;req;_headers={};constructor(e){super(),this.req=e;}assignSocket(e){e._httpMessage=this,this.socket=e,this.connection=e,this.emit("socket",e),this._flush();}_flush(){this.flushHeaders();}detachSocket(e){}writeContinue(e){}writeHead(e,t,r){e&&(this.statusCode=e),typeof t=="string"&&(this.statusMessage=t,t=void 0);const s=r||t;if(s&&!Array.isArray(s))for(const a in s)this.setHeader(a,s[a]);return this.headersSent=true,this}writeProcessing(){}setTimeout(e,t){return this}appendHeader(e,t){e=e.toLowerCase();const r=this._headers[e],s=[...Array.isArray(r)?r:[r],...Array.isArray(t)?t:[t]].filter(Boolean);return this._headers[e]=s.length>1?s:s[0],this}setHeader(e,t){return this._headers[e.toLowerCase()]=t,this}setHeaders(e){for(const[t,r]of Object.entries(e))this.setHeader(t,r);return this}getHeader(e){return this._headers[e.toLowerCase()]}getHeaders(){return this._headers}getHeaderNames(){return Object.keys(this._headers)}hasHeader(e){return e.toLowerCase()in this._headers}removeHeader(e){delete this._headers[e.toLowerCase()];}addTrailers(e){}flushHeaders(){}writeEarlyHints(e,t){typeof t=="function"&&t();}};const E$1=(()=>{const n=function(){};return n.prototype=Object.create(null),n})();function R$2(n={}){const e=new E$1,t=Array.isArray(n)||H$1(n)?n:Object.entries(n);for(const[r,s]of t)if(s){if(e[r]===void 0){e[r]=s;continue}e[r]=[...Array.isArray(e[r])?e[r]:[e[r]],...Array.isArray(s)?s:[s]];}return e}function H$1(n){return typeof n?.entries=="function"}function v(n={}){if(n instanceof Headers)return n;const e=new Headers;for(const[t,r]of Object.entries(n))if(r!==void 0){if(Array.isArray(r)){for(const s of r)e.append(t,String(s));continue}e.set(t,String(r));}return e}const S$2=new Set([101,204,205,304]);async function b$2(n,e){const t=new y$1,r=new w$2(t);t.url=e.url?.toString()||"/";let s;if(!t.url.startsWith("/")){const d=new URL(t.url);s=d.host,t.url=d.pathname+d.search+d.hash;}t.method=e.method||"GET",t.headers=R$2(e.headers||{}),t.headers.host||(t.headers.host=e.host||s||"localhost"),t.connection.encrypted=t.connection.encrypted||e.protocol==="https",t.body=e.body||null,t.__unenv__=e.context,await n(t,r);let a=r._data;(S$2.has(r.statusCode)||t.method.toUpperCase()==="HEAD")&&(a=null,delete r._headers["content-length"]);const u={status:r.statusCode,statusText:r.statusMessage,headers:r._headers,body:a};return t.destroy(),r.destroy(),u}async function C$2(n,e,t={}){try{const r=await b$2(n,{url:e,...t});return new Response(r.body,{status:r.status,statusText:r.statusText,headers:v(r.headers)})}catch(r){return new Response(r.toString(),{status:Number.parseInt(r.statusCode||r.code)||500,statusText:r.statusText})}}

function hasProp$1(obj, prop) {
  try {
    return prop in obj;
  } catch {
    return false;
  }
}

let H3Error$1 = class H3Error extends Error {
  static __h3_error__ = true;
  statusCode = 500;
  fatal = false;
  unhandled = false;
  statusMessage;
  data;
  cause;
  constructor(message, opts = {}) {
    super(message, opts);
    if (opts.cause && !this.cause) {
      this.cause = opts.cause;
    }
  }
  toJSON() {
    const obj = {
      message: this.message,
      statusCode: sanitizeStatusCode$1(this.statusCode, 500)
    };
    if (this.statusMessage) {
      obj.statusMessage = sanitizeStatusMessage$1(this.statusMessage);
    }
    if (this.data !== void 0) {
      obj.data = this.data;
    }
    return obj;
  }
};
function createError$2(input) {
  if (typeof input === "string") {
    return new H3Error$1(input);
  }
  if (isError$1(input)) {
    return input;
  }
  const err = new H3Error$1(input.message ?? input.statusMessage ?? "", {
    cause: input.cause || input
  });
  if (hasProp$1(input, "stack")) {
    try {
      Object.defineProperty(err, "stack", {
        get() {
          return input.stack;
        }
      });
    } catch {
      try {
        err.stack = input.stack;
      } catch {
      }
    }
  }
  if (input.data) {
    err.data = input.data;
  }
  if (input.statusCode) {
    err.statusCode = sanitizeStatusCode$1(input.statusCode, err.statusCode);
  } else if (input.status) {
    err.statusCode = sanitizeStatusCode$1(input.status, err.statusCode);
  }
  if (input.statusMessage) {
    err.statusMessage = input.statusMessage;
  } else if (input.statusText) {
    err.statusMessage = input.statusText;
  }
  if (err.statusMessage) {
    const originalMessage = err.statusMessage;
    const sanitizedMessage = sanitizeStatusMessage$1(err.statusMessage);
    if (sanitizedMessage !== originalMessage) {
      console.warn(
        "[h3] Please prefer using `message` for longer error messages instead of `statusMessage`. In the future, `statusMessage` will be sanitized by default."
      );
    }
  }
  if (input.fatal !== void 0) {
    err.fatal = input.fatal;
  }
  if (input.unhandled !== void 0) {
    err.unhandled = input.unhandled;
  }
  return err;
}
function sendError(event, error, debug) {
  if (event.handled) {
    return;
  }
  const h3Error = isError$1(error) ? error : createError$2(error);
  const responseBody = {
    statusCode: h3Error.statusCode,
    statusMessage: h3Error.statusMessage,
    stack: [],
    data: h3Error.data
  };
  if (debug) {
    responseBody.stack = (h3Error.stack || "").split("\n").map((l) => l.trim());
  }
  if (event.handled) {
    return;
  }
  const _code = Number.parseInt(h3Error.statusCode);
  setResponseStatus$1(event, _code, h3Error.statusMessage);
  event.node.res.setHeader("content-type", MIMES$1.json);
  event.node.res.end(JSON.stringify(responseBody, void 0, 2));
}
function isError$1(input) {
  return input?.constructor?.__h3_error__ === true;
}
function isMethod$1(event, expected, allowHead) {
  if (typeof expected === "string") {
    if (event.method === expected) {
      return true;
    }
  } else if (expected.includes(event.method)) {
    return true;
  }
  return false;
}
function assertMethod$1(event, expected, allowHead) {
  if (!isMethod$1(event, expected)) {
    throw createError$2({
      statusCode: 405,
      statusMessage: "HTTP method is not allowed."
    });
  }
}
function getRequestHeaders$1(event) {
  const _headers = {};
  for (const key in event.node.req.headers) {
    const val = event.node.req.headers[key];
    _headers[key] = Array.isArray(val) ? val.filter(Boolean).join(", ") : val;
  }
  return _headers;
}
function getRequestHeader$1(event, name) {
  const headers = getRequestHeaders$1(event);
  const value = headers[name.toLowerCase()];
  return value;
}
function getRequestHost$1(event, opts = {}) {
  if (opts.xForwardedHost) {
    const _header = event.node.req.headers["x-forwarded-host"];
    const xForwardedHost = (_header || "").split(",").shift()?.trim();
    if (xForwardedHost) {
      return xForwardedHost;
    }
  }
  return event.node.req.headers.host || "localhost";
}
function getRequestProtocol$1(event, opts = {}) {
  if (opts.xForwardedProto !== false && event.node.req.headers["x-forwarded-proto"] === "https") {
    return "https";
  }
  return event.node.req.connection?.encrypted ? "https" : "http";
}
function getRequestURL$1(event, opts = {}) {
  const host = getRequestHost$1(event, opts);
  const protocol = getRequestProtocol$1(event, opts);
  const path = (event.node.req.originalUrl || event.path).replace(
    /^[/\\]+/g,
    "/"
  );
  return new URL(path, `${protocol}://${host}`);
}

const RawBodySymbol$1 = Symbol.for("h3RawBody");
const PayloadMethods$1$1 = ["PATCH", "POST", "PUT", "DELETE"];
function readRawBody$1(event, encoding = "utf8") {
  assertMethod$1(event, PayloadMethods$1$1);
  const _rawBody = event._requestBody || event.web?.request?.body || event.node.req[RawBodySymbol$1] || event.node.req.rawBody || event.node.req.body;
  if (_rawBody) {
    const promise2 = Promise.resolve(_rawBody).then((_resolved) => {
      if (Buffer.isBuffer(_resolved)) {
        return _resolved;
      }
      if (typeof _resolved.pipeTo === "function") {
        return new Promise((resolve, reject) => {
          const chunks = [];
          _resolved.pipeTo(
            new WritableStream({
              write(chunk) {
                chunks.push(chunk);
              },
              close() {
                resolve(Buffer.concat(chunks));
              },
              abort(reason) {
                reject(reason);
              }
            })
          ).catch(reject);
        });
      } else if (typeof _resolved.pipe === "function") {
        return new Promise((resolve, reject) => {
          const chunks = [];
          _resolved.on("data", (chunk) => {
            chunks.push(chunk);
          }).on("end", () => {
            resolve(Buffer.concat(chunks));
          }).on("error", reject);
        });
      }
      if (_resolved.constructor === Object) {
        return Buffer.from(JSON.stringify(_resolved));
      }
      if (_resolved instanceof URLSearchParams) {
        return Buffer.from(_resolved.toString());
      }
      if (_resolved instanceof FormData) {
        return new Response(_resolved).bytes().then((uint8arr) => Buffer.from(uint8arr));
      }
      return Buffer.from(_resolved);
    });
    return encoding ? promise2.then((buff) => buff.toString(encoding)) : promise2;
  }
  if (!Number.parseInt(event.node.req.headers["content-length"] || "") && !String(event.node.req.headers["transfer-encoding"] ?? "").split(",").map((e) => e.trim()).filter(Boolean).includes("chunked")) {
    return Promise.resolve(void 0);
  }
  const promise = event.node.req[RawBodySymbol$1] = new Promise(
    (resolve, reject) => {
      const bodyData = [];
      event.node.req.on("error", (err) => {
        reject(err);
      }).on("data", (chunk) => {
        bodyData.push(chunk);
      }).on("end", () => {
        resolve(Buffer.concat(bodyData));
      });
    }
  );
  const result = encoding ? promise.then((buff) => buff.toString(encoding)) : promise;
  return result;
}
function getRequestWebStream$1(event) {
  if (!PayloadMethods$1$1.includes(event.method)) {
    return;
  }
  const bodyStream = event.web?.request?.body || event._requestBody;
  if (bodyStream) {
    return bodyStream;
  }
  const _hasRawBody = RawBodySymbol$1 in event.node.req || "rawBody" in event.node.req || "body" in event.node.req || "__unenv__" in event.node.req;
  if (_hasRawBody) {
    return new ReadableStream({
      async start(controller) {
        const _rawBody = await readRawBody$1(event, false);
        if (_rawBody) {
          controller.enqueue(_rawBody);
        }
        controller.close();
      }
    });
  }
  return new ReadableStream({
    start: (controller) => {
      event.node.req.on("data", (chunk) => {
        controller.enqueue(chunk);
      });
      event.node.req.on("end", () => {
        controller.close();
      });
      event.node.req.on("error", (err) => {
        controller.error(err);
      });
    }
  });
}

function handleCacheHeaders(event, opts) {
  const cacheControls = ["public", ...opts.cacheControls || []];
  let cacheMatched = false;
  if (opts.maxAge !== void 0) {
    cacheControls.push(`max-age=${+opts.maxAge}`, `s-maxage=${+opts.maxAge}`);
  }
  if (opts.modifiedTime) {
    const modifiedTime = new Date(opts.modifiedTime);
    const ifModifiedSince = event.node.req.headers["if-modified-since"];
    event.node.res.setHeader("last-modified", modifiedTime.toUTCString());
    if (ifModifiedSince && new Date(ifModifiedSince) >= modifiedTime) {
      cacheMatched = true;
    }
  }
  if (opts.etag) {
    event.node.res.setHeader("etag", opts.etag);
    const ifNonMatch = event.node.req.headers["if-none-match"];
    if (ifNonMatch === opts.etag) {
      cacheMatched = true;
    }
  }
  event.node.res.setHeader("cache-control", cacheControls.join(", "));
  if (cacheMatched) {
    event.node.res.statusCode = 304;
    if (!event.handled) {
      event.node.res.end();
    }
    return true;
  }
  return false;
}

const MIMES$1 = {
  html: "text/html",
  json: "application/json"
};

const DISALLOWED_STATUS_CHARS$1 = /[^\u0009\u0020-\u007E]/g;
function sanitizeStatusMessage$1(statusMessage = "") {
  return statusMessage.replace(DISALLOWED_STATUS_CHARS$1, "");
}
function sanitizeStatusCode$1(statusCode, defaultStatusCode = 200) {
  if (!statusCode) {
    return defaultStatusCode;
  }
  if (typeof statusCode === "string") {
    statusCode = Number.parseInt(statusCode, 10);
  }
  if (statusCode < 100 || statusCode > 999) {
    return defaultStatusCode;
  }
  return statusCode;
}
function splitCookiesString$1(cookiesString) {
  if (Array.isArray(cookiesString)) {
    return cookiesString.flatMap((c) => splitCookiesString$1(c));
  }
  if (typeof cookiesString !== "string") {
    return [];
  }
  const cookiesStrings = [];
  let pos = 0;
  let start;
  let ch;
  let lastComma;
  let nextStart;
  let cookiesSeparatorFound;
  const skipWhitespace = () => {
    while (pos < cookiesString.length && /\s/.test(cookiesString.charAt(pos))) {
      pos += 1;
    }
    return pos < cookiesString.length;
  };
  const notSpecialChar = () => {
    ch = cookiesString.charAt(pos);
    return ch !== "=" && ch !== ";" && ch !== ",";
  };
  while (pos < cookiesString.length) {
    start = pos;
    cookiesSeparatorFound = false;
    while (skipWhitespace()) {
      ch = cookiesString.charAt(pos);
      if (ch === ",") {
        lastComma = pos;
        pos += 1;
        skipWhitespace();
        nextStart = pos;
        while (pos < cookiesString.length && notSpecialChar()) {
          pos += 1;
        }
        if (pos < cookiesString.length && cookiesString.charAt(pos) === "=") {
          cookiesSeparatorFound = true;
          pos = nextStart;
          cookiesStrings.push(cookiesString.slice(start, lastComma));
          start = pos;
        } else {
          pos = lastComma + 1;
        }
      } else {
        pos += 1;
      }
    }
    if (!cookiesSeparatorFound || pos >= cookiesString.length) {
      cookiesStrings.push(cookiesString.slice(start));
    }
  }
  return cookiesStrings;
}

const defer$1 = typeof setImmediate === "undefined" ? (fn) => fn() : setImmediate;
function send$1(event, data, type) {
  if (type) {
    defaultContentType$1(event, type);
  }
  return new Promise((resolve) => {
    defer$1(() => {
      if (!event.handled) {
        event.node.res.end(data);
      }
      resolve();
    });
  });
}
function sendNoContent(event, code) {
  if (event.handled) {
    return;
  }
  if (!code && event.node.res.statusCode !== 200) {
    code = event.node.res.statusCode;
  }
  const _code = sanitizeStatusCode$1(code, 204);
  if (_code === 204) {
    event.node.res.removeHeader("content-length");
  }
  event.node.res.writeHead(_code);
  event.node.res.end();
}
function setResponseStatus$1(event, code, text) {
  if (code) {
    event.node.res.statusCode = sanitizeStatusCode$1(
      code,
      event.node.res.statusCode
    );
  }
  if (text) {
    event.node.res.statusMessage = sanitizeStatusMessage$1(text);
  }
}
function defaultContentType$1(event, type) {
  if (type && event.node.res.statusCode !== 304 && !event.node.res.getHeader("content-type")) {
    event.node.res.setHeader("content-type", type);
  }
}
function sendRedirect$1(event, location, code = 302) {
  event.node.res.statusCode = sanitizeStatusCode$1(
    code,
    event.node.res.statusCode
  );
  event.node.res.setHeader("location", location);
  const encodedLoc = location.replace(/"/g, "%22");
  const html = `<!DOCTYPE html><html><head><meta http-equiv="refresh" content="0; url=${encodedLoc}"></head></html>`;
  return send$1(event, html, MIMES$1.html);
}
function getResponseHeader$1(event, name) {
  return event.node.res.getHeader(name);
}
function setResponseHeaders(event, headers) {
  for (const [name, value] of Object.entries(headers)) {
    event.node.res.setHeader(
      name,
      value
    );
  }
}
const setHeaders = setResponseHeaders;
function setResponseHeader$1(event, name, value) {
  event.node.res.setHeader(name, value);
}
function appendResponseHeader$1(event, name, value) {
  let current = event.node.res.getHeader(name);
  if (!current) {
    event.node.res.setHeader(name, value);
    return;
  }
  if (!Array.isArray(current)) {
    current = [current.toString()];
  }
  event.node.res.setHeader(name, [...current, value]);
}
function removeResponseHeader$1(event, name) {
  return event.node.res.removeHeader(name);
}
function isStream(data) {
  if (!data || typeof data !== "object") {
    return false;
  }
  if (typeof data.pipe === "function") {
    if (typeof data._read === "function") {
      return true;
    }
    if (typeof data.abort === "function") {
      return true;
    }
  }
  if (typeof data.pipeTo === "function") {
    return true;
  }
  return false;
}
function isWebResponse(data) {
  return typeof Response !== "undefined" && data instanceof Response;
}
function sendStream$1(event, stream) {
  if (!stream || typeof stream !== "object") {
    throw new Error("[h3] Invalid stream provided.");
  }
  event.node.res._data = stream;
  if (!event.node.res.socket) {
    event._handled = true;
    return Promise.resolve();
  }
  if (hasProp$1(stream, "pipeTo") && typeof stream.pipeTo === "function") {
    return stream.pipeTo(
      new WritableStream({
        write(chunk) {
          event.node.res.write(chunk);
        }
      })
    ).then(() => {
      event.node.res.end();
    });
  }
  if (hasProp$1(stream, "pipe") && typeof stream.pipe === "function") {
    return new Promise((resolve, reject) => {
      stream.pipe(event.node.res);
      if (stream.on) {
        stream.on("end", () => {
          event.node.res.end();
          resolve();
        });
        stream.on("error", (error) => {
          reject(error);
        });
      }
      event.node.res.on("close", () => {
        if (stream.abort) {
          stream.abort();
        }
      });
    });
  }
  throw new Error("[h3] Invalid or incompatible stream provided.");
}
function sendWebResponse$1(event, response) {
  for (const [key, value] of response.headers) {
    if (key === "set-cookie") {
      event.node.res.appendHeader(key, splitCookiesString$1(value));
    } else {
      event.node.res.setHeader(key, value);
    }
  }
  if (response.status) {
    event.node.res.statusCode = sanitizeStatusCode$1(
      response.status,
      event.node.res.statusCode
    );
  }
  if (response.statusText) {
    event.node.res.statusMessage = sanitizeStatusMessage$1(response.statusText);
  }
  if (response.redirected) {
    event.node.res.setHeader("location", response.url);
  }
  if (!response.body) {
    event.node.res.end();
    return;
  }
  return sendStream$1(event, response.body);
}

const PayloadMethods = /* @__PURE__ */ new Set(["PATCH", "POST", "PUT", "DELETE"]);
const ignoredHeaders = /* @__PURE__ */ new Set([
  "transfer-encoding",
  "accept-encoding",
  "connection",
  "keep-alive",
  "upgrade",
  "expect",
  "host",
  "accept"
]);
async function proxyRequest(event, target, opts = {}) {
  let body;
  let duplex;
  if (PayloadMethods.has(event.method)) {
    if (opts.streamRequest) {
      body = getRequestWebStream$1(event);
      duplex = "half";
    } else {
      body = await readRawBody$1(event, false).catch(() => void 0);
    }
  }
  const method = opts.fetchOptions?.method || event.method;
  const fetchHeaders = mergeHeaders$1(
    getProxyRequestHeaders(event, { host: target.startsWith("/") }),
    opts.fetchOptions?.headers,
    opts.headers
  );
  return sendProxy(event, target, {
    ...opts,
    fetchOptions: {
      method,
      body,
      duplex,
      ...opts.fetchOptions,
      headers: fetchHeaders
    }
  });
}
async function sendProxy(event, target, opts = {}) {
  let response;
  try {
    response = await _getFetch(opts.fetch)(target, {
      headers: opts.headers,
      ignoreResponseError: true,
      // make $ofetch.raw transparent
      ...opts.fetchOptions
    });
  } catch (error) {
    throw createError$2({
      status: 502,
      statusMessage: "Bad Gateway",
      cause: error
    });
  }
  event.node.res.statusCode = sanitizeStatusCode$1(
    response.status,
    event.node.res.statusCode
  );
  event.node.res.statusMessage = sanitizeStatusMessage$1(response.statusText);
  const cookies = [];
  for (const [key, value] of response.headers.entries()) {
    if (key === "content-encoding") {
      continue;
    }
    if (key === "content-length") {
      continue;
    }
    if (key === "set-cookie") {
      cookies.push(...splitCookiesString$1(value));
      continue;
    }
    event.node.res.setHeader(key, value);
  }
  if (cookies.length > 0) {
    event.node.res.setHeader(
      "set-cookie",
      cookies.map((cookie) => {
        if (opts.cookieDomainRewrite) {
          cookie = rewriteCookieProperty(
            cookie,
            opts.cookieDomainRewrite,
            "domain"
          );
        }
        if (opts.cookiePathRewrite) {
          cookie = rewriteCookieProperty(
            cookie,
            opts.cookiePathRewrite,
            "path"
          );
        }
        return cookie;
      })
    );
  }
  if (opts.onResponse) {
    await opts.onResponse(event, response);
  }
  if (response._data !== void 0) {
    return response._data;
  }
  if (event.handled) {
    return;
  }
  if (opts.sendStream === false) {
    const data = new Uint8Array(await response.arrayBuffer());
    return event.node.res.end(data);
  }
  if (response.body) {
    for await (const chunk of response.body) {
      event.node.res.write(chunk);
    }
  }
  return event.node.res.end();
}
function getProxyRequestHeaders(event, opts) {
  const headers = /* @__PURE__ */ Object.create(null);
  const reqHeaders = getRequestHeaders$1(event);
  for (const name in reqHeaders) {
    if (!ignoredHeaders.has(name) || name === "host" && opts?.host) {
      headers[name] = reqHeaders[name];
    }
  }
  return headers;
}
function fetchWithEvent(event, req, init, options) {
  return _getFetch(options?.fetch)(req, {
    ...init,
    context: init?.context || event.context,
    headers: {
      ...getProxyRequestHeaders(event, {
        host: typeof req === "string" && req.startsWith("/")
      }),
      ...init?.headers
    }
  });
}
function _getFetch(_fetch) {
  if (_fetch) {
    return _fetch;
  }
  if (globalThis.fetch) {
    return globalThis.fetch;
  }
  throw new Error(
    "fetch is not available. Try importing `node-fetch-native/polyfill` for Node.js."
  );
}
function rewriteCookieProperty(header, map, property) {
  const _map = typeof map === "string" ? { "*": map } : map;
  return header.replace(
    new RegExp(`(;\\s*${property}=)([^;]+)`, "gi"),
    (match, prefix, previousValue) => {
      let newValue;
      if (previousValue in _map) {
        newValue = _map[previousValue];
      } else if ("*" in _map) {
        newValue = _map["*"];
      } else {
        return match;
      }
      return newValue ? prefix + newValue : "";
    }
  );
}
function mergeHeaders$1(defaults, ...inputs) {
  const _inputs = inputs.filter(Boolean);
  if (_inputs.length === 0) {
    return defaults;
  }
  const merged = new Headers(defaults);
  for (const input of _inputs) {
    const entries = Array.isArray(input) ? input : typeof input.entries === "function" ? input.entries() : Object.entries(input);
    for (const [key, value] of entries) {
      if (value !== void 0) {
        merged.set(key, value);
      }
    }
  }
  return merged;
}

let H3Event$1 = class H3Event {
  "__is_event__" = true;
  // Context
  node;
  // Node
  web;
  // Web
  context = {};
  // Shared
  // Request
  _method;
  _path;
  _headers;
  _requestBody;
  // Response
  _handled = false;
  // Hooks
  _onBeforeResponseCalled;
  _onAfterResponseCalled;
  constructor(req, res) {
    this.node = { req, res };
  }
  // --- Request ---
  get method() {
    if (!this._method) {
      this._method = (this.node.req.method || "GET").toUpperCase();
    }
    return this._method;
  }
  get path() {
    return this._path || this.node.req.url || "/";
  }
  get headers() {
    if (!this._headers) {
      this._headers = _normalizeNodeHeaders$1(this.node.req.headers);
    }
    return this._headers;
  }
  // --- Respoonse ---
  get handled() {
    return this._handled || this.node.res.writableEnded || this.node.res.headersSent;
  }
  respondWith(response) {
    return Promise.resolve(response).then(
      (_response) => sendWebResponse$1(this, _response)
    );
  }
  // --- Utils ---
  toString() {
    return `[${this.method}] ${this.path}`;
  }
  toJSON() {
    return this.toString();
  }
  // --- Deprecated ---
  /** @deprecated Please use `event.node.req` instead. */
  get req() {
    return this.node.req;
  }
  /** @deprecated Please use `event.node.res` instead. */
  get res() {
    return this.node.res;
  }
};
function isEvent(input) {
  return hasProp$1(input, "__is_event__");
}
function createEvent(req, res) {
  return new H3Event$1(req, res);
}
function _normalizeNodeHeaders$1(nodeHeaders) {
  const headers = new Headers();
  for (const [name, value] of Object.entries(nodeHeaders)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        headers.append(name, item);
      }
    } else if (value) {
      headers.set(name, value);
    }
  }
  return headers;
}

function defineEventHandler$1(handler) {
  if (typeof handler === "function") {
    handler.__is_handler__ = true;
    return handler;
  }
  const _hooks = {
    onRequest: _normalizeArray$1(handler.onRequest),
    onBeforeResponse: _normalizeArray$1(handler.onBeforeResponse)
  };
  const _handler = (event) => {
    return _callHandler$1(event, handler.handler, _hooks);
  };
  _handler.__is_handler__ = true;
  _handler.__resolve__ = handler.handler.__resolve__;
  _handler.__websocket__ = handler.websocket;
  return _handler;
}
function _normalizeArray$1(input) {
  return input ? Array.isArray(input) ? input : [input] : void 0;
}
async function _callHandler$1(event, handler, hooks) {
  if (hooks.onRequest) {
    for (const hook of hooks.onRequest) {
      await hook(event);
      if (event.handled) {
        return;
      }
    }
  }
  const body = await handler(event);
  const response = { body };
  if (hooks.onBeforeResponse) {
    for (const hook of hooks.onBeforeResponse) {
      await hook(event, response);
    }
  }
  return response.body;
}
const eventHandler$1 = defineEventHandler$1;
function isEventHandler(input) {
  return hasProp$1(input, "__is_handler__");
}
function toEventHandler(input, _, _route) {
  if (!isEventHandler(input)) {
    console.warn(
      "[h3] Implicit event handler conversion is deprecated. Use `eventHandler()` or `fromNodeMiddleware()` to define event handlers.",
      _route && _route !== "/" ? `
     Route: ${_route}` : "",
      `
     Handler: ${input}`
    );
  }
  return input;
}
function defineLazyEventHandler(factory) {
  let _promise;
  let _resolved;
  const resolveHandler = () => {
    if (_resolved) {
      return Promise.resolve(_resolved);
    }
    if (!_promise) {
      _promise = Promise.resolve(factory()).then((r) => {
        const handler2 = r.default || r;
        if (typeof handler2 !== "function") {
          throw new TypeError(
            "Invalid lazy handler result. It should be a function:",
            handler2
          );
        }
        _resolved = { handler: toEventHandler(r.default || r) };
        return _resolved;
      });
    }
    return _promise;
  };
  const handler = eventHandler$1((event) => {
    if (_resolved) {
      return _resolved.handler(event);
    }
    return resolveHandler().then((r) => r.handler(event));
  });
  handler.__resolve__ = resolveHandler;
  return handler;
}
const lazyEventHandler = defineLazyEventHandler;

function createApp(options = {}) {
  const stack = [];
  const handler = createAppEventHandler(stack, options);
  const resolve = createResolver(stack);
  handler.__resolve__ = resolve;
  const getWebsocket = cachedFn(() => websocketOptions(resolve, options));
  const app = {
    // @ts-expect-error
    use: (arg1, arg2, arg3) => use(app, arg1, arg2, arg3),
    resolve,
    handler,
    stack,
    options,
    get websocket() {
      return getWebsocket();
    }
  };
  return app;
}
function use(app, arg1, arg2, arg3) {
  if (Array.isArray(arg1)) {
    for (const i of arg1) {
      use(app, i, arg2, arg3);
    }
  } else if (Array.isArray(arg2)) {
    for (const i of arg2) {
      use(app, arg1, i, arg3);
    }
  } else if (typeof arg1 === "string") {
    app.stack.push(
      normalizeLayer({ ...arg3, route: arg1, handler: arg2 })
    );
  } else if (typeof arg1 === "function") {
    app.stack.push(normalizeLayer({ ...arg2, handler: arg1 }));
  } else {
    app.stack.push(normalizeLayer({ ...arg1 }));
  }
  return app;
}
function createAppEventHandler(stack, options) {
  const spacing = options.debug ? 2 : void 0;
  return eventHandler$1(async (event) => {
    event.node.req.originalUrl = event.node.req.originalUrl || event.node.req.url || "/";
    const _reqPath = event._path || event.node.req.url || "/";
    let _layerPath;
    if (options.onRequest) {
      await options.onRequest(event);
    }
    for (const layer of stack) {
      if (layer.route.length > 1) {
        if (!_reqPath.startsWith(layer.route)) {
          continue;
        }
        _layerPath = _reqPath.slice(layer.route.length) || "/";
      } else {
        _layerPath = _reqPath;
      }
      if (layer.match && !layer.match(_layerPath, event)) {
        continue;
      }
      event._path = _layerPath;
      event.node.req.url = _layerPath;
      const val = await layer.handler(event);
      const _body = val === void 0 ? void 0 : await val;
      if (_body !== void 0) {
        const _response = { body: _body };
        if (options.onBeforeResponse) {
          event._onBeforeResponseCalled = true;
          await options.onBeforeResponse(event, _response);
        }
        await handleHandlerResponse(event, _response.body, spacing);
        if (options.onAfterResponse) {
          event._onAfterResponseCalled = true;
          await options.onAfterResponse(event, _response);
        }
        return;
      }
      if (event.handled) {
        if (options.onAfterResponse) {
          event._onAfterResponseCalled = true;
          await options.onAfterResponse(event, void 0);
        }
        return;
      }
    }
    if (!event.handled) {
      throw createError$2({
        statusCode: 404,
        statusMessage: `Cannot find any path matching ${event.path || "/"}.`
      });
    }
    if (options.onAfterResponse) {
      event._onAfterResponseCalled = true;
      await options.onAfterResponse(event, void 0);
    }
  });
}
function createResolver(stack) {
  return async (path) => {
    let _layerPath;
    for (const layer of stack) {
      if (layer.route === "/" && !layer.handler.__resolve__) {
        continue;
      }
      if (!path.startsWith(layer.route)) {
        continue;
      }
      _layerPath = path.slice(layer.route.length) || "/";
      if (layer.match && !layer.match(_layerPath, void 0)) {
        continue;
      }
      let res = { route: layer.route, handler: layer.handler };
      if (res.handler.__resolve__) {
        const _res = await res.handler.__resolve__(_layerPath);
        if (!_res) {
          continue;
        }
        res = {
          ...res,
          ..._res,
          route: joinURL(res.route || "/", _res.route || "/")
        };
      }
      return res;
    }
  };
}
function normalizeLayer(input) {
  let handler = input.handler;
  if (handler.handler) {
    handler = handler.handler;
  }
  if (input.lazy) {
    handler = lazyEventHandler(handler);
  } else if (!isEventHandler(handler)) {
    handler = toEventHandler(handler, void 0, input.route);
  }
  return {
    route: withoutTrailingSlash(input.route),
    match: input.match,
    handler
  };
}
function handleHandlerResponse(event, val, jsonSpace) {
  if (val === null) {
    return sendNoContent(event);
  }
  if (val) {
    if (isWebResponse(val)) {
      return sendWebResponse$1(event, val);
    }
    if (isStream(val)) {
      return sendStream$1(event, val);
    }
    if (val.buffer) {
      return send$1(event, val);
    }
    if (val.arrayBuffer && typeof val.arrayBuffer === "function") {
      return val.arrayBuffer().then((arrayBuffer) => {
        return send$1(event, Buffer.from(arrayBuffer), val.type);
      });
    }
    if (val instanceof Error) {
      throw createError$2(val);
    }
    if (typeof val.end === "function") {
      return true;
    }
  }
  const valType = typeof val;
  if (valType === "string") {
    return send$1(event, val, MIMES$1.html);
  }
  if (valType === "object" || valType === "boolean" || valType === "number") {
    return send$1(event, JSON.stringify(val, void 0, jsonSpace), MIMES$1.json);
  }
  if (valType === "bigint") {
    return send$1(event, val.toString(), MIMES$1.json);
  }
  throw createError$2({
    statusCode: 500,
    statusMessage: `[h3] Cannot send ${valType} as response.`
  });
}
function cachedFn(fn) {
  let cache;
  return () => {
    if (!cache) {
      cache = fn();
    }
    return cache;
  };
}
function websocketOptions(evResolver, appOptions) {
  return {
    ...appOptions.websocket,
    async resolve(info) {
      const url = info.request?.url || info.url || "/";
      const { pathname } = typeof url === "string" ? parseURL(url) : url;
      const resolved = await evResolver(pathname);
      return resolved?.handler?.__websocket__ || {};
    }
  };
}

const RouterMethods = [
  "connect",
  "delete",
  "get",
  "head",
  "options",
  "post",
  "put",
  "trace",
  "patch"
];
function createRouter(opts = {}) {
  const _router = createRouter$1({});
  const routes = {};
  let _matcher;
  const router = {};
  const addRoute = (path, handler, method) => {
    let route = routes[path];
    if (!route) {
      routes[path] = route = { path, handlers: {} };
      _router.insert(path, route);
    }
    if (Array.isArray(method)) {
      for (const m of method) {
        addRoute(path, handler, m);
      }
    } else {
      route.handlers[method] = toEventHandler(handler, void 0, path);
    }
    return router;
  };
  router.use = router.add = (path, handler, method) => addRoute(path, handler, method || "all");
  for (const method of RouterMethods) {
    router[method] = (path, handle) => router.add(path, handle, method);
  }
  const matchHandler = (path = "/", method = "get") => {
    const qIndex = path.indexOf("?");
    if (qIndex !== -1) {
      path = path.slice(0, Math.max(0, qIndex));
    }
    const matched = _router.lookup(path);
    if (!matched || !matched.handlers) {
      return {
        error: createError$2({
          statusCode: 404,
          name: "Not Found",
          statusMessage: `Cannot find any route matching ${path || "/"}.`
        })
      };
    }
    let handler = matched.handlers[method] || matched.handlers.all;
    if (!handler) {
      if (!_matcher) {
        _matcher = toRouteMatcher(_router);
      }
      const _matches = _matcher.matchAll(path).reverse();
      for (const _match of _matches) {
        if (_match.handlers[method]) {
          handler = _match.handlers[method];
          matched.handlers[method] = matched.handlers[method] || handler;
          break;
        }
        if (_match.handlers.all) {
          handler = _match.handlers.all;
          matched.handlers.all = matched.handlers.all || handler;
          break;
        }
      }
    }
    if (!handler) {
      return {
        error: createError$2({
          statusCode: 405,
          name: "Method Not Allowed",
          statusMessage: `Method ${method} is not allowed on this route.`
        })
      };
    }
    return { matched, handler };
  };
  const isPreemptive = opts.preemptive || opts.preemtive;
  router.handler = eventHandler$1((event) => {
    const match = matchHandler(
      event.path,
      event.method.toLowerCase()
    );
    if ("error" in match) {
      if (isPreemptive) {
        throw match.error;
      } else {
        return;
      }
    }
    event.context.matchedRoute = match.matched;
    const params = match.matched.params || {};
    event.context.params = params;
    return Promise.resolve(match.handler(event)).then((res) => {
      if (res === void 0 && isPreemptive) {
        return null;
      }
      return res;
    });
  });
  router.handler.__resolve__ = async (path) => {
    path = withLeadingSlash(path);
    const match = matchHandler(path);
    if ("error" in match) {
      return;
    }
    let res = {
      route: match.matched.path,
      handler: match.handler
    };
    if (match.handler.__resolve__) {
      const _res = await match.handler.__resolve__(path);
      if (!_res) {
        return;
      }
      res = { ...res, ..._res };
    }
    return res;
  };
  return router;
}
function toNodeListener(app) {
  const toNodeHandle = async function(req, res) {
    const event = createEvent(req, res);
    try {
      await app.handler(event);
    } catch (_error) {
      const error = createError$2(_error);
      if (!isError$1(_error)) {
        error.unhandled = true;
      }
      setResponseStatus$1(event, error.statusCode, error.statusMessage);
      if (app.options.onError) {
        await app.options.onError(error, event);
      }
      if (event.handled) {
        return;
      }
      if (error.unhandled || error.fatal) {
        console.error("[h3]", error.fatal ? "[fatal]" : "[unhandled]", error);
      }
      if (app.options.onBeforeResponse && !event._onBeforeResponseCalled) {
        await app.options.onBeforeResponse(event, { body: error });
      }
      await sendError(event, error, !!app.options.debug);
      if (app.options.onAfterResponse && !event._onAfterResponseCalled) {
        await app.options.onAfterResponse(event, { body: error });
      }
    }
  };
  return toNodeHandle;
}

function flatHooks(configHooks, hooks = {}, parentName) {
  for (const key in configHooks) {
    const subHook = configHooks[key];
    const name = parentName ? `${parentName}:${key}` : key;
    if (typeof subHook === "object" && subHook !== null) {
      flatHooks(subHook, hooks, name);
    } else if (typeof subHook === "function") {
      hooks[name] = subHook;
    }
  }
  return hooks;
}
const defaultTask = { run: (function_) => function_() };
const _createTask = () => defaultTask;
const createTask = typeof console.createTask !== "undefined" ? console.createTask : _createTask;
function serialTaskCaller(hooks, args) {
  const name = args.shift();
  const task = createTask(name);
  return hooks.reduce(
    (promise, hookFunction) => promise.then(() => task.run(() => hookFunction(...args))),
    Promise.resolve()
  );
}
function parallelTaskCaller(hooks, args) {
  const name = args.shift();
  const task = createTask(name);
  return Promise.all(hooks.map((hook) => task.run(() => hook(...args))));
}
function callEachWith(callbacks, arg0) {
  for (const callback of [...callbacks]) {
    callback(arg0);
  }
}

class Hookable {
  constructor() {
    this._hooks = {};
    this._before = void 0;
    this._after = void 0;
    this._deprecatedMessages = void 0;
    this._deprecatedHooks = {};
    this.hook = this.hook.bind(this);
    this.callHook = this.callHook.bind(this);
    this.callHookWith = this.callHookWith.bind(this);
  }
  hook(name, function_, options = {}) {
    if (!name || typeof function_ !== "function") {
      return () => {
      };
    }
    const originalName = name;
    let dep;
    while (this._deprecatedHooks[name]) {
      dep = this._deprecatedHooks[name];
      name = dep.to;
    }
    if (dep && !options.allowDeprecated) {
      let message = dep.message;
      if (!message) {
        message = `${originalName} hook has been deprecated` + (dep.to ? `, please use ${dep.to}` : "");
      }
      if (!this._deprecatedMessages) {
        this._deprecatedMessages = /* @__PURE__ */ new Set();
      }
      if (!this._deprecatedMessages.has(message)) {
        console.warn(message);
        this._deprecatedMessages.add(message);
      }
    }
    if (!function_.name) {
      try {
        Object.defineProperty(function_, "name", {
          get: () => "_" + name.replace(/\W+/g, "_") + "_hook_cb",
          configurable: true
        });
      } catch {
      }
    }
    this._hooks[name] = this._hooks[name] || [];
    this._hooks[name].push(function_);
    return () => {
      if (function_) {
        this.removeHook(name, function_);
        function_ = void 0;
      }
    };
  }
  hookOnce(name, function_) {
    let _unreg;
    let _function = (...arguments_) => {
      if (typeof _unreg === "function") {
        _unreg();
      }
      _unreg = void 0;
      _function = void 0;
      return function_(...arguments_);
    };
    _unreg = this.hook(name, _function);
    return _unreg;
  }
  removeHook(name, function_) {
    if (this._hooks[name]) {
      const index = this._hooks[name].indexOf(function_);
      if (index !== -1) {
        this._hooks[name].splice(index, 1);
      }
      if (this._hooks[name].length === 0) {
        delete this._hooks[name];
      }
    }
  }
  deprecateHook(name, deprecated) {
    this._deprecatedHooks[name] = typeof deprecated === "string" ? { to: deprecated } : deprecated;
    const _hooks = this._hooks[name] || [];
    delete this._hooks[name];
    for (const hook of _hooks) {
      this.hook(name, hook);
    }
  }
  deprecateHooks(deprecatedHooks) {
    Object.assign(this._deprecatedHooks, deprecatedHooks);
    for (const name in deprecatedHooks) {
      this.deprecateHook(name, deprecatedHooks[name]);
    }
  }
  addHooks(configHooks) {
    const hooks = flatHooks(configHooks);
    const removeFns = Object.keys(hooks).map(
      (key) => this.hook(key, hooks[key])
    );
    return () => {
      for (const unreg of removeFns.splice(0, removeFns.length)) {
        unreg();
      }
    };
  }
  removeHooks(configHooks) {
    const hooks = flatHooks(configHooks);
    for (const key in hooks) {
      this.removeHook(key, hooks[key]);
    }
  }
  removeAllHooks() {
    for (const key in this._hooks) {
      delete this._hooks[key];
    }
  }
  callHook(name, ...arguments_) {
    arguments_.unshift(name);
    return this.callHookWith(serialTaskCaller, name, ...arguments_);
  }
  callHookParallel(name, ...arguments_) {
    arguments_.unshift(name);
    return this.callHookWith(parallelTaskCaller, name, ...arguments_);
  }
  callHookWith(caller, name, ...arguments_) {
    const event = this._before || this._after ? { name, args: arguments_, context: {} } : void 0;
    if (this._before) {
      callEachWith(this._before, event);
    }
    const result = caller(
      name in this._hooks ? [...this._hooks[name]] : [],
      arguments_
    );
    if (result instanceof Promise) {
      return result.finally(() => {
        if (this._after && event) {
          callEachWith(this._after, event);
        }
      });
    }
    if (this._after && event) {
      callEachWith(this._after, event);
    }
    return result;
  }
  beforeEach(function_) {
    this._before = this._before || [];
    this._before.push(function_);
    return () => {
      if (this._before !== void 0) {
        const index = this._before.indexOf(function_);
        if (index !== -1) {
          this._before.splice(index, 1);
        }
      }
    };
  }
  afterEach(function_) {
    this._after = this._after || [];
    this._after.push(function_);
    return () => {
      if (this._after !== void 0) {
        const index = this._after.indexOf(function_);
        if (index !== -1) {
          this._after.splice(index, 1);
        }
      }
    };
  }
}
function createHooks() {
  return new Hookable();
}

const s$1=globalThis.Headers,i=globalThis.AbortController,l$1=globalThis.fetch||(()=>{throw new Error("[node-fetch-native] Failed to fetch: `globalThis.fetch` is not available!")});

class FetchError extends Error {
  constructor(message, opts) {
    super(message, opts);
    this.name = "FetchError";
    if (opts?.cause && !this.cause) {
      this.cause = opts.cause;
    }
  }
}
function createFetchError(ctx) {
  const errorMessage = ctx.error?.message || ctx.error?.toString() || "";
  const method = ctx.request?.method || ctx.options?.method || "GET";
  const url = ctx.request?.url || String(ctx.request) || "/";
  const requestStr = `[${method}] ${JSON.stringify(url)}`;
  const statusStr = ctx.response ? `${ctx.response.status} ${ctx.response.statusText}` : "<no response>";
  const message = `${requestStr}: ${statusStr}${errorMessage ? ` ${errorMessage}` : ""}`;
  const fetchError = new FetchError(
    message,
    ctx.error ? { cause: ctx.error } : void 0
  );
  for (const key of ["request", "options", "response"]) {
    Object.defineProperty(fetchError, key, {
      get() {
        return ctx[key];
      }
    });
  }
  for (const [key, refKey] of [
    ["data", "_data"],
    ["status", "status"],
    ["statusCode", "status"],
    ["statusText", "statusText"],
    ["statusMessage", "statusText"]
  ]) {
    Object.defineProperty(fetchError, key, {
      get() {
        return ctx.response && ctx.response[refKey];
      }
    });
  }
  return fetchError;
}

const payloadMethods = new Set(
  Object.freeze(["PATCH", "POST", "PUT", "DELETE"])
);
function isPayloadMethod(method = "GET") {
  return payloadMethods.has(method.toUpperCase());
}
function isJSONSerializable(value) {
  if (value === void 0) {
    return false;
  }
  const t = typeof value;
  if (t === "string" || t === "number" || t === "boolean" || t === null) {
    return true;
  }
  if (t !== "object") {
    return false;
  }
  if (Array.isArray(value)) {
    return true;
  }
  if (value.buffer) {
    return false;
  }
  return value.constructor && value.constructor.name === "Object" || typeof value.toJSON === "function";
}
const textTypes = /* @__PURE__ */ new Set([
  "image/svg",
  "application/xml",
  "application/xhtml",
  "application/html"
]);
const JSON_RE = /^application\/(?:[\w!#$%&*.^`~-]*\+)?json(;.+)?$/i;
function detectResponseType(_contentType = "") {
  if (!_contentType) {
    return "json";
  }
  const contentType = _contentType.split(";").shift() || "";
  if (JSON_RE.test(contentType)) {
    return "json";
  }
  if (textTypes.has(contentType) || contentType.startsWith("text/")) {
    return "text";
  }
  return "blob";
}
function resolveFetchOptions(request, input, defaults, Headers) {
  const headers = mergeHeaders(
    input?.headers ?? request?.headers,
    defaults?.headers,
    Headers
  );
  let query;
  if (defaults?.query || defaults?.params || input?.params || input?.query) {
    query = {
      ...defaults?.params,
      ...defaults?.query,
      ...input?.params,
      ...input?.query
    };
  }
  return {
    ...defaults,
    ...input,
    query,
    params: query,
    headers
  };
}
function mergeHeaders(input, defaults, Headers) {
  if (!defaults) {
    return new Headers(input);
  }
  const headers = new Headers(defaults);
  if (input) {
    for (const [key, value] of Symbol.iterator in input || Array.isArray(input) ? input : new Headers(input)) {
      headers.set(key, value);
    }
  }
  return headers;
}
async function callHooks(context, hooks) {
  if (hooks) {
    if (Array.isArray(hooks)) {
      for (const hook of hooks) {
        await hook(context);
      }
    } else {
      await hooks(context);
    }
  }
}

const retryStatusCodes = /* @__PURE__ */ new Set([
  408,
  // Request Timeout
  409,
  // Conflict
  425,
  // Too Early (Experimental)
  429,
  // Too Many Requests
  500,
  // Internal Server Error
  502,
  // Bad Gateway
  503,
  // Service Unavailable
  504
  // Gateway Timeout
]);
const nullBodyResponses = /* @__PURE__ */ new Set([101, 204, 205, 304]);
function createFetch(globalOptions = {}) {
  const {
    fetch = globalThis.fetch,
    Headers = globalThis.Headers,
    AbortController = globalThis.AbortController
  } = globalOptions;
  async function onError(context) {
    const isAbort = context.error && context.error.name === "AbortError" && !context.options.timeout || false;
    if (context.options.retry !== false && !isAbort) {
      let retries;
      if (typeof context.options.retry === "number") {
        retries = context.options.retry;
      } else {
        retries = isPayloadMethod(context.options.method) ? 0 : 1;
      }
      const responseCode = context.response && context.response.status || 500;
      if (retries > 0 && (Array.isArray(context.options.retryStatusCodes) ? context.options.retryStatusCodes.includes(responseCode) : retryStatusCodes.has(responseCode))) {
        const retryDelay = typeof context.options.retryDelay === "function" ? context.options.retryDelay(context) : context.options.retryDelay || 0;
        if (retryDelay > 0) {
          await new Promise((resolve) => setTimeout(resolve, retryDelay));
        }
        return $fetchRaw(context.request, {
          ...context.options,
          retry: retries - 1
        });
      }
    }
    const error = createFetchError(context);
    if (Error.captureStackTrace) {
      Error.captureStackTrace(error, $fetchRaw);
    }
    throw error;
  }
  const $fetchRaw = async function $fetchRaw2(_request, _options = {}) {
    const context = {
      request: _request,
      options: resolveFetchOptions(
        _request,
        _options,
        globalOptions.defaults,
        Headers
      ),
      response: void 0,
      error: void 0
    };
    if (context.options.method) {
      context.options.method = context.options.method.toUpperCase();
    }
    if (context.options.onRequest) {
      await callHooks(context, context.options.onRequest);
    }
    if (typeof context.request === "string") {
      if (context.options.baseURL) {
        context.request = withBase(context.request, context.options.baseURL);
      }
      if (context.options.query) {
        context.request = withQuery(context.request, context.options.query);
        delete context.options.query;
      }
      if ("query" in context.options) {
        delete context.options.query;
      }
      if ("params" in context.options) {
        delete context.options.params;
      }
    }
    if (context.options.body && isPayloadMethod(context.options.method)) {
      if (isJSONSerializable(context.options.body)) {
        context.options.body = typeof context.options.body === "string" ? context.options.body : JSON.stringify(context.options.body);
        context.options.headers = new Headers(context.options.headers || {});
        if (!context.options.headers.has("content-type")) {
          context.options.headers.set("content-type", "application/json");
        }
        if (!context.options.headers.has("accept")) {
          context.options.headers.set("accept", "application/json");
        }
      } else if (
        // ReadableStream Body
        "pipeTo" in context.options.body && typeof context.options.body.pipeTo === "function" || // Node.js Stream Body
        typeof context.options.body.pipe === "function"
      ) {
        if (!("duplex" in context.options)) {
          context.options.duplex = "half";
        }
      }
    }
    let abortTimeout;
    if (!context.options.signal && context.options.timeout) {
      const controller = new AbortController();
      abortTimeout = setTimeout(() => {
        const error = new Error(
          "[TimeoutError]: The operation was aborted due to timeout"
        );
        error.name = "TimeoutError";
        error.code = 23;
        controller.abort(error);
      }, context.options.timeout);
      context.options.signal = controller.signal;
    }
    try {
      context.response = await fetch(
        context.request,
        context.options
      );
    } catch (error) {
      context.error = error;
      if (context.options.onRequestError) {
        await callHooks(
          context,
          context.options.onRequestError
        );
      }
      return await onError(context);
    } finally {
      if (abortTimeout) {
        clearTimeout(abortTimeout);
      }
    }
    const hasBody = (context.response.body || // https://github.com/unjs/ofetch/issues/324
    // https://github.com/unjs/ofetch/issues/294
    // https://github.com/JakeChampion/fetch/issues/1454
    context.response._bodyInit) && !nullBodyResponses.has(context.response.status) && context.options.method !== "HEAD";
    if (hasBody) {
      const responseType = (context.options.parseResponse ? "json" : context.options.responseType) || detectResponseType(context.response.headers.get("content-type") || "");
      switch (responseType) {
        case "json": {
          const data = await context.response.text();
          const parseFunction = context.options.parseResponse || destr;
          context.response._data = parseFunction(data);
          break;
        }
        case "stream": {
          context.response._data = context.response.body || context.response._bodyInit;
          break;
        }
        default: {
          context.response._data = await context.response[responseType]();
        }
      }
    }
    if (context.options.onResponse) {
      await callHooks(
        context,
        context.options.onResponse
      );
    }
    if (!context.options.ignoreResponseError && context.response.status >= 400 && context.response.status < 600) {
      if (context.options.onResponseError) {
        await callHooks(
          context,
          context.options.onResponseError
        );
      }
      return await onError(context);
    }
    return context.response;
  };
  const $fetch = async function $fetch2(request, options) {
    const r = await $fetchRaw(request, options);
    return r._data;
  };
  $fetch.raw = $fetchRaw;
  $fetch.native = (...args) => fetch(...args);
  $fetch.create = (defaultOptions = {}, customGlobalOptions = {}) => createFetch({
    ...globalOptions,
    ...customGlobalOptions,
    defaults: {
      ...globalOptions.defaults,
      ...customGlobalOptions.defaults,
      ...defaultOptions
    }
  });
  return $fetch;
}

function createNodeFetch() {
  const useKeepAlive = JSON.parse(process.env.FETCH_KEEP_ALIVE || "false");
  if (!useKeepAlive) {
    return l$1;
  }
  const agentOptions = { keepAlive: true };
  const httpAgent = new http.Agent(agentOptions);
  const httpsAgent = new https.Agent(agentOptions);
  const nodeFetchOptions = {
    agent(parsedURL) {
      return parsedURL.protocol === "http:" ? httpAgent : httpsAgent;
    }
  };
  return function nodeFetchWithKeepAlive(input, init) {
    return l$1(input, { ...nodeFetchOptions, ...init });
  };
}
const fetch = globalThis.fetch ? (...args) => globalThis.fetch(...args) : createNodeFetch();
const Headers$1 = globalThis.Headers || s$1;
const AbortController = globalThis.AbortController || i;
createFetch({ fetch, Headers: Headers$1, AbortController });

function wrapToPromise(value) {
  if (!value || typeof value.then !== "function") {
    return Promise.resolve(value);
  }
  return value;
}
function asyncCall(function_, ...arguments_) {
  try {
    return wrapToPromise(function_(...arguments_));
  } catch (error) {
    return Promise.reject(error);
  }
}
function isPrimitive(value) {
  const type = typeof value;
  return value === null || type !== "object" && type !== "function";
}
function isPureObject(value) {
  const proto = Object.getPrototypeOf(value);
  return !proto || proto.isPrototypeOf(Object);
}
function stringify(value) {
  if (isPrimitive(value)) {
    return String(value);
  }
  if (isPureObject(value) || Array.isArray(value)) {
    return JSON.stringify(value);
  }
  if (typeof value.toJSON === "function") {
    return stringify(value.toJSON());
  }
  throw new Error("[unstorage] Cannot stringify value!");
}
const BASE64_PREFIX = "base64:";
function serializeRaw(value) {
  if (typeof value === "string") {
    return value;
  }
  return BASE64_PREFIX + base64Encode(value);
}
function deserializeRaw(value) {
  if (typeof value !== "string") {
    return value;
  }
  if (!value.startsWith(BASE64_PREFIX)) {
    return value;
  }
  return base64Decode(value.slice(BASE64_PREFIX.length));
}
function base64Decode(input) {
  if (globalThis.Buffer) {
    return Buffer.from(input, "base64");
  }
  return Uint8Array.from(
    globalThis.atob(input),
    (c) => c.codePointAt(0)
  );
}
function base64Encode(input) {
  if (globalThis.Buffer) {
    return Buffer.from(input).toString("base64");
  }
  return globalThis.btoa(String.fromCodePoint(...input));
}

const storageKeyProperties = [
  "has",
  "hasItem",
  "get",
  "getItem",
  "getItemRaw",
  "set",
  "setItem",
  "setItemRaw",
  "del",
  "remove",
  "removeItem",
  "getMeta",
  "setMeta",
  "removeMeta",
  "getKeys",
  "clear",
  "mount",
  "unmount"
];
function prefixStorage(storage, base) {
  base = normalizeBaseKey(base);
  if (!base) {
    return storage;
  }
  const nsStorage = { ...storage };
  for (const property of storageKeyProperties) {
    nsStorage[property] = (key = "", ...args) => (
      // @ts-ignore
      storage[property](base + key, ...args)
    );
  }
  nsStorage.getKeys = (key = "", ...arguments_) => storage.getKeys(base + key, ...arguments_).then((keys) => keys.map((key2) => key2.slice(base.length)));
  nsStorage.keys = nsStorage.getKeys;
  nsStorage.getItems = async (items, commonOptions) => {
    const prefixedItems = items.map(
      (item) => typeof item === "string" ? base + item : { ...item, key: base + item.key }
    );
    const results = await storage.getItems(prefixedItems, commonOptions);
    return results.map((entry) => ({
      key: entry.key.slice(base.length),
      value: entry.value
    }));
  };
  nsStorage.setItems = async (items, commonOptions) => {
    const prefixedItems = items.map((item) => ({
      key: base + item.key,
      value: item.value,
      options: item.options
    }));
    return storage.setItems(prefixedItems, commonOptions);
  };
  return nsStorage;
}
function normalizeKey$1(key) {
  if (!key) {
    return "";
  }
  return key.split("?")[0]?.replace(/[/\\]/g, ":").replace(/:+/g, ":").replace(/^:|:$/g, "") || "";
}
function joinKeys(...keys) {
  return normalizeKey$1(keys.join(":"));
}
function normalizeBaseKey(base) {
  base = normalizeKey$1(base);
  return base ? base + ":" : "";
}
function filterKeyByDepth(key, depth) {
  if (depth === void 0) {
    return true;
  }
  let substrCount = 0;
  let index = key.indexOf(":");
  while (index > -1) {
    substrCount++;
    index = key.indexOf(":", index + 1);
  }
  return substrCount <= depth;
}
function filterKeyByBase(key, base) {
  if (base) {
    return key.startsWith(base) && key[key.length - 1] !== "$";
  }
  return key[key.length - 1] !== "$";
}

function defineDriver$1(factory) {
  return factory;
}

const DRIVER_NAME$1 = "memory";
const memory = defineDriver$1(() => {
  const data = /* @__PURE__ */ new Map();
  return {
    name: DRIVER_NAME$1,
    getInstance: () => data,
    hasItem(key) {
      return data.has(key);
    },
    getItem(key) {
      return data.get(key) ?? null;
    },
    getItemRaw(key) {
      return data.get(key) ?? null;
    },
    setItem(key, value) {
      data.set(key, value);
    },
    setItemRaw(key, value) {
      data.set(key, value);
    },
    removeItem(key) {
      data.delete(key);
    },
    getKeys() {
      return [...data.keys()];
    },
    clear() {
      data.clear();
    },
    dispose() {
      data.clear();
    }
  };
});

function createStorage(options = {}) {
  const context = {
    mounts: { "": options.driver || memory() },
    mountpoints: [""],
    watching: false,
    watchListeners: [],
    unwatch: {}
  };
  const getMount = (key) => {
    for (const base of context.mountpoints) {
      if (key.startsWith(base)) {
        return {
          base,
          relativeKey: key.slice(base.length),
          driver: context.mounts[base]
        };
      }
    }
    return {
      base: "",
      relativeKey: key,
      driver: context.mounts[""]
    };
  };
  const getMounts = (base, includeParent) => {
    return context.mountpoints.filter(
      (mountpoint) => mountpoint.startsWith(base) || includeParent && base.startsWith(mountpoint)
    ).map((mountpoint) => ({
      relativeBase: base.length > mountpoint.length ? base.slice(mountpoint.length) : void 0,
      mountpoint,
      driver: context.mounts[mountpoint]
    }));
  };
  const onChange = (event, key) => {
    if (!context.watching) {
      return;
    }
    key = normalizeKey$1(key);
    for (const listener of context.watchListeners) {
      listener(event, key);
    }
  };
  const startWatch = async () => {
    if (context.watching) {
      return;
    }
    context.watching = true;
    for (const mountpoint in context.mounts) {
      context.unwatch[mountpoint] = await watch(
        context.mounts[mountpoint],
        onChange,
        mountpoint
      );
    }
  };
  const stopWatch = async () => {
    if (!context.watching) {
      return;
    }
    for (const mountpoint in context.unwatch) {
      await context.unwatch[mountpoint]();
    }
    context.unwatch = {};
    context.watching = false;
  };
  const runBatch = (items, commonOptions, cb) => {
    const batches = /* @__PURE__ */ new Map();
    const getBatch = (mount) => {
      let batch = batches.get(mount.base);
      if (!batch) {
        batch = {
          driver: mount.driver,
          base: mount.base,
          items: []
        };
        batches.set(mount.base, batch);
      }
      return batch;
    };
    for (const item of items) {
      const isStringItem = typeof item === "string";
      const key = normalizeKey$1(isStringItem ? item : item.key);
      const value = isStringItem ? void 0 : item.value;
      const options2 = isStringItem || !item.options ? commonOptions : { ...commonOptions, ...item.options };
      const mount = getMount(key);
      getBatch(mount).items.push({
        key,
        value,
        relativeKey: mount.relativeKey,
        options: options2
      });
    }
    return Promise.all([...batches.values()].map((batch) => cb(batch))).then(
      (r) => r.flat()
    );
  };
  const storage = {
    // Item
    hasItem(key, opts = {}) {
      key = normalizeKey$1(key);
      const { relativeKey, driver } = getMount(key);
      return asyncCall(driver.hasItem, relativeKey, opts);
    },
    getItem(key, opts = {}) {
      key = normalizeKey$1(key);
      const { relativeKey, driver } = getMount(key);
      return asyncCall(driver.getItem, relativeKey, opts).then(
        (value) => destr(value)
      );
    },
    getItems(items, commonOptions = {}) {
      return runBatch(items, commonOptions, (batch) => {
        if (batch.driver.getItems) {
          return asyncCall(
            batch.driver.getItems,
            batch.items.map((item) => ({
              key: item.relativeKey,
              options: item.options
            })),
            commonOptions
          ).then(
            (r) => r.map((item) => ({
              key: joinKeys(batch.base, item.key),
              value: destr(item.value)
            }))
          );
        }
        return Promise.all(
          batch.items.map((item) => {
            return asyncCall(
              batch.driver.getItem,
              item.relativeKey,
              item.options
            ).then((value) => ({
              key: item.key,
              value: destr(value)
            }));
          })
        );
      });
    },
    getItemRaw(key, opts = {}) {
      key = normalizeKey$1(key);
      const { relativeKey, driver } = getMount(key);
      if (driver.getItemRaw) {
        return asyncCall(driver.getItemRaw, relativeKey, opts);
      }
      return asyncCall(driver.getItem, relativeKey, opts).then(
        (value) => deserializeRaw(value)
      );
    },
    async setItem(key, value, opts = {}) {
      if (value === void 0) {
        return storage.removeItem(key);
      }
      key = normalizeKey$1(key);
      const { relativeKey, driver } = getMount(key);
      if (!driver.setItem) {
        return;
      }
      await asyncCall(driver.setItem, relativeKey, stringify(value), opts);
      if (!driver.watch) {
        onChange("update", key);
      }
    },
    async setItems(items, commonOptions) {
      await runBatch(items, commonOptions, async (batch) => {
        if (batch.driver.setItems) {
          return asyncCall(
            batch.driver.setItems,
            batch.items.map((item) => ({
              key: item.relativeKey,
              value: stringify(item.value),
              options: item.options
            })),
            commonOptions
          );
        }
        if (!batch.driver.setItem) {
          return;
        }
        await Promise.all(
          batch.items.map((item) => {
            return asyncCall(
              batch.driver.setItem,
              item.relativeKey,
              stringify(item.value),
              item.options
            );
          })
        );
      });
    },
    async setItemRaw(key, value, opts = {}) {
      if (value === void 0) {
        return storage.removeItem(key, opts);
      }
      key = normalizeKey$1(key);
      const { relativeKey, driver } = getMount(key);
      if (driver.setItemRaw) {
        await asyncCall(driver.setItemRaw, relativeKey, value, opts);
      } else if (driver.setItem) {
        await asyncCall(driver.setItem, relativeKey, serializeRaw(value), opts);
      } else {
        return;
      }
      if (!driver.watch) {
        onChange("update", key);
      }
    },
    async removeItem(key, opts = {}) {
      if (typeof opts === "boolean") {
        opts = { removeMeta: opts };
      }
      key = normalizeKey$1(key);
      const { relativeKey, driver } = getMount(key);
      if (!driver.removeItem) {
        return;
      }
      await asyncCall(driver.removeItem, relativeKey, opts);
      if (opts.removeMeta || opts.removeMata) {
        await asyncCall(driver.removeItem, relativeKey + "$", opts);
      }
      if (!driver.watch) {
        onChange("remove", key);
      }
    },
    // Meta
    async getMeta(key, opts = {}) {
      if (typeof opts === "boolean") {
        opts = { nativeOnly: opts };
      }
      key = normalizeKey$1(key);
      const { relativeKey, driver } = getMount(key);
      const meta = /* @__PURE__ */ Object.create(null);
      if (driver.getMeta) {
        Object.assign(meta, await asyncCall(driver.getMeta, relativeKey, opts));
      }
      if (!opts.nativeOnly) {
        const value = await asyncCall(
          driver.getItem,
          relativeKey + "$",
          opts
        ).then((value_) => destr(value_));
        if (value && typeof value === "object") {
          if (typeof value.atime === "string") {
            value.atime = new Date(value.atime);
          }
          if (typeof value.mtime === "string") {
            value.mtime = new Date(value.mtime);
          }
          Object.assign(meta, value);
        }
      }
      return meta;
    },
    setMeta(key, value, opts = {}) {
      return this.setItem(key + "$", value, opts);
    },
    removeMeta(key, opts = {}) {
      return this.removeItem(key + "$", opts);
    },
    // Keys
    async getKeys(base, opts = {}) {
      base = normalizeBaseKey(base);
      const mounts = getMounts(base, true);
      let maskedMounts = [];
      const allKeys = [];
      let allMountsSupportMaxDepth = true;
      for (const mount of mounts) {
        if (!mount.driver.flags?.maxDepth) {
          allMountsSupportMaxDepth = false;
        }
        const rawKeys = await asyncCall(
          mount.driver.getKeys,
          mount.relativeBase,
          opts
        );
        for (const key of rawKeys) {
          const fullKey = mount.mountpoint + normalizeKey$1(key);
          if (!maskedMounts.some((p) => fullKey.startsWith(p))) {
            allKeys.push(fullKey);
          }
        }
        maskedMounts = [
          mount.mountpoint,
          ...maskedMounts.filter((p) => !p.startsWith(mount.mountpoint))
        ];
      }
      const shouldFilterByDepth = opts.maxDepth !== void 0 && !allMountsSupportMaxDepth;
      return allKeys.filter(
        (key) => (!shouldFilterByDepth || filterKeyByDepth(key, opts.maxDepth)) && filterKeyByBase(key, base)
      );
    },
    // Utils
    async clear(base, opts = {}) {
      base = normalizeBaseKey(base);
      await Promise.all(
        getMounts(base, false).map(async (m) => {
          if (m.driver.clear) {
            return asyncCall(m.driver.clear, m.relativeBase, opts);
          }
          if (m.driver.removeItem) {
            const keys = await m.driver.getKeys(m.relativeBase || "", opts);
            return Promise.all(
              keys.map((key) => m.driver.removeItem(key, opts))
            );
          }
        })
      );
    },
    async dispose() {
      await Promise.all(
        Object.values(context.mounts).map((driver) => dispose(driver))
      );
    },
    async watch(callback) {
      await startWatch();
      context.watchListeners.push(callback);
      return async () => {
        context.watchListeners = context.watchListeners.filter(
          (listener) => listener !== callback
        );
        if (context.watchListeners.length === 0) {
          await stopWatch();
        }
      };
    },
    async unwatch() {
      context.watchListeners = [];
      await stopWatch();
    },
    // Mount
    mount(base, driver) {
      base = normalizeBaseKey(base);
      if (base && context.mounts[base]) {
        throw new Error(`already mounted at ${base}`);
      }
      if (base) {
        context.mountpoints.push(base);
        context.mountpoints.sort((a, b) => b.length - a.length);
      }
      context.mounts[base] = driver;
      if (context.watching) {
        Promise.resolve(watch(driver, onChange, base)).then((unwatcher) => {
          context.unwatch[base] = unwatcher;
        }).catch(console.error);
      }
      return storage;
    },
    async unmount(base, _dispose = true) {
      base = normalizeBaseKey(base);
      if (!base || !context.mounts[base]) {
        return;
      }
      if (context.watching && base in context.unwatch) {
        context.unwatch[base]?.();
        delete context.unwatch[base];
      }
      if (_dispose) {
        await dispose(context.mounts[base]);
      }
      context.mountpoints = context.mountpoints.filter((key) => key !== base);
      delete context.mounts[base];
    },
    getMount(key = "") {
      key = normalizeKey$1(key) + ":";
      const m = getMount(key);
      return {
        driver: m.driver,
        base: m.base
      };
    },
    getMounts(base = "", opts = {}) {
      base = normalizeKey$1(base);
      const mounts = getMounts(base, opts.parents);
      return mounts.map((m) => ({
        driver: m.driver,
        base: m.mountpoint
      }));
    },
    // Aliases
    keys: (base, opts = {}) => storage.getKeys(base, opts),
    get: (key, opts = {}) => storage.getItem(key, opts),
    set: (key, value, opts = {}) => storage.setItem(key, value, opts),
    has: (key, opts = {}) => storage.hasItem(key, opts),
    del: (key, opts = {}) => storage.removeItem(key, opts),
    remove: (key, opts = {}) => storage.removeItem(key, opts)
  };
  return storage;
}
function watch(driver, onChange, base) {
  return driver.watch ? driver.watch((event, key) => onChange(event, base + key)) : () => {
  };
}
async function dispose(driver) {
  if (typeof driver.dispose === "function") {
    await asyncCall(driver.dispose);
  }
}

const _assets = {

};

const normalizeKey = function normalizeKey(key) {
  if (!key) {
    return "";
  }
  return key.split("?")[0]?.replace(/[/\\]/g, ":").replace(/:+/g, ":").replace(/^:|:$/g, "") || "";
};

const assets$1 = {
  getKeys() {
    return Promise.resolve(Object.keys(_assets))
  },
  hasItem (id) {
    id = normalizeKey(id);
    return Promise.resolve(id in _assets)
  },
  getItem (id) {
    id = normalizeKey(id);
    return Promise.resolve(_assets[id] ? _assets[id].import() : null)
  },
  getMeta (id) {
    id = normalizeKey(id);
    return Promise.resolve(_assets[id] ? _assets[id].meta : {})
  }
};

function defineDriver(factory) {
  return factory;
}
function createError$1(driver, message, opts) {
  const err = new Error(`[unstorage] [${driver}] ${message}`, opts);
  if (Error.captureStackTrace) {
    Error.captureStackTrace(err, createError$1);
  }
  return err;
}
function createRequiredError(driver, name) {
  if (Array.isArray(name)) {
    return createError$1(
      driver,
      `Missing some of the required options ${name.map((n) => "`" + n + "`").join(", ")}`
    );
  }
  return createError$1(driver, `Missing required option \`${name}\`.`);
}

function ignoreNotfound(err) {
  return err.code === "ENOENT" || err.code === "EISDIR" ? null : err;
}
function ignoreExists(err) {
  return err.code === "EEXIST" ? null : err;
}
async function writeFile(path, data, encoding) {
  await ensuredir(dirname$1(path));
  return promises.writeFile(path, data, encoding);
}
function readFile(path, encoding) {
  return promises.readFile(path, encoding).catch(ignoreNotfound);
}
function unlink(path) {
  return promises.unlink(path).catch(ignoreNotfound);
}
function readdir(dir) {
  return promises.readdir(dir, { withFileTypes: true }).catch(ignoreNotfound).then((r) => r || []);
}
async function ensuredir(dir) {
  if (existsSync(dir)) {
    return;
  }
  await ensuredir(dirname$1(dir)).catch(ignoreExists);
  await promises.mkdir(dir).catch(ignoreExists);
}
async function readdirRecursive(dir, ignore, maxDepth) {
  if (ignore && ignore(dir)) {
    return [];
  }
  const entries = await readdir(dir);
  const files = [];
  await Promise.all(
    entries.map(async (entry) => {
      const entryPath = resolve$1(dir, entry.name);
      if (entry.isDirectory()) {
        if (maxDepth === void 0 || maxDepth > 0) {
          const dirFiles = await readdirRecursive(
            entryPath,
            ignore,
            maxDepth === void 0 ? void 0 : maxDepth - 1
          );
          files.push(...dirFiles.map((f) => entry.name + "/" + f));
        }
      } else {
        if (!(ignore && ignore(entry.name))) {
          files.push(entry.name);
        }
      }
    })
  );
  return files;
}
async function rmRecursive(dir) {
  const entries = await readdir(dir);
  await Promise.all(
    entries.map((entry) => {
      const entryPath = resolve$1(dir, entry.name);
      if (entry.isDirectory()) {
        return rmRecursive(entryPath).then(() => promises.rmdir(entryPath));
      } else {
        return promises.unlink(entryPath);
      }
    })
  );
}

const PATH_TRAVERSE_RE = /\.\.:|\.\.$/;
const DRIVER_NAME = "fs-lite";
const unstorage_47drivers_47fs_45lite = defineDriver((opts = {}) => {
  if (!opts.base) {
    throw createRequiredError(DRIVER_NAME, "base");
  }
  opts.base = resolve$1(opts.base);
  const r = (key) => {
    if (PATH_TRAVERSE_RE.test(key)) {
      throw createError$1(
        DRIVER_NAME,
        `Invalid key: ${JSON.stringify(key)}. It should not contain .. segments`
      );
    }
    const resolved = join(opts.base, key.replace(/:/g, "/"));
    return resolved;
  };
  return {
    name: DRIVER_NAME,
    options: opts,
    flags: {
      maxDepth: true
    },
    hasItem(key) {
      return existsSync(r(key));
    },
    getItem(key) {
      return readFile(r(key), "utf8");
    },
    getItemRaw(key) {
      return readFile(r(key));
    },
    async getMeta(key) {
      const { atime, mtime, size, birthtime, ctime } = await promises.stat(r(key)).catch(() => ({}));
      return { atime, mtime, size, birthtime, ctime };
    },
    setItem(key, value) {
      if (opts.readOnly) {
        return;
      }
      return writeFile(r(key), value, "utf8");
    },
    setItemRaw(key, value) {
      if (opts.readOnly) {
        return;
      }
      return writeFile(r(key), value);
    },
    removeItem(key) {
      if (opts.readOnly) {
        return;
      }
      return unlink(r(key));
    },
    getKeys(_base, topts) {
      return readdirRecursive(r("."), opts.ignore, topts?.maxDepth);
    },
    async clear() {
      if (opts.readOnly || opts.noClear) {
        return;
      }
      await rmRecursive(r("."));
    }
  };
});

const storage = createStorage({});

storage.mount('/assets', assets$1);

storage.mount('data', unstorage_47drivers_47fs_45lite({"driver":"fsLite","base":"./.data/kv"}));

function useStorage(base = "") {
  return base ? prefixStorage(storage, base) : storage;
}

const e=globalThis.process?.getBuiltinModule?.("crypto")?.hash,r="sha256",s="base64url";function digest(t){if(e)return e(r,t,s);const o=createHash(r).update(t);return globalThis.process?.versions?.webcontainer?o.digest().toString(s):o.digest(s)}

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
function serialize$1(object) {
  const hasher = new Hasher();
  hasher.dispatch(object);
  return hasher.buff;
}
function hash(value) {
  return digest(typeof value === "string" ? value : serialize$1(value)).replace(/[-_]/g, "").slice(0, 10);
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
  return defineEventHandler$1(async (event) => {
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
          splitCookiesString$1(value)
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

function klona(x) {
	if (typeof x !== 'object') return x;

	var k, tmp, str=Object.prototype.toString.call(x);

	if (str === '[object Object]') {
		if (x.constructor !== Object && typeof x.constructor === 'function') {
			tmp = new x.constructor();
			for (k in x) {
				if (x.hasOwnProperty(k) && tmp[k] !== x[k]) {
					tmp[k] = klona(x[k]);
				}
			}
		} else {
			tmp = {}; // null
			for (k in x) {
				if (k === '__proto__') {
					Object.defineProperty(tmp, k, {
						value: klona(x[k]),
						configurable: true,
						enumerable: true,
						writable: true,
					});
				} else {
					tmp[k] = klona(x[k]);
				}
			}
		}
		return tmp;
	}

	if (str === '[object Array]') {
		k = x.length;
		for (tmp=Array(k); k--;) {
			tmp[k] = klona(x[k]);
		}
		return tmp;
	}

	if (str === '[object Set]') {
		tmp = new Set;
		x.forEach(function (val) {
			tmp.add(klona(val));
		});
		return tmp;
	}

	if (str === '[object Map]') {
		tmp = new Map;
		x.forEach(function (val, key) {
			tmp.set(klona(key), klona(val));
		});
		return tmp;
	}

	if (str === '[object Date]') {
		return new Date(+x);
	}

	if (str === '[object RegExp]') {
		tmp = new RegExp(x.source, x.flags);
		tmp.lastIndex = x.lastIndex;
		return tmp;
	}

	if (str === '[object DataView]') {
		return new x.constructor( klona(x.buffer) );
	}

	if (str === '[object ArrayBuffer]') {
		return x.slice(0);
	}

	// ArrayBuffer.isView(x)
	// ~> `new` bcuz `Buffer.slice` => ref
	if (str.slice(-6) === 'Array]') {
		return new x.constructor(x);
	}

	return x;
}

const inlineAppConfig = {};



const appConfig$1 = defuFn(inlineAppConfig);

const NUMBER_CHAR_RE = /\d/;
const STR_SPLITTERS = ["-", "_", "/", "."];
function isUppercase(char = "") {
  if (NUMBER_CHAR_RE.test(char)) {
    return void 0;
  }
  return char !== char.toLowerCase();
}
function splitByCase(str, separators) {
  const splitters = STR_SPLITTERS;
  const parts = [];
  if (!str || typeof str !== "string") {
    return parts;
  }
  let buff = "";
  let previousUpper;
  let previousSplitter;
  for (const char of str) {
    const isSplitter = splitters.includes(char);
    if (isSplitter === true) {
      parts.push(buff);
      buff = "";
      previousUpper = void 0;
      continue;
    }
    const isUpper = isUppercase(char);
    if (previousSplitter === false) {
      if (previousUpper === false && isUpper === true) {
        parts.push(buff);
        buff = char;
        previousUpper = isUpper;
        continue;
      }
      if (previousUpper === true && isUpper === false && buff.length > 1) {
        const lastChar = buff.at(-1);
        parts.push(buff.slice(0, Math.max(0, buff.length - 1)));
        buff = lastChar + char;
        previousUpper = isUpper;
        continue;
      }
    }
    buff += char;
    previousUpper = isUpper;
    previousSplitter = isSplitter;
  }
  parts.push(buff);
  return parts;
}
function kebabCase(str, joiner) {
  return str ? (Array.isArray(str) ? str : splitByCase(str)).map((p) => p.toLowerCase()).join(joiner) : "";
}
function snakeCase(str) {
  return kebabCase(str || "", "_");
}

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

function createContext(opts = {}) {
  let currentInstance;
  let isSingleton = false;
  const checkConflict = (instance) => {
    if (currentInstance && currentInstance !== instance) {
      throw new Error("Context conflict");
    }
  };
  let als;
  if (opts.asyncContext) {
    const _AsyncLocalStorage = opts.AsyncLocalStorage || globalThis.AsyncLocalStorage;
    if (_AsyncLocalStorage) {
      als = new _AsyncLocalStorage();
    } else {
      console.warn("[unctx] `AsyncLocalStorage` is not provided.");
    }
  }
  const _getCurrentInstance = () => {
    if (als) {
      const instance = als.getStore();
      if (instance !== void 0) {
        return instance;
      }
    }
    return currentInstance;
  };
  return {
    use: () => {
      const _instance = _getCurrentInstance();
      if (_instance === void 0) {
        throw new Error("Context is not available");
      }
      return _instance;
    },
    tryUse: () => {
      return _getCurrentInstance();
    },
    set: (instance, replace) => {
      if (!replace) {
        checkConflict(instance);
      }
      currentInstance = instance;
      isSingleton = true;
    },
    unset: () => {
      currentInstance = void 0;
      isSingleton = false;
    },
    call: (instance, callback) => {
      checkConflict(instance);
      currentInstance = instance;
      try {
        return als ? als.run(instance, callback) : callback();
      } finally {
        if (!isSingleton) {
          currentInstance = void 0;
        }
      }
    },
    async callAsync(instance, callback) {
      currentInstance = instance;
      const onRestore = () => {
        currentInstance = instance;
      };
      const onLeave = () => currentInstance === instance ? onRestore : void 0;
      asyncHandlers.add(onLeave);
      try {
        const r = als ? als.run(instance, callback) : callback();
        if (!isSingleton) {
          currentInstance = void 0;
        }
        return await r;
      } finally {
        asyncHandlers.delete(onLeave);
      }
    }
  };
}
function createNamespace(defaultOpts = {}) {
  const contexts = {};
  return {
    get(key, opts = {}) {
      if (!contexts[key]) {
        contexts[key] = createContext({ ...defaultOpts, ...opts });
      }
      return contexts[key];
    }
  };
}
const _globalThis = typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : typeof global !== "undefined" ? global : {};
const globalKey = "__unctx__";
const defaultNamespace = _globalThis[globalKey] || (_globalThis[globalKey] = createNamespace());
const getContext = (key, opts = {}) => defaultNamespace.get(key, opts);
const asyncHandlersKey = "__unctx_async_handlers__";
const asyncHandlers = _globalThis[asyncHandlersKey] || (_globalThis[asyncHandlersKey] = /* @__PURE__ */ new Set());

const nitroAsyncContext = getContext("nitro-app", {
  asyncContext: true,
  AsyncLocalStorage: AsyncLocalStorage 
});

const config = useRuntimeConfig();
const _routeRulesMatcher = toRouteMatcher(
  createRouter$1({ routes: config.nitro.routeRules })
);
function createRouteRulesHandler(ctx) {
  return eventHandler$1((event) => {
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
      return sendRedirect$1(event, target, routeRules.redirect.statusCode);
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
  return splitCookiesString$1(joinHeaders(header));
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
    setResponseStatus$1(event, res.status, res.statusText);
    return send$1(event, JSON.stringify(res.body, null, 2));
  }
);
function defaultHandler(error, event, opts) {
  const isSensitive = error.unhandled || error.fatal;
  const statusCode = error.statusCode || 500;
  const statusMessage = error.statusMessage || "Server Error";
  const url = getRequestURL$1(event, { xForwardedHost: true, xForwardedProto: true });
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
  setResponseStatus$1(event, statusCode, statusMessage);
  if (statusCode === 404 || !getResponseHeader$1(event, "cache-control")) {
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

const appConfig = {"name":"vinxi","routers":[{"name":"public","type":"static","base":"/","dir":"./public","root":"/Users/david/Documents/Projects/network-monitor/apps/web","order":0,"outDir":"/Users/david/Documents/Projects/network-monitor/apps/web/.vinxi/build/public"},{"name":"ssr","type":"http","link":{"client":"client"},"handler":"src/entry-server.tsx","extensions":["js","jsx","ts","tsx"],"target":"server","root":"/Users/david/Documents/Projects/network-monitor/apps/web","base":"/","outDir":"/Users/david/Documents/Projects/network-monitor/apps/web/.vinxi/build/ssr","order":1},{"name":"client","type":"client","base":"/_build","handler":"src/entry-client.tsx","extensions":["js","jsx","ts","tsx"],"target":"browser","root":"/Users/david/Documents/Projects/network-monitor/apps/web","outDir":"/Users/david/Documents/Projects/network-monitor/apps/web/.vinxi/build/client","order":2},{"name":"server-fns","type":"http","base":"/_server","handler":"../../node_modules/@solidjs/start/dist/runtime/server-handler.js","target":"server","root":"/Users/david/Documents/Projects/network-monitor/apps/web","outDir":"/Users/david/Documents/Projects/network-monitor/apps/web/.vinxi/build/server-fns","order":3}],"server":{"compressPublicAssets":{"brotli":true},"routeRules":{"/_build/assets/**":{"headers":{"cache-control":"public, immutable, max-age=31536000"}}},"experimental":{"asyncContext":true},"preset":"node-server"},"root":"/Users/david/Documents/Projects/network-monitor/apps/web"};
				const buildManifest = {"ssr":{"_TargetCard-Bjgo4gzU.js":{"file":"assets/TargetCard-Bjgo4gzU.js","name":"TargetCard"},"_UptimeChart-BZZNTZjd.js":{"file":"assets/UptimeChart-BZZNTZjd.js","name":"UptimeChart","imports":["_container-B_MuS2rR.js"]},"_container-B_MuS2rR.js":{"file":"assets/container-B_MuS2rR.js","name":"container","imports":["_container-M4kA0Lpj.js"]},"_container-M4kA0Lpj.js":{"file":"assets/container-M4kA0Lpj.js","name":"container"},"_router-BzsHK-V0.js":{"file":"assets/router-BzsHK-V0.js","name":"router","imports":["_container-M4kA0Lpj.js"]},"src/routes/alerts.tsx?pick=default&pick=$css":{"file":"alerts.js","name":"alerts","src":"src/routes/alerts.tsx?pick=default&pick=$css","isEntry":true,"isDynamicEntry":true,"imports":["_container-B_MuS2rR.js","_UptimeChart-BZZNTZjd.js","_container-M4kA0Lpj.js"]},"src/routes/api/trpc/[...trpc].ts?pick=GET":{"file":"_...trpc_.js","name":"_...trpc_","src":"src/routes/api/trpc/[...trpc].ts?pick=GET","isEntry":true,"isDynamicEntry":true,"imports":["_router-BzsHK-V0.js","_container-M4kA0Lpj.js"]},"src/routes/api/trpc/[...trpc].ts?pick=POST":{"file":"_...trpc_2.js","name":"_...trpc_","src":"src/routes/api/trpc/[...trpc].ts?pick=POST","isEntry":true,"isDynamicEntry":true,"imports":["_router-BzsHK-V0.js","_container-M4kA0Lpj.js"]},"src/routes/charts.tsx?pick=default&pick=$css":{"file":"charts.js","name":"charts","src":"src/routes/charts.tsx?pick=default&pick=$css","isEntry":true,"isDynamicEntry":true,"imports":["_container-B_MuS2rR.js","_UptimeChart-BZZNTZjd.js","_container-M4kA0Lpj.js"]},"src/routes/index.tsx?pick=default&pick=$css":{"file":"index.js","name":"index","src":"src/routes/index.tsx?pick=default&pick=$css","isEntry":true,"isDynamicEntry":true,"imports":["_UptimeChart-BZZNTZjd.js","_container-B_MuS2rR.js","_TargetCard-Bjgo4gzU.js","_container-M4kA0Lpj.js"]},"src/routes/notifications.tsx?pick=default&pick=$css":{"file":"notifications.js","name":"notifications","src":"src/routes/notifications.tsx?pick=default&pick=$css","isEntry":true,"isDynamicEntry":true,"imports":["_container-B_MuS2rR.js","_UptimeChart-BZZNTZjd.js","_container-M4kA0Lpj.js"]},"src/routes/settings.tsx?pick=default&pick=$css":{"file":"settings.js","name":"settings","src":"src/routes/settings.tsx?pick=default&pick=$css","isEntry":true,"isDynamicEntry":true,"imports":["_container-B_MuS2rR.js","_UptimeChart-BZZNTZjd.js","_container-M4kA0Lpj.js"]},"src/routes/targets.tsx?pick=default&pick=$css":{"file":"targets.js","name":"targets","src":"src/routes/targets.tsx?pick=default&pick=$css","isEntry":true,"isDynamicEntry":true,"imports":["_container-B_MuS2rR.js","_UptimeChart-BZZNTZjd.js","_TargetCard-Bjgo4gzU.js","_container-M4kA0Lpj.js"]},"virtual:$vinxi/handler/ssr":{"file":"ssr.js","name":"ssr","src":"virtual:$vinxi/handler/ssr","isEntry":true,"imports":["_container-B_MuS2rR.js","_container-M4kA0Lpj.js"],"dynamicImports":["src/routes/alerts.tsx?pick=default&pick=$css","src/routes/alerts.tsx?pick=default&pick=$css","src/routes/charts.tsx?pick=default&pick=$css","src/routes/charts.tsx?pick=default&pick=$css","src/routes/index.tsx?pick=default&pick=$css","src/routes/index.tsx?pick=default&pick=$css","src/routes/notifications.tsx?pick=default&pick=$css","src/routes/notifications.tsx?pick=default&pick=$css","src/routes/settings.tsx?pick=default&pick=$css","src/routes/settings.tsx?pick=default&pick=$css","src/routes/targets.tsx?pick=default&pick=$css","src/routes/targets.tsx?pick=default&pick=$css","src/routes/api/trpc/[...trpc].ts?pick=GET","src/routes/api/trpc/[...trpc].ts?pick=GET","src/routes/api/trpc/[...trpc].ts?pick=GET","src/routes/api/trpc/[...trpc].ts?pick=GET","src/routes/api/trpc/[...trpc].ts?pick=POST","src/routes/api/trpc/[...trpc].ts?pick=POST"],"css":["assets/ssr-BjoaO50o.css"]}},"client":{"_TestNotificationModal-DPOtCcZx.js":{"file":"assets/TestNotificationModal-DPOtCcZx.js","name":"TestNotificationModal","imports":["___vite-browser-external-CFGrbMLL.js"]},"___vite-browser-external-CFGrbMLL.js":{"file":"assets/__vite-browser-external-CFGrbMLL.js","name":"__vite-browser-external"},"src/routes/alerts.tsx?pick=default&pick=$css":{"file":"assets/alerts-BjWkF2SU.js","name":"alerts","src":"src/routes/alerts.tsx?pick=default&pick=$css","isEntry":true,"isDynamicEntry":true,"imports":["___vite-browser-external-CFGrbMLL.js","_TestNotificationModal-DPOtCcZx.js"]},"src/routes/charts.tsx?pick=default&pick=$css":{"file":"assets/charts-BIPiX63h.js","name":"charts","src":"src/routes/charts.tsx?pick=default&pick=$css","isEntry":true,"isDynamicEntry":true,"imports":["___vite-browser-external-CFGrbMLL.js","_TestNotificationModal-DPOtCcZx.js"]},"src/routes/index.tsx?pick=default&pick=$css":{"file":"assets/index-DEYiQ7KU.js","name":"index","src":"src/routes/index.tsx?pick=default&pick=$css","isEntry":true,"isDynamicEntry":true,"imports":["_TestNotificationModal-DPOtCcZx.js","___vite-browser-external-CFGrbMLL.js"]},"src/routes/notifications.tsx?pick=default&pick=$css":{"file":"assets/notifications-BveZLvMJ.js","name":"notifications","src":"src/routes/notifications.tsx?pick=default&pick=$css","isEntry":true,"isDynamicEntry":true,"imports":["___vite-browser-external-CFGrbMLL.js","_TestNotificationModal-DPOtCcZx.js"]},"src/routes/settings.tsx?pick=default&pick=$css":{"file":"assets/settings-D5NMsFtN.js","name":"settings","src":"src/routes/settings.tsx?pick=default&pick=$css","isEntry":true,"isDynamicEntry":true,"imports":["___vite-browser-external-CFGrbMLL.js","_TestNotificationModal-DPOtCcZx.js"]},"src/routes/targets.tsx?pick=default&pick=$css":{"file":"assets/targets-CP5rXuul.js","name":"targets","src":"src/routes/targets.tsx?pick=default&pick=$css","isEntry":true,"isDynamicEntry":true,"imports":["___vite-browser-external-CFGrbMLL.js","_TestNotificationModal-DPOtCcZx.js"]},"virtual:$vinxi/handler/client":{"file":"assets/client-Cg-JdxCZ.js","name":"client","src":"virtual:$vinxi/handler/client","isEntry":true,"imports":["___vite-browser-external-CFGrbMLL.js"],"dynamicImports":["src/routes/alerts.tsx?pick=default&pick=$css","src/routes/charts.tsx?pick=default&pick=$css","src/routes/index.tsx?pick=default&pick=$css","src/routes/notifications.tsx?pick=default&pick=$css","src/routes/settings.tsx?pick=default&pick=$css","src/routes/targets.tsx?pick=default&pick=$css"],"css":["assets/client-BjoaO50o.css"]}},"server-fns":{"_TargetCard-Bjgo4gzU.js":{"file":"assets/TargetCard-Bjgo4gzU.js","name":"TargetCard"},"_UptimeChart-Cg1W-4dT.js":{"file":"assets/UptimeChart-Cg1W-4dT.js","name":"UptimeChart","imports":["_routing-BuvachQx.js"]},"_container-L2LlDb0s.js":{"file":"assets/container-L2LlDb0s.js","name":"container"},"_router-DHVY9RUY.js":{"file":"assets/router-DHVY9RUY.js","name":"router","imports":["_container-L2LlDb0s.js"]},"_routing-BuvachQx.js":{"file":"assets/routing-BuvachQx.js","name":"routing","imports":["_container-L2LlDb0s.js"]},"_server-fns-DJA2HZf-.js":{"file":"assets/server-fns-DJA2HZf-.js","name":"server-fns","dynamicImports":["src/routes/alerts.tsx?pick=default&pick=$css","src/routes/alerts.tsx?pick=default&pick=$css","src/routes/charts.tsx?pick=default&pick=$css","src/routes/charts.tsx?pick=default&pick=$css","src/routes/index.tsx?pick=default&pick=$css","src/routes/index.tsx?pick=default&pick=$css","src/routes/notifications.tsx?pick=default&pick=$css","src/routes/notifications.tsx?pick=default&pick=$css","src/routes/settings.tsx?pick=default&pick=$css","src/routes/settings.tsx?pick=default&pick=$css","src/routes/targets.tsx?pick=default&pick=$css","src/routes/targets.tsx?pick=default&pick=$css","src/routes/api/trpc/[...trpc].ts?pick=GET","src/routes/api/trpc/[...trpc].ts?pick=GET","src/routes/api/trpc/[...trpc].ts?pick=GET","src/routes/api/trpc/[...trpc].ts?pick=GET","src/routes/api/trpc/[...trpc].ts?pick=POST","src/routes/api/trpc/[...trpc].ts?pick=POST","src/app.tsx"]},"src/app.tsx":{"file":"assets/app-QiOgf4yA.js","name":"app","src":"src/app.tsx","isDynamicEntry":true,"imports":["_server-fns-DJA2HZf-.js","_routing-BuvachQx.js","_container-L2LlDb0s.js"],"css":["assets/app-BjoaO50o.css"]},"src/routes/alerts.tsx?pick=default&pick=$css":{"file":"alerts.js","name":"alerts","src":"src/routes/alerts.tsx?pick=default&pick=$css","isEntry":true,"isDynamicEntry":true,"imports":["_routing-BuvachQx.js","_UptimeChart-Cg1W-4dT.js","_container-L2LlDb0s.js"]},"src/routes/api/trpc/[...trpc].ts?pick=GET":{"file":"_...trpc_.js","name":"_...trpc_","src":"src/routes/api/trpc/[...trpc].ts?pick=GET","isEntry":true,"isDynamicEntry":true,"imports":["_router-DHVY9RUY.js","_container-L2LlDb0s.js"]},"src/routes/api/trpc/[...trpc].ts?pick=POST":{"file":"_...trpc_2.js","name":"_...trpc_","src":"src/routes/api/trpc/[...trpc].ts?pick=POST","isEntry":true,"isDynamicEntry":true,"imports":["_router-DHVY9RUY.js","_container-L2LlDb0s.js"]},"src/routes/charts.tsx?pick=default&pick=$css":{"file":"charts.js","name":"charts","src":"src/routes/charts.tsx?pick=default&pick=$css","isEntry":true,"isDynamicEntry":true,"imports":["_routing-BuvachQx.js","_UptimeChart-Cg1W-4dT.js","_container-L2LlDb0s.js"]},"src/routes/index.tsx?pick=default&pick=$css":{"file":"index.js","name":"index","src":"src/routes/index.tsx?pick=default&pick=$css","isEntry":true,"isDynamicEntry":true,"imports":["_UptimeChart-Cg1W-4dT.js","_routing-BuvachQx.js","_TargetCard-Bjgo4gzU.js","_container-L2LlDb0s.js"]},"src/routes/notifications.tsx?pick=default&pick=$css":{"file":"notifications.js","name":"notifications","src":"src/routes/notifications.tsx?pick=default&pick=$css","isEntry":true,"isDynamicEntry":true,"imports":["_routing-BuvachQx.js","_UptimeChart-Cg1W-4dT.js","_container-L2LlDb0s.js"]},"src/routes/settings.tsx?pick=default&pick=$css":{"file":"settings.js","name":"settings","src":"src/routes/settings.tsx?pick=default&pick=$css","isEntry":true,"isDynamicEntry":true,"imports":["_routing-BuvachQx.js","_UptimeChart-Cg1W-4dT.js","_container-L2LlDb0s.js"]},"src/routes/targets.tsx?pick=default&pick=$css":{"file":"targets.js","name":"targets","src":"src/routes/targets.tsx?pick=default&pick=$css","isEntry":true,"isDynamicEntry":true,"imports":["_routing-BuvachQx.js","_UptimeChart-Cg1W-4dT.js","_TargetCard-Bjgo4gzU.js","_container-L2LlDb0s.js"]},"virtual:$vinxi/handler/server-fns":{"file":"server-fns.js","name":"server-fns","src":"virtual:$vinxi/handler/server-fns","isEntry":true,"imports":["_server-fns-DJA2HZf-.js"]}}};

				const routeManifest = {"ssr":{},"client":{},"server-fns":{}};

        function createProdApp(appConfig) {
          return {
            config: { ...appConfig, buildManifest, routeManifest },
            getRouter(name) {
              return appConfig.routers.find(router => router.name === name)
            }
          }
        }

        function plugin$2(app) {
          const prodApp = createProdApp(appConfig);
          globalThis.app = prodApp;
        }

function plugin$1(app) {
	globalThis.$handle = (event) => app.h3App.handler(event);
}

/**
 * Traverses the module graph and collects assets for a given chunk
 *
 * @param {any} manifest Client manifest
 * @param {string} id Chunk id
 * @param {Map<string, string[]>} assetMap Cache of assets
 * @param {string[]} stack Stack of chunk ids to prevent circular dependencies
 * @returns Array of asset URLs
 */
function findAssetsInViteManifest(manifest, id, assetMap = new Map(), stack = []) {
	if (stack.includes(id)) {
		return [];
	}

	const cached = assetMap.get(id);
	if (cached) {
		return cached;
	}
	const chunk = manifest[id];
	if (!chunk) {
		return [];
	}

	const assets = [
		...(chunk.assets?.filter(Boolean) || []),
		...(chunk.css?.filter(Boolean) || [])
	];
	if (chunk.imports) {
		stack.push(id);
		for (let i = 0, l = chunk.imports.length; i < l; i++) {
			assets.push(...findAssetsInViteManifest(manifest, chunk.imports[i], assetMap, stack));
		}
		stack.pop();
	}
	assets.push(chunk.file);
	const all = Array.from(new Set(assets));
	assetMap.set(id, all);

	return all;
}

/** @typedef {import("../app.js").App & { config: { buildManifest: { [key:string]: any } }}} ProdApp */

function createHtmlTagsForAssets(router, app, assets) {
	return assets
		.filter(
			(asset) =>
				asset.endsWith(".css") ||
				asset.endsWith(".js") ||
				asset.endsWith(".mjs"),
		)
		.map((asset) => ({
			tag: "link",
			attrs: {
				href: joinURL(app.config.server.baseURL ?? "/", router.base, asset),
				key: join$1(app.config.server.baseURL ?? "", router.base, asset),
				...(asset.endsWith(".css")
					? { rel: "stylesheet", fetchPriority: "high" }
					: { rel: "modulepreload" }),
			},
		}));
}

/**
 *
 * @param {ProdApp} app
 * @returns
 */
function createProdManifest(app) {
	const manifest = new Proxy(
		{},
		{
			get(target, routerName) {
				invariant(typeof routerName === "string", "Bundler name expected");
				const router = app.getRouter(routerName);
				const bundlerManifest = app.config.buildManifest[routerName];

				invariant(
					router.type !== "static",
					"manifest not available for static router",
				);
				return {
					handler: router.handler,
					async assets() {
						/** @type {{ [key: string]: string[] }} */
						let assets = {};
						assets[router.handler] = await this.inputs[router.handler].assets();
						for (const route of (await router.internals.routes?.getRoutes()) ??
							[]) {
							assets[route.filePath] = await this.inputs[
								route.filePath
							].assets();
						}
						return assets;
					},
					async routes() {
						return (await router.internals.routes?.getRoutes()) ?? [];
					},
					async json() {
						/** @type {{ [key: string]: { output: string; assets: string[]} }} */
						let json = {};
						for (const input of Object.keys(this.inputs)) {
							json[input] = {
								output: this.inputs[input].output.path,
								assets: await this.inputs[input].assets(),
							};
						}
						return json;
					},
					chunks: new Proxy(
						{},
						{
							get(target, chunk) {
								invariant(typeof chunk === "string", "Chunk expected");
								const chunkPath = join$1(
									router.outDir,
									router.base,
									chunk + ".mjs",
								);
								return {
									import() {
										if (globalThis.$$chunks[chunk + ".mjs"]) {
											return globalThis.$$chunks[chunk + ".mjs"];
										}
										return import(
											/* @vite-ignore */ pathToFileURL(chunkPath).href
										);
									},
									output: {
										path: chunkPath,
									},
								};
							},
						},
					),
					inputs: new Proxy(
						{},
						{
							ownKeys(target) {
								const keys = Object.keys(bundlerManifest)
									.filter((id) => bundlerManifest[id].isEntry)
									.map((id) => id);
								return keys;
							},
							getOwnPropertyDescriptor(k) {
								return {
									enumerable: true,
									configurable: true,
								};
							},
							get(target, input) {
								invariant(typeof input === "string", "Input expected");
								if (router.target === "server") {
									const id =
										input === router.handler
											? virtualId(handlerModule(router))
											: input;
									return {
										assets() {
											return createHtmlTagsForAssets(
												router,
												app,
												findAssetsInViteManifest(bundlerManifest, id),
											);
										},
										output: {
											path: join$1(
												router.outDir,
												router.base,
												bundlerManifest[id].file,
											),
										},
									};
								} else if (router.target === "browser") {
									const id =
										input === router.handler && !input.endsWith(".html")
											? virtualId(handlerModule(router))
											: input;
									return {
										import() {
											return import(
												/* @vite-ignore */ joinURL(
													app.config.server.baseURL ?? "",
													router.base,
													bundlerManifest[id].file,
												)
											);
										},
										assets() {
											return createHtmlTagsForAssets(
												router,
												app,
												findAssetsInViteManifest(bundlerManifest, id),
											);
										},
										output: {
											path: joinURL(
												app.config.server.baseURL ?? "",
												router.base,
												bundlerManifest[id].file,
											),
										},
									};
								}
							},
						},
					),
				};
			},
		},
	);

	return manifest;
}

function plugin() {
	globalThis.MANIFEST =
		createProdManifest(globalThis.app)
			;
}

const chunks = {};
			 



			 function app() {
				 globalThis.$$chunks = chunks;
			 }

const plugins = [
  plugin$2,
plugin$1,
plugin,
app
];

const assets = {
  "/assets/TargetCard-Bjgo4gzU.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"4a1-gofeK281p8VRuSnOXJ7A6/cMmLI\"",
    "mtime": "2025-10-01T20:13:06.399Z",
    "size": 1185,
    "path": "../public/assets/TargetCard-Bjgo4gzU.js.br"
  },
  "/assets/TargetCard-Bjgo4gzU.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"552-dE2A4LbjJUxYTbgnztk50jXv1EE\"",
    "mtime": "2025-10-01T20:13:06.399Z",
    "size": 1362,
    "path": "../public/assets/TargetCard-Bjgo4gzU.js.gz"
  },
  "/assets/UptimeChart-BZZNTZjd.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"976-JiwXIiTfWzzg3v3SH9ERogqdN0U\"",
    "mtime": "2025-10-01T20:13:06.399Z",
    "size": 2422,
    "path": "../public/assets/UptimeChart-BZZNTZjd.js.br"
  },
  "/assets/UptimeChart-BZZNTZjd.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"ad5-KMaQVsJkBe7k2fHY3tJ2Bopwaig\"",
    "mtime": "2025-10-01T20:13:06.399Z",
    "size": 2773,
    "path": "../public/assets/UptimeChart-BZZNTZjd.js.gz"
  },
  "/assets/container-B_MuS2rR.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"16b1-JljFenZxUnbIsnF1ml0n4dnzI9A\"",
    "mtime": "2025-10-01T20:13:06.399Z",
    "size": 5809,
    "path": "../public/assets/container-B_MuS2rR.js.br"
  },
  "/assets/container-B_MuS2rR.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"1956-oXqPojYn6gt/s5a25ApN5PATvXs\"",
    "mtime": "2025-10-01T20:13:06.399Z",
    "size": 6486,
    "path": "../public/assets/container-B_MuS2rR.js.gz"
  },
  "/assets/container-M4kA0Lpj.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"f34-h9NcryOW8jUajSku3+0LP5MZaow\"",
    "mtime": "2025-10-01T20:13:06.399Z",
    "size": 3892,
    "path": "../public/assets/container-M4kA0Lpj.js.br"
  },
  "/assets/container-M4kA0Lpj.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"1110-J6Jm17PP0xEFuR6V3hfTFf5Cv6U\"",
    "mtime": "2025-10-01T20:13:06.399Z",
    "size": 4368,
    "path": "../public/assets/container-M4kA0Lpj.js.gz"
  },
  "/assets/router-BzsHK-V0.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"733-zDWwdHBnBAWTX5/9VlkVEeHJkYs\"",
    "mtime": "2025-10-01T20:13:06.399Z",
    "size": 1843,
    "path": "../public/assets/router-BzsHK-V0.js.br"
  },
  "/assets/router-BzsHK-V0.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"831-Wo9GVYUxQCivJ0CNupdAFczndh4\"",
    "mtime": "2025-10-01T20:13:06.399Z",
    "size": 2097,
    "path": "../public/assets/router-BzsHK-V0.js.gz"
  },
  "/assets/ssr-BjoaO50o.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"2202-ygL4IXs5/vgBxlP62V7HPkPOxds\"",
    "mtime": "2025-10-01T20:13:06.335Z",
    "size": 8706,
    "path": "../public/assets/ssr-BjoaO50o.css"
  },
  "/assets/ssr-BjoaO50o.css.br": {
    "type": "text/css; charset=utf-8",
    "encoding": "br",
    "etag": "\"8e1-HSY0FmU8JRIt0cSKfDV/gEkyPXU\"",
    "mtime": "2025-10-01T20:13:06.399Z",
    "size": 2273,
    "path": "../public/assets/ssr-BjoaO50o.css.br"
  },
  "/assets/ssr-BjoaO50o.css.gz": {
    "type": "text/css; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"a5f-gTch4uEXODYLZQjFBi8lfhzrEHs\"",
    "mtime": "2025-10-01T20:13:06.399Z",
    "size": 2655,
    "path": "../public/assets/ssr-BjoaO50o.css.gz"
  },
  "/_build/.vite/manifest.json": {
    "type": "application/json",
    "etag": "\"c0f-1XntZdjpDaYez9yYfxndeRIU7RA\"",
    "mtime": "2025-10-01T20:13:06.338Z",
    "size": 3087,
    "path": "../public/_build/.vite/manifest.json"
  },
  "/_build/.vite/manifest.json.br": {
    "type": "application/json",
    "encoding": "br",
    "etag": "\"1b8-K9E3G6y5WR55DsM9j77B8U6kl5I\"",
    "mtime": "2025-10-01T20:13:06.400Z",
    "size": 440,
    "path": "../public/_build/.vite/manifest.json.br"
  },
  "/_build/.vite/manifest.json.gz": {
    "type": "application/json",
    "encoding": "gzip",
    "etag": "\"1fc-zSbK3aYpFoRzdBIcAsAvV2WkDKM\"",
    "mtime": "2025-10-01T20:13:06.400Z",
    "size": 508,
    "path": "../public/_build/.vite/manifest.json.gz"
  },
  "/_build/assets/TestNotificationModal-DPOtCcZx.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"defd-6A+fXV4/nPAVsJYiR4esWH7NpO8\"",
    "mtime": "2025-10-01T20:13:06.338Z",
    "size": 57085,
    "path": "../public/_build/assets/TestNotificationModal-DPOtCcZx.js"
  },
  "/_build/assets/TestNotificationModal-DPOtCcZx.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"2afa-Xp9A8zz8LjlkuviZZFJ/A8t9s9Q\"",
    "mtime": "2025-10-01T20:13:06.413Z",
    "size": 11002,
    "path": "../public/_build/assets/TestNotificationModal-DPOtCcZx.js.br"
  },
  "/_build/assets/TestNotificationModal-DPOtCcZx.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"323e-pe37hNqQpy919xzYV+orvHuawZc\"",
    "mtime": "2025-10-01T20:13:06.400Z",
    "size": 12862,
    "path": "../public/_build/assets/TestNotificationModal-DPOtCcZx.js.gz"
  },
  "/_build/assets/__vite-browser-external-CFGrbMLL.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"3ffb6-nGAvzwbS92eg3E4KLyvKXEOuqRs\"",
    "mtime": "2025-10-01T20:13:06.338Z",
    "size": 262070,
    "path": "../public/_build/assets/__vite-browser-external-CFGrbMLL.js"
  },
  "/_build/assets/__vite-browser-external-CFGrbMLL.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"12a04-u9gMelx5VfmJhf+fcxTCf6W7Wdg\"",
    "mtime": "2025-10-01T20:13:06.664Z",
    "size": 76292,
    "path": "../public/_build/assets/__vite-browser-external-CFGrbMLL.js.br"
  },
  "/_build/assets/__vite-browser-external-CFGrbMLL.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"15507-BmR9ft9j/kkdXFGHpuUrDXNj+JI\"",
    "mtime": "2025-10-01T20:13:06.404Z",
    "size": 87303,
    "path": "../public/_build/assets/__vite-browser-external-CFGrbMLL.js.gz"
  },
  "/_build/assets/alerts-BjWkF2SU.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1405-wyfwO5CRCSBtRYUQwDcH+QMNyOI\"",
    "mtime": "2025-10-01T20:13:06.338Z",
    "size": 5125,
    "path": "../public/_build/assets/alerts-BjWkF2SU.js"
  },
  "/_build/assets/alerts-BjWkF2SU.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"64d-CoNnfYwgIfpLeFbTsdIxXAb+K9g\"",
    "mtime": "2025-10-01T20:13:06.400Z",
    "size": 1613,
    "path": "../public/_build/assets/alerts-BjWkF2SU.js.br"
  },
  "/_build/assets/alerts-BjWkF2SU.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"744-cx9b4wGnnxbVp+SCFhou1G8B+q8\"",
    "mtime": "2025-10-01T20:13:06.400Z",
    "size": 1860,
    "path": "../public/_build/assets/alerts-BjWkF2SU.js.gz"
  },
  "/_build/assets/charts-BIPiX63h.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"347c-q2XIJiRHtIXsskRbfHrpUZp5Oyw\"",
    "mtime": "2025-10-01T20:13:06.338Z",
    "size": 13436,
    "path": "../public/_build/assets/charts-BIPiX63h.js"
  },
  "/_build/assets/charts-BIPiX63h.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"d43-1xfC0hdzPI4JO6X2cnE88eRO7Ds\"",
    "mtime": "2025-10-01T20:13:06.400Z",
    "size": 3395,
    "path": "../public/_build/assets/charts-BIPiX63h.js.br"
  },
  "/_build/assets/charts-BIPiX63h.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"efa-fSmvQvKXTpT3DkQJCIr1gIWRrjY\"",
    "mtime": "2025-10-01T20:13:06.400Z",
    "size": 3834,
    "path": "../public/_build/assets/charts-BIPiX63h.js.gz"
  },
  "/_build/assets/client-BjoaO50o.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"2202-ygL4IXs5/vgBxlP62V7HPkPOxds\"",
    "mtime": "2025-10-01T20:13:06.338Z",
    "size": 8706,
    "path": "../public/_build/assets/client-BjoaO50o.css"
  },
  "/_build/assets/client-BjoaO50o.css.br": {
    "type": "text/css; charset=utf-8",
    "encoding": "br",
    "etag": "\"8e1-HSY0FmU8JRIt0cSKfDV/gEkyPXU\"",
    "mtime": "2025-10-01T20:13:06.400Z",
    "size": 2273,
    "path": "../public/_build/assets/client-BjoaO50o.css.br"
  },
  "/_build/assets/client-BjoaO50o.css.gz": {
    "type": "text/css; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"a5f-gTch4uEXODYLZQjFBi8lfhzrEHs\"",
    "mtime": "2025-10-01T20:13:06.400Z",
    "size": 2655,
    "path": "../public/_build/assets/client-BjoaO50o.css.gz"
  },
  "/_build/assets/client-Cg-JdxCZ.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"f98c-NB16IxQZ/67DhRf6jRlmM7eCJ1g\"",
    "mtime": "2025-10-01T20:13:06.338Z",
    "size": 63884,
    "path": "../public/_build/assets/client-Cg-JdxCZ.js"
  },
  "/_build/assets/client-Cg-JdxCZ.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"3cd2-xSZpLQ7YrgMuBBz8YtmTCSSx/W0\"",
    "mtime": "2025-10-01T20:13:06.437Z",
    "size": 15570,
    "path": "../public/_build/assets/client-Cg-JdxCZ.js.br"
  },
  "/_build/assets/client-Cg-JdxCZ.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"44f1-hQuUYy2mJK1P/uS+MZjnX1YYJ+E\"",
    "mtime": "2025-10-01T20:13:06.402Z",
    "size": 17649,
    "path": "../public/_build/assets/client-Cg-JdxCZ.js.gz"
  },
  "/_build/assets/index-DEYiQ7KU.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1379-yujb6imr/+NFI48LS8Q1dSEufss\"",
    "mtime": "2025-10-01T20:13:06.338Z",
    "size": 4985,
    "path": "../public/_build/assets/index-DEYiQ7KU.js"
  },
  "/_build/assets/index-DEYiQ7KU.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"668-VL1R6ebK272dpjsWmI5LMFgONw0\"",
    "mtime": "2025-10-01T20:13:06.400Z",
    "size": 1640,
    "path": "../public/_build/assets/index-DEYiQ7KU.js.br"
  },
  "/_build/assets/index-DEYiQ7KU.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"74d-0C89/ZS/+nm0eQkBg7q8m778OhI\"",
    "mtime": "2025-10-01T20:13:06.400Z",
    "size": 1869,
    "path": "../public/_build/assets/index-DEYiQ7KU.js.gz"
  },
  "/_build/assets/notifications-BveZLvMJ.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1369-WZ9cFPp1QsoDm7IxiQsxwUriBJM\"",
    "mtime": "2025-10-01T20:13:06.338Z",
    "size": 4969,
    "path": "../public/_build/assets/notifications-BveZLvMJ.js"
  },
  "/_build/assets/notifications-BveZLvMJ.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"5dd-uuC7onjEUQcsdSbecd9ReZ31NWg\"",
    "mtime": "2025-10-01T20:13:06.400Z",
    "size": 1501,
    "path": "../public/_build/assets/notifications-BveZLvMJ.js.br"
  },
  "/_build/assets/notifications-BveZLvMJ.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"6ba-Vf/1QWYowGFLJLxDlgF9y6aYHH4\"",
    "mtime": "2025-10-01T20:13:06.400Z",
    "size": 1722,
    "path": "../public/_build/assets/notifications-BveZLvMJ.js.gz"
  },
  "/_build/assets/settings-D5NMsFtN.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"14dd-+SAfUtGkWe6FTr3i5CfvdkwhJWM\"",
    "mtime": "2025-10-01T20:13:06.338Z",
    "size": 5341,
    "path": "../public/_build/assets/settings-D5NMsFtN.js"
  },
  "/_build/assets/settings-D5NMsFtN.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"5c6-xmHx3dU/gHHKPdBfrDIKsEVMdgQ\"",
    "mtime": "2025-10-01T20:13:06.400Z",
    "size": 1478,
    "path": "../public/_build/assets/settings-D5NMsFtN.js.br"
  },
  "/_build/assets/settings-D5NMsFtN.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"706-1o7HN9ihtPDeCWdBldAKqywNC+Y\"",
    "mtime": "2025-10-01T20:13:06.400Z",
    "size": 1798,
    "path": "../public/_build/assets/settings-D5NMsFtN.js.gz"
  },
  "/_build/assets/targets-CP5rXuul.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"aab-xTsSEGHyqnIdbxl1ikuVaj1NeUI\"",
    "mtime": "2025-10-01T20:13:06.338Z",
    "size": 2731,
    "path": "../public/_build/assets/targets-CP5rXuul.js"
  },
  "/_build/assets/targets-CP5rXuul.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"46b-KfVnEIERAsQhnPa4JtZLr6rAvwY\"",
    "mtime": "2025-10-01T20:13:06.400Z",
    "size": 1131,
    "path": "../public/_build/assets/targets-CP5rXuul.js.br"
  },
  "/_build/assets/targets-CP5rXuul.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"521-HJnnD1jTzyj+L7CPjSoaZuvHK3g\"",
    "mtime": "2025-10-01T20:13:06.400Z",
    "size": 1313,
    "path": "../public/_build/assets/targets-CP5rXuul.js.gz"
  },
  "/_server/assets/TargetCard-Bjgo4gzU.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"4a1-gofeK281p8VRuSnOXJ7A6/cMmLI\"",
    "mtime": "2025-10-01T20:13:06.399Z",
    "size": 1185,
    "path": "../public/_server/assets/TargetCard-Bjgo4gzU.js.br"
  },
  "/_server/assets/TargetCard-Bjgo4gzU.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"552-dE2A4LbjJUxYTbgnztk50jXv1EE\"",
    "mtime": "2025-10-01T20:13:06.399Z",
    "size": 1362,
    "path": "../public/_server/assets/TargetCard-Bjgo4gzU.js.gz"
  },
  "/_server/assets/UptimeChart-Cg1W-4dT.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"976-VLsrelBOQo1DDfjXhpGy0e5ZYps\"",
    "mtime": "2025-10-01T20:13:06.399Z",
    "size": 2422,
    "path": "../public/_server/assets/UptimeChart-Cg1W-4dT.js.br"
  },
  "/_server/assets/UptimeChart-Cg1W-4dT.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"ad3-W+b7gexBbnxZ1CRzcRtmj0EM6+4\"",
    "mtime": "2025-10-01T20:13:06.399Z",
    "size": 2771,
    "path": "../public/_server/assets/UptimeChart-Cg1W-4dT.js.gz"
  },
  "/_server/assets/app-BjoaO50o.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"2202-ygL4IXs5/vgBxlP62V7HPkPOxds\"",
    "mtime": "2025-10-01T20:13:06.342Z",
    "size": 8706,
    "path": "../public/_server/assets/app-BjoaO50o.css"
  },
  "/_server/assets/app-BjoaO50o.css.br": {
    "type": "text/css; charset=utf-8",
    "encoding": "br",
    "etag": "\"8e1-HSY0FmU8JRIt0cSKfDV/gEkyPXU\"",
    "mtime": "2025-10-01T20:13:06.399Z",
    "size": 2273,
    "path": "../public/_server/assets/app-BjoaO50o.css.br"
  },
  "/_server/assets/app-BjoaO50o.css.gz": {
    "type": "text/css; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"a5f-gTch4uEXODYLZQjFBi8lfhzrEHs\"",
    "mtime": "2025-10-01T20:13:06.399Z",
    "size": 2655,
    "path": "../public/_server/assets/app-BjoaO50o.css.gz"
  },
  "/_server/assets/app-QiOgf4yA.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"abc-hlRxUeI/YExQtV48xkG8SbFOUMs\"",
    "mtime": "2025-10-01T20:13:06.399Z",
    "size": 2748,
    "path": "../public/_server/assets/app-QiOgf4yA.js.br"
  },
  "/_server/assets/app-QiOgf4yA.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"bf1-8GLxcy7vDdwrcm5Jy2eW3G8S0hU\"",
    "mtime": "2025-10-01T20:13:06.399Z",
    "size": 3057,
    "path": "../public/_server/assets/app-QiOgf4yA.js.gz"
  },
  "/_server/assets/container-L2LlDb0s.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"f34-PI6LRGBRStoJvDZu9qXqFw5FXpU\"",
    "mtime": "2025-10-01T20:13:06.400Z",
    "size": 3892,
    "path": "../public/_server/assets/container-L2LlDb0s.js.br"
  },
  "/_server/assets/container-L2LlDb0s.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"1110-PuyVN0sQ5Mb5OluK3EIe8WDgtt4\"",
    "mtime": "2025-10-01T20:13:06.400Z",
    "size": 4368,
    "path": "../public/_server/assets/container-L2LlDb0s.js.gz"
  },
  "/_server/assets/router-DHVY9RUY.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"733-6vG/ea34PHfOcVil+p4zGO3+J3c\"",
    "mtime": "2025-10-01T20:13:06.399Z",
    "size": 1843,
    "path": "../public/_server/assets/router-DHVY9RUY.js.br"
  },
  "/_server/assets/router-DHVY9RUY.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"830-H7sXBv+SxSWN+IoCVvmp++4K6hQ\"",
    "mtime": "2025-10-01T20:13:06.399Z",
    "size": 2096,
    "path": "../public/_server/assets/router-DHVY9RUY.js.gz"
  },
  "/_server/assets/routing-BuvachQx.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"16ab-OGuwuVeYJIA/pSocshByBjqDAjk\"",
    "mtime": "2025-10-01T20:13:06.400Z",
    "size": 5803,
    "path": "../public/_server/assets/routing-BuvachQx.js.br"
  },
  "/_server/assets/routing-BuvachQx.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"1951-3pOtz/WgoXZoZTP4Myuwwefi9So\"",
    "mtime": "2025-10-01T20:13:06.400Z",
    "size": 6481,
    "path": "../public/_server/assets/routing-BuvachQx.js.gz"
  },
  "/_server/assets/server-fns-DJA2HZf-.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"1157-kHSsWreRftcP2f3ssQ0S2zNuakI\"",
    "mtime": "2025-10-01T20:13:06.400Z",
    "size": 4439,
    "path": "../public/_server/assets/server-fns-DJA2HZf-.js.br"
  },
  "/_server/assets/server-fns-DJA2HZf-.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"1341-ZFSEvOYz6DxmVaXXJNa4UJSJNIA\"",
    "mtime": "2025-10-01T20:13:06.400Z",
    "size": 4929,
    "path": "../public/_server/assets/server-fns-DJA2HZf-.js.gz"
  }
};

const _DRIVE_LETTER_START_RE = /^[A-Za-z]:\//;
function normalizeWindowsPath(input = "") {
  if (!input) {
    return input;
  }
  return input.replace(/\\/g, "/").replace(_DRIVE_LETTER_START_RE, (r) => r.toUpperCase());
}
const _IS_ABSOLUTE_RE = /^[/\\](?![/\\])|^[/\\]{2}(?!\.)|^[A-Za-z]:[/\\]/;
const _DRIVE_LETTER_RE = /^[A-Za-z]:$/;
function cwd() {
  if (typeof process !== "undefined" && typeof process.cwd === "function") {
    return process.cwd().replace(/\\/g, "/");
  }
  return "/";
}
const resolve = function(...arguments_) {
  arguments_ = arguments_.map((argument) => normalizeWindowsPath(argument));
  let resolvedPath = "";
  let resolvedAbsolute = false;
  for (let index = arguments_.length - 1; index >= -1 && !resolvedAbsolute; index--) {
    const path = index >= 0 ? arguments_[index] : cwd();
    if (!path || path.length === 0) {
      continue;
    }
    resolvedPath = `${path}/${resolvedPath}`;
    resolvedAbsolute = isAbsolute(path);
  }
  resolvedPath = normalizeString(resolvedPath, !resolvedAbsolute);
  if (resolvedAbsolute && !isAbsolute(resolvedPath)) {
    return `/${resolvedPath}`;
  }
  return resolvedPath.length > 0 ? resolvedPath : ".";
};
function normalizeString(path, allowAboveRoot) {
  let res = "";
  let lastSegmentLength = 0;
  let lastSlash = -1;
  let dots = 0;
  let char = null;
  for (let index = 0; index <= path.length; ++index) {
    if (index < path.length) {
      char = path[index];
    } else if (char === "/") {
      break;
    } else {
      char = "/";
    }
    if (char === "/") {
      if (lastSlash === index - 1 || dots === 1) ; else if (dots === 2) {
        if (res.length < 2 || lastSegmentLength !== 2 || res[res.length - 1] !== "." || res[res.length - 2] !== ".") {
          if (res.length > 2) {
            const lastSlashIndex = res.lastIndexOf("/");
            if (lastSlashIndex === -1) {
              res = "";
              lastSegmentLength = 0;
            } else {
              res = res.slice(0, lastSlashIndex);
              lastSegmentLength = res.length - 1 - res.lastIndexOf("/");
            }
            lastSlash = index;
            dots = 0;
            continue;
          } else if (res.length > 0) {
            res = "";
            lastSegmentLength = 0;
            lastSlash = index;
            dots = 0;
            continue;
          }
        }
        if (allowAboveRoot) {
          res += res.length > 0 ? "/.." : "..";
          lastSegmentLength = 2;
        }
      } else {
        if (res.length > 0) {
          res += `/${path.slice(lastSlash + 1, index)}`;
        } else {
          res = path.slice(lastSlash + 1, index);
        }
        lastSegmentLength = index - lastSlash - 1;
      }
      lastSlash = index;
      dots = 0;
    } else if (char === "." && dots !== -1) {
      ++dots;
    } else {
      dots = -1;
    }
  }
  return res;
}
const isAbsolute = function(p) {
  return _IS_ABSOLUTE_RE.test(p);
};
const dirname = function(p) {
  const segments = normalizeWindowsPath(p).replace(/\/$/, "").split("/").slice(0, -1);
  if (segments.length === 1 && _DRIVE_LETTER_RE.test(segments[0])) {
    segments[0] += "/";
  }
  return segments.join("/") || (isAbsolute(p) ? "/" : ".");
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
const _zSw6yC = eventHandler$1((event) => {
  if (event.method && !METHODS.has(event.method)) {
    return;
  }
  let id = decodePath(
    withLeadingSlash(withoutTrailingSlash(parseURL(event.path).pathname))
  );
  let asset;
  const encodingHeader = String(
    getRequestHeader$1(event, "accept-encoding") || ""
  );
  const encodings = [
    ...encodingHeader.split(",").map((e) => EncodingMap[e.trim()]).filter(Boolean).sort(),
    ""
  ];
  if (encodings.length > 1) {
    appendResponseHeader$1(event, "Vary", "Accept-Encoding");
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
      removeResponseHeader$1(event, "Cache-Control");
      throw createError$2({ statusCode: 404 });
    }
    return;
  }
  const ifNotMatch = getRequestHeader$1(event, "if-none-match") === asset.etag;
  if (ifNotMatch) {
    setResponseStatus$1(event, 304, "Not Modified");
    return "";
  }
  const ifModifiedSinceH = getRequestHeader$1(event, "if-modified-since");
  const mtimeDate = new Date(asset.mtime);
  if (ifModifiedSinceH && asset.mtime && new Date(ifModifiedSinceH) >= mtimeDate) {
    setResponseStatus$1(event, 304, "Not Modified");
    return "";
  }
  if (asset.type && !getResponseHeader$1(event, "Content-Type")) {
    setResponseHeader$1(event, "Content-Type", asset.type);
  }
  if (asset.etag && !getResponseHeader$1(event, "ETag")) {
    setResponseHeader$1(event, "ETag", asset.etag);
  }
  if (asset.mtime && !getResponseHeader$1(event, "Last-Modified")) {
    setResponseHeader$1(event, "Last-Modified", mtimeDate.toUTCString());
  }
  if (asset.encoding && !getResponseHeader$1(event, "Content-Encoding")) {
    setResponseHeader$1(event, "Content-Encoding", asset.encoding);
  }
  if (asset.size > 0 && !getResponseHeader$1(event, "Content-Length")) {
    setResponseHeader$1(event, "Content-Length", asset.size);
  }
  return readAsset(id);
});

function parse(str, options) {
  if (typeof str !== "string") {
    throw new TypeError("argument str must be a string");
  }
  const obj = {};
  const opt = {};
  const dec = opt.decode || decode;
  let index = 0;
  while (index < str.length) {
    const eqIdx = str.indexOf("=", index);
    if (eqIdx === -1) {
      break;
    }
    let endIdx = str.indexOf(";", index);
    if (endIdx === -1) {
      endIdx = str.length;
    } else if (endIdx < eqIdx) {
      index = str.lastIndexOf(";", eqIdx - 1) + 1;
      continue;
    }
    const key = str.slice(index, eqIdx).trim();
    if (opt?.filter && !opt?.filter(key)) {
      index = endIdx + 1;
      continue;
    }
    if (void 0 === obj[key]) {
      let val = str.slice(eqIdx + 1, endIdx).trim();
      if (val.codePointAt(0) === 34) {
        val = val.slice(1, -1);
      }
      obj[key] = tryDecode(val, dec);
    }
    index = endIdx + 1;
  }
  return obj;
}
function decode(str) {
  return str.includes("%") ? decodeURIComponent(str) : str;
}
function tryDecode(str, decode2) {
  try {
    return decode2(str);
  } catch {
    return str;
  }
}

const fieldContentRegExp = /^[\u0009\u0020-\u007E\u0080-\u00FF]+$/;
function serialize(name, value, options) {
  const opt = options || {};
  const enc = opt.encode || encodeURIComponent;
  if (typeof enc !== "function") {
    throw new TypeError("option encode is invalid");
  }
  if (!fieldContentRegExp.test(name)) {
    throw new TypeError("argument name is invalid");
  }
  const encodedValue = enc(value);
  if (encodedValue && !fieldContentRegExp.test(encodedValue)) {
    throw new TypeError("argument val is invalid");
  }
  let str = name + "=" + encodedValue;
  if (void 0 !== opt.maxAge && opt.maxAge !== null) {
    const maxAge = opt.maxAge - 0;
    if (Number.isNaN(maxAge) || !Number.isFinite(maxAge)) {
      throw new TypeError("option maxAge is invalid");
    }
    str += "; Max-Age=" + Math.floor(maxAge);
  }
  if (opt.domain) {
    if (!fieldContentRegExp.test(opt.domain)) {
      throw new TypeError("option domain is invalid");
    }
    str += "; Domain=" + opt.domain;
  }
  if (opt.path) {
    if (!fieldContentRegExp.test(opt.path)) {
      throw new TypeError("option path is invalid");
    }
    str += "; Path=" + opt.path;
  }
  if (opt.expires) {
    if (!isDate(opt.expires) || Number.isNaN(opt.expires.valueOf())) {
      throw new TypeError("option expires is invalid");
    }
    str += "; Expires=" + opt.expires.toUTCString();
  }
  if (opt.httpOnly) {
    str += "; HttpOnly";
  }
  if (opt.secure) {
    str += "; Secure";
  }
  if (opt.priority) {
    const priority = typeof opt.priority === "string" ? opt.priority.toLowerCase() : opt.priority;
    switch (priority) {
      case "low": {
        str += "; Priority=Low";
        break;
      }
      case "medium": {
        str += "; Priority=Medium";
        break;
      }
      case "high": {
        str += "; Priority=High";
        break;
      }
      default: {
        throw new TypeError("option priority is invalid");
      }
    }
  }
  if (opt.sameSite) {
    const sameSite = typeof opt.sameSite === "string" ? opt.sameSite.toLowerCase() : opt.sameSite;
    switch (sameSite) {
      case true: {
        str += "; SameSite=Strict";
        break;
      }
      case "lax": {
        str += "; SameSite=Lax";
        break;
      }
      case "strict": {
        str += "; SameSite=Strict";
        break;
      }
      case "none": {
        str += "; SameSite=None";
        break;
      }
      default: {
        throw new TypeError("option sameSite is invalid");
      }
    }
  }
  if (opt.partitioned) {
    str += "; Partitioned";
  }
  return str;
}
function isDate(val) {
  return Object.prototype.toString.call(val) === "[object Date]" || val instanceof Date;
}

const defaults = Object.freeze({
  ignoreUnknown: false,
  respectType: false,
  respectFunctionNames: false,
  respectFunctionProperties: false,
  unorderedObjects: true,
  unorderedArrays: false,
  unorderedSets: false,
  excludeKeys: void 0,
  excludeValues: void 0,
  replacer: void 0
});
function objectHash(object, options) {
  if (options) {
    options = { ...defaults, ...options };
  } else {
    options = defaults;
  }
  const hasher = createHasher(options);
  hasher.dispatch(object);
  return hasher.toString();
}
const defaultPrototypesKeys = Object.freeze([
  "prototype",
  "__proto__",
  "constructor"
]);
function createHasher(options) {
  let buff = "";
  let context = /* @__PURE__ */ new Map();
  const write = (str) => {
    buff += str;
  };
  return {
    toString() {
      return buff;
    },
    getContext() {
      return context;
    },
    dispatch(value) {
      if (options.replacer) {
        value = options.replacer(value);
      }
      const type = value === null ? "null" : typeof value;
      return this[type](value);
    },
    object(object) {
      if (object && typeof object.toJSON === "function") {
        return this.object(object.toJSON());
      }
      const objString = Object.prototype.toString.call(object);
      let objType = "";
      const objectLength = objString.length;
      if (objectLength < 10) {
        objType = "unknown:[" + objString + "]";
      } else {
        objType = objString.slice(8, objectLength - 1);
      }
      objType = objType.toLowerCase();
      let objectNumber = null;
      if ((objectNumber = context.get(object)) === void 0) {
        context.set(object, context.size);
      } else {
        return this.dispatch("[CIRCULAR:" + objectNumber + "]");
      }
      if (typeof Buffer !== "undefined" && Buffer.isBuffer && Buffer.isBuffer(object)) {
        write("buffer:");
        return write(object.toString("utf8"));
      }
      if (objType !== "object" && objType !== "function" && objType !== "asyncfunction") {
        if (this[objType]) {
          this[objType](object);
        } else if (!options.ignoreUnknown) {
          this.unkown(object, objType);
        }
      } else {
        let keys = Object.keys(object);
        if (options.unorderedObjects) {
          keys = keys.sort();
        }
        let extraKeys = [];
        if (options.respectType !== false && !isNativeFunction(object)) {
          extraKeys = defaultPrototypesKeys;
        }
        if (options.excludeKeys) {
          keys = keys.filter((key) => {
            return !options.excludeKeys(key);
          });
          extraKeys = extraKeys.filter((key) => {
            return !options.excludeKeys(key);
          });
        }
        write("object:" + (keys.length + extraKeys.length) + ":");
        const dispatchForKey = (key) => {
          this.dispatch(key);
          write(":");
          if (!options.excludeValues) {
            this.dispatch(object[key]);
          }
          write(",");
        };
        for (const key of keys) {
          dispatchForKey(key);
        }
        for (const key of extraKeys) {
          dispatchForKey(key);
        }
      }
    },
    array(arr, unordered) {
      unordered = unordered === void 0 ? options.unorderedArrays !== false : unordered;
      write("array:" + arr.length + ":");
      if (!unordered || arr.length <= 1) {
        for (const entry of arr) {
          this.dispatch(entry);
        }
        return;
      }
      const contextAdditions = /* @__PURE__ */ new Map();
      const entries = arr.map((entry) => {
        const hasher = createHasher(options);
        hasher.dispatch(entry);
        for (const [key, value] of hasher.getContext()) {
          contextAdditions.set(key, value);
        }
        return hasher.toString();
      });
      context = contextAdditions;
      entries.sort();
      return this.array(entries, false);
    },
    date(date) {
      return write("date:" + date.toJSON());
    },
    symbol(sym) {
      return write("symbol:" + sym.toString());
    },
    unkown(value, type) {
      write(type);
      if (!value) {
        return;
      }
      write(":");
      if (value && typeof value.entries === "function") {
        return this.array(
          Array.from(value.entries()),
          true
          /* ordered */
        );
      }
    },
    error(err) {
      return write("error:" + err.toString());
    },
    boolean(bool) {
      return write("bool:" + bool);
    },
    string(string) {
      write("string:" + string.length + ":");
      write(string);
    },
    function(fn) {
      write("fn:");
      if (isNativeFunction(fn)) {
        this.dispatch("[native]");
      } else {
        this.dispatch(fn.toString());
      }
      if (options.respectFunctionNames !== false) {
        this.dispatch("function-name:" + String(fn.name));
      }
      if (options.respectFunctionProperties) {
        this.object(fn);
      }
    },
    number(number) {
      return write("number:" + number);
    },
    xml(xml) {
      return write("xml:" + xml.toString());
    },
    null() {
      return write("Null");
    },
    undefined() {
      return write("Undefined");
    },
    regexp(regex) {
      return write("regex:" + regex.toString());
    },
    uint8array(arr) {
      write("uint8array:");
      return this.dispatch(Array.prototype.slice.call(arr));
    },
    uint8clampedarray(arr) {
      write("uint8clampedarray:");
      return this.dispatch(Array.prototype.slice.call(arr));
    },
    int8array(arr) {
      write("int8array:");
      return this.dispatch(Array.prototype.slice.call(arr));
    },
    uint16array(arr) {
      write("uint16array:");
      return this.dispatch(Array.prototype.slice.call(arr));
    },
    int16array(arr) {
      write("int16array:");
      return this.dispatch(Array.prototype.slice.call(arr));
    },
    uint32array(arr) {
      write("uint32array:");
      return this.dispatch(Array.prototype.slice.call(arr));
    },
    int32array(arr) {
      write("int32array:");
      return this.dispatch(Array.prototype.slice.call(arr));
    },
    float32array(arr) {
      write("float32array:");
      return this.dispatch(Array.prototype.slice.call(arr));
    },
    float64array(arr) {
      write("float64array:");
      return this.dispatch(Array.prototype.slice.call(arr));
    },
    arraybuffer(arr) {
      write("arraybuffer:");
      return this.dispatch(new Uint8Array(arr));
    },
    url(url) {
      return write("url:" + url.toString());
    },
    map(map) {
      write("map:");
      const arr = [...map];
      return this.array(arr, options.unorderedSets !== false);
    },
    set(set) {
      write("set:");
      const arr = [...set];
      return this.array(arr, options.unorderedSets !== false);
    },
    file(file) {
      write("file:");
      return this.dispatch([file.name, file.size, file.type, file.lastModfied]);
    },
    blob() {
      if (options.ignoreUnknown) {
        return write("[blob]");
      }
      throw new Error(
        'Hashing Blob objects is currently not supported\nUse "options.replacer" or "options.ignoreUnknown"\n'
      );
    },
    domwindow() {
      return write("domwindow");
    },
    bigint(number) {
      return write("bigint:" + number.toString());
    },
    /* Node.js standard native objects */
    process() {
      return write("process");
    },
    timer() {
      return write("timer");
    },
    pipe() {
      return write("pipe");
    },
    tcp() {
      return write("tcp");
    },
    udp() {
      return write("udp");
    },
    tty() {
      return write("tty");
    },
    statwatcher() {
      return write("statwatcher");
    },
    securecontext() {
      return write("securecontext");
    },
    connection() {
      return write("connection");
    },
    zlib() {
      return write("zlib");
    },
    context() {
      return write("context");
    },
    nodescript() {
      return write("nodescript");
    },
    httpparser() {
      return write("httpparser");
    },
    dataview() {
      return write("dataview");
    },
    signal() {
      return write("signal");
    },
    fsevent() {
      return write("fsevent");
    },
    tlswrap() {
      return write("tlswrap");
    }
  };
}
const nativeFunc = "[native code] }";
const nativeFuncLength = nativeFunc.length;
function isNativeFunction(f) {
  if (typeof f !== "function") {
    return false;
  }
  return Function.prototype.toString.call(f).slice(-nativeFuncLength) === nativeFunc;
}

function hasProp(obj, prop) {
  try {
    return prop in obj;
  } catch {
    return false;
  }
}

var __defProp$2$1 = Object.defineProperty;
var __defNormalProp$2$1 = (obj, key, value) => key in obj ? __defProp$2$1(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField$2$1 = (obj, key, value) => {
  __defNormalProp$2$1(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
class H3Error extends Error {
  constructor(message, opts = {}) {
    super(message, opts);
    __publicField$2$1(this, "statusCode", 500);
    __publicField$2$1(this, "fatal", false);
    __publicField$2$1(this, "unhandled", false);
    __publicField$2$1(this, "statusMessage");
    __publicField$2$1(this, "data");
    __publicField$2$1(this, "cause");
    if (opts.cause && !this.cause) {
      this.cause = opts.cause;
    }
  }
  toJSON() {
    const obj = {
      message: this.message,
      statusCode: sanitizeStatusCode(this.statusCode, 500)
    };
    if (this.statusMessage) {
      obj.statusMessage = sanitizeStatusMessage(this.statusMessage);
    }
    if (this.data !== void 0) {
      obj.data = this.data;
    }
    return obj;
  }
}
__publicField$2$1(H3Error, "__h3_error__", true);
function createError(input) {
  if (typeof input === "string") {
    return new H3Error(input);
  }
  if (isError(input)) {
    return input;
  }
  const err = new H3Error(input.message ?? input.statusMessage ?? "", {
    cause: input.cause || input
  });
  if (hasProp(input, "stack")) {
    try {
      Object.defineProperty(err, "stack", {
        get() {
          return input.stack;
        }
      });
    } catch {
      try {
        err.stack = input.stack;
      } catch {
      }
    }
  }
  if (input.data) {
    err.data = input.data;
  }
  if (input.statusCode) {
    err.statusCode = sanitizeStatusCode(input.statusCode, err.statusCode);
  } else if (input.status) {
    err.statusCode = sanitizeStatusCode(input.status, err.statusCode);
  }
  if (input.statusMessage) {
    err.statusMessage = input.statusMessage;
  } else if (input.statusText) {
    err.statusMessage = input.statusText;
  }
  if (err.statusMessage) {
    const originalMessage = err.statusMessage;
    const sanitizedMessage = sanitizeStatusMessage(err.statusMessage);
    if (sanitizedMessage !== originalMessage) {
      console.warn(
        "[h3] Please prefer using `message` for longer error messages instead of `statusMessage`. In the future, `statusMessage` will be sanitized by default."
      );
    }
  }
  if (input.fatal !== void 0) {
    err.fatal = input.fatal;
  }
  if (input.unhandled !== void 0) {
    err.unhandled = input.unhandled;
  }
  return err;
}
function isError(input) {
  return input?.constructor?.__h3_error__ === true;
}
function isMethod(event, expected, allowHead) {
  if (typeof expected === "string") {
    if (event.method === expected) {
      return true;
    }
  } else if (expected.includes(event.method)) {
    return true;
  }
  return false;
}
function assertMethod(event, expected, allowHead) {
  if (!isMethod(event, expected)) {
    throw createError({
      statusCode: 405,
      statusMessage: "HTTP method is not allowed."
    });
  }
}
function getRequestHeaders(event) {
  const _headers = {};
  for (const key in event.node.req.headers) {
    const val = event.node.req.headers[key];
    _headers[key] = Array.isArray(val) ? val.filter(Boolean).join(", ") : val;
  }
  return _headers;
}
function getRequestHeader(event, name) {
  const headers = getRequestHeaders(event);
  const value = headers[name.toLowerCase()];
  return value;
}
function getRequestHost(event, opts = {}) {
  if (opts.xForwardedHost) {
    const xForwardedHost = event.node.req.headers["x-forwarded-host"];
    if (xForwardedHost) {
      return xForwardedHost;
    }
  }
  return event.node.req.headers.host || "localhost";
}
function getRequestProtocol(event, opts = {}) {
  if (opts.xForwardedProto !== false && event.node.req.headers["x-forwarded-proto"] === "https") {
    return "https";
  }
  return event.node.req.connection?.encrypted ? "https" : "http";
}
function getRequestURL(event, opts = {}) {
  const host = getRequestHost(event, opts);
  const protocol = getRequestProtocol(event, opts);
  const path = (event.node.req.originalUrl || event.path).replace(
    /^[/\\]+/g,
    "/"
  );
  return new URL(path, `${protocol}://${host}`);
}
function getRequestIP(event, opts = {}) {
  if (event.context.clientAddress) {
    return event.context.clientAddress;
  }
  if (opts.xForwardedFor) {
    const xForwardedFor = getRequestHeader(event, "x-forwarded-for")?.split(",").shift()?.trim();
    if (xForwardedFor) {
      return xForwardedFor;
    }
  }
  if (event.node.req.socket.remoteAddress) {
    return event.node.req.socket.remoteAddress;
  }
}

const RawBodySymbol = Symbol.for("h3RawBody");
const PayloadMethods$1 = ["PATCH", "POST", "PUT", "DELETE"];
function readRawBody(event, encoding = "utf8") {
  assertMethod(event, PayloadMethods$1);
  const _rawBody = event._requestBody || event.web?.request?.body || event.node.req[RawBodySymbol] || event.node.req.rawBody || event.node.req.body;
  if (_rawBody) {
    const promise2 = Promise.resolve(_rawBody).then((_resolved) => {
      if (Buffer.isBuffer(_resolved)) {
        return _resolved;
      }
      if (typeof _resolved.pipeTo === "function") {
        return new Promise((resolve, reject) => {
          const chunks = [];
          _resolved.pipeTo(
            new WritableStream({
              write(chunk) {
                chunks.push(chunk);
              },
              close() {
                resolve(Buffer.concat(chunks));
              },
              abort(reason) {
                reject(reason);
              }
            })
          ).catch(reject);
        });
      } else if (typeof _resolved.pipe === "function") {
        return new Promise((resolve, reject) => {
          const chunks = [];
          _resolved.on("data", (chunk) => {
            chunks.push(chunk);
          }).on("end", () => {
            resolve(Buffer.concat(chunks));
          }).on("error", reject);
        });
      }
      if (_resolved.constructor === Object) {
        return Buffer.from(JSON.stringify(_resolved));
      }
      if (_resolved instanceof URLSearchParams) {
        return Buffer.from(_resolved.toString());
      }
      return Buffer.from(_resolved);
    });
    return encoding ? promise2.then((buff) => buff.toString(encoding)) : promise2;
  }
  if (!Number.parseInt(event.node.req.headers["content-length"] || "") && !String(event.node.req.headers["transfer-encoding"] ?? "").split(",").map((e) => e.trim()).filter(Boolean).includes("chunked")) {
    return Promise.resolve(void 0);
  }
  const promise = event.node.req[RawBodySymbol] = new Promise(
    (resolve, reject) => {
      const bodyData = [];
      event.node.req.on("error", (err) => {
        reject(err);
      }).on("data", (chunk) => {
        bodyData.push(chunk);
      }).on("end", () => {
        resolve(Buffer.concat(bodyData));
      });
    }
  );
  const result = encoding ? promise.then((buff) => buff.toString(encoding)) : promise;
  return result;
}
function getRequestWebStream(event) {
  if (!PayloadMethods$1.includes(event.method)) {
    return;
  }
  const bodyStream = event.web?.request?.body || event._requestBody;
  if (bodyStream) {
    return bodyStream;
  }
  const _hasRawBody = RawBodySymbol in event.node.req || "rawBody" in event.node.req || "body" in event.node.req || "__unenv__" in event.node.req;
  if (_hasRawBody) {
    return new ReadableStream({
      async start(controller) {
        const _rawBody = await readRawBody(event, false);
        if (_rawBody) {
          controller.enqueue(_rawBody);
        }
        controller.close();
      }
    });
  }
  return new ReadableStream({
    start: (controller) => {
      event.node.req.on("data", (chunk) => {
        controller.enqueue(chunk);
      });
      event.node.req.on("end", () => {
        controller.close();
      });
      event.node.req.on("error", (err) => {
        controller.error(err);
      });
    }
  });
}

const MIMES = {
  html: "text/html"};

const DISALLOWED_STATUS_CHARS = /[^\u0009\u0020-\u007E]/g;
function sanitizeStatusMessage(statusMessage = "") {
  return statusMessage.replace(DISALLOWED_STATUS_CHARS, "");
}
function sanitizeStatusCode(statusCode, defaultStatusCode = 200) {
  if (!statusCode) {
    return defaultStatusCode;
  }
  if (typeof statusCode === "string") {
    statusCode = Number.parseInt(statusCode, 10);
  }
  if (statusCode < 100 || statusCode > 999) {
    return defaultStatusCode;
  }
  return statusCode;
}

function parseCookies(event) {
  return parse(event.node.req.headers.cookie || "");
}
function getCookie(event, name) {
  return parseCookies(event)[name];
}
function setCookie(event, name, value, serializeOptions) {
  serializeOptions = { path: "/", ...serializeOptions };
  const cookieStr = serialize(name, value, serializeOptions);
  let setCookies = event.node.res.getHeader("set-cookie");
  if (!Array.isArray(setCookies)) {
    setCookies = [setCookies];
  }
  const _optionsHash = objectHash(serializeOptions);
  setCookies = setCookies.filter((cookieValue) => {
    return cookieValue && _optionsHash !== objectHash(parse(cookieValue));
  });
  event.node.res.setHeader("set-cookie", [...setCookies, cookieStr]);
}
function splitCookiesString(cookiesString) {
  if (Array.isArray(cookiesString)) {
    return cookiesString.flatMap((c) => splitCookiesString(c));
  }
  if (typeof cookiesString !== "string") {
    return [];
  }
  const cookiesStrings = [];
  let pos = 0;
  let start;
  let ch;
  let lastComma;
  let nextStart;
  let cookiesSeparatorFound;
  const skipWhitespace = () => {
    while (pos < cookiesString.length && /\s/.test(cookiesString.charAt(pos))) {
      pos += 1;
    }
    return pos < cookiesString.length;
  };
  const notSpecialChar = () => {
    ch = cookiesString.charAt(pos);
    return ch !== "=" && ch !== ";" && ch !== ",";
  };
  while (pos < cookiesString.length) {
    start = pos;
    cookiesSeparatorFound = false;
    while (skipWhitespace()) {
      ch = cookiesString.charAt(pos);
      if (ch === ",") {
        lastComma = pos;
        pos += 1;
        skipWhitespace();
        nextStart = pos;
        while (pos < cookiesString.length && notSpecialChar()) {
          pos += 1;
        }
        if (pos < cookiesString.length && cookiesString.charAt(pos) === "=") {
          cookiesSeparatorFound = true;
          pos = nextStart;
          cookiesStrings.push(cookiesString.slice(start, lastComma));
          start = pos;
        } else {
          pos = lastComma + 1;
        }
      } else {
        pos += 1;
      }
    }
    if (!cookiesSeparatorFound || pos >= cookiesString.length) {
      cookiesStrings.push(cookiesString.slice(start));
    }
  }
  return cookiesStrings;
}

const defer = typeof setImmediate === "undefined" ? (fn) => fn() : setImmediate;
function send(event, data, type) {
  {
    defaultContentType(event, type);
  }
  return new Promise((resolve) => {
    defer(() => {
      if (!event.handled) {
        event.node.res.end(data);
      }
      resolve();
    });
  });
}
function setResponseStatus(event, code, text) {
  if (code) {
    event.node.res.statusCode = sanitizeStatusCode(
      code,
      event.node.res.statusCode
    );
  }
  if (text) {
    event.node.res.statusMessage = sanitizeStatusMessage(text);
  }
}
function getResponseStatus(event) {
  return event.node.res.statusCode;
}
function getResponseStatusText(event) {
  return event.node.res.statusMessage;
}
function defaultContentType(event, type) {
  if (event.node.res.statusCode !== 304 && !event.node.res.getHeader("content-type")) {
    event.node.res.setHeader("content-type", type);
  }
}
function sendRedirect(event, location, code = 302) {
  event.node.res.statusCode = sanitizeStatusCode(
    code,
    event.node.res.statusCode
  );
  event.node.res.setHeader("location", location);
  const encodedLoc = location.replace(/"/g, "%22");
  const html = `<!DOCTYPE html><html><head><meta http-equiv="refresh" content="0; url=${encodedLoc}"></head></html>`;
  return send(event, html, MIMES.html);
}
function getResponseHeaders(event) {
  return event.node.res.getHeaders();
}
function getResponseHeader(event, name) {
  return event.node.res.getHeader(name);
}
function setResponseHeader(event, name, value) {
  event.node.res.setHeader(name, value);
}
const setHeader = setResponseHeader;
function appendResponseHeader(event, name, value) {
  let current = event.node.res.getHeader(name);
  if (!current) {
    event.node.res.setHeader(name, value);
    return;
  }
  if (!Array.isArray(current)) {
    current = [current.toString()];
  }
  event.node.res.setHeader(name, [...current, value]);
}
function removeResponseHeader(event, name) {
  return event.node.res.removeHeader(name);
}
function sendStream(event, stream) {
  if (!stream || typeof stream !== "object") {
    throw new Error("[h3] Invalid stream provided.");
  }
  event.node.res._data = stream;
  if (!event.node.res.socket) {
    event._handled = true;
    return Promise.resolve();
  }
  if (hasProp(stream, "pipeTo") && typeof stream.pipeTo === "function") {
    return stream.pipeTo(
      new WritableStream({
        write(chunk) {
          event.node.res.write(chunk);
        }
      })
    ).then(() => {
      event.node.res.end();
    });
  }
  if (hasProp(stream, "pipe") && typeof stream.pipe === "function") {
    return new Promise((resolve, reject) => {
      stream.pipe(event.node.res);
      if (stream.on) {
        stream.on("end", () => {
          event.node.res.end();
          resolve();
        });
        stream.on("error", (error) => {
          reject(error);
        });
      }
      event.node.res.on("close", () => {
        if (stream.abort) {
          stream.abort();
        }
      });
    });
  }
  throw new Error("[h3] Invalid or incompatible stream provided.");
}
function sendWebResponse(event, response) {
  for (const [key, value] of response.headers) {
    if (key === "set-cookie") {
      event.node.res.appendHeader(key, splitCookiesString(value));
    } else {
      event.node.res.setHeader(key, value);
    }
  }
  if (response.status) {
    event.node.res.statusCode = sanitizeStatusCode(
      response.status,
      event.node.res.statusCode
    );
  }
  if (response.statusText) {
    event.node.res.statusMessage = sanitizeStatusMessage(response.statusText);
  }
  if (response.redirected) {
    event.node.res.setHeader("location", response.url);
  }
  if (!response.body) {
    event.node.res.end();
    return;
  }
  return sendStream(event, response.body);
}

var __defProp$3 = Object.defineProperty;
var __defNormalProp$3 = (obj, key, value) => key in obj ? __defProp$3(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField$3 = (obj, key, value) => {
  __defNormalProp$3(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
class H3Event {
  constructor(req, res) {
    __publicField$3(this, "__is_event__", true);
    // Context
    __publicField$3(this, "node");
    // Node
    __publicField$3(this, "web");
    // Web
    __publicField$3(this, "context", {});
    // Shared
    // Request
    __publicField$3(this, "_method");
    __publicField$3(this, "_path");
    __publicField$3(this, "_headers");
    __publicField$3(this, "_requestBody");
    // Response
    __publicField$3(this, "_handled", false);
    // Hooks
    __publicField$3(this, "_onBeforeResponseCalled");
    __publicField$3(this, "_onAfterResponseCalled");
    this.node = { req, res };
  }
  // --- Request ---
  get method() {
    if (!this._method) {
      this._method = (this.node.req.method || "GET").toUpperCase();
    }
    return this._method;
  }
  get path() {
    return this._path || this.node.req.url || "/";
  }
  get headers() {
    if (!this._headers) {
      this._headers = _normalizeNodeHeaders(this.node.req.headers);
    }
    return this._headers;
  }
  // --- Respoonse ---
  get handled() {
    return this._handled || this.node.res.writableEnded || this.node.res.headersSent;
  }
  respondWith(response) {
    return Promise.resolve(response).then(
      (_response) => sendWebResponse(this, _response)
    );
  }
  // --- Utils ---
  toString() {
    return `[${this.method}] ${this.path}`;
  }
  toJSON() {
    return this.toString();
  }
  // --- Deprecated ---
  /** @deprecated Please use `event.node.req` instead. */
  get req() {
    return this.node.req;
  }
  /** @deprecated Please use `event.node.res` instead. */
  get res() {
    return this.node.res;
  }
}
function _normalizeNodeHeaders(nodeHeaders) {
  const headers = new Headers();
  for (const [name, value] of Object.entries(nodeHeaders)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        headers.append(name, item);
      }
    } else if (value) {
      headers.set(name, value);
    }
  }
  return headers;
}

function defineEventHandler(handler) {
  if (typeof handler === "function") {
    handler.__is_handler__ = true;
    return handler;
  }
  const _hooks = {
    onRequest: _normalizeArray(handler.onRequest),
    onBeforeResponse: _normalizeArray(handler.onBeforeResponse)
  };
  const _handler = (event) => {
    return _callHandler(event, handler.handler, _hooks);
  };
  _handler.__is_handler__ = true;
  _handler.__resolve__ = handler.handler.__resolve__;
  _handler.__websocket__ = handler.websocket;
  return _handler;
}
function _normalizeArray(input) {
  return input ? Array.isArray(input) ? input : [input] : void 0;
}
async function _callHandler(event, handler, hooks) {
  if (hooks.onRequest) {
    for (const hook of hooks.onRequest) {
      await hook(event);
      if (event.handled) {
        return;
      }
    }
  }
  const body = await handler(event);
  const response = { body };
  if (hooks.onBeforeResponse) {
    for (const hook of hooks.onBeforeResponse) {
      await hook(event, response);
    }
  }
  return response.body;
}
const eventHandler = defineEventHandler;

var __defProp$2 = Object.defineProperty;
var __defNormalProp$2 = (obj, key, value) => key in obj ? __defProp$2(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField$2 = (obj, key, value) => __defNormalProp$2(obj, typeof key !== "symbol" ? key + "" : key, value);
function He$1(e) {
  let s;
  const t = J$1(e), n = { duplex: "half", method: e.method, headers: e.headers };
  return e.node.req.body instanceof ArrayBuffer ? new Request(t, { ...n, body: e.node.req.body }) : new Request(t, { ...n, get body() {
    return s || (s = De$1(e), s);
  } });
}
function Ce(e) {
  var _a;
  return (_a = e.web) != null ? _a : e.web = { request: He$1(e), url: J$1(e) }, e.web.request;
}
function Ae() {
  return Be$1();
}
const G$2 = Symbol("$HTTPEvent");
function Ue$1(e) {
  return typeof e == "object" && (e instanceof H3Event || (e == null ? void 0 : e[G$2]) instanceof H3Event || (e == null ? void 0 : e.__is_event__) === true);
}
function u$1(e) {
  return function(...s) {
    var _a;
    let t = s[0];
    if (Ue$1(t)) s[0] = t instanceof H3Event || t.__is_event__ ? t : t[G$2];
    else {
      if (!((_a = globalThis.app.config.server.experimental) == null ? void 0 : _a.asyncContext)) throw new Error("AsyncLocalStorage was not enabled. Use the `server.experimental.asyncContext: true` option in your app configuration to enable it. Or, pass the instance of HTTPEvent that you have as the first argument to the function.");
      if (t = Ae(), !t) throw new Error("No HTTPEvent found in AsyncLocalStorage. Make sure you are using the function within the server runtime.");
      s.unshift(t);
    }
    return e(...s);
  };
}
const J$1 = u$1(getRequestURL), je$1 = u$1(getRequestIP), w$1 = u$1(setResponseStatus), I$2 = u$1(getResponseStatus), Fe$1 = u$1(getResponseStatusText), y = u$1(getResponseHeaders), _$1 = u$1(getResponseHeader), Le$1 = u$1(setResponseHeader), V$1 = u$1(appendResponseHeader), Oe$1 = u$1(parseCookies), Ie$1 = u$1(getCookie), _e = u$1(setCookie), R$1 = u$1(setHeader), De$1 = u$1(getRequestWebStream), Me$1 = u$1(removeResponseHeader), We$1 = u$1(Ce);
function Ne$1() {
  var _a;
  return getContext("nitro-app", { asyncContext: !!((_a = globalThis.app.config.server.experimental) == null ? void 0 : _a.asyncContext), AsyncLocalStorage: AsyncLocalStorage });
}
function Be$1() {
  return Ne$1().use().event;
}
const S$1 = "Invariant Violation", { setPrototypeOf: Xe = function(e, s) {
  return e.__proto__ = s, e;
} } = Object;
class j extends Error {
  constructor(s = S$1) {
    super(typeof s == "number" ? `${S$1}: ${s} (see https://github.com/apollographql/invariant-packages)` : s);
    __publicField$2(this, "framesToPop", 1);
    __publicField$2(this, "name", S$1);
    Xe(this, j.prototype);
  }
}
function ze$1(e, s) {
  if (!e) throw new j(s);
}
const b$1 = "solidFetchEvent";
function Ge$1(e) {
  return { request: We$1(e), response: Qe$1(e), clientAddress: je$1(e), locals: {}, nativeEvent: e };
}
function Je(e) {
  return { ...e };
}
function Ve(e) {
  if (!e.context[b$1]) {
    const s = Ge$1(e);
    e.context[b$1] = s;
  }
  return e.context[b$1];
}
function D(e, s) {
  for (const [t, n] of s.entries()) V$1(e, t, n);
}
let Ke$1 = class Ke {
  constructor(s) {
    __publicField$2(this, "event");
    this.event = s;
  }
  get(s) {
    const t = _$1(this.event, s);
    return Array.isArray(t) ? t.join(", ") : t || null;
  }
  has(s) {
    return this.get(s) !== void 0;
  }
  set(s, t) {
    return Le$1(this.event, s, t);
  }
  delete(s) {
    return Me$1(this.event, s);
  }
  append(s, t) {
    V$1(this.event, s, t);
  }
  getSetCookie() {
    const s = _$1(this.event, "Set-Cookie");
    return Array.isArray(s) ? s : [s];
  }
  forEach(s) {
    return Object.entries(y(this.event)).forEach(([t, n]) => s(Array.isArray(n) ? n.join(", ") : n, t, this));
  }
  entries() {
    return Object.entries(y(this.event)).map(([s, t]) => [s, Array.isArray(t) ? t.join(", ") : t])[Symbol.iterator]();
  }
  keys() {
    return Object.keys(y(this.event))[Symbol.iterator]();
  }
  values() {
    return Object.values(y(this.event)).map((s) => Array.isArray(s) ? s.join(", ") : s)[Symbol.iterator]();
  }
  [Symbol.iterator]() {
    return this.entries()[Symbol.iterator]();
  }
};
function Qe$1(e) {
  return { get status() {
    return I$2(e);
  }, set status(s) {
    w$1(e, s);
  }, get statusText() {
    return Fe$1(e);
  }, set statusText(s) {
    w$1(e, I$2(e), s);
  }, headers: new Ke$1(e) };
}
const K$1 = [{ page: true, $component: { src: "src/routes/alerts.tsx?pick=default&pick=$css", build: () => import('../build/alerts.mjs'), import: () => import('../build/alerts.mjs') }, path: "/alerts", filePath: "/Users/david/Documents/Projects/network-monitor/apps/web/src/routes/alerts.tsx" }, { page: true, $component: { src: "src/routes/charts.tsx?pick=default&pick=$css", build: () => import('../build/charts.mjs'), import: () => import('../build/charts.mjs') }, path: "/charts", filePath: "/Users/david/Documents/Projects/network-monitor/apps/web/src/routes/charts.tsx" }, { page: true, $component: { src: "src/routes/index.tsx?pick=default&pick=$css", build: () => import('../build/index.mjs'), import: () => import('../build/index.mjs') }, path: "/", filePath: "/Users/david/Documents/Projects/network-monitor/apps/web/src/routes/index.tsx" }, { page: true, $component: { src: "src/routes/notifications.tsx?pick=default&pick=$css", build: () => import('../build/notifications.mjs'), import: () => import('../build/notifications.mjs') }, path: "/notifications", filePath: "/Users/david/Documents/Projects/network-monitor/apps/web/src/routes/notifications.tsx" }, { page: true, $component: { src: "src/routes/settings.tsx?pick=default&pick=$css", build: () => import('../build/settings.mjs'), import: () => import('../build/settings.mjs') }, path: "/settings", filePath: "/Users/david/Documents/Projects/network-monitor/apps/web/src/routes/settings.tsx" }, { page: true, $component: { src: "src/routes/targets.tsx?pick=default&pick=$css", build: () => import('../build/targets.mjs'), import: () => import('../build/targets.mjs') }, path: "/targets", filePath: "/Users/david/Documents/Projects/network-monitor/apps/web/src/routes/targets.tsx" }, { page: false, $GET: { src: "src/routes/api/trpc/[...trpc].ts?pick=GET", build: () => import('../build/_...trpc_.mjs'), import: () => import('../build/_...trpc_.mjs') }, $HEAD: { src: "src/routes/api/trpc/[...trpc].ts?pick=GET", build: () => import('../build/_...trpc_.mjs'), import: () => import('../build/_...trpc_.mjs') }, $POST: { src: "src/routes/api/trpc/[...trpc].ts?pick=POST", build: () => import('../build/_...trpc_2.mjs'), import: () => import('../build/_...trpc_2.mjs') }, path: "/api/trpc/*trpc", filePath: "/Users/david/Documents/Projects/network-monitor/apps/web/src/routes/api/trpc/[...trpc].ts" }], Ye = Ze$1(K$1.filter((e) => e.page));
function Ze$1(e) {
  function s(t, n, o, a) {
    const i = Object.values(t).find((c) => o.startsWith(c.id + "/"));
    return i ? (s(i.children || (i.children = []), n, o.slice(i.id.length)), t) : (t.push({ ...n, id: o, path: o.replace(/\([^)/]+\)/g, "").replace(/\/+/g, "/") }), t);
  }
  return e.sort((t, n) => t.path.length - n.path.length).reduce((t, n) => s(t, n, n.path, n.path), []);
}
function et$1(e) {
  return e.$HEAD || e.$GET || e.$POST || e.$PUT || e.$PATCH || e.$DELETE;
}
createRouter$1({ routes: K$1.reduce((e, s) => {
  if (!et$1(s)) return e;
  let t = s.path.replace(/\([^)/]+\)/g, "").replace(/\/+/g, "/").replace(/\*([^/]*)/g, (n, o) => `**:${o}`).split("/").map((n) => n.startsWith(":") || n.startsWith("*") ? n : encodeURIComponent(n)).join("/");
  if (/:[^/]*\?/g.test(t)) throw new Error(`Optional parameters are not supported in API routes: ${t}`);
  if (e[t]) throw new Error(`Duplicate API routes for "${t}" found at "${e[t].route.path}" and "${s.path}"`);
  return e[t] = { route: s }, e;
}, {}) });
var st$1 = " ";
const rt$1 = { style: (e) => ssrElement("style", e.attrs, () => e.children, true), link: (e) => ssrElement("link", e.attrs, void 0, true), script: (e) => e.attrs.src ? ssrElement("script", mergeProps(() => e.attrs, { get id() {
  return e.key;
} }), () => ssr(st$1), true) : null, noscript: (e) => ssrElement("noscript", e.attrs, () => escape(e.children), true) };
function nt$1(e, s) {
  let { tag: t, attrs: { key: n, ...o } = { key: void 0 }, children: a } = e;
  return rt$1[t]({ attrs: { ...o, nonce: s }, key: n, children: a });
}
function ot$1(e, s, t, n = "default") {
  return lazy(async () => {
    var _a;
    {
      const a = (await e.import())[n], c = (await ((_a = s.inputs) == null ? void 0 : _a[e.src].assets())).filter((d) => d.tag === "style" || d.attrs.rel === "stylesheet");
      return { default: (d) => [...c.map((h) => nt$1(h)), createComponent(a, d)] };
    }
  });
}
function Q() {
  function e(t) {
    return { ...t, ...t.$$route ? t.$$route.require().route : void 0, info: { ...t.$$route ? t.$$route.require().route.info : {}, filesystem: true }, component: t.$component && ot$1(t.$component, globalThis.MANIFEST.client, globalThis.MANIFEST.ssr), children: t.children ? t.children.map(e) : void 0 };
  }
  return Ye.map(e);
}
let M;
const vt$1 = isServer ? () => getRequestEvent().routes : () => M || (M = Q());
function at$1(e) {
  const s = Ie$1(e.nativeEvent, "flash");
  if (s) try {
    let t = JSON.parse(s);
    if (!t || !t.result) return;
    const n = [...t.input.slice(0, -1), new Map(t.input[t.input.length - 1])], o = t.error ? new Error(t.result) : t.result;
    return { input: n, url: t.url, pending: false, result: t.thrown ? void 0 : o, error: t.thrown ? o : void 0 };
  } catch (t) {
    console.error(t);
  } finally {
    _e(e.nativeEvent, "flash", "", { maxAge: 0 });
  }
}
async function it$1(e) {
  const s = globalThis.MANIFEST.client;
  return globalThis.MANIFEST.ssr, e.response.headers.set("Content-Type", "text/html"), Object.assign(e, { manifest: await s.json(), assets: [...await s.inputs[s.handler].assets()], router: { submission: at$1(e) }, routes: Q(), complete: false, $islands: /* @__PURE__ */ new Set() });
}
const ct$1 = /* @__PURE__ */ new Set([301, 302, 303, 307, 308]);
function ut(e) {
  return e.status && ct$1.has(e.status) ? e.status : 302;
}
const pt$1 = {};
function lt(e) {
  const s = new TextEncoder().encode(e), t = s.length, n = t.toString(16), o = "00000000".substring(0, 8 - n.length) + n, a = new TextEncoder().encode(`;0x${o};`), i = new Uint8Array(12 + t);
  return i.set(a), i.set(s, 12), i;
}
function W$1(e, s) {
  return new ReadableStream({ start(t) {
    crossSerializeStream(s, { scopeId: e, plugins: [CustomEventPlugin, DOMExceptionPlugin, EventPlugin, FormDataPlugin, HeadersPlugin, ReadableStreamPlugin, RequestPlugin, ResponsePlugin, URLSearchParamsPlugin, URLPlugin], onSerialize(n, o) {
      t.enqueue(lt(o ? `(${getCrossReferenceHeader(e)},${n})` : n));
    }, onDone() {
      t.close();
    }, onError(n) {
      t.error(n);
    } });
  } });
}
async function dt(e) {
  const s = Ve(e), t = s.request, n = t.headers.get("X-Server-Id"), o = t.headers.get("X-Server-Instance"), a = t.headers.has("X-Single-Flight"), i = new URL(t.url);
  let c, l;
  if (n) ze$1(typeof n == "string", "Invalid server function"), [c, l] = n.split("#");
  else if (c = i.searchParams.get("id"), l = i.searchParams.get("name"), !c || !l) return new Response(null, { status: 404 });
  const d = pt$1[c];
  let h;
  if (!d) return new Response(null, { status: 404 });
  h = await d.importer();
  const Y = h[d.functionName];
  let f = [];
  if (!o || e.method === "GET") {
    const r = i.searchParams.get("args");
    if (r) {
      const p = JSON.parse(r);
      (p.t ? fromJSON(p, { plugins: [CustomEventPlugin, DOMExceptionPlugin, EventPlugin, FormDataPlugin, HeadersPlugin, ReadableStreamPlugin, RequestPlugin, ResponsePlugin, URLSearchParamsPlugin, URLPlugin] }) : p).forEach((m) => f.push(m));
    }
  }
  if (e.method === "POST") {
    const r = t.headers.get("content-type"), p = e.node.req, m = p instanceof ReadableStream, Z = p.body instanceof ReadableStream, F = m && p.locked || Z && p.body.locked, L = m ? p : p.body;
    if ((r == null ? void 0 : r.startsWith("multipart/form-data")) || (r == null ? void 0 : r.startsWith("application/x-www-form-urlencoded"))) f.push(await (F ? t : new Request(t, { ...t, body: L })).formData());
    else if (r == null ? void 0 : r.startsWith("application/json")) {
      const ee = F ? t : new Request(t, { ...t, body: L });
      f = fromJSON(await ee.json(), { plugins: [CustomEventPlugin, DOMExceptionPlugin, EventPlugin, FormDataPlugin, HeadersPlugin, ReadableStreamPlugin, RequestPlugin, ResponsePlugin, URLSearchParamsPlugin, URLPlugin] });
    }
  }
  try {
    let r = await provideRequestEvent(s, async () => (sharedConfig.context = { event: s }, s.locals.serverFunctionMeta = { id: c + "#" + l }, Y(...f)));
    if (a && o && (r = await B$1(s, r)), r instanceof Response) {
      if (r.headers && r.headers.has("X-Content-Raw")) return r;
      o && (r.headers && D(e, r.headers), r.status && (r.status < 300 || r.status >= 400) && w$1(e, r.status), r.customBody ? r = await r.customBody() : r.body == null && (r = null));
    }
    return o ? (R$1(e, "content-type", "text/javascript"), W$1(o, r)) : N$1(r, t, f);
  } catch (r) {
    if (r instanceof Response) a && o && (r = await B$1(s, r)), r.headers && D(e, r.headers), r.status && (!o || r.status < 300 || r.status >= 400) && w$1(e, r.status), r.customBody ? r = r.customBody() : r.body == null && (r = null), R$1(e, "X-Error", "true");
    else if (o) {
      const p = r instanceof Error ? r.message : typeof r == "string" ? r : "true";
      R$1(e, "X-Error", p.replace(/[\r\n]+/g, ""));
    } else r = N$1(r, t, f, true);
    return o ? (R$1(e, "content-type", "text/javascript"), W$1(o, r)) : r;
  }
}
function N$1(e, s, t, n) {
  const o = new URL(s.url), a = e instanceof Error;
  let i = 302, c;
  return e instanceof Response ? (c = new Headers(e.headers), e.headers.has("Location") && (c.set("Location", new URL(e.headers.get("Location"), o.origin + "").toString()), i = ut(e))) : c = new Headers({ Location: new URL(s.headers.get("referer")).toString() }), e && c.append("Set-Cookie", `flash=${encodeURIComponent(JSON.stringify({ url: o.pathname + o.search, result: a ? e.message : e, thrown: n, error: a, input: [...t.slice(0, -1), [...t[t.length - 1].entries()]] }))}; Secure; HttpOnly;`), new Response(null, { status: i, headers: c });
}
let $;
function ft$1(e) {
  var _a;
  const s = new Headers(e.request.headers), t = Oe$1(e.nativeEvent), n = e.response.headers.getSetCookie();
  s.delete("cookie");
  let o = false;
  return ((_a = e.nativeEvent.node) == null ? void 0 : _a.req) && (o = true, e.nativeEvent.node.req.headers.cookie = ""), n.forEach((a) => {
    if (!a) return;
    const i = a.split(";")[0], [c, l] = i.split("=");
    c && l && (t[c] = l);
  }), Object.entries(t).forEach(([a, i]) => {
    s.append("cookie", `${a}=${i}`), o && (e.nativeEvent.node.req.headers.cookie += `${a}=${i};`);
  }), s;
}
async function B$1(e, s) {
  let t, n = new URL(e.request.headers.get("referer")).toString();
  s instanceof Response && (s.headers.has("X-Revalidate") && (t = s.headers.get("X-Revalidate").split(",")), s.headers.has("Location") && (n = new URL(s.headers.get("Location"), new URL(e.request.url).origin + "").toString()));
  const o = Je(e);
  return o.request = new Request(n, { headers: ft$1(e) }), await provideRequestEvent(o, async () => {
    await it$1(o), $ || ($ = (await import('../build/app-QiOgf4yA.mjs')).default), o.router.dataOnly = t || true, o.router.previousUrl = e.request.headers.get("referer");
    try {
      renderToString(() => {
        sharedConfig.context.event = o, $();
      });
    } catch (c) {
      console.log(c);
    }
    const a = o.router.data;
    if (!a) return s;
    let i = false;
    for (const c in a) a[c] === void 0 ? delete a[c] : i = true;
    return i && (s instanceof Response ? s.customBody && (a._$value = s.customBody()) : (a._$value = s, s = new Response(null, { status: 200 })), s.customBody = () => a, s.headers.set("X-Single-Flight", "true")), s;
  });
}
const kt$1 = eventHandler(dt);

var __defProp$1 = Object.defineProperty;
var __defNormalProp$1 = (obj, key, value) => key in obj ? __defProp$1(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField$1 = (obj, key, value) => __defNormalProp$1(obj, typeof key !== "symbol" ? key + "" : key, value);
class R {
  constructor() {
    __publicField$1(this, "listeners", /* @__PURE__ */ new Map());
  }
  emit(e, i) {
    const r = this.listeners.get(e);
    r && r.forEach((n) => {
      try {
        n(i);
      } catch (s) {
        console.error(`Error in event handler for ${e}:`, s);
      }
    });
  }
  emitTyped(e, i) {
    this.emit(e, i);
  }
  on(e, i) {
    this.listeners.has(e) || this.listeners.set(e, /* @__PURE__ */ new Set());
    const r = this.listeners.get(e);
    r && r.add(i);
  }
  onTyped(e, i) {
    this.on(e, i);
  }
  off(e, i) {
    const r = this.listeners.get(e);
    r && (r.delete(i), r.size === 0 && this.listeners.delete(e));
  }
  once(e, i) {
    const r = (n) => {
      i(n), this.off(e, r);
    };
    this.on(e, r);
  }
  onceTyped(e, i) {
    this.once(e, i);
  }
  removeAllListeners(e) {
    e ? this.listeners.delete(e) : this.listeners.clear();
  }
  getListenerCount(e) {
    var _a;
    return ((_a = this.listeners.get(e)) == null ? void 0 : _a.size) || 0;
  }
  getEvents() {
    return Array.from(this.listeners.keys());
  }
}
var a;
(function(o) {
  o[o.DEBUG = 0] = "DEBUG", o[o.INFO = 1] = "INFO", o[o.WARN = 2] = "WARN", o[o.ERROR = 3] = "ERROR";
})(a || (a = {}));
class m {
  constructor(e = a.INFO) {
    __publicField$1(this, "level", a.INFO);
    this.level = e;
  }
  debug(e, i) {
    this.level <= a.DEBUG && console.debug(`[DEBUG] ${e}`, i ? JSON.stringify(i, null, 2) : "");
  }
  info(e, i) {
    this.level <= a.INFO && console.info(`[INFO] ${e}`, i ? JSON.stringify(i, null, 2) : "");
  }
  warn(e, i) {
    this.level <= a.WARN && console.warn(`[WARN] ${e}`, i ? JSON.stringify(i, null, 2) : "");
  }
  error(e, i) {
    this.level <= a.ERROR && console.error(`[ERROR] ${e}`, i ? JSON.stringify(i, null, 2) : "");
  }
  setLevel(e) {
    this.level = e;
  }
  getLevel() {
    return this.level;
  }
}
class w {
  constructor() {
    __publicField$1(this, "services", /* @__PURE__ */ new Map());
    __publicField$1(this, "instances", /* @__PURE__ */ new Map());
    __publicField$1(this, "initialized", false);
  }
  register(e, i) {
    this.services.set(e, i);
  }
  get(e) {
    if (!this.initialized) throw new Error("Container not initialized. Call initialize() first.");
    if (!this.services.has(e)) throw new Error(`Service with key ${e.toString()} not found`);
    if (this.instances.has(e)) return this.instances.get(e);
    const i = this.services.get(e);
    if (!i) throw new Error(`Service configuration not found for key ${e.toString()}`);
    const r = i.factory(this);
    return i.singleton && this.instances.set(e, r), r;
  }
  has(e) {
    return this.services.has(e);
  }
  getRegisteredTypes() {
    return Array.from(this.services.keys());
  }
  async initialize() {
    if (!this.initialized) {
      for (const [e, i] of this.services) for (const r of i.dependencies) if (!this.services.has(r)) throw new Error(`Service ${e.toString()} depends on ${r.toString()} which is not registered`);
      this.initialized = true;
    }
  }
}
let g$1 = null;
function l() {
  return g$1 || (g$1 = new w()), g$1;
}
const t = { ILogger: Symbol("ILogger"), IEventBus: Symbol("IEventBus"), IDatabaseService: Symbol("IDatabaseService"), IMonitorService: Symbol("IMonitorService"), ISpeedTestService: Symbol("ISpeedTestService"), ISpeedTestConfigService: Symbol("ISpeedTestConfigService"), IAlertingService: Symbol("IAlertingService"), INotificationService: Symbol("INotificationService"), IAuthService: Symbol("IAuthService"), IUserRepository: Symbol("IUserRepository"), IMonitoringTargetRepository: Symbol("IMonitoringTargetRepository"), ISpeedTestResultRepository: Symbol("ISpeedTestResultRepository"), IAlertRuleRepository: Symbol("IAlertRuleRepository"), IIncidentEventRepository: Symbol("IIncidentEventRepository"), IPushSubscriptionRepository: Symbol("IPushSubscriptionRepository"), INotificationRepository: Symbol("INotificationRepository"), IUserSpeedTestPreferenceRepository: Symbol("IUserSpeedTestPreferenceRepository"), ITargetRepository: Symbol("ITargetRepository"), ISpeedTestRepository: Symbol("ISpeedTestRepository"), IAPIClient: Symbol("IAPIClient"), ICommandQueryService: Symbol("ICommandQueryService"), IPerformanceMonitor: Symbol("IPerformanceMonitor"), ICacheManager: Symbol("ICacheManager"), IPWAService: Symbol("IPWAService") }, d = { ILogger: t.ILogger, IEventBus: t.IEventBus, IDatabaseService: t.IDatabaseService, IMonitorService: t.IMonitorService, IAlertingService: t.IAlertingService, INotificationService: t.INotificationService, IAuthService: t.IAuthService, IUserRepository: t.IUserRepository, IMonitoringTargetRepository: t.IMonitoringTargetRepository, ISpeedTestResultRepository: t.ISpeedTestResultRepository, IAlertRuleRepository: t.IAlertRuleRepository, IIncidentEventRepository: t.IIncidentEventRepository, IPushSubscriptionRepository: t.IPushSubscriptionRepository, INotificationRepository: t.INotificationRepository, ITargetRepository: t.ITargetRepository, ISpeedTestRepository: t.ISpeedTestRepository, ISpeedTestConfigService: t.ISpeedTestConfigService, IUserSpeedTestPreferenceRepository: t.IUserSpeedTestPreferenceRepository };
class b {
  constructor(e = "service-config.json") {
    __publicField$1(this, "configPath");
    __publicField$1(this, "projectRoot");
    this.configPath = e, this.projectRoot = typeof process < "u" && typeof process.cwd == "function" ? process.cwd() : "/";
  }
  async loadConfiguration() {
    {
      const { join: e } = await import('path'), i = e(this.projectRoot, this.configPath), { readFileSync: r, existsSync: n } = await import('fs');
      if (!n(i)) throw new Error(`Configuration file not found: ${i}`);
      try {
        const s = r(i, "utf-8"), c = JSON.parse(s);
        return this.validateConfiguration(c), c;
      } catch (s) {
        throw new Error(`Failed to load configuration: ${s}`);
      }
    }
  }
  async convertToServiceConfig(e) {
    const i = {};
    for (const [r, n] of Object.entries(e.services)) {
      const s = d[r];
      if (!s) {
        console.warn(`[ConfigLoader] Unknown service type: ${r} - skipping`);
        continue;
      }
      try {
        const f = (await this.loadServiceModule(n.module))[n.className];
        if (!f) throw new Error(`Class ${n.className} not found in module ${n.module}`);
        const v = this.createServiceFactory(s, f), y = this.getServiceDependencies(s);
        i[s] = { factory: v, dependencies: y, singleton: true, description: n.description };
      } catch (c) {
        throw new Error(`Failed to load service ${r}: ${c}`);
      }
    }
    return i;
  }
  async loadServiceModule(e) {
    let i;
    if (e.startsWith("../")) {
      const r = e.replace("../", ""), { resolve: n } = await import('path');
      i = n(this.projectRoot, r);
    } else if (e.startsWith("./")) {
      const { resolve: r } = await import('path'), n = typeof process < "u" && typeof process.cwd == "function" ? process.cwd() : "/";
      i = r(n, e);
    } else i = e;
    try {
      return await import(i);
    } catch (r) {
      try {
        return await import(i + ".js");
      } catch (n) {
        try {
          return await import(i + ".ts");
        } catch (s) {
          throw new Error(`Failed to import module ${e} (tried ${i}, ${i}.js, ${i}.ts): ${r}. JS Error: ${n}. TS Error: ${s}`);
        }
      }
    }
  }
  createServiceFactory(e, i) {
    return (r) => {
      const s = this.getServiceDependencies(e).map((c) => r.get(c));
      return new i(...s);
    };
  }
  getServiceDependencies(e) {
    return { [t.ILogger]: [], [t.IEventBus]: [], [t.IDatabaseService]: [t.ILogger], [t.IUserRepository]: [t.IDatabaseService, t.ILogger], [t.IMonitoringTargetRepository]: [t.IDatabaseService, t.ILogger], [t.ISpeedTestResultRepository]: [t.IDatabaseService, t.ILogger], [t.IAlertRuleRepository]: [t.IDatabaseService, t.ILogger], [t.IIncidentEventRepository]: [t.IDatabaseService, t.ILogger], [t.IPushSubscriptionRepository]: [t.IDatabaseService, t.ILogger], [t.INotificationRepository]: [t.IDatabaseService, t.ILogger], [t.IUserSpeedTestPreferenceRepository]: [t.IDatabaseService, t.ILogger], [t.ITargetRepository]: [t.IDatabaseService, t.ILogger], [t.ISpeedTestRepository]: [t.IDatabaseService, t.ILogger], [t.IMonitorService]: [t.ITargetRepository, t.ISpeedTestRepository, t.IMonitoringTargetRepository, t.ISpeedTestResultRepository, t.IUserSpeedTestPreferenceRepository, t.ISpeedTestConfigService, t.IEventBus, t.ILogger], [t.IAlertingService]: [t.IAlertRuleRepository, t.IIncidentEventRepository, t.IEventBus, t.ILogger], [t.INotificationService]: [t.INotificationRepository, t.IPushSubscriptionRepository, t.IEventBus, t.ILogger], [t.IAuthService]: [t.ILogger] }[e] || [];
  }
  validateConfiguration(e) {
    if (!e.name || !e.description || !e.environment) throw new Error("Configuration must have name, description, and environment");
    if (!e.services || typeof e.services != "object") throw new Error("Configuration must have services object");
    for (const [i, r] of Object.entries(e.services)) {
      if (!r.module || !r.className || !r.description) throw new Error(`Service ${i} must have module, className, and description`);
      d[i] || console.warn(`[ConfigLoader] Unknown service type in validation: ${i}`);
    }
  }
  static async getAvailableConfigurations() {
    const { join: e } = await import('path'), i = typeof process < "u" && typeof process.cwd == "function" ? process.cwd() : "/", r = e(i, "configs"), n = ["all-concrete.json", "auth-mock-only.json", "all-mock.json", "offline-development.json", "performance-testing.json", "database-testing.json", "notification-testing.json", "monitoring-testing.json", "alerting-testing.json"], { existsSync: s } = await import('fs');
    return n.filter((c) => s(e(r, c)));
  }
}
let u = false;
async function h$1(o) {
  if (!u) try {
    const e = l(), i = new b(o), r = await i.loadConfiguration();
    console.log(`\u{1F4CB} Loading configuration: ${r.name} (${r.environment})`);
    const n = await i.convertToServiceConfig(r);
    for (const s of Object.getOwnPropertySymbols(n)) {
      const c = n[s];
      e.register(s, c);
    }
    await e.initialize(), e.has(t.IDatabaseService) && await e.get(t.IDatabaseService).connect(), u = true, e.has(t.ILogger) ? e.get(t.ILogger).info("Container initialized with JSON configuration") : console.log("\u2705 Container initialized with JSON configuration");
  } catch (e) {
    try {
      const i = l();
      if (i.has(t.ILogger)) i.get(t.ILogger).error("Failed to initialize container with JSON configuration", { error: e });
      else throw new Error("Logger not available");
    } catch {
      console.error("\u274C Failed to initialize container with JSON configuration:", e);
    }
    throw e instanceof Error ? e : new Error(String(e));
  }
}
async function U$2() {
  await h$1();
  const o = l();
  return { userId: null, services: { logger: o.has(t.ILogger) ? o.get(t.ILogger) : null, eventBus: o.has(t.IEventBus) ? o.get(t.IEventBus) : null, database: o.has(t.IDatabaseService) ? o.get(t.IDatabaseService) : null, monitor: o.has(t.IMonitorService) ? o.get(t.IMonitorService) : null, alerting: o.has(t.IAlertingService) ? o.get(t.IAlertingService) : null, notification: o.has(t.INotificationService) ? o.get(t.INotificationService) : null, auth: o.has(t.IAuthService) ? o.get(t.IAuthService) : null, speedTestConfigService: o.has(t.ISpeedTestConfigService) ? o.get(t.ISpeedTestConfigService) : null }, repositories: { user: o.has(t.IUserRepository) ? o.get(t.IUserRepository) : null, monitoringTarget: o.has(t.IMonitoringTargetRepository) ? o.get(t.IMonitoringTargetRepository) : null, speedTestResult: o.has(t.ISpeedTestResultRepository) ? o.get(t.ISpeedTestResultRepository) : null, alertRule: o.has(t.IAlertRuleRepository) ? o.get(t.IAlertRuleRepository) : null, incidentEvent: o.has(t.IIncidentEventRepository) ? o.get(t.IIncidentEventRepository) : null, pushSubscription: o.has(t.IPushSubscriptionRepository) ? o.get(t.IPushSubscriptionRepository) : null, notification: o.has(t.INotificationRepository) ? o.get(t.INotificationRepository) : null, target: o.has(t.ITargetRepository) ? o.get(t.ITargetRepository) : null, speedTest: o.has(t.ISpeedTestRepository) ? o.get(t.ISpeedTestRepository) : null, userSpeedTestPreference: o.has(t.IUserSpeedTestPreferenceRepository) ? o.get(t.IUserSpeedTestPreferenceRepository) : null } };
}
class T {
  constructor(e) {
    __publicField$1(this, "config");
    __publicField$1(this, "logger");
    var _a;
    this.logger = e, this.config = this.getDefaultConfig(), (_a = this.logger) == null ? void 0 : _a.debug("MockSpeedTestConfigService: Initialized with default configuration");
  }
  getDefaultConfig() {
    return { urls: [{ id: "mock-10mb", name: "Mock 10MB Test", url: "https://httpbin.org/bytes/10485760", sizeBytes: 10 * 1024 * 1024, provider: "Mock", region: "Test", enabled: true, priority: 1, description: "Mock test file for browser testing" }], defaultProvider: "Mock", maxConcurrentTests: 1, timeoutMs: 3e4, retryAttempts: 1, fallbackEnabled: false };
  }
  getAllUrls() {
    return [...this.config.urls];
  }
  getEnabledUrls() {
    return this.config.urls.filter((e) => e.enabled);
  }
  getUrlsByProvider(e) {
    return this.config.urls.filter((i) => i.provider === e);
  }
  getUrlsBySize(e) {
    return this.config.urls.filter((i) => i.sizeBytes === e);
  }
  addCustomUrl(e) {
    var _a;
    const i = { ...e, id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` };
    return this.config.urls.push(i), (_a = this.logger) == null ? void 0 : _a.debug("MockSpeedTestConfigService: Added custom URL", { url: i }), i;
  }
  updateUrl(e, i) {
    var _a, _b;
    const r = this.config.urls.findIndex((s) => s.id === e);
    if (r === -1) return (_a = this.logger) == null ? void 0 : _a.warn("MockSpeedTestConfigService: URL not found for update", { id: e }), null;
    const n = { ...this.config.urls[r], ...i };
    return this.config.urls[r] = n, (_b = this.logger) == null ? void 0 : _b.debug("MockSpeedTestConfigService: Updated URL", { id: e, updates: i }), n;
  }
  removeUrl(e) {
    var _a, _b;
    const i = this.config.urls.findIndex((r) => r.id === e);
    return i === -1 ? ((_a = this.logger) == null ? void 0 : _a.warn("MockSpeedTestConfigService: URL not found for removal", { id: e }), false) : (this.config.urls.splice(i, 1), (_b = this.logger) == null ? void 0 : _b.debug("MockSpeedTestConfigService: Removed URL", { id: e }), true);
  }
  enableUrl(e) {
    var _a, _b;
    const i = this.config.urls.find((r) => r.id === e);
    return i ? (i.enabled = true, (_a = this.logger) == null ? void 0 : _a.debug("MockSpeedTestConfigService: Enabled URL", { id: e }), true) : ((_b = this.logger) == null ? void 0 : _b.warn("MockSpeedTestConfigService: URL not found for enabling", { id: e }), false);
  }
  disableUrl(e) {
    var _a, _b;
    const i = this.config.urls.find((r) => r.id === e);
    return i ? (i.enabled = false, (_a = this.logger) == null ? void 0 : _a.debug("MockSpeedTestConfigService: Disabled URL", { id: e }), true) : ((_b = this.logger) == null ? void 0 : _b.warn("MockSpeedTestConfigService: URL not found for disabling", { id: e }), false);
  }
  selectBestUrl(e = {}) {
    return { selectedUrl: this.getEnabledUrls()[0] || this.config.urls[0], fallbackUrls: [], selectionReason: "Mock service - single test URL" };
  }
  getConfig() {
    return { ...this.config };
  }
  updateConfig(e) {
    var _a;
    this.config = { ...this.config, ...e }, (_a = this.logger) == null ? void 0 : _a.debug("MockSpeedTestConfigService: Updated configuration", { config: e });
  }
  resetToDefaults() {
    var _a;
    this.config = this.getDefaultConfig(), (_a = this.logger) == null ? void 0 : _a.debug("MockSpeedTestConfigService: Reset to default configuration");
  }
  validateUrl(e) {
    try {
      return new URL(e), e.startsWith("http://") || e.startsWith("https://");
    } catch {
      return false;
    }
  }
  validateUrlConfig(e) {
    const i = [];
    return (!e.id || e.id.trim() === "") && i.push("ID is required"), (!e.name || e.name.trim() === "") && i.push("Name is required"), this.validateUrl(e.url) || i.push("Invalid URL format"), (!e.provider || e.provider.trim() === "") && i.push("Provider is required"), e.sizeBytes <= 0 && i.push("Size must be greater than 0"), e.priority < 0 && i.push("Priority must be non-negative"), { valid: i.length === 0, errors: i };
  }
  getUrlStats() {
    const e = this.getEnabledUrls(), i = [...new Set(this.config.urls.map((s) => s.provider))], r = this.config.urls.map((s) => s.sizeBytes), n = { min: Math.min(...r), max: Math.max(...r) };
    return { totalUrls: this.config.urls.length, enabledUrls: e.length, providers: i, sizeRange: n };
  }
}
const p = { [t.ILogger]: { factory: () => new m(a.DEBUG), dependencies: [], singleton: true, description: "Browser logger service" }, [t.IEventBus]: { factory: () => new R(), dependencies: [], singleton: true, description: "Browser event bus" }, [t.ISpeedTestConfigService]: { factory: (o) => new T(o.get(t.ILogger)), dependencies: [t.ILogger], singleton: true, description: "Mock speed test URL configuration service for browser" } };
let I$1 = false;
async function C$1() {
  if (I$1) return;
  const o = l();
  for (const e of Object.getOwnPropertySymbols(p)) o.register(e, p[e]);
  await o.initialize(), I$1 = true;
}
let S = false;
async function E() {
  if (!S) {
    if (typeof process < "u" && typeof process.cwd == "function") {
      const { join: o } = await import('path'), e = process.cwd(), i = o(e, "service-config.json"), { existsSync: r } = await import('fs');
      if (r(i)) try {
        await h$1(), S = true;
        return;
      } catch (n) {
        console.warn("\u26A0\uFE0F Failed to load JSON configuration, falling back to hardcoded configuration:", n instanceof Error ? n.message : String(n));
      }
    }
    throw console.error("\u274C No service configuration found! JSON config is required."), new Error("Service configuration not found. Please ensure service-config.json exists in the project root.");
  }
}
process.env.SKIP_AUTO_INIT !== "true" && !"production".includes("web") && !process.env.VITE && E().catch((o) => {
  console.error("Failed to initialize container:", o);
});

function Pe() {
  let n = /* @__PURE__ */ new Set();
  function e(s) {
    return n.add(s), () => n.delete(s);
  }
  let t = false;
  function r(s, i) {
    if (t) return !(t = false);
    const a = { to: s, options: i, defaultPrevented: false, preventDefault: () => a.defaultPrevented = true };
    for (const c of n) c.listener({ ...a, from: c.location, retry: (g) => {
      g && (t = true), c.navigate(s, { ...i, resolve: false });
    } });
    return !a.defaultPrevented;
  }
  return { subscribe: e, confirm: r };
}
let G$1;
function ee$1() {
  (!window.history.state || window.history.state._depth == null) && window.history.replaceState({ ...window.history.state, _depth: window.history.length - 1 }, ""), G$1 = window.history.state._depth;
}
isServer || ee$1();
function Ze(n) {
  return { ...n, _depth: window.history.state && window.history.state._depth };
}
function et(n, e) {
  let t = false;
  return () => {
    const r = G$1;
    ee$1();
    const s = r == null ? null : G$1 - r;
    if (t) {
      t = false;
      return;
    }
    s && e(s) ? (t = true, window.history.go(-s)) : n();
  };
}
const De = /^(?:[a-z0-9]+:)?\/\//i, Qe = /^\/+|(\/)\/+$/g, Le = "http://sr";
function _(n, e = false) {
  const t = n.replace(Qe, "$1");
  return t ? e || /^[?#]/.test(t) ? t : "/" + t : "";
}
function U$1(n, e, t) {
  if (De.test(e)) return;
  const r = _(n), s = t && _(t);
  let i = "";
  return !s || e.startsWith("/") ? i = r : s.toLowerCase().indexOf(r.toLowerCase()) !== 0 ? i = r + s : i = s, (i || "/") + _(e, !i);
}
function Be(n, e) {
  if (n == null) throw new Error(e);
  return n;
}
function Oe(n, e) {
  return _(n).replace(/\/*(\*.*)?$/g, "") + _(e);
}
function te$1(n) {
  const e = {};
  return n.searchParams.forEach((t, r) => {
    r in e ? Array.isArray(e[r]) ? e[r].push(t) : e[r] = [e[r], t] : e[r] = t;
  }), e;
}
function Ie(n, e, t) {
  const [r, s] = n.split("/*", 2), i = r.split("/").filter(Boolean), a = i.length;
  return (c) => {
    const g = c.split("/").filter(Boolean), d = g.length - a;
    if (d < 0 || d > 0 && s === void 0 && !e) return null;
    const l = { path: a ? "" : "/", params: {} }, y = (p) => t === void 0 ? void 0 : t[p];
    for (let p = 0; p < a; p++) {
      const m = i[p], f = m[0] === ":", S = f ? g[p] : g[p].toLowerCase(), b = f ? m.slice(1) : m.toLowerCase();
      if (f && F$1(S, y(b))) l.params[b] = S;
      else if (f || !F$1(S, b)) return null;
      l.path += `/${S}`;
    }
    if (s) {
      const p = d ? g.slice(-d).join("/") : "";
      if (F$1(p, y(s))) l.params[s] = p;
      else return null;
    }
    return l;
  };
}
function F$1(n, e) {
  const t = (r) => r === n;
  return e === void 0 ? true : typeof e == "string" ? t(e) : typeof e == "function" ? e(n) : Array.isArray(e) ? e.some(t) : e instanceof RegExp ? e.test(n) : false;
}
function Ue(n) {
  const [e, t] = n.pattern.split("/*", 2), r = e.split("/").filter(Boolean);
  return r.reduce((s, i) => s + (i.startsWith(":") ? 2 : 3), r.length - (t === void 0 ? 0 : 1));
}
function re$1(n) {
  const e = /* @__PURE__ */ new Map(), t = getOwner();
  return new Proxy({}, { get(r, s) {
    return e.has(s) || runWithOwner(t, () => e.set(s, createMemo(() => n()[s]))), e.get(s)();
  }, getOwnPropertyDescriptor() {
    return { enumerable: true, configurable: true };
  }, ownKeys() {
    return Reflect.ownKeys(n());
  } });
}
function ne$1(n) {
  let e = /(\/?\:[^\/]+)\?/.exec(n);
  if (!e) return [n];
  let t = n.slice(0, e.index), r = n.slice(e.index + e[0].length);
  const s = [t, t += e[1]];
  for (; e = /^(\/\:[^\/]+)\?/.exec(r); ) s.push(t += e[1]), r = r.slice(e[0].length);
  return ne$1(r).reduce((i, a) => [...i, ...s.map((c) => c + a)], []);
}
const xe = 100, Fe = createContext$1(), se$1 = createContext$1(), q$1 = () => Be(useContext(Fe), "<A> and 'use' router primitives can be only used inside a Route."), Ne = () => useContext(se$1) || q$1().base, tt = (n) => {
  const e = Ne();
  return createMemo(() => e.resolvePath(n()));
}, rt = (n) => {
  const e = q$1();
  return createMemo(() => {
    const t = n();
    return t !== void 0 ? e.renderPath(t) : t;
  });
}, nt = () => q$1().location;
function Ge(n, e = "") {
  const { component: t, preload: r, load: s, children: i, info: a } = n, c = !i || Array.isArray(i) && !i.length, g = { key: n, component: t, preload: r || s, info: a };
  return ie(n.path).reduce((d, l) => {
    for (const y of ne$1(l)) {
      const p = Oe(e, y);
      let m = c ? p : p.split("/*", 1)[0];
      m = m.split("/").map((f) => f.startsWith(":") || f.startsWith("*") ? f : encodeURIComponent(f)).join("/"), d.push({ ...g, originalPath: l, pattern: m, matcher: Ie(m, !c, n.matchFilters) });
    }
    return d;
  }, []);
}
function ke(n, e = 0) {
  return { routes: n, score: Ue(n[n.length - 1]) * 1e4 - e, matcher(t) {
    const r = [];
    for (let s = n.length - 1; s >= 0; s--) {
      const i = n[s], a = i.matcher(t);
      if (!a) return null;
      r.unshift({ ...a, route: i });
    }
    return r;
  } };
}
function ie(n) {
  return Array.isArray(n) ? n : [n];
}
function qe(n, e = "", t = [], r = []) {
  const s = ie(n);
  for (let i = 0, a = s.length; i < a; i++) {
    const c = s[i];
    if (c && typeof c == "object") {
      c.hasOwnProperty("path") || (c.path = "");
      const g = Ge(c, e);
      for (const d of g) {
        t.push(d);
        const l = Array.isArray(c.children) && c.children.length === 0;
        if (c.children && !l) qe(c.children, d.pattern, t, r);
        else {
          const y = ke([...t], r.length);
          r.push(y);
        }
        t.pop();
      }
    }
  }
  return t.length ? r : r.sort((i, a) => a.score - i.score);
}
function N(n, e) {
  for (let t = 0, r = n.length; t < r; t++) {
    const s = n[t].matcher(e);
    if (s) return s;
  }
  return [];
}
function Me(n, e, t) {
  const r = new URL(Le), s = createMemo((l) => {
    const y = n();
    try {
      return new URL(y, r);
    } catch {
      return console.error(`Invalid path ${y}`), l;
    }
  }, r, { equals: (l, y) => l.href === y.href }), i = createMemo(() => s().pathname), a = createMemo(() => s().search, true), c = createMemo(() => s().hash), g = () => "", d = on(a, () => te$1(s()));
  return { get pathname() {
    return i();
  }, get search() {
    return a();
  }, get hash() {
    return c();
  }, get state() {
    return e();
  }, get key() {
    return g();
  }, query: t ? t(d) : re$1(d) };
}
let C;
function st() {
  return C;
}
function it(n, e, t, r = {}) {
  const { signal: [s, i], utils: a = {} } = n, c = a.parsePath || ((o) => o), g = a.renderPath || ((o) => o), d = a.beforeLeave || Pe(), l = U$1("", r.base || "");
  if (l === void 0) throw new Error(`${l} is not a valid base path`);
  l && !s().value && i({ value: l, replace: true, scroll: false });
  const [y, p] = createSignal(false);
  let m;
  const f = (o, u) => {
    u.value === S() && u.state === P() || (m === void 0 && p(true), C = o, m = u, startTransition(() => {
      m === u && (b(m.value), oe(m.state), resetErrorBoundaries(), isServer || M[1]([]));
    }).finally(() => {
      m === u && batch(() => {
        C = void 0, o === "navigate" && ge(m), p(false), m = void 0;
      });
    }));
  }, [S, b] = createSignal(s().value), [P, oe] = createSignal(s().state), D = Me(S, P, a.queryWrapper), Q = [], M = createSignal(isServer ? de() : []), j = createMemo(() => typeof r.transformUrl == "function" ? N(e(), r.transformUrl(D.pathname)) : N(e(), D.pathname)), $ = () => {
    const o = j(), u = {};
    for (let v = 0; v < o.length; v++) Object.assign(u, o[v].params);
    return u;
  }, ce = a.paramsWrapper ? a.paramsWrapper($, e) : re$1($), z = { pattern: l, path: () => l, outlet: () => null, resolvePath(o) {
    return U$1(l, o);
  } };
  return createRenderEffect(on(s, (o) => f("native", o), { defer: true })), { base: z, location: D, params: ce, isRouting: y, renderPath: g, parsePath: c, navigatorFactory: le, matches: j, beforeLeave: d, preloadRoute: he, singleFlight: r.singleFlight === void 0 ? true : r.singleFlight, submissions: M };
  function ue(o, u, v) {
    untrack(() => {
      if (typeof u == "number") {
        u && (a.go ? a.go(u) : console.warn("Router integration does not support relative routing"));
        return;
      }
      const L = !u || u[0] === "?", { replace: B, resolve: T, scroll: O, state: E } = { replace: false, resolve: !L, scroll: true, ...v }, A = T ? o.resolvePath(u) : U$1(L && D.pathname || "", u);
      if (A === void 0) throw new Error(`Path '${u}' is not a routable path`);
      if (Q.length >= xe) throw new Error("Too many redirects");
      const H = S();
      if (A !== H || E !== P()) if (isServer) {
        const W = getRequestEvent();
        W && (W.response = { status: 302, headers: new Headers({ Location: A }) }), i({ value: A, replace: B, scroll: O, state: E });
      } else d.confirm(A, v) && (Q.push({ value: H, replace: B, scroll: O, state: P() }), f("navigate", { value: A, state: E }));
    });
  }
  function le(o) {
    return o = o || useContext(se$1) || z, (u, v) => ue(o, u, v);
  }
  function ge(o) {
    const u = Q[0];
    u && (i({ ...o, replace: u.replace, scroll: u.scroll }), Q.length = 0);
  }
  function he(o, u) {
    const v = N(e(), o.pathname), L = C;
    C = "preload";
    for (let B in v) {
      const { route: T, params: O } = v[B];
      T.component && T.component.preload && T.component.preload();
      const { preload: E } = T;
      u && E && runWithOwner(t(), () => E({ params: O, location: { pathname: o.pathname, search: o.search, hash: o.hash, query: te$1(o), state: null, key: "" }, intent: "preload" }));
    }
    C = L;
  }
  function de() {
    const o = getRequestEvent();
    return o && o.router && o.router.submission ? [o.router.submission] : [];
  }
}
function at(n, e, t, r) {
  const { base: s, location: i, params: a } = n, { pattern: c, component: g, preload: d } = r().route, l = createMemo(() => r().path);
  g && g.preload && g.preload();
  const y = d ? d({ params: a, location: i, intent: C || "initial" }) : void 0;
  return { parent: e, pattern: c, path: l, outlet: () => g ? createComponent(g, { params: a, location: i, data: y, get children() {
    return t();
  } }) : t(), resolvePath(m) {
    return U$1(s.path(), m, l());
  } };
}
const h = createTRPCProxyClient({ links: [httpBatchLink({ url: "/api/trpc" })] });
class je {
  async createTarget(e) {
    const t = await h.targets.create.mutate({ name: e.name, address: e.address });
    if (!t) throw new Error("Failed to create target");
    return t;
  }
  async getTarget(e) {
    try {
      const t = await h.targets.getById.query({ id: e });
      return t || null;
    } catch (t) {
      if (t instanceof Error && t.message.includes("not found")) return null;
      throw t;
    }
  }
  async getTargets() {
    return await h.targets.getAll.query() || [];
  }
  async updateTarget(e, t) {
    const r = await h.targets.update.mutate({ id: e, ...t });
    if (!r) throw new Error("Failed to update target");
    return r;
  }
  async deleteTarget(e) {
    await h.targets.delete.mutate({ id: e });
  }
  async runSpeedTest(e, t) {
    const r = await this.getTarget(e);
    if (!r) throw new Error("Target not found");
    const s = await h.speedTests.runTest.mutate({ targetId: e, target: r.address });
    if (!s) throw new Error("Failed to run speed test");
    return s;
  }
  async startMonitoring(e, t) {
    await h.targets.startMonitoring.mutate({ targetId: e, intervalMs: t });
  }
  async stopMonitoring(e) {
    await h.targets.stopMonitoring.mutate({ targetId: e });
  }
  async getActiveTargets() {
    return await h.targets.getActiveTargets.query();
  }
  async getTargetResults(e, t) {
    return await h.speedTests.getByTargetId.query({ targetId: e, limit: t }) || [];
  }
  async createAlertRule(e) {
    const t = await h.alertRules.create.mutate(e);
    if (!t) throw new Error("Failed to create alert rule");
    return t;
  }
  async getAlertRules(e) {
    return await h.alertRules.getByTargetId.query({ targetId: e }) || [];
  }
  async updateAlertRule(e, t) {
    const r = await h.alertRules.update.mutate({ id: e, ...t });
    if (!r) throw new Error("Failed to update alert rule");
    return r;
  }
  async deleteAlertRule(e) {
    await h.alertRules.delete.mutate({ id: e });
  }
  async getIncidents(e) {
    return (await h.incidents.getByTargetId.query({ targetId: e }) || []).map((r) => ({ ...r, timestamp: typeof r.timestamp == "string" ? r.timestamp : r.timestamp.toISOString() }));
  }
  async resolveIncident(e) {
    await h.incidents.resolve.mutate({ id: e });
  }
  async getNotifications(e) {
    return (await h.notifications.getByUserId.query({ userId: e }) || []).map((r) => ({ ...r, sentAt: typeof r.sentAt == "string" ? r.sentAt : r.sentAt.toISOString() }));
  }
  async markNotificationAsRead(e) {
    await h.notifications.markAsRead.mutate({ id: e });
  }
  async markAllNotificationsAsRead(e) {
    await h.notifications.markAllAsRead.mutate();
  }
  async createPushSubscription(e) {
    const t = await h.pushSubscriptions.create.mutate({ endpoint: e.endpoint, p256dh: e.p256dh, auth: e.auth });
    if (!t) throw new Error("Failed to create push subscription");
    return t;
  }
  async getPushSubscriptions(e) {
    return await h.pushSubscriptions.getByUserId.query() || [];
  }
  async deletePushSubscription(e) {
    await h.pushSubscriptions.delete.mutate({ id: e });
  }
  async sendPushNotification(e) {
    throw new Error("sendPushNotification not yet implemented with tRPC");
  }
  mapUser(e) {
    var _a, _b, _c;
    return { id: e.id, name: (_a = e.name) != null ? _a : void 0, email: (_b = e.email) != null ? _b : void 0, image: (_c = e.image) != null ? _c : void 0 };
  }
  async signIn(e, t) {
    throw new Error("signIn not yet implemented with tRPC");
  }
  async signUp(e, t, r) {
    throw new Error("signUp not yet implemented with tRPC");
  }
  async signOut() {
    throw new Error("signOut not yet implemented with tRPC");
  }
  async getCurrentUser() {
    const e = await h.users.getCurrent.query();
    return e ? this.mapUser(e) : null;
  }
  async getSession() {
    const e = await this.getCurrentUser();
    return e ? { user: e, expires: new Date(Date.now() + 720 * 60 * 60 * 1e3).toISOString(), accessToken: "mock-access-token" } : null;
  }
  async isAuthenticated() {
    return await this.getCurrentUser() !== null;
  }
}
class $e {
  constructor(e, t, r) {
    this.apiClient = e, this.eventBus = t, this.logger = r;
  }
  async createTarget(e) {
    this.logger.debug("CommandQueryService: Creating target", e);
    try {
      const t = await this.apiClient.createTarget(e);
      return this.eventBus.emitTyped("TARGETS_LOADED", { targets: [t] }), t;
    } catch (t) {
      throw this.logger.error("CommandQueryService: Target creation failed", { error: t, data: e }), this.eventBus.emitTyped("TARGETS_LOAD_FAILED", { error: t instanceof Error ? t.message : "An error occurred" }), t;
    }
  }
  async updateTarget(e, t) {
    this.logger.debug("CommandQueryService: Updating target", { id: e, data: t });
    try {
      const r = await this.apiClient.updateTarget(e, t);
      return this.eventBus.emitTyped("TARGETS_LOADED", { targets: [r] }), r;
    } catch (r) {
      throw this.logger.error("CommandQueryService: Target update failed", { error: r, id: e, data: t }), this.eventBus.emitTyped("TARGETS_LOAD_FAILED", { error: r instanceof Error ? r.message : "An error occurred" }), r;
    }
  }
  async deleteTarget(e) {
    this.logger.debug("CommandQueryService: Deleting target", { id: e });
    try {
      await this.apiClient.deleteTarget(e);
      const t = await this.getTargets();
      this.eventBus.emitTyped("TARGETS_LOADED", { targets: t });
    } catch (t) {
      throw this.logger.error("CommandQueryService: Target deletion failed", { error: t, id: e }), this.eventBus.emitTyped("TARGETS_LOAD_FAILED", { error: t instanceof Error ? t.message : "An error occurred" }), t;
    }
  }
  async runSpeedTest(e, t) {
    this.logger.debug("CommandQueryService: Running speed test", { targetId: e, timeout: t });
    try {
      const r = await this.apiClient.runSpeedTest(e, t);
      return this.eventBus.emitTyped("SPEED_TEST_RESULTS_LOADED", { targetId: e, results: [r] }), r;
    } catch (r) {
      throw this.logger.error("CommandQueryService: Speed test failed", { error: r, targetId: e }), this.eventBus.emitTyped("SPEED_TEST_RESULTS_LOAD_FAILED", { targetId: e, error: r instanceof Error ? r.message : "An error occurred" }), r;
    }
  }
  async startMonitoring(e, t) {
    this.logger.debug("CommandQueryService: Starting monitoring", { targetId: e, intervalMs: t });
    try {
      await this.apiClient.startMonitoring(e, t);
    } catch (r) {
      throw this.logger.error("CommandQueryService: Start monitoring failed", { error: r, targetId: e, intervalMs: t }), r;
    }
  }
  async stopMonitoring(e) {
    this.logger.debug("CommandQueryService: Stopping monitoring", { targetId: e });
    try {
      await this.apiClient.stopMonitoring(e);
    } catch (t) {
      throw this.logger.error("CommandQueryService: Stop monitoring failed", { error: t, targetId: e }), t;
    }
  }
  async getTarget(e) {
    this.logger.debug("CommandQueryService: Getting target", { id: e });
    try {
      return await this.apiClient.getTarget(e);
    } catch (t) {
      throw this.logger.error("CommandQueryService: Get target failed", { error: t, id: e }), t;
    }
  }
  async getTargets() {
    this.logger.debug("CommandQueryService: Getting targets");
    try {
      const e = await this.apiClient.getTargets();
      return this.eventBus.emitTyped("TARGETS_LOADED", { targets: e }), e;
    } catch (e) {
      throw this.logger.error("CommandQueryService: Get targets failed", { error: e }), this.eventBus.emitTyped("TARGETS_LOAD_FAILED", { error: e instanceof Error ? e.message : "An error occurred" }), e;
    }
  }
  async getActiveTargets() {
    this.logger.debug("CommandQueryService: Getting active targets");
    try {
      return await this.apiClient.getActiveTargets();
    } catch (e) {
      throw this.logger.error("CommandQueryService: Get active targets failed", { error: e }), e;
    }
  }
  async getTargetResults(e, t) {
    this.logger.debug("CommandQueryService: Getting target results", { targetId: e, limit: t });
    try {
      const r = await this.apiClient.getTargetResults(e, t);
      return this.eventBus.emitTyped("SPEED_TEST_RESULTS_LOADED", { targetId: e, results: r }), r;
    } catch (r) {
      throw this.logger.error("CommandQueryService: Get target results failed", { error: r, targetId: e }), this.eventBus.emitTyped("SPEED_TEST_RESULTS_LOAD_FAILED", { targetId: e, error: r instanceof Error ? r.message : "An error occurred" }), r;
    }
  }
  async createAlertRule(e) {
    this.logger.debug("CommandQueryService: Creating alert rule", e);
    try {
      const t = await this.apiClient.createAlertRule(e);
      return this.eventBus.emitTyped("ALERT_RULES_LOADED", { targetId: e.targetId, rules: [t] }), t;
    } catch (t) {
      throw this.logger.error("CommandQueryService: Alert rule creation failed", { error: t, data: e }), t;
    }
  }
  async updateAlertRule(e, t) {
    this.logger.debug("CommandQueryService: Updating alert rule", { id: e, data: t });
    try {
      const r = await this.apiClient.updateAlertRule(e, t);
      return this.eventBus.emitTyped("ALERT_RULES_LOADED", { targetId: r.targetId, rules: [r] }), r;
    } catch (r) {
      throw this.logger.error("CommandQueryService: Alert rule update failed", { error: r, id: e, data: t }), r;
    }
  }
  async deleteAlertRule(e) {
    this.logger.debug("CommandQueryService: Deleting alert rule", { id: e });
    try {
      await this.apiClient.deleteAlertRule(e), this.eventBus.emitTyped("ALERT_RULE_DELETED", { id: e });
    } catch (t) {
      throw this.logger.error("CommandQueryService: Alert rule deletion failed", { error: t, id: e }), t;
    }
  }
  async resolveIncident(e) {
    this.logger.debug("CommandQueryService: Resolving incident", { id: e });
    try {
      await this.apiClient.resolveIncident(e), this.eventBus.emitTyped("INCIDENT_RESOLVED", { id: e });
    } catch (t) {
      throw this.logger.error("CommandQueryService: Incident resolution failed", { error: t, id: e }), t;
    }
  }
  async markNotificationAsRead(e) {
    this.logger.debug("CommandQueryService: Marking notification as read", { id: e });
    try {
      await this.apiClient.markNotificationAsRead(e), this.eventBus.emitTyped("NOTIFICATION_READ", { id: e });
    } catch (t) {
      throw this.logger.error("CommandQueryService: Mark notification as read failed", { error: t, id: e }), t;
    }
  }
  async markAllNotificationsAsRead(e) {
    this.logger.debug("CommandQueryService: Marking all notifications as read", { userId: e });
    try {
      await this.apiClient.markAllNotificationsAsRead(e), this.eventBus.emitTyped("ALL_NOTIFICATIONS_READ", { userId: e });
    } catch (t) {
      throw this.logger.error("CommandQueryService: Mark all notifications as read failed", { error: t, userId: e }), t;
    }
  }
  async createPushSubscription(e) {
    this.logger.debug("CommandQueryService: Creating push subscription", e);
    try {
      const t = await this.apiClient.createPushSubscription(e);
      return this.eventBus.emitTyped("PUSH_SUBSCRIPTION_CREATED", { subscription: t }), t;
    } catch (t) {
      throw this.logger.error("CommandQueryService: Push subscription creation failed", { error: t, data: e }), t;
    }
  }
  async deletePushSubscription(e) {
    this.logger.debug("CommandQueryService: Deleting push subscription", { id: e });
    try {
      await this.apiClient.deletePushSubscription(e), this.eventBus.emitTyped("PUSH_SUBSCRIPTION_DELETED", { id: e });
    } catch (t) {
      throw this.logger.error("CommandQueryService: Push subscription deletion failed", { error: t, id: e }), t;
    }
  }
  async sendPushNotification(e) {
    this.logger.debug("CommandQueryService: Sending push notification", e);
    try {
      await this.apiClient.sendPushNotification(e), this.eventBus.emitTyped("PUSH_NOTIFICATION_SENT", { data: e });
    } catch (t) {
      throw this.logger.error("CommandQueryService: Send push notification failed", { error: t, data: e }), t;
    }
  }
  async signIn(e, t) {
    this.logger.debug("CommandQueryService: Signing in user", { email: e });
    try {
      const r = await this.apiClient.signIn(e, t);
      return this.eventBus.emitTyped("USER_SIGNED_IN", { user: r.user }), r;
    } catch (r) {
      throw this.logger.error("CommandQueryService: Sign in failed", { error: r, email: e }), r;
    }
  }
  async signUp(e, t, r) {
    this.logger.debug("CommandQueryService: Signing up user", { email: e, name: r });
    try {
      const s = await this.apiClient.signUp(e, t, r);
      return this.eventBus.emitTyped("USER_SIGNED_UP", { user: s.user }), s;
    } catch (s) {
      throw this.logger.error("CommandQueryService: Sign up failed", { error: s, email: e, name: r }), s;
    }
  }
  async signOut() {
    this.logger.debug("CommandQueryService: Signing out user");
    try {
      await this.apiClient.signOut(), this.eventBus.emitTyped("USER_SIGNED_OUT", {});
    } catch (e) {
      throw this.logger.error("CommandQueryService: Sign out failed", { error: e }), e;
    }
  }
  async getAlertRules(e) {
    this.logger.debug("CommandQueryService: Getting alert rules", { targetId: e });
    try {
      const t = await this.apiClient.getAlertRules(e);
      return this.eventBus.emitTyped("ALERT_RULES_LOADED", { targetId: e, rules: t }), t;
    } catch (t) {
      throw this.logger.error("CommandQueryService: Get alert rules failed", { error: t, targetId: e }), t;
    }
  }
  async getIncidents(e) {
    this.logger.debug("CommandQueryService: Getting incidents", { targetId: e });
    try {
      const t = await this.apiClient.getIncidents(e);
      return this.eventBus.emitTyped("INCIDENTS_LOADED", { targetId: e, incidents: t }), t;
    } catch (t) {
      throw this.logger.error("CommandQueryService: Get incidents failed", { error: t, targetId: e }), t;
    }
  }
  async getNotifications(e) {
    this.logger.debug("CommandQueryService: Getting notifications", { userId: e });
    try {
      const t = await this.apiClient.getNotifications(e);
      return this.eventBus.emitTyped("NOTIFICATIONS_LOADED", { notifications: t }), t;
    } catch (t) {
      throw this.logger.error("CommandQueryService: Get notifications failed", { error: t, userId: e }), t;
    }
  }
  async getPushSubscriptions(e) {
    this.logger.debug("CommandQueryService: Getting push subscriptions", { userId: e });
    try {
      const t = await this.apiClient.getPushSubscriptions(e);
      return this.eventBus.emitTyped("PUSH_SUBSCRIPTIONS_LOADED", { subscriptions: t }), t;
    } catch (t) {
      throw this.logger.error("CommandQueryService: Get push subscriptions failed", { error: t, userId: e }), t;
    }
  }
  async getCurrentUser() {
    this.logger.debug("CommandQueryService: Getting current user");
    try {
      return await this.apiClient.getCurrentUser();
    } catch (e) {
      throw this.logger.error("CommandQueryService: Get current user failed", { error: e }), e;
    }
  }
  async getSession() {
    this.logger.debug("CommandQueryService: Getting session");
    try {
      return await this.apiClient.getSession();
    } catch (e) {
      throw this.logger.error("CommandQueryService: Get session failed", { error: e }), e;
    }
  }
  async isAuthenticated() {
    this.logger.debug("CommandQueryService: Checking authentication status");
    try {
      return await this.apiClient.isAuthenticated();
    } catch (e) {
      throw this.logger.error("CommandQueryService: Check authentication failed", { error: e }), e;
    }
  }
}
var ze = ["<div", ' class="flex items-center justify-center min-h-screen bg-red-50"><div class="text-center p-8"><h1 class="text-2xl font-bold text-red-600 mb-4">Initialization Error</h1><p class="text-gray-700">', "</p></div></div>"], He = ["<div", ' class="flex items-center justify-center min-h-screen"><div class="text-center"><div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div><p class="mt-4 text-gray-600">Initializing services...</p></div></div>'];
const ae = createContext$1();
function We(n) {
  var _a;
  const [e, t$1] = createSignal(null), [r, s] = createSignal(null);
  return createEffect(async () => {
    try {
      await C$1();
      const i = l(), a = i.get(t.ILogger), c = i.get(t.IEventBus), g = new je(), d = new $e(g, c, a);
      t$1({ apiClient: g, commandQuery: d, eventBus: c, logger: a }), a.info("Frontend services initialized successfully");
    } catch (i) {
      const a = i instanceof Error ? i : new Error("Unknown error");
      s(a), console.error("Failed to initialize frontend services:", a);
    }
  }), [r() && ssr(ze, ssrHydrationKey(), escape((_a = r()) == null ? void 0 : _a.message)), !r() && !e() && ssr(He, ssrHydrationKey()), !r() && e() && createComponent$1(ae.Provider, { get value() {
    return e();
  }, get children() {
    return n.children;
  } })];
}
function Ke() {
  const n = useContext(ae);
  if (!n) throw new Error("useFrontendServices must be used within FrontendServicesProvider");
  return n;
}
function ot() {
  return Ke().logger;
}
const ct = We;

var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, key + "" , value);
function pt(e) {
  let t;
  const r = ee(e), s = { duplex: "half", method: e.method, headers: e.headers };
  return e.node.req.body instanceof ArrayBuffer ? new Request(r, { ...s, body: e.node.req.body }) : new Request(r, { ...s, get body() {
    return t || (t = Et(e), t);
  } });
}
function ht(e) {
  var _a;
  return (_a = e.web) != null ? _a : e.web = { request: pt(e), url: ee(e) }, e.web.request;
}
function mt() {
  return kt();
}
const Z = Symbol("$HTTPEvent");
function ft(e) {
  return typeof e == "object" && (e instanceof H3Event || (e == null ? void 0 : e[Z]) instanceof H3Event || (e == null ? void 0 : e.__is_event__) === true);
}
function g(e) {
  return function(...t) {
    var _a;
    let r = t[0];
    if (ft(r)) t[0] = r instanceof H3Event || r.__is_event__ ? r : r[Z];
    else {
      if (!((_a = globalThis.app.config.server.experimental) == null ? void 0 : _a.asyncContext)) throw new Error("AsyncLocalStorage was not enabled. Use the `server.experimental.asyncContext: true` option in your app configuration to enable it. Or, pass the instance of HTTPEvent that you have as the first argument to the function.");
      if (r = mt(), !r) throw new Error("No HTTPEvent found in AsyncLocalStorage. Make sure you are using the function within the server runtime.");
      t.unshift(r);
    }
    return e(...t);
  };
}
const ee = g(getRequestURL), gt = g(getRequestIP), U = g(setResponseStatus), B = g(getResponseStatus), wt = g(getResponseStatusText), H = g(getResponseHeaders), W = g(getResponseHeader), yt = g(setResponseHeader), bt = g(appendResponseHeader), G = g(sendRedirect), vt = g(getCookie), Rt = g(setCookie), St = g(setHeader), Et = g(getRequestWebStream), $t = g(removeResponseHeader), At = g(ht);
function Tt() {
  var _a;
  return getContext("nitro-app", { asyncContext: !!((_a = globalThis.app.config.server.experimental) == null ? void 0 : _a.asyncContext), AsyncLocalStorage: AsyncLocalStorage });
}
function kt() {
  return Tt().use().event;
}
const te = [{ page: true, $component: { src: "src/routes/alerts.tsx?pick=default&pick=$css", build: () => import('../build/alerts2.mjs'), import: () => import('../build/alerts2.mjs') }, path: "/alerts", filePath: "/Users/david/Documents/Projects/network-monitor/apps/web/src/routes/alerts.tsx" }, { page: true, $component: { src: "src/routes/charts.tsx?pick=default&pick=$css", build: () => import('../build/charts2.mjs'), import: () => import('../build/charts2.mjs') }, path: "/charts", filePath: "/Users/david/Documents/Projects/network-monitor/apps/web/src/routes/charts.tsx" }, { page: true, $component: { src: "src/routes/index.tsx?pick=default&pick=$css", build: () => import('../build/index2.mjs'), import: () => import('../build/index2.mjs') }, path: "/", filePath: "/Users/david/Documents/Projects/network-monitor/apps/web/src/routes/index.tsx" }, { page: true, $component: { src: "src/routes/notifications.tsx?pick=default&pick=$css", build: () => import('../build/notifications2.mjs'), import: () => import('../build/notifications2.mjs') }, path: "/notifications", filePath: "/Users/david/Documents/Projects/network-monitor/apps/web/src/routes/notifications.tsx" }, { page: true, $component: { src: "src/routes/settings.tsx?pick=default&pick=$css", build: () => import('../build/settings2.mjs'), import: () => import('../build/settings2.mjs') }, path: "/settings", filePath: "/Users/david/Documents/Projects/network-monitor/apps/web/src/routes/settings.tsx" }, { page: true, $component: { src: "src/routes/targets.tsx?pick=default&pick=$css", build: () => import('../build/targets2.mjs'), import: () => import('../build/targets2.mjs') }, path: "/targets", filePath: "/Users/david/Documents/Projects/network-monitor/apps/web/src/routes/targets.tsx" }, { page: false, $GET: { src: "src/routes/api/trpc/[...trpc].ts?pick=GET", build: () => import('../build/_...trpc_3.mjs'), import: () => import('../build/_...trpc_3.mjs') }, $HEAD: { src: "src/routes/api/trpc/[...trpc].ts?pick=GET", build: () => import('../build/_...trpc_3.mjs'), import: () => import('../build/_...trpc_3.mjs') }, $POST: { src: "src/routes/api/trpc/[...trpc].ts?pick=POST", build: () => import('../build/_...trpc_22.mjs'), import: () => import('../build/_...trpc_22.mjs') }, path: "/api/trpc/*trpc", filePath: "/Users/david/Documents/Projects/network-monitor/apps/web/src/routes/api/trpc/[...trpc].ts" }], Ct = Pt(te.filter((e) => e.page));
function Pt(e) {
  function t(r, s, n, o) {
    const a = Object.values(r).find((i) => n.startsWith(i.id + "/"));
    return a ? (t(a.children || (a.children = []), s, n.slice(a.id.length)), r) : (r.push({ ...s, id: n, path: n.replace(/\([^)/]+\)/g, "").replace(/\/+/g, "/") }), r);
  }
  return e.sort((r, s) => r.path.length - s.path.length).reduce((r, s) => t(r, s, s.path, s.path), []);
}
function xt(e, t) {
  const r = Ht.lookup(e);
  if (r && r.route) {
    const s = t === "HEAD" ? r.route.$HEAD || r.route.$GET : r.route[`$${t}`];
    return s === void 0 ? void 0 : { handler: s, params: r.params };
  }
}
function Lt(e) {
  return e.$HEAD || e.$GET || e.$POST || e.$PUT || e.$PATCH || e.$DELETE;
}
const Ht = createRouter$1({ routes: te.reduce((e, t) => {
  if (!Lt(t)) return e;
  let r = t.path.replace(/\([^)/]+\)/g, "").replace(/\/+/g, "/").replace(/\*([^/]*)/g, (s, n) => `**:${n}`).split("/").map((s) => s.startsWith(":") || s.startsWith("*") ? s : encodeURIComponent(s)).join("/");
  if (/:[^/]*\?/g.test(r)) throw new Error(`Optional parameters are not supported in API routes: ${r}`);
  if (e[r]) throw new Error(`Duplicate API routes for "${r}" found at "${e[r].route.path}" and "${t.path}"`);
  return e[r] = { route: t }, e;
}, {}) }), q = "solidFetchEvent";
function qt(e) {
  return { request: At(e), response: It(e), clientAddress: gt(e), locals: {}, nativeEvent: e };
}
function Ot(e) {
  if (!e.context[q]) {
    const t = qt(e);
    e.context[q] = t;
  }
  return e.context[q];
}
class Ut {
  constructor(t) {
    __publicField(this, "event");
    this.event = t;
  }
  get(t) {
    const r = W(this.event, t);
    return Array.isArray(r) ? r.join(", ") : r || null;
  }
  has(t) {
    return this.get(t) !== void 0;
  }
  set(t, r) {
    return yt(this.event, t, r);
  }
  delete(t) {
    return $t(this.event, t);
  }
  append(t, r) {
    bt(this.event, t, r);
  }
  getSetCookie() {
    const t = W(this.event, "Set-Cookie");
    return Array.isArray(t) ? t : [t];
  }
  forEach(t) {
    return Object.entries(H(this.event)).forEach(([r, s]) => t(Array.isArray(s) ? s.join(", ") : s, r, this));
  }
  entries() {
    return Object.entries(H(this.event)).map(([t, r]) => [t, Array.isArray(r) ? r.join(", ") : r])[Symbol.iterator]();
  }
  keys() {
    return Object.keys(H(this.event))[Symbol.iterator]();
  }
  values() {
    return Object.values(H(this.event)).map((t) => Array.isArray(t) ? t.join(", ") : t)[Symbol.iterator]();
  }
  [Symbol.iterator]() {
    return this.entries()[Symbol.iterator]();
  }
}
function It(e) {
  return { get status() {
    return B(e);
  }, set status(t) {
    U(e, t);
  }, get statusText() {
    return wt(e);
  }, set statusText(t) {
    U(e, B(e), t);
  }, headers: new Ut(e) };
}
var jt = " ";
const _t = { style: (e) => ssrElement("style", e.attrs, () => e.children, true), link: (e) => ssrElement("link", e.attrs, void 0, true), script: (e) => e.attrs.src ? ssrElement("script", mergeProps(() => e.attrs, { get id() {
  return e.key;
} }), () => ssr(jt), true) : null, noscript: (e) => ssrElement("noscript", e.attrs, () => escape(e.children), true) };
function I(e, t) {
  let { tag: r, attrs: { key: s, ...n } = { key: void 0 }, children: o } = e;
  return _t[r]({ attrs: { ...n, nonce: t }, key: s, children: o });
}
function Dt(e, t, r, s = "default") {
  return lazy(async () => {
    var _a;
    {
      const o = (await e.import())[s], i = (await ((_a = t.inputs) == null ? void 0 : _a[e.src].assets())).filter((l) => l.tag === "style" || l.attrs.rel === "stylesheet");
      return { default: (l) => [...i.map((w) => I(w)), createComponent(o, l)] };
    }
  });
}
function re() {
  function e(r) {
    return { ...r, ...r.$$route ? r.$$route.require().route : void 0, info: { ...r.$$route ? r.$$route.require().route.info : {}, filesystem: true }, component: r.$component && Dt(r.$component, globalThis.MANIFEST.client, globalThis.MANIFEST.ssr), children: r.children ? r.children.map(e) : void 0 };
  }
  return Ct.map(e);
}
let K;
const Nt = isServer ? () => getRequestEvent().routes : () => K || (K = re());
function Mt(e) {
  const t = vt(e.nativeEvent, "flash");
  if (t) try {
    let r = JSON.parse(t);
    if (!r || !r.result) return;
    const s = [...r.input.slice(0, -1), new Map(r.input[r.input.length - 1])], n = r.error ? new Error(r.result) : r.result;
    return { input: s, url: r.url, pending: false, result: r.thrown ? void 0 : n, error: r.thrown ? n : void 0 };
  } catch (r) {
    console.error(r);
  } finally {
    Rt(e.nativeEvent, "flash", "", { maxAge: 0 });
  }
}
async function Bt(e) {
  const t = globalThis.MANIFEST.client;
  return globalThis.MANIFEST.ssr, e.response.headers.set("Content-Type", "text/html"), Object.assign(e, { manifest: await t.json(), assets: [...await t.inputs[t.handler].assets()], router: { submission: Mt(e) }, routes: re(), complete: false, $islands: /* @__PURE__ */ new Set() });
}
const Wt = /* @__PURE__ */ new Set([301, 302, 303, 307, 308]);
function F(e) {
  return e.status && Wt.has(e.status) ? e.status : 302;
}
function Gt(e, t, r = {}, s) {
  return eventHandler({ handler: (n) => {
    const o = Ot(n);
    return provideRequestEvent(o, async () => {
      const a = xt(new URL(o.request.url).pathname, o.request.method);
      if (a) {
        const m = await a.handler.import(), y = o.request.method === "HEAD" ? m.HEAD || m.GET : m[o.request.method];
        o.params = a.params || {}, sharedConfig.context = { event: o };
        const c = await y(o);
        if (c !== void 0) return c;
        if (o.request.method !== "GET") throw new Error(`API handler for ${o.request.method} "${o.request.url}" did not return a response.`);
      }
      const i = await t(o), u = typeof r == "function" ? await r(i) : { ...r }, l = u.mode || "stream";
      if (u.nonce && (i.nonce = u.nonce), l === "sync") {
        const m = renderToString(() => (sharedConfig.context.event = i, e(i)), u);
        if (i.complete = true, i.response && i.response.headers.get("Location")) {
          const y = F(i.response);
          return G(n, i.response.headers.get("Location"), y);
        }
        return m;
      }
      if (u.onCompleteAll) {
        const m = u.onCompleteAll;
        u.onCompleteAll = (y) => {
          J(i)(y), m(y);
        };
      } else u.onCompleteAll = J(i);
      if (u.onCompleteShell) {
        const m = u.onCompleteShell;
        u.onCompleteShell = (y) => {
          z(i, n)(), m(y);
        };
      } else u.onCompleteShell = z(i, n);
      const w = renderToStream(() => (sharedConfig.context.event = i, e(i)), u);
      if (i.response && i.response.headers.get("Location")) {
        const m = F(i.response);
        return G(n, i.response.headers.get("Location"), m);
      }
      if (l === "async") return w;
      const { writable: E, readable: R } = new TransformStream();
      return w.pipeTo(E), R;
    });
  } });
}
function z(e, t) {
  return () => {
    if (e.response && e.response.headers.get("Location")) {
      const r = F(e.response);
      U(t, r), St(t, "Location", e.response.headers.get("Location"));
    }
  };
}
function J(e) {
  return ({ write: t }) => {
    e.complete = true;
    const r = e.response && e.response.headers.get("Location");
    r && t(`<script>window.location="${r}"<\/script>`);
  };
}
function Kt(e, t, r) {
  return Gt(e, Bt, t);
}
const ne = (e) => (t) => {
  const { base: r } = t, s = children(() => t.children), n = createMemo(() => qe(s(), t.base || ""));
  let o;
  const a = it(e, n, () => o, { base: r, singleFlight: t.singleFlight, transformUrl: t.transformUrl });
  return e.create && e.create(a), createComponent$1(Fe.Provider, { value: a, get children() {
    return createComponent$1(zt, { routerState: a, get root() {
      return t.root;
    }, get preload() {
      return t.rootPreload || t.rootLoad;
    }, get children() {
      return [(o = getOwner()) && null, createComponent$1(Jt, { routerState: a, get branches() {
        return n();
      } })];
    } });
  } });
};
function zt(e) {
  const t = e.routerState.location, r = e.routerState.params, s = createMemo(() => e.preload && untrack(() => {
    e.preload({ params: r, location: t, intent: st() || "initial" });
  }));
  return createComponent$1(Show, { get when() {
    return e.root;
  }, keyed: true, get fallback() {
    return e.children;
  }, children: (n) => createComponent$1(n, { params: r, location: t, get data() {
    return s();
  }, get children() {
    return e.children;
  } }) });
}
function Jt(e) {
  if (isServer) {
    const n = getRequestEvent();
    if (n && n.router && n.router.dataOnly) {
      Vt(n, e.routerState, e.branches);
      return;
    }
    n && ((n.router || (n.router = {})).matches || (n.router.matches = e.routerState.matches().map(({ route: o, path: a, params: i }) => ({ path: o.originalPath, pattern: o.pattern, match: a, params: i, info: o.info }))));
  }
  const t = [];
  let r;
  const s = createMemo(on(e.routerState.matches, (n, o, a) => {
    let i = o && n.length === o.length;
    const u = [];
    for (let l = 0, w = n.length; l < w; l++) {
      const E = o && o[l], R = n[l];
      a && E && R.route.key === E.route.key ? u[l] = a[l] : (i = false, t[l] && t[l](), createRoot((m) => {
        t[l] = m, u[l] = at(e.routerState, u[l - 1] || e.routerState.base, V(() => s()[l + 1]), () => e.routerState.matches()[l]);
      }));
    }
    return t.splice(n.length).forEach((l) => l()), a && i ? a : (r = u[0], u);
  }));
  return V(() => s() && r)();
}
const V = (e) => () => createComponent$1(Show, { get when() {
  return e();
}, keyed: true, children: (t) => createComponent$1(se$1.Provider, { value: t, get children() {
  return t.outlet();
} }) });
function Vt(e, t, r) {
  const s = new URL(e.request.url), n = N(r, new URL(e.router.previousUrl || e.request.url).pathname), o = N(r, s.pathname);
  for (let a = 0; a < o.length; a++) {
    (!n[a] || o[a].route !== n[a].route) && (e.router.dataOnly = true);
    const { route: i, params: u } = o[a];
    i.preload && i.preload({ params: u, location: t.location, intent: "preload" });
  }
}
function Yt([e, t], r, s) {
  return [e, s ? (n) => t(s(n)) : t];
}
function Qt(e) {
  let t = false;
  const r = (n) => typeof n == "string" ? { value: n } : n, s = Yt(createSignal(r(e.get()), { equals: (n, o) => n.value === o.value && n.state === o.state }), void 0, (n) => (!t && e.set(n), sharedConfig.registry && !sharedConfig.done && (sharedConfig.done = true), n));
  return e.init && onCleanup(e.init((n = e.get()) => {
    t = true, s[1](r(n)), t = false;
  })), ne({ signal: s, create: e.create, utils: e.utils });
}
function Xt(e, t, r) {
  return e.addEventListener(t, r), () => e.removeEventListener(t, r);
}
function Zt(e, t) {
  const r = e && document.getElementById(e);
  r ? r.scrollIntoView() : t && window.scrollTo(0, 0);
}
function er(e) {
  const t = new URL(e);
  return t.pathname + t.search;
}
function tr(e) {
  let t;
  const r = { value: e.url || (t = getRequestEvent()) && er(t.request.url) || "" };
  return ne({ signal: [() => r, (s) => Object.assign(r, s)] })(e);
}
const rr = /* @__PURE__ */ new Map();
function nr(e = true, t = false, r = "/_server", s) {
  return (n) => {
    const o = n.base.path(), a = n.navigatorFactory(n.base);
    let i, u;
    function l(c) {
      return c.namespaceURI === "http://www.w3.org/2000/svg";
    }
    function w(c) {
      if (c.defaultPrevented || c.button !== 0 || c.metaKey || c.altKey || c.ctrlKey || c.shiftKey) return;
      const d = c.composedPath().find((N) => N instanceof Node && N.nodeName.toUpperCase() === "A");
      if (!d || t && !d.hasAttribute("link")) return;
      const f = l(d), h = f ? d.href.baseVal : d.href;
      if ((f ? d.target.baseVal : d.target) || !h && !d.hasAttribute("state")) return;
      const A = (d.getAttribute("rel") || "").split(/\s+/);
      if (d.hasAttribute("download") || A && A.includes("external")) return;
      const P = f ? new URL(h, document.baseURI) : new URL(h);
      if (!(P.origin !== window.location.origin || o && P.pathname && !P.pathname.toLowerCase().startsWith(o.toLowerCase()))) return [d, P];
    }
    function E(c) {
      const d = w(c);
      if (!d) return;
      const [f, h] = d, D = n.parsePath(h.pathname + h.search + h.hash), A = f.getAttribute("state");
      c.preventDefault(), a(D, { resolve: false, replace: f.hasAttribute("replace"), scroll: !f.hasAttribute("noscroll"), state: A ? JSON.parse(A) : void 0 });
    }
    function R(c) {
      const d = w(c);
      if (!d) return;
      const [f, h] = d;
      s && (h.pathname = s(h.pathname)), n.preloadRoute(h, f.getAttribute("preload") !== "false");
    }
    function m(c) {
      clearTimeout(i);
      const d = w(c);
      if (!d) return u = null;
      const [f, h] = d;
      u !== f && (s && (h.pathname = s(h.pathname)), i = setTimeout(() => {
        n.preloadRoute(h, f.getAttribute("preload") !== "false"), u = f;
      }, 20));
    }
    function y(c) {
      if (c.defaultPrevented) return;
      let d = c.submitter && c.submitter.hasAttribute("formaction") ? c.submitter.getAttribute("formaction") : c.target.getAttribute("action");
      if (!d) return;
      if (!d.startsWith("https://action/")) {
        const h = new URL(d, Le);
        if (d = n.parsePath(h.pathname + h.search), !d.startsWith(r)) return;
      }
      if (c.target.method.toUpperCase() !== "POST") throw new Error("Only POST forms are supported for Actions");
      const f = rr.get(d);
      if (f) {
        c.preventDefault();
        const h = new FormData(c.target, c.submitter);
        f.call({ r: n, f: c.target }, c.target.enctype === "multipart/form-data" ? h : new URLSearchParams(h));
      }
    }
    delegateEvents(["click", "submit"]), document.addEventListener("click", E), e && (document.addEventListener("mousemove", m, { passive: true }), document.addEventListener("focusin", R, { passive: true }), document.addEventListener("touchstart", R, { passive: true })), document.addEventListener("submit", y), onCleanup(() => {
      document.removeEventListener("click", E), e && (document.removeEventListener("mousemove", m), document.removeEventListener("focusin", R), document.removeEventListener("touchstart", R)), document.removeEventListener("submit", y);
    });
  };
}
function sr(e) {
  if (isServer) return tr(e);
  const t = () => {
    const s = window.location.pathname.replace(/^\/+/, "/") + window.location.search, n = window.history.state && window.history.state._depth && Object.keys(window.history.state).length === 1 ? void 0 : window.history.state;
    return { value: s + window.location.hash, state: n };
  }, r = Pe();
  return Qt({ get: t, set({ value: s, replace: n, scroll: o, state: a }) {
    n ? window.history.replaceState(Ze(a), "", s) : window.history.pushState(a, "", s), Zt(decodeURIComponent(window.location.hash.slice(1)), o), ee$1();
  }, init: (s) => Xt(window, "popstate", et(s, (n) => {
    if (n && n < 0) return !r.confirm(n);
    {
      const o = t();
      return !r.confirm(o.value, { state: o.state });
    }
  })), create: nr(e.preload, e.explicitLinks, e.actionBase, e.transformUrl), utils: { go: (s) => window.history.go(s), beforeLeave: r } })(e);
}
Chart.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, TimeScale, Filler);
Chart.defaults.responsive = true;
Chart.defaults.maintainAspectRatio = false;
Chart.defaults.plugins.legend.display = true;
Chart.defaults.plugins.legend.position = "top";
var or = ["<div", ' class="p-4">Loading...</div>'];
function ar() {
  return createComponent$1(ct, { get children() {
    return createComponent$1(sr, { root: (e) => createComponent$1(Suspense, { get fallback() {
      return ssr(or, ssrHydrationKey());
    }, get children() {
      return e.children;
    } }), get children() {
      return createComponent$1(Nt, {});
    } });
  } });
}
const se = isServer ? (e) => {
  const t = getRequestEvent();
  return t.response.status = e.code, t.response.statusText = e.text, onCleanup(() => !t.nativeEvent.handled && !t.complete && (t.response.status = 200)), null;
} : (e) => null;
var ir = ["<span", ' style="font-size:1.5em;text-align:center;position:fixed;left:0px;bottom:55%;width:100%;">', "</span>"], cr = ["<span", ' style="font-size:1.5em;text-align:center;position:fixed;left:0px;bottom:55%;width:100%;">500 | Internal Server Error</span>'];
const ur = (e) => {
  const t = isServer ? "500 | Internal Server Error" : "Error | Uncaught Client Exception";
  return createComponent$1(ErrorBoundary, { fallback: (r) => (console.error(r), [ssr(ir, ssrHydrationKey(), escape(t)), createComponent$1(se, { code: 500 })]), get children() {
    return e.children;
  } });
}, lr = (e) => {
  let t = false;
  const r = catchError(() => e.children, (s) => {
    console.error(s), t = !!s;
  });
  return t ? [ssr(cr, ssrHydrationKey()), createComponent$1(se, { code: 500 })] : r;
};
var Y = ["<script", ">", "<\/script>"], dr = ["<script", ' type="module"', " async", "><\/script>"], pr = ["<script", ' type="module" async', "><\/script>"];
const hr = ssr("<!DOCTYPE html>");
function oe(e, t, r = []) {
  for (let s = 0; s < t.length; s++) {
    const n = t[s];
    if (n.path !== e[0].path) continue;
    let o = [...r, n];
    if (n.children) {
      const a = e.slice(1);
      if (a.length === 0 || (o = oe(a, n.children, o), !o)) continue;
    }
    return o;
  }
}
function mr(e) {
  const t = getRequestEvent(), r = t.nonce;
  let s = [];
  return Promise.resolve().then(async () => {
    let n = [];
    if (t.router && t.router.matches) {
      const o = [...t.router.matches];
      for (; o.length && (!o[0].info || !o[0].info.filesystem); ) o.shift();
      const a = o.length && oe(o, t.routes);
      if (a) {
        const i = globalThis.MANIFEST.client.inputs;
        for (let u = 0; u < a.length; u++) {
          const l = a[u], w = i[l.$component.src];
          n.push(w.assets());
        }
      }
    }
    s = await Promise.all(n).then((o) => [...new Map(o.flat().map((a) => [a.attrs.key, a])).values()].filter((a) => a.attrs.rel === "modulepreload" && !t.assets.find((i) => i.attrs.key === a.attrs.key)));
  }), useAssets(() => s.length ? s.map((n) => I(n)) : void 0), createComponent$1(NoHydration, { get children() {
    return [hr, createComponent$1(lr, { get children() {
      return createComponent$1(e.document, { get assets() {
        return [createComponent$1(HydrationScript, {}), t.assets.map((n) => I(n, r))];
      }, get scripts() {
        return r ? [ssr(Y, ssrHydrationKey() + ssrAttribute("nonce", escape(r, true), false), `window.manifest = ${JSON.stringify(t.manifest)}`), ssr(dr, ssrHydrationKey(), ssrAttribute("nonce", escape(r, true), false), ssrAttribute("src", escape(globalThis.MANIFEST.client.inputs[globalThis.MANIFEST.client.handler].output.path, true), false))] : [ssr(Y, ssrHydrationKey(), `window.manifest = ${JSON.stringify(t.manifest)}`), ssr(pr, ssrHydrationKey(), ssrAttribute("src", escape(globalThis.MANIFEST.client.inputs[globalThis.MANIFEST.client.handler].output.path, true), false))];
      }, get children() {
        return createComponent$1(Hydration, { get children() {
          return createComponent$1(ur, { get children() {
            return createComponent$1(ar, {});
          } });
        } });
      } });
    } })];
  } });
}
var fr = ['<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><link rel="icon" href="/favicon.ico"><meta name="theme-color" content="#4f46e5"><meta name="description" content="Monitor your internet connection with real-time alerts and performance tracking"><link rel="manifest" href="/manifest.json">', "</head>"], gr = ["<html", ' lang="en">', '<body><div id="app">', "</div><!--$-->", "<!--/--></body></html>"];
const Pr = Kt(() => createComponent$1(mr, { document: ({ assets: e, children: t, scripts: r }) => ssr(gr, ssrHydrationKey(), createComponent$1(NoHydration, { get children() {
  return ssr(fr, escape(e));
} }), escape(t), escape(r)) }));

const handlers = [
  { route: '', handler: _zSw6yC, lazy: false, middleware: true, method: undefined },
  { route: '/_server', handler: kt$1, lazy: false, middleware: true, method: undefined },
  { route: '/', handler: Pr, lazy: false, middleware: true, method: undefined }
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
  const router = createRouter({
    preemptive: true
  });
  const nodeHandler = toNodeListener(h3App);
  const localCall = (aRequest) => b$2(
    nodeHandler,
    aRequest
  );
  const localFetch = (input, init) => {
    if (!input.toString().startsWith("/")) {
      return globalThis.fetch(input, init);
    }
    return C$2(
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

const debug = (...args) => {
};
function GracefulShutdown(server, opts) {
  opts = opts || {};
  const options = Object.assign(
    {
      signals: "SIGINT SIGTERM",
      timeout: 3e4,
      development: false,
      forceExit: true,
      onShutdown: (signal) => Promise.resolve(signal),
      preShutdown: (signal) => Promise.resolve(signal)
    },
    opts
  );
  let isShuttingDown = false;
  const connections = {};
  let connectionCounter = 0;
  const secureConnections = {};
  let secureConnectionCounter = 0;
  let failed = false;
  let finalRun = false;
  function onceFactory() {
    let called = false;
    return (emitter, events, callback) => {
      function call() {
        if (!called) {
          called = true;
          return Reflect.apply(callback, this, arguments);
        }
      }
      for (const e of events) {
        emitter.on(e, call);
      }
    };
  }
  const signals = options.signals.split(" ").map((s) => s.trim()).filter((s) => s.length > 0);
  const once = onceFactory();
  once(process, signals, (signal) => {
    debug("received shut down signal", signal);
    shutdown(signal).then(() => {
      if (options.forceExit) {
        process.exit(failed ? 1 : 0);
      }
    }).catch((error) => {
      debug("server shut down error occurred", error);
      process.exit(1);
    });
  });
  function isFunction(functionToCheck) {
    const getType = Object.prototype.toString.call(functionToCheck);
    return /^\[object\s([A-Za-z]+)?Function]$/.test(getType);
  }
  function destroy(socket, force = false) {
    if (socket._isIdle && isShuttingDown || force) {
      socket.destroy();
      if (socket.server instanceof http.Server) {
        delete connections[socket._connectionId];
      } else {
        delete secureConnections[socket._connectionId];
      }
    }
  }
  function destroyAllConnections(force = false) {
    debug("Destroy Connections : " + (force ? "forced close" : "close"));
    let counter = 0;
    let secureCounter = 0;
    for (const key of Object.keys(connections)) {
      const socket = connections[key];
      const serverResponse = socket._httpMessage;
      if (serverResponse && !force) {
        if (!serverResponse.headersSent) {
          serverResponse.setHeader("connection", "close");
        }
      } else {
        counter++;
        destroy(socket);
      }
    }
    debug("Connections destroyed : " + counter);
    debug("Connection Counter    : " + connectionCounter);
    for (const key of Object.keys(secureConnections)) {
      const socket = secureConnections[key];
      const serverResponse = socket._httpMessage;
      if (serverResponse && !force) {
        if (!serverResponse.headersSent) {
          serverResponse.setHeader("connection", "close");
        }
      } else {
        secureCounter++;
        destroy(socket);
      }
    }
    debug("Secure Connections destroyed : " + secureCounter);
    debug("Secure Connection Counter    : " + secureConnectionCounter);
  }
  server.on("request", (req, res) => {
    req.socket._isIdle = false;
    if (isShuttingDown && !res.headersSent) {
      res.setHeader("connection", "close");
    }
    res.on("finish", () => {
      req.socket._isIdle = true;
      destroy(req.socket);
    });
  });
  server.on("connection", (socket) => {
    if (isShuttingDown) {
      socket.destroy();
    } else {
      const id = connectionCounter++;
      socket._isIdle = true;
      socket._connectionId = id;
      connections[id] = socket;
      socket.once("close", () => {
        delete connections[socket._connectionId];
      });
    }
  });
  server.on("secureConnection", (socket) => {
    if (isShuttingDown) {
      socket.destroy();
    } else {
      const id = secureConnectionCounter++;
      socket._isIdle = true;
      socket._connectionId = id;
      secureConnections[id] = socket;
      socket.once("close", () => {
        delete secureConnections[socket._connectionId];
      });
    }
  });
  process.on("close", () => {
    debug("closed");
  });
  function shutdown(sig) {
    function cleanupHttp() {
      destroyAllConnections();
      debug("Close http server");
      return new Promise((resolve, reject) => {
        server.close((err) => {
          if (err) {
            return reject(err);
          }
          return resolve(true);
        });
      });
    }
    debug("shutdown signal - " + sig);
    if (options.development) {
      debug("DEV-Mode - immediate forceful shutdown");
      return process.exit(0);
    }
    function finalHandler() {
      if (!finalRun) {
        finalRun = true;
        if (options.finally && isFunction(options.finally)) {
          debug("executing finally()");
          options.finally();
        }
      }
      return Promise.resolve();
    }
    function waitForReadyToShutDown(totalNumInterval) {
      debug(`waitForReadyToShutDown... ${totalNumInterval}`);
      if (totalNumInterval === 0) {
        debug(
          `Could not close connections in time (${options.timeout}ms), will forcefully shut down`
        );
        return Promise.resolve(true);
      }
      const allConnectionsClosed = Object.keys(connections).length === 0 && Object.keys(secureConnections).length === 0;
      if (allConnectionsClosed) {
        debug("All connections closed. Continue to shutting down");
        return Promise.resolve(false);
      }
      debug("Schedule the next waitForReadyToShutdown");
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(waitForReadyToShutDown(totalNumInterval - 1));
        }, 250);
      });
    }
    if (isShuttingDown) {
      return Promise.resolve();
    }
    debug("shutting down");
    return options.preShutdown(sig).then(() => {
      isShuttingDown = true;
      cleanupHttp();
    }).then(() => {
      const pollIterations = options.timeout ? Math.round(options.timeout / 250) : 0;
      return waitForReadyToShutDown(pollIterations);
    }).then((force) => {
      debug("Do onShutdown now");
      if (force) {
        destroyAllConnections(force);
      }
      return options.onShutdown(sig);
    }).then(finalHandler).catch((error) => {
      const errString = typeof error === "string" ? error : JSON.stringify(error);
      debug(errString);
      failed = true;
      throw errString;
    });
  }
  function shutdownManual() {
    return shutdown("manual");
  }
  return shutdownManual;
}

function getGracefulShutdownConfig() {
  return {
    disabled: !!process.env.NITRO_SHUTDOWN_DISABLED,
    signals: (process.env.NITRO_SHUTDOWN_SIGNALS || "SIGTERM SIGINT").split(" ").map((s) => s.trim()),
    timeout: Number.parseInt(process.env.NITRO_SHUTDOWN_TIMEOUT || "", 10) || 3e4,
    forceExit: !process.env.NITRO_SHUTDOWN_NO_FORCE_EXIT
  };
}
function setupGracefulShutdown(listener, nitroApp) {
  const shutdownConfig = getGracefulShutdownConfig();
  if (shutdownConfig.disabled) {
    return;
  }
  GracefulShutdown(listener, {
    signals: shutdownConfig.signals.join(" "),
    timeout: shutdownConfig.timeout,
    forceExit: shutdownConfig.forceExit,
    onShutdown: async () => {
      await new Promise((resolve) => {
        const timeout = setTimeout(() => {
          console.warn("Graceful shutdown timeout, force exiting...");
          resolve();
        }, shutdownConfig.timeout);
        nitroApp.hooks.callHook("close").catch((error) => {
          console.error(error);
        }).finally(() => {
          clearTimeout(timeout);
          resolve();
        });
      });
    }
  });
}

const cert = process.env.NITRO_SSL_CERT;
const key = process.env.NITRO_SSL_KEY;
const nitroApp = useNitroApp();
const server = cert && key ? new Server({ key, cert }, toNodeListener(nitroApp.h3App)) : new Server$1(toNodeListener(nitroApp.h3App));
const port = destr(process.env.NITRO_PORT || process.env.PORT) || 3e3;
const host = process.env.NITRO_HOST || process.env.HOST;
const path = process.env.NITRO_UNIX_SOCKET;
const listener = server.listen(path ? { path } : { port, host }, (err) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  const protocol = cert && key ? "https" : "http";
  const addressInfo = listener.address();
  if (typeof addressInfo === "string") {
    console.log(`Listening on unix socket ${addressInfo}`);
    return;
  }
  const baseURL = (useRuntimeConfig().app.baseURL || "").replace(/\/$/, "");
  const url = `${protocol}://${addressInfo.family === "IPv6" ? `[${addressInfo.address}]` : addressInfo.address}:${addressInfo.port}${baseURL}`;
  console.log(`Listening on ${url}`);
});
trapUnhandledNodeErrors();
setupGracefulShutdown(listener, nitroApp);
const nodeServer = {};

export { U$2 as U, _, h$1 as a, t as b, nodeServer as c, h, l, nt as n, ot as o, rt as r, tt as t, vt$1 as v };
//# sourceMappingURL=nitro.mjs.map
