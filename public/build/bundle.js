
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
    	let link;
    	let t0;
    	let div;
    	let h1;
    	let t2;
    	let p;
    	let t3;
    	let a0;
    	let t5;
    	let a1;
    	let t7;

    	const block = {
    		c: function create() {
    			meta0 = element("meta");
    			meta1 = element("meta");
    			link = element("link");
    			t0 = space();
    			div = element("div");
    			h1 = element("h1");
    			h1.textContent = "Hello, Homepage";
    			t2 = space();
    			p = element("p");
    			t3 = text("Hello! My name is Alexandra B Allard and this is my website. I've been casually studying computer science and programming for some time, please feel free to connect with me on ");
    			a0 = element("a");
    			a0.textContent = "LinkedIn";
    			t5 = text(" or check out my coding projects on ");
    			a1 = element("a");
    			a1.textContent = "GitHub";
    			t7 = text(".");
    			attr_dev(meta0, "charset", "utf-8");
    			add_location(meta0, file$5, 6, 1, 89);
    			attr_dev(meta1, "name", "viewport");
    			attr_dev(meta1, "content", "width=device-width,initial-scale=1");
    			add_location(meta1, file$5, 7, 1, 113);
    			document.title = "ABA's Homepage";
    			attr_dev(link, "rel", "icon");
    			attr_dev(link, "type", "image/png");
    			attr_dev(link, "href", "/favicon.png");
    			add_location(link, file$5, 11, 1, 215);
    			add_location(h1, file$5, 15, 1, 293);
    			attr_dev(a0, "href", "https://www.linkedin.com/in/aallard1/");
    			add_location(a0, file$5, 16, 180, 498);
    			attr_dev(a1, "href", "https://github.com/stackwonderflow");
    			add_location(a1, file$5, 16, 276, 594);
    			add_location(p, file$5, 16, 1, 319);
    			add_location(div, file$5, 14, 0, 286);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			append_dev(document.head, meta0);
    			append_dev(document.head, meta1);
    			append_dev(document.head, link);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div, anchor);
    			append_dev(div, h1);
    			append_dev(div, t2);
    			append_dev(div, p);
    			append_dev(p, t3);
    			append_dev(p, a0);
    			append_dev(p, t5);
    			append_dev(p, a1);
    			append_dev(p, t7);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			detach_dev(meta0);
    			detach_dev(meta1);
    			detach_dev(link);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div);
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
    	let div;
    	let h1;
    	let t2;
    	let p;
    	let t3;
    	let a;
    	let t5;

    	const block = {
    		c: function create() {
    			meta0 = element("meta");
    			meta1 = element("meta");
    			link = element("link");
    			t0 = space();
    			div = element("div");
    			h1 = element("h1");
    			h1.textContent = "About Me";
    			t2 = space();
    			p = element("p");
    			t3 = text("I'm just a female human person who enjoys a variety of activities, including hiking, swimming, reading, video-gaming, solving puzzles, learning new things, and coding. If you'd like to connect with me on ");
    			a = element("a");
    			a.textContent = "LinkedIn";
    			t5 = text(", feel free to do so! I'm always looking to make connections with people who have similar interests.");
    			attr_dev(meta0, "charset", "utf-8");
    			add_location(meta0, file$4, 6, 1, 92);
    			attr_dev(meta1, "name", "viewport");
    			attr_dev(meta1, "content", "width=device-width,initial-scale=1");
    			add_location(meta1, file$4, 7, 1, 116);
    			document.title = "About Me";
    			attr_dev(link, "rel", "icon");
    			attr_dev(link, "type", "image/png");
    			attr_dev(link, "href", "/favicon.png");
    			add_location(link, file$4, 11, 1, 212);
    			add_location(h1, file$4, 15, 4, 293);
    			attr_dev(a, "href", "https://www.linkedin.com/in/aallard1/");
    			add_location(a, file$4, 16, 211, 522);
    			add_location(p, file$4, 16, 4, 315);
    			add_location(div, file$4, 14, 0, 283);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			append_dev(document.head, meta0);
    			append_dev(document.head, meta1);
    			append_dev(document.head, link);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div, anchor);
    			append_dev(div, h1);
    			append_dev(div, t2);
    			append_dev(div, p);
    			append_dev(p, t3);
    			append_dev(p, a);
    			append_dev(p, t5);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			detach_dev(meta0);
    			detach_dev(meta1);
    			detach_dev(link);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div);
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
    	let div;
    	let h1;
    	let t2;
    	let h20;
    	let t4;
    	let p0;
    	let t5;
    	let br0;
    	let t6;
    	let a0;
    	let t8;
    	let h21;
    	let t10;
    	let p1;
    	let t11;
    	let br1;
    	let t12;
    	let a1;
    	let t14;
    	let h22;
    	let t16;
    	let p2;
    	let t17;
    	let br2;
    	let t18;
    	let a2;
    	let t20;
    	let br3;
    	let t21;
    	let a3;
    	let t23;
    	let br4;
    	let t24;
    	let a4;

    	const block = {
    		c: function create() {
    			meta0 = element("meta");
    			meta1 = element("meta");
    			link = element("link");
    			t0 = space();
    			div = element("div");
    			h1 = element("h1");
    			h1.textContent = "Projects";
    			t2 = space();
    			h20 = element("h2");
    			h20.textContent = "Undergroundv2";
    			t4 = space();
    			p0 = element("p");
    			t5 = text("This was my initial idea for a final project for CS50. It is the second version of Underground, a console based game written in Python that I initially made for Code In Place 2021. I thought that I would improve upon it and make it into a flask based web app. But in the end, I decided that this used too much of my old work and I was spending too much time on it. This new version is better than the original, and has some bug fixes that escaped my notice in the original. ");
    			br0 = element("br");
    			t6 = space();
    			a0 = element("a");
    			a0.textContent = "Undergroundv2";
    			t8 = space();
    			h21 = element("h2");
    			h21.textContent = "ConsoleArcade";
    			t10 = space();
    			p1 = element("p");
    			t11 = text("This is a project I worked on with a friend (it can be found on their github page, I am only a contributor) for coding practice. It is a series of console based games written in Python. It includes hangman, tic-tac-toe, and several other simple games with ASCII visuals. ");
    			br1 = element("br");
    			t12 = space();
    			a1 = element("a");
    			a1.textContent = "Console Arcade";
    			t14 = space();
    			h22 = element("h2");
    			h22.textContent = "Underground";
    			t16 = space();
    			p2 = element("p");
    			t17 = text("This is my final project for Code In Place 2021, which was the first coding course I took part in live with other students. It is a console based game written in Python. It is a simple adventure game where the player fights progressively stronger enemies until they run out of health and die. It is the first coding project I made that I was truly proud of. ");
    			br2 = element("br");
    			t18 = space();
    			a2 = element("a");
    			a2.textContent = "Project Showcase";
    			t20 = space();
    			br3 = element("br");
    			t21 = space();
    			a3 = element("a");
    			a3.textContent = "My Project";
    			t23 = space();
    			br4 = element("br");
    			t24 = space();
    			a4 = element("a");
    			a4.textContent = "Underground";
    			attr_dev(meta0, "charset", "utf-8");
    			add_location(meta0, file$3, 6, 1, 93);
    			attr_dev(meta1, "name", "viewport");
    			attr_dev(meta1, "content", "width=device-width,initial-scale=1");
    			add_location(meta1, file$3, 7, 1, 117);
    			document.title = "ABA's Projects";
    			attr_dev(link, "rel", "icon");
    			attr_dev(link, "type", "image/png");
    			attr_dev(link, "href", "/favicon.png");
    			add_location(link, file$3, 11, 1, 219);
    			add_location(h1, file$3, 15, 4, 300);
    			add_location(h20, file$3, 16, 4, 322);
    			add_location(br0, file$3, 17, 481, 826);
    			attr_dev(a0, "href", "https://github.com/stackwonderflow/Undergroundv2");
    			add_location(a0, file$3, 17, 486, 831);
    			add_location(p0, file$3, 17, 4, 349);
    			add_location(h21, file$3, 18, 4, 916);
    			add_location(br1, file$3, 19, 278, 1217);
    			attr_dev(a1, "href", "https://github.com/eantablin/ConsoleArcade");
    			add_location(a1, file$3, 19, 283, 1222);
    			add_location(p1, file$3, 19, 4, 943);
    			add_location(h22, file$3, 20, 4, 1302);
    			add_location(br2, file$3, 21, 365, 1688);
    			attr_dev(a2, "href", "https://codeinplace-2021.netlify.app/2021/showcase/");
    			add_location(a2, file$3, 21, 370, 1693);
    			add_location(br3, file$3, 21, 453, 1776);
    			attr_dev(a3, "href", "https://codeinplace-2021.netlify.app/2021/showcase/1340");
    			add_location(a3, file$3, 21, 458, 1781);
    			add_location(br4, file$3, 21, 539, 1862);
    			attr_dev(a4, "href", "https://github.com/stackwonderflow/Underground");
    			add_location(a4, file$3, 21, 544, 1867);
    			add_location(p2, file$3, 21, 4, 1327);
    			add_location(div, file$3, 14, 0, 290);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			append_dev(document.head, meta0);
    			append_dev(document.head, meta1);
    			append_dev(document.head, link);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div, anchor);
    			append_dev(div, h1);
    			append_dev(div, t2);
    			append_dev(div, h20);
    			append_dev(div, t4);
    			append_dev(div, p0);
    			append_dev(p0, t5);
    			append_dev(p0, br0);
    			append_dev(p0, t6);
    			append_dev(p0, a0);
    			append_dev(div, t8);
    			append_dev(div, h21);
    			append_dev(div, t10);
    			append_dev(div, p1);
    			append_dev(p1, t11);
    			append_dev(p1, br1);
    			append_dev(p1, t12);
    			append_dev(p1, a1);
    			append_dev(div, t14);
    			append_dev(div, h22);
    			append_dev(div, t16);
    			append_dev(div, p2);
    			append_dev(p2, t17);
    			append_dev(p2, br2);
    			append_dev(p2, t18);
    			append_dev(p2, a2);
    			append_dev(p2, t20);
    			append_dev(p2, br3);
    			append_dev(p2, t21);
    			append_dev(p2, a3);
    			append_dev(p2, t23);
    			append_dev(p2, br4);
    			append_dev(p2, t24);
    			append_dev(p2, a4);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			detach_dev(meta0);
    			detach_dev(meta1);
    			detach_dev(link);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div);
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
    	let div;
    	let h1;
    	let t2;
    	let h20;
    	let t4;
    	let p0;
    	let t5;
    	let br0;
    	let t6;
    	let t7;
    	let p1;
    	let t8;
    	let br1;
    	let t9;
    	let t10;
    	let h21;
    	let t12;
    	let h30;
    	let t14;
    	let p2;
    	let t16;
    	let h31;
    	let t18;
    	let p3;
    	let t20;
    	let h32;
    	let t22;
    	let p4;
    	let t24;
    	let h33;
    	let t26;
    	let p5;
    	let t28;
    	let h22;
    	let t30;
    	let p6;
    	let b0;
    	let t32;
    	let br2;
    	let t33;
    	let t34;
    	let p7;
    	let t36;
    	let p8;
    	let t38;
    	let h23;
    	let t40;
    	let p9;
    	let b1;
    	let t42;
    	let t43;
    	let p10;
    	let t45;
    	let p11;
    	let t47;
    	let p12;
    	let t48;
    	let br3;
    	let t49;
    	let p13;
    	let b2;
    	let t51;
    	let t52;
    	let p14;
    	let t54;
    	let p15;
    	let t56;
    	let p16;
    	let t57;
    	let br4;
    	let t58;
    	let p17;
    	let b3;
    	let t60;
    	let br5;
    	let t61;
    	let t62;
    	let p18;
    	let t64;
    	let p19;
    	let t66;
    	let p20;
    	let t68;
    	let p21;
    	let t70;
    	let h24;
    	let t72;
    	let p22;
    	let t74;
    	let h25;
    	let t76;
    	let p23;
    	let t78;
    	let p24;
    	let b4;
    	let t80;
    	let t81;
    	let p25;
    	let t83;
    	let p26;
    	let t85;
    	let h26;
    	let t87;
    	let p27;
    	let b5;
    	let t89;
    	let t90;
    	let p28;
    	let t92;
    	let h27;
    	let t94;
    	let p29;
    	let b6;
    	let t96;
    	let t97;
    	let p30;
    	let t99;
    	let p31;
    	let b7;
    	let t101;
    	let t102;
    	let p32;
    	let t104;
    	let p33;
    	let b8;
    	let t106;
    	let t107;
    	let p34;
    	let t109;
    	let h28;
    	let t111;
    	let p35;
    	let b9;
    	let t113;
    	let t114;
    	let p36;
    	let t115;
    	let br6;
    	let t116;
    	let p37;
    	let b10;
    	let t118;
    	let t119;
    	let p38;

    	const block = {
    		c: function create() {
    			meta0 = element("meta");
    			meta1 = element("meta");
    			link = element("link");
    			t0 = space();
    			div = element("div");
    			h1 = element("h1");
    			h1.textContent = "Resume";
    			t2 = space();
    			h20 = element("h2");
    			h20.textContent = "Education";
    			t4 = space();
    			p0 = element("p");
    			t5 = text("Florida Institute of Technology (FIT), Melbourne, FL 2017-2018");
    			br0 = element("br");
    			t6 = text(" B.S., Biochemistry (Chemistry Focus)");
    			t7 = space();
    			p1 = element("p");
    			t8 = text("Eastern Florida State College (EFSC), Melbourne, FL -2016");
    			br1 = element("br");
    			t9 = text(" A.A.");
    			t10 = space();
    			h21 = element("h2");
    			h21.textContent = "Skills";
    			t12 = space();
    			h30 = element("h3");
    			h30.textContent = "Programming Languages";
    			t14 = space();
    			p2 = element("p");
    			p2.textContent = "Python, C, SQL, HTML, CSS";
    			t16 = space();
    			h31 = element("h3");
    			h31.textContent = "Programming Tools";
    			t18 = space();
    			p3 = element("p");
    			p3.textContent = "Git, Github, VSCode, PostgreSQL, SQLite3";
    			t20 = space();
    			h32 = element("h3");
    			h32.textContent = "Laboratory Skills & Equipment";
    			t22 = space();
    			p4 = element("p");
    			p4.textContent = "FPLC, HPLC, AKTA Explorer, Hewlett-Packard Agilent HPLC, Gator Label-Free Analysis, Expi293F Cells, SDS-PAGE";
    			t24 = space();
    			h33 = element("h3");
    			h33.textContent = "Laboratory Techniques";
    			t26 = space();
    			p5 = element("p");
    			p5.textContent = "Suspension cell culture, Bacterial transfection & transformation, Aseptic technique, Petrifilm plating & Spread plating, Clean Room protocols";
    			t28 = space();
    			h22 = element("h2");
    			h22.textContent = "Research Experience";
    			t30 = space();
    			p6 = element("p");
    			b0 = element("b");
    			b0.textContent = "Research Assistant";
    			t32 = text(", FIT, Melbourne, FL Aug 2017-Dec 2018 ");
    			br2 = element("br");
    			t33 = text(" Dr. Norito Takenaka's Lab");
    			t34 = space();
    			p7 = element("p");
    			p7.textContent = "Synthesized Lewis Base catalyst through column chromatography and other lab techniques for production of value added products.";
    			t36 = space();
    			p8 = element("p");
    			p8.textContent = "Developed artificial enzymes for use in catalytic reaction, demonstrating catalyst's utility in production of pharmaceutical compounds.";
    			t38 = space();
    			h23 = element("h2");
    			h23.textContent = "Work Experience";
    			t40 = space();
    			p9 = element("p");
    			b1 = element("b");
    			b1.textContent = "Junior Software Engineer";
    			t42 = text(", Private Client Jan 2024-Present");
    			t43 = space();
    			p10 = element("p");
    			p10.textContent = "Develop software and websites according to project manager's specifications, using various languages and web frameworks such as C, Python, SQLite3, HTML, CSS, Flask, and Svelte.";
    			t45 = space();
    			p11 = element("p");
    			p11.textContent = "Maintain and manage internal data lake, utilizing PostgreSQL and Python.";
    			t47 = space();
    			p12 = element("p");
    			t48 = text("Continuously expand knowledge by learning new languages and technologies to enhance client service.");
    			br3 = element("br");
    			t49 = space();
    			p13 = element("p");
    			b2 = element("b");
    			b2.textContent = "Microbiology Technician";
    			t51 = text(", Food Safety Net Services, Bentonville, AR Jun 2023-Jan 2024");
    			t52 = space();
    			p14 = element("p");
    			p14.textContent = "Prepared samples for testing to determine presence of indicator organisms and pathogens while utilizing aseptic technique";
    			t54 = space();
    			p15 = element("p");
    			p15.textContent = "Participated in quality control monitoring by taking incubator temperatures, inoculating control organisms, and running media controls";
    			t56 = space();
    			p16 = element("p");
    			t57 = text("Maintained laboratory condition, to include equipment, supplies, and kept accurate records throughout all procedures");
    			br4 = element("br");
    			t58 = space();
    			p17 = element("p");
    			b3 = element("b");
    			b3.textContent = "Assistant Scientist";
    			t60 = text(", Amberstone Biosciences, Irvine, CA Jan 2022-Sept 2022");
    			br5 = element("br");
    			t61 = text(" Protein Science Team");
    			t62 = space();
    			p18 = element("p");
    			p18.textContent = "Produced super-coiled plasmid DNA through plasmid purification of E. coli for use in transfections";
    			t64 = space();
    			p19 = element("p");
    			p19.textContent = "Obtained condition media for use in protein purification by maintaining, passaging, transfecting, and harvesting Expi293F cell cultures";
    			t66 = space();
    			p20 = element("p");
    			p20.textContent = "Produced 99% pure proteins by performing various types of purification procedures (Batch Purification, FPLC IMAC Nickel-NTA) successfully producing base product for further testing";
    			t68 = space();
    			p21 = element("p");
    			p21.textContent = "Ensured proper implementation of more recent one-step purification procedures by testing new protein purification techniques via experimentation (M1, Heparin Sepharose)";
    			t70 = space();
    			h24 = element("h2");
    			h24.textContent = "Awards";
    			t72 = space();
    			p22 = element("p");
    			p22.textContent = "Outstanding Two-Year College Student Award: ACS Orlando Section Dec 2015";
    			t74 = space();
    			h25 = element("h2");
    			h25.textContent = "Memberships";
    			t76 = space();
    			p23 = element("p");
    			p23.textContent = "Member, American Chemical Society 2017-2019";
    			t78 = space();
    			p24 = element("p");
    			b4 = element("b");
    			b4.textContent = "American Chemical Society Student Affiliates FIT";
    			t80 = text(", Melbourne, FL Jan 2017-Dec 2018");
    			t81 = space();
    			p25 = element("p");
    			p25.textContent = "Organized and volunteered at community outreach events.";
    			t83 = space();
    			p26 = element("p");
    			p26.textContent = "Attended and organized conferences with other ACS club branches from nearby colleges.";
    			t85 = space();
    			h26 = element("h2");
    			h26.textContent = "Posters";
    			t87 = space();
    			p27 = element("p");
    			b5 = element("b");
    			b5.textContent = "Takenaka Lab";
    			t89 = text(", FIT, Melbourne, FL April 2018");
    			t90 = space();
    			p28 = element("p");
    			p28.textContent = "Presented evidence proving viability of research catalyst as a green alternative to commonly used synthetic metal-based catalysts at Northrop Grumman Engineering & Science Student Design Showcase";
    			t92 = space();
    			h27 = element("h2");
    			h27.textContent = "Volunteer & Outreach Experience";
    			t94 = space();
    			p29 = element("p");
    			b6 = element("b");
    			b6.textContent = "Volunteer";
    			t96 = text(", FIT, ACS Student Affiliates, Tea Event, Melbourne, FL Aug 2018");
    			t97 = space();
    			p30 = element("p");
    			p30.textContent = "Demonstrated the color changing properties with varied pH of Butterfly Pea Flower Tea";
    			t99 = space();
    			p31 = element("p");
    			b7 = element("b");
    			b7.textContent = "Volunteer";
    			t101 = text(", ACS Student Affiliates, Halloween Slime Event, Melbourne, FL Oct 2018");
    			t102 = space();
    			p32 = element("p");
    			p32.textContent = "Community outreach event in which visitors made and played with their own polymers (various types of slime)";
    			t104 = space();
    			p33 = element("p");
    			b8 = element("b");
    			b8.textContent = "Volunteer";
    			t106 = text(", ACS Student Affiliates, Snow-globe Event, Melbourne, FL Dec 2017");
    			t107 = space();
    			p34 = element("p");
    			p34.textContent = "Community outreach event in which visitors customised their own snow-globes and learned about supersaturated solutions (used benzoic acid solutions)";
    			t109 = space();
    			h28 = element("h2");
    			h28.textContent = "Additional Education";
    			t111 = space();
    			p35 = element("p");
    			b9 = element("b");
    			b9.textContent = "CS50 2024";
    			t113 = text(", Harvard University, Cambridge, MA Expected Jul 2024");
    			t114 = space();
    			p36 = element("p");
    			t115 = text("CS50 is Harvard's introductory computer science course, offered online. It guides students through several coding languages and tools, including Scratch, C, Python, SQL, HTML, CSS, JavaScript, and Flask. The class culminates in a final project of the student's choice, allowing them to demonstrate their learning and explore new languages and technologies.");
    			br6 = element("br");
    			t116 = space();
    			p37 = element("p");
    			b10 = element("b");
    			b10.textContent = "Code In Place";
    			t118 = text(", Stanford University, Stanford, CA 2011");
    			t119 = space();
    			p38 = element("p");
    			p38.textContent = "Code In Place is a 5-week online introductory Python course based on material from the first half of Stanford’s introductory programming course, CS106A. The class culminates in a final project where students demonstrate their newly acquired skills. Final projects are showcased online.";
    			attr_dev(meta0, "charset", "utf-8");
    			add_location(meta0, file$2, 6, 1, 91);
    			attr_dev(meta1, "name", "viewport");
    			attr_dev(meta1, "content", "width=device-width,initial-scale=1");
    			add_location(meta1, file$2, 7, 1, 115);
    			document.title = "ABA's Resume";
    			attr_dev(link, "rel", "icon");
    			attr_dev(link, "type", "image/png");
    			attr_dev(link, "href", "/favicon.png");
    			add_location(link, file$2, 11, 1, 215);
    			add_location(h1, file$2, 15, 4, 296);
    			add_location(h20, file$2, 16, 4, 316);
    			add_location(br0, file$2, 17, 69, 404);
    			add_location(p0, file$2, 17, 4, 339);
    			add_location(br1, file$2, 18, 64, 514);
    			add_location(p1, file$2, 18, 4, 454);
    			add_location(h21, file$2, 19, 4, 532);
    			add_location(h30, file$2, 20, 4, 552);
    			add_location(p2, file$2, 21, 4, 587);
    			add_location(h31, file$2, 22, 4, 624);
    			add_location(p3, file$2, 23, 4, 655);
    			add_location(h32, file$2, 24, 4, 707);
    			add_location(p4, file$2, 25, 4, 750);
    			add_location(h33, file$2, 26, 4, 870);
    			add_location(p5, file$2, 27, 4, 905);
    			add_location(h22, file$2, 28, 4, 1058);
    			add_location(b0, file$2, 29, 7, 1094);
    			add_location(br2, file$2, 29, 71, 1158);
    			add_location(p6, file$2, 29, 4, 1091);
    			add_location(p7, file$2, 30, 4, 1197);
    			add_location(p8, file$2, 31, 4, 1335);
    			add_location(h23, file$2, 32, 4, 1482);
    			add_location(b1, file$2, 33, 7, 1514);
    			add_location(p9, file$2, 33, 4, 1511);
    			add_location(p10, file$2, 34, 4, 1587);
    			add_location(p11, file$2, 35, 4, 1776);
    			add_location(br3, file$2, 36, 106, 1962);
    			add_location(p12, file$2, 36, 4, 1860);
    			add_location(b2, file$2, 37, 7, 1978);
    			add_location(p13, file$2, 37, 4, 1975);
    			add_location(p14, file$2, 38, 4, 2078);
    			add_location(p15, file$2, 39, 4, 2211);
    			add_location(br4, file$2, 40, 123, 2476);
    			add_location(p16, file$2, 40, 4, 2357);
    			add_location(b3, file$2, 41, 7, 2492);
    			add_location(br5, file$2, 41, 88, 2573);
    			add_location(p17, file$2, 41, 4, 2489);
    			add_location(p18, file$2, 42, 4, 2607);
    			add_location(p19, file$2, 43, 4, 2717);
    			add_location(p20, file$2, 44, 4, 2864);
    			add_location(p21, file$2, 45, 4, 3056);
    			add_location(h24, file$2, 46, 4, 3236);
    			add_location(p22, file$2, 47, 4, 3256);
    			add_location(h25, file$2, 48, 4, 3340);
    			add_location(p23, file$2, 49, 4, 3365);
    			add_location(b4, file$2, 50, 7, 3423);
    			add_location(p24, file$2, 50, 4, 3420);
    			add_location(p25, file$2, 51, 4, 3520);
    			add_location(p26, file$2, 52, 4, 3587);
    			add_location(h26, file$2, 53, 4, 3684);
    			add_location(b5, file$2, 54, 7, 3708);
    			add_location(p27, file$2, 54, 4, 3705);
    			add_location(p28, file$2, 55, 4, 3767);
    			add_location(h27, file$2, 56, 4, 3974);
    			add_location(b6, file$2, 57, 7, 4022);
    			add_location(p29, file$2, 57, 4, 4019);
    			add_location(p30, file$2, 58, 4, 4111);
    			add_location(b7, file$2, 59, 7, 4211);
    			add_location(p31, file$2, 59, 4, 4208);
    			add_location(p32, file$2, 60, 4, 4307);
    			add_location(b8, file$2, 61, 7, 4429);
    			add_location(p33, file$2, 61, 4, 4426);
    			add_location(p34, file$2, 62, 4, 4520);
    			add_location(h28, file$2, 63, 4, 4680);
    			add_location(b9, file$2, 64, 7, 4717);
    			add_location(p35, file$2, 64, 4, 4714);
    			add_location(br6, file$2, 65, 363, 5154);
    			add_location(p36, file$2, 65, 4, 4795);
    			add_location(b10, file$2, 66, 7, 5170);
    			add_location(p37, file$2, 66, 4, 5167);
    			add_location(p38, file$2, 67, 4, 5239);
    			add_location(div, file$2, 14, 0, 286);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			append_dev(document.head, meta0);
    			append_dev(document.head, meta1);
    			append_dev(document.head, link);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div, anchor);
    			append_dev(div, h1);
    			append_dev(div, t2);
    			append_dev(div, h20);
    			append_dev(div, t4);
    			append_dev(div, p0);
    			append_dev(p0, t5);
    			append_dev(p0, br0);
    			append_dev(p0, t6);
    			append_dev(div, t7);
    			append_dev(div, p1);
    			append_dev(p1, t8);
    			append_dev(p1, br1);
    			append_dev(p1, t9);
    			append_dev(div, t10);
    			append_dev(div, h21);
    			append_dev(div, t12);
    			append_dev(div, h30);
    			append_dev(div, t14);
    			append_dev(div, p2);
    			append_dev(div, t16);
    			append_dev(div, h31);
    			append_dev(div, t18);
    			append_dev(div, p3);
    			append_dev(div, t20);
    			append_dev(div, h32);
    			append_dev(div, t22);
    			append_dev(div, p4);
    			append_dev(div, t24);
    			append_dev(div, h33);
    			append_dev(div, t26);
    			append_dev(div, p5);
    			append_dev(div, t28);
    			append_dev(div, h22);
    			append_dev(div, t30);
    			append_dev(div, p6);
    			append_dev(p6, b0);
    			append_dev(p6, t32);
    			append_dev(p6, br2);
    			append_dev(p6, t33);
    			append_dev(div, t34);
    			append_dev(div, p7);
    			append_dev(div, t36);
    			append_dev(div, p8);
    			append_dev(div, t38);
    			append_dev(div, h23);
    			append_dev(div, t40);
    			append_dev(div, p9);
    			append_dev(p9, b1);
    			append_dev(p9, t42);
    			append_dev(div, t43);
    			append_dev(div, p10);
    			append_dev(div, t45);
    			append_dev(div, p11);
    			append_dev(div, t47);
    			append_dev(div, p12);
    			append_dev(p12, t48);
    			append_dev(p12, br3);
    			append_dev(div, t49);
    			append_dev(div, p13);
    			append_dev(p13, b2);
    			append_dev(p13, t51);
    			append_dev(div, t52);
    			append_dev(div, p14);
    			append_dev(div, t54);
    			append_dev(div, p15);
    			append_dev(div, t56);
    			append_dev(div, p16);
    			append_dev(p16, t57);
    			append_dev(p16, br4);
    			append_dev(div, t58);
    			append_dev(div, p17);
    			append_dev(p17, b3);
    			append_dev(p17, t60);
    			append_dev(p17, br5);
    			append_dev(p17, t61);
    			append_dev(div, t62);
    			append_dev(div, p18);
    			append_dev(div, t64);
    			append_dev(div, p19);
    			append_dev(div, t66);
    			append_dev(div, p20);
    			append_dev(div, t68);
    			append_dev(div, p21);
    			append_dev(div, t70);
    			append_dev(div, h24);
    			append_dev(div, t72);
    			append_dev(div, p22);
    			append_dev(div, t74);
    			append_dev(div, h25);
    			append_dev(div, t76);
    			append_dev(div, p23);
    			append_dev(div, t78);
    			append_dev(div, p24);
    			append_dev(p24, b4);
    			append_dev(p24, t80);
    			append_dev(div, t81);
    			append_dev(div, p25);
    			append_dev(div, t83);
    			append_dev(div, p26);
    			append_dev(div, t85);
    			append_dev(div, h26);
    			append_dev(div, t87);
    			append_dev(div, p27);
    			append_dev(p27, b5);
    			append_dev(p27, t89);
    			append_dev(div, t90);
    			append_dev(div, p28);
    			append_dev(div, t92);
    			append_dev(div, h27);
    			append_dev(div, t94);
    			append_dev(div, p29);
    			append_dev(p29, b6);
    			append_dev(p29, t96);
    			append_dev(div, t97);
    			append_dev(div, p30);
    			append_dev(div, t99);
    			append_dev(div, p31);
    			append_dev(p31, b7);
    			append_dev(p31, t101);
    			append_dev(div, t102);
    			append_dev(div, p32);
    			append_dev(div, t104);
    			append_dev(div, p33);
    			append_dev(p33, b8);
    			append_dev(p33, t106);
    			append_dev(div, t107);
    			append_dev(div, p34);
    			append_dev(div, t109);
    			append_dev(div, h28);
    			append_dev(div, t111);
    			append_dev(div, p35);
    			append_dev(p35, b9);
    			append_dev(p35, t113);
    			append_dev(div, t114);
    			append_dev(div, p36);
    			append_dev(p36, t115);
    			append_dev(p36, br6);
    			append_dev(div, t116);
    			append_dev(div, p37);
    			append_dev(p37, b10);
    			append_dev(p37, t118);
    			append_dev(div, t119);
    			append_dev(div, p38);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			detach_dev(meta0);
    			detach_dev(meta1);
    			detach_dev(link);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div);
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

    function create_fragment$1(ctx) {
    	let meta0;
    	let meta1;
    	let link;
    	let t0;
    	let div0;
    	let h10;
    	let t2;
    	let h20;
    	let t4;
    	let p0;
    	let t5;
    	let a0;
    	let t7;
    	let h21;
    	let t9;
    	let p1;
    	let t10;
    	let a1;
    	let t12;
    	let h22;
    	let t14;
    	let p2;
    	let t15;
    	let a2;
    	let t17;
    	let h23;
    	let t19;
    	let p3;
    	let t20;
    	let a3;
    	let t22;
    	let h24;
    	let t24;
    	let p4;
    	let t25;
    	let a4;
    	let t27;
    	let div1;
    	let h11;
    	let t29;
    	let h25;
    	let t31;
    	let p5;
    	let t32;
    	let a5;
    	let t34;
    	let h26;
    	let t36;
    	let p6;
    	let t37;
    	let a6;
    	let t39;
    	let h27;
    	let t41;
    	let p7;
    	let t42;
    	let a7;
    	let t44;
    	let h28;
    	let t46;
    	let p8;
    	let t47;
    	let a8;
    	let t49;
    	let h29;
    	let t51;
    	let p9;
    	let t53;
    	let h3;
    	let t55;
    	let p10;

    	const block = {
    		c: function create() {
    			meta0 = element("meta");
    			meta1 = element("meta");
    			link = element("link");
    			t0 = space();
    			div0 = element("div");
    			h10 = element("h1");
    			h10.textContent = "Products I Highly Recommend";
    			t2 = space();
    			h20 = element("h2");
    			h20.textContent = "Vessi";
    			t4 = space();
    			p0 = element("p");
    			t5 = text("Here's why: I have used these shoes for years, and they are my go-to for everyday wear. Super comfy and machine washable, not to mention water proof! Vessi shoes come in a number of different colors and styles, so they have a shoe for almost every occasion. I will say, the lighter colored styles do get dirty easily. Also don't put them through the dryer, be patient and let them air dry! ");
    			a0 = element("a");
    			a0.textContent = "Vessi";
    			t7 = space();
    			h21 = element("h2");
    			h21.textContent = "Lume";
    			t9 = space();
    			p1 = element("p");
    			t10 = text("Here's why: Lume is deoderant that I have found to be effective and safe for my sensitive skin. I've used it for several years and do not plan to switch anytime soon. Lume also has several other products, including soaps and laundry products (I have not tried these). ");
    			a1 = element("a");
    			a1.textContent = "Lume";
    			t12 = space();
    			h22 = element("h2");
    			h22.textContent = "Hairstory";
    			t14 = space();
    			p2 = element("p");
    			t15 = text("Here's why: Hairstory is a haircare line that I really like. I use their New Wash, which is a replacement for traditional shampoo and conditioner. I don't need to wash my hair as often, and it seems healthier. The product is a bit pricey, but I find that I'm spending less because I'm using less product. ");
    			a2 = element("a");
    			a2.textContent = "Hairstory";
    			t17 = space();
    			h23 = element("h2");
    			h23.textContent = "Ridge";
    			t19 = space();
    			p3 = element("p");
    			t20 = text("Here's why: Ridge makes wallets, rings, and travel accesories with a minimalist design. Their wallets in particular are compact and easily fit in pants pockets. I frequently give Ridge wallets as gifts, and have used them myself. The Ridge products I have used have been of good quality and stand up to the test of time. ");
    			a3 = element("a");
    			a3.textContent = "Ridge";
    			t22 = space();
    			h24 = element("h2");
    			h24.textContent = "SugarBunnyShop";
    			t24 = space();
    			p4 = element("p");
    			t25 = text("Here's why: SugarBunnyShop has super cute art prints, clothing, and much more! I often gift these products, and have a collection of SugarBunnyShop t-shirts. This online shop usually has lovely holiday items as well, so I tend to check it out around Valentine's Day, Halloween, and X-mas. ");
    			a4 = element("a");
    			a4.textContent = "SugarBunnyShop";
    			t27 = space();
    			div1 = element("div");
    			h11 = element("h1");
    			h11.textContent = "Media Recommendations";
    			t29 = space();
    			h25 = element("h2");
    			h25.textContent = "Dropout";
    			t31 = space();
    			p5 = element("p");
    			t32 = text("Here's why: Dropout is a streaming service that has a lot of great comedic content. I started watching because I really enjoyed CollegeHumor content in the past. I really enjoy Game Changer, Make Some Noise, and Dimension 20. They have so many different shows, and I'd highly recommed trying a free trial (just be sure to cancel if you don't want to be charged). ");
    			a5 = element("a");
    			a5.textContent = "DROPOUT";
    			t34 = space();
    			h26 = element("h2");
    			h26.textContent = "Fool & Scholar Productions";
    			t36 = space();
    			p6 = element("p");
    			t37 = text("Here's why: Fool & Scholar produces a number of really interesting podcasts. I personally really enjoy The White Vault, Dark Dice, and Liberty. These are all fiction podcasts that I would classify as residing in the horror genre. ");
    			a6 = element("a");
    			a6.textContent = "Fool & Scholar Productions";
    			t39 = space();
    			h27 = element("h2");
    			h27.textContent = "The NoSleep Podcast";
    			t41 = space();
    			p7 = element("p");
    			t42 = text("Here's why: The NoSleep Podcast is my favorite horror podcast! This podcast has a huge collection of horror stories, there's something for everyone (assuming they like horror). True to the name, a number of them have kept me up at night. ");
    			a7 = element("a");
    			a7.textContent = "The NoSleep Podcast";
    			t44 = space();
    			h28 = element("h2");
    			h28.textContent = "Rusty Quill";
    			t46 = space();
    			p8 = element("p");
    			t47 = text("Here's why: Rusty Quill is a podcast network that has a number of entertaining shows. I really enjoy The Magnus Protocol (The Magnus Archives) and Rusty Quill Gaming. The Magnus Protocol is a bit spooky and monstery, and Rusty Quill Gaming is just plain entertaining to me. ");
    			a8 = element("a");
    			a8.textContent = "Rusty Quill";
    			t49 = space();
    			h29 = element("h2");
    			h29.textContent = "The Philip DeFranco Show";
    			t51 = space();
    			p9 = element("p");
    			p9.textContent = "Here's why: The Philip DeFranco Show is a YouTubeoutube show and podcast that I listen to regularly. It covers a variety of topics (sometimes very YouTube / content creator centric). I have found it to be a helpful way to stay generally informed without too much effort. You can find it on YouTube and most podcast platforms. Note: It's a good idea to use a variety of news sources to get different perspectives.";
    			t53 = space();
    			h3 = element("h3");
    			h3.textContent = "A Note";
    			t55 = space();
    			p10 = element("p");
    			p10.textContent = "I am not being compensated in any way for this, I'm just trying to share some things that I personally use and enjoy. This content is not sponsored.";
    			attr_dev(meta0, "charset", "utf-8");
    			add_location(meta0, file$1, 6, 1, 94);
    			attr_dev(meta1, "name", "viewport");
    			attr_dev(meta1, "content", "width=device-width,initial-scale=1");
    			add_location(meta1, file$1, 7, 1, 118);
    			document.title = "ABA's Recommendations - Not Sponsored";
    			attr_dev(link, "rel", "icon");
    			attr_dev(link, "type", "image/png");
    			attr_dev(link, "href", "/favicon.png");
    			add_location(link, file$1, 11, 1, 243);
    			add_location(h10, file$1, 15, 4, 324);
    			add_location(h20, file$1, 16, 4, 365);
    			attr_dev(a0, "href", "https://vessi.com/");
    			add_location(a0, file$1, 17, 397, 777);
    			add_location(p0, file$1, 17, 4, 384);
    			add_location(h21, file$1, 18, 4, 824);
    			attr_dev(a1, "href", "https://lumedeodorant.com/");
    			add_location(a1, file$1, 19, 275, 1113);
    			add_location(p1, file$1, 19, 4, 842);
    			add_location(h22, file$1, 20, 4, 1167);
    			attr_dev(a2, "href", "https://hairstory.com/");
    			add_location(a2, file$1, 21, 312, 1498);
    			add_location(p2, file$1, 21, 4, 1190);
    			add_location(h23, file$1, 22, 4, 1553);
    			attr_dev(a3, "href", "https://ridge.com/");
    			add_location(a3, file$1, 23, 328, 1896);
    			add_location(p3, file$1, 23, 4, 1572);
    			add_location(h24, file$1, 24, 4, 1943);
    			attr_dev(a4, "href", "https://www.sugarbunnyshop.com");
    			add_location(a4, file$1, 25, 296, 2263);
    			add_location(p4, file$1, 25, 4, 1971);
    			add_location(div0, file$1, 14, 0, 314);
    			add_location(h11, file$1, 29, 4, 2345);
    			add_location(h25, file$1, 30, 4, 2380);
    			attr_dev(a5, "href", "https://www.dropout.tv/");
    			add_location(a5, file$1, 31, 370, 2767);
    			add_location(p5, file$1, 31, 4, 2401);
    			add_location(h26, file$1, 32, 4, 2821);
    			attr_dev(a6, "href", "https://foolandscholar.com/");
    			add_location(a6, file$1, 33, 237, 3094);
    			add_location(p6, file$1, 33, 4, 2861);
    			add_location(h27, file$1, 34, 4, 3171);
    			attr_dev(a7, "href", "https://www.thenosleeppodcast.com/");
    			add_location(a7, file$1, 35, 245, 3445);
    			add_location(p7, file$1, 35, 4, 3204);
    			add_location(h28, file$1, 36, 4, 3522);
    			attr_dev(a8, "href", "https://rustyquill.com/");
    			add_location(a8, file$1, 37, 281, 3824);
    			add_location(p8, file$1, 37, 4, 3547);
    			add_location(h29, file$1, 38, 4, 3882);
    			add_location(p9, file$1, 39, 4, 3920);
    			add_location(h3, file$1, 40, 4, 4345);
    			add_location(p10, file$1, 41, 4, 4365);
    			add_location(div1, file$1, 28, 0, 2335);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			append_dev(document.head, meta0);
    			append_dev(document.head, meta1);
    			append_dev(document.head, link);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div0, anchor);
    			append_dev(div0, h10);
    			append_dev(div0, t2);
    			append_dev(div0, h20);
    			append_dev(div0, t4);
    			append_dev(div0, p0);
    			append_dev(p0, t5);
    			append_dev(p0, a0);
    			append_dev(div0, t7);
    			append_dev(div0, h21);
    			append_dev(div0, t9);
    			append_dev(div0, p1);
    			append_dev(p1, t10);
    			append_dev(p1, a1);
    			append_dev(div0, t12);
    			append_dev(div0, h22);
    			append_dev(div0, t14);
    			append_dev(div0, p2);
    			append_dev(p2, t15);
    			append_dev(p2, a2);
    			append_dev(div0, t17);
    			append_dev(div0, h23);
    			append_dev(div0, t19);
    			append_dev(div0, p3);
    			append_dev(p3, t20);
    			append_dev(p3, a3);
    			append_dev(div0, t22);
    			append_dev(div0, h24);
    			append_dev(div0, t24);
    			append_dev(div0, p4);
    			append_dev(p4, t25);
    			append_dev(p4, a4);
    			insert_dev(target, t27, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, h11);
    			append_dev(div1, t29);
    			append_dev(div1, h25);
    			append_dev(div1, t31);
    			append_dev(div1, p5);
    			append_dev(p5, t32);
    			append_dev(p5, a5);
    			append_dev(div1, t34);
    			append_dev(div1, h26);
    			append_dev(div1, t36);
    			append_dev(div1, p6);
    			append_dev(p6, t37);
    			append_dev(p6, a6);
    			append_dev(div1, t39);
    			append_dev(div1, h27);
    			append_dev(div1, t41);
    			append_dev(div1, p7);
    			append_dev(p7, t42);
    			append_dev(p7, a7);
    			append_dev(div1, t44);
    			append_dev(div1, h28);
    			append_dev(div1, t46);
    			append_dev(div1, p8);
    			append_dev(p8, t47);
    			append_dev(p8, a8);
    			append_dev(div1, t49);
    			append_dev(div1, h29);
    			append_dev(div1, t51);
    			append_dev(div1, p9);
    			append_dev(div1, t53);
    			append_dev(div1, h3);
    			append_dev(div1, t55);
    			append_dev(div1, p10);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			detach_dev(meta0);
    			detach_dev(meta1);
    			detach_dev(link);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t27);
    			if (detaching) detach_dev(div1);
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

    // (34:39) 
    function create_if_block_4(ctx) {
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
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(34:39) ",
    		ctx
    	});

    	return block;
    }

    // (32:36) 
    function create_if_block_3(ctx) {
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
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(32:36) ",
    		ctx
    	});

    	return block;
    }

    // (30:38) 
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
    		source: "(30:38) ",
    		ctx
    	});

    	return block;
    }

    // (28:37) 
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
    		source: "(28:37) ",
    		ctx
    	});

    	return block;
    }

    // (26:4) {#if currentPage === "Home"}
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
    		source: "(26:4) {#if currentPage === \\\"Home\\\"}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let nav;
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
    		if (/*currentPage*/ ctx[0] === "Resume") return 3;
    		if (/*currentPage*/ ctx[0] === "Recommend") return 4;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type(ctx))) {
    		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	const block = {
    		c: function create() {
    			nav = element("nav");
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
    			a3.textContent = "Resume";
    			t7 = space();
    			li4 = element("li");
    			a4 = element("a");
    			a4.textContent = "Recommend";
    			t9 = space();
    			main = element("main");
    			if (if_block) if_block.c();
    			attr_dev(a0, "href", "#/");
    			add_location(a0, file, 17, 5, 458);
    			add_location(li0, file, 17, 1, 454);
    			attr_dev(a1, "href", "#/aboutme");
    			add_location(a1, file, 18, 5, 526);
    			add_location(li1, file, 18, 1, 522);
    			attr_dev(a2, "href", "#/projects");
    			add_location(a2, file, 19, 5, 608);
    			add_location(li2, file, 19, 1, 604);
    			attr_dev(a3, "href", "#/resume");
    			add_location(a3, file, 20, 5, 692);
    			add_location(li3, file, 20, 1, 688);
    			attr_dev(a4, "href", "#/recommend");
    			add_location(a4, file, 21, 5, 770);
    			add_location(li4, file, 21, 1, 766);
    			add_location(nav, file, 16, 0, 447);
    			add_location(main, file, 24, 0, 860);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, nav, anchor);
    			append_dev(nav, li0);
    			append_dev(li0, a0);
    			append_dev(nav, t1);
    			append_dev(nav, li1);
    			append_dev(li1, a1);
    			append_dev(nav, t3);
    			append_dev(nav, li2);
    			append_dev(li2, a2);
    			append_dev(nav, t5);
    			append_dev(nav, li3);
    			append_dev(li3, a3);
    			append_dev(nav, t7);
    			append_dev(nav, li4);
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
    	const click_handler_3 = () => navigate('Resume');
    	const click_handler_4 = () => navigate('Recommend');

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
