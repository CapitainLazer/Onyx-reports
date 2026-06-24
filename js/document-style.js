// ===== DOCUMENT STYLE MANAGER =====

class DocumentStyleManager {
    static settings = null;
    static presets = {};

    static themePalettes = {
        light: {
            h1: '#1E3A8A', h2: '#5B21B6', h3: '#9D174D',
            body: '#212529', link: '#0891B2', code: '#6D28D9',
            quote: '#495057', accent: '#7C3AED',
            primary: '#F8F9FA', secondary: '#0891B2'
        },
        dark: {
            h1: '#22D3EE', h2: '#A78BFA', h3: '#F472B6',
            body: '#D4D8E0', link: '#06B6D4', code: '#C4B5FD',
            quote: '#8B92A9', accent: '#A78BFA',
            primary: '#1A1F2E', secondary: '#06B6D4'
        },
        industrial: {
            h1: '#F39C12', h2: '#ECF0F1', h3: '#E67E22',
            body: '#ECF0F1', link: '#E67E22', code: '#F5B041',
            quote: '#BDC3C7', accent: '#E67E22',
            primary: '#243447', secondary: '#F39C12'
        },
        minimal: {
            h1: '#111111', h2: '#333333', h3: '#555555',
            body: '#212529', link: '#000000', code: '#444444',
            quote: '#666666', accent: '#111111',
            primary: '#FAFAFA', secondary: '#333333'
        }
    };

    static defaultCoverColors(palette = {}, theme = 'dark') {
        const isLight = ['light', 'isac', 'minimal'].includes(theme);
        if (isLight) {
            return {
                bgStart: '#F8F9FA',
                bgEnd: '#DEE2E6',
                title: palette.h1 || '#1E3A8A',
                text: palette.body || '#495057',
                shapes: palette.accent || '#7C3AED',
                accent: palette.accent || '#7C3AED'
            };
        }
        return {
            bgStart: palette.primary || '#1A1F2E',
            bgEnd: this.shadeColor(palette.primary || '#1A1F2E', 25),
            title: '#FFFFFF',
            text: palette.secondary || '#ECF0F1',
            shapes: palette.accent || '#E67E22',
            accent: palette.accent || '#A78BFA'
        };
    }

    static exportColorDefaults() {
        return {
            h1: '#1A2A3A',
            h2: '#E67E22',
            h3: '#1A2A3A',
            body: '#1A2A3A',
            link: '#E67E22',
            code: '#E67E22',
            quote: '#5A6A7A',
            accent: '#E67E22',
            primary: '#1A2A3A',
            secondary: '#E67E22'
        };
    }

    static defaultSettings() {
        const theme = document.body?.getAttribute('data-theme') || 'light';
        const palette = this.exportColorDefaults();
        return {
            preset: 'default',
            coverTemplate: 'geometric-onyx',
            colors: { ...palette },
            coverColors: this.defaultCoverColors(palette, theme),
            coverEnabled: false,
            tocEnabled: false,
            author: '',
            date: ''
        };
    }

    static coverTemplates = {
        'geometric-onyx': { name: 'Onyx — Losanges' },
        'geometric-circles': { name: 'Cercles colorés' },
        'geometric-triangles': { name: 'Triangles' },
        'geometric-blocks': { name: 'Blocs modernes' },
        'geometric-waves': { name: 'Vagues' },
        'presentation-minimal': { name: 'Minimal épuré' }
    };

    static presetCoverMap = {
        default: 'geometric-onyx',
        minimaliste: 'presentation-minimal',
        professionnel: 'presentation-minimal',
        creatif: 'geometric-circles',
        'structure-beton': 'geometric-blocks',
        'genie-civil': 'geometric-triangles',
        architecture: 'presentation-minimal',
        multitechnique: 'geometric-waves',
        'calculs-structurels': 'geometric-triangles',
        'plans-usine': 'geometric-blocks',
        'coordination-chs': 'geometric-waves',
        medical: 'geometric-circles',
        education: 'geometric-circles',
        technique: 'geometric-triangles'
    };

    static _readyPromise = null;

    static whenReady() {
        if (!this._readyPromise) {
            this._readyPromise = this.init();
        }
        return this._readyPromise;
    }

    static async init() {
        this.settings = this.loadSettings();
        await this.loadPresets();
        this.populateUI();
        if (!this._eventsBound) {
            this.bindEvents();
            this._eventsBound = true;
        }
        this.refreshPreview();
        return this;
    }

    static async loadPresets() {
        try {
            const response = await fetch('data/templates.json');
            if (response.ok) {
                this.presets = await response.json();
            }
        } catch (e) {
            console.warn('Presets stylisation non chargés:', e);
        }

        if (!Object.keys(this.presets).length) {
            this.presets = {
                default: {
                    name: 'Défaut',
                    colors: this.defaultSettings().colors,
                    coverStyle: 'geometric-onyx'
                }
            };
        }
    }

    static loadSettings() {
        const defaults = this.defaultSettings();
        let parsed = {};

        try {
            const saved = localStorage.getItem('onyx_doc_style');
            if (saved) parsed = JSON.parse(saved);
        } catch (e) {
            console.warn('Erreur chargement onyx_doc_style:', e);
        }

        try {
            const docRaw = localStorage.getItem('onyx_doc');
            if (docRaw) {
                const doc = JSON.parse(docRaw);
                if (doc.documentStyle) {
                    parsed = {
                        ...parsed,
                        ...doc.documentStyle,
                        colors: { ...(parsed.colors || {}), ...(doc.documentStyle.colors || {}) },
                        coverColors: { ...(parsed.coverColors || {}), ...(doc.documentStyle.coverColors || {}) }
                    };
                }
            }
        } catch (e) {
            console.warn('Erreur chargement documentStyle depuis onyx_doc:', e);
        }

        if (Object.keys(parsed).length) {
            return {
                ...defaults,
                ...parsed,
                colors: { ...defaults.colors, ...(parsed.colors || {}) },
                coverColors: { ...defaults.coverColors, ...(parsed.coverColors || {}) }
            };
        }

        return defaults;
    }

    static saveSettings() {
        localStorage.setItem('onyx_doc_style', JSON.stringify(this.settings));
        if (window.app) window.app.isDirty = true;
    }

    static getSettings() {
        return this.settings || this.defaultSettings();
    }

    static populateUI() {
        const presetSelect = document.getElementById('docStylePreset');
        const coverSelect = document.getElementById('coverTemplate');

        if (presetSelect) {
            presetSelect.innerHTML = Object.entries(this.presets).map(([id, preset]) =>
                `<option value="${id}">${preset.name}</option>`
            ).join('');
            if (this.settings.preset === 'custom' && !presetSelect.querySelector('option[value="custom"]')) {
                presetSelect.insertAdjacentHTML('beforeend', '<option value="custom">Personnalisé</option>');
            }
            if (presetSelect.querySelector(`option[value="${this.settings.preset}"]`)) {
                presetSelect.value = this.settings.preset;
            }
        }

        if (coverSelect) {
            coverSelect.innerHTML = Object.entries(this.coverTemplates).map(([id, tpl]) =>
                `<option value="${id}">${tpl.name}</option>`
            ).join('');
            coverSelect.value = this.settings.coverTemplate;
        }

        this.syncFormFields();
        this.syncColorInputs();
    }

    static syncFormFields() {
        const chkCover = document.getElementById('chkCover');
        const chkTOC = document.getElementById('chkTOC');
        const inputAuthor = document.getElementById('inputAuthor');
        const inputDate = document.getElementById('inputDate');

        if (chkCover) chkCover.checked = Boolean(this.settings.coverEnabled);
        if (chkTOC) chkTOC.checked = Boolean(this.settings.tocEnabled);
        if (inputAuthor && this.settings.author) inputAuthor.value = this.settings.author;
        if (inputDate && this.settings.date) inputDate.value = this.settings.date;
    }

    static persistFormFields() {
        const chkCover = document.getElementById('chkCover');
        const chkTOC = document.getElementById('chkTOC');
        const inputAuthor = document.getElementById('inputAuthor');
        const inputDate = document.getElementById('inputDate');

        this.settings.coverEnabled = Boolean(chkCover?.checked);
        this.settings.tocEnabled = Boolean(chkTOC?.checked);
        this.settings.author = inputAuthor?.value || '';
        this.settings.date = inputDate?.value || '';
        this.saveSettings();
    }

    static syncColorInputs() {
        const contentMap = {
            colorH1: 'h1', hexH1: 'h1',
            colorH2: 'h2', hexH2: 'h2',
            colorH3: 'h3', hexH3: 'h3',
            colorLink: 'link', hexLink: 'link',
            colorCode: 'code', hexCode: 'code',
            colorQuote: 'quote', hexQuote: 'quote',
            colorAccent: 'accent', hexAccent: 'accent'
        };

        const coverMap = {
            colorCoverBgStart: 'bgStart', hexCoverBgStart: 'bgStart',
            colorCoverBgEnd: 'bgEnd', hexCoverBgEnd: 'bgEnd',
            colorCoverTitle: 'title', hexCoverTitle: 'title',
            colorCoverText: 'text', hexCoverText: 'text',
            colorCoverShapes: 'shapes', hexCoverShapes: 'shapes'
        };

        if (!this.settings.coverColors) {
            this.settings.coverColors = this.defaultCoverColors(this.settings.colors);
        }

        Object.entries(contentMap).forEach(([inputId, colorKey]) => {
            const input = document.getElementById(inputId);
            const value = this.settings.colors[colorKey] || this.exportColorDefaults()[colorKey];
            if (input && value) input.value = value;
        });

        Object.entries(coverMap).forEach(([inputId, colorKey]) => {
            const input = document.getElementById(inputId);
            const value = this.settings.coverColors?.[colorKey];
            if (input && value) input.value = value;
        });
    }

    static markAsCustom() {
        this.settings.preset = 'custom';
        const presetSelect = document.getElementById('docStylePreset');
        if (presetSelect) {
            if (!presetSelect.querySelector('option[value="custom"]')) {
                presetSelect.insertAdjacentHTML('beforeend', '<option value="custom">Personnalisé</option>');
            }
            presetSelect.value = 'custom';
        }
    }

    static bindColorControl(pickerId, hexId, target, key) {
        const picker = document.getElementById(pickerId);
        const hex = document.getElementById(hexId);
        if (!picker || !hex) return;

        const applyValue = (value) => {
            if (!/^#[0-9A-Fa-f]{6}$/.test(value)) return;
            if (target === 'cover') {
                if (!this.settings.coverColors) this.settings.coverColors = this.defaultCoverColors(this.settings.colors);
                this.settings.coverColors[key] = value;
            } else {
                this.settings.colors[key] = value;
            }
            picker.value = value;
            hex.value = value.toUpperCase();
            this.markAsCustom();
            this.saveSettings();
            if (target === 'cover') this.updateCoverPreview();
            else this.applyToPreview();
        };

        picker.addEventListener('input', (e) => applyValue(e.target.value));
        hex.addEventListener('change', (e) => applyValue(e.target.value.trim()));
        hex.addEventListener('input', (e) => {
            const value = e.target.value.trim();
            if (/^#[0-9A-Fa-f]{6}$/.test(value)) picker.value = value;
        });
    }

    static bindEvents() {
        document.getElementById('docStylePreset')?.addEventListener('change', (e) => {
            this.applyPreset(e.target.value);
        });

        document.getElementById('coverTemplate')?.addEventListener('change', (e) => {
            this.settings.coverTemplate = e.target.value;
            this.saveSettings();
            this.updateCoverPreview();
        });

        this.bindColorControl('colorH1', 'hexH1', 'content', 'h1');
        this.bindColorControl('colorH2', 'hexH2', 'content', 'h2');
        this.bindColorControl('colorH3', 'hexH3', 'content', 'h3');
        this.bindColorControl('colorLink', 'hexLink', 'content', 'link');
        this.bindColorControl('colorCode', 'hexCode', 'content', 'code');
        this.bindColorControl('colorQuote', 'hexQuote', 'content', 'quote');
        this.bindColorControl('colorAccent', 'hexAccent', 'content', 'accent');

        this.bindColorControl('colorCoverBgStart', 'hexCoverBgStart', 'cover', 'bgStart');
        this.bindColorControl('colorCoverBgEnd', 'hexCoverBgEnd', 'cover', 'bgEnd');
        this.bindColorControl('colorCoverTitle', 'hexCoverTitle', 'cover', 'title');
        this.bindColorControl('colorCoverText', 'hexCoverText', 'cover', 'text');
        this.bindColorControl('colorCoverShapes', 'hexCoverShapes', 'cover', 'shapes');

        document.getElementById('btnResetDocStyle')?.addEventListener('click', () => {
            this.settings = this.defaultSettings();
            this.saveSettings();
            this.populateUI();
            this.refreshPreview();
            UIManager.showToast('✅ Styles réinitialisés', 'success');
        });

        document.getElementById('chkCover')?.addEventListener('change', () => {
            this.persistFormFields();
            this.updateCoverPreview();
        });
        document.getElementById('chkTOC')?.addEventListener('change', () => this.persistFormFields());
        document.getElementById('inputAuthor')?.addEventListener('input', () => {
            this.persistFormFields();
            this.updateCoverPreview();
        });
        document.getElementById('inputDate')?.addEventListener('change', () => {
            this.persistFormFields();
            this.updateCoverPreview();
        });
        document.getElementById('docTitle')?.addEventListener('input', () => this.updateCoverPreview());
    }

    static applyPreset(presetId) {
        const preset = this.presets[presetId];
        if (!preset) return;

        this.settings.preset = presetId;
        if (preset.colors) {
            this.settings.colors = {
                ...this.settings.colors,
                h1: preset.colors.primary || preset.colors.h1 || this.settings.colors.h1,
                h2: preset.colors.secondary || preset.colors.h2 || this.settings.colors.h2,
                h3: preset.colors.text || preset.colors.h3 || this.settings.colors.h3,
                body: preset.colors.text || preset.colors.body || this.settings.colors.body,
                link: preset.colors.secondary || this.settings.colors.link,
                code: preset.colors.secondary || this.settings.colors.code,
                accent: preset.colors.secondary || this.settings.colors.accent,
                primary: preset.colors.primary || this.settings.colors.primary,
                secondary: preset.colors.secondary || this.settings.colors.secondary
            };
        }

        const coverStyle = preset.coverStyle || this.presetCoverMap[presetId];
        if (coverStyle && this.coverTemplates[coverStyle]) {
            this.settings.coverTemplate = coverStyle;
        } else if (this.presetCoverMap[presetId]) {
            this.settings.coverTemplate = this.presetCoverMap[presetId];
        }

        this.saveSettings();
        this.populateUI();
        this.refreshPreview();
        UIManager.showToast(`✅ Style « ${preset.name} » appliqué`, 'success');
    }

    static applyToPreview() {
        const preview = document.getElementById('preview');
        if (!preview) return;

        const exportColors = this.settings.colors;
        const bg = this.getPreviewBackgroundColor();
        const uiText = this.getUiTextColor();
        const codeBg = this.getThemeColor('--code-bg', '#1A1F2E');
        const quoteBg = this.getThemeColor('--bg-secondary', bg);
        const tableHeadBg = this.getThemeColor('--bg-secondary', bg);

        preview.classList.add('doc-styled');
        preview.style.setProperty('--doc-h1', this.getPreviewColor(exportColors.h1, bg, uiText));
        preview.style.setProperty('--doc-h2', this.getPreviewColor(exportColors.h2, bg, uiText));
        preview.style.setProperty('--doc-h3', this.getPreviewColor(exportColors.h3, bg, uiText));
        preview.style.setProperty('--doc-body', uiText);
        preview.style.setProperty('--doc-link', this.getPreviewColor(exportColors.link, bg, uiText));
        preview.style.setProperty('--doc-code', this.getPreviewColor(exportColors.code, codeBg, uiText));
        preview.style.setProperty('--doc-code-bg', codeBg);
        preview.style.setProperty('--doc-quote', this.getPreviewColor(exportColors.quote, quoteBg, uiText));
        preview.style.setProperty('--doc-quote-bg', quoteBg);
        preview.style.setProperty('--doc-accent', this.getPreviewColor(exportColors.accent, bg, uiText));
        preview.style.setProperty('--doc-table-head', this.getPreviewColor(exportColors.accent, tableHeadBg, uiText));
        preview.style.setProperty('--doc-table-head-bg', tableHeadBg);
    }

    static refreshPreview() {
        requestAnimationFrame(() => {
            this.applyToPreview();
            this.updateCoverPreview();
        });
    }

    static getThemeStyle() {
        return getComputedStyle(document.body);
    }

    static getThemeColor(varName, fallback = '') {
        const value = this.getThemeStyle().getPropertyValue(varName).trim();
        return value || fallback;
    }

    static getUiTextColor() {
        return this.getThemeColor('--text-primary')
            || this.getThemeColor('--onyx-light')
            || '#212529';
    }

    static getPreviewBackgroundColor() {
        const preview = document.getElementById('preview');
        if (preview) {
            const bg = getComputedStyle(preview).backgroundColor;
            if (bg && bg !== 'transparent' && bg !== 'rgba(0, 0, 0, 0)') {
                return bg;
            }
        }

        return this.getThemeColor('--onyx-charcoal', '#2D3142');
    }

    static parseRgb(color) {
        if (color.startsWith('#')) {
            const num = parseInt(color.slice(1), 16);
            return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
        }
        const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        if (match) {
            return { r: +match[1], g: +match[2], b: +match[3] };
        }
        return { r: 45, g: 49, b: 66 };
    }

    static getRelativeLuminance({ r, g, b }) {
        const convert = (c) => {
            c /= 255;
            return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
        };
        return 0.2126 * convert(r) + 0.7152 * convert(g) + 0.0722 * convert(b);
    }

    static getContrastRatio(fg, bg) {
        const l1 = this.getRelativeLuminance(this.parseRgb(fg));
        const l2 = this.getRelativeLuminance(this.parseRgb(bg));
        const lighter = Math.max(l1, l2);
        const darker = Math.min(l1, l2);
        return (lighter + 0.05) / (darker + 0.05);
    }

    static getPreviewColor(exportColor, backgroundColor, fallback = null) {
        if (!exportColor) return fallback || this.getUiTextColor();
        if (this.getContrastRatio(exportColor, backgroundColor) >= 4.5) {
            return exportColor;
        }
        return fallback || this.getContrastColor(backgroundColor);
    }

    static updateCoverPreview() {
        const container = document.getElementById('coverPreview');
        const colorOptions = document.getElementById('coverColorOptions');
        const chkCover = document.getElementById('chkCover');
        const isEnabled = Boolean(chkCover?.checked ?? this.settings?.coverEnabled);

        if (colorOptions) {
            colorOptions.classList.toggle('hidden', !isEnabled);
        }

        if (!container) return;

        if (isEnabled) {
            container.innerHTML = this.generateCoverPage(true);
            container.classList.remove('hidden');
        } else {
            container.innerHTML = '';
            container.classList.add('hidden');
        }
    }

    static escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    static generateCoverPage(isPreview = false) {
        const title = document.getElementById('docTitle')?.value || 'Document';
        const author = document.getElementById('inputAuthor')?.value || 'Auteur';
        const date = document.getElementById('inputDate')?.value || new Date().toLocaleDateString('fr-FR');
        const cover = this.settings.coverColors || this.defaultCoverColors(this.settings.colors);
        const safeTitle = this.escapeHtml(title);
        const safeAuthor = this.escapeHtml(author);
        const safeDate = this.escapeHtml(date);
        const height = isPreview ? '220px' : '100vh';
        const pageBreak = isPreview ? '' : 'page-break-after: always;';
        const template = this.settings.coverTemplate || 'geometric-onyx';

        const shapes = this.getCoverShapes(template, cover);

        return `
<div class="doc-cover doc-cover-${template}" style="
    position: relative;
    overflow: hidden;
    ${pageBreak}
    width: 100%;
    min-height: ${height};
    background: linear-gradient(135deg, ${cover.bgStart} 0%, ${cover.bgEnd} 100%);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 40px;
    box-sizing: border-box;
    border-radius: ${isPreview ? '8px' : '0'};
    margin-bottom: ${isPreview ? '12px' : '0'};
">
    ${shapes}
    <div style="position: relative; z-index: 2; max-width: 90%;">
        <h1 style="font-size: ${isPreview ? '1.6em' : '3em'}; margin: 0 0 16px; font-weight: 800; color: ${cover.title}; letter-spacing: -0.5px;">
            ${safeTitle}
        </h1>
        <div style="width: 80px; height: 4px; background: ${cover.accent}; margin: 0 auto 20px; border-radius: 2px;"></div>
        <p style="font-size: ${isPreview ? '1em' : '1.4em'}; color: ${cover.text}; font-weight: 600; margin: 0 0 8px;">
            ${safeAuthor}
        </p>
        <p style="font-size: ${isPreview ? '0.85em' : '1em'}; color: ${cover.text}; opacity: 0.85; margin: 0;">
            ${safeDate}
        </p>
    </div>
    ${isPreview ? '' : `<div style="position:absolute; bottom:24px; font-size:11px; color:${cover.text}; opacity:0.5; z-index:2;">Onyx Reports</div>`}
</div>`;
    }

    static getCoverShapes(template, cover) {
        const s = cover.shapes;
        const a = cover.accent;

        const shapes = {
            'geometric-onyx': `
                <div style="position:absolute;top:12%;left:8%;width:60px;height:60px;background:${a};opacity:0.35;transform:rotate(45deg);border-radius:8px;"></div>
                <div style="position:absolute;bottom:15%;right:10%;width:90px;height:90px;border:4px solid ${s};opacity:0.4;transform:rotate(15deg);border-radius:12px;"></div>
                <div style="position:absolute;top:-60px;right:-40px;width:200px;height:200px;background:${s};opacity:0.15;border-radius:50%;"></div>
            `,
            'geometric-circles': `
                <div style="position:absolute;top:-80px;right:-50px;width:260px;height:260px;background:${s};opacity:0.25;border-radius:50%;"></div>
                <div style="position:absolute;bottom:-100px;left:-70px;width:320px;height:320px;background:${a};opacity:0.2;border-radius:50%;"></div>
                <div style="position:absolute;top:40%;left:5%;width:40px;height:40px;background:${a};opacity:0.5;border-radius:50%;"></div>
                <div style="position:absolute;bottom:30%;right:8%;width:24px;height:24px;background:${s};opacity:0.6;border-radius:50%;"></div>
            `,
            'geometric-triangles': `
                <div style="position:absolute;top:0;right:0;width:0;height:0;border-left:180px solid transparent;border-top:180px solid ${s};opacity:0.3;"></div>
                <div style="position:absolute;bottom:0;left:0;width:0;height:0;border-right:220px solid transparent;border-bottom:220px solid ${a};opacity:0.25;"></div>
                <div style="position:absolute;top:50%;left:10%;width:0;height:0;border-left:30px solid transparent;border-right:30px solid transparent;border-bottom:50px solid ${a};opacity:0.4;"></div>
            `,
            'geometric-blocks': `
                <div style="position:absolute;top:10%;right:5%;width:120px;height:120px;background:${a};opacity:0.3;transform:rotate(-12deg);border-radius:4px;"></div>
                <div style="position:absolute;bottom:8%;left:6%;width:160px;height:80px;background:${s};opacity:0.25;transform:rotate(8deg);border-radius:4px;"></div>
                <div style="position:absolute;top:55%;right:20%;width:50px;height:50px;background:${a};opacity:0.45;transform:rotate(45deg);"></div>
            `,
            'geometric-waves': `
                <div style="position:absolute;bottom:0;left:0;right:0;height:120px;background:${s};opacity:0.2;border-radius:50% 50% 0 0 / 100% 100% 0 0;"></div>
                <div style="position:absolute;top:0;left:0;right:0;height:80px;background:${a};opacity:0.15;border-radius:0 0 50% 50% / 0 0 100% 100%;"></div>
                <div style="position:absolute;top:20%;right:12%;width:70px;height:70px;border:3px solid ${a};opacity:0.35;border-radius:50%;"></div>
            `,
            'presentation-minimal': `
                <div style="position:absolute;top:0;left:0;right:0;height:6px;background:linear-gradient(90deg,${a},${s});"></div>
                <div style="position:absolute;bottom:0;left:0;right:0;height:6px;background:linear-gradient(90deg,${s},${a});"></div>
            `
        };

        return shapes[template] || shapes['geometric-onyx'];
    }

    static shadeColor(hex, percent) {
        const num = parseInt(hex.replace('#', ''), 16);
        const r = Math.min(255, Math.max(0, (num >> 16) + percent));
        const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + percent));
        const b = Math.min(255, Math.max(0, (num & 0x0000FF) + percent));
        return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
    }

    static getExportCSS() {
        const c = this.settings.colors;
        return `
            h1 { color: ${c.h1}; border-bottom: 3px solid ${c.accent}; padding-bottom: 10px; }
            h2 { color: ${c.h2}; border-bottom: 2px solid ${c.accent}; padding-bottom: 8px; }
            h3 { color: ${c.h3}; }
            p, li { color: ${c.body}; }
            a { color: ${c.link}; }
            code { color: ${c.code}; background: ${c.code}22; }
            blockquote { color: ${c.quote}; border-left-color: ${c.accent}; }
            th { background: ${c.primary}; color: ${c.accent}; }
            td { color: ${c.body}; }
        `;
    }

    static getExportData() {
        this.persistFormFields();
        return {
            preset: this.settings.preset,
            coverTemplate: this.settings.coverTemplate,
            colors: { ...this.settings.colors },
            coverColors: { ...(this.settings.coverColors || {}) },
            coverEnabled: Boolean(this.settings.coverEnabled),
            tocEnabled: Boolean(this.settings.tocEnabled),
            author: this.settings.author || '',
            date: this.settings.date || ''
        };
    }

    static importSettings(data) {
        if (!data) return;
        const defaults = this.defaultSettings();
        this.settings = {
            ...defaults,
            ...data,
            colors: { ...defaults.colors, ...(data.colors || {}) },
            coverColors: { ...defaults.coverColors, ...(data.coverColors || {}) }
        };
        this.saveSettings();
        if (this._eventsBound) {
            this.populateUI();
            this.refreshPreview();
        }
    }

    static onThemeChanged(theme) {
        if (!this.settings) return;
        this.refreshPreview();
    }

    static isLightUiTheme(theme) {
        return ['light', 'isac', 'minimal'].includes(theme);
    }

    static getContrastColor(hexOrRgb) {
        const { r, g, b } = typeof hexOrRgb === 'string' && hexOrRgb.startsWith('#')
            ? this.parseRgb(hexOrRgb)
            : this.parseRgb(hexOrRgb);
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        return luminance > 0.55 ? '#212529' : '#F8F9FA';
    }
}

