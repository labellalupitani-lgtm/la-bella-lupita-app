// club-lupita/node_modules/hono/dist/compose.js
var compose = (middleware, onError, onNotFound) => {
  return (context, next) => {
    let index = -1;
    return dispatch(0);
    async function dispatch(i) {
      if (i <= index) {
        throw new Error("next() called multiple times");
      }
      index = i;
      let res;
      let isError = false;
      let handler;
      if (middleware[i]) {
        handler = middleware[i][0][0];
        context.req.routeIndex = i;
      } else {
        handler = i === middleware.length && next || void 0;
      }
      if (handler) {
        try {
          res = await handler(context, () => dispatch(i + 1));
        } catch (err) {
          if (err instanceof Error && onError) {
            context.error = err;
            res = await onError(err, context);
            isError = true;
          } else {
            throw err;
          }
        }
      } else {
        if (context.finalized === false && onNotFound) {
          res = await onNotFound(context);
        }
      }
      if (res && (context.finalized === false || isError)) {
        context.res = res;
      }
      return context;
    }
  };
};

// club-lupita/node_modules/hono/dist/http-exception.js
var HTTPException = class extends Error {
  res;
  status;
  /**
   * Creates an instance of `HTTPException`.
   * @param status - HTTP status code for the exception. Defaults to 500.
   * @param options - Additional options for the exception.
   */
  constructor(status = 500, options) {
    super(options?.message, { cause: options?.cause });
    this.res = options?.res;
    this.status = status;
  }
  /**
   * Returns the response object associated with the exception.
   * If a response object is not provided, a new response is created with the error message and status code.
   * @returns The response object.
   */
  getResponse() {
    if (this.res) {
      const newResponse = new Response(this.res.body, {
        status: this.status,
        headers: this.res.headers
      });
      return newResponse;
    }
    return new Response(this.message, {
      status: this.status
    });
  }
};

// club-lupita/node_modules/hono/dist/request/constants.js
var GET_MATCH_RESULT = /* @__PURE__ */ Symbol();

// club-lupita/node_modules/hono/dist/utils/buffer.js
var bufferToFormData = (arrayBuffer, contentType) => {
  const response = new Response(arrayBuffer, {
    headers: {
      // Normalize the media type (case-insensitive) while keeping parameters like the boundary
      "Content-Type": contentType.replace(/^[^;]+/, (mediaType) => mediaType.toLowerCase())
    }
  });
  return response.formData();
};

// club-lupita/node_modules/hono/dist/utils/body.js
var MAX_NESTING_DEPTH = 32;
var MAX_NESTED_OBJECTS = 1e4;
var isRawRequest = (request) => "headers" in request;
var parseBody = async (request, options = /* @__PURE__ */ Object.create(null)) => {
  const { all = false, dot = false } = options;
  const headers = isRawRequest(request) ? request.headers : request.raw.headers;
  const contentType = headers.get("Content-Type");
  const mediaType = contentType?.split(";")[0].trim().toLowerCase();
  if (mediaType === "multipart/form-data" || mediaType === "application/x-www-form-urlencoded") {
    return parseFormData(request, { all, dot });
  }
  return {};
};
async function parseFormData(request, options) {
  if (!isRawRequest(request) && request.bodyCache.formData) {
    return convertFormDataToBodyData(
      await request.bodyCache.formData,
      options
    );
  }
  const headers = isRawRequest(request) ? request.headers : request.raw.headers;
  const arrayBuffer = await request.arrayBuffer();
  const formDataPromise = bufferToFormData(arrayBuffer, headers.get("Content-Type") || "");
  if (!isRawRequest(request)) {
    request.bodyCache.formData = formDataPromise;
  }
  const formData = await formDataPromise;
  if (formData) {
    return convertFormDataToBodyData(formData, options);
  }
  return {};
}
function convertFormDataToBodyData(formData, options) {
  const form = /* @__PURE__ */ Object.create(null);
  const nestingState = { count: 0 };
  formData.forEach((value, key) => {
    const shouldParseAllValues = options.all || key.endsWith("[]");
    if (!shouldParseAllValues) {
      form[key] = value;
    } else {
      handleParsingAllValues(form, key, value);
    }
  });
  if (options.dot) {
    Object.entries(form).forEach(([key, value]) => {
      const shouldParseDotValues = key.includes(".");
      if (shouldParseDotValues) {
        handleParsingNestedValues(form, key, value, nestingState);
        delete form[key];
      }
    });
  }
  return form;
}
var handleParsingAllValues = (form, key, value) => {
  if (form[key] !== void 0) {
    if (Array.isArray(form[key])) {
      ;
      form[key].push(value);
    } else {
      form[key] = [form[key], value];
    }
  } else {
    if (!key.endsWith("[]")) {
      form[key] = value;
    } else {
      form[key] = [value];
    }
  }
};
var handleParsingNestedValues = (form, key, value, state) => {
  if (/(?:^|\.)__proto__\./.test(key)) {
    return;
  }
  let nestedForm = form;
  const keys = key.split(".", MAX_NESTING_DEPTH + 2);
  if (keys.length > MAX_NESTING_DEPTH + 1) {
    throwNestingLimitExceeded();
  }
  keys.forEach((key2, index) => {
    if (index === keys.length - 1) {
      nestedForm[key2] = value;
    } else {
      if (!nestedForm[key2] || typeof nestedForm[key2] !== "object" || Array.isArray(nestedForm[key2]) || nestedForm[key2] instanceof File) {
        if (state.count++ >= MAX_NESTED_OBJECTS) {
          throwNestingLimitExceeded();
        }
        nestedForm[key2] = /* @__PURE__ */ Object.create(null);
      }
      nestedForm = nestedForm[key2];
    }
  });
};
var throwNestingLimitExceeded = () => {
  throw new Error("Nesting limit exceeded");
};

// club-lupita/node_modules/hono/dist/utils/url.js
var splitPath = (path) => {
  const paths = path.split("/");
  if (paths[0] === "") {
    paths.shift();
  }
  return paths;
};
var splitRoutingPath = (routePath) => {
  const { groups, path } = extractGroupsFromPath(routePath);
  const paths = splitPath(path);
  return replaceGroupMarks(paths, groups);
};
var extractGroupsFromPath = (path) => {
  const groups = [];
  path = path.replace(/\{[^}]+\}/g, (match2, index) => {
    const mark = `@${index}`;
    groups.push([mark, match2]);
    return mark;
  });
  return { groups, path };
};
var replaceGroupMarks = (paths, groups) => {
  for (let i = groups.length - 1; i >= 0; i--) {
    const [mark] = groups[i];
    for (let j = paths.length - 1; j >= 0; j--) {
      if (paths[j].includes(mark)) {
        paths[j] = paths[j].replace(mark, groups[i][1]);
        break;
      }
    }
  }
  return paths;
};
var patternCache = {};
var getPattern = (label, next) => {
  if (label === "*") {
    return "*";
  }
  const match2 = label.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);
  if (match2) {
    const cacheKey = `${label}#${next}`;
    if (!patternCache[cacheKey]) {
      if (match2[2]) {
        patternCache[cacheKey] = next && next[0] !== ":" && next[0] !== "*" ? [cacheKey, match2[1], new RegExp(`^${match2[2]}(?=/${next})`)] : [label, match2[1], new RegExp(`^${match2[2]}$`)];
      } else {
        patternCache[cacheKey] = [label, match2[1], true];
      }
    }
    return patternCache[cacheKey];
  }
  return null;
};
var tryDecode = (str, decoder) => {
  try {
    return decoder(str);
  } catch {
    return str.replace(/(?:%[0-9A-Fa-f]{2})+/g, (match2) => {
      try {
        return decoder(match2);
      } catch {
        return match2;
      }
    });
  }
};
var tryDecodeURI = (str) => tryDecode(str, decodeURI);
var getPath = (request) => {
  const url = request.url;
  const start = url.indexOf("/", url.indexOf(":") + 4);
  let i = start;
  for (; i < url.length; i++) {
    const charCode = url.charCodeAt(i);
    if (charCode === 37) {
      const queryIndex = url.indexOf("?", i);
      const hashIndex = url.indexOf("#", i);
      const end = queryIndex === -1 ? hashIndex === -1 ? void 0 : hashIndex : hashIndex === -1 ? queryIndex : Math.min(queryIndex, hashIndex);
      const path = url.slice(start, end);
      return tryDecodeURI(path.includes("%25") ? path.replace(/%25/g, "%2525") : path);
    } else if (charCode === 63 || charCode === 35) {
      break;
    }
  }
  return url.slice(start, i);
};
var getPathNoStrict = (request) => {
  const result = getPath(request);
  return result.length > 1 && result.at(-1) === "/" ? result.slice(0, -1) : result;
};
var mergePath = (base, sub, ...rest) => {
  if (rest.length) {
    sub = mergePath(sub, ...rest);
  }
  return `${base?.[0] === "/" ? "" : "/"}${base}${sub === "/" ? "" : `${base?.at(-1) === "/" ? "" : "/"}${sub?.[0] === "/" ? sub.slice(1) : sub}`}`;
};
var checkOptionalParameter = (path) => {
  if (path.charCodeAt(path.length - 1) !== 63 || !path.includes(":")) {
    return null;
  }
  const segments = path.split("/");
  const results = [];
  let basePath = "";
  segments.forEach((segment) => {
    if (segment !== "" && !/\:/.test(segment)) {
      basePath += "/" + segment;
    } else if (/\:/.test(segment)) {
      if (segment.charCodeAt(segment.length - 1) === 63) {
        if (results.length === 0 && basePath === "") {
          results.push("/");
        } else {
          results.push(basePath);
        }
        const optionalSegment = segment.slice(0, -1);
        basePath += "/" + optionalSegment;
        results.push(basePath);
      } else {
        basePath += "/" + segment;
      }
    }
  });
  return results.filter((v, i, a) => a.indexOf(v) === i);
};
var tryDecodeURIComponent = (str) => str.indexOf("%") !== -1 ? tryDecode(str, decodeURIComponent_) : str;
var _decodeURI = (value) => {
  if (value.indexOf("+") !== -1) {
    value = value.replace(/\+/g, " ");
  }
  return tryDecodeURIComponent(value);
};
var _getQueryParam = (url, key, multiple) => {
  const hashIndex = url.indexOf("#", 8);
  if (hashIndex !== -1) {
    url = url.slice(0, hashIndex);
  }
  let encoded;
  if (!multiple && key && key.indexOf("%") === -1 && key.indexOf("+") === -1) {
    let keyIndex2 = url.indexOf("?", 8);
    if (keyIndex2 === -1) {
      return void 0;
    }
    if (!url.startsWith(key, keyIndex2 + 1)) {
      keyIndex2 = url.indexOf(`&${key}`, keyIndex2 + 1);
    }
    while (keyIndex2 !== -1) {
      const trailingKeyCode = url.charCodeAt(keyIndex2 + key.length + 1);
      if (trailingKeyCode === 61) {
        const valueIndex = keyIndex2 + key.length + 2;
        const endIndex = url.indexOf("&", valueIndex);
        return _decodeURI(url.slice(valueIndex, endIndex === -1 ? void 0 : endIndex));
      } else if (trailingKeyCode == 38 || isNaN(trailingKeyCode)) {
        return "";
      }
      keyIndex2 = url.indexOf(`&${key}`, keyIndex2 + 1);
    }
    encoded = /[%+]/.test(url);
    if (!encoded) {
      return void 0;
    }
  }
  const results = /* @__PURE__ */ Object.create(null);
  encoded ??= /[%+]/.test(url);
  let keyIndex = url.indexOf("?", 8);
  while (keyIndex !== -1) {
    const nextKeyIndex = url.indexOf("&", keyIndex + 1);
    let valueIndex = url.indexOf("=", keyIndex);
    if (valueIndex > nextKeyIndex && nextKeyIndex !== -1) {
      valueIndex = -1;
    }
    let name = url.slice(
      keyIndex + 1,
      valueIndex === -1 ? nextKeyIndex === -1 ? void 0 : nextKeyIndex : valueIndex
    );
    if (encoded) {
      name = _decodeURI(name);
    }
    keyIndex = nextKeyIndex;
    if (name === "") {
      continue;
    }
    let value;
    if (valueIndex === -1) {
      value = "";
    } else {
      value = url.slice(valueIndex + 1, nextKeyIndex === -1 ? void 0 : nextKeyIndex);
      if (encoded) {
        value = _decodeURI(value);
      }
    }
    if (multiple) {
      if (!(results[name] && Array.isArray(results[name]))) {
        results[name] = [];
      }
      ;
      results[name].push(value);
    } else {
      results[name] ??= value;
    }
  }
  return key ? results[key] : results;
};
var getQueryParam = _getQueryParam;
var getQueryParams = (url, key) => {
  return _getQueryParam(url, key, true);
};
var decodeURIComponent_ = decodeURIComponent;

// club-lupita/node_modules/hono/dist/request.js
var HonoRequest = class {
  /**
   * `.raw` can get the raw Request object.
   *
   * @see {@link https://hono.dev/docs/api/request#raw}
   *
   * @example
   * ```ts
   * // For Cloudflare Workers
   * app.post('/', async (c) => {
   *   const metadata = c.req.raw.cf?.hostMetadata?
   *   ...
   * })
   * ```
   */
  raw;
  #validatedData;
  // Short name of validatedData
  #matchResult;
  routeIndex = 0;
  /**
   * `.path` can get the pathname of the request.
   *
   * @see {@link https://hono.dev/docs/api/request#path}
   *
   * @example
   * ```ts
   * app.get('/about/me', (c) => {
   *   const pathname = c.req.path // `/about/me`
   * })
   * ```
   */
  path;
  bodyCache = {};
  constructor(request, path = "/", matchResult = [[]]) {
    this.raw = request;
    this.path = path;
    this.#matchResult = matchResult;
  }
  param(key) {
    return key ? this.#getDecodedParam(key) : this.#getAllDecodedParams();
  }
  #getDecodedParam(key) {
    const paramKey = this.#matchResult[0][this.routeIndex]?.[1][key];
    const param = this.#getParamValue(paramKey);
    return param && tryDecodeURIComponent(param);
  }
  #getAllDecodedParams() {
    const decoded = {};
    const keys = Object.keys(this.#matchResult[0][this.routeIndex]?.[1] ?? {});
    for (const key of keys) {
      const value = this.#getParamValue(this.#matchResult[0][this.routeIndex][1][key]);
      if (value !== void 0) {
        decoded[key] = tryDecodeURIComponent(value);
      }
    }
    return decoded;
  }
  #getParamValue(paramKey) {
    return this.#matchResult[1] ? this.#matchResult[1][paramKey] : paramKey;
  }
  query(key) {
    return getQueryParam(this.url, key);
  }
  queries(key) {
    return getQueryParams(this.url, key);
  }
  header(name) {
    if (name) {
      return this.raw.headers.get(name) ?? void 0;
    }
    const headerData = /* @__PURE__ */ Object.create(null);
    this.raw.headers.forEach((value, key) => {
      headerData[key] = value;
    });
    return headerData;
  }
  async parseBody(options) {
    return parseBody(this, options);
  }
  #cachedBody = (key) => {
    const { bodyCache, raw: raw2 } = this;
    const cachedBody = bodyCache[key];
    if (cachedBody) {
      return cachedBody;
    }
    for (const anyCachedKey in bodyCache) {
      return bodyCache[anyCachedKey].then((body) => {
        if (anyCachedKey === "json") {
          body = JSON.stringify(body);
        }
        return new Response(body)[key]();
      });
    }
    return bodyCache[key] = raw2[key]();
  };
  /**
   * `.json()` can parse Request body of type `application/json`
   *
   * @see {@link https://hono.dev/docs/api/request#json}
   *
   * @example
   * ```ts
   * app.post('/entry', async (c) => {
   *   const body = await c.req.json()
   * })
   * ```
   */
  json() {
    return this.#cachedBody("text").then((text) => JSON.parse(text));
  }
  /**
   * `.text()` can parse Request body of type `text/plain`
   *
   * @see {@link https://hono.dev/docs/api/request#text}
   *
   * @example
   * ```ts
   * app.post('/entry', async (c) => {
   *   const body = await c.req.text()
   * })
   * ```
   */
  text() {
    return this.#cachedBody("text");
  }
  /**
   * `.arrayBuffer()` parse Request body as an `ArrayBuffer`
   *
   * @see {@link https://hono.dev/docs/api/request#arraybuffer}
   *
   * @example
   * ```ts
   * app.post('/entry', async (c) => {
   *   const body = await c.req.arrayBuffer()
   * })
   * ```
   */
  arrayBuffer() {
    return this.#cachedBody("arrayBuffer");
  }
  /**
   * `.bytes()` parses the request body as a `Uint8Array`.
   *
   * @see {@link https://hono.dev/docs/api/request#bytes}
   *
   * @example
   * ```ts
   * app.post('/entry', async (c) => {
   *   const body = await c.req.bytes()
   * })
   * ```
   */
  bytes() {
    return this.#cachedBody("arrayBuffer").then((buffer) => new Uint8Array(buffer));
  }
  /**
   * Parses the request body as a `Blob`.
   * @example
   * ```ts
   * app.post('/entry', async (c) => {
   *   const body = await c.req.blob();
   * });
   * ```
   * @see https://hono.dev/docs/api/request#blob
   */
  blob() {
    return this.#cachedBody("blob");
  }
  /**
   * Parses the request body as `FormData`.
   * @example
   * ```ts
   * app.post('/entry', async (c) => {
   *   const body = await c.req.formData();
   * });
   * ```
   * @see https://hono.dev/docs/api/request#formdata
   */
  formData() {
    return this.#cachedBody("formData");
  }
  /**
   * Adds validated data to the request.
   *
   * @param target - The target of the validation.
   * @param data - The validated data to add.
   */
  addValidatedData(target, data) {
    ;
    (this.#validatedData ??= {})[target] = data;
  }
  valid(target) {
    return this.#validatedData?.[target];
  }
  /**
   * `.url()` can get the request url strings.
   *
   * @see {@link https://hono.dev/docs/api/request#url}
   *
   * @example
   * ```ts
   * app.get('/about/me', (c) => {
   *   const url = c.req.url // `http://localhost:8787/about/me`
   *   ...
   * })
   * ```
   */
  get url() {
    return this.raw.url;
  }
  /**
   * `.method()` can get the method name of the request.
   *
   * @see {@link https://hono.dev/docs/api/request#method}
   *
   * @example
   * ```ts
   * app.get('/about/me', (c) => {
   *   const method = c.req.method // `GET`
   * })
   * ```
   */
  get method() {
    return this.raw.method;
  }
  get [GET_MATCH_RESULT]() {
    return this.#matchResult;
  }
  /**
   * `.matchedRoutes()` can return a matched route in the handler
   *
   * @deprecated
   *
   * Use matchedRoutes helper defined in "hono/route" instead.
   *
   * @see {@link https://hono.dev/docs/api/request#matchedroutes}
   *
   * @example
   * ```ts
   * app.use('*', async function logger(c, next) {
   *   await next()
   *   c.req.matchedRoutes.forEach(({ handler, method, path }, i) => {
   *     const name = handler.name || (handler.length < 2 ? '[handler]' : '[middleware]')
   *     console.log(
   *       method,
   *       ' ',
   *       path,
   *       ' '.repeat(Math.max(10 - path.length, 0)),
   *       name,
   *       i === c.req.routeIndex ? '<- respond from here' : ''
   *     )
   *   })
   * })
   * ```
   */
  get matchedRoutes() {
    return this.#matchResult[0].map(([[, route]]) => route);
  }
  /**
   * `routePath()` can retrieve the path registered within the handler
   *
   * @deprecated
   *
   * Use routePath helper defined in "hono/route" instead.
   *
   * @see {@link https://hono.dev/docs/api/request#routepath}
   *
   * @example
   * ```ts
   * app.get('/posts/:id', (c) => {
   *   return c.json({ path: c.req.routePath })
   * })
   * ```
   */
  get routePath() {
    return this.#matchResult[0].map(([[, route]]) => route)[this.routeIndex].path;
  }
};

// club-lupita/node_modules/hono/dist/utils/html.js
var HtmlEscapedCallbackPhase = {
  Stringify: 1,
  BeforeStream: 2,
  Stream: 3
};
var raw = (value, callbacks) => {
  const escapedString = new String(value);
  escapedString.isEscaped = true;
  escapedString.callbacks = callbacks;
  return escapedString;
};
var resolveCallback = async (str, phase, preserveCallbacks, context, buffer) => {
  if (typeof str === "object" && !(str instanceof String)) {
    if (!(str instanceof Promise)) {
      str = str.toString();
    }
    if (str instanceof Promise) {
      str = await str;
    }
  }
  const callbacks = str.callbacks;
  if (!callbacks?.length) {
    return Promise.resolve(str);
  }
  if (buffer) {
    buffer[0] += str;
  } else {
    buffer = [str];
  }
  const resStr = Promise.all(callbacks.map((c) => c({ phase, buffer, context }))).then(
    (res) => Promise.all(
      res.filter(Boolean).map((str2) => resolveCallback(str2, phase, false, context, buffer))
    ).then(() => buffer[0])
  );
  if (preserveCallbacks) {
    return raw(await resStr, callbacks);
  } else {
    return resStr;
  }
};

// club-lupita/node_modules/hono/dist/context.js
var TEXT_PLAIN = "text/plain; charset=UTF-8";
var setDefaultContentType = (contentType, headers) => {
  return {
    "Content-Type": contentType,
    ...headers
  };
};
var createResponseInstance = (body, init) => new Response(body, init);
var Context = class {
  #rawRequest;
  #req;
  /**
   * `.env` can get bindings (environment variables, secrets, KV namespaces, D1 database, R2 bucket etc.) in Cloudflare Workers.
   *
   * @see {@link https://hono.dev/docs/api/context#env}
   *
   * @example
   * ```ts
   * // Environment object for Cloudflare Workers
   * app.get('*', async c => {
   *   const counter = c.env.COUNTER
   * })
   * ```
   */
  env = {};
  #var;
  finalized = false;
  /**
   * `.error` can get the error object from the middleware if the Handler throws an error.
   *
   * @see {@link https://hono.dev/docs/api/context#error}
   *
   * @example
   * ```ts
   * app.use('*', async (c, next) => {
   *   await next()
   *   if (c.error) {
   *     // do something...
   *   }
   * })
   * ```
   */
  error;
  #status;
  #executionCtx;
  #res;
  #layout;
  #renderer;
  #notFoundHandler;
  #preparedHeaders;
  #matchResult;
  #path;
  /**
   * Creates an instance of the Context class.
   *
   * @param req - The Request object.
   * @param options - Optional configuration options for the context.
   */
  constructor(req, options) {
    this.#rawRequest = req;
    if (options) {
      this.#executionCtx = options.executionCtx;
      this.env = options.env;
      this.#notFoundHandler = options.notFoundHandler;
      this.#path = options.path;
      this.#matchResult = options.matchResult;
    }
  }
  /**
   * `.req` is the instance of {@link HonoRequest}.
   */
  get req() {
    this.#req ??= new HonoRequest(this.#rawRequest, this.#path, this.#matchResult);
    return this.#req;
  }
  /**
   * @see {@link https://hono.dev/docs/api/context#event}
   * The FetchEvent associated with the current request.
   *
   * @throws Will throw an error if the context does not have a FetchEvent.
   */
  get event() {
    if (this.#executionCtx && "respondWith" in this.#executionCtx) {
      return this.#executionCtx;
    } else {
      throw Error("This context has no FetchEvent");
    }
  }
  /**
   * @see {@link https://hono.dev/docs/api/context#executionctx}
   * The ExecutionContext associated with the current request.
   *
   * @throws Will throw an error if the context does not have an ExecutionContext.
   */
  get executionCtx() {
    if (this.#executionCtx) {
      return this.#executionCtx;
    } else {
      throw Error("This context has no ExecutionContext");
    }
  }
  /**
   * @see {@link https://hono.dev/docs/api/context#res}
   * The Response object for the current request.
   */
  get res() {
    return this.#res ||= createResponseInstance(null, {
      headers: this.#preparedHeaders ??= new Headers()
    });
  }
  /**
   * Sets the Response object for the current request.
   *
   * @param _res - The Response object to set.
   */
  set res(_res) {
    if (this.#res && _res) {
      _res = createResponseInstance(_res.body, _res);
      for (const [k, v] of this.#res.headers.entries()) {
        if (k === "content-type") {
          continue;
        }
        if (k === "set-cookie") {
          const cookies = this.#res.headers.getSetCookie();
          _res.headers.delete("set-cookie");
          for (const cookie of cookies) {
            _res.headers.append("set-cookie", cookie);
          }
        } else {
          _res.headers.set(k, v);
        }
      }
    }
    this.#res = _res;
    this.finalized = true;
  }
  /**
   * `.render()` can create a response within a layout.
   *
   * @see {@link https://hono.dev/docs/api/context#render-setrenderer}
   *
   * @example
   * ```ts
   * app.get('/', (c) => {
   *   return c.render('Hello!')
   * })
   * ```
   */
  render = (...args) => {
    this.#renderer ??= (content) => this.html(content);
    return this.#renderer(...args);
  };
  /**
   * Sets the layout for the response.
   *
   * @param layout - The layout to set.
   * @returns The layout function.
   */
  setLayout = (layout) => this.#layout = layout;
  /**
   * Gets the current layout for the response.
   *
   * @returns The current layout function.
   */
  getLayout = () => this.#layout;
  /**
   * `.setRenderer()` can set the layout in the custom middleware.
   *
   * @see {@link https://hono.dev/docs/api/context#render-setrenderer}
   *
   * @example
   * ```tsx
   * app.use('*', async (c, next) => {
   *   c.setRenderer((content) => {
   *     return c.html(
   *       <html>
   *         <body>
   *           <p>{content}</p>
   *         </body>
   *       </html>
   *     )
   *   })
   *   await next()
   * })
   * ```
   */
  setRenderer = (renderer) => {
    this.#renderer = renderer;
  };
  /**
   * `.header()` can set headers.
   *
   * @see {@link https://hono.dev/docs/api/context#header}
   *
   * @example
   * ```ts
   * app.get('/welcome', (c) => {
   *   // Set headers
   *   c.header('X-Message', 'Hello!')
   *   c.header('Content-Type', 'text/plain')
   *
   *   // Append multiple headers using the append option (e.g. Vary)
   *   c.header('Vary', 'Accept-Encoding', { append: true })
   *   c.header('Vary', 'User-Agent', { append: true })
   *
   *   return c.body('Thank you for coming')
   * })
   * ```
   */
  header = (name, value, options) => {
    if (this.finalized) {
      this.#res = createResponseInstance(this.#res.body, this.#res);
    }
    const headers = this.#res ? this.#res.headers : this.#preparedHeaders ??= new Headers();
    if (value === void 0) {
      headers.delete(name);
    } else if (options?.append) {
      headers.append(name, value);
    } else {
      headers.set(name, value);
    }
  };
  status = (status) => {
    this.#status = status;
  };
  /**
   * `.set()` can set the value specified by the key.
   *
   * @see {@link https://hono.dev/docs/api/context#set-get}
   *
   * @example
   * ```ts
   * app.use('*', async (c, next) => {
   *   c.set('message', 'Hono is hot!!')
   *   await next()
   * })
   * ```
   */
  set = (key, value) => {
    this.#var ??= /* @__PURE__ */ new Map();
    this.#var.set(key, value);
  };
  /**
   * `.get()` can use the value specified by the key.
   *
   * @see {@link https://hono.dev/docs/api/context#set-get}
   *
   * @example
   * ```ts
   * app.get('/', (c) => {
   *   const message = c.get('message')
   *   return c.text(`The message is "${message}"`)
   * })
   * ```
   */
  get = (key) => {
    return this.#var ? this.#var.get(key) : void 0;
  };
  /**
   * `.var` can access the value of a variable.
   *
   * @see {@link https://hono.dev/docs/api/context#var}
   *
   * @example
   * ```ts
   * const result = c.var.client.oneMethod()
   * ```
   */
  // c.var.propName is a read-only
  get var() {
    if (!this.#var) {
      return {};
    }
    return Object.fromEntries(this.#var);
  }
  #newResponse(data, arg, headers) {
    let responseHeaders = this.#res ? new Headers(this.#res.headers) : this.#preparedHeaders;
    if (typeof arg === "object" && arg.headers) {
      responseHeaders ??= new Headers();
      for (const [key, value] of new Headers(arg.headers)) {
        if (key === "set-cookie") {
          responseHeaders.append(key, value);
        } else {
          responseHeaders.set(key, value);
        }
      }
    }
    if (headers) {
      if (!responseHeaders) {
        let count = 0;
        for (const k in headers) {
          if (++count > 1 || typeof headers[k] !== "string") {
            responseHeaders = new Headers();
            break;
          }
        }
      }
      if (responseHeaders) {
        for (const k in headers) {
          const v = headers[k];
          if (typeof v === "string") {
            responseHeaders.set(k, v);
          } else {
            responseHeaders.delete(k);
            for (const v2 of v) {
              responseHeaders.append(k, v2);
            }
          }
        }
      }
    }
    const status = typeof arg === "number" ? arg : arg?.status ?? this.#status;
    return createResponseInstance(data, {
      status,
      headers: responseHeaders ?? headers
    });
  }
  newResponse = (...args) => this.#newResponse(...args);
  /**
   * `.body()` can return the HTTP response.
   * You can set headers with `.header()` and set HTTP status code with `.status`.
   * This can also be set in `.text()`, `.json()` and so on.
   *
   * @see {@link https://hono.dev/docs/api/context#body}
   *
   * @example
   * ```ts
   * app.get('/welcome', (c) => {
   *   // Set headers
   *   c.header('X-Message', 'Hello!')
   *   c.header('Content-Type', 'text/plain')
   *   // Set HTTP status code
   *   c.status(201)
   *
   *   // Return the response body
   *   return c.body('Thank you for coming')
   * })
   * ```
   */
  body = (data, arg, headers) => this.#newResponse(data, arg, headers);
  /**
   * `.text()` can render text as `Content-Type:text/plain`.
   *
   * @see {@link https://hono.dev/docs/api/context#text}
   *
   * @example
   * ```ts
   * app.get('/say', (c) => {
   *   return c.text('Hello!')
   * })
   * ```
   */
  text = (text, arg, headers) => {
    return !this.#preparedHeaders && !this.#status && !arg && !headers && !this.finalized ? new Response(text) : this.#newResponse(
      text,
      arg,
      setDefaultContentType(TEXT_PLAIN, headers)
    );
  };
  /**
   * `.json()` can render JSON as `Content-Type:application/json`.
   *
   * @see {@link https://hono.dev/docs/api/context#json}
   *
   * @example
   * ```ts
   * app.get('/api', (c) => {
   *   return c.json({ message: 'Hello!' })
   * })
   * ```
   */
  json = (object, arg, headers) => {
    return this.#newResponse(
      JSON.stringify(object),
      arg,
      setDefaultContentType("application/json", headers)
    );
  };
  html = (html, arg, headers) => {
    const res = (html2) => this.#newResponse(html2, arg, setDefaultContentType("text/html; charset=UTF-8", headers));
    return typeof html === "object" ? resolveCallback(html, HtmlEscapedCallbackPhase.Stringify, false, {}).then(res) : res(html);
  };
  /**
   * `.redirect()` can Redirect, default status code is 302.
   *
   * @see {@link https://hono.dev/docs/api/context#redirect}
   *
   * @example
   * ```ts
   * app.get('/redirect', (c) => {
   *   return c.redirect('/')
   * })
   * app.get('/redirect-permanently', (c) => {
   *   return c.redirect('/', 301)
   * })
   * ```
   */
  redirect = (location, status) => {
    const locationString = String(location);
    this.header(
      "Location",
      // Multibyes should be encoded
      // eslint-disable-next-line no-control-regex
      !/[^\x00-\xFF]/.test(locationString) ? locationString : encodeURI(locationString)
    );
    return this.newResponse(null, status ?? 302);
  };
  /**
   * `.notFound()` can return the Not Found Response.
   *
   * @see {@link https://hono.dev/docs/api/context#notfound}
   *
   * @example
   * ```ts
   * app.get('/notfound', (c) => {
   *   return c.notFound()
   * })
   * ```
   */
  notFound = () => {
    this.#notFoundHandler ??= () => createResponseInstance();
    return this.#notFoundHandler(this);
  };
};

// club-lupita/node_modules/hono/dist/router.js
var METHOD_NAME_ALL = "ALL";
var METHOD_NAME_ALL_LOWERCASE = "all";
var METHODS = ["get", "post", "put", "delete", "options", "patch", "query"];
var MESSAGE_MATCHER_IS_ALREADY_BUILT = "Can not add a route since the matcher is already built.";
var UnsupportedPathError = class extends Error {
};

// club-lupita/node_modules/hono/dist/utils/constants.js
var COMPOSED_HANDLER = "__COMPOSED_HANDLER";

// club-lupita/node_modules/hono/dist/hono-base.js
var notFoundHandler = (c) => {
  return c.text("404 Not Found", 404);
};
var errorHandler = (err, c) => {
  if ("getResponse" in err) {
    const res = err.getResponse();
    return c.newResponse(res.body, res);
  }
  console.error(err);
  return c.text("Internal Server Error", 500);
};
var Hono = class _Hono {
  get;
  post;
  put;
  delete;
  options;
  patch;
  query;
  all;
  on;
  use;
  /*
    This class is like an abstract class and does not have a router.
    To use it, inherit the class and implement router in the constructor.
  */
  router;
  getPath;
  // Cannot use `#` because it requires visibility at JavaScript runtime.
  _basePath = "/";
  #path = "/";
  routes = [];
  constructor(options = {}) {
    const allMethods = [...METHODS, METHOD_NAME_ALL_LOWERCASE];
    allMethods.forEach((method) => {
      this[method] = (args1, ...args) => {
        const methodName = method.toUpperCase();
        if (typeof args1 === "string") {
          this.#path = args1;
        } else {
          this.#addRoute(methodName, this.#path, args1);
        }
        args.forEach((handler) => {
          this.#addRoute(methodName, this.#path, handler);
        });
        return this;
      };
    });
    this.on = (method, path, ...handlers) => {
      for (const p of [path].flat()) {
        this.#path = p;
        for (const m of [method].flat()) {
          const methodName = m.toUpperCase();
          for (const handler of handlers) {
            this.#addRoute(methodName, this.#path, handler);
          }
        }
      }
      return this;
    };
    this.use = (arg1, ...handlers) => {
      if (typeof arg1 === "string") {
        this.#path = arg1;
      } else {
        this.#path = "*";
        handlers.unshift(arg1);
      }
      handlers.forEach((handler) => {
        this.#addRoute(METHOD_NAME_ALL, this.#path, handler);
      });
      return this;
    };
    const { strict, ...optionsWithoutStrict } = options;
    Object.assign(this, optionsWithoutStrict);
    this.getPath = strict ?? true ? options.getPath ?? getPath : getPathNoStrict;
  }
  #clone() {
    const clone = new _Hono({
      router: this.router,
      getPath: this.getPath
    });
    clone.errorHandler = this.errorHandler;
    clone.#notFoundHandler = this.#notFoundHandler;
    clone.routes = this.routes;
    return clone;
  }
  #notFoundHandler = notFoundHandler;
  // Cannot use `#` because it requires visibility at JavaScript runtime.
  errorHandler = errorHandler;
  /**
   * `.route()` allows grouping other Hono instance in routes.
   *
   * @see {@link https://hono.dev/docs/api/routing#grouping}
   *
   * @param {string} path - base Path
   * @param {Hono} app - other Hono instance
   * @returns {Hono} routed Hono instance
   *
   * @example
   * ```ts
   * const app = new Hono()
   * const app2 = new Hono()
   *
   * app2.get("/user", (c) => c.text("user"))
   * app.route("/api", app2) // GET /api/user
   * ```
   */
  route(path, app2) {
    const subApp = this.basePath(path);
    app2.routes.map((r) => {
      let handler;
      if (app2.errorHandler === errorHandler) {
        handler = r.handler;
      } else {
        handler = async (c, next) => (await compose([], app2.errorHandler)(c, () => r.handler(c, next))).res;
        handler[COMPOSED_HANDLER] = r.handler;
      }
      subApp.#addRoute(r.method, r.path, handler, r.basePath);
    });
    return this;
  }
  /**
   * `.basePath()` allows base paths to be specified.
   *
   * @see {@link https://hono.dev/docs/api/routing#base-path}
   *
   * @param {string} path - base Path
   * @returns {Hono} changed Hono instance
   *
   * @example
   * ```ts
   * const api = new Hono().basePath('/api')
   * ```
   */
  basePath(path) {
    const subApp = this.#clone();
    subApp._basePath = mergePath(this._basePath, path);
    return subApp;
  }
  /**
   * `.onError()` handles an error and returns a customized Response.
   *
   * @see {@link https://hono.dev/docs/api/hono#error-handling}
   *
   * @param {ErrorHandler} handler - request Handler for error
   * @returns {Hono} changed Hono instance
   *
   * @example
   * ```ts
   * app.onError((err, c) => {
   *   console.error(`${err}`)
   *   return c.text('Custom Error Message', 500)
   * })
   * ```
   */
  onError = (handler) => {
    this.errorHandler = handler;
    return this;
  };
  /**
   * `.notFound()` allows you to customize a Not Found Response.
   *
   * @see {@link https://hono.dev/docs/api/hono#not-found}
   *
   * @param {NotFoundHandler} handler - request handler for not-found
   * @returns {Hono} changed Hono instance
   *
   * @example
   * ```ts
   * app.notFound((c) => {
   *   return c.text('Custom 404 Message', 404)
   * })
   * ```
   */
  notFound = (handler) => {
    this.#notFoundHandler = handler;
    return this;
  };
  /**
   * `.mount()` allows you to mount applications built with other frameworks into your Hono application.
   *
   * @see {@link https://hono.dev/docs/api/hono#mount}
   *
   * @param {string} path - base Path
   * @param {Function} applicationHandler - other Request Handler
   * @param {MountOptions} [options] - options of `.mount()`
   * @returns {Hono} mounted Hono instance
   *
   * @example
   * ```ts
   * import { Router as IttyRouter } from 'itty-router'
   * import { Hono } from 'hono'
   * // Create itty-router application
   * const ittyRouter = IttyRouter()
   * // GET /itty-router/hello
   * ittyRouter.get('/hello', () => new Response('Hello from itty-router'))
   *
   * const app = new Hono()
   * app.mount('/itty-router', ittyRouter.handle)
   * ```
   *
   * @example
   * ```ts
   * const app = new Hono()
   * // Send the request to another application without modification.
   * app.mount('/app', anotherApp, {
   *   replaceRequest: (req) => req,
   * })
   * ```
   */
  mount(path, applicationHandler, options) {
    let replaceRequest;
    let optionHandler;
    if (options) {
      if (typeof options === "function") {
        optionHandler = options;
      } else {
        optionHandler = options.optionHandler;
        if (options.replaceRequest === false) {
          replaceRequest = (request) => request;
        } else {
          replaceRequest = options.replaceRequest;
        }
      }
    }
    const getOptions = optionHandler ? (c) => {
      const options2 = optionHandler(c);
      return Array.isArray(options2) ? options2 : [options2];
    } : (c) => {
      let executionContext = void 0;
      try {
        executionContext = c.executionCtx;
      } catch {
      }
      return [c.env, executionContext];
    };
    replaceRequest ||= (() => {
      const mergedPath = mergePath(this._basePath, path);
      const pathPrefixLength = mergedPath === "/" ? 0 : mergedPath.length;
      return (request) => {
        const url = new URL(request.url);
        url.pathname = this.getPath(request).slice(pathPrefixLength) || "/";
        return new Request(url, request);
      };
    })();
    const handler = async (c, next) => {
      const res = await applicationHandler(replaceRequest(c.req.raw), ...getOptions(c));
      if (res) {
        return res;
      }
      await next();
    };
    this.#addRoute(METHOD_NAME_ALL, mergePath(path, "*"), handler);
    return this;
  }
  #addRoute(method, path, handler, baseRoutePath) {
    path = mergePath(this._basePath, path);
    const r = {
      basePath: baseRoutePath !== void 0 ? mergePath(this._basePath, baseRoutePath) : this._basePath,
      path,
      method,
      handler
    };
    this.router.add(method, path, [handler, r]);
    this.routes.push(r);
  }
  #handleError(err, c) {
    if (err instanceof Error) {
      return this.errorHandler(err, c);
    }
    throw err;
  }
  #dispatch(request, executionCtx, env, method) {
    if (method === "HEAD") {
      return (async () => new Response(null, await this.#dispatch(request, executionCtx, env, "GET")))();
    }
    const path = this.getPath(request, { env });
    const matchResult = this.router.match(method, path);
    const c = new Context(request, {
      path,
      matchResult,
      env,
      executionCtx,
      notFoundHandler: this.#notFoundHandler
    });
    if (matchResult[0].length === 1) {
      let res;
      try {
        res = matchResult[0][0][0][0](c, async () => {
          c.res = await this.#notFoundHandler(c);
        });
      } catch (err) {
        return this.#handleError(err, c);
      }
      return res instanceof Promise ? res.then(
        (resolved) => resolved || (c.finalized ? c.res : this.#notFoundHandler(c))
      ).catch((err) => this.#handleError(err, c)) : res ?? this.#notFoundHandler(c);
    }
    const composed = compose(matchResult[0], this.errorHandler, this.#notFoundHandler);
    return (async () => {
      try {
        const context = await composed(c);
        if (!context.finalized) {
          throw new Error(
            "Context is not finalized. Did you forget to return a Response object or `await next()`?"
          );
        }
        return context.res;
      } catch (err) {
        return this.#handleError(err, c);
      }
    })();
  }
  /**
   * `.fetch()` will be entry point of your app.
   *
   * @see {@link https://hono.dev/docs/api/hono#fetch}
   *
   * @param {Request} request - request Object of request
   * @param {Env} env - env Object
   * @param {ExecutionContext} executionCtx - context of execution
   * @returns {Response | Promise<Response>} response of request
   *
   */
  fetch = (request, ...rest) => {
    return this.#dispatch(request, rest[1], rest[0], request.method);
  };
  /**
   * `.request()` is a useful method for testing.
   * You can pass a URL or pathname to send a GET request.
   * app will return a Response object.
   * ```ts
   * test('GET /hello is ok', async () => {
   *   const res = await app.request('/hello')
   *   expect(res.status).toBe(200)
   * })
   * ```
   * @see https://hono.dev/docs/api/hono#request
   */
  request = (input, requestInit, Env, executionCtx) => {
    if (input instanceof Request) {
      return this.fetch(requestInit ? new Request(input, requestInit) : input, Env, executionCtx);
    }
    input = input.toString();
    return this.fetch(
      new Request(
        /^https?:\/\//.test(input) ? input : `http://localhost${mergePath("/", input)}`,
        requestInit
      ),
      Env,
      executionCtx
    );
  };
  /**
   * `.fire()` automatically adds a global fetch event listener.
   * This can be useful for environments that adhere to the Service Worker API, such as non-ES module Cloudflare Workers.
   * @deprecated
   * Use `fire` from `hono/service-worker` instead.
   * ```ts
   * import { Hono } from 'hono'
   * import { fire } from 'hono/service-worker'
   *
   * const app = new Hono()
   * // ...
   * fire(app)
   * ```
   * @see https://hono.dev/docs/api/hono#fire
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API
   * @see https://developers.cloudflare.com/workers/reference/migrate-to-module-workers/
   */
  fire = () => {
    addEventListener("fetch", (event) => {
      event.respondWith(this.#dispatch(event.request, event, void 0, event.request.method));
    });
  };
};

// club-lupita/node_modules/hono/dist/router/utils.js
var createNullObject = () => /* @__PURE__ */ Object.create(null);

// club-lupita/node_modules/hono/dist/router/reg-exp-router/matcher.js
var emptyParam = [];
function match(method, path) {
  const matchers = this.buildAllMatchers();
  const match2 = ((method2, path2) => {
    const matcher = matchers[method2] || matchers[METHOD_NAME_ALL];
    const staticMatch = matcher[2][path2];
    if (staticMatch) {
      return staticMatch;
    }
    const match3 = path2.match(matcher[0]);
    if (!match3) {
      return [[], emptyParam];
    }
    const index = match3.indexOf("", 1);
    return [matcher[1][index], match3];
  });
  this.match = match2;
  return match2(method, path);
}

// club-lupita/node_modules/hono/dist/router/reg-exp-router/node.js
var LABEL_REG_EXP_STR = "[^/]+";
var ONLY_WILDCARD_REG_EXP_STR = ".*";
var TAIL_WILDCARD_REG_EXP_STR = "(?:|/.*)";
var PATH_ERROR = /* @__PURE__ */ Symbol();
var regExpMetaChars = new Set(".\\+*[^]$()");
function compareKey(a, b) {
  if (a.length === 1) {
    return b.length === 1 ? a < b ? -1 : 1 : -1;
  }
  if (b.length === 1) {
    return 1;
  }
  if (a === ONLY_WILDCARD_REG_EXP_STR || a === TAIL_WILDCARD_REG_EXP_STR) {
    return b === TAIL_WILDCARD_REG_EXP_STR ? -1 : 1;
  } else if (b === ONLY_WILDCARD_REG_EXP_STR || b === TAIL_WILDCARD_REG_EXP_STR) {
    return -1;
  }
  if (a === LABEL_REG_EXP_STR) {
    return 1;
  } else if (b === LABEL_REG_EXP_STR) {
    return -1;
  }
  return a.length === b.length ? a < b ? -1 : 1 : b.length - a.length;
}
var Node = class _Node {
  // handler index of a dynamic path, or -1 for a static path terminal
  #index;
  #varIndex;
  #children = createNullObject();
  insert(tokens, index, paramMap, context, isStatic) {
    let node = this;
    for (let i = 0, len = tokens.length; i < len; i++) {
      const token = tokens[i];
      const pattern = token.length === 1 ? token === "*" ? i === len - 1 ? ["", "", ONLY_WILDCARD_REG_EXP_STR] : ["", "", LABEL_REG_EXP_STR] : null : token === "/*" ? ["", "", TAIL_WILDCARD_REG_EXP_STR] : token.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);
      let nextNode;
      if (pattern) {
        const name = pattern[1];
        let regexpStr = pattern[2] || LABEL_REG_EXP_STR;
        if (name && pattern[2]) {
          if (regexpStr === ".*") {
            throw PATH_ERROR;
          }
          regexpStr = regexpStr.replace(/^\((?!\?:)(?=[^)]+\)$)/, "(?:");
          if (/\((?!\?:)/.test(regexpStr)) {
            throw PATH_ERROR;
          }
          if (regexpStr.length === 1 && regExpMetaChars.has(regexpStr)) {
            throw PATH_ERROR;
          }
        }
        nextNode = node.#children[regexpStr];
        if (!nextNode) {
          if (regexpStr !== ONLY_WILDCARD_REG_EXP_STR && regexpStr !== TAIL_WILDCARD_REG_EXP_STR) {
            for (const k in node.#children) {
              if (
                // a single-char pattern coexists with single-char literals as a literal does
                (regexpStr.length > 1 || k.length > 1) && k !== ONLY_WILDCARD_REG_EXP_STR && k !== TAIL_WILDCARD_REG_EXP_STR
              ) {
                throw PATH_ERROR;
              }
            }
          }
          nextNode = node.#children[regexpStr] = new _Node();
        }
        if (name !== "") {
          nextNode.#varIndex ??= context.varIndex++;
          paramMap.push([name, nextNode.#varIndex]);
        }
      } else {
        nextNode = node.#children[token];
        if (!nextNode) {
          for (const k in node.#children) {
            if (k.length > 1 && k !== ONLY_WILDCARD_REG_EXP_STR && k !== TAIL_WILDCARD_REG_EXP_STR) {
              throw PATH_ERROR;
            }
          }
          nextNode = node.#children[token] = new _Node();
        }
      }
      node = nextNode;
    }
    if (node.#index !== void 0) {
      throw PATH_ERROR;
    }
    node.#index = isStatic ? -1 : index;
  }
  buildRegExpStr() {
    const childKeys = Object.keys(this.#children).sort(compareKey);
    const strList = childKeys.map((k) => {
      const c = this.#children[k];
      const childStr = c.buildRegExpStr();
      return childStr === "" ? "" : (typeof c.#varIndex === "number" ? `(${k})@${c.#varIndex}` : regExpMetaChars.has(k) ? `\\${k}` : k) + childStr;
    }).filter(Boolean);
    if (typeof this.#index === "number" && this.#index !== -1) {
      strList.unshift(`#${this.#index}`);
    }
    if (strList.length === 0) {
      return "";
    }
    if (strList.length === 1) {
      return strList[0];
    }
    return "(?:" + strList.join("|") + ")";
  }
};

// club-lupita/node_modules/hono/dist/router/reg-exp-router/trie.js
var Trie = class {
  #context = { varIndex: 0 };
  #root = new Node();
  #index = 0;
  // dynamic path -> [handler index, param assoc]; static paths are not registered
  paths = createNullObject();
  insert(path, isStatic) {
    if (isStatic) {
      this.#root.insert(path.split(""), 0, [], this.#context, true);
      return;
    }
    const paramAssoc = [];
    const groups = [];
    let markedPath = path;
    for (let i = 0; ; ) {
      let replaced = false;
      markedPath = markedPath.replace(/\{[^}]+\}/g, (m) => {
        const mark = `@\\${i}`;
        groups[i] = [mark, m];
        i++;
        replaced = true;
        return mark;
      });
      if (!replaced) {
        break;
      }
    }
    const tokens = markedPath.match(/(?::[^\/]+)|(?:\/\*$)|./g) || [];
    for (let i = groups.length - 1; i >= 0; i--) {
      const [mark] = groups[i];
      for (let j = tokens.length - 1; j >= 0; j--) {
        if (tokens[j].indexOf(mark) !== -1) {
          tokens[j] = tokens[j].replace(mark, groups[i][1]);
          break;
        }
      }
    }
    this.#root.insert(tokens, this.#index, paramAssoc, this.#context, false);
    this.paths[path] = [this.#index++, paramAssoc];
  }
  buildRegExp() {
    let regexp = this.#root.buildRegExpStr();
    if (regexp === "") {
      return [/^$/, [], []];
    }
    let captureIndex = 0;
    const indexReplacementMap = [];
    const paramReplacementMap = [];
    regexp = regexp.replace(/#(\d+)|@(\d+)|\.\*\$/g, (_, handlerIndex, paramIndex) => {
      if (handlerIndex !== void 0) {
        indexReplacementMap[++captureIndex] = Number(handlerIndex);
        return "$()";
      }
      if (paramIndex !== void 0) {
        paramReplacementMap[Number(paramIndex)] = ++captureIndex;
        return "";
      }
      return "";
    });
    return [new RegExp(`^${regexp}`), indexReplacementMap, paramReplacementMap];
  }
};

// club-lupita/node_modules/hono/dist/router/reg-exp-router/router.js
var wildcardRegExpCache = createNullObject();
function buildWildcardRegExp(path) {
  return wildcardRegExpCache[path] ??= new RegExp(
    `^${path.replace(
      /\/:[^/{}]+(?:\{\[\^\/]\+})?(?=[/{]|$)|\/?\*$|([.\\+*[^\]$()?{}|])/g,
      (match2, metaChar) => metaChar ? `\\${metaChar}` : match2 === "/*" ? TAIL_WILDCARD_REG_EXP_STR : match2 === "*" ? ONLY_WILDCARD_REG_EXP_STR : `/:${LABEL_REG_EXP_STR}`
    )}$`
  );
}
function findMiddleware(middleware, path) {
  for (const k of Object.keys(middleware).sort((a, b) => b.length - a.length)) {
    if (buildWildcardRegExp(k).test(path)) {
      return [...middleware[k]];
    }
  }
  return void 0;
}
var RegExpRouter = class {
  name = "RegExpRouter";
  #middleware;
  #routes;
  #tries;
  constructor() {
    this.#middleware = { [METHOD_NAME_ALL]: createNullObject() };
    this.#routes = { [METHOD_NAME_ALL]: createNullObject() };
    this.#tries = { [METHOD_NAME_ALL]: new Trie() };
  }
  #insertPath(method, path) {
    try {
      this.#tries[method].insert(path, !/\*|\/:/.test(path));
    } catch (e) {
      throw e === PATH_ERROR ? new UnsupportedPathError(path) : e;
    }
  }
  add(method, path, handler) {
    const middleware = this.#middleware;
    const routes = this.#routes;
    if (!middleware) {
      throw new Error(MESSAGE_MATCHER_IS_ALREADY_BUILT);
    }
    if (!middleware[method]) {
      this.#tries[method] = new Trie();
      for (const handlerMap of [middleware, routes]) {
        handlerMap[method] = createNullObject();
        for (const p in handlerMap[METHOD_NAME_ALL]) {
          handlerMap[method][p] = [...handlerMap[METHOD_NAME_ALL][p]];
          this.#insertPath(method, p);
        }
      }
    }
    if (path === "/*") {
      path = "*";
    }
    const methods = method === METHOD_NAME_ALL ? Object.keys(middleware) : [method];
    if (/\*$/.test(path)) {
      const re = buildWildcardRegExp(path);
      for (const m of methods) {
        if (!middleware[m][path]) {
          this.#insertPath(m, path);
          middleware[m][path] = findMiddleware(middleware[m], path) || findMiddleware(middleware[METHOD_NAME_ALL], path) || [];
        }
      }
      for (const handlerMap of [middleware, routes]) {
        for (const m of methods) {
          for (const p in handlerMap[m]) {
            re.test(p) && handlerMap[m][p].push([handler, path]);
          }
        }
      }
      return;
    }
    const paths = checkOptionalParameter(path) || [path];
    for (const path2 of paths) {
      for (const m of methods) {
        if (!routes[m][path2]) {
          this.#insertPath(m, path2);
          routes[m][path2] = findMiddleware(middleware[m], path2) || findMiddleware(middleware[METHOD_NAME_ALL], path2) || [];
        }
        routes[m][path2].push([handler, path2]);
      }
    }
  }
  match = match;
  buildAllMatchers() {
    const matchers = createNullObject();
    for (const method of Object.keys(this.#routes)) {
      matchers[method] = this.#buildMatcher(method);
    }
    this.#middleware = this.#routes = this.#tries = void 0;
    wildcardRegExpCache = createNullObject();
    return matchers;
  }
  #buildMatcher(method) {
    const middleware = this.#middleware[method];
    const routes = this.#routes[method];
    const trie = this.#tries[method];
    const staticMap = createNullObject();
    const handlerData = [];
    const [regexp, indexReplacementMap, paramReplacementMap] = trie.buildRegExp();
    for (const r of [middleware, routes]) {
      for (const path in r) {
        const handlers = r[path];
        const pathData = trie.paths[path];
        if (!pathData) {
          staticMap[path] = [handlers.map(([h]) => [h, createNullObject()]), emptyParam];
          continue;
        }
        handlerData[pathData[0]] = handlers.map(([h, handlerPath]) => [
          h,
          trie.paths[handlerPath][1].reduceRight((map, [key], i) => {
            map[key] = paramReplacementMap[pathData[1][i][1]];
            return map;
          }, createNullObject())
        ]);
      }
    }
    return [regexp, indexReplacementMap.map((i) => handlerData[i]), staticMap];
  }
};

// club-lupita/node_modules/hono/dist/router/smart-router/router.js
var SmartRouter = class {
  name = "SmartRouter";
  #routers = [];
  #routes = [];
  constructor(init) {
    this.#routers = init.routers;
  }
  add(method, path, handler) {
    if (!this.#routes) {
      throw new Error(MESSAGE_MATCHER_IS_ALREADY_BUILT);
    }
    this.#routes.push([method, path, handler]);
  }
  match(method, path) {
    if (!this.#routes) {
      throw new Error("Fatal error");
    }
    const routers = this.#routers;
    const routes = this.#routes;
    const len = routers.length;
    let i = 0;
    let res;
    for (; i < len; i++) {
      const router = routers[i];
      try {
        for (let i2 = 0, len2 = routes.length; i2 < len2; i2++) {
          router.add(...routes[i2]);
        }
        res = router.match(method, path);
      } catch (e) {
        if (e instanceof UnsupportedPathError) {
          continue;
        }
        throw e;
      }
      this.match = router.match.bind(router);
      this.#routers = [router];
      this.#routes = void 0;
      break;
    }
    if (i === len) {
      throw new Error("Fatal error");
    }
    this.name = `SmartRouter + ${this.activeRouter.name}`;
    return res;
  }
  get activeRouter() {
    if (this.#routes || this.#routers.length !== 1) {
      throw new Error("No active router has been determined yet.");
    }
    return this.#routers[0];
  }
};

// club-lupita/node_modules/hono/dist/router/trie-router/node.js
var emptyParams = createNullObject();
var order = 0;
var Node2 = class _Node2 {
  #methods = [];
  #children = createNullObject();
  #patterns = [];
  #pattern;
  #params = emptyParams;
  insert(method, path, handler) {
    let curNode = this;
    const parts = splitRoutingPath(path);
    const possibleKeys = /* @__PURE__ */ new Set();
    let i = 0;
    for (const p of parts) {
      const nextP = parts[++i];
      const pattern = getPattern(p, nextP) || (nextP === void 0 && p && p.indexOf("*") === p.length - 1 ? p : null);
      const isParam = Array.isArray(pattern);
      const key = isParam ? pattern[0] : pattern || p;
      const child = curNode.#children[key] ||= new _Node2();
      if (pattern && !child.#pattern) {
        child.#pattern = pattern;
        curNode.#patterns.push(child);
      }
      curNode = child;
      if (isParam) {
        possibleKeys.add(pattern[1]);
      }
    }
    curNode.#methods.push({
      [method]: {
        handler,
        possibleKeys: [...possibleKeys],
        score: ++order
      }
    });
  }
  #pushHandlerSets(handlerSets, node, method, nodeParams, params) {
    for (let i = 0, len = node.#methods.length; i < len; i++) {
      const m = node.#methods[i];
      const handlerSet = m[method] || m[METHOD_NAME_ALL];
      if (handlerSet) {
        handlerSet.params = createNullObject();
        handlerSets.push(handlerSet);
        for (let i2 = 0, len2 = handlerSet.possibleKeys.length; i2 < len2; i2++) {
          const key = handlerSet.possibleKeys[i2];
          handlerSet.params[key] = params?.[key] && !i2 ? params[key] : nodeParams[key] ?? params?.[key];
        }
      }
    }
  }
  search(method, path) {
    const handlerSets = [];
    this.#params = emptyParams;
    const curNode = this;
    let curNodes = [curNode];
    const parts = splitPath(path);
    const curNodesQueue = [];
    const len = parts.length;
    let partOffsets = null;
    for (let i = 0; i < len; i++) {
      const part = parts[i];
      const isLast = i === len - 1;
      const tempNodes = [];
      for (let j = 0, len2 = curNodes.length; j < len2; j++) {
        const node = curNodes[j];
        const nextNode = node.#children[part];
        if (nextNode) {
          nextNode.#params = node.#params;
          if (isLast) {
            if (nextNode.#children["*"]) {
              this.#pushHandlerSets(handlerSets, nextNode.#children["*"], method, node.#params);
            }
            this.#pushHandlerSets(handlerSets, nextNode, method, node.#params);
          } else {
            tempNodes.push(nextNode);
          }
        }
        for (const child of node.#patterns) {
          const pattern = child.#pattern;
          const params = node.#params === emptyParams ? {} : { ...node.#params };
          if (typeof pattern === "string") {
            if (pattern === "*" || part.startsWith(pattern.slice(0, -1))) {
              this.#pushHandlerSets(handlerSets, child, method, node.#params);
              if (pattern === "*") {
                child.#params = params;
                tempNodes.push(child);
              }
            }
            continue;
          }
          const [, name, matcher] = pattern;
          if (!part && matcher === true) {
            continue;
          }
          if (matcher !== true) {
            if (!partOffsets) {
              partOffsets = [];
              let offset = path[0] === "/" ? 1 : 0;
              for (let p = 0; p < len; p++) {
                partOffsets[p] = offset;
                offset += parts[p].length + 1;
              }
            }
            const restPathString = path.slice(partOffsets[i]);
            const m = matcher.exec(restPathString);
            if (m) {
              params[name] = m[0];
              this.#pushHandlerSets(handlerSets, child, method, node.#params, params);
              if (m[0].length === restPathString.length && child.#children["*"]) {
                this.#pushHandlerSets(
                  handlerSets,
                  child.#children["*"],
                  method,
                  node.#params,
                  params
                );
              }
              for (const _ in child.#children) {
                child.#params = params;
                const componentCount = m[0].match(/\//g)?.length ?? 0;
                const targetCurNodes = curNodesQueue[componentCount] ||= [];
                targetCurNodes.push(child);
                break;
              }
              continue;
            }
          }
          if (matcher === true || matcher.test(part)) {
            params[name] = part;
            if (isLast) {
              this.#pushHandlerSets(handlerSets, child, method, params, node.#params);
              if (child.#children["*"]) {
                this.#pushHandlerSets(
                  handlerSets,
                  child.#children["*"],
                  method,
                  params,
                  node.#params
                );
              }
            } else {
              child.#params = params;
              tempNodes.push(child);
            }
          }
        }
      }
      const shifted = curNodesQueue.shift();
      curNodes = shifted ? tempNodes.concat(shifted) : tempNodes;
    }
    if (handlerSets[1]) {
      handlerSets.sort((a, b) => {
        return a.score - b.score;
      });
    }
    return [handlerSets.map(({ handler, params }) => [handler, params])];
  }
};

// club-lupita/node_modules/hono/dist/router/trie-router/router.js
var TrieRouter = class {
  name = "TrieRouter";
  #node = new Node2();
  add(method, path, handler) {
    for (const result of checkOptionalParameter(path) || [path]) {
      this.#node.insert(method, result, handler);
    }
  }
  match(method, path) {
    return this.#node.search(method, path);
  }
};

// club-lupita/node_modules/hono/dist/hono.js
var Hono2 = class extends Hono {
  /**
   * Creates an instance of the Hono class.
   *
   * @param options - Optional configuration options for the Hono instance.
   */
  constructor(options = {}) {
    super(options);
    this.router = options.router ?? new SmartRouter({
      routers: [new RegExpRouter(), new TrieRouter()]
    });
  }
};

// club-lupita/src/worker/cabeceras.ts
var CABECERAS_SEGURIDAD = {
  "Content-Security-Policy": "default-src 'self'; script-src 'self' https://static.cloudflareinsights.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self' https://cloudflareinsights.com; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'",
  "Strict-Transport-Security": "max-age=31536000",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-Frame-Options": "DENY"
};
var cabecerasSeguras = async (c, next) => {
  await next();
  for (const [nombre, valor] of Object.entries(CABECERAS_SEGURIDAD)) c.header(nombre, valor);
};

// club-lupita/node_modules/hono/dist/middleware/body-limit/index.js
var ERROR_MESSAGE = "Payload Too Large";
var bodyLimit = (options) => {
  const onError = options.onError || (() => {
    const res = new Response(ERROR_MESSAGE, {
      status: 413
    });
    throw new HTTPException(413, { res });
  });
  const maxSize = options.maxSize;
  return async function bodyLimit2(c, next) {
    if (!c.req.raw.body) {
      return next();
    }
    const hasTransferEncoding = c.req.raw.headers.has("transfer-encoding");
    const hasContentLength = c.req.raw.headers.has("content-length");
    if (hasContentLength && !hasTransferEncoding) {
      const contentLength = parseInt(c.req.raw.headers.get("content-length") || "0", 10);
      return contentLength > maxSize ? onError(c) : next();
    }
    let size = 0;
    const chunks = [];
    const rawReader = c.req.raw.body.getReader();
    for (; ; ) {
      const { done, value } = await rawReader.read();
      if (done) {
        break;
      }
      size += value.length;
      if (size > maxSize) {
        return onError(c);
      }
      chunks.push(value);
    }
    const requestInit = {
      body: new ReadableStream({
        start(controller) {
          for (const chunk of chunks) {
            controller.enqueue(chunk);
          }
          controller.close();
        }
      }),
      duplex: "half"
    };
    c.req.raw = new Request(c.req.raw, requestInit);
    return next();
  };
};

// research_reservas_2026-10-08/integridad/driver.mjs
var neonConfig = {};
var db = () => globalThis.__reservationAuditDb;
var Client = class {
  constructor(url) {
    if (url !== "postgres://reservation-audit-local") throw Error("No remote database allowed");
  }
  async connect() {
  }
  async end() {
  }
  async query(q, p) {
    return db().query(q, p);
  }
};
function neon(url) {
  if (url !== "postgres://reservation-audit-local") throw Error("No remote database allowed");
  const sql = (parts, ...p) => {
    const q = parts.reduce((s, v, i) => s + (i ? "$" + i : "") + v, "");
    const execute = () => db().query(q, p).then((r) => r.rows);
    return { execute, then: (yes, no) => execute().then(yes, no) };
  };
  sql.transaction = async (queries) => {
    await db().exec("BEGIN");
    try {
      const result = [];
      for (const q of queries) result.push(await q.execute());
      await db().exec("COMMIT");
      return result;
    } catch (e) {
      await db().exec("ROLLBACK");
      throw e;
    }
  };
  return sql;
}

// club-lupita/src/worker/cuenta-cliente.ts
function registrarCuentaCliente(app2) {
  app2.post("/api/perfil", bodyLimit({ maxSize: 4096, onError: (c) => c.json({ error: "El perfil es demasiado largo." }, 413) }), async (c) => {
    c.header("Cache-Control", "no-store");
    const sesion = c.get("sesion");
    if (sesion.rol !== "socio") return c.json({ error: "Entr\xE1 con tu cuenta para editar tu perfil." }, 403);
    const raw2 = await c.req.json().catch(() => null);
    if (!raw2 || typeof raw2 !== "object" || Array.isArray(raw2)) return c.json({ error: "Revis\xE1 los datos del perfil." }, 422);
    const datos = raw2;
    const campos = ["nombre", "bebida_siempre", "alergias", "cumple"];
    if (Object.keys(datos).some((k) => !campos.includes(k)) || campos.some((k) => typeof datos[k] !== "string")) {
      return c.json({ error: "Solo pod\xE9s actualizar tu nombre, bebida, alergias y cumplea\xF1os." }, 422);
    }
    const nombre = datos.nombre.trim();
    const bebida = datos.bebida_siempre.trim();
    const alergias = datos.alergias.trim();
    const cumple = datos.cumple.trim();
    if (nombre.length < 2 || nombre.length > 80 || bebida.length > 120 || alergias.length > 240 || [nombre, bebida, alergias].some((v) => /[\u0000-\u001f\u007f]/.test(v))) {
      return c.json({ error: "Us\xE1 un nombre de 2 a 80 caracteres, una bebida de hasta 120 y alergias de hasta 240." }, 422);
    }
    const fecha = /* @__PURE__ */ new Date(cumple + "T00:00:00Z");
    const hoy = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Managua", year: "numeric", month: "2-digit", day: "2-digit" }).format(/* @__PURE__ */ new Date());
    if (cumple && (!/^\d{4}-\d{2}-\d{2}$/.test(cumple) || !Number.isFinite(fecha.getTime()) || fecha.toISOString().slice(0, 10) !== cumple || cumple < "0001-01-01" || cumple > hoy)) {
      return c.json({ error: "El cumplea\xF1os debe ser una fecha v\xE1lida que no est\xE9 en el futuro." }, 422);
    }
    const sql = neon(c.env.DATABASE_URL);
    const filas = await sql`
      WITH actualizado AS (
        UPDATE operativo_socio SET nombre=${nombre}, bebida_siempre=${bebida || null}, alergias=${alergias || null}, cumple=${cumple || null}::date
        WHERE telefono=${sesion.tel} AND baja IS NULL RETURNING id
      ), registrado AS (
        INSERT INTO auditoria(quien,accion,socio_id,detalle)
        SELECT 'socio','editar_perfil',id,'{"campos":["nombre","bebida_siempre","alergias","cumple"]}'::jsonb FROM actualizado
      ) SELECT id FROM actualizado`;
    if (!filas.length) return c.json({ error: "No encontramos una cuenta activa." }, 404);
    return c.json({ guardado: true });
  });
  app2.get("/api/actividad", async (c) => {
    c.header("Cache-Control", "no-store");
    const sesion = c.get("sesion");
    if (sesion.rol !== "socio") return c.json({ error: "Entr\xE1 con tu cuenta para ver tu actividad." }, 403);
    const tipo = c.req.query("tipo") ?? "todos";
    if (!["todos", "dinero", "puntos", "sellos", "canjes"].includes(tipo)) return c.json({ error: "Eleg\xED un filtro v\xE1lido." }, 422);
    let antes = null;
    let clave2 = null;
    const cursor = c.req.query("cursor");
    if (cursor) {
      try {
        if (cursor.length > 512) throw new Error("cursor");
        const v = JSON.parse(atob(cursor));
        if (!v || typeof v.fecha !== "string" || typeof v.id !== "string" || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{6}Z$/.test(v.fecha) || v.fecha < "0001-01-01" || !Number.isFinite(Date.parse(v.fecha)) || new Date(v.fecha).toISOString().slice(0, 19) !== v.fecha.slice(0, 19) || !/^(dinero|puntos|sellos|canjes|beneficios):[a-f0-9-]{1,40}$/.test(v.id)) throw new Error("cursor");
        antes = v.fecha;
        clave2 = v.id;
      } catch {
        return c.json({ error: "No pudimos leer esa p\xE1gina. Volv\xE9 al inicio del historial." }, 422);
      }
    }
    const sql = neon(c.env.DATABASE_URL);
    const filas = await sql`
      WITH miembro AS (SELECT id FROM operativo_socio WHERE telefono=${sesion.tel} AND baja IS NULL), actividad AS (
        SELECT 'dinero:'||a.id AS id,'dinero' AS tipo,a.concepto,a.creado AS fecha,a.monto AS cantidad FROM operativo_asiento a JOIN miembro m ON m.id=a.socio_id
        UNION ALL
        SELECT 'puntos:'||p.id,'puntos',p.concepto,p.creado,p.puntos FROM operativo_punto p JOIN miembro m ON m.id=p.socio_id
        UNION ALL
        SELECT 'sellos:'||s.id,'sellos',s.motivo,s.puesto,1 FROM operativo_sello s JOIN operativo_tanda t ON t.id=s.tanda_id JOIN miembro m ON m.id=t.socio_id
        UNION ALL
        SELECT 'canjes:'||t.id,'canjes','Bebida de cortesía entregada',t.canjeada,1 FROM operativo_tanda t JOIN miembro m ON m.id=t.socio_id WHERE t.canjeada IS NOT NULL
        UNION ALL
        SELECT 'beneficios:'||b.id,'canjes',CASE b.clase WHEN 'bolsa_mes' THEN 'Uso registrado: bolsa del mes' ELSE 'Uso registrado: bebida del día' END,b.usado,1
        FROM operativo_beneficio_uso b JOIN operativo_membresia ms ON ms.id=b.membresia_id JOIN miembro m ON m.id=ms.socio_id
      ) SELECT id,tipo,concepto,to_char(fecha AT TIME ZONE 'UTC','YYYY-MM-DD"T"HH24:MI:SS.US"Z"') AS creado,cantidad FROM actividad
      WHERE (${tipo}='todos' OR tipo=${tipo}) AND (${antes}::timestamptz IS NULL OR (fecha,id)<(${antes}::timestamptz,${clave2}::text))
      ORDER BY fecha DESC,id DESC LIMIT 21`;
    const movimientos = filas.slice(0, 20);
    const ultimo = movimientos.at(-1);
    return c.json({ movimientos, siguiente: filas.length > 20 && ultimo ? btoa(JSON.stringify({ fecha: ultimo.creado, id: ultimo.id })) : null });
  });
}

// club-lupita/src/worker/acceso-equipo.ts
import QRCode from "file:///C:/Users/artur/Desktop/Proyectos/La%20Bella%20Lupita%20%20-%20APP/club-lupita/node_modules/qrcode/lib/index.js";

// club-lupita/node_modules/otpauth/dist/otpauth.node.mjs
import * as crypto2 from "node:crypto";
var uintDecode = (num) => {
  const buf = new ArrayBuffer(8);
  const arr = new Uint8Array(buf);
  let acc = num;
  for (let i = 7; i >= 0; i--) {
    if (acc === 0) break;
    arr[i] = acc & 255;
    acc -= arr[i];
    acc /= 256;
  }
  return arr;
};
var globalScope = (() => {
  if (typeof globalThis === "object") return globalThis;
  else {
    Object.defineProperty(Object.prototype, "__GLOBALTHIS__", {
      get() {
        return this;
      },
      configurable: true
    });
    try {
      if (typeof __GLOBALTHIS__ !== "undefined") return __GLOBALTHIS__;
    } finally {
      delete Object.prototype.__GLOBALTHIS__;
    }
  }
  if (typeof self !== "undefined") return self;
  else if (typeof window !== "undefined") return window;
  else if (typeof global !== "undefined") return global;
  return void 0;
})();
var canonicalizeAlgorithm = (algorithm) => {
  switch (true) {
    case /^(?:SHA-?1|SSL3-SHA1)$/i.test(algorithm):
      return "SHA1";
    case /^SHA(?:2?-)?224$/i.test(algorithm):
      return "SHA224";
    case /^SHA(?:2?-)?256$/i.test(algorithm):
      return "SHA256";
    case /^SHA(?:2?-)?384$/i.test(algorithm):
      return "SHA384";
    case /^SHA(?:2?-)?512$/i.test(algorithm):
      return "SHA512";
    case /^SHA3-224$/i.test(algorithm):
      return "SHA3-224";
    case /^SHA3-256$/i.test(algorithm):
      return "SHA3-256";
    case /^SHA3-384$/i.test(algorithm):
      return "SHA3-384";
    case /^SHA3-512$/i.test(algorithm):
      return "SHA3-512";
    default:
      throw new TypeError(`Unknown hash algorithm: ${algorithm}`);
  }
};
var hmacDigest = (algorithm, key, message) => {
  if (crypto2?.createHmac) {
    const hmac = crypto2.createHmac(algorithm, globalScope.Buffer.from(key));
    hmac.update(globalScope.Buffer.from(message));
    return hmac.digest();
  } else {
    throw new Error("Missing HMAC function");
  }
};
var ALPHABET$1 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
var base32Decode = (str) => {
  str = str.replace(/ /g, "").toUpperCase();
  let end = str.length;
  while (str[end - 1] === "=") --end;
  if (end < str.length) str = str.substring(0, end);
  const buf = new ArrayBuffer(str.length * 5 / 8 | 0);
  const arr = new Uint8Array(buf);
  let bits = 0;
  let value = 0;
  let index = 0;
  for (let i = 0; i < str.length; i++) {
    const idx = ALPHABET$1.indexOf(str[i]);
    if (idx === -1) throw new TypeError(`Invalid character found: ${str[i]}`);
    value = value << 5 | idx;
    bits += 5;
    if (bits >= 8) {
      bits -= 8;
      arr[index++] = value >>> bits;
    }
  }
  return arr;
};
var base32Encode = (arr) => {
  let bits = 0;
  let value = 0;
  let str = "";
  for (let i = 0; i < arr.length; i++) {
    value = value << 8 | arr[i];
    bits += 8;
    while (bits >= 5) {
      str += ALPHABET$1[value >>> bits - 5 & 31];
      bits -= 5;
    }
  }
  if (bits > 0) {
    str += ALPHABET$1[value << 5 - bits & 31];
  }
  return str;
};
var ALPHABET = "0123456789ABCDEF";
var hexDecode = (str) => {
  str = str.replace(/ /g, "").toUpperCase();
  const buf = new ArrayBuffer(str.length / 2);
  const arr = new Uint8Array(buf);
  for (let i = 0; i < str.length; i += 2) {
    const hi = ALPHABET.indexOf(str[i]);
    const lo = ALPHABET.indexOf(str[i + 1]);
    if (hi === -1 || lo === -1) throw new TypeError(`Invalid character found: ${str.substring(i, i + 2)}`);
    arr[i / 2] = hi << 4 | lo;
  }
  return arr;
};
var hexEncode = (arr) => {
  let str = "";
  for (let i = 0; i < arr.length; i++) {
    const hex = arr[i].toString(16);
    if (hex.length === 1) str += "0";
    str += hex;
  }
  return str.toUpperCase();
};
var latin1Decode = (str) => {
  const buf = new ArrayBuffer(str.length);
  const arr = new Uint8Array(buf);
  for (let i = 0; i < str.length; i++) {
    arr[i] = str.charCodeAt(i) & 255;
  }
  return arr;
};
var latin1Encode = (arr) => {
  let str = "";
  for (let i = 0; i < arr.length; i++) {
    str += String.fromCharCode(arr[i]);
  }
  return str;
};
var ENCODER = globalScope.TextEncoder ? new globalScope.TextEncoder() : null;
var DECODER = globalScope.TextDecoder ? new globalScope.TextDecoder() : null;
var utf8Decode = (str) => {
  if (!ENCODER) {
    throw new Error("Encoding API not available");
  }
  return ENCODER.encode(str);
};
var utf8Encode = (arr) => {
  if (!DECODER) {
    throw new Error("Encoding API not available");
  }
  return DECODER.decode(arr);
};
var randomBytes2 = (size) => {
  if (crypto2?.randomBytes) {
    return crypto2.randomBytes(size);
  } else if (globalScope.crypto?.getRandomValues) {
    return globalScope.crypto.getRandomValues(new Uint8Array(size));
  } else {
    throw new Error("Cryptography API not available");
  }
};
var Secret = class _Secret {
  /**
  * Converts a Latin-1 string to a Secret object.
  * @param {string} str Latin-1 string.
  * @returns {Secret} Secret object.
  */
  static fromLatin1(str) {
    return new _Secret({
      buffer: latin1Decode(str).buffer
    });
  }
  /**
  * Converts an UTF-8 string to a Secret object.
  * @param {string} str UTF-8 string.
  * @returns {Secret} Secret object.
  */
  static fromUTF8(str) {
    return new _Secret({
      buffer: utf8Decode(str).buffer
    });
  }
  /**
  * Converts a base32 string to a Secret object.
  * @param {string} str Base32 string.
  * @returns {Secret} Secret object.
  */
  static fromBase32(str) {
    return new _Secret({
      buffer: base32Decode(str).buffer
    });
  }
  /**
  * Converts a hexadecimal string to a Secret object.
  * @param {string} str Hexadecimal string.
  * @returns {Secret} Secret object.
  */
  static fromHex(str) {
    return new _Secret({
      buffer: hexDecode(str).buffer
    });
  }
  /**
  * Secret key buffer.
  * @deprecated For backward compatibility, the "bytes" property should be used instead.
  * @type {ArrayBufferLike}
  */
  get buffer() {
    return this.bytes.buffer;
  }
  /**
  * Latin-1 string representation of secret key.
  * @type {string}
  */
  get latin1() {
    Object.defineProperty(this, "latin1", {
      enumerable: true,
      writable: false,
      configurable: false,
      value: latin1Encode(this.bytes)
    });
    return this.latin1;
  }
  /**
  * UTF-8 string representation of secret key.
  * @type {string}
  */
  get utf8() {
    Object.defineProperty(this, "utf8", {
      enumerable: true,
      writable: false,
      configurable: false,
      value: utf8Encode(this.bytes)
    });
    return this.utf8;
  }
  /**
  * Base32 string representation of secret key.
  * @type {string}
  */
  get base32() {
    Object.defineProperty(this, "base32", {
      enumerable: true,
      writable: false,
      configurable: false,
      value: base32Encode(this.bytes)
    });
    return this.base32;
  }
  /**
  * Hexadecimal string representation of secret key.
  * @type {string}
  */
  get hex() {
    Object.defineProperty(this, "hex", {
      enumerable: true,
      writable: false,
      configurable: false,
      value: hexEncode(this.bytes)
    });
    return this.hex;
  }
  /**
  * Creates a secret key object.
  * @param {Object} [config] Configuration options.
  * @param {ArrayBufferLike} [config.buffer] Secret key buffer.
  * @param {number} [config.size=20] Number of random bytes to generate, ignored if 'buffer' is provided.
  */
  constructor({ buffer, size = 20 } = {}) {
    this.bytes = typeof buffer === "undefined" ? randomBytes2(size) : new Uint8Array(buffer);
    Object.defineProperty(this, "bytes", {
      enumerable: true,
      writable: false,
      configurable: false,
      value: this.bytes
    });
  }
};
var timingSafeEqual2 = (a, b) => {
  if (crypto2?.timingSafeEqual) {
    return crypto2.timingSafeEqual(globalScope.Buffer.from(a), globalScope.Buffer.from(b));
  } else {
    if (a.length !== b.length) {
      throw new TypeError("Input strings must have the same length");
    }
    let i = -1;
    let out = 0;
    while (++i < a.length) {
      out |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    return out === 0;
  }
};
var HOTP = class _HOTP {
  /**
  * Default configuration.
  * @type {{
  *   issuer: string,
  *   label: string,
  *   issuerInLabel: boolean,
  *   algorithm: string,
  *   digits: number,
  *   counter: number
  *   window: number
  * }}
  */
  static get defaults() {
    return {
      issuer: "",
      label: "OTPAuth",
      issuerInLabel: true,
      algorithm: "SHA1",
      digits: 6,
      counter: 0,
      window: 1
    };
  }
  /**
  * Generates an HOTP token.
  * @param {Object} config Configuration options.
  * @param {Secret} config.secret Secret key.
  * @param {string} [config.algorithm='SHA1'] HMAC hashing algorithm.
  * @param {number} [config.digits=6] Token length.
  * @param {number} [config.counter=0] Counter value.
  * @param {(algorithm: string, key: Uint8Array, message: Uint8Array) => Uint8Array} [config.hmac] Custom HMAC function.
  * @returns {string} Token.
  */
  static generate({ secret, algorithm = _HOTP.defaults.algorithm, digits = _HOTP.defaults.digits, counter = _HOTP.defaults.counter, hmac = hmacDigest }) {
    const message = uintDecode(counter);
    const digest2 = hmac(algorithm, secret.bytes, message);
    if (!digest2?.byteLength || digest2.byteLength < 19) {
      throw new TypeError("Return value must be at least 19 bytes");
    }
    const offset = digest2[digest2.byteLength - 1] & 15;
    const otp = ((digest2[offset] & 127) << 24 | (digest2[offset + 1] & 255) << 16 | (digest2[offset + 2] & 255) << 8 | digest2[offset + 3] & 255) % 10 ** digits;
    return otp.toString().padStart(digits, "0");
  }
  /**
  * Generates an HOTP token.
  * @param {Object} [config] Configuration options.
  * @param {number} [config.counter=this.counter++] Counter value.
  * @returns {string} Token.
  */
  generate({ counter = this.counter++ } = {}) {
    return _HOTP.generate({
      secret: this.secret,
      algorithm: this.algorithm,
      digits: this.digits,
      counter,
      hmac: this.hmac
    });
  }
  /**
  * Validates an HOTP token.
  * @param {Object} config Configuration options.
  * @param {string} config.token Token value.
  * @param {Secret} config.secret Secret key.
  * @param {string} [config.algorithm='SHA1'] HMAC hashing algorithm.
  * @param {number} [config.digits=6] Token length.
  * @param {number} [config.counter=0] Counter value.
  * @param {number} [config.window=1] Window of counter values to test.
  * @param {(algorithm: string, key: Uint8Array, message: Uint8Array) => Uint8Array} [config.hmac] Custom HMAC function.
  * @returns {number|null} Token delta or null if it is not found in the search window, in which case it should be considered invalid.
  */
  static validate({ token, secret, algorithm, digits = _HOTP.defaults.digits, counter = _HOTP.defaults.counter, window: window2 = _HOTP.defaults.window, hmac = hmacDigest }) {
    if (token.length !== digits) return null;
    let delta = null;
    const check = (i) => {
      const generatedToken = _HOTP.generate({
        secret,
        algorithm,
        digits,
        counter: i,
        hmac
      });
      if (timingSafeEqual2(token, generatedToken)) {
        delta = i - counter;
      }
    };
    check(counter);
    for (let i = 1; i <= window2 && delta === null; ++i) {
      check(counter - i);
      if (delta !== null) break;
      check(counter + i);
      if (delta !== null) break;
    }
    return delta;
  }
  /**
  * Validates an HOTP token.
  * @param {Object} config Configuration options.
  * @param {string} config.token Token value.
  * @param {number} [config.counter=this.counter] Counter value.
  * @param {number} [config.window=1] Window of counter values to test.
  * @returns {number|null} Token delta or null if it is not found in the search window, in which case it should be considered invalid.
  */
  validate({ token, counter = this.counter, window: window2 }) {
    return _HOTP.validate({
      token,
      secret: this.secret,
      algorithm: this.algorithm,
      digits: this.digits,
      counter,
      window: window2,
      hmac: this.hmac
    });
  }
  /**
  * Returns a Google Authenticator key URI.
  * @returns {string} URI.
  */
  toString() {
    const e = encodeURIComponent;
    return `otpauth://hotp/${this.issuer.length > 0 ? this.issuerInLabel ? `${e(this.issuer)}:${e(this.label)}?issuer=${e(this.issuer)}&` : `${e(this.label)}?issuer=${e(this.issuer)}&` : `${e(this.label)}?`}secret=${e(this.secret.base32)}&algorithm=${e(this.algorithm)}&digits=${e(this.digits)}&counter=${e(this.counter)}`;
  }
  /**
  * Creates an HOTP object.
  * @param {Object} [config] Configuration options.
  * @param {string} [config.issuer=''] Account provider.
  * @param {string} [config.label='OTPAuth'] Account label.
  * @param {boolean} [config.issuerInLabel=true] Include issuer prefix in label.
  * @param {Secret|string} [config.secret=Secret] Secret key.
  * @param {string} [config.algorithm='SHA1'] HMAC hashing algorithm.
  * @param {number} [config.digits=6] Token length.
  * @param {number} [config.counter=0] Initial counter value.
  * @param {(algorithm: string, key: Uint8Array, message: Uint8Array) => Uint8Array} [config.hmac] Custom HMAC function.
  */
  constructor({ issuer = _HOTP.defaults.issuer, label = _HOTP.defaults.label, issuerInLabel = _HOTP.defaults.issuerInLabel, secret = new Secret(), algorithm = _HOTP.defaults.algorithm, digits = _HOTP.defaults.digits, counter = _HOTP.defaults.counter, hmac } = {}) {
    this.issuer = issuer;
    this.label = label;
    this.issuerInLabel = issuerInLabel;
    this.secret = typeof secret === "string" ? Secret.fromBase32(secret) : secret;
    this.algorithm = hmac ? algorithm : canonicalizeAlgorithm(algorithm);
    this.digits = digits;
    this.counter = counter;
    this.hmac = hmac;
  }
};
var TOTP = class _TOTP {
  /**
  * Default configuration.
  * @type {{
  *   issuer: string,
  *   label: string,
  *   issuerInLabel: boolean,
  *   algorithm: string,
  *   digits: number,
  *   period: number
  *   window: number
  * }}
  */
  static get defaults() {
    return {
      issuer: "",
      label: "OTPAuth",
      issuerInLabel: true,
      algorithm: "SHA1",
      digits: 6,
      period: 30,
      window: 1
    };
  }
  /**
  * Calculates the counter. i.e. the number of periods since timestamp 0.
  * @param {Object} [config] Configuration options.
  * @param {number} [config.period=30] Token time-step duration.
  * @param {number} [config.timestamp=Date.now] Timestamp value in milliseconds.
  * @returns {number} Counter.
  */
  static counter({ period = _TOTP.defaults.period, timestamp = Date.now() } = {}) {
    return Math.floor(timestamp / 1e3 / period);
  }
  /**
  * Calculates the counter. i.e. the number of periods since timestamp 0.
  * @param {Object} [config] Configuration options.
  * @param {number} [config.timestamp=Date.now] Timestamp value in milliseconds.
  * @returns {number} Counter.
  */
  counter({ timestamp = Date.now() } = {}) {
    return _TOTP.counter({
      period: this.period,
      timestamp
    });
  }
  /**
  * Calculates the remaining time in milliseconds until the next token is generated.
  * @param {Object} [config] Configuration options.
  * @param {number} [config.period=30] Token time-step duration.
  * @param {number} [config.timestamp=Date.now] Timestamp value in milliseconds.
  * @returns {number} counter.
  */
  static remaining({ period = _TOTP.defaults.period, timestamp = Date.now() } = {}) {
    return period * 1e3 - timestamp % (period * 1e3);
  }
  /**
  * Calculates the remaining time in milliseconds until the next token is generated.
  * @param {Object} [config] Configuration options.
  * @param {number} [config.timestamp=Date.now] Timestamp value in milliseconds.
  * @returns {number} counter.
  */
  remaining({ timestamp = Date.now() } = {}) {
    return _TOTP.remaining({
      period: this.period,
      timestamp
    });
  }
  /**
  * Generates a TOTP token.
  * @param {Object} config Configuration options.
  * @param {Secret} config.secret Secret key.
  * @param {string} [config.algorithm='SHA1'] HMAC hashing algorithm.
  * @param {number} [config.digits=6] Token length.
  * @param {number} [config.period=30] Token time-step duration.
  * @param {number} [config.timestamp=Date.now] Timestamp value in milliseconds.
  * @param {(algorithm: string, key: Uint8Array, message: Uint8Array) => Uint8Array} [config.hmac] Custom HMAC function.
  * @returns {string} Token.
  */
  static generate({ secret, algorithm, digits, period = _TOTP.defaults.period, timestamp = Date.now(), hmac }) {
    return HOTP.generate({
      secret,
      algorithm,
      digits,
      counter: _TOTP.counter({
        period,
        timestamp
      }),
      hmac
    });
  }
  /**
  * Generates a TOTP token.
  * @param {Object} [config] Configuration options.
  * @param {number} [config.timestamp=Date.now] Timestamp value in milliseconds.
  * @returns {string} Token.
  */
  generate({ timestamp = Date.now() } = {}) {
    return _TOTP.generate({
      secret: this.secret,
      algorithm: this.algorithm,
      digits: this.digits,
      period: this.period,
      timestamp,
      hmac: this.hmac
    });
  }
  /**
  * Validates a TOTP token.
  * @param {Object} config Configuration options.
  * @param {string} config.token Token value.
  * @param {Secret} config.secret Secret key.
  * @param {string} [config.algorithm='SHA1'] HMAC hashing algorithm.
  * @param {number} [config.digits=6] Token length.
  * @param {number} [config.period=30] Token time-step duration.
  * @param {number} [config.timestamp=Date.now] Timestamp value in milliseconds.
  * @param {number} [config.window=1] Window of counter values to test.
  * @param {(algorithm: string, key: Uint8Array, message: Uint8Array) => Uint8Array} [config.hmac] Custom HMAC function.
  * @returns {number|null} Token delta or null if it is not found in the search window, in which case it should be considered invalid.
  */
  static validate({ token, secret, algorithm, digits, period = _TOTP.defaults.period, timestamp = Date.now(), window: window2, hmac }) {
    return HOTP.validate({
      token,
      secret,
      algorithm,
      digits,
      counter: _TOTP.counter({
        period,
        timestamp
      }),
      window: window2,
      hmac
    });
  }
  /**
  * Validates a TOTP token.
  * @param {Object} config Configuration options.
  * @param {string} config.token Token value.
  * @param {number} [config.timestamp=Date.now] Timestamp value in milliseconds.
  * @param {number} [config.window=1] Window of counter values to test.
  * @returns {number|null} Token delta or null if it is not found in the search window, in which case it should be considered invalid.
  */
  validate({ token, timestamp, window: window2 }) {
    return _TOTP.validate({
      token,
      secret: this.secret,
      algorithm: this.algorithm,
      digits: this.digits,
      period: this.period,
      timestamp,
      window: window2,
      hmac: this.hmac
    });
  }
  /**
  * Returns a Google Authenticator key URI.
  * @returns {string} URI.
  */
  toString() {
    const e = encodeURIComponent;
    return `otpauth://totp/${this.issuer.length > 0 ? this.issuerInLabel ? `${e(this.issuer)}:${e(this.label)}?issuer=${e(this.issuer)}&` : `${e(this.label)}?issuer=${e(this.issuer)}&` : `${e(this.label)}?`}secret=${e(this.secret.base32)}&algorithm=${e(this.algorithm)}&digits=${e(this.digits)}&period=${e(this.period)}`;
  }
  /**
  * Creates a TOTP object.
  * @param {Object} [config] Configuration options.
  * @param {string} [config.issuer=''] Account provider.
  * @param {string} [config.label='OTPAuth'] Account label.
  * @param {boolean} [config.issuerInLabel=true] Include issuer prefix in label.
  * @param {Secret|string} [config.secret=Secret] Secret key.
  * @param {string} [config.algorithm='SHA1'] HMAC hashing algorithm.
  * @param {number} [config.digits=6] Token length.
  * @param {number} [config.period=30] Token time-step duration.
  * @param {(algorithm: string, key: Uint8Array, message: Uint8Array) => Uint8Array} [config.hmac] Custom HMAC function.
  */
  constructor({ issuer = _TOTP.defaults.issuer, label = _TOTP.defaults.label, issuerInLabel = _TOTP.defaults.issuerInLabel, secret = new Secret(), algorithm = _TOTP.defaults.algorithm, digits = _TOTP.defaults.digits, period = _TOTP.defaults.period, hmac } = {}) {
    this.issuer = issuer;
    this.label = label;
    this.issuerInLabel = issuerInLabel;
    this.secret = typeof secret === "string" ? Secret.fromBase32(secret) : secret;
    this.algorithm = hmac ? algorithm : canonicalizeAlgorithm(algorithm);
    this.digits = digits;
    this.period = period;
    this.hmac = hmac;
  }
};

// club-lupita/src/worker/sesion.ts
import { timingSafeEqual as timingSafeEqual3 } from "node:crypto";
var cod = new TextEncoder();
var b64url = (b) => {
  const bytes = b instanceof Uint8Array ? b : new Uint8Array(b);
  let s = "";
  for (const x of bytes) s += String.fromCharCode(x);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};
var deB64url = (s) => atob(s.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(s.length / 4) * 4, "="));
async function clave(secreto) {
  return crypto.subtle.importKey("raw", cod.encode(secreto), { name: "HMAC", hash: "SHA-256" }, false, [
    "sign",
    "verify"
  ]);
}
async function huella(secreto, valor) {
  const firma = await crypto.subtle.sign("HMAC", await clave(secreto), cod.encode(valor));
  return b64url(firma);
}
function igualEnTiempoConstante(a, b) {
  const aa = cod.encode(a), bb = cod.encode(b);
  return aa.byteLength === bb.byteLength && timingSafeEqual3(aa, bb);
}
async function firmar(secreto, s) {
  const cuerpo = b64url(cod.encode(JSON.stringify(s)));
  const firma = await crypto.subtle.sign("HMAC", await clave(secreto), cod.encode(cuerpo));
  return `${cuerpo}.${b64url(firma)}`;
}
async function verificar(secreto, token) {
  if (!token) return null;
  if (token.length > 4096) return null;
  const partes = token.split("."), [cuerpo, firma] = partes;
  if (partes.length !== 2 || !cuerpo || !firma || !/^[A-Za-z0-9_-]+$/.test(cuerpo) || !/^[A-Za-z0-9_-]{43}$/.test(firma)) return null;
  try {
    const firmaBytes = Uint8Array.from(deB64url(firma), (c) => c.charCodeAt(0));
    if (!await crypto.subtle.verify("HMAC", await clave(secreto), firmaBytes, cod.encode(cuerpo))) return null;
    const s = JSON.parse(deB64url(cuerpo));
    if (typeof s.tel !== "string" || typeof s.exp !== "number" || !Number.isFinite(s.exp) || !["socio", "casa"].includes(s.rol)) return null;
    return s.exp > Date.now() ? s : null;
  } catch {
    return null;
  }
}
function codigoDeSeis() {
  const b = new Uint32Array(1);
  crypto.getRandomValues(b);
  return String(b[0] % 1e6).padStart(6, "0");
}

// club-lupita/src/worker/credenciales.ts
async function propietario(db2) {
  const sql = neon(db2);
  const [fila] = await sql`SELECT clave_huella,version_clave,clave_cambiada FROM seguridad_propietario WHERE id=true`;
  if (!fila) throw new Error("Credencial del propietario sin inicializar");
  return fila;
}
async function guardarClave(sql, secreto, clave2, tipo) {
  const material = await huella(secreto, tipo + ":" + clave2);
  const [fila] = await sql`SELECT crypt(${material},gen_salt('bf',12)) AS hash`;
  return String(fila.hash);
}
async function comprobarClave(sql, secreto, clave2, hash, tipo) {
  const material = await huella(secreto, tipo + ":" + clave2);
  if (!hash.startsWith("$2")) return tipo === "empleado" && igualEnTiempoConstante(material, hash);
  const [fila] = await sql`SELECT crypt(${material},${hash}) AS hash`;
  return igualEnTiempoConstante(String(fila.hash), hash);
}
async function comprobarPropietario(db2, secretoSesion, inicial, clave2, fila) {
  if (!clave2 || clave2.length > 256) return false;
  if (fila.clave_huella) return comprobarClave(neon(db2), secretoSesion, clave2, fila.clave_huella, "propietario");
  return !!inicial && igualEnTiempoConstante(clave2, inicial);
}
function validarNuevaClave(r) {
  if (!r || typeof r !== "object" || Array.isArray(r)) return "Revis\xE1 los datos del cambio de clave.";
  if (typeof r.actual !== "string" || !r.actual || r.actual.length > 256) return "Ingres\xE1 tu clave actual.";
  if (typeof r.nueva !== "string" || [...r.nueva].length < 15 || [...r.nueva].length > 128 || !r.nueva.trim()) return "La nueva clave debe tener entre 15 y 128 caracteres.";
  const normal = r.nueva.normalize("NFKC").toLowerCase().replace(/[\s._!-]/g, "");
  const frecuentes = ["password", "contrase\xF1a", "contrasena", "123456789", "qwerty", "labellalupita", "bellalupita", "administrador"];
  if (new Set(normal).size < 5 || /^(\w{1,6})\1+$/.test(normal) || frecuentes.some((x) => normal === x || new RegExp("^" + x + "[0-9]*$").test(normal))) return "Esta contrase\xF1a es demasiado previsible. Eleg\xED una frase personal que no uses en otros sitios.";
  if (r.nueva !== r.confirmacion) return "La confirmaci\xF3n no coincide con la nueva clave.";
  if (r.actual === r.nueva) return "Eleg\xED una clave diferente a la actual.";
  return null;
}

// club-lupita/src/worker/validacion.ts
function fechaCalendario(valor) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(valor) || valor < "0001-01-01") return false;
  const fecha = /* @__PURE__ */ new Date(valor + "T00:00:00Z");
  return Number.isFinite(fecha.getTime()) && fecha.toISOString().slice(0, 10) === valor;
}
function idBigintPositivo(valor) {
  return /^[1-9]\d{0,18}$/.test(valor) && (valor.length < 19 || valor <= "9223372036854775807");
}
function nombrePersonalValido(valor) {
  if (typeof valor !== "string" || /[\p{Cc}\p{Cs}\u2028\u2029\u202a-\u202e\u2066-\u2069]/u.test(valor)) return false;
  const longitud = [...valor.trim()].length;
  return longitud >= 2 && longitud <= 80;
}

// club-lupita/src/worker/pedido-publico.ts
function pedidoParaCocina(p) {
  return {
    id: p.id,
    numero: p.numero,
    estado: p.estado,
    nombre: p.nombre,
    creado: p.creado,
    ...p.actualizado !== void 0 ? { actualizado: p.actualizado } : {},
    lineas: Array.isArray(p.lineas) ? p.lineas.map((linea) => ({
      ...typeof linea.id === "string" ? { id: linea.id } : {},
      nombre: linea.nombre,
      cuanto: linea.cuanto
    })) : []
  };
}

// club-lupita/src/worker/operacion.ts
async function transaccion(env, trabajo) {
  neonConfig.webSocketConstructor = globalThis.WebSocket;
  const cli = new Client(env.DATABASE_URL);
  await cli.connect();
  try {
    await cli.query("BEGIN");
    await cli.query("SET LOCAL statement_timeout='8s'");
    const r = await trabajo(cli);
    await cli.query("COMMIT");
    return r;
  } catch (e) {
    await cli.query("ROLLBACK").catch(() => {
    });
    throw e;
  } finally {
    await cli.end();
  }
}
var uuid = (s) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(s);
function registrarOperacion(app2) {
  app2.post("/api/operacion/beneficios/consultar", async (c) => {
    if (c.get("sesion").rol !== "casa" || c.get("permiso") === "cocina") return c.json({ error: "La entrega la confirma caja." }, 403);
    const r = await c.req.json().catch(() => null);
    if (!r || typeof r.codigo !== "string" || !/^[A-F0-9]{12}$/.test(r.codigo)) return c.json({ error: "C\xF3digo inv\xE1lido." }, 422);
    const sql = neon(c.env.DATABASE_URL);
    const [beneficio] = await sql`SELECT s.nombre,b.clase,b.vence,b.entregado,
      (b.entregado IS NULL AND b.vence>now() AND m.hasta>now() AND m.estado IN ('activa','en_gracia')
      AND b.ventana=CASE WHEN b.clase='bebida_dia' THEN (now() AT TIME ZONE 'America/Managua')::date ELSE date_trunc('month',now() AT TIME ZONE 'America/Managua')::date END
      AND NOT EXISTS(SELECT 1 FROM operativo_beneficio_uso u WHERE u.membresia_id=b.membresia_id AND u.clase=b.clase AND u.ventana=b.ventana)) AS vigente
      FROM operativo_beneficio_solicitud b JOIN operativo_socio s ON s.id=b.socio_id JOIN operativo_membresia m ON m.id=b.membresia_id WHERE codigo=${r.codigo}`;
    if (!beneficio) return c.json({ error: "C\xF3digo no encontrado." }, 404);
    return c.json(beneficio);
  });
  app2.get("/api/compras", async (c) => {
    if (c.get("sesion").rol !== "socio") return c.json({ error: "Entr\xE1 con tu cuenta." }, 403);
    const sql = neon(c.env.DATABASE_URL), tel = c.get("sesion").tel;
    const pagina = Number(c.req.query("pagina") ?? 0);
    if (!Number.isInteger(pagina) || pagina < 0 || pagina > 1e4) return c.json({ error: "P\xE1gina inv\xE1lida." }, 422);
    const filas = await sql`WITH miembro AS (SELECT id FROM operativo_socio WHERE telefono=${tel} AND baja IS NULL), compras AS (
      SELECT 'pedido:'||p.id AS id,'pedido' AS tipo,p.creado, jsonb_build_object('numero',p.numero,'estado',p.estado,'total',p.total,'lineas',p.lineas,'motivo',p.motivo,'actualizado',p.actualizado) AS detalle FROM operativo_pedido p JOIN miembro m ON m.id=p.socio_id
      UNION ALL SELECT 'reserva:'||r.id,'reserva',r.creada,jsonb_build_object('zona',r.zona,'cuando',r.cuando,'personas',r.personas,'fin',r.termina,'deposito',r.deposito,'cancelada',r.cancelada) FROM operativo_reserva r JOIN miembro m ON m.id=r.socio_id
      UNION ALL SELECT 'bolsa:'||r.id,'bolsa',r.creada,jsonb_build_object('numero',r.numero,'generacion',r.generacion,'total',r.total,'entregada',r.entregada) FROM operativo_compra_bolsa r JOIN miembro m ON m.id=r.socio_id
      UNION ALL SELECT 'experiencia:'||a.id,'experiencia',a.comprado,jsonb_build_object('nombre',e.nombre,'cuando',e.cuando,'butaca',a.butaca,'total',a.pagado,'asistencia',a.asistencia,'cedida',a.cedido_a IS NOT NULL) FROM operativo_asiento_experiencia a JOIN experiencia e ON e.id=a.experiencia_id JOIN miembro m ON m.id=a.socio_id
    ) SELECT * FROM compras ORDER BY creado DESC,id DESC LIMIT 21 OFFSET ${pagina * 20}`;
    return c.json({ compras: filas.slice(0, 20), hayMas: filas.length > 20 });
  });
  app2.get("/api/avisos", async (c) => {
    if (c.get("sesion").rol !== "socio") return c.json({ error: "Entr\xE1 con tu cuenta." }, 403);
    const sql = neon(c.env.DATABASE_URL);
    return c.json({ avisos: await sql`SELECT a.id,a.texto,a.creado,a.leido FROM operativo_aviso_cliente a JOIN operativo_socio s ON s.id=a.socio_id WHERE s.telefono=${c.get("sesion").tel} ORDER BY a.id DESC LIMIT 50` });
  });
  app2.post("/api/avisos/:id/leido", async (c) => {
    if (c.get("sesion").rol !== "socio" || !idBigintPositivo(c.req.param("id"))) return c.json({ error: "Aviso no encontrado." }, 404);
    const sql = neon(c.env.DATABASE_URL);
    await sql`UPDATE operativo_aviso_cliente SET leido=COALESCE(leido,now()) WHERE id=${c.req.param("id")}::bigint AND socio_id=(SELECT id FROM operativo_socio WHERE telefono=${c.get("sesion").tel})`;
    return c.json({ leido: true });
  });
  app2.get("/api/operacion/pedidos", async (c) => {
    if (c.get("sesion").rol !== "casa") return c.json({ error: "Acceso exclusivo del personal." }, 403);
    const sql = neon(c.env.DATABASE_URL);
    const pedidos = await sql`SELECT p.id,p.numero,p.estado,p.total,p.lineas,p.creado,p.motivo,s.nombre FROM operativo_pedido p JOIN operativo_socio s ON s.id=p.socio_id WHERE p.estado NOT IN ('entregado','cancelado') ORDER BY p.creado LIMIT 100`;
    return c.json({ pedidos: c.get("permiso") === "cocina" ? pedidos.map(pedidoParaCocina) : pedidos });
  });
  app2.post("/api/operacion/pedidos/:id/estado", async (c) => {
    if (c.get("sesion").rol !== "casa") return c.json({ error: "Acceso exclusivo del personal." }, 403);
    const id = c.req.param("id"), r = await c.req.json().catch(() => null);
    if (!uuid(id) || !r || !["aceptado", "preparando", "listo", "entregado", "cancelado"].includes(r.estado)) return c.json({ error: "Estado inv\xE1lido." }, 422);
    const permiso = c.get("permiso") ?? "encargado";
    if (permiso === "cocina" && !["preparando", "listo"].includes(r.estado)) return c.json({ error: "La cocina solo actualiza la preparaci\xF3n." }, 403);
    if (r.estado === "cancelado" && (typeof r.motivo !== "string" || r.motivo.trim().length < 3 || r.motivo.length > 240)) return c.json({ error: "Escrib\xED el motivo de cancelaci\xF3n." }, 422);
    return transaccion(c.env, async (cli) => {
      const { rows: dueno } = await cli.query("SELECT socio_id FROM operativo_pedido WHERE id=$1", [id]);
      if (!dueno.length) return c.json({ error: "Pedido no encontrado." }, 404);
      await cli.query("SELECT id FROM operativo_socio WHERE id=$1 FOR UPDATE", [dueno[0].socio_id]);
      const { rows: [p] } = await cli.query("SELECT * FROM operativo_pedido WHERE id=$1 FOR UPDATE", [id]);
      if (p.estado === r.estado) return c.json({ estado: p.estado, repetido: true });
      const pasos = { recibido: ["aceptado", "cancelado"], aceptado: ["preparando", "cancelado"], preparando: ["listo"], listo: ["entregado"], entregado: [], cancelado: [] };
      if (!pasos[p.estado]?.includes(r.estado)) return c.json({ error: "El pedido cambi\xF3 o ese paso no corresponde. Actualiz\xE1 la bandeja." }, 409);
      const quien = c.get("sesion").empleado ?? "propietario", motivo = r.estado === "cancelado" ? r.motivo.trim() : null;
      if (r.estado === "cancelado") {
        const devolucion = await cli.query("INSERT INTO asiento(socio_id,monto,tipo,concepto,ref_externa,quien,nota,devolucion_de) SELECT $1,$2,'ajuste',$3,$4,$5,$6,id FROM operativo_asiento WHERE socio_id=$1 AND ref_externa=$7 AND monto=-$2::integer RETURNING id", [p.socio_id, p.total, "Devoluci\xF3n \xB7 pedido " + p.numero, "devolucion-pedido:" + p.id, quien, motivo, "pedido:" + p.referencia]);
        if (devolucion.rows.length !== 1) throw Error("No se pudo verificar el cobro original para devolverlo.");
        await cli.query("INSERT INTO punto(socio_id,puntos,motivo,origen_id,concepto) SELECT $1,-p.puntos,'ajuste',$2,$3 FROM operativo_punto p JOIN operativo_asiento a ON p.origen_id=a.id::text WHERE a.socio_id=$1 AND a.ref_externa=$4 AND p.motivo='consumo' ON CONFLICT DO NOTHING", [p.socio_id, "devolucion-pedido:" + p.id, "Devoluci\xF3n \xB7 pedido " + p.numero, "pedido:" + p.referencia]);
      }
      await cli.query("UPDATE operativo_pedido SET estado=$2,motivo=$3,actualizado=now() WHERE id=$1", [id, r.estado, motivo]);
      await cli.query("INSERT INTO pedido_evento(pedido_id,estado,quien,motivo) VALUES($1,$2,$3,$4)", [id, r.estado, quien, motivo]);
      await cli.query("INSERT INTO auditoria(quien,accion,socio_id,detalle) VALUES($1,$2,$3,$4::jsonb)", [quien, "pedido_estado", p.socio_id, JSON.stringify({ pedido: id, estado: r.estado, motivo })]);
      await cli.query("INSERT INTO aviso_cliente(socio_id,referencia,texto) VALUES($1,$2,$3) ON CONFLICT DO NOTHING", [p.socio_id, "pedido:" + id + ":" + r.estado, "Pedido #" + p.numero + ": " + r.estado + (motivo ? " \xB7 " + motivo : "")]);
      return c.json({ estado: r.estado });
    });
  });
  app2.post("/api/beneficios/solicitar", async (c) => {
    if (c.get("sesion").rol !== "socio") return c.json({ error: "Entr\xE1 con tu cuenta." }, 403);
    const r = await c.req.json().catch(() => null);
    if (!r || !["bebida_dia", "bolsa_mes"].includes(r.clase)) return c.json({ error: "Beneficio inv\xE1lido." }, 422);
    return transaccion(c.env, async (cli) => {
      const { rows: [s] } = await cli.query("SELECT id FROM operativo_socio WHERE telefono=$1 AND baja IS NULL FOR UPDATE", [c.get("sesion").tel]);
      if (!s) return c.json({ error: "Cuenta no encontrada." }, 404);
      const { rows: [m] } = await cli.query("SELECT id FROM operativo_membresia WHERE socio_id=$1 AND estado IN ('activa','en_gracia') AND hasta>now() FOR UPDATE", [s.id]);
      if (!m) return c.json({ error: "No ten\xE9s una membres\xEDa vigente." }, 403);
      const { rows: [v] } = await cli.query("SELECT CASE WHEN $1='bebida_dia' THEN (now() AT TIME ZONE 'America/Managua')::date ELSE date_trunc('month',now() AT TIME ZONE 'America/Managua')::date END AS ventana", [r.clase]);
      const { rows: usos } = await cli.query("SELECT id FROM operativo_beneficio_uso WHERE membresia_id=$1 AND clase=$2 AND ventana=$3", [m.id, r.clase, v.ventana]);
      if (usos.length) return c.json({ error: "Este beneficio ya fue entregado en el per\xEDodo actual." }, 409);
      const codigo = crypto.randomUUID().replaceAll("-", "").slice(0, 12).toUpperCase();
      const { rows: [solicitud] } = await cli.query(`INSERT INTO beneficio_solicitud(socio_id,membresia_id,clase,ventana,codigo) VALUES($1,$2,$3,$4,$5)
        ON CONFLICT(membresia_id,clase,ventana) DO UPDATE SET codigo=CASE WHEN beneficio_solicitud.vence<=now() THEN EXCLUDED.codigo ELSE beneficio_solicitud.codigo END,vence=CASE WHEN beneficio_solicitud.vence<=now() THEN EXCLUDED.vence ELSE beneficio_solicitud.vence END RETURNING codigo,vence`, [s.id, m.id, r.clase, v.ventana, codigo]);
      return c.json(solicitud);
    });
  });
  app2.post("/api/operacion/beneficios/entregar", async (c) => {
    if (c.get("sesion").rol !== "casa" || c.get("permiso") === "cocina") return c.json({ error: "La entrega la confirma caja." }, 403);
    const r = await c.req.json().catch(() => null);
    if (!r || typeof r.codigo !== "string" || !/^[A-F0-9]{12}$/.test(r.codigo)) return c.json({ error: "C\xF3digo inv\xE1lido." }, 422);
    return transaccion(c.env, async (cli) => {
      await cli.query("SELECT id FROM operativo_socio WHERE id=(SELECT socio_id FROM operativo_beneficio_solicitud WHERE codigo=$1) FOR UPDATE", [r.codigo]);
      const { rows: [b] } = await cli.query("SELECT * FROM operativo_beneficio_solicitud WHERE codigo=$1 FOR UPDATE", [r.codigo]);
      if (!b) return c.json({ error: "C\xF3digo no encontrado." }, 404);
      if (b.entregado) return c.json({ error: "Este beneficio ya fue entregado." }, 409);
      const { rows: [vigencia] } = await cli.query("SELECT id FROM operativo_membresia WHERE id=$1 AND hasta>now() AND estado IN ('activa','en_gracia') AND $2::timestamptz>now() AND $3::date=CASE WHEN $4='bebida_dia' THEN (now() AT TIME ZONE 'America/Managua')::date ELSE date_trunc('month',now() AT TIME ZONE 'America/Managua')::date END FOR UPDATE", [b.membresia_id, b.vence, b.ventana, b.clase]);
      if (!vigencia) return c.json({ error: "El c\xF3digo o la membres\xEDa venci\xF3. Ped\xED al cliente que actualice su beneficio." }, 409);
      const { rows: uso } = await cli.query("INSERT INTO beneficio_uso(membresia_id,clase) VALUES($1,$2) ON CONFLICT DO NOTHING RETURNING id", [b.membresia_id, b.clase]);
      if (!uso.length) return c.json({ error: "El beneficio ya se utiliz\xF3." }, 409);
      const quien = c.get("sesion").empleado ?? "propietario";
      await cli.query("UPDATE operativo_beneficio_solicitud SET entregado=now(),entregado_por=$2 WHERE id=$1", [b.id, quien]);
      await cli.query("INSERT INTO auditoria(quien,accion,socio_id,detalle) VALUES($1,'entrega_beneficio',$2,$3::jsonb)", [quien, b.socio_id, JSON.stringify({ solicitud: b.id, clase: b.clase })]);
      return c.json({ entregado: true, clase: b.clase });
    });
  });
}

// club-lupita/node_modules/hono/dist/utils/cookie.js
var validCookieNameRegEx = /^[\w!#$%&'*.^`|~+-]+$/;
var relaxedCookieNameRegEx = /^[!#-:<>-[\]-~]+$/;
var validCookieValueRegEx = /^[ !#-:<-[\]-~]*$/;
var trimCookieWhitespace = (value) => {
  let start = 0;
  let end = value.length;
  while (start < end) {
    const charCode = value.charCodeAt(start);
    if (charCode !== 32 && charCode !== 9) {
      break;
    }
    start++;
  }
  while (end > start) {
    const charCode = value.charCodeAt(end - 1);
    if (charCode !== 32 && charCode !== 9) {
      break;
    }
    end--;
  }
  return start === 0 && end === value.length ? value : value.slice(start, end);
};
var parse = (cookie, name) => {
  if (name && cookie.indexOf(name) === -1) {
    return {};
  }
  const pairs = cookie.split(";");
  const parsedCookie = /* @__PURE__ */ Object.create(null);
  for (const pairStr of pairs) {
    const valueStartPos = pairStr.indexOf("=");
    if (valueStartPos === -1) {
      continue;
    }
    const cookieName = trimCookieWhitespace(pairStr.substring(0, valueStartPos));
    if (name && name !== cookieName || !relaxedCookieNameRegEx.test(cookieName) || cookieName in parsedCookie) {
      continue;
    }
    let cookieValue = trimCookieWhitespace(pairStr.substring(valueStartPos + 1));
    if (cookieValue.startsWith('"') && cookieValue.endsWith('"')) {
      cookieValue = cookieValue.slice(1, -1);
    }
    if (validCookieValueRegEx.test(cookieValue)) {
      parsedCookie[cookieName] = tryDecodeURIComponent(cookieValue);
      if (name) {
        break;
      }
    }
  }
  return parsedCookie;
};
var _serialize = (name, value, opt = {}) => {
  if (!validCookieNameRegEx.test(name)) {
    throw new Error("Invalid cookie name");
  }
  let cookie = `${name}=${value}`;
  if (name.startsWith("__Secure-") && !opt.secure) {
    throw new Error("__Secure- Cookie must have Secure attributes");
  }
  if (name.startsWith("__Host-")) {
    if (!opt.secure) {
      throw new Error("__Host- Cookie must have Secure attributes");
    }
    if (opt.path !== "/") {
      throw new Error('__Host- Cookie must have Path attributes with "/"');
    }
    if (opt.domain) {
      throw new Error("__Host- Cookie must not have Domain attributes");
    }
  }
  for (const key of ["domain", "path", "sameSite", "priority"]) {
    if (opt[key] && /[;\r\n]/.test(opt[key])) {
      throw new Error(`${key} must not contain ";", "\\r", or "\\n"`);
    }
  }
  if (opt && typeof opt.maxAge === "number" && opt.maxAge >= 0) {
    if (opt.maxAge > 3456e4) {
      throw new Error(
        "Cookies Max-Age SHOULD NOT be greater than 400 days (34560000 seconds) in duration."
      );
    }
    cookie += `; Max-Age=${opt.maxAge | 0}`;
  }
  if (opt.domain && opt.prefix !== "host") {
    cookie += `; Domain=${opt.domain}`;
  }
  if (opt.path) {
    cookie += `; Path=${opt.path}`;
  }
  if (opt.expires) {
    if (opt.expires.getTime() - Date.now() > 3456e7) {
      throw new Error(
        "Cookies Expires SHOULD NOT be greater than 400 days (34560000 seconds) in the future."
      );
    }
    cookie += `; Expires=${opt.expires.toUTCString()}`;
  }
  if (opt.httpOnly) {
    cookie += "; HttpOnly";
  }
  if (opt.secure) {
    cookie += "; Secure";
  }
  if (opt.sameSite) {
    cookie += `; SameSite=${opt.sameSite.charAt(0).toUpperCase() + opt.sameSite.slice(1)}`;
  }
  if (opt.priority) {
    cookie += `; Priority=${opt.priority.charAt(0).toUpperCase() + opt.priority.slice(1)}`;
  }
  if (opt.partitioned) {
    if (!opt.secure) {
      throw new Error("Partitioned Cookie must have Secure attributes");
    }
    cookie += "; Partitioned";
  }
  return cookie;
};
var serialize = (name, value, opt) => {
  value = encodeURIComponent(value);
  return _serialize(name, value, opt);
};

// club-lupita/node_modules/hono/dist/helper/cookie/index.js
var getCookie = (c, key, prefix) => {
  const cookie = c.req.raw.headers.get("Cookie");
  if (typeof key === "string") {
    if (!cookie) {
      return void 0;
    }
    let finalKey = key;
    if (prefix === "secure") {
      finalKey = "__Secure-" + key;
    } else if (prefix === "host") {
      finalKey = "__Host-" + key;
    }
    const obj2 = parse(cookie, finalKey);
    return obj2[finalKey];
  }
  if (!cookie) {
    return {};
  }
  const obj = parse(cookie);
  return obj;
};
var generateCookie = (name, value, opt) => {
  let cookie;
  if (opt?.prefix === "secure") {
    cookie = serialize("__Secure-" + name, value, { path: "/", ...opt, secure: true });
  } else if (opt?.prefix === "host") {
    cookie = serialize("__Host-" + name, value, {
      ...opt,
      path: "/",
      secure: true,
      domain: void 0
    });
  } else {
    cookie = serialize(name, value, { path: "/", ...opt });
  }
  return cookie;
};
var setCookie = (c, name, value, opt) => {
  const cookie = generateCookie(name, value, opt);
  c.header("Set-Cookie", cookie, { append: true });
};
var deleteCookie = (c, name, opt) => {
  const deletedCookie = getCookie(c, name, opt?.prefix);
  setCookie(c, name, "", { ...opt, maxAge: 0 });
  return deletedCookie;
};

// club-lupita/src/worker/equipo-sesion.ts
var COOKIE = "__Host-lupita-equipo";
var CSRF = "__Host-lupita-equipo-csrf";
var uuid2 = (x) => typeof x === "string" && /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/.test(x);
var privilegio = (p) => p === "propietario" || p === "encargado";
var esPropietario = (c) => c.get("sesion")?.rol === "casa" && c.get("permiso") === "propietario";
var aleatorio = () => Array.from(crypto.getRandomValues(new Uint8Array(32)), (b) => b.toString(16).padStart(2, "0")).join("");
async function digest(value) {
  return Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value))), (b) => b.toString(16).padStart(2, "0")).join("");
}
function secretoCredencial(env) {
  if (!env.PERSONAL_CREDENCIAL_SECRETO) throw Error("credenciales-no-configuradas");
  return env.PERSONAL_CREDENCIAL_SECRETO;
}
function cookiesEquipo(c, token, csrf) {
  const options = { httpOnly: true, secure: true, sameSite: "Strict", path: "/", maxAge: 12 * 3600 };
  setCookie(c, COOKIE, token, options);
  setCookie(c, CSRF, csrf, { ...options, httpOnly: false });
}
function borrarCookies(c) {
  deleteCookie(c, COOKIE, { path: "/", secure: true });
  deleteCookie(c, CSRF, { path: "/", secure: true });
}
function tokenEquipo(c) {
  return c.req.header("x-equipo-solicitud") === "1" ? getCookie(c, COOKIE) : void 0;
}
function origenEquipo(c) {
  if (c.req.header("x-equipo-solicitud") !== "1") return false;
  const origin = c.req.header("origin");
  return !origin ? c.req.method === "GET" : origin === new URL(c.req.url).origin;
}
async function auditar(c, accion, persona, detalle = {}) {
  const sql = neon(c.env.DATABASE_URL);
  const ip = await digest(c.req.header("cf-connecting-ip") ?? "local");
  await sql`INSERT INTO auditoria(quien,accion,detalle) VALUES(${persona ?? "acceso-equipo"},${accion},${JSON.stringify({ ...detalle, ip })}::jsonb)`;
}
async function limites(c, identificador) {
  const sql = neon(c.env.DATABASE_URL), ip = await digest(c.req.header("cf-connecting-ip") ?? "local");
  const clave2 = await digest("cuenta:" + identificador);
  const [trafico] = await sql`SELECT limitar_acceso(${"equipo-trafico:" + ip},300,300) AS ok`;
  if (!trafico.ok) return { ok: false, clave: clave2, segundos: 60 };
  const [f] = await sql`SELECT GREATEST(0,ceil(extract(epoch FROM espera-now())))::int AS segundos FROM fallo_personal WHERE clave=${clave2}`;
  return { ok: !f?.segundos, clave: clave2, segundos: Number(f?.segundos ?? 0) };
}
async function fallo(c, clave2, persona, motivo = "credencial") {
  const sql = neon(c.env.DATABASE_URL);
  await sql`SELECT fallo_acceso_personal(${clave2})`;
  await auditar(c, "acceso_rechazado", persona, { motivo });
}
async function acierto(c, clave2) {
  const sql = neon(c.env.DATABASE_URL);
  await sql`DELETE FROM fallo_personal WHERE clave=${clave2}`;
}
async function emitirSesion(c, e, options = {}) {
  const compartido = options.compartido !== false, token = (c.get("equipoDemo") ? "d." : "r.") + aleatorio(), csrf = aleatorio(), hash = await digest(token);
  const fase = options.fase ?? (e.requiere_cambio ? "clave" : e.mfa_secreto && !options.fuerte ? "mfa" : privilegio(e.permiso) && !e.mfa_secreto ? "configurar" : "completa");
  const dispositivo = (options.dispositivo?.trim() || (compartido ? "Equipo compartido" : "Dispositivo personal")).slice(0, 80);
  const sql = neon(c.env.DATABASE_URL), horas = fase === "completa" ? compartido ? 8 : 12 : 0.25;
  const [s] = await sql`INSERT INTO sesion_personal(token_huella,empleado_id,version_clave,csrf,fase,fuerte,compartido,dispositivo,vence,verificada)
    VALUES(${hash},${e.id}::uuid,${e.version_clave},${csrf},${fase},${!!options.fuerte},${compartido},${dispositivo},now()+make_interval(secs=>${Math.round(horas * 3600)}),CASE WHEN ${!!options.fuerte || !privilegio(e.permiso)} THEN now() END) RETURNING id,vence`;
  cookiesEquipo(c, token, csrf);
  await auditar(c, "sesion_iniciada", e.id, { sesion: s.id, fase, dispositivo, compartido });
  return { autenticado: true, fase, hasta: s.vence };
}
async function cargarSesion(c, token) {
  if (!/^[rd]\.[a-f0-9]{64}$/.test(token)) return null;
  const sql = neon(c.env.DATABASE_URL), hash = await digest(token);
  const [s] = await sql`SELECT s.*,e.nombre,e.usuario,e.permiso,e.requiere_cambio,e.clave_cambiada,e.mfa_secreto,e.mfa_ultimo,e.clave_huella,
    s.actividad<now()-CASE WHEN s.compartido THEN interval '5 minutes' ELSE interval '30 minutes' END AS inactiva,
    s.verificada>now()-interval '5 minutes' AS reciente
    FROM sesion_personal s JOIN empleado e ON e.id=s.empleado_id
    WHERE s.token_huella=${hash} AND s.revocada IS NULL AND s.vence>now() AND e.activo AND s.version_clave=e.version_clave
      AND (e.clave_temporal_vence IS NULL OR e.clave_temporal_vence>now())`;
  return s ?? null;
}
function autorizacionReciente(c) {
  const s = c.get("personal");
  return !!s && s.fase === "completa" && s.reciente && (!privilegio(s.permiso) || s.fuerte);
}
async function aes(env) {
  if (!env.PERSONAL_MFA_SECRETO || env.PERSONAL_MFA_SECRETO.length < 32) throw Error("mfa-no-configurado");
  const key = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(env.PERSONAL_MFA_SECRETO));
  return crypto.subtle.importKey("raw", key, "AES-GCM", false, ["encrypt", "decrypt"]);
}
var encode = (a) => btoa(Array.from(a, (b) => String.fromCharCode(b)).join(""));
var decode = (s) => Uint8Array.from(atob(s), (x) => x.charCodeAt(0));
async function cifrarMfa(env, id, value) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv, additionalData: new TextEncoder().encode(id) }, await aes(env), new TextEncoder().encode(value));
  return encode(iv) + "." + encode(new Uint8Array(encrypted));
}
async function descifrarMfa(env, id, value) {
  const [iv, data] = value.split(".");
  return new TextDecoder().decode(await crypto.subtle.decrypt({ name: "AES-GCM", iv: decode(iv), additionalData: new TextEncoder().encode(id) }, await aes(env), decode(data)));
}
function nuevoTotp(usuario) {
  return new TOTP({ issuer: "La Bella Lupita", label: usuario, algorithm: "SHA1", digits: 6, period: 30, secret: new Secret({ size: 20 }) });
}
async function validarMfa(c, e, codigo) {
  if (!e.mfa_secreto || typeof codigo !== "string" || !/^\d{6}$/.test(codigo)) return false;
  const secret = await descifrarMfa(c.env, e.id, e.mfa_secreto), totp = new TOTP({ secret, algorithm: "SHA1", digits: 6, period: 30 }), timestamp = Date.now();
  const delta = totp.validate({ token: codigo, window: 1, timestamp });
  if (delta === null) return false;
  const counter = Math.floor(timestamp / 3e4) + delta, sql = neon(c.env.DATABASE_URL);
  const [used] = await sql`UPDATE empleado SET mfa_ultimo=${counter} WHERE id=${e.id}::uuid AND mfa_ultimo<${counter} AND mfa_secreto=${e.mfa_secreto} RETURNING id`;
  return !!used;
}
async function codigosRecuperacion(c, id) {
  const codigos = Array.from({ length: 8 }, () => aleatorio().slice(0, 32)), hashes = await Promise.all(codigos.map(digest));
  await transaccion(c.env, async (cli) => {
    await cli.query("DELETE FROM recuperacion_personal WHERE empleado_id=$1", [id]);
    for (const h of hashes) await cli.query("INSERT INTO recuperacion_personal(huella,empleado_id) VALUES($1,$2)", [h, id]);
  });
  return codigos;
}

// club-lupita/src/worker/acceso-equipo.ts
var usuarioValido = (v) => typeof v === "string" && /^[a-z0-9._-]{3,40}$/.test(v);
var nombreValido = nombrePersonalValido;
var permisos = ["propietario", "encargado", "caja", "cocina"];
var espera = (c, n) => {
  c.header("Retry-After", String(n || 3));
  return c.json({ error: `Esper\xE1 ${n || 3} segundos antes de volver a intentar.` }, 429);
};
var personal = (c) => c.get("personal");
var propietarioReciente = (c) => !esPropietario(c) ? c.json({ error: "Solo un propietario administra los accesos." }, 403) : !autorizacionReciente(c) ? c.json({ error: "Confirm\xE1 tu identidad para administrar accesos.", revalidar: true }, 428) : null;
async function revocar(c, id) {
  const sql = neon(c.env.DATABASE_URL);
  await sql`UPDATE sesion_personal SET revocada=COALESCE(revocada,now()) WHERE empleado_id=${id}::uuid`;
}
async function buscar(c, usuario) {
  const sql = neon(c.env.DATABASE_URL);
  const [e] = await sql`SELECT * FROM empleado WHERE usuario=${usuario} AND activo AND (clave_temporal_vence IS NULL OR clave_temporal_vence>now())`;
  return e;
}
var HASH_INEXISTENTE = "$2a$12$R9h/cIPz0gi.URNNX3kh2OPST9/PgBkqquzi.Ss7KIUgO2t0jWMUW";
async function password(c, e, clave2) {
  const ok = await comprobarClave(neon(c.env.DATABASE_URL), secretoCredencial(c.env), clave2, e?.clave_huella ?? HASH_INEXISTENTE, "empleado");
  return !!e && ok;
}
async function invitacion(c, id, version) {
  const token = aleatorio(), hash = await digest(token), sql = neon(c.env.DATABASE_URL);
  await sql`UPDATE invitacion_personal SET usada=COALESCE(usada,now()) WHERE empleado_id=${id}::uuid`;
  const [r] = await sql`INSERT INTO invitacion_personal(huella,empleado_id,version_clave) VALUES(${hash},${id}::uuid,${version}) RETURNING vence`;
  return { invitacion: token, vence: r.vence };
}
function registrarAccesoEquipo(app2) {
  app2.use("/api/auth/equipo/*", async (c, next) => {
    if (c.req.method === "POST") {
      const r = await c.req.json();
      if (!r || typeof r !== "object" || Array.isArray(r)) return c.json({ error: "Revis\xE1 los datos del acceso." }, 422);
      if (r.compartido !== void 0 && typeof r.compartido !== "boolean" || r.demo !== void 0 && typeof r.demo !== "boolean" || r.dispositivo !== void 0 && (typeof r.dispositivo !== "string" || r.dispositivo.length > 80 || /[\p{Cc}\p{Cs}\u2028\u2029\u202a-\u202e\u2066-\u2069]/u.test(r.dispositivo))) return c.json({ error: "Revis\xE1 el nombre y el tipo de dispositivo." }, 422);
    }
    await next();
  });
  app2.get("/api/auth/equipo/estado", async (c) => {
    const sql = neon(c.env.DATABASE_URL), [r] = await sql`SELECT EXISTS(SELECT 1 FROM empleado WHERE permiso='propietario') AS configurado`;
    return c.json({ configurado: r.configurado, capacitacion: !!c.env.DEMO_DATABASE_URL, demo: !!c.get("equipoDemo") });
  });
  app2.post("/api/auth/equipo/iniciar-propietario", async (c) => {
    const r = await c.req.json(), limit = await limites(c, "activar-primer-propietario");
    if (!limit.ok) return espera(c, limit.segundos);
    const error = validarNuevaClave({ actual: r.actual, nueva: r.nueva, confirmacion: r.confirmacion });
    if (error || !usuarioValido(r.usuario) || !nombreValido(r.nombre)) return c.json({ error: error ?? "Revis\xE1 el nombre y el usuario (3 a 40 letras, n\xFAmeros, puntos o guiones)." }, 422);
    const central = c.get("basePropietario");
    if (!await comprobarPropietario(central, secretoCredencial(c.env), c.env.CASA_SECRETO, r.actual, await propietario(central))) {
      await fallo(c, limit.clave, null);
      return c.json({ error: "No pudimos verificar el acceso anterior." }, 401);
    }
    const hash = await guardarClave(neon(c.env.DATABASE_URL), secretoCredencial(c.env), r.nueva, "empleado");
    const result = await transaccion(c.env, async (cli) => {
      await cli.query("LOCK TABLE empleado IN SHARE ROW EXCLUSIVE MODE");
      const { rows: owners } = await cli.query("SELECT id FROM empleado WHERE permiso='propietario'");
      if (owners.length) return null;
      const { rows: [e] } = await cli.query("INSERT INTO empleado(nombre,usuario,permiso,clave_huella,requiere_cambio,clave_cambiada) VALUES($1,$2,'propietario',$3,false,now()) ON CONFLICT(usuario) DO NOTHING RETURNING *", [r.nombre.trim(), r.usuario, hash]);
      return e;
    });
    if (!result) return c.json({ error: "La activaci\xF3n inicial ya se realiz\xF3 o ese usuario existe. Ingres\xE1 con tu cuenta individual." }, 409);
    await acierto(c, limit.clave);
    await auditar(c, "propietario_activado", result.id);
    return c.json(await emitirSesion(c, result, { compartido: r.compartido, dispositivo: r.dispositivo }));
  });
  app2.post("/api/auth/equipo/entrar", async (c) => {
    const r = await c.req.json(), usuario = typeof r.usuario === "string" ? r.usuario.trim().toLowerCase() : "";
    if (!usuarioValido(usuario) || typeof r.clave !== "string" || r.clave.length > 256) return c.json({ error: "No pudimos verificar tu usuario y contrase\xF1a." }, 401);
    const limit = await limites(c, "login:" + usuario);
    if (!limit.ok) return espera(c, limit.segundos);
    const e = await buscar(c, usuario);
    if (!await password(c, e, r.clave)) {
      await fallo(c, limit.clave, e?.id ?? null);
      return c.json({ error: "No pudimos verificar tu usuario y contrase\xF1a." }, 401);
    }
    await acierto(c, limit.clave);
    return c.json(await emitirSesion(c, e, { compartido: r.compartido, dispositivo: r.dispositivo }));
  });
  app2.post("/api/auth/equipo/activar", async (c) => {
    const r = await c.req.json(), usuario = typeof r.usuario === "string" ? r.usuario.trim().toLowerCase() : "";
    if (!usuarioValido(usuario) || typeof r.invitacion !== "string" || !/^[a-f0-9]{64}$/.test(r.invitacion)) return c.json({ error: "La invitaci\xF3n no es v\xE1lida. Solicit\xE1 una nueva." }, 410);
    const limit = await limites(c, "activar:" + usuario);
    if (!limit.ok) return espera(c, limit.segundos);
    const error = validarNuevaClave({ actual: r.invitacion, nueva: r.nueva, confirmacion: r.confirmacion });
    if (error) return c.json({ error }, 422);
    const hash = await digest(r.invitacion), clave2 = await guardarClave(neon(c.env.DATABASE_URL), secretoCredencial(c.env), r.nueva, "empleado");
    const e = await transaccion(c.env, async (cli) => {
      const { rows: [i] } = await cli.query("SELECT i.* FROM invitacion_personal i JOIN empleado e ON e.id=i.empleado_id WHERE i.huella=$1 AND e.usuario=$2 AND e.activo AND i.usada IS NULL AND i.vence>now() AND i.version_clave=e.version_clave FOR UPDATE OF i,e", [hash, usuario]);
      if (!i) return null;
      await cli.query("UPDATE invitacion_personal SET usada=now() WHERE huella=$1", [hash]);
      const { rows: [p] } = await cli.query("UPDATE empleado SET clave_huella=$2,requiere_cambio=false,clave_temporal_vence=NULL,clave_cambiada=now(),version_clave=version_clave+1 WHERE id=$1 RETURNING *", [i.empleado_id, clave2]);
      await cli.query("UPDATE sesion_personal SET revocada=COALESCE(revocada,now()) WHERE empleado_id=$1", [p.id]);
      return p;
    });
    if (!e) {
      await fallo(c, limit.clave, null, "invitacion");
      return c.json({ error: "La invitaci\xF3n venci\xF3 o ya se utiliz\xF3. Solicit\xE1 una nueva." }, 410);
    }
    await acierto(c, limit.clave);
    await auditar(c, "invitacion_aceptada", e.id);
    const codigos = !e.mfa_secreto && !privilegio(e.permiso) ? await codigosRecuperacion(c, e.id) : void 0;
    return c.json({ ...await emitirSesion(c, e, { compartido: r.compartido, dispositivo: r.dispositivo }), codigos });
  });
  app2.post("/api/auth/equipo/recuperar", async (c) => {
    const r = await c.req.json(), usuario = typeof r.usuario === "string" ? r.usuario.trim().toLowerCase() : "";
    if (!usuarioValido(usuario) || typeof r.codigo !== "string" || !/^[a-f0-9]{32}$/.test(r.codigo)) return c.json({ error: "No pudimos recuperar este acceso." }, 401);
    const limit = await limites(c, "recuperar:" + usuario);
    if (!limit.ok) return espera(c, limit.segundos);
    const error = validarNuevaClave({ actual: r.codigo, nueva: r.nueva, confirmacion: r.confirmacion });
    if (error) return c.json({ error }, 422);
    const hash = await digest(r.codigo), clave2 = await guardarClave(neon(c.env.DATABASE_URL), secretoCredencial(c.env), r.nueva, "empleado");
    const e = await transaccion(c.env, async (cli) => {
      const { rows: [b] } = await cli.query("SELECT r.empleado_id FROM recuperacion_personal r JOIN empleado e ON e.id=r.empleado_id WHERE r.huella=$1 AND r.usada IS NULL AND e.usuario=$2 AND e.activo FOR UPDATE OF r,e", [hash, usuario]);
      if (!b) return null;
      await cli.query("UPDATE recuperacion_personal SET usada=COALESCE(usada,now()) WHERE empleado_id=$1", [b.empleado_id]);
      await cli.query("UPDATE invitacion_personal SET usada=COALESCE(usada,now()) WHERE empleado_id=$1", [b.empleado_id]);
      await cli.query("UPDATE sesion_personal SET revocada=COALESCE(revocada,now()) WHERE empleado_id=$1", [b.empleado_id]);
      const { rows: [p] } = await cli.query("UPDATE empleado SET clave_huella=$2,version_clave=version_clave+1,requiere_cambio=false,clave_temporal_vence=NULL,clave_cambiada=now(),mfa_secreto=NULL,mfa_ultimo=-1 WHERE id=$1 RETURNING *", [b.empleado_id, clave2]);
      return p;
    });
    if (!e) {
      await fallo(c, limit.clave, null, "recuperacion");
      return c.json({ error: "No pudimos recuperar este acceso. El c\xF3digo puede haberse utilizado." }, 401);
    }
    await acierto(c, limit.clave);
    await auditar(c, "cuenta_recuperada", e.id, { factoresAnterioresRevocados: true });
    return c.json(await emitirSesion(c, e, { compartido: r.compartido, dispositivo: r.dispositivo, fase: "configurar" }));
  });
  app2.get("/api/personal/yo", (c) => {
    const s = personal(c);
    if (!s) return c.json({ error: "Acceso exclusivo del equipo." }, 403);
    return c.json({ id: s.empleado_id, nombre: s.nombre, usuario: s.usuario, permiso: s.permiso, demo: !!c.get("equipoDemo"), requiereCambio: s.requiere_cambio, claveCambiada: s.clave_cambiada, fase: s.fase, mfa: !!s.mfa_secreto, compartido: s.compartido, dispositivo: s.dispositivo, bloqueada: s.fase === "completa" && (!!s.bloqueada || s.inactiva), reciente: autorizacionReciente(c), sesion: s.id, hasta: s.vence });
  });
  app2.post("/api/personal/salir", async (c) => {
    const s = personal(c), sql = neon(c.env.DATABASE_URL);
    if (s) {
      await sql`UPDATE sesion_personal SET revocada=COALESCE(revocada,now()) WHERE id=${s.id}::uuid`;
      await auditar(c, "sesion_cerrada", s.empleado_id, { sesion: s.id });
    }
    borrarCookies(c);
    return c.json({ cerrada: true });
  });
  app2.post("/api/personal/bloquear", async (c) => {
    const s = personal(c), sql = neon(c.env.DATABASE_URL);
    await sql`UPDATE sesion_personal SET bloqueada=COALESCE(bloqueada,now()) WHERE id=${s.id}::uuid`;
    await auditar(c, "sesion_bloqueada", s.empleado_id, { sesion: s.id });
    return c.json({ bloqueada: true });
  });
  app2.post("/api/personal/actividad", async (c) => {
    const s = personal(c);
    if (s.bloqueada || s.inactiva) return c.json({ error: "Desbloque\xE1 tu acceso para continuar.", bloqueada: true }, 423);
    const sql = neon(c.env.DATABASE_URL);
    await sql`UPDATE sesion_personal SET actividad=now() WHERE id=${s.id}::uuid`;
    return c.json({ actualizada: true });
  });
  app2.post("/api/personal/revalidar", async (c) => {
    const s = personal(c), r = await c.req.json(), limit = await limites(c, "revalidar:" + s.empleado_id);
    if (!limit.ok) return espera(c, limit.segundos);
    const e = await buscar(c, s.usuario);
    if (typeof r.actual !== "string" || r.actual.length > 256 || !await password(c, e, r.actual) || !!e?.mfa_secreto && !await validarMfa(c, e, r.codigo)) {
      await fallo(c, limit.clave, s.empleado_id);
      return c.json({ error: "No pudimos confirmar tu identidad. Revis\xE1 la contrase\xF1a y el c\xF3digo vigente." }, 422);
    }
    await acierto(c, limit.clave);
    const sql = neon(c.env.DATABASE_URL);
    await sql`UPDATE sesion_personal SET verificada=now(),actividad=now(),bloqueada=NULL,fuerte=${!!e?.mfa_secreto} WHERE id=${s.id}::uuid`;
    await auditar(c, "identidad_revalidada", s.empleado_id, { sesion: s.id });
    return c.json({ verificada: true });
  });
  app2.post("/api/personal/mfa/verificar", async (c) => {
    const s = personal(c), r = await c.req.json(), limit = await limites(c, "mfa:" + s.empleado_id);
    if (!limit.ok) return espera(c, limit.segundos);
    if (s.fase !== "mfa") return c.json({ error: "Ingres\xE1 nuevamente para verificar tu acceso." }, 409);
    if (!await validarMfa(c, { id: s.empleado_id, mfa_secreto: s.mfa_secreto }, r.codigo)) {
      await fallo(c, limit.clave, s.empleado_id, "segundo-factor");
      return c.json({ error: "El c\xF3digo no es v\xE1lido o ya se us\xF3. Us\xE1 el siguiente c\xF3digo del autenticador." }, 422);
    }
    await acierto(c, limit.clave);
    const sql = neon(c.env.DATABASE_URL);
    const [claimed] = await sql`UPDATE sesion_personal SET revocada=now() WHERE id=${s.id}::uuid AND revocada IS NULL RETURNING id`;
    if (!claimed) return c.json({ error: "Este acceso ya se verific\xF3. Actualiz\xE1 la p\xE1gina." }, 409);
    return c.json(await emitirSesion(c, { ...s, id: s.empleado_id }, { compartido: s.compartido, dispositivo: s.dispositivo, fuerte: true }));
  });
  app2.post("/api/personal/mfa/preparar", async (c) => {
    const s = personal(c);
    if (s.mfa_secreto || s.requiere_cambio || s.fase !== "configurar" && !autorizacionReciente(c)) return c.json({ error: "Confirm\xE1 tu identidad antes de configurar el autenticador.", revalidar: true }, 428);
    const sql = neon(c.env.DATABASE_URL), [pending] = await sql`SELECT mfa_pendiente FROM sesion_personal WHERE id=${s.id}::uuid AND mfa_pendiente_vence>now()`;
    let totp;
    if (pending?.mfa_pendiente) totp = new TOTP({ issuer: "La Bella Lupita", label: s.usuario, secret: await descifrarMfa(c.env, s.empleado_id, String(pending.mfa_pendiente)) });
    else {
      totp = nuevoTotp(s.usuario);
      const encrypted = await cifrarMfa(c.env, s.empleado_id, totp.secret.base32);
      await sql`UPDATE sesion_personal SET mfa_pendiente=${encrypted},mfa_pendiente_vence=now()+interval '10 minutes' WHERE id=${s.id}::uuid`;
    }
    const svg = await QRCode.toString(totp.toString(), { type: "svg", width: 240, margin: 2 });
    return c.json({ secreto: totp.secret.base32, qr: "data:image/svg+xml;base64," + btoa(svg) });
  });
  app2.post("/api/personal/mfa/confirmar", async (c) => {
    const s = personal(c), r = await c.req.json(), limit = await limites(c, "mfa:" + s.empleado_id);
    if (!limit.ok) return espera(c, limit.segundos);
    const sql = neon(c.env.DATABASE_URL), [pending] = await sql`SELECT mfa_pendiente FROM sesion_personal WHERE id=${s.id}::uuid AND mfa_pendiente_vence>now()`;
    if (s.mfa_secreto || !pending?.mfa_pendiente) return c.json({ error: "La configuraci\xF3n venci\xF3. Volv\xE9 a prepararla." }, 410);
    const totp = new TOTP({ secret: await descifrarMfa(c.env, s.empleado_id, String(pending.mfa_pendiente)) }), timestamp = Date.now();
    const delta = typeof r.codigo === "string" && /^\d{6}$/.test(r.codigo) ? totp.validate({ token: r.codigo, window: 1, timestamp }) : null;
    if (delta === null) {
      await fallo(c, limit.clave, s.empleado_id, "alta-segundo-factor");
      return c.json({ error: "Revis\xE1 el c\xF3digo del autenticador." }, 422);
    }
    const e = await transaccion(c.env, async (cli) => {
      const { rows: [current] } = await cli.query("SELECT id FROM sesion_personal WHERE id=$1 AND revocada IS NULL AND mfa_pendiente=$2 AND mfa_pendiente_vence>now() FOR UPDATE", [s.id, pending.mfa_pendiente]);
      if (!current) return null;
      const { rows: [p] } = await cli.query("UPDATE empleado SET mfa_secreto=$2,mfa_ultimo=$3 WHERE id=$1 AND mfa_secreto IS NULL RETURNING *", [s.empleado_id, pending.mfa_pendiente, Math.floor(timestamp / 3e4) + delta]);
      if (!p) return null;
      await cli.query("UPDATE sesion_personal SET revocada=COALESCE(revocada,now()),mfa_pendiente=NULL WHERE empleado_id=$1", [s.empleado_id]);
      return p;
    });
    if (!e) return c.json({ error: "La configuraci\xF3n cambi\xF3. Ingres\xE1 nuevamente." }, 409);
    await acierto(c, limit.clave);
    await auditar(c, "mfa_activado", s.empleado_id);
    const codigos = await codigosRecuperacion(c, s.empleado_id);
    return c.json({ ...await emitirSesion(c, e, { compartido: s.compartido, dispositivo: s.dispositivo, fuerte: true }), codigos });
  });
  app2.post("/api/personal/recuperacion/codigos", async (c) => {
    const s = personal(c);
    if (!autorizacionReciente(c)) return c.json({ error: "Confirm\xE1 tu identidad para renovar tus c\xF3digos.", revalidar: true }, 428);
    const codigos = await codigosRecuperacion(c, s.empleado_id);
    await auditar(c, "recuperacion_renovada", s.empleado_id);
    return c.json({ codigos });
  });
  app2.get("/api/personal/sesiones", async (c) => {
    const s = personal(c), sql = neon(c.env.DATABASE_URL);
    return c.json({ sesiones: await sql`SELECT id,dispositivo,compartido,creada,actividad,vence,bloqueada FROM sesion_personal WHERE empleado_id=${s.empleado_id}::uuid AND revocada IS NULL AND vence>now() ORDER BY creada DESC LIMIT 50` });
  });
  app2.post("/api/personal/sesiones/:id/revocar", async (c) => {
    const s = personal(c), id = c.req.param("id"), sql = neon(c.env.DATABASE_URL);
    if (id !== "todas" && !uuid2(id)) return c.json({ error: "Sesi\xF3n no encontrada." }, 404);
    const rows = await sql`UPDATE sesion_personal SET revocada=COALESCE(revocada,now()) WHERE empleado_id=${s.empleado_id}::uuid AND (${id}='todas' OR id::text=${id}) RETURNING id`;
    await auditar(c, "sesion_revocada", s.empleado_id, { sesiones: rows.map((x) => x.id) });
    if (id === "todas" || id === s.id) borrarCookies(c);
    return c.json({ revocadas: rows.length, salir: id === "todas" || id === s.id });
  });
  app2.get("/api/personal/eventos", async (c) => {
    const s = personal(c), sql = neon(c.env.DATABASE_URL);
    return c.json({ eventos: await sql`SELECT a.id,a.cuando,a.accion,COALESCE(e.nombre,a.quien) AS responsable,a.detalle FROM auditoria a LEFT JOIN empleado e ON e.id::text=a.quien
      WHERE (${s.permiso === "propietario"} OR a.quien=${s.empleado_id}) AND (a.accion LIKE 'sesion_%' OR a.accion LIKE 'acceso_%' OR a.accion LIKE 'mfa_%' OR a.accion LIKE 'recuperacion_%' OR a.accion LIKE 'invitacion_%' OR a.accion IN ('identidad_revalidada','cuenta_recuperada','propietario_activado','crear_empleado','cambiar_clave','permiso_empleado','desactivar_empleado','reactivar_empleado','restablecer_clave')) ORDER BY a.cuando DESC,a.id DESC LIMIT 50` });
  });
  app2.post("/api/personal/clave", async (c) => {
    const s = personal(c), r = await c.req.json(), error = validarNuevaClave(r);
    if (error) return c.json({ error }, 422);
    if (s.fase !== "clave" && !autorizacionReciente(c)) return c.json({ error: "Confirm\xE1 tu identidad antes de cambiar la contrase\xF1a.", revalidar: true }, 428);
    const limit = await limites(c, "clave:" + s.empleado_id);
    if (!limit.ok) return espera(c, limit.segundos);
    const e = await buscar(c, s.usuario);
    if (!await password(c, e, r.actual)) {
      await fallo(c, limit.clave, s.empleado_id);
      return c.json({ error: "La contrase\xF1a actual no es correcta." }, 422);
    }
    const hash = await guardarClave(neon(c.env.DATABASE_URL), secretoCredencial(c.env), r.nueva, "empleado"), sql = neon(c.env.DATABASE_URL);
    const [changed] = await sql`UPDATE empleado SET clave_huella=${hash},version_clave=version_clave+1,requiere_cambio=false,clave_temporal_vence=NULL,clave_cambiada=now() WHERE id=${s.empleado_id}::uuid AND version_clave=${s.version_clave} AND activo RETURNING *`;
    if (!changed) return c.json({ error: "Tu acceso cambi\xF3. Ingres\xE1 nuevamente." }, 401);
    await revocar(c, s.empleado_id);
    await acierto(c, limit.clave);
    await auditar(c, "cambiar_clave", s.empleado_id);
    const codigos = s.fase === "clave" && !s.mfa_secreto && !privilegio(s.permiso) ? await codigosRecuperacion(c, s.empleado_id) : void 0;
    if (s.fase === "clave") return c.json({ ...await emitirSesion(c, changed, { compartido: s.compartido, dispositivo: s.dispositivo }), codigos });
    borrarCookies(c);
    return c.json({ actualizada: true, salir: true });
  });
  app2.get("/api/personal/equipo", async (c) => {
    if (!privilegio(c.get("permiso"))) return c.json({ error: "Acceso exclusivo de administraci\xF3n." }, 403);
    const sql = neon(c.env.DATABASE_URL);
    return c.json({ empleados: await sql`SELECT id,nombre,usuario,permiso,activo,version_clave,requiere_cambio,clave_temporal_vence FROM empleado ORDER BY nombre` });
  });
  app2.post("/api/personal/equipo", async (c) => {
    const denied = propietarioReciente(c);
    if (denied) return denied;
    const r = await c.req.json();
    if (!nombreValido(r.nombre) || !usuarioValido(r.usuario) || !permisos.includes(r.permiso)) return c.json({ error: "Revis\xE1 nombre, usuario y permiso." }, 422);
    const sql = neon(c.env.DATABASE_URL), hash = await guardarClave(sql, secretoCredencial(c.env), aleatorio(), "empleado");
    const [e] = await sql`INSERT INTO empleado(nombre,usuario,permiso,clave_huella,requiere_cambio,clave_temporal_vence) VALUES(${r.nombre.trim()},${r.usuario},${r.permiso},${hash},true,now()+interval '24 hours') ON CONFLICT(usuario) DO NOTHING RETURNING id,version_clave`;
    if (!e) return c.json({ error: "Ese usuario ya existe." }, 409);
    const invite = await invitacion(c, String(e.id), Number(e.version_clave));
    await auditar(c, "crear_empleado", personal(c).empleado_id, { empleado: e.id, permiso: r.permiso });
    return c.json({ id: e.id, usuario: r.usuario, ...invite });
  });
  for (const accion of ["desactivar", "reactivar", "permiso"]) app2.post("/api/personal/equipo/:id/" + accion, async (c) => {
    const denied = propietarioReciente(c);
    if (denied) return denied;
    const r = await c.req.json(), id = c.req.param("id");
    if (!uuid2(id) || !Number.isSafeInteger(r.version) || r.version < 0 || accion === "permiso" && !permisos.includes(r.permiso)) return c.json({ error: "Actualiz\xE1 la lista y revis\xE1 los datos." }, 422);
    try {
      const result = await transaccion(c.env, async (cli) => {
        await cli.query("LOCK TABLE empleado IN SHARE ROW EXCLUSIVE MODE");
        const { rows: [before] } = await cli.query("SELECT * FROM empleado WHERE id=$1 AND version_clave=$2 FOR UPDATE", [id, r.version]);
        if (!before || accion === "permiso" && before.permiso === r.permiso || accion === "reactivar" && before.activo || accion === "desactivar" && !before.activo) return null;
        const { rows: [e] } = await cli.query("UPDATE empleado SET activo=$2,permiso=$3,version_clave=version_clave+1 WHERE id=$1 RETURNING id,permiso,activo,version_clave", [id, accion === "permiso" ? before.activo : accion === "reactivar", accion === "permiso" ? r.permiso : before.permiso]);
        await cli.query("UPDATE sesion_personal SET revocada=COALESCE(revocada,now()) WHERE empleado_id=$1", [id]);
        await cli.query("INSERT INTO auditoria(quien,accion,detalle) VALUES($1,$2,$3::jsonb)", [personal(c).empleado_id, accion + "_empleado", JSON.stringify({ empleado: id, antes: { permiso: before.permiso, activo: before.activo }, despues: e })]);
        return e;
      });
      return result ? c.json(result) : c.json({ error: "El acceso cambi\xF3. Actualiz\xE1 la lista." }, 409);
    } catch (e) {
      if (e instanceof Error && e.message.includes("ultimo_propietario")) return c.json({ error: "Debe quedar otro propietario activo con su autenticador configurado antes de realizar este cambio." }, 409);
      throw e;
    }
  });
  app2.post("/api/personal/equipo/:id/restablecer-clave", async (c) => {
    const denied = propietarioReciente(c);
    if (denied) return denied;
    const id = c.req.param("id"), r = await c.req.json();
    if (!uuid2(id) || !Number.isSafeInteger(r.version) || r.version < 0) return c.json({ error: "Actualiz\xE1 la lista y revis\xE1 el acceso." }, 422);
    if (id === personal(c).empleado_id) return c.json({ error: "Cambi\xE1 tu propia contrase\xF1a desde Cuenta y seguridad." }, 422);
    const sql = neon(c.env.DATABASE_URL), hash = await guardarClave(sql, secretoCredencial(c.env), aleatorio(), "empleado");
    const [e] = await sql`UPDATE empleado SET clave_huella=${hash},requiere_cambio=true,clave_temporal_vence=now()+interval '24 hours',version_clave=version_clave+1 WHERE id=${id}::uuid AND activo AND version_clave=${r.version} RETURNING usuario,version_clave`;
    if (!e) return c.json({ error: "El acceso cambi\xF3 o est\xE1 desactivado." }, 409);
    await revocar(c, id);
    const invite = await invitacion(c, id, Number(e.version_clave));
    await auditar(c, "restablecer_clave", personal(c).empleado_id, { empleado: id, mfaConservado: true });
    return c.json({ usuario: e.usuario, ...invite });
  });
}

// club-lupita/src/worker/acceso.ts
var DEMO = "50587442005";
function telefonoNormalizado(valor) {
  const digitos = String(valor ?? "").replace(/\D/g, "");
  return digitos.length === 8 ? "505" + digitos : digitos;
}
function registrarAcceso(app2) {
  app2.post("/api/auth/codigo", async (c) => {
    const r = await c.req.json().catch(() => null), tel = telefonoNormalizado(r?.telefono);
    if (!/^\d{8,15}$/.test(tel)) return c.json({ error: "Revis\xE1 el tel\xE9fono, incluido el c\xF3digo de pa\xEDs." }, 422);
    const demo = tel === DEMO;
    if (!demo && (c.env.ACCESO_PERSONAL !== "true" || !c.env.OTP_SERVICE)) return c.json({ error: "El acceso personal todav\xEDa no est\xE1 habilitado." }, 503);
    const codigo = demo ? "505505" : codigoDeSeis(), firma = await huella(c.env.SESION_SECRETO, `${tel}:${codigo}`);
    const sql = neon(c.env.DATABASE_URL);
    if (!demo) {
      const ip = await huella(c.env.SESION_SECRETO, "otp-ip:" + (c.req.header("cf-connecting-ip") ?? "local"));
      const [limite] = await sql`SELECT limitar_acceso(${ip},20,3600) AND limitar_acceso(${"otp:" + tel},5,3600) AS ok`;
      if (!limite.ok) return c.json({ error: "Pediste varios c\xF3digos. Esper\xE1 una hora antes de intentar otra vez." }, 429);
    }
    const [emitido] = await sql`SELECT emitir_codigo(${tel},${firma}) AS id`;
    if (!demo) {
      try {
        const enviado = await c.env.OTP_SERVICE.fetch("https://otp.internal/enviar", { method: "POST", headers: { "content-type": "application/json", "idempotency-key": "acceso:" + emitido.id }, body: JSON.stringify({ telefono: tel, codigo, venceEnMinutos: 10 }), signal: AbortSignal.timeout(8e3) });
        if (!enviado.ok) throw Error("envio");
        const confirmacion = await enviado.json();
        if (confirmacion.enviado !== true) throw Error("envio");
      } catch {
        await sql`UPDATE codigo_acceso SET usado=now() WHERE id=${emitido.id}`;
        return c.json({ error: "No pudimos enviar el c\xF3digo. Intent\xE1 de nuevo m\xE1s tarde." }, 503);
      }
    }
    return c.json({ enviado: true, ...demo ? { codigoDemo: codigo } : {} });
  });
  app2.post("/api/auth/entrar", async (c) => {
    const r = await c.req.json().catch(() => null), tel = telefonoNormalizado(r?.telefono);
    if (!r || typeof r.codigo !== "string" || !/^\d{6}$/.test(r.codigo) || !/^\d{8,15}$/.test(tel)) return c.json({ error: "Revis\xE1 el tel\xE9fono y los seis d\xEDgitos del c\xF3digo." }, 422);
    if (tel !== DEMO && (c.env.ACCESO_PERSONAL !== "true" || !c.env.OTP_SERVICE)) return c.json({ error: "El acceso personal todav\xEDa no est\xE1 habilitado." }, 503);
    const nombre = typeof r.nombre === "string" ? r.nombre.trim() : "";
    if (nombre && (nombre.length < 2 || nombre.length > 80 || /[\u0000-\u001f]/.test(nombre))) return c.json({ error: "Us\xE1 un nombre de 2 a 80 caracteres." }, 422);
    const firma = await huella(c.env.SESION_SECRETO, `${tel}:${r.codigo}`);
    return transaccion(c.env, async (cli) => {
      await cli.query("SELECT pg_advisory_xact_lock(hashtext($1))", ["acceso:" + tel]);
      const { rows: [codigo] } = await cli.query("SELECT id,huella,intentos,vence>now() AS vigente FROM codigo_acceso WHERE telefono=$1 AND usado IS NULL ORDER BY creado DESC,id DESC LIMIT 1 FOR UPDATE", [tel]);
      if (!codigo || !codigo.vigente) return c.json({ error: "El c\xF3digo venci\xF3 o ya se us\xF3. Ped\xED otro." }, 410);
      if (codigo.intentos >= 5) return c.json({ error: "Demasiados intentos. Ped\xED un c\xF3digo nuevo." }, 429);
      if (!igualEnTiempoConstante(firma, codigo.huella)) {
        await cli.query("UPDATE codigo_acceso SET intentos=intentos+1 WHERE id=$1", [codigo.id]);
        return c.json({ error: "El c\xF3digo no coincide." }, 401);
      }
      const { rows: [existente] } = await cli.query("SELECT id,nombre,baja FROM operativo_socio WHERE telefono=$1", [tel]);
      if (existente?.baja) return c.json({ error: "Esta cuenta no est\xE1 activa. Consult\xE1 en la casa." }, 403);
      if (!existente && !nombre) return c.json({ error: "Escrib\xED tu nombre para crear la cuenta." }, 422);
      let socio = existente;
      if (!socio) {
        const { rows: [nuevo] } = await cli.query("INSERT INTO socio(telefono,nombre) VALUES($1,$2) RETURNING id,nombre", [tel, nombre]);
        socio = nuevo;
        const { rows: [tanda] } = await cli.query("INSERT INTO tanda(socio_id) VALUES($1) RETURNING id", [socio.id]);
        await cli.query("INSERT INTO sello(tanda_id,n,motivo,ref_externa) VALUES($1,1,'De parte de la casa',$2),($1,2,'De parte de la casa',$3)", [tanda.id, "regalo-1-" + socio.id, "regalo-2-" + socio.id]);
      }
      await cli.query("UPDATE codigo_acceso SET usado=now() WHERE id=$1", [codigo.id]);
      const token = await firmar(c.env.SESION_SECRETO, { tel, rol: "socio", exp: Date.now() + 30 * 24 * 36e5 });
      return c.json({ token, socio: { nombre: socio.nombre, telefono: tel } });
    });
  });
}

// club-lupita/src/worker/correo.ts
async function enviarCodigo(env, correo, codigo, solicitud) {
  const subject = "Tu c\xF3digo de acceso a Club Lupita";
  const text = `Tu c\xF3digo de acceso a Club Lupita es ${codigo}. Vence en 10 minutos y solo se puede usar una vez. No lo compart\xE1s. Si no lo solicitaste, ignor\xE1 este mensaje.`;
  const html = `<h1>Bienvenido a Club Lupita</h1><p>Tu c\xF3digo de acceso es:</p><p style="font-size:32px;letter-spacing:6px"><strong>${codigo}</strong></p><p>Vence en 10 minutos y solo se puede usar una vez. No lo compart\xE1s.</p><p>Si no lo solicitaste, ignor\xE1 este mensaje.</p>`;
  if (env.RESEND_API_KEY) {
    const respuesta = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Authorization": `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json", "Idempotency-Key": `club-lupita-acceso-${solicitud}` },
      body: JSON.stringify({ from: `La Bella Lupita <${env.EMAIL_FROM}>`, to: [correo], subject, text, html }),
      signal: AbortSignal.timeout(8e3)
    });
    const resultado2 = await respuesta.json().catch(() => null);
    if (!respuesta.ok || typeof resultado2?.id !== "string" || !resultado2.id) throw Error("correo-no-enviado");
    return;
  }
  if (!env.EMAIL) throw Error("correo-no-configurado");
  const resultado = await env.EMAIL.send({ from: { email: env.EMAIL_FROM, name: "La Bella Lupita \xB7 Club Lupita" }, to: correo, subject, text, html });
  if (!resultado.messageId) throw Error("correo-no-enviado");
}

// club-lupita/src/worker/acceso-correo.ts
var correoNormalizado = (v) => typeof v === "string" ? v.trim().toLowerCase() : "";
var correoValido = (v) => v.length <= 254 && /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)+$/i.test(v);
var uuid3 = (v) => typeof v === "string" && /^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/.test(v);
var correoHabilitado = (env) => env.ACCESO_CORREO === "true" && (!!env.RESEND_API_KEY || !!env.EMAIL) && !!env.EMAIL_FROM;
function registrarAccesoCorreo(app2) {
  app2.use("/api/auth/correo/*", async (c, next) => {
    c.header("Cache-Control", "no-store");
    if (!correoHabilitado(c.env)) return c.json({ error: "El acceso por correo todav\xEDa no est\xE1 disponible. Intent\xE1 de nuevo m\xE1s tarde." }, 503);
    await next();
  });
  app2.post("/api/auth/correo/codigo", async (c) => {
    const cuerpo = await c.req.json().catch(() => null);
    const correo = correoNormalizado(cuerpo?.correo);
    if (!correoValido(correo)) return c.json({ error: "Revis\xE1 tu direcci\xF3n de correo." }, 422);
    const codigo = codigoDeSeis(), id = crypto.randomUUID();
    const firma = await huella(c.env.SESION_SECRETO, `${correo}:${id}:${codigo}`);
    const ip = await huella(c.env.SESION_SECRETO, "correo-ip:" + (c.req.header("cf-connecting-ip") ?? "local"));
    const claveCorreo = await huella(c.env.SESION_SECRETO, "correo-envio:" + correo);
    const emitido = await transaccion(c.env, async (cli) => {
      await cli.query("SELECT pg_advisory_xact_lock(hashtext($1))", ["correo:" + correo]);
      const { rows: [limite] } = await cli.query("SELECT limitar_acceso($1,20,3600) AND limitar_acceso($2,5,3600) AS ok", [ip, claveCorreo]);
      if (!limite.ok) return "limite";
      const { rows } = await cli.query("SELECT id FROM codigo_correo WHERE correo=$1 AND creado>now()-interval '60 seconds' LIMIT 1", [correo]);
      if (rows.length) return "espera";
      await cli.query("SELECT pg_advisory_xact_lock(hashtext($1))", ["cuota-global-correo"]);
      const { rows: [cuota] } = await cli.query("SELECT count(*) FILTER (WHERE creado >= date_trunc('day',now() AT TIME ZONE 'UTC') AT TIME ZONE 'UTC')::int AS dia, count(*)::int AS mes FROM codigo_correo WHERE creado>now()-interval '31 days'");
      if (cuota.dia >= 100 || cuota.mes >= 3e3) return "cuota";
      await cli.query("UPDATE codigo_correo SET usado=coalesce(usado,now()),registro_usado=now() WHERE correo=$1", [correo]);
      await cli.query("INSERT INTO codigo_correo(id,correo,huella) VALUES($1,$2,$3)", [id, correo, firma]);
      return "ok";
    });
    if (emitido !== "ok") return c.json({ error: emitido === "cuota" ? "Alcanzamos el l\xEDmite de correos disponibles. Intent\xE1 m\xE1s tarde; si ya ten\xE9s una sesi\xF3n abierta, pod\xE9s seguir us\xE1ndola." : emitido === "espera" ? "Esper\xE1 un minuto antes de pedir otro c\xF3digo." : "Pediste varios c\xF3digos. Esper\xE1 una hora antes de intentar otra vez." }, 429);
    try {
      await enviarCodigo(c.env, correo, codigo, id);
    } catch {
      const sql = neon(c.env.DATABASE_URL);
      await sql`UPDATE codigo_correo SET usado=now(),registro_usado=now() WHERE id=${id}`;
      return c.json({ error: "No pudimos enviar el correo. Intent\xE1 de nuevo m\xE1s tarde." }, 503);
    }
    return c.json({ enviado: true, solicitud: id });
  });
  app2.post("/api/auth/correo/verificar", async (c) => {
    const r = await c.req.json().catch(() => null), correo = correoNormalizado(r?.correo);
    if (!correoValido(correo) || !uuid3(r?.solicitud) || typeof r?.codigo !== "string" || !/^\d{6}$/.test(r.codigo)) return c.json({ error: "Revis\xE1 el correo y los seis d\xEDgitos del c\xF3digo." }, 422);
    const firma = await huella(c.env.SESION_SECRETO, `${correo}:${r.solicitud}:${r.codigo}`);
    return transaccion(c.env, async (cli) => {
      await cli.query("SELECT pg_advisory_xact_lock(hashtext($1))", ["correo:" + correo]);
      const { rows: [codigo] } = await cli.query("SELECT *,vence>now() AS vigente FROM codigo_correo WHERE id=$1 AND correo=$2 FOR UPDATE", [r.solicitud, correo]);
      if (!codigo || codigo.usado || !codigo.vigente) return c.json({ error: "El c\xF3digo venci\xF3 o ya se us\xF3. Ped\xED otro." }, 410);
      if (codigo.intentos >= 5) return c.json({ error: "Demasiados intentos. Ped\xED un c\xF3digo nuevo." }, 429);
      if (!igualEnTiempoConstante(firma, codigo.huella)) {
        await cli.query("UPDATE codigo_correo SET intentos=intentos+1 WHERE id=$1", [codigo.id]);
        return c.json({ error: "El c\xF3digo no coincide. Revisalo e intent\xE1 de nuevo." }, 401);
      }
      await cli.query("UPDATE codigo_correo SET usado=now() WHERE id=$1", [codigo.id]);
      const { rows: [socio] } = await cli.query("SELECT telefono,nombre,baja FROM operativo_socio WHERE lower(correo)=$1", [correo]);
      if (socio?.baja) return c.json({ error: "Esta cuenta no est\xE1 activa. Consult\xE1 en la casa." }, 403);
      if (socio) {
        const token = await firmar(c.env.SESION_SECRETO, { tel: socio.telefono, rol: "socio", exp: Date.now() + 30 * 24 * 36e5 });
        return c.json({ token, socio: { nombre: socio.nombre, telefono: socio.telefono } });
      }
      const registro = crypto.randomUUID() + crypto.randomUUID();
      await cli.query("UPDATE codigo_correo SET registro_huella=$2,registro_vence=now()+interval '10 minutes' WHERE id=$1", [codigo.id, await huella(c.env.SESION_SECRETO, registro)]);
      return c.json({ requierePerfil: true, registro });
    });
  });
  app2.post("/api/auth/correo/registro", async (c) => {
    const r = await c.req.json().catch(() => null);
    if (r?.promociones !== void 0 && typeof r.promociones !== "boolean") return c.json({ error: "Revis\xE1 tu preferencia de promociones." }, 422);
    const promociones = r?.promociones === true;
    const nombre = typeof r?.nombre === "string" ? r.nombre.trim() : "";
    const telefono = telefonoNormalizado(r?.telefono);
    if (!uuid3(r?.solicitud) || typeof r?.registro !== "string" || r.registro.length !== 72) return c.json({ error: "Verific\xE1 tu correo nuevamente para continuar." }, 422);
    if (nombre.length < 2 || nombre.length > 80 || /[\u0000-\u001f]/.test(nombre)) return c.json({ error: "Escrib\xED tu nombre, de 2 a 80 caracteres." }, 422);
    if (!/^[1-9]\d{7,14}$/.test(telefono)) return c.json({ error: "Revis\xE1 el tel\xE9fono, incluido el c\xF3digo de pa\xEDs." }, 422);
    if (telefono === "50587442005") return c.json({ error: "Us\xE1 tu n\xFAmero personal. Este n\xFAmero est\xE1 reservado para la cuenta de muestra." }, 422);
    const firma = await huella(c.env.SESION_SECRETO, r.registro);
    return transaccion(c.env, async (cli) => {
      const { rows: [codigo] } = await cli.query("SELECT *,registro_vence>now() AS vigente FROM codigo_correo WHERE id=$1 FOR UPDATE", [r.solicitud]);
      if (!codigo?.registro_huella || !codigo.usado || codigo.registro_usado || !codigo.vigente || !igualEnTiempoConstante(firma, codigo.registro_huella)) return c.json({ error: "La verificaci\xF3n venci\xF3 o ya se us\xF3. Verific\xE1 tu correo nuevamente." }, 410);
      await cli.query("SELECT pg_advisory_xact_lock(hashtext($1))", ["acceso:" + telefono]);
      const { rows: existentes } = await cli.query("SELECT id FROM operativo_socio WHERE telefono=$1 OR lower(correo)=$2", [telefono, codigo.correo]);
      if (existentes.length) return c.json({ error: "No podemos crear la cuenta con estos datos. Si ya ten\xE9s cuenta, entr\xE1 con tu correo o consult\xE1 en la casa para vincularla." }, 409);
      const { rows: [socio] } = await cli.query("INSERT INTO socio(telefono,nombre,correo,correo_verificado,promociones_correo,promociones_aceptadas,promociones_version,origen) VALUES($1,$2,$3,now(),$4,CASE WHEN $4 THEN now() ELSE NULL END,CASE WHEN $4 THEN 'registro-correo-v1' ELSE NULL END,'correo') RETURNING id", [telefono, nombre, codigo.correo, promociones]);
      const { rows: [tanda] } = await cli.query("INSERT INTO tanda(socio_id) VALUES($1) RETURNING id", [socio.id]);
      await cli.query("INSERT INTO sello(tanda_id,n,motivo,ref_externa) VALUES($1,1,'De parte de la casa',$2),($1,2,'De parte de la casa',$3)", [tanda.id, "regalo-1-" + socio.id, "regalo-2-" + socio.id]);
      await cli.query("UPDATE codigo_correo SET registro_usado=now() WHERE id=$1", [codigo.id]);
      const token = await firmar(c.env.SESION_SECRETO, { tel: telefono, rol: "socio", exp: Date.now() + 30 * 24 * 36e5 });
      return c.json({ token, socio: { nombre, telefono } });
    });
  });
}

// club-lupita/src/worker/mostrador.ts
function registrarMostrador(app2) {
  app2.get("/api/operacion/flotante", async (c) => {
    if (c.get("sesion").rol !== "casa" || !["propietario", "encargado"].includes(c.get("permiso"))) return c.json({ error: "Acceso exclusivo de administraci\xF3n." }, 403);
    const sql = neon(c.env.DATABASE_URL);
    const [flotante] = await sql`SELECT COALESCE(sum(d.pagado),0)::bigint AS pagado,COALESCE(sum(d.bono),0)::bigint AS bono,COALESCE(sum(d.total),0)::bigint AS total FROM operativo_socio s CROSS JOIN LATERAL saldo_de(s.id) d`;
    return c.json({ flotante });
  });
  app2.post("/api/operacion/vale/consultar", async (c) => {
    if (c.get("sesion").rol !== "casa" || c.get("permiso") === "cocina") return c.json({ error: "Acceso exclusivo de caja." }, 403);
    const r = await c.req.json().catch(() => null);
    if (typeof r?.codigo !== "string" || !/^[A-Z0-9]{8}$/.test(r.codigo)) return c.json({ error: "C\xF3digo inv\xE1lido." }, 422);
    const sql = neon(c.env.DATABASE_URL);
    const [vale] = await sql`SELECT s.nombre,v.vence,v.usado FROM operativo_vale v JOIN operativo_socio s ON s.id=v.socio_id WHERE v.codigo=${r.codigo}`;
    return vale ? c.json(vale) : c.json({ error: "Vale no encontrado." }, 404);
  });
  app2.post("/api/operacion/cliente", async (c) => {
    if (c.get("sesion").rol !== "casa" || c.get("permiso") === "cocina") return c.json({ error: "Acceso exclusivo de caja." }, 403);
    const r = await c.req.json().catch(() => null), telefono = telefonoNormalizado(r?.telefono);
    if (!/^\d{8,15}$/.test(telefono)) return c.json({ error: "Tel\xE9fono inv\xE1lido." }, 422);
    const sql = neon(c.env.DATABASE_URL);
    const [cliente] = await sql`SELECT s.id,s.nombre,s.telefono,to_jsonb(d) AS saldo FROM operativo_socio s CROSS JOIN LATERAL saldo_de(s.id) d WHERE s.telefono=${telefono} AND s.baja IS NULL`;
    if (!cliente) return c.json({ error: "No encontramos ese cliente." }, 404);
    const movimientos = await sql`SELECT id,creado,concepto,monto,tipo FROM operativo_asiento WHERE socio_id=${cliente.id} ORDER BY creado DESC,id DESC LIMIT 10`;
    return c.json({ ...cliente, movimientos });
  });
  app2.get("/api/operacion/entregas", async (c) => {
    if (c.get("sesion").rol !== "casa" || c.get("permiso") === "cocina") return c.json({ error: "Acceso exclusivo de caja." }, 403);
    const sql = neon(c.env.DATABASE_URL);
    const entregas = await sql`SELECT b.id,'bolsa' AS tipo,s.nombre,'Bolsa '||b.numero AS detalle,b.creada AS fecha FROM operativo_compra_bolsa b JOIN operativo_socio s ON s.id=b.socio_id WHERE b.entregada IS NULL
      UNION ALL SELECT a.id,'experiencia',s.nombre,e.nombre||' · Butaca '||a.butaca,e.cuando FROM operativo_asiento_experiencia a JOIN operativo_socio s ON s.id=COALESCE(a.cedido_a,a.socio_id) JOIN experiencia e ON e.id=a.experiencia_id WHERE a.asistencia IS NULL AND e.cuando>now()-interval '1 day' ORDER BY fecha LIMIT 100`;
    const reservas = await sql`SELECT r.id,r.zona,r.cuando,r.termina,r.personas,r.deposito,s.nombre FROM operativo_reserva r JOIN operativo_socio s ON s.id=r.socio_id WHERE r.cancelada IS NULL AND r.termina>now() ORDER BY r.cuando LIMIT 100`;
    return c.json({ entregas, reservas });
  });
  app2.post("/api/operacion/entregas/:tipo/:id", async (c) => {
    if (c.get("sesion").rol !== "casa" || c.get("permiso") === "cocina") return c.json({ error: "Acceso exclusivo de caja." }, 403);
    const tipo = c.req.param("tipo"), id = c.req.param("id");
    if (!["bolsa", "experiencia"].includes(tipo) || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(id)) return c.json({ error: "Comprobante inv\xE1lido." }, 422);
    const sql = neon(c.env.DATABASE_URL), quien = c.get("sesion").empleado ?? "propietario";
    const filas = tipo === "bolsa" ? await sql`WITH entrega AS (UPDATE operativo_compra_bolsa SET entregada=now(),entregada_por=${quien} WHERE id=${id}::uuid AND entregada IS NULL RETURNING socio_id), log AS (INSERT INTO auditoria(quien,accion,socio_id,detalle) SELECT ${quien},'entrega_bolsa',socio_id,jsonb_build_object('compra',${id}::text) FROM entrega) SELECT socio_id FROM entrega` : await sql`WITH entrega AS (UPDATE operativo_asiento_experiencia SET asistencia=now(),asistencia_por=${quien} WHERE id=${id}::uuid AND asistencia IS NULL RETURNING socio_id), log AS (INSERT INTO auditoria(quien,accion,socio_id,detalle) SELECT ${quien},'asistencia_experiencia',socio_id,jsonb_build_object('entrada',${id}::text) FROM entrega) SELECT socio_id FROM entrega`;
    return filas.length ? c.json({ registrado: true }) : c.json({ error: "Ya estaba registrado o el comprobante no existe." }, 409);
  });
  app2.get("/api/operacion/metricas", async (c) => {
    if (c.get("sesion").rol !== "casa" || c.get("permiso") && !["propietario", "encargado"].includes(c.get("permiso"))) return c.json({ error: "Acceso exclusivo del encargado." }, 403);
    const dias = Number(c.req.query("dias") ?? 30);
    if (![1, 7, 30, 90].includes(dias)) return c.json({ error: "Per\xEDodo inv\xE1lido." }, 422);
    const sql = neon(c.env.DATABASE_URL);
    const [metricas] = await sql`SELECT count(*)::int AS pedidos,count(*) FILTER(WHERE estado='entregado')::int AS entregados,count(*) FILTER(WHERE estado='cancelado')::int AS cancelados,COALESCE(sum(total) FILTER(WHERE estado<>'cancelado'),0)::bigint AS ventas, count(DISTINCT socio_id)::int AS clientes FROM operativo_pedido WHERE creado>now()-${dias}::int*interval '1 day'`;
    return c.json({ ...metricas, dias, actualizado: (/* @__PURE__ */ new Date()).toISOString() });
  });
}

// club-lupita/src/worker/membresias.ts
async function plazasOcupadas(db2) {
  const sql = neon(db2);
  const [fila] = await sql`SELECT count(*)::int AS n,
    count(*) FILTER (WHERE NOT m.autorenueva)::int AS salen
    FROM operativo_membresia m JOIN operativo_socio s ON s.id=m.socio_id
    WHERE m.estado IN ('activa','en_gracia') AND (
      m.hasta>now() OR (s.baja IS NULL AND m.autorenueva AND m.renovacion_consentida IS NOT NULL
        AND (SELECT total FROM saldo_de(m.socio_id))>=m.cuota))`;
  return { n: Number(fila.n), salen: Number(fila.salen) };
}

// club-lupita/src/worker/panel.ts
function registrarPanel(app2) {
  app2.get("/api/operacion/listas/:tipo", async (c) => {
    const tipo = c.req.param("tipo");
    const permiso = c.get("permiso") ?? "encargado";
    if (c.get("sesion").rol !== "casa" || permiso === "cocina" && tipo !== "pedidos" || ["equipo", "auditoria"].includes(tipo) && !["propietario", "encargado"].includes(permiso)) return c.json({ error: "Tu acceso no permite consultar esta secci\xF3n." }, 403);
    if (!["pedidos", "entregas", "agenda", "atencion", "equipo", "auditoria"].includes(tipo)) return c.json({ error: "Secci\xF3n no encontrada." }, 404);
    const pagina = Number(c.req.query("pagina") ?? 0);
    const q = (c.req.query("q") ?? "").trim();
    const estado = c.req.query("estado") ?? { pedidos: "activos", entregas: "pendientes", agenda: "proximas", atencion: "pendiente", equipo: "todos", auditoria: "todos" }[tipo];
    const fecha = c.req.query("fecha") ?? "";
    const estados = {
      pedidos: ["activos", "todos", "recibido", "aceptado", "preparando", "listo", "entregado", "cancelado"],
      entregas: ["pendientes", "entregadas", "todos", "bolsa", "experiencia"],
      agenda: ["proximas", "todos", "canceladas"],
      atencion: ["pendiente", "resuelta", "todos"],
      equipo: ["todos", "activos", "desactivados"],
      auditoria: ["todos"]
    };
    if (!Number.isSafeInteger(pagina) || pagina < 0 || pagina > 1e5 || q.length > 80 || !estados[tipo].includes(estado) || fecha && !fechaCalendario(fecha)) {
      return c.json({ error: "Revis\xE1 los filtros o la p\xE1gina solicitada." }, 422);
    }
    const sql = neon(c.env.DATABASE_URL), offset = pagina * 20;
    const busqueda = "%" + q.replace(/[\\%_]/g, "\\$&") + "%";
    let resultado;
    if (tipo === "pedidos") {
      ;
      [resultado] = await sql`WITH filtradas AS (
        SELECT p.id,p.numero,p.estado,p.total,p.lineas,p.creado,p.actualizado,p.motivo,s.nombre
        FROM operativo_pedido p JOIN operativo_socio s ON s.id=p.socio_id
        WHERE (${estado}='todos' OR (${estado}='activos' AND p.estado NOT IN ('entregado','cancelado')) OR p.estado=${estado})
          AND (s.nombre ILIKE ${busqueda} OR p.numero::text ILIKE ${busqueda})
          AND (${fecha}='' OR (p.creado AT TIME ZONE 'America/Managua')::date::text=${fecha})
      ), pagina AS (SELECT * FROM filtradas ORDER BY creado DESC,id DESC LIMIT 20 OFFSET ${offset})
      SELECT (SELECT count(*)::int FROM filtradas) AS total,COALESCE((SELECT jsonb_agg(p ORDER BY creado DESC,id DESC) FROM pagina p),'[]'::jsonb) AS filas`;
    } else if (tipo === "entregas") {
      ;
      [resultado] = await sql`WITH todas AS (
        SELECT b.id,'bolsa' AS tipo,s.nombre,s.telefono,'Bolsa '||b.numero AS detalle,b.creada AS fecha,b.entregada AS completada,b.entregada_por AS responsable
        FROM operativo_compra_bolsa b JOIN operativo_socio s ON s.id=b.socio_id
        UNION ALL SELECT a.id,'experiencia',s.nombre,s.telefono,e.nombre||' · Butaca '||a.butaca,e.cuando,a.asistencia,a.asistencia_por
        FROM operativo_asiento_experiencia a JOIN operativo_socio s ON s.id=COALESCE(a.cedido_a,a.socio_id) JOIN experiencia e ON e.id=a.experiencia_id
      ), filtradas AS (SELECT * FROM todas WHERE
        (${estado}='todos' OR (${estado}='entregadas' AND completada IS NOT NULL) OR (${estado}='pendientes' AND completada IS NULL) OR (tipo=${estado} AND completada IS NULL))
        AND (nombre ILIKE ${busqueda} OR detalle ILIKE ${busqueda} OR telefono ILIKE ${busqueda} OR id::text ILIKE ${busqueda})
        AND (${fecha}='' OR (fecha AT TIME ZONE 'America/Managua')::date::text=${fecha})
      ), pagina AS (SELECT * FROM filtradas ORDER BY fecha,id,tipo LIMIT 20 OFFSET ${offset})
      SELECT (SELECT count(*)::int FROM filtradas) AS total,COALESCE((SELECT jsonb_agg(p ORDER BY fecha,id,tipo) FROM pagina p),'[]'::jsonb) AS filas`;
    } else if (tipo === "agenda") {
      ;
      [resultado] = await sql`WITH filtradas AS (
        SELECT r.id,r.zona,r.cuando,r.termina,r.personas,r.deposito,r.cancelada,s.nombre,s.telefono
        FROM operativo_reserva r JOIN operativo_socio s ON s.id=r.socio_id
        WHERE (${estado}='todos' OR (${estado}='canceladas' AND r.cancelada IS NOT NULL) OR (${estado}='proximas' AND r.cancelada IS NULL AND r.termina>now()))
        AND (s.nombre ILIKE ${busqueda} OR s.telefono ILIKE ${busqueda} OR r.zona ILIKE ${busqueda})
        AND (${fecha}='' OR (r.cuando AT TIME ZONE 'America/Managua')::date::text=${fecha})
      ), pagina AS (SELECT * FROM filtradas ORDER BY cuando,id LIMIT 20 OFFSET ${offset})
      SELECT (SELECT count(*)::int FROM filtradas) AS total,COALESCE((SELECT jsonb_agg(p ORDER BY cuando,id) FROM pagina p),'[]'::jsonb) AS filas`;
    } else if (tipo === "atencion") {
      ;
      [resultado] = await sql`WITH filtradas AS (
        SELECT a.id,a.mensaje,a.creada,a.estado,a.respuesta,a.resuelta,s.nombre
        FROM operativo_solicitud_atencion a JOIN operativo_socio s ON s.id=a.socio_id
        WHERE (${estado}='todos' OR a.estado=${estado}) AND (s.nombre ILIKE ${busqueda} OR a.mensaje ILIKE ${busqueda})
      ), pagina AS (SELECT * FROM filtradas ORDER BY creada DESC,id DESC LIMIT 20 OFFSET ${offset})
      SELECT (SELECT count(*)::int FROM filtradas) AS total,COALESCE((SELECT jsonb_agg(p ORDER BY creada DESC,id DESC) FROM pagina p),'[]'::jsonb) AS filas`;
    } else if (tipo === "equipo") {
      ;
      [resultado] = await sql`WITH filtradas AS (
        SELECT id,nombre,usuario,permiso,activo,version_clave,requiere_cambio,clave_temporal_vence FROM empleado
        WHERE (${estado}='todos' OR (${estado}='activos' AND activo) OR (${estado}='desactivados' AND NOT activo))
        AND (nombre ILIKE ${busqueda} OR usuario ILIKE ${busqueda})
      ), pagina AS (SELECT * FROM filtradas ORDER BY nombre,id LIMIT 20 OFFSET ${offset})
      SELECT (SELECT count(*)::int FROM filtradas) AS total,COALESCE((SELECT jsonb_agg(p ORDER BY nombre,id) FROM pagina p),'[]'::jsonb) AS filas`;
    } else {
      ;
      [resultado] = await sql`WITH filtradas AS (
        SELECT a.id,a.cuando,a.accion,COALESCE(e.nombre,a.quien) AS responsable,s.nombre AS cliente,a.detalle
        FROM operativo_auditoria a LEFT JOIN empleado e ON e.id::text=a.quien LEFT JOIN operativo_socio s ON s.id=a.socio_id
        WHERE (a.accion ILIKE ${busqueda} OR COALESCE(e.nombre,a.quien) ILIKE ${busqueda} OR s.nombre ILIKE ${busqueda})
        AND (${fecha}='' OR (a.cuando AT TIME ZONE 'America/Managua')::date::text=${fecha})
      ), pagina AS (SELECT * FROM filtradas ORDER BY cuando DESC,id DESC LIMIT 20 OFFSET ${offset})
      SELECT (SELECT count(*)::int FROM filtradas) AS total,COALESCE((SELECT jsonb_agg(p ORDER BY cuando DESC,id DESC) FROM pagina p),'[]'::jsonb) AS filas`;
    }
    if (permiso === "cocina" && tipo === "pedidos") resultado = { ...resultado, filas: resultado.filas.map(pedidoParaCocina) };
    return c.json({ ...resultado, pagina, tamano: 20, actualizado: (/* @__PURE__ */ new Date()).toISOString() });
  });
  app2.get("/api/operacion/resumen", async (c) => {
    if (c.get("sesion").rol !== "casa" || c.get("permiso") && !["propietario", "encargado"].includes(c.get("permiso"))) return c.json({ error: "Acceso exclusivo del encargado." }, 403);
    const sql = neon(c.env.DATABASE_URL);
    const [r] = await sql`SELECT
      (SELECT count(*)::int FROM operativo_pedido WHERE estado NOT IN ('entregado','cancelado')) AS pedidos,
      (SELECT count(*)::int FROM operativo_pedido WHERE estado='recibido') AS nuevos,
      (SELECT count(*)::int FROM operativo_compra_bolsa WHERE entregada IS NULL) + (SELECT count(*)::int FROM operativo_asiento_experiencia WHERE asistencia IS NULL) AS entregas,
      (SELECT count(*)::int FROM operativo_solicitud_atencion WHERE estado='pendiente') AS solicitudes,
      (SELECT count(*)::int FROM operativo_reserva WHERE cancelada IS NULL AND (cuando AT TIME ZONE 'America/Managua')::date=(now() AT TIME ZONE 'America/Managua')::date) AS mesas,
      (SELECT COALESCE(sum(total),0)::bigint FROM operativo_pedido WHERE estado<>'cancelado' AND (creado AT TIME ZONE 'America/Managua')::date=(now() AT TIME ZONE 'America/Managua')::date) AS importe`;
    const membresias = await plazasOcupadas(c.env.DATABASE_URL);
    return c.json({ ...r, membresiasVivas: membresias.n, bajasAnunciadas: membresias.salen, actualizado: (/* @__PURE__ */ new Date()).toISOString() });
  });
}

// club-lupita/src/worker/clientes.ts
var autorizado = (c) => c.get("sesion").rol === "casa" && ["propietario", "encargado"].includes(c.get("permiso"));
var uuid4 = (s) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(s);
var fechaValida = (s) => !s || /^\d{4}-\d{2}-\d{2}$/.test(s) && s >= "0001-01-01" && Number.isFinite(Date.parse(s)) && new Date(s).toISOString().slice(0, 10) === s;
function registrarClientes(app2) {
  app2.get("/api/operacion/clientes", async (c) => {
    if (!autorizado(c)) return c.json({ error: "El directorio es exclusivo del propietario y del encargado." }, 403);
    const pagina = Number(c.req.query("pagina") ?? 0), q = (c.req.query("q") ?? "").trim(), estado = c.req.query("estado") ?? "todos", origen = c.req.query("origen") ?? "todos";
    const desde = c.req.query("desde") ?? "", hasta = c.req.query("hasta") ?? "", archivo = c.req.query("archivo") ?? "operativos";
    if (!Number.isSafeInteger(pagina) || pagina < 0 || pagina > 1e5 || q.length > 100 || !["todos", "activos", "bajas"].includes(estado) || !["todos", "correo", "anterior", "muestra"].includes(origen) || !["operativos", "muestras"].includes(archivo) || !fechaValida(desde) || !fechaValida(hasta) || desde && hasta && desde > hasta) return c.json({ error: "Revis\xE1 la b\xFAsqueda, las fechas o los filtros." }, 422);
    if (archivo === "muestras" && c.get("permiso") !== "propietario") return c.json({ error: "Solo el propietario consulta el archivo de muestras." }, 403);
    const sql = neon(c.env.DATABASE_URL), busqueda = "%" + q.replace(/[\\%_]/g, "\\$&") + "%", digitos = /^[+\d\s().-]+$/.test(q) ? q.replace(/\D/g, "") : "", offset = pagina * 20;
    const [r] = await sql`WITH filtradas AS (
      SELECT id,nombre,telefono,correo,correo_verificado,creado,baja,origen,archivado_muestra
      FROM socio WHERE ((${archivo}='operativos' AND archivado_muestra IS NULL) OR (${archivo}='muestras' AND archivado_muestra IS NOT NULL))
        AND (${estado}='todos' OR (${estado}='activos' AND baja IS NULL) OR (${estado}='bajas' AND baja IS NOT NULL))
        AND (${origen}='todos' OR origen=${origen})
        AND (nombre ILIKE ${busqueda} OR correo ILIKE ${busqueda} OR telefono ILIKE ${busqueda} OR (${digitos}<>'' AND telefono LIKE ${"%" + digitos + "%"}))
        AND (${desde}='' OR (creado AT TIME ZONE 'America/Managua')::date>=NULLIF(${desde},'')::date)
        AND (${hasta}='' OR (creado AT TIME ZONE 'America/Managua')::date<=NULLIF(${hasta},'')::date)
    ), pagina AS (SELECT * FROM filtradas ORDER BY creado DESC,id DESC LIMIT 20 OFFSET ${offset})
    SELECT (SELECT count(*)::int FROM filtradas) AS total,COALESCE((SELECT jsonb_agg(p ORDER BY creado DESC,id DESC) FROM pagina p),'[]'::jsonb) AS filas,
      (SELECT count(*)::int FROM socio WHERE archivado_muestra IS NULL) AS registrados,
      (SELECT count(*)::int FROM socio WHERE archivado_muestra IS NULL AND baja IS NULL) AS activos,
      (SELECT count(*)::int FROM socio WHERE archivado_muestra IS NULL AND correo_verificado IS NOT NULL) AS verificados,
      (SELECT count(*)::int FROM socio WHERE archivado_muestra IS NOT NULL) AS muestras_archivadas`;
    return c.json({ ...r, pagina, tamano: 20, actualizado: (/* @__PURE__ */ new Date()).toISOString() });
  });
  app2.get("/api/operacion/clientes/:id", async (c) => {
    if (!autorizado(c)) return c.json({ error: "La ficha es exclusiva del propietario y del encargado." }, 403);
    const id = c.req.param("id");
    if (!uuid4(id)) return c.json({ error: "Cliente no encontrado." }, 404);
    const sql = neon(c.env.DATABASE_URL), propietario2 = c.get("permiso") === "propietario";
    const [r] = await sql`SELECT s.id,s.nombre,s.telefono,s.correo,s.correo_verificado,s.creado,s.baja,s.origen,s.archivado_muestra,
      s.bebida_siempre,s.alergias,s.cumple,s.promociones_correo,
      (SELECT to_jsonb(d) FROM saldo_de(s.id) d) AS saldo,
      (SELECT jsonb_build_object('puntos',puntos,'nivel',nivel_nombre) FROM puntaje WHERE socio_id=s.id) AS puntos,
      (SELECT jsonb_build_object('numero',numero,'estado',CASE WHEN estado IN ('activa','en_gracia') AND hasta<=now() THEN 'vencida' ELSE estado::text END,'desde',desde,'hasta',hasta,'autorenueva',autorenueva,'consentida',renovacion_consentida IS NOT NULL) FROM membresia WHERE socio_id=s.id ORDER BY hasta DESC,id DESC LIMIT 1) AS membresia,
      (SELECT count(*)::int FROM pedido WHERE socio_id=s.id) AS pedidos,
      (SELECT max(creado) FROM pedido WHERE socio_id=s.id) AS ultimo_pedido
      FROM socio s WHERE s.id=${id}::uuid AND (${propietario2} OR s.archivado_muestra IS NULL)`;
    if (!r) return c.json({ error: "Cliente no encontrado." }, 404);
    return c.json(r);
  });
  app2.get("/api/operacion/clientes/:id/historial", async (c) => {
    if (!autorizado(c)) return c.json({ error: "El historial es exclusivo del propietario y del encargado." }, 403);
    const id = c.req.param("id"), tipo = c.req.query("tipo") ?? "todos";
    if (!uuid4(id)) return c.json({ error: "Cliente no encontrado." }, 404);
    if (!["todos", "dinero", "pedidos", "reservas", "bolsas", "experiencias", "sellos", "canjes", "puntos", "membresias", "beneficios", "atencion"].includes(tipo)) return c.json({ error: "Eleg\xED un tipo de actividad v\xE1lido." }, 422);
    let fecha = null, clave2 = null;
    const cursor = c.req.query("cursor");
    if (cursor) {
      try {
        if (cursor.length > 512) throw Error();
        const r = JSON.parse(atob(cursor));
        if (!r || typeof r.fecha !== "string" || typeof r.id !== "string" || r.fecha < "0001-01-01" || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{6}Z$/.test(r.fecha) || !Number.isFinite(Date.parse(r.fecha)) || new Date(r.fecha).toISOString().slice(0, 19) !== r.fecha.slice(0, 19) || !/^[a-z]+:[0-9a-f-]{1,40}$/.test(r.id)) throw Error();
        fecha = r.fecha;
        clave2 = r.id;
      } catch {
        return c.json({ error: "La p\xE1gina del historial no es v\xE1lida. Volv\xE9 al inicio." }, 422);
      }
    }
    const sql = neon(c.env.DATABASE_URL), propietario2 = c.get("permiso") === "propietario";
    const [s] = await sql`SELECT id FROM socio WHERE id=${id}::uuid AND (${propietario2} OR archivado_muestra IS NULL)`;
    if (!s) return c.json({ error: "Cliente no encontrado." }, 404);
    const rows = await sql`WITH actividad AS (
      SELECT 'dinero:'||id AS id,'dinero' AS tipo,creado AS fecha,concepto AS titulo,jsonb_build_object('monto',monto,'tipo',tipo,'referencia',ref_externa) AS detalle FROM asiento WHERE socio_id=${id}::uuid
      UNION ALL SELECT 'pedidos:'||id,'pedidos',creado,'Pedido #'||numero,jsonb_build_object('estado',estado,'total',total,'lineas',lineas,'motivo',motivo) FROM pedido WHERE socio_id=${id}::uuid
      UNION ALL SELECT 'estados:'||e.id,'pedidos',e.creado,'Pedido #'||p.numero||' · '||e.estado,jsonb_build_object('responsable',COALESCE(em.nombre,e.quien),'motivo',e.motivo) FROM pedido_evento e JOIN pedido p ON p.id=e.pedido_id LEFT JOIN empleado em ON em.id::text=e.quien WHERE p.socio_id=${id}::uuid
      UNION ALL SELECT 'reservas:'||id,'reservas',creada,'Reserva · '||zona,jsonb_build_object('cuando',cuando,'termina',termina,'personas',personas,'deposito',deposito,'cancelada',cancelada) FROM reserva WHERE socio_id=${id}::uuid
      UNION ALL SELECT 'bolsas:'||id,'bolsas',creada,'Bolsa '||numero,jsonb_build_object('generacion',generacion,'total',total,'entregada',entregada) FROM compra_bolsa WHERE socio_id=${id}::uuid
      UNION ALL SELECT 'experiencias:'||a.id,'experiencias',a.comprado,e.nombre,jsonb_build_object('cuando',e.cuando,'butaca',a.butaca,'total',a.pagado,'asistencia',a.asistencia,'cedida',a.cedido_a IS NOT NULL) FROM asiento_experiencia a JOIN experiencia e ON e.id=a.experiencia_id WHERE a.socio_id=${id}::uuid OR a.cedido_a=${id}::uuid
      UNION ALL SELECT 'sellos:'||s.id,'sellos',s.puesto,s.motivo,jsonb_build_object('numero',s.n,'responsable',COALESCE(em.nombre,s.barista)) FROM sello s JOIN tanda t ON t.id=s.tanda_id LEFT JOIN empleado em ON em.id::text=s.barista WHERE t.socio_id=${id}::uuid
      UNION ALL SELECT 'canjes:'||id,'canjes',canjeada,'Décima de tanda entregada',jsonb_build_object('abierta',abierta,'cerrada',cerrada) FROM tanda WHERE socio_id=${id}::uuid AND canjeada IS NOT NULL
      UNION ALL SELECT 'puntos:'||id,'puntos',creado,concepto,jsonb_build_object('puntos',puntos) FROM punto WHERE socio_id=${id}::uuid
      UNION ALL SELECT 'membresias:'||id,'membresias',desde,'Membresía #'||numero,jsonb_build_object('estado',CASE WHEN estado IN ('activa','en_gracia') AND hasta<=now() THEN 'vencida' ELSE estado::text END,'hasta',hasta,'cuota',cuota) FROM membresia WHERE socio_id=${id}::uuid
      UNION ALL SELECT 'beneficios:'||b.id,'beneficios',b.usado,CASE b.clase WHEN 'bolsa_mes' THEN 'Bolsa de membresía entregada' ELSE 'Bebida de membresía entregada' END,'{}'::jsonb FROM beneficio_uso b JOIN membresia m ON m.id=b.membresia_id WHERE m.socio_id=${id}::uuid
      UNION ALL SELECT 'atencion:'||id,'atencion',creada,'Solicitud de atención',jsonb_build_object('estado',estado,'mensaje',mensaje,'respuesta',respuesta,'resuelta',resuelta) FROM solicitud_atencion WHERE socio_id=${id}::uuid
    ) SELECT id,tipo,titulo,detalle,to_char(fecha AT TIME ZONE 'UTC','YYYY-MM-DD"T"HH24:MI:SS.US"Z"') AS fecha FROM actividad
      WHERE (${tipo}='todos' OR tipo=${tipo}) AND (${fecha}::timestamptz IS NULL OR (fecha,id)<(${fecha}::timestamptz,${clave2}::text))
      ORDER BY fecha DESC,id DESC LIMIT 21`;
    const filas = rows.slice(0, 20), ultima = filas.at(-1);
    return c.json({ filas, siguiente: rows.length > 20 && ultima ? btoa(JSON.stringify({ fecha: ultima.fecha, id: ultima.id })) : null });
  });
}

// club-lupita/src/worker/atencion.ts
function registrarAtencion(app2) {
  app2.post("/api/reservas/:id/cancelar", async (c) => {
    if (c.get("sesion").rol !== "socio") return c.json({ error: "Entr\xE1 con tu cuenta." }, 403);
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(c.req.param("id"))) return c.json({ error: "Reserva no encontrada." }, 404);
    return transaccion(c.env, async (cli) => {
      const { rows: [r] } = await cli.query("SELECT r.*,r.cuando>now() AS futura FROM operativo_reserva r JOIN operativo_socio s ON s.id=r.socio_id WHERE r.id=$1 AND s.telefono=$2 FOR UPDATE OF r", [c.req.param("id"), c.get("sesion").tel]);
      if (!r) return c.json({ error: "Reserva no encontrada." }, 404);
      if (r.cancelada) return c.json({ cancelada: true, repetido: true });
      if (!r.futura) return c.json({ error: "Esta reserva ya comenz\xF3. Consult\xE1 con la casa." }, 409);
      if (r.deposito > 0) return c.json({ error: "Esta reserva tiene un dep\xF3sito. Ped\xED ayuda para acordar el cambio o la devoluci\xF3n con la casa." }, 409);
      await cli.query("UPDATE operativo_reserva SET cancelada=now() WHERE id=$1", [r.id]);
      await cli.query("INSERT INTO auditoria(quien,accion,socio_id,detalle) VALUES('socio','cancelar_reserva',$1,$2::jsonb)", [r.socio_id, JSON.stringify({ reserva: r.id })]);
      await cli.query("INSERT INTO aviso_cliente(socio_id,referencia,texto) VALUES($1,$2,$3) ON CONFLICT DO NOTHING", [r.socio_id, "reserva:" + r.id + ":cancelada", "Tu reserva en " + r.zona + " qued\xF3 cancelada. No ten\xEDa dep\xF3sito."]);
      return c.json({ cancelada: true });
    });
  });
  app2.get("/api/atencion", async (c) => {
    if (c.get("sesion").rol !== "socio") return c.json({ error: "Entr\xE1 con tu cuenta." }, 403);
    const sql = neon(c.env.DATABASE_URL);
    return c.json({ solicitudes: await sql`SELECT a.id,a.mensaje,a.estado,a.respuesta,a.creada FROM operativo_solicitud_atencion a JOIN operativo_socio s ON s.id=a.socio_id WHERE s.telefono=${c.get("sesion").tel} ORDER BY a.creada DESC LIMIT 30` });
  });
  app2.post("/api/atencion", async (c) => {
    if (c.get("sesion").rol !== "socio") return c.json({ error: "Entr\xE1 con tu cuenta." }, 403);
    const r = await c.req.json().catch(() => null);
    if (!r || typeof r.mensaje !== "string" || r.mensaje.trim().length < 5 || r.mensaje.length > 1e3 || typeof r.referencia !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(r.referencia)) return c.json({ error: "Escrib\xED un mensaje de 5 a 1,000 caracteres." }, 422);
    const sql = neon(c.env.DATABASE_URL);
    const [limite] = await sql`SELECT limitar_acceso(${"atencion:" + c.get("sesion").tel},20,3600) AS ok`;
    if (!limite.ok) return c.json({ error: "Recibimos varias solicitudes. Esper\xE1 antes de enviar otra." }, 429);
    const [solicitud] = await sql`INSERT INTO solicitud_atencion(socio_id,referencia,mensaje) SELECT id,${r.referencia}::uuid,${r.mensaje.trim()} FROM operativo_socio WHERE telefono=${c.get("sesion").tel} AND baja IS NULL ON CONFLICT(socio_id,referencia) DO UPDATE SET referencia=EXCLUDED.referencia RETURNING id,mensaje`;
    if (!solicitud) return c.json({ error: "Cuenta no encontrada." }, 404);
    if (solicitud.mensaje !== r.mensaje.trim()) return c.json({ error: "Esa referencia ya corresponde a otra solicitud." }, 409);
    return c.json({ id: solicitud.id });
  });
  app2.get("/api/operacion/atencion", async (c) => {
    if (c.get("sesion").rol !== "casa" || c.get("permiso") === "cocina") return c.json({ error: "Acceso exclusivo de caja." }, 403);
    const sql = neon(c.env.DATABASE_URL);
    return c.json({ solicitudes: await sql`SELECT a.id,a.mensaje,a.creada,s.nombre FROM operativo_solicitud_atencion a JOIN operativo_socio s ON s.id=a.socio_id WHERE a.estado='pendiente' ORDER BY a.creada LIMIT 100` });
  });
  app2.post("/api/operacion/atencion/:id/responder", async (c) => {
    if (c.get("sesion").rol !== "casa" || c.get("permiso") === "cocina") return c.json({ error: "Acceso exclusivo de caja." }, 403);
    const r = await c.req.json().catch(() => null), id = c.req.param("id");
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(id) || !r || typeof r.respuesta !== "string" || r.respuesta.trim().length < 5 || r.respuesta.length > 1e3) return c.json({ error: "Escrib\xED la resoluci\xF3n de la solicitud." }, 422);
    const sql = neon(c.env.DATABASE_URL), quien = c.get("sesion").empleado ?? "propietario";
    const [cambio] = await sql`WITH cambio AS (UPDATE operativo_solicitud_atencion SET estado='resuelta',respuesta=${r.respuesta.trim()},resuelta=now(),resuelta_por=${quien} WHERE id=${id}::uuid AND estado='pendiente' RETURNING socio_id), aviso AS (INSERT INTO aviso_cliente(socio_id,referencia,texto) SELECT socio_id,${"atencion:" + id},${"La casa respondi\xF3: " + r.respuesta.trim()} FROM cambio), log AS (INSERT INTO auditoria(quien,accion,socio_id,detalle) SELECT ${quien},'resolver_atencion',socio_id,jsonb_build_object('solicitud',${id}::text) FROM cambio) SELECT socio_id FROM cambio`;
    return cambio ? c.json({ resuelta: true }) : c.json({ error: "La solicitud ya fue resuelta o no existe." }, 409);
  });
}

// club-lupita/src/data/menu.ts
var CARTA = [
  { id: "espresso", nombre: "Espresso", descripcion: "Treinta mililitros del Aguacatal, la ladera de la familia. Veintis\xE9is segundos, crema espesa, panela.", precio: 8e3, categoria: "bebidas-calientes", momento: "barra", foto: null, popular: false, etiquetas: [], perfil: "CORTO \xB7 DENSO \xB7 FINAL PERSISTENTE" },
  { id: "cortadito", nombre: "Cortadito", descripcion: "Un espresso cortado con leche caliente en partes iguales. Baja el filo, no el caf\xE9.", precio: 9e3, categoria: "bebidas-calientes", momento: "barra", foto: null, popular: false, etiquetas: [], perfil: "PARTES IGUALES \xB7 TEMPLADO \xB7 DULCE" },
  { id: "macchiato", nombre: "Macchiato", descripcion: "Mismo espresso, apenas manchado: una cucharada de espuma encima. Se toma en dos sorbos.", precio: 9e3, categoria: "bebidas-calientes", momento: "barra", foto: null, popular: false, etiquetas: [], perfil: "FUERTE \xB7 MANCHADO \xB7 ESPUMA ENCIMA" },
  { id: "americano", nombre: "Americano", descripcion: "Espresso alargado con agua caliente. Al abrirse la taza aparece la naranja madura de la finca.", precio: 8500, categoria: "bebidas-calientes", momento: "barra", foto: null, popular: false, etiquetas: [], perfil: "LARGO \xB7 CLARO \xB7 ACIDEZ DE NARANJA" },
  { id: "latte", nombre: "Latte", descripcion: "Leche texturizada al vapor sobre un espresso de Matagalpa. M\xE1s leche que caf\xE9, textura de seda.", precio: 9500, categoria: "bebidas-calientes", momento: "barra", foto: "/images/latte-logo-mesa-960.webp", popular: false, etiquetas: [], perfil: "SEDOSO \xB7 LECHOSO \xB7 CAF\xC9 DE FONDO" },
  { id: "cappuccino", nombre: "Cappuccino", descripcion: "Tercios parejos: espresso, leche y espuma. M\xE1s aire que el latte, m\xE1s caf\xE9 por sorbo.", precio: 9500, categoria: "bebidas-calientes", momento: "barra", foto: null, popular: false, etiquetas: [], perfil: "AIREADO \xB7 TERCIOS PAREJOS \xB7 CAF\xC9 FRANCO" },
  { id: "mocha", nombre: "Mocha", descripcion: "Espresso, chocolate fundido y leche al vapor. El fondo de cacao del grano, subido de tono.", precio: 12e3, categoria: "bebidas-calientes", momento: "barra", foto: null, popular: false, etiquetas: [], perfil: "CACAO \xB7 DULCE \xB7 CUERPO REDONDO" },
  { id: "te-caliente", nombre: "T\xE9 Caliente", descripcion: "La opci\xF3n sin caf\xE9 de la barra. Hoja en infusi\xF3n, agua a punto y no hirviendo.", precio: 1e4, categoria: "bebidas-calientes", momento: "barra", foto: null, popular: false, etiquetas: [], perfil: "HOJA EN INFUSI\xD3N \xB7 FINAL LIMPIO" },
  { id: "iced-americano", nombre: "Iced Americano", descripcion: "Espresso ca\xEDdo directo sobre hielo y agua. El grano se abre en fr\xEDo, m\xE1s c\xEDtrico.", precio: 14e3, categoria: "bebidas-frias", momento: "barra", foto: null, popular: false, etiquetas: [] },
  { id: "iced-latte", nombre: "Iced Latte", descripcion: "Leche fr\xEDa sobre hielo y el espresso encima, sin mezclar. Se revuelve antes del primer sorbo.", precio: 16e3, categoria: "bebidas-frias", momento: "barra", foto: null, popular: false, etiquetas: [] },
  { id: "cremoso-cafe", nombre: "Cremoso de Caf\xE9", descripcion: "Caf\xE9, leche y hielo licuados hasta quedar espeso. Se toma con pajilla ancha, no con cuchara.", precio: 2e4, categoria: "bebidas-frias", momento: "barra", foto: null, popular: false, etiquetas: [] },
  { id: "cremoso-oreo", nombre: "Cremoso de Oreo", descripcion: "El mismo licuado con galleta molida adentro y encima. Textura con grumos, a prop\xF3sito.", precio: 21e3, categoria: "bebidas-frias", momento: "barra", foto: null, popular: false, etiquetas: [] },
  { id: "cremoso-light", nombre: "Cremoso Light", descripcion: "Sin az\xFAcar a\xF1adida. Solo el dulce que trae la leche y el que deja el tueste.", precio: 21e3, categoria: "bebidas-frias", momento: "barra", foto: null, popular: false, etiquetas: [] },
  { id: "limonada-bella-lupita", nombre: "Limonada Bella Lupita", descripcion: "La cl\xE1sica lleva lim\xF3n y hielo. Esta lleva tres frutas, hierbabuena machacada al momento y vaso doble.", precio: 19e3, categoria: "bebidas-frias", momento: "barra", foto: null, popular: false, etiquetas: [], fruta: "De la casa", nota: "Tres frutas, hierbabuena y vaso doble." },
  { id: "limonada-clasica", nombre: "Limonada Cl\xE1sica", descripcion: "Lim\xF3n, hielo y az\xFAcar justa.", precio: 13e3, categoria: "bebidas-frias", momento: "barra", foto: null, popular: false, etiquetas: [], fruta: "Cl\xE1sica", nota: "Lim\xF3n, hielo y az\xFAcar justa." },
  { id: "limonada-hierbabuena", nombre: "Limonada Hierbabuena", descripcion: "Hoja machacada, verde y con filo.", precio: 14e3, categoria: "bebidas-frias", momento: "barra", foto: null, popular: false, etiquetas: [], fruta: "Hierbabuena", nota: "Hoja machacada, verde y con filo." },
  { id: "limonada-mango", nombre: "Limonada Mango", descripcion: "Pulpa de mango maduro, densa y amarilla.", precio: 17e3, categoria: "bebidas-frias", momento: "barra", foto: null, popular: false, etiquetas: [], fruta: "Mango", nota: "Pulpa de mango maduro, densa y amarilla." },
  { id: "limonada-pitahaya", nombre: "Limonada Pitahaya", descripcion: "Color fucsia, sabor suave, semillas que crujen.", precio: 15e3, categoria: "bebidas-frias", momento: "barra", foto: null, popular: false, etiquetas: [], fruta: "Pitahaya", nota: "Color fucsia, sabor suave, semillas que crujen." },
  { id: "limonada-fresa", nombre: "Limonada Fresa", descripcion: "Fresa madura, dulce contra el \xE1cido del lim\xF3n.", precio: 17e3, categoria: "bebidas-frias", momento: "barra", foto: null, popular: false, etiquetas: [], fruta: "Fresa", nota: "Fresa madura, dulce contra el \xE1cido del lim\xF3n." },
  { id: "limonada-sandia-menta", nombre: "Limonada Sand\xEDa Menta", descripcion: "Sand\xEDa jugosa, menta que enfr\xEDa al final.", precio: 17e3, categoria: "bebidas-frias", momento: "barra", foto: null, popular: false, etiquetas: [], fruta: "Sand\xEDa y menta", nota: "Sand\xEDa jugosa, menta que enfr\xEDa al final." },
  { id: "limonada-maracuya", nombre: "Limonada de Calala", descripcion: "Calala colada, \xE1cida y perfumada.", precio: 17e3, categoria: "bebidas-frias", momento: "barra", foto: null, popular: false, etiquetas: [], fruta: "Maracuy\xE1", nota: "Calala colada, \xE1cida y perfumada." },
  { id: "gaseosa", nombre: "Gaseosa", descripcion: "Bien fr\xEDa, para el que no toma caf\xE9.", precio: 6e3, categoria: "gaseosas", momento: "barra", foto: null, popular: false, etiquetas: [] },
  { id: "agua", nombre: "Agua", descripcion: "Agua pura, fr\xEDa o al tiempo. Decinos c\xF3mo la quer\xE9s.", precio: 6e3, categoria: "gaseosas", momento: "barra", foto: null, popular: false, etiquetas: [] },
  { id: "soda", nombre: "Soda", descripcion: "Agua con gas y hielo. Limpia el paladar entre bocados.", precio: 6e3, categoria: "gaseosas", momento: "barra", foto: null, popular: false, etiquetas: [] },
  { id: "arancini", nombre: "Arancini", descripcion: "Croquetas de risotto inspiradas en el gallo pinto, doradas al momento y servidas con salsa Nikkei.", precio: 22e3, categoria: "entradas", momento: "bistro", foto: "/menu/arancini-01-960.webp", popular: false, etiquetas: ["croquetas", "gallo pinto", "Nikkei"] },
  { id: "bocado-queso-platano", nombre: "Bocado de Queso & Pl\xE1tano", descripcion: "Crujientes tajadas de pl\xE1tano verde con queso artesanal dorado y un toque de chile criollo.", precio: 34e3, categoria: "entradas", momento: "bistro", foto: null, popular: false, etiquetas: ["pl\xE1tano", "queso", "chile"] },
  { id: "chilotes-milpa", nombre: "Chilotes de la Milpa", descripcion: "Chilotes asados al carb\xF3n, marinados en especias y servidos con alioli de chipotle ahumado.", precio: 32e3, categoria: "entradas", momento: "bistro", foto: "/menu/chilotes-de-la-milpa-01-960.webp", popular: false, etiquetas: ["chilote", "chipotle", "carb\xF3n"] },
  { id: "carpaccio-camaron", nombre: "Carpaccio de Camar\xF3n", descripcion: "L\xE1minas de camar\xF3n en leche de tigre de calalt\xE1, cebolla encurtida, cilantro y tajadas de pl\xE1tano verde.", precio: 58e3, categoria: "entradas", momento: "bistro", foto: "/menu/carpaccio-de-camaron-01-960.webp", popular: false, etiquetas: ["camar\xF3n", "leche de tigre", "pl\xE1tano"] },
  { id: "carpaccio-pesca", nombre: "Carpaccio de la Pesca del D\xEDa", descripcion: "Pesca del d\xEDa curada en c\xEDtricos, salsa Nikkei, hierbas frescas y un sutil toque ahumado.", precio: 4e4, categoria: "entradas", momento: "bistro", foto: "/menu/carpaccio-de-la-pesca-del-dia-01-960.webp", popular: false, etiquetas: ["pesca", "c\xEDtricos", "Nikkei"] },
  { id: "spring-roll", nombre: "Spring Roll", descripcion: "Rollos rellenos de vegetales frescos, fritos al momento y servidos con salsa oriental.", precio: 25e3, categoria: "entradas", momento: "bistro", foto: "/menu/spring-roll-01-960.webp", popular: false, etiquetas: ["vegetales", "salsa oriental"] },
  { id: "baba-ganoush", nombre: "Baba Ganoush", descripcion: "Crema de berenjena tatemada con pan artesanal, aceitunas, alcaparras, tomates cherry y morrones.", precio: 46e3, categoria: "entradas", momento: "bistro", foto: "/menu/baba-ganoush-01-960.webp", popular: true, etiquetas: ["berenjena", "pan", "aceitunas"] },
  { id: "bowl-terru\xF1o", nombre: "Bowl del Terru\xF1o", descripcion: "Pollo soasado con arroz, frijoles, tajadas verdes, maduro, queso frito, aguacate y pico de gallo.", precio: 65e3, categoria: "bowls", momento: "bistro", foto: "/menu/bowl-del-terruno-01-960.webp", popular: false, etiquetas: ["pollo", "arroz", "aguacate"] },
  { id: "bowl-lupita", nombre: "Bowl Lupita", descripcion: "Gallo pinto con carne sazonada, queso frito, maduro, tajadas verdes, guacamole y pico de gallo.", precio: 7e4, categoria: "bowls", momento: "bistro", foto: "/menu/bowl-lupita-01-960.webp", popular: true, etiquetas: ["gallo pinto", "carne", "guacamole"] },
  { id: "pizza-churrasco", nombre: "Pizza Churrasco", descripcion: "Churrasco a la parrilla, mozzarella artesanal y chimichurri de la casa.", precio: 67e3, categoria: "pizzas", momento: "bistro", foto: "/menu/pizza-churrasco-01-960.webp", popular: true, etiquetas: ["churrasco", "mozzarella", "chimichurri"] },
  { id: "pizza-margherita", nombre: "Pizza Margherita", descripcion: "Salsa pomodoro, mozzarella fresca, tomate y albahaca sobre masa madre.", precio: 45e3, categoria: "pizzas", momento: "bistro", foto: "/menu/pizza-margarita-01-960.webp", popular: false, etiquetas: ["tomate", "mozzarella", "albahaca"] },
  { id: "pizza-cuatro-estaciones", nombre: "Pizza Cuatro Estaciones", descripcion: "Una combinaci\xF3n de ingredientes frescos que re\xFAne cuatro sabores en una sola pizza.", precio: 55e3, categoria: "pizzas", momento: "bistro", foto: "/menu/pizza-4-estacion-01-960.webp", popular: false, etiquetas: ["cuatro estaciones", "mozzarella"] },
  { id: "pizza-jamon", nombre: "Pizza de Jam\xF3n", descripcion: "Jam\xF3n premium, mozzarella artesanal y salsa pomodoro.", precio: 45e3, categoria: "pizzas", momento: "bistro", foto: "/menu/pizza-jamon-tradicional-01-960.webp", popular: false, etiquetas: ["jam\xF3n", "mozzarella", "pomodoro"] },
  { id: "pizza-pepperoni", nombre: "Pizza de Pepperoni", descripcion: "Mozzarella artesanal y abundante pepperoni sobre salsa pomodoro.", precio: 45e3, categoria: "pizzas", momento: "bistro", foto: "/menu/pizza-peperoni-01-960.webp", popular: false, etiquetas: ["pepperoni", "mozzarella", "pomodoro"] },
  { id: "pizza-caprichosa", nombre: "Pizza Caprichosa", descripcion: "Trozos de pollo jugoso, pepperoni, aceitunas y mozzarella artesanal.", precio: 6e4, categoria: "pizzas", momento: "bistro", foto: null, popular: false, etiquetas: ["pollo", "pepperoni", "aceitunas"] },
  { id: "pizza-arrabiata", nombre: "Pizza Arrabiata", descripcion: "Lomo ahumado, mozzarella, salsa pomodoro y un toque de chile.", precio: 55e3, categoria: "pizzas", momento: "bistro", foto: "/menu/pizza-arrabiata-01-960.webp", popular: false, etiquetas: ["lomo", "chile", "mozzarella"] },
  { id: "pizza-camaron", nombre: "Pizza de Camar\xF3n Especial", descripcion: "Camarones salteados, mozzarella artesanal y vegetales frescos.", precio: 68e3, categoria: "pizzas", momento: "bistro", foto: "/menu/pizza-camaron-01-960.webp", popular: false, etiquetas: ["camar\xF3n", "mozzarella", "vegetales"] },
  { id: "pizza-salami", nombre: "Pizza de Salami", descripcion: "Salami premium, mozzarella artesanal y salsa pomodoro.", precio: 6e4, categoria: "pizzas", momento: "bistro", foto: "/menu/pizza-salami-01-960.webp", popular: false, etiquetas: ["salami", "mozzarella", "pomodoro"] },
  { id: "ensalada-lupita", nombre: "Ensalada Lupita", descripcion: "Mix de lechugas, vegetales frescos, pasta penne, parmesano y aderezo de la casa. Disponible con camar\xF3n, pollo o res.", precio: 64e3, categoria: "ensaladas", momento: "bistro", foto: "/menu/ensalada-lupita-01-960.webp", popular: false, etiquetas: ["lechuga", "penne", "parmesano"] },
  { id: "ensalada-thai", nombre: "Ensalada Thai", descripcion: "Lechugas mixtas, repollo morado, pollo asado, ajonjol\xED, aceitunas y vinagreta oriental.", precio: 47e3, categoria: "ensaladas", momento: "bistro", foto: "/menu/ensalada-tais-01-960.webp", popular: false, etiquetas: ["pollo", "ajonjol\xED", "oriental"] },
  { id: "ensalada-caesar", nombre: "Ensalada Caesar", descripcion: "Lechuga romana, pollo crujiente, parmesano, crutones artesanales y aderezo Caesar de la casa.", precio: 45e3, categoria: "ensaladas", momento: "bistro", foto: "/menu/ensalada-cesar-01-960.webp", popular: false, etiquetas: ["pollo", "parmesano", "crutones"] },
  { id: "hamburguesa-autor", nombre: "Hamburguesa de Autor", descripcion: "Carne preparada en casa, mezcla de quesos, lechuga romana, tomate y pan brioche, servida con papas artesanales.", precio: 48e3, categoria: "platos-fuertes", momento: "bistro", foto: null, popular: true, etiquetas: ["carne", "queso", "papas"] },
  { id: "churrasco-mi-tierra", nombre: "Churrasco de Mi Tierra", descripcion: "Corte de res a la parrilla con chimichurri ahumado, gallo pinto, tostones y ensalada primavera.", precio: 8e4, categoria: "platos-fuertes", momento: "bistro", foto: null, popular: true, etiquetas: ["res", "chimichurri", "gallo pinto"] },
  { id: "costillas-bbq", nombre: "Costillas BBQ de la Casa", descripcion: "Costillas de cerdo glaseadas en salsa BBQ artesanal, acompa\xF1adas de platanitos crujientes y pepino fresco.", precio: 54e3, categoria: "platos-fuertes", momento: "bistro", foto: null, popular: false, etiquetas: ["cerdo", "BBQ", "pl\xE1tano"] },
  { id: "salmon-chef", nombre: "Salm\xF3n del Chef La Bella Lupita", descripcion: "Filete de salm\xF3n con pur\xE9 mixto, zucchini asado y salsa de caf\xE9 de especialidad La Bella Lupita.", precio: 83e3, categoria: "platos-fuertes", momento: "bistro", foto: "/menu/salmon-del-chef-la-bella-lupita-01-960.webp", popular: true, etiquetas: ["salm\xF3n", "zucchini", "caf\xE9"] },
  { id: "panini-churrasco", nombre: "Panini Churrasco", descripcion: "Pan artesanal relleno de churrasco, jam\xF3n ahumado, queso fundido, tomate, lechuga y chimichurri.", precio: 53e3, categoria: "paninis", momento: "bistro", foto: "/menu/panini-churrasco-01-960.webp", popular: false, etiquetas: ["churrasco", "jam\xF3n", "queso"] },
  { id: "panini-pesto", nombre: "Panini Pesto", descripcion: "Pollo a la plancha, pesto casero, tomate, lechuga y queso fundido en pan artesanal.", precio: 4e4, categoria: "paninis", momento: "bistro", foto: "/menu/panini-pesto-01-960.webp", popular: false, etiquetas: ["pollo", "pesto", "queso"] },
  { id: "risotto-gallo-pinto", nombre: "Risotto de Gallo Pinto", descripcion: "Tradicional gallo pinto transformado en un cremoso risotto, servido con huevo al gusto, aguacate y tortilla crujiente.", precio: 28e3, categoria: "desayunos", momento: "brunch", foto: "/menu/risoto-gallopinto-01-960.webp", popular: true, etiquetas: ["gallo pinto", "huevo", "aguacate"] },
  { id: "para-empezar-el-dia", nombre: "Para Empezar el D\xEDa", descripcion: "Pan brioche con huevo cremoso, lechuga fresca y papines salteados en mantequilla y hierbas.", precio: 34e3, categoria: "desayunos", momento: "brunch", foto: "/menu/para-empezar-el-dia-01-960.webp", popular: false, etiquetas: ["brioche", "huevo", "papines"] },
  { id: "dulce-tentacion", nombre: "Dulce Tentaci\xF3n", descripcion: "Waffle artesanal con mermelada de fresa casera, chantilly, frutas de temporada, tierra de chocolate y miel de maple.", precio: 32e3, categoria: "desayunos", momento: "brunch", foto: "/menu/waffle-dulce-tentacion-01-960.webp", popular: true, etiquetas: ["waffle", "fresa", "frutas"] },
  { id: "la-bella-lupita", nombre: "La Bella Lupita", descripcion: "Frijoles cremosos sobre queso fundido, acompa\xF1ados de huevo al gusto, aguacate, queso artesanal y tajadas verdes.", precio: 35e3, categoria: "desayunos", momento: "brunch", foto: "/menu/la-bella-lupita-01-960.webp", popular: false, etiquetas: ["frijoles", "huevo", "aguacate"] },
  { id: "nica-toast", nombre: "Nica Toast", descripcion: "Pan brioche caramelizado con compota de frutos rojos y miel.", precio: 3e4, categoria: "desayunos", momento: "brunch", foto: "/menu/nica-toast-01-960.webp", popular: false, etiquetas: ["brioche", "frutos rojos", "miel"] },
  { id: "smoothie-bowl", nombre: "Smoothie Bowl & Frutos de Temporada", descripcion: "Frutas congeladas, jugo de naranja, granola artesanal, frutas frescas y miel.", precio: 27e3, categoria: "desayunos", momento: "brunch", foto: "/menu/smoothie-bowl-01-960.webp", popular: false, etiquetas: ["frutas", "granola", "miel"] },
  { id: "bagel-el-consentido", nombre: "Bagel el Consentido", descripcion: "Bagel con crema de la casa, jam\xF3n, huevos de codorniz, germinados y reducci\xF3n bals\xE1mica.", precio: 4e4, categoria: "desayunos", momento: "brunch", foto: "/menu/bagel-el-consentido-01-960.webp", popular: false, etiquetas: ["bagel", "jam\xF3n", "huevo"] },
  { id: "budin-chia", nombre: "Bud\xEDn de Ch\xEDa", descripcion: "Ch\xEDa en leche de almendra con frutas frescas y un sutil toque de naranja ahumada.", precio: 23e3, categoria: "desayunos", momento: "brunch", foto: "/menu/budin-chia-y-fruto-de-temporada-01-960.webp", popular: false, etiquetas: ["ch\xEDa", "almendra", "frutas"] },
  { id: "pancake-huerta", nombre: "Pancake de la Huerta", descripcion: "Pancakes esponjosos con yogur griego, frutas de temporada y syrup artesanal.", precio: 34e3, categoria: "desayunos", momento: "brunch", foto: null, popular: false, etiquetas: ["pancakes", "yogur", "frutas"] },
  { id: "huevos-poche", nombre: "Huevos Poch\xE9 del Chef", descripcion: "Pan brioche con queso crema, hongos salteados, huevo poch\xE9 y reducci\xF3n bals\xE1mica.", precio: 38e3, categoria: "desayunos", momento: "brunch", foto: null, popular: false, etiquetas: ["brioche", "hongos", "huevo"] },
  { id: "omelette-campesino", nombre: "Omelette Campesino", descripcion: "Omelette de vegetales y queso fundido, servido con ensalada de la huerta y pan artesanal.", precio: 38e3, categoria: "desayunos", momento: "brunch", foto: null, popular: false, etiquetas: ["huevo", "vegetales", "queso"] },
  { id: "mollete-huerto", nombre: "Mollete del Huerto", descripcion: "Pan brioche con huevo, crema de aguacate, parmesano, brotes y flores comestibles.", precio: 38e3, categoria: "desayunos", momento: "brunch", foto: null, popular: false, etiquetas: ["brioche", "aguacate", "parmesano"] },
  { id: "waffle-bistro", nombre: "Waffle del Bistr\xF3", descripcion: "Waffle artesanal con jam\xF3n curado, salsa pomodoro, queso fundido y reducci\xF3n bals\xE1mica.", precio: 38e3, categoria: "desayunos", momento: "brunch", foto: null, popular: false, etiquetas: ["waffle", "jam\xF3n", "queso"] },
  { id: "bagel-salmon", nombre: "Bagel de Salm\xF3n", descripcion: "Bagel con salm\xF3n curado, crema de queso y chips de camote.", precio: 43e3, categoria: "desayunos", momento: "brunch", foto: "/menu/bagel-de-salmon-01-960.webp", popular: true, etiquetas: ["bagel", "salm\xF3n", "camote"] },
  { id: "delicias-abuela", nombre: "Delicias de la Abuela", descripcion: "Postre de mango ahumado con el sello dulce de la casa.", precio: 25e3, categoria: "postres", momento: "sobremesa", foto: "/menu/delicia-de-la-abuela-de-mango-ahumado-01-960.webp", popular: false, etiquetas: ["mango", "ahumado"] },
  { id: "torrijas-autor", nombre: "Torrijas de Autor", descripcion: "Torrijas artesanales de la casa, doradas y servidas con una composici\xF3n de temporada.", precio: 3e4, categoria: "postres", momento: "sobremesa", foto: null, popular: false, etiquetas: ["torrijas", "artesanal"] },
  { id: "cheesecake-cafe", nombre: "Cheesecake de Caf\xE9", descripcion: "Cheesecake cremoso con caf\xE9 de especialidad de la casa.", precio: 24e3, categoria: "postres", momento: "sobremesa", foto: null, popular: false, etiquetas: ["cheesecake", "caf\xE9"] },
  { id: "cheesecake-pistacho", nombre: "Cheesecake de Pistacho", descripcion: "Cheesecake cremoso con el sabor delicado del pistacho.", precio: 27e3, categoria: "postres", momento: "sobremesa", foto: null, popular: false, etiquetas: ["cheesecake", "pistacho"] },
  { id: "pastel-chocolate", nombre: "Pastel de Chocolate", descripcion: "Pastel de chocolate de la casa, intenso y reconfortante.", precio: 22e3, categoria: "postres", momento: "sobremesa", foto: null, popular: false, etiquetas: ["pastel", "chocolate"] },
  { id: "tres-leches", nombre: "Tres Leches", descripcion: "Cl\xE1sico pastel tres leches de textura suave y cremosa.", precio: 22e3, categoria: "postres", momento: "sobremesa", foto: null, popular: false, etiquetas: ["pastel", "leche"] },
  { id: "natilla", nombre: "Natilla", descripcion: "Natilla tradicional de la casa, suave y delicada.", precio: 2e4, categoria: "postres", momento: "sobremesa", foto: null, popular: false, etiquetas: ["natilla", "tradicional"] },
  { id: "flan-caramelo", nombre: "Flan de Caramelo", descripcion: "Flan sedoso con caramelo artesanal.", precio: 22e3, categoria: "postres", momento: "sobremesa", foto: null, popular: false, etiquetas: ["flan", "caramelo"] }
];

// club-lupita/src/worker/index.ts
var app = new Hono2();
app.use("*", cabecerasSeguras);
app.use("/api/*", async (c, next) => {
  await next();
  c.res.headers.set("Cache-Control", "no-store");
  c.res.headers.set("X-Content-Type-Options", "nosniff");
  c.res.headers.set("Referrer-Policy", "no-referrer");
  c.res.headers.set("X-Frame-Options", "DENY");
  c.res.headers.set("Strict-Transport-Security", "max-age=31536000");
});
app.use("/api/*", bodyLimit({ maxSize: 16384, onError: (c) => c.json({ error: "La solicitud es demasiado larga." }, 413) }));
app.use("/api/*", async (c, next) => {
  if (["POST", "PUT", "PATCH"].includes(c.req.method)) {
    const cuerpo = await c.req.raw.clone().json().catch(() => null);
    if (!cuerpo || typeof cuerpo !== "object" || Array.isArray(cuerpo)) {
      return c.json({ error: "La solicitud debe contener un objeto JSON v\xE1lido." }, 422);
    }
  }
  await next();
});
var TOTAL_SOCIOS = 100;
var TOTAL_BOLSAS = 150;
var CUOTA_MENSUAL = 95e3;
var SESION_HORAS = 24 * 30;
var CUENTA_DEMO = "50587442005";
var soloDigitos = (s) => String(s ?? "").replace(/\D/g, "");
var conPooler = (url) => url.replace(/@(ep-[^.]+?)(-pooler)?\./, "@$1-pooler.");
var enCasa = (mensaje, codigo = 400) => new Response(JSON.stringify({ error: mensaje }), {
  status: codigo,
  headers: { "content-type": "application/json" }
});
function registrarError(e) {
  const codigo = e && typeof e === "object" && "code" in e ? String(e.code) : "interno";
  console.error(JSON.stringify({ evento: "error_api", codigo, id: crypto.randomUUID() }));
}
async function enTransaccion(c, tel, trabajo, solicitud) {
  neonConfig.webSocketConstructor = globalThis.WebSocket;
  const cli = new Client(conPooler(c.env.DATABASE_URL));
  await cli.connect();
  try {
    await cli.query("BEGIN");
    await cli.query("SET LOCAL statement_timeout = '8s'");
    const { rows: socios } = await cli.query("SELECT id FROM operativo_socio WHERE telefono = $1 AND baja IS NULL FOR UPDATE", [tel]);
    if (!socios.length) {
      await cli.query("ROLLBACK");
      return enCasa("No encontramos esa cuenta.", 404);
    }
    const socioId = socios[0].id;
    if (solicitud) {
      const { rows: recibos } = await cli.query(
        "SELECT operacion, huella, respuesta FROM operativo_solicitud_compra WHERE socio_id=$1 AND referencia=$2",
        [socioId, solicitud.referencia]
      );
      if (recibos.length) {
        await cli.query("ROLLBACK");
        if (recibos[0].operacion !== solicitud.operacion || recibos[0].huella !== solicitud.huella) {
          return enCasa("Esa referencia pertenece a otra operaci\xF3n.", 409);
        }
        return Response.json({ ...recibos[0].respuesta, repetido: true });
      }
    }
    const { rows: s } = await cli.query("SELECT total FROM saldo_de($1)", [socioId]);
    const saldo = Number(s[0]?.total ?? 0);
    const r = await trabajo(cli, socioId, saldo);
    if (r instanceof Response) {
      await cli.query("ROLLBACK");
      return r;
    }
    const { rows: ya } = r.monto > 0 ? await cli.query("SELECT id FROM operativo_asiento WHERE socio_id = $1 AND ref_externa = $2", [socioId, r.ref]) : { rows: [] };
    if (ya.length) {
      await cli.query("ROLLBACK");
      return enCasa("Ese cobro ya estaba hecho. No te cobramos de nuevo.", 409);
    }
    if (r.monto > 0) {
      await cli.query(
        "INSERT INTO asiento (socio_id, monto, tipo, concepto, ref_externa) VALUES ($1, $2, 'consumo', $3, $4)",
        [socioId, -r.monto, r.concepto, r.ref]
      );
      await cli.query(
        "INSERT INTO auditoria (quien, accion, socio_id, monto, detalle) VALUES ('api', 'compra', $1, $2, $3::jsonb)",
        [socioId, -r.monto, JSON.stringify({ ref: r.ref })]
      );
    }
    const { rows: fin } = await cli.query("SELECT * FROM saldo_de($1)", [socioId]);
    const respuesta = { ...r.datos, cobrado: r.monto, saldo: fin[0] };
    if (solicitud) {
      await cli.query(
        "INSERT INTO solicitud_compra(socio_id, referencia, operacion, huella, respuesta) VALUES ($1,$2,$3,$4,$5::jsonb)",
        [socioId, solicitud.referencia, solicitud.operacion, solicitud.huella, JSON.stringify(respuesta)]
      );
    }
    await cli.query("COMMIT");
    return Response.json(respuesta);
  } catch (e) {
    await cli.query("ROLLBACK").catch(() => {
    });
    registrarError(e);
    const codigo = String(e?.code ?? "");
    if (codigo === "57014" || codigo === "55P03") return Response.json({ error: solicitud ? "La operaci\xF3n est\xE1 ocupada. Reintent\xE1 conservando la misma referencia de compra." : "La operaci\xF3n est\xE1 ocupada. Revis\xE1 el estado antes de volver a intentar." }, { status: 503, headers: { "Retry-After": "2" } });
    const msg = String(e.message ?? "");
    if (msg.includes("reserva_sin_solape")) {
      return enCasa("El Sal\xF3n VIP ya est\xE1 tomado a esa hora. Prob\xE1 otra, o te avisamos apenas se libere.", 409);
    }
    return enCasa("Algo se nos quem\xF3 del lado de la cocina. No es culpa tuya. Ya lo estamos viendo.", 500);
  } finally {
    c.executionCtx.waitUntil(cli.end());
  }
}
var faltan = (cuanto) => enCasa(
  `Te faltan C$ ${(cuanto / 100).toLocaleString("es-NI")} en la Cuenta de Casa. Dej\xE1 saldo o complet\xE1 en el mostrador.`,
  409
);
async function llaveDeSolicitud(c) {
  const cuerpo = await c.req.json().catch(() => ({}));
  const ref = typeof cuerpo.ref === "string" ? cuerpo.ref.trim() : "";
  return /^[A-Za-z0-9_-]{8,64}$/.test(ref) ? "sol:" + ref : null;
}
var ABIERTAS = [
  "/api/health",
  "/api/cupos",
  "/api/catalogo",
  "/api/ocupacion",
  "/api/auth/codigo",
  "/api/auth/correo/codigo",
  "/api/auth/correo/verificar",
  "/api/auth/correo/registro",
  "/api/auth/entrar",
  "/api/auth/casa",
  "/api/panel",
  "/api/auth/personal",
  "/api/capacidades"
];
app.use("/api/*", async (c, next) => {
  c.set("basePropietario", c.env.DATABASE_URL);
  const equipoPublico = c.req.path.startsWith("/api/auth/equipo/");
  const cookie = tokenEquipo(c);
  const esEquipo = equipoPublico || !!cookie || c.req.path.startsWith("/api/personal/");
  if (esEquipo && !origenEquipo(c)) return c.json({ error: "La solicitud de acceso debe realizarse desde la aplicaci\xF3n." }, 403);
  const bearer = c.req.header("authorization")?.replace(/^Bearer\s+/i, "");
  const socio = await verificar(c.env.SESION_SECRETO, bearer);
  let demo = false;
  if (equipoPublico) {
    if (c.req.method === "GET") demo = c.req.query("entorno") === "capacitacion";
    else demo = (await c.req.json())?.demo === true;
  } else if (cookie) demo = cookie.startsWith("d.");
  else if (["/api/auth/codigo", "/api/auth/entrar"].includes(c.req.path)) demo = telefonoNormalizado((await c.req.json()).telefono) === CUENTA_DEMO;
  else demo = socio?.rol === "socio" && socio.tel === CUENTA_DEMO;
  if (c.req.path.startsWith("/api/auth/correo/")) demo = false;
  c.set("equipoDemo", demo);
  if (demo) {
    if (!c.env.DEMO_DATABASE_URL) return c.json({ error: "La capacitaci\xF3n est\xE1 en mantenimiento." }, 503);
    const real = new URL(c.env.DATABASE_URL), prueba = new URL(c.env.DEMO_DATABASE_URL);
    if (real.hostname.replace("-pooler", "") === prueba.hostname.replace("-pooler", "") && real.pathname === prueba.pathname) return c.json({ error: "La capacitaci\xF3n est\xE1 en mantenimiento." }, 503);
    c.env = { ...c.env, DATABASE_URL: c.env.DEMO_DATABASE_URL };
  }
  if (equipoPublico || ABIERTAS.includes(c.req.path)) return next();
  if (cookie) {
    const p = await cargarSesion(c, cookie);
    if (!p) return c.json({ error: "Tu sesi\xF3n termin\xF3. Ingres\xE1 nuevamente." }, 401);
    if (c.req.method !== "GET" && c.req.header("x-equipo-csrf") !== p.csrf) return c.json({ error: "Actualiz\xE1 la p\xE1gina para continuar." }, 403);
    c.set("personal", p);
    c.set("permiso", p.permiso);
    c.set("empleadoNombre", p.nombre);
    c.set("empleadoUsuario", p.usuario);
    c.set("requiereCambio", p.requiere_cambio);
    c.set("claveCambiada", p.clave_cambiada);
    c.set("sesion", { rol: "casa", tel: "", empleado: p.empleado_id, exp: Date.parse(p.vence), demo, versionClave: p.version_clave });
    const cuenta = c.req.path.startsWith("/api/personal/");
    const basicas = ["/api/personal/yo", "/api/personal/salir"];
    const permitidas = p.fase === "mfa" ? ["/api/personal/mfa/verificar"] : p.fase === "clave" ? ["/api/personal/clave"] : p.fase === "configurar" ? ["/api/personal/mfa/preparar", "/api/personal/mfa/confirmar"] : [];
    if (p.fase !== "completa" && !basicas.includes(c.req.path) && !permitidas.includes(c.req.path)) return c.json({ error: "Complet\xE1 la verificaci\xF3n de tu cuenta antes de continuar.", fase: p.fase }, 403);
    if (p.fase === "completa" && (p.inactiva || p.bloqueada) && ![...basicas, "/api/personal/revalidar", "/api/personal/bloquear"].includes(c.req.path)) return c.json({ error: "Tu acceso est\xE1 bloqueado. Confirm\xE1 tu identidad.", bloqueada: true }, 423);
    if (p.fase === "completa" && (p.permiso === "propietario" || p.permiso === "encargado") && (!p.mfa_secreto || !p.fuerte)) return c.json({ error: "Verific\xE1 tu segundo factor para continuar." }, 401);
    if (p.permiso === "cocina" && !cuenta && !["/api/operacion/pedidos", "/api/operacion/listas/pedidos"].includes(c.req.path) && !/^\/api\/operacion\/pedidos\/[a-f0-9-]+\/estado$/.test(c.req.path)) return c.json({ error: "Tu acceso es solo para preparaci\xF3n de pedidos." }, 403);
    return next();
  }
  if (!socio || socio.rol !== "socio") return c.json({ error: "Tu sesi\xF3n termin\xF3. Ingres\xE1 nuevamente." }, 401);
  c.set("sesion", socio);
  const sql = neon(c.env.DATABASE_URL), [activo] = await sql`SELECT id FROM operativo_socio WHERE telefono=${socio.tel} AND baja IS NULL`;
  if (!activo) return c.json({ error: "Tu cuenta ya no est\xE1 activa. Contact\xE1 con la casa." }, 401);
  if (c.req.path.startsWith("/api/personal/")) return c.json({ error: "Acceso exclusivo del equipo." }, 403);
  await next();
});
registrarAccesoEquipo(app);
registrarOperacion(app);
registrarMostrador(app);
registrarPanel(app);
registrarClientes(app);
registrarAtencion(app);
registrarAcceso(app);
registrarAccesoCorreo(app);
app.get("/api/capacidades", (c) => c.json({ accesoCorreo: correoHabilitado(c.env), accesoPersonal: c.env.ACCESO_PERSONAL === "true" && !!c.env.OTP_SERVICE, canal: correoHabilitado(c.env) ? "correo electr\xF3nico" : c.env.CANAL_OTP ?? "c\xF3digo de acceso", operacion: true }));
app.post("/api/auth/casa", (c) => c.json({ error: "Us\xE1 el acceso individual del equipo." }, 410));
app.post("/api/auth/personal", (c) => c.json({ error: "Us\xE1 el acceso individual del equipo." }, 410));
app.get("/api/health", (c) => c.json({ ok: true, casa: "La Bella Lupita", hora: (/* @__PURE__ */ new Date()).toISOString() }));
app.get("/api/cupos", async (c) => {
  const sql = neon(c.env.DATABASE_URL);
  const socios = await plazasOcupadas(c.env.DATABASE_URL);
  const [bolsas] = await sql`SELECT count(*)::int AS n FROM reserva_cosecha WHERE apartada IS NULL`;
  const experiencias = await sql`
    SELECT e.id, e.cupos, e.cupos - count(a.id)::int AS libres
    FROM experiencia e LEFT JOIN operativo_asiento_experiencia a ON a.experiencia_id = e.id
    GROUP BY e.id, e.cupos`;
  const porId = {};
  for (const e of experiencias) porId[e.id] = { cupos: Number(e.cupos), libres: Number(e.libres) };
  return c.json({
    sociosFundadores: TOTAL_SOCIOS - (socios?.n ?? 0),
    bolsasReserva: bolsas?.n ?? 0,
    mesaTostador: porId["mesa-tostador"]?.libres ?? 0,
    experiencias: porId
  });
});
app.get("/api/catalogo", async (c) => {
  const sql = neon(c.env.DATABASE_URL);
  const experiencias = await sql`
    SELECT e.id, e.nombre, e.cuando, e.precio, e.cupos,
           e.cupos - count(a.id)::int AS libres
    FROM experiencia e LEFT JOIN operativo_asiento_experiencia a ON a.experiencia_id = e.id
    WHERE e.cuando > now()
    GROUP BY e.id, e.nombre, e.cuando, e.precio, e.cupos
    ORDER BY e.cuando`;
  const [bolsa] = await sql`
    SELECT min(precio)::int AS precio,
           count(*) FILTER (WHERE apartada IS NULL)::int AS quedan,
           max(generacion) AS generacion
    FROM reserva_cosecha`;
  return c.json({
    experiencias: experiencias.map((e) => ({
      id: e.id,
      nombre: e.nombre,
      cuando: e.cuando,
      precio: Number(e.precio),
      cupos: Number(e.cupos),
      libres: Number(e.libres)
    })),
    bolsa: {
      precio: Number(bolsa?.precio ?? 0),
      quedan: Number(bolsa?.quedan ?? 0),
      total: TOTAL_BOLSAS,
      generacion: bolsa?.generacion ?? null
    },
    membresia: { cuota: CUOTA_MENSUAL, total: TOTAL_SOCIOS },
    zonas: ZONAS
  });
});
registrarCuentaCliente(app);
app.get("/api/yo", async (c) => {
  const tel = c.get("sesion").tel;
  const sql = neon(c.env.DATABASE_URL);
  const [socio] = await sql`
    SELECT id, telefono, nombre, creado, bebida_siempre, alergias, cumple FROM operativo_socio WHERE telefono = ${tel} AND baja IS NULL`;
  if (!socio) return enCasa("No encontramos esa cuenta.", 404);
  await sql`SELECT mantener_membresia(${socio.id})`;
  const sellos = await sql`
    SELECT s.n, s.motivo, s.barista, s.puesto
    FROM operativo_sello s JOIN operativo_tanda t ON t.id = s.tanda_id
    WHERE t.socio_id = ${socio.id} AND t.cerrada IS NULL ORDER BY s.n`;
  const [saldo] = await sql`SELECT * FROM saldo_de(${socio.id})`;
  const [membresia] = await sql`
    SELECT numero, estado, hasta, cuota,
           (autorenueva AND renovacion_consentida IS NOT NULL) AS autorenueva
    FROM operativo_membresia
    WHERE socio_id = ${socio.id} AND estado IN ('activa', 'en_gracia') AND hasta > now()`;
  const movimientos = await sql`
    SELECT id, monto, tipo, concepto, creado FROM operativo_asiento
    WHERE socio_id = ${socio.id} ORDER BY creado DESC LIMIT 40`;
  const [tandas] = await sql`
    SELECT count(*)::int AS n FROM operativo_tanda WHERE socio_id = ${socio.id} AND canjeada IS NOT NULL`;
  const [pendientes] = await sql`
    SELECT count(*)::int AS n FROM operativo_tanda
    WHERE socio_id=${socio.id} AND cerrada IS NOT NULL AND canjeada IS NULL`;
  const [puntaje] = await sql`SELECT puntos,nivel_nombre,siguiente_nombre,faltan,avance FROM puntaje WHERE socio_id=${socio.id}`;
  const topes = membresia ? await sql`
        SELECT clase, max(ventana)::text AS ventana FROM operativo_beneficio_uso b
        JOIN operativo_membresia m ON m.id = b.membresia_id
        WHERE m.socio_id = ${socio.id}
          AND b.ventana = CASE b.clase
            WHEN 'bebida_dia' THEN (now() AT TIME ZONE 'America/Managua')::date
            ELSE date_trunc('month', now() AT TIME ZONE 'America/Managua')::date
          END
        GROUP BY clase` : [];
  const porClase = {};
  for (const t of topes) porClase[t.clase] = t.ventana;
  const [valeVivo] = await sql`
    SELECT codigo, vence FROM operativo_vale
    WHERE socio_id = ${socio.id} AND usado IS NULL AND vence > now()
    ORDER BY emitido DESC LIMIT 1`;
  return c.json({
    socio,
    vale: valeVivo ?? null,
    sellos,
    saldo,
    membresia: membresia ?? null,
    movimientos,
    tandasCerradas: tandas?.n ?? 0,
    premiosPendientes: pendientes?.n ?? 0,
    puntaje: puntaje ?? null,
    bebidaDelDia: porClase["bebida_dia"] ?? null,
    bolsaDelMes: porClase["bolsa_mes"] ?? null
  });
});
app.post("/api/tanda/sellar", async (c) => {
  const sesion = c.get("sesion");
  if (sesion.rol !== "casa") {
    return enCasa("Los sellos los pone la barra. Mostr\xE1 tu c\xF3digo en el mostrador.", 403);
  }
  const cuerpo = await c.req.json().catch(() => ({}));
  const tel = soloDigitos(cuerpo.telefono) || sesion.tel;
  const { motivo, ticket } = cuerpo;
  if (typeof ticket !== "string" || ticket.trim().length < 4 || motivo !== void 0 && typeof motivo !== "string" || cuerpo.telefono !== void 0 && typeof cuerpo.telefono !== "string") {
    return enCasa("Falta el ticket de caja: sin \xE9l no podemos garantizar que el sello no se ponga dos veces.", 422);
  }
  return transaccion(c.env, async (cli) => {
    const { rows: [socio] } = await cli.query("SELECT id FROM operativo_socio WHERE telefono=$1 AND baja IS NULL FOR UPDATE", [tel]);
    if (!socio) return enCasa("No encontramos esa cuenta.", 404);
    await cli.query("INSERT INTO tanda(socio_id) VALUES($1) ON CONFLICT DO NOTHING", [socio.id]);
    const { rows: [tanda] } = await cli.query("SELECT id FROM operativo_tanda WHERE socio_id=$1 AND cerrada IS NULL", [socio.id]);
    if (!tanda) return enCasa("No hay tanda abierta.", 409);
    const { rows: [puesto] } = await cli.query(`INSERT INTO sello(tanda_id,n,motivo,ref_externa,barista)
      SELECT $1,COALESCE(max(n),0)+1,$2,$3,$4 FROM operativo_sello WHERE tanda_id=$1
      HAVING COALESCE(max(n),0)<9 ON CONFLICT DO NOTHING RETURNING n`, [tanda.id, String(motivo ?? "Visita"), String(ticket), sesion.empleado ?? "propietario"]);
    const { rows: [cuenta] } = await cli.query("SELECT count(*)::int AS n FROM operativo_sello WHERE tanda_id=$1", [tanda.id]);
    if (cuenta.n >= 9) await cli.query("UPDATE operativo_tanda SET cerrada=now() WHERE id=$1 AND cerrada IS NULL", [tanda.id]);
    return c.json({ sellos: cuenta.n, nuevo: puesto?.n ?? null, cerrada: cuenta.n >= 9 });
  });
});
app.post("/api/tanda/canjear", async (c) => {
  const tel = c.get("sesion").tel;
  neonConfig.webSocketConstructor = globalThis.WebSocket;
  const cli = new Client(conPooler(c.env.DATABASE_URL));
  await cli.connect();
  try {
    await cli.query("BEGIN");
    await cli.query("SET LOCAL statement_timeout = '8s'");
    const { rows: socios } = await cli.query("SELECT id FROM operativo_socio WHERE telefono = $1 AND baja IS NULL FOR UPDATE", [tel]);
    if (!socios.length) {
      await cli.query("ROLLBACK");
      return enCasa("No encontramos esa cuenta.", 404);
    }
    const socioId = socios[0].id;
    const { rows: t } = await cli.query(
      `SELECT t.id FROM operativo_tanda t
       WHERE t.socio_id = $1 AND t.cerrada IS NOT NULL AND t.canjeada IS NULL
       ORDER BY t.cerrada LIMIT 1 FOR UPDATE`,
      [socioId]
    );
    if (!t.length) {
      await cli.query("ROLLBACK");
      return enCasa("Todav\xEDa no hay tanda cerrada. Te faltan sellos para la d\xE9cima.", 409);
    }
    const { rows: vivo } = await cli.query(
      "SELECT codigo, vence FROM operativo_vale WHERE tanda_id=$1 AND usado IS NULL AND vence > now()",
      [t[0].id]
    );
    if (vivo.length) {
      await cli.query("COMMIT");
      return c.json({ codigo: vivo[0].codigo, vence: Math.max(0, Math.ceil((new Date(vivo[0].vence).getTime() - Date.now()) / 1e3)) });
    }
    const alfabeto = "23456789BCDFGHJKLMNPQRSTVWXZ";
    const bytes = new Uint8Array(8);
    crypto.getRandomValues(bytes);
    const codigo = Array.from(bytes, (b) => alfabeto[b % alfabeto.length]).join("");
    await cli.query(
      `INSERT INTO vale (codigo, tanda_id, socio_id, vence) VALUES ($1, $2, $3, now() + interval '90 seconds')
       ON CONFLICT (tanda_id) DO UPDATE SET codigo=EXCLUDED.codigo, emitido=now(), vence=EXCLUDED.vence
       WHERE vale.usado IS NULL`,
      [codigo, t[0].id, socioId]
    );
    await cli.query(
      "INSERT INTO auditoria (quien, accion, socio_id, detalle) VALUES ('api', 'canje', $1, $2::jsonb)",
      [socioId, JSON.stringify({ codigo })]
    );
    await cli.query("COMMIT");
    return c.json({ codigo, vence: 90 });
  } catch (e) {
    await cli.query("ROLLBACK").catch(() => {
    });
    registrarError(e);
    return enCasa("Algo se nos quem\xF3 del lado de la cocina. No es culpa tuya. Ya lo estamos viendo.", 500);
  } finally {
    c.executionCtx.waitUntil(cli.end());
  }
});
app.post("/api/vale/quemar", async (c) => {
  if (c.get("sesion").rol !== "casa") return enCasa("Los vales los quema la barra.", 403);
  const { codigo } = await c.req.json();
  const sql = neon(c.env.DATABASE_URL);
  const cod2 = String(codigo ?? "").toUpperCase();
  const [titular] = await sql`SELECT s.telefono FROM operativo_vale v JOIN operativo_socio s ON s.id=v.socio_id WHERE v.codigo=${cod2}`;
  if (!titular) return enCasa("Ese vale no sirve: o ya se us\xF3, o se enfri\xF3.", 409);
  return enTransaccion(c, String(titular.telefono), async (cli) => {
    const { rows: vales } = await cli.query(
      "UPDATE operativo_vale SET usado=now() WHERE codigo=$1 AND usado IS NULL AND vence>now() RETURNING codigo,tanda_id",
      [cod2]
    );
    if (!vales.length) return enCasa("Ese vale no sirve: o ya se us\xF3, o se enfri\xF3.", 409);
    await cli.query("UPDATE operativo_tanda SET canjeada=now() WHERE id=$1", [vales[0].tanda_id]);
    await cli.query("INSERT INTO auditoria(quien,accion,detalle) VALUES($1,'entrega_vale',$2::jsonb)", [c.get("sesion").empleado ?? "propietario", JSON.stringify({ tanda: vales[0].tanda_id })]);
    return { monto: 0, concepto: "", ref: "", datos: { quemado: true, codigo: cod2 } };
  });
});
var TRAMOS = [
  { monto: 2e5, bono: 24e3 },
  { monto: 1e5, bono: 1e4 },
  { monto: 5e4, bono: 4e3 }
];
app.post("/api/cuenta/recargar", async (c) => {
  const sesion = c.get("sesion");
  if (sesion.rol !== "casa") {
    return enCasa("La recarga se hace en el mostrador, con efectivo o con tarjeta.", 403);
  }
  const { monto, ref, telefono } = await c.req.json();
  const tel = typeof telefono === "string" ? soloDigitos(telefono) : "";
  if (!tel) return enCasa("Decinos a qu\xE9 cuenta va la recarga.", 422);
  if (typeof monto !== "number" || !Number.isInteger(monto)) return enCasa("El monto debe ser un n\xFAmero entero de centavos.", 422);
  const cent = monto;
  if (cent < 2e4 || cent > 3e5) {
    return enCasa("El monto tiene que estar entre C$ 200 y C$ 3,000.");
  }
  const bono = TRAMOS.find((t) => cent >= t.monto)?.bono ?? 0;
  if (typeof ref !== "string" || !/^[A-Za-z0-9_-]{8,64}$/.test(ref)) {
    return enCasa("Falta una referencia de caja v\xE1lida para identificar la recarga.", 422);
  }
  const marca = "recarga:" + ref;
  return enTransaccion(c, tel, async (cli, socioId) => {
    const { rows: hoy } = await cli.query(
      `SELECT COALESCE(SUM(monto),0)::int AS n FROM operativo_asiento
       WHERE socio_id=$1 AND tipo IN ('recarga','bono') AND creado>now()-interval '24 hours'`,
      [socioId]
    );
    if (Number(hoy[0].n) + cent + bono > 6e5) return enCasa("Llegaste al tope de recargas de hoy. Ma\xF1ana seguimos.", 429);
    await cli.query(
      "INSERT INTO asiento(socio_id,monto,tipo,concepto,ref_externa) VALUES ($1,$2,'recarga','Recarga',$3)",
      [socioId, cent, marca]
    );
    if (bono > 0) await cli.query(
      "INSERT INTO asiento(socio_id,monto,tipo,concepto,ref_externa) VALUES ($1,$2,'bono','La casa puso',$3)",
      [socioId, bono, marca + ":bono"]
    );
    await cli.query(
      "INSERT INTO auditoria(quien,accion,socio_id,monto,detalle) VALUES ($4,'recarga',$1,$2,$3::jsonb)",
      [socioId, cent, JSON.stringify({ bono, ref: marca }), sesion.empleado ?? "propietario"]
    );
    return { monto: 0, concepto: "", ref: "", datos: { monto: cent, bono } };
  }, { referencia: marca, operacion: "recarga", huella: JSON.stringify({ cent, bono }) });
});
app.post("/api/cuenta/cobrar", async (c) => {
  const sesion = c.get("sesion");
  const cuerpo = await c.req.json();
  if (cuerpo.telefono !== void 0 && typeof cuerpo.telefono !== "string" || cuerpo.concepto !== void 0 && typeof cuerpo.concepto !== "string" || cuerpo.lineas !== void 0 && !Array.isArray(cuerpo.lineas)) {
    return enCasa("Revis\xE1 los datos del pedido.", 422);
  }
  const tel = sesion.rol === "casa" ? soloDigitos(cuerpo.telefono) : sesion.tel;
  if (!tel) return enCasa("Decinos a qu\xE9 cuenta va el cobro.", 422);
  let cent;
  let conceptoFinal = String(cuerpo.concepto ?? "Consumo");
  if (Array.isArray(cuerpo.lineas)) {
    if (cuerpo.lineas.length === 0) return enCasa("El pedido est\xE1 vac\xEDo.");
    if (cuerpo.lineas.length > 40) return enCasa("Ese pedido es demasiado largo para una sola cuenta.");
    let suma = 0;
    const partes = [];
    for (const l of cuerpo.lineas) {
      if (!l || typeof l !== "object") return enCasa("Revis\xE1 los art\xEDculos del pedido.", 422);
      const plato = CARTA.find((p) => p.id === l.id);
      if (!plato) return enCasa(`\xAB${String(l.id)}\xBB no est\xE1 en la carta de hoy.`, 422);
      const cuanto = l.cuanto;
      if (typeof cuanto !== "number" || !Number.isInteger(cuanto) || cuanto < 1 || cuanto > 20) {
        return enCasa(`La cantidad de ${plato.nombre} no nos cuadra.`);
      }
      suma += plato.precio * cuanto;
      partes.push(cuanto > 1 ? `${cuanto}\xD7 ${plato.nombre}` : plato.nombre);
    }
    cent = suma;
    const texto = partes.join(", ");
    conceptoFinal = texto.length <= 120 ? texto : `${partes[0]} y ${partes.length - 1} m\xE1s`;
  } else {
    if (sesion.rol !== "casa") {
      return enCasa("El pedido se cobra por l\xEDneas, no por monto. Actualiz\xE1 la app.", 422);
    }
    if (typeof cuerpo.monto !== "number" || !Number.isInteger(cuerpo.monto)) return enCasa("El monto no es v\xE1lido.", 422);
    cent = cuerpo.monto;
  }
  if (!Number.isInteger(cent) || cent <= 0) return enCasa("El monto no es v\xE1lido.");
  if (typeof cuerpo.ref !== "string" || !/^[A-Za-z0-9_-]{8,64}$/.test(cuerpo.ref)) {
    return enCasa("Falta la referencia del pedido. Actualiz\xE1 la app y prob\xE1 otra vez.", 422);
  }
  const marca = cuerpo.ref;
  const huellaPedido = JSON.stringify({ cent, concepto: conceptoFinal, lineas: cuerpo.lineas ?? null });
  return enTransaccion(c, tel, async (cli, socioId, disponible) => {
    if (disponible < cent) return faltan(cent - disponible);
    if (Array.isArray(cuerpo.lineas)) {
      const lineas = cuerpo.lineas.map((l) => {
        const p = CARTA.find((p2) => p2.id === l.id);
        return { id: p.id, nombre: p.nombre, precio: p.precio, cuanto: Number(l.cuanto) };
      });
      const { rows: [pedido] } = await cli.query("INSERT INTO pedido(socio_id,referencia,lineas,total) VALUES($1,$2,$3::jsonb,$4) RETURNING id,numero,estado", [socioId, marca, JSON.stringify(lineas), cent]);
      await cli.query("INSERT INTO pedido_evento(pedido_id,estado,quien) VALUES($1,'recibido',$2)", [pedido.id, sesion.empleado ?? (sesion.rol === "casa" ? "propietario" : "socio")]);
      await cli.query("INSERT INTO aviso_cliente(socio_id,referencia,texto) VALUES($1,$2,$3)", [socioId, "pedido:" + pedido.id + ":recibido", "Recibimos tu pedido #" + pedido.numero + ". Pod\xE9s seguirlo en Mis compras y reservas."]);
      return { monto: cent, concepto: conceptoFinal, ref: "pedido:" + marca, datos: { concepto: conceptoFinal, pedido } };
    }
    return { monto: cent, concepto: conceptoFinal, ref: "pedido:" + marca, datos: { concepto: conceptoFinal, pedido: null } };
  }, { referencia: "pedido:" + marca, operacion: "pedido", huella: huellaPedido });
});
app.post("/api/beneficio/:clase", (c) => c.json({ error: "Mostr\xE1 el c\xF3digo del beneficio en la barra. La entrega la confirma el personal." }, 403));
app.post("/api/membresia/apartar", async (c) => {
  const CUOTA = CUOTA_MENSUAL;
  await mantenerMembresias(c.env);
  return enTransaccion(c, c.get("sesion").tel, async (cli, socioId, saldo) => {
    const { rows: ya } = await cli.query(
      "SELECT numero FROM operativo_membresia WHERE socio_id = $1 AND estado IN ('activa','en_gracia') AND hasta>now()",
      [socioId]
    );
    if (ya.length) {
      return new Response(JSON.stringify({ numero: ya[0].numero, yaEra: true }), {
        headers: { "content-type": "application/json" }
      });
    }
    if (saldo < CUOTA) return faltan(CUOTA - saldo);
    await cli.query("SELECT pg_advisory_xact_lock(hashtext('plazas-membresia'))");
    const { rows: nueva } = await cli.query(
      `INSERT INTO membresia (socio_id, numero, cuota, hasta, renovacion_consentida)
       SELECT $1, n, $2, now() + interval '30 days', now()
       FROM generate_series(1, $3) AS n
       WHERE NOT EXISTS (SELECT 1 FROM operativo_membresia m WHERE m.numero = n AND m.estado IN ('activa','en_gracia'))
       ORDER BY n LIMIT 1
       ON CONFLICT DO NOTHING
       RETURNING id, numero`,
      [socioId, CUOTA, TOTAL_SOCIOS]
    );
    if (!nueva.length) {
      return enCasa("Los cien est\xE1n tomados. Dej\xE1 tu n\xFAmero y te escribimos apenas se desocupe un lugar.", 409);
    }
    const { rows: restan } = await cli.query(
      "SELECT $1::int - count(*)::int AS n FROM operativo_membresia WHERE estado IN ('activa','en_gracia')",
      [TOTAL_SOCIOS]
    );
    return {
      monto: CUOTA,
      concepto: "Mesa Fundadora \xB7 primer mes",
      ref: "mem:" + nueva[0].id,
      datos: { numero: nueva[0].numero, quedan: Number(restan[0].n) }
    };
  });
});
app.post("/api/membresia/cancelar", async (c) => {
  const tel = c.get("sesion").tel;
  return enTransaccion(c, tel, async (cli, socioId) => {
    const { rows: m } = await cli.query(
      `UPDATE operativo_membresia SET autorenueva=false WHERE socio_id=$1 AND estado IN ('activa','en_gracia') RETURNING numero,hasta`,
      [socioId]
    );
    if (!m.length) return enCasa("No ten\xE9s una membres\xEDa activa.", 409);
    return { monto: 0, concepto: "", ref: "", datos: { cancelada: true, numero: m[0].numero, hasta: m[0].hasta } };
  });
});
app.post("/api/membresia/renovacion", async (c) => {
  return enTransaccion(c, c.get("sesion").tel, async (cli, socioId) => {
    const { rows: m } = await cli.query(
      `UPDATE operativo_membresia SET autorenueva=true,renovacion_consentida=now()
       WHERE socio_id=$1 AND estado IN ('activa','en_gracia') AND hasta>now() RETURNING numero,hasta`,
      [socioId]
    );
    if (!m.length) return enCasa("Tu membres\xEDa ya venci\xF3. Tom\xE1 una plaza para empezar otro mes.", 409);
    return { monto: 0, concepto: "", ref: "", datos: { activada: true, hasta: m[0].hasta } };
  });
});
app.post("/api/reserva-cosecha/apartar", async (c) => {
  const solicitud = await llaveDeSolicitud(c);
  if (!solicitud) return enCasa("Falta una referencia v\xE1lida de la compra.", 422);
  return enTransaccion(c, c.get("sesion").tel, async (cli, socioId, saldo) => {
    const { rows: libre } = await cli.query(
      `SELECT numero, precio, generacion FROM reserva_cosecha WHERE apartada IS NULL
       ORDER BY numero LIMIT 1 FOR UPDATE SKIP LOCKED`
    );
    if (!libre.length) {
      return enCasa("Las ciento cincuenta est\xE1n apartadas. El corte que viene se abre en noviembre.", 409);
    }
    const precio = Number(libre[0].precio);
    if (saldo < precio) return faltan(precio - saldo);
    await cli.query("UPDATE reserva_cosecha SET socio_id = $1, apartada = now() WHERE numero = $2", [
      socioId,
      libre[0].numero
    ]);
    await cli.query("INSERT INTO compra_bolsa(socio_id,numero,generacion,total) VALUES($1,$2,$3,$4)", [socioId, libre[0].numero, libre[0].generacion, precio]);
    const { rows: quedan } = await cli.query(
      "SELECT count(*)::int AS n FROM reserva_cosecha WHERE apartada IS NULL"
    );
    return {
      monto: precio,
      concepto: "Reserva de Cosecha \xB7 bolsa " + String(libre[0].numero).padStart(3, "0"),
      // La generación entra en la referencia: la bolsa 117 de esta cosecha no
      // es la 117 de la siguiente, y cada una se cobra una vez.
      ref: solicitud ?? "bolsa:" + libre[0].generacion + ":" + libre[0].numero,
      datos: { numero: libre[0].numero, quedan: Number(quedan[0].n), total: TOTAL_BOLSAS }
    };
  }, { referencia: solicitud, operacion: "bolsa", huella: "bolsa" });
});
app.post("/api/experiencia/:id/apartar", async (c) => {
  const id = c.req.param("id");
  const solicitud = await llaveDeSolicitud(c);
  if (!solicitud) return enCasa("Falta una referencia v\xE1lida de la compra.", 422);
  return enTransaccion(c, c.get("sesion").tel, async (cli, socioId, saldo) => {
    const { rows: exp } = await cli.query(
      "SELECT id, cupos, precio, cuando > now() AS futura FROM experiencia WHERE id = $1",
      [id]
    );
    if (!exp.length) return enCasa("Esa experiencia no est\xE1 en el calendario.", 404);
    if (!exp[0].futura) return enCasa("Esa ya pas\xF3. Mir\xE1 lo que viene, que hay m\xE1s.", 409);
    const precio = Number(exp[0].precio);
    if (saldo < precio) return faltan(precio - saldo);
    const { rows: butaca } = await cli.query(
      `INSERT INTO asiento_experiencia (experiencia_id, butaca, socio_id, pagado)
       SELECT $1, n, $2, $3
       FROM generate_series(1, $4) AS n
       WHERE NOT EXISTS (
         SELECT 1 FROM operativo_asiento_experiencia a WHERE a.experiencia_id = $1 AND a.butaca = n)
       ORDER BY n LIMIT 1
       ON CONFLICT DO NOTHING
       RETURNING id, butaca`,
      [exp[0].id, socioId, precio, exp[0].cupos]
    );
    if (!butaca.length) {
      return enCasa("Se llen\xF3 mientras estabas pagando. Doce sillas se van r\xE1pido. No te cobramos nada.", 409);
    }
    const { rows: libres } = await cli.query(
      "SELECT $1::int - count(*)::int AS n FROM operativo_asiento_experiencia WHERE experiencia_id = $2",
      [exp[0].cupos, exp[0].id]
    );
    return {
      monto: precio,
      concepto: "Experiencia \xB7 " + exp[0].id,
      ref: solicitud ?? "exp:" + butaca[0].id,
      datos: { butaca: butaca[0].butaca, quedan: Number(libres[0].n) }
    };
  }, { referencia: solicitud, operacion: "experiencia", huella: id });
});
var ZONAS = [
  // Los íconos esquivan los que el §4 ya tiene ocupados: `local_cafe` es la
  // pestaña Pedir y `workspace_premium` el sello de socia, así que la barra
  // lleva `countertops` y el VIP `diamond`. `deck` está retirado.
  { id: "terraza", nombre: "La terraza", aforo: 10, deposito: 0, icono: "balcony" },
  { id: "ventanal", nombre: "El ventanal", aforo: 6, deposito: 0, icono: "window" },
  { id: "barra", nombre: "La barra", aforo: 8, deposito: 0, icono: "countertops" },
  { id: "bistro", nombre: "El bistr\xF3", aforo: 12, deposito: 0, icono: "restaurant" },
  { id: "vip", nombre: "El Sal\xF3n VIP", aforo: 1, deposito: 5e4, icono: "diamond" }
];
var ZONAS_VALIDAS = ZONAS.map((z) => z.id);
app.post("/api/reserva", async (c) => {
  const { zona, cuando, personas, horas } = await c.req.json();
  if (typeof zona !== "string" || !ZONAS_VALIDAS.includes(zona)) return enCasa("Esa zona no existe en la casa.");
  if (typeof cuando !== "string" || typeof personas !== "number" || horas !== void 0 && typeof horas !== "number") return enCasa("Revis\xE1 la fecha, la duraci\xF3n y las personas de la reserva.", 422);
  const inicio = new Date(String(cuando));
  if (Number.isNaN(inicio.getTime())) return enCasa("Esa fecha no nos cuadra.");
  const ahora = Date.now();
  if (inicio.getTime() < ahora + 30 * 6e4) {
    return enCasa("Apart\xE1 con al menos media hora de anticipaci\xF3n. Para algo m\xE1s pronto, escribinos.");
  }
  if (inicio.getTime() > ahora + 90 * 864e5) {
    return enCasa("Abrimos la agenda con noventa d\xEDas. M\xE1s all\xE1, escribinos y lo anotamos a mano.");
  }
  const local = new Date(inicio.getTime() - 6 * 36e5);
  const hManagua = local.getUTCHours() + local.getUTCMinutes() / 60 + local.getUTCSeconds() / 3600;
  const domingo = new Date(inicio.getTime() - 6 * 36e5).getUTCDay() === 0;
  if (hManagua < (domingo ? 8 : 7) || hManagua >= 21) {
    return enCasa("A esa hora la casa est\xE1 cerrada. Abrimos de 7 a 21, y los domingos desde las 8.");
  }
  const duracion = horas === void 0 ? 2 : Number(horas);
  if (!Number.isInteger(duracion) || duracion < 1 || duracion > 6) return enCasa("Las mesas se apartan de una a seis horas.");
  if (hManagua + duracion > 21) {
    return enCasa("Esa mesa se pasar\xEDa de la hora de cierre. Prob\xE1 m\xE1s temprano o menos horas.");
  }
  const gente = Number(personas);
  if (!Number.isInteger(gente) || gente < 1 || gente > 12) return enCasa("Decinos para cu\xE1ntos, entre 1 y 12.");
  const deposito = ZONAS.find((z) => z.id === zona)?.deposito ?? 0;
  const fin = new Date(inicio.getTime() + duracion * 36e5);
  return enTransaccion(c, c.get("sesion").tel, async (cli, socioId, saldo) => {
    const { rows: repetida } = await cli.query(
      `SELECT id, zona, cuando, termina, personas, deposito FROM operativo_reserva
       WHERE socio_id = $1 AND zona = $2 AND cuando = $3 AND cancelada IS NULL`,
      [socioId, zona, inicio.toISOString()]
    );
    if (repetida.length) {
      return { monto: 0, concepto: "", ref: "", datos: { reserva: repetida[0], yaEstaba: true } };
    }
    if (deposito > 0 && saldo < deposito) return faltan(deposito - saldo);
    await cli.query("SELECT pg_advisory_xact_lock(hashtext('reserva:' || $1))", [zona]);
    const { rows: ocupadas } = await cli.query(
      `WITH solapadas AS (
         SELECT cuando, termina FROM operativo_reserva
         WHERE zona = $1 AND cancelada IS NULL AND cuando < $3 AND termina > $2
       ), eventos AS (
         SELECT GREATEST(cuando, $2::timestamptz) AS instante, 1 AS cambio FROM solapadas
         UNION ALL
         SELECT LEAST(termina, $3::timestamptz), -1 FROM solapadas
       ), simultaneas AS (
         SELECT SUM(SUM(cambio)) OVER (ORDER BY instante) AS n
         FROM eventos GROUP BY instante
       )
       SELECT COALESCE(MAX(n), 0)::int AS n FROM simultaneas`,
      [zona, inicio.toISOString(), fin.toISOString()]
    );
    const aforo = ZONAS.find((z) => z.id === zona)?.aforo ?? 0;
    if (Number(ocupadas[0].n) >= aforo) {
      return enCasa(
        aforo === 1 ? "Esa zona ya est\xE1 tomada a esa hora. Prob\xE1 otra hora, u otro rinc\xF3n de la casa." : "No nos quedan mesas ah\xED a esa hora. Prob\xE1 una hora antes, o el ventanal.",
        409
      );
    }
    const { rows: r } = await cli.query(
      `INSERT INTO reserva (socio_id, zona, cuando, termina, personas, deposito)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, zona, cuando, termina, personas, deposito`,
      [socioId, zona, inicio.toISOString(), fin.toISOString(), gente, deposito]
    );
    return {
      monto: deposito,
      concepto: "Dep\xF3sito del Sal\xF3n VIP",
      ref: "dep:" + r[0].id,
      datos: { reserva: r[0], yaEstaba: false }
    };
  });
});
app.get("/api/panel", (c) => c.json({ error: "Ingres\xE1 al panel del equipo con tu cuenta individual." }, 410));
app.get("/api/ocupacion", async (c) => {
  const dia = c.req.query("dia") ?? new Intl.DateTimeFormat("en-CA", { timeZone: "America/Managua", year: "numeric", month: "2-digit", day: "2-digit" }).format(/* @__PURE__ */ new Date());
  if (!fechaCalendario(dia)) return enCasa("Esa fecha no nos cuadra.", 422);
  const sql = neon(c.env.DATABASE_URL);
  const filas = await sql`
    WITH tramos AS (
      SELECT r.zona, h,
             GREATEST(r.cuando AT TIME ZONE 'America/Managua', h) AS inicio,
             LEAST(r.termina AT TIME ZONE 'America/Managua', h + interval '1 hour') AS fin
      FROM operativo_reserva r,
           generate_series(
             date_trunc('hour', r.cuando AT TIME ZONE 'America/Managua'),
             (r.termina AT TIME ZONE 'America/Managua') - interval '1 microsecond',
             interval '1 hour'
           ) AS h
      WHERE r.cancelada IS NULL
        AND (h)::date = ${dia}::date
    ), eventos AS (
      SELECT zona, h, inicio AS instante, 1 AS cambio FROM tramos
      UNION ALL
      SELECT zona, h, fin, -1 FROM tramos
    ), simultaneas AS (
      SELECT zona, h, SUM(SUM(cambio)) OVER (PARTITION BY zona, h ORDER BY instante) AS n
      FROM eventos GROUP BY zona, h, instante
    )
    SELECT zona, EXTRACT(hour FROM h)::int AS hora, MAX(n)::int AS n
    FROM simultaneas GROUP BY zona, h`;
  const aforo = Object.fromEntries(ZONAS.map((z) => [z.id, z.aforo]));
  const mapa = {};
  for (const f of filas) {
    const z = f.zona;
    mapa[z] ??= {};
    mapa[z][Number(f.hora)] = Math.min(1, Number(f.n) / (aforo[z] ?? 10));
  }
  return c.json({ dia, aforo, ocupacion: mapa });
});
app.all("/api/*", () => enCasa("Esa puerta no da a ning\xFAn lado.", 404));
app.all("*", (c) => c.env.ASSETS.fetch(c.req.raw));
async function mantenerMembresias(env) {
  const sql = neon(env.DATABASE_URL);
  await sql`SELECT mantener_membresia(socio_id) FROM (
    SELECT socio_id FROM operativo_membresia
    WHERE estado IN ('activa','en_gracia') AND hasta<=now()
    ORDER BY socio_id
  ) vencidas`;
}
async function mantenerEntornos(env) {
  const identidadBase = (direccion) => {
    if (!direccion) return null;
    try {
      const u = new URL(direccion);
      return u.hostname.toLowerCase().replace(/-pooler(?=\.)/, "") + ":" + (u.port || "5432") + decodeURIComponent(u.pathname);
    } catch {
      return null;
    }
  };
  const baseReal = identidadBase(env.DATABASE_URL);
  const entornos = [
    { entorno: "real", db: env.DATABASE_URL },
    ...env.DEMO_AISLADA === "true" || env.DEMO_DATABASE_URL ? [{ entorno: "demo", db: env.DEMO_DATABASE_URL }] : []
  ];
  const resultados = await Promise.allSettled(entornos.map(async ({ entorno, db: db2 }) => {
    if (!db2) throw new Error("Base de mantenimiento no configurada");
    if (entorno === "demo" && baseReal && identidadBase(db2) === baseReal) throw new Error("Los entornos deben usar bases independientes");
    await mantenerMembresias({ ...env, DATABASE_URL: db2 });
    console.log(JSON.stringify({ evento: "mantenimiento_membresias", entorno, estado: "correcto" }));
  }));
  let fallos = 0;
  resultados.forEach((r, i) => {
    if (r.status !== "rejected") return;
    fallos++;
    const codigo = r.reason && typeof r.reason === "object" && "code" in r.reason ? String(r.reason.code) : "interno";
    console.error(JSON.stringify({ evento: "mantenimiento_membresias", entorno: entornos[i].entorno, estado: "error", codigo }));
  });
  if (fallos) throw new Error(`Mantenimiento incompleto: ${fallos} entorno(s).`);
}
app.onError((error) => {
  registrarError(error);
  return enCasa("No pudimos completar la operaci\xF3n. Prob\xE1 otra vez en un momento.", 500);
});
var index_default = {
  fetch: app.fetch,
  async scheduled(_event, env, _ctx) {
    await mantenerEntornos(env);
  }
};
export {
  app,
  index_default as default,
  mantenerEntornos,
  mantenerMembresias
};
/*! Bundled license information:

otpauth/dist/otpauth.node.mjs:
  (*! otpauth 9.5.2 | (c) Héctor Molinero Fernández | MIT | https://github.com/hectorm/otpauth *)
*/
