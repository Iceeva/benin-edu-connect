# 🇧🇯 Benin Edu Connect

Plateforme nationale **simulée** qui relie en un seul endroit les apprenants, les parents, les enseignants, les établissements, les directions départementales et les ministères de l'éducation au Bénin. Projet réalisé pour le **Challenge EduTech Bénin** (livrable en 3 jours : dépôt GitHub + plateforme déployée).

> ⚠️ Toutes les données sont **fictives** et les paiements sont **simulés** : aucun argent réel, aucune donnée personnelle réelle.

## 1. Pourquoi ce projet ?

Au Bénin, des briques existent déjà (par exemple EducMaster pour la gestion scolaire) et l'État porte le projet e-Éducation (unifier les systèmes d'information, suivre les apprenants, fiabiliser les diplômes). Le problème que je cherche à résoudre : **un apprenant, un dossier, des acteurs qui se parlent**. Aujourd'hui un élève qui change d'école, un parent qui veut justifier une absence, une entreprise qui doute d'un diplôme ou un ministère qui cherche des chiffres fiables passent par des circuits séparés.

Ma réponse : une couche d'identité et de services (dossier unique, documents vérifiables, paiements, alertes, rendez-vous) pensée comme une **infrastructure interopérable** (API), pas comme un logiciel qui remplacerait l'existant.

## 2. Ce que la plateforme sait faire

| Domaine | Fonctionnalités |
|---|---|
| Dossier apprenant | identité unique `BJ-EDU-xxxx`, notes pondérées, moyenne, absences/retards, parcours d'établissements, diplômes |
| Justification | l'élève/parent dépose un motif, l'école accepte ou refuse, tout est historisé |
| Documents | bulletin imprimable, référence unique, empreinte SHA-256, QR simulé, vérification publique sans données privées |
| Paiements (simulés) | MTN MoMo, Moov Money, carte ; reçus ; le téléchargement du bulletin est conditionné au paiement |
| Pilotage | tableau de bord par département (direction : son département, ministère : national), filtres niveau/statut |
| Détection de problèmes | décrochage (absences non justifiées), difficultés (moyenne < 8), doublons, notes impossibles, diplômes sans référence ; score de risque **expliqué** |
| Rendez-vous | créneaux, détection de conflits, convocation automatique depuis une alerte |
| Transferts | demande de l'école d'origine, décision de l'école d'accueil, historique conservé |
| Corrections de notes | l'enseignant propose, l'école valide, l'ancienne valeur est gardée |
| Aides | bourse (éligibilité sur la moyenne), cantine, transport ; décaissement simulé |
| Espace enseignant | appel de la classe et saisie de notes en groupe |
| Recherche | recherche globale multi-entités avec filtres, pagination, export CSV |
| Traçabilité | journal d'audit chaîné par hachage (une altération casse la chaîne) |
| Notifications | déclenchées par les événements, cloche + alerte visuelle |

## 3. Accessibilité et connectivité limitée (exigences du challenge)

- **Malvoyants** : HTML sémantique, `aria-label`, `aria-live`, lien d'évitement, focus visible, contraste élevé, texte agrandissable (A+/A−), 🔊 lecture vocale de la page.
- **Malentendants** : aucune information n'est portée par le son seul ; les alertes sont visuelles (bandeau clignotant) et déclenchent une vibration.
- **Faible alphabétisation** : mode facile 🧩 (pictogrammes dans le menu, gros boutons), lecture vocale, interface simple ; police adaptée à la dyslexie (Aa).
- **Langues** : français et anglais (dictionnaire extensible : fon, yoruba… à ajouter dans `public/js/i18n.js`).
- **Faible débit** : zéro framework, zéro dépendance, pages chargées à la demande, pas de polling, requêtes groupées (appel, notes), PWA avec lecture hors-ligne et bandeau « hors-ligne ».

## 4. Architecture

```
public/            front statique (JS ES modules, sans build)
  js/app.js        routeur "hash" (#page?param=…)
  js/registry.js   menu : [id, titre, pictogramme]
  js/pages/*.js    une page = un module
  js/panels/*.js   blocs de la fiche apprenant (notes, absences, diplômes…)
  sw.js            service worker (hors-ligne)
api/index.js       UNE seule fonction Vercel
lib/router.js      mini-routeur + hooks (notifications, audit)
lib/routes/*.js    un module par domaine métier
lib/auth.js        RBAC + périmètres
lib/db.js          données simulées en mémoire
```

Choix assumés :
- **Une seule fonction serverless** (`api/index.js` + réécriture dans `vercel.json`) pour rester sous la limite de fonctions du plan gratuit.
- **Hooks** : les notifications et l'audit se branchent sur les requêtes réussies sans modifier chaque route.
- **Modules enregistrés dans une liste** (`routes/index.js`, `registry.js`, panels) : ajouter une fonctionnalité = ajouter un fichier + une ligne. C'est ce qui rend l'historique des 25 commits lisible.

## 5. Profils de démonstration

Sélecteur « Profil » en haut de page (l'identifiant de périmètre est défini automatiquement) :

| Profil | Périmètre | Peut notamment |
|---|---|---|
| Élève / Parent | `BJ-EDU-1001` | voir son dossier, justifier, payer, prendre rendez-vous, demander une aide |
| Enseignant | école `S2` | appel, notes, proposer une correction |
| Directeur d'école | école `S2` | valider justificatifs/corrections/transferts, convoquer, exporter |
| Direction départementale | Atlantique | pilotage, alertes, aides de son département |
| Ministère | national | tout voir, révoquer un diplôme, journal d'audit |
| Entreprise / Public | - | vérifier un diplôme (données minimales) |

## 6. Simulations à connaître

- **Paiement** : téléphone finissant par `00` = refus (solde insuffisant), sinon succès. Aucun opérateur n'est appelé.
- **QR code** : visuel généré à partir de la référence (démonstration). En production : un vrai QR pointant vers `/#verify?ref=…`.
- **Authentification** : remplacée par un sélecteur de profil (en-têtes `x-role` / `x-user`). **Ce n'est pas sécurisé** : voir §9.
- **Données** : en mémoire, réinitialisées au redémarrage de la fonction Vercel.

## 7. API (préfixe `/api`)

`GET /stats /meta /schools /students /students/:id /students/:id/{grades,absences,bulletin,diplomas,payments,risk}` ·
`POST /absences/:id/{justify,decide}` · `GET /justifications` · `GET /fees` · `POST /pay` · `GET /verify/:ref` · `POST /diplomas/:ref/revoke` ·
`GET /dashboard` · `GET /alerts` · `POST /alerts/:id/ack` · `GET /slots` · `GET|POST /appointments` · `POST /appointments/summon` · `POST /appointments/:id/status` ·
`GET /notifications` · `GET|POST /transfers` · `POST /transfers/:id/decide` · `GET /audit` · `POST /grades/:id/correction` · `GET /corrections` · `POST /corrections/:id/decide` ·
`GET|POST /aides` · `POST /aides/:id/decide` · `GET /classes` · `GET /classes/:cls/students` · `POST /attendance/bulk` · `POST /grades/bulk` ·
`GET /search` · `GET /export/students` · `GET /risk/top` · `GET /overview`.

## 8. Lancer, tester, déployer

```bash
npm test                 # test de fumée (16 vérifications, sans serveur)
npx vercel dev           # exécution locale (front + API)
npx vercel               # déploiement (puis `npx vercel --prod`)
```
Aucune variable d'environnement, aucun build : Vercel sert `public/` et la fonction `api/index.js`.

## 9. Sécurité et données personnelles

- Contrôle d'accès par rôle **et** par périmètre côté serveur (`lib/auth.js`) ; les tests vérifient les refus (403).
- Vérification publique : uniquement initiales, type, année, établissement (pas de notes).
- Audit chaîné ; le téléphone est masqué dans le journal.
- Les frais sont définis par l'école/le ministère (catalogue), pas par la plateforme ; consulter ses notes et absences reste gratuit, seuls les documents officiels peuvent être payants.
- **Avant une vraie mise en production** : vraie authentification (MFA), jetons signés à la place des en-têtes, base de données persistante (PostgreSQL) et stockage objet pour les PDF, chiffrement, conformité au Code du numérique béninois et à l'APDP (finalité, durée de conservation, droits d'accès/rectification), vrai QR signé.

## 10. Limites et suite possible

Interopérabilité réelle avec EducMaster, vrai fournisseur de paiement, base PostgreSQL, langues nationales, mode hors-ligne avec file d'attente d'actions, SMS pour les zones sans Internet.

## 11. Journal de bord : 25 commits

Chaque commit ajoute une brique visible ; le premier est une plateforme minimale déjà déployable, le dernier la version complète. `git log --oneline` donne le détail.

- **Commit 1** - Plateforme de base : liste des apprenants + statistiques (données simulées, déjà compatible Vercel).
- **Commit 2** - Barre d'accessibilité : taille du texte, contraste élevé, lien d'évitement, focus visible.
- **Commit 3** - Recherche multi-filtres (texte, département, niveau, établissement, sexe) avec résultats annoncés aux lecteurs d'écran.
- **Commit 4** - Fiche apprenant modulaire (panels) + notes et moyenne pondérée.
- **Commit 5** - Absences et retards dans le dossier de l'apprenant.
- **Commit 6** - Profils de démonstration + contrôle d'accès par rôle ET par périmètre (élève, école, département, ministère).
- **Commit 7** - Justification des absences : dépôt par l'élève/parent, décision de l'école.
- **Commit 8** - Bulletin officiel imprimable : référence unique, empreinte SHA-256, QR simulé.
- **Commit 9** - Paiements SIMULÉS (MTN, Moov, carte) : catalogue de frais, reçus, historique.
- **Commit 10** - Le téléchargement du bulletin est conditionné au paiement (402 -> formulaire de paiement -> déblocage).
- **Commit 11** - Diplômes + vérification publique (données minimales) + révocation par le ministère.
- **Commit 12** - Tableau de pilotage par département (direction : son département ; ministère : national) avec filtres.
- **Commit 13** - Détection automatique : décrochage, difficultés scolaires, doublons, notes impossibles, diplômes sans référence.
- **Commit 14** - Rendez-vous : créneaux, détection de conflits (créneau/apprenant), convocation automatique depuis une alerte.
- **Commit 15** - Notifications déclenchées par les événements (paiement, justificatif, rendez-vous) + cloche.
- **Commit 16** - Transferts entre établissements (même niveau) avec historique de parcours conservé.
- **Commit 17** - Journal d'audit chaîné par hachage (toute altération est détectable).
- **Commit 18** - Correction de notes en deux temps (enseignant propose, école valide) avec historique de l'ancienne valeur.
- **Commit 19** - PWA : installable, lecture hors-ligne (cache par profil), bandeau de connexion, API non cachée par le CDN.
- **Commit 20** - Accessibilité avancée : lecture vocale, mode facile (pictogrammes), police dyslexie, alertes visuelles/vibration, mouvement réduit.
- **Commit 21** - Interface bilingue FR/EN (dictionnaire extensible, attribut lang mis à jour pour les lecteurs d'écran).
- **Commit 22** - Aides : bourse (éligibilité sur la moyenne), cantine, transport ; décision ministère/direction, décaissement simulé.
- **Commit 23** - Espace enseignant : appel de la classe et saisie groupée de notes (validation tout-ou-rien).
- **Commit 24** - Recherche globale (apprenants, établissements, diplômes, rendez-vous) : filtres, pagination, export CSV, périmètre respecté.
- **Commit 25** - Version finale : accueil par rôle, score de risque, aide, tests de fumée, README complet.
