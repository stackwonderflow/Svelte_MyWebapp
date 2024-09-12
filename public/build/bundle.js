
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
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
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        if (node.parentNode) {
            node.parentNode.removeChild(node);
        }
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
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
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
    function children(element) {
        return Array.from(element.childNodes);
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, cancelable, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    let render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = /* @__PURE__ */ Promise.resolve();
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
        // Do not reenter flush while dirty components are updated, as this can
        // result in an infinite loop. Instead, let the inner flush handle it.
        // Reentrancy is ok afterwards for bindings etc.
        if (flushidx !== 0) {
            return;
        }
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            try {
                while (flushidx < dirty_components.length) {
                    const component = dirty_components[flushidx];
                    flushidx++;
                    set_current_component(component);
                    update(component.$$);
                }
            }
            catch (e) {
                // reset dirty state to not end up in a deadlocked state and then rethrow
                dirty_components.length = 0;
                flushidx = 0;
                throw e;
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
    /**
     * Useful for example to execute remaining `afterUpdate` callbacks before executing `destroy`.
     */
    function flush_render_callbacks(fns) {
        const filtered = [];
        const targets = [];
        render_callbacks.forEach((c) => fns.indexOf(c) === -1 ? filtered.push(c) : targets.push(c));
        targets.forEach((c) => c());
        render_callbacks = filtered;
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
        else if (callback) {
            callback();
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = component.$$.on_mount.map(run).filter(is_function);
                // if the component was destroyed immediately
                // it will update the `$$.on_destroy` reference to `null`.
                // the destructured on_destroy may still reference to the old array
                if (component.$$.on_destroy) {
                    component.$$.on_destroy.push(...new_on_destroy);
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
            flush_render_callbacks($$.after_update);
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
            ctx: [],
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
            if (!is_function(callback)) {
                return noop;
            }
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
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.59.2' }, detail), { bubbles: true }));
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
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation, has_stop_immediate_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        if (has_stop_immediate_propagation)
            modifiers.push('stopImmediatePropagation');
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

    /* src/home.svelte generated by Svelte v3.59.2 */
    const file$5 = "src/home.svelte";

    function create_fragment$5(ctx) {
    	let meta0;
    	let meta1;
    	let link0;
    	let link1;
    	let t0;
    	let div1;
    	let h1;
    	let t2;
    	let p0;
    	let t4;
    	let p1;
    	let t6;
    	let div0;
    	let a0;
    	let t8;
    	let a1;

    	const block = {
    		c: function create() {
    			meta0 = element("meta");
    			meta1 = element("meta");
    			link0 = element("link");
    			link1 = element("link");
    			t0 = space();
    			div1 = element("div");
    			h1 = element("h1");
    			h1.textContent = "Welcome to My Portfolio";
    			t2 = space();
    			p0 = element("p");
    			p0.textContent = "Hello! I'm Alexandra B Allard, and this is my personal website. I'm passionate about computer science and programming, constantly expanding my knowledge and skills in this exciting field.";
    			t4 = space();
    			p1 = element("p");
    			p1.textContent = "Feel free to explore my projects and get to know more about my journey in the world of technology.";
    			t6 = space();
    			div0 = element("div");
    			a0 = element("a");
    			a0.textContent = "Connect on LinkedIn";
    			t8 = space();
    			a1 = element("a");
    			a1.textContent = "View GitHub Projects";
    			attr_dev(meta0, "charset", "utf-8");
    			add_location(meta0, file$5, 6, 4, 92);
    			attr_dev(meta1, "name", "viewport");
    			attr_dev(meta1, "content", "width=device-width,initial-scale=1");
    			add_location(meta1, file$5, 7, 4, 119);
    			document.title = "ABA's Homepage";
    			attr_dev(link0, "rel", "icon");
    			attr_dev(link0, "type", "image/png");
    			attr_dev(link0, "href", "/favicon.png");
    			add_location(link0, file$5, 9, 4, 225);
    			attr_dev(link1, "href", "https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap");
    			attr_dev(link1, "rel", "stylesheet");
    			add_location(link1, file$5, 10, 4, 284);
    			attr_dev(h1, "class", "svelte-1eipwe4");
    			add_location(h1, file$5, 14, 4, 446);
    			attr_dev(p0, "class", "svelte-1eipwe4");
    			add_location(p0, file$5, 15, 4, 483);
    			attr_dev(p1, "class", "svelte-1eipwe4");
    			add_location(p1, file$5, 16, 4, 682);
    			attr_dev(a0, "href", "https://www.linkedin.com/in/aallard1/");
    			attr_dev(a0, "target", "_blank");
    			attr_dev(a0, "rel", "noopener noreferrer");
    			attr_dev(a0, "class", "cta-button svelte-1eipwe4");
    			add_location(a0, file$5, 18, 8, 826);
    			attr_dev(a1, "href", "https://github.com/stackwonderflow");
    			attr_dev(a1, "target", "_blank");
    			attr_dev(a1, "rel", "noopener noreferrer");
    			attr_dev(a1, "class", "cta-button svelte-1eipwe4");
    			add_location(a1, file$5, 19, 8, 967);
    			attr_dev(div0, "class", "cta-buttons svelte-1eipwe4");
    			add_location(div0, file$5, 17, 4, 792);
    			attr_dev(div1, "class", "home-container svelte-1eipwe4");
    			add_location(div1, file$5, 13, 0, 413);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			append_dev(document.head, meta0);
    			append_dev(document.head, meta1);
    			append_dev(document.head, link0);
    			append_dev(document.head, link1);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, h1);
    			append_dev(div1, t2);
    			append_dev(div1, p0);
    			append_dev(div1, t4);
    			append_dev(div1, p1);
    			append_dev(div1, t6);
    			append_dev(div1, div0);
    			append_dev(div0, a0);
    			append_dev(div0, t8);
    			append_dev(div0, a1);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			detach_dev(meta0);
    			detach_dev(meta1);
    			detach_dev(link0);
    			detach_dev(link1);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div1);
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

    function instance$5($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Home', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Home> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Home extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Home",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src/aboutme.svelte generated by Svelte v3.59.2 */
    const file$4 = "src/aboutme.svelte";

    function create_fragment$4(ctx) {
    	let meta0;
    	let meta1;
    	let link;
    	let t0;
    	let div1;
    	let h1;
    	let t2;
    	let div0;
    	let p0;
    	let t4;
    	let ul;
    	let li0;
    	let t6;
    	let li1;
    	let t8;
    	let li2;
    	let t10;
    	let li3;
    	let t12;
    	let li4;
    	let t14;
    	let li5;
    	let t16;
    	let li6;
    	let t18;
    	let p1;
    	let t19;
    	let a;
    	let t21;

    	const block = {
    		c: function create() {
    			meta0 = element("meta");
    			meta1 = element("meta");
    			link = element("link");
    			t0 = space();
    			div1 = element("div");
    			h1 = element("h1");
    			h1.textContent = "About Me";
    			t2 = space();
    			div0 = element("div");
    			p0 = element("p");
    			p0.textContent = "I'm a multifaceted individual with a passion for technology and a zest for life. My interests span a wide range of activities, including:";
    			t4 = space();
    			ul = element("ul");
    			li0 = element("li");
    			li0.textContent = "Hiking and exploring nature";
    			t6 = space();
    			li1 = element("li");
    			li1.textContent = "Swimming";
    			t8 = space();
    			li2 = element("li");
    			li2.textContent = "Reading diverse genres";
    			t10 = space();
    			li3 = element("li");
    			li3.textContent = "Gaming and interactive storytelling";
    			t12 = space();
    			li4 = element("li");
    			li4.textContent = "Solving puzzles and brain teasers";
    			t14 = space();
    			li5 = element("li");
    			li5.textContent = "Continuous learning and self-improvement";
    			t16 = space();
    			li6 = element("li");
    			li6.textContent = "Coding and software development";
    			t18 = space();
    			p1 = element("p");
    			t19 = text("I'm always eager to connect with like-minded individuals and professionals in the tech industry. If you'd like to chat about shared interests or potential collaborations, feel free to connect with me on ");
    			a = element("a");
    			a.textContent = "LinkedIn";
    			t21 = text(".");
    			attr_dev(meta0, "charset", "utf-8");
    			add_location(meta0, file$4, 6, 4, 95);
    			attr_dev(meta1, "name", "viewport");
    			attr_dev(meta1, "content", "width=device-width,initial-scale=1");
    			add_location(meta1, file$4, 7, 4, 122);
    			document.title = "About Me - Alexandra B Allard";
    			attr_dev(link, "rel", "icon");
    			attr_dev(link, "type", "image/png");
    			attr_dev(link, "href", "/favicon.png");
    			add_location(link, file$4, 9, 4, 243);
    			attr_dev(h1, "class", "svelte-1tgf9v7");
    			add_location(h1, file$4, 13, 4, 348);
    			add_location(p0, file$4, 15, 8, 406);
    			attr_dev(li0, "class", "svelte-1tgf9v7");
    			add_location(li0, file$4, 17, 12, 576);
    			attr_dev(li1, "class", "svelte-1tgf9v7");
    			add_location(li1, file$4, 18, 12, 625);
    			attr_dev(li2, "class", "svelte-1tgf9v7");
    			add_location(li2, file$4, 19, 12, 655);
    			attr_dev(li3, "class", "svelte-1tgf9v7");
    			add_location(li3, file$4, 20, 12, 699);
    			attr_dev(li4, "class", "svelte-1tgf9v7");
    			add_location(li4, file$4, 21, 12, 756);
    			attr_dev(li5, "class", "svelte-1tgf9v7");
    			add_location(li5, file$4, 22, 12, 811);
    			attr_dev(li6, "class", "svelte-1tgf9v7");
    			add_location(li6, file$4, 23, 12, 873);
    			attr_dev(ul, "class", "svelte-1tgf9v7");
    			add_location(ul, file$4, 16, 8, 559);
    			attr_dev(a, "href", "https://www.linkedin.com/in/aallard1/");
    			attr_dev(a, "target", "_blank");
    			attr_dev(a, "rel", "noopener noreferrer");
    			add_location(a, file$4, 25, 214, 1142);
    			add_location(p1, file$4, 25, 8, 936);
    			attr_dev(div0, "class", "about-content svelte-1tgf9v7");
    			add_location(div0, file$4, 14, 4, 370);
    			attr_dev(div1, "class", "about-container svelte-1tgf9v7");
    			add_location(div1, file$4, 12, 0, 314);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			append_dev(document.head, meta0);
    			append_dev(document.head, meta1);
    			append_dev(document.head, link);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, h1);
    			append_dev(div1, t2);
    			append_dev(div1, div0);
    			append_dev(div0, p0);
    			append_dev(div0, t4);
    			append_dev(div0, ul);
    			append_dev(ul, li0);
    			append_dev(ul, t6);
    			append_dev(ul, li1);
    			append_dev(ul, t8);
    			append_dev(ul, li2);
    			append_dev(ul, t10);
    			append_dev(ul, li3);
    			append_dev(ul, t12);
    			append_dev(ul, li4);
    			append_dev(ul, t14);
    			append_dev(ul, li5);
    			append_dev(ul, t16);
    			append_dev(ul, li6);
    			append_dev(div0, t18);
    			append_dev(div0, p1);
    			append_dev(p1, t19);
    			append_dev(p1, a);
    			append_dev(p1, t21);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			detach_dev(meta0);
    			detach_dev(meta1);
    			detach_dev(link);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div1);
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

    function instance$4($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Aboutme', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Aboutme> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Aboutme extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Aboutme",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src/projects.svelte generated by Svelte v3.59.2 */
    const file$3 = "src/projects.svelte";

    function create_fragment$3(ctx) {
    	let meta0;
    	let meta1;
    	let link;
    	let t0;
    	let div6;
    	let h1;
    	let t2;
    	let div5;
    	let div0;
    	let h20;
    	let t4;
    	let p0;
    	let t6;
    	let a0;
    	let t8;
    	let div1;
    	let h21;
    	let t10;
    	let p1;
    	let t12;
    	let a1;
    	let t14;
    	let div2;
    	let h22;
    	let t16;
    	let p2;
    	let t18;
    	let a2;
    	let t20;
    	let div4;
    	let h23;
    	let t22;
    	let p3;
    	let t24;
    	let div3;
    	let a3;
    	let t26;
    	let a4;

    	const block = {
    		c: function create() {
    			meta0 = element("meta");
    			meta1 = element("meta");
    			link = element("link");
    			t0 = space();
    			div6 = element("div");
    			h1 = element("h1");
    			h1.textContent = "Projects";
    			t2 = space();
    			div5 = element("div");
    			div0 = element("div");
    			h20 = element("h2");
    			h20.textContent = "OSRS Shooting Star Tracker";
    			t4 = space();
    			p0 = element("p");
    			p0.textContent = "An in-progress collaborative project featuring a scraper for Old School Runescape (OSRS). Plan to make a plugin integration for RuneLite.";
    			t6 = space();
    			a0 = element("a");
    			a0.textContent = "View on GitHub";
    			t8 = space();
    			div1 = element("div");
    			h21 = element("h2");
    			h21.textContent = "Undergroundv2";
    			t10 = space();
    			p1 = element("p");
    			p1.textContent = "An improved version of my original console-based game, Underground. This Flask-based web app represents my growth as a developer and includes various bug fixes and enhancements.";
    			t12 = space();
    			a1 = element("a");
    			a1.textContent = "View on GitHub";
    			t14 = space();
    			div2 = element("div");
    			h22 = element("h2");
    			h22.textContent = "ConsoleArcade";
    			t16 = space();
    			p2 = element("p");
    			p2.textContent = "A collaborative project featuring a series of console-based games written in Python. Includes popular games like hangman and tic-tac-toe, enhanced with ASCII visuals.";
    			t18 = space();
    			a2 = element("a");
    			a2.textContent = "View on GitHub";
    			t20 = space();
    			div4 = element("div");
    			h23 = element("h2");
    			h23.textContent = "Underground";
    			t22 = space();
    			p3 = element("p");
    			p3.textContent = "My first major coding project, created as the final project for Code In Place 2021. A console-based adventure game where players face progressively stronger enemies.";
    			t24 = space();
    			div3 = element("div");
    			a3 = element("a");
    			a3.textContent = "View Showcase";
    			t26 = space();
    			a4 = element("a");
    			a4.textContent = "View on GitHub";
    			attr_dev(meta0, "charset", "utf-8");
    			add_location(meta0, file$3, 6, 4, 96);
    			attr_dev(meta1, "name", "viewport");
    			attr_dev(meta1, "content", "width=device-width,initial-scale=1");
    			add_location(meta1, file$3, 7, 4, 123);
    			document.title = "ABA's Projects";
    			attr_dev(link, "rel", "icon");
    			attr_dev(link, "type", "image/png");
    			attr_dev(link, "href", "/favicon.png");
    			add_location(link, file$3, 9, 4, 229);
    			attr_dev(h1, "class", "svelte-14so568");
    			add_location(h1, file$3, 13, 4, 337);
    			attr_dev(h20, "class", "svelte-14so568");
    			add_location(h20, file$3, 16, 12, 433);
    			add_location(p0, file$3, 17, 12, 481);
    			attr_dev(a0, "href", "https://github.com/stackwonderflow/osrs_shooting_star_tracker");
    			attr_dev(a0, "target", "_blank");
    			attr_dev(a0, "rel", "noopener noreferrer");
    			attr_dev(a0, "class", "project-link svelte-14so568");
    			add_location(a0, file$3, 18, 12, 638);
    			attr_dev(div0, "class", "project-card svelte-14so568");
    			add_location(div0, file$3, 15, 8, 394);
    			attr_dev(h21, "class", "svelte-14so568");
    			add_location(h21, file$3, 21, 12, 854);
    			add_location(p1, file$3, 22, 12, 889);
    			attr_dev(a1, "href", "https://github.com/stackwonderflow/Undergroundv2");
    			attr_dev(a1, "target", "_blank");
    			attr_dev(a1, "rel", "noopener noreferrer");
    			attr_dev(a1, "class", "project-link svelte-14so568");
    			add_location(a1, file$3, 23, 12, 1086);
    			attr_dev(div1, "class", "project-card svelte-14so568");
    			add_location(div1, file$3, 20, 8, 815);
    			attr_dev(h22, "class", "svelte-14so568");
    			add_location(h22, file$3, 26, 12, 1289);
    			add_location(p2, file$3, 27, 12, 1324);
    			attr_dev(a2, "href", "https://github.com/eantablin/ConsoleArcade");
    			attr_dev(a2, "target", "_blank");
    			attr_dev(a2, "rel", "noopener noreferrer");
    			attr_dev(a2, "class", "project-link svelte-14so568");
    			add_location(a2, file$3, 28, 12, 1510);
    			attr_dev(div2, "class", "project-card svelte-14so568");
    			add_location(div2, file$3, 25, 8, 1250);
    			attr_dev(h23, "class", "svelte-14so568");
    			add_location(h23, file$3, 31, 12, 1707);
    			add_location(p3, file$3, 32, 12, 1740);
    			attr_dev(a3, "href", "https://codeinplace-2021.netlify.app/2021/showcase/1340");
    			attr_dev(a3, "target", "_blank");
    			attr_dev(a3, "rel", "noopener noreferrer");
    			attr_dev(a3, "class", "project-link svelte-14so568");
    			add_location(a3, file$3, 34, 16, 1969);
    			attr_dev(a4, "href", "https://github.com/stackwonderflow/Underground");
    			attr_dev(a4, "target", "_blank");
    			attr_dev(a4, "rel", "noopener noreferrer");
    			attr_dev(a4, "class", "project-link svelte-14so568");
    			add_location(a4, file$3, 35, 16, 2132);
    			attr_dev(div3, "class", "project-links svelte-14so568");
    			add_location(div3, file$3, 33, 12, 1925);
    			attr_dev(div4, "class", "project-card svelte-14so568");
    			add_location(div4, file$3, 30, 8, 1668);
    			attr_dev(div5, "class", "project-grid svelte-14so568");
    			add_location(div5, file$3, 14, 4, 359);
    			attr_dev(div6, "class", "projects-container svelte-14so568");
    			add_location(div6, file$3, 12, 0, 300);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			append_dev(document.head, meta0);
    			append_dev(document.head, meta1);
    			append_dev(document.head, link);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div6, anchor);
    			append_dev(div6, h1);
    			append_dev(div6, t2);
    			append_dev(div6, div5);
    			append_dev(div5, div0);
    			append_dev(div0, h20);
    			append_dev(div0, t4);
    			append_dev(div0, p0);
    			append_dev(div0, t6);
    			append_dev(div0, a0);
    			append_dev(div5, t8);
    			append_dev(div5, div1);
    			append_dev(div1, h21);
    			append_dev(div1, t10);
    			append_dev(div1, p1);
    			append_dev(div1, t12);
    			append_dev(div1, a1);
    			append_dev(div5, t14);
    			append_dev(div5, div2);
    			append_dev(div2, h22);
    			append_dev(div2, t16);
    			append_dev(div2, p2);
    			append_dev(div2, t18);
    			append_dev(div2, a2);
    			append_dev(div5, t20);
    			append_dev(div5, div4);
    			append_dev(div4, h23);
    			append_dev(div4, t22);
    			append_dev(div4, p3);
    			append_dev(div4, t24);
    			append_dev(div4, div3);
    			append_dev(div3, a3);
    			append_dev(div3, t26);
    			append_dev(div3, a4);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			detach_dev(meta0);
    			detach_dev(meta1);
    			detach_dev(link);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div6);
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

    function instance$3($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Projects', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Projects> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Projects extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Projects",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src/resume.svelte generated by Svelte v3.59.2 */
    const file$2 = "src/resume.svelte";

    function create_fragment$2(ctx) {
    	let meta0;
    	let meta1;
    	let link;
    	let t0;
    	let div20;
    	let h1;
    	let t2;
    	let section0;
    	let h20;
    	let t4;
    	let div0;
    	let h30;
    	let t6;
    	let p0;
    	let t8;
    	let div1;
    	let h31;
    	let t10;
    	let p1;
    	let t12;
    	let section1;
    	let h21;
    	let t14;
    	let div6;
    	let div2;
    	let h32;
    	let t16;
    	let ul0;
    	let li0;
    	let t18;
    	let li1;
    	let t20;
    	let li2;
    	let t22;
    	let li3;
    	let t24;
    	let li4;
    	let t26;
    	let div3;
    	let h33;
    	let t28;
    	let ul1;
    	let li5;
    	let t30;
    	let li6;
    	let t32;
    	let li7;
    	let t34;
    	let li8;
    	let t36;
    	let li9;
    	let t38;
    	let div4;
    	let h34;
    	let t40;
    	let ul2;
    	let li10;
    	let t42;
    	let li11;
    	let t44;
    	let li12;
    	let t46;
    	let li13;
    	let t48;
    	let li14;
    	let t50;
    	let li15;
    	let t52;
    	let li16;
    	let t54;
    	let div5;
    	let h35;
    	let t56;
    	let ul3;
    	let li17;
    	let t58;
    	let li18;
    	let t60;
    	let li19;
    	let t62;
    	let li20;
    	let t64;
    	let li21;
    	let t66;
    	let section2;
    	let h22;
    	let t68;
    	let div7;
    	let h36;
    	let t70;
    	let p2;
    	let t72;
    	let ul4;
    	let li22;
    	let t74;
    	let li23;
    	let t76;
    	let li24;
    	let t78;
    	let div8;
    	let h37;
    	let t80;
    	let p3;
    	let t82;
    	let ul5;
    	let li25;
    	let t84;
    	let li26;
    	let t86;
    	let li27;
    	let t88;
    	let div9;
    	let h38;
    	let t90;
    	let p4;
    	let t92;
    	let p5;
    	let t94;
    	let ul6;
    	let li28;
    	let t96;
    	let li29;
    	let t98;
    	let li30;
    	let t100;
    	let li31;
    	let t102;
    	let section3;
    	let h23;
    	let t104;
    	let div10;
    	let h39;
    	let t106;
    	let p6;
    	let t108;
    	let p7;
    	let t110;
    	let ul7;
    	let li32;
    	let t112;
    	let li33;
    	let t114;
    	let section4;
    	let h24;
    	let t116;
    	let div11;
    	let h310;
    	let t118;
    	let p8;
    	let t120;
    	let p9;
    	let t122;
    	let div12;
    	let h311;
    	let t124;
    	let p10;
    	let t126;
    	let p11;
    	let t128;
    	let section5;
    	let h25;
    	let t130;
    	let div13;
    	let h312;
    	let t132;
    	let p12;
    	let t134;
    	let p13;
    	let t136;
    	let section6;
    	let h26;
    	let t138;
    	let div14;
    	let h313;
    	let t140;
    	let p14;
    	let t142;
    	let section7;
    	let h27;
    	let t144;
    	let div15;
    	let h314;
    	let t146;
    	let p15;
    	let t148;
    	let div16;
    	let h315;
    	let t150;
    	let p16;
    	let t152;
    	let ul8;
    	let li34;
    	let t154;
    	let li35;
    	let t156;
    	let section8;
    	let h28;
    	let t158;
    	let div17;
    	let h316;
    	let t160;
    	let p17;
    	let t162;
    	let p18;
    	let t164;
    	let div18;
    	let h317;
    	let t166;
    	let p19;
    	let t168;
    	let p20;
    	let t170;
    	let div19;
    	let h318;
    	let t172;
    	let p21;
    	let t174;
    	let p22;

    	const block = {
    		c: function create() {
    			meta0 = element("meta");
    			meta1 = element("meta");
    			link = element("link");
    			t0 = space();
    			div20 = element("div");
    			h1 = element("h1");
    			h1.textContent = "Resume";
    			t2 = space();
    			section0 = element("section");
    			h20 = element("h2");
    			h20.textContent = "Education";
    			t4 = space();
    			div0 = element("div");
    			h30 = element("h3");
    			h30.textContent = "Florida Institute of Technology (FIT), Melbourne, FL";
    			t6 = space();
    			p0 = element("p");
    			p0.textContent = "B.S., Biochemistry (Chemistry Focus), 2017-2018";
    			t8 = space();
    			div1 = element("div");
    			h31 = element("h3");
    			h31.textContent = "Eastern Florida State College (EFSC), Melbourne, FL";
    			t10 = space();
    			p1 = element("p");
    			p1.textContent = "A.A., -2016";
    			t12 = space();
    			section1 = element("section");
    			h21 = element("h2");
    			h21.textContent = "Skills";
    			t14 = space();
    			div6 = element("div");
    			div2 = element("div");
    			h32 = element("h3");
    			h32.textContent = "Programming Languages";
    			t16 = space();
    			ul0 = element("ul");
    			li0 = element("li");
    			li0.textContent = "Python";
    			t18 = space();
    			li1 = element("li");
    			li1.textContent = "C";
    			t20 = space();
    			li2 = element("li");
    			li2.textContent = "SQL";
    			t22 = space();
    			li3 = element("li");
    			li3.textContent = "HTML";
    			t24 = space();
    			li4 = element("li");
    			li4.textContent = "CSS";
    			t26 = space();
    			div3 = element("div");
    			h33 = element("h3");
    			h33.textContent = "Programming Tools";
    			t28 = space();
    			ul1 = element("ul");
    			li5 = element("li");
    			li5.textContent = "Git";
    			t30 = space();
    			li6 = element("li");
    			li6.textContent = "Github";
    			t32 = space();
    			li7 = element("li");
    			li7.textContent = "VSCode";
    			t34 = space();
    			li8 = element("li");
    			li8.textContent = "PostgreSQL";
    			t36 = space();
    			li9 = element("li");
    			li9.textContent = "SQLite3";
    			t38 = space();
    			div4 = element("div");
    			h34 = element("h3");
    			h34.textContent = "Laboratory Skills & Equipment";
    			t40 = space();
    			ul2 = element("ul");
    			li10 = element("li");
    			li10.textContent = "FPLC";
    			t42 = space();
    			li11 = element("li");
    			li11.textContent = "HPLC";
    			t44 = space();
    			li12 = element("li");
    			li12.textContent = "AKTA Explorer";
    			t46 = space();
    			li13 = element("li");
    			li13.textContent = "Hewlett-Packard Agilent HPLC";
    			t48 = space();
    			li14 = element("li");
    			li14.textContent = "Gator Label-Free Analysis";
    			t50 = space();
    			li15 = element("li");
    			li15.textContent = "Expi293F Cells";
    			t52 = space();
    			li16 = element("li");
    			li16.textContent = "SDS-PAGE";
    			t54 = space();
    			div5 = element("div");
    			h35 = element("h3");
    			h35.textContent = "Laboratory Techniques";
    			t56 = space();
    			ul3 = element("ul");
    			li17 = element("li");
    			li17.textContent = "Suspension cell culture";
    			t58 = space();
    			li18 = element("li");
    			li18.textContent = "Bacterial transfection & transformation";
    			t60 = space();
    			li19 = element("li");
    			li19.textContent = "Aseptic technique";
    			t62 = space();
    			li20 = element("li");
    			li20.textContent = "Petrifilm plating & Spread plating";
    			t64 = space();
    			li21 = element("li");
    			li21.textContent = "Clean Room protocols";
    			t66 = space();
    			section2 = element("section");
    			h22 = element("h2");
    			h22.textContent = "Work Experience";
    			t68 = space();
    			div7 = element("div");
    			h36 = element("h3");
    			h36.textContent = "Junior Software Engineer";
    			t70 = space();
    			p2 = element("p");
    			p2.textContent = "Private Client, Jan 2024-Present";
    			t72 = space();
    			ul4 = element("ul");
    			li22 = element("li");
    			li22.textContent = "Develop software and websites using C, Python, SQLite3, HTML, CSS, Flask, and Svelte";
    			t74 = space();
    			li23 = element("li");
    			li23.textContent = "Maintain and manage internal data lake using PostgreSQL and Python";
    			t76 = space();
    			li24 = element("li");
    			li24.textContent = "Continuously expand knowledge of new languages and technologies";
    			t78 = space();
    			div8 = element("div");
    			h37 = element("h3");
    			h37.textContent = "Microbiology Technician";
    			t80 = space();
    			p3 = element("p");
    			p3.textContent = "Food Safety Net Services, Bentonville, AR Jun 2023-Jan 2024";
    			t82 = space();
    			ul5 = element("ul");
    			li25 = element("li");
    			li25.textContent = "Prepared samples for testing to determine presence of indicator organisms and pathogens while utilizing aseptic technique";
    			t84 = space();
    			li26 = element("li");
    			li26.textContent = "Participated in quality control monitoring by taking incubator temperatures, inoculating control organisms, and running media controls";
    			t86 = space();
    			li27 = element("li");
    			li27.textContent = "Maintained laboratory condition, to include equipment, supplies, and kept accurate records throughout all procedures";
    			t88 = space();
    			div9 = element("div");
    			h38 = element("h3");
    			h38.textContent = "Assistant Scientist";
    			t90 = space();
    			p4 = element("p");
    			p4.textContent = "Amberstone Biosciences, Irvine, CA Jan 2022-Sept 2022";
    			t92 = space();
    			p5 = element("p");
    			p5.textContent = "Protein Science Team";
    			t94 = space();
    			ul6 = element("ul");
    			li28 = element("li");
    			li28.textContent = "Produced super-coiled plasmid DNA through plasmid purification of E. coli for use in transfections";
    			t96 = space();
    			li29 = element("li");
    			li29.textContent = "Obtained condition media for use in protein purification by maintaining, passaging, transfecting, and harvesting Expi293F cell cultures";
    			t98 = space();
    			li30 = element("li");
    			li30.textContent = "Produced 99% pure proteins by performing various types of purification procedures (Batch Purification, FPLC IMAC Nickel-NTA) successfully producing base product for further testing";
    			t100 = space();
    			li31 = element("li");
    			li31.textContent = "Ensured proper implementation of more recent one-step purification procedures by testing new protein purification techniques via experimentation (M1, Heparin Sepharose)";
    			t102 = space();
    			section3 = element("section");
    			h23 = element("h2");
    			h23.textContent = "Research Experience";
    			t104 = space();
    			div10 = element("div");
    			h39 = element("h3");
    			h39.textContent = "Research Assistant";
    			t106 = space();
    			p6 = element("p");
    			p6.textContent = "FIT, Melbourne, FL Aug 2017-Dec 2018";
    			t108 = space();
    			p7 = element("p");
    			p7.textContent = "Dr. Norito Takenaka's Lab";
    			t110 = space();
    			ul7 = element("ul");
    			li32 = element("li");
    			li32.textContent = "Synthesized Lewis Base catalyst through column chromatography and other lab techniques for production of value added products.";
    			t112 = space();
    			li33 = element("li");
    			li33.textContent = "Developed artificial enzymes for use in catalytic reaction, demonstrating catalyst's utility in production of pharmaceutical compounds.";
    			t114 = space();
    			section4 = element("section");
    			h24 = element("h2");
    			h24.textContent = "Additional Education";
    			t116 = space();
    			div11 = element("div");
    			h310 = element("h3");
    			h310.textContent = "CS50 2024";
    			t118 = space();
    			p8 = element("p");
    			p8.textContent = "Harvard University, Cambridge, MA 2024";
    			t120 = space();
    			p9 = element("p");
    			p9.textContent = "CS50 is Harvard's introductory computer science course, offered online. It guides students through several coding languages and tools, including Scratch, C, Python, SQL, HTML, CSS, JavaScript, and Flask. The class culminates in a final project of the student's choice, allowing them to demonstrate their learning and explore new languages and technologies.";
    			t122 = space();
    			div12 = element("div");
    			h311 = element("h3");
    			h311.textContent = "Code In Place 2021";
    			t124 = space();
    			p10 = element("p");
    			p10.textContent = "Stanford University, Stanford, CA 2021";
    			t126 = space();
    			p11 = element("p");
    			p11.textContent = "Code In Place is a 5-week online introductory Python course based on material from the first half of Stanford’s introductory programming course, CS106A. The class culminates in a final project where students demonstrate their newly acquired skills. Final projects are showcased online.";
    			t128 = space();
    			section5 = element("section");
    			h25 = element("h2");
    			h25.textContent = "Posters";
    			t130 = space();
    			div13 = element("div");
    			h312 = element("h3");
    			h312.textContent = "Takenaka Lab";
    			t132 = space();
    			p12 = element("p");
    			p12.textContent = "FIT, Melbourne, FL April 2018";
    			t134 = space();
    			p13 = element("p");
    			p13.textContent = "Presented evidence proving viability of research catalyst as a green alternative to commonly used synthetic metal-based catalysts at Northrop Grumman Engineering & Science Student Design Showcase";
    			t136 = space();
    			section6 = element("section");
    			h26 = element("h2");
    			h26.textContent = "Awards";
    			t138 = space();
    			div14 = element("div");
    			h313 = element("h3");
    			h313.textContent = "Outstanding Two-Year College Student Award";
    			t140 = space();
    			p14 = element("p");
    			p14.textContent = "ACS Orlando Section, Melbourne, FL Dec 2015";
    			t142 = space();
    			section7 = element("section");
    			h27 = element("h2");
    			h27.textContent = "Memberships";
    			t144 = space();
    			div15 = element("div");
    			h314 = element("h3");
    			h314.textContent = "American Chemical Society";
    			t146 = space();
    			p15 = element("p");
    			p15.textContent = "Member, 2017-2019";
    			t148 = space();
    			div16 = element("div");
    			h315 = element("h3");
    			h315.textContent = "American Chemical Society Student Affiliates FIT";
    			t150 = space();
    			p16 = element("p");
    			p16.textContent = "Member, Melbourne, FL Jan 2017-Dec 2018";
    			t152 = space();
    			ul8 = element("ul");
    			li34 = element("li");
    			li34.textContent = "Organized and volunteered at community outreach events.";
    			t154 = space();
    			li35 = element("li");
    			li35.textContent = "Attended and organized conferences with other ACS club branches from nearby colleges.";
    			t156 = space();
    			section8 = element("section");
    			h28 = element("h2");
    			h28.textContent = "Volunteer & Outreach Experience";
    			t158 = space();
    			div17 = element("div");
    			h316 = element("h3");
    			h316.textContent = "Volunteer";
    			t160 = space();
    			p17 = element("p");
    			p17.textContent = "FIT, ACS Student Affiliates, Tea Event, Melbourne, FL Aug 2018";
    			t162 = space();
    			p18 = element("p");
    			p18.textContent = "Demonstrated the color changing properties with varied pH of Butterfly Pea Flower Tea";
    			t164 = space();
    			div18 = element("div");
    			h317 = element("h3");
    			h317.textContent = "Volunteer";
    			t166 = space();
    			p19 = element("p");
    			p19.textContent = "FIT, ACS Student Affiliates, Halloween Slime Event, Melbourne, FL Oct 2018";
    			t168 = space();
    			p20 = element("p");
    			p20.textContent = "Community outreach event in which visitors made and played with their own polymers (various types of slime)";
    			t170 = space();
    			div19 = element("div");
    			h318 = element("h3");
    			h318.textContent = "Volunteer";
    			t172 = space();
    			p21 = element("p");
    			p21.textContent = "FIT, ACS Student Affiliates, Snow-globe Event, Melbourne, FL Dec 201";
    			t174 = space();
    			p22 = element("p");
    			p22.textContent = "Community outreach event in which visitors customised their own snow-globes and learned about supersaturated solutions (used benzoic acid solutions)";
    			attr_dev(meta0, "charset", "utf-8");
    			add_location(meta0, file$2, 6, 4, 94);
    			attr_dev(meta1, "name", "viewport");
    			attr_dev(meta1, "content", "width=device-width,initial-scale=1");
    			add_location(meta1, file$2, 7, 4, 121);
    			document.title = "ABA's Resume";
    			attr_dev(link, "rel", "icon");
    			attr_dev(link, "type", "image/png");
    			attr_dev(link, "href", "/favicon.png");
    			add_location(link, file$2, 9, 4, 225);
    			attr_dev(h1, "class", "svelte-1elxcz1");
    			add_location(h1, file$2, 13, 4, 331);
    			attr_dev(h20, "class", "svelte-1elxcz1");
    			add_location(h20, file$2, 16, 8, 374);
    			attr_dev(h30, "class", "svelte-1elxcz1");
    			add_location(h30, file$2, 18, 12, 439);
    			add_location(p0, file$2, 19, 12, 513);
    			attr_dev(div0, "class", "resume-item svelte-1elxcz1");
    			add_location(div0, file$2, 17, 8, 401);
    			attr_dev(h31, "class", "svelte-1elxcz1");
    			add_location(h31, file$2, 22, 12, 629);
    			add_location(p1, file$2, 23, 12, 702);
    			attr_dev(div1, "class", "resume-item svelte-1elxcz1");
    			add_location(div1, file$2, 21, 8, 591);
    			attr_dev(section0, "class", "svelte-1elxcz1");
    			add_location(section0, file$2, 15, 4, 356);
    			attr_dev(h21, "class", "svelte-1elxcz1");
    			add_location(h21, file$2, 28, 8, 774);
    			attr_dev(h32, "class", "svelte-1elxcz1");
    			add_location(h32, file$2, 31, 16, 881);
    			attr_dev(li0, "class", "svelte-1elxcz1");
    			add_location(li0, file$2, 33, 20, 953);
    			attr_dev(li1, "class", "svelte-1elxcz1");
    			add_location(li1, file$2, 34, 20, 989);
    			attr_dev(li2, "class", "svelte-1elxcz1");
    			add_location(li2, file$2, 35, 20, 1020);
    			attr_dev(li3, "class", "svelte-1elxcz1");
    			add_location(li3, file$2, 36, 20, 1053);
    			attr_dev(li4, "class", "svelte-1elxcz1");
    			add_location(li4, file$2, 37, 20, 1087);
    			attr_dev(ul0, "class", "svelte-1elxcz1");
    			add_location(ul0, file$2, 32, 16, 928);
    			attr_dev(div2, "class", "skill-category svelte-1elxcz1");
    			add_location(div2, file$2, 30, 12, 836);
    			attr_dev(h33, "class", "svelte-1elxcz1");
    			add_location(h33, file$2, 41, 16, 1198);
    			attr_dev(li5, "class", "svelte-1elxcz1");
    			add_location(li5, file$2, 43, 20, 1266);
    			attr_dev(li6, "class", "svelte-1elxcz1");
    			add_location(li6, file$2, 44, 20, 1299);
    			attr_dev(li7, "class", "svelte-1elxcz1");
    			add_location(li7, file$2, 45, 20, 1335);
    			attr_dev(li8, "class", "svelte-1elxcz1");
    			add_location(li8, file$2, 46, 20, 1371);
    			attr_dev(li9, "class", "svelte-1elxcz1");
    			add_location(li9, file$2, 47, 20, 1411);
    			attr_dev(ul1, "class", "svelte-1elxcz1");
    			add_location(ul1, file$2, 42, 16, 1241);
    			attr_dev(div3, "class", "skill-category svelte-1elxcz1");
    			add_location(div3, file$2, 40, 12, 1153);
    			attr_dev(h34, "class", "svelte-1elxcz1");
    			add_location(h34, file$2, 51, 16, 1526);
    			attr_dev(li10, "class", "svelte-1elxcz1");
    			add_location(li10, file$2, 53, 20, 1606);
    			attr_dev(li11, "class", "svelte-1elxcz1");
    			add_location(li11, file$2, 54, 20, 1640);
    			attr_dev(li12, "class", "svelte-1elxcz1");
    			add_location(li12, file$2, 55, 20, 1674);
    			attr_dev(li13, "class", "svelte-1elxcz1");
    			add_location(li13, file$2, 56, 20, 1717);
    			attr_dev(li14, "class", "svelte-1elxcz1");
    			add_location(li14, file$2, 57, 20, 1775);
    			attr_dev(li15, "class", "svelte-1elxcz1");
    			add_location(li15, file$2, 58, 20, 1830);
    			attr_dev(li16, "class", "svelte-1elxcz1");
    			add_location(li16, file$2, 59, 20, 1874);
    			attr_dev(ul2, "class", "svelte-1elxcz1");
    			add_location(ul2, file$2, 52, 16, 1581);
    			attr_dev(div4, "class", "skill-category svelte-1elxcz1");
    			add_location(div4, file$2, 50, 12, 1481);
    			attr_dev(h35, "class", "svelte-1elxcz1");
    			add_location(h35, file$2, 63, 16, 1990);
    			attr_dev(li17, "class", "svelte-1elxcz1");
    			add_location(li17, file$2, 65, 20, 2062);
    			attr_dev(li18, "class", "svelte-1elxcz1");
    			add_location(li18, file$2, 66, 20, 2115);
    			attr_dev(li19, "class", "svelte-1elxcz1");
    			add_location(li19, file$2, 67, 20, 2184);
    			attr_dev(li20, "class", "svelte-1elxcz1");
    			add_location(li20, file$2, 68, 20, 2231);
    			attr_dev(li21, "class", "svelte-1elxcz1");
    			add_location(li21, file$2, 69, 20, 2295);
    			attr_dev(ul3, "class", "svelte-1elxcz1");
    			add_location(ul3, file$2, 64, 16, 2037);
    			attr_dev(div5, "class", "skill-category svelte-1elxcz1");
    			add_location(div5, file$2, 62, 12, 1945);
    			attr_dev(div6, "class", "skills-grid svelte-1elxcz1");
    			add_location(div6, file$2, 29, 8, 798);
    			attr_dev(section1, "class", "svelte-1elxcz1");
    			add_location(section1, file$2, 27, 4, 756);
    			attr_dev(h22, "class", "svelte-1elxcz1");
    			add_location(h22, file$2, 76, 8, 2419);
    			attr_dev(h36, "class", "svelte-1elxcz1");
    			add_location(h36, file$2, 78, 12, 2490);
    			add_location(p2, file$2, 79, 12, 2536);
    			attr_dev(li22, "class", "svelte-1elxcz1");
    			add_location(li22, file$2, 81, 16, 2609);
    			attr_dev(li23, "class", "svelte-1elxcz1");
    			add_location(li23, file$2, 82, 16, 2719);
    			attr_dev(li24, "class", "svelte-1elxcz1");
    			add_location(li24, file$2, 83, 16, 2811);
    			attr_dev(ul4, "class", "svelte-1elxcz1");
    			add_location(ul4, file$2, 80, 12, 2588);
    			attr_dev(div7, "class", "resume-item svelte-1elxcz1");
    			add_location(div7, file$2, 77, 8, 2452);
    			attr_dev(h37, "class", "svelte-1elxcz1");
    			add_location(h37, file$2, 87, 12, 2963);
    			add_location(p3, file$2, 88, 12, 3008);
    			attr_dev(li25, "class", "svelte-1elxcz1");
    			add_location(li25, file$2, 90, 16, 3108);
    			attr_dev(li26, "class", "svelte-1elxcz1");
    			add_location(li26, file$2, 91, 16, 3255);
    			attr_dev(li27, "class", "svelte-1elxcz1");
    			add_location(li27, file$2, 92, 16, 3415);
    			attr_dev(ul5, "class", "svelte-1elxcz1");
    			add_location(ul5, file$2, 89, 12, 3087);
    			attr_dev(div8, "class", "resume-item svelte-1elxcz1");
    			add_location(div8, file$2, 86, 8, 2925);
    			attr_dev(h38, "class", "svelte-1elxcz1");
    			add_location(h38, file$2, 96, 12, 3620);
    			add_location(p4, file$2, 97, 12, 3661);
    			add_location(p5, file$2, 98, 12, 3734);
    			attr_dev(li28, "class", "svelte-1elxcz1");
    			add_location(li28, file$2, 100, 16, 3795);
    			attr_dev(li29, "class", "svelte-1elxcz1");
    			add_location(li29, file$2, 101, 16, 3919);
    			attr_dev(li30, "class", "svelte-1elxcz1");
    			add_location(li30, file$2, 102, 16, 4080);
    			attr_dev(li31, "class", "svelte-1elxcz1");
    			add_location(li31, file$2, 103, 16, 4286);
    			attr_dev(ul6, "class", "svelte-1elxcz1");
    			add_location(ul6, file$2, 99, 12, 3774);
    			attr_dev(div9, "class", "resume-item svelte-1elxcz1");
    			add_location(div9, file$2, 95, 8, 3582);
    			attr_dev(section2, "class", "svelte-1elxcz1");
    			add_location(section2, file$2, 75, 4, 2401);
    			attr_dev(h23, "class", "svelte-1elxcz1");
    			add_location(h23, file$2, 110, 8, 4579);
    			attr_dev(h39, "class", "svelte-1elxcz1");
    			add_location(h39, file$2, 112, 12, 4654);
    			add_location(p6, file$2, 113, 12, 4694);
    			add_location(p7, file$2, 114, 12, 4750);
    			attr_dev(li32, "class", "svelte-1elxcz1");
    			add_location(li32, file$2, 116, 16, 4816);
    			attr_dev(li33, "class", "svelte-1elxcz1");
    			add_location(li33, file$2, 117, 16, 4968);
    			attr_dev(ul7, "class", "svelte-1elxcz1");
    			add_location(ul7, file$2, 115, 12, 4795);
    			attr_dev(div10, "class", "resume-item svelte-1elxcz1");
    			add_location(div10, file$2, 111, 8, 4616);
    			attr_dev(section3, "class", "svelte-1elxcz1");
    			add_location(section3, file$2, 109, 4, 4561);
    			attr_dev(h24, "class", "svelte-1elxcz1");
    			add_location(h24, file$2, 123, 8, 5184);
    			attr_dev(h310, "class", "svelte-1elxcz1");
    			add_location(h310, file$2, 125, 12, 5260);
    			add_location(p8, file$2, 126, 12, 5291);
    			add_location(p9, file$2, 127, 12, 5349);
    			attr_dev(div11, "class", "resume-item svelte-1elxcz1");
    			add_location(div11, file$2, 124, 8, 5222);
    			attr_dev(h311, "class", "svelte-1elxcz1");
    			add_location(h311, file$2, 130, 12, 5774);
    			add_location(p10, file$2, 131, 12, 5814);
    			add_location(p11, file$2, 132, 12, 5872);
    			attr_dev(div12, "class", "resume-item svelte-1elxcz1");
    			add_location(div12, file$2, 129, 8, 5736);
    			attr_dev(section4, "class", "svelte-1elxcz1");
    			add_location(section4, file$2, 122, 4, 5166);
    			attr_dev(h25, "class", "svelte-1elxcz1");
    			add_location(h25, file$2, 137, 8, 6218);
    			attr_dev(h312, "class", "svelte-1elxcz1");
    			add_location(h312, file$2, 139, 12, 6281);
    			add_location(p12, file$2, 140, 12, 6315);
    			add_location(p13, file$2, 141, 12, 6364);
    			attr_dev(div13, "class", "resume-item svelte-1elxcz1");
    			add_location(div13, file$2, 138, 8, 6243);
    			attr_dev(section5, "class", "svelte-1elxcz1");
    			add_location(section5, file$2, 136, 4, 6200);
    			attr_dev(h26, "class", "svelte-1elxcz1");
    			add_location(h26, file$2, 146, 8, 6620);
    			attr_dev(h313, "class", "svelte-1elxcz1");
    			add_location(h313, file$2, 148, 12, 6682);
    			add_location(p14, file$2, 149, 12, 6746);
    			attr_dev(div14, "class", "resume-item svelte-1elxcz1");
    			add_location(div14, file$2, 147, 8, 6644);
    			attr_dev(section6, "class", "svelte-1elxcz1");
    			add_location(section6, file$2, 145, 4, 6602);
    			attr_dev(h27, "class", "svelte-1elxcz1");
    			add_location(h27, file$2, 154, 8, 6850);
    			attr_dev(h314, "class", "svelte-1elxcz1");
    			add_location(h314, file$2, 156, 12, 6917);
    			add_location(p15, file$2, 157, 12, 6964);
    			attr_dev(div15, "class", "resume-item svelte-1elxcz1");
    			add_location(div15, file$2, 155, 8, 6879);
    			attr_dev(h315, "class", "svelte-1elxcz1");
    			add_location(h315, file$2, 160, 12, 7050);
    			add_location(p16, file$2, 161, 12, 7120);
    			attr_dev(li34, "class", "svelte-1elxcz1");
    			add_location(li34, file$2, 163, 16, 7200);
    			attr_dev(li35, "class", "svelte-1elxcz1");
    			add_location(li35, file$2, 164, 16, 7281);
    			attr_dev(ul8, "class", "svelte-1elxcz1");
    			add_location(ul8, file$2, 162, 12, 7179);
    			attr_dev(div16, "class", "resume-item svelte-1elxcz1");
    			add_location(div16, file$2, 159, 8, 7012);
    			attr_dev(section7, "class", "svelte-1elxcz1");
    			add_location(section7, file$2, 153, 4, 6832);
    			attr_dev(h28, "class", "svelte-1elxcz1");
    			add_location(h28, file$2, 170, 8, 7447);
    			attr_dev(h316, "class", "svelte-1elxcz1");
    			add_location(h316, file$2, 172, 12, 7534);
    			add_location(p17, file$2, 173, 12, 7565);
    			add_location(p18, file$2, 174, 12, 7647);
    			attr_dev(div17, "class", "resume-item svelte-1elxcz1");
    			add_location(div17, file$2, 171, 8, 7496);
    			attr_dev(h317, "class", "svelte-1elxcz1");
    			add_location(h317, file$2, 177, 12, 7801);
    			add_location(p19, file$2, 178, 12, 7832);
    			add_location(p20, file$2, 179, 12, 7926);
    			attr_dev(div18, "class", "resume-item svelte-1elxcz1");
    			add_location(div18, file$2, 176, 8, 7763);
    			attr_dev(h318, "class", "svelte-1elxcz1");
    			add_location(h318, file$2, 182, 12, 8102);
    			add_location(p21, file$2, 183, 12, 8133);
    			add_location(p22, file$2, 184, 12, 8221);
    			attr_dev(div19, "class", "resume-item svelte-1elxcz1");
    			add_location(div19, file$2, 181, 8, 8064);
    			attr_dev(section8, "class", "svelte-1elxcz1");
    			add_location(section8, file$2, 169, 4, 7429);
    			attr_dev(div20, "class", "resume-container svelte-1elxcz1");
    			add_location(div20, file$2, 12, 0, 296);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			append_dev(document.head, meta0);
    			append_dev(document.head, meta1);
    			append_dev(document.head, link);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div20, anchor);
    			append_dev(div20, h1);
    			append_dev(div20, t2);
    			append_dev(div20, section0);
    			append_dev(section0, h20);
    			append_dev(section0, t4);
    			append_dev(section0, div0);
    			append_dev(div0, h30);
    			append_dev(div0, t6);
    			append_dev(div0, p0);
    			append_dev(section0, t8);
    			append_dev(section0, div1);
    			append_dev(div1, h31);
    			append_dev(div1, t10);
    			append_dev(div1, p1);
    			append_dev(div20, t12);
    			append_dev(div20, section1);
    			append_dev(section1, h21);
    			append_dev(section1, t14);
    			append_dev(section1, div6);
    			append_dev(div6, div2);
    			append_dev(div2, h32);
    			append_dev(div2, t16);
    			append_dev(div2, ul0);
    			append_dev(ul0, li0);
    			append_dev(ul0, t18);
    			append_dev(ul0, li1);
    			append_dev(ul0, t20);
    			append_dev(ul0, li2);
    			append_dev(ul0, t22);
    			append_dev(ul0, li3);
    			append_dev(ul0, t24);
    			append_dev(ul0, li4);
    			append_dev(div6, t26);
    			append_dev(div6, div3);
    			append_dev(div3, h33);
    			append_dev(div3, t28);
    			append_dev(div3, ul1);
    			append_dev(ul1, li5);
    			append_dev(ul1, t30);
    			append_dev(ul1, li6);
    			append_dev(ul1, t32);
    			append_dev(ul1, li7);
    			append_dev(ul1, t34);
    			append_dev(ul1, li8);
    			append_dev(ul1, t36);
    			append_dev(ul1, li9);
    			append_dev(div6, t38);
    			append_dev(div6, div4);
    			append_dev(div4, h34);
    			append_dev(div4, t40);
    			append_dev(div4, ul2);
    			append_dev(ul2, li10);
    			append_dev(ul2, t42);
    			append_dev(ul2, li11);
    			append_dev(ul2, t44);
    			append_dev(ul2, li12);
    			append_dev(ul2, t46);
    			append_dev(ul2, li13);
    			append_dev(ul2, t48);
    			append_dev(ul2, li14);
    			append_dev(ul2, t50);
    			append_dev(ul2, li15);
    			append_dev(ul2, t52);
    			append_dev(ul2, li16);
    			append_dev(div6, t54);
    			append_dev(div6, div5);
    			append_dev(div5, h35);
    			append_dev(div5, t56);
    			append_dev(div5, ul3);
    			append_dev(ul3, li17);
    			append_dev(ul3, t58);
    			append_dev(ul3, li18);
    			append_dev(ul3, t60);
    			append_dev(ul3, li19);
    			append_dev(ul3, t62);
    			append_dev(ul3, li20);
    			append_dev(ul3, t64);
    			append_dev(ul3, li21);
    			append_dev(div20, t66);
    			append_dev(div20, section2);
    			append_dev(section2, h22);
    			append_dev(section2, t68);
    			append_dev(section2, div7);
    			append_dev(div7, h36);
    			append_dev(div7, t70);
    			append_dev(div7, p2);
    			append_dev(div7, t72);
    			append_dev(div7, ul4);
    			append_dev(ul4, li22);
    			append_dev(ul4, t74);
    			append_dev(ul4, li23);
    			append_dev(ul4, t76);
    			append_dev(ul4, li24);
    			append_dev(section2, t78);
    			append_dev(section2, div8);
    			append_dev(div8, h37);
    			append_dev(div8, t80);
    			append_dev(div8, p3);
    			append_dev(div8, t82);
    			append_dev(div8, ul5);
    			append_dev(ul5, li25);
    			append_dev(ul5, t84);
    			append_dev(ul5, li26);
    			append_dev(ul5, t86);
    			append_dev(ul5, li27);
    			append_dev(section2, t88);
    			append_dev(section2, div9);
    			append_dev(div9, h38);
    			append_dev(div9, t90);
    			append_dev(div9, p4);
    			append_dev(div9, t92);
    			append_dev(div9, p5);
    			append_dev(div9, t94);
    			append_dev(div9, ul6);
    			append_dev(ul6, li28);
    			append_dev(ul6, t96);
    			append_dev(ul6, li29);
    			append_dev(ul6, t98);
    			append_dev(ul6, li30);
    			append_dev(ul6, t100);
    			append_dev(ul6, li31);
    			append_dev(div20, t102);
    			append_dev(div20, section3);
    			append_dev(section3, h23);
    			append_dev(section3, t104);
    			append_dev(section3, div10);
    			append_dev(div10, h39);
    			append_dev(div10, t106);
    			append_dev(div10, p6);
    			append_dev(div10, t108);
    			append_dev(div10, p7);
    			append_dev(div10, t110);
    			append_dev(div10, ul7);
    			append_dev(ul7, li32);
    			append_dev(ul7, t112);
    			append_dev(ul7, li33);
    			append_dev(div20, t114);
    			append_dev(div20, section4);
    			append_dev(section4, h24);
    			append_dev(section4, t116);
    			append_dev(section4, div11);
    			append_dev(div11, h310);
    			append_dev(div11, t118);
    			append_dev(div11, p8);
    			append_dev(div11, t120);
    			append_dev(div11, p9);
    			append_dev(section4, t122);
    			append_dev(section4, div12);
    			append_dev(div12, h311);
    			append_dev(div12, t124);
    			append_dev(div12, p10);
    			append_dev(div12, t126);
    			append_dev(div12, p11);
    			append_dev(div20, t128);
    			append_dev(div20, section5);
    			append_dev(section5, h25);
    			append_dev(section5, t130);
    			append_dev(section5, div13);
    			append_dev(div13, h312);
    			append_dev(div13, t132);
    			append_dev(div13, p12);
    			append_dev(div13, t134);
    			append_dev(div13, p13);
    			append_dev(div20, t136);
    			append_dev(div20, section6);
    			append_dev(section6, h26);
    			append_dev(section6, t138);
    			append_dev(section6, div14);
    			append_dev(div14, h313);
    			append_dev(div14, t140);
    			append_dev(div14, p14);
    			append_dev(div20, t142);
    			append_dev(div20, section7);
    			append_dev(section7, h27);
    			append_dev(section7, t144);
    			append_dev(section7, div15);
    			append_dev(div15, h314);
    			append_dev(div15, t146);
    			append_dev(div15, p15);
    			append_dev(section7, t148);
    			append_dev(section7, div16);
    			append_dev(div16, h315);
    			append_dev(div16, t150);
    			append_dev(div16, p16);
    			append_dev(div16, t152);
    			append_dev(div16, ul8);
    			append_dev(ul8, li34);
    			append_dev(ul8, t154);
    			append_dev(ul8, li35);
    			append_dev(div20, t156);
    			append_dev(div20, section8);
    			append_dev(section8, h28);
    			append_dev(section8, t158);
    			append_dev(section8, div17);
    			append_dev(div17, h316);
    			append_dev(div17, t160);
    			append_dev(div17, p17);
    			append_dev(div17, t162);
    			append_dev(div17, p18);
    			append_dev(section8, t164);
    			append_dev(section8, div18);
    			append_dev(div18, h317);
    			append_dev(div18, t166);
    			append_dev(div18, p19);
    			append_dev(div18, t168);
    			append_dev(div18, p20);
    			append_dev(section8, t170);
    			append_dev(section8, div19);
    			append_dev(div19, h318);
    			append_dev(div19, t172);
    			append_dev(div19, p21);
    			append_dev(div19, t174);
    			append_dev(div19, p22);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			detach_dev(meta0);
    			detach_dev(meta1);
    			detach_dev(link);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div20);
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

    function instance$2($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Resume', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Resume> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Resume extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Resume",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src/recommend.svelte generated by Svelte v3.59.2 */
    const file$1 = "src/recommend.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[0] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[3] = list[i];
    	return child_ctx;
    }

    // (20:12) {#each [{name: 'Vessi', link: 'https://vessi.com/'}, {name: 'Lume', link: 'https://lumedeodorant.com/'}, {name: 'Hairstory', link: 'https://hairstory.com/'}, {name: 'Ridge', link: 'https://ridge.com/'}, {name: 'Sundays', link: 'https://sundaysfordogs.com/'}, {name: 'SugarBunnyShop', link: 'https://www.sugarbunnyshop.com'}] as product}
    function create_each_block_1(ctx) {
    	let div;
    	let h3;
    	let t0_value = /*product*/ ctx[3].name + "";
    	let t0;
    	let t1;
    	let a;
    	let t3;

    	const block = {
    		c: function create() {
    			div = element("div");
    			h3 = element("h3");
    			t0 = text(t0_value);
    			t1 = space();
    			a = element("a");
    			a.textContent = "Visit Website";
    			t3 = space();
    			add_location(h3, file$1, 21, 20, 1062);
    			attr_dev(a, "href", /*product*/ ctx[3].link);
    			attr_dev(a, "target", "_blank");
    			attr_dev(a, "rel", "noopener noreferrer");
    			attr_dev(a, "class", "recommendation-link svelte-brk3b5");
    			add_location(a, file$1, 22, 20, 1106);
    			attr_dev(div, "class", "recommendation-card svelte-brk3b5");
    			add_location(div, file$1, 20, 16, 1008);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h3);
    			append_dev(h3, t0);
    			append_dev(div, t1);
    			append_dev(div, a);
    			append_dev(div, t3);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(20:12) {#each [{name: 'Vessi', link: 'https://vessi.com/'}, {name: 'Lume', link: 'https://lumedeodorant.com/'}, {name: 'Hairstory', link: 'https://hairstory.com/'}, {name: 'Ridge', link: 'https://ridge.com/'}, {name: 'Sundays', link: 'https://sundaysfordogs.com/'}, {name: 'SugarBunnyShop', link: 'https://www.sugarbunnyshop.com'}] as product}",
    		ctx
    	});

    	return block;
    }

    // (37:20) {:else}
    function create_else_block(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "Available on YouTube and most podcast platforms";
    			add_location(p, file$1, 37, 24, 2141);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(37:20) {:else}",
    		ctx
    	});

    	return block;
    }

    // (35:20) {#if media.link}
    function create_if_block$1(ctx) {
    	let a;

    	const block = {
    		c: function create() {
    			a = element("a");
    			a.textContent = "Visit Website";
    			attr_dev(a, "href", /*media*/ ctx[0].link);
    			attr_dev(a, "target", "_blank");
    			attr_dev(a, "rel", "noopener noreferrer");
    			attr_dev(a, "class", "recommendation-link svelte-brk3b5");
    			add_location(a, file$1, 35, 24, 1980);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(35:20) {#if media.link}",
    		ctx
    	});

    	return block;
    }

    // (32:12) {#each [{name: 'Dropout', link: 'https://www.dropout.tv/'}, {name: 'Not Another D&D Podcast', link: 'https://naddpod.com/'},{name: 'Fool & Scholar Productions', link: 'https://foolandscholar.com/'}, {name: 'The NoSleep Podcast', link: 'https://www.thenosleeppodcast.com/'}, {name: 'Rusty Quill', link: 'https://rustyquill.com/'}, {name: 'The Philip DeFranco Show', link: 'https://www.youtube.com/@PhilipDeFranco'}] as media}
    function create_each_block(ctx) {
    	let div;
    	let h3;
    	let t0_value = /*media*/ ctx[0].name + "";
    	let t0;
    	let t1;
    	let t2;

    	function select_block_type(ctx, dirty) {
    		if (/*media*/ ctx[0].link) return create_if_block$1;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			h3 = element("h3");
    			t0 = text(t0_value);
    			t1 = space();
    			if_block.c();
    			t2 = space();
    			add_location(h3, file$1, 33, 20, 1897);
    			attr_dev(div, "class", "recommendation-card svelte-brk3b5");
    			add_location(div, file$1, 32, 16, 1843);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h3);
    			append_dev(h3, t0);
    			append_dev(div, t1);
    			if_block.m(div, null);
    			append_dev(div, t2);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(32:12) {#each [{name: 'Dropout', link: 'https://www.dropout.tv/'}, {name: 'Not Another D&D Podcast', link: 'https://naddpod.com/'},{name: 'Fool & Scholar Productions', link: 'https://foolandscholar.com/'}, {name: 'The NoSleep Podcast', link: 'https://www.thenosleeppodcast.com/'}, {name: 'Rusty Quill', link: 'https://rustyquill.com/'}, {name: 'The Philip DeFranco Show', link: 'https://www.youtube.com/@PhilipDeFranco'}] as media}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let meta0;
    	let meta1;
    	let link;
    	let t0;
    	let div2;
    	let h1;
    	let t2;
    	let p;
    	let t4;
    	let section0;
    	let h20;
    	let t6;
    	let div0;
    	let t7;
    	let section1;
    	let h21;
    	let t9;
    	let div1;

    	let each_value_1 = [
    		{
    			name: 'Vessi',
    			link: 'https://vessi.com/'
    		},
    		{
    			name: 'Lume',
    			link: 'https://lumedeodorant.com/'
    		},
    		{
    			name: 'Hairstory',
    			link: 'https://hairstory.com/'
    		},
    		{
    			name: 'Ridge',
    			link: 'https://ridge.com/'
    		},
    		{
    			name: 'Sundays',
    			link: 'https://sundaysfordogs.com/'
    		},
    		{
    			name: 'SugarBunnyShop',
    			link: 'https://www.sugarbunnyshop.com'
    		}
    	];

    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < 6; i += 1) {
    		each_blocks_1[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	let each_value = [
    		{
    			name: 'Dropout',
    			link: 'https://www.dropout.tv/'
    		},
    		{
    			name: 'Not Another D&D Podcast',
    			link: 'https://naddpod.com/'
    		},
    		{
    			name: 'Fool & Scholar Productions',
    			link: 'https://foolandscholar.com/'
    		},
    		{
    			name: 'The NoSleep Podcast',
    			link: 'https://www.thenosleeppodcast.com/'
    		},
    		{
    			name: 'Rusty Quill',
    			link: 'https://rustyquill.com/'
    		},
    		{
    			name: 'The Philip DeFranco Show',
    			link: 'https://www.youtube.com/@PhilipDeFranco'
    		}
    	];

    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < 6; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			meta0 = element("meta");
    			meta1 = element("meta");
    			link = element("link");
    			t0 = space();
    			div2 = element("div");
    			h1 = element("h1");
    			h1.textContent = "My Recommendations";
    			t2 = space();
    			p = element("p");
    			p.textContent = "Note: These recommendations are not sponsored. I'm sharing products and media that I personally use and enjoy.";
    			t4 = space();
    			section0 = element("section");
    			h20 = element("h2");
    			h20.textContent = "Products I Highly Recommend";
    			t6 = space();
    			div0 = element("div");

    			for (let i = 0; i < 6; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t7 = space();
    			section1 = element("section");
    			h21 = element("h2");
    			h21.textContent = "Media Recommendations";
    			t9 = space();
    			div1 = element("div");

    			for (let i = 0; i < 6; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(meta0, "charset", "utf-8");
    			add_location(meta0, file$1, 6, 4, 97);
    			attr_dev(meta1, "name", "viewport");
    			attr_dev(meta1, "content", "width=device-width,initial-scale=1");
    			add_location(meta1, file$1, 7, 4, 124);
    			document.title = "ABA's Recommendations - Not Sponsored";
    			attr_dev(link, "rel", "icon");
    			attr_dev(link, "type", "image/png");
    			attr_dev(link, "href", "/favicon.png");
    			add_location(link, file$1, 9, 4, 253);
    			attr_dev(h1, "class", "svelte-brk3b5");
    			add_location(h1, file$1, 13, 4, 368);
    			attr_dev(p, "class", "disclaimer svelte-brk3b5");
    			add_location(p, file$1, 14, 4, 400);
    			attr_dev(h20, "class", "svelte-brk3b5");
    			add_location(h20, file$1, 17, 8, 564);
    			attr_dev(div0, "class", "recommendation-grid svelte-brk3b5");
    			add_location(div0, file$1, 18, 8, 609);
    			attr_dev(section0, "class", "svelte-brk3b5");
    			add_location(section0, file$1, 16, 4, 546);
    			attr_dev(h21, "class", "svelte-brk3b5");
    			add_location(h21, file$1, 29, 8, 1317);
    			attr_dev(div1, "class", "recommendation-grid svelte-brk3b5");
    			add_location(div1, file$1, 30, 8, 1356);
    			attr_dev(section1, "class", "svelte-brk3b5");
    			add_location(section1, file$1, 28, 4, 1299);
    			attr_dev(div2, "class", "recommendations-container svelte-brk3b5");
    			add_location(div2, file$1, 12, 0, 324);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			append_dev(document.head, meta0);
    			append_dev(document.head, meta1);
    			append_dev(document.head, link);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div2, anchor);
    			append_dev(div2, h1);
    			append_dev(div2, t2);
    			append_dev(div2, p);
    			append_dev(div2, t4);
    			append_dev(div2, section0);
    			append_dev(section0, h20);
    			append_dev(section0, t6);
    			append_dev(section0, div0);

    			for (let i = 0; i < 6; i += 1) {
    				if (each_blocks_1[i]) {
    					each_blocks_1[i].m(div0, null);
    				}
    			}

    			append_dev(div2, t7);
    			append_dev(div2, section1);
    			append_dev(section1, h21);
    			append_dev(section1, t9);
    			append_dev(section1, div1);

    			for (let i = 0; i < 6; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(div1, null);
    				}
    			}
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			detach_dev(meta0);
    			detach_dev(meta1);
    			detach_dev(link);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div2);
    			destroy_each(each_blocks_1, detaching);
    			destroy_each(each_blocks, detaching);
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

    function instance$1($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Recommend', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Recommend> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Recommend extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Recommend",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.59.2 */
    const file = "src/App.svelte";

    // (36:36) 
    function create_if_block_4(ctx) {
    	let resume;
    	let current;
    	resume = new Resume({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(resume.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(resume, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(resume.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(resume.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(resume, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(36:36) ",
    		ctx
    	});

    	return block;
    }

    // (34:39) 
    function create_if_block_3(ctx) {
    	let recommend;
    	let current;
    	recommend = new Recommend({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(recommend.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(recommend, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(recommend.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(recommend.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(recommend, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(34:39) ",
    		ctx
    	});

    	return block;
    }

    // (32:38) 
    function create_if_block_2(ctx) {
    	let projects;
    	let current;
    	projects = new Projects({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(projects.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(projects, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(projects.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(projects.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(projects, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(32:38) ",
    		ctx
    	});

    	return block;
    }

    // (30:37) 
    function create_if_block_1(ctx) {
    	let aboutme;
    	let current;
    	aboutme = new Aboutme({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(aboutme.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(aboutme, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(aboutme.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(aboutme.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(aboutme, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(30:37) ",
    		ctx
    	});

    	return block;
    }

    // (28:4) {#if currentPage === "Home"}
    function create_if_block(ctx) {
    	let home;
    	let current;
    	home = new Home({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(home.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(home, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(home.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(home.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(home, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(28:4) {#if currentPage === \\\"Home\\\"}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let nav;
    	let ul;
    	let li0;
    	let a0;
    	let t1;
    	let li1;
    	let a1;
    	let t3;
    	let li2;
    	let a2;
    	let t5;
    	let li3;
    	let a3;
    	let t7;
    	let li4;
    	let a4;
    	let t9;
    	let main;
    	let current_block_type_index;
    	let if_block;
    	let current;
    	let mounted;
    	let dispose;

    	const if_block_creators = [
    		create_if_block,
    		create_if_block_1,
    		create_if_block_2,
    		create_if_block_3,
    		create_if_block_4
    	];

    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*currentPage*/ ctx[0] === "Home") return 0;
    		if (/*currentPage*/ ctx[0] === "Aboutme") return 1;
    		if (/*currentPage*/ ctx[0] === "Projects") return 2;
    		if (/*currentPage*/ ctx[0] === "Recommend") return 3;
    		if (/*currentPage*/ ctx[0] === "Resume") return 4;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type(ctx))) {
    		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	const block = {
    		c: function create() {
    			nav = element("nav");
    			ul = element("ul");
    			li0 = element("li");
    			a0 = element("a");
    			a0.textContent = "Home";
    			t1 = space();
    			li1 = element("li");
    			a1 = element("a");
    			a1.textContent = "About Me";
    			t3 = space();
    			li2 = element("li");
    			a2 = element("a");
    			a2.textContent = "Projects";
    			t5 = space();
    			li3 = element("li");
    			a3 = element("a");
    			a3.textContent = "Recommend";
    			t7 = space();
    			li4 = element("li");
    			a4 = element("a");
    			a4.textContent = "Resume";
    			t9 = space();
    			main = element("main");
    			if (if_block) if_block.c();
    			attr_dev(a0, "href", "#/");
    			attr_dev(a0, "class", "svelte-1lk98v3");
    			toggle_class(a0, "active", /*currentPage*/ ctx[0] === 'Home');
    			add_location(a0, file, 18, 12, 474);
    			add_location(li0, file, 18, 8, 470);
    			attr_dev(a1, "href", "#/aboutme");
    			attr_dev(a1, "class", "svelte-1lk98v3");
    			toggle_class(a1, "active", /*currentPage*/ ctx[0] === 'Aboutme');
    			add_location(a1, file, 19, 12, 587);
    			add_location(li1, file, 19, 8, 583);
    			attr_dev(a2, "href", "#/projects");
    			attr_dev(a2, "class", "svelte-1lk98v3");
    			toggle_class(a2, "active", /*currentPage*/ ctx[0] === 'Projects');
    			add_location(a2, file, 20, 12, 717);
    			add_location(li2, file, 20, 8, 713);
    			attr_dev(a3, "href", "#/recommend");
    			attr_dev(a3, "class", "svelte-1lk98v3");
    			toggle_class(a3, "active", /*currentPage*/ ctx[0] === 'Recommend');
    			add_location(a3, file, 21, 12, 850);
    			add_location(li3, file, 21, 8, 846);
    			attr_dev(a4, "href", "#/resume");
    			attr_dev(a4, "class", "svelte-1lk98v3");
    			toggle_class(a4, "active", /*currentPage*/ ctx[0] === 'Resume');
    			add_location(a4, file, 22, 6, 981);
    			add_location(li4, file, 22, 2, 977);
    			add_location(ul, file, 17, 4, 457);
    			attr_dev(nav, "class", "svelte-1lk98v3");
    			add_location(nav, file, 16, 0, 447);
    			add_location(main, file, 26, 0, 1112);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, nav, anchor);
    			append_dev(nav, ul);
    			append_dev(ul, li0);
    			append_dev(li0, a0);
    			append_dev(ul, t1);
    			append_dev(ul, li1);
    			append_dev(li1, a1);
    			append_dev(ul, t3);
    			append_dev(ul, li2);
    			append_dev(li2, a2);
    			append_dev(ul, t5);
    			append_dev(ul, li3);
    			append_dev(li3, a3);
    			append_dev(ul, t7);
    			append_dev(ul, li4);
    			append_dev(li4, a4);
    			insert_dev(target, t9, anchor);
    			insert_dev(target, main, anchor);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(main, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(a0, "click", /*click_handler*/ ctx[2], false, false, false, false),
    					listen_dev(a1, "click", /*click_handler_1*/ ctx[3], false, false, false, false),
    					listen_dev(a2, "click", /*click_handler_2*/ ctx[4], false, false, false, false),
    					listen_dev(a3, "click", /*click_handler_3*/ ctx[5], false, false, false, false),
    					listen_dev(a4, "click", /*click_handler_4*/ ctx[6], false, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*currentPage*/ 1) {
    				toggle_class(a0, "active", /*currentPage*/ ctx[0] === 'Home');
    			}

    			if (!current || dirty & /*currentPage*/ 1) {
    				toggle_class(a1, "active", /*currentPage*/ ctx[0] === 'Aboutme');
    			}

    			if (!current || dirty & /*currentPage*/ 1) {
    				toggle_class(a2, "active", /*currentPage*/ ctx[0] === 'Projects');
    			}

    			if (!current || dirty & /*currentPage*/ 1) {
    				toggle_class(a3, "active", /*currentPage*/ ctx[0] === 'Recommend');
    			}

    			if (!current || dirty & /*currentPage*/ 1) {
    				toggle_class(a4, "active", /*currentPage*/ ctx[0] === 'Resume');
    			}

    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index !== previous_block_index) {
    				if (if_block) {
    					group_outros();

    					transition_out(if_blocks[previous_block_index], 1, 1, () => {
    						if_blocks[previous_block_index] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index) {
    					if_block = if_blocks[current_block_type_index];

    					if (!if_block) {
    						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block.c();
    					}

    					transition_in(if_block, 1);
    					if_block.m(main, null);
    				} else {
    					if_block = null;
    				}
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
    			if (detaching) detach_dev(nav);
    			if (detaching) detach_dev(t9);
    			if (detaching) detach_dev(main);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d();
    			}

    			mounted = false;
    			run_all(dispose);
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
    	let currentPage = "Home";

    	// Added function for navigation -- was unsure of how to do this, looked up with ChatGPT
    	function navigate(page) {
    		$$invalidate(0, currentPage = page);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => navigate('Home');
    	const click_handler_1 = () => navigate('Aboutme');
    	const click_handler_2 = () => navigate('Projects');
    	const click_handler_3 = () => navigate('Recommend');
    	const click_handler_4 = () => navigate('Resume');

    	$$self.$capture_state = () => ({
    		Home,
    		Aboutme,
    		Projects,
    		Resume,
    		Recommend,
    		currentPage,
    		navigate
    	});

    	$$self.$inject_state = $$props => {
    		if ('currentPage' in $$props) $$invalidate(0, currentPage = $$props.currentPage);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		currentPage,
    		navigate,
    		click_handler,
    		click_handler_1,
    		click_handler_2,
    		click_handler_3,
    		click_handler_4
    	];
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
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
