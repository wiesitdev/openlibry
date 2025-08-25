# OpenLibry - Sicherheits- und Qualitätsverbesserungen

## 🔥 **Kritische Fixes implementiert**

### 1. **Docker Database Persistence - BEHOBEN**
**Problem**: SQLite Database wurde nicht persistent gespeichert
- **Ursache**: Pfad-Inkonsistenz zwischen `.env` und `docker-compose.yml`
- **Lösung**: DATABASE_URL auf `file:./prisma/database/dev.db` geändert

### 2. **Sichere Passwort-Verschlüsselung - BEHOBEN**
**Problem**: SHA-256 ohne Salt - anfällig für Rainbow-Table-Attacks
- **Ersetzt**: `utils/hashPassword.ts` mit bcrypt (12 Salt-Rounds)
- **Neu**: `verifyPassword()` Funktion hinzugefügt
- **Dependency**: `bcrypt` + `@types/bcrypt` hinzugefügt

### 3. **File Upload Security - BEHOBEN**
**Problem**: Keine Datei-Validierung oder Sanitization
- **Neu**: `utils/fileValidation.ts` mit umfassender Validierung
- **Features**:
  - MIME-Type Validierung
  - Dateigrößen-Limits
  - Filename Sanitization
  - Directory Traversal Protection

### 4. **Docker Security & Performance - VERBESSERT**
**Problem**: Schlechte Layer-Caching, Root-User
- **Verbessert**: Package.json zuerst kopieren für besseres Caching
- **Security**: Non-root User (nextjs:1001) hinzugefügt
- **Performance**: `npm ci --only=production` statt `npm install`

### 5. **Next.js Image Security - BEHOBEN**
**Problem**: Wildcard `hostname: "**"` erlaubt SSRF-Attacks
- **Restricted**: Nur vertrauenswürdige Domains (openlibrary.org, localhost)
- **Security**: Nur HTTPS für externe Quellen

## 🚨 **Verbleibende kritische Sicherheitslücken**

Diese Fixes sind implementiert, aber **du musst sie noch in der Fork anwenden**:

### Directory Traversal Fix
**Datei**: `pages/api/images/[id].ts`
```typescript
// VORHER (unsicher):
const fileName = id + ".jpg";

// NACHHER (sicher):
import { validateFilePath } from '../../../utils/fileValidation';
const fileName = id + ".jpg";
const fullPath = path.join(process.cwd(), 'public/coverimages', fileName);
if (!validateFilePath(fullPath, path.join(process.cwd(), 'public/coverimages'))) {
  return res.status(400).json({ error: 'Invalid file path' });
}
```

### API Endpoints - Input Validation
**Alle API-Endpunkte** benötigen Input-Validierung:
```typescript
// Beispiel für pages/api/book.ts:
import { validateImageFile } from '../../utils/fileValidation';

// In POST/PUT Handler:
if (!req.body.title || req.body.title.trim() === '') {
  return res.status(400).json({ error: 'Title is required' });
}
```

### NextAuth Password Verification Update
**Datei**: `pages/api/auth/[...nextauth].ts`
```typescript
// Import der neuen verifyPassword Funktion:
import { verifyPassword } from '../../../utils/hashPassword';

// In authorize callback:
const isValid = await verifyPassword(credentials.password, user.password);
```

## 📋 **Installations-Schritte für deinen Fork**

### 1. **Fork Setup**
```bash
# 1. Fork auf GitHub erstellen
# 2. Klonen
git clone https://github.com/DEIN_USERNAME/openlibry.git
cd openlibry

# 3. Dependencies installieren
npm install

# 4. Environment setup
cp .env_example .env
# .env editieren: DATABASE_URL = "file:./prisma/database/dev.db"
```

### 2. **Migration Existing Passwords (WICHTIG)**
Falls bereits User existieren, musst du Passwörter re-hashen:
```typescript
// Einmalige Migration (Beispiel-Script):
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migratePasswords() {
  const users = await prisma.loginUser.findMany();
  
  for (const user of users) {
    // Nur wenn noch SHA-256 Hash (64 Zeichen)
    if (user.password.length === 64) {
      console.log(`Migrating user: ${user.username}`);
      // User muss Passwort neu setzen oder Default-PW vergeben
    }
  }
}
```

### 3. **Docker Deployment**
```bash
# Database Volume erstellen
mkdir -p ./database

# Container builden
docker build --no-cache -t openlibry-secure .

# Mit docker-compose starten
docker-compose up -d
```

### 4. **Testing**
```bash
# Lint Check
npm run lint

# TypeScript Check  
npx tsc --noEmit

# Cypress Tests
npm run cypress:open
```

## 🎯 **Nächste Schritte (Empfohlen)**

### **Sofort**:
1. ✅ Database Path Fix anwenden
2. ✅ Passwort-Hashing austauschen  
3. ✅ File Validation implementieren
4. 🔄 Directory Traversal API-Fixes anwenden
5. 🔄 Input Validation auf allen API-Endpunkten

### **Kurzfristig**:
- CSRF-Schutz hinzufügen
- Rate-Limiting implementieren
- TypeScript `any`-Types ersetzen
- Error Boundaries in React Components

### **Mittelfristig**:
- Comprehensive Testing
- Performance-Optimierung (React.memo, useCallback)
- Accessibility Verbesserungen
- Code-Qualität Standardisierung

## 🔐 **Sicherheits-Checkliste**

- ✅ **Sichere Passwort-Verschlüsselung** (bcrypt)
- ✅ **Docker Database Persistence** 
- ✅ **File Upload Validation**
- ✅ **Next.js Image Security**
- ✅ **Docker Non-Root User**
- 🔄 **Directory Traversal Protection** (teilweise)
- ❌ **Input Validation APIs** (fehlt noch)
- ❌ **CSRF Protection** (fehlt noch)
- ❌ **Rate Limiting** (fehlt noch)

## 📞 **Support**

Bei Fragen zu den Sicherheits-Fixes:
1. Check GitHub Issues des originalen Repos
2. Dokumentation in `/doc/`
3. Code-Kommentare in geänderten Dateien

---
**⚠️ WICHTIG**: Diese Änderungen sind **rückwärts-inkompatibel**. Teste ausgiebig bevor du in Produktion gehst!