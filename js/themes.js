// ===== THEMES MANAGER =====

class ThemesManager {
    static currentTheme = localStorage.getItem('onyx_theme') || 'light';
    static themes = ['light', 'dark', 'industrial', 'minimal'];

    static init() {
        this.loadTheme();
        this.setupThemeButtons();
        console.log('✅ Themes Manager initialisé');
    }

    static loadTheme() {
        const savedTheme = localStorage.getItem('onyx_theme') || 'light';
        this.applyTheme(savedTheme);
    }

    static setTheme(theme) {
        this.applyTheme(theme);
    }

    static applyTheme(theme) {
        if (!this.themes.includes(theme)) theme = 'light';

        // Ajouter classe pour transition
        document.body.classList.add('theme-transitioning');
        
        // Appliquer le thème
        document.body.setAttribute('data-theme', theme);
        this.currentTheme = theme;
        
        // Sauvegarder
        localStorage.setItem('onyx_theme', theme);

        // Mettre à jour boutons
        this.updateThemeButtons();

        // Retirer classe après transition
        setTimeout(() => {
            document.body.classList.remove('theme-transitioning');
        }, 300);

        console.log(`🎨 Thème appliqué: ${theme}`);
    }

    static setupThemeButtons() {
        const themeButtons = document.querySelectorAll('.theme-option');
        themeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const theme = btn.getAttribute('data-theme');
                this.applyTheme(theme);
            });
        });
    }

    static updateThemeButtons() {
        document.querySelectorAll('.theme-option').forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-theme') === this.currentTheme) {
                btn.classList.add('active');
            }
        });
    }

    static cycleTheme() {
        const currentIndex = this.themes.indexOf(this.currentTheme);
        const nextIndex = (currentIndex + 1) % this.themes.length;
        this.applyTheme(this.themes[nextIndex]);
    }
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    ThemesManager.init();
});
