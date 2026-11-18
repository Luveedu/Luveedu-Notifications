/* =======================================================================
   LUVEEDU NOTIFICATIONS - luvnotify.js (v1)
   Toast notifications for all Luveedu products.
   Pairs with: css/v1/luvnotify.css

   LOAD ORDER
     1. css/v1/luvnotify.css
     2. js/v1/luvnotify.js

   QUICK START
     LuvNotify.success('Saved successfully.');
     LuvNotify.error('Something went wrong.');
     LuvNotify.show({ type:'info', title:'API key', message:'...', showCopy:true });

   API
     LuvNotify.show(options)            -> id
     LuvNotify.success|error|warning|info|neutral|loading(message, options)
     LuvNotify.update(id, options)
     LuvNotify.dismiss(id)
     LuvNotify.dismissAll(position?)
     LuvNotify.configure(options)       global defaults
     LuvNotify.getConfig()
     LuvNotify.setSound(bool)
     LuvNotify.setPosition(position)
     LuvNotify.setTheme('auto'|'light'|'dark')
     LuvNotify.copy(text)               -> Promise<boolean>
     LuvNotify.playSound(type, volume)
   ======================================================================= */
(function (window, document) {
    'use strict';

    var VERSION = '1.0.0';

    var DEFAULTS = {
        type: 'info',
        title: '',
        message: '',
        html: false,
        duration: 4000,
        dismissible: true,
        showIcon: true,
        showCopy: false,
        copyText: null,
        copyLabel: 'Copy',
        position: 'top-right',
        animation: 'slide',
        sound: true,
        volume: 0.35,
        pauseOnHover: true,
        closeOnClick: false,
        maxVisible: 5,
        width: null,
        offset: 16,
        gap: 12,
        theme: 'auto',
        variant: 'soft',
        actions: null,
        onOpen: null,
        onClose: null,
        onCopy: null
    };

    var TYPES = { success: 1, error: 1, warning: 1, info: 1, neutral: 1, loading: 1 };
    var POSITIONS = {
        'top-right': 1, 'top-left': 1, 'top-center': 1,
        'bottom-right': 1, 'bottom-left': 1, 'bottom-center': 1
    };
    var ANIMATIONS = { slide: 1, fade: 1, scale: 1, bounce: 1 };
    var VARIANTS = { soft: 1, solid: 1, gradient: 1, outline: 1, minimal: 1 };

    var config = assign({}, DEFAULTS);
    var containers = {};
    var toasts = {};
    var seq = 0;

    /* -- Inline icons (no external dependency) ------------------------- */
    var ICONS = {
        success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>',
        error: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>',
        warning: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>',
        info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>',
        neutral: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.268 21a2 2 0 0 0 3.464 0"/><path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326"/></svg>',
        loading: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>',
        close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>',
        copy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>',
        check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>'
    };

    /* -- Helpers ------------------------------------------------------- */
    function assign(target) {
        for (var i = 1; i < arguments.length; i++) {
            var src = arguments[i];
            if (!src) continue;
            for (var k in src) {
                if (Object.prototype.hasOwnProperty.call(src, k)) target[k] = src[k];
            }
        }
        return target;
    }

    function el(tag, cls) {
        var node = document.createElement(tag);
        if (cls) node.className = cls;
        return node;
    }

    function uid() {
        seq += 1;
        return 'luvn-' + seq + '-' + Date.now().toString(36);
    }

    function resolveTheme(opt) {
        if (opt.theme === 'dark' || opt.theme === 'light') return opt.theme;
        var t = document.documentElement.getAttribute('data-theme');
        if (t !== 'dark' && t !== 'light' && document.body) {
            t = document.body.getAttribute('data-theme');
        }
        if (t === 'dark' || t === 'light') return t;
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
        return 'light';
    }

    function getContainer(pos, opt) {
        if (!containers[pos]) {
            var c = el('div', 'luvn-container');
            c.setAttribute('data-pos', pos);
            document.body.appendChild(c);
            containers[pos] = c;
        }
        var container = containers[pos];
        container.style.setProperty('--luvn-offset', (opt.offset != null ? opt.offset : 16) + 'px');
        container.style.setProperty('--luvn-gap', (opt.gap != null ? opt.gap : 12) + 'px');
        return container;
    }

    function fromVars(anim, pos) {
        var x = 0, y = 0, s = 1;
        if (anim === 'slide') {
            if (pos.indexOf('right') > -1) x = 32;
            else if (pos.indexOf('left') > -1) x = -32;
            else if (pos.indexOf('top') > -1) y = -24;
            else y = 24;
        } else if (anim === 'scale') {
            s = 0.9;
        }
        return { x: x, y: y, s: s };
    }

    /* -- Timers -------------------------------------------------------- */
    function startTimer(inst) {
        if (!inst.opt.duration || inst.opt.duration <= 0) return;
        inst.started = Date.now();
        inst.timer = setTimeout(function () { dismiss(inst.id); }, inst.remaining);
    }

    function pauseTimer(inst) {
        if (!inst.timer || inst.paused) return;
        clearTimeout(inst.timer);
        inst.timer = null;
        inst.paused = true;
        inst.remaining -= (Date.now() - inst.started);
        if (inst.remaining < 0) inst.remaining = 0;
    }

    function resumeTimer(inst) {
        if (!inst.paused) return;
        inst.paused = false;
        if (inst.remaining <= 0) { dismiss(inst.id); return; }
        inst.started = Date.now();
        inst.timer = setTimeout(function () { dismiss(inst.id); }, inst.remaining);
    }

    /* -- Show ---------------------------------------------------------- */
    function show(options) {
        var opt = assign({}, config, options || {});
        var type = TYPES[opt.type] ? opt.type : 'info';
        var pos = POSITIONS[opt.position] ? opt.position : 'top-right';
        var anim = ANIMATIONS[opt.animation] ? opt.animation : 'slide';
        var id = opt.id || uid();
        var container = getContainer(pos, opt);
        var theme = resolveTheme(opt);

        // Enforce maxVisible - drop the oldest toast in this stack.
        var live = container.querySelectorAll('.luvn-toast:not(.luvn-out)');
        if (opt.maxVisible > 0 && live.length >= opt.maxVisible) {
            var oldest = live[0];
            if (oldest && oldest.__luvn) dismiss(oldest.__luvn.id, true);
        }

        var variant = VARIANTS[opt.variant] ? opt.variant : 'soft';
        var toast = el('div', 'luvn-toast luvn-' + type + ' luvn-variant-' + variant + (theme === 'dark' ? ' luvn-dark' : ''));
        toast.setAttribute('data-anim', anim);
        toast.setAttribute('role', type === 'error' ? 'alert' : 'status');
        toast.setAttribute('aria-live', type === 'error' ? 'assertive' : 'polite');
        toast.setAttribute('aria-atomic', 'true');
        if (opt.width) {
            toast.style.setProperty('--luvn-width', typeof opt.width === 'number' ? opt.width + 'px' : opt.width);
        }

        var from = fromVars(anim, pos);
        toast.style.setProperty('--luvn-from-x', from.x + 'px');
        toast.style.setProperty('--luvn-from-y', from.y + 'px');
        toast.style.setProperty('--luvn-from-s', String(from.s));

        // Icon
        if (opt.showIcon) {
            var icon = el('div', 'luvn-icon');
            icon.innerHTML = ICONS[type] || ICONS.info;
            toast.appendChild(icon);
        }

        // Content
        var content = el('div', 'luvn-content');
        if (opt.title) {
            var title = el('p', 'luvn-title');
            title.textContent = opt.title;
            content.appendChild(title);
        }
        if (opt.message) {
            var msg = el('p', 'luvn-message');
            if (opt.html) msg.innerHTML = opt.message;
            else msg.textContent = opt.message;
            content.appendChild(msg);
        }
        if (opt.actions && opt.actions.length) {
            var acts = el('div', 'luvn-actions');
            opt.actions.forEach(function (a) {
                var b = el('button', 'luvn-action' + (a.variant ? ' luvn-action-' + a.variant : ''));
                b.type = 'button';
                b.textContent = a.label || 'Action';
                b.addEventListener('click', function (e) {
                    e.stopPropagation();
                    if (typeof a.onClick === 'function') a.onClick(e, id);
                    if (a.close !== false) dismiss(id);
                });
                acts.appendChild(b);
            });
            content.appendChild(acts);
        }
        toast.appendChild(content);

        // Controls
        var controls = el('div', 'luvn-controls');
        if (opt.showCopy) {
            var copyBtn = el('button', 'luvn-btn luvn-copy');
            copyBtn.type = 'button';
            copyBtn.setAttribute('aria-label', opt.copyLabel || 'Copy');
            copyBtn.setAttribute('title', opt.copyLabel || 'Copy');
            copyBtn.innerHTML = ICONS.copy;
            copyBtn.addEventListener('click', function (e) { e.stopPropagation(); doCopy(id); });
            controls.appendChild(copyBtn);
        }
        if (opt.dismissible) {
            var closeBtn = el('button', 'luvn-btn luvn-close');
            closeBtn.type = 'button';
            closeBtn.setAttribute('aria-label', 'Dismiss');
            closeBtn.setAttribute('title', 'Dismiss');
            closeBtn.innerHTML = ICONS.close;
            closeBtn.addEventListener('click', function (e) { e.stopPropagation(); dismiss(id); });
            controls.appendChild(closeBtn);
        }
        if (controls.childNodes.length) toast.appendChild(controls);

        container.appendChild(toast);

        var inst = {
            id: id,
            el: toast,
            opt: opt,
            type: type,
            pos: pos,
            timer: null,
            remaining: opt.duration,
            started: 0,
            paused: false,
            closed: false
        };
        toast.__luvn = inst;
        toasts[id] = inst;

        // Force reflow, then animate in.
        void toast.offsetWidth;
        toast.classList.add('luvn-in');

        if (opt.duration > 0) startTimer(inst);

        if (opt.pauseOnHover && opt.duration > 0) {
            toast.addEventListener('mouseenter', function () { pauseTimer(inst); });
            toast.addEventListener('mouseleave', function () { resumeTimer(inst); });
        }

        if (opt.closeOnClick) {
            toast.addEventListener('click', function (e) {
                var t = e.target;
                if (t && t.closest && t.closest('button, a')) return;
                dismiss(id);
            });
        }

        if (opt.sound) playSound(type, opt.volume);

        if (typeof opt.onOpen === 'function') opt.onOpen(id, toast);

        return id;
    }

    /* -- Dismiss ------------------------------------------------------- */
    function dismiss(id, immediate) {
        var inst = toasts[id];
        if (!inst || inst.closed) return false;
        inst.closed = true;

        if (inst.timer) { clearTimeout(inst.timer); inst.timer = null; }

        var toast = inst.el;
        toast.classList.remove('luvn-in');
        toast.classList.add('luvn-out');

        var removed = false;
        function finish() {
            if (removed) return;
            removed = true;
            if (toast.parentNode) toast.parentNode.removeChild(toast);
            delete toasts[id];
            if (typeof inst.opt.onClose === 'function') inst.opt.onClose(id);
        }

        if (immediate) { finish(); return true; }

        var fallback = setTimeout(finish, 550);
        toast.addEventListener('transitionend', function onEnd(e) {
            if (e.target !== toast || e.propertyName !== 'opacity') return;
            toast.removeEventListener('transitionend', onEnd);
            clearTimeout(fallback);
            finish();
        });
        return true;
    }

    function dismissAll(position) {
        Object.keys(toasts).forEach(function (id) {
            if (!position || toasts[id].pos === position) dismiss(id);
        });
    }

    /* -- Update -------------------------------------------------------- */
    function update(id, options) {
        var inst = toasts[id];
        if (!inst) return null;

        var opt = assign({}, inst.opt, options || {});
        inst.opt = opt;
        var toast = inst.el;

        if (options && options.type && TYPES[options.type]) {
            toast.classList.remove('luvn-success', 'luvn-error', 'luvn-warning', 'luvn-info', 'luvn-neutral', 'luvn-loading');
            toast.classList.add('luvn-' + options.type);
            toast.setAttribute('role', options.type === 'error' ? 'alert' : 'status');
            toast.setAttribute('aria-live', options.type === 'error' ? 'assertive' : 'polite');
            inst.type = options.type;
            var icon = toast.querySelector('.luvn-icon');
            if (icon) icon.innerHTML = ICONS[options.type] || ICONS.info;
        }

        if (options && options.variant && VARIANTS[options.variant]) {
            toast.classList.remove('luvn-variant-soft', 'luvn-variant-solid', 'luvn-variant-gradient', 'luvn-variant-outline', 'luvn-variant-minimal');
            toast.classList.add('luvn-variant-' + options.variant);
        }

        var content = toast.querySelector('.luvn-content');
        if (content) {
            if (options && options.title !== undefined) {
                var title = content.querySelector('.luvn-title');
                if (!title) {
                    title = el('p', 'luvn-title');
                    content.insertBefore(title, content.firstChild);
                }
                title.textContent = options.title;
            }
            if (options && options.message !== undefined) {
                var msg = content.querySelector('.luvn-message');
                if (!msg) {
                    msg = el('p', 'luvn-message');
                    content.appendChild(msg);
                }
                if (opt.html) msg.innerHTML = options.message;
                else msg.textContent = options.message;
            }
        }

        if (options && options.duration !== undefined) {
            if (inst.timer) { clearTimeout(inst.timer); inst.timer = null; }
            inst.remaining = options.duration;
            inst.paused = false;
            if (options.duration > 0) startTimer(inst);
        }

        return id;
    }

    /* -- Copy ---------------------------------------------------------- */
    function doCopy(id) {
        var inst = toasts[id];
        if (!inst) return;

        var text = inst.opt.copyText != null ? inst.opt.copyText : (inst.opt.message || inst.opt.title || '');
        if (inst.opt.html) {
            var tmp = document.createElement('div');
            tmp.innerHTML = text;
            text = tmp.textContent || tmp.innerText || '';
        }

        copyToClipboard(text).then(function (ok) {
            var btn = inst.el.querySelector('.luvn-copy');
            if (btn) {
                btn.classList.add('is-copied');
                btn.innerHTML = ICONS.check;
                setTimeout(function () {
                    if (!btn) return;
                    btn.classList.remove('is-copied');
                    btn.innerHTML = ICONS.copy;
                }, 1600);
            }
            if (typeof inst.opt.onCopy === 'function') inst.opt.onCopy(text, ok);
        });
    }

    function copyToClipboard(text) {
        return new Promise(function (resolve) {
            if (navigator.clipboard && window.isSecureContext) {
                navigator.clipboard.writeText(text).then(
                    function () { resolve(true); },
                    function () { resolve(fallbackCopy(text)); }
                );
            } else {
                resolve(fallbackCopy(text));
            }
        });
    }

    function fallbackCopy(text) {
        try {
            var ta = document.createElement('textarea');
            ta.value = text;
            ta.setAttribute('readonly', '');
            ta.style.position = 'fixed';
            ta.style.top = '-9999px';
            ta.style.opacity = '0';
            document.body.appendChild(ta);
            ta.select();
            ta.setSelectionRange(0, ta.value.length);
            var ok = document.execCommand('copy');
            document.body.removeChild(ta);
            return ok;
        } catch (e) {
            return false;
        }
    }

    /* -- Sound (Web Audio, no files) ----------------------------------- */
    var audioCtx = null;

    function getCtx() {
        if (audioCtx) {
            if (audioCtx.state === 'suspended') audioCtx.resume();
            return audioCtx;
        }
        var AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return null;
        try { audioCtx = new AC(); } catch (e) { return null; }
        return audioCtx;
    }

    function beep(ctx, freq, start, dur, wave, vol) {
        var osc = ctx.createOscillator();
        var gain = ctx.createGain();
        var t0 = ctx.currentTime + start;
        osc.type = wave || 'sine';
        osc.frequency.setValueAtTime(freq, t0);
        gain.gain.setValueAtTime(0.0001, t0);
        gain.gain.linearRampToValueAtTime(vol, t0 + 0.012);
        gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t0);
        osc.stop(t0 + dur + 0.02);
    }

    function playSound(type, volume) {
        var ctx = getCtx();
        if (!ctx) return;
        var v = Math.max(0, Math.min(1, volume == null ? 0.35 : volume)) * 0.5;
        if (v <= 0) return;

        if (type === 'success') {
            beep(ctx, 660, 0, 0.12, 'sine', v);
            beep(ctx, 880, 0.1, 0.16, 'sine', v);
        } else if (type === 'error') {
            beep(ctx, 240, 0, 0.16, 'square', v * 0.8);
            beep(ctx, 170, 0.12, 0.22, 'square', v * 0.8);
        } else if (type === 'warning') {
            beep(ctx, 520, 0, 0.1, 'triangle', v);
            beep(ctx, 520, 0.16, 0.12, 'triangle', v);
        } else if (type === 'info') {
            beep(ctx, 740, 0, 0.14, 'sine', v);
        } else if (type === 'neutral') {
            beep(ctx, 480, 0, 0.08, 'sine', v * 0.8);
        }
    }

    /* -- Public API ---------------------------------------------------- */
    function make(type) {
        return function (message, options) {
            var o = assign({}, options || {});
            o.type = type;
            if (message !== undefined) o.message = message;
            return show(o);
        };
    }

    var LuvNotify = {
        version: VERSION,
        show: show,
        success: make('success'),
        error: make('error'),
        warning: make('warning'),
        info: make('info'),
        neutral: make('neutral'),
        loading: function (message, options) {
            var o = assign({}, options || {});
            o.type = 'loading';
            if (message !== undefined) o.message = message;
            if (o.duration === undefined) o.duration = 0;
            return show(o);
        },
        update: update,
        dismiss: dismiss,
        dismissAll: dismissAll,
        configure: function (options) {
            assign(config, options || {});
            return assign({}, config);
        },
        getConfig: function () { return assign({}, config); },
        setSound: function (on) { config.sound = !!on; return config.sound; },
        setPosition: function (pos) { config.position = pos; return config.position; },
        setTheme: function (theme) { config.theme = theme; return config.theme; },
        setVariant: function (variant) { config.variant = variant; return config.variant; },
        copy: copyToClipboard,
        playSound: playSound
    };

    window.LuvNotify = window.luvnotify = LuvNotify;
})(window, document);
