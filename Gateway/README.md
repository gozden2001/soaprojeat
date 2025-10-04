# API Gateway

API Gateway za mikroservisnu arhitekturu koja rutira zahteve ka odgovarajućim servisima.

## Arhitektura

```
Client → Gateway (port 8080) → Mikroservisi
                              ├── AuthenticationService (port 3000)
                              ├── ComplaintsService (port 3002)  
                              └── ActivitiesService (port 3003)
```

## Funkcionalnosti

- **Proxy rutiranje** - automatski rutira zahteve ka odgovarajućim servisima
- **Rate limiting** - ograničava broj zahteva po IP adresi
- **CORS podrška** - omogućava cross-origin zahteve
- **Security headers** - dodaje sigurnosne zaglavlja pomoću Helmet
- **Logging** - loguje sve zahteve pomoću Morgan
- **Health check** - endpoint za proveru stanja svih servisa
- **Error handling** - centralizovano rukovanje greškama

## Instaliranje i pokretanje

```bash
# Instaliranje dependencija
npm install

# Pokretanje u development modu
npm run dev

# Pokretanje u production modu
npm start
```

## API Endpoints

### Gateway Endpoints
- `GET /health` - Health check za sve servise
- `GET /api-docs` - API dokumentacija

### Proxied Endpoints

#### Authentication Service (`/auth`)
- `POST /auth/api/user/register` - Registracija korisnika
- `POST /auth/api/user/login` - Prijava korisnika
- `POST /auth/api/user/logout` - Odjava korisnika
- `GET /auth/api/user/operators` - Lista operatera
- `GET /auth/api/user/activate/:token` - Aktivacija naloga
- `GET /auth/docs` - Swagger dokumentacija

#### Complaints Service (`/complaints`)
- `GET /complaints/api/complaints` - Lista žalbi
- `POST /complaints/api/complaints` - Kreiranje žalbe
- `GET /complaints/api/complaints/:id` - Detalji žalbe
- `GET /complaints/docs` - Swagger dokumentacija

#### Activities Service (`/activities`)
- Coming soon...

## Environment Variables

```env
GATEWAY_PORT=8080
CLIENT_URL=http://localhost:5173
AUTH_SERVICE_URL=http://localhost:3000
COMPLAINTS_SERVICE_URL=http://localhost:3002
ACTIVITIES_SERVICE_URL=http://localhost:3003
```

## Primer korišćenja

```javascript
// Umesto pozivanja direktno servisa:
fetch('http://localhost:3000/api/user/login', options)

// Pozivajte preko gateway-a:
fetch('http://localhost:8080/auth/api/user/login', options)
```

## Pokretanje svih servisa

1. **Authentication Service** (Terminal 1):
   ```bash
   cd AuthenticationService
   npm run dev
   ```

2. **Complaints Service** (Terminal 2):
   ```bash
   cd ComplaintsService
   npm start
   ```

3. **Gateway** (Terminal 3):
   ```bash
   cd Gateway
   npm run dev
   ```

4. **Client aplikacija** (Terminal 4):
   ```bash
   # Vaša frontend aplikacija
   npm run dev
   ```

## Monitoring

- Gateway loguje sve zahteve sa detaljima
- Health check endpoint pokazuje status svih servisa
- Rate limiting sprečava preopterećenje servisa