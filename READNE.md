# Internship Application Builder

Application web locale en **React + Tailwind CSS + @react-pdf/renderer** pour préparer des candidatures complètes (CV + lettre de motivation) optimisées pour les ATS.

Ce projet a été réalisé dans le cadre de mon parcours d’élève ingénieur à l’**ECE Paris** pour industrialiser ma manière de répondre aux offres de stage / alternance.

---

## 🎯 Objectif

L’objectif de cette application est de :

- Centraliser **mon profil permanent** (identité, contact, formation, langues, certifications) dans le navigateur.
- Générer rapidement un **CV personnalisé par offre** à partir de blocs de texte proposés par une IA (résumé, expériences, projets, compétences).
- Générer automatiquement une **lettre de motivation formatée** et propre.
- Produire des **PDF 100% texte sélectionnable** compatibles ATS.

---

## 🧱 Architecture fonctionnelle

### 1. Séparation des données

L’état est structuré en trois blocs :

- **`permanentData`**  
  - Prénom, Nom  
  - Email, Téléphone  
  - LinkedIn, Portfolio  
  - Lieu  
  - Formation académique (diplômes)  
  - Langues, Certifications  
  - ✅ Persisté automatiquement dans `localStorage` (profil de base).

- **`dynamicData`**  
  - Titre du CV pour une offre donnée  
  - Résumé / Summary  
  - Expériences sélectionnées  
  - Projets mis en avant  
  - Compétences clés  
  - 🔁 Réinitialisable entre deux candidatures.

- **Cover letter data**  
  - Destinataire, entreprise, adresse  
  - Date, objet, formule d’appel  
  - Corps de la lettre (paragraphes)  
  - Formule de politesse + signature  
  - 📨 Génère une lettre de motivation PDF.

Les données permanentes et dynamiques sont fusionnées pour produire :

- un **CV PDF** (layout type FlowCV : sidebar grise + colonne principale blanche),
- une **Lettre de motivation PDF** avec en-tête classique.

---

### 2. Interface utilisateur

L’interface est organisée en plusieurs zones :

- **Header noir (en haut)**  
  - Grande `textarea` : _“Coller le JSON de l’Internships Assistant ici”_  
  - Bouton rouge **“Auto-Fill Magique”**  
  - Bouton “Charger un exemple”  
  - Parse un JSON (NotebookLM / assistant IA) pour :
    - remplir les champs dynamiques du CV,
    - pré-remplir la lettre de motivation.

- **Système d’onglets à gauche**

  1. **⚙️ Profil Permanent**  
     - Formulaire complet pour le `permanentData`.  
     - Gros bouton **“Sauvegarder dans le navigateur”** (via `localStorage`).  
     - Si aucun profil n’est trouvé au lancement, l’utilisateur est forcé sur cet onglet avec un message :
       > “Bienvenue. Veuillez configurer votre profil de base.”

  2. **📝 CV Dynamique**  
     - Titre du CV  
     - Résumé / Summary  
     - Expériences (poste, entreprise, dates, description)  
     - Projets  
     - Compétences clés  
     - Bouton pour réinitialiser tous les champs dynamiques (nouvelle offre).

  3. **✉️ Lettre de Motivation**  
     - Bloc destinataire (nom, entreprise, adresse)  
     - Date, objet, salutations  
     - Corps de la lettre (paragraphes)  
     - Formule de politesse + signature (par défaut : nom du profil permanent).

- **Colonne de droite : Preview PDF en temps réel**

  - **Bannière d’alerte au-dessus du PDF** :
    - Si des champs critiques sont vides, une checklist affiche :
      - ⚠️ Champs requis manquants : `Email`, `Téléphone`, `Résumé`, `0 expérience`, `0 compétence`, etc.
    - Sinon : message vert indiquant que tous les champs requis sont remplis.
  - **Rendu PDF** :
    - CV ou Lettre de motivation selon l’onglet sélectionné.
    - Basé sur `@react-pdf/renderer`.
    - Texte 100% sélectionnable (ATS-friendly).

---

## 🧠 Fonctionnalités “AI-Ready”

- **Auto-Fill depuis JSON** :
  - Le JSON collé dans le header est mappé via des fonctions robustes (`mapJsonToDynamicData`, `mapJsonToPermanentData`, `mapJsonToCoverLetter`).
  - Gère plusieurs conventions de clés :
    - `jobTitle`, `job_title`, `poste`, `titre`, `position`…
    - `education` / `formations` / `studies`…
    - `skills` / `compétences`…
  - Ne remplace que les champs pertinents, sans casser le profil permanent déjà enregistré.

- **Import rapide du profil permanent** :
  - Textarea “Importer Profil JSON” dans l’onglet **Profil Permanent**.
  - Coller un objet JSON → parsing → auto-remplissage des champs (nom, email, formation, langues, certificats) → sauvegarde possible dans `localStorage`.

---

## 🛠️ Stack technique

- **Frontend** : React + Vite
- **Styling** : Tailwind CSS
- **PDF** : `@react-pdf/renderer` (CV + lettre de motivation)
- **State & persistance** :
  - `useState`, `useEffect`, `useMemo`
  - `localStorage` pour le profil permanent
- **Qualité UX** :
  - Split-screen (éditeur / preview)
  - Alerte champs manquants
  - Formulaires modulaires et réutilisables

---

## 🚀 Lancer le projet en local

npm install
npm run dev
# puis ouvrir l'URL indiquée (par défaut http://localhost:5173/)
