# Farafinah Gallery

Une application de galerie de photos Unsplash avec authentification personnalisée et système de likes.

## Fonctionnalités

- **Authentification personnalisée**
  - Interface de connexion moderne et responsive
  - Validation des champs en temps réel
  - Transitions UX fluides
  - Utilisateurs pré-configurés (voir ci-dessous)

- **Galerie d'images Unsplash**
  - Intégration de l'API Unsplash
  - Affichage responsive des images
  - Scroll infini pour charger plus d'images
  - Gestion des états de chargement avec squelettes
  - Gestion des erreurs

- **Système de Likes**
  - Likes persistants par utilisateur
  - Stockage local via localforage (IndexedDB)
  - Animation de like fluide
  - Conservation des likes entre sessions

## Technologies utilisées

- Vue.js 3 (avec Composition API)
- TypeScript
- Vue Router pour la navigation
- Vuex pour la gestion d'état
- LocalForage (basé sur IndexedDB) pour le stockage des likes
- Axios pour les requêtes API
- Vue Toast Notification pour les alertes
- CSS pur pour le design responsive

## Prérequis

- Node.js (>= 12.x)
- NPM ou Yarn

## Installation

1. Clonez le dépôt :
```
git clone https://github.com/sunders458/farafinah_galery2.git
cd farafinah_galery2
```

2. Installez les dépendances :
```
yarn install
# ou
npm install
```

3. Configurez votre clé API Unsplash :
   - Dans `.env` en et remplacez `your_unsplash_key_here` par votre clé API :

```
# .env.local
VUE_APP_UNSPLASH_ACCESS_KEY=votre_clé_ici
```

4. Lancez le serveur de développement :
```
yarn serve
# ou
npm run serve
```

5. L'application sera disponible à l'adresse : [http://localhost:8080](http://localhost:8080)

## Utilisation

### Authentification

Utilisez l'un des identifiants suivants pour vous connecter :

- Utilisateur 1 : `muser1` / `mpassword1`
- Utilisateur 2 : `muser2` / `mpassword2`
- Utilisateur bloqué : `muser3` / `mpassword3` (affichera un message d'erreur)

Toute autre combinaison affichera "Informations de connexion invalides".

### Galerie

- Parcourez les images en scrollant vers le bas (chargement infini)
- Cliquez sur l'icône ❤️ pour aimer une image
- Vos likes sont sauvegardés et associés à votre compte

## Architecture technique

L'application utilise une architecture modulaire avec les composants suivants :

### Structure du projet
```
src/
├── assets/           # Images et ressources statiques
├── components/       # Composants réutilisables
├── router/           # Configuration des routes
├── store/            # Store Vuex
│   ├── index.ts      # Configuration principale
│   └── modules/      # Modules Vuex
│       ├── auth.ts   # Module d'authentification
│       └── gallery.ts # Module de galerie et likes
├── views/            # Pages de l'application
│   ├── HomeView.vue  # Page d'accueil
│   ├── LoginView.vue # Page de connexion
│   └── GalleryView.vue # Page galerie
└── App.vue           # Composant racine
```

### Stockage des données

- **Authentification** : Les informations de l'utilisateur connecté sont stockées dans le localStorage pour persister entre les sessions
- **Likes** : Les likes sont stockés par utilisateur dans IndexedDB via LocalForage
- **Images** : Chargées depuis l'API Unsplash et mises en cache par le navigateur


## Déploiement

Pour créer une version de production :

```
yarn build
# ou
npm run build
```

Les fichiers générés seront dans le dossier `dist/` et peuvent être déployés sur n'importe quel hébergement statique