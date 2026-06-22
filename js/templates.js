// ===== TEMPLATES MANAGER =====

class TemplatesManager {
    static templates = {
        blank: {
            title: 'Document Vierge',
            content: '# Titre\n\nCommencez à écrire...'
        },
        report: {
            title: 'Rapport Technique',
            content: `# Rapport Technique

## Informations Générales

**Auteur:** 
**Date:** ${new Date().toLocaleDateString()}
**Sujet:** 

## 1. Introduction

Décrivez le contexte et les objectifs de ce rapport.

## 2. Méthodologie

Expliquez comment le travail a été effectué.

## 3. Résultats

Présentez les résultats obtenus.

## 4. Analyse

Analysez et interprétez les résultats.

## 5. Conclusion

Résumez les points clés et les recommandations.

---

**Références:**

- Référence 1
- Référence 2
- Référence 3`
        },
        internship: {
            title: 'Rapport de Stage',
            content: `# RAPPORT DE STAGE

## Page de Couverture

| Élément | Détail |
|---------|--------|
| **Stagiaire** |  |
| **Formation** |  |
| **Entreprise** |  |
| **Tuteur** |  |
| **Période** | ${new Date().toLocaleDateString()} à |
| **Durée** |  |

---

## 1. Introduction

### Présentation de l'entreprise

**Secteur d'activité:** 
**Effectifs:** 
**Localisation:** 
**Site web:** 

**Description générale:**
Décrivez brièvement l'entreprise et ses activités.

### Présentation du stage

**Intitulé du poste:** 
**Service/Département:** 
**Objectifs du stage:** 
- Objectif 1
- Objectif 2
- Objectif 3

---

## 2. Contexte et Environnement

### Environnement de travail

Décrivez l'équipe, les responsabilités, le contexte professionnel.

### Missions confiées

#### Mission 1: [Titre]
- Description
- Outils utilisés
- Résultats

#### Mission 2: [Titre]
- Description
- Outils utilisés
- Résultats

#### Mission 3: [Titre]
- Description
- Outils utilisés
- Résultats

---

## 3. Tâches et Responsabilités

### Tâches quotidiennes

Liste des responsabilités principales :
- Tâche 1
- Tâche 2
- Tâche 3

### Outils et Technologies

**Logiciels utilisés:**
- Logiciel 1
- Logiciel 2
- Logiciel 3

**Méthodologies:**
- Méthodologie 1
- Méthodologie 2

---

## 4. Réalisations et Résultats

### Projets réalisés

#### Projet 1: [Nom]

**Contexte:** 
**Objectif:** 
**Démarche:** 
**Résultats:** 
**Apprentissages:** 

#### Projet 2: [Nom]

**Contexte:** 
**Objectif:** 
**Démarche:** 
**Résultats:** 
**Apprentissages:** 

### Compétences développées

- **Technique:** Compétence technique acquise
- **Professionnelle:** Compétence professionnelle acquise
- **Personnelle:** Compétence personnelle développée

---

## 5. Bilan et Perspectives

### Points positifs

- Point 1
- Point 2
- Point 3

### Difficultés rencontrées

- Difficulté 1 et solutions apportées
- Difficulté 2 et solutions apportées

### Perspectives professionnelles

Réflexions sur votre carrière et la suite après le stage.

---

## 6. Remerciements

Remerciements envers l'entreprise, votre tuteur, et les personnes qui vous ont aidé.

---

## 7. Annexes

### A. Documentation

- Annexe 1
- Annexe 2

### B. Captures d'écran

[Insérer les screenshots pertinents]

### C. Ressources

- Ressource 1
- Ressource 2

---

**Date:** ${new Date().toLocaleDateString()}
**Signature:** `
        },
        meeting: {
            title: 'Compte-rendu de Réunion',
            content: `# COMPTE-RENDU DE RÉUNION

**Date:** ${new Date().toLocaleDateString()}
**Heure:** 
**Lieu:** 
**Présents:** 

---

## Ordre du jour

1. Point 1
2. Point 2
3. Point 3

---

## Discussions et Décisions

### Point 1

**Discussion:**
Détails de la discussion...

**Décision:**
- Action décidée
- Responsable: 
- Échéance: 

### Point 2

**Discussion:**
Détails de la discussion...

**Décision:**
- Action décidée
- Responsable: 
- Échéance: 

### Point 3

**Discussion:**
Détails de la discussion...

**Décision:**
- Action décidée
- Responsable: 
- Échéance: 

---

## Actions à faire

| Action | Responsable | Échéance |
|--------|-------------|----------|
| Action 1 |  |  |
| Action 2 |  |  |
| Action 3 |  |  |

---

## Prochaine réunion

**Date:** 
**Sujet:** 

---

**Rédigé par:** 
**Validé par:** `
        },
        cv: {
            title: 'Curriculum Vitae',
            content: `# CURRICULUM VITAE

## Contact

- **Email:** your.email@example.com
- **Téléphone:** +33 6 XX XX XX XX
- **Localisation:** Ville, Pays
- **LinkedIn:** [Profil]

---

## Profil Professionnel

Résumé de votre profil professionnel et compétences clés.

---

## Expérience Professionnelle

### Poste 1
**Entreprise** | Ville | Période
- Responsabilité 1
- Responsabilité 2
- Accomplissement notable

### Poste 2
**Entreprise** | Ville | Période
- Responsabilité 1
- Responsabilité 2

---

## Formation

- **Diplôme** | École | Année
- **Diplôme** | École | Année
- **Diplôme** | École | Année

---

## Compétences

- Compétence 1
- Compétence 2
- Compétence 3
- Compétence 4
- Compétence 5

---

## Langues

- Français (Natif)
- Anglais (Avancé)
- Allemand (Intermédiaire)

---

## Certifications & Distinctions

- Certification 1 - Année
- Certification 2 - Année
- Prix/Distinction - Année

---

**Dernière mise à jour:** ${new Date().toLocaleDateString()}`
        }
    };

    /**
     * Charge une template
     * @param {string} templateName - Clé de la template
     */
    static load(templateName) {
        const template = this.templates[templateName];
        if (!template) {
            UIManager.showToast('❌ Template non trouvée', 'error');
            console.error(`Template "${templateName}" non trouvée`);
            return;
        }

        try {
            EditorManager.setValue(template.content);
            document.getElementById('docTitle').value = template.title;
            EditorManager.saveToHistory();
            UIManager.showToast(`✅ Template "${template.title}" chargée`, 'success');
            console.log(`✅ Template "${templateName}" chargée avec succès`);
        } catch (error) {
            console.error('Erreur lors du chargement de la template:', error);
            UIManager.showToast('❌ Erreur lors du chargement', 'error');
        }
    }

    /**
     * Récupère toutes les templates
     * @returns {Array} Tableau des templates
     */
    static getAll() {
        return Object.entries(this.templates).map(([key, value]) => ({
            id: key,
            ...value
        }));
    }

    /**
     * Récupère une template spécifique
     * @param {string} templateName - Clé de la template
     * @returns {Object|null} Template ou null
     */
    static get(templateName) {
        return this.templates[templateName] || null;
    }

    /**
     * Ajoute une nouvelle template personnalisée
     * @param {string} key - Clé unique
     * @param {string} title - Titre
     * @param {string} content - Contenu Markdown
     */
    static addCustom(key, title, content) {
        this.templates[key] = { title, content };
        localStorage.setItem(`template_${key}`, JSON.stringify({ title, content }));
        console.log(`✅ Template personnalisée "${key}" ajoutée`);
    }

    /**
     * Supprime une template personnalisée
     * @param {string} key - Clé de la template
     */
    static removeCustom(key) {
        if (this.templates[key]) {
            delete this.templates[key];
            localStorage.removeItem(`template_${key}`);
            console.log(`✅ Template "${key}" supprimée`);
        }
    }

    /**
     * Charge les templates personnalisées depuis localStorage
     */
    static loadCustomFromStorage() {
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
            if (key.startsWith('template_')) {
                try {
                    const data = JSON.parse(localStorage.getItem(key));
                    const templateKey = key.replace('template_', '');
                    this.templates[templateKey] = data;
                } catch (error) {
                    console.error(`Erreur lors du chargement de ${key}:`, error);
                }
            }
        });
    }
};

// ===== INITIALISATION =====
document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ Templates Manager chargé');
    
    // Charger les templates personnalisées
    TemplatesManager.loadCustomFromStorage();
    console.log('📦 Templates disponibles:', TemplatesManager.getAll().map(t => t.id));
    
    // Ajouter les écouteurs sur les boutons de template
    setupTemplateButtons();
});

/**
 * Configure les boutons de template
 */
function setupTemplateButtons() {
    const templateBtns = document.querySelectorAll('[data-template]');
    
    templateBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const templateName = btn.getAttribute('data-template');
            TemplatesManager.load(templateName);
        });
    });
    
    console.log(`✅ ${templateBtns.length} boutons de template initialisés`);
}
