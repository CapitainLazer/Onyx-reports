// ===== EDITOR MANAGER =====

class EditorManager {
    static editor = document.getElementById('editor');
    static preview = document.getElementById('preview');
    static history = [];
    static historyIndex = -1;

    // ===== INSERT MARKDOWN =====
    static insertMarkdown(before, placeholder, after = '') {
        const textarea = this.editor;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = textarea.value.substring(start, end);
        const textBefore = textarea.value.substring(0, start);
        const textAfter = textarea.value.substring(end);

        const newText = selectedText || placeholder;
        const finalText = textBefore + before + newText + (after || before) + textAfter;

        this.setValue(finalText);
        textarea.focus();
        textarea.selectionStart = start + before.length;
        textarea.selectionEnd = start + before.length + newText.length;

        this.saveToHistory();
    }

    // ===== INSERT CODE BLOCK =====
    static insertCodeBlock() {
        const start = this.editor.selectionStart;
        const codeBlock = '```\n// Code here\n```';
        
        const textBefore = this.editor.value.substring(0, start);
        const textAfter = this.editor.value.substring(start);
        
        this.setValue(textBefore + '\n' + codeBlock + '\n' + textAfter);
        this.saveToHistory();
    }

    // ===== INSERT TABLE =====
    static insertTable() {
        const table = `| Colonne 1 | Colonne 2 | Colonne 3 |
|-----------|-----------|-----------|
| Donnée 1  | Donnée 2  | Donnée 3  |
| Donnée 4  | Donnée 5  | Donnée 6  |`;

        const start = this.editor.selectionStart;
        const textBefore = this.editor.value.substring(0, start);
        const textAfter = this.editor.value.substring(start);
        
        this.setValue(textBefore + '\n' + table + '\n' + textAfter);
        this.saveToHistory();
    }

    // ===== INSERT SEPARATOR =====
    static insertSeparator() {
        const start = this.editor.selectionStart;
        const textBefore = this.editor.value.substring(0, start);
        const textAfter = this.editor.value.substring(start);
        
        this.setValue(textBefore + '\n\n---\n\n' + textAfter);
        this.saveToHistory();
    }

    // ===== SET/GET VALUE =====
    static setValue(value) {
        this.editor.value = value;
        this.editor.dispatchEvent(new Event('input', { bubbles: true }));
    }

    static getValue() {
        return this.editor.value;
    }

    // ===== UNDO/REDO =====
    static saveToHistory() {
        this.historyIndex++;
        if (this.historyIndex < this.history.length) {
            this.history.length = this.historyIndex;
        }
        this.history.push(this.getValue());
    }

    static undo() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            this.setValue(this.history[this.historyIndex]);
        }
    }

    static redo() {
        if (this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
            this.setValue(this.history[this.historyIndex]);
        }
    }

    // ===== ACTIONS RAPIDES =====
    static copyText() {
        const text = this.getValue();
        navigator.clipboard.writeText(text).then(() => {
            UIManager.showToast('✅ Texte copié', 'success');
        });
    }

    static clearEditor() {
        if (confirm('Êtes-vous sûr ? Cette action est irréversible.')) {
            this.setValue('');
            this.history = [''];
            this.historyIndex = 0;
        }
    }

    // ===== NOUVEAU DOCUMENT =====
    static newDocument() {
        if (confirm('Créer un nouveau document ? Les modifications seront perdues.')) {
            this.setValue('');
            document.getElementById('docTitle').value = 'Sans titre';
            this.history = [''];
            this.historyIndex = 0;
            UIManager.closeModal('modalNewDoc');
            UIManager.showToast('✅ Nouveau document créé', 'success');
        }
    }

    // ===== CHARGER FICHIER =====
    static loadFromFile() {
        const fileInput = document.getElementById('fileInput');
        const file = fileInput.files[0];

        if (!file) {
            UIManager.showToast('❌ Aucun fichier sélectionné', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target.result;
            this.setValue(content);
            document.getElementById('docTitle').value = file.name.split('.')[0];
            this.saveToHistory();
            UIManager.closeModal('modalLoadDoc');
            UIManager.showToast('✅ Fichier chargé', 'success');
        };
        reader.readAsText(file);
    }

    // ===== TÉLÉCHARGER =====
    static downloadAsMarkdown() {
        const title = document.getElementById('docTitle').value || 'document';
        const content = this.getValue();
        const blob = new Blob([content], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${title}.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        UIManager.showToast('✅ Document téléchargé', 'success');
    }
}

// Initialisation au chargement
document.addEventListener('DOMContentLoaded', () => {
    EditorManager.saveToHistory();
});
