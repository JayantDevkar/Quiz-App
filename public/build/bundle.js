
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
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
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot_base(slot, slot_definition, ctx, $$scope, slot_changes, get_slot_context_fn) {
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function get_all_dirty_from_scope($$scope) {
        if ($$scope.ctx.length > 32) {
            const dirty = [];
            const length = $$scope.ctx.length / 32;
            for (let i = 0; i < length; i++) {
                dirty[i] = -1;
            }
            return dirty;
        }
        return -1;
    }
    function exclude_internal_props(props) {
        const result = {};
        for (const k in props)
            if (k[0] !== '$')
                result[k] = props[k];
        return result;
    }
    function compute_rest_props(props, keys) {
        const rest = {};
        keys = new Set(keys);
        for (const k in props)
            if (!keys.has(k) && k[0] !== '$')
                rest[k] = props[k];
        return rest;
    }
    function action_destroyer(action_result) {
        return action_result && is_function(action_result.destroy) ? action_result.destroy : noop;
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function get_root_for_style(node) {
        if (!node)
            return document;
        const root = node.getRootNode ? node.getRootNode() : node.ownerDocument;
        if (root && root.host) {
            return root;
        }
        return node.ownerDocument;
    }
    function append_empty_stylesheet(node) {
        const style_element = element('style');
        append_stylesheet(get_root_for_style(node), style_element);
        return style_element.sheet;
    }
    function append_stylesheet(node, style) {
        append(node.head || node, style);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function set_attributes(node, attributes) {
        // @ts-ignore
        const descriptors = Object.getOwnPropertyDescriptors(node.__proto__);
        for (const key in attributes) {
            if (attributes[key] == null) {
                node.removeAttribute(key);
            }
            else if (key === 'style') {
                node.style.cssText = attributes[key];
            }
            else if (key === '__value') {
                node.value = node[key] = attributes[key];
            }
            else if (descriptors[key] && descriptors[key].set) {
                node[key] = attributes[key];
            }
            else {
                attr(node, key, attributes[key]);
            }
        }
    }
    function to_number(value) {
        return value === '' ? null : +value;
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function set_style(node, key, value, important) {
        if (value === null) {
            node.style.removeProperty(key);
        }
        else {
            node.style.setProperty(key, value, important ? 'important' : '');
        }
    }
    // unfortunately this can't be a constant as that wouldn't be tree-shakeable
    // so we cache the result instead
    let crossorigin;
    function is_crossorigin() {
        if (crossorigin === undefined) {
            crossorigin = false;
            try {
                if (typeof window !== 'undefined' && window.parent) {
                    void window.parent.document;
                }
            }
            catch (error) {
                crossorigin = true;
            }
        }
        return crossorigin;
    }
    function add_resize_listener(node, fn) {
        const computed_style = getComputedStyle(node);
        if (computed_style.position === 'static') {
            node.style.position = 'relative';
        }
        const iframe = element('iframe');
        iframe.setAttribute('style', 'display: block; position: absolute; top: 0; left: 0; width: 100%; height: 100%; ' +
            'overflow: hidden; border: 0; opacity: 0; pointer-events: none; z-index: -1;');
        iframe.setAttribute('aria-hidden', 'true');
        iframe.tabIndex = -1;
        const crossorigin = is_crossorigin();
        let unsubscribe;
        if (crossorigin) {
            iframe.src = "data:text/html,<script>onresize=function(){parent.postMessage(0,'*')}</script>";
            unsubscribe = listen(window, 'message', (event) => {
                if (event.source === iframe.contentWindow)
                    fn();
            });
        }
        else {
            iframe.src = 'about:blank';
            iframe.onload = () => {
                unsubscribe = listen(iframe.contentWindow, 'resize', fn);
            };
        }
        append(node, iframe);
        return () => {
            if (crossorigin) {
                unsubscribe();
            }
            else if (unsubscribe && iframe.contentWindow) {
                unsubscribe();
            }
            detach(iframe);
        };
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
        return e;
    }

    // we need to store the information for multiple documents because a Svelte application could also contain iframes
    // https://github.com/sveltejs/svelte/issues/3624
    const managed_styles = new Map();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_style_information(doc, node) {
        const info = { stylesheet: append_empty_stylesheet(node), rules: {} };
        managed_styles.set(doc, info);
        return info;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = get_root_for_style(node);
        const { stylesheet, rules } = managed_styles.get(doc) || create_style_information(doc, node);
        if (!rules[name]) {
            rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ''}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            managed_styles.forEach(info => {
                const { stylesheet } = info;
                let i = stylesheet.cssRules.length;
                while (i--)
                    stylesheet.deleteRule(i);
                info.rules = {};
            });
            managed_styles.clear();
        });
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
    function afterUpdate(fn) {
        get_current_component().$$.after_update.push(fn);
    }
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }
    function setContext(key, context) {
        get_current_component().$$.context.set(key, context);
    }
    function getContext(key) {
        return get_current_component().$$.context.get(key);
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            // @ts-ignore
            callbacks.slice().forEach(fn => fn.call(this, event));
        }
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            while (flushidx < dirty_components.length) {
                const component = dirty_components[flushidx];
                flushidx++;
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    const null_transition = { duration: 0 };
    function create_bidirectional_transition(node, fn, params, intro) {
        let config = fn(node, params);
        let t = intro ? 0 : 1;
        let running_program = null;
        let pending_program = null;
        let animation_name = null;
        function clear_animation() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function init(program, duration) {
            const d = (program.b - t);
            duration *= Math.abs(d);
            return {
                a: t,
                b: program.b,
                d,
                duration,
                start: program.start,
                end: program.start + duration,
                group: program.group
            };
        }
        function go(b) {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            const program = {
                start: now() + delay,
                b
            };
            if (!b) {
                // @ts-ignore todo: improve typings
                program.group = outros;
                outros.r += 1;
            }
            if (running_program || pending_program) {
                pending_program = program;
            }
            else {
                // if this is an intro, and there's a delay, we need to do
                // an initial tick and/or apply CSS animation immediately
                if (css) {
                    clear_animation();
                    animation_name = create_rule(node, t, b, duration, delay, easing, css);
                }
                if (b)
                    tick(0, 1);
                running_program = init(program, duration);
                add_render_callback(() => dispatch(node, b, 'start'));
                loop(now => {
                    if (pending_program && now > pending_program.start) {
                        running_program = init(pending_program, duration);
                        pending_program = null;
                        dispatch(node, running_program.b, 'start');
                        if (css) {
                            clear_animation();
                            animation_name = create_rule(node, t, running_program.b, running_program.duration, 0, easing, config.css);
                        }
                    }
                    if (running_program) {
                        if (now >= running_program.end) {
                            tick(t = running_program.b, 1 - t);
                            dispatch(node, running_program.b, 'end');
                            if (!pending_program) {
                                // we're done
                                if (running_program.b) {
                                    // intro — we can tidy up immediately
                                    clear_animation();
                                }
                                else {
                                    // outro — needs to be coordinated
                                    if (!--running_program.group.r)
                                        run_all(running_program.group.c);
                                }
                            }
                            running_program = null;
                        }
                        else if (now >= running_program.start) {
                            const p = now - running_program.start;
                            t = running_program.a + running_program.d * easing(p / running_program.duration);
                            tick(t, 1 - t);
                        }
                    }
                    return !!(running_program || pending_program);
                });
            }
        }
        return {
            run(b) {
                if (is_function(config)) {
                    wait().then(() => {
                        // @ts-ignore
                        config = config();
                        go(b);
                    });
                }
                else {
                    go(b);
                }
            },
            end() {
                clear_animation();
                running_program = pending_program = null;
            }
        };
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.46.3' }, detail), true));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev('SvelteDOMSetProperty', { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* eslint-disable no-param-reassign */

    /**
     * Options for customizing ripples
     */
    const defaults = {
      color: 'currentColor',
      class: '',
      opacity: 0.1,
      centered: false,
      spreadingDuration: '.4s',
      spreadingDelay: '0s',
      spreadingTimingFunction: 'linear',
      clearingDuration: '1s',
      clearingDelay: '0s',
      clearingTimingFunction: 'ease-in-out',
    };

    /**
     * Creates a ripple element but does not destroy it (use RippleStop for that)
     *
     * @param {Event} e
     * @param {*} options
     * @returns Ripple element
     */
    function RippleStart(e, options = {}) {
      e.stopImmediatePropagation();
      const opts = { ...defaults, ...options };

      const isTouchEvent = e.touches ? !!e.touches[0] : false;
      // Parent element
      const target = isTouchEvent ? e.touches[0].currentTarget : e.currentTarget;

      // Create ripple
      const ripple = document.createElement('div');
      const rippleStyle = ripple.style;

      // Adding default stuff
      ripple.className = `material-ripple ${opts.class}`;
      rippleStyle.position = 'absolute';
      rippleStyle.color = 'inherit';
      rippleStyle.borderRadius = '50%';
      rippleStyle.pointerEvents = 'none';
      rippleStyle.width = '100px';
      rippleStyle.height = '100px';
      rippleStyle.marginTop = '-50px';
      rippleStyle.marginLeft = '-50px';
      target.appendChild(ripple);
      rippleStyle.opacity = opts.opacity;
      rippleStyle.transition = `transform ${opts.spreadingDuration} ${opts.spreadingTimingFunction} ${opts.spreadingDelay},opacity ${opts.clearingDuration} ${opts.clearingTimingFunction} ${opts.clearingDelay}`;
      rippleStyle.transform = 'scale(0) translate(0,0)';
      rippleStyle.background = opts.color;

      // Positioning ripple
      const targetRect = target.getBoundingClientRect();
      if (opts.centered) {
        rippleStyle.top = `${targetRect.height / 2}px`;
        rippleStyle.left = `${targetRect.width / 2}px`;
      } else {
        const distY = isTouchEvent ? e.touches[0].clientY : e.clientY;
        const distX = isTouchEvent ? e.touches[0].clientX : e.clientX;
        rippleStyle.top = `${distY - targetRect.top}px`;
        rippleStyle.left = `${distX - targetRect.left}px`;
      }

      // Enlarge ripple
      rippleStyle.transform = `scale(${
    Math.max(targetRect.width, targetRect.height) * 0.02
  }) translate(0,0)`;
      return ripple;
    }

    /**
     * Destroys the ripple, slowly fading it out.
     *
     * @param {Element} ripple
     */
    function RippleStop(ripple) {
      if (ripple) {
        ripple.addEventListener('transitionend', (e) => {
          if (e.propertyName === 'opacity') ripple.remove();
        });
        ripple.style.opacity = 0;
      }
    }

    /**
     * @param node {Element}
     */
    var Ripple = (node, _options = {}) => {
      let options = _options;
      let destroyed = false;
      let ripple;
      let keyboardActive = false;
      const handleStart = (e) => {
        ripple = RippleStart(e, options);
      };
      const handleStop = () => RippleStop(ripple);
      const handleKeyboardStart = (e) => {
        if (!keyboardActive && (e.keyCode === 13 || e.keyCode === 32)) {
          ripple = RippleStart(e, { ...options, centered: true });
          keyboardActive = true;
        }
      };
      const handleKeyboardStop = () => {
        keyboardActive = false;
        handleStop();
      };

      function setup() {
        node.classList.add('s-ripple-container');
        node.addEventListener('pointerdown', handleStart);
        node.addEventListener('pointerup', handleStop);
        node.addEventListener('pointerleave', handleStop);
        node.addEventListener('keydown', handleKeyboardStart);
        node.addEventListener('keyup', handleKeyboardStop);
        destroyed = false;
      }

      function destroy() {
        node.classList.remove('s-ripple-container');
        node.removeEventListener('pointerdown', handleStart);
        node.removeEventListener('pointerup', handleStop);
        node.removeEventListener('pointerleave', handleStop);
        node.removeEventListener('keydown', handleKeyboardStart);
        node.removeEventListener('keyup', handleKeyboardStop);
        destroyed = true;
      }

      if (options) setup();

      return {
        update(newOptions) {
          options = newOptions;
          if (options && destroyed) setup();
          else if (!(options || destroyed)) destroy();
        },
        destroy,
      };
    };

    /* node_modules/svelte-materialify/dist/components/MaterialApp/MaterialApp.svelte generated by Svelte v3.46.3 */

    const file$i = "node_modules/svelte-materialify/dist/components/MaterialApp/MaterialApp.svelte";

    function create_fragment$i(ctx) {
    	let div;
    	let div_class_value;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[2].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[1], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", div_class_value = "s-app theme--" + /*theme*/ ctx[0]);
    			add_location(div, file$i, 12, 0, 203103);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 2)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[1],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[1])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[1], dirty, null),
    						null
    					);
    				}
    			}

    			if (!current || dirty & /*theme*/ 1 && div_class_value !== (div_class_value = "s-app theme--" + /*theme*/ ctx[0])) {
    				attr_dev(div, "class", div_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$i.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$i($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('MaterialApp', slots, ['default']);
    	let { theme = 'light' } = $$props;
    	const writable_props = ['theme'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<MaterialApp> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('theme' in $$props) $$invalidate(0, theme = $$props.theme);
    		if ('$$scope' in $$props) $$invalidate(1, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ theme });

    	$$self.$inject_state = $$props => {
    		if ('theme' in $$props) $$invalidate(0, theme = $$props.theme);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [theme, $$scope, slots];
    }

    class MaterialApp extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$i, create_fragment$i, safe_not_equal, { theme: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MaterialApp",
    			options,
    			id: create_fragment$i.name
    		});
    	}

    	get theme() {
    		throw new Error("<MaterialApp>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set theme(value) {
    		throw new Error("<MaterialApp>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function format$1(input) {
      if (typeof input === 'number') return `${input}px`;
      return input;
    }

    /**
     * @param node {Element}
     * @param styles {Object}
     */
    var Style = (node, _styles) => {
      let styles = _styles;
      Object.entries(styles).forEach(([key, value]) => {
        if (value) node.style.setProperty(`--s-${key}`, format$1(value));
      });

      return {
        update(newStyles) {
          Object.entries(newStyles).forEach(([key, value]) => {
            if (value) {
              node.style.setProperty(`--s-${key}`, format$1(value));
              delete styles[key];
            }
          });

          Object.keys(styles).forEach((name) => node.style.removeProperty(`--s-${name}`));

          styles = newStyles;
        },
      };
    };

    /* node_modules/svelte-materialify/dist/components/Icon/Icon.svelte generated by Svelte v3.46.3 */
    const file$h = "node_modules/svelte-materialify/dist/components/Icon/Icon.svelte";

    // (34:2) {#if path}
    function create_if_block$7(ctx) {
    	let svg;
    	let path_1;
    	let svg_viewBox_value;
    	let if_block = /*label*/ ctx[10] && create_if_block_1$4(ctx);

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path_1 = svg_element("path");
    			if (if_block) if_block.c();
    			attr_dev(path_1, "d", /*path*/ ctx[9]);
    			add_location(path_1, file$h, 39, 6, 1586);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "width", /*width*/ ctx[0]);
    			attr_dev(svg, "height", /*height*/ ctx[1]);
    			attr_dev(svg, "viewBox", svg_viewBox_value = "0 0 " + /*viewWidth*/ ctx[4] + " " + /*viewHeight*/ ctx[5]);
    			add_location(svg, file$h, 34, 4, 1454);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, path_1);
    			if (if_block) if_block.m(path_1, null);
    		},
    		p: function update(ctx, dirty) {
    			if (/*label*/ ctx[10]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_1$4(ctx);
    					if_block.c();
    					if_block.m(path_1, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*path*/ 512) {
    				attr_dev(path_1, "d", /*path*/ ctx[9]);
    			}

    			if (dirty & /*width*/ 1) {
    				attr_dev(svg, "width", /*width*/ ctx[0]);
    			}

    			if (dirty & /*height*/ 2) {
    				attr_dev(svg, "height", /*height*/ ctx[1]);
    			}

    			if (dirty & /*viewWidth, viewHeight*/ 48 && svg_viewBox_value !== (svg_viewBox_value = "0 0 " + /*viewWidth*/ ctx[4] + " " + /*viewHeight*/ ctx[5])) {
    				attr_dev(svg, "viewBox", svg_viewBox_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$7.name,
    		type: "if",
    		source: "(34:2) {#if path}",
    		ctx
    	});

    	return block;
    }

    // (41:8) {#if label}
    function create_if_block_1$4(ctx) {
    	let title;
    	let t;

    	const block = {
    		c: function create() {
    			title = svg_element("title");
    			t = text(/*label*/ ctx[10]);
    			add_location(title, file$h, 41, 10, 1634);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, title, anchor);
    			append_dev(title, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*label*/ 1024) set_data_dev(t, /*label*/ ctx[10]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(title);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$4.name,
    		type: "if",
    		source: "(41:8) {#if label}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$h(ctx) {
    	let i;
    	let t;
    	let i_class_value;
    	let Style_action;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block = /*path*/ ctx[9] && create_if_block$7(ctx);
    	const default_slot_template = /*#slots*/ ctx[13].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[12], null);

    	const block = {
    		c: function create() {
    			i = element("i");
    			if (if_block) if_block.c();
    			t = space();
    			if (default_slot) default_slot.c();
    			attr_dev(i, "aria-hidden", "true");
    			attr_dev(i, "class", i_class_value = "s-icon " + /*klass*/ ctx[2]);
    			attr_dev(i, "aria-label", /*label*/ ctx[10]);
    			attr_dev(i, "aria-disabled", /*disabled*/ ctx[8]);
    			attr_dev(i, "style", /*style*/ ctx[11]);
    			toggle_class(i, "spin", /*spin*/ ctx[7]);
    			toggle_class(i, "disabled", /*disabled*/ ctx[8]);
    			add_location(i, file$h, 24, 0, 1222);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, i, anchor);
    			if (if_block) if_block.m(i, null);
    			append_dev(i, t);

    			if (default_slot) {
    				default_slot.m(i, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = action_destroyer(Style_action = Style.call(null, i, {
    					'icon-size': /*size*/ ctx[3],
    					'icon-rotate': `${/*rotate*/ ctx[6]}deg`
    				}));

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*path*/ ctx[9]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$7(ctx);
    					if_block.c();
    					if_block.m(i, t);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 4096)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[12],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[12])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[12], dirty, null),
    						null
    					);
    				}
    			}

    			if (!current || dirty & /*klass*/ 4 && i_class_value !== (i_class_value = "s-icon " + /*klass*/ ctx[2])) {
    				attr_dev(i, "class", i_class_value);
    			}

    			if (!current || dirty & /*label*/ 1024) {
    				attr_dev(i, "aria-label", /*label*/ ctx[10]);
    			}

    			if (!current || dirty & /*disabled*/ 256) {
    				attr_dev(i, "aria-disabled", /*disabled*/ ctx[8]);
    			}

    			if (!current || dirty & /*style*/ 2048) {
    				attr_dev(i, "style", /*style*/ ctx[11]);
    			}

    			if (Style_action && is_function(Style_action.update) && dirty & /*size, rotate*/ 72) Style_action.update.call(null, {
    				'icon-size': /*size*/ ctx[3],
    				'icon-rotate': `${/*rotate*/ ctx[6]}deg`
    			});

    			if (dirty & /*klass, spin*/ 132) {
    				toggle_class(i, "spin", /*spin*/ ctx[7]);
    			}

    			if (dirty & /*klass, disabled*/ 260) {
    				toggle_class(i, "disabled", /*disabled*/ ctx[8]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(i);
    			if (if_block) if_block.d();
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$h.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$h($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Icon', slots, ['default']);
    	let { class: klass = '' } = $$props;
    	let { size = '24px' } = $$props;
    	let { width = size } = $$props;
    	let { height = size } = $$props;
    	let { viewWidth = '24' } = $$props;
    	let { viewHeight = '24' } = $$props;
    	let { rotate = 0 } = $$props;
    	let { spin = false } = $$props;
    	let { disabled = false } = $$props;
    	let { path = null } = $$props;
    	let { label = null } = $$props;
    	let { style = null } = $$props;

    	const writable_props = [
    		'class',
    		'size',
    		'width',
    		'height',
    		'viewWidth',
    		'viewHeight',
    		'rotate',
    		'spin',
    		'disabled',
    		'path',
    		'label',
    		'style'
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Icon> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('class' in $$props) $$invalidate(2, klass = $$props.class);
    		if ('size' in $$props) $$invalidate(3, size = $$props.size);
    		if ('width' in $$props) $$invalidate(0, width = $$props.width);
    		if ('height' in $$props) $$invalidate(1, height = $$props.height);
    		if ('viewWidth' in $$props) $$invalidate(4, viewWidth = $$props.viewWidth);
    		if ('viewHeight' in $$props) $$invalidate(5, viewHeight = $$props.viewHeight);
    		if ('rotate' in $$props) $$invalidate(6, rotate = $$props.rotate);
    		if ('spin' in $$props) $$invalidate(7, spin = $$props.spin);
    		if ('disabled' in $$props) $$invalidate(8, disabled = $$props.disabled);
    		if ('path' in $$props) $$invalidate(9, path = $$props.path);
    		if ('label' in $$props) $$invalidate(10, label = $$props.label);
    		if ('style' in $$props) $$invalidate(11, style = $$props.style);
    		if ('$$scope' in $$props) $$invalidate(12, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		Style,
    		klass,
    		size,
    		width,
    		height,
    		viewWidth,
    		viewHeight,
    		rotate,
    		spin,
    		disabled,
    		path,
    		label,
    		style
    	});

    	$$self.$inject_state = $$props => {
    		if ('klass' in $$props) $$invalidate(2, klass = $$props.klass);
    		if ('size' in $$props) $$invalidate(3, size = $$props.size);
    		if ('width' in $$props) $$invalidate(0, width = $$props.width);
    		if ('height' in $$props) $$invalidate(1, height = $$props.height);
    		if ('viewWidth' in $$props) $$invalidate(4, viewWidth = $$props.viewWidth);
    		if ('viewHeight' in $$props) $$invalidate(5, viewHeight = $$props.viewHeight);
    		if ('rotate' in $$props) $$invalidate(6, rotate = $$props.rotate);
    		if ('spin' in $$props) $$invalidate(7, spin = $$props.spin);
    		if ('disabled' in $$props) $$invalidate(8, disabled = $$props.disabled);
    		if ('path' in $$props) $$invalidate(9, path = $$props.path);
    		if ('label' in $$props) $$invalidate(10, label = $$props.label);
    		if ('style' in $$props) $$invalidate(11, style = $$props.style);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*size*/ 8) {
    			{
    				$$invalidate(0, width = size);
    				$$invalidate(1, height = size);
    			}
    		}
    	};

    	return [
    		width,
    		height,
    		klass,
    		size,
    		viewWidth,
    		viewHeight,
    		rotate,
    		spin,
    		disabled,
    		path,
    		label,
    		style,
    		$$scope,
    		slots
    	];
    }

    class Icon extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$h, create_fragment$h, safe_not_equal, {
    			class: 2,
    			size: 3,
    			width: 0,
    			height: 1,
    			viewWidth: 4,
    			viewHeight: 5,
    			rotate: 6,
    			spin: 7,
    			disabled: 8,
    			path: 9,
    			label: 10,
    			style: 11
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Icon",
    			options,
    			id: create_fragment$h.name
    		});
    	}

    	get class() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get size() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set size(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get width() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set width(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get height() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set height(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get viewWidth() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set viewWidth(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get viewHeight() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set viewHeight(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get rotate() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set rotate(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get spin() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set spin(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get path() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set path(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get label() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set label(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const filter = (classes) => classes.filter((x) => !!x);
    const format = (classes) => classes.split(' ').filter((x) => !!x);

    /**
     * @param node {Element}
     * @param classes {Array<string>}
     */
    var Class = (node, _classes) => {
      let classes = _classes;
      node.classList.add(...format(filter(classes).join(' ')));
      return {
        update(_newClasses) {
          const newClasses = _newClasses;
          newClasses.forEach((klass, i) => {
            if (klass) node.classList.add(...format(klass));
            else if (classes[i]) node.classList.remove(...format(classes[i]));
          });
          classes = newClasses;
        },
      };
    };

    /* node_modules/svelte-materialify/dist/components/Button/Button.svelte generated by Svelte v3.46.3 */
    const file$g = "node_modules/svelte-materialify/dist/components/Button/Button.svelte";

    function create_fragment$g(ctx) {
    	let button_1;
    	let span;
    	let button_1_class_value;
    	let Class_action;
    	let Ripple_action;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[19].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[18], null);

    	let button_1_levels = [
    		{
    			class: button_1_class_value = "s-btn size-" + /*size*/ ctx[5] + " " + /*klass*/ ctx[1]
    		},
    		{ type: /*type*/ ctx[14] },
    		{ style: /*style*/ ctx[16] },
    		{ disabled: /*disabled*/ ctx[11] },
    		{ "aria-disabled": /*disabled*/ ctx[11] },
    		/*$$restProps*/ ctx[17]
    	];

    	let button_1_data = {};

    	for (let i = 0; i < button_1_levels.length; i += 1) {
    		button_1_data = assign(button_1_data, button_1_levels[i]);
    	}

    	const block_1 = {
    		c: function create() {
    			button_1 = element("button");
    			span = element("span");
    			if (default_slot) default_slot.c();
    			attr_dev(span, "class", "s-btn__content");
    			add_location(span, file$g, 46, 2, 5233);
    			set_attributes(button_1, button_1_data);
    			toggle_class(button_1, "s-btn--fab", /*fab*/ ctx[2]);
    			toggle_class(button_1, "icon", /*icon*/ ctx[3]);
    			toggle_class(button_1, "block", /*block*/ ctx[4]);
    			toggle_class(button_1, "tile", /*tile*/ ctx[6]);
    			toggle_class(button_1, "text", /*text*/ ctx[7] || /*icon*/ ctx[3]);
    			toggle_class(button_1, "depressed", /*depressed*/ ctx[8] || /*text*/ ctx[7] || /*disabled*/ ctx[11] || /*outlined*/ ctx[9] || /*icon*/ ctx[3]);
    			toggle_class(button_1, "outlined", /*outlined*/ ctx[9]);
    			toggle_class(button_1, "rounded", /*rounded*/ ctx[10]);
    			toggle_class(button_1, "disabled", /*disabled*/ ctx[11]);
    			add_location(button_1, file$g, 26, 0, 4783);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button_1, anchor);
    			append_dev(button_1, span);

    			if (default_slot) {
    				default_slot.m(span, null);
    			}

    			if (button_1.autofocus) button_1.focus();
    			/*button_1_binding*/ ctx[21](button_1);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(Class_action = Class.call(null, button_1, [/*active*/ ctx[12] && /*activeClass*/ ctx[13]])),
    					action_destroyer(Ripple_action = Ripple.call(null, button_1, /*ripple*/ ctx[15])),
    					listen_dev(button_1, "click", /*click_handler*/ ctx[20], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 262144)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[18],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[18])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[18], dirty, null),
    						null
    					);
    				}
    			}

    			set_attributes(button_1, button_1_data = get_spread_update(button_1_levels, [
    				(!current || dirty & /*size, klass*/ 34 && button_1_class_value !== (button_1_class_value = "s-btn size-" + /*size*/ ctx[5] + " " + /*klass*/ ctx[1])) && { class: button_1_class_value },
    				(!current || dirty & /*type*/ 16384) && { type: /*type*/ ctx[14] },
    				(!current || dirty & /*style*/ 65536) && { style: /*style*/ ctx[16] },
    				(!current || dirty & /*disabled*/ 2048) && { disabled: /*disabled*/ ctx[11] },
    				(!current || dirty & /*disabled*/ 2048) && { "aria-disabled": /*disabled*/ ctx[11] },
    				dirty & /*$$restProps*/ 131072 && /*$$restProps*/ ctx[17]
    			]));

    			if (Class_action && is_function(Class_action.update) && dirty & /*active, activeClass*/ 12288) Class_action.update.call(null, [/*active*/ ctx[12] && /*activeClass*/ ctx[13]]);
    			if (Ripple_action && is_function(Ripple_action.update) && dirty & /*ripple*/ 32768) Ripple_action.update.call(null, /*ripple*/ ctx[15]);
    			toggle_class(button_1, "s-btn--fab", /*fab*/ ctx[2]);
    			toggle_class(button_1, "icon", /*icon*/ ctx[3]);
    			toggle_class(button_1, "block", /*block*/ ctx[4]);
    			toggle_class(button_1, "tile", /*tile*/ ctx[6]);
    			toggle_class(button_1, "text", /*text*/ ctx[7] || /*icon*/ ctx[3]);
    			toggle_class(button_1, "depressed", /*depressed*/ ctx[8] || /*text*/ ctx[7] || /*disabled*/ ctx[11] || /*outlined*/ ctx[9] || /*icon*/ ctx[3]);
    			toggle_class(button_1, "outlined", /*outlined*/ ctx[9]);
    			toggle_class(button_1, "rounded", /*rounded*/ ctx[10]);
    			toggle_class(button_1, "disabled", /*disabled*/ ctx[11]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button_1);
    			if (default_slot) default_slot.d(detaching);
    			/*button_1_binding*/ ctx[21](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block: block_1,
    		id: create_fragment$g.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block_1;
    }

    function instance$g($$self, $$props, $$invalidate) {
    	const omit_props_names = [
    		"class","fab","icon","block","size","tile","text","depressed","outlined","rounded","disabled","active","activeClass","type","ripple","style","button"
    	];

    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Button', slots, ['default']);
    	let { class: klass = '' } = $$props;
    	let { fab = false } = $$props;
    	let { icon = false } = $$props;
    	let { block = false } = $$props;
    	let { size = 'default' } = $$props;
    	let { tile = false } = $$props;
    	let { text = false } = $$props;
    	let { depressed = false } = $$props;
    	let { outlined = false } = $$props;
    	let { rounded = false } = $$props;
    	let { disabled = null } = $$props;
    	let { active = false } = $$props;
    	let { activeClass = 'active' } = $$props;
    	let { type = 'button' } = $$props;
    	let { ripple = {} } = $$props;
    	let { style = null } = $$props;
    	let { button = null } = $$props;

    	function click_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function button_1_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			button = $$value;
    			$$invalidate(0, button);
    		});
    	}

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(17, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ('class' in $$new_props) $$invalidate(1, klass = $$new_props.class);
    		if ('fab' in $$new_props) $$invalidate(2, fab = $$new_props.fab);
    		if ('icon' in $$new_props) $$invalidate(3, icon = $$new_props.icon);
    		if ('block' in $$new_props) $$invalidate(4, block = $$new_props.block);
    		if ('size' in $$new_props) $$invalidate(5, size = $$new_props.size);
    		if ('tile' in $$new_props) $$invalidate(6, tile = $$new_props.tile);
    		if ('text' in $$new_props) $$invalidate(7, text = $$new_props.text);
    		if ('depressed' in $$new_props) $$invalidate(8, depressed = $$new_props.depressed);
    		if ('outlined' in $$new_props) $$invalidate(9, outlined = $$new_props.outlined);
    		if ('rounded' in $$new_props) $$invalidate(10, rounded = $$new_props.rounded);
    		if ('disabled' in $$new_props) $$invalidate(11, disabled = $$new_props.disabled);
    		if ('active' in $$new_props) $$invalidate(12, active = $$new_props.active);
    		if ('activeClass' in $$new_props) $$invalidate(13, activeClass = $$new_props.activeClass);
    		if ('type' in $$new_props) $$invalidate(14, type = $$new_props.type);
    		if ('ripple' in $$new_props) $$invalidate(15, ripple = $$new_props.ripple);
    		if ('style' in $$new_props) $$invalidate(16, style = $$new_props.style);
    		if ('button' in $$new_props) $$invalidate(0, button = $$new_props.button);
    		if ('$$scope' in $$new_props) $$invalidate(18, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		Ripple,
    		Class,
    		klass,
    		fab,
    		icon,
    		block,
    		size,
    		tile,
    		text,
    		depressed,
    		outlined,
    		rounded,
    		disabled,
    		active,
    		activeClass,
    		type,
    		ripple,
    		style,
    		button
    	});

    	$$self.$inject_state = $$new_props => {
    		if ('klass' in $$props) $$invalidate(1, klass = $$new_props.klass);
    		if ('fab' in $$props) $$invalidate(2, fab = $$new_props.fab);
    		if ('icon' in $$props) $$invalidate(3, icon = $$new_props.icon);
    		if ('block' in $$props) $$invalidate(4, block = $$new_props.block);
    		if ('size' in $$props) $$invalidate(5, size = $$new_props.size);
    		if ('tile' in $$props) $$invalidate(6, tile = $$new_props.tile);
    		if ('text' in $$props) $$invalidate(7, text = $$new_props.text);
    		if ('depressed' in $$props) $$invalidate(8, depressed = $$new_props.depressed);
    		if ('outlined' in $$props) $$invalidate(9, outlined = $$new_props.outlined);
    		if ('rounded' in $$props) $$invalidate(10, rounded = $$new_props.rounded);
    		if ('disabled' in $$props) $$invalidate(11, disabled = $$new_props.disabled);
    		if ('active' in $$props) $$invalidate(12, active = $$new_props.active);
    		if ('activeClass' in $$props) $$invalidate(13, activeClass = $$new_props.activeClass);
    		if ('type' in $$props) $$invalidate(14, type = $$new_props.type);
    		if ('ripple' in $$props) $$invalidate(15, ripple = $$new_props.ripple);
    		if ('style' in $$props) $$invalidate(16, style = $$new_props.style);
    		if ('button' in $$props) $$invalidate(0, button = $$new_props.button);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		button,
    		klass,
    		fab,
    		icon,
    		block,
    		size,
    		tile,
    		text,
    		depressed,
    		outlined,
    		rounded,
    		disabled,
    		active,
    		activeClass,
    		type,
    		ripple,
    		style,
    		$$restProps,
    		$$scope,
    		slots,
    		click_handler,
    		button_1_binding
    	];
    }

    class Button extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$g, create_fragment$g, safe_not_equal, {
    			class: 1,
    			fab: 2,
    			icon: 3,
    			block: 4,
    			size: 5,
    			tile: 6,
    			text: 7,
    			depressed: 8,
    			outlined: 9,
    			rounded: 10,
    			disabled: 11,
    			active: 12,
    			activeClass: 13,
    			type: 14,
    			ripple: 15,
    			style: 16,
    			button: 0
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Button",
    			options,
    			id: create_fragment$g.name
    		});
    	}

    	get class() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get fab() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fab(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get icon() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set icon(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get block() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set block(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get size() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set size(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get tile() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tile(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get text() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set text(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get depressed() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set depressed(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get outlined() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set outlined(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get rounded() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set rounded(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get active() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set active(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get activeClass() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set activeClass(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get type() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set type(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get ripple() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set ripple(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get button() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set button(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const subscriber_queue = [];
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

    /* node_modules/svelte-materialify/dist/components/ItemGroup/ItemGroup.svelte generated by Svelte v3.46.3 */
    const file$f = "node_modules/svelte-materialify/dist/components/ItemGroup/ItemGroup.svelte";

    function create_fragment$f(ctx) {
    	let div;
    	let div_class_value;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[9].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[8], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", div_class_value = "s-item-group " + /*klass*/ ctx[0]);
    			attr_dev(div, "role", /*role*/ ctx[1]);
    			attr_dev(div, "style", /*style*/ ctx[2]);
    			add_location(div, file$f, 53, 0, 1510);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 256)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[8],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[8])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[8], dirty, null),
    						null
    					);
    				}
    			}

    			if (!current || dirty & /*klass*/ 1 && div_class_value !== (div_class_value = "s-item-group " + /*klass*/ ctx[0])) {
    				attr_dev(div, "class", div_class_value);
    			}

    			if (!current || dirty & /*role*/ 2) {
    				attr_dev(div, "role", /*role*/ ctx[1]);
    			}

    			if (!current || dirty & /*style*/ 4) {
    				attr_dev(div, "style", /*style*/ ctx[2]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$f.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const ITEM_GROUP = {};

    function instance$f($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('ItemGroup', slots, ['default']);
    	let { class: klass = '' } = $$props;
    	let { activeClass = '' } = $$props;
    	let { value = [] } = $$props;
    	let { multiple = false } = $$props;
    	let { mandatory = false } = $$props;
    	let { max = Infinity } = $$props;
    	let { role = null } = $$props;
    	let { style = null } = $$props;
    	const dispatch = createEventDispatcher();
    	const valueStore = writable(value);
    	let startIndex = -1;

    	setContext(ITEM_GROUP, {
    		select: val => {
    			if (multiple) {
    				if (value.includes(val)) {
    					if (!mandatory || value.length > 1) {
    						value.splice(value.indexOf(val), 1);
    						$$invalidate(3, value);
    					}
    				} else if (value.length < max) $$invalidate(3, value = [...value, val]);
    			} else if (value === val) {
    				if (!mandatory) $$invalidate(3, value = null);
    			} else $$invalidate(3, value = val);
    		},
    		register: setValue => {
    			const u = valueStore.subscribe(val => {
    				setValue(multiple ? val : [val]);
    			});

    			onDestroy(u);
    		},
    		index: () => {
    			startIndex += 1;
    			return startIndex;
    		},
    		activeClass
    	});

    	const writable_props = [
    		'class',
    		'activeClass',
    		'value',
    		'multiple',
    		'mandatory',
    		'max',
    		'role',
    		'style'
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<ItemGroup> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('class' in $$props) $$invalidate(0, klass = $$props.class);
    		if ('activeClass' in $$props) $$invalidate(4, activeClass = $$props.activeClass);
    		if ('value' in $$props) $$invalidate(3, value = $$props.value);
    		if ('multiple' in $$props) $$invalidate(5, multiple = $$props.multiple);
    		if ('mandatory' in $$props) $$invalidate(6, mandatory = $$props.mandatory);
    		if ('max' in $$props) $$invalidate(7, max = $$props.max);
    		if ('role' in $$props) $$invalidate(1, role = $$props.role);
    		if ('style' in $$props) $$invalidate(2, style = $$props.style);
    		if ('$$scope' in $$props) $$invalidate(8, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		ITEM_GROUP,
    		setContext,
    		createEventDispatcher,
    		onDestroy,
    		writable,
    		klass,
    		activeClass,
    		value,
    		multiple,
    		mandatory,
    		max,
    		role,
    		style,
    		dispatch,
    		valueStore,
    		startIndex
    	});

    	$$self.$inject_state = $$props => {
    		if ('klass' in $$props) $$invalidate(0, klass = $$props.klass);
    		if ('activeClass' in $$props) $$invalidate(4, activeClass = $$props.activeClass);
    		if ('value' in $$props) $$invalidate(3, value = $$props.value);
    		if ('multiple' in $$props) $$invalidate(5, multiple = $$props.multiple);
    		if ('mandatory' in $$props) $$invalidate(6, mandatory = $$props.mandatory);
    		if ('max' in $$props) $$invalidate(7, max = $$props.max);
    		if ('role' in $$props) $$invalidate(1, role = $$props.role);
    		if ('style' in $$props) $$invalidate(2, style = $$props.style);
    		if ('startIndex' in $$props) startIndex = $$props.startIndex;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*value*/ 8) {
    			valueStore.set(value);
    		}

    		if ($$self.$$.dirty & /*value*/ 8) {
    			dispatch('change', value);
    		}
    	};

    	return [
    		klass,
    		role,
    		style,
    		value,
    		activeClass,
    		multiple,
    		mandatory,
    		max,
    		$$scope,
    		slots
    	];
    }

    class ItemGroup extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$f, create_fragment$f, safe_not_equal, {
    			class: 0,
    			activeClass: 4,
    			value: 3,
    			multiple: 5,
    			mandatory: 6,
    			max: 7,
    			role: 1,
    			style: 2
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ItemGroup",
    			options,
    			id: create_fragment$f.name
    		});
    	}

    	get class() {
    		throw new Error("<ItemGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<ItemGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get activeClass() {
    		throw new Error("<ItemGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set activeClass(value) {
    		throw new Error("<ItemGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<ItemGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<ItemGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get multiple() {
    		throw new Error("<ItemGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set multiple(value) {
    		throw new Error("<ItemGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get mandatory() {
    		throw new Error("<ItemGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set mandatory(value) {
    		throw new Error("<ItemGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get max() {
    		throw new Error("<ItemGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set max(value) {
    		throw new Error("<ItemGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get role() {
    		throw new Error("<ItemGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set role(value) {
    		throw new Error("<ItemGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<ItemGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<ItemGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* eslint-disable no-param-reassign */

    /**
     * @param {string} klass
     */
    function formatClass(klass) {
      return klass.split(' ').map((i) => {
        if (/^(lighten|darken|accent)-/.test(i)) {
          return `text-${i}`;
        }
        return `${i}-text`;
      });
    }

    function setTextColor(node, text) {
      if (/^(#|rgb|hsl|currentColor)/.test(text)) {
        // This is a CSS hex.
        node.style.color = text;
        return false;
      }
      if (text.startsWith('--')) {
        // This is a CSS variable.
        node.style.color = `var(${text})`;
        return false;
      }
      const klass = formatClass(text);
      node.classList.add(...klass);
      return klass;
    }

    /**
     * @param node {Element}
     * @param text {string|boolean}
     */
    var TextColor = (node, text) => {
      let klass;
      if (typeof text === 'string') {
        klass = setTextColor(node, text);
      }

      return {
        update(newText) {
          if (klass) {
            node.classList.remove(...klass);
          } else {
            node.style.color = null;
          }

          if (typeof newText === 'string') {
            klass = setTextColor(node, newText);
          }
        },
      };
    };

    /* node_modules/svelte-materialify/dist/components/Input/Input.svelte generated by Svelte v3.46.3 */
    const file$e = "node_modules/svelte-materialify/dist/components/Input/Input.svelte";
    const get_append_outer_slot_changes$1 = dirty => ({});
    const get_append_outer_slot_context$1 = ctx => ({});
    const get_messages_slot_changes = dirty => ({});
    const get_messages_slot_context = ctx => ({});
    const get_prepend_outer_slot_changes$1 = dirty => ({});
    const get_prepend_outer_slot_context$1 = ctx => ({});

    function create_fragment$e(ctx) {
    	let div3;
    	let t0;
    	let div2;
    	let div0;
    	let t1;
    	let div1;
    	let t2;
    	let div3_class_value;
    	let TextColor_action;
    	let current;
    	let mounted;
    	let dispose;
    	const prepend_outer_slot_template = /*#slots*/ ctx[9]["prepend-outer"];
    	const prepend_outer_slot = create_slot(prepend_outer_slot_template, ctx, /*$$scope*/ ctx[8], get_prepend_outer_slot_context$1);
    	const default_slot_template = /*#slots*/ ctx[9].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[8], null);
    	const messages_slot_template = /*#slots*/ ctx[9].messages;
    	const messages_slot = create_slot(messages_slot_template, ctx, /*$$scope*/ ctx[8], get_messages_slot_context);
    	const append_outer_slot_template = /*#slots*/ ctx[9]["append-outer"];
    	const append_outer_slot = create_slot(append_outer_slot_template, ctx, /*$$scope*/ ctx[8], get_append_outer_slot_context$1);

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			if (prepend_outer_slot) prepend_outer_slot.c();
    			t0 = space();
    			div2 = element("div");
    			div0 = element("div");
    			if (default_slot) default_slot.c();
    			t1 = space();
    			div1 = element("div");
    			if (messages_slot) messages_slot.c();
    			t2 = space();
    			if (append_outer_slot) append_outer_slot.c();
    			attr_dev(div0, "class", "s-input__slot");
    			add_location(div0, file$e, 27, 4, 8662);
    			attr_dev(div1, "class", "s-input__details");
    			add_location(div1, file$e, 30, 4, 8720);
    			attr_dev(div2, "class", "s-input__control");
    			add_location(div2, file$e, 26, 2, 8627);
    			attr_dev(div3, "class", div3_class_value = "s-input " + /*klass*/ ctx[0]);
    			attr_dev(div3, "style", /*style*/ ctx[7]);
    			toggle_class(div3, "dense", /*dense*/ ctx[2]);
    			toggle_class(div3, "error", /*error*/ ctx[5]);
    			toggle_class(div3, "success", /*success*/ ctx[6]);
    			toggle_class(div3, "readonly", /*readonly*/ ctx[3]);
    			toggle_class(div3, "disabled", /*disabled*/ ctx[4]);
    			add_location(div3, file$e, 16, 0, 8409);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);

    			if (prepend_outer_slot) {
    				prepend_outer_slot.m(div3, null);
    			}

    			append_dev(div3, t0);
    			append_dev(div3, div2);
    			append_dev(div2, div0);

    			if (default_slot) {
    				default_slot.m(div0, null);
    			}

    			append_dev(div2, t1);
    			append_dev(div2, div1);

    			if (messages_slot) {
    				messages_slot.m(div1, null);
    			}

    			append_dev(div3, t2);

    			if (append_outer_slot) {
    				append_outer_slot.m(div3, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = action_destroyer(TextColor_action = TextColor.call(null, div3, /*success*/ ctx[6]
    				? 'success'
    				: /*error*/ ctx[5] ? 'error' : /*color*/ ctx[1]));

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (prepend_outer_slot) {
    				if (prepend_outer_slot.p && (!current || dirty & /*$$scope*/ 256)) {
    					update_slot_base(
    						prepend_outer_slot,
    						prepend_outer_slot_template,
    						ctx,
    						/*$$scope*/ ctx[8],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[8])
    						: get_slot_changes(prepend_outer_slot_template, /*$$scope*/ ctx[8], dirty, get_prepend_outer_slot_changes$1),
    						get_prepend_outer_slot_context$1
    					);
    				}
    			}

    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 256)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[8],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[8])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[8], dirty, null),
    						null
    					);
    				}
    			}

    			if (messages_slot) {
    				if (messages_slot.p && (!current || dirty & /*$$scope*/ 256)) {
    					update_slot_base(
    						messages_slot,
    						messages_slot_template,
    						ctx,
    						/*$$scope*/ ctx[8],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[8])
    						: get_slot_changes(messages_slot_template, /*$$scope*/ ctx[8], dirty, get_messages_slot_changes),
    						get_messages_slot_context
    					);
    				}
    			}

    			if (append_outer_slot) {
    				if (append_outer_slot.p && (!current || dirty & /*$$scope*/ 256)) {
    					update_slot_base(
    						append_outer_slot,
    						append_outer_slot_template,
    						ctx,
    						/*$$scope*/ ctx[8],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[8])
    						: get_slot_changes(append_outer_slot_template, /*$$scope*/ ctx[8], dirty, get_append_outer_slot_changes$1),
    						get_append_outer_slot_context$1
    					);
    				}
    			}

    			if (!current || dirty & /*klass*/ 1 && div3_class_value !== (div3_class_value = "s-input " + /*klass*/ ctx[0])) {
    				attr_dev(div3, "class", div3_class_value);
    			}

    			if (!current || dirty & /*style*/ 128) {
    				attr_dev(div3, "style", /*style*/ ctx[7]);
    			}

    			if (TextColor_action && is_function(TextColor_action.update) && dirty & /*success, error, color*/ 98) TextColor_action.update.call(null, /*success*/ ctx[6]
    			? 'success'
    			: /*error*/ ctx[5] ? 'error' : /*color*/ ctx[1]);

    			if (dirty & /*klass, dense*/ 5) {
    				toggle_class(div3, "dense", /*dense*/ ctx[2]);
    			}

    			if (dirty & /*klass, error*/ 33) {
    				toggle_class(div3, "error", /*error*/ ctx[5]);
    			}

    			if (dirty & /*klass, success*/ 65) {
    				toggle_class(div3, "success", /*success*/ ctx[6]);
    			}

    			if (dirty & /*klass, readonly*/ 9) {
    				toggle_class(div3, "readonly", /*readonly*/ ctx[3]);
    			}

    			if (dirty & /*klass, disabled*/ 17) {
    				toggle_class(div3, "disabled", /*disabled*/ ctx[4]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(prepend_outer_slot, local);
    			transition_in(default_slot, local);
    			transition_in(messages_slot, local);
    			transition_in(append_outer_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(prepend_outer_slot, local);
    			transition_out(default_slot, local);
    			transition_out(messages_slot, local);
    			transition_out(append_outer_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			if (prepend_outer_slot) prepend_outer_slot.d(detaching);
    			if (default_slot) default_slot.d(detaching);
    			if (messages_slot) messages_slot.d(detaching);
    			if (append_outer_slot) append_outer_slot.d(detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$e.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$e($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Input', slots, ['prepend-outer','default','messages','append-outer']);
    	let { class: klass = '' } = $$props;
    	let { color = null } = $$props;
    	let { dense = false } = $$props;
    	let { readonly = false } = $$props;
    	let { disabled = false } = $$props;
    	let { error = false } = $$props;
    	let { success = false } = $$props;
    	let { style = null } = $$props;
    	const writable_props = ['class', 'color', 'dense', 'readonly', 'disabled', 'error', 'success', 'style'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Input> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('class' in $$props) $$invalidate(0, klass = $$props.class);
    		if ('color' in $$props) $$invalidate(1, color = $$props.color);
    		if ('dense' in $$props) $$invalidate(2, dense = $$props.dense);
    		if ('readonly' in $$props) $$invalidate(3, readonly = $$props.readonly);
    		if ('disabled' in $$props) $$invalidate(4, disabled = $$props.disabled);
    		if ('error' in $$props) $$invalidate(5, error = $$props.error);
    		if ('success' in $$props) $$invalidate(6, success = $$props.success);
    		if ('style' in $$props) $$invalidate(7, style = $$props.style);
    		if ('$$scope' in $$props) $$invalidate(8, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		TextColor,
    		klass,
    		color,
    		dense,
    		readonly,
    		disabled,
    		error,
    		success,
    		style
    	});

    	$$self.$inject_state = $$props => {
    		if ('klass' in $$props) $$invalidate(0, klass = $$props.klass);
    		if ('color' in $$props) $$invalidate(1, color = $$props.color);
    		if ('dense' in $$props) $$invalidate(2, dense = $$props.dense);
    		if ('readonly' in $$props) $$invalidate(3, readonly = $$props.readonly);
    		if ('disabled' in $$props) $$invalidate(4, disabled = $$props.disabled);
    		if ('error' in $$props) $$invalidate(5, error = $$props.error);
    		if ('success' in $$props) $$invalidate(6, success = $$props.success);
    		if ('style' in $$props) $$invalidate(7, style = $$props.style);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [klass, color, dense, readonly, disabled, error, success, style, $$scope, slots];
    }

    class Input extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$e, create_fragment$e, safe_not_equal, {
    			class: 0,
    			color: 1,
    			dense: 2,
    			readonly: 3,
    			disabled: 4,
    			error: 5,
    			success: 6,
    			style: 7
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Input",
    			options,
    			id: create_fragment$e.name
    		});
    	}

    	get class() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get color() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get dense() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set dense(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get readonly() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set readonly(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get error() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set error(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get success() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set success(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* eslint-disable */
    // Shamefully ripped from https://github.com/lukeed/uid
    let IDX = 36;
    let HEX = '';
    while (IDX--) HEX += IDX.toString(36);

    var uid = (len) => {
      let str = '';
      let num = len || 11;
      while (num--) str += HEX[(Math.random() * 36) | 0];
      return str;
    };

    var closeIcon = 'M12,2C17.53,2 22,6.47 22,12C22,17.53 17.53,22 12,22C6.47,22 2,17.53 2,12C2,6.47 6.47,2 12,2M15.59,7L12,10.59L8.41,7L7,8.41L10.59,12L7,15.59L8.41,17L12,13.41L15.59,17L17,15.59L13.41,12L17,8.41L15.59,7Z';

    /* node_modules/svelte-materialify/dist/components/TextField/TextField.svelte generated by Svelte v3.46.3 */
    const file$d = "node_modules/svelte-materialify/dist/components/TextField/TextField.svelte";
    const get_append_slot_changes = dirty => ({});
    const get_append_slot_context = ctx => ({});
    const get_clear_icon_slot_changes = dirty => ({});
    const get_clear_icon_slot_context = ctx => ({});
    const get_content_slot_changes = dirty => ({});
    const get_content_slot_context = ctx => ({});
    const get_prepend_slot_changes = dirty => ({});
    const get_prepend_slot_context = ctx => ({});
    const get_prepend_outer_slot_changes = dirty => ({});
    const get_prepend_outer_slot_context = ctx => ({ slot: "prepend-outer" });

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[44] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[44] = list[i];
    	return child_ctx;
    }

    const get_append_outer_slot_changes = dirty => ({});
    const get_append_outer_slot_context = ctx => ({ slot: "append-outer" });

    // (112:4) {#if clearable && value !== ''}
    function create_if_block_1$3(ctx) {
    	let div;
    	let current;
    	let mounted;
    	let dispose;
    	const clear_icon_slot_template = /*#slots*/ ctx[33]["clear-icon"];
    	const clear_icon_slot = create_slot(clear_icon_slot_template, ctx, /*$$scope*/ ctx[43], get_clear_icon_slot_context);
    	const clear_icon_slot_or_fallback = clear_icon_slot || fallback_block$2(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (clear_icon_slot_or_fallback) clear_icon_slot_or_fallback.c();
    			set_style(div, "cursor", "pointer");
    			add_location(div, file$d, 112, 6, 2674);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (clear_icon_slot_or_fallback) {
    				clear_icon_slot_or_fallback.m(div, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*clear*/ ctx[26], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (clear_icon_slot) {
    				if (clear_icon_slot.p && (!current || dirty[1] & /*$$scope*/ 4096)) {
    					update_slot_base(
    						clear_icon_slot,
    						clear_icon_slot_template,
    						ctx,
    						/*$$scope*/ ctx[43],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[43])
    						: get_slot_changes(clear_icon_slot_template, /*$$scope*/ ctx[43], dirty, get_clear_icon_slot_changes),
    						get_clear_icon_slot_context
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(clear_icon_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(clear_icon_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (clear_icon_slot_or_fallback) clear_icon_slot_or_fallback.d(detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$3.name,
    		type: "if",
    		source: "(112:4) {#if clearable && value !== ''}",
    		ctx
    	});

    	return block;
    }

    // (115:32)             
    function fallback_block$2(ctx) {
    	let icon;
    	let current;

    	icon = new Icon({
    			props: { path: closeIcon },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(icon.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(icon, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(icon.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(icon.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(icon, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block$2.name,
    		type: "fallback",
    		source: "(115:32)             ",
    		ctx
    	});

    	return block;
    }

    // (64:0) <Input    class="s-text-field {klass}"    {color}    {dense}    {readonly}    {disabled}    {error}    {success}    {style}>
    function create_default_slot$5(ctx) {
    	let div1;
    	let t0;
    	let div0;
    	let label;
    	let t1;
    	let t2;
    	let input;
    	let t3;
    	let t4;
    	let current;
    	let mounted;
    	let dispose;
    	const prepend_slot_template = /*#slots*/ ctx[33].prepend;
    	const prepend_slot = create_slot(prepend_slot_template, ctx, /*$$scope*/ ctx[43], get_prepend_slot_context);
    	const default_slot_template = /*#slots*/ ctx[33].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[43], null);
    	const content_slot_template = /*#slots*/ ctx[33].content;
    	const content_slot = create_slot(content_slot_template, ctx, /*$$scope*/ ctx[43], get_content_slot_context);

    	let input_levels = [
    		{ type: "text" },
    		{ placeholder: /*placeholder*/ ctx[14] },
    		{ id: /*id*/ ctx[20] },
    		{ readOnly: /*readonly*/ ctx[12] },
    		{ disabled: /*disabled*/ ctx[13] },
    		/*$$restProps*/ ctx[28]
    	];

    	let input_data = {};

    	for (let i = 0; i < input_levels.length; i += 1) {
    		input_data = assign(input_data, input_levels[i]);
    	}

    	let if_block = /*clearable*/ ctx[11] && /*value*/ ctx[0] !== '' && create_if_block_1$3(ctx);
    	const append_slot_template = /*#slots*/ ctx[33].append;
    	const append_slot = create_slot(append_slot_template, ctx, /*$$scope*/ ctx[43], get_append_slot_context);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			if (prepend_slot) prepend_slot.c();
    			t0 = space();
    			div0 = element("div");
    			label = element("label");
    			if (default_slot) default_slot.c();
    			t1 = space();
    			if (content_slot) content_slot.c();
    			t2 = space();
    			input = element("input");
    			t3 = space();
    			if (if_block) if_block.c();
    			t4 = space();
    			if (append_slot) append_slot.c();
    			attr_dev(label, "for", /*id*/ ctx[20]);
    			toggle_class(label, "active", /*labelActive*/ ctx[23]);
    			add_location(label, file$d, 85, 6, 2024);
    			set_attributes(input, input_data);
    			add_location(input, file$d, 90, 6, 2215);
    			attr_dev(div0, "class", "s-text-field__input");
    			add_location(div0, file$d, 84, 4, 1983);
    			attr_dev(div1, "class", "s-text-field__wrapper");
    			toggle_class(div1, "filled", /*filled*/ ctx[5]);
    			toggle_class(div1, "solo", /*solo*/ ctx[6]);
    			toggle_class(div1, "outlined", /*outlined*/ ctx[7]);
    			toggle_class(div1, "flat", /*flat*/ ctx[8]);
    			toggle_class(div1, "rounded", /*rounded*/ ctx[10]);
    			add_location(div1, file$d, 74, 2, 1768);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);

    			if (prepend_slot) {
    				prepend_slot.m(div1, null);
    			}

    			append_dev(div1, t0);
    			append_dev(div1, div0);
    			append_dev(div0, label);

    			if (default_slot) {
    				default_slot.m(label, null);
    			}

    			append_dev(div0, t1);

    			if (content_slot) {
    				content_slot.m(div0, null);
    			}

    			append_dev(div0, t2);
    			append_dev(div0, input);
    			if (input.autofocus) input.focus();
    			/*input_binding*/ ctx[41](input);
    			set_input_value(input, /*value*/ ctx[0]);
    			append_dev(div1, t3);
    			if (if_block) if_block.m(div1, null);
    			append_dev(div1, t4);

    			if (append_slot) {
    				append_slot.m(div1, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", /*input_input_handler*/ ctx[42]),
    					listen_dev(input, "focus", /*onFocus*/ ctx[24], false, false, false),
    					listen_dev(input, "blur", /*onBlur*/ ctx[25], false, false, false),
    					listen_dev(input, "input", /*onInput*/ ctx[27], false, false, false),
    					listen_dev(input, "focus", /*focus_handler*/ ctx[34], false, false, false),
    					listen_dev(input, "blur", /*blur_handler*/ ctx[35], false, false, false),
    					listen_dev(input, "input", /*input_handler*/ ctx[36], false, false, false),
    					listen_dev(input, "change", /*change_handler*/ ctx[37], false, false, false),
    					listen_dev(input, "keypress", /*keypress_handler*/ ctx[38], false, false, false),
    					listen_dev(input, "keydown", /*keydown_handler*/ ctx[39], false, false, false),
    					listen_dev(input, "keyup", /*keyup_handler*/ ctx[40], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (prepend_slot) {
    				if (prepend_slot.p && (!current || dirty[1] & /*$$scope*/ 4096)) {
    					update_slot_base(
    						prepend_slot,
    						prepend_slot_template,
    						ctx,
    						/*$$scope*/ ctx[43],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[43])
    						: get_slot_changes(prepend_slot_template, /*$$scope*/ ctx[43], dirty, get_prepend_slot_changes),
    						get_prepend_slot_context
    					);
    				}
    			}

    			if (default_slot) {
    				if (default_slot.p && (!current || dirty[1] & /*$$scope*/ 4096)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[43],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[43])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[43], dirty, null),
    						null
    					);
    				}
    			}

    			if (!current || dirty[0] & /*id*/ 1048576) {
    				attr_dev(label, "for", /*id*/ ctx[20]);
    			}

    			if (dirty[0] & /*labelActive*/ 8388608) {
    				toggle_class(label, "active", /*labelActive*/ ctx[23]);
    			}

    			if (content_slot) {
    				if (content_slot.p && (!current || dirty[1] & /*$$scope*/ 4096)) {
    					update_slot_base(
    						content_slot,
    						content_slot_template,
    						ctx,
    						/*$$scope*/ ctx[43],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[43])
    						: get_slot_changes(content_slot_template, /*$$scope*/ ctx[43], dirty, get_content_slot_changes),
    						get_content_slot_context
    					);
    				}
    			}

    			set_attributes(input, input_data = get_spread_update(input_levels, [
    				{ type: "text" },
    				(!current || dirty[0] & /*placeholder*/ 16384) && { placeholder: /*placeholder*/ ctx[14] },
    				(!current || dirty[0] & /*id*/ 1048576) && { id: /*id*/ ctx[20] },
    				(!current || dirty[0] & /*readonly*/ 4096) && { readOnly: /*readonly*/ ctx[12] },
    				(!current || dirty[0] & /*disabled*/ 8192) && { disabled: /*disabled*/ ctx[13] },
    				dirty[0] & /*$$restProps*/ 268435456 && /*$$restProps*/ ctx[28]
    			]));

    			if (dirty[0] & /*value*/ 1 && input.value !== /*value*/ ctx[0]) {
    				set_input_value(input, /*value*/ ctx[0]);
    			}

    			if (/*clearable*/ ctx[11] && /*value*/ ctx[0] !== '') {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty[0] & /*clearable, value*/ 2049) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_1$3(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div1, t4);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			if (append_slot) {
    				if (append_slot.p && (!current || dirty[1] & /*$$scope*/ 4096)) {
    					update_slot_base(
    						append_slot,
    						append_slot_template,
    						ctx,
    						/*$$scope*/ ctx[43],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[43])
    						: get_slot_changes(append_slot_template, /*$$scope*/ ctx[43], dirty, get_append_slot_changes),
    						get_append_slot_context
    					);
    				}
    			}

    			if (dirty[0] & /*filled*/ 32) {
    				toggle_class(div1, "filled", /*filled*/ ctx[5]);
    			}

    			if (dirty[0] & /*solo*/ 64) {
    				toggle_class(div1, "solo", /*solo*/ ctx[6]);
    			}

    			if (dirty[0] & /*outlined*/ 128) {
    				toggle_class(div1, "outlined", /*outlined*/ ctx[7]);
    			}

    			if (dirty[0] & /*flat*/ 256) {
    				toggle_class(div1, "flat", /*flat*/ ctx[8]);
    			}

    			if (dirty[0] & /*rounded*/ 1024) {
    				toggle_class(div1, "rounded", /*rounded*/ ctx[10]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(prepend_slot, local);
    			transition_in(default_slot, local);
    			transition_in(content_slot, local);
    			transition_in(if_block);
    			transition_in(append_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(prepend_slot, local);
    			transition_out(default_slot, local);
    			transition_out(content_slot, local);
    			transition_out(if_block);
    			transition_out(append_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (prepend_slot) prepend_slot.d(detaching);
    			if (default_slot) default_slot.d(detaching);
    			if (content_slot) content_slot.d(detaching);
    			/*input_binding*/ ctx[41](null);
    			if (if_block) if_block.d();
    			if (append_slot) append_slot.d(detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$5.name,
    		type: "slot",
    		source: "(64:0) <Input    class=\\\"s-text-field {klass}\\\"    {color}    {dense}    {readonly}    {disabled}    {error}    {success}    {style}>",
    		ctx
    	});

    	return block;
    }

    // (74:2) 
    function create_prepend_outer_slot(ctx) {
    	let current;
    	const prepend_outer_slot_template = /*#slots*/ ctx[33]["prepend-outer"];
    	const prepend_outer_slot = create_slot(prepend_outer_slot_template, ctx, /*$$scope*/ ctx[43], get_prepend_outer_slot_context);

    	const block = {
    		c: function create() {
    			if (prepend_outer_slot) prepend_outer_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (prepend_outer_slot) {
    				prepend_outer_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (prepend_outer_slot) {
    				if (prepend_outer_slot.p && (!current || dirty[1] & /*$$scope*/ 4096)) {
    					update_slot_base(
    						prepend_outer_slot,
    						prepend_outer_slot_template,
    						ctx,
    						/*$$scope*/ ctx[43],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[43])
    						: get_slot_changes(prepend_outer_slot_template, /*$$scope*/ ctx[43], dirty, get_prepend_outer_slot_changes),
    						get_prepend_outer_slot_context
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(prepend_outer_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(prepend_outer_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (prepend_outer_slot) prepend_outer_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_prepend_outer_slot.name,
    		type: "slot",
    		source: "(74:2) ",
    		ctx
    	});

    	return block;
    }

    // (128:6) {#each messages as message}
    function create_each_block_1(ctx) {
    	let span;
    	let t_value = /*message*/ ctx[44] + "";
    	let t;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			add_location(span, file$d, 127, 33, 3082);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*messages*/ 131072 && t_value !== (t_value = /*message*/ ctx[44] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(128:6) {#each messages as message}",
    		ctx
    	});

    	return block;
    }

    // (129:6) {#each errorMessages.slice(0, errorCount) as message}
    function create_each_block(ctx) {
    	let span;
    	let t_value = /*message*/ ctx[44] + "";
    	let t;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			add_location(span, file$d, 128, 59, 3172);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*errorMessages, errorCount*/ 4456448 && t_value !== (t_value = /*message*/ ctx[44] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(129:6) {#each errorMessages.slice(0, errorCount) as message}",
    		ctx
    	});

    	return block;
    }

    // (131:4) {#if counter}
    function create_if_block$6(ctx) {
    	let span;
    	let t0_value = /*value*/ ctx[0].length + "";
    	let t0;
    	let t1;
    	let t2;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t0 = text(t0_value);
    			t1 = text(" / ");
    			t2 = text(/*counter*/ ctx[16]);
    			add_location(span, file$d, 130, 17, 3232);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t0);
    			append_dev(span, t1);
    			append_dev(span, t2);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*value*/ 1 && t0_value !== (t0_value = /*value*/ ctx[0].length + "")) set_data_dev(t0, t0_value);
    			if (dirty[0] & /*counter*/ 65536) set_data_dev(t2, /*counter*/ ctx[16]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$6.name,
    		type: "if",
    		source: "(131:4) {#if counter}",
    		ctx
    	});

    	return block;
    }

    // (125:2) 
    function create_messages_slot(ctx) {
    	let div1;
    	let div0;
    	let span;
    	let t0;
    	let t1;
    	let t2;
    	let t3;
    	let each_value_1 = /*messages*/ ctx[17];
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	let each_value = /*errorMessages*/ ctx[22].slice(0, /*errorCount*/ ctx[18]);
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	let if_block = /*counter*/ ctx[16] && create_if_block$6(ctx);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			span = element("span");
    			t0 = text(/*hint*/ ctx[15]);
    			t1 = space();

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t2 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t3 = space();
    			if (if_block) if_block.c();
    			add_location(span, file$d, 126, 6, 3028);
    			add_location(div0, file$d, 125, 4, 3015);
    			attr_dev(div1, "slot", "messages");
    			add_location(div1, file$d, 124, 2, 2988);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, span);
    			append_dev(span, t0);
    			append_dev(div0, t1);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(div0, null);
    			}

    			append_dev(div0, t2);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}

    			append_dev(div1, t3);
    			if (if_block) if_block.m(div1, null);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*hint*/ 32768) set_data_dev(t0, /*hint*/ ctx[15]);

    			if (dirty[0] & /*messages*/ 131072) {
    				each_value_1 = /*messages*/ ctx[17];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_1(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(div0, t2);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_1.length;
    			}

    			if (dirty[0] & /*errorMessages, errorCount*/ 4456448) {
    				each_value = /*errorMessages*/ ctx[22].slice(0, /*errorCount*/ ctx[18]);
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div0, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (/*counter*/ ctx[16]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$6(ctx);
    					if_block.c();
    					if_block.m(div1, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_each(each_blocks_1, detaching);
    			destroy_each(each_blocks, detaching);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_messages_slot.name,
    		type: "slot",
    		source: "(125:2) ",
    		ctx
    	});

    	return block;
    }

    // (135:2) 
    function create_append_outer_slot(ctx) {
    	let current;
    	const append_outer_slot_template = /*#slots*/ ctx[33]["append-outer"];
    	const append_outer_slot = create_slot(append_outer_slot_template, ctx, /*$$scope*/ ctx[43], get_append_outer_slot_context);

    	const block = {
    		c: function create() {
    			if (append_outer_slot) append_outer_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (append_outer_slot) {
    				append_outer_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (append_outer_slot) {
    				if (append_outer_slot.p && (!current || dirty[1] & /*$$scope*/ 4096)) {
    					update_slot_base(
    						append_outer_slot,
    						append_outer_slot_template,
    						ctx,
    						/*$$scope*/ ctx[43],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[43])
    						: get_slot_changes(append_outer_slot_template, /*$$scope*/ ctx[43], dirty, get_append_outer_slot_changes),
    						get_append_outer_slot_context
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(append_outer_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(append_outer_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (append_outer_slot) append_outer_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_append_outer_slot.name,
    		type: "slot",
    		source: "(135:2) ",
    		ctx
    	});

    	return block;
    }

    function create_fragment$d(ctx) {
    	let input;
    	let current;

    	input = new Input({
    			props: {
    				class: "s-text-field " + /*klass*/ ctx[3],
    				color: /*color*/ ctx[4],
    				dense: /*dense*/ ctx[9],
    				readonly: /*readonly*/ ctx[12],
    				disabled: /*disabled*/ ctx[13],
    				error: /*error*/ ctx[1],
    				success: /*success*/ ctx[19],
    				style: /*style*/ ctx[21],
    				$$slots: {
    					"append-outer": [create_append_outer_slot],
    					messages: [create_messages_slot],
    					"prepend-outer": [create_prepend_outer_slot],
    					default: [create_default_slot$5]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(input.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(input, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const input_changes = {};
    			if (dirty[0] & /*klass*/ 8) input_changes.class = "s-text-field " + /*klass*/ ctx[3];
    			if (dirty[0] & /*color*/ 16) input_changes.color = /*color*/ ctx[4];
    			if (dirty[0] & /*dense*/ 512) input_changes.dense = /*dense*/ ctx[9];
    			if (dirty[0] & /*readonly*/ 4096) input_changes.readonly = /*readonly*/ ctx[12];
    			if (dirty[0] & /*disabled*/ 8192) input_changes.disabled = /*disabled*/ ctx[13];
    			if (dirty[0] & /*error*/ 2) input_changes.error = /*error*/ ctx[1];
    			if (dirty[0] & /*success*/ 524288) input_changes.success = /*success*/ ctx[19];
    			if (dirty[0] & /*style*/ 2097152) input_changes.style = /*style*/ ctx[21];

    			if (dirty[0] & /*counter, value, errorMessages, errorCount, messages, hint, filled, solo, outlined, flat, rounded, clearable, placeholder, id, readonly, disabled, $$restProps, inputElement, labelActive*/ 282590693 | dirty[1] & /*$$scope*/ 4096) {
    				input_changes.$$scope = { dirty, ctx };
    			}

    			input.$set(input_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(input.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(input.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(input, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$d($$self, $$props, $$invalidate) {
    	let labelActive;

    	const omit_props_names = [
    		"class","value","color","filled","solo","outlined","flat","dense","rounded","clearable","readonly","disabled","placeholder","hint","counter","messages","rules","errorCount","validateOnBlur","error","success","id","style","inputElement","validate"
    	];

    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { $$slots: slots = {}, $$scope } = $$props;

    	validate_slots('TextField', slots, [
    		'append-outer','prepend-outer','prepend','default','content','clear-icon','append'
    	]);

    	let { class: klass = '' } = $$props;
    	let { value = '' } = $$props;
    	let { color = 'primary' } = $$props;
    	let { filled = false } = $$props;
    	let { solo = false } = $$props;
    	let { outlined = false } = $$props;
    	let { flat = false } = $$props;
    	let { dense = false } = $$props;
    	let { rounded = false } = $$props;
    	let { clearable = false } = $$props;
    	let { readonly = false } = $$props;
    	let { disabled = false } = $$props;
    	let { placeholder = null } = $$props;
    	let { hint = '' } = $$props;
    	let { counter = false } = $$props;
    	let { messages = [] } = $$props;
    	let { rules = [] } = $$props;
    	let { errorCount = 1 } = $$props;
    	let { validateOnBlur = false } = $$props;
    	let { error = false } = $$props;
    	let { success = false } = $$props;
    	let { id = `s-input-${uid(5)}` } = $$props;
    	let { style = null } = $$props;
    	let { inputElement = null } = $$props;
    	let focused = false;
    	let errorMessages = [];

    	function validate() {
    		$$invalidate(22, errorMessages = rules.map(r => r(value)).filter(r => typeof r === 'string'));

    		if (errorMessages.length) $$invalidate(1, error = true); else {
    			$$invalidate(1, error = false);
    		}

    		return error;
    	}

    	function onFocus() {
    		$$invalidate(32, focused = true);
    	}

    	function onBlur() {
    		$$invalidate(32, focused = false);
    		if (validateOnBlur) validate();
    	}

    	function clear() {
    		$$invalidate(0, value = '');
    	}

    	function onInput() {
    		if (!validateOnBlur) validate();
    	}

    	function focus_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function blur_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function input_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function change_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function keypress_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function keydown_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function keyup_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function input_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			inputElement = $$value;
    			$$invalidate(2, inputElement);
    		});
    	}

    	function input_input_handler() {
    		value = this.value;
    		$$invalidate(0, value);
    	}

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(28, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ('class' in $$new_props) $$invalidate(3, klass = $$new_props.class);
    		if ('value' in $$new_props) $$invalidate(0, value = $$new_props.value);
    		if ('color' in $$new_props) $$invalidate(4, color = $$new_props.color);
    		if ('filled' in $$new_props) $$invalidate(5, filled = $$new_props.filled);
    		if ('solo' in $$new_props) $$invalidate(6, solo = $$new_props.solo);
    		if ('outlined' in $$new_props) $$invalidate(7, outlined = $$new_props.outlined);
    		if ('flat' in $$new_props) $$invalidate(8, flat = $$new_props.flat);
    		if ('dense' in $$new_props) $$invalidate(9, dense = $$new_props.dense);
    		if ('rounded' in $$new_props) $$invalidate(10, rounded = $$new_props.rounded);
    		if ('clearable' in $$new_props) $$invalidate(11, clearable = $$new_props.clearable);
    		if ('readonly' in $$new_props) $$invalidate(12, readonly = $$new_props.readonly);
    		if ('disabled' in $$new_props) $$invalidate(13, disabled = $$new_props.disabled);
    		if ('placeholder' in $$new_props) $$invalidate(14, placeholder = $$new_props.placeholder);
    		if ('hint' in $$new_props) $$invalidate(15, hint = $$new_props.hint);
    		if ('counter' in $$new_props) $$invalidate(16, counter = $$new_props.counter);
    		if ('messages' in $$new_props) $$invalidate(17, messages = $$new_props.messages);
    		if ('rules' in $$new_props) $$invalidate(29, rules = $$new_props.rules);
    		if ('errorCount' in $$new_props) $$invalidate(18, errorCount = $$new_props.errorCount);
    		if ('validateOnBlur' in $$new_props) $$invalidate(30, validateOnBlur = $$new_props.validateOnBlur);
    		if ('error' in $$new_props) $$invalidate(1, error = $$new_props.error);
    		if ('success' in $$new_props) $$invalidate(19, success = $$new_props.success);
    		if ('id' in $$new_props) $$invalidate(20, id = $$new_props.id);
    		if ('style' in $$new_props) $$invalidate(21, style = $$new_props.style);
    		if ('inputElement' in $$new_props) $$invalidate(2, inputElement = $$new_props.inputElement);
    		if ('$$scope' in $$new_props) $$invalidate(43, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		Input,
    		Icon,
    		uid,
    		clearIcon: closeIcon,
    		klass,
    		value,
    		color,
    		filled,
    		solo,
    		outlined,
    		flat,
    		dense,
    		rounded,
    		clearable,
    		readonly,
    		disabled,
    		placeholder,
    		hint,
    		counter,
    		messages,
    		rules,
    		errorCount,
    		validateOnBlur,
    		error,
    		success,
    		id,
    		style,
    		inputElement,
    		focused,
    		errorMessages,
    		validate,
    		onFocus,
    		onBlur,
    		clear,
    		onInput,
    		labelActive
    	});

    	$$self.$inject_state = $$new_props => {
    		if ('klass' in $$props) $$invalidate(3, klass = $$new_props.klass);
    		if ('value' in $$props) $$invalidate(0, value = $$new_props.value);
    		if ('color' in $$props) $$invalidate(4, color = $$new_props.color);
    		if ('filled' in $$props) $$invalidate(5, filled = $$new_props.filled);
    		if ('solo' in $$props) $$invalidate(6, solo = $$new_props.solo);
    		if ('outlined' in $$props) $$invalidate(7, outlined = $$new_props.outlined);
    		if ('flat' in $$props) $$invalidate(8, flat = $$new_props.flat);
    		if ('dense' in $$props) $$invalidate(9, dense = $$new_props.dense);
    		if ('rounded' in $$props) $$invalidate(10, rounded = $$new_props.rounded);
    		if ('clearable' in $$props) $$invalidate(11, clearable = $$new_props.clearable);
    		if ('readonly' in $$props) $$invalidate(12, readonly = $$new_props.readonly);
    		if ('disabled' in $$props) $$invalidate(13, disabled = $$new_props.disabled);
    		if ('placeholder' in $$props) $$invalidate(14, placeholder = $$new_props.placeholder);
    		if ('hint' in $$props) $$invalidate(15, hint = $$new_props.hint);
    		if ('counter' in $$props) $$invalidate(16, counter = $$new_props.counter);
    		if ('messages' in $$props) $$invalidate(17, messages = $$new_props.messages);
    		if ('rules' in $$props) $$invalidate(29, rules = $$new_props.rules);
    		if ('errorCount' in $$props) $$invalidate(18, errorCount = $$new_props.errorCount);
    		if ('validateOnBlur' in $$props) $$invalidate(30, validateOnBlur = $$new_props.validateOnBlur);
    		if ('error' in $$props) $$invalidate(1, error = $$new_props.error);
    		if ('success' in $$props) $$invalidate(19, success = $$new_props.success);
    		if ('id' in $$props) $$invalidate(20, id = $$new_props.id);
    		if ('style' in $$props) $$invalidate(21, style = $$new_props.style);
    		if ('inputElement' in $$props) $$invalidate(2, inputElement = $$new_props.inputElement);
    		if ('focused' in $$props) $$invalidate(32, focused = $$new_props.focused);
    		if ('errorMessages' in $$props) $$invalidate(22, errorMessages = $$new_props.errorMessages);
    		if ('labelActive' in $$props) $$invalidate(23, labelActive = $$new_props.labelActive);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*placeholder, value*/ 16385 | $$self.$$.dirty[1] & /*focused*/ 2) {
    			$$invalidate(23, labelActive = !!placeholder || value || focused);
    		}
    	};

    	return [
    		value,
    		error,
    		inputElement,
    		klass,
    		color,
    		filled,
    		solo,
    		outlined,
    		flat,
    		dense,
    		rounded,
    		clearable,
    		readonly,
    		disabled,
    		placeholder,
    		hint,
    		counter,
    		messages,
    		errorCount,
    		success,
    		id,
    		style,
    		errorMessages,
    		labelActive,
    		onFocus,
    		onBlur,
    		clear,
    		onInput,
    		$$restProps,
    		rules,
    		validateOnBlur,
    		validate,
    		focused,
    		slots,
    		focus_handler,
    		blur_handler,
    		input_handler,
    		change_handler,
    		keypress_handler,
    		keydown_handler,
    		keyup_handler,
    		input_binding,
    		input_input_handler,
    		$$scope
    	];
    }

    class TextField extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance$d,
    			create_fragment$d,
    			safe_not_equal,
    			{
    				class: 3,
    				value: 0,
    				color: 4,
    				filled: 5,
    				solo: 6,
    				outlined: 7,
    				flat: 8,
    				dense: 9,
    				rounded: 10,
    				clearable: 11,
    				readonly: 12,
    				disabled: 13,
    				placeholder: 14,
    				hint: 15,
    				counter: 16,
    				messages: 17,
    				rules: 29,
    				errorCount: 18,
    				validateOnBlur: 30,
    				error: 1,
    				success: 19,
    				id: 20,
    				style: 21,
    				inputElement: 2,
    				validate: 31
    			},
    			null,
    			[-1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TextField",
    			options,
    			id: create_fragment$d.name
    		});
    	}

    	get class() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get color() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get filled() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set filled(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get solo() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set solo(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get outlined() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set outlined(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get flat() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set flat(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get dense() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set dense(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get rounded() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set rounded(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get clearable() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set clearable(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get readonly() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set readonly(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get placeholder() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set placeholder(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hint() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hint(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get counter() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set counter(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get messages() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set messages(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get rules() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set rules(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get errorCount() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set errorCount(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get validateOnBlur() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set validateOnBlur(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get error() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set error(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get success() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set success(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get id() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get inputElement() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set inputElement(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get validate() {
    		return this.$$.ctx[31];
    	}

    	set validate(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function fade(node, { delay = 0, duration = 400, easing = identity } = {}) {
        const o = +getComputedStyle(node).opacity;
        return {
            delay,
            duration,
            easing,
            css: t => `opacity: ${t * o}`
        };
    }

    /* node_modules/svelte-materialify/dist/components/Radio/Radio.svelte generated by Svelte v3.46.3 */
    const file$c = "node_modules/svelte-materialify/dist/components/Radio/Radio.svelte";

    function create_fragment$c(ctx) {
    	let div2;
    	let div1;
    	let input;
    	let t0;
    	let div0;
    	let div1_class_value;
    	let TextColor_action;
    	let t1;
    	let label;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[10].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[9], null);

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div1 = element("div");
    			input = element("input");
    			t0 = space();
    			div0 = element("div");
    			t1 = space();
    			label = element("label");
    			if (default_slot) default_slot.c();
    			attr_dev(input, "type", "radio");
    			attr_dev(input, "role", "radio");
    			attr_dev(input, "aria-selected", /*active*/ ctx[8]);
    			attr_dev(input, "id", /*id*/ ctx[1]);
    			input.__value = /*value*/ ctx[6];
    			input.value = input.__value;
    			input.disabled = /*disabled*/ ctx[5];
    			/*$$binding_groups*/ ctx[13][0].push(input);
    			add_location(input, file$c, 45, 4, 2458);
    			attr_dev(div0, "class", "s-radio__background");
    			add_location(div0, file$c, 54, 4, 2638);
    			attr_dev(div1, "class", div1_class_value = "s-radio__wrapper " + /*klass*/ ctx[3]);
    			toggle_class(div1, "disabled", /*disabled*/ ctx[5]);
    			add_location(div1, file$c, 40, 2, 2302);
    			attr_dev(label, "for", /*id*/ ctx[1]);
    			add_location(label, file$c, 56, 2, 2687);
    			attr_dev(div2, "class", "s-radio");
    			attr_dev(div2, "style", /*style*/ ctx[7]);
    			add_location(div2, file$c, 39, 0, 2269);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);
    			append_dev(div1, input);
    			/*input_binding*/ ctx[11](input);
    			input.checked = input.__value === /*group*/ ctx[0];
    			append_dev(div1, t0);
    			append_dev(div1, div0);
    			append_dev(div2, t1);
    			append_dev(div2, label);

    			if (default_slot) {
    				default_slot.m(label, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "change", /*input_change_handler*/ ctx[12]),
    					action_destroyer(TextColor_action = TextColor.call(null, div1, !/*disabled*/ ctx[5] && /*active*/ ctx[8] && /*color*/ ctx[4])),
    					action_destroyer(Ripple.call(null, div1, { centered: true }))
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*active*/ 256) {
    				attr_dev(input, "aria-selected", /*active*/ ctx[8]);
    			}

    			if (!current || dirty & /*id*/ 2) {
    				attr_dev(input, "id", /*id*/ ctx[1]);
    			}

    			if (!current || dirty & /*value*/ 64) {
    				prop_dev(input, "__value", /*value*/ ctx[6]);
    				input.value = input.__value;
    			}

    			if (!current || dirty & /*disabled*/ 32) {
    				prop_dev(input, "disabled", /*disabled*/ ctx[5]);
    			}

    			if (dirty & /*group*/ 1) {
    				input.checked = input.__value === /*group*/ ctx[0];
    			}

    			if (!current || dirty & /*klass*/ 8 && div1_class_value !== (div1_class_value = "s-radio__wrapper " + /*klass*/ ctx[3])) {
    				attr_dev(div1, "class", div1_class_value);
    			}

    			if (TextColor_action && is_function(TextColor_action.update) && dirty & /*disabled, active, color*/ 304) TextColor_action.update.call(null, !/*disabled*/ ctx[5] && /*active*/ ctx[8] && /*color*/ ctx[4]);

    			if (dirty & /*klass, disabled*/ 40) {
    				toggle_class(div1, "disabled", /*disabled*/ ctx[5]);
    			}

    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 512)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[9],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[9])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[9], dirty, null),
    						null
    					);
    				}
    			}

    			if (!current || dirty & /*id*/ 2) {
    				attr_dev(label, "for", /*id*/ ctx[1]);
    			}

    			if (!current || dirty & /*style*/ 128) {
    				attr_dev(div2, "style", /*style*/ ctx[7]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			/*input_binding*/ ctx[11](null);
    			/*$$binding_groups*/ ctx[13][0].splice(/*$$binding_groups*/ ctx[13][0].indexOf(input), 1);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self, $$props, $$invalidate) {
    	let active;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Radio', slots, ['default']);
    	let { class: klass = '' } = $$props;
    	let { color = 'primary' } = $$props;
    	let { disabled = false } = $$props;
    	let { group = [] } = $$props;
    	let { value = null } = $$props;
    	let { id = null } = $$props;
    	let { style = null } = $$props;
    	let { inputElement = null } = $$props;
    	id = id || `s-radio-${uid(5)}`;
    	const writable_props = ['class', 'color', 'disabled', 'group', 'value', 'id', 'style', 'inputElement'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Radio> was created with unknown prop '${key}'`);
    	});

    	const $$binding_groups = [[]];

    	function input_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			inputElement = $$value;
    			$$invalidate(2, inputElement);
    		});
    	}

    	function input_change_handler() {
    		group = this.__value;
    		$$invalidate(0, group);
    	}

    	$$self.$$set = $$props => {
    		if ('class' in $$props) $$invalidate(3, klass = $$props.class);
    		if ('color' in $$props) $$invalidate(4, color = $$props.color);
    		if ('disabled' in $$props) $$invalidate(5, disabled = $$props.disabled);
    		if ('group' in $$props) $$invalidate(0, group = $$props.group);
    		if ('value' in $$props) $$invalidate(6, value = $$props.value);
    		if ('id' in $$props) $$invalidate(1, id = $$props.id);
    		if ('style' in $$props) $$invalidate(7, style = $$props.style);
    		if ('inputElement' in $$props) $$invalidate(2, inputElement = $$props.inputElement);
    		if ('$$scope' in $$props) $$invalidate(9, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		uid,
    		TextColor,
    		Ripple,
    		klass,
    		color,
    		disabled,
    		group,
    		value,
    		id,
    		style,
    		inputElement,
    		active
    	});

    	$$self.$inject_state = $$props => {
    		if ('klass' in $$props) $$invalidate(3, klass = $$props.klass);
    		if ('color' in $$props) $$invalidate(4, color = $$props.color);
    		if ('disabled' in $$props) $$invalidate(5, disabled = $$props.disabled);
    		if ('group' in $$props) $$invalidate(0, group = $$props.group);
    		if ('value' in $$props) $$invalidate(6, value = $$props.value);
    		if ('id' in $$props) $$invalidate(1, id = $$props.id);
    		if ('style' in $$props) $$invalidate(7, style = $$props.style);
    		if ('inputElement' in $$props) $$invalidate(2, inputElement = $$props.inputElement);
    		if ('active' in $$props) $$invalidate(8, active = $$props.active);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*group, value*/ 65) {
    			$$invalidate(8, active = group === value);
    		}
    	};

    	return [
    		group,
    		id,
    		inputElement,
    		klass,
    		color,
    		disabled,
    		value,
    		style,
    		active,
    		$$scope,
    		slots,
    		input_binding,
    		input_change_handler,
    		$$binding_groups
    	];
    }

    class Radio extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$c, create_fragment$c, safe_not_equal, {
    			class: 3,
    			color: 4,
    			disabled: 5,
    			group: 0,
    			value: 6,
    			id: 1,
    			style: 7,
    			inputElement: 2
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Radio",
    			options,
    			id: create_fragment$c.name
    		});
    	}

    	get class() {
    		throw new Error("<Radio>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Radio>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get color() {
    		throw new Error("<Radio>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<Radio>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<Radio>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<Radio>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get group() {
    		throw new Error("<Radio>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set group(value) {
    		throw new Error("<Radio>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<Radio>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<Radio>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get id() {
    		throw new Error("<Radio>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<Radio>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<Radio>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<Radio>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get inputElement() {
    		throw new Error("<Radio>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set inputElement(value) {
    		throw new Error("<Radio>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svelte-materialify/dist/components/Alert/Alert.svelte generated by Svelte v3.46.3 */
    const file$b = "node_modules/svelte-materialify/dist/components/Alert/Alert.svelte";
    const get_close_slot_changes = dirty => ({});
    const get_close_slot_context = ctx => ({});
    const get_icon_slot_changes$1 = dirty => ({});
    const get_icon_slot_context$1 = ctx => ({});

    // (34:0) {#if visible}
    function create_if_block$5(ctx) {
    	let div2;
    	let div1;
    	let t0;
    	let div0;
    	let t1;
    	let t2;
    	let div2_class_value;
    	let div2_transition;
    	let current;
    	let mounted;
    	let dispose;
    	const icon_slot_template = /*#slots*/ ctx[12].icon;
    	const icon_slot = create_slot(icon_slot_template, ctx, /*$$scope*/ ctx[17], get_icon_slot_context$1);
    	const default_slot_template = /*#slots*/ ctx[12].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[17], null);
    	let if_block0 = /*dismissible*/ ctx[8] && create_if_block_2(ctx);
    	let if_block1 = /*border*/ ctx[9] && create_if_block_1$2(ctx);

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div1 = element("div");
    			if (icon_slot) icon_slot.c();
    			t0 = space();
    			div0 = element("div");
    			if (default_slot) default_slot.c();
    			t1 = space();
    			if (if_block0) if_block0.c();
    			t2 = space();
    			if (if_block1) if_block1.c();
    			attr_dev(div0, "class", "s-alert__content");
    			add_location(div0, file$b, 50, 6, 3450);
    			attr_dev(div1, "class", "s-alert__wrapper");
    			add_location(div1, file$b, 47, 4, 3331);
    			attr_dev(div2, "role", "alert");
    			attr_dev(div2, "class", div2_class_value = "s-alert " + /*klass*/ ctx[1]);
    			toggle_class(div2, "dense", /*dense*/ ctx[4]);
    			toggle_class(div2, "outlined", /*outlined*/ ctx[5]);
    			toggle_class(div2, "text", /*text*/ ctx[6]);
    			toggle_class(div2, "tile", /*tile*/ ctx[7]);
    			toggle_class(div2, "colored-border", /*coloredBorder*/ ctx[10]);
    			add_location(div2, file$b, 34, 2, 3046);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);

    			if (icon_slot) {
    				icon_slot.m(div1, null);
    			}

    			append_dev(div1, t0);
    			append_dev(div1, div0);

    			if (default_slot) {
    				default_slot.m(div0, null);
    			}

    			append_dev(div1, t1);
    			if (if_block0) if_block0.m(div1, null);
    			append_dev(div1, t2);
    			if (if_block1) if_block1.m(div1, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(div2, "introstart", /*introstart_handler*/ ctx[13], false, false, false),
    					listen_dev(div2, "outrostart", /*outrostart_handler*/ ctx[14], false, false, false),
    					listen_dev(div2, "introend", /*introend_handler*/ ctx[15], false, false, false),
    					listen_dev(div2, "outroend", /*outroend_handler*/ ctx[16], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (icon_slot) {
    				if (icon_slot.p && (!current || dirty & /*$$scope*/ 131072)) {
    					update_slot_base(
    						icon_slot,
    						icon_slot_template,
    						ctx,
    						/*$$scope*/ ctx[17],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[17])
    						: get_slot_changes(icon_slot_template, /*$$scope*/ ctx[17], dirty, get_icon_slot_changes$1),
    						get_icon_slot_context$1
    					);
    				}
    			}

    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 131072)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[17],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[17])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[17], dirty, null),
    						null
    					);
    				}
    			}

    			if (/*dismissible*/ ctx[8]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty & /*dismissible*/ 256) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_2(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(div1, t2);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (/*border*/ ctx[9]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_1$2(ctx);
    					if_block1.c();
    					if_block1.m(div1, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (!current || dirty & /*klass*/ 2 && div2_class_value !== (div2_class_value = "s-alert " + /*klass*/ ctx[1])) {
    				attr_dev(div2, "class", div2_class_value);
    			}

    			if (dirty & /*klass, dense*/ 18) {
    				toggle_class(div2, "dense", /*dense*/ ctx[4]);
    			}

    			if (dirty & /*klass, outlined*/ 34) {
    				toggle_class(div2, "outlined", /*outlined*/ ctx[5]);
    			}

    			if (dirty & /*klass, text*/ 66) {
    				toggle_class(div2, "text", /*text*/ ctx[6]);
    			}

    			if (dirty & /*klass, tile*/ 130) {
    				toggle_class(div2, "tile", /*tile*/ ctx[7]);
    			}

    			if (dirty & /*klass, coloredBorder*/ 1026) {
    				toggle_class(div2, "colored-border", /*coloredBorder*/ ctx[10]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(icon_slot, local);
    			transition_in(default_slot, local);
    			transition_in(if_block0);

    			add_render_callback(() => {
    				if (!div2_transition) div2_transition = create_bidirectional_transition(div2, /*transition*/ ctx[2], /*transitionOpts*/ ctx[3], true);
    				div2_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(icon_slot, local);
    			transition_out(default_slot, local);
    			transition_out(if_block0);
    			if (!div2_transition) div2_transition = create_bidirectional_transition(div2, /*transition*/ ctx[2], /*transitionOpts*/ ctx[3], false);
    			div2_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			if (icon_slot) icon_slot.d(detaching);
    			if (default_slot) default_slot.d(detaching);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if (detaching && div2_transition) div2_transition.end();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$5.name,
    		type: "if",
    		source: "(34:0) {#if visible}",
    		ctx
    	});

    	return block;
    }

    // (54:6) {#if dismissible}
    function create_if_block_2(ctx) {
    	let button;
    	let current;

    	button = new Button({
    			props: {
    				icon: true,
    				$$slots: { default: [create_default_slot$4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button.$on("click", /*dismiss*/ ctx[11]);

    	const block = {
    		c: function create() {
    			create_component(button.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(button, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const button_changes = {};

    			if (dirty & /*$$scope*/ 131072) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(button, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(54:6) {#if dismissible}",
    		ctx
    	});

    	return block;
    }

    // (57:29) ✖
    function fallback_block$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("✖");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block$1.name,
    		type: "fallback",
    		source: "(57:29) ✖",
    		ctx
    	});

    	return block;
    }

    // (55:8) <Button icon on:click={dismiss}>
    function create_default_slot$4(ctx) {
    	let current;
    	const close_slot_template = /*#slots*/ ctx[12].close;
    	const close_slot = create_slot(close_slot_template, ctx, /*$$scope*/ ctx[17], get_close_slot_context);
    	const close_slot_or_fallback = close_slot || fallback_block$1(ctx);

    	const block = {
    		c: function create() {
    			if (close_slot_or_fallback) close_slot_or_fallback.c();
    		},
    		m: function mount(target, anchor) {
    			if (close_slot_or_fallback) {
    				close_slot_or_fallback.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (close_slot) {
    				if (close_slot.p && (!current || dirty & /*$$scope*/ 131072)) {
    					update_slot_base(
    						close_slot,
    						close_slot_template,
    						ctx,
    						/*$$scope*/ ctx[17],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[17])
    						: get_slot_changes(close_slot_template, /*$$scope*/ ctx[17], dirty, get_close_slot_changes),
    						get_close_slot_context
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(close_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(close_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (close_slot_or_fallback) close_slot_or_fallback.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$4.name,
    		type: "slot",
    		source: "(55:8) <Button icon on:click={dismiss}>",
    		ctx
    	});

    	return block;
    }

    // (60:6) {#if border}
    function create_if_block_1$2(ctx) {
    	let div;
    	let div_class_value;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", div_class_value = "s-alert__border border-" + /*border*/ ctx[9]);
    			add_location(div, file$b, 60, 8, 3728);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*border*/ 512 && div_class_value !== (div_class_value = "s-alert__border border-" + /*border*/ ctx[9])) {
    				attr_dev(div, "class", div_class_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(60:6) {#if border}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$b(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*visible*/ ctx[0] && create_if_block$5(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*visible*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*visible*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$5(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Alert', slots, ['icon','default','close']);
    	const dispatch = createEventDispatcher();
    	let { class: klass = '' } = $$props;
    	let { visible = true } = $$props;
    	let { transition = fade } = $$props;
    	let { transitionOpts = { duration: 0 } } = $$props;
    	let { dense = false } = $$props;
    	let { outlined = false } = $$props;
    	let { text = false } = $$props;
    	let { tile = false } = $$props;
    	let { dismissible = false } = $$props;
    	let { border = false } = $$props;
    	let { coloredBorder = false } = $$props;

    	function dismiss() {
    		$$invalidate(0, visible = false);

    		/**
     * Triggered when alert is dismissed.
     * @returns Nothing
     */
    		dispatch('dismiss');
    	}

    	const writable_props = [
    		'class',
    		'visible',
    		'transition',
    		'transitionOpts',
    		'dense',
    		'outlined',
    		'text',
    		'tile',
    		'dismissible',
    		'border',
    		'coloredBorder'
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Alert> was created with unknown prop '${key}'`);
    	});

    	function introstart_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function outrostart_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function introend_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function outroend_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ('class' in $$props) $$invalidate(1, klass = $$props.class);
    		if ('visible' in $$props) $$invalidate(0, visible = $$props.visible);
    		if ('transition' in $$props) $$invalidate(2, transition = $$props.transition);
    		if ('transitionOpts' in $$props) $$invalidate(3, transitionOpts = $$props.transitionOpts);
    		if ('dense' in $$props) $$invalidate(4, dense = $$props.dense);
    		if ('outlined' in $$props) $$invalidate(5, outlined = $$props.outlined);
    		if ('text' in $$props) $$invalidate(6, text = $$props.text);
    		if ('tile' in $$props) $$invalidate(7, tile = $$props.tile);
    		if ('dismissible' in $$props) $$invalidate(8, dismissible = $$props.dismissible);
    		if ('border' in $$props) $$invalidate(9, border = $$props.border);
    		if ('coloredBorder' in $$props) $$invalidate(10, coloredBorder = $$props.coloredBorder);
    		if ('$$scope' in $$props) $$invalidate(17, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		fade,
    		dispatch,
    		Button,
    		klass,
    		visible,
    		transition,
    		transitionOpts,
    		dense,
    		outlined,
    		text,
    		tile,
    		dismissible,
    		border,
    		coloredBorder,
    		dismiss
    	});

    	$$self.$inject_state = $$props => {
    		if ('klass' in $$props) $$invalidate(1, klass = $$props.klass);
    		if ('visible' in $$props) $$invalidate(0, visible = $$props.visible);
    		if ('transition' in $$props) $$invalidate(2, transition = $$props.transition);
    		if ('transitionOpts' in $$props) $$invalidate(3, transitionOpts = $$props.transitionOpts);
    		if ('dense' in $$props) $$invalidate(4, dense = $$props.dense);
    		if ('outlined' in $$props) $$invalidate(5, outlined = $$props.outlined);
    		if ('text' in $$props) $$invalidate(6, text = $$props.text);
    		if ('tile' in $$props) $$invalidate(7, tile = $$props.tile);
    		if ('dismissible' in $$props) $$invalidate(8, dismissible = $$props.dismissible);
    		if ('border' in $$props) $$invalidate(9, border = $$props.border);
    		if ('coloredBorder' in $$props) $$invalidate(10, coloredBorder = $$props.coloredBorder);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		visible,
    		klass,
    		transition,
    		transitionOpts,
    		dense,
    		outlined,
    		text,
    		tile,
    		dismissible,
    		border,
    		coloredBorder,
    		dismiss,
    		slots,
    		introstart_handler,
    		outrostart_handler,
    		introend_handler,
    		outroend_handler,
    		$$scope
    	];
    }

    class Alert extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$b, create_fragment$b, safe_not_equal, {
    			class: 1,
    			visible: 0,
    			transition: 2,
    			transitionOpts: 3,
    			dense: 4,
    			outlined: 5,
    			text: 6,
    			tile: 7,
    			dismissible: 8,
    			border: 9,
    			coloredBorder: 10
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Alert",
    			options,
    			id: create_fragment$b.name
    		});
    	}

    	get class() {
    		throw new Error("<Alert>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Alert>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get visible() {
    		throw new Error("<Alert>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set visible(value) {
    		throw new Error("<Alert>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get transition() {
    		throw new Error("<Alert>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set transition(value) {
    		throw new Error("<Alert>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get transitionOpts() {
    		throw new Error("<Alert>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set transitionOpts(value) {
    		throw new Error("<Alert>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get dense() {
    		throw new Error("<Alert>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set dense(value) {
    		throw new Error("<Alert>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get outlined() {
    		throw new Error("<Alert>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set outlined(value) {
    		throw new Error("<Alert>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get text() {
    		throw new Error("<Alert>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set text(value) {
    		throw new Error("<Alert>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get tile() {
    		throw new Error("<Alert>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tile(value) {
    		throw new Error("<Alert>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get dismissible() {
    		throw new Error("<Alert>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set dismissible(value) {
    		throw new Error("<Alert>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get border() {
    		throw new Error("<Alert>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set border(value) {
    		throw new Error("<Alert>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get coloredBorder() {
    		throw new Error("<Alert>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set coloredBorder(value) {
    		throw new Error("<Alert>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svelte-materialify/dist/components/AppBar/AppBar.svelte generated by Svelte v3.46.3 */
    const file$a = "node_modules/svelte-materialify/dist/components/AppBar/AppBar.svelte";
    const get_extension_slot_changes = dirty => ({});
    const get_extension_slot_context = ctx => ({});
    const get_title_slot_changes = dirty => ({});
    const get_title_slot_context = ctx => ({});
    const get_icon_slot_changes = dirty => ({});
    const get_icon_slot_context = ctx => ({});

    // (32:4) {#if !collapsed}
    function create_if_block$4(ctx) {
    	let div;
    	let current;
    	const title_slot_template = /*#slots*/ ctx[11].title;
    	const title_slot = create_slot(title_slot_template, ctx, /*$$scope*/ ctx[10], get_title_slot_context);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (title_slot) title_slot.c();
    			attr_dev(div, "class", "s-app-bar__title");
    			add_location(div, file$a, 32, 6, 2022);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (title_slot) {
    				title_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (title_slot) {
    				if (title_slot.p && (!current || dirty & /*$$scope*/ 1024)) {
    					update_slot_base(
    						title_slot,
    						title_slot_template,
    						ctx,
    						/*$$scope*/ ctx[10],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[10])
    						: get_slot_changes(title_slot_template, /*$$scope*/ ctx[10], dirty, get_title_slot_changes),
    						get_title_slot_context
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(title_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(title_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (title_slot) title_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(32:4) {#if !collapsed}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$a(ctx) {
    	let header;
    	let div;
    	let t0;
    	let t1;
    	let t2;
    	let header_class_value;
    	let Style_action;
    	let current;
    	let mounted;
    	let dispose;
    	const icon_slot_template = /*#slots*/ ctx[11].icon;
    	const icon_slot = create_slot(icon_slot_template, ctx, /*$$scope*/ ctx[10], get_icon_slot_context);
    	let if_block = !/*collapsed*/ ctx[8] && create_if_block$4(ctx);
    	const default_slot_template = /*#slots*/ ctx[11].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[10], null);
    	const extension_slot_template = /*#slots*/ ctx[11].extension;
    	const extension_slot = create_slot(extension_slot_template, ctx, /*$$scope*/ ctx[10], get_extension_slot_context);

    	const block = {
    		c: function create() {
    			header = element("header");
    			div = element("div");
    			if (icon_slot) icon_slot.c();
    			t0 = space();
    			if (if_block) if_block.c();
    			t1 = space();
    			if (default_slot) default_slot.c();
    			t2 = space();
    			if (extension_slot) extension_slot.c();
    			attr_dev(div, "class", "s-app-bar__wrapper");
    			add_location(div, file$a, 29, 2, 1937);
    			attr_dev(header, "class", header_class_value = "s-app-bar " + /*klass*/ ctx[0]);
    			attr_dev(header, "style", /*style*/ ctx[9]);
    			toggle_class(header, "tile", /*tile*/ ctx[2]);
    			toggle_class(header, "flat", /*flat*/ ctx[3]);
    			toggle_class(header, "dense", /*dense*/ ctx[4]);
    			toggle_class(header, "prominent", /*prominent*/ ctx[5]);
    			toggle_class(header, "fixed", /*fixed*/ ctx[6]);
    			toggle_class(header, "absolute", /*absolute*/ ctx[7]);
    			toggle_class(header, "collapsed", /*collapsed*/ ctx[8]);
    			add_location(header, file$a, 18, 0, 1738);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, header, anchor);
    			append_dev(header, div);

    			if (icon_slot) {
    				icon_slot.m(div, null);
    			}

    			append_dev(div, t0);
    			if (if_block) if_block.m(div, null);
    			append_dev(div, t1);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			append_dev(header, t2);

    			if (extension_slot) {
    				extension_slot.m(header, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = action_destroyer(Style_action = Style.call(null, header, { 'app-bar-height': /*height*/ ctx[1] }));
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (icon_slot) {
    				if (icon_slot.p && (!current || dirty & /*$$scope*/ 1024)) {
    					update_slot_base(
    						icon_slot,
    						icon_slot_template,
    						ctx,
    						/*$$scope*/ ctx[10],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[10])
    						: get_slot_changes(icon_slot_template, /*$$scope*/ ctx[10], dirty, get_icon_slot_changes),
    						get_icon_slot_context
    					);
    				}
    			}

    			if (!/*collapsed*/ ctx[8]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*collapsed*/ 256) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$4(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div, t1);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 1024)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[10],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[10])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[10], dirty, null),
    						null
    					);
    				}
    			}

    			if (extension_slot) {
    				if (extension_slot.p && (!current || dirty & /*$$scope*/ 1024)) {
    					update_slot_base(
    						extension_slot,
    						extension_slot_template,
    						ctx,
    						/*$$scope*/ ctx[10],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[10])
    						: get_slot_changes(extension_slot_template, /*$$scope*/ ctx[10], dirty, get_extension_slot_changes),
    						get_extension_slot_context
    					);
    				}
    			}

    			if (!current || dirty & /*klass*/ 1 && header_class_value !== (header_class_value = "s-app-bar " + /*klass*/ ctx[0])) {
    				attr_dev(header, "class", header_class_value);
    			}

    			if (!current || dirty & /*style*/ 512) {
    				attr_dev(header, "style", /*style*/ ctx[9]);
    			}

    			if (Style_action && is_function(Style_action.update) && dirty & /*height*/ 2) Style_action.update.call(null, { 'app-bar-height': /*height*/ ctx[1] });

    			if (dirty & /*klass, tile*/ 5) {
    				toggle_class(header, "tile", /*tile*/ ctx[2]);
    			}

    			if (dirty & /*klass, flat*/ 9) {
    				toggle_class(header, "flat", /*flat*/ ctx[3]);
    			}

    			if (dirty & /*klass, dense*/ 17) {
    				toggle_class(header, "dense", /*dense*/ ctx[4]);
    			}

    			if (dirty & /*klass, prominent*/ 33) {
    				toggle_class(header, "prominent", /*prominent*/ ctx[5]);
    			}

    			if (dirty & /*klass, fixed*/ 65) {
    				toggle_class(header, "fixed", /*fixed*/ ctx[6]);
    			}

    			if (dirty & /*klass, absolute*/ 129) {
    				toggle_class(header, "absolute", /*absolute*/ ctx[7]);
    			}

    			if (dirty & /*klass, collapsed*/ 257) {
    				toggle_class(header, "collapsed", /*collapsed*/ ctx[8]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(icon_slot, local);
    			transition_in(if_block);
    			transition_in(default_slot, local);
    			transition_in(extension_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(icon_slot, local);
    			transition_out(if_block);
    			transition_out(default_slot, local);
    			transition_out(extension_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(header);
    			if (icon_slot) icon_slot.d(detaching);
    			if (if_block) if_block.d();
    			if (default_slot) default_slot.d(detaching);
    			if (extension_slot) extension_slot.d(detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('AppBar', slots, ['icon','title','default','extension']);
    	let { class: klass = '' } = $$props;
    	let { height = '56px' } = $$props;
    	let { tile = false } = $$props;
    	let { flat = false } = $$props;
    	let { dense = false } = $$props;
    	let { prominent = false } = $$props;
    	let { fixed = false } = $$props;
    	let { absolute = false } = $$props;
    	let { collapsed = false } = $$props;
    	let { style = '' } = $$props;

    	const writable_props = [
    		'class',
    		'height',
    		'tile',
    		'flat',
    		'dense',
    		'prominent',
    		'fixed',
    		'absolute',
    		'collapsed',
    		'style'
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<AppBar> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('class' in $$props) $$invalidate(0, klass = $$props.class);
    		if ('height' in $$props) $$invalidate(1, height = $$props.height);
    		if ('tile' in $$props) $$invalidate(2, tile = $$props.tile);
    		if ('flat' in $$props) $$invalidate(3, flat = $$props.flat);
    		if ('dense' in $$props) $$invalidate(4, dense = $$props.dense);
    		if ('prominent' in $$props) $$invalidate(5, prominent = $$props.prominent);
    		if ('fixed' in $$props) $$invalidate(6, fixed = $$props.fixed);
    		if ('absolute' in $$props) $$invalidate(7, absolute = $$props.absolute);
    		if ('collapsed' in $$props) $$invalidate(8, collapsed = $$props.collapsed);
    		if ('style' in $$props) $$invalidate(9, style = $$props.style);
    		if ('$$scope' in $$props) $$invalidate(10, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		Style,
    		klass,
    		height,
    		tile,
    		flat,
    		dense,
    		prominent,
    		fixed,
    		absolute,
    		collapsed,
    		style
    	});

    	$$self.$inject_state = $$props => {
    		if ('klass' in $$props) $$invalidate(0, klass = $$props.klass);
    		if ('height' in $$props) $$invalidate(1, height = $$props.height);
    		if ('tile' in $$props) $$invalidate(2, tile = $$props.tile);
    		if ('flat' in $$props) $$invalidate(3, flat = $$props.flat);
    		if ('dense' in $$props) $$invalidate(4, dense = $$props.dense);
    		if ('prominent' in $$props) $$invalidate(5, prominent = $$props.prominent);
    		if ('fixed' in $$props) $$invalidate(6, fixed = $$props.fixed);
    		if ('absolute' in $$props) $$invalidate(7, absolute = $$props.absolute);
    		if ('collapsed' in $$props) $$invalidate(8, collapsed = $$props.collapsed);
    		if ('style' in $$props) $$invalidate(9, style = $$props.style);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		klass,
    		height,
    		tile,
    		flat,
    		dense,
    		prominent,
    		fixed,
    		absolute,
    		collapsed,
    		style,
    		$$scope,
    		slots
    	];
    }

    class AppBar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$a, create_fragment$a, safe_not_equal, {
    			class: 0,
    			height: 1,
    			tile: 2,
    			flat: 3,
    			dense: 4,
    			prominent: 5,
    			fixed: 6,
    			absolute: 7,
    			collapsed: 8,
    			style: 9
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "AppBar",
    			options,
    			id: create_fragment$a.name
    		});
    	}

    	get class() {
    		throw new Error("<AppBar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<AppBar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get height() {
    		throw new Error("<AppBar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set height(value) {
    		throw new Error("<AppBar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get tile() {
    		throw new Error("<AppBar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tile(value) {
    		throw new Error("<AppBar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get flat() {
    		throw new Error("<AppBar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set flat(value) {
    		throw new Error("<AppBar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get dense() {
    		throw new Error("<AppBar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set dense(value) {
    		throw new Error("<AppBar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get prominent() {
    		throw new Error("<AppBar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set prominent(value) {
    		throw new Error("<AppBar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get fixed() {
    		throw new Error("<AppBar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fixed(value) {
    		throw new Error("<AppBar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get absolute() {
    		throw new Error("<AppBar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set absolute(value) {
    		throw new Error("<AppBar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get collapsed() {
    		throw new Error("<AppBar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set collapsed(value) {
    		throw new Error("<AppBar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<AppBar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<AppBar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svelte-materialify/dist/components/Grid/Row.svelte generated by Svelte v3.46.3 */

    const file$9 = "node_modules/svelte-materialify/dist/components/Grid/Row.svelte";

    function create_fragment$9(ctx) {
    	let div;
    	let div_class_value;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[5].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[4], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", div_class_value = "s-row " + /*klass*/ ctx[0]);
    			attr_dev(div, "style", /*style*/ ctx[3]);
    			toggle_class(div, "dense", /*dense*/ ctx[1]);
    			toggle_class(div, "no-gutters", /*noGutters*/ ctx[2]);
    			add_location(div, file$9, 10, 0, 518);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 16)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[4],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[4])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[4], dirty, null),
    						null
    					);
    				}
    			}

    			if (!current || dirty & /*klass*/ 1 && div_class_value !== (div_class_value = "s-row " + /*klass*/ ctx[0])) {
    				attr_dev(div, "class", div_class_value);
    			}

    			if (!current || dirty & /*style*/ 8) {
    				attr_dev(div, "style", /*style*/ ctx[3]);
    			}

    			if (dirty & /*klass, dense*/ 3) {
    				toggle_class(div, "dense", /*dense*/ ctx[1]);
    			}

    			if (dirty & /*klass, noGutters*/ 5) {
    				toggle_class(div, "no-gutters", /*noGutters*/ ctx[2]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Row', slots, ['default']);
    	let { class: klass = '' } = $$props;
    	let { dense = false } = $$props;
    	let { noGutters = false } = $$props;
    	let { style = null } = $$props;
    	const writable_props = ['class', 'dense', 'noGutters', 'style'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Row> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('class' in $$props) $$invalidate(0, klass = $$props.class);
    		if ('dense' in $$props) $$invalidate(1, dense = $$props.dense);
    		if ('noGutters' in $$props) $$invalidate(2, noGutters = $$props.noGutters);
    		if ('style' in $$props) $$invalidate(3, style = $$props.style);
    		if ('$$scope' in $$props) $$invalidate(4, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ klass, dense, noGutters, style });

    	$$self.$inject_state = $$props => {
    		if ('klass' in $$props) $$invalidate(0, klass = $$props.klass);
    		if ('dense' in $$props) $$invalidate(1, dense = $$props.dense);
    		if ('noGutters' in $$props) $$invalidate(2, noGutters = $$props.noGutters);
    		if ('style' in $$props) $$invalidate(3, style = $$props.style);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [klass, dense, noGutters, style, $$scope, slots];
    }

    class Row extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {
    			class: 0,
    			dense: 1,
    			noGutters: 2,
    			style: 3
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Row",
    			options,
    			id: create_fragment$9.name
    		});
    	}

    	get class() {
    		throw new Error("<Row>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Row>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get dense() {
    		throw new Error("<Row>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set dense(value) {
    		throw new Error("<Row>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get noGutters() {
    		throw new Error("<Row>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set noGutters(value) {
    		throw new Error("<Row>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<Row>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<Row>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svelte-materialify/dist/components/Grid/Col.svelte generated by Svelte v3.46.3 */
    const file$8 = "node_modules/svelte-materialify/dist/components/Grid/Col.svelte";

    function create_fragment$8(ctx) {
    	let div;
    	let div_class_value;
    	let Class_action;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[13].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[12], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", div_class_value = "s-col " + /*klass*/ ctx[0]);
    			attr_dev(div, "style", /*style*/ ctx[11]);
    			add_location(div, file$8, 20, 0, 7834);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = action_destroyer(Class_action = Class.call(null, div, [
    					/*cols*/ ctx[1] && `col-${/*cols*/ ctx[1]}`,
    					/*sm*/ ctx[2] && `sm-${/*sm*/ ctx[2]}`,
    					/*md*/ ctx[3] && `md-${/*md*/ ctx[3]}`,
    					/*lg*/ ctx[4] && `lg-${/*lg*/ ctx[4]}`,
    					/*xl*/ ctx[5] && `xl-${/*xl*/ ctx[5]}`,
    					/*offset*/ ctx[6] && `offset-${/*offset*/ ctx[6]}`,
    					/*offset_sm*/ ctx[7] && `offset-sm-${/*offset_sm*/ ctx[7]}`,
    					/*offset_md*/ ctx[8] && `offset-md-${/*offset_md*/ ctx[8]}`,
    					/*offset_lg*/ ctx[9] && `offset-lg-${/*offset_lg*/ ctx[9]}`,
    					/*offset_xl*/ ctx[10] && `offset-xl-${/*offset_xl*/ ctx[10]}`
    				]));

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 4096)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[12],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[12])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[12], dirty, null),
    						null
    					);
    				}
    			}

    			if (!current || dirty & /*klass*/ 1 && div_class_value !== (div_class_value = "s-col " + /*klass*/ ctx[0])) {
    				attr_dev(div, "class", div_class_value);
    			}

    			if (!current || dirty & /*style*/ 2048) {
    				attr_dev(div, "style", /*style*/ ctx[11]);
    			}

    			if (Class_action && is_function(Class_action.update) && dirty & /*cols, sm, md, lg, xl, offset, offset_sm, offset_md, offset_lg, offset_xl*/ 2046) Class_action.update.call(null, [
    				/*cols*/ ctx[1] && `col-${/*cols*/ ctx[1]}`,
    				/*sm*/ ctx[2] && `sm-${/*sm*/ ctx[2]}`,
    				/*md*/ ctx[3] && `md-${/*md*/ ctx[3]}`,
    				/*lg*/ ctx[4] && `lg-${/*lg*/ ctx[4]}`,
    				/*xl*/ ctx[5] && `xl-${/*xl*/ ctx[5]}`,
    				/*offset*/ ctx[6] && `offset-${/*offset*/ ctx[6]}`,
    				/*offset_sm*/ ctx[7] && `offset-sm-${/*offset_sm*/ ctx[7]}`,
    				/*offset_md*/ ctx[8] && `offset-md-${/*offset_md*/ ctx[8]}`,
    				/*offset_lg*/ ctx[9] && `offset-lg-${/*offset_lg*/ ctx[9]}`,
    				/*offset_xl*/ ctx[10] && `offset-xl-${/*offset_xl*/ ctx[10]}`
    			]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Col', slots, ['default']);
    	let { class: klass = '' } = $$props;
    	let { cols = false } = $$props;
    	let { sm = false } = $$props;
    	let { md = false } = $$props;
    	let { lg = false } = $$props;
    	let { xl = false } = $$props;
    	let { offset = false } = $$props;
    	let { offset_sm = false } = $$props;
    	let { offset_md = false } = $$props;
    	let { offset_lg = false } = $$props;
    	let { offset_xl = false } = $$props;
    	let { style = null } = $$props;

    	const writable_props = [
    		'class',
    		'cols',
    		'sm',
    		'md',
    		'lg',
    		'xl',
    		'offset',
    		'offset_sm',
    		'offset_md',
    		'offset_lg',
    		'offset_xl',
    		'style'
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Col> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('class' in $$props) $$invalidate(0, klass = $$props.class);
    		if ('cols' in $$props) $$invalidate(1, cols = $$props.cols);
    		if ('sm' in $$props) $$invalidate(2, sm = $$props.sm);
    		if ('md' in $$props) $$invalidate(3, md = $$props.md);
    		if ('lg' in $$props) $$invalidate(4, lg = $$props.lg);
    		if ('xl' in $$props) $$invalidate(5, xl = $$props.xl);
    		if ('offset' in $$props) $$invalidate(6, offset = $$props.offset);
    		if ('offset_sm' in $$props) $$invalidate(7, offset_sm = $$props.offset_sm);
    		if ('offset_md' in $$props) $$invalidate(8, offset_md = $$props.offset_md);
    		if ('offset_lg' in $$props) $$invalidate(9, offset_lg = $$props.offset_lg);
    		if ('offset_xl' in $$props) $$invalidate(10, offset_xl = $$props.offset_xl);
    		if ('style' in $$props) $$invalidate(11, style = $$props.style);
    		if ('$$scope' in $$props) $$invalidate(12, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		Class,
    		klass,
    		cols,
    		sm,
    		md,
    		lg,
    		xl,
    		offset,
    		offset_sm,
    		offset_md,
    		offset_lg,
    		offset_xl,
    		style
    	});

    	$$self.$inject_state = $$props => {
    		if ('klass' in $$props) $$invalidate(0, klass = $$props.klass);
    		if ('cols' in $$props) $$invalidate(1, cols = $$props.cols);
    		if ('sm' in $$props) $$invalidate(2, sm = $$props.sm);
    		if ('md' in $$props) $$invalidate(3, md = $$props.md);
    		if ('lg' in $$props) $$invalidate(4, lg = $$props.lg);
    		if ('xl' in $$props) $$invalidate(5, xl = $$props.xl);
    		if ('offset' in $$props) $$invalidate(6, offset = $$props.offset);
    		if ('offset_sm' in $$props) $$invalidate(7, offset_sm = $$props.offset_sm);
    		if ('offset_md' in $$props) $$invalidate(8, offset_md = $$props.offset_md);
    		if ('offset_lg' in $$props) $$invalidate(9, offset_lg = $$props.offset_lg);
    		if ('offset_xl' in $$props) $$invalidate(10, offset_xl = $$props.offset_xl);
    		if ('style' in $$props) $$invalidate(11, style = $$props.style);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		klass,
    		cols,
    		sm,
    		md,
    		lg,
    		xl,
    		offset,
    		offset_sm,
    		offset_md,
    		offset_lg,
    		offset_xl,
    		style,
    		$$scope,
    		slots
    	];
    }

    class Col extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {
    			class: 0,
    			cols: 1,
    			sm: 2,
    			md: 3,
    			lg: 4,
    			xl: 5,
    			offset: 6,
    			offset_sm: 7,
    			offset_md: 8,
    			offset_lg: 9,
    			offset_xl: 10,
    			style: 11
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Col",
    			options,
    			id: create_fragment$8.name
    		});
    	}

    	get class() {
    		throw new Error("<Col>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Col>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get cols() {
    		throw new Error("<Col>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set cols(value) {
    		throw new Error("<Col>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get sm() {
    		throw new Error("<Col>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set sm(value) {
    		throw new Error("<Col>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get md() {
    		throw new Error("<Col>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set md(value) {
    		throw new Error("<Col>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get lg() {
    		throw new Error("<Col>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set lg(value) {
    		throw new Error("<Col>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get xl() {
    		throw new Error("<Col>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set xl(value) {
    		throw new Error("<Col>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get offset() {
    		throw new Error("<Col>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set offset(value) {
    		throw new Error("<Col>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get offset_sm() {
    		throw new Error("<Col>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set offset_sm(value) {
    		throw new Error("<Col>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get offset_md() {
    		throw new Error("<Col>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set offset_md(value) {
    		throw new Error("<Col>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get offset_lg() {
    		throw new Error("<Col>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set offset_lg(value) {
    		throw new Error("<Col>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get offset_xl() {
    		throw new Error("<Col>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set offset_xl(value) {
    		throw new Error("<Col>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<Col>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<Col>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var prevIcon = 'M15.41,16.58L10.83,12L15.41,7.41L14,6L8,12L14,18L15.41,16.58Z';

    var nextIcon = 'M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z';

    /* node_modules/svelte-materialify/dist/components/SlideGroup/SlideGroup.svelte generated by Svelte v3.46.3 */
    const file$7 = "node_modules/svelte-materialify/dist/components/SlideGroup/SlideGroup.svelte";
    const get_next_slot_changes = dirty => ({});
    const get_next_slot_context = ctx => ({});
    const get_previous_slot_changes = dirty => ({});
    const get_previous_slot_context = ctx => ({});

    // (74:2) {#if arrowsVisible}
    function create_if_block_1$1(ctx) {
    	let div;
    	let current;
    	let mounted;
    	let dispose;
    	const previous_slot_template = /*#slots*/ ctx[17].previous;
    	const previous_slot = create_slot(previous_slot_template, ctx, /*$$scope*/ ctx[22], get_previous_slot_context);
    	const previous_slot_or_fallback = previous_slot || fallback_block_1(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (previous_slot_or_fallback) previous_slot_or_fallback.c();
    			attr_dev(div, "class", "s-slide-group__prev");
    			toggle_class(div, "disabled", /*x*/ ctx[9] === 0);
    			toggle_class(div, "hide-disabled-arrows", /*hideDisabledArrows*/ ctx[2]);
    			add_location(div, file$7, 74, 4, 2409);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (previous_slot_or_fallback) {
    				previous_slot_or_fallback.m(div, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*prev*/ ctx[12], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (previous_slot) {
    				if (previous_slot.p && (!current || dirty & /*$$scope*/ 4194304)) {
    					update_slot_base(
    						previous_slot,
    						previous_slot_template,
    						ctx,
    						/*$$scope*/ ctx[22],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[22])
    						: get_slot_changes(previous_slot_template, /*$$scope*/ ctx[22], dirty, get_previous_slot_changes),
    						get_previous_slot_context
    					);
    				}
    			}

    			if (dirty & /*x*/ 512) {
    				toggle_class(div, "disabled", /*x*/ ctx[9] === 0);
    			}

    			if (dirty & /*hideDisabledArrows*/ 4) {
    				toggle_class(div, "hide-disabled-arrows", /*hideDisabledArrows*/ ctx[2]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(previous_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(previous_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (previous_slot_or_fallback) previous_slot_or_fallback.d(detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(74:2) {#if arrowsVisible}",
    		ctx
    	});

    	return block;
    }

    // (80:28)          
    function fallback_block_1(ctx) {
    	let icon;
    	let current;

    	icon = new Icon({
    			props: { path: prevIcon },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(icon.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(icon, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(icon.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(icon.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(icon, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block_1.name,
    		type: "fallback",
    		source: "(80:28)          ",
    		ctx
    	});

    	return block;
    }

    // (97:2) {#if arrowsVisible}
    function create_if_block$3(ctx) {
    	let div;
    	let current;
    	let mounted;
    	let dispose;
    	const next_slot_template = /*#slots*/ ctx[17].next;
    	const next_slot = create_slot(next_slot_template, ctx, /*$$scope*/ ctx[22], get_next_slot_context);
    	const next_slot_or_fallback = next_slot || fallback_block(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (next_slot_or_fallback) next_slot_or_fallback.c();
    			attr_dev(div, "class", "s-slide-group__next");
    			toggle_class(div, "disabled", /*x*/ ctx[9] === /*contentWidth*/ ctx[7] - /*wrapperWidth*/ ctx[8]);
    			toggle_class(div, "show-arrows", /*hideDisabledArrows*/ ctx[2]);
    			add_location(div, file$7, 97, 4, 2994);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (next_slot_or_fallback) {
    				next_slot_or_fallback.m(div, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*next*/ ctx[11], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (next_slot) {
    				if (next_slot.p && (!current || dirty & /*$$scope*/ 4194304)) {
    					update_slot_base(
    						next_slot,
    						next_slot_template,
    						ctx,
    						/*$$scope*/ ctx[22],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[22])
    						: get_slot_changes(next_slot_template, /*$$scope*/ ctx[22], dirty, get_next_slot_changes),
    						get_next_slot_context
    					);
    				}
    			}

    			if (dirty & /*x, contentWidth, wrapperWidth*/ 896) {
    				toggle_class(div, "disabled", /*x*/ ctx[9] === /*contentWidth*/ ctx[7] - /*wrapperWidth*/ ctx[8]);
    			}

    			if (dirty & /*hideDisabledArrows*/ 4) {
    				toggle_class(div, "show-arrows", /*hideDisabledArrows*/ ctx[2]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(next_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(next_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (next_slot_or_fallback) next_slot_or_fallback.d(detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(97:2) {#if arrowsVisible}",
    		ctx
    	});

    	return block;
    }

    // (103:24)          
    function fallback_block(ctx) {
    	let icon;
    	let current;

    	icon = new Icon({
    			props: { path: nextIcon },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(icon.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(icon, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(icon.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(icon.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(icon, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block.name,
    		type: "fallback",
    		source: "(103:24)          ",
    		ctx
    	});

    	return block;
    }

    // (66:0) <ItemGroup   class="s-slide-group {klass}"   on:change   bind:value   {activeClass}   {multiple}   {mandatory}   {max}>
    function create_default_slot$3(ctx) {
    	let t0;
    	let div1;
    	let div0;
    	let div0_resize_listener;
    	let div1_resize_listener;
    	let t1;
    	let if_block1_anchor;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block0 = /*arrowsVisible*/ ctx[10] && create_if_block_1$1(ctx);
    	const default_slot_template = /*#slots*/ ctx[17].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[22], null);
    	let if_block1 = /*arrowsVisible*/ ctx[10] && create_if_block$3(ctx);

    	const block = {
    		c: function create() {
    			if (if_block0) if_block0.c();
    			t0 = space();
    			div1 = element("div");
    			div0 = element("div");
    			if (default_slot) default_slot.c();
    			t1 = space();
    			if (if_block1) if_block1.c();
    			if_block1_anchor = empty();
    			attr_dev(div0, "class", "s-slide-group__content");
    			set_style(div0, "transform", "translate(-" + /*x*/ ctx[9] + "px)");
    			add_render_callback(() => /*div0_elementresize_handler*/ ctx[18].call(div0));
    			add_location(div0, file$7, 89, 4, 2810);
    			attr_dev(div1, "class", "s-slide-group__wrapper");
    			add_render_callback(() => /*div1_elementresize_handler*/ ctx[19].call(div1));
    			add_location(div1, file$7, 84, 2, 2653);
    		},
    		m: function mount(target, anchor) {
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);

    			if (default_slot) {
    				default_slot.m(div0, null);
    			}

    			div0_resize_listener = add_resize_listener(div0, /*div0_elementresize_handler*/ ctx[18].bind(div0));
    			div1_resize_listener = add_resize_listener(div1, /*div1_elementresize_handler*/ ctx[19].bind(div1));
    			insert_dev(target, t1, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, if_block1_anchor, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(div1, "touchstart", /*touchstart*/ ctx[13], { passive: true }, false, false),
    					listen_dev(div1, "touchmove", /*touchmove*/ ctx[14], { passive: true }, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (/*arrowsVisible*/ ctx[10]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty & /*arrowsVisible*/ 1024) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_1$1(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(t0.parentNode, t0);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 4194304)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[22],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[22])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[22], dirty, null),
    						null
    					);
    				}
    			}

    			if (!current || dirty & /*x*/ 512) {
    				set_style(div0, "transform", "translate(-" + /*x*/ ctx[9] + "px)");
    			}

    			if (/*arrowsVisible*/ ctx[10]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*arrowsVisible*/ 1024) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block$3(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(default_slot, local);
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(default_slot, local);
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div1);
    			if (default_slot) default_slot.d(detaching);
    			div0_resize_listener();
    			div1_resize_listener();
    			if (detaching) detach_dev(t1);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(if_block1_anchor);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$3.name,
    		type: "slot",
    		source: "(66:0) <ItemGroup   class=\\\"s-slide-group {klass}\\\"   on:change   bind:value   {activeClass}   {multiple}   {mandatory}   {max}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let itemgroup;
    	let updating_value;
    	let current;

    	function itemgroup_value_binding(value) {
    		/*itemgroup_value_binding*/ ctx[20](value);
    	}

    	let itemgroup_props = {
    		class: "s-slide-group " + /*klass*/ ctx[1],
    		activeClass: /*activeClass*/ ctx[3],
    		multiple: /*multiple*/ ctx[4],
    		mandatory: /*mandatory*/ ctx[5],
    		max: /*max*/ ctx[6],
    		$$slots: { default: [create_default_slot$3] },
    		$$scope: { ctx }
    	};

    	if (/*value*/ ctx[0] !== void 0) {
    		itemgroup_props.value = /*value*/ ctx[0];
    	}

    	itemgroup = new ItemGroup({ props: itemgroup_props, $$inline: true });
    	binding_callbacks.push(() => bind(itemgroup, 'value', itemgroup_value_binding));
    	itemgroup.$on("change", /*change_handler*/ ctx[21]);

    	const block = {
    		c: function create() {
    			create_component(itemgroup.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(itemgroup, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const itemgroup_changes = {};
    			if (dirty & /*klass*/ 2) itemgroup_changes.class = "s-slide-group " + /*klass*/ ctx[1];
    			if (dirty & /*activeClass*/ 8) itemgroup_changes.activeClass = /*activeClass*/ ctx[3];
    			if (dirty & /*multiple*/ 16) itemgroup_changes.multiple = /*multiple*/ ctx[4];
    			if (dirty & /*mandatory*/ 32) itemgroup_changes.mandatory = /*mandatory*/ ctx[5];
    			if (dirty & /*max*/ 64) itemgroup_changes.max = /*max*/ ctx[6];

    			if (dirty & /*$$scope, x, contentWidth, wrapperWidth, hideDisabledArrows, arrowsVisible*/ 4196228) {
    				itemgroup_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_value && dirty & /*value*/ 1) {
    				updating_value = true;
    				itemgroup_changes.value = /*value*/ ctx[0];
    				add_flush_callback(() => updating_value = false);
    			}

    			itemgroup.$set(itemgroup_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(itemgroup.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(itemgroup.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(itemgroup, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const SLIDE_GROUP = {};

    function instance$7($$self, $$props, $$invalidate) {
    	let arrowsVisible;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('SlideGroup', slots, ['previous','default','next']);
    	let contentWidth;
    	let wrapperWidth;
    	let { class: klass = '' } = $$props;
    	let { showArrows = true } = $$props;
    	let { hideDisabledArrows = false } = $$props;
    	let { centerActive = false } = $$props;
    	let { activeClass = '' } = $$props;
    	let { value = [] } = $$props;
    	let { multiple = false } = $$props;
    	let { mandatory = false } = $$props;
    	let { max = Infinity } = $$props;
    	let x = 0;

    	setContext(SLIDE_GROUP, item => {
    		const left = item.offsetLeft;
    		const width = item.offsetWidth;

    		if (centerActive) $$invalidate(9, x = left + (width - wrapperWidth) / 2); else if (left + 1.25 * width > wrapperWidth + x) {
    			$$invalidate(9, x = left + 1.25 * width - wrapperWidth);
    		} else if (left < x + width / 4) {
    			$$invalidate(9, x = left - width / 4);
    		}
    	});

    	afterUpdate(() => {
    		if (x + wrapperWidth > contentWidth) $$invalidate(9, x = contentWidth - wrapperWidth); else if (x < 0) $$invalidate(9, x = 0);
    	});

    	function next() {
    		$$invalidate(9, x += wrapperWidth);
    	}

    	function prev() {
    		$$invalidate(9, x -= wrapperWidth);
    	}

    	let touchStartX;

    	function touchstart({ touches }) {
    		touchStartX = x + touches[0].clientX;
    	}

    	function touchmove({ touches }) {
    		$$invalidate(9, x = touchStartX - touches[0].clientX);
    	}

    	const writable_props = [
    		'class',
    		'showArrows',
    		'hideDisabledArrows',
    		'centerActive',
    		'activeClass',
    		'value',
    		'multiple',
    		'mandatory',
    		'max'
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<SlideGroup> was created with unknown prop '${key}'`);
    	});

    	function div0_elementresize_handler() {
    		contentWidth = this.clientWidth;
    		$$invalidate(7, contentWidth);
    	}

    	function div1_elementresize_handler() {
    		wrapperWidth = this.clientWidth;
    		$$invalidate(8, wrapperWidth);
    	}

    	function itemgroup_value_binding(value$1) {
    		value = value$1;
    		$$invalidate(0, value);
    	}

    	function change_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ('class' in $$props) $$invalidate(1, klass = $$props.class);
    		if ('showArrows' in $$props) $$invalidate(15, showArrows = $$props.showArrows);
    		if ('hideDisabledArrows' in $$props) $$invalidate(2, hideDisabledArrows = $$props.hideDisabledArrows);
    		if ('centerActive' in $$props) $$invalidate(16, centerActive = $$props.centerActive);
    		if ('activeClass' in $$props) $$invalidate(3, activeClass = $$props.activeClass);
    		if ('value' in $$props) $$invalidate(0, value = $$props.value);
    		if ('multiple' in $$props) $$invalidate(4, multiple = $$props.multiple);
    		if ('mandatory' in $$props) $$invalidate(5, mandatory = $$props.mandatory);
    		if ('max' in $$props) $$invalidate(6, max = $$props.max);
    		if ('$$scope' in $$props) $$invalidate(22, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		SLIDE_GROUP,
    		setContext,
    		afterUpdate,
    		ItemGroup,
    		prevIcon,
    		nextIcon,
    		Icon,
    		contentWidth,
    		wrapperWidth,
    		klass,
    		showArrows,
    		hideDisabledArrows,
    		centerActive,
    		activeClass,
    		value,
    		multiple,
    		mandatory,
    		max,
    		x,
    		next,
    		prev,
    		touchStartX,
    		touchstart,
    		touchmove,
    		arrowsVisible
    	});

    	$$self.$inject_state = $$props => {
    		if ('contentWidth' in $$props) $$invalidate(7, contentWidth = $$props.contentWidth);
    		if ('wrapperWidth' in $$props) $$invalidate(8, wrapperWidth = $$props.wrapperWidth);
    		if ('klass' in $$props) $$invalidate(1, klass = $$props.klass);
    		if ('showArrows' in $$props) $$invalidate(15, showArrows = $$props.showArrows);
    		if ('hideDisabledArrows' in $$props) $$invalidate(2, hideDisabledArrows = $$props.hideDisabledArrows);
    		if ('centerActive' in $$props) $$invalidate(16, centerActive = $$props.centerActive);
    		if ('activeClass' in $$props) $$invalidate(3, activeClass = $$props.activeClass);
    		if ('value' in $$props) $$invalidate(0, value = $$props.value);
    		if ('multiple' in $$props) $$invalidate(4, multiple = $$props.multiple);
    		if ('mandatory' in $$props) $$invalidate(5, mandatory = $$props.mandatory);
    		if ('max' in $$props) $$invalidate(6, max = $$props.max);
    		if ('x' in $$props) $$invalidate(9, x = $$props.x);
    		if ('touchStartX' in $$props) touchStartX = $$props.touchStartX;
    		if ('arrowsVisible' in $$props) $$invalidate(10, arrowsVisible = $$props.arrowsVisible);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*wrapperWidth, contentWidth, showArrows*/ 33152) {
    			$$invalidate(10, arrowsVisible = wrapperWidth < contentWidth && showArrows);
    		}
    	};

    	return [
    		value,
    		klass,
    		hideDisabledArrows,
    		activeClass,
    		multiple,
    		mandatory,
    		max,
    		contentWidth,
    		wrapperWidth,
    		x,
    		arrowsVisible,
    		next,
    		prev,
    		touchstart,
    		touchmove,
    		showArrows,
    		centerActive,
    		slots,
    		div0_elementresize_handler,
    		div1_elementresize_handler,
    		itemgroup_value_binding,
    		change_handler,
    		$$scope
    	];
    }

    class SlideGroup extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {
    			class: 1,
    			showArrows: 15,
    			hideDisabledArrows: 2,
    			centerActive: 16,
    			activeClass: 3,
    			value: 0,
    			multiple: 4,
    			mandatory: 5,
    			max: 6
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SlideGroup",
    			options,
    			id: create_fragment$7.name
    		});
    	}

    	get class() {
    		throw new Error("<SlideGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<SlideGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get showArrows() {
    		throw new Error("<SlideGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set showArrows(value) {
    		throw new Error("<SlideGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hideDisabledArrows() {
    		throw new Error("<SlideGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hideDisabledArrows(value) {
    		throw new Error("<SlideGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get centerActive() {
    		throw new Error("<SlideGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set centerActive(value) {
    		throw new Error("<SlideGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get activeClass() {
    		throw new Error("<SlideGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set activeClass(value) {
    		throw new Error("<SlideGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<SlideGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<SlideGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get multiple() {
    		throw new Error("<SlideGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set multiple(value) {
    		throw new Error("<SlideGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get mandatory() {
    		throw new Error("<SlideGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set mandatory(value) {
    		throw new Error("<SlideGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get max() {
    		throw new Error("<SlideGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set max(value) {
    		throw new Error("<SlideGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svelte-materialify/dist/components/Window/Window.svelte generated by Svelte v3.46.3 */
    const file$6 = "node_modules/svelte-materialify/dist/components/Window/Window.svelte";

    function create_fragment$6(ctx) {
    	let div;
    	let div_class_value;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[11].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[10], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", div_class_value = "s-window " + /*klass*/ ctx[0]);
    			toggle_class(div, "horizontal", !/*vertical*/ ctx[1]);
    			toggle_class(div, "vertical", /*vertical*/ ctx[1]);
    			toggle_class(div, "reverse", /*reverse*/ ctx[2]);
    			add_location(div, file$6, 89, 0, 3456);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			/*div_binding*/ ctx[12](div);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 1024)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[10],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[10])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[10], dirty, null),
    						null
    					);
    				}
    			}

    			if (!current || dirty & /*klass*/ 1 && div_class_value !== (div_class_value = "s-window " + /*klass*/ ctx[0])) {
    				attr_dev(div, "class", div_class_value);
    			}

    			if (dirty & /*klass, vertical*/ 3) {
    				toggle_class(div, "horizontal", !/*vertical*/ ctx[1]);
    			}

    			if (dirty & /*klass, vertical*/ 3) {
    				toggle_class(div, "vertical", /*vertical*/ ctx[1]);
    			}

    			if (dirty & /*klass, reverse*/ 5) {
    				toggle_class(div, "reverse", /*reverse*/ ctx[2]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    			/*div_binding*/ ctx[12](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const WINDOW = {};

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Window', slots, ['default']);
    	let { class: klass = '' } = $$props;
    	let { activeClass = 'active' } = $$props;
    	let { value = 0 } = $$props;
    	let { vertical = false } = $$props;
    	let { reverse = false } = $$props;
    	let { continuous = true } = $$props;
    	let container;
    	const windowItems = [];
    	let moving = false;

    	setContext(WINDOW, window => {
    		windowItems.push(window);
    	});

    	function set(index) {
    		const prevIndex = windowItems.findIndex(i => i.classList.contains(activeClass));

    		if (!moving && windowItems[index] && index !== prevIndex) {
    			moving = true;
    			let direction;
    			let position;

    			if (index > prevIndex) {
    				direction = 'left';
    				position = 'next';
    			} else {
    				direction = 'right';
    				position = 'prev';
    			}

    			const prev = windowItems[prevIndex];
    			prev.classList.add(direction);
    			$$invalidate(3, container.style.height = `${prev.offsetHeight}px`, container);
    			const active = windowItems[index];
    			active.classList.add(position);
    			$$invalidate(3, container.style.height = `${active.offsetHeight}px`, container);
    			active.classList.add(direction);

    			setTimeout(
    				() => {
    					prev.classList.remove('active', direction);
    					active.classList.add('active');
    					active.classList.remove(position, direction);
    					$$invalidate(3, container.style.height = null, container);
    					moving = false;
    					$$invalidate(4, value = index);
    				},
    				300
    			);
    		}
    	}

    	function next() {
    		if (value === windowItems.length - 1) {
    			if (continuous) set(0);
    		} else {
    			set(value + 1);
    		}
    	}

    	function previous() {
    		if (value === 0) {
    			if (continuous) set(windowItems.length - 1);
    		} else {
    			set(value - 1);
    		}
    	}

    	onMount(() => {
    		const activeItem = windowItems[value];
    		if (activeItem) activeItem.classList.add(activeClass);
    	});

    	const writable_props = ['class', 'activeClass', 'value', 'vertical', 'reverse', 'continuous'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Window> was created with unknown prop '${key}'`);
    	});

    	function div_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			container = $$value;
    			$$invalidate(3, container);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ('class' in $$props) $$invalidate(0, klass = $$props.class);
    		if ('activeClass' in $$props) $$invalidate(5, activeClass = $$props.activeClass);
    		if ('value' in $$props) $$invalidate(4, value = $$props.value);
    		if ('vertical' in $$props) $$invalidate(1, vertical = $$props.vertical);
    		if ('reverse' in $$props) $$invalidate(2, reverse = $$props.reverse);
    		if ('continuous' in $$props) $$invalidate(6, continuous = $$props.continuous);
    		if ('$$scope' in $$props) $$invalidate(10, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		WINDOW,
    		onMount,
    		setContext,
    		klass,
    		activeClass,
    		value,
    		vertical,
    		reverse,
    		continuous,
    		container,
    		windowItems,
    		moving,
    		set,
    		next,
    		previous
    	});

    	$$self.$inject_state = $$props => {
    		if ('klass' in $$props) $$invalidate(0, klass = $$props.klass);
    		if ('activeClass' in $$props) $$invalidate(5, activeClass = $$props.activeClass);
    		if ('value' in $$props) $$invalidate(4, value = $$props.value);
    		if ('vertical' in $$props) $$invalidate(1, vertical = $$props.vertical);
    		if ('reverse' in $$props) $$invalidate(2, reverse = $$props.reverse);
    		if ('continuous' in $$props) $$invalidate(6, continuous = $$props.continuous);
    		if ('container' in $$props) $$invalidate(3, container = $$props.container);
    		if ('moving' in $$props) moving = $$props.moving;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*value*/ 16) {
    			set(value);
    		}
    	};

    	return [
    		klass,
    		vertical,
    		reverse,
    		container,
    		value,
    		activeClass,
    		continuous,
    		set,
    		next,
    		previous,
    		$$scope,
    		slots,
    		div_binding
    	];
    }

    class Window extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {
    			class: 0,
    			activeClass: 5,
    			value: 4,
    			vertical: 1,
    			reverse: 2,
    			continuous: 6,
    			set: 7,
    			next: 8,
    			previous: 9
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Window",
    			options,
    			id: create_fragment$6.name
    		});
    	}

    	get class() {
    		throw new Error("<Window>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Window>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get activeClass() {
    		throw new Error("<Window>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set activeClass(value) {
    		throw new Error("<Window>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<Window>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<Window>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get vertical() {
    		throw new Error("<Window>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set vertical(value) {
    		throw new Error("<Window>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get reverse() {
    		throw new Error("<Window>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set reverse(value) {
    		throw new Error("<Window>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get continuous() {
    		throw new Error("<Window>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set continuous(value) {
    		throw new Error("<Window>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get set() {
    		return this.$$.ctx[7];
    	}

    	set set(value) {
    		throw new Error("<Window>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get next() {
    		return this.$$.ctx[8];
    	}

    	set next(value) {
    		throw new Error("<Window>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get previous() {
    		return this.$$.ctx[9];
    	}

    	set previous(value) {
    		throw new Error("<Window>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svelte-materialify/dist/components/Window/WindowItem.svelte generated by Svelte v3.46.3 */
    const file$5 = "node_modules/svelte-materialify/dist/components/Window/WindowItem.svelte";

    function create_fragment$5(ctx) {
    	let div;
    	let div_class_value;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[4].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[3], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", div_class_value = "s-window-item " + /*klass*/ ctx[0]);
    			attr_dev(div, "style", /*style*/ ctx[1]);
    			add_location(div, file$5, 18, 0, 646);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			/*div_binding*/ ctx[5](div);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 8)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[3],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[3])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[3], dirty, null),
    						null
    					);
    				}
    			}

    			if (!current || dirty & /*klass*/ 1 && div_class_value !== (div_class_value = "s-window-item " + /*klass*/ ctx[0])) {
    				attr_dev(div, "class", div_class_value);
    			}

    			if (!current || dirty & /*style*/ 2) {
    				attr_dev(div, "style", /*style*/ ctx[1]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    			/*div_binding*/ ctx[5](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('WindowItem', slots, ['default']);
    	let window;
    	const registerWindow = getContext(WINDOW);
    	let { class: klass = '' } = $$props;
    	let { style = null } = $$props;

    	onMount(() => {
    		registerWindow(window);
    	});

    	const writable_props = ['class', 'style'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<WindowItem> was created with unknown prop '${key}'`);
    	});

    	function div_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			window = $$value;
    			$$invalidate(2, window);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ('class' in $$props) $$invalidate(0, klass = $$props.class);
    		if ('style' in $$props) $$invalidate(1, style = $$props.style);
    		if ('$$scope' in $$props) $$invalidate(3, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		onMount,
    		WINDOW,
    		window,
    		registerWindow,
    		klass,
    		style
    	});

    	$$self.$inject_state = $$props => {
    		if ('window' in $$props) $$invalidate(2, window = $$props.window);
    		if ('klass' in $$props) $$invalidate(0, klass = $$props.klass);
    		if ('style' in $$props) $$invalidate(1, style = $$props.style);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [klass, style, window, $$scope, slots, div_binding];
    }

    class WindowItem extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { class: 0, style: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "WindowItem",
    			options,
    			id: create_fragment$5.name
    		});
    	}

    	get class() {
    		throw new Error("<WindowItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<WindowItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<WindowItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<WindowItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svelte-materialify/dist/components/Tabs/Tabs.svelte generated by Svelte v3.46.3 */
    const file$4 = "node_modules/svelte-materialify/dist/components/Tabs/Tabs.svelte";
    const get_tabs_slot_changes = dirty => ({});
    const get_tabs_slot_context = ctx => ({});

    // (74:6) {#if slider}
    function create_if_block$2(ctx) {
    	let div;
    	let div_class_value;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", div_class_value = "s-tab-slider " + /*sliderClass*/ ctx[10]);
    			add_location(div, file$4, 74, 8, 3309);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			/*div_binding*/ ctx[17](div);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*sliderClass*/ 1024 && div_class_value !== (div_class_value = "s-tab-slider " + /*sliderClass*/ ctx[10])) {
    				attr_dev(div, "class", div_class_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			/*div_binding*/ ctx[17](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(74:6) {#if slider}",
    		ctx
    	});

    	return block;
    }

    // (66:4) <SlideGroup       bind:value       mandatory       {centerActive}       {showArrows}       on:change={moveSlider}       on:change>
    function create_default_slot_1$2(ctx) {
    	let t;
    	let if_block_anchor;
    	let current;
    	const tabs_slot_template = /*#slots*/ ctx[16].tabs;
    	const tabs_slot = create_slot(tabs_slot_template, ctx, /*$$scope*/ ctx[21], get_tabs_slot_context);
    	let if_block = /*slider*/ ctx[9] && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			if (tabs_slot) tabs_slot.c();
    			t = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (tabs_slot) {
    				tabs_slot.m(target, anchor);
    			}

    			insert_dev(target, t, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (tabs_slot) {
    				if (tabs_slot.p && (!current || dirty & /*$$scope*/ 2097152)) {
    					update_slot_base(
    						tabs_slot,
    						tabs_slot_template,
    						ctx,
    						/*$$scope*/ ctx[21],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[21])
    						: get_slot_changes(tabs_slot_template, /*$$scope*/ ctx[21], dirty, get_tabs_slot_changes),
    						get_tabs_slot_context
    					);
    				}
    			}

    			if (/*slider*/ ctx[9]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$2(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tabs_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tabs_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (tabs_slot) tabs_slot.d(detaching);
    			if (detaching) detach_dev(t);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$2.name,
    		type: "slot",
    		source: "(66:4) <SlideGroup       bind:value       mandatory       {centerActive}       {showArrows}       on:change={moveSlider}       on:change>",
    		ctx
    	});

    	return block;
    }

    // (79:2) <Window bind:this={windowComponent}>
    function create_default_slot$2(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[16].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[21], null);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 2097152)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[21],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[21])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[21], dirty, null),
    						null
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$2.name,
    		type: "slot",
    		source: "(79:2) <Window bind:this={windowComponent}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let div1;
    	let div0;
    	let slidegroup;
    	let updating_value;
    	let div0_class_value;
    	let t;
    	let window;
    	let current;

    	function slidegroup_value_binding(value) {
    		/*slidegroup_value_binding*/ ctx[18](value);
    	}

    	let slidegroup_props = {
    		mandatory: true,
    		centerActive: /*centerActive*/ ctx[2],
    		showArrows: /*showArrows*/ ctx[3],
    		$$slots: { default: [create_default_slot_1$2] },
    		$$scope: { ctx }
    	};

    	if (/*value*/ ctx[0] !== void 0) {
    		slidegroup_props.value = /*value*/ ctx[0];
    	}

    	slidegroup = new SlideGroup({ props: slidegroup_props, $$inline: true });
    	binding_callbacks.push(() => bind(slidegroup, 'value', slidegroup_value_binding));
    	slidegroup.$on("change", /*moveSlider*/ ctx[14]);
    	slidegroup.$on("change", /*change_handler*/ ctx[19]);

    	let window_props = {
    		$$slots: { default: [create_default_slot$2] },
    		$$scope: { ctx }
    	};

    	window = new Window({ props: window_props, $$inline: true });
    	/*window_binding*/ ctx[20](window);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			create_component(slidegroup.$$.fragment);
    			t = space();
    			create_component(window.$$.fragment);
    			attr_dev(div0, "class", div0_class_value = "s-tabs-bar " + /*klass*/ ctx[1]);
    			attr_dev(div0, "role", "tablist");
    			toggle_class(div0, "fixed-tabs", /*fixedTabs*/ ctx[4]);
    			toggle_class(div0, "grow", /*grow*/ ctx[5]);
    			toggle_class(div0, "centered", /*centered*/ ctx[6]);
    			toggle_class(div0, "right", /*right*/ ctx[7]);
    			toggle_class(div0, "icons", /*icons*/ ctx[8]);
    			add_location(div0, file$4, 57, 2, 2965);
    			attr_dev(div1, "class", "s-tabs");
    			attr_dev(div1, "role", "tablist");
    			toggle_class(div1, "vertical", /*vertical*/ ctx[11]);
    			add_location(div1, file$4, 56, 0, 2912);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			mount_component(slidegroup, div0, null);
    			append_dev(div1, t);
    			mount_component(window, div1, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const slidegroup_changes = {};
    			if (dirty & /*centerActive*/ 4) slidegroup_changes.centerActive = /*centerActive*/ ctx[2];
    			if (dirty & /*showArrows*/ 8) slidegroup_changes.showArrows = /*showArrows*/ ctx[3];

    			if (dirty & /*$$scope, sliderClass, sliderElement, slider*/ 2102784) {
    				slidegroup_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_value && dirty & /*value*/ 1) {
    				updating_value = true;
    				slidegroup_changes.value = /*value*/ ctx[0];
    				add_flush_callback(() => updating_value = false);
    			}

    			slidegroup.$set(slidegroup_changes);

    			if (!current || dirty & /*klass*/ 2 && div0_class_value !== (div0_class_value = "s-tabs-bar " + /*klass*/ ctx[1])) {
    				attr_dev(div0, "class", div0_class_value);
    			}

    			if (dirty & /*klass, fixedTabs*/ 18) {
    				toggle_class(div0, "fixed-tabs", /*fixedTabs*/ ctx[4]);
    			}

    			if (dirty & /*klass, grow*/ 34) {
    				toggle_class(div0, "grow", /*grow*/ ctx[5]);
    			}

    			if (dirty & /*klass, centered*/ 66) {
    				toggle_class(div0, "centered", /*centered*/ ctx[6]);
    			}

    			if (dirty & /*klass, right*/ 130) {
    				toggle_class(div0, "right", /*right*/ ctx[7]);
    			}

    			if (dirty & /*klass, icons*/ 258) {
    				toggle_class(div0, "icons", /*icons*/ ctx[8]);
    			}

    			const window_changes = {};

    			if (dirty & /*$$scope*/ 2097152) {
    				window_changes.$$scope = { dirty, ctx };
    			}

    			window.$set(window_changes);

    			if (dirty & /*vertical*/ 2048) {
    				toggle_class(div1, "vertical", /*vertical*/ ctx[11]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(slidegroup.$$.fragment, local);
    			transition_in(window.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(slidegroup.$$.fragment, local);
    			transition_out(window.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_component(slidegroup);
    			/*window_binding*/ ctx[20](null);
    			destroy_component(window);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const TABS = {};

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Tabs', slots, ['tabs','default']);
    	let sliderElement;
    	let windowComponent;
    	const tabs = [];
    	let { class: klass = '' } = $$props;
    	let { value = 0 } = $$props;
    	let { centerActive = false } = $$props;
    	let { showArrows = true } = $$props;
    	let { fixedTabs = false } = $$props;
    	let { grow = false } = $$props;
    	let { centered = false } = $$props;
    	let { right = false } = $$props;
    	let { icons = false } = $$props;
    	let { slider = true } = $$props;
    	let { sliderClass = '' } = $$props;
    	let { ripple = {} } = $$props;
    	let { vertical = false } = $$props;

    	setContext(TABS, {
    		ripple,
    		registerTab: tab => {
    			tabs.push(tab);
    		}
    	});

    	function moveSlider({ detail }) {
    		if (slider) {
    			const activeTab = tabs[detail];

    			if (vertical) {
    				$$invalidate(12, sliderElement.style.top = `${activeTab.offsetTop}px`, sliderElement);
    				$$invalidate(12, sliderElement.style.height = `${activeTab.offsetHeight}px`, sliderElement);
    			} else {
    				$$invalidate(12, sliderElement.style.left = `${activeTab.offsetLeft}px`, sliderElement);
    				$$invalidate(12, sliderElement.style.width = `${activeTab.offsetWidth}px`, sliderElement);
    			}
    		}

    		windowComponent.set(value);
    	}

    	onMount(() => {
    		moveSlider({ detail: value });
    	});

    	const writable_props = [
    		'class',
    		'value',
    		'centerActive',
    		'showArrows',
    		'fixedTabs',
    		'grow',
    		'centered',
    		'right',
    		'icons',
    		'slider',
    		'sliderClass',
    		'ripple',
    		'vertical'
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Tabs> was created with unknown prop '${key}'`);
    	});

    	function div_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			sliderElement = $$value;
    			$$invalidate(12, sliderElement);
    		});
    	}

    	function slidegroup_value_binding(value$1) {
    		value = value$1;
    		$$invalidate(0, value);
    	}

    	function change_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function window_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			windowComponent = $$value;
    			$$invalidate(13, windowComponent);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ('class' in $$props) $$invalidate(1, klass = $$props.class);
    		if ('value' in $$props) $$invalidate(0, value = $$props.value);
    		if ('centerActive' in $$props) $$invalidate(2, centerActive = $$props.centerActive);
    		if ('showArrows' in $$props) $$invalidate(3, showArrows = $$props.showArrows);
    		if ('fixedTabs' in $$props) $$invalidate(4, fixedTabs = $$props.fixedTabs);
    		if ('grow' in $$props) $$invalidate(5, grow = $$props.grow);
    		if ('centered' in $$props) $$invalidate(6, centered = $$props.centered);
    		if ('right' in $$props) $$invalidate(7, right = $$props.right);
    		if ('icons' in $$props) $$invalidate(8, icons = $$props.icons);
    		if ('slider' in $$props) $$invalidate(9, slider = $$props.slider);
    		if ('sliderClass' in $$props) $$invalidate(10, sliderClass = $$props.sliderClass);
    		if ('ripple' in $$props) $$invalidate(15, ripple = $$props.ripple);
    		if ('vertical' in $$props) $$invalidate(11, vertical = $$props.vertical);
    		if ('$$scope' in $$props) $$invalidate(21, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		TABS,
    		SlideGroup,
    		Window,
    		onMount,
    		setContext,
    		sliderElement,
    		windowComponent,
    		tabs,
    		klass,
    		value,
    		centerActive,
    		showArrows,
    		fixedTabs,
    		grow,
    		centered,
    		right,
    		icons,
    		slider,
    		sliderClass,
    		ripple,
    		vertical,
    		moveSlider
    	});

    	$$self.$inject_state = $$props => {
    		if ('sliderElement' in $$props) $$invalidate(12, sliderElement = $$props.sliderElement);
    		if ('windowComponent' in $$props) $$invalidate(13, windowComponent = $$props.windowComponent);
    		if ('klass' in $$props) $$invalidate(1, klass = $$props.klass);
    		if ('value' in $$props) $$invalidate(0, value = $$props.value);
    		if ('centerActive' in $$props) $$invalidate(2, centerActive = $$props.centerActive);
    		if ('showArrows' in $$props) $$invalidate(3, showArrows = $$props.showArrows);
    		if ('fixedTabs' in $$props) $$invalidate(4, fixedTabs = $$props.fixedTabs);
    		if ('grow' in $$props) $$invalidate(5, grow = $$props.grow);
    		if ('centered' in $$props) $$invalidate(6, centered = $$props.centered);
    		if ('right' in $$props) $$invalidate(7, right = $$props.right);
    		if ('icons' in $$props) $$invalidate(8, icons = $$props.icons);
    		if ('slider' in $$props) $$invalidate(9, slider = $$props.slider);
    		if ('sliderClass' in $$props) $$invalidate(10, sliderClass = $$props.sliderClass);
    		if ('ripple' in $$props) $$invalidate(15, ripple = $$props.ripple);
    		if ('vertical' in $$props) $$invalidate(11, vertical = $$props.vertical);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		value,
    		klass,
    		centerActive,
    		showArrows,
    		fixedTabs,
    		grow,
    		centered,
    		right,
    		icons,
    		slider,
    		sliderClass,
    		vertical,
    		sliderElement,
    		windowComponent,
    		moveSlider,
    		ripple,
    		slots,
    		div_binding,
    		slidegroup_value_binding,
    		change_handler,
    		window_binding,
    		$$scope
    	];
    }

    class Tabs extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {
    			class: 1,
    			value: 0,
    			centerActive: 2,
    			showArrows: 3,
    			fixedTabs: 4,
    			grow: 5,
    			centered: 6,
    			right: 7,
    			icons: 8,
    			slider: 9,
    			sliderClass: 10,
    			ripple: 15,
    			vertical: 11
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Tabs",
    			options,
    			id: create_fragment$4.name
    		});
    	}

    	get class() {
    		throw new Error("<Tabs>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Tabs>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<Tabs>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<Tabs>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get centerActive() {
    		throw new Error("<Tabs>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set centerActive(value) {
    		throw new Error("<Tabs>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get showArrows() {
    		throw new Error("<Tabs>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set showArrows(value) {
    		throw new Error("<Tabs>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get fixedTabs() {
    		throw new Error("<Tabs>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fixedTabs(value) {
    		throw new Error("<Tabs>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get grow() {
    		throw new Error("<Tabs>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set grow(value) {
    		throw new Error("<Tabs>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get centered() {
    		throw new Error("<Tabs>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set centered(value) {
    		throw new Error("<Tabs>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get right() {
    		throw new Error("<Tabs>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set right(value) {
    		throw new Error("<Tabs>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get icons() {
    		throw new Error("<Tabs>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set icons(value) {
    		throw new Error("<Tabs>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get slider() {
    		throw new Error("<Tabs>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set slider(value) {
    		throw new Error("<Tabs>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get sliderClass() {
    		throw new Error("<Tabs>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set sliderClass(value) {
    		throw new Error("<Tabs>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get ripple() {
    		throw new Error("<Tabs>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set ripple(value) {
    		throw new Error("<Tabs>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get vertical() {
    		throw new Error("<Tabs>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set vertical(value) {
    		throw new Error("<Tabs>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svelte-materialify/dist/components/Tabs/Tab.svelte generated by Svelte v3.46.3 */
    const file$3 = "node_modules/svelte-materialify/dist/components/Tabs/Tab.svelte";

    function create_fragment$3(ctx) {
    	let button;
    	let button_class_value;
    	let button_tabindex_value;
    	let Class_action;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[9].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[8], null);

    	const block = {
    		c: function create() {
    			button = element("button");
    			if (default_slot) default_slot.c();
    			attr_dev(button, "class", button_class_value = "s-tab s-slide-item " + /*klass*/ ctx[0]);
    			attr_dev(button, "role", "tab");
    			attr_dev(button, "aria-selected", /*active*/ ctx[4]);
    			attr_dev(button, "tabindex", button_tabindex_value = /*disabled*/ ctx[2] ? -1 : 0);
    			toggle_class(button, "disabled", /*disabled*/ ctx[2]);
    			toggle_class(button, "active", /*active*/ ctx[4]);
    			add_location(button, file$3, 38, 0, 1840);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (default_slot) {
    				default_slot.m(button, null);
    			}

    			/*button_binding*/ ctx[11](button);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(Class_action = Class.call(null, button, [/*active*/ ctx[4] && /*activeClass*/ ctx[1]])),
    					listen_dev(button, "click", /*selectTab*/ ctx[6], false, false, false),
    					listen_dev(button, "click", /*click_handler*/ ctx[10], false, false, false),
    					action_destroyer(Ripple.call(null, button, /*ripple*/ ctx[5]))
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 256)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[8],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[8])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[8], dirty, null),
    						null
    					);
    				}
    			}

    			if (!current || dirty & /*klass*/ 1 && button_class_value !== (button_class_value = "s-tab s-slide-item " + /*klass*/ ctx[0])) {
    				attr_dev(button, "class", button_class_value);
    			}

    			if (!current || dirty & /*active*/ 16) {
    				attr_dev(button, "aria-selected", /*active*/ ctx[4]);
    			}

    			if (!current || dirty & /*disabled*/ 4 && button_tabindex_value !== (button_tabindex_value = /*disabled*/ ctx[2] ? -1 : 0)) {
    				attr_dev(button, "tabindex", button_tabindex_value);
    			}

    			if (Class_action && is_function(Class_action.update) && dirty & /*active, activeClass*/ 18) Class_action.update.call(null, [/*active*/ ctx[4] && /*activeClass*/ ctx[1]]);

    			if (dirty & /*klass, disabled*/ 5) {
    				toggle_class(button, "disabled", /*disabled*/ ctx[2]);
    			}

    			if (dirty & /*klass, active*/ 17) {
    				toggle_class(button, "active", /*active*/ ctx[4]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			if (default_slot) default_slot.d(detaching);
    			/*button_binding*/ ctx[11](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Tab', slots, ['default']);
    	let tab;
    	const click = getContext(SLIDE_GROUP);
    	const ITEM = getContext(ITEM_GROUP);
    	const { ripple, registerTab } = getContext(TABS);
    	let { class: klass = '' } = $$props;
    	let { value = ITEM.index() } = $$props;
    	let { activeClass = ITEM.activeClass } = $$props;
    	let { disabled = false } = $$props;
    	let active;

    	ITEM.register(values => {
    		$$invalidate(4, active = values.includes(value));
    	});

    	function selectTab({ target }) {
    		if (!disabled) {
    			click(target);
    			ITEM.select(value);
    		}
    	}

    	onMount(() => {
    		registerTab(tab);
    	});

    	const writable_props = ['class', 'value', 'activeClass', 'disabled'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Tab> was created with unknown prop '${key}'`);
    	});

    	function click_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function button_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			tab = $$value;
    			$$invalidate(3, tab);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ('class' in $$props) $$invalidate(0, klass = $$props.class);
    		if ('value' in $$props) $$invalidate(7, value = $$props.value);
    		if ('activeClass' in $$props) $$invalidate(1, activeClass = $$props.activeClass);
    		if ('disabled' in $$props) $$invalidate(2, disabled = $$props.disabled);
    		if ('$$scope' in $$props) $$invalidate(8, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		onMount,
    		SLIDE_GROUP,
    		ITEM_GROUP,
    		TABS,
    		Class,
    		Ripple,
    		tab,
    		click,
    		ITEM,
    		ripple,
    		registerTab,
    		klass,
    		value,
    		activeClass,
    		disabled,
    		active,
    		selectTab
    	});

    	$$self.$inject_state = $$props => {
    		if ('tab' in $$props) $$invalidate(3, tab = $$props.tab);
    		if ('klass' in $$props) $$invalidate(0, klass = $$props.klass);
    		if ('value' in $$props) $$invalidate(7, value = $$props.value);
    		if ('activeClass' in $$props) $$invalidate(1, activeClass = $$props.activeClass);
    		if ('disabled' in $$props) $$invalidate(2, disabled = $$props.disabled);
    		if ('active' in $$props) $$invalidate(4, active = $$props.active);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		klass,
    		activeClass,
    		disabled,
    		tab,
    		active,
    		ripple,
    		selectTab,
    		value,
    		$$scope,
    		slots,
    		click_handler,
    		button_binding
    	];
    }

    class Tab extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {
    			class: 0,
    			value: 7,
    			activeClass: 1,
    			disabled: 2
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Tab",
    			options,
    			id: create_fragment$3.name
    		});
    	}

    	get class() {
    		throw new Error("<Tab>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Tab>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<Tab>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<Tab>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get activeClass() {
    		throw new Error("<Tab>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set activeClass(value) {
    		throw new Error("<Tab>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<Tab>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<Tab>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    // Unique ID creation requires a high quality random # generator. In the browser we therefore
    // require the crypto API and do not support built-in fallback to lower quality random number
    // generators (like Math.random()).
    var getRandomValues;
    var rnds8 = new Uint8Array(16);
    function rng() {
      // lazy load so that environments that need to polyfill have a chance to do so
      if (!getRandomValues) {
        // getRandomValues needs to be invoked in a context where "this" is a Crypto implementation. Also,
        // find the complete implementation of crypto (msCrypto) on IE11.
        getRandomValues = typeof crypto !== 'undefined' && crypto.getRandomValues && crypto.getRandomValues.bind(crypto) || typeof msCrypto !== 'undefined' && typeof msCrypto.getRandomValues === 'function' && msCrypto.getRandomValues.bind(msCrypto);

        if (!getRandomValues) {
          throw new Error('crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported');
        }
      }

      return getRandomValues(rnds8);
    }

    var REGEX = /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000)$/i;

    function validate(uuid) {
      return typeof uuid === 'string' && REGEX.test(uuid);
    }

    /**
     * Convert array of 16 byte values to UUID string format of the form:
     * XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
     */

    var byteToHex = [];

    for (var i = 0; i < 256; ++i) {
      byteToHex.push((i + 0x100).toString(16).substr(1));
    }

    function stringify(arr) {
      var offset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
      // Note: Be careful editing this code!  It's been tuned for performance
      // and works in ways you may not expect. See https://github.com/uuidjs/uuid/pull/434
      var uuid = (byteToHex[arr[offset + 0]] + byteToHex[arr[offset + 1]] + byteToHex[arr[offset + 2]] + byteToHex[arr[offset + 3]] + '-' + byteToHex[arr[offset + 4]] + byteToHex[arr[offset + 5]] + '-' + byteToHex[arr[offset + 6]] + byteToHex[arr[offset + 7]] + '-' + byteToHex[arr[offset + 8]] + byteToHex[arr[offset + 9]] + '-' + byteToHex[arr[offset + 10]] + byteToHex[arr[offset + 11]] + byteToHex[arr[offset + 12]] + byteToHex[arr[offset + 13]] + byteToHex[arr[offset + 14]] + byteToHex[arr[offset + 15]]).toLowerCase(); // Consistency check for valid UUID.  If this throws, it's likely due to one
      // of the following:
      // - One or more input array values don't map to a hex octet (leading to
      // "undefined" in the uuid)
      // - Invalid input values for the RFC `version` or `variant` fields

      if (!validate(uuid)) {
        throw TypeError('Stringified UUID is invalid');
      }

      return uuid;
    }

    function v4(options, buf, offset) {
      options = options || {};
      var rnds = options.random || (options.rng || rng)(); // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`

      rnds[6] = rnds[6] & 0x0f | 0x40;
      rnds[8] = rnds[8] & 0x3f | 0x80; // Copy bytes to buffer, if provided

      if (buf) {
        offset = offset || 0;

        for (var i = 0; i < 16; ++i) {
          buf[offset + i] = rnds[i];
        }

        return buf;
      }

      return stringify(rnds);
    }

    /* src/ScoreBoard.svelte generated by Svelte v3.46.3 */

    const file$2 = "src/ScoreBoard.svelte";

    // (24:0) {:else}
    function create_else_block$1(ctx) {
    	let div;
    	let h2;

    	const block = {
    		c: function create() {
    			div = element("div");
    			h2 = element("h2");
    			h2.textContent = "No score to display. Take a quiz to see score board.";
    			attr_dev(h2, "class", "svelte-15hgbag");
    			add_location(h2, file$2, 25, 0, 444);
    			attr_dev(div, "class", "primary-text");
    			add_location(div, file$2, 24, 0, 417);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h2);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(24:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (6:0) {#if user.score}
    function create_if_block$1(ctx) {
    	let div3;
    	let h20;
    	let t0;
    	let div0;
    	let t2;
    	let h21;
    	let t3;
    	let div1;
    	let t5;
    	let h22;
    	let t6;
    	let div2;

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			h20 = element("h2");
    			t0 = text("Score:\n        ");
    			div0 = element("div");
    			div0.textContent = "10/100";
    			t2 = space();
    			h21 = element("h2");
    			t3 = text("Level Played:\n        ");
    			div1 = element("div");
    			div1.textContent = "Hard";
    			t5 = space();
    			h22 = element("h2");
    			t6 = text("Time Taken Per Question:\n        ");
    			div2 = element("div");
    			div2.textContent = "3 sec";
    			attr_dev(div0, "class", "sbText svelte-15hgbag");
    			add_location(div0, file$2, 8, 8, 139);
    			attr_dev(h20, "class", "svelte-15hgbag");
    			add_location(h20, file$2, 7, 4, 120);
    			attr_dev(div1, "class", "sbText svelte-15hgbag");
    			add_location(div1, file$2, 13, 8, 234);
    			attr_dev(h21, "class", "svelte-15hgbag");
    			add_location(h21, file$2, 12, 4, 208);
    			attr_dev(div2, "class", "sbText svelte-15hgbag");
    			add_location(div2, file$2, 18, 8, 338);
    			attr_dev(h22, "class", "svelte-15hgbag");
    			add_location(h22, file$2, 17, 4, 301);
    			attr_dev(div3, "class", "primary-text");
    			add_location(div3, file$2, 6, 0, 89);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, h20);
    			append_dev(h20, t0);
    			append_dev(h20, div0);
    			append_dev(div3, t2);
    			append_dev(div3, h21);
    			append_dev(h21, t3);
    			append_dev(h21, div1);
    			append_dev(div3, t5);
    			append_dev(div3, h22);
    			append_dev(h22, t6);
    			append_dev(h22, div2);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(6:0) {#if user.score}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*user*/ ctx[0].score) return create_if_block$1;
    		return create_else_block$1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type !== (current_block_type = select_block_type(ctx))) {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('ScoreBoard', slots, []);
    	let { user = {} } = $$props;
    	let { gameDetails } = $$props;
    	const writable_props = ['user', 'gameDetails'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<ScoreBoard> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('user' in $$props) $$invalidate(0, user = $$props.user);
    		if ('gameDetails' in $$props) $$invalidate(1, gameDetails = $$props.gameDetails);
    	};

    	$$self.$capture_state = () => ({ user, gameDetails });

    	$$self.$inject_state = $$props => {
    		if ('user' in $$props) $$invalidate(0, user = $$props.user);
    		if ('gameDetails' in $$props) $$invalidate(1, gameDetails = $$props.gameDetails);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [user, gameDetails];
    }

    class ScoreBoard extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { user: 0, gameDetails: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ScoreBoard",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*gameDetails*/ ctx[1] === undefined && !('gameDetails' in props)) {
    			console.warn("<ScoreBoard> was created without expected prop 'gameDetails'");
    		}
    	}

    	get user() {
    		throw new Error("<ScoreBoard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set user(value) {
    		throw new Error("<ScoreBoard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get gameDetails() {
    		throw new Error("<ScoreBoard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set gameDetails(value) {
    		throw new Error("<ScoreBoard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/UserDetailForm.svelte generated by Svelte v3.46.3 */

    const { console: console_1$1 } = globals;
    const file$1 = "src/UserDetailForm.svelte";

    // (39:4) {#if alert}
    function create_if_block_1(ctx) {
    	let div;
    	let alert_1;
    	let updating_visible;
    	let current;

    	function alert_1_visible_binding(value) {
    		/*alert_1_visible_binding*/ ctx[9](value);
    	}

    	let alert_1_props = {
    		class: "primary-color",
    		dismissible: true,
    		$$slots: { default: [create_default_slot_7$1] },
    		$$scope: { ctx }
    	};

    	if (/*alert*/ ctx[3] !== void 0) {
    		alert_1_props.visible = /*alert*/ ctx[3];
    	}

    	alert_1 = new Alert({ props: alert_1_props, $$inline: true });
    	binding_callbacks.push(() => bind(alert_1, 'visible', alert_1_visible_binding));
    	alert_1.$on("dismiss", /*onDismiss*/ ctx[5]);

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(alert_1.$$.fragment);
    			attr_dev(div, "class", "alert svelte-1ge7ue9");
    			add_location(div, file$1, 39, 4, 1070);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(alert_1, div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const alert_1_changes = {};

    			if (dirty & /*$$scope*/ 262144) {
    				alert_1_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_visible && dirty & /*alert*/ 8) {
    				updating_visible = true;
    				alert_1_changes.visible = /*alert*/ ctx[3];
    				add_flush_callback(() => updating_visible = false);
    			}

    			alert_1.$set(alert_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(alert_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(alert_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(alert_1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(39:4) {#if alert}",
    		ctx
    	});

    	return block;
    }

    // (41:8) <Alert class="primary-color" dismissible bind:visible={alert} on:dismiss={onDismiss}>
    function create_default_slot_7$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Please fill out the form before starting the quiz.");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_7$1.name,
    		type: "slot",
    		source: "(41:8) <Alert class=\\\"primary-color\\\" dismissible bind:visible={alert} on:dismiss={onDismiss}>",
    		ctx
    	});

    	return block;
    }

    // (47:4) <Row>
    function create_default_slot_6$1(ctx) {
    	let h2;
    	let div0;
    	let t1;
    	let div1;
    	let textfield;
    	let updating_value;
    	let t2;
    	let br;
    	let current;

    	function textfield_value_binding(value) {
    		/*textfield_value_binding*/ ctx[10](value);
    	}

    	let textfield_props = { dense: true };

    	if (/*name*/ ctx[0] !== void 0) {
    		textfield_props.value = /*name*/ ctx[0];
    	}

    	textfield = new TextField({ props: textfield_props, $$inline: true });
    	binding_callbacks.push(() => bind(textfield, 'value', textfield_value_binding));

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			div0 = element("div");
    			div0.textContent = "Player Name:";
    			t1 = space();
    			div1 = element("div");
    			create_component(textfield.$$.fragment);
    			t2 = space();
    			br = element("br");
    			attr_dev(div0, "class", "FormHeadings svelte-1ge7ue9");
    			add_location(div0, file$1, 48, 12, 1438);
    			attr_dev(h2, "class", "svelte-1ge7ue9");
    			add_location(h2, file$1, 47, 8, 1421);
    			attr_dev(div1, "class", "FormValues svelte-1ge7ue9");
    			add_location(div1, file$1, 52, 8, 1531);
    			add_location(br, file$1, 56, 8, 1652);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h2, anchor);
    			append_dev(h2, div0);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div1, anchor);
    			mount_component(textfield, div1, null);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, br, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const textfield_changes = {};

    			if (!updating_value && dirty & /*name*/ 1) {
    				updating_value = true;
    				textfield_changes.value = /*name*/ ctx[0];
    				add_flush_callback(() => updating_value = false);
    			}

    			textfield.$set(textfield_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(textfield.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(textfield.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h2);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div1);
    			destroy_component(textfield);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(br);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_6$1.name,
    		type: "slot",
    		source: "(47:4) <Row>",
    		ctx
    	});

    	return block;
    }

    // (59:4) <Row>
    function create_default_slot_5$1(ctx) {
    	let div0;
    	let h2;
    	let t1;
    	let div2;
    	let div1;
    	let label0;
    	let input0;
    	let t2;
    	let t3;
    	let label1;
    	let input1;
    	let t4;
    	let t5;
    	let label2;
    	let input2;
    	let t6;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			h2 = element("h2");
    			h2.textContent = "Difficulty Level:";
    			t1 = space();
    			div2 = element("div");
    			div1 = element("div");
    			label0 = element("label");
    			input0 = element("input");
    			t2 = text("\n                        Stranger");
    			t3 = space();
    			label1 = element("label");
    			input1 = element("input");
    			t4 = text("\n                        Friend");
    			t5 = space();
    			label2 = element("label");
    			input2 = element("input");
    			t6 = text("\n                        Homie");
    			attr_dev(h2, "class", "svelte-1ge7ue9");
    			add_location(h2, file$1, 60, 12, 1731);
    			attr_dev(div0, "class", "FormHeadings svelte-1ge7ue9");
    			add_location(div0, file$1, 59, 12, 1692);
    			attr_dev(input0, "type", "radio");
    			input0.__value = 1;
    			input0.value = input0.__value;
    			attr_dev(input0, "class", "svelte-1ge7ue9");
    			/*$$binding_groups*/ ctx[12][0].push(input0);
    			add_location(input0, file$1, 67, 24, 1959);
    			add_location(label0, file$1, 66, 20, 1927);
    			attr_dev(input1, "type", "radio");
    			input1.__value = 2;
    			input1.value = input1.__value;
    			attr_dev(input1, "class", "svelte-1ge7ue9");
    			/*$$binding_groups*/ ctx[12][0].push(input1);
    			add_location(input1, file$1, 72, 24, 2142);
    			add_location(label1, file$1, 71, 20, 2110);
    			attr_dev(input2, "type", "radio");
    			input2.__value = 3;
    			input2.value = input2.__value;
    			attr_dev(input2, "class", "svelte-1ge7ue9");
    			/*$$binding_groups*/ ctx[12][0].push(input2);
    			add_location(input2, file$1, 77, 24, 2323);
    			add_location(label2, file$1, 76, 20, 2291);
    			attr_dev(div1, "class", "d-flex justify-space-around");
    			add_location(div1, file$1, 65, 16, 1865);
    			attr_dev(div2, "class", "FormValues2 svelte-1ge7ue9");
    			add_location(div2, file$1, 64, 12, 1823);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, h2);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);
    			append_dev(div1, label0);
    			append_dev(label0, input0);
    			input0.checked = input0.__value === /*level*/ ctx[1];
    			append_dev(label0, t2);
    			append_dev(div1, t3);
    			append_dev(div1, label1);
    			append_dev(label1, input1);
    			input1.checked = input1.__value === /*level*/ ctx[1];
    			append_dev(label1, t4);
    			append_dev(div1, t5);
    			append_dev(div1, label2);
    			append_dev(label2, input2);
    			input2.checked = input2.__value === /*level*/ ctx[1];
    			append_dev(label2, t6);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "change", /*input0_change_handler*/ ctx[11]),
    					listen_dev(input1, "change", /*input1_change_handler*/ ctx[13]),
    					listen_dev(input2, "change", /*input2_change_handler*/ ctx[14])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*level*/ 2) {
    				input0.checked = input0.__value === /*level*/ ctx[1];
    			}

    			if (dirty & /*level*/ 2) {
    				input1.checked = input1.__value === /*level*/ ctx[1];
    			}

    			if (dirty & /*level*/ 2) {
    				input2.checked = input2.__value === /*level*/ ctx[1];
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div2);
    			/*$$binding_groups*/ ctx[12][0].splice(/*$$binding_groups*/ ctx[12][0].indexOf(input0), 1);
    			/*$$binding_groups*/ ctx[12][0].splice(/*$$binding_groups*/ ctx[12][0].indexOf(input1), 1);
    			/*$$binding_groups*/ ctx[12][0].splice(/*$$binding_groups*/ ctx[12][0].indexOf(input2), 1);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_5$1.name,
    		type: "slot",
    		source: "(59:4) <Row>",
    		ctx
    	});

    	return block;
    }

    // (84:4) <Row>
    function create_default_slot_4$1(ctx) {
    	let div0;
    	let h20;
    	let t1;
    	let div1;
    	let input;
    	let t2;
    	let div2;
    	let h21;
    	let t3;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			h20 = element("h2");
    			h20.textContent = "Number Of Questions:";
    			t1 = space();
    			div1 = element("div");
    			input = element("input");
    			t2 = space();
    			div2 = element("div");
    			h21 = element("h2");
    			t3 = text(/*numberQ*/ ctx[2]);
    			attr_dev(h20, "class", "svelte-1ge7ue9");
    			add_location(h20, file$1, 85, 12, 2540);
    			attr_dev(div0, "class", "FormHeadings svelte-1ge7ue9");
    			add_location(div0, file$1, 84, 8, 2501);
    			attr_dev(input, "type", "range");
    			attr_dev(input, "min", "1");
    			attr_dev(input, "max", "5");
    			attr_dev(input, "class", "svelte-1ge7ue9");
    			add_location(input, file$1, 90, 16, 2679);
    			attr_dev(div1, "class", "FormValues3 svelte-1ge7ue9");
    			add_location(div1, file$1, 89, 12, 2637);
    			attr_dev(h21, "class", "svelte-1ge7ue9");
    			add_location(h21, file$1, 94, 16, 2806);
    			attr_dev(div2, "class", "NumberQ svelte-1ge7ue9");
    			add_location(div2, file$1, 93, 12, 2768);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, h20);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, input);
    			set_input_value(input, /*numberQ*/ ctx[2]);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, div2, anchor);
    			append_dev(div2, h21);
    			append_dev(h21, t3);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "change", /*input_change_input_handler*/ ctx[15]),
    					listen_dev(input, "input", /*input_change_input_handler*/ ctx[15])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*numberQ*/ 4) {
    				set_input_value(input, /*numberQ*/ ctx[2]);
    			}

    			if (dirty & /*numberQ*/ 4) set_data_dev(t3, /*numberQ*/ ctx[2]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div1);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(div2);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_4$1.name,
    		type: "slot",
    		source: "(84:4) <Row>",
    		ctx
    	});

    	return block;
    }

    // (108:4) {:else}
    function create_else_block(ctx) {
    	let div;
    	let button;
    	let current;

    	button = new Button({
    			props: {
    				class: "primary-color",
    				size: "x-large",
    				$$slots: { default: [create_default_slot_3$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button.$on("click", /*handleSubmiUser*/ ctx[6]);

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(button.$$.fragment);
    			attr_dev(div, "class", "SubmitButton svelte-1ge7ue9");
    			add_location(div, file$1, 108, 4, 3269);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(button, div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const button_changes = {};

    			if (dirty & /*$$scope*/ 262144) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(button);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(108:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (101:8) {#if isUserSet}
    function create_if_block(ctx) {
    	let div0;
    	let button0;
    	let t;
    	let div1;
    	let button1;
    	let current;

    	button0 = new Button({
    			props: {
    				class: "primary-color",
    				size: "x-large",
    				$$slots: { default: [create_default_slot_2$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button0.$on("click", /*click_handler*/ ctx[16]);

    	button1 = new Button({
    			props: {
    				class: "primary-color",
    				size: "x-large",
    				$$slots: { default: [create_default_slot_1$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button1.$on("click", /*click_handler_1*/ ctx[17]);

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			create_component(button0.$$.fragment);
    			t = space();
    			div1 = element("div");
    			create_component(button1.$$.fragment);
    			attr_dev(div0, "class", "SubmitButton2 svelte-1ge7ue9");
    			add_location(div0, file$1, 101, 8, 2915);
    			attr_dev(div1, "class", "SubmitButton3 svelte-1ge7ue9");
    			add_location(div1, file$1, 104, 8, 3086);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			mount_component(button0, div0, null);
    			insert_dev(target, t, anchor);
    			insert_dev(target, div1, anchor);
    			mount_component(button1, div1, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const button0_changes = {};

    			if (dirty & /*$$scope*/ 262144) {
    				button0_changes.$$scope = { dirty, ctx };
    			}

    			button0.$set(button0_changes);
    			const button1_changes = {};

    			if (dirty & /*$$scope*/ 262144) {
    				button1_changes.$$scope = { dirty, ctx };
    			}

    			button1.$set(button1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button0.$$.fragment, local);
    			transition_in(button1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button0.$$.fragment, local);
    			transition_out(button1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			destroy_component(button0);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(div1);
    			destroy_component(button1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(101:8) {#if isUserSet}",
    		ctx
    	});

    	return block;
    }

    // (110:8) <Button class="primary-color" size="x-large" on:click={handleSubmiUser} >
    function create_default_slot_3$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Start Quiz");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3$1.name,
    		type: "slot",
    		source: "(110:8) <Button class=\\\"primary-color\\\" size=\\\"x-large\\\" on:click={handleSubmiUser} >",
    		ctx
    	});

    	return block;
    }

    // (103:12) <Button class="primary-color" size="x-large" on:click={()=>{handleSubmiUser}} >
    function create_default_slot_2$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Play as same player");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2$1.name,
    		type: "slot",
    		source: "(103:12) <Button class=\\\"primary-color\\\" size=\\\"x-large\\\" on:click={()=>{handleSubmiUser}} >",
    		ctx
    	});

    	return block;
    }

    // (106:12) <Button class="primary-color" size="x-large" on:click={()=>{handleSubmiUser(true)}} >
    function create_default_slot_1$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Submit New Player");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$1.name,
    		type: "slot",
    		source: "(106:12) <Button class=\\\"primary-color\\\" size=\\\"x-large\\\" on:click={()=>{handleSubmiUser(true)}} >",
    		ctx
    	});

    	return block;
    }

    // (100:4) <Row>
    function create_default_slot$1(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*isUserSet*/ ctx[4]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$1.name,
    		type: "slot",
    		source: "(100:4) <Row>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let div;
    	let t0;
    	let row0;
    	let t1;
    	let row1;
    	let t2;
    	let row2;
    	let t3;
    	let row3;
    	let current;
    	let if_block = /*alert*/ ctx[3] && create_if_block_1(ctx);

    	row0 = new Row({
    			props: {
    				$$slots: { default: [create_default_slot_6$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	row1 = new Row({
    			props: {
    				$$slots: { default: [create_default_slot_5$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	row2 = new Row({
    			props: {
    				$$slots: { default: [create_default_slot_4$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	row3 = new Row({
    			props: {
    				$$slots: { default: [create_default_slot$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (if_block) if_block.c();
    			t0 = space();
    			create_component(row0.$$.fragment);
    			t1 = space();
    			create_component(row1.$$.fragment);
    			t2 = space();
    			create_component(row2.$$.fragment);
    			t3 = space();
    			create_component(row3.$$.fragment);
    			attr_dev(div, "class", "grad svelte-1ge7ue9");
    			add_location(div, file$1, 36, 0, 1030);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if (if_block) if_block.m(div, null);
    			append_dev(div, t0);
    			mount_component(row0, div, null);
    			append_dev(div, t1);
    			mount_component(row1, div, null);
    			append_dev(div, t2);
    			mount_component(row2, div, null);
    			append_dev(div, t3);
    			mount_component(row3, div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*alert*/ ctx[3]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*alert*/ 8) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div, t0);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			const row0_changes = {};

    			if (dirty & /*$$scope, name*/ 262145) {
    				row0_changes.$$scope = { dirty, ctx };
    			}

    			row0.$set(row0_changes);
    			const row1_changes = {};

    			if (dirty & /*$$scope, level*/ 262146) {
    				row1_changes.$$scope = { dirty, ctx };
    			}

    			row1.$set(row1_changes);
    			const row2_changes = {};

    			if (dirty & /*$$scope, numberQ*/ 262148) {
    				row2_changes.$$scope = { dirty, ctx };
    			}

    			row2.$set(row2_changes);
    			const row3_changes = {};

    			if (dirty & /*$$scope, isUserSet*/ 262160) {
    				row3_changes.$$scope = { dirty, ctx };
    			}

    			row3.$set(row3_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			transition_in(row0.$$.fragment, local);
    			transition_in(row1.$$.fragment, local);
    			transition_in(row2.$$.fragment, local);
    			transition_in(row3.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			transition_out(row0.$$.fragment, local);
    			transition_out(row1.$$.fragment, local);
    			transition_out(row2.$$.fragment, local);
    			transition_out(row3.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block) if_block.d();
    			destroy_component(row0);
    			destroy_component(row1);
    			destroy_component(row2);
    			destroy_component(row3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('UserDetailForm', slots, []);
    	let { user = {} } = $$props;
    	let { setUser } = $$props;
    	let name;
    	let level; //variable to store difficulty
    	let numberQ = 1;
    	let alert = false;
    	let isUserSet = false;

    	function onDismiss() {
    		//function to dimiss alert
    		$$invalidate(3, alert = false);
    	}

    	const handleSubmiUser = (isNew = false) => {
    		console.log(level, name);

    		if (name && name.length > 0 && level > 0) {
    			//uuid to replace session. insecure, a scalable solution will require reddis-server.
    			if (isNew) {
    				$$invalidate(7, user['uuid'] = v4(), user);
    			}

    			$$invalidate(7, user['name'] = name, user);
    			$$invalidate(7, user['level'] = level, user);
    			$$invalidate(7, user['numberQ'] = numberQ, user);
    			$$invalidate(7, user['score'] = 69, user);

    			// console.log(user)
    			$$invalidate(3, alert = false);

    			$$invalidate(4, isUserSet = true);
    			setUser(user);
    		} else {
    			$$invalidate(3, alert = true);
    		}
    	};

    	const writable_props = ['user', 'setUser'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$1.warn(`<UserDetailForm> was created with unknown prop '${key}'`);
    	});

    	const $$binding_groups = [[]];

    	function alert_1_visible_binding(value) {
    		alert = value;
    		$$invalidate(3, alert);
    	}

    	function textfield_value_binding(value) {
    		name = value;
    		$$invalidate(0, name);
    	}

    	function input0_change_handler() {
    		level = this.__value;
    		$$invalidate(1, level);
    	}

    	function input1_change_handler() {
    		level = this.__value;
    		$$invalidate(1, level);
    	}

    	function input2_change_handler() {
    		level = this.__value;
    		$$invalidate(1, level);
    	}

    	function input_change_input_handler() {
    		numberQ = to_number(this.value);
    		$$invalidate(2, numberQ);
    	}

    	const click_handler = () => {
    	};

    	const click_handler_1 = () => {
    		handleSubmiUser(true);
    	};

    	$$self.$$set = $$props => {
    		if ('user' in $$props) $$invalidate(7, user = $$props.user);
    		if ('setUser' in $$props) $$invalidate(8, setUser = $$props.setUser);
    	};

    	$$self.$capture_state = () => ({
    		Radio,
    		Alert,
    		Icon,
    		Button,
    		TextField,
    		Row,
    		Col,
    		MaterialApp,
    		uuidv4: v4,
    		user,
    		setUser,
    		name,
    		level,
    		numberQ,
    		alert,
    		isUserSet,
    		onDismiss,
    		handleSubmiUser
    	});

    	$$self.$inject_state = $$props => {
    		if ('user' in $$props) $$invalidate(7, user = $$props.user);
    		if ('setUser' in $$props) $$invalidate(8, setUser = $$props.setUser);
    		if ('name' in $$props) $$invalidate(0, name = $$props.name);
    		if ('level' in $$props) $$invalidate(1, level = $$props.level);
    		if ('numberQ' in $$props) $$invalidate(2, numberQ = $$props.numberQ);
    		if ('alert' in $$props) $$invalidate(3, alert = $$props.alert);
    		if ('isUserSet' in $$props) $$invalidate(4, isUserSet = $$props.isUserSet);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		name,
    		level,
    		numberQ,
    		alert,
    		isUserSet,
    		onDismiss,
    		handleSubmiUser,
    		user,
    		setUser,
    		alert_1_visible_binding,
    		textfield_value_binding,
    		input0_change_handler,
    		$$binding_groups,
    		input1_change_handler,
    		input2_change_handler,
    		input_change_input_handler,
    		click_handler,
    		click_handler_1
    	];
    }

    class UserDetailForm extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { user: 7, setUser: 8 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "UserDetailForm",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*setUser*/ ctx[8] === undefined && !('setUser' in props)) {
    			console_1$1.warn("<UserDetailForm> was created without expected prop 'setUser'");
    		}
    	}

    	get user() {
    		throw new Error("<UserDetailForm>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set user(value) {
    		throw new Error("<UserDetailForm>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get setUser() {
    		throw new Error("<UserDetailForm>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set setUser(value) {
    		throw new Error("<UserDetailForm>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/App.svelte generated by Svelte v3.46.3 */

    const { console: console_1 } = globals;
    const file = "src/App.svelte";

    // (18:4) 
    function create_title_slot(ctx) {
    	let span;
    	let h2;

    	const block = {
    		c: function create() {
    			span = element("span");
    			h2 = element("h2");
    			h2.textContent = "J-Quiz";
    			attr_dev(h2, "class", "svelte-1idm5cb");
    			add_location(h2, file, 18, 6, 544);
    			attr_dev(span, "slot", "title");
    			attr_dev(span, "class", "title svelte-1idm5cb");
    			add_location(span, file, 17, 4, 503);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, h2);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_title_slot.name,
    		type: "slot",
    		source: "(18:4) ",
    		ctx
    	});

    	return block;
    }

    // (24:6) <Tab>
    function create_default_slot_9(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Player Details");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_9.name,
    		type: "slot",
    		source: "(24:6) <Tab>",
    		ctx
    	});

    	return block;
    }

    // (25:6) <Tab>
    function create_default_slot_8(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Score Board");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_8.name,
    		type: "slot",
    		source: "(25:6) <Tab>",
    		ctx
    	});

    	return block;
    }

    // (26:6) <Tab>
    function create_default_slot_7(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Leader Board");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_7.name,
    		type: "slot",
    		source: "(26:6) <Tab>",
    		ctx
    	});

    	return block;
    }

    // (27:6) <Tab>
    function create_default_slot_6(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("About The Quiz");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_6.name,
    		type: "slot",
    		source: "(27:6) <Tab>",
    		ctx
    	});

    	return block;
    }

    // (23:6) 
    function create_tabs_slot(ctx) {
    	let div;
    	let tab0;
    	let t0;
    	let tab1;
    	let t1;
    	let tab2;
    	let t2;
    	let tab3;
    	let current;

    	tab0 = new Tab({
    			props: {
    				$$slots: { default: [create_default_slot_9] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	tab1 = new Tab({
    			props: {
    				$$slots: { default: [create_default_slot_8] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	tab2 = new Tab({
    			props: {
    				$$slots: { default: [create_default_slot_7] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	tab3 = new Tab({
    			props: {
    				$$slots: { default: [create_default_slot_6] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(tab0.$$.fragment);
    			t0 = space();
    			create_component(tab1.$$.fragment);
    			t1 = space();
    			create_component(tab2.$$.fragment);
    			t2 = space();
    			create_component(tab3.$$.fragment);
    			attr_dev(div, "class", "primary-text text-accent-1");
    			attr_dev(div, "slot", "tabs");
    			add_location(div, file, 22, 6, 637);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(tab0, div, null);
    			append_dev(div, t0);
    			mount_component(tab1, div, null);
    			append_dev(div, t1);
    			mount_component(tab2, div, null);
    			append_dev(div, t2);
    			mount_component(tab3, div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const tab0_changes = {};

    			if (dirty & /*$$scope*/ 16) {
    				tab0_changes.$$scope = { dirty, ctx };
    			}

    			tab0.$set(tab0_changes);
    			const tab1_changes = {};

    			if (dirty & /*$$scope*/ 16) {
    				tab1_changes.$$scope = { dirty, ctx };
    			}

    			tab1.$set(tab1_changes);
    			const tab2_changes = {};

    			if (dirty & /*$$scope*/ 16) {
    				tab2_changes.$$scope = { dirty, ctx };
    			}

    			tab2.$set(tab2_changes);
    			const tab3_changes = {};

    			if (dirty & /*$$scope*/ 16) {
    				tab3_changes.$$scope = { dirty, ctx };
    			}

    			tab3.$set(tab3_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tab0.$$.fragment, local);
    			transition_in(tab1.$$.fragment, local);
    			transition_in(tab2.$$.fragment, local);
    			transition_in(tab3.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tab0.$$.fragment, local);
    			transition_out(tab1.$$.fragment, local);
    			transition_out(tab2.$$.fragment, local);
    			transition_out(tab3.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(tab0);
    			destroy_component(tab1);
    			destroy_component(tab2);
    			destroy_component(tab3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_tabs_slot.name,
    		type: "slot",
    		source: "(23:6) ",
    		ctx
    	});

    	return block;
    }

    // (21:4) 
    function create_extension_slot(ctx) {
    	let div;
    	let tabs;
    	let updating_value;
    	let current;

    	function tabs_value_binding(value) {
    		/*tabs_value_binding*/ ctx[3](value);
    	}

    	let tabs_props = {
    		fixedTabs: true,
    		$$slots: { tabs: [create_tabs_slot] },
    		$$scope: { ctx }
    	};

    	if (/*value*/ ctx[1] !== void 0) {
    		tabs_props.value = /*value*/ ctx[1];
    	}

    	tabs = new Tabs({ props: tabs_props, $$inline: true });
    	binding_callbacks.push(() => bind(tabs, 'value', tabs_value_binding));

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(tabs.$$.fragment);
    			attr_dev(div, "slot", "extension");
    			add_location(div, file, 20, 4, 576);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(tabs, div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const tabs_changes = {};

    			if (dirty & /*$$scope*/ 16) {
    				tabs_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_value && dirty & /*value*/ 2) {
    				updating_value = true;
    				tabs_changes.value = /*value*/ ctx[1];
    				add_flush_callback(() => updating_value = false);
    			}

    			tabs.$set(tabs_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tabs.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tabs.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(tabs);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_extension_slot.name,
    		type: "slot",
    		source: "(21:4) ",
    		ctx
    	});

    	return block;
    }

    // (34:5) <WindowItem>
    function create_default_slot_5(ctx) {
    	let userform;
    	let current;

    	userform = new UserDetailForm({
    			props: {
    				setUser: /*setUser*/ ctx[2],
    				user: /*user*/ ctx[0]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(userform.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(userform, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const userform_changes = {};
    			if (dirty & /*user*/ 1) userform_changes.user = /*user*/ ctx[0];
    			userform.$set(userform_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(userform.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(userform.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(userform, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_5.name,
    		type: "slot",
    		source: "(34:5) <WindowItem>",
    		ctx
    	});

    	return block;
    }

    // (40:5) <WindowItem>
    function create_default_slot_4(ctx) {
    	let div;
    	let scoreboard;
    	let current;

    	scoreboard = new ScoreBoard({
    			props: { user: /*user*/ ctx[0] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(scoreboard.$$.fragment);
    			attr_dev(div, "class", "darkbg");
    			add_location(div, file, 40, 4, 1050);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(scoreboard, div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const scoreboard_changes = {};
    			if (dirty & /*user*/ 1) scoreboard_changes.user = /*user*/ ctx[0];
    			scoreboard.$set(scoreboard_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(scoreboard.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(scoreboard.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(scoreboard);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_4.name,
    		type: "slot",
    		source: "(40:5) <WindowItem>",
    		ctx
    	});

    	return block;
    }

    // (45:5) <WindowItem>
    function create_default_slot_3(ctx) {
    	let h4;
    	let t1;
    	let p;

    	const block = {
    		c: function create() {
    			h4 = element("h4");
    			h4.textContent = "Leader Board";
    			t1 = space();
    			p = element("p");
    			add_location(h4, file, 45, 4, 1149);
    			add_location(p, file, 46, 4, 1175);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h4, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, p, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h4);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3.name,
    		type: "slot",
    		source: "(45:5) <WindowItem>",
    		ctx
    	});

    	return block;
    }

    // (52:5) <WindowItem>
    function create_default_slot_2(ctx) {
    	let h4;
    	let t1;
    	let p;

    	const block = {
    		c: function create() {
    			h4 = element("h4");
    			h4.textContent = "What is this is Quiz About?";
    			t1 = space();
    			p = element("p");
    			p.textContent = "This is a silly quiz app that asks questions about Jay Devkar and then gives out a score out of 100.";
    			add_location(h4, file, 52, 4, 1243);
    			add_location(p, file, 53, 4, 1284);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h4, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, p, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h4);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2.name,
    		type: "slot",
    		source: "(52:5) <WindowItem>",
    		ctx
    	});

    	return block;
    }

    // (33:3) <Window {value} class="ma-4">
    function create_default_slot_1(ctx) {
    	let windowitem0;
    	let t0;
    	let windowitem1;
    	let t1;
    	let windowitem2;
    	let t2;
    	let windowitem3;
    	let current;

    	windowitem0 = new WindowItem({
    			props: {
    				$$slots: { default: [create_default_slot_5] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	windowitem1 = new WindowItem({
    			props: {
    				$$slots: { default: [create_default_slot_4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	windowitem2 = new WindowItem({
    			props: {
    				$$slots: { default: [create_default_slot_3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	windowitem3 = new WindowItem({
    			props: {
    				$$slots: { default: [create_default_slot_2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(windowitem0.$$.fragment);
    			t0 = space();
    			create_component(windowitem1.$$.fragment);
    			t1 = space();
    			create_component(windowitem2.$$.fragment);
    			t2 = space();
    			create_component(windowitem3.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(windowitem0, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(windowitem1, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(windowitem2, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(windowitem3, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const windowitem0_changes = {};

    			if (dirty & /*$$scope, user*/ 17) {
    				windowitem0_changes.$$scope = { dirty, ctx };
    			}

    			windowitem0.$set(windowitem0_changes);
    			const windowitem1_changes = {};

    			if (dirty & /*$$scope, user*/ 17) {
    				windowitem1_changes.$$scope = { dirty, ctx };
    			}

    			windowitem1.$set(windowitem1_changes);
    			const windowitem2_changes = {};

    			if (dirty & /*$$scope*/ 16) {
    				windowitem2_changes.$$scope = { dirty, ctx };
    			}

    			windowitem2.$set(windowitem2_changes);
    			const windowitem3_changes = {};

    			if (dirty & /*$$scope*/ 16) {
    				windowitem3_changes.$$scope = { dirty, ctx };
    			}

    			windowitem3.$set(windowitem3_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(windowitem0.$$.fragment, local);
    			transition_in(windowitem1.$$.fragment, local);
    			transition_in(windowitem2.$$.fragment, local);
    			transition_in(windowitem3.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(windowitem0.$$.fragment, local);
    			transition_out(windowitem1.$$.fragment, local);
    			transition_out(windowitem2.$$.fragment, local);
    			transition_out(windowitem3.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(windowitem0, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(windowitem1, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(windowitem2, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(windowitem3, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(33:3) <Window {value} class=\\\"ma-4\\\">",
    		ctx
    	});

    	return block;
    }

    // (15:1) <MaterialApp theme="dark">
    function create_default_slot(ctx) {
    	let div;
    	let appbar;
    	let t;
    	let window;
    	let current;

    	appbar = new AppBar({
    			props: {
    				class: "primary-color",
    				$$slots: {
    					extension: [create_extension_slot],
    					title: [create_title_slot]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	window = new Window({
    			props: {
    				value: /*value*/ ctx[1],
    				class: "ma-4",
    				$$slots: { default: [create_default_slot_1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(appbar.$$.fragment);
    			t = space();
    			create_component(window.$$.fragment);
    			attr_dev(div, "class", "bgDark");
    			add_location(div, file, 15, 2, 443);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(appbar, div, null);
    			append_dev(div, t);
    			mount_component(window, div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const appbar_changes = {};

    			if (dirty & /*$$scope, value*/ 18) {
    				appbar_changes.$$scope = { dirty, ctx };
    			}

    			appbar.$set(appbar_changes);
    			const window_changes = {};
    			if (dirty & /*value*/ 2) window_changes.value = /*value*/ ctx[1];

    			if (dirty & /*$$scope, user*/ 17) {
    				window_changes.$$scope = { dirty, ctx };
    			}

    			window.$set(window_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(appbar.$$.fragment, local);
    			transition_in(window.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(appbar.$$.fragment, local);
    			transition_out(window.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(appbar);
    			destroy_component(window);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(15:1) <MaterialApp theme=\\\"dark\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let materialapp;
    	let current;

    	materialapp = new MaterialApp({
    			props: {
    				theme: "dark",
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(materialapp.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(materialapp, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const materialapp_changes = {};

    			if (dirty & /*$$scope, value, user*/ 19) {
    				materialapp_changes.$$scope = { dirty, ctx };
    			}

    			materialapp.$set(materialapp_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(materialapp.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(materialapp.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(materialapp, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	let value = 0; //variable to keep track of values
    	let user = {};
    	user['uuid'] = v4();

    	function setUser(usr) {
    		$$invalidate(0, user = usr);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	function tabs_value_binding(value$1) {
    		value = value$1;
    		$$invalidate(1, value);
    	}

    	$$self.$capture_state = () => ({
    		Tabs,
    		Tab,
    		Window,
    		WindowItem,
    		AppBar,
    		MaterialApp,
    		uuidv4: v4,
    		ScoreBoard,
    		UserForm: UserDetailForm,
    		value,
    		user,
    		setUser
    	});

    	$$self.$inject_state = $$props => {
    		if ('value' in $$props) $$invalidate(1, value = $$props.value);
    		if ('user' in $$props) $$invalidate(0, user = $$props.user);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*user*/ 1) {
    			console.log(user);
    		}
    	};

    	return [user, value, setUser, tabs_value_binding];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    		name: 'world'
    	}
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map