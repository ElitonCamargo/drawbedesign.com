// Utilitários de UI e helpers gerais
(function () {
	function qs(sel, root = document) { return root.querySelector(sel); }
	function qsa(sel, root = document) { return Array.from(root.querySelectorAll(sel)); }
	function el(tag, attrs = {}, children = []) {
		const node = document.createElement(tag);
		for (const [k, v] of Object.entries(attrs)) {
			if (k === 'class') node.className = v; else if (k === 'dataset') Object.assign(node.dataset, v);
			else if (k.startsWith('on') && typeof v === 'function') node.addEventListener(k.slice(2), v);
			else if (v !== undefined && v !== null) node.setAttribute(k, v);
		}
		children.forEach(c => node.append(c));
		return node;
	}

	async function fetchJSON(url) {
		const absUrl = new URL(url, location.origin).toString();
		const res = await fetch(absUrl, { headers: { 'Accept': 'application/json' } });
		if (!res.ok) throw new Error(`Falha ao carregar: ${url}`);
		return res.json();
	}

	function setTitleAndMeta(title, description) {
		if (title) document.title = title;
		if (description) {
			let meta = qs('meta[name="description"]');
			if (!meta) { meta = el('meta', { name: 'description' }); document.head.append(meta); }
			meta.setAttribute('content', description);
		}
	}

	window.UI = { qs, qsa, el, fetchJSON, setTitleAndMeta };
})();
