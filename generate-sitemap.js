const fs = require('fs');
const path = require('path');

async function generateSitemap() {
  const data = await require('./data/projects.json');
  
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  
  // Páginas estáticas
  const staticPages = ['', '/about', '/services', '/contact'];
  staticPages.forEach(page => {
    xml += `  <url>\n    <loc>https://drawbedesign.com${page}</loc>\n    <changefreq>monthly</changefreq>\n    <priority>${page === '/' ? '1.0' : '0.8'}</priority>\n  </url>\n`;
  });
  
  // Páginas de projetos (dinâmicas)
  data.projects.forEach(project => {
    xml += `  <url>\n    <loc>https://drawbedesign.com/project/${project.slug}</loc>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
  });
  
  xml += '</urlset>';
  
  fs.writeFileSync(path.join(__dirname, 'sitemap.xml'), xml);
  console.log('✅ Sitemap gerado com sucesso!');
}

generateSitemap();