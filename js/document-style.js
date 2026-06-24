// ===== DOCUMENT STYLE MANAGER =====

class DocumentStyleManager {
    static settings = null;
    static presets = {};

    static defaultSettings() {
        return {
            preset: 'default',
            coverTemplate: 'geometric-onyx',
            colors: {
                h1: '#06B6D4',
                h2: '#A78BFA',
                h3: '#EC4899',
                body: '#D4D8E0',
                link: '#06B6D4',
                code: '#A78BFA',
                quote: '#8B92A9',
                accent: '#A78BFA',
                primary: '#1A1F2E',
                secondary: '#06B6D4'
            }
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

    static async init() {
        this.settings = this.loadSettings();
        await this.loadPresets();
        this.populateUI();
        this.bindEvents();
        this.applyToPreview();
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
        try {
            const saved = localStorage.getItem('onyx_doc_style');
            if (saved) {
                return { ...this.defaultSettings(), ...JSON.parse(saved) };
            }
        } catch (e) {
            console.warn('Erreur chargement style document:', e);
        }
        return this.defaultSettings();
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
            presetSelect.value = this.settings.preset;
        }

        if (coverSelect) {
            coverSelect.innerHTML = Object.entries(this.coverTemplates).map(([id, tpl]) =>
                `<option value="${id}">${tpl.name}</option>`
            ).join('');
            coverSelect.value = this.settings.coverTemplate;
        }

        this.syncColorInputs();
    }

    static syncColorInputs() {
        const map = {
            colorH1: 'h1',
            colorH2: 'h2',
            colorH3: 'h3',
            colorBody: 'body',
            colorLink: 'link',
            colorCode: 'code',
            colorQuote: 'quote',
            colorAccent: 'accent'
        };

        Object.entries(map).forEach(([inputId, colorKey]) => {
            const input = document.getElementById(inputId);
            if (input) input.value = this.settings.colors[colorKey];
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

        ['colorH1', 'colorH2', 'colorH3', 'colorBody', 'colorLink', 'colorCode', 'colorQuote', 'colorAccent'].forEach((id) => {
            document.getElementById(id)?.addEventListener('input', (e) => {
                const key = id.replace('color', '').toLowerCase();
                const colorKey = key === 'body' ? 'body' : key;
                this.settings.colors[colorKey] = e.target.value;
                this.settings.preset = 'custom';
                const presetSelect = document.getElementById('docStylePreset');
                if (presetSelect) {
                    if (!presetSelect.querySelector('option[value="custom"]')) {
                        presetSelect.insertAdjacentHTML('beforeend', '<option value="custom">Personnalisé</option>');
                    }
                    presetSelect.value = 'custom';
                }
                this.saveSettings();
                this.applyToPreview();
            });
        });

        document.getElementById('btnResetDocStyle')?.addEventListener('click', () => {
            this.settings = this.defaultSettings();
            this.saveSettings();
            this.populateUI();
            this.applyToPreview();
            this.updateCoverPreview();
            UIManager.showToast('✅ Styles réinitialisés', 'success');
        });

        document.getElementById('chkCover')?.addEventListener('change', () => this.updateCoverPreview());
        document.getElementById('inputAuthor')?.addEventListener('input', () => this.updateCoverPreview());
        document.getElementById('inputDate')?.addEventListener('change', () => this.updateCoverPreview());
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
        this.applyToPreview();
        this.updateCoverPreview();
        UIManager.showToast(`✅ Style « ${preset.name} » appliqué`, 'success');
    }

    static applyToPreview() {
        const preview = document.getElementById('preview');
        if (!preview) return;

        const c = this.settings.colors;
        preview.classList.add('doc-styled');
        preview.style.setProperty('--doc-h1', c.h1);
        preview.style.setProperty('--doc-h2', c.h2);
        preview.style.setProperty('--doc-h3', c.h3);
        preview.style.setProperty('--doc-body', c.body);
        preview.style.setProperty('--doc-link', c.link);
        preview.style.setProperty('--doc-code', c.code);
        preview.style.setProperty('--doc-quote', c.quote);
        preview.style.setProperty('--doc-accent', c.accent);
    }

    static updateCoverPreview() {
        const container = document.getElementById('coverPreview');
        const chkCover = document.getElementById('chkCover');
        if (!container) return;

        if (chkCover?.checked) {
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
        const c = this.settings.colors;
        const safeTitle = this.escapeHtml(title);
        const safeAuthor = this.escapeHtml(author);
        const safeDate = this.escapeHtml(date);
        const height = isPreview ? '220px' : '100vh';
        const pageBreak = isPreview ? '' : 'page-break-after: always;';
        const template = this.settings.coverTemplate || 'geometric-onyx';

        const shapes = this.getCoverShapes(template, c);
        const titleColor = isPreview ? c.h1 : '#FFFFFF';
        const authorColor = c.secondary || c.accent;

        return `
<div class="doc-cover doc-cover-${template}" style="
    position: relative;
    overflow: hidden;
    ${pageBreak}
    width: 100%;
    min-height: ${height};
    background: linear-gradient(135deg, ${c.primary} 0%, ${this.shadeColor(c.primary, 20)} 100%);
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
        <h1 style="font-size: ${isPreview ? '1.6em' : '3em'}; margin: 0 0 16px; font-weight: 800; color: ${titleColor}; letter-spacing: -0.5px;">
            ${safeTitle}
        </h1>
        <div style="width: 80px; height: 4px; background: ${c.accent}; margin: 0 auto 20px; border-radius: 2px;"></div>
        <p style="font-size: ${isPreview ? '1em' : '1.4em'}; color: ${authorColor}; font-weight: 600; margin: 0 0 8px;">
            ${safeAuthor}
        </p>
        <p style="font-size: ${isPreview ? '0.85em' : '1em'}; color: ${this.shadeColor(titleColor, -30)}; margin: 0;">
            ${safeDate}
        </p>
    </div>
    ${isPreview ? '' : `<div style="position:absolute; bottom:24px; font-size:11px; color:rgba(255,255,255,0.5); z-index:2;">Onyx Reports</div>`}
</div>`;
    }

    static getCoverShapes(template, c) {
        const p = c.primary;
        const s = c.secondary || c.accent;
        const a = c.accent;

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
        return {
            preset: this.settings.preset,
            coverTemplate: this.settings.coverTemplate,
            colors: { ...this.settings.colors }
        };
    }

    static importSettings(data) {
        if (!data) return;
        this.settings = { ...this.defaultSettings(), ...data };
        if (data.colors) this.settings.colors = { ...this.defaultSettings().colors, ...data.colors };
        this.saveSettings();
        this.populateUI();
        this.applyToPreview();
        this.updateCoverPreview();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    DocumentStyleManager.init();
});
