// Renderização do portfólio (Home)
(function () {
	async function initPortfolio() {
		const grid = UI.qs('#portfolio-grid');
		if (!grid) return;
		UI.setTitleAndMeta('drawbe — Portfólio', 'Portfólio minimalista da drawbe: identidade visual e design.');

		const data = await UI.fetchJSON('data/projects.json');
		const projects = (data.projects || [])
			.slice()
			.sort((a, b) => (a.order ?? 999) - (b.order ?? 999));

		projects.forEach(p => {
			const alt = p.name ? `Capa do projeto ${p.name}` : 'Capa do projeto';
			const card = UI.el('article', { class: 'project-card' }, [
				UI.el('a', { href: `project.html?slug=${encodeURIComponent(p.slug)}`, 'aria-label': p.name || p.slug }, [
					UI.el('img', { class: 'cover', src: p.cover, loading: 'lazy', alt })
					// UI.el('div', { class: 'title' }, [document.createTextNode(p.name || p.slug)]),
					// UI.el('div', { class: 'meta' }, [document.createTextNode((p.categories || []).join(' · '))])
				])
			]);
			grid.append(card);
		});
	}

	window.Portfolio = { initPortfolio };
})();
