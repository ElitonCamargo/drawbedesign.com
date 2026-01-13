// Módulo de Portfólio (Home)
// Responsável por carregar a lista de projetos (data/projects.json),
// montar o grid de cards e, ao clicar em um projeto, abrir o slider/modal
// com as imagens ou navegar para a página de detalhe.
(function () {
	// Inicializa a Home do portfólio: carrega dados, ordena e renderiza
	async function initPortfolio() {
		const grid = UI.qs('#portfolio-grid');
		if (!grid) return;
		// Define título e meta descrição da página
		UI.setTitleAndMeta('drawbe — Portfólio', 'Portfólio minimalista da drawbe: identidade visual e design.');

		// Carrega dados de projetos
		const data = await UI.fetchJSON('data/projects.json');
		const projects = (data.projects || [])
			.slice()
			// Ordena por `order` quando disponível
			.sort((a, b) => (a.order ?? 999) - (b.order ?? 999));

		projects.forEach(p => {
			const alt = p.name ? `Capa do projeto ${p.name}` : 'Capa do projeto';
			const coverSrc = p.cover && !p.cover.startsWith('/') ? `/${p.cover}` : p.cover;
			// Cria o card do projeto com link para detalhe
			const card = UI.el('article', { class: 'project-card' }, [
				UI.el('a', { href: `/project/${encodeURIComponent(p.slug)}`, 'aria-label': p.name || p.slug }, [
					UI.el('img', { class: 'cover', src: coverSrc, loading: 'lazy', alt })
				])
			]);
			// Intercepta clique para abrir slider/modal com imagens do projeto
			const link = card.querySelector('a');
			if (link) {
				link.addEventListener('click', async (ev) => {
					// Evita navegação; carrega imagens do projeto e abre slider
					ev.preventDefault();
					try {
						const info = await UI.fetchJSON(`projects/${encodeURIComponent(p.slug)}/info.json`);
						const title = info.name || p.slug;
						const basePath = `/projects/${p.slug}/images/`;
						const items = (info.images || []).map(img => ({
							src: basePath + img.file,
							alt: (img.alt && img.alt.trim()) ? img.alt : title,
							caption: img.title || ''
						}));
						// Se o lightbox/slider estiver disponível, abre em modal
						if (window.SliderSetup) {
							window.SliderSetup(items);
							window.Slider && window.Slider.open(0);
						} else {
							// Fallback: se Slider não estiver pronto, navega
							location.href = `/project/${encodeURIComponent(p.slug)}`;
						}
					} catch (e) {
						// Em caso de erro, segue navegação padrão
						location.href = `/project/${encodeURIComponent(p.slug)}`;
					}
				});
			}
			grid.append(card);
		});
	}

	window.Portfolio = { initPortfolio };
})();
