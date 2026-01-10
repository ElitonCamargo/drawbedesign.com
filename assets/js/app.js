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

		setupSlider(items);
		figures.forEach((fig, idx) => {
			const img = fig.querySelector('img');
			img.style.cursor = 'zoom-in';
			img.addEventListener('click', () => window.Slider.open(idx));
		});
	}

	function setupSlider(items) {
		let current = 0;
		let slider = document.querySelector('.slider');
		if (!slider) {
			slider = UI.el('div', { class: 'slider', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Visualização de imagens' }, [
				UI.el('div', { class: 'slider-backdrop', onclick: () => close() }),
				UI.el('div', { class: 'slider-stage' }, [
					UI.el('div', { class: 'slider-track' }),
					UI.el('div', { class: 'slider-caption' }),
					UI.el('button', { class: 'slider-close', 'aria-label': 'Fechar', onclick: () => close() }, [document.createTextNode('×')]),
					UI.el('button', { class: 'slider-prev', 'aria-label': 'Anterior', onclick: () => prev() }, [document.createTextNode('‹')]),
					UI.el('button', { class: 'slider-next', 'aria-label': 'Próxima', onclick: () => next() }, [document.createTextNode('›')])
				])
			]);
			document.body.append(slider);

			window.addEventListener('keydown', (e) => {
				if (!slider.classList.contains('open')) return;
				if (e.key === 'Escape') close();
				if (e.key === 'ArrowRight') next();
				if (e.key === 'ArrowLeft') prev();
			});
		}

		const track = slider.querySelector('.slider-track');
		const stage = slider.querySelector('.slider-stage');
		const captionEl = slider.querySelector('.slider-caption');

		if (!track.hasChildNodes()) {
			items.forEach(it => {
				const itemEl = UI.el('div', { class: 'slider-item' }, [
					UI.el('img', { src: it.src, alt: it.alt })
				]);
				track.append(itemEl);
			});
		}

		const itemEls = Array.from(track.querySelectorAll('.slider-item'));

		function layout() {
			const isTablet = window.innerWidth >= 768;
			const isDesktop = window.innerWidth >= 1100;
			const centerScale = isDesktop ? 1.12 : isTablet ? 1.08 : 1.02;
			const positions = {
				'0':  { tx: '0vw',   tz: '50px',   ry: '0deg',   sc: centerScale, op: 1 },
				'-1': { tx: '-32vw', tz: '-300px', ry: '35deg',  sc: 0.88, op: 1 },
				'1':  { tx: '32vw',  tz: '-300px', ry: '-35deg', sc: 0.88, op: 1 },
				'-2': { tx: '-52vw', tz: '-600px', ry: '50deg',  sc: 0.78, op: 0.9 },
				'2':  { tx: '52vw',  tz: '-600px', ry: '-50deg', sc: 0.78, op: 0.9 },
				'-3': { tx: '-68vw', tz: '-800px', ry: '60deg',  sc: 0.68, op: 0.75 },
				'3':  { tx: '68vw',  tz: '-800px', ry: '-60deg', sc: 0.68, op: 0.75 }
			};
			itemEls.forEach((el, idx) => {
				const d = distance(idx);
				const pos = positions[d !== null ? String(d) : 'x'];
				if (!pos) {
					el.style.opacity = '0';
					el.style.pointerEvents = 'none';
					el.style.transform = 'translate(-50%, -50%) translateX(0) translateZ(-600px) scale(0.6)';
				} else {
					el.style.opacity = String(pos.op);
					el.style.pointerEvents = 'auto';
					el.style.transform = `translate(-50%, -50%) translateX(${pos.tx}) translateZ(${pos.tz}) rotateY(${pos.ry}) scale(${pos.sc})`;
				}
			});
			const it = items[current];
			captionEl.textContent = it.caption || '';
		}
		function distance(idx) {
			const n = itemEls.length;
			let d = idx - current;
			if (d > n/2) d -= n; if (d < -n/2) d += n;
			if (d < -3 || d > 3) return null;
			return d;
		}
		function open(index) { current = index; layout(); slider.classList.add('open'); }
		function close() { slider.classList.remove('open'); }
		function next() { current = (current + 1) % itemEls.length; layout(); }
		function prev() { current = (current - 1 + itemEls.length) % itemEls.length; layout(); }

		window.Slider = { open, close, next, prev };

		// Gestos: arrastar para navegar
		let pointerId = null;
		let startX = 0;
		let dx = 0;
		let lastX = 0;
		let lastT = 0;
		let velocity = 0; // px/ms
		let dragging = false;
		function onDown(e) {
			// Evita iniciar gesto ao clicar nos controles
			if (e.target && e.target.closest && e.target.closest('.slider-prev, .slider-next, .slider-close')) return;
			if (pointerId !== null) return;
			pointerId = e.pointerId || 'mouse';
			stage.setPointerCapture && stage.setPointerCapture(pointerId);
			startX = e.clientX;
			dx = 0;
			lastX = startX;
			lastT = performance.now();
			velocity = 0;
			dragging = true;
			slider.classList.add('dragging');
			track.style.transition = 'none';
		}
		function onMove(e) {
			if (!dragging) return;
			if (pointerId !== (e.pointerId || 'mouse')) return;
			dx = e.clientX - startX;
			const now = performance.now();
			const dt = Math.max(1, now - lastT);
			velocity = (e.clientX - lastX) / dt; // px/ms
			lastX = e.clientX;
			lastT = now;
			track.style.transform = `translateX(${dx}px)`;
		}
		function onUp(e) {
			if (!dragging) return;
			dragging = false;
			slider.classList.remove('dragging');
			const threshold = Math.max(60, window.innerWidth * 0.08);
			const vThresh = 0.5 / 1.0; // ~0.5 px/ms (500 px/s)
			const dir = dx !== 0 ? Math.sign(dx) : Math.sign(velocity);
			const isFlick = Math.abs(velocity) > vThresh;
			const shouldPrev = (dx > threshold) || (isFlick && dir > 0);
			const shouldNext = (dx < -threshold) || (isFlick && dir < 0);
			// pequena animação de inércia (overshoot) para feedback visual
			const overshoot = Math.min(220, Math.abs(velocity) * 140);
			if (shouldPrev || shouldNext) {
				track.style.transition = 'transform 220ms cubic-bezier(0.2, 0.8, 0, 1)';
				track.style.transform = `translateX(${(shouldPrev ? 1 : -1) * (overshoot || 140)}px)`;
				setTimeout(() => {
					track.style.transition = 'transform 180ms ease-out';
					track.style.transform = 'translateX(0)';
				}, 180);
				if (shouldPrev) prev(); else next();
			} else {
				track.style.transition = 'transform 200ms ease';
				track.style.transform = 'translateX(0)';
			}
			pointerId = null;
		}
		if (!stage.dataset.gesturesAdded) {
			stage.addEventListener('pointerdown', onDown);
			stage.addEventListener('pointermove', onMove);
			stage.addEventListener('pointerup', onUp);
			stage.addEventListener('pointerleave', onUp);
			stage.addEventListener('pointercancel', onUp);
			// evita propagação dos eventos dos botões para o palco
			stage.querySelectorAll('.slider-prev, .slider-next, .slider-close').forEach(btn => {
				btn.addEventListener('pointerdown', (ev) => ev.stopPropagation());
				btn.addEventListener('click', (ev) => ev.stopPropagation());
			});
			stage.dataset.gesturesAdded = '1';
		}
		// evita arrastar a imagem nativa
		track.addEventListener('dragstart', (e) => e.preventDefault());
	}

	window.App = { boot };
})();
