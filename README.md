# Moneylook Front

Frontend React + Vite de Moneylook.

Il fournit l'interface utilisateur pour gérer les comptes bancaires, catégories, dépenses, revenus, éléments récurrents et statistiques.

## Prérequis

- Node.js 20 ou plus récent
- npm
- le backend Moneylook accessible depuis le navigateur

Installer les dépendances :

```bash
npm install
```

## Développement local

Lancer le front :

```bash
npm run dev
```

Par défaut, Vite démarre sur `http://localhost:5173`.

En développement, `vite.config.js` proxy les routes API vers `http://localhost:8000`. Il faut donc lancer le backend en parallèle sur le port `8000`.

## Configuration de l'API

Le front utilise la variable Vite suivante :

```env
VITE_API_URL=
```

Valeurs recommandées :

- en production même domaine : laisser vide. Les appels API partent vers la même origine que le front, par exemple `/auth/login`.
- en environnement spécifique : mettre l'origine complète de l'API, par exemple `https://moneylook.example.com`.

Pour un déploiement simple et robuste, il est recommandé de servir le front et le backend sous le même domaine avec Nginx :

- fichiers statiques du front sur `/`
- backend proxifié sur `/auth`, `/expenses`, `/stats`, etc.

Cela permet aux cookies de session `SameSite=Lax` de fonctionner simplement.

## Build de production

Depuis `moneylook-front` :

```bash
npm install
npm run build
```

Le build est généré dans :

```txt
dist/
```

Si vous devez définir une URL d'API au moment du build :

```bash
VITE_API_URL=https://moneylook.example.com npm run build
```

Attention : les variables `VITE_*` sont intégrées dans les fichiers statiques générés. Ne jamais y mettre de secret.

## Tester le build localement

```bash
npm run preview
```

Cette commande sert le dossier `dist` localement pour vérifier le résultat avant déploiement.

## Déployer le build

Après `npm run build`, copier le contenu de `dist/` vers le dossier servi par Nginx, par exemple `/var/www/moneylook` :

```bash
sudo mkdir -p /var/www/moneylook
sudo rsync -av --delete dist/ /var/www/moneylook/
sudo chown -R www-data:www-data /var/www/moneylook
```

Exemple Nginx recommandé :

```nginx
server {
    listen 80;
    server_name moneylook.example.com;

    root /var/www/moneylook;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~ ^/(auth|account-types|bank-accounts|categories|expenses|incomes|recurring-expenses|recurring-incomes|stats)(/|$) {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Pour HTTPS, ajouter un certificat TLS avec Certbot ou l'outil choisi sur le serveur.

## Déploiement d'une nouvelle version

Sur la machine de build :

```bash
git pull
npm install
npm run build
```

Puis envoyer le build sur le serveur :

```bash
rsync -av --delete dist/ user@moneylook.example.com:/tmp/moneylook-dist/
```

Sur le serveur :

```bash
sudo rsync -av --delete /tmp/moneylook-dist/ /var/www/moneylook/
sudo chown -R www-data:www-data /var/www/moneylook
sudo nginx -t
sudo systemctl reload nginx
```

## Commandes utiles

```bash
npm run dev
npm run build
npm run preview
npm run lint
```

## Favicon et assets

Les assets de l'application sont dans `src/assets`.

Le favicon est référencé dans `index.html`. Si le fichier change de nom, mettre à jour la balise `<link rel="icon">`.
