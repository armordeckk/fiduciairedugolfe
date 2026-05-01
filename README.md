# La Fiduciaire du Golfe — Site web

Site vitrine refondu pour le cabinet d'expertise comptable **La Fiduciaire du Golfe** (Cavalaire-sur-Mer).
Site statique HTML / CSS / JavaScript vanilla, sans dépendance, prêt à être déployé sur tout hébergement classique.

## Structure

```
/
├── index.html              Accueil
├── cabinet.html            Le Cabinet (histoire, équipe, valeurs)
├── services.html           Expertises (comptabilité, fiscalité, social, juridique, création)
├── contact.html            Contact (formulaire + carte)
├── blog.html               Articles & conseils (structure prête)
├── mentions-legales.html   Mentions légales + RGPD
├── robots.txt
├── sitemap.xml
├── .htaccess               Compression / cache / sécurité / HTTPS
└── assets/
    ├── css/style.css       Feuille de style principale
    ├── js/main.js          Interactions (header, menu, reveal, formulaire, hooks Google Reviews)
    └── images/logo.png     Logo du cabinet
```

## Identité visuelle

Palette inspirée du logo, retravaillée pour un rendu élégant et fiduciaire :

- **Bordeaux profond** `#6B0F1A` — primaire (autorité, confiance)
- **Or champagne** `#B8954A` — accent (prestige)
- **Graphite** `#1A1D24` — texte / sections sombres
- **Ivoire chaud** `#FAF7F2` — fond principal

Typographies : **Cormorant Garamond** (titres serif), **Inter** (corps de texte sans-serif).

## SEO

- Meta description, keywords, canonical, Open Graph, Twitter Cards sur chaque page
- Schema.org JSON-LD : `AccountingService`, `BreadcrumbList`, `ContactPage`, `Blog`, `ItemList`
- `sitemap.xml` et `robots.txt` à la racine
- Structure sémantique (header / main / section / article / footer)
- Balises Hn hiérarchisées
- Images en `alt` descriptifs
- URLs propres (via `.htaccess`)
- Performance : polices preconnect, animations GPU, lazy iframes, sans framework

## Activation de l'API Google Reviews

Le HTML d'accueil contient déjà le conteneur `[data-google-reviews]` et les emplacements pour la note moyenne (`[data-google-rating]`) et le nombre d'avis (`[data-google-count]`). Trois avis sont affichés en placeholder en attendant.

### Étapes pour activer les vrais avis

1. **Créer une clé API Google Places** sur [console.cloud.google.com](https://console.cloud.google.com/) (API « Places API »).
2. **Ne jamais exposer la clé en frontend** — la stocker côté serveur et créer un mini-proxy. Exemple PHP minimal (fichier `api/reviews.php`) :

   ```php
   <?php
   header('Content-Type: application/json');
   $apiKey = 'VOTRE_CLE_API';
   $placeId = $_GET['placeId'] ?? '';
   $url = "https://maps.googleapis.com/maps/api/place/details/json"
        . "?place_id=" . urlencode($placeId)
        . "&fields=rating,user_ratings_total,reviews"
        . "&language=fr&key=" . $apiKey;
   echo file_get_contents($url);
   ```

3. **Initialiser côté client** dans `index.html`, juste avant la fermeture `</body>` :

   ```html
   <script>
     initGoogleReviews({
       placeId: 'VOTRE_PLACE_ID',
       endpoint: '/api/reviews.php'
     });
   </script>
   ```

4. **Récupérer le Place ID** sur [developers.google.com/maps/documentation/places/web-service/place-id](https://developers.google.com/maps/documentation/places/web-service/place-id).

> Limite de l'API : maximum 5 avis renvoyés. Pour un affichage plus large, utiliser un agrégateur (Trustindex, Elfsight) ou stocker les avis périodiquement côté serveur.

## Connecter le formulaire de contact

Le formulaire de la page `contact.html` est déjà validé côté client. Pour activer l'envoi d'e-mails, brancher l'événement `submit` (déjà géré dans `main.js`) à un endpoint :

- **Solution simple** : [Formspree](https://formspree.io/), [Web3Forms](https://web3forms.com/) — copier l'URL d'action dans la balise `<form>`.
- **Solution PHP** : créer `api/contact.php` qui utilise `mail()` ou PHPMailer.

## Articles de blog

Le HTML de `blog.html` contient, en commentaire, la structure d'une carte article (`.blog-card`). Il suffit de la dupliquer pour chaque article publié, en remplaçant l'état vide (`.blog-empty`).

Recommandation : créer un dossier `articles/` avec un fichier HTML par article, en respectant la même structure que les autres pages (header / footer identiques) pour conserver la cohérence visuelle et SEO.

## Déploiement

1. Uploader l'ensemble des fichiers à la racine de l'hébergement (FTP, SFTP, panel).
2. Vérifier que `.htaccess` est bien transféré (souvent caché).
3. Activer HTTPS (Let's Encrypt) si ce n'est pas déjà fait.
4. Soumettre `sitemap.xml` à Google Search Console.
5. Compléter dans `mentions-legales.html` les informations légales spécifiques (forme juridique, RCS, hébergeur, etc.).
