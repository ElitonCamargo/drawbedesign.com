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

		const featured = [];
		const regular = [];

		(data.projects || []).forEach(p => {
			if (p.is_featured === true) featured.push(p);
			else regular.push(p);
		});

		const sortByOrder = (a, b) => (b.order ?? 999) - (a.order ?? 999);

		const projects = [...featured.sort(sortByOrder), ...regular.sort(sortByOrder)];
		
		// Renderiza os cards
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

	// Carrega 3 projetos em destaque de forma aleatória
	async function loadFeaturedProjects(container) {
		if (!container) return;

		// Carrega dados de projetos
		const data = await UI.fetchJSON('data/projects.json');
		const featuredProjects = (data.projects || []).filter(p => p.is_featured === true);

		// Se não houver projetos em destaque suficientes
		if (featuredProjects.length === 0) {
			container.innerHTML = '<p style="text-align: center; color: var(--muted);">Nenhum projeto em destaque no momento.</p>';
			return;
		}

		// Embaralha e pega 3 projetos aleatórios
		const shuffled = featuredProjects.sort(() => Math.random() - 0.5);
		const selected = shuffled.slice(0, 3);

		// Limpa o container
		container.innerHTML = '';

		// Renderiza os cards
		selected.forEach(p => {
			const alt = p.name ? `Capa do projeto ${p.name}` : 'Capa do projeto';
			const coverSrc = p.cover && !p.cover.startsWith('/') ? `/${p.cover}` : p.cover;
			
			const card = UI.el('article', { class: 'project-card fx-up fx-delay-1' }, [
				UI.el('a', { href: `/project/${encodeURIComponent(p.slug)}`, 'aria-label': p.name || p.slug }, [
					UI.el('img', { class: 'cover', src: coverSrc, loading: 'lazy', alt }),
					UI.el('div', { class: 'title' }, [document.createTextNode(p.name || p.slug)])
				])
			]);
			container.append(card);
		});

		// Reinicializa o sistema de motion para os novos elementos
		if (window.Motion && window.Motion.initMotion) {
			window.Motion.initMotion();
		}
	}

	window.Portfolio = { initPortfolio, loadFeaturedProjects };
})();
