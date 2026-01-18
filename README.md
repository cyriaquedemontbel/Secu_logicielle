# Security Scanner MVP

> Outil d'analyse automatique de securite web - Projet etudiant

[![Made with Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![Made with FastAPI](https://img.shields.io/badge/FastAPI-0.109-green)](https://fastapi.tiangolo.com/)
[![OWASP ZAP](https://img.shields.io/badge/OWASP-ZAP-orange)](https://www.zaproxy.org/)

## Description

Ce projet est un MVP (Minimum Viable Product) d'outil d'analyse de securite web automatise. Il permet de scanner un site web pour detecter des vulnerabilites courantes. Un mode laboratoire (tests actifs) est disponible pour effectuer des simulations d'attaques controlees.

### Avertissement Important

Ce scanner peut effectuer des analyses destructives en mode laboratoire :
- Modification potentielle de donnees en mode lab
- Tentatives d'exploitation controlees en mode lab

Le mode laboratoire doit etre utilise uniquement sur des environnements de test ou avec autorisation explicite.

**Scannez uniquement les sites dont vous etes proprietaire ou pour lesquels vous avez une autorisation explicite.**

## Fonctionnalites

- **Analyse TLS/SSL**
  - Verification du certificat
  - Detection d'expiration
  - Analyse des SANs (Subject Alternative Names)
  - Verification HSTS

- **Analyse des Headers HTTP**
  - Content-Security-Policy
  - X-Frame-Options
  - X-Content-Type-Options
  - Strict-Transport-Security
  - Et plus...

- **Analyse des Cookies**
  - Flag Secure
  - Flag HttpOnly
  - Attribut SameSite

- **OWASP ZAP Baseline**
  - Scan passif automatise
  - Detection des vulnerabilites OWASP Top 10

- **Attaques Actives (Mode Laboratoire)**
  - Injection SQL
  - Cross-Site Request Forgery (CSRF)
  - Violation du principe du moindre privilege
  - Credential Stuffing
  - Simulations DoS
  - Brute Force

## Stack Technique

### Frontend
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS

### Backend
- Python 3.11
- FastAPI
- SQLite
- Uvicorn

### Outils de Scan
- OWASP ZAP (Docker)
- Scripts Python personnalises

## Installation

### Pre requis

- Docker Desktop installe et lance
- Docker Compose v2+
- 4 Go de RAM minimum (ZAP est gourmand)

### Lancement

```bash
# Cloner le projet
git clone <url-du-repo>
cd secu-project

# Lancer tous les services
docker compose up --build
```

### Acces

- **Frontend** : http://localhost:3000
- **Backend API** : http://localhost:8000
- **API Docs** : http://localhost:8000/docs
- **ZAP API** : http://localhost:8080

## Utilisation

1. Ouvrez http://localhost:3000 dans votre navigateur
2. Entrez l'URL du site a analyser
3. (Optionnel) Cochez "mode laboratoire" pour lancer les tests actifs
4. Cliquez sur "Lancer le scan"
5. Attendez la fin de l'analyse (2-5 minutes selon le site)
6. Consultez les resultats et telechargez le rapport HTML

## API Backend

### Endpoints

#### POST /runs
Creer un nouveau scan.

```json
{
  "target_url": "https://example.com",
  "max_duration_sec": 300,
  "lab_mode": false
}
```

Reponse:
```json
{
  "run_id": "uuid",
  "lab_mode": false
}
```

#### GET /runs/{run_id}
Obtenir le statut d'un scan.

```json
{
  "status": "queued | running | finished | failed",
  "progress": 60,
  "target_url": "https://example.com",
  "error_message": null,
  "lab_mode": false
}
```

#### GET /runs/{run_id}/findings
Obtenir les vulnerabilites detectees.

```json
{
  "run_id": "uuid",
  "status": "finished",
  "target_url": "https://example.com",
  "findings_count": 5,
  "findings": [...]
}
```

#### GET /runs/{run_id}/report
Telecharger le rapport HTML.

## Format des Findings

```json
{
  "id": "TLS-0001",
  "asset": {
    "type": "url",
    "value": "https://example.com"
  },
  "category": "OWASP A02",
  "check": "tls_probe",
  "severity": "High",
  "summary": "SSL certificate expires soon",
  "evidence": {
    "details": "Certificate expires in 15 days",
    "headers": {},
    "artifact_path": null
  },
  "remediation": [
    "Renew the SSL certificate",
    "Set up automated renewal"
  ],
  "source": "custom_probe",
  "run_id": "uuid",
  "lab_mode": false
}
```

## Structure du Projet

```
secu-project/
├── backend/
│   ├── app/
│   │   ├── main.py              # API FastAPI
│   │   ├── models.py            # Modeles de donnees
│   │   ├── db.py                # Couche base de donnees
│   │   ├── runner.py            # Orchestrateur de scan
│   │   ├── probes/
│   │   │   ├── tls_probe.py     # Analyse TLS
│   │   │   └── headers_probe.py # Analyse headers/cookies
│   │   ├── attacks/
│   │   │   ├── sql_injection.py  # Injection SQL
│   │   │   ├── csrf.py           # CSRF
│   │   │   ├── brute_force.py    # Brute force
│   │   │   ├── credential_stuffing.py # Credential stuffing
│   │   │   ├── dos.py            # DoS simulations
│   │   │   ├── least_privilege.py # Least privilege
│   │   │   └── lab_attacks.py    # Orchestrateur attaques
│   │   ├── zap/
│   │   │   ├── zap_runner.py    # Execution ZAP
│   │   │   └── zap_parser.py    # Parsing resultats ZAP
│   │   └── reporting/
│   │       └── report_builder.py # Generation rapport HTML
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── app/
│   │   ├── layout.tsx           # Layout principal
│   │   ├── page.tsx             # Page d'accueil
│   │   ├── globals.css          # Styles globaux
│   │   └── runs/[id]/page.tsx   # Page resultats
│   ├── components/
│   │   ├── FindingsTable.tsx    # Table des vulnerabilites
│   │   ├── FindingDetail.tsx    # Detail d'une vuln
│   │   └── ProgressBar.tsx      # Barre de progression
│   ├── lib/
│   │   └── api.ts               # Client API
│   ├── package.json
│   ├── tailwind.config.ts
│   └── Dockerfile
├── docker-compose.yml
├── data/                        # Volume partage (cree auto)
└── README.md
```

## Details des Scans

### TLS Probe
- Connexion SSL/TLS au serveur
- Verification de la validite du certificat
- Controle de la date d'expiration
- Analyse des SANs
- Verification de la version TLS (1.2+ recommande)
- Analyse des suites de chiffrement

### Headers Probe
- Verification des headers de securite HTTP
- Analyse des cookies (Secure, HttpOnly, SameSite)
- Detection des headers d'information (Server, X-Powered-By)
- Analyse HSTS (max-age, includeSubDomains, preload)

### OWASP ZAP Baseline
- Spider passif du site
- Analyse passive des reponses
- Detection automatique des vulnerabilites
- Mapping vers OWASP Top 10

### Attaques Actives (Mode Laboratoire)
- **Injection SQL** : Tentatives d'injection SQL controlees
- **CSRF** : Tests de vulnerabilites Cross-Site Request Forgery
- **Brute Force** : Simulations d'attaques par force brute
- **Credential Stuffing** : Tests avec listes de mots de passe compromis
- **DoS** : Simulations d'attaques par deni de service
- **Least Privilege** : Verification des principes de moindre privilege

## Rapport HTML

Le rapport genere contient :
- Resume executif avec comptage par severite
- Liste des 10 vulnerabilites les plus critiques
- Preuves techniques detaillees
- Recommandations de remediations
- Section limitations et avertissement legal

## Configuration

### Variables d'environnement Backend

| Variable | Description | Defaut |
|----------|-------------|--------|
| `ZAP_API_URL` | URL de l'API ZAP | `http://zap:8080` |
| `USE_DOCKER_EXEC` | Utiliser docker exec pour ZAP | `false` |

### Variables d'environnement Frontend

| Variable | Description | Defaut |
|----------|-------------|--------|
| `NEXT_PUBLIC_API_URL` | URL de l'API backend | `http://localhost:8000` |

## Depannage

### ZAP ne demarre pas
```bash
# Verifier les logs
docker compose logs zap

# Redemarrer ZAP
docker compose restart zap
```

### Le scan reste bloque
- Verifiez que le site cible est accessible
- Augmentez `max_duration_sec`
- Consultez les logs backend : `docker compose logs backend`

### Erreur de connexion API
- Verifiez que le backend est lance : http://localhost:8000/health
- Verifiez les CORS si vous accedez depuis un autre domaine

## Tests Manuels

```bash
# Test du backend
curl http://localhost:8000/health

# Lancer un scan
curl -X POST http://localhost:8000/runs \
  -H "Content-Type: application/json" \
  -d '{"target_url": "https://example.com", "lab_mode": false}'

# Verifier le statut
curl http://localhost:8000/runs/{run_id}
```

## Ressources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP ZAP](https://www.zaproxy.org/)
- [Mozilla Web Security Guidelines](https://infosec.mozilla.org/guidelines/web_security)
- [SSL Labs Best Practices](https://github.com/ssllabs/research/wiki/SSL-and-TLS-Deployment-Best-Practices)

## Limitations

1. **Mode Laboratoire** - Les attaques actives peuvent modifier des donnees
2. **Sites publics** - Pas de gestion d'authentification
3. **Single page** - Spider limite, pas de navigation JS complexe
4. **Timeout** - Maximum 30 minutes par scan
5. **Faux positifs** - Possible, validation manuelle recommandee

## Auteurs

Projet etudiant - Cours de Cybersécurité 2026

## Licence

Ce projet est destine a un usage educatif uniquement.

---

**Rappel** : Utilisez cet outil de maniere responsable et ethique. Ne scannez jamais un site sans autorisation.
