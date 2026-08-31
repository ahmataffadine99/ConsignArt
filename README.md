# ConsignArt API - Projet Pédagogique NestJS

ConsignArt est une plateforme B2B dédiée aux galeries d'art contemporain pour gérer la consignation d'œuvres d'art. Cette API RESTful est développée avec **NestJS** et constitue le moteur principal de l'application. Elle permet aux artistes de confier leurs œuvres à des galeries, qui peuvent ensuite les exposer et les vendre.

## Instructions de lancement

Le projet est entièrement conteneurisé et très simple à démarrer. Assurez-vous d'avoir [Docker](https://www.docker.com/) installé sur votre machine.

1. Clonez le dépôt et placez-vous à la racine du projet.
2. Démarrez l'infrastructure avec Docker Compose :

```bash
docker compose up -d --build
```

L'application démarrera automatiquement sur **http://localhost:3000**.
- **Documentation de l'API (Swagger)** : http://localhost:3000/api/docs
- **Interface Base de données (Adminer)** : http://localhost:8080 (Système: PostgreSQL, Serveur: db, Utilisateur: consignart_user, Mot de passe: consignart_pass, Base: consignart)

### Lancement du Frontend (React / Vite)
Un client frontend a été développé (Bonus) avec React et Vite.
1. Ouvrez un nouveau terminal et naviguez dans le dossier `frontend` :
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
2. L'interface graphique de ConsignArt sera accessible sur **http://localhost:5173**.

> **Note sur les Fixtures (Seeder)** : Dès que vous lancez l'application via Docker, un script de seeding intelligent (`SeederService`) s'exécute automatiquement. Il remplit la base de données avec des comptes utilisateurs (Admin, Gallery, Artist, Collector), des œuvres, des ventes et des expositions, pour vous permettre de tester immédiatement les requêtes !
Le mot de passe pour tous les comptes de test est : `password123`.

Voici les emails des comptes générés pour vos tests :
- **Admin** : `admin@consignart.com`
- **Galeries** : `gallery@consignart.com` et `gallery2@consignart.com`
- **Collectionneur** : `collector@consignart.com`
- **Artistes** : `picasso@consignart.com` et `dali@consignart.com`

---

## Fonctionnalités implémentées

L'intégralité du cahier des charges fonctionnel a été implémentée :

- **Configuration globale** : Dockerfile multi-stage, TypeORM avec PostgreSQL.
- **Module Auth & Users** : Inscription, connexion, rôles (`admin`, `gallery`, `artist`, `collector`), et génération de Token JWT sécurisé.
- **Module Artists** : Profil public des artistes rattaché au compte `User`.
- **Module Artworks** : Gestion complète du catalogue d'œuvres d'art (historique des statuts, limite de 50 œuvres actives par artiste).
- **Module Sales** : Gestion des ventes, calcul automatisé des commissions (40/35/30%), facturation (Acheteur et Artiste) gérés via transaction TypeORM.
- **Module Exhibitions** : Création d'expositions (bloquée sans œuvres) et gestion complète des prêts (loans) inter-galeries.
- **Module Reports** : Tableaux de bord et statistiques pour les Galeries, Artistes et Administrateurs.
- **Tests (Unitaires & E2E)** : Couverture exhaustive (40+ tests au vert) des services critiques (Sales, Reports, Users) et test d'intégration E2E sur l'endpoint `/api/v1/artworks` tel que demandé dans le sujet.
- **Bonus Frontend** : Application cliente React/Vite complète avec interface de connexion, tableau de bord personnalisé par rôle et catalogue d'œuvres (Vanilla CSS, Glassmorphism).

---

## Choix techniques justifiés (Surcouche NestJS)

Pour respecter les meilleures pratiques architecturales et les contraintes du cahier des charges, de nombreux concepts avancés de NestJS ont été déployés de manière globale dans le dossier `src/common` :

1. **Guards & Sécurité**
   - **`JwtAuthGuard`** : Vérifie la validité du Token JWT.
   - **`RolesGuard`** : Limite l'accès à certains endpoints (ex: seul l'Admin peut supprimer un utilisateur).
   - **`OwnershipGuard`** : *(Guard métier)* Vérifie en base de données qu'une œuvre d'art appartient bien à l'utilisateur qui tente de la modifier. Un artiste ne peut pas modifier l'œuvre d'un autre artiste.

2. **Interceptors (Formatage et Logging)**
   - **`TransformInterceptor`** : Standardise toutes les réponses de l'API sous le format `{ data, meta, timestamp }` pour faciliter le travail du Frontend.
   - **`LoggingInterceptor`** : Mesure et affiche le temps de réponse de chaque requête directement dans les logs du serveur.

3. **Exception Filters**
   - **`GlobalExceptionFilter`** : Empêche l'API de crasher violemment en cas d'erreur serveur inattendue. Il formate l'erreur en un beau JSON `500 Internal Server Error` tout en gardant une trace claire dans les logs.
   - **`BusinessRuleViolationException`** : Exception personnalisée avec son propre filtre qui renvoie un code `422 Unprocessable Entity` en cas de violation d'une règle métier.

4. **Pipes Personnalisés**
   - **`NormalizePricePipe`** *(Pipe de transformation)* : Lorsqu'une œuvre est modifiée, ce pipe convertit automatiquement le prix fourni en valeur absolue et force un arrondi à deux décimales, peu importe ce que l'utilisateur envoie.
   - **`NotSoldPipe`** *(Pipe de validation)* : Avant de modifier une œuvre, ce pipe s'assure qu'elle ne possède pas déjà le statut "Vendue". Si c'est le cas, il bloque immédiatement la requête pour protéger l'intégrité de l'œuvre.

5. **Optimisation Base de Données**
   - **`@Index()`** : Des index TypeORM ont été placés sur les colonnes fréquemment interrogées (ex: `status` de l'entité `Artwork`, ou le `role` des utilisateurs) afin d'accélérer drastiquement les requêtes de filtrage.
