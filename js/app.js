// ===== ONYX REPORTS - APPLICATION PRINCIPALE =====

class OnyxReports {
    constructor() {
        this.editor = document.getElementById('editor');
        this.preview = document.getElementById('preview');
        this.docTitle = document.getElementById('docTitle');
        this.wordCount = document.getElementById('wordCount');
        
        this.currentView = 'split'; // 'edit', 'split', 'preview'
        this.currentZoom = 100;
        this.currentPage = 1;
        this.totalPages = 1;
        this.isDirty = false;
        this.autoSaveTimer = null;
        
        this.init();
    }

    init() {
        // Validation des librairies
        if (typeof marked === 'undefined') {
            console.error('❌ marked.js non chargé');
            return;
        }
        if (typeof html2pdf === 'undefined') {
            console.error('❌ html2pdf.js non chargé');
            return;
        }

        // Initialisation
        this.loadFromLocalStorage();
        this.setupEventListeners();
        this.setupViewSwitcher();
        this.setupZoom();
        this.setupPagination();
        this.setupToolbar();
        this.setupKeyboardShortcuts();
        this.setupExportButtons();
        this.setupActionButtons();
        this.setupAutoSave();
        this.updatePreview();
        this.updateStats();

        console.log('✅ Onyx Reports initialisé');
    }

    // ===== EVENT LISTENERS =====
    setupEventListeners() {
        // Édition
        this.editor.addEventListener('input', () => {
            this.isDirty = true;
            this.updatePreview();
            this.updateStats();
            this.calculatePages();
        });

        this.docTitle.addEventListener('input', () => {
            this.isDirty = true;
        });

        // Titre - Maj du compteur
        this.editor.addEventListener('input', (e) => {
            const words = this.countWords(e.target.value);
            this.wordCount.textContent = `${words} mots`;
        });
    }

    // ===== VUE SWITCHER =====
    setupViewSwitcher() {
        const btnEditOnly = document.getElementById('btnEditOnly');
        const btnSplit = document.getElementById('btnSplit');
        const btnPreviewOnly = document.getElementById('btnPreviewOnly');
        const editorPane = document.getElementById('editorPane');
        const previewPane = document.getElementById('previewPane');

        btnEditOnly.addEventListener('click', () => {
            this.currentView = 'edit';
            editorPane.classList.remove('hidden');
            previewPane.classList.add('hidden');
            this.updateViewButtons();
        });

        btnSplit.addEventListener('click', () => {
            this.currentView = 'split';
            editorPane.classList.remove('hidden');
            previewPane.classList.remove('hidden');
            this.updateViewButtons();
        });

        btnPreviewOnly.addEventListener('click', () => {
            this.currentView = 'preview';
            editorPane.classList.add('hidden');
            previewPane.classList.remove('hidden');
            this.updateViewButtons();
        });
    }

    updateViewButtons() {
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        if (this.currentView === 'edit') {
            document.getElementById('btnEditOnly').classList.add('active');
        } else if (this.currentView === 'split') {
            document.getElementById('btnSplit').classList.add('active');
        } else {
            document.getElementById('btnPreviewOnly').classList.add('active');
        }
    }

    // ===== ZOOM =====
    setupZoom() {
        const btnZoomOut = document.getElementById('btnZoomOut');
        const btnZoomIn = document.getElementById('btnZoomIn');
        const btnZoomReset = document.getElementById('btnZoomReset');
        const zoomLevel = document.getElementById('zoomLevel');

        btnZoomOut.addEventListener('click', () => {
            this.currentZoom = Math.max(50, this.currentZoom - 10);
            this.applyZoom();
            zoomLevel.textContent = `${this.currentZoom}%`;
        });

        btnZoomIn.addEventListener('click', () => {
            this.currentZoom = Math.min(200, this.currentZoom + 10);
            this.applyZoom();
            zoomLevel.textContent = `${this.currentZoom}%`;
        });

        btnZoomReset.addEventListener('click', () => {
            this.currentZoom = 100;
            this.applyZoom();
            zoomLevel.textContent = '100%';
        });
    }

    // ===== ZOOM =====
    applyZoom() {
        const scale = this.currentZoom / 100;
        
        // ✅ Scale SEULEMENT la preview-pane, pas le main-container
        const previewPane = document.querySelector('.preview-pane');
        
        if (previewPane) {
            previewPane.style.transform = `scale(${scale})`;
            previewPane.style.transformOrigin = 'top left';
            previewPane.style.width = `${100 / scale}%`;
        }
        
        // Met à jour l'affichage du zoom
        document.getElementById('zoomLevel').textContent = this.currentZoom + '%';
    }


    // ===== PAGINATION =====
    setupPagination() {
        const btnPrevPage = document.getElementById('btnPrevPage');
        const btnNextPage = document.getElementById('btnNextPage');

        btnPrevPage.addEventListener('click', () => {
            if (this.currentPage > 1) {
                this.currentPage--;
                this.updatePaginationDisplay();
            }
        });

        btnNextPage.addEventListener('click', () => {
            if (this.currentPage < this.totalPages) {
                this.currentPage++;
                this.updatePaginationDisplay();
            }
        });
    }

    updatePaginationDisplay() {
        document.getElementById('pageInput').value = this.currentPage;
        document.getElementById('btnPrevPage').disabled = this.currentPage === 1;
        document.getElementById('btnNextPage').disabled = this.currentPage >= this.totalPages;
    }

    // ===== TOOLBAR (BOUTONS D'ÉDITION) =====
    setupToolbar() {
        // Gestion des boutons toolbar dans EditorManager
    }

    // ===== RACCOURCIS CLAVIER =====
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + B = Gras
            if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
                e.preventDefault();
                EditorManager.insertMarkdown('**', 'gras');
            }

            // Ctrl/Cmd + I = Italique
            if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
                e.preventDefault();
                EditorManager.insertMarkdown('*', 'italique');
            }

            // Ctrl/Cmd + Z = Annuler
            if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
                e.preventDefault();
                EditorManager.undo();
            }

            // Ctrl/Cmd + Y = Refaire
            if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
                e.preventDefault();
                EditorManager.redo();
            }

            // Ctrl/Cmd + S = Sauvegarder
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                this.saveToLocalStorage();
                UIManager.showToast('✅ Document sauvegardé', 'success');
            }

            // Ctrl/Cmd + N = Nouveau
            if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
                e.preventDefault();
                UIManager.openModal('modalNewDoc');
            }

            // Ctrl/Cmd + E = Exporter
            if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
                e.preventDefault();
                UIManager.openModal('modalExport');
            }

            // Ctrl/Cmd + H = Aide
            if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
                e.preventDefault();
                UIManager.openModal('modalHelp');
            }
        });
    }

    // ===== EXPORT =====
    setupExportButtons() {
        const btnExport = document.getElementById('btnExport');
        btnExport.addEventListener('click', () => {
            UIManager.openModal('modalExport');
        });
    }

    // ===== ACTION BUTTONS =====
    setupActionButtons() {
        // Nouveau
        document.getElementById('btnNew').addEventListener('click', () => {
            UIManager.openModal('modalNewDoc');
        });

        // Sauvegarder
        document.getElementById('btnSave').addEventListener('click', () => {
            EditorManager.downloadAsMarkdown();
        });

        // Charger
        document.getElementById('btnLoad').addEventListener('click', () => {
            UIManager.openModal('modalLoadDoc');
        });

        // Paramètres
        document.getElementById('btnSettings').addEventListener('click', () => {
            UIManager.openModal('modalSettings');
        });

        // Aide
        document.getElementById('btnHelp').addEventListener('click', () => {
            UIManager.openModal('modalHelp');
        });
    }

    // ===== AUTO-SAVE =====
    setupAutoSave() {
        setInterval(() => {
            if (this.isDirty) {
                this.saveToLocalStorage();
                this.isDirty = false;
                console.log('💾 Auto-save');
            }
        }, 30000); // Toutes les 30 secondes
    }

    // ===== PREVIEW =====
    updatePreview() {
        const markdown = this.editor.value;
        const html = marked.parse(markdown);
        this.preview.innerHTML = html;

        // Highlight code blocks (optionnel)
        this.highlightCode();
    }

    highlightCode() {
        document.querySelectorAll('pre code').forEach((block) => {
            if (typeof Prism !== 'undefined') {
                Prism.highlightElement(block);
            }
        });
    }

    // ===== STATISTIQUES =====
    updateStats() {
        const content = this.editor.value;
        
        const words = this.countWords(content);
        const chars = content.length;
        const paras = content.split('\n\n').filter(p => p.trim()).length;
        const pages = Math.ceil(words / 250); // ~250 mots par page
        const readTime = Math.ceil(words / 200); // ~200 mots/min

        document.getElementById('statWords').textContent = words;
        document.getElementById('statChars').textContent = chars;
        document.getElementById('statParas').textContent = paras;
        document.getElementById('statPages').textContent = pages;
        document.getElementById('statReadTime').textContent = `${readTime}m`;

        this.totalPages = pages;
        this.updatePaginationDisplay();
    }

    countWords(text) {
        return text.trim().split(/\s+/).filter(w => w.length > 0).length;
    }

    // ===== PAGINATION CALCULS =====
    calculatePages() {
        const words = this.countWords(this.editor.value);
        this.totalPages = Math.max(1, Math.ceil(words / 250));
        this.updatePaginationDisplay();
    }

    // ===== STOCKAGE LOCAL =====
    saveToLocalStorage() {
        const data = {
            title: this.docTitle.value,
            content: this.editor.value,
            theme: document.body.getAttribute('data-theme'),
            timestamp: new Date().toISOString()
        };
        localStorage.setItem('onyx_doc', JSON.stringify(data));
        console.log('✅ Sauvegardé');
    }

    loadFromLocalStorage() {
        const data = localStorage.getItem('onyx_doc');
        if (data) {
            try {
                const doc = JSON.parse(data);
                this.docTitle.value = doc.title || 'Sans titre';
                this.editor.value = doc.content || '';
                if (doc.theme) {
                    ThemesManager.applyTheme(doc.theme);
                }
            } catch (e) {
                console.error('Erreur chargement:', e);
            }
        }
    }
}

// ===== INITIALISATION =====
document.addEventListener('DOMContentLoaded', () => {
    window.app = new OnyxReports();
});
