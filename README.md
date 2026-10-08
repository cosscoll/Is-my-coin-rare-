# EuroRare — Reconnaissance des pièces et billets euro rares

Site web statique et pédagogique pour aider un visiteur à identifier une pièce ou un billet en euro (pays, année, atelier, particularités) et à comprendre s'il peut présenter un intérêt pour les collectionneurs, avec un niveau de rareté indicatif et le contexte qui l'explique.

**Aucune dépendance de build.** HTML / CSS / JS purs, aucune bibliothèque 3D — prêt à être servi tel quel par GitHub Pages. Direction artistique « archive numismatique » : papier chamois, typographie éditoriale (Fraunces + Inter), visuels réels de pièces issus de sources numismatiques et institutionnelles référencées, plutôt que des reconstitutions 3D.

## ⚠️ Avertissement important

Les niveaux de rareté, les fourchettes de valeur et les explications présentées sur ce site sont **des indications pédagogiques et générales**, construites à partir de sources numismatiques publiques (Numista, banques centrales nationales, maisons numismatiques, presse spécialisée). Elles :

- **ne constituent pas une expertise individuelle** de votre pièce ou billet ;
- peuvent varier d'une source à l'autre, en particulier pour les tirages exacts ;
- ne remplacent en aucun cas l'avis d'un professionnel de la numismatique ou d'une maison de vente spécialisée avant tout achat, vente ou estimation.

## Structure du projet

```
/index.html              Page d'accueil (choix Pièces / Billets)
/pieces.html              Liste filtrable des pièces + assistant d'identification
/billets.html             Liste filtrable des billets + assistant d'identification
/detail.html               Compatibilité avec les anciennes URL paramétrées (noindex)
/pieces/<id>.html           Pages SEO statiques et indexables des 204 fiches pièces
/billets/<id>.html          Pages SEO statiques et indexables des fiches billets
/pays/<pays>.html           Pages pays pour le maillage interne
/guides/                    Guides éditoriaux
/methodologie.html          Méthode de rareté et d'estimation
/sources.html               Sources institutionnelles et marché
/sitemap.xml                Plan de site SEO
/robots.txt                 Directives d'exploration
/assets/css/style.css      Feuille de style unique (thème « archive numismatique »)
/assets/js/main.js         Utilitaires partagés (HUD, footer, badges de rareté, outil « Ma pièce »)
/assets/js/list.js         Logique des pages de liste + assistant "Identifie ma pièce/mon billet"
/assets/js/detail.js       Logique de la page de détail
/data/pieces.json          Base de données des pièces
/data/billets.json         Base de données des billets
```


Tous les chemins sont relatifs : le site fonctionne aussi bien à la racine d'un domaine que dans un sous-dossier de type `https://<utilisateur>.github.io/<nom-du-repo>/`.

## Activer GitHub Pages

1. Créez un dépôt public sur GitHub et poussez-y l'intégralité de ces fichiers (en conservant l'arborescence ci-dessus).
2. Dans le dépôt, allez dans **Settings** → **Pages**.
3. Sous **Build and deployment**, choisissez **Deploy from a branch**.
4. Sélectionnez la branche `main` (ou celle utilisée) et le dossier `/ (root)`, puis cliquez sur **Save**.
5. GitHub Pages publie le site sous quelques minutes à l'adresse indiquée en haut de la page Settings → Pages (généralement `https://<utilisateur>.github.io/<nom-du-repo>/`).

Aucune étape de build n'est nécessaire : les fichiers sont servis tels quels.

## Étendue de la base de données

`data/pieces.json` contient désormais **377 fiches** couvrant **25 pays et micro-États**, principalement des pièces de 2€ commémoratives (millésimes 2004 à 2018 dans le détail, plus quelques émissions récentes notables), avec le **tirage officiel exact** pour la grande majorité d'entre elles, sourcé auprès de fleur-de-coin.com (mintages officiels) et recoupé avec Numista. L'Allemagne y figure avec le détail des 5 ateliers de frappe (Berlin/Munich/Stuttgart/Karlsruhe/Hambourg) pour chaque millésime, ainsi qu'une variante d'erreur de frappe documentée (Hambourg 2008, carte de l'Europe erronée sur environ 600 000 exemplaires de l'atelier de Stuttgart). Le niveau de rareté de ces fiches est **calculé automatiquement à partir du tirage réel** selon le barème suivant : moins de 50 000 pièces → Très rare · 50 000 à moins de 300 000 → Rare · 300 000 à moins de 1 500 000 → Recherchée · 1 500 000 à moins de 5 000 000 → Peu commune · 5 000 000 et plus → Commune. Ce barème est une convention numismatique courante, pas une cotation officielle : la demande réelle des collectionneurs (popularité du thème, état de conservation) peut faire varier la cote au-delà de ce que le tirage seul indique.

S'y ajoutent 8 fiches « cas emblématiques » rédigées à la main (Vatican, Saint-Marin, Andorre première série, Allemagne/France fautées, etc.) pour les cas où aucun tirage exact fiable n'a été trouvé, avec un niveau de rareté qualitatif justifié dans le texte.

Le catalogue couvre désormais les séries nationales de 2€ des 25 juridictions émettrices actuellement concernées, mais il ne couvre pas encore chaque émission commémorative individuellement. La principale lacune restante concerne les commémoratives 2019–2026 et le détail exhaustif par millésime de plusieurs pays ; ces ajouts doivent être faits uniquement à partir de fiches officielles ou de sources numismatiques recoupées.

## Photos des pièces

Les **377 fiches sur 377** disposent désormais d’un visuel réel associé. Les fiches correspondant à une émission précise affichent l’avers et le revers. Les fiches regroupant plusieurs millésimes, une série complète ou une famille d’erreurs utilisent un **visuel réel représentatif**, clairement signalé comme tel afin de ne pas le présenter comme l’unique variante possible.

Chaque objet `photo` conserve les références du visuel (`recto`, `verso`, `source_name`, `source_url` et, lorsqu’ils sont disponibles, `credit` / `licence`). Le champ `combined` permet d’afficher correctement une photographie de référence qui montre les deux faces sur un même visuel.

## Valeur de revente

Chaque fiche de pièce affiche désormais une **estimation prudente de revente** en fonction de l’état (circulée, UNC/BU/FDC, conditionnement collection), ainsi que des liens de comparaison vers des sources de marché plus fiables que de simples annonces actives.

Le site privilégie :
- les cotes et ventes réalisées référencées par Numista ;
- les recherches eBay filtrées sur les objets réellement vendus / terminés ;
- les offres de vendeurs professionnels sur MA-Shops, à utiliser comme prix boutique de comparaison et non comme prix de revente garanti.

Une annonce active isolée n’est jamais considérée comme une preuve de valeur. Les pièces exceptionnelles, les erreurs de frappe et les émissions de Monaco / Chypre disposent de fourchettes spécifiques lorsque des transactions documentées existent.

Les **20 fiches de billets** disposent également d’une estimation de revente dédiée, adaptée au type de billet (signature Duisenberg, numéro particulier, code imprimeur, 500 € retiré, erreur d’impression, première série Europa, etc.). Les références privilégient les ventes réalisées, les cotes Numista et les plateformes numismatiques spécialisées plutôt que les simples prix demandés par les vendeurs.

## Compléter la base de données

Les fichiers `data/pieces.json` et `data/billets.json` contiennent une sélection volontairement restreinte de cas réels et documentés (2€ Grace Kelly de Monaco, tirages des micro-États, erreurs de frappe, signatures et numéros de série des billets, etc.). Chaque entrée suit le même schéma :

```json
{
  "id": "identifiant-unique-utilise-dans-l-url",
  "pays": "Pays ou zone d'émission",
  "valeur": "Valeur faciale",
  "annees": "Année(s) concernée(s)",
  "categorie": "commemorative | premiere-frappe | erreur-de-frappe | petit-pays | serie-courante | signature | numero-de-serie | code-imprimeur | coupure-retiree | erreur-impression | premiere-emission",
  "tirage": "Description qualitative du tirage — éviter les chiffres non vérifiés",
  "criteres": [{ "titre": "…", "detail": "…" }],
  "rarete": "commune | peu-commune | recherchee | rare | tres-rare",
  "explication": "Contexte expliquant le niveau de rareté",
  "source": "Sources / repères utilisés"
}
```

Pour ajouter une entrée, il suffit de l'ajouter au tableau JSON correspondant : les pages de liste, les filtres et la fiche de détail se mettent à jour automatiquement, sans modification de code.

## Accessibilité et responsive

- Toutes les animations non déclenchées par l'utilisateur respectent `prefers-reduced-motion` (shimmer de la barre de progression, transitions de page compris).
- Les étapes d'identification pas à pas (`.step`) sont accessibles au clavier (`tabindex`, `role="button"`, `aria-pressed`, activation par Entrée/Espace), pas seulement à la souris.
- Une recherche libre (pays, thème, année) complète les filtres à facettes sur les pages Pièces et Billets, utile dès que la liste dépasse quelques dizaines de fiches.
- Les zones sûres iOS (`env(safe-area-inset-*)`) sont prises en compte dans le HUD et le pied de page.
- Les vignettes de photo (`.specimen-frame`) utilisent `aspect-ratio` plutôt que des dimensions fixes, pour rester nettes et bien cadrées à toutes les tailles d'écran.
- Plusieurs seuils responsive sont prévus (`max-width` et un filet de sécurité `aspect-ratio`) pour éviter tout chevauchement sur mobile.


## SEO et validation

Chaque fiche possède désormais une page HTML statique indexable avec title, meta description, canonical, OpenGraph, JSON-LD et breadcrumb. Les anciennes URL `detail.html?type=...` restent fonctionnelles mais la page générique est en `noindex,follow`.

Le dépôt contient un contrôle automatique sans dépendance :

```bash
npm run validate
```

Le workflow GitHub Actions `.github/workflows/validate.yml` exécute ce contrôle à chaque push ou pull request afin de détecter les IDs dupliqués, champs manquants, pages SEO absentes, photos incomplètes, entrées manquantes dans le sitemap et erreurs de syntaxe JavaScript.
