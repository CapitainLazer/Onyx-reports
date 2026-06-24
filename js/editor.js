// ===== EDITOR MANAGER =====

class EditorManager {
    static editor = document.getElementById('editor');
    static preview = document.getElementById('preview');
    static history = [];
    static historyIndex = -1;

    // ===== INSERT MARKDOWN =====
    static insertMarkdown(before, placeholder, after = '') {
        if (ClassicEditorManager.isActive) {
            this.insertClassicFormat(before, placeholder, after);
            return;
        }

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
    static insertClassicFormat(before, placeholder, after = '') {
        const map = {
            '# ': () => ClassicEditorManager.insertHeading(1),
            '## ': () => ClassicEditorManager.insertHeading(2),
            '### ': () => ClassicEditorManager.insertHeading(3),
            '**': () => ClassicEditorManager.execCommand('bold'),
            '*': () => ClassicEditorManager.execCommand('italic'),
            '~~': () => ClassicEditorManager.execCommand('strikeThrough'),
            '- ': () => ClassicEditorManager.execCommand('insertUnorderedList'),
            '1. ': () => ClassicEditorManager.execCommand('insertOrderedList'),
            '> ': () => ClassicEditorManager.execCommand('formatBlock', 'blockquote'),
            '[': () => ClassicEditorManager.insertLink(),
            '![alt](': () => ClassicEditorManager.insertImage()
        };

        if (map[before]) {
            map[before]();
        } else {
            ClassicEditorManager.execCommand('insertText', false, before + (placeholder || '') + (after || before));
        }
    }

    static insertCodeBlock() {
        if (ClassicEditorManager.isActive) {
            ClassicEditorManager.execCommand('insertHTML', false, '<pre><code>// Code ici</code></pre>');
            return;
        }

        const start = this.editor.selectionStart;
        const codeBlock = '```\n// Code here\n```';
        
        const textBefore = this.editor.value.substring(0, start);
        const textAfter = this.editor.value.substring(start);
        
        this.setValue(textBefore + '\n' + codeBlock + '\n' + textAfter);
        this.saveToHistory();
    }

    // ===== INSERT TABLE =====
    static insertTable() {
        if (ClassicEditorManager.isActive) {
            const table = '<table border="1" style="width:100%;border-collapse:collapse"><tr><td>Colonne 1</td><td>Colonne 2</td><td>Colonne 3</td></tr><tr><td>Donnée 1</td><td>Donnée 2</td><td>Donnée 3</td></tr></table>';
            ClassicEditorManager.execCommand('insertHTML', false, table);
            return;
        }

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
    static setValue(value, triggerInput = true, skipClassicRefresh = false) {
        this.editor.value = value;
        if (ClassicEditorManager.isActive && !skipClassicRefresh) {
            ClassicEditorManager.activate();
        }
        if (triggerInput) {
            this.editor.dispatchEvent(new Event('input', { bubbles: true }));
        }
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
        if (ClassicEditorManager.isActive) {
            ClassicEditorManager.syncToMarkdown();
        }
        if (this.historyIndex > 0) {
            this.historyIndex--;
            this.setValue(this.history[this.historyIndex]);
            if (ClassicEditorManager.isActive) {
                ClassicEditorManager.activate();
            }
        }
    }

    static redo() {
        if (ClassicEditorManager.isActive) {
            ClassicEditorManager.syncToMarkdown();
        }
        if (this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
            this.setValue(this.history[this.historyIndex]);
            if (ClassicEditorManager.isActive) {
                ClassicEditorManager.activate();
            }
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
        this.setValue('');
        document.getElementById('docTitle').value = 'Sans titre';
        this.history = [''];
        this.historyIndex = 0;
        if (ClassicEditorManager.isActive) {
            ClassicEditorManager.activate();
        }
        UIManager.closeModal('modalNewDoc');
        UIManager.showToast('✅ Nouveau document créé', 'success');
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
            let content = e.target.result;
            let title = file.name.replace(/\.[^.]+$/, '');

            if (file.name.endsWith('.json')) {
                try {
                    const data = JSON.parse(content);
                    content = data.content || '';
                    title = data.metadata?.title || data.title || title;
                    if (data.metadata?.author) {
                        document.getElementById('inputAuthor').value = data.metadata.author;
                    }
                    if (data.metadata?.date) {
                        document.getElementById('inputDate').value = data.metadata.date.split('T')[0];
                    }
                    if (data.theme) {
                        ThemesManager.applyTheme(data.theme);
                    }
                } catch (err) {
                    UIManager.showToast('❌ Fichier JSON invalide', 'error');
                    return;
                }
            }

            this.setValue(content);
            document.getElementById('docTitle').value = title;
            this.saveToHistory();
            if (ClassicEditorManager.isActive) {
                ClassicEditorManager.activate();
            }
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
