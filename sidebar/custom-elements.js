class HanamaruElement extends CustomElement {
	
	constructor(option = { ...HanamaruElement.presetOption }) {
		
		super(option),
		
		this.__importedPropertyNames = new Set();
		
	}
	attributeChangedCallback(name, ov, nv) {
		
		switch (name) {
			case 'import': this.import = this.hasAttribute(name) ? nv : ''; break;
		}
		
	}
	
	// このオブジェクトを継承したオブジェクトは、属性 import を持つ。
	// import には文字列か Object を指定できる。
	// 文字列を指定した場合 JSON として扱われる。文字列が JSON.parse でエラーを起こす場合、指定は無視される。
	// Object を含む有効な値を指定した場合、その値が含むすべてのプロパティを自身およびプロパティ __importedPropertyNames にコピーする。
	// プロパティは要素の属性を兼ねることを前提として、プロパティの値の型が object を示す場合、それは JSON に変換される。
	// プロパティのコピー後、属性 import に設定されるのは、import に指定した値ではなく、
	// それを含む、これまでに import を通じて設定したすべてのプロパティの JSON となる。
	// この属性を経ずに、直接属性を設定ないし削除しても、import の値は動的には変化しない。この仕様はパフォーマンス上の影響を考慮したものである。
	// 指定、取得問わず import にアクセスすると、import の属性およびプロパティは現在の同値に更新される。
	// このプロパティの汎用性が確認されれば、CustomElement か ExtensionNode に移植することを検討。
	// ただし完全な仕様を満たすには attributeChangedCallback と、それに伴う各種プロパティの移植も必要になる。
	get import() {
		
		const v = {}, names = this.__importedPropertyNames;
		let k,v0;
		
		for (k of names) (v0 = this.getAttribute(k)) === null ? names.delete(k) : (v[k] = v0);
		
		//this.setAttribute('import', toJSON(v));
		
		return v;
		
	}
	set import(v) {
		
		const data = fromJSON(v), names = this.__importedPropertyNames;
		
		if (!data || typeof data !== 'object') return;
		
		const v0 = {};
		let k;
		
		for (k of names) v0[k] = this[k];
		for (k in data) names.add(k), v0[k] = this[k] = data[k];
		
		//this.setAttribute('import', toJSON(v0));
		
	}
	static get observedAttributes() { return HanamaruElement.observedAttr; }
	static observedAttr = [ 'import' ];
	
	static tagName = 'hanamaru-node';
	static presetOption = { loggerPrefix: 'HN' };
	
}
// background から受信する Object メッセージの典型。
//{
//  "from": "comment",
//  "type": "thread",
//  "data": { "thread": {...} },
//  "property": { ...
class Hanamaru2ndAlbum extends CustomElement {
	
	constructor(option = { ...Hanamaru2ndAlbum.presetOption }) {
		
		super(option),
		
		this.connection = { name: this.portName = uid4() },
		this.whoIsResolutions = [];
		
	}
	connectedCallback() {
		
		this.hasAttribute('autoconnect') && this.connect();
		
	}
	disconnectedCallback() {
		
		this.destroy(), this.disconnect();
		
	}
	connect() {
		
		this.port || (this.port = browser?.runtime.connect(this.connection))?.onMessage.addListener(this.received);
		
	}
	disconnect() {
		
		this.port && (this.port.onMessage.removeListener(this.received), delete this.port);
		
	}
	
	attributeChangedCallback(name, ov, nv) {
		
		switch (name) {
			default: break;
		}
		
	}
	
	setThread(thread, data) {
		
		if (!(thread ||= data?.thread)) {return;}
		
		const	matchedThreadNode = this.querySelector(`:scope > [thread="${thread}"]`),
				threadNode = matchedThreadNode || document.createElement('thread-node');
		
		data && typeof data === 'object' && (threadNode.import = data),
		threadNode.thread = thread;
		
		return matchedThreadNode || this.appendChild(threadNode);
		
	}
	addComment(comment, thread) {
		
		if (
			!((thread || thread) instanceof ThreadNode) &&
			!(
				thread = thread && typeof thread === 'object' ? this.setThread(thread.thread, thread) :
																				this.setThread(thread || comment?.thread)
			)
		) return;
		
		return thread.addComment(comment);
		
	}
	
	whois(id) {
		
		return new Promise(this.querySelector(UserList.tagName) ? this.fulfillWhoIs : this.suspendWhoIs);
		
	}
	
	// ExtensionNode が使うコールバック関数の実装
	addedChildren(children) {
		
		let i, child;
		
		i = -1;
		while (child = children[++i]) {
			
			switch (child.localName) {
				
				case ThreadNode.tagName:
				typeof child.resolveRootNode === 'function' && child.available.then(this.xThreadNodeAvailable);
				break;
				
			}
			
		}
		
	}
	
	static get observedAttributes() { return Hanamaru2ndAlbum.observedAttr; }
	
	static tagName = 'hanamaru-2nd-album';
	static presetOption = { loggerPrefix: 'HM' };
	static observedAttr = [];
	static bound = {
		
		received(message) {
			
			hi(message);
			
			if (message && typeof message === 'object') {
				
				const data = message.data;
				
				switch (message.from) {
					
					case 'live':
					break;
					
					case 'comment':
					switch (message.type) {
						
						case 'thread':
	    				this.setThread(data?.thread?.thread, data?.thread);
						break;
						/*
						"chat": {
							"thread": "M.7XH9Kuc_qhyPl0iT-T8D0Q",
							"no": 1,
							"vpos": 54100,
							"date": 1622217825,
							"date_usec": 480955,
							"user_id": "115879928",
							"premium": 3,
							"content": "test",
							"yourpost": 1
						}
						*/
						case 'chat':
						this.addComment(data?.chat, data?.chat?.thread);
						//this.shadowRoot.prepend(document.createTextNode(JSON.stringify(data.chat)));
						break;
						
					}
					break;
					
					// background との通信
					default:
					switch (message.type) {
						
						case 'post':
						this.log('Received a post request.', message),
						nnnwsbc.post(data.text, data.isAnon);
						return;
						
						case 'logging':
						this.log('Received a logging request.', message),
						this.log = data.value ? createLog('SB') : () => {};
						//nnnwsbc.logSwitch(data.value);
						return;
						
					}
					
				}
				
			} else {
				
				switch (message) {
					
					case true:
					this.log('Try to register with background.'), this.port.postMessage('internal')
					break;
					
					case 'registered':
					this.log('Established a connection with background.', message);
					//boot();
					break;
					
				}
				
			}
			
		},
		
		fulfillWhoIs(rs) {
			
			const	result = userNode =>	{
							
							if (!userNode) return;
							
							who ? who.utime < userNode.utime && (who = userNode) : (who = userNode);
							
							if (++i0 === l) return;
							
							i = -1, rs && (this.whoIsResolutions[this.whoIsResolutions.length] = rs);
							while (this.whoIsResolutions[++i]) this.whoIsResolutions[i](who);
							this.whoIsResolutions.length = 0;
							
						},
					userLists = this.querySelectorAll(':not(user-list) user-list'),
					l = userLists.length;
			
			let i,i0, who;
			
			i = -1, i0 = 0;
			while (userLists[++i]) userLists[i].whois(id, false).then(result);
		
		},
		suspendWhoIs(rs) {
			
			this.whoIsResolutions[this.whoIsResolutions.length] = rs;
			
		},
		
		xThreadNodeAvailable(threadNode) {
			threadNode.resolveRootNode(threadNode.rootNode = this),
			delete threadNode.resolveRootNode,
			this.whoIsResolutions.length && this.fulfillWhoIs();
		}
		
	};
	static movedNodesObserverInit = { subtree: true, closest: this.tagName };
	
}

//"thread": {
//	"resultcode": 0,
//	"thread": "M.LkNCKXkd9CxOSG8GyTf4Fg",
//	"revision": 1,
//	"server_time": 1636365082,
//	"last_res": 33182,
//	"ticket": "22bd64b2"
//}
class ThreadNode extends HanamaruElement {
	
	constructor(option = { ...ThreadNode.presetOption }) {
		
		super(option),
		
		this.composite(),
		
		this.whoIsResolutions = [];
		
	}
	composite() {
		 this.rootNode instanceof Promise || (this.rootNode = new Promise(rs => this.resolveRootNode = rs));
	}
	connectedCallback() {
		
		this.composite(),
		this.resolve();
		
	}
	
	addComment(comment) {
		
		let i,l, chatLogs;
		
		i = -1,	l =	(
								(chatLogs = this.querySelectorAll(':scope > chat-log')).length ||
									(chatLogs = [ this.appendChild(document.createElement(ChatLog.tagName)) ])
							).length;
		while (chatLogs[++i]) chatLogs[i].add(comment);
		
	}
	
	// メソッド whois を実行すると、子要素内にひとつでも userList が存在する場合、
	// その中からネストしていないすべての userList のメソッド whois を引数の値で実行し、
	// その中から最新の userNode で解決する Promise を返す。
	// 子要素に userList が存在しない場合、親要素に userList が現われるのを非同期で待ち受け、
	// その userList に対して whois を実行し、その戻り値である userNode で解決する Promise を返す。
	// 親要素の userList が存在しないまま子要素に userList が追加された場合、
	// 親要素への待ち受けに割り込む形で、スタックされたそれらの Promise を子要素の userList が userNode で解決する。
	whois(id, redirects = true) {
		
		const	userLists = this.querySelectorAll(':not(user-list) user-list'),
				l = userLists.length;
		//coco userlist がひとつも存在しない状況での振る舞い
		return l ?	new Promise(rs => {
						
							const	result = userNode =>	userNode && (
																		who ?	who.utime < userDate.utime && (who = userDate) :
																				(who = userNode),
																		++i0 === l && rs(who)
																	);
							let i,i0, who;
							
							i = -1, i0 = 0;
							while (userLists[++i]) userLists[i].whois(id).then(result);
						
						}) :
						redirects && (
							this.rootNode instanceof Hanamaru2ndAlbum ?
								this.rootNode.whois(id) :
								// 上位の userList を待ち受ける
								new Promise(rs => {
									// 上位 userList の存在前に子要素 userList が追加された場合、
									// プロパティ whoIsResolutions に追加された関数で子要素でこの Promise を解決する。
									const intercept =	this.whoIsResolutions[this.whoIsResolutions.length] =
																userList => userList.whois(id).then(userNode => rs(id));
									this.rootNode.then(rootNode => {
											const i = this.whoIsResolutions.indexOf(intercept);
											i !== -1 && (this.whoIsResolutions.splice(i, 1), rootNode.whois(id))
										}).then(userNode => rs(userNode));
								})
						);
		
	}
	
	addedChildren(children) {
		
		let i, child;
		
		i = -1;
		while (child = children[++i]) {
			
			switch (child.localName) {
				
				case UserList.tagName:
				typeof child.resolveThreadNode === 'function' && child.available.then(this.xUserListAvailable);
				break;
				
				default:
				typeof child.resolveThreadNode === 'function' && (
						child.available instanceof Promise ?
							child.available.then(this.xChildNodeAvailable) : child.resolveThreadNode(this)
					);
				
			}
			
		}
		
	}
	
	get thread() { return this.getAttribute('thread')}
	set thread(v) { this.setAttribute('thread', v); }
	
	static tagName = 'thread-node';
	static presetOption = { loggerPrefix: 'TN' };
	static movedNodesObserverInit = { subtree: true, closest: this.tagName };
	static bound = {
		
		xUserListAvailable(userList) {
			
			let i;
			
			userList.resolveThreadNode(userList.threadNode = this),
			delete userList.resolveThreadNode,
			
			i = -1;
			while (this.whoIsResolutions[++i]) this.whoIsResolutions[i](userList);
			this.whoIsResolutions.length = 0;
			
		},
		xChildNodeAvailable(childNode) {
			
			childNode.resolveThreadNode(childNode.threadNode = this),
			delete childNode.resolveThreadNode
			
		}
		
	};
	
}

class UserNode extends HanamaruElement {
	
	constructor(option) {
		
		super();
		
		const slots = ExtensionNode.construct(UserNode.slots);
		let i;
		
		i = -1;
		while (slots[++i]) this[slots[i].dataset.k] = slots[i];
		
		this.fetchInit = { signal: (this.fetchAborter = new AbortController()).signal };
		
	}
	update(id, name = id, time = Date.now()) {
		
		this.setAttribute('user_id', id),
		this.user_name = name,
		this.atime = time,
		this.utime = time,
		
		this.emit('updated-user', this.toJson());
		
		return this;
		
	}
	scrape(page = this.page) {
		
		const	name = userNameRx.exec(this.page = page)[1],
				icon = userIconRx.exec(page)[1]?.replaceAll('\\', '');
		
		name && (this.user_name = name),
		icon && (this.user_icon = icon);
		
	}
	
	setId(id) {
		
		return (this.user_id === id || (this.user_id = id), this.userDataAvailable);
		
	}
	init() {
		
		this.fetchAborter.abort();
		
	}
	toJson() {
		
		return {
			id: this.user_id,
			name: this.user_name,
			added: this.atime,
			updated: this.utime,
			icon: this.user_icon
		};
		
	}
	
	get utime() { return this.getAttribute('utime'); }
	set utime(v) {
		const utime = parseInt(this.getAttribute(utime));
		!Number.isNaN(v = parseInt(v)) && (!utime || Number.isNaN(utime)|| utime < v) && this.setAttribute('utime', v);
	}
	get atime() { return this.getAttribute('atime'); }
	set atime(v) {
		const atime = parseInt(this.getAttribute(atime));
		!Number.isNaN(v = parseInt(v)) && (!atime || Number.isNaN(atime)|| atime > v) && this.setAttribute('atime', v);
	}
	get user_name() { return this.getAttribute('user_name'); }
	set user_name(v) {
		this.userNameNode.textContent(v),
		this.setAttribute('user_name', v);
	}
	get user_icon() { return this.getAttribute('user_icon'); }
	set user_icon(v) {
		this.userIconNode.dataset.url = v,
		this.setAttribute('user_icon', v);
	}
	get user_id() { return this.getAttribute('user_id'); }
	set user_id(v) {
		
		v ?	(
					this.userDataAvailable = new Promise(
							rs =>	fetch(this.url = `${USER_URL}${v}`, this.fetchInit).then(UserNode.toText).
										then(page => (this.scrape(page), rs(this.update(v, this.user_name || undefined)))).
										catch(
											error => (
													console.error(error, v),
													error instanceof AbortError || rs(this.user_name ? this : this.update(v))
												)
										)
						)
				) :
				this.init();
		
	}
	
	static USER_URL = 'https://www.nicovideo.jp/user/';
	static toText = v => v.text();
	static userNameRx = /<meta property="profile:username" content="(.*?)">/;
	static userIconRx = /(https:\\\/\\\/secure-dcdn\.cdn\.nimg\.jp\\\/nicoaccount\\\/usericon\\\/.*?\\\/.*?\.(?:jpe?g|png|gif))/;
	static slots = [
		
		{ tag: 'span', attr: { slot: 'user-icon', 'class': 'user-icon', 'data-k': 'userIconNode' } },
		{ tag: 'span', attr: { slot: 'name', 'class': 'name', 'data-k': 'userNameNode' } },
		
	];
	
}
class UserList extends HanamaruElement {
	
	constructor(option = { ...UserList.presetOption }) {
		
		super(option),
		
		this.composite();
		
	}
	composite() {
		
		this.threadNode instanceof Promise || (this.threadNode = new Promise(rs => this.resolveThreadNode = rs)),
		this.rootNode instanceof Promise || (this.rootNode = new Promise(rs => this.resolveRootNode = rs));
		
	}
	connectedCallback() {
		
		this.composite(),
		this.resolve();
		
	}
	add(id) {
		
		const user = this.querySelector(`:not(${ThreadNode.tagName}) ${UserNode.tagName}[user_id="${id}"]`);
		
		if (user) return user;
		
		const userNode = document.createElement('user-node');
		
		userNode.user_id = id;
		
		return this.appendChild(userNode);
		
	}
	
	whois(id) {
		
		return this.add(id).userDataAvailable;
		
	}
	
	addedChildren(children) {
		
		let i, child;
		
		i = -1;
		while (child = children[++i]) {
			
			switch (child.localName) {
				
				//coco
				// userIndex は親要素ではなく上位の要素であるべきなため、
				// MutationObserver().observe(this.closest('hanamaru-2nd-album')) などを通じて
				// 下位の threadNode を取得する仕組みを作らなくてはならない。
				// ただその場合二つ以上の上位 userList が存在する場合かなり複雑な処理を作ることになる。
				// 上記懸念に対し、下記は現状妥当と思える仕様
				// hanamaru-2nd-album が擬似的に上位 userList の役割を担う
				// この場合、例えば任意の子要素からの whois に対しすべての userList から全検索してその結果で解決する。
				// その際、whois の実行元が属する threadNode の子要素 userList は検索対象から除外する。
				default:
				typeof child.resolveRootNode === 'function' && (
						child.available instanceof Promise ?
							child.available.
								then(() => (child.resolveRootNode(child.rootNode = this), delete child.resolveRootNode)) :
							child.resolveRootNode(this)
					);
				
			}
			
		}
		
	}
	
	static tagName = 'user-list';
	static presetOption = { loggerPrefix: 'UL' };
	static movedNodesObserverInit = { subtree: true, closest: this.tagName };
	static bound = {
		
		observed(mr) {
			
			const nodes = getMovedNodesFromMR(mr);
			let node;
			
			for (node of nodes) node.parentNode === this || (node.jtime = Date.now());
			
		}
		
	};
	
}

class ChatLog extends HanamaruElement {
	
	constructor(option = { ...ChatLog.presetOption }) {
		
		super(option),
		
		this.composite();
		
	}
	composite() {
		
		this.threadNode instanceof Promise || (this.threadNode = new Promise(rs => this.resolveThreadNode = rs));
		
	}
	connectedCallback() {
		
		this.composite(),
		this.resolve();
		
	}
	add(comment) {
		
		const children = this.children, commentNode = document.createElement('comment-node');
		let i, child;
		hi(comment);
		i = children.length, commentNode.import = comment;
		while ((child = children[--i]) && !(child.no && +child.no < comment.no));
		child ? child.after(commentNode) : this.appendChild(commentNode);
		
		return commentNode;
		
	}
	/*
	whois(id) {
		
		return this.threadNode instanceof ThreadNode ?
			this.threadNode.whois(id) : this.threadNode.then(threadNode => (this.threadNode = threadNode).whois(id));
		
	}
	*/
	
	addedChildren(children) {
		
		let i, child;
		
		i = -1;
		while (child = children[++i])
			child.localName === CommentNode.tagName && child.available.then(this.xCommentNodeAvailable);
		
	}
	
	static tagName = 'chat-log';
	static presetOption = { loggerPrefix: 'CL' };
	static observeInit = { childList: true };
	static bound = {
		
		xCommentNodeAvailable(commentNode) {
			
			commentNode.resolveChatLog(this);
			
		}
		
	};
	
	static movedNodesObserverInit = { subtree: true, closest: this.tagName };
	
}
class CommentNode extends HanamaruElement {
	
	constructor(option = { ...ThreadNode.presetOption }) {
		
		super(option);
		
		const slots = ExtensionNode.construct(CommentNode.slots);
		let i;
		
		this.composite(),
		
		i = -1, this.slotNode = {};
		while (slots[++i]) this.slotNode[slots[i].slot] = slots[i];
		
		this.d = new Date();
		
	}
	composite() {
		
		// 以下の要素は、動作に欠かせないがこの要素がそれらに内包されているかどうかはあくまで任意であるため、
		// 条件を満たし次第動作を完了できるように Promise で続く処理を待ち受け状態にできるようにする。
		this.threadNode instanceof Promise || (this.threadNode = new Promise(rs => this.resolveThreadNode = rs)),
		this.chatLog instanceof Promise || (this.chatLog = new Promise(rs => this.resolveChatLog = rs));
		
	}
	connectedCallback() {
		
		this.composite(),
		
		this.resolve();
		
	}
	
	get noNode() { return this.querySelector('.no') || this.appendChild(this.slotNode.no); }
	set noNode(v) { this.noNode.textContent = v; }
	get usertNode() { return this.querySelector('.user') || this.appendChild(this.slotNode.user); }
	set usertNode(v) { this.usertNode.textContent = v; }
	get dateNode() { return this.querySelector('.date') || this.appendChild(this.slotNode.date); }
	set dateNode(v) {
		const dateNode = this.dateNode, d = this.d;
		d.setTime(dateNode.dataset.rawTime = v),
		dateNode.textContent = `${(''+d.getHours()).padStart(2,'0')}:${(''+d.getMinutes()).padStart(2,'0')}.${(''+d.getSeconds()).padStart(2,'0')}`;
	}
	get contentNode() { return this.querySelector('.content') || this.appendChild(this.slotNode.content); }
	set contentNode(v) { this.contentNode.textContent = v; }
	
	get no() { return +this.noNode.textContent; }
	set no(v) { this.noNode = v; }
	get content() { return this.contentNode.textContent; }
	set content(v) { this.contentNode = v; }
	get date() { return this.dateNode.textContent; }
	set date(v) { this.dateNode = v; }
	get rawTime() { return this.dateNode.dataset.rawTime; }
	set rawTime(v) { this.date = v; }
	get user_id() { return this.getAttribute('user_id'); }
	set user_id(v) {
		
		this.setAttribute('user_id', v),
		
		// ここでさらに whois の結果をキャッシュする。キャッシュは恐らく threadNode 内の user-list が担当する。
		// そのため、whois の前に user-list の存在確認および問い合わせを挟む必要がある。
		// 上記を chatLog を介して行なう。つまりこの要素が動作するには chatLog に内包されていることが必須になる。
		// これらを実装できたら、上記の分岐と併せてキャッシュが存在する場合は可能な限り Promise をスキップできるように変更する。userIndex => {
		(
			this.threadNode instanceof ThreadNode ?
				this.threadNode.whois(v) : this.threadNode.then(threadNode => threadNode.whois(v))
			//this.chatLog instanceof HTMLElement ?
			//	this.chatLog.whois(v) : this.chatLog.then(chatLog => (this.chatLog = chatLog).whois(v))
		).then(this.xGetUserNode);
		
	}
	
	static tagName = 'comment-node';
	static presetOption = { loggerPrefix: 'H2' };
	static slots = [
		
		{ tag: 'span', attr: { slot: 'no', 'class': 'no' } },
		{ tag: 'user-node', attr: { slot: 'user', 'class': 'user' } },
		{ tag: 'span', attr: { slot: 'date', 'class': 'date' } },
		{ tag: 'span', attr: { slot: 'content', 'class': 'content' } },
		
	];
	static bound = {
		
		xGetUserNode(userNode) {
			hi(0),
			this.userDataNode && this.userDataNode.destroy(),
			this.userNode.appendChild(this.userDataNode = userDataNode);
			
		},
		updatedUserDataNode(userNode) {
			hi(userNode);
		}
		
	};
	
}

defineCustomElements(Hanamaru2ndAlbum, ThreadNode, ChatLog, CommentNode, UserList, UserNode);