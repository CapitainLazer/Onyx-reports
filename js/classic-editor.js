// ===== CLASSIC EDITOR (WYSIWYG) =====

class ClassicEditorManager {
    static pane = null;
    static editor = null;
    static isActive = false;

    static init() {
        this.pane = document.getElementById('classicPane');
        this.editor = document.getElementById('classicEditor');
        if (!this.pane || !this.editor) return;

        this.editor.addEventListener('input', () => {
            this.syncToMarkdown();
        });

        this.editor.addEventListener('paste', (e) => {
            e.preventDefault();
            const text = e.clipboardData.getData('text/plain');
            document.execCommand('insertText', false, text);
        });
    }

    static activate() {
        if (!this.editor) return;
        this.isActive = true;
        const markdown = EditorManager.getValue();
        this.editor.innerHTML = typeof marked !== 'undefined'
            ? marked.parse(markdown)
            : markdown.replace(/\n/g, '<br>');
    }

    static deactivate() {
        if (!this.isActive) return;
        this.syncToMarkdown();
        this.isActive = false;
    }

    static syncToMarkdown() {
        if (!this.editor || typeof TurndownService === 'undefined') return;

        const turndown = new TurndownService({
            headingStyle: 'atx',
            codeBlockStyle: 'fenced'
        });

        const html = this.editor.innerHTML;
        const markdown = turndown.turndown(html);
        EditorManager.setValue(markdown, false);
    }

    static execCommand(command, value = null) {
        if (!this.isActive || !this.editor) return;
        this.editor.focus();
        document.execCommand(command, false, value);
        this.syncToMarkdown();
    }

    static insertHeading(level) {
        this.execCommand('formatBlock', `h${level}`);
    }

    static insertLink() {
        const url = prompt('URL du lien :', 'https://');
        if (url) this.execCommand('createLink', url);
    }

    static insertImage() {
        const url = prompt('URL de l\'image :', 'https://');
        if (url) this.execCommand('insertImage', url);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    ClassicEditorManager.init();
});
