'use strict';

function noop() { }
function run(fn) {
    return fn();
}
function blank_object() {
    return Object.create(null);
}
function run_all(fns) {
    fns.forEach(run);
}
function is_function(thing) {
    return typeof thing === 'function';
}
function safe_not_equal(a, b) {
    return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
}
function subscribe(store, ...callbacks) {
    if (store == null) {
        return noop;
    }
    const unsub = store.subscribe(...callbacks);
    return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
}

let current_component;
function set_current_component(component) {
    current_component = component;
}
function get_current_component() {
    if (!current_component)
        throw new Error('Function called outside component initialization');
    return current_component;
}
function onMount(fn) {
    get_current_component().$$.on_mount.push(fn);
}
function onDestroy(fn) {
    get_current_component().$$.on_destroy.push(fn);
}
function setContext(key, context) {
    get_current_component().$$.context.set(key, context);
}
function getContext(key) {
    return get_current_component().$$.context.get(key);
}
Promise.resolve();
const escaped = {
    '"': '&quot;',
    "'": '&#39;',
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;'
};
function escape(html) {
    return String(html).replace(/["'&<>]/g, match => escaped[match]);
}
function each(items, fn) {
    let str = '';
    for (let i = 0; i < items.length; i += 1) {
        str += fn(items[i], i);
    }
    return str;
}
const missing_component = {
    $$render: () => ''
};
function validate_component(component, name) {
    if (!component || !component.$$render) {
        if (name === 'svelte:component')
            name += ' this={...}';
        throw new Error(`<${name}> is not a valid SSR component. You may need to review your build config to ensure that dependencies are compiled, rather than imported as pre-compiled modules`);
    }
    return component;
}
let on_destroy;
function create_ssr_component(fn) {
    function $$render(result, props, bindings, slots, context) {
        const parent_component = current_component;
        const $$ = {
            on_destroy,
            context: new Map(context || (parent_component ? parent_component.$$.context : [])),
            // these will be immediately discarded
            on_mount: [],
            before_update: [],
            after_update: [],
            callbacks: blank_object()
        };
        set_current_component({ $$ });
        const html = fn(result, props, bindings, slots);
        set_current_component(parent_component);
        return html;
    }
    return {
        render: (props = {}, { $$slots = {}, context = new Map() } = {}) => {
            on_destroy = [];
            const result = { title: '', head: '', css: new Set() };
            const html = $$render(result, props, {}, $$slots, context);
            run_all(on_destroy);
            return {
                html,
                css: {
                    code: Array.from(result.css).map(css => css.code).join('\n'),
                    map: null // TODO
                },
                head: result.title + result.head
            };
        },
        $$render
    };
}
function add_attribute(name, value, boolean) {
    if (value == null || (boolean && !value))
        return '';
    return ` ${name}${value === true ? '' : `=${typeof value === 'string' ? JSON.stringify(escape(value)) : `"${value}"`}`}`;
}

const subscriber_queue = [];
/**
 * Creates a `Readable` store that allows reading by subscription.
 * @param value initial value
 * @param {StartStopNotifier}start start and stop notifications for subscriptions
 */
function readable(value, start) {
    return {
        subscribe: writable(value, start).subscribe
    };
}
/**
 * Create a `Writable` store that allows both updating and reading by subscription.
 * @param {*=}value initial value
 * @param {StartStopNotifier=}start start and stop notifications for subscriptions
 */
function writable(value, start = noop) {
    let stop;
    const subscribers = new Set();
    function set(new_value) {
        if (safe_not_equal(value, new_value)) {
            value = new_value;
            if (stop) { // store is ready
                const run_queue = !subscriber_queue.length;
                for (const subscriber of subscribers) {
                    subscriber[1]();
                    subscriber_queue.push(subscriber, value);
                }
                if (run_queue) {
                    for (let i = 0; i < subscriber_queue.length; i += 2) {
                        subscriber_queue[i][0](subscriber_queue[i + 1]);
                    }
                    subscriber_queue.length = 0;
                }
            }
        }
    }
    function update(fn) {
        set(fn(value));
    }
    function subscribe(run, invalidate = noop) {
        const subscriber = [run, invalidate];
        subscribers.add(subscriber);
        if (subscribers.size === 1) {
            stop = start(set) || noop;
        }
        run(value);
        return () => {
            subscribers.delete(subscriber);
            if (subscribers.size === 0) {
                stop();
                stop = null;
            }
        };
    }
    return { set, update, subscribe };
}
function derived(stores, fn, initial_value) {
    const single = !Array.isArray(stores);
    const stores_array = single
        ? [stores]
        : stores;
    const auto = fn.length < 2;
    return readable(initial_value, (set) => {
        let inited = false;
        const values = [];
        let pending = 0;
        let cleanup = noop;
        const sync = () => {
            if (pending) {
                return;
            }
            cleanup();
            const result = fn(single ? values[0] : values, set);
            if (auto) {
                set(result);
            }
            else {
                cleanup = is_function(result) ? result : noop;
            }
        };
        const unsubscribers = stores_array.map((store, i) => subscribe(store, (value) => {
            values[i] = value;
            pending &= ~(1 << i);
            if (inited) {
                sync();
            }
        }, () => {
            pending |= (1 << i);
        }));
        inited = true;
        sync();
        return function stop() {
            run_all(unsubscribers);
            cleanup();
        };
    });
}

const LOCATION = {};
const ROUTER = {};

/**
 * Adapted from https://github.com/reach/router/blob/b60e6dd781d5d3a4bdaaf4de665649c0f6a7e78d/src/lib/history.js
 *
 * https://github.com/reach/router/blob/master/LICENSE
 * */

function getLocation(source) {
  return {
    ...source.location,
    state: source.history.state,
    key: (source.history.state && source.history.state.key) || "initial"
  };
}

function createHistory(source, options) {
  const listeners = [];
  let location = getLocation(source);

  return {
    get location() {
      return location;
    },

    listen(listener) {
      listeners.push(listener);

      const popstateListener = () => {
        location = getLocation(source);
        listener({ location, action: "POP" });
      };

      source.addEventListener("popstate", popstateListener);

      return () => {
        source.removeEventListener("popstate", popstateListener);

        const index = listeners.indexOf(listener);
        listeners.splice(index, 1);
      };
    },

    navigate(to, { state, replace = false } = {}) {
      state = { ...state, key: Date.now() + "" };
      // try...catch iOS Safari limits to 100 pushState calls
      try {
        if (replace) {
          source.history.replaceState(state, null, to);
        } else {
          source.history.pushState(state, null, to);
        }
      } catch (e) {
        source.location[replace ? "replace" : "assign"](to);
      }

      location = getLocation(source);
      listeners.forEach(listener => listener({ location, action: "PUSH" }));
    }
  };
}

// Stores history entries in memory for testing or other platforms like Native
function createMemorySource(initialPathname = "/") {
  let index = 0;
  const stack = [{ pathname: initialPathname, search: "" }];
  const states = [];

  return {
    get location() {
      return stack[index];
    },
    addEventListener(name, fn) {},
    removeEventListener(name, fn) {},
    history: {
      get entries() {
        return stack;
      },
      get index() {
        return index;
      },
      get state() {
        return states[index];
      },
      pushState(state, _, uri) {
        const [pathname, search = ""] = uri.split("?");
        index++;
        stack.push({ pathname, search });
        states.push(state);
      },
      replaceState(state, _, uri) {
        const [pathname, search = ""] = uri.split("?");
        stack[index] = { pathname, search };
        states[index] = state;
      }
    }
  };
}

// Global history uses window.history as the source if available,
// otherwise a memory history
const canUseDOM = Boolean(
  typeof window !== "undefined" &&
    window.document &&
    window.document.createElement
);
const globalHistory = createHistory(canUseDOM ? window : createMemorySource());

/**
 * Adapted from https://github.com/reach/router/blob/b60e6dd781d5d3a4bdaaf4de665649c0f6a7e78d/src/lib/utils.js
 *
 * https://github.com/reach/router/blob/master/LICENSE
 * */

const paramRe = /^:(.+)/;

const SEGMENT_POINTS = 4;
const STATIC_POINTS = 3;
const DYNAMIC_POINTS = 2;
const SPLAT_PENALTY = 1;
const ROOT_POINTS = 1;

/**
 * Check if `segment` is a root segment
 * @param {string} segment
 * @return {boolean}
 */
function isRootSegment(segment) {
  return segment === "";
}

/**
 * Check if `segment` is a dynamic segment
 * @param {string} segment
 * @return {boolean}
 */
function isDynamic(segment) {
  return paramRe.test(segment);
}

/**
 * Check if `segment` is a splat
 * @param {string} segment
 * @return {boolean}
 */
function isSplat(segment) {
  return segment[0] === "*";
}

/**
 * Split up the URI into segments delimited by `/`
 * @param {string} uri
 * @return {string[]}
 */
function segmentize(uri) {
  return (
    uri
      // Strip starting/ending `/`
      .replace(/(^\/+|\/+$)/g, "")
      .split("/")
  );
}

/**
 * Strip `str` of potential start and end `/`
 * @param {string} str
 * @return {string}
 */
function stripSlashes(str) {
  return str.replace(/(^\/+|\/+$)/g, "");
}

/**
 * Score a route depending on how its individual segments look
 * @param {object} route
 * @param {number} index
 * @return {object}
 */
function rankRoute(route, index) {
  const score = route.default
    ? 0
    : segmentize(route.path).reduce((score, segment) => {
        score += SEGMENT_POINTS;

        if (isRootSegment(segment)) {
          score += ROOT_POINTS;
        } else if (isDynamic(segment)) {
          score += DYNAMIC_POINTS;
        } else if (isSplat(segment)) {
          score -= SEGMENT_POINTS + SPLAT_PENALTY;
        } else {
          score += STATIC_POINTS;
        }

        return score;
      }, 0);

  return { route, score, index };
}

/**
 * Give a score to all routes and sort them on that
 * @param {object[]} routes
 * @return {object[]}
 */
function rankRoutes(routes) {
  return (
    routes
      .map(rankRoute)
      // If two routes have the exact same score, we go by index instead
      .sort((a, b) =>
        a.score < b.score ? 1 : a.score > b.score ? -1 : a.index - b.index
      )
  );
}

/**
 * Ranks and picks the best route to match. Each segment gets the highest
 * amount of points, then the type of segment gets an additional amount of
 * points where
 *
 *  static > dynamic > splat > root
 *
 * This way we don't have to worry about the order of our routes, let the
 * computers do it.
 *
 * A route looks like this
 *
 *  { path, default, value }
 *
 * And a returned match looks like:
 *
 *  { route, params, uri }
 *
 * @param {object[]} routes
 * @param {string} uri
 * @return {?object}
 */
function pick(routes, uri) {
  let match;
  let default_;

  const [uriPathname] = uri.split("?");
  const uriSegments = segmentize(uriPathname);
  const isRootUri = uriSegments[0] === "";
  const ranked = rankRoutes(routes);

  for (let i = 0, l = ranked.length; i < l; i++) {
    const route = ranked[i].route;
    let missed = false;

    if (route.default) {
      default_ = {
        route,
        params: {},
        uri
      };
      continue;
    }

    const routeSegments = segmentize(route.path);
    const params = {};
    const max = Math.max(uriSegments.length, routeSegments.length);
    let index = 0;

    for (; index < max; index++) {
      const routeSegment = routeSegments[index];
      const uriSegment = uriSegments[index];

      if (routeSegment !== undefined && isSplat(routeSegment)) {
        // Hit a splat, just grab the rest, and return a match
        // uri:   /files/documents/work
        // route: /files/* or /files/*splatname
        const splatName = routeSegment === "*" ? "*" : routeSegment.slice(1);

        params[splatName] = uriSegments
          .slice(index)
          .map(decodeURIComponent)
          .join("/");
        break;
      }

      if (uriSegment === undefined) {
        // URI is shorter than the route, no match
        // uri:   /users
        // route: /users/:userId
        missed = true;
        break;
      }

      let dynamicMatch = paramRe.exec(routeSegment);

      if (dynamicMatch && !isRootUri) {
        const value = decodeURIComponent(uriSegment);
        params[dynamicMatch[1]] = value;
      } else if (routeSegment !== uriSegment) {
        // Current segments don't match, not dynamic, not splat, so no match
        // uri:   /users/123/settings
        // route: /users/:id/profile
        missed = true;
        break;
      }
    }

    if (!missed) {
      match = {
        route,
        params,
        uri: "/" + uriSegments.slice(0, index).join("/")
      };
      break;
    }
  }

  return match || default_ || null;
}

/**
 * Check if the `path` matches the `uri`.
 * @param {string} path
 * @param {string} uri
 * @return {?object}
 */
function match(route, uri) {
  return pick([route], uri);
}

/**
 * Combines the `basepath` and the `path` into one path.
 * @param {string} basepath
 * @param {string} path
 */
function combinePaths(basepath, path) {
  return `${stripSlashes(
    path === "/" ? basepath : `${stripSlashes(basepath)}/${stripSlashes(path)}`
  )}/`;
}

/* node_modules/svelte-routing/src/Router.svelte generated by Svelte v3.44.2 */

const Router = create_ssr_component(($$result, $$props, $$bindings, slots) => {
	let $location, $$unsubscribe_location;
	let $routes, $$unsubscribe_routes;
	let $base, $$unsubscribe_base;
	let { basepath = "/" } = $$props;
	let { url = null } = $$props;
	const locationContext = getContext(LOCATION);
	const routerContext = getContext(ROUTER);
	const routes = writable([]);
	$$unsubscribe_routes = subscribe(routes, value => $routes = value);
	const activeRoute = writable(null);
	let hasActiveRoute = false; // Used in SSR to synchronously set that a Route is active.

	// If locationContext is not set, this is the topmost Router in the tree.
	// If the `url` prop is given we force the location to it.
	const location = locationContext || writable(url ? { pathname: url } : globalHistory.location);

	$$unsubscribe_location = subscribe(location, value => $location = value);

	// If routerContext is set, the routerBase of the parent Router
	// will be the base for this Router's descendants.
	// If routerContext is not set, the path and resolved uri will both
	// have the value of the basepath prop.
	const base = routerContext
	? routerContext.routerBase
	: writable({ path: basepath, uri: basepath });

	$$unsubscribe_base = subscribe(base, value => $base = value);

	const routerBase = derived([base, activeRoute], ([base, activeRoute]) => {
		// If there is no activeRoute, the routerBase will be identical to the base.
		if (activeRoute === null) {
			return base;
		}

		const { path: basepath } = base;
		const { route, uri } = activeRoute;

		// Remove the potential /* or /*splatname from
		// the end of the child Routes relative paths.
		const path = route.default
		? basepath
		: route.path.replace(/\*.*$/, "");

		return { path, uri };
	});

	function registerRoute(route) {
		const { path: basepath } = $base;
		let { path } = route;

		// We store the original path in the _path property so we can reuse
		// it when the basepath changes. The only thing that matters is that
		// the route reference is intact, so mutation is fine.
		route._path = path;

		route.path = combinePaths(basepath, path);

		if (typeof window === "undefined") {
			// In SSR we should set the activeRoute immediately if it is a match.
			// If there are more Routes being registered after a match is found,
			// we just skip them.
			if (hasActiveRoute) {
				return;
			}

			const matchingRoute = match(route, $location.pathname);

			if (matchingRoute) {
				activeRoute.set(matchingRoute);
				hasActiveRoute = true;
			}
		} else {
			routes.update(rs => {
				rs.push(route);
				return rs;
			});
		}
	}

	function unregisterRoute(route) {
		routes.update(rs => {
			const index = rs.indexOf(route);
			rs.splice(index, 1);
			return rs;
		});
	}

	if (!locationContext) {
		// The topmost Router in the tree is responsible for updating
		// the location store and supplying it through context.
		onMount(() => {
			const unlisten = globalHistory.listen(history => {
				location.set(history.location);
			});

			return unlisten;
		});

		setContext(LOCATION, location);
	}

	setContext(ROUTER, {
		activeRoute,
		base,
		routerBase,
		registerRoute,
		unregisterRoute
	});

	if ($$props.basepath === void 0 && $$bindings.basepath && basepath !== void 0) $$bindings.basepath(basepath);
	if ($$props.url === void 0 && $$bindings.url && url !== void 0) $$bindings.url(url);

	{
		{
			const { path: basepath } = $base;

			routes.update(rs => {
				rs.forEach(r => r.path = combinePaths(basepath, r._path));
				return rs;
			});
		}
	}

	{
		{
			const bestMatch = pick($routes, $location.pathname);
			activeRoute.set(bestMatch);
		}
	}

	$$unsubscribe_location();
	$$unsubscribe_routes();
	$$unsubscribe_base();
	return `${slots.default ? slots.default({}) : ``}`;
});

/* node_modules/svelte-routing/src/Route.svelte generated by Svelte v3.44.2 */

const Route = create_ssr_component(($$result, $$props, $$bindings, slots) => {
	let $activeRoute, $$unsubscribe_activeRoute;
	let $location, $$unsubscribe_location;
	let { path = "" } = $$props;
	let { component = null } = $$props;
	const { registerRoute, unregisterRoute, activeRoute } = getContext(ROUTER);
	$$unsubscribe_activeRoute = subscribe(activeRoute, value => $activeRoute = value);
	const location = getContext(LOCATION);
	$$unsubscribe_location = subscribe(location, value => $location = value);

	const route = {
		path,
		// If no path prop is given, this Route will act as the default Route
		// that is rendered if no other Route in the Router is a match.
		default: path === ""
	};

	let routeParams = {};
	let routeProps = {};
	registerRoute(route);

	// There is no need to unregister Routes in SSR since it will all be
	// thrown away anyway.
	if (typeof window !== "undefined") {
		onDestroy(() => {
			unregisterRoute(route);
		});
	}

	if ($$props.path === void 0 && $$bindings.path && path !== void 0) $$bindings.path(path);
	if ($$props.component === void 0 && $$bindings.component && component !== void 0) $$bindings.component(component);

	{
		if ($activeRoute && $activeRoute.route === route) {
			routeParams = $activeRoute.params;
		}
	}

	{
		{
			const { path, component, ...rest } = $$props;
			routeProps = rest;
		}
	}

	$$unsubscribe_activeRoute();
	$$unsubscribe_location();

	return `${$activeRoute !== null && $activeRoute.route === route
	? `${component !== null
		? `${validate_component(component || missing_component, "svelte:component").$$render($$result, Object.assign({ location: $location }, routeParams, routeProps), {}, {})}`
		: `${slots.default
			? slots.default({ params: routeParams, location: $location })
			: ``}`}`
	: ``}`;
});

/* src/layout/SearchBar.svelte generated by Svelte v3.44.2 */

const css$1 = {
	code: "#search_filter_box.svelte-biaex5+div.svelte-biaex5{display:none}#search_filter_box.svelte-biaex5:checked+div.svelte-biaex5{display:block}",
<<<<<<< HEAD
	map: "{\"version\":3,\"file\":\"SearchBar.svelte\",\"sources\":[\"SearchBar.svelte\"],\"sourcesContent\":[\"<script>\\n  let query = \\\"\\\";\\n\\n</script>\\n\\n<form>\\n  <input type=\\\"texte\\\" alt=\\\"Champ de recherche d'une archive\\\" value=\\\"\\\" placeholder=\\\"Entrez votre recherche\\\" />\\n  <input type=\\\"button\\\" alt=\\\"Valider la recherche\\\" value=\\\"🔍\\\" />\\n  <label for=\\\"search_filter_box\\\">Filtrer</label><input alt=\\\"Activer pour filtrer la recherche\\\" id=\\\"search_filter_box\\\" type=\\\"checkbox\\\" />\\n  <div>\\n    <input type=\\\"checkbox\\\" id=\\\"filtre_sauve\\\" alt=\\\"Inclure les sauvetages\\\" /><label for=\\\"filtre_sauve\\\" >Personnes sauvées</label>\\n    <input type=\\\"checkbox\\\" id=\\\"filtre_sauveteur\\\" alt=\\\"Inclure les sauveteur\\\" /><label for=\\\"filtre_sauveteur\\\" >Sauveteur</label>\\n    <input type=\\\"checkbox\\\" id=\\\"filtre_bateau\\\" /><label for=\\\"filtre_bateau\\\" >Bateau</label>\\n    <input type=\\\"checkbox\\\" id=\\\"filtre_sauvetage\\\" /><label for=\\\"filtre_sauvetage\\\" >Sauvetage</label>\\n  </div>\\n</form>\\n\\n\\n<style>\\n  #search_filter_box + div{\\n    display:none;\\n  }\\n  #search_filter_box:checked + div{\\n    display: block;\\n  }\\n</style>\\n\"],\"names\":[],\"mappings\":\"AAmBE,gCAAkB,CAAG,iBAAG,CAAC,AACvB,QAAQ,IAAI,AACd,CAAC,AACD,gCAAkB,QAAQ,CAAG,iBAAG,CAAC,AAC/B,OAAO,CAAE,KAAK,AAChB,CAAC\"}"
};

const SearchBar = create_ssr_component(($$result, $$props, $$bindings, slots) => {
	$$result.css.add(css$1);
=======
	map: "{\"version\":3,\"file\":\"SearchBar.svelte\",\"sources\":[\"SearchBar.svelte\"],\"sourcesContent\":[\"<script>\\r\\n  import {navigate} from 'svelte-routing';\\r\\n  let query = \\\"\\\";\\r\\n\\r\\n  let filter = false;\\r\\n  let sauve = false;\\r\\n  let sauveteur = false;\\r\\n  let sauvetage = false;\\r\\n  let bateau = false;\\r\\n\\r\\n  function send(e){\\r\\n    let nb = 1*sauve+2*sauveteur+4*sauvetage+8*bateau;\\r\\n    navigate(\\\"/search/\\\"+encodeURI(query)+\\\"/\\\"+nb.toString())\\r\\n  }\\r\\n</script>\\r\\n\\r\\n<form>\\r\\n  <input type=\\\"texte\\\" alt=\\\"Champ de recherche d'une archive\\\" bind:value={query} placeholder=\\\"Entrez votre recherche\\\" />\\r\\n  <input type=\\\"button\\\" alt=\\\"Valider la recherche\\\" value=\\\"🔍\\\" on:click={send} />\\r\\n  <label for=\\\"search_filter_box\\\">Filtrer</label><input alt=\\\"Activer pour filtrer la recherche\\\" id=\\\"search_filter_box\\\" type=\\\"checkbox\\\" />\\r\\n  <div>\\r\\n    <input type=\\\"checkbox\\\" bind:value={sauve} id=\\\"filtre_sauve\\\" alt=\\\"Filtre: Inclure les sauvés\\\" /><label for=\\\"filtre_sauve\\\" >Personnes sauvées</label>\\r\\n    <input type=\\\"checkbox\\\" bind:value={sauveteur} id=\\\"filtre_sauveteur\\\" alt=\\\"Filtre: Inclure les sauveteur\\\" /><label for=\\\"filtre_sauveteur\\\" >Sauveteur</label>\\r\\n    <input type=\\\"checkbox\\\" bind:value={bateau} id=\\\"filtre_bateau\\\" alt=\\\"Filtre: Inclure les bateaux\\\" /><label for=\\\"filtre_bateau\\\" >Bateau</label>\\r\\n    <input type=\\\"checkbox\\\" bind:value={sauvetage} id=\\\"filtre_sauvetage\\\" alt=\\\"Filtre: Inclure les sauvetages\\\" /><label for=\\\"filtre_sauvetage\\\" >Sauvetage</label>\\r\\n  </div>\\r\\n</form>\\r\\n\\r\\n\\r\\n<style>\\r\\n  #search_filter_box + div{\\r\\n    display:none;\\r\\n  }\\r\\n  #search_filter_box:checked + div{\\r\\n    display: block;\\r\\n  }\\r\\n</style>\\r\\n\"],\"names\":[],\"mappings\":\"AA8BE,gCAAkB,CAAG,iBAAG,CAAC,AACvB,QAAQ,IAAI,AACd,CAAC,AACD,gCAAkB,QAAQ,CAAG,iBAAG,CAAC,AAC/B,OAAO,CAAE,KAAK,AAChB,CAAC\"}"
};

const SearchBar = create_ssr_component(($$result, $$props, $$bindings, slots) => {
	let query = "";
	let sauve = false;
	let sauveteur = false;
	let sauvetage = false;
	let bateau = false;

	$$result.css.add(css);
>>>>>>> c25d6fb0b00b6b7e73c686a4a86ef77f7eb1b380

	return `<form><input type="${"texte"}" alt="${"Champ de recherche d'une archive"}" placeholder="${"Entrez votre recherche"}"${add_attribute("value", query, 0)}>
  <input type="${"button"}" alt="${"Valider la recherche"}" value="${"🔍"}">
  <label for="${"search_filter_box"}">Filtrer</label><input alt="${"Activer pour filtrer la recherche"}" id="${"search_filter_box"}" type="${"checkbox"}" class="${"svelte-biaex5"}">
  <div class="${"svelte-biaex5"}"><input type="${"checkbox"}" id="${"filtre_sauve"}" alt="${"Filtre: Inclure les sauvés"}"${add_attribute("value", sauve, 0)}><label for="${"filtre_sauve"}">Personnes sauvées</label>
    <input type="${"checkbox"}" id="${"filtre_sauveteur"}" alt="${"Filtre: Inclure les sauveteur"}"${add_attribute("value", sauveteur, 0)}><label for="${"filtre_sauveteur"}">Sauveteur</label>
    <input type="${"checkbox"}" id="${"filtre_bateau"}" alt="${"Filtre: Inclure les bateaux"}"${add_attribute("value", bateau, 0)}><label for="${"filtre_bateau"}">Bateau</label>
    <input type="${"checkbox"}" id="${"filtre_sauvetage"}" alt="${"Filtre: Inclure les sauvetages"}"${add_attribute("value", sauvetage, 0)}><label for="${"filtre_sauvetage"}">Sauvetage</label></div>
</form>`;
});

<<<<<<< HEAD
/* src/layout/Header.svelte generated by Svelte v3.44.2 */

const css = {
	code: "header.svelte-hlqhou{background-color:rgb(2, 18, 43);margin:0}",
	map: "{\"version\":3,\"file\":\"Header.svelte\",\"sources\":[\"Header.svelte\"],\"sourcesContent\":[\"<header>\\n    <main>\\n      <img \\n     src=\\\"./img/corsaire.png\\\"\\n     alt=\\\"logo corsaire dunkerquois\\\">\\n        <form>\\n        </form>\\n        \\n      </main>\\n</header>\\n\\n<style>\\n  header {\\n\\tbackground-color: rgb(2, 18, 43);\\n\\tmargin : 0;\\n}\\n</style>\"],\"names\":[],\"mappings\":\"AAYE,MAAM,cAAC,CAAC,AACT,gBAAgB,CAAE,IAAI,CAAC,CAAC,CAAC,EAAE,CAAC,CAAC,EAAE,CAAC,CAChC,MAAM,CAAG,CAAC,AACX,CAAC\"}"
};

const Header = create_ssr_component(($$result, $$props, $$bindings, slots) => {
	$$result.css.add(css);

	return `<header class="${"svelte-hlqhou"}"><main><img src="${"./img/corsaire.png"}" alt="${"logo corsaire dunkerquois"}">
        <form></form></main>
</header>`;
=======
/* src\routes\Search.svelte generated by Svelte v3.44.2 */

const Search = create_ssr_component(($$result, $$props, $$bindings, slots) => {
	const query = "";
	const filters = "0";
	let reqdata = [];

	function send(e) {
		let f = parseInt(filters);
		const filter_all = ["SAUVE", "SAUVETEUR", "SAUVETAGE", "BATEAU"];
		let filter_tab = [];
		let i;

		for (i of filter_all) {
			if (f % 2 != 1) filter_tab.push(i);
			f = (f - f % 2) / 2;
		}

		let data = { types: filter_tab, search: query };

		let option = {
			method: 'POST', // *GET, POST, PUT, DELETE, etc.
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(data)
		};

		fetch("/api/search", option).then(function (res) {
			res.json().then(json => {
				reqdata = json;
			});
		});
	}

	onMount(send);
	if ($$props.query === void 0 && $$bindings.query && query !== void 0) $$bindings.query(query);
	if ($$props.filters === void 0 && $$bindings.filters && filters !== void 0) $$bindings.filters(filters);

	return `<div>${each(reqdata, dat => `<div><h1>${escape(dat.title)}</h1>
      <p>${escape(dat.desc)}</p>
    </div>`)}</div>`;
});

/* src\layout\Header.svelte generated by Svelte v3.44.2 */

const Header = create_ssr_component(($$result, $$props, $$bindings, slots) => {
	return `<header><img src="${"./img/corsaire.png"}" alt="${"logo corsaire dunkerquois"}">
    ${validate_component(SearchBar, "SearchBar").$$render($$result, {}, {}, {})}</header>`;
>>>>>>> c25d6fb0b00b6b7e73c686a4a86ef77f7eb1b380
});

/* src/layout/Personnes.svelte generated by Svelte v3.44.2 */

const Personnes = create_ssr_component(($$result, $$props, $$bindings, slots) => {
	return `<table><tr><th>Noms</th>
      <th>Prénoms</th>
      <th>Date de Naissance</th></tr>
    <tr><td>jean-Pierre</td>
      <td>Polraneg</td>
      <td>03/12/1982
      </td></tr></table>`;
});

/* src/App.svelte generated by Svelte v3.44.2 */

const App = create_ssr_component(($$result, $$props, $$bindings, slots) => {
	let { url = "" } = $$props;
	if ($$props.url === void 0 && $$bindings.url && url !== void 0) $$bindings.url(url);

	return `

${validate_component(Header, "Header").$$render($$result, {}, {}, {})}
${validate_component(Router, "Router").$$render($$result, { url }, {}, {
		default: () => `${validate_component(Route, "Route").$$render($$result, { path: "debug" }, {}, {
			default: () => `${validate_component(SearchBar, "Searchbar").$$render($$result, {}, {}, {})}`
		})}
  ${validate_component(Route, "Route").$$render($$result, { path: "search/:query/:filters" }, {}, {
			default: ({ params }) => `${validate_component(Search, "Search").$$render(
				$$result,
				{
					query: params.query,
					filter: params.filters
				},
				{},
				{}
			)}`
		})}
  ${validate_component(Route, "Route").$$render($$result, { path: "debug_arthaud" }, {}, {
			default: () => `${validate_component(Personnes, "Personnes").$$render($$result, {}, {}, {})}`
		})}`
	})}`;
});

module.exports = App;
