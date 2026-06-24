// ===== ONYX REPORTS - APPLICATION PRINCIPALE =====

class OnyxReports {
    static PREVIEW_BASE_FONT_SIZE = 14;

    constructor() {
        this.editor = document.getElementById('editor');
        this.preview = document.getElementById('preview');
        this.previewScaler = document.getElementById('previewScaler');
        this.previewPane = document.getElementById('previewPane');
        this.docTitle = document.getElementById('docTitle');
        this.wordCount = document.getElementById('wordCount');
        
        this.currentView = 'split'; // 'edit', 'split', 'preview'
        this.editorMode = localStorage.getItem('onyx_editor_mode') || 'markdown'; // 'markdown' | 'classic'
        this.currentZoom = parseInt(localStorage.getItem('onyx_zoom'), 10) || 100;
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
        this.setupSettings();
        this.setupEditorMode();
        this.setDefaultDate();
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
        const classicPane = document.getElementById('classicPane');
        const previewPane = document.getElementById('previewPane');

        const getActiveEditorPane = () => {
            return this.editorMode === 'classic' ? classicPane : editorPane;
        };

        btnEditOnly.addEventListener('click', () => {
            this.currentView = 'edit';
            editorPane.classList.add('hidden');
            classicPane.classList.add('hidden');
            getActiveEditorPane().classList.remove('hidden');
            previewPane.classList.add('hidden');
            document.querySelector('.editor-container').className = 'editor-container view-edit';
            this.updateViewButtons();
        });

        btnSplit.addEventListener('click', () => {
            this.currentView = 'split';
            editorPane.classList.add('hidden');
            classicPane.classList.add('hidden');
            getActiveEditorPane().classList.remove('hidden');
            previewPane.classList.remove('hidden');
            document.querySelector('.editor-container').className = 'editor-container view-split';
            this.updateViewButtons();
        });

        btnPreviewOnly.addEventListener('click', () => {
            this.currentView = 'preview';
            editorPane.classList.add('hidden');
            classicPane.classList.add('hidden');
            previewPane.classList.remove('hidden');
            document.querySelector('.editor-container').className = 'editor-container view-preview';
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

        btnZoomOut.addEventListener('click', () => {
            this.setZoom(this.currentZoom - 10);
        });

        btnZoomIn.addEventListener('click', () => {
            this.setZoom(this.currentZoom + 10);
        });

        btnZoomReset.addEventListener('click', () => {
            this.setZoom(100);
        });

        this.setupPreviewWheelZoom();
        this.applyZoom();
    }

    setZoom(level) {
        this.currentZoom = Math.max(50, Math.min(200, level));
        localStorage.setItem('onyx_zoom', this.currentZoom);
        this.applyZoom();
    }

    setupPreviewWheelZoom() {
        if (!this.previewPane) return;

        this.previewPane.addEventListener('wheel', (e) => {
            if (!e.ctrlKey && !e.metaKey) return;
            e.preventDefault();
            const delta = e.deltaY < 0 ? 10 : -10;
            this.setZoom(this.currentZoom + delta);
        }, { passive: false });
    }

    isEditableTarget(target) {
        return target === this.editor
            || target?.id === 'classicEditor'
            || target?.isContentEditable;
    }

    // ===== ZOOM =====
    applyZoom() {
        const scale = this.currentZoom / 100;
        const scaler = this.previewScaler;
        const preview = this.preview;

        if (!scaler || !preview) return;

        scaler.style.zoom = '';
        scaler.style.transform = '';
        scaler.style.width = '';
        scaler.style.marginBottom = '';
        preview.style.fontSize = `${OnyxReports.PREVIEW_BASE_FONT_SIZE}px`;

        if (scale === 1) {
            document.getElementById('zoomLevel').textContent = '100%';
            return;
        }

        if (CSS.supports('zoom', '1')) {
            scaler.style.zoom = String(scale);
        } else {
            preview.style.fontSize = `${OnyxReports.PREVIEW_BASE_FONT_SIZE * scale}px`;
        }

        document.getElementById('zoomLevel').textContent = `${this.currentZoom}%`;
    }


    // ===== PAGINATION =====
    setupPagination() {
        const btnPrevPage = document.getElementById('btnPrevPage');
        const btnNextPage = document.getElementById('btnNextPage');

        btnPrevPage.addEventListener('click', () => {
            if (this.currentPage > 1) {
                this.currentPage--;
                this.scrollToPage();
                this.updatePaginationDisplay();
            }
        });

        btnNextPage.addEventListener('click', () => {
            if (this.currentPage < this.totalPages) {
                this.currentPage++;
                this.scrollToPage();
                this.updatePaginationDisplay();
            }
        });
    }

    scrollToPage() {
        const wordsPerPage = 250;
        const content = this.editor.value;
        const words = content.trim().split(/\s+/).filter(w => w.length > 0);
        const startWord = (this.currentPage - 1) * wordsPerPage;

        if (startWord >= words.length) return;

        const targetText = words.slice(0, startWord).join(' ');
        const position = targetText.length + (startWord > 0 ? 1 : 0);

        if (this.editorMode === 'classic' && ClassicEditorManager.isActive) {
            const classicEditor = document.getElementById('classicEditor');
            if (classicEditor) {
                classicEditor.scrollTop = (this.currentPage - 1) * classicEditor.clientHeight * 0.8;
            }
        } else {
            this.editor.focus();
            this.editor.setSelectionRange(position, position);
            const lineHeight = parseInt(getComputedStyle(this.editor).lineHeight, 10) || 20;
            this.editor.scrollTop = Math.max(0, (this.currentPage - 1) * lineHeight * 15);
        }
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

            if (this.isEditableTarget(e.target)) return;

            // 1 = Réinitialiser le zoom
            if (e.key === '1' && !e.ctrlKey && !e.metaKey && !e.altKey) {
                e.preventDefault();
                this.setZoom(100);
            }

            // Ctrl/Cmd + = / - = Zoom
            if ((e.ctrlKey || e.metaKey) && (e.key === '=' || e.key === '+')) {
                e.preventDefault();
                this.setZoom(this.currentZoom + 10);
            }

            if ((e.ctrlKey || e.metaKey) && e.key === '-') {
                e.preventDefault();
                this.setZoom(this.currentZoom - 10);
            }

            if ((e.ctrlKey || e.metaKey) && e.key === '0') {
                e.preventDefault();
                this.setZoom(100);
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

    // ===== EDITOR MODE (Markdown / Classique) =====
    setupEditorMode() {
        const btnMarkdown = document.getElementById('btnEditorMarkdown');
        const btnClassic = document.getElementById('btnEditorClassic');
        const markdownPane = document.getElementById('editorPane');
        const classicPane = document.getElementById('classicPane');

        if (!btnMarkdown || !btnClassic) return;

        const applyMode = (mode) => {
            this.editorMode = mode;
            localStorage.setItem('onyx_editor_mode', mode);

            const previewPane = document.getElementById('previewPane');
            const container = document.querySelector('.editor-container');
            const isPreviewOnly = container.classList.contains('view-preview');
            const isEditOnly = container.classList.contains('view-edit');

            if (mode === 'classic') {
                ClassicEditorManager.activate();
                markdownPane.classList.add('hidden');
                if (!isPreviewOnly) classicPane.classList.remove('hidden');
                btnClassic.classList.add('active');
                btnMarkdown.classList.remove('active');
            } else {
                ClassicEditorManager.deactivate();
                classicPane.classList.add('hidden');
                if (!isPreviewOnly) markdownPane.classList.remove('hidden');
                btnMarkdown.classList.add('active');
                btnClassic.classList.remove('active');
            }

            if (isPreviewOnly) {
                markdownPane.classList.add('hidden');
                classicPane.classList.add('hidden');
                previewPane.classList.remove('hidden');
            }
        };

        btnMarkdown.addEventListener('click', () => applyMode('markdown'));
        btnClassic.addEventListener('click', () => applyMode('classic'));
        applyMode(this.editorMode);
    }

    // ===== PARAMÈTRES =====
    setupSettings() {
        const chkAutoSave = document.getElementById('chkAutoSave');
        const chkSpellCheck = document.getElementById('chkSpellCheck');

        const autoSaveEnabled = localStorage.getItem('onyx_autosave') !== 'false';
        if (chkAutoSave) {
            chkAutoSave.checked = autoSaveEnabled;
            chkAutoSave.addEventListener('change', () => {
                localStorage.setItem('onyx_autosave', chkAutoSave.checked);
                UIManager.showToast(
                    chkAutoSave.checked ? '✅ Auto-sauvegarde activée' : 'ℹ️ Auto-sauvegarde désactivée',
                    'success'
                );
            });
        }

        if (chkSpellCheck) {
            chkSpellCheck.checked = this.editor.spellcheck;
            chkSpellCheck.addEventListener('change', () => {
                this.editor.spellcheck = chkSpellCheck.checked;
                const classicEditor = document.getElementById('classicEditor');
                if (classicEditor) classicEditor.spellcheck = chkSpellCheck.checked;
            });
        }
    }

    isAutoSaveEnabled() {
        return localStorage.getItem('onyx_autosave') !== 'false';
    }

    setDefaultDate() {
        const dateInput = document.getElementById('inputDate');
        if (dateInput && !dateInput.value) {
            dateInput.value = new Date().toISOString().split('T')[0];
        }
    }

    // ===== AUTO-SAVE =====
    setupAutoSave() {
        setInterval(() => {
            if (this.isDirty && this.isAutoSaveEnabled()) {
                this.saveToLocalStorage();
                this.isDirty = false;
                console.log('💾 Auto-save');
            }
        }, 30000);
    }

    // ===== PREVIEW =====
    updatePreview() {
        const markdown = this.editor.value;
        const html = marked.parse(markdown);
        this.preview.innerHTML = html;

        // Highlight code blocks (optionnel)
        this.highlightCode();
        if (typeof DocumentStyleManager !== 'undefined') {
            DocumentStyleManager.applyToPreview();
        }
        this.applyZoom();
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
            editorMode: this.editorMode,
            documentStyle: DocumentStyleManager?.getExportData() || null,
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
                if (doc.editorMode) {
                    this.editorMode = doc.editorMode;
                    localStorage.setItem('onyx_editor_mode', doc.editorMode);
                }
                if (doc.documentStyle && typeof DocumentStyleManager !== 'undefined') {
                    DocumentStyleManager.importSettings(doc.documentStyle);
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
