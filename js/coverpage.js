// ===== COVER PAGE GENERATOR =====

class CoverPageGenerator {
    static generate() {
        if (typeof DocumentStyleManager !== 'undefined') {
            return DocumentStyleManager.generateCoverPage(false);
        }

        const title = document.getElementById('docTitle').value || 'Document';
        const author = document.getElementById('inputAuthor').value || 'Auteur Inconnu';
        const date = document.getElementById('inputDate').value || new Date().toLocaleDateString();

        return `
<div style="page-break-after: always; padding: 100px 40px; text-align: center; background: #1A2A3A; color: white;">
    <h1 style="font-size: 2.5em; margin-bottom: 20px;">${title}</h1>
    <p style="color: #E67E22;">${author}</p>
    <p style="margin-top: 40px; color: #BDC3C7;">${date}</p>
</div>`;
    }

    static generateTableOfContents() {
        const headings = document.querySelectorAll('.preview-content h1, .preview-content h2, .preview-content h3');
        const accent = DocumentStyleManager?.getSettings()?.colors?.accent || '#1A2A3A';

        if (headings.length === 0) {
            return '<div style="page-break-after: always;"><h2>Table des matières</h2><p>Aucun titre trouvé.</p></div>';
        }

        let toc = `<div style="page-break-after: always; padding: 20px 0;"><h2 style="color: ${accent}; margin-bottom: 20px;">Table des matières</h2><ul style="list-style: none; padding: 0;">`;
        headings.forEach((heading, index) => {
            const level = parseInt(heading.tagName[1], 10);
            const margin = (level - 1) * 24;
            const id = `heading-${index}`;
            heading.id = id;
            const color = DocumentStyleManager?.getSettings()?.colors?.[`h${level}`] || accent;
            toc += `<li style="margin-left: ${margin}px; margin-bottom: 8px;"><a href="#${id}" style="color: ${color}; text-decoration: none;">${heading.textContent}</a></li>`;
        });
        toc += '</ul></div>';

        return toc;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ Cover Page Generator chargé');
});
