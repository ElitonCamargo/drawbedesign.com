// Inicialização geral e roteamento simples por página
(function () {
	function getSlugFromQuery() {
		const params = new URLSearchParams(location.search);
		return params.get('slug') || '';
	}

	async function renderProjectDetail() {
		const main = UI.qs('#main');
		if (!main) return;
		const slug = getSlugFromPath() || getSlugFromQuery();
		if (!slug) { UI.setTitleAndMeta('Projeto — drawbe', 'Detalhes do projeto.'); return; }

		const infoUrl = `projects/${slug}/info.json`;
		let info;
		try { info = await UI.fetchJSON(infoUrl); }
		catch (e) {
			main.append(UI.el('div', { class: 'container' }, [UI.el('p', {}, [document.createTextNode('Projeto não encontrado.')]) ]));
			return;
		}

		const title = info.name || slug;
		const desc = info.description || 'Projeto da drawbe';
		UI.setTitleAndMeta(`${title} — drawbe`, desc);

		const hero = UI.el('section', { class: 'project-hero' }, [
			UI.el('div', { class: 'container' }, [
				UI.el('h1', {}, [document.createTextNode(title)]),
				info.slogan ? UI.el('div', { class: 'slogan' }, [document.createTextNode(info.slogan)]) : document.createTextNode(''),
				UI.el('div', { class: 'desc' }, [document.createTextNode(desc)])
			])
		]);

		const gallery = UI.el('section', {}, [
			UI.el('div', { class: 'container' }, [
				UI.el('div', { class: 'gallery' }, [])
			])
		]);

		main.append(hero);
		main.append(gallery);

		const list = UI.qs('.gallery', gallery);
		const basePath = `/projects/${slug}/images/`;
		(info.images || []).forEach(img => {
			const alt = img.alt && img.alt.trim() ? img.alt : `${title}`;
			const fig = UI.el('figure', {}, [
				UI.el('img', { src: basePath + img.file, loading: 'lazy', alt }),
			]);
			if (img.title && img.title.trim()) fig.append(UI.el('figcaption', {}, [document.createTextNode(img.title)]));
			list.append(fig);
		});

		setupLightboxForGallery(list);
	}

	async function boot() {
		const page = document.body.dataset.page || '';
		if (page === 'home') {
			await Portfolio.initPortfolio();
		} else if (page === 'project') {
			await renderProjectDetail();
		}
	}
	
	function getSlugFromPath() {
		const parts = location.pathname.replace(/\/+$/, '').split('/').filter(Boolean);
		if (parts[0] === 'project' && parts[1]) return decodeURIComponent(parts[1]);
		return '';
	}

	async function route() {
		const path = location.pathname.replace(/\/+$/, '') || '/';
		const main = UI.qs('#main');
		if (!main) return;

		if (path === '/' || path === '') {
			main.innerHTML = '';
			const section = UI.el('section', { class: 'portfolio', 'aria-label': 'Portfólio' }, [
				UI.el('div', { id: 'portfolio-grid', class: 'masonry' }, [])
			]);
			main.append(section);
			await Portfolio.initPortfolio();
			markActiveNav();
			return;
		}

		if (path.startsWith('/project/')) {
			main.innerHTML = '';
			await renderProjectDetail();
			markActiveNav();
			return;
		}
		// Rotas estáticas (about/services/contact) continuam via navegação normal.
	}

	function enableSpaNavigation() {
		window.addEventListener('popstate', route);
		document.addEventListener('click', (e) => {
			const a = e.target.closest('a');
			if (!a) return;
			const url = new URL(a.href, location.origin);
			const sameOrigin = url.origin === location.origin;
			const modified = e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || (a.target && a.target !== '_self');
			if (!sameOrigin || modified) return;
			if (url.pathname.startsWith('/project/')) {
				e.preventDefault();
				history.pushState({}, '', url.pathname + url.search + url.hash);
				route();
			}
		});
	}

	async function boot() {
		// Compatibilidade: se for `project.html`, renderiza detalhe via query.
		const page = document.body.dataset.page || '';
		if (page === 'project') {
			await renderProjectDetail();
			return;
		}
		enableSpaNavigation();
		await route();
	}

	window.addEventListener('DOMContentLoaded', boot);
	window.App = { boot, route };

	function markActiveNav() {
		const path = location.pathname.replace(/\/+$/, '') || '/';
		document.querySelectorAll('.site-nav a').forEach(a => {
			const href = new URL(a.getAttribute('href'), location.origin).pathname.replace(/\/+$/, '') || '/';
			a.classList.toggle('active', href === path);
		});
		const brand = document.querySelector('.brand');
		if (brand) {
			const href = new URL(brand.getAttribute('href'), location.origin).pathname.replace(/\/+$/, '') || '/';
			brand.classList.toggle('active', href === path);
		}
	}

	window.addEventListener('DOMContentLoaded', boot);

	function setupLightboxForGallery(listEl) {
		if (!listEl) return;
		const figures = Array.from(listEl.querySelectorAll('figure'));
		const items = figures.map(fig => {
			const img = fig.querySelector('img');
			const cap = fig.querySelector('figcaption');
			return { src: img.getAttribute('src'), alt: img.getAttribute('alt') || '', caption: cap ? cap.textContent : '' };
		});

		let current = 0;
		let lb = document.querySelector('.lightbox');
		if (!lb) {
			lb = UI.el('div', { class: 'lightbox', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Visualização de imagem' }, [
				UI.el('div', { class: 'lightbox-backdrop', onclick: () => close() }),
				UI.el('div', { class: 'lightbox-content' }, [
					UI.el('button', { class: 'lightbox-close', 'aria-label': 'Fechar', onclick: () => close() }, [document.createTextNode('×')]),
					UI.el('button', { class: 'lightbox-btn lightbox-prev', 'aria-label': 'Anterior', onclick: () => prev() }, [document.createTextNode('‹')]),
					UI.el('img', { class: 'lightbox-img', alt: '' }),
					UI.el('button', { class: 'lightbox-btn lightbox-next', 'aria-label': 'Próxima', onclick: () => next() }, [document.createTextNode('›')]),
					UI.el('div', { class: 'lightbox-caption' })
				])
			]);
			document.body.append(lb);

			window.addEventListener('keydown', (e) => {
				if (!lb.classList.contains('open')) return;
				if (e.key === 'Escape') close();
				if (e.key === 'ArrowRight') next();
				if (e.key === 'ArrowLeft') prev();
			});
		}

		const imgEl = lb.querySelector('.lightbox-img');
		const capEl = lb.querySelector('.lightbox-caption');

		function update() {
			const it = items[current];
			imgEl.src = it.src;
			imgEl.alt = it.alt;
			capEl.textContent = it.caption || '';
		}
		function open(index) { current = index; update(); lb.classList.add('open'); }
		function close() { lb.classList.remove('open'); }
		function next() { current = (current + 1) % items.length; update(); }
		function prev() { current = (current - 1 + items.length) % items.length; update(); }

		figures.forEach((fig, idx) => {
			const img = fig.querySelector('img');
			img.style.cursor = 'zoom-in';
			img.addEventListener('click', () => open(idx));
		});
	}

	window.App = { boot };
})();
