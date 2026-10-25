// node_modules/hono/dist/compose.js
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

// node_modules/hono/dist/request/constants.js
var GET_MATCH_RESULT = /* @__PURE__ */ Symbol();

// node_modules/hono/dist/utils/buffer.js
var bufferToFormData = (arrayBuffer, contentType) => {
  const response = new Response(arrayBuffer, {
    headers: {
      // Normalize the media type (case-insensitive) while keeping parameters like the boundary
      "Content-Type": contentType.replace(/^[^;]+/, (mediaType) => mediaType.toLowerCase())
    }
  });
  return response.formData();
};

// node_modules/hono/dist/utils/body.js
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
        handleParsingNestedValues(form, key, value);
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
var handleParsingNestedValues = (form, key, value) => {
  if (/(?:^|\.)__proto__\./.test(key)) {
    return;
  }
  let nestedForm = form;
  const keys = key.split(".");
  keys.forEach((key2, index) => {
    if (index === keys.length - 1) {
      nestedForm[key2] = value;
    } else {
      if (!nestedForm[key2] || typeof nestedForm[key2] !== "object" || Array.isArray(nestedForm[key2]) || nestedForm[key2] instanceof File) {
        nestedForm[key2] = /* @__PURE__ */ Object.create(null);
      }
      nestedForm = nestedForm[key2];
    }
  });
};

// node_modules/hono/dist/utils/url.js
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

// node_modules/hono/dist/request.js
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
    const paramKey = this.#matchResult[0][this.routeIndex][1][key];
    const param = this.#getParamValue(paramKey);
    return param && tryDecodeURIComponent(param);
  }
  #getAllDecodedParams() {
    const decoded = {};
    const keys = Object.keys(this.#matchResult[0][this.routeIndex][1]);
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

// node_modules/hono/dist/utils/html.js
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

// node_modules/hono/dist/context.js
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

// node_modules/hono/dist/router.js
var METHOD_NAME_ALL = "ALL";
var METHOD_NAME_ALL_LOWERCASE = "all";
var METHODS = ["get", "post", "put", "delete", "options", "patch", "query"];
var MESSAGE_MATCHER_IS_ALREADY_BUILT = "Can not add a route since the matcher is already built.";
var UnsupportedPathError = class extends Error {
};

// node_modules/hono/dist/utils/constants.js
var COMPOSED_HANDLER = "__COMPOSED_HANDLER";

// node_modules/hono/dist/hono-base.js
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
        if (typeof args1 === "string") {
          this.#path = args1;
        } else {
          this.#addRoute(method, this.#path, args1);
        }
        args.forEach((handler) => {
          this.#addRoute(method, this.#path, handler);
        });
        return this;
      };
    });
    this.on = (method, path, ...handlers) => {
      for (const p of [path].flat()) {
        this.#path = p;
        for (const m of [method].flat()) {
          handlers.map((handler) => {
            this.#addRoute(m.toUpperCase(), this.#path, handler);
          });
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
    method = method.toUpperCase();
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

// node_modules/hono/dist/router/reg-exp-router/matcher.js
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

// node_modules/hono/dist/router/reg-exp-router/node.js
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
  #children = /* @__PURE__ */ Object.create(null);
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

// node_modules/hono/dist/router/reg-exp-router/trie.js
var Trie = class {
  #context = { varIndex: 0 };
  #root = new Node();
  #index = 0;
  // dynamic path -> [handler index, param assoc]; static paths are not registered
  paths = /* @__PURE__ */ Object.create(null);
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

// node_modules/hono/dist/router/reg-exp-router/router.js
var wildcardRegExpCache = /* @__PURE__ */ Object.create(null);
function buildWildcardRegExp(path) {
  return wildcardRegExpCache[path] ??= new RegExp(
    path === "*" ? "" : `^${path.replace(
      /\/\*$|([.\\+*[^\]$()])/g,
      (_, metaChar) => metaChar ? `\\${metaChar}` : "(?:|/.*)"
    )}$`
  );
}
function clearWildcardRegExpCache() {
  wildcardRegExpCache = /* @__PURE__ */ Object.create(null);
}
function findMiddleware(middleware, path) {
  if (!middleware) {
    return void 0;
  }
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
    this.#middleware = { [METHOD_NAME_ALL]: /* @__PURE__ */ Object.create(null) };
    this.#routes = { [METHOD_NAME_ALL]: /* @__PURE__ */ Object.create(null) };
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
    if (!middleware || !routes) {
      throw new Error(MESSAGE_MATCHER_IS_ALREADY_BUILT);
    }
    if (!middleware[method]) {
      this.#tries[method] = new Trie();
      [middleware, routes].forEach((handlerMap) => {
        handlerMap[method] = /* @__PURE__ */ Object.create(null);
        Object.keys(handlerMap[METHOD_NAME_ALL]).forEach((p) => {
          handlerMap[method][p] = [...handlerMap[METHOD_NAME_ALL][p]];
          this.#insertPath(method, p);
        });
      });
    }
    if (path === "/*") {
      path = "*";
    }
    const paramCount = (path.match(/\/:/g) || []).length;
    if (/\*$/.test(path)) {
      const re = buildWildcardRegExp(path);
      Object.keys(middleware).forEach((m) => {
        if ((method === METHOD_NAME_ALL || method === m) && !middleware[m][path]) {
          this.#insertPath(m, path);
          middleware[m][path] = findMiddleware(middleware[m], path) || findMiddleware(middleware[METHOD_NAME_ALL], path) || [];
        }
      });
      Object.keys(middleware).forEach((m) => {
        if (method === METHOD_NAME_ALL || method === m) {
          Object.keys(middleware[m]).forEach((p) => {
            re.test(p) && middleware[m][p].push([handler, paramCount]);
          });
        }
      });
      Object.keys(routes).forEach((m) => {
        if (method === METHOD_NAME_ALL || method === m) {
          Object.keys(routes[m]).forEach(
            (p) => re.test(p) && routes[m][p].push([handler, paramCount])
          );
        }
      });
      return;
    }
    const paths = checkOptionalParameter(path) || [path];
    for (let i = 0, len = paths.length; i < len; i++) {
      const path2 = paths[i];
      Object.keys(routes).forEach((m) => {
        if (method === METHOD_NAME_ALL || method === m) {
          if (!routes[m][path2]) {
            this.#insertPath(m, path2);
            routes[m][path2] = [
              ...findMiddleware(middleware[m], path2) || findMiddleware(middleware[METHOD_NAME_ALL], path2) || []
            ];
          }
          routes[m][path2].push([handler, paramCount - len + i + 1]);
        }
      });
    }
  }
  match = match;
  buildAllMatchers() {
    const matchers = /* @__PURE__ */ Object.create(null);
    Object.keys(this.#routes).concat(Object.keys(this.#middleware)).forEach((method) => {
      matchers[method] ||= this.#buildMatcher(method);
    });
    this.#middleware = this.#routes = this.#tries = void 0;
    clearWildcardRegExpCache();
    return matchers;
  }
  #buildMatcher(method) {
    const middleware = this.#middleware[method];
    const routes = this.#routes[method];
    const trie = this.#tries[method];
    const staticMap = /* @__PURE__ */ Object.create(null);
    const handlerData = [];
    [middleware, routes].forEach((r) => {
      for (const path in r) {
        const handlers = r[path];
        const pathData = trie.paths[path];
        if (!pathData) {
          staticMap[path] = [handlers.map(([h]) => [h, /* @__PURE__ */ Object.create(null)]), emptyParam];
          continue;
        }
        const paramAssoc = pathData[1];
        handlerData[pathData[0]] = handlers.map(([h, paramCount]) => {
          const paramIndexMap = /* @__PURE__ */ Object.create(null);
          paramCount -= 1;
          for (; paramCount >= 0; paramCount--) {
            const [key, value] = paramAssoc[paramCount];
            paramIndexMap[key] = value;
          }
          return [h, paramIndexMap];
        });
      }
    });
    const [regexp, indexReplacementMap, paramReplacementMap] = trie.buildRegExp();
    for (let i = 0, len = handlerData.length; i < len; i++) {
      for (let j = 0, len2 = handlerData[i].length; j < len2; j++) {
        const map = handlerData[i][j]?.[1];
        if (!map) {
          continue;
        }
        const keys = Object.keys(map);
        for (let k = 0, len3 = keys.length; k < len3; k++) {
          map[keys[k]] = paramReplacementMap[map[keys[k]]];
        }
      }
    }
    const handlerMap = [];
    for (const i in indexReplacementMap) {
      handlerMap[i] = handlerData[indexReplacementMap[i]];
    }
    return [regexp, handlerMap, staticMap];
  }
};

// node_modules/hono/dist/router/smart-router/router.js
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

// node_modules/hono/dist/router/trie-router/node.js
var emptyParams = /* @__PURE__ */ Object.create(null);
var order = 0;
var Node2 = class _Node2 {
  #methods = [];
  #children = /* @__PURE__ */ Object.create(null);
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
        handlerSet.params = /* @__PURE__ */ Object.create(null);
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

// node_modules/hono/dist/router/trie-router/router.js
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

// node_modules/hono/dist/hono.js
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

// auditoria-2026-09-11/driver-local.mjs
var neonConfig = {};
var Client = class {
  async connect() {
  }
  async end() {
  }
  async query(query, params) {
    return globalThis.__auditDb.query(query, params);
  }
};
function neon() {
  const sql = (parts, ...params) => {
    const query = parts.reduce((s, part, i) => s + (i ? "$" + i : "") + part, "");
    const execute = () => globalThis.__auditDb.query(query, params).then((r) => r.rows);
    return { execute, then: (yes, no) => execute().then(yes, no) };
  };
  sql.transaction = async (queries) => {
    await globalThis.__auditDb.exec("BEGIN");
    try {
      const results = [];
      for (const q of queries) results.push(await q.execute());
      await globalThis.__auditDb.exec("COMMIT");
      return results;
    } catch (e) {
      await globalThis.__auditDb.exec("ROLLBACK");
      throw e;
    }
  };
  return sql;
}

// src/worker/sesion.ts
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
  if (a.length !== b.length) return false;
  let dif = 0;
  for (let i = 0; i < a.length; i++) dif |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return dif === 0;
}
async function firmar(secreto, s) {
  const cuerpo = b64url(cod.encode(JSON.stringify(s)));
  const firma = await crypto.subtle.sign("HMAC", await clave(secreto), cod.encode(cuerpo));
  return `${cuerpo}.${b64url(firma)}`;
}
async function verificar(secreto, token) {
  if (!token) return null;
  const [cuerpo, firma] = token.split(".");
  if (!cuerpo || !firma) return null;
  try {
    const esperada = b64url(await crypto.subtle.sign("HMAC", await clave(secreto), cod.encode(cuerpo)));
    if (!igualEnTiempoConstante(esperada, firma)) return null;
    const s = JSON.parse(deB64url(cuerpo));
    if (typeof s.tel !== "string" || typeof s.exp !== "number") return null;
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

// src/data/menu.ts
var CARTA = [
  { id: "espresso", nombre: "Espresso", descripcion: "Treinta mililitros del Aguacatal, la ladera de la familia. Veintis\xE9is segundos, crema espesa, panela.", precio: 8e3, categoria: "bebidas-calientes", momento: "barra", foto: null, popular: false, etiquetas: [], perfil: "CORTO \xB7 DENSO \xB7 FINAL PERSISTENTE" },
  { id: "cortadito", nombre: "Cortadito", descripcion: "Un espresso cortado con leche caliente en partes iguales. Baja el filo, no el caf\xE9.", precio: 9e3, categoria: "bebidas-calientes", momento: "barra", foto: null, popular: false, etiquetas: [], perfil: "PARTES IGUALES \xB7 TEMPLADO \xB7 DULCE" },
  { id: "macchiato", nombre: "Macchiato", descripcion: "Mismo espresso, apenas manchado: una cucharada de espuma encima. Se toma en dos sorbos.", precio: 9e3, categoria: "bebidas-calientes", momento: "barra", foto: null, popular: false, etiquetas: [], perfil: "FUERTE \xB7 MANCHADO \xB7 ESPUMA ENCIMA" },
  { id: "americano", nombre: "Americano", descripcion: "Espresso alargado con agua caliente. Al abrirse la taza aparece la naranja madura de la finca.", precio: 8500, categoria: "bebidas-calientes", momento: "barra", foto: null, popular: false, etiquetas: [], perfil: "LARGO \xB7 CLARO \xB7 ACIDEZ DE NARANJA" },
  { id: "latte", nombre: "Latte", descripcion: "Leche texturizada al vapor sobre un espresso de Matagalpa. M\xE1s leche que caf\xE9, textura de seda.", precio: 9500, categoria: "bebidas-calientes", momento: "barra", foto: null, popular: false, etiquetas: [], perfil: "SEDOSO \xB7 LECHOSO \xB7 CAF\xC9 DE FONDO" },
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

// src/worker/index.ts
var app = new Hono2();
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
async function enTransaccion(c, tel, trabajo) {
  neonConfig.webSocketConstructor = globalThis.WebSocket;
  const cli = new Client(conPooler(c.env.DATABASE_URL));
  await cli.connect();
  try {
    await cli.query("BEGIN");
    await cli.query("SET LOCAL statement_timeout = '8s'");
    const { rows: socios } = await cli.query("SELECT id FROM socio WHERE telefono = $1 FOR UPDATE", [tel]);
    if (!socios.length) {
      await cli.query("ROLLBACK");
      return enCasa("No encontramos esa cuenta.", 404);
    }
    const socioId = socios[0].id;
    const { rows: s } = await cli.query("SELECT total FROM saldo_de($1)", [socioId]);
    const saldo = Number(s[0]?.total ?? 0);
    const r = await trabajo(cli, socioId, saldo);
    if (r instanceof Response) {
      await cli.query("ROLLBACK");
      return r;
    }
    const { rows: ya } = r.monto > 0 ? await cli.query("SELECT id FROM asiento WHERE socio_id = $1 AND ref_externa = $2", [socioId, r.ref]) : { rows: [] };
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
    await cli.query("COMMIT");
    const { rows: fin } = await cli.query("SELECT * FROM saldo_de($1)", [socioId]);
    return new Response(JSON.stringify({ ...r.datos, cobrado: r.monto, saldo: fin[0] }), {
      headers: { "content-type": "application/json" }
    });
  } catch (e) {
    await cli.query("ROLLBACK").catch(() => {
    });
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
  return ref.length >= 8 ? "sol:" + ref.slice(0, 64) : null;
}
var ABIERTAS = [
  "/api/health",
  "/api/cupos",
  "/api/catalogo",
  "/api/ocupacion",
  "/api/auth/codigo",
  "/api/auth/entrar",
  "/api/auth/casa",
  "/api/panel"
];
app.use("/api/*", async (c, next) => {
  if (ABIERTAS.includes(c.req.path)) return next();
  const s = await verificar(c.env.SESION_SECRETO, c.req.header("authorization")?.replace(/^Bearer\s+/i, ""));
  if (!s) {
    return enCasa("Se cerr\xF3 tu sesi\xF3n por seguridad. Entr\xE1 otra vez con tu WhatsApp y segu\xEDs donde ibas.", 401);
  }
  c.set("sesion", s);
  await next();
});
app.post("/api/auth/codigo", async (c) => {
  const { telefono } = await c.req.json();
  const tel = soloDigitos(telefono);
  if (tel.length < 8) return enCasa("Ese n\xFAmero no nos cuadra. Escribilo con los ocho d\xEDgitos, sin espacios.");
  const sql = neon(c.env.DATABASE_URL);
  if (tel !== CUENTA_DEMO) {
    const [puede] = await sql`SELECT puede_pedir_codigo(${tel}) AS ok`;
    if (!puede.ok) {
      return enCasa("Pediste varios c\xF3digos seguidos. Esper\xE1 una hora y volv\xE9 a intentar.", 429);
    }
  }
  const codigo = tel === CUENTA_DEMO ? "505505" : codigoDeSeis();
  await sql`SELECT emitir_codigo(${tel}, ${await huella(c.env.SESION_SECRETO, `${tel}:${codigo}`)})`;
  return c.json({
    enviado: true,
    // Solo la demo revela su código; el resto lo recibe por WhatsApp.
    ...tel === CUENTA_DEMO ? { codigoDemo: codigo, nota: "Cuenta de demostraci\xF3n" } : {}
  });
});
app.post("/api/auth/entrar", async (c) => {
  const { telefono, codigo, nombre } = await c.req.json();
  const tel = soloDigitos(telefono);
  const cod2 = soloDigitos(codigo);
  if (tel.length < 8 || cod2.length !== 6) return enCasa("Esos n\xFAmeros no son. Fijate en el WhatsApp y escribilos otra vez.");
  const sql = neon(c.env.DATABASE_URL);
  const [fila] = await sql`
    SELECT id, huella, vence, intentos FROM codigo_acceso
    WHERE telefono = ${tel} AND usado IS NULL ORDER BY creado DESC LIMIT 1`;
  if (!fila) return enCasa("Ese c\xF3digo ya se enfri\xF3. Ped\xED uno nuevo y te lo mandamos ya mismo.", 410);
  if (new Date(fila.vence) < /* @__PURE__ */ new Date()) {
    return enCasa("Ese c\xF3digo ya se enfri\xF3. Ped\xED uno nuevo y te lo mandamos ya mismo.", 410);
  }
  if (Number(fila.intentos) >= 5) return enCasa("Demasiados intentos con ese c\xF3digo. Ped\xED uno nuevo.", 429);
  const esperada = await huella(c.env.SESION_SECRETO, `${tel}:${cod2}`);
  if (esperada !== fila.huella) {
    await sql`UPDATE codigo_acceso SET intentos = intentos + 1 WHERE id = ${fila.id}`;
    return enCasa("Esos n\xFAmeros no son. Fijate en el WhatsApp y escribilos otra vez.", 401);
  }
  await sql`UPDATE codigo_acceso SET usado = now() WHERE id = ${fila.id}`;
  const nom = String(nombre ?? "").trim();
  const [socio] = await sql`
    INSERT INTO socio (telefono, nombre) VALUES (${tel}, ${nom.length >= 2 ? nom : "Socio"})
    ON CONFLICT (telefono) DO UPDATE SET nombre = COALESCE(NULLIF(${nom}, ''), socio.nombre)
    RETURNING id, nombre`;
  await sql`INSERT INTO tanda (socio_id) VALUES (${socio.id}) ON CONFLICT DO NOTHING`;
  const [tanda] = await sql`SELECT id FROM tanda WHERE socio_id = ${socio.id} AND cerrada IS NULL`;
  if (tanda) {
    await sql`
      INSERT INTO sello (tanda_id, n, motivo, barista, ref_externa)
      VALUES (${tanda.id}, 1, 'De parte de la casa', 'La casa', ${"regalo-1-" + socio.id}),
             (${tanda.id}, 2, 'De parte de la casa', 'La casa', ${"regalo-2-" + socio.id})
      ON CONFLICT DO NOTHING`;
  }
  const token = await firmar(c.env.SESION_SECRETO, {
    tel,
    rol: "socio",
    exp: Date.now() + SESION_HORAS * 36e5
  });
  return c.json({ token, socio: { nombre: socio.nombre, telefono: tel } });
});
var TURNO_HORAS = 12;
function esLaCasa(c) {
  const secreto = c.env.CASA_SECRETO ?? "";
  if (secreto.length === 0) return false;
  return igualEnTiempoConstante(c.req.header("x-casa") ?? "", secreto);
}
app.post("/api/auth/casa", async (c) => {
  if (!esLaCasa(c)) {
    return enCasa("Esa no es la llave de la casa.", 403);
  }
  const token = await firmar(c.env.SESION_SECRETO, {
    tel: "",
    rol: "casa",
    exp: Date.now() + TURNO_HORAS * 36e5
  });
  return c.json({ token, hasta: new Date(Date.now() + TURNO_HORAS * 36e5).toISOString() });
});
app.get("/api/health", (c) => c.json({ ok: true, casa: "La Bella Lupita", hora: (/* @__PURE__ */ new Date()).toISOString() }));
app.get("/api/cupos", async (c) => {
  const sql = neon(c.env.DATABASE_URL);
  const [socios] = await sql`
    SELECT count(*)::int AS n FROM membresia WHERE estado IN ('activa', 'en_gracia')`;
  const [bolsas] = await sql`SELECT count(*)::int AS n FROM reserva_cosecha WHERE apartada IS NULL`;
  const experiencias = await sql`
    SELECT e.id, e.cupos, e.cupos - count(a.id)::int AS libres
    FROM experiencia e LEFT JOIN asiento_experiencia a ON a.experiencia_id = e.id
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
    FROM experiencia e LEFT JOIN asiento_experiencia a ON a.experiencia_id = e.id
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
app.get("/api/yo", async (c) => {
  const tel = c.get("sesion").tel;
  const sql = neon(c.env.DATABASE_URL);
  const [socio] = await sql`
    SELECT id, telefono, nombre, creado, bebida_siempre, alergias, cumple FROM socio WHERE telefono = ${tel}`;
  if (!socio) return enCasa("No encontramos esa cuenta.", 404);
  const sellos = await sql`
    SELECT s.n, s.motivo, s.barista, s.puesto
    FROM sello s JOIN tanda t ON t.id = s.tanda_id
    WHERE t.socio_id = ${socio.id} AND t.cerrada IS NULL ORDER BY s.n`;
  const [saldo] = await sql`SELECT * FROM saldo_de(${socio.id})`;
  const [membresia] = await sql`
    SELECT numero, estado, hasta FROM membresia
    WHERE socio_id = ${socio.id} AND estado IN ('activa', 'en_gracia')`;
  const movimientos = await sql`
    SELECT id, monto, tipo, concepto, creado FROM asiento
    WHERE socio_id = ${socio.id} ORDER BY creado DESC LIMIT 40`;
  const [tandas] = await sql`
    SELECT count(*)::int AS n FROM tanda WHERE socio_id = ${socio.id} AND canjeada IS NOT NULL`;
  const topes = membresia ? await sql`
        SELECT clase, max(ventana)::text AS ventana FROM beneficio_uso b
        JOIN membresia m ON m.id = b.membresia_id
        WHERE m.socio_id = ${socio.id}
          AND b.ventana = CASE b.clase
            WHEN 'bebida_dia' THEN (now() AT TIME ZONE 'America/Managua')::date
            ELSE date_trunc('month', now() AT TIME ZONE 'America/Managua')::date
          END
        GROUP BY clase` : [];
  const porClase = {};
  for (const t of topes) porClase[t.clase] = t.ventana;
  const [valeVivo] = await sql`
    SELECT codigo, vence FROM vale
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
  if (!ticket || String(ticket).length < 4) {
    return enCasa("Falta el ticket de caja: sin \xE9l no podemos garantizar que el sello no se ponga dos veces.", 422);
  }
  const sql = neon(c.env.DATABASE_URL);
  const [socio] = await sql`SELECT id FROM socio WHERE telefono = ${tel}`;
  if (!socio) return enCasa("No encontramos esa cuenta.", 404);
  await sql`INSERT INTO tanda (socio_id) VALUES (${socio.id}) ON CONFLICT DO NOTHING`;
  const [tanda] = await sql`SELECT id FROM tanda WHERE socio_id = ${socio.id} AND cerrada IS NULL`;
  if (!tanda) return enCasa("No hay tanda abierta.", 409);
  const [puesto] = await sql`
    INSERT INTO sello (tanda_id, n, motivo, ref_externa)
    SELECT ${tanda.id}, COALESCE(max(n), 0) + 1, ${String(motivo ?? "Visita")}, ${String(ticket)}
    FROM sello WHERE tanda_id = ${tanda.id}
    HAVING COALESCE(max(n), 0) < 9
    ON CONFLICT DO NOTHING
    RETURNING n`;
  const [cuenta] = await sql`SELECT count(*)::int AS n FROM sello WHERE tanda_id = ${tanda.id}`;
  if (cuenta.n >= 9) await sql`UPDATE tanda SET cerrada = now() WHERE id = ${tanda.id} AND cerrada IS NULL`;
  return c.json({ sellos: cuenta.n, nuevo: puesto?.n ?? null, cerrada: cuenta.n >= 9 });
});
app.post("/api/tanda/canjear", async (c) => {
  const tel = c.get("sesion").tel;
  neonConfig.webSocketConstructor = globalThis.WebSocket;
  const cli = new Client(conPooler(c.env.DATABASE_URL));
  await cli.connect();
  try {
    await cli.query("BEGIN");
    await cli.query("SET LOCAL statement_timeout = '8s'");
    const { rows: socios } = await cli.query("SELECT id FROM socio WHERE telefono = $1 FOR UPDATE", [tel]);
    if (!socios.length) {
      await cli.query("ROLLBACK");
      return enCasa("No encontramos esa cuenta.", 404);
    }
    const socioId = socios[0].id;
    const { rows: t } = await cli.query(
      `SELECT t.id FROM tanda t
       WHERE t.socio_id = $1 AND t.cerrada IS NOT NULL AND t.canjeada IS NULL
       ORDER BY t.cerrada LIMIT 1 FOR UPDATE`,
      [socioId]
    );
    if (!t.length) {
      await cli.query("ROLLBACK");
      return enCasa("Todav\xEDa no hay tanda cerrada. Te faltan sellos para la d\xE9cima.", 409);
    }
    const alfabeto = "23456789BCDFGHJKLMNPQRSTVWXZ";
    const bytes = new Uint8Array(8);
    crypto.getRandomValues(bytes);
    const codigo = Array.from(bytes, (b) => alfabeto[b % alfabeto.length]).join("");
    await cli.query("UPDATE tanda SET canjeada = now() WHERE id = $1", [t[0].id]);
    await cli.query(
      "INSERT INTO vale (codigo, tanda_id, socio_id, vence) VALUES ($1, $2, $3, now() + interval '90 seconds')",
      [codigo, t[0].id, socioId]
    );
    await cli.query(
      "INSERT INTO auditoria (quien, accion, socio_id, detalle) VALUES ('api', 'canje', $1, $2::jsonb)",
      [socioId, JSON.stringify({ codigo })]
    );
    await cli.query("COMMIT");
    return c.json({ codigo, vence: 90 });
  } catch {
    await cli.query("ROLLBACK").catch(() => {
    });
    return enCasa("Algo se nos quem\xF3 del lado de la cocina. No es culpa tuya. Ya lo estamos viendo.", 500);
  } finally {
    c.executionCtx.waitUntil(cli.end());
  }
});
app.post("/api/vale/quemar", async (c) => {
  if (c.get("sesion").rol !== "casa") return enCasa("Los vales los quema la barra.", 403);
  const { codigo } = await c.req.json();
  const sql = neon(c.env.DATABASE_URL);
  const [v] = await sql`
    UPDATE vale SET usado = now()
    WHERE codigo = ${String(codigo ?? "").toUpperCase()} AND usado IS NULL AND vence > now()
    RETURNING codigo, socio_id`;
  if (!v) return enCasa("Ese vale no sirve: o ya se us\xF3, o se enfri\xF3.", 409);
  return c.json({ quemado: true, codigo: v.codigo });
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
  const tel = soloDigitos(telefono);
  if (!tel) return enCasa("Decinos a qu\xE9 cuenta va la recarga.", 422);
  const cent = Math.round(Number(monto));
  if (!Number.isInteger(cent) || cent < 2e4 || cent > 3e5) {
    return enCasa("El monto tiene que estar entre C$ 200 y C$ 3,000.");
  }
  const sql = neon(c.env.DATABASE_URL);
  const [socio] = await sql`SELECT id FROM socio WHERE telefono = ${tel}`;
  if (!socio) return enCasa("No encontramos esa cuenta.", 404);
  const [hoy] = await sql`
    SELECT COALESCE(SUM(monto), 0)::int AS n FROM asiento
    WHERE socio_id = ${socio.id} AND tipo IN ('recarga', 'bono')
      AND creado > now() - interval '24 hours'`;
  if (Number(hoy.n) + cent > 6e5) {
    return enCasa("Llegaste al tope de recargas de hoy. Ma\xF1ana seguimos.", 429);
  }
  const bono = TRAMOS.find((t) => cent >= t.monto)?.bono ?? 0;
  const marca = String(ref ?? crypto.randomUUID());
  await sql.transaction([
    sql`INSERT INTO asiento (socio_id, monto, tipo, concepto, ref_externa)
        VALUES (${socio.id}, ${cent}, 'recarga', 'Recarga', ${marca})
        ON CONFLICT DO NOTHING`,
    ...bono > 0 ? [
      sql`INSERT INTO asiento (socio_id, monto, tipo, concepto, ref_externa)
              VALUES (${socio.id}, ${bono}, 'bono', 'La casa puso', ${marca + ":bono"})
              ON CONFLICT DO NOTHING`
    ] : [],
    sql`INSERT INTO auditoria (quien, accion, socio_id, monto, detalle)
        VALUES ('api', 'recarga', ${socio.id}, ${cent}, ${JSON.stringify({ bono, ref: marca })}::jsonb)`
  ]);
  const [saldo] = await sql`SELECT * FROM saldo_de(${socio.id})`;
  return c.json({ monto: cent, bono, saldo });
});
app.post("/api/cuenta/cobrar", async (c) => {
  const sesion = c.get("sesion");
  const tel = sesion.tel;
  const cuerpo = await c.req.json();
  let cent;
  let conceptoFinal = String(cuerpo.concepto ?? "Consumo");
  if (Array.isArray(cuerpo.lineas)) {
    if (cuerpo.lineas.length === 0) return enCasa("El pedido est\xE1 vac\xEDo.");
    if (cuerpo.lineas.length > 40) return enCasa("Ese pedido es demasiado largo para una sola cuenta.");
    let suma = 0;
    const partes = [];
    for (const l of cuerpo.lineas) {
      const plato = CARTA.find((p) => p.id === l.id);
      if (!plato) return enCasa(`\xAB${String(l.id)}\xBB no est\xE1 en la carta de hoy.`, 422);
      const cuanto = Math.round(Number(l.cuanto));
      if (!Number.isInteger(cuanto) || cuanto < 1 || cuanto > 20) {
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
    cent = Math.round(Number(cuerpo.monto));
  }
  if (!Number.isInteger(cent) || cent <= 0) return enCasa("El monto no es v\xE1lido.");
  const marca = String(cuerpo.ref ?? crypto.randomUUID());
  neonConfig.webSocketConstructor = globalThis.WebSocket;
  const cliente = new Client(conPooler(c.env.DATABASE_URL));
  await cliente.connect();
  try {
    await cliente.query("BEGIN");
    const { rows: socios } = await cliente.query("SELECT id FROM socio WHERE telefono = $1 FOR UPDATE", [tel]);
    if (!socios.length) {
      await cliente.query("ROLLBACK");
      return enCasa("No encontramos esa cuenta.", 404);
    }
    const socioId = socios[0].id;
    const { rows: ya } = await cliente.query(
      "SELECT monto, concepto FROM asiento WHERE socio_id = $1 AND ref_externa = $2",
      [socioId, marca]
    );
    if (ya.length) {
      await cliente.query("COMMIT");
      const { rows: s2 } = await cliente.query("SELECT * FROM saldo_de($1)", [socioId]);
      return c.json({
        cobrado: Math.abs(Number(ya[0].monto)),
        concepto: ya[0].concepto,
        saldo: s2[0],
        repetido: true
      });
    }
    const { rows: s } = await cliente.query("SELECT total FROM saldo_de($1)", [socioId]);
    const disponible = Number(s[0]?.total ?? 0);
    if (disponible < cent) {
      await cliente.query("ROLLBACK");
      return enCasa(
        `Te faltan C$ ${((cent - disponible) / 100).toLocaleString("es-NI")} en la Cuenta de Casa. Dej\xE1 saldo o complet\xE1 en el mostrador.`,
        409
      );
    }
    await cliente.query(
      "INSERT INTO asiento (socio_id, monto, tipo, concepto, ref_externa) VALUES ($1, $2, 'consumo', $3, $4)",
      [socioId, -cent, conceptoFinal, marca]
    );
    await cliente.query(
      "INSERT INTO auditoria (quien, accion, socio_id, monto) VALUES ('api', 'cobro', $1, $2)",
      [socioId, -cent]
    );
    await cliente.query("COMMIT");
    const { rows: fin } = await cliente.query("SELECT * FROM saldo_de($1)", [socioId]);
    return c.json({ cobrado: cent, saldo: fin[0] });
  } catch {
    await cliente.query("ROLLBACK").catch(() => {
    });
    return enCasa("Algo se nos quem\xF3 del lado de la cocina. No es culpa tuya. Ya lo estamos viendo.", 500);
  } finally {
    c.executionCtx.waitUntil(cliente.end());
  }
});
app.post("/api/beneficio/:clase", async (c) => {
  const clase = c.req.param("clase");
  if (clase !== "bebida_dia" && clase !== "bolsa_mes") return enCasa("Ese beneficio no existe.", 404);
  const sql = neon(c.env.DATABASE_URL);
  const [m] = await sql`
    SELECT m.id FROM membresia m JOIN socio s ON s.id = m.socio_id
    WHERE s.telefono = ${c.get("sesion").tel} AND m.estado IN ('activa', 'en_gracia')`;
  if (!m) return enCasa("Ese beneficio es de la Mesa Fundadora.", 403);
  const [uso] = await sql`
    INSERT INTO beneficio_uso (membresia_id, clase) VALUES (${m.id}, ${clase})
    ON CONFLICT DO NOTHING RETURNING ventana::text`;
  if (!uso) {
    return enCasa(
      clase === "bebida_dia" ? "Tu bebida de hoy ya est\xE1 servida. Ma\xF1ana hay otra." : "Tu bolsa de este mes ya la retiraste. La pr\xF3xima se aparta el primero.",
      409
    );
  }
  return c.json({ clase, ventana: uso.ventana });
});
app.post("/api/membresia/apartar", async (c) => {
  const CUOTA = CUOTA_MENSUAL;
  return enTransaccion(c, c.get("sesion").tel, async (cli, socioId, saldo) => {
    const { rows: ya } = await cli.query(
      "SELECT numero FROM membresia WHERE socio_id = $1 AND estado IN ('activa','en_gracia')",
      [socioId]
    );
    if (ya.length) {
      return new Response(JSON.stringify({ numero: ya[0].numero, yaEra: true }), {
        headers: { "content-type": "application/json" }
      });
    }
    if (saldo < CUOTA) return faltan(CUOTA - saldo);
    const { rows: nueva } = await cli.query(
      `INSERT INTO membresia (socio_id, numero, cuota, hasta)
       SELECT $1, n, $2, now() + interval '30 days'
       FROM generate_series(1, $3) AS n
       WHERE NOT EXISTS (SELECT 1 FROM membresia m WHERE m.numero = n)
       ORDER BY n LIMIT 1
       ON CONFLICT (numero) DO NOTHING
       RETURNING id, numero`,
      [socioId, CUOTA, TOTAL_SOCIOS]
    );
    if (!nueva.length) {
      return enCasa("Los cien est\xE1n tomados. Dej\xE1 tu n\xFAmero y te escribimos apenas se desocupe un lugar.", 409);
    }
    const { rows: restan } = await cli.query(
      "SELECT $1::int - count(*)::int AS n FROM membresia WHERE estado IN ('activa','en_gracia')",
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
  const sql = neon(c.env.DATABASE_URL);
  const [socio] = await sql`SELECT id FROM socio WHERE telefono = ${tel}`;
  if (!socio) return enCasa("No encontramos esa cuenta.", 404);
  const [m] = await sql`
    UPDATE membresia SET autorenueva = false
    WHERE socio_id = ${socio.id} AND estado IN ('activa', 'en_gracia')
    RETURNING numero, hasta`;
  if (!m) return enCasa("No ten\xE9s una membres\xEDa activa.", 409);
  return c.json({ cancelada: true, numero: m.numero, hasta: m.hasta });
});
app.post("/api/reserva-cosecha/apartar", async (c) => {
  const solicitud = await llaveDeSolicitud(c);
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
  });
});
app.post("/api/experiencia/:id/apartar", async (c) => {
  const id = c.req.param("id");
  const solicitud = await llaveDeSolicitud(c);
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
         SELECT 1 FROM asiento_experiencia a WHERE a.experiencia_id = $1 AND a.butaca = n)
       ORDER BY n LIMIT 1
       ON CONFLICT (experiencia_id, butaca) DO NOTHING
       RETURNING id, butaca`,
      [exp[0].id, socioId, precio, exp[0].cupos]
    );
    if (!butaca.length) {
      return enCasa("Se llen\xF3 mientras estabas pagando. Doce sillas se van r\xE1pido. No te cobramos nada.", 409);
    }
    const { rows: libres } = await cli.query(
      "SELECT $1::int - count(*)::int AS n FROM asiento_experiencia WHERE experiencia_id = $2",
      [exp[0].cupos, exp[0].id]
    );
    return {
      monto: precio,
      concepto: "Experiencia \xB7 " + exp[0].id,
      ref: solicitud ?? "exp:" + butaca[0].id,
      datos: { butaca: butaca[0].butaca, quedan: Number(libres[0].n) }
    };
  });
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
  if (!zona || !ZONAS_VALIDAS.includes(zona)) return enCasa("Esa zona no existe en la casa.");
  const inicio = new Date(String(cuando));
  if (Number.isNaN(inicio.getTime())) return enCasa("Esa fecha no nos cuadra.");
  const ahora = Date.now();
  if (inicio.getTime() < ahora + 30 * 6e4) {
    return enCasa("Apart\xE1 con al menos media hora de anticipaci\xF3n. Para algo m\xE1s pronto, escribinos.");
  }
  if (inicio.getTime() > ahora + 90 * 864e5) {
    return enCasa("Abrimos la agenda con noventa d\xEDas. M\xE1s all\xE1, escribinos y lo anotamos a mano.");
  }
  const hManagua = new Date(inicio.getTime() - 6 * 36e5).getUTCHours();
  const domingo = new Date(inicio.getTime() - 6 * 36e5).getUTCDay() === 0;
  if (hManagua < (domingo ? 8 : 7) || hManagua >= 21) {
    return enCasa("A esa hora la casa est\xE1 cerrada. Abrimos de 7 a 21, y los domingos desde las 8.");
  }
  const duracion = Math.round(Number(horas) || 2);
  if (duracion < 1 || duracion > 6) return enCasa("Las mesas se apartan de una a seis horas.");
  if (hManagua + duracion > 21) {
    return enCasa("Esa mesa se pasar\xEDa de la hora de cierre. Prob\xE1 m\xE1s temprano o menos horas.");
  }
  const gente = Math.round(Number(personas) || 0);
  if (gente < 1 || gente > 12) return enCasa("Decinos para cu\xE1ntos, entre 1 y 12.");
  const deposito = ZONAS.find((z) => z.id === zona)?.deposito ?? 0;
  const fin = new Date(inicio.getTime() + duracion * 36e5);
  return enTransaccion(c, c.get("sesion").tel, async (cli, socioId, saldo) => {
    if (deposito > 0 && saldo < deposito) return faltan(deposito - saldo);
    const { rows: repetida } = await cli.query(
      `SELECT id, zona, cuando, termina, personas, deposito FROM reserva
       WHERE socio_id = $1 AND zona = $2 AND cuando = $3 AND cancelada IS NULL`,
      [socioId, zona, inicio.toISOString()]
    );
    if (repetida.length) {
      return { monto: 0, concepto: "", ref: "", datos: { reserva: repetida[0], yaEstaba: true } };
    }
    const { rows: ocupadas } = await cli.query(
      `SELECT count(*)::int AS n FROM reserva
       WHERE zona = $1 AND cancelada IS NULL AND cuando < $3 AND termina > $2
       FOR UPDATE`,
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
app.get("/api/panel", async (c) => {
  if (!esLaCasa(c)) {
    return enCasa("El Mostrador es para la casa.", 403);
  }
  const sql = neon(c.env.DATABASE_URL);
  const [flotante] = await sql`
    SELECT COALESCE(SUM(monto), 0)::int AS total,
           COALESCE(SUM(monto) FILTER (WHERE tipo <> 'bono'), 0)::int AS pagado,
           COALESCE(SUM(monto) FILTER (WHERE tipo = 'bono'), 0)::int AS bono
    FROM asiento`;
  const [socios] = await sql`SELECT count(*)::int AS n FROM membresia WHERE estado IN ('activa', 'en_gracia')`;
  const [bolsas] = await sql`SELECT count(*)::int AS n FROM reserva_cosecha WHERE apartada IS NOT NULL`;
  const [butacas] = await sql`SELECT count(*)::int AS n FROM asiento_experiencia`;
  const cuadre = await sql`SELECT * FROM cuadre WHERE filas > 0`;
  const [visitas] = await sql`
    SELECT count(*)::int AS sellos, count(DISTINCT t.socio_id)::int AS socios
    FROM sello s JOIN tanda t ON t.id = s.tanda_id
    WHERE s.puesto > now() - interval '30 days'`;
  const [bajas] = await sql`
    SELECT count(*) FILTER (WHERE NOT autorenueva)::int AS salen, count(*)::int AS total
    FROM membresia WHERE estado IN ('activa', 'en_gracia')`;
  const [gasto] = await sql`
    SELECT COALESCE(-SUM(monto), 0)::int AS centavos, count(*)::int AS movimientos
    FROM asiento WHERE tipo = 'consumo' AND creado > now() - interval '30 days'`;
  const activos = Number(visitas?.socios ?? 0);
  return c.json({
    flotante,
    sociosFundadores: socios.n,
    bolsasApartadas: bolsas.n,
    butacasVendidas: butacas.n,
    cuadre,
    indicadores: {
      visitasPorSocio: activos ? Number(visitas.sellos) / activos : null,
      sociosActivos: activos,
      bajasAnunciadas: Number(bajas?.salen ?? 0),
      membresiasVivas: Number(bajas?.total ?? 0),
      gastoMes: Number(gasto?.centavos ?? 0),
      movimientosMes: Number(gasto?.movimientos ?? 0)
    }
  });
});
app.get("/api/ocupacion", async (c) => {
  const dia = c.req.query("dia") ?? (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dia)) return enCasa("Esa fecha no nos cuadra.");
  const sql = neon(c.env.DATABASE_URL);
  const filas = await sql`
    SELECT zona, hora, count(*)::int AS n
    FROM (
      SELECT r.zona,
             EXTRACT(hour FROM h)::int AS hora
      FROM reserva r,
           generate_series(
             date_trunc('hour', r.cuando AT TIME ZONE 'America/Managua'),
             (r.termina AT TIME ZONE 'America/Managua') - interval '1 microsecond',
             interval '1 hour'
           ) AS h
      WHERE r.cancelada IS NULL
        AND (h)::date = ${dia}::date
    ) AS tramos
    GROUP BY zona, hora`;
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
var index_default = app;
export {
  index_default as default
};
