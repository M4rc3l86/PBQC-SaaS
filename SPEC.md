# SaaS Specification: Foto-basierte Qualitätskontrolle für Service-Jobs

> **Version:** 1.0 (MVP)  
> **Stand:** Januar 2025  
> **Zielgruppe:** Gebäudereinigung (initial)

---

## 1. Executive Summary

### 1.1 Vision
Eine SaaS-Plattform für foto-basierte Qualitätskontrolle bei wiederkehrenden Service-Jobs. Die Plattform ermöglicht Reinigungsfirmen, Checklisten zu erstellen, Fotobelege von Mitarbeitern einzufordern und automatisch professionelle PDF-Reports für ihre Kunden zu generieren.

### 1.2 Value Proposition (Pitch)
> „Erstelle Checklisten für Jobs, zwinge Fotobelege zur Abnahme und sende Kunden automatisch einen sauberen PDF-Qualitätsreport."

### 1.3 MVP-Scope

**Enthalten:**
- Multi-Tenant SaaS mit Rollen-basiertem Zugriff
- Checklisten-Templates mit Pflichtfotos
- Job-Ausführung mit Foto-Upload
- Review-Workflow für Manager
- PDF-Report-Generierung
- Öffentliche Report-Links für Kunden
- Stripe-basiertes Subscription-Billing
- Trial-Modus mit Email-Benachrichtigungen

**Bewusst ausgeschlossen (MVP):**
- KI-Features (keine Foto-Qualitätserkennung)
- Offline-first / lokaler Zwischenspeicher
- Recurring Jobs (automatische Wiederholung)
- Org-Switcher (ein User, mehrere Firmen)
- Standort-Sharing zwischen Firmen
- Downgrade-Handling (Standort/Nutzer-Auswahl)
- Datenexport (DSGVO Art. 20)
- Push-Notifications
- Monitoring/Error-Tracking

---

## 2. Rollen & Berechtigungen

### 2.1 Rollen-Übersicht

| Rolle | Beschreibung | Lizenz-relevant |
|-------|--------------|-----------------|
| **Admin** | System-Admin (du), Support, manuelles Provisioning | Nein |
| **Owner** | Zahlt, verwaltet Firma/Standorte/Teams, sieht alles | Ja |
| **Manager** | Erstellt Templates, plant Jobs, reviewt, exportiert Reports | Ja |
| **Worker** | Führt zugewiesene Jobs aus, macht Fotos | Ja |
| **Client Viewer** | Sieht freigegebenen Report (ohne Login) | Nein |

### 2.2 Berechtigungsmatrix

| Aktion | Owner | Manager | Worker |
|--------|-------|---------|--------|
| Org-Einstellungen bearbeiten | ✅ | ❌ | ❌ |
| Billing verwalten | ✅ | ❌ | ❌ |
| Nutzer einladen/entfernen | ✅ | ✅ | ❌ |
| Standorte verwalten | ✅ | ✅ | ❌ |
| Templates erstellen/bearbeiten | ✅ | ✅ | ❌ |
| Jobs erstellen/zuweisen | ✅ | ✅ | ❌ |
| Jobs canceln | ✅ | ✅ | ❌ |
| Alle Jobs der Org sehen | ✅ | ✅ | ❌ |
| Nur eigene Jobs sehen | - | - | ✅ |
| Job ausführen | ❌ | ❌ | ✅ |
| Jobs reviewen (approve/reject) | ✅ | ✅ | ❌ |
| Report-Link generieren | ✅ | ✅ | ❌ |
| Report-Link widerrufen | ✅ | ✅ | ❌ |

---

## 3. User Flows

### 3.1 Onboarding Flow (Owner)

```
1. Landing Page → "Kostenlos testen" klicken
2. Registrierung (Email + Passwort ODER Magic Link)
3. Email-Verifizierung
4. Firma anlegen (Name)
5. Ersten Standort anlegen (Name, Adresse)
6. Erstes Checklist-Template erstellen (oder Demo-Template verwenden)
7. Ersten Worker einladen (Email)
8. Ersten Job planen
9. → Dashboard (Trial aktiv, X Tage verbleibend)
```

### 3.2 Job-Ausführung Flow (Worker)

```
1. App öffnen → "Heute"-Liste mit zugewiesenen Jobs
2. Job auswählen → Job-Detail mit Checklist
3. "Job starten" → Status: in_progress
4. Pro Checklist-Item:
   a. Item abhaken (pass/fail/n.a.)
   b. Falls requires_photo: Kamera öffnet sich
   c. Foto aufnehmen (eigenes Kamera-UI mit Hilfslinien)
   d. Optional: Notiz hinzufügen
5. ODER: "Schnellmodus" → Alle Items auf einmal abhaken
   - Pflichtfotos müssen trotzdem gemacht werden
   - Kein visueller Unterschied im Report
6. "Job abschließen" → Status: submitted
7. → Job ist für Worker nun read-only
```

### 3.3 Review Flow (Manager)

```
1. Dashboard → "Pending Review" Badge zeigt Anzahl
2. Review-Liste öffnen → Jobs mit Status "submitted"
3. Job auswählen → Alle Items, Fotos, Notizen sehen
4. Entscheidung:
   a. "Approve" → Status: approved
   b. "Reject" + Kommentar → Status: rejected
      - Worker kann nachbessern
      - Job wird wieder bearbeitbar für Worker
5. Bei approved: "Report teilen" → Öffentlicher Link generiert
6. Link kopieren oder direkt per Email senden
```

### 3.4 Kundenansicht Flow (Client Viewer)

```
1. Link erhalten (z.B. per Email von Reinigungsfirma)
2. Link öffnen (z.B. app.example.com/r/a7x9k2)
3. Report-Seite sehen:
   - Firmenname
   - Standort
   - Datum
   - Checklist mit Status (pass/fail/n.a.)
   - Fotos (ohne Timestamp, ohne Worker-Name)
4. "PDF herunterladen" → Vorgeneriertes PDF
5. Nach 7 Tagen: Link abgelaufen
```

---

## 4. Datenmodell

### 4.1 Entity-Relationship-Diagramm (vereinfacht)

```
┌─────────────────┐       ┌─────────────────┐
│  organizations  │───────│   org_members   │
└─────────────────┘       └─────────────────┘
        │                         │
        │                         │
        ▼                         ▼
┌─────────────────┐       ┌─────────────────┐
│     sites       │       │     users       │
└─────────────────┘       │   (Supabase)    │
        │                 └─────────────────┘
        │
        ▼
┌─────────────────┐       ┌─────────────────┐
│      jobs       │───────│checklist_templates│
└─────────────────┘       └─────────────────┘
        │                         │
        │                         │
        ▼                         ▼
┌─────────────────┐       ┌─────────────────┐
│job_item_results │───────│ checklist_items │
└─────────────────┘       └─────────────────┘
        │
        │
        ▼
┌─────────────────┐       ┌─────────────────┐
│   job_photos    │       │  client_shares  │
└─────────────────┘       └─────────────────┘
```

### 4.2 Tabellen-Definitionen

#### organizations
```sql
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  owner_user_id UUID NOT NULL REFERENCES auth.users(id),
  stripe_customer_id VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### org_members
```sql
CREATE TYPE org_role AS ENUM ('owner', 'manager', 'worker');
CREATE TYPE member_status AS ENUM ('invited', 'active', 'inactive');

CREATE TABLE org_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  email VARCHAR(255) NOT NULL, -- für Einladungen vor Registrierung
  role org_role NOT NULL,
  status member_status DEFAULT 'invited',
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  joined_at TIMESTAMPTZ,
  
  UNIQUE(org_id, email)
);
```

#### sites
```sql
CREATE TABLE sites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  address TEXT,
  timezone VARCHAR(50) DEFAULT 'Europe/Berlin',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### checklist_templates
```sql
CREATE TABLE checklist_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### checklist_items
```sql
CREATE TYPE item_type AS ENUM ('checkbox', 'text', 'number', 'photo_only');

CREATE TABLE checklist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES checklist_templates(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES checklist_items(id), -- für Verschachtelung (Post-MVP)
  title VARCHAR(255) NOT NULL,
  description TEXT,
  item_type item_type DEFAULT 'checkbox',
  sort_order INTEGER NOT NULL,
  requires_photo BOOLEAN DEFAULT false,
  requires_note BOOLEAN DEFAULT false,
  is_conditional BOOLEAN DEFAULT false, -- Post-MVP
  condition_config JSONB, -- Post-MVP
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### jobs
```sql
CREATE TYPE job_status AS ENUM ('scheduled', 'in_progress', 'submitted', 'approved', 'rejected', 'cancelled');

CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  site_id UUID NOT NULL REFERENCES sites(id),
  template_id UUID NOT NULL REFERENCES checklist_templates(id),
  assigned_user_id UUID REFERENCES auth.users(id),
  status job_status DEFAULT 'scheduled',
  scheduled_date DATE NOT NULL,
  started_at TIMESTAMPTZ,
  submitted_at TIMESTAMPTZ,
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES auth.users(id),
  review_comment TEXT,
  quick_mode_used BOOLEAN DEFAULT false, -- intern tracken, aber nicht im Report zeigen
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### job_item_results
```sql
CREATE TYPE item_result_status AS ENUM ('pass', 'fail', 'na', 'pending');

CREATE TABLE job_item_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES checklist_items(id),
  status item_result_status DEFAULT 'pending',
  note TEXT,
  text_value TEXT, -- für item_type 'text'
  number_value DECIMAL, -- für item_type 'number'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(job_id, item_id)
);
```

#### job_photos
```sql
CREATE TABLE job_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  item_id UUID REFERENCES checklist_items(id), -- NULL wenn allgemeines Job-Foto
  storage_path VARCHAR(500) NOT NULL,
  filename VARCHAR(255) NOT NULL,
  file_size INTEGER,
  taken_at TIMESTAMPTZ DEFAULT NOW(), -- intern speichern, aber nicht im Report zeigen
  uploaded_by UUID NOT NULL REFERENCES auth.users(id),
  caption TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### job_comments
```sql
CREATE TABLE job_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  author_user_id UUID NOT NULL REFERENCES auth.users(id),
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### client_shares
```sql
CREATE TABLE client_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  token VARCHAR(12) NOT NULL UNIQUE, -- kurzer Hash, URL-freundlich
  pdf_storage_path VARCHAR(500), -- Pfad zum vorgenerierten PDF
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_client_shares_token ON client_shares(token);
```

#### billing_subscriptions
```sql
CREATE TYPE subscription_status AS ENUM ('trialing', 'active', 'past_due', 'canceled', 'unpaid');
CREATE TYPE plan_type AS ENUM ('starter', 'pro');

CREATE TABLE billing_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  plan plan_type NOT NULL,
  status subscription_status NOT NULL,
  stripe_subscription_id VARCHAR(255),
  trial_ends_at TIMESTAMPTZ,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(org_id)
);
```

### 4.3 Row Level Security (RLS) Policies

```sql
-- Alle Tabellen: RLS aktivieren
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_item_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_subscriptions ENABLE ROW LEVEL SECURITY;

-- Helper Function: Org-IDs des aktuellen Users
CREATE OR REPLACE FUNCTION get_user_org_ids()
RETURNS SETOF UUID AS $$
  SELECT org_id FROM org_members 
  WHERE user_id = auth.uid() AND status = 'active'
$$ LANGUAGE sql SECURITY DEFINER;

-- Helper Function: Rolle des Users in einer Org
CREATE OR REPLACE FUNCTION get_user_role(org UUID)
RETURNS org_role AS $$
  SELECT role FROM org_members 
  WHERE user_id = auth.uid() AND org_id = org AND status = 'active'
$$ LANGUAGE sql SECURITY DEFINER;

-- Organizations: Nur eigene Orgs sehen
CREATE POLICY "Users can view their organizations"
  ON organizations FOR SELECT
  USING (id IN (SELECT get_user_org_ids()));

-- Jobs: Worker sehen nur zugewiesene, Manager/Owner sehen alle der Org
CREATE POLICY "Workers see assigned jobs, managers see all"
  ON jobs FOR SELECT
  USING (
    org_id IN (SELECT get_user_org_ids())
    AND (
      get_user_role(org_id) IN ('owner', 'manager')
      OR assigned_user_id = auth.uid()
    )
  );

-- Jobs: Worker können nur eigene Jobs updaten (bis submitted)
CREATE POLICY "Workers can update own jobs until submitted"
  ON jobs FOR UPDATE
  USING (
    assigned_user_id = auth.uid()
    AND status IN ('scheduled', 'in_progress', 'rejected')
  );

-- Job Photos: Worker können nur für eigene Jobs hochladen
CREATE POLICY "Workers can insert photos for own jobs"
  ON job_photos FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM jobs 
      WHERE jobs.id = job_id 
      AND jobs.assigned_user_id = auth.uid()
      AND jobs.status IN ('in_progress', 'rejected')
    )
  );
```

---

## 5. Job-Status-Maschine

### 5.1 Status-Diagramm

```
                    ┌─────────────┐
                    │  scheduled  │
                    └──────┬──────┘
                           │ Worker: "Job starten"
                           ▼
                    ┌─────────────┐
         ┌──────────│ in_progress │
         │          └──────┬──────┘
         │                 │ Worker: "Job abschließen"
         │                 ▼
         │          ┌─────────────┐
         │          │  submitted  │
         │          └──────┬──────┘
         │                 │ Manager: Review
         │          ┌──────┴──────┐
         │          ▼             ▼
         │   ┌──────────┐  ┌──────────┐
         │   │ approved │  │ rejected │
         │   └──────────┘  └────┬─────┘
         │                      │ Worker: Nachbessern
         │                      │ → zurück zu in_progress
         │                      ▼
         │               ┌─────────────┐
         │               │ in_progress │
         │               └─────────────┘
         │
         │ Owner/Manager: "Job canceln"
         │ (nur aus scheduled/in_progress)
         ▼
  ┌─────────────┐
  │  cancelled  │
  └─────────────┘
```

### 5.2 Erlaubte Übergänge

| Von | Nach | Aktor | Bedingung |
|-----|------|-------|-----------|
| scheduled | in_progress | Worker | assigned_user_id = aktueller User |
| scheduled | cancelled | Owner/Manager | - |
| in_progress | submitted | Worker | Alle Pflichtfotos vorhanden |
| in_progress | cancelled | Owner/Manager | - |
| submitted | approved | Owner/Manager | - |
| submitted | rejected | Owner/Manager | Kommentar erforderlich |
| rejected | in_progress | Worker | Worker öffnet Job erneut |

### 5.3 Kein Timeout
Jobs haben kein automatisches Timeout. Ein nicht gestarteter Job bleibt auf `scheduled` bis manuell gecancelt oder gestartet.

---

## 6. Billing & Subscription

### 6.1 Plan-Struktur

| Feature | Starter | Pro |
|---------|---------|-----|
| Preis | €X/Monat | €Y/Monat |
| Standorte | 1 | Unbegrenzt |
| Nutzer | 3 | Unbegrenzt |
| Jobs/Monat | 50 | Unbegrenzt |
| Trial | 14 Tage | 14 Tage |

### 6.2 Trial-Verhalten

- **Dauer:** 14 Tage
- **Funktionsumfang:** Vollständig (alle Features)
- **Ende ohne Zahlungsmittel:** Read-only-Modus
  - Bestehende Daten bleiben sichtbar
  - Keine neuen Jobs erstellen
  - Keine neuen Nutzer einladen
  - Reports bleiben abrufbar
- **Email-Benachrichtigungen:**
  - 7 Tage vor Trial-Ende
  - 3 Tage vor Trial-Ende
  - Bei Trial-Ende (Read-only aktiviert)

### 6.3 Limit-Enforcement (Soft)

**Bei Erreichen eines Limits:**
1. Warnung anzeigen (Banner/Toast)
2. Grace Period: 3 Tage normale Nutzung
3. Nach Grace Period: Aktion blockiert
4. Cancelled Jobs zählen NICHT gegen das Monatslimit

**Blockierte Aktionen bei Limit:**
- Jobs: "Neuer Job" Button deaktiviert + Hinweis auf Upgrade
- Nutzer: "Einladen" Button deaktiviert + Hinweis auf Upgrade
- Standorte: "Neuer Standort" Button deaktiviert

### 6.4 Stripe-Integration

**Checkout Flow:**
```
1. User klickt "Upgrade" → POST /api/stripe/checkout
2. Server erstellt Stripe Checkout Session
3. Redirect zu Stripe Checkout
4. Erfolg → Redirect zu /billing/success
5. Webhook: checkout.session.completed
6. Server aktiviert Subscription in DB
```

**Webhooks (MVP):**
- `checkout.session.completed` → Subscription aktivieren
- `customer.subscription.updated` → Status aktualisieren
- `customer.subscription.deleted` → Status auf canceled
- `invoice.payment_failed` → Status auf past_due, Email an Owner

**Customer Portal:**
- Button "Abo verwalten" → Stripe Customer Portal
- Zahlungsmethode ändern
- Plan ändern (nur Upgrade im MVP)
- Kündigen

---

## 7. PDF-Report

### 7.1 Generierung

- **Zeitpunkt:** Einmalig bei Erstellung des Share-Links
- **Trigger für Neugenerierung:** Wenn Manager nach Freigabe Kommentar hinzufügt
- **Library:** pdfkit
- **Sprache:** Deutsch (fest)
- **Speicherort:** Supabase Storage, Pfad in `client_shares.pdf_storage_path`

### 7.2 Layout-Struktur

```
┌────────────────────────────────────────────────────────┐
│                        KOPF                            │
│  ─────────────────────────────────────────────────────│
│  Qualitätsbericht                                      │
│  Firma: [Org Name]                                     │
│  Standort: [Site Name, Address]                        │
│  Datum: [scheduled_date, formatiert]                   │
│  Status: Freigegeben ✓                                 │
│                                                        │
│  ─────────────────────────────────────────────────────│
│                    CHECKLISTE                          │
│  ─────────────────────────────────────────────────────│
│  ☑ Böden gereinigt                              Pass   │
│  ☑ Schreibtische abgewischt                     Pass   │
│    Notiz: Fleck auf Tisch 3 konnte nicht...           │
│  ☑ Mülleimer geleert                            Pass   │
│  ☐ Fenster gereinigt                            N/A    │
│    Notiz: Fensterreinigung nicht beauftragt           │
│                                                        │
│  ─────────────────────────────────────────────────────│
│                     FOTOBELEGE                         │
│  (jede Seite 1 Foto, ohne Timestamp/Worker-Name)      │
├────────────────────────────────────────────────────────┤
│  Seite 2: [Foto 1 - Vollbild]                         │
│           Zuordnung: Böden gereinigt                  │
├────────────────────────────────────────────────────────┤
│  Seite 3: [Foto 2 - Vollbild]                         │
│           Zuordnung: Schreibtische abgewischt         │
└────────────────────────────────────────────────────────┘
```

### 7.3 Nicht enthalten (Datenschutz)

- ❌ Kein Worker-Name
- ❌ Kein Foto-Timestamp
- ❌ Keine internen Kommentare
- ❌ Kein Firmenlogo (im MVP)

---

## 8. Öffentlicher Report-Link

### 8.1 URL-Struktur

```
https://[app-domain]/r/[token]

Beispiel: https://app.example.com/r/a7x9k2m3
```

### 8.2 Token-Spezifikation

- **Format:** 8-12 Zeichen, alphanumerisch (URL-safe)
- **Generierung:** `nanoid` oder ähnlich
- **Beispiel:** `a7x9k2m3`

### 8.3 Zugriff & Ablauf

- **Default-Ablauf:** 7 Tage nach Erstellung
- **Widerruf:** Manager/Owner kann Token jederzeit invalidieren
- **Abgelaufener Link:** Freundliche Fehlerseite ("Dieser Link ist abgelaufen")
- **Keine Statistik:** Kein Tracking, wann/wie oft der Link geöffnet wurde

### 8.4 Report-Seite (Web-Ansicht)

```
┌─────────────────────────────────────────┐
│  [Org Name]                             │
│  Qualitätsbericht                       │
│                                         │
│  Standort: [Site Name]                  │
│  Datum: [scheduled_date]                │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │ Checkliste                      │    │
│  │ ✓ Böden gereinigt               │    │
│  │ ✓ Schreibtische abgewischt      │    │
│  │ ✓ Mülleimer geleert             │    │
│  │ − Fenster gereinigt (N/A)       │    │
│  └─────────────────────────────────┘    │
│                                         │
│  Fotobelege (4)                         │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐       │
│  │ 📷  │ │ 📷  │ │ 📷  │ │ 📷  │       │
│  └─────┘ └─────┘ └─────┘ └─────┘       │
│  (Klick öffnet Vollbild)                │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │  📥 PDF herunterladen           │    │
│  └─────────────────────────────────┘    │
└─────────────────────────────────────────┘
```

---

## 9. API-Endpunkte

### 9.1 Übersicht

| Methode | Endpunkt | Beschreibung | Auth |
|---------|----------|--------------|------|
| POST | `/api/auth/register` | Owner-Registrierung | Nein |
| POST | `/api/auth/login` | Login (Email/PW oder Magic Link) | Nein |
| POST | `/api/auth/invite` | Nutzer einladen | Owner/Manager |
| GET | `/api/organizations` | Eigene Orgs abrufen | Ja |
| POST | `/api/organizations` | Neue Org anlegen | Ja |
| GET | `/api/sites` | Standorte der Org | Ja |
| POST | `/api/sites` | Neuen Standort anlegen | Owner/Manager |
| GET | `/api/templates` | Checklist-Templates | Ja |
| POST | `/api/templates` | Neues Template anlegen | Owner/Manager |
| GET | `/api/jobs` | Jobs abrufen (gefiltert nach Rolle) | Ja |
| POST | `/api/jobs` | Neuen Job anlegen | Owner/Manager |
| POST | `/api/jobs/:id/start` | Job starten | Worker |
| POST | `/api/jobs/:id/submit` | Job abschließen | Worker |
| POST | `/api/jobs/:id/review` | Job reviewen | Owner/Manager |
| POST | `/api/jobs/:id/cancel` | Job canceln | Owner/Manager |
| POST | `/api/jobs/:id/photos` | Foto hochladen | Worker |
| POST | `/api/jobs/:id/share` | Share-Link generieren | Owner/Manager |
| DELETE | `/api/shares/:token` | Share-Link widerrufen | Owner/Manager |
| GET | `/r/:token` | Öffentlicher Report | Nein |
| GET | `/r/:token/pdf` | PDF-Download | Nein |
| POST | `/api/stripe/checkout` | Checkout Session erstellen | Owner |
| POST | `/api/stripe/portal` | Customer Portal Session | Owner |
| POST | `/api/stripe/webhook` | Stripe Webhooks | Stripe |

### 9.2 Beispiel-Payloads

**POST /api/jobs**
```json
{
  "site_id": "uuid",
  "template_id": "uuid",
  "assigned_user_id": "uuid",
  "scheduled_date": "2025-01-20"
}
```

**POST /api/jobs/:id/review**
```json
{
  "decision": "approved" | "rejected",
  "comment": "Bitte Foto von Küche nachreichen" // bei rejected erforderlich
}
```

**POST /api/jobs/:id/photos**
```
Content-Type: multipart/form-data
- file: [binary]
- item_id: "uuid" (optional)
- caption: "Eingangsbereich nach Reinigung"
```

---

## 10. Tech-Stack

### 10.1 Übersicht

| Komponente | Technologie |
|------------|-------------|
| Framework | Next.js 14+ (App Router) |
| Styling | Tailwind CSS |
| UI Components | shadcn/ui |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (Email/PW + Magic Link) |
| Storage | Supabase Storage |
| State | Supabase Client (Realtime optional) |
| PDF | pdfkit |
| Payments | Stripe |
| Hosting | Vercel |
| Monitoring | Keins im MVP |

### 10.2 Projektstruktur

```
/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   ├── register/
│   │   └── invite/[token]/
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── page.tsx (Dashboard)
│   │   ├── sites/
│   │   ├── templates/
│   │   ├── jobs/
│   │   ├── review/
│   │   ├── reports/
│   │   ├── team/
│   │   └── billing/
│   ├── (worker)/
│   │   ├── layout.tsx (Mobile-optimiert)
│   │   ├── today/
│   │   └── job/[id]/
│   ├── r/[token]/
│   │   ├── page.tsx (Report-Ansicht)
│   │   └── pdf/route.ts (PDF-Download)
│   └── api/
│       ├── auth/
│       ├── organizations/
│       ├── sites/
│       ├── templates/
│       ├── jobs/
│       ├── shares/
│       └── stripe/
├── components/
│   ├── ui/ (shadcn)
│   ├── forms/
│   ├── job/
│   ├── camera/
│   └── pdf/
├── lib/
│   ├── supabase/
│   ├── stripe/
│   └── pdf/
├── hooks/
└── types/
```

### 10.3 Supabase Storage

**Bucket:** `job-photos`

**Pfad-Schema:**
```
{org_id}/{job_id}/{photo_id}.jpg
```

**Policies:**
- Upload: Nur authentifizierte User für eigene Org/Jobs
- Download: Authentifizierte User der Org ODER via Share-Token (Server-seitig)

---

## 11. UI/UX Screens

### 11.1 Web (Owner/Manager)

| Screen | Beschreibung |
|--------|--------------|
| Dashboard | Übersicht: Offene Jobs, Pending Reviews, Quick Stats |
| Standorte | Liste, CRUD, Adresse |
| Templates | Liste, CRUD, Item-Editor |
| Jobs | Kalender/Liste, Filter, Neuer Job |
| Review | Pending-Liste, Detail mit Fotos, Approve/Reject |
| Reports | Freigegebene Jobs, Share-Links verwalten |
| Team | Nutzer-Liste, Einladen, Rollen |
| Billing | Plan, Usage, Upgrade, Portal-Link |
| Einstellungen | Org-Name, (später: Logo) |

### 11.2 Mobile/PWA (Worker)

| Screen | Beschreibung |
|--------|--------------|
| Heute | Liste der heutigen Jobs |
| Job-Detail | Checklist mit Items |
| Kamera | Eigenes UI mit Hilfslinien |
| Foto-Preview | Aufgenommenes Foto bestätigen/wiederholen |
| Job-Zusammenfassung | Vor Submit: Übersicht aller Items/Fotos |

### 11.3 PWA-Spezifika

- **Homescreen-Prompt:** Aktiv auffordern zur Installation
- **Kamera:** Eigenes UI mit:
  - Hilfslinien (Drittel-Raster)
  - Blitz-Toggle
  - Wechsel Front/Back-Kamera
- **App-State:** Zustand bei Schließen speichern (localStorage)
  - Bei Wiedereröffnung: Zurück zum letzten Screen
  - Ungespeicherte Item-Ergebnisse wiederherstellen

---

## 12. Error Handling

### 12.1 Foto-Upload

```
Upload fehlgeschlagen?
├── Timeout (10s) → Toast: "Upload fehlgeschlagen" + Retry-Button
├── Server-Error → Toast: "Server nicht erreichbar" + Retry-Button
└── Datei zu groß → Toast: "Foto zu groß, bitte erneut aufnehmen"

Retry-Button speichert Foto lokal bis Upload erfolgreich.
```

### 12.2 Server nicht erreichbar

```
Bei jedem API-Call:
├── Timeout: 10 Sekunden
├── Retry: 2 automatische Versuche
└── Dann: Fehlermeldung mit manuellem Retry

Fehlermeldung:
"Verbindung zum Server fehlgeschlagen. 
 Bitte prüfe deine Internetverbindung.
 [Erneut versuchen]"
```

### 12.3 Feedback-Widget

- In App integriert (z.B. Crisp, Intercom, oder eigene Lösung)
- Funktionen:
  - Bug melden (mit Screenshot-Option)
  - Feature wünschen
  - Allgemeines Feedback
- Position: Floating Button unten rechts (Web), Menu-Item (Mobile)

---

## 13. Notifications

### 13.1 Email-Benachrichtigungen

| Event | Empfänger | Inhalt |
|-------|-----------|--------|
| Einladung | Eingeladener | Link zur Registrierung |
| Neuer Job zugewiesen | Worker | Job-Details, Link zur App |
| Job submitted | Manager | Job-Link, Review-Aufforderung |
| Job approved | Worker | Bestätigung |
| Job rejected | Worker | Kommentar, Link zur Nachbesserung |
| Trial endet in 7d | Owner | Upgrade-CTA |
| Trial endet in 3d | Owner | Upgrade-CTA |
| Trial abgelaufen | Owner | Read-only-Hinweis, Upgrade-CTA |
| Zahlung fehlgeschlagen | Owner | Portal-Link |
| Subscription gekündigt | Owner | Bestätigung, Reaktivierungs-CTA |

### 13.2 In-App Notifications (Badges)

| Badge | Anzeige für | Beschreibung |
|-------|-------------|--------------|
| Pending Review | Manager/Owner | Anzahl Jobs mit Status "submitted" |
| Subscription Warning | Owner | Bei Trial-Ende, past_due, etc. |

---

## 14. Seed-Daten

### 14.1 Demo-Organisation

```yaml
Organization:
  name: "Demo Reinigung GmbH"
  
Sites:
  - name: "Bürokomplex Mitte"
    address: "Musterstraße 1, 10115 Berlin"
  
Templates:
  - name: "Büroreinigung Standard"
    items: [siehe 14.2]
    
Users:
  - email: demo-owner@example.com
    role: owner
  - email: demo-manager@example.com
    role: manager
  - email: demo-worker@example.com
    role: worker
    
Jobs:
  - 3 Jobs in verschiedenen Status (scheduled, submitted, approved)
  - Mit Beispiel-Fotos
```

### 14.2 Beispiel-Template: Büroreinigung Standard

```yaml
Template: Büroreinigung Standard
Items:
  - title: "Eingangsbereich"
    requires_photo: true
    items:
      - title: "Boden gewischt"
        requires_photo: false
      - title: "Fußmatten gereinigt"
        requires_photo: false
        
  - title: "Büroflächen"
    requires_photo: true
    items:
      - title: "Schreibtische abgewischt"
        requires_photo: false
        requires_note: true
      - title: "Papierkörbe geleert"
        requires_photo: false
      - title: "Böden gesaugt/gewischt"
        requires_photo: true
        
  - title: "Küche/Teeküche"
    requires_photo: true
    items:
      - title: "Spüle gereinigt"
        requires_photo: false
      - title: "Arbeitsflächen gewischt"
        requires_photo: false
      - title: "Kühlschrank außen gereinigt"
        requires_photo: false
      - title: "Müll entsorgt"
        requires_photo: false
        
  - title: "Sanitäranlagen"
    requires_photo: true
    items:
      - title: "Toiletten gereinigt"
        requires_photo: true
      - title: "Waschbecken gereinigt"
        requires_photo: false
      - title: "Spiegel gereinigt"
        requires_photo: false
      - title: "Seife/Papier aufgefüllt"
        requires_photo: false
        requires_note: true
      - title: "Böden gewischt"
        requires_photo: false
        
  - title: "Allgemein"
    items:
      - title: "Türklinken desinfiziert"
        requires_photo: false
      - title: "Lichtschalter gereinigt"
        requires_photo: false
```

---

## 15. Akzeptanzkriterien (Definition of Done)

### 15.1 Onboarding

- [ ] Owner kann sich mit Email/Passwort registrieren
- [ ] Owner kann sich mit Magic Link registrieren
- [ ] Nach Registrierung: Org-Erstellung erforderlich
- [ ] Owner kann Standort anlegen
- [ ] Owner kann Template erstellen (mit Items und Foto-Pflicht)
- [ ] Owner kann Worker per Email einladen
- [ ] Eingeladener erhält Email mit Registrierungslink
- [ ] Eingeladener kann sich registrieren und ist automatisch der Org zugeordnet

### 15.2 Job-Ausführung

- [ ] Worker sieht nur ihm zugewiesene Jobs
- [ ] Worker kann Job starten (Status: scheduled → in_progress)
- [ ] Worker kann Checklist-Items abhaken (pass/fail/n.a.)
- [ ] Worker kann Pflichtfotos aufnehmen (eigenes Kamera-UI)
- [ ] Worker kann optionale Notizen hinzufügen
- [ ] Worker kann "Schnellmodus" nutzen (alle Items auf einmal)
- [ ] Pflichtfotos sind auch im Schnellmodus erforderlich
- [ ] Worker kann Job abschließen (Status: in_progress → submitted)
- [ ] Nach Submit: Job ist für Worker read-only
- [ ] App-State wird bei Schließen gespeichert und wiederhergestellt

### 15.3 Review & Report

- [ ] Manager sieht alle Jobs der Org
- [ ] Manager sieht "Pending Review" Badge mit Anzahl
- [ ] Manager kann Job im Detail ansehen (Items, Fotos, Notizen)
- [ ] Manager kann Job "Approve" (Status → approved)
- [ ] Manager kann Job "Reject" mit Kommentar (Status → rejected)
- [ ] Bei Reject: Worker kann Job erneut bearbeiten
- [ ] Manager kann Share-Link generieren (Token, 7 Tage gültig)
- [ ] PDF wird bei Link-Generierung erstellt
- [ ] Manager kann Share-Link widerrufen

### 15.4 Kundenansicht

- [ ] Öffentlicher Link funktioniert ohne Login
- [ ] Report-Seite zeigt Checkliste und Fotos
- [ ] Fotos zeigen KEINEN Timestamp
- [ ] Fotos zeigen KEINEN Worker-Namen
- [ ] PDF kann heruntergeladen werden
- [ ] Abgelaufener Link zeigt freundliche Fehlerseite

### 15.5 Billing

- [ ] Trial: 14 Tage, vollständiger Funktionsumfang
- [ ] Trial-Ende ohne Zahlung: Read-only-Modus
- [ ] Emails: 7 Tage vorher, 3 Tage vorher, bei Ablauf
- [ ] Stripe Checkout funktioniert
- [ ] Nach Checkout: Subscription aktiv
- [ ] Stripe Customer Portal erreichbar
- [ ] Webhooks aktualisieren Subscription-Status korrekt
- [ ] Limits werden soft enforced (Warnung → Grace Period → Block)
- [ ] Cancelled Jobs zählen nicht gegen Limit

### 15.6 Security

- [ ] RLS: User kann keine Daten anderer Orgs sehen
- [ ] RLS: Worker kann keine anderen Worker-Jobs sehen
- [ ] RLS: Worker kann nur eigene Jobs bearbeiten
- [ ] Share-Token: Nur dieser eine Job sichtbar
- [ ] Keine sensitive Daten im Client-Bundle

### 15.7 Error Handling

- [ ] Foto-Upload: Retry-Button bei Fehler
- [ ] Server-Timeout: Fehlermeldung nach 10s
- [ ] Feedback-Widget funktioniert

---

## 16. Datenaufbewahrung & Löschung

### 16.1 Aufbewahrungsfristen

| Datentyp | Frist |
|----------|-------|
| Jobs & Results | 1 Jahr |
| Fotos | 1 Jahr |
| Share-Links | 7 Tage (Token), PDF 1 Jahr |
| Audit-Logs | (Post-MVP) |

### 16.2 Automatische Bereinigung

```
Nightly Job:
- Lösche Fotos älter als 1 Jahr
- Lösche Jobs älter als 1 Jahr (cascade: results, photos, comments)
- Lösche abgelaufene Share-Tokens (PDFs bleiben für Job-History)
```

### 16.3 Account-Löschung

**Bei Org-Löschung durch Owner:**
1. Sofort: Status auf "pending_deletion"
2. 30 Tage Retention Period
3. Email-Bestätigung an Owner
4. Nach 30 Tagen: Vollständige Löschung aller Daten

**Daten die gelöscht werden:**
- Organization
- Alle Org-Members
- Alle Sites
- Alle Templates
- Alle Jobs (inkl. Results, Photos, Comments)
- Alle Share-Links & PDFs
- Stripe Subscription (Kündigung triggern)

---

## 17. Post-MVP Roadmap

### Phase 2 (nach Launch)
- [ ] Recurring Jobs (Wiederholungs-Regeln)
- [ ] Lokaler Zwischenspeicher / Offline-Sync
- [ ] Org-Switcher (ein User, mehrere Firmen)
- [ ] Downgrade-Handling (Standort/Nutzer-Auswahl)
- [ ] Datenexport (DSGVO Art. 20)
- [ ] Monitoring (Sentry)

### Phase 3 (Skalierung)
- [ ] Standort-Sharing zwischen Firmen
- [ ] Firmenlogo im PDF
- [ ] Foto-Qualitätserkennung (Blur, Helligkeit)
- [ ] Push-Notifications
- [ ] Mehrsprachigkeit (EN, weitere)
- [ ] API für Drittanbieter
- [ ] White-Label / Custom Domains

### Phase 4 (Enterprise)
- [ ] SSO / SAML
- [ ] Audit-Logs
- [ ] Custom Branding
- [ ] Dedicated Support
- [ ] SLAs

---

## Anhang A: Glossar

| Begriff | Definition |
|---------|------------|
| **Job** | Ein einzelner Reinigungseinsatz an einem Standort an einem Tag |
| **Template** | Wiederverwendbare Checklisten-Vorlage |
| **Item** | Einzelner Punkt in einer Checkliste |
| **Site** | Standort/Gebäude wo gereinigt wird |
| **Share-Link** | Öffentlicher Link zum Report für Endkunden |
| **Worker** | Reinigungskraft, führt Jobs aus |
| **Manager** | Teamleiter, plant Jobs, reviewt |
| **Owner** | Firmeninhaber, zahlt, verwaltet alles |

---

## Anhang B: Offene Entscheidungen

| # | Frage | Status |
|---|-------|--------|
| 1 | App-Name / Branding | Offen |
| 2 | Preise für Starter/Pro | Offen |
| 3 | Exakte Job-Limits pro Plan | Offen |
| 4 | Email-Provider (Resend, Postmark, etc.) | Offen |
| 5 | Feedback-Widget (Crisp, eigene Lösung) | Offen |

---

*Dokument erstellt: Januar 2025*  
*Letzte Aktualisierung: Januar 2025*
