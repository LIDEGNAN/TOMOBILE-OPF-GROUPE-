# TOMOBILE OPF GROUPE

Application mobile de **tontine solidaire** (épargne par rotation) pour Android.

## Installation sur téléphone Android

### Méthode recommandée (PWA – Progressive Web App)

1. Transférez le dossier `tomobile` sur votre téléphone ou hébergez-le sur un serveur HTTPS (GitHub Pages, Netlify, Firebase Hosting…).
2. Ouvrez `index.html` dans **Chrome** ou **Samsung Internet**.
3. Menu (⋮) → **Ajouter à l’écran d’accueil** / **Installer l’application**.
4. L’icône TOMOBILE apparaît sur votre écran d’accueil et s’ouvre en plein écran comme une application native.

### Identifiants administrateur

| Champ            | Valeur          |
|------------------|-----------------|
| Identifiant mère | `010224987594`  |
| Mot de passe     | `Opf4542`       |

## Fonctionnalités

- **Connexion administrateur** sécurisée
- **Chefs d’équipes** : création, modification, suppression, consultation des participants
- **Participants** : sous un chef, nombre de parts, profil, marque de ramassage
- **Cotisations du jour** : montant versé, présents, manqués + montant dû
- **Paiements de parts manquées** : date, montant, identité du payeur
- **Prêts** : montant, avaliseur, motif, solde, remboursement
- **Caisses** :
  - TR/NR – Tontine reporter / non ramassée
  - TMANQP – Manqués payés plus tard
  - D – Dettes
- **Paramètres** : parts/tour, montant/part, parts enchères, périodicité
- **Traçabilité complète** de toutes les opérations
- **Export JSON / CSV** pour archive (à déposer manuellement sur Google Drive)

## Couleurs

- Bleu ciel / bleu primaire (`#0288D1`)
- Orange (`#FF6D00`)

## Notes techniques

- Données stockées en **localStorage** du navigateur (persistance locale).
- Pour une vraie synchronisation Google Drive automatique, il faut un backend + OAuth2.
- Une part peut être cotisée par au plus 3 personnes (champ co-titulaires prévu).
- Les matricules sont générés automatiquement à partir de l’identifiant mère.

## Développement

Fichiers principaux :
- `index.html` – structure
- `css/styles.css` – interface mobile
- `js/db.js` – base de données locale + traçabilité
- `js/app.js` – logique métier et écrans
- `manifest.json` + `sw.js` – PWA installable

---
© OPF GROUPE – Tontine Épargne Solidaire
