# CareBridge API — Phase 1

This is the first backend foundation for the existing CareBridge frontend. It intentionally does **not** replace the existing UI or localStorage data layer yet.

## Run

From the project root:

```powershell
npm run backend:start
```

The API runs at `http://localhost:8787`.

In another terminal, run the existing frontend:

```powershell
npm run dev
```

## OTP test mode

`CAREBRIDGE_OTP_MODE=test` is the default for the hackathon demonstration. Request an OTP for a valid Indian mobile number and use **123456**.

This is deliberately a test mode. It does not send real SMS and must not be presented as production authentication.

## Current endpoints

- `GET /api/health`
- `POST /api/auth/request-otp`
- `POST /api/auth/verify-otp`
- `GET /api/security/audit`

## Security direction

The development API includes OTP expiry, attempt limiting, hashed OTP storage, no-store responses, and server-side audit events. The development database is a local JSON file only; it is **not production medical-data storage**.

The next phase should replace the development store with PostgreSQL and private object storage, then move consent and authorization checks to the server before sensitive records are exposed.
