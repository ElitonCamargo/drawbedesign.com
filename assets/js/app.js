// Inicialização geral e roteamento simples por página
(function () {
	function getSlugFromQuery() {
		const params = new URLSearchParams(location.search);
		return params.get('slug') || '';
	}

	// Renderiza a página de detalhe de um projeto: hero + galeria (Swiper)
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

		// Seção de galeria: onde o Swiper será montado
		const carouselSection = UI.el('section', { class: 'project-carousel' }, [
			UI.el('div', { class: 'container' }, [
				UI.el('div', { class: 'swiper-mount' })
			])
		]);

		main.append(hero);
		main.append(carouselSection);

		const basePath = `/projects/${slug}/images/`;
		const items = (info.images || []).map(img => ({
			src: basePath + img.file,
			alt: (img.alt && img.alt.trim()) ? img.alt : title,
			caption: img.title || ''
		}));

		// Garante que o CSS/JS do Swiper estejam carregados (via CDN)
		await ensureSwiperAssets();

		// Monta o Swiper na seção de galeria
		const mount = UI.qs('.swiper-mount', carouselSection);
		if (mount && items.length) {
			const swiperId = 'projectSwiper';
			const slides = items.map((item) => UI.el('div', { class: 'swiper-slide' }, [
				UI.el('img', {onclick: () => openFullscreen(item.src), src: item.src, alt: item.alt || '', class: 'project-image' }),
				item.caption ? UI.el('div', { class: 'swiper-caption' }, [
					UI.el('span', {}, [document.createTextNode(item.caption)])
				]) : document.createTextNode('')
			]));

			const swiperEl = UI.el('div', { id: swiperId, class: 'swiper' }, [
				UI.el('div', { class: 'swiper-wrapper' }, slides),
				UI.el('div', { class: 'swiper-button-prev' }),
				UI.el('div', { class: 'swiper-button-next' }),
				UI.el('div', { class: 'swiper-pagination' })
			]);

			mount.append(swiperEl);

			// Inicializa o Swiper
			if (window.Swiper) {		
				
				
				requestAnimationFrame(() => {
					const swiper = new window.Swiper('#' + swiperId, {
						loop: true,
						centeredSlides: true,
						slidesPerView: 'auto',
						spaceBetween: 4,
						grabCursor: true,

						navigation: {
							nextEl: '.swiper-button-next',
							prevEl: '.swiper-button-prev'
						},

						pagination: {
							el: '.swiper-pagination',
							clickable: true
						},

						keyboard: { enabled: true },

						observer: true,
						observeParents: true
						// loop: true,
						
						// centeredSlides: true,
						// spaceBetween: 0,
						// grabCursor: true,
						// // slidesPerView: 'auto',
						// breakpoints: {
						// 	0: {
						// 		slidesPerView: 1,
						// 		spaceBetween: 0
						// 	},
						// 	640: {
						// 		slidesPerView: 1.4,
						// 		spaceBetween: 4
						// 	},
						// 	768: {
						// 		slidesPerView: 2.2,
						// 		spaceBetween: 6
						// 	},
						// 	1024: {
						// 		slidesPerView: 2.6,
						// 		spaceBetween: 8
						// 	},
						// 	1280: {
						// 		slidesPerView: 3,
						// 		spaceBetween: 12
						// 	}
						// },

						// navigation: {
						// 	nextEl: '.swiper-button-next',
						// 	prevEl: '.swiper-button-prev'
						// },

						// pagination: {
						// 	el: '.swiper-pagination',
						// 	clickable: true
						// },

						// keyboard: {
						// 	enabled: true
						// },

						// observer: true,
						// observeParents: true,

						// on: {
						// 	init(sw) {
						// 	requestAnimationFrame(() => sw.update());
						// 	}
						// }
					});
				});

			}
		}
	}

	async function renderAbout(){
		const main = UI.qs('#main');
		if (!main) return;

		UI.setTitleAndMeta('Sobre — drawbe', 'Conheça a drawbe, especializada em design de marcas e identidade visual.');

		const aboutSection = UI.el('section', { class: 'about' }, [
			UI.el('div', { class: 'container' }, [
				UI.el('h1', {}, [document.createTextNode('Sobre a Drawbe')]),
				UI.el('div', { class: 'about-content' }, [
					UI.el('div', { class: 'about-text' }, [
						UI.el('p', {}, [document.createTextNode('A Drawbe é uma empresa especializada em design de marcas e criação de identidade visual personalizada, fundada por Beatriz Monteiro.')]),
						UI.el('p', {}, [document.createTextNode('Possui uma característica de design moderno e minimalista, elevando o visual da marca e agregando valor a ela.')])
					]),
					UI.el('div', { class: 'about-values' }, [
						UI.el('h2', {}, [document.createTextNode('Nossa Estética')]),
						UI.el('p', {}, [document.createTextNode('Com uma estética leve, geométrica e contemporânea, criamos soluções visuais que valorizam o essencial: forma, função e significado.')])
					])
				])
			])
		]);

		main.innerHTML = '';
		main.append(aboutSection);
	}

	function openFullscreen(src) {
		const overlay = document.createElement('div');
		overlay.className = 'lightbox';

		overlay.innerHTML = `
			<img src="${src}" />
			<button class="close">×</button>
		`;

		overlay.querySelector('.close').onclick = () => overlay.remove();
		overlay.onclick = e => {
			if (e.target === overlay) overlay.remove();
		};

		document.body.appendChild(overlay);
	}

	// Controla visibilidade do header ao rolar a página
    function setupHeaderScroll() {
        let lastScrollY = 0;
        const header = UI.qs('.site-header');
        const logoContainer = UI.qs('.logo-container');
        
        if (!header || !logoContainer) return;

        // Obtém a altura do logo-container (posição de referência)
        const logoHeight = logoContainer.offsetHeight;

        window.addEventListener('scroll', () => {
            const currentScrollY = window.scrollY;
            
            // Se voltou ao topo (antes da altura do logo)
            if (currentScrollY < logoHeight) {
				console.log('removendo fixo');
                header.classList.remove('fixo');
            }
            // Se está descendo (scroll para baixo)
            else if (currentScrollY > lastScrollY && currentScrollY > logoHeight) {
                // Remove a classe fixo quando descendo
				console.log('removendo fixo');
                header.classList.remove('fixo');
            }
            // Se está voltando para cima (scroll para cima) E passou do logo
            else if (currentScrollY < lastScrollY && currentScrollY > logoHeight) {
                // Aplica a classe fixo quando voltando para cima
				console.log('adicionando fixo');
                header.classList.add('fixo');
            }
            
            lastScrollY = currentScrollY;
        });
    }

	// Carrega (se necessário) os assets do Swiper via CDN
	async function ensureSwiperAssets() {
		const swiperCssHref = 'https://cdn.jsdelivr.net/npm/swiper@12/swiper-bundle.min.css';

		const hasSwiperCss = Array.from(document.styleSheets).some(
			ss => ss.href && ss.href.includes('swiper-bundle.min.css')
		);

		if (!hasSwiperCss) {
			const link = document.createElement('link');
			link.rel = 'stylesheet';
			link.href = swiperCssHref;

			// encontra o main.css
			const mainCssLink = Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
				.find(l => l.href && l.href.includes('/assets/css/main.css'));

			if (mainCssLink) {
				document.head.insertBefore(link, mainCssLink);
			} else {
				// fallback: adiciona no final se não achar
				document.head.appendChild(link);
			}
		}

		if (!window.Swiper) {
			await new Promise((resolve, reject) => {
				const s = document.createElement('script');
				s.src = 'https://cdn.jsdelivr.net/npm/swiper@12/swiper-bundle.min.js';
				s.onload = resolve;
				s.onerror = reject;
				document.head.appendChild(s);
			});
		}
	}

	function getSlugFromPath() {
		const parts = location.pathname.replace(/\/+$/, '').split('/').filter(Boolean);
		if (parts[0] === 'project' && parts[1]) return decodeURIComponent(parts[1]);
		return '';
	}

	// Roteador simples baseado na URL
	async function boot() {
		// Detecta a página pela URL, não pelo data-page (que é sempre 'home' no index.html)
		const path = location.pathname.replace(/\/+$/, '') || '/';
		
		if (path === '/' || path === '') {
			await Portfolio.initPortfolio();
		} else if (path.startsWith('/project/')) {
			await renderProjectDetail();
		} else if (path === '/about' || path === '/about.html') {
			// Chama renderAbout para a página Sobre
			await renderAbout();
		}
		// Marca o link ativo em todas as páginas
		markActiveNav();
		setupHeaderScroll();
	}


	function markActiveNav() {
		const path = location.pathname.replace(/\/+$/, '') || '/';
		// Marca o link ativo do menu principal conforme a rota atual
		UI.qsa('.site-nav a').forEach(a => {
			const href = new URL(a.getAttribute('href'), location.origin).pathname.replace(/\/+$/, '') || '/';
			
			a.classList.toggle('active', href === path);
		});
		// Marca o estado ativo também na marca (logo) quando aplicável
		const brand = document.querySelector('.brand');
		if (brand) {
			const href = new URL(brand.getAttribute('href'), location.origin).pathname.replace(/\/+$/, '') || '/';
			brand.classList.toggle('active', href === path);
		}
	}


	window.App = { boot };
	
	// Inicializa automaticamente quando DOM estiver pronto
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', boot);
	} else {
		boot();
	}
})();
