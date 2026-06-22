# RapportStage — Éditeur de Rapports de Stage

Application web moderne pour créer, éditer et exporter vos rapports de stage au format PDF avec support complet du Markdown.

![Preview](https://img.shields.io/badge/Status-Ready-brightgreen)
![Markdown](https://img.shields.io/badge/Markdown-Support-blue)
![PDF](https://img.shields.io/badge/PDF-Export-red)

## ✨ Fonctionnalités

- 📝 **Éditeur Markdown** avec coloration syntaxique et prévisualisation en temps réel
- 📂 **Import de fichiers** Markdown (.md, .markdown, .txt)
- 📄 **Export PDF** avec nom personnalisable
- 📊 **Compteur de mots** intégré
- 🎨 **Interface élégante** et responsive
- ⚡ **Aucun serveur requis** — fonctionne en local

## 🚀 Utilisation Rapide

### Option 1 : Ouvrir directement (Recommandé)

1. Double-cliquez sur le fichier `index.html`
2. L'application s'ouvre dans votre navigateur

### Option 2 : Avec un serveur local

```bash
# Python 3
cd rapport-stage-app
python -m http.server 8000

# Node.js (si disponible)
npx serve .
```

Puis ouvrez `http://localhost:8000` dans votre navigateur.

### Option 3 : Avec VS Code Live Server

1. Installez l'extension "Live Server" dans VS Code
2. Faites clic droit sur `index.html`
3. Sélectionnez "Open with Live Server"

## 📖 Guide d'Utilisation

### Écriture Markdown

L'éditeur supporte la syntaxe Markdown complète :

```markdown
# Titre principal
## Sous-titre
### Sous-sous-titre

**gras** et *italique*

- Liste à puces
- Deuxième élément

1. Liste numérotée
2. Deuxième élément

> Citation

| Tableau | Colonne 2 |
|---------|-----------|
| Donnée  | Donnée    |

`code inline`

```bloc de code```
```

### Importer un fichier

1. Cliquez sur **"Importer Markdown"**
2. Sélectionnez votre fichier `.md`
3. Le contenu apparaît dans l'éditeur

### Exporter en PDF

1. Cliquez sur **"Exporter PDF"**
2. Entrez le nom de fichier souhaité
3. Cliquez sur **"Télécharger"**
4. Votre PDF est généré et téléchargé

### Raccourcis clavier

| Raccourci | Action |
|-----------|--------|
| `Ctrl/Cmd + S` | Ouvrir l'export PDF |

## 📁 Structure des Fichiers

```
rapport-stage-app/
├── index.html    # Application complète (HTML + CSS + JS)
└── README.md     # Cette documentation
```

## 🛠️ Technologies Utilisées

- **Marked.js** — Parsing Markdown
- **html2pdf.js** — Génération PDF côté client
- **Google Fonts** — Typographie (Playfair Display, Crimson Pro, JetBrains Mono)

## ⚠️ Notes Importantes

- Le PDF est généré **côté client** — aucune donnée n'est envoyée sur internet
- Pour de très gros documents, la génération peut prendre quelques secondes
- Le formatage du PDF peut légèrement varier selon le contenu

## 🔧 Dépannage

### Le PDF ne se télécharge pas

1. Vérifiez que les bibliothèques externes sont accessibles
2. Essayez avec un autre navigateur (Chrome recommandé)
3. Désactivez temporairement votre bloqueur de popups

### Problème d'accents dans le PDF

L'application utilise l'encodage UTF-8. Assurez-vous que :
- Votre fichier source est en UTF-8
- Votre navigateur est à jour

## 📝 Licence

Libre d'utilisation pour vos rapports de stage et projets académiques.

---

*Créé avec ❤️ pour les étudiants en stage*
# Onyx-reports
