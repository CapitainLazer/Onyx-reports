// ===== COVER PAGE GENERATOR =====

class CoverPageGenerator {
    static generate() {
        const title = document.getElementById('docTitle').value || 'Document';
        const author = document.getElementById('inputAuthor').value || 'Auteur Inconnu';
        const date = document.getElementById('inputDate').value || new Date().toLocaleDateString();

        return `
<div style="
    page-break-after: always;
    width: 100%;
    height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #1A2A3A 0%, #2C3E50 100%);
    color: white;
    text-align: center;
    padding: 40px;
    box-sizing: border-box;
">
    <div style="margin-bottom: 40px;">
        <div style="
            width: 80px;
            height: 80px;
            background: #E67E22;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 30px;
            font-size: 40px;
        ">
            ◆
        </div>
    </div>

    <h1 style="
        font-size: 3.5em;
        margin: 0 0 30px 0;
        font-weight: 700;
        letter-spacing: -1px;
    ">
        ${title}
    </h1>

    <div style="
        width: 100px;
        height: 3px;
        background: #E67E22;
        margin-bottom: 40px;
    "></div>

    <p style="
        font-size: 1.5em;
        margin: 40px 0;
        color: #E67E22;
        font-weight: 600;
    ">
        ${author}
    </p>

    <div style="
        margin-top: 100px;
        font-size: 1.1em;
        color: #BDC3C7;
    ">
        <p>${date}</p>
    </div>

    <div style="
        position: absolute;
        bottom: 40px;
        font-size: 12px;
        color: #95A5A6;
    ">
        Onyx Reports — Éditeur Markdown Professionnel
    </div>
</div>
        `;
    }

    static generateTableOfContents() {
        const headings = document.querySelectorAll('.preview-content h1, .preview-content h2, .preview-content h3');

        if (headings.length === 0) {
            return '<div style="page-break-after: always;"><h2>Table des matières</h2><p>Aucun titre trouvé.</p></div>';
        }

        let toc = '<div style="page-break-after: always; padding: 20px 0;"><h2 style="color: #1A2A3A; margin-bottom: 20px;">Table des matières</h2><ul style="list-style: none; padding: 0;">';
        headings.forEach((heading, index) => {
            const level = parseInt(heading.tagName[1], 10);
            const margin = (level - 1) * 24;
            const id = `heading-${index}`;
            heading.id = id;
            toc += `<li style="margin-left: ${margin}px; margin-bottom: 8px;"><a href="#${id}" style="color: #1A2A3A; text-decoration: none;">${heading.textContent}</a></li>`;
        });
        toc += '</ul></div>';

        return toc;
    }
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ Cover Page Generator chargé');
});
