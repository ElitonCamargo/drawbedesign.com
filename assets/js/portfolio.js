// Módulo de Portfólio (Home)
// Responsável por carregar a lista de projetos (data/projects.json),
// montar o grid de cards e, ao clicar em um projeto, abrir o slider/modal
// com as imagens ou navegar para a página de detalhe.
(function () {
    // ========================================================================
    // Variáveis de controle do Infinite Scroll
    // ========================================================================
    let allProjects = [];
    let currentIndex = 0;
    const itemsPerPage = 12; // Carrega 12 projetos por vez
    let isLoading = false;
    let observer = null; // Intersection Observer

    // ========================================================================
    // Renderiza um projeto individual
    // ========================================================================
    function renderProject(project) {
        const alt = project.name ? `Capa do projeto ${project.name}` : 'Capa do projeto';
        const coverSrc = project.cover && !project.cover.startsWith('/') ? `/${project.cover}` : project.cover;
        
        const card = UI.el('article', { class: 'project-card' }, [
            UI.el('a', { href: `/project/${encodeURIComponent(project.slug)}`, 'aria-label': project.name || project.slug }, [
                UI.el('img', { class: 'cover', src: coverSrc, loading: 'lazy', alt })
            ])
        ]);
        return card;
    }

    // ========================================================================
    // Carrega mais projetos quando o usuário chega perto do final
    // ========================================================================
    function loadMoreProjects() {
        const grid = UI.qs('#portfolio-grid');
        if (!grid || isLoading || currentIndex >= allProjects.length) return;

        isLoading = true;

        // Simula um pequeno delay para melhor UX (opcional)
        setTimeout(() => {
            const endIndex = Math.min(currentIndex + itemsPerPage, allProjects.length);
            
            // Renderiza os projetos do intervalo atual
            for (let i = currentIndex; i < endIndex; i++) {
                const card = renderProject(allProjects[i]);
                grid.append(card);
            }

            currentIndex = endIndex;
            isLoading = false;

            // Se há mais projetos, configura o observer no novo último card
            if (currentIndex < allProjects.length) {
                setupInfiniteScroll();
            }
        }, 200); // delay de 200ms
    }

    // ========================================================================
    // Configura o Intersection Observer para detectar quando chega perto do final
    // ========================================================================
    function setupInfiniteScroll() {
        const grid = UI.qs('#portfolio-grid');
        const lastCard = grid ? grid.querySelector('.project-card:last-child') : null;
        
        if (!lastCard || currentIndex >= allProjects.length) return;

        // Se já existe um observer, remove a observação anterior
        if (observer) {
            observer.disconnect();
        }

        // Cria um novo Intersection Observer
        observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                // Quando o último card fica visível (com margem de 200px)
                if (entry.isIntersecting && currentIndex < allProjects.length) {
                    loadMoreProjects();
                }
            });
        }, {
            rootMargin: '200px' // Começa a carregar 200px antes de chegar ao final
        });

        observer.observe(lastCard);
    }

    // ========================================================================
    // Inicializa a Home do portfólio
    // ========================================================================
    async function initPortfolio() {
        const grid = UI.qs('#portfolio-grid');
        if (!grid) return;
        
        // Define título e meta descrição da página
        UI.setTitleAndMeta('drawbe — Portfólio', 'Portfólio minimalista da drawbe: identidade visual e design.');

        // Carrega dados de projetos
        const data = await UI.fetchJSON('data/projects.json');

        const featured = [];
        const regular = [];

        // Separa projetos em destaque dos regulares
        (data.projects || []).forEach(p => {
            if (p.is_featured === true) featured.push(p);
            else regular.push(p);
        });

        const sortByOrder = (a, b) => (b.order ?? 999) - (a.order ?? 999);

        // Monta a lista final: destaque primeiro, depois regulares
        allProjects = [...featured.sort(sortByOrder), ...regular.sort(sortByOrder)];
        currentIndex = 0;

        // Carrega os primeiros 12 projetos
        loadMoreProjects();
    }

    // ========================================================================
    // Carrega 3 projetos em destaque de forma aleatória (sem infinite scroll)
    // ========================================================================
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

    // ========================================================================
    // Exporta as funções públicas
    // ========================================================================
    window.Portfolio = { initPortfolio, loadFeaturedProjects };
})();