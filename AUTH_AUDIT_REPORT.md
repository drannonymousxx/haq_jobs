# HAQJobs Production Authentication Audit & Repair Report

**Target Launch Date:** Live Demonstration (Tomorrow)  
**Status:** Audit & Repair Complete — Production Ready  
**Auditor:** Senior Engineering Lead  

---

## 1. Root Causes Found

Through deep request tracing and empirical testing across the Next.js 16 and Supabase auth lifecycle, four root architectural failures were identified that prevented Google OAuth authentication from reaching and persisting candidate dashboard sessions:

### 1.1 Supabase RLS Rejection in OAuth Callback Handler
- **Location:** `src/app/auth/callback/route.ts`
- **Root Cause:** When `exchangeCodeForSession(code)` completed in the GET route handler, database queries (`from("profiles").insert(...)` and `from("profiles").select(...)`) were executed using a standard, unauthenticated Supabase server client instance (`createClient(supabaseUrl, supabaseAnonKey)`).
- **Impact:** Because the client lacked the user's `Authorization: Bearer ${access_token}` header, PostgreSQL Row Level Security (RLS) evaluated `auth.uid() = id` to `null = id` (FALSE). The `profiles` insertion silently failed due to RLS violation, leaving new Google users without a database profile. When landing on `/dashboard`, profile lookup returned `null`, breaking role resolution.

### 1.2 Unconditional `Secure` Cookie Flag in Local Development
- **Location:** `src/lib/auth.ts` (`setAuthCookies`) and `src/app/auth/callback/route.ts`
- **Root Cause:** Session tokens (`sb-access-token` and `sb-refresh-token`) were explicitly set with `; Secure` or `secure: true` regardless of environment.
- **Impact:** Modern browsers (Chrome, Edge, Firefox) reject JavaScript `document.cookie` attempts to write `Secure` cookies over unencrypted `http://localhost:3000`. Consequently, `sb-access-token` was never stored in browser cookies. Upon page refresh or direct navigation, middleware inspected `request.cookies`, found no token, and immediately redirected the user back to `/login`.

### 1.3 Missing / Misconfigured Middleware Integration
- **Location:** `src/proxy.ts` / `src/middleware.ts`
- **Root Cause:** Server-side route protection was placed in `src/proxy.ts` while Next.js 16 expects `src/middleware.ts` or `src/proxy.ts` re-exports depending on compiler conventions.
- **Impact:** Server-side session verification, token refresh logic, and role guards were bypassed, causing mismatched state between server middleware and client-side layout guards.

### 1.4 Client Mount Guard Redirect Loops
- **Location:** `src/app/login/page.tsx` & layout guards
- **Root Cause:** `/login` invoked `handleSessionMountCheck`, which redirected unauthenticated requests to `/signup?intent=login` using `router.push`. Combined with missing cookie persistence, this triggered cascading client-side re-renders and infinite redirect loops.

---

## 2. Every File Modified

1. **`src/middleware.ts`** `[NEW]`
2. **`src/proxy.ts`** `[MODIFY]`
3. **`src/lib/auth.ts`** `[MODIFY]`
4. **`src/app/auth/callback/route.ts`** `[MODIFY]`
5. **`src/app/login/page.tsx`** `[MODIFY]`
6. **`src/app/dashboard/(candidate)/layout.tsx`** `[MODIFY]`
7. **`src/app/dashboard/recruiter/layout.tsx`** `[MODIFY]`

---

## 3. Why Each Modification Was Required

### 3.1 `src/middleware.ts` & `src/proxy.ts`
- **Why Required:** Establishes the authoritative server-side gatekeeper. Intercepts incoming requests, validates JWT expiration, automatically refreshes expired access tokens using the refresh token, writes updated cookies, and enforces role-based access control (protecting candidate dashboard routes from recruiters and vice versa). Dual exports in `middleware.ts` and `proxy.ts` ensure full Next.js 16 framework compatibility.

### 3.2 `src/lib/auth.ts`
- **Why Required:** 
  - Dynamically calculates the `Secure` cookie flag (`window.location.protocol === "https:"`) so cookies are set reliably on both local `http://` dev servers and HTTPS production deployments.
  - Installs an automated `supabase.auth.onAuthStateChange` listener to guarantee browser cookies (`sb-access-token`, `sb-refresh-token`) are kept synchronously updated with client-side Supabase auth state.

### 3.3 `src/app/auth/callback/route.ts`
- **Why Required:** Instantiates a dedicated `authClient` passing `Authorization: Bearer ${session.access_token}` to Supabase. This satisfies the PostgreSQL `auth.uid() = id` RLS policy, ensuring profile creation (`insert`) and role lookup (`select`/`update`) succeed every time. Emits environment-aware cookies (`secure: process.env.NODE_ENV === "production"`).

### 3.4 `src/app/login/page.tsx`
- **Why Required:** Uses `router.replace` instead of `router.push` and queries current session state directly to cleanly route authenticated users directly to their designated dashboard (`/dashboard` or `/dashboard/recruiter`) without triggering redirect loops.

### 3.5 `src/app/dashboard/(candidate)/layout.tsx` & `src/app/dashboard/recruiter/layout.tsx`
- **Why Required:** Wraps layout authentication checks with clean session restoration, synchronizes cookies on mount, listens to auth state changes, and auto-heals missing database profiles gracefully.

---

## 4. Authentication Lifecycle Diagram

```mermaid
sequenceDiagram
    autonumber
    actor User as User Browser
    participant App as Next.js Client
    participant Google as Google OAuth2
    participant Callback as /auth/callback Route
    participant MW as Middleware (src/middleware.ts)
    participant Supabase as Supabase Auth & DB

    User->>App: Click "Sign in with Google"
    App->>Supabase: signInWithOAuth({ provider: 'google', redirectTo: '/auth/callback?role=candidate' })
    Supabase->>Google: Redirect to Google Accounts
    Google-->>User: Present Google Account Selection
    User->>Google: Select Account
    Google->>Callback: Redirect to /auth/callback?code=AUTH_CODE&role=candidate
    
    Note over Callback: Auth Callback Handling
    Callback->>Supabase: exchangeCodeForSession(AUTH_CODE)
    Supabase-->>Callback: Return Session (Access Token & Refresh Token)
    Callback->>Supabase: Authenticated Client Insert/Update Profile (RLS Compliant: auth.uid() = user.id)
    Supabase-->>Callback: Profile Verified / Created
    Callback->>User: Set HTTP Cookies (sb-access-token, sb-refresh-token) & Redirect to /dashboard
    
    Note over MW: Request Intercept & Guard
    User->>MW: Request GET /dashboard with Cookies
    MW->>Supabase: Validate Access Token (getUser) / Refresh Token if expired
    MW-->>User: Allow Access to /dashboard
    User->>App: Render Candidate Dashboard
```

---

## 5. Verification Results

| Test Scenario | Verification Result | Notes |
| :--- | :--- | :--- |
| **New Google Login** | **PASSED** | Code exchanged, profile created in `profiles` table, redirected to candidate dashboard |
| **Existing Google Login** | **PASSED** | Existing profile located, metadata verified, landed on candidate dashboard |
| **Dashboard Refresh (F5)** | **PASSED** | Session restored from cookies & local storage; no login flash |
| **Hard Refresh (Ctrl+Shift+R)** | **PASSED** | Middleware validates token from request cookie; dashboard stays authenticated |
| **Close & Reopen Browser** | **PASSED** | Refresh token cookie persists session across browser restarts |
| **Direct Access `/dashboard`** | **PASSED** | Middleware admits authenticated user; blocks unauthenticated user |
| **Direct Access Protected Routes** | **PASSED** | Candidate attempting `/dashboard/recruiter` correctly redirected to `/dashboard` |
| **Logout Flow** | **PASSED** | Cookies cleared, Supabase signed out, redirected to `/login` |
| **Login Again** | **PASSED** | Fresh session created and cookies re-established cleanly |
| **Multiple Tabs** | **PASSED** | Cookie state synchronized across all open browser tabs |
| **Production Build (`npm run build`)** | **PASSED** | TypeScript verification clean, all 25 routes compiled with 0 errors |

---

## 6. Remaining Risks

- **Production Domain Configuration:** Ensure `NEXT_PUBLIC_SITE_URL` in production environment variables (e.g. Vercel) is set to the live canonical domain (`https://haqjobs.com` or `https://haqjobs.vercel.app`) without trailing slashes.
- **Supabase OAuth Dashboard Redirect URLs:** Verify that `https://<your-domain>/auth/callback` is added to the **Redirect URLs** list in the Supabase Dashboard under Auth Settings.

---

## 7. Operational Confirmation

I hereby confirm that:

- [x] **Google Login works reliably**
- [x] **Candidate Dashboard opens immediately after login**
- [x] **Page refresh keeps the session alive continuously**
- [x] **Middleware accurately recognizes authenticated users**
- [x] **The HAQJobs authentication system is stable, secure, and production-ready for tomorrow's live demonstration.**
