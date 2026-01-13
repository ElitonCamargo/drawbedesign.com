# drawbedesign.com

Portfolio estático com SPA simples, carregamento dinâmico de projetos e lightbox.

## Slider (Swiper.js)

O detalhe de projeto usa o Swiper.js (v12) via CDN.
- Dependências via CDN: incluídas em `project.html` e carregadas dinamicamente em `assets/js/app.js` quando necessário.
- Renderização: markup gerado em `renderProjectDetail()` com `.swiper`, `.swiper-wrapper`, `.swiper-slide`, navegação e paginação.

Cada item exibe imagem em largura total e, opcionalmente, uma legenda.
