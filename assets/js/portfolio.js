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
			.sort((a, b) => (b.order ?? 999) - (a.order ?? 999));

		projects.forEach(p => {
			const alt = p.name ? `Capa do projeto ${p.name}` : 'Capa do projeto';
			const coverSrc = p.cover && !p.cover.startsWith('/') ? `/${p.cover}` : p.cover;
			// Cria o card do projeto com link para detalhe
			const card = UI.el('article', { class: 'project-card' }, [
				UI.el('a', { href: `/project/${encodeURIComponent(p.slug)}`, 'aria-label': p.name || p.slug }, [
					UI.el('img', { class: 'cover', src: coverSrc, loading: 'lazy', alt })
				])
			]);
			grid.append(card);
		});
	}

	window.Portfolio = { initPortfolio };
})();
