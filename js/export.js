// ===== EXPORT MANAGER =====

class ExportManager {
    static getContent() {
        return document.getElementById('editor').value;
    }

    static getTitle() {
        return document.getElementById('docTitle').value || 'document';
    }

    static getPreviewHTML() {
        return document.getElementById('preview').innerHTML;
    }

    // ===== EXPORT PDF =====
    static exportPDF() {
        const title = this.getTitle();
        const author = document.getElementById('inputAuthor').value || 'Auteur';
        const date = document.getElementById('inputDate').value || new Date().toLocaleDateString();
        const hasCover = document.getElementById('chkCover').checked;
        const hasTOC = document.getElementById('chkTOC').checked;

        let htmlContent = `
            <div style="font-family: Arial, sans-serif; padding: 40px; max-width: 900px; margin: 0 auto;">
        `;

        // Couverture
        if (hasCover) {
            htmlContent += `
                <div style="page-break-after: always; text-align: center; padding: 100px 0;">
                    <h1 style="color: #1A2A3A; font-size: 48px; margin-bottom: 20px;">${title}</h1>
                    <p style="color: #E67E22; font-size: 18px; margin: 20px 0;">Par ${author}</p>
                    <p style="color: #666; font-size: 14px; margin-top: 40px;">${date}</p>
                </div>
            `;
        }

        // Table des matières
        if (hasTOC) {
            htmlContent += '<div style="page-break-after: always;"><h2 style="color: #1A2A3A;">Table des matières</h2></div>';
        }

        // Contenu principal
        htmlContent += this.getPreviewHTML();
        htmlContent += '</div>';

        const element = document.createElement('div');
        element.innerHTML = htmlContent;

        const opt = {
            margin: 15,
            filename: `${title}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' }
        };

        html2pdf().set(opt).from(element).save();
        UIManager.showToast('✅ PDF exporté', 'success');
        UIManager.closeModal('modalExport');
    }

    // ===== EXPORT HTML =====
    static exportHTML() {
        const title = this.getTitle();
        const author = document.getElementById('inputAuthor').value || 'Auteur';
        const content = this.getPreviewHTML();

        const htmlDocument = `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.8;
            color: #333;
            background: #f5f5f5;
            padding: 20px;
        }
        .container {
            max-width: 900px;
            margin: 0 auto;
            background: white;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        h1, h2, h3 { color: #1A2A3A; margin: 1.5em 0 0.5em 0; }
        h1 { font-size: 2.2em; border-bottom: 3px solid #E67E22; padding-bottom: 10px; }
        h2 { font-size: 1.8em; border-bottom: 2px solid #E67E22; padding-bottom: 8px; }
        h3 { font-size: 1.4em; }
        p { margin: 1em 0; }
        code {
            background: #f4f4f4;
            padding: 2px 6px;
            border-radius: 3px;
            color: #E67E22;
            font-family: 'Monaco', 'Menlo', monospace;
        }
        pre {
            background: #1A2A3A;
            color: #fff;
            padding: 15px;
            border-radius: 6px;
            overflow-x: auto;
            margin: 1em 0;
        }
        blockquote {
            border-left: 4px solid #E67E22;
            padding-left: 20px;
            margin: 1em 0;
            color: #666;
            font-style: italic;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 1em 0;
        }
        th, td {
            padding: 12px;
            text-align: left;
            border: 1px solid #ddd;
        }
        th {
            background: #1A2A3A;
            color: #E67E22;
            font-weight: 600;
        }
        a {
            color: #E67E22;
            text-decoration: none;
            border-bottom: 1px dotted #E67E22;
        }
        a:hover { color: #D35400; }
        .header {
            border-bottom: 2px solid #E67E22;
            padding-bottom: 20px;
            margin-bottom: 40px;
        }
        .meta {
            color: #999;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${title}</h1>
            <div class="meta">
                Par <strong>${author}</strong> | ${new Date().toLocaleDateString()}
            </div>
        </div>
        <div class="content">
            ${content}
        </div>
    </div>
</body>
</html>
        `;

        const blob = new Blob([htmlDocument], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${title}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        UIManager.showToast('✅ HTML exporté', 'success');
        UIManager.closeModal('modalExport');
    }

    // ===== EXPORT MARKDOWN =====
    static exportMarkdown() {
        const title = this.getTitle();
        const content = this.getContent();
        const blob = new Blob([content], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${title}.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        UIManager.showToast('✅ Markdown exporté', 'success');
        UIManager.closeModal('modalExport');
    }

    // ===== EXPORT WORD (DOCX) =====
    static exportWord() {
        try {
            if (typeof docx === 'undefined') {
                UIManager.showToast('❌ Librairie DOCX manquante', 'error');
                return;
            }

            const title = this.getTitle();
            const content = this.getContent();
            const author = document.getElementById('inputAuthor').value || 'Auteur';

            // Conversion simple du Markdown en paragraphes DOCX
            const paragraphs = content.split('\n').map(line => {
                if (line.startsWith('# ')) {
                    return new docx.Paragraph({
                        text: line.replace('# ', ''),
                        heading: docx.HeadingLevel.HEADING_1,
                        size: 48,
                        bold: true,
                        color: '1A2A3A'
                    });
                } else if (line.startsWith('## ')) {
                    return new docx.Paragraph({
                        text: line.replace('## ', ''),
                        heading: docx.HeadingLevel.HEADING_2,
                        size: 36,
                        bold: true
                    });
                } else if (line.trim() === '') {
                    return new docx.Paragraph('');
                } else {
                    return new docx.Paragraph(line);
                }
            });

            const doc = new docx.Document({
                sections: [{
                    properties: {},
                    children: [
                        new docx.Paragraph({
                            text: title,
                            heading: docx.HeadingLevel.HEADING_1,
                            size: 48,
                            bold: true
                        }),
                        new docx.Paragraph({
                            text: `Par ${author}`,
                            size: 24,
                            color: 'E67E22'
                        }),
                        new docx.Paragraph(''),
                        ...paragraphs
                    ]
                }]
            });

            docx.Packer.toBlob(doc).then(blob => {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${title}.docx`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                UIManager.showToast('✅ Word exporté', 'success');
                UIManager.closeModal('modalExport');
            });
        } catch (e) {
            console.error('Erreur export Word:', e);
            UIManager.showToast('❌ Erreur lors de l\'export Word', 'error');
        }
    }

    // ===== EXPORT JSON =====
    static exportJSON() {
        const title = this.getTitle();
        const content = this.getContent();
        const author = document.getElementById('inputAuthor').value || 'Auteur';
        const date = document.getElementById('inputDate').value || new Date().toISOString();

        const data = {
            metadata: {
                title,
                author,
                date,
                createdAt: new Date().toISOString(),
                wordCount: content.split(/\s+/).length,
                characterCount: content.length
            },
            content,
            theme: document.body.getAttribute('data-theme')
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${title}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        UIManager.showToast('✅ JSON exporté', 'success');
        UIManager.closeModal('modalExport');
    }
}
