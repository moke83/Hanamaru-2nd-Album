const
hi = console.log.bind(console, 'hi'),
Q	= (selector, root = document) => root.querySelector(selector),
QQ	= (selector, root = document) => root.querySelectorAll(selector),

int = (v, defaultValue = 0, min = 0, max = Infinity) => num(parseInt(v), defaultValue, min, max),
dbl = (v, defaultValue = 0.0, min = 0.0, max = Infinity) => num(parseFloat(v), defaultValue, min, max),
num = (v, defaultValue, min, max) => (Number.isNaN(v) ? (v = defaultValue) : v) <=  min ? min : v >= max ? max : v,
stringify = (v, defaultValue = ''+v) => typeof v === 'string' ? v : defaultValue,
arr = (v,...defaultElement) =>
	Array.isArray(v) ? v : defaultElement.length ? [ ...defaultElement ] : v === null || v === undefined ? [] : [ v ],
isObj = obj => obj && typeof obj === 'object' && obj,
obje = (obj, defaultValue = {}) => isObj(obj) || defaultValue,
objc = (obj, k,v = obj,defaultValue = { [k]: v }) =>
	isObj(obj) ? k in obj && obj[k] !== undefined && obj[k] !== null ? obj : (obj[k] = v, obj) : defaultValue,

// 等幅フォント時の文字幅を計算するために用いることを想定した関数。
// 文字列内の文字が ASCII の範囲内の場合 1、そうでない場合を 2 としてカウントして、その合計を返す。絵文字には非対応。
monoLength = str => {
	
	const rx = /^[\x00-\xFF]*$/;
	let i,l,l0;
	
	i = -1, l = str.length, l0 = 0;
	while (++i < l) l0 += rx.test(str[i]) ? 1 : 2;
	
	return l0;
	
},
deco = (content, contentL, contentR, contentPad, borderPattern, borderPad) => {
	const contentLength = monoLength(content) + monoLength(contentL) + monoLength(contentR),
			border = `${borderPattern.repeat(contentLength / monoLength(borderPattern))}${borderPad}`;
	return { border, content: `${contentL}${content}${contentPad.repeat(monoLength(border) - contentLength)}${contentR}` };
},
// content が表示される場所が console.log 上など、等幅フォントを採用していることを前提として、
// decoChr に指定した文字列で content を囲うことができるような文字列を値に指定したオブジェクトを返す。
// 戻り値のオブジェクトには、decoChr の指定に基づいて作成された囲い用の文字列 border と、
// それと同じ幅を持つ content がプロパティに指定される。より細かく指定したい場合は deco をそのまま使うことができる。
decolog = (content, decoChr) => deco(content, decoChr,decoChr,' ', `${decoChr} `, decoChr),

// uuid を生成
// https://qiita.com/psn/items/d7ac5bdb5b5633bae165
uid4	= () => {
	
	const UID4F = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx';
	
	let i = -1, id = '', c;
	
	while (c = UID4F[++i]) id +=	c === 'x' ? Math.floor(Math.random() * 16).toString(16) :
											c === 'y' ? (Math.floor(Math.random() * 4) + 8).toString(16) : c;
	
	return id;
	
},

defineCustomElements = (...customElementConstructors) => {
	
	const isTagName = /^[a-z](?:\-|\.|[0-9]|_|[a-z]|\u00B7|[\u00C0-\u00D6]|[\u00D8-\u00F6]|[\u00F8-\u037D]|[\u037F-\u1FFF]|[\u200C-\u200D]|[\u203F-\u2040]|[\u2070-\u218F]|[\u2C00-\u2FEF]|[\u3001-\uD7FF]|[\uF900-\uFDCF]|[\uFDF0-\uFFFD]|[\u10000-\uEFFFF])*-(?:\-|\.|[0-9]|_|[a-z]|\u00B7|[\u00C0-\u00D6]|[\u00D8-\u00F6]|[\u00F8-\u037D]|[\u037F-\u1FFF]|[\u200C-\u200D]|[\u203F-\u2040]|[\u2070-\u218F]|[\u2C00-\u2FEF]|[\u3001-\uD7FF]|[\uF900-\uFDCF]|[\uFDF0-\uFFFD]|[\u10000-\uEFFFF])*$/;
	let i, $;
	
	i = -1;
	while ($ = customElementConstructors[++i])
		typeof $.tagName === 'string' && isTagName.test($.tagName) && customElements.define($.tagName, $);
	
},

get = (obj, ...keys) =>	keys.length ? obj && typeof obj === 'object' && keys[0] in obj ?
									get(obj[keys[0]], ...(keys.shift(), keys)) : undefined : obj,
fromJSON = str => {
	let data;
	if (str && typeof str === 'object') return str;
	try { data = JSON.parse(str); } catch (error) { console.error(error); }
	return data;
},
toJSON = obj => {
	let data;
	if (!obj || typeof obj !== 'object') return obj;
	try { data = JSON.stringify(obj); } catch (error) { console.error(error); }
	return data || 'null';
};
// WebExtensions 用のユーティリティー
WX_META = (window.browser || browser) && browser.runtime.getManifest(),
WX_SHORT_NAME = WX_META && WX_META.short_name.toUpperCase(),

createLog = (self, label = WX_SHORT_NAME || '') => console.log.bind(console, `[${label}#${self}]`),
createOnMessage = (to, label = WX_SHORT_NAME || '') =>
	
	msg =>	msg.__MSG__ && (!msg.to || msg.to === to) &&
					(
						Array.isArray(msg.detail) ?	console.log(`[${label}@${msg.from}]`, ...msg.detail) :
																console.log(`[${label}@${msg.from}]`, msg.detail)
					),

createMsg = from => {
	return (detail, to) => {
		console.log(`#${from}`, `@${to}`, detail),
		browser.runtime.sendMessage({ from, to, detail, __MSG__: true });
	};
};

class ExtensionNode extends HTMLElement {
	
	constructor(option = {}) {
		
		super();
		
		let movedNodesInit;
		
		this.ac = new AbortController(),
		
		this.__observers = new Map(),
		
		this.bind((this.__ = this.constructor).spread(this, 'bound')),
		
		this.setOption(option),
		
		this.option.disableLog === true || this.setLogger(),
		
		this.ac.signal.addEventListener('abort', this.aborted, this.__.ABORT_EVENT_OPTION),
		addEventListener('set-log', this.setLog, false, true),
		
		(movedNodesInit = this.__.movedNodesObserverInit) && typeof movedNodesInit === 'object' &&
			(
				(movedNodesInit = structuredClone(movedNodesInit)).childList = true,
				(this.movedNodesObserver = new MutaionObserver(this.observedMovedNodes)).observe(this, movedNodesInit)
			),
		
		this.available = new Promise(rs => this.resolveSelf = rs);
		
	}
	
	setOption(option) {
		
		(!this.option || typeof this.option !== 'object' || Array.isArray(this.option)) && (this.option = {});
		
		return this.option && typeof this.option === 'object' && !Array.isArray(this.option) ?
			(this.option = { ...this.option, ...option }) : this.option;
		
	}
	
	bind(source, name, ...args) {
		
		let i,l,k;
		
		switch (typeof source) {
			
			case 'function':
			this[(!(k = source.name) || k === 'anonymous') ?  name || 'anonymous' : k] = source.bind(this, ...args);
			return;
			
			case 'object':
			if (Array.isArray(source)) {
				i = -1, l = source.length;
				while (++i < l) this.bind(source[i], `${(name || 'anonymous') + i}`, ...args);
			} else if (source) for (k in source) this.bind(source[k], k, ...args);
			return;
			
		}
		
	}
	
	addEvent(listeners = [ this ], type, handler, option = false, wantsUntrusted = true) {
		
		option = option && typeof option === 'object' ? { ...option } : { capture: !!option },
		(!option.signal || !(option.signal instanceof AbortSignal)) && (option.signal = this.ac.signal),
		
		this.touchEvent('add', listeners, type, handler, option, wantsUntrusted);
		
	}
	removeEvent(listeners = [ this ], type, handler, option = false) {
		
		this.touchEvent('remove', listeners, type, handler, option);
		
	}
	touchEvent(method, listeners, ...args) {
		
		let v;
		
		if (typeof EventTarget.prototype[method = `${typeof method === 'string' ? method : 'add'}EventListener`] !== 'function') return;
		
		listeners = new Set(Array.isArray(listeners) ? listeners : (listeners = [ listeners || this ]));
		for (v of listeners) v instanceof EventTarget && v[method](...args);
		
	}
	dispatch(name, detail = {}, listeners) {
		
		const composed = true;
		let v;
		
		listeners = new Set(Array.isArray(listeners) ? listeners : (listeners = [ listeners || this ])),
		detail && detail.constructor === Object && (detail.__target = this);
		
		for (v of listeners) v instanceof EventTarget && v.distpachEvent(new CustomEvent(name, { composed, detail }));
		
	}
	emit(type, detail, option) {
		
		type && typeof type === 'string' && (
				(!option || typeof option !== 'object') && (option = { composed: true }),
				detail && (option.detail = detail),
				this.dispatchEvent(new CustomEvent(type, option))
			);
		
	}
	abortEvents() {
		
		this.ac.abort();
		
	}
	
	observeMutation(callback, node, init) {
		
		let observer;
		
		(observer = this.__observers.get(callback)) ||
			(this.__observers.set(callback, observer = new MutationObserver(callback))),
		observer.observe(node, init);
		
	}
	disconnectMutationObserver(callback) {
		
		let observer;
		
		(observer = this.__observers.get(callback)) && observer.disconnect();
		
	}
	clearMutationObserver() {
		
		let observer;
		
		const ovservers = this.__observers.values();
		for (observer of ovservers) observer.disconnect();
		
		this.__observers.clear();
		
	}
	
	destroy(keepsElement = false) {
		
		keepsElement || this.parentElement && this.remove(),
		this.abortEvents(),
		this.clearMutationObserver(),
		keepsElement || (
			this.ac.signal.removeEventListener('abort', this.aborted),
			removeEventListener('set-log', this.setLog, false)
		),
		this.dispatchEvent(new CustomEvent('destroyed'));
		
	}
	
	q(selector) {
		return this.shadowRoot.querySelector(selector);
	}
	qq(selector) {
		return this.shadowRoot.querySelectorAll(selector);
	}
	querySelectorWhole(selector, root = this) {
		const inner = Array.from(QQ(selector, root)),
				shadow = root.qq ? Array.from(root.qq(selector)) : [];
		return root.matches(selector) ? [ root, ...inner, ...shadow ] : [ ...inner, ...shadow ];
	}
	
	isAncestor(element) {
		
		let ancestor = this;
		
		while (element !== ancestor && (ancestor = ancestor.parentElement));
		
		return !!ancestor;
		
	}
	isLineage(element) {
		return this.isAncestor(element) || this.contains(element);
	}
	
	get(...keys) {
		
		let i,l,k,that;
		
		i = -1, l = keys.length, that = this;
		while (++i < l) {
			switch (typeof (k = keys[i])) {
				 case 'string':
				 if (typeof that !== 'object') return;
				 that = that[k];
				 break;
				 case 'number':
				 if (!Array.isArray(that)) return;
				 that = that[k];
				 break;
				 case 'object':
				 if (k !== null) return;
				 that = window;
			}
		}
		
		return that;
		
	}
	
	logSwitch(enables) {
		
		this.log(`Logging is ${enables ? 'enabled' : 'disabled'}.`, this),
		
		dispatchEvent(new CustomEvent('set-log', { composed: true, detail: !enables }));
		
	}
	setLogger(prefix = this.option.loggerPrefix, disables) {
		
		this.log = (typeof disables === 'boolean' ? disables : ExtensionNode.GLOBAL_DISABLE_LOG_FLAG) ?
			() => {} : console.log.bind(console, `<${prefix ? `${prefix}@` : ''}${this.__.LOGGER_SUFFIX}>`);
		
	}
	
	resolve() {
		
		this.resolveSelf &&
			customElements.whenDefined(this.localName).then(() => (this.resolveSelf(this), delete this.resolveSelf));
		
	}
	
	static LOGGER_SUFFIX = 'EN';
	static tagName = 'extension-node';
	static ABORT_EVENT_OPTION = { once: true };
	static GLOBAL_DISABLE_LOG_FLAG = false;
	// 第一引数 data の再帰可能な記述子に基づいて構築した要素を第二引数 parent に指定された要素に追加する。
	// 戻り値は作成した要素の最上位の要素。data は記述子か配列に入れた記述子を指定できるため、
	// 配列の場合は要素、配列に入れた記述子の場合は配列に列挙された要素が返る。
	static construct(data, parent = this) {
		
		if (!data) return;
		
		let i,l,i0,k, child, contents,isStr;
		
		if (Array.isArray(data)) {
			
			const built = [];
			
			i = i0 = -1, l = data.length;
			while (++i < l) (elm = ExtensionNode.construct(data[i])) && (built[++i0] = elm);
			parent instanceof Node && parent.append(...built);
			
			return built;
			
		}
		
		typeof data === 'object' || (data = { tag: 'text', contents: data });
		
		if ((data.tag || (data.tag = 'div')) === 'text' || typeof data.tag !== 'string') {
			
			elm = document.createTextNode(data.contents);
			
		} else {
			
			elm = document.createElement(data.tag);
			
			if (isObj(data.attr)) for (k in data.attr) elm.setAttribute(k, data.attr[k]);
			if (isObj(data.style)) for (k in data.style) elm.style.setProperty(k, data.style[k]);
			
			data.children && ExtensionNode.construct(data.children, elm),
			
			i = -1, l = (Array.isArray(contents = data.contents) || (contents = [ contents ])).length;
			while (++i < l)
				elm[`insertAdjacent${(isStr = isObj(contents[i])) || contents[i].is !== 'text' ? 'HTML' : 'Text'}`]
					(isStr ? 'afterbegin' : contents[i].position || 'afterbegin', isStr ? contents[i] : contents[i].$);
			
		}
		
		parent instanceof Node && parent.appendChild(elm);
		
		return elm;
		
	};
	// 第一引数 records に指定された mutationRecords の中の各要素のプロパティ addedNodes, removedNodes を合成した Set を返す。
	// Set の中では、addedNodes と removedNodes の区別はされないが、それぞれの要素のプロパティ parentElement を参照し、
	// その有無を判定することで、その要素が新規に追加されたものか、削除されてドキュメントに属していないかは判別できる。
	static getMovedNodesFromMR(records) {
		
		let i, moved;
		
		i = 0, moved = new Set([ ...records[0].addedNodes, ...records[0].removedNodes ]);
		while (records[++i]) moved = new Set([ ...moved, ...records[i].addedNodes, ...records[i].removedNodes ]);
		
		return moved;
		
	}
	// from に与えたオブジェクトのプロパティ key に指定されている Object を、その prototype の祖先方向に遡ってすべて合成し、その Object を返す。
	// プロパティ key の値は Object でなければならず、そうでない場合はそのプロパティは合成されない。合成するプロパティが存在しなかった場合、空の Object が返る。
	static spread(from, key) {
		
		let $, spread;
		
		spread = {};
		while (from = Object.getPrototypeOf(from)) key in ($ = from.constructor) && ($ = $[key]) &&
			$.constructor === Object && (spread = { ...$, ...spread });
		
		return spread;
		
	}
	static bound = {
		
		aborted(event) {
			
			this.log(`The listeners of a node "${this.id}" are aborted.`, this.ac, this),
			
			// AbortController は一度 abort を実行すると、aborted フラグが戻らないようなので、
			// 実行後に signal が通知するイベント abort を捕捉して作り直す。このリスナーは once を設定しているため、一度の実行で自動的に削除される。
			(this.ac = new AbortController()).signal.addEventListener('abort', this.aborted, this.__.ABORT_EVENT_OPTION);
			
		},
		
		setLog(event) {
			
			this.setLogger(
					undefined,
					event.target === window ? ExtensionNode.GLOBAL_DISABLE_LOG_FLAG = event.detail : event.detail
				);
			
		},
		
		// 要素に追加、削除された子要素に対して、継承先で実装されたコールバック関数 addedChild, removedChild を実行する。
		// コールバック関数には、それぞれの該当する子要素を列挙した配列が引数に渡される。
		// このオブザーバーは、継承先にアクセサリー movedNodesObserverInit を設定することで作成される。
		// movedNodesObserverInit は mutationObserverInit と同等だが、childList が自動的に true で補完される。
		// 通常、コールバック関数の引数になるのは追加ないし削除された直下の子要素だけだが、
		// movedNodesObserverInit の subtree が真を示す時は子孫要素も対象になる。
		// また専用のプロパティ closest, selector にセレクターを意味する文字列を設定すると、
		// closest の場合は、追加された子要素、子孫要素に対して自身がそのセレクターに一致する場合、
		// matches の場合は、追加された子要素、子孫要素がそのセレクターに一致する場合のみ対象にする。
		observedMovedNodes(mrs) {
			
			const	movedNodes = ExtensionNode.getMovedNodesFromMR(mrs),
					{ subtree, closest, matches, addedChildren, removedChildren } = this.__.movedNodesObserverOptions,
					addedChild = typeof this.addedChild === 'function' && this.addedChild,
					removedChild = typeof this.removedChild === 'function' && this.removedChild;
			let ai,ri, movedNode;
			
			ai = ri = -1, addedChildren.length = removedChildren.length = 0;
			for (movedNode of movedNodes)
				(movedNode.parentElement === this || (subtree && this.contains(movedNode))) ?
					addedChild && (!closest || movedNode.closest(closest)) && (!matches || movedNode.matches(matches)) &&
						(addedChildren[++ai] = movedNode) :
					removedChild && (!closest || movedNode.closest(closest)) && (!matches || movedNode.matches(matches)) &&
						(removedChildren[++ri] = movedNode);
			
			addedChild && addedChild(addedChildren), removedChild && removedChild(removedChildren);
			
		}
		
	};
	static {
		
		const movedNodesObserverInit = this.__?.movedNodesObserverInit;
		
		this.movedNodesObserverOptions = {
			subtree: movedNodesObserverInit?.subtree,
			closest: typeof movedNodesObserverInit?.closest === 'string' && movedNodesObserverInit.closest,
			matches: typeof movedNodesObserverInit?.matches === 'string' && movedNodesObserverInit.matches,
			addedChildren: [],
			removedChildren: []
		};
		
	};
	//static movedNodesObserverInit = { childList: true, subtree: true, closest: true };
	
}

class CustomElement extends ExtensionNode {
	
	constructor(option) {
		
		super(option);
		
		const CNST = this.constructor;
		
		let i,i0,l, $, data;
		
		'tagName' in CNST && typeof CNST.tagName === 'string' &&
			(this.template = document.getElementById(CNST.tagName)) && this.template.tagName === 'TEMPLATE' &&
			(this.shadow = this.template.content.cloneNode(true), this.attachShadow(CNST.shadowRootInit).appendChild(this.shadow)),
		this.root = this.shadowRoot ?	(
													this.shadowRoot.firstElementChild.classList.add(CNST.tagName),
													this.shadowRoot.firstElementChild
												) :
												this;
		
		if (this.template) {
			
			// dataset.extends が示すクエリー文字列に一致する要素のクローンを shadowRoot に挿入する。
			// 要素が template の場合、そのプロパティ content を挿入する。
			// shadowRoot 内の要素 slot に対応する要素を shadowRoot 外からインポートする使い方を想定しているが、
			// それが求められるケースはほとんど存在しないと思われるため不要の可能性が強い。
		 	if (this.template.dataset.extends && this.shadowRoot) {
				
				i = -1, l = (data = CustomElement.parseDatasetValue(this.template, 'slots')).length;
				while (++i < l) {
					if (typeof data[i] !== 'string') continue;
					i0 = -1, $ = QQ(data[i]);
					while ($[++i0]) this.shadowRoot.appendChild
						($[i0].tagName === 'TEMPLATE' ? $[i0].cloneNode(true).content : $[i0].cloneNode(true));
				}
				
			}
			
			// 外部スタイルシートのファイルのパスを指定する。複数指定することもできる。その場合、JSON の書式で配列に入れて指定する。
			if (this.template.dataset.css) {
				
				i = -1, l = (data = CustomElement.parseDatasetValue(this.template, 'css')).length;
				while (++i < l) typeof data[i] === 'string' &&
					(($ = document.createElement('link')).rel = 'stylesheet', $.href = data[i], this.shadowRoot.prepend($));
				
			}
			
		}
		
	}
	connectedCallback() {
		
		this.dispatchEvent(new CustomEvent('connected'));
		
	}
	disconnectedCallback() {
		
		this.dispatchEvent(new CustomEvent('disconnected'));
		
	}
	
	static shadowRootInit = { mode: 'open' };
	static tagName = 'custom-element';
	static uid = () => 'ce-' + uid4();
	static parseDatasetValue = (element, name) => {
		
		let v;
		
		try { v = JSON.parse(element.dataset[name]); } catch (error) { v = element.dataset[name]; }
		
		return Array.isArray(v) ? v : v === undefined ? [] : [ v ];
		
	}
	static addDatasetValue = (element, name, value) => {
		
		const	values = this.parseDatasetValue(element, name),
				i = values.indexOf(value);
		
		i === -1 && (values[values.length] = value, element.dataset[name] = JSON.stringify(values));
		
	}
	static removeDatasetValue = (element, name, value) => {
		
		const	values = this.parseDatasetValue(element, name),
				i = values.indexOf(value);
		
		i === -1 || (values.splice(i, 1), element.dataset[name] = JSON.stringify(values));
		
	}
	static removeClassNameByRegExp = (regexp, ...elements) => {
		
		const l = elements.length;
		let i,i0,l0, $;
		
		i = -1;
		while (++i < l) {
			if (!(($ = elements[i]) && typeof $ === 'object' && $.classList instanceof DOMTokenList)) continue;
			i0 = -1, l0 = $.classList.length;
			while (++i0 < l0) regexp.test($.classList[i0]) && ($.classList.remove($.classList[i0--]), --l0);
		}
		
	}
	
}