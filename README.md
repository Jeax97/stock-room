# Stock-Room — Gestione Magazzino

Software di gestione magazzino per piccole attività. Interfaccia web moderna, responsive (desktop + smartphone), con Docker.

## Funzionalità

- **Prodotti**: CRUD completo con foto, categoria, subcategoria, posizione, fornitore, unità di misura, barcode, note
- **Foto prodotti**: Upload da computer, smartphone o scatto diretto dalla fotocamera
- **Filtri avanzati**: Ricerca per nome, filtro per categoria/subcategoria/posizione
- **Storico movimenti**: Traccia ogni carico/scarico con data, quantità e motivo
- **Notifiche scorte basse**: In-app + Email + Telegram (configurabili)
- **Barcode scanner**: Scansione barcode/QR direttamente dallo smartphone
- **Dashboard**: Statistiche, grafici distribuzione categorie, ultimi movimenti
- **Pannello Admin**: Gestione categorie, subcategorie, posizioni, unità, fornitori, impostazioni
- **Export dati**: CSV, Excel (.xlsx), PDF
- **Backup automatico**: pg_dump schedulato via cron
- **Dark Mode**: Toggle chiaro/scuro
- **Responsive**: Ottimizzato per desktop, tablet e smartphone
- **PWA**: Aggiungibile alla home dello smartphone

## Requisiti

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (include Docker Compose)

## Avvio rapido

### Windows
1. Assicurati che **Docker Desktop** sia in esecuzione
2. **Doppio click** su `start.bat`
3. Aspetta che finisca (la prima volta ci vogliono ~2-3 minuti)
4. Apri il browser su **http://localhost**

### Mac / Linux
1. Assicurati che **Docker** sia in esecuzione
2. Apri il terminale nella cartella del progetto
3. Esegui: `chmod +x start.sh && ./start.sh`
4. Apri il browser su **http://localhost**

### Per fermare
- **Windows**: doppio click su `stop.bat`
- **Mac/Linux**: `./stop.sh`

Al primo avvio, il database viene automaticamente inizializzato con:
- 8 unità di misura (Pezzi, kg, g, L, ml, m, cm, Confezioni)
- 3 categorie demo (Elettronica, Cancelleria, Imballaggio)
- Subcategorie, posizioni, fornitori e prodotti di esempio

## Architettura

```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐
│   Frontend   │────▶│   Backend    │────▶│  PostgreSQL  │
│ React + Nginx│     │ Node/Express │     │     16       │
│   :80        │     │   :3001      │     │   :5432      │
└─────────────┘     └──────────────┘     └──────────────┘
```

- **Frontend**: React 18, Vite, Tailwind CSS, Recharts, html5-qrcode
- **Backend**: Node.js, Express, Prisma ORM, Sharp, Multer
- **Database**: PostgreSQL 16

## Configurazione

Non serve nessuna configurazione! Tutto funziona automaticamente.

### Notifiche Email (opzionale)
Configurabili dal pannello Admin > Impostazioni. Richiede un server SMTP.

### Notifiche Telegram (opzionale)
1. Crea un bot con [@BotFather](https://t.me/BotFather) su Telegram
2. Annota il **Bot Token**
3. Ottieni il tuo **Chat ID** con [@userinfobot](https://t.me/userinfobot)
4. Inserisci entrambi nel pannello Admin > Impostazioni

## Comandi utili

```bash
# Visualizza log
docker compose logs -f

# Ricostruisci dopo modifiche al codice
docker compose up --build -d

# Backup manuale del database
docker exec stockroom-db pg_dump -U stockroom stockroom > backup.sql
```

## Licenza

Uso interno. Tutti i diritti riservati.
