# SAFAR — Analisis Codebase Mendalam (Hyperlocal)

> **Sanitasi:** Dokumen ini tidak memuat nilai rahasia (`DATABASE_URL`, `*_SECRET`, `*_API_KEY`, `*_PASSWORD`, token, cookie, atau dump `.env`). Hanya nama variabel dari `.env.example` yang dicantumkan. Kredensial seed, payload pentest mentah, dan isi `vuln.md`/`SAFAR-Penetration-Test-Report.docx` tidak disalin.

## 1. Ringkasan Eksekutif

**SAFAR / Priangan Halal** (`hyperlocal` — Next.js 16.2.6 + React 19.2.4) adalah platform pariwisata halal hyperlocal: destinasi, UMKM kuliner/oleh-oleh, penginapan syariah, peta interaktif, validasi halal, dan penilaian **ACES-H** (9 grup indikator) dengan evidence confidence & reachability. Arsitektur: App Router `force-dynamic`, route groups `(admin)/(public)/(auth)`, Prisma 7.8 + PostgreSQL (`@prisma/adapter-pg`), `better-auth` + `prismaAdapter`, Cloudinary + sharp, Leaflet `ssr:false`, Tiptap JSON.

**Angka kunci (hasil eksplorasi):** 65 `app/api/**/route.ts` (31 di `api/admin/**`), 31 halaman `app/(admin)`, 15 halaman `app/(public)`, 35+ model Prisma / 14 enum, 13 skrip `scripts/*`, 4 arsip `archives/*.xlsx`, 60 test Vitest (`tests/unit` + `tests/integration`), 18 migrasi, 8 dokumen `docs/aces-h-*` + feasibility study.

**Karakter:** service-layer heavy (`lib/services/*` 14 + `lib/services/acesh/*` 12), `lib/actions/*` tipis (3 file), validasi terpusat `lib/validations/*` (16 schema Zod), peta 3 mode (picker/readonly/context), import Excel sebagai sumber kebenaran data.

## 2. Tech Stack & Versi Eksak

| Lapisan | Paket | Versi | Catatan |
|---|---|---|---|
| Framework | `next` | 16.2.6 | App Router, `dynamic="force-dynamic"` di `app/layout.tsx` |
| UI | `react` / `react-dom` | 19.2.4 | `next/font` Geist/Inter/Montserrat, `next-themes` |
| Styling | `tailwindcss` | 4.x + `tw-animate-css` | `@theme inline` vars, `shadcn/tailwind.css` |
| Komponen | `radix-ui` 1.4.3, `shadcn` 4.7.0, `lucide-react` 1.16.0, `framer-motion` 12.40.0 | | |
| DB / ORM | `prisma` 7.8.0, `@prisma/client` 7.8.0, `@prisma/adapter-pg` 7.8.0, `pg` 8.20.0 | `prisma/schema.prisma` → `lib/generated/prisma`, `datasource postgresql` |
| Auth | `better-auth` 1.6.10, `bcrypt-ts` 8.0.1 | `lib/auth.ts` + 2 plugin kustom |
| Peta | `leaflet` 1.9.4, `react-leaflet` 5.0.0, `react-leaflet-cluster` 4.1.3 | `@types/leaflet` 1.9.21, OSRM proxy `app/api/routes/osrm` |
| Editor | `@tiptap/*` 3.23.4 (`starter-kit`, `image`, `link`, `placeholder`, `text-align`, `underline`, `pm`, `html`) | JSON di DB, `lib/editor/extensions.ts` |
| Upload | `cloudinary` 2.10.0, `sharp` 0.34.5, `react-dropzone` 15.0.0 | `lib/cloudinary/*`, `lib/upload/*` 5 MB webp |
| AI | `@google/generative-ai` 0.24.1, `openai` 6.41.0 (Groq) | `explore`/`recommendations` (Gemini), `assistant/route-finder` (Groq) |
| Util | `zod` 4.4.3, `axios` 1.16.1, `slugify` 1.6.9, `date-fns` 4.1.0, `csv-parser` 3.2.1, `exceljs` 4.4.0, `json2csv` 6.0.0-alpha.2 (dead), `jspdf` 4.2.1 + `jspdf-autotable` 5.0.8 / `pdfmake` 0.3.10 (unused) | Validasi + import/export |
| Test | `vitest` 4.1.10, `@vitest/coverage-v8` 4.1.10, `tsx` 4.22.0 | `vitest.config.ts` `environment:node` |

**Script `package.json`:** `dev` (`next dev`), `build` (`prisma generate && next build`), `start`, `lint`, `seed:tourism` (`tsx prisma/seed/seed.ts`), `seed:dev` (`tsx prisma/seed.ts`), `sync:images` / `sync:images:dry`, `acesh:sample` (`tsx scripts/acesh-sample-situ-gede.ts`), `import:data` (`tsx scripts/import/import-all.ts`), `test` / `test:acesh` / `test:integration` / `coverage`.

## 3. Struktur Direktori & Routing

```
app/
  layout.tsx              # root: force-dynamic, Geist/Inter/Montserrat, ThemeProvider, ServiceWorkerRegistration, NextTopLoader, Toaster
  manifest.ts             # PWA: name "SAFAR - Priangan Halal", icons 192/512 + maskable
  icon.png / apple-icon.png / not-found.tsx / offline/ / unauthorized/ / verify-email/
  (admin)/layout.tsx      # guard server: auth.api.getSession(headers()) → !session→/halal, role!=admin→/unauthorized
  (admin)/dashboard (+/acesh), destinations (+new/[id]/[id]/edit/categories), facilities, umkms, accommodations,
           validasi/destinasi|umkm|penginapan, coverage-areas, import, statistics, reports, laporan, rekomendasi, settings (+acesh/profile)
  (public)/layout.tsx     # Navbar (sticky) + BottomNav (mobile) + InstallPrompt
  (public)/page.tsx       # getLandingData → HeroSection, WhyChooseUs, Categories, Popular, Verified, Nearby, RouteInspiration, HowItWorks, FacilitiesHighlights, Testimonials, Faq, Cta, Footer
  (public)/destinasi (+[id]), umkm (+[id]/rating/[id]), penginapan (+[id]), peta (+peta-map-client/dynamic), explore, facility-check, itinerary-recommendation, profile, privacy, terms
  (auth)/layout.tsx       # split 2-kolom branding primary + card max-w-md
  (auth)/halal (+register/forgot-password/reset-password)  # /login → /halal (next.config redirects permanent)
  api/                    # 65 route.ts — lihat §7
components/
  admin/ (admin-layout, admin-sidebar, admin-nav, admin-topbar, admin-guide, logout-dialog) + dashboard/*, destinations/*, categories/*, umkms/*, accommodations/*, laporan/*, reports/*, settings/*, validations/*, acesh/*
  maps/ (index, map-picker-client, readonly-map-client, theme-tile-layer, dynamic-context-map, destination-context-map-client, dynamic-dashboard-map)
  editor/ (tiptap-editor, tiptap-toolbar, rich-text-renderer)
  ui/ (navbar, bottom-nav + 95 file shadcn)
  public/home/*, public/explore/*, public/destinations/*, pwa/*
lib/
  auth.ts, auth-client.ts, auth-email.ts, auth-plugin-fix-unverified.ts, auth-plugin-verification-cooldown.ts
  prisma.ts (@prisma/adapter-pg singleton globalForPrisma)
  actions/ (destination-actions, umkm-actions, category-actions — tipis, no guard internal)
  api/ (destination, umkm, accommodation, category, facility, review — axios wrappers)
  services/ (destination-service, umkm-service, accommodation-service, category-service, facility-service, validation-service, report-service, review-service, itinerary-service, dashboard-service, analytics-service, import-service, export-service, user-service)
  services/acesh/ (constants, indicator, aces-readiness-service, hyperlocal-scoring-service, evidence-confidence-service, evidence-derivation, acesh-scoring-service, scoring-config-service, acesh-classification-service, assessment-recalculation-service, gap-engine, evidence-engine, reachability-config-service, travel-time-service, public-score-service, recommendation-*, annotated-tree)
  validations/ (16 schema Zod: auth, destination, umkm, accommodation, facility, category, destinasi-kategori, review, acesh, analytics, halal-validation, unified-validation, halal-certification, itinerary, report, saved-item)
  maps/ (leaflet-fix, geo-utils), editor/ (extensions), cloudinary/ (config, image-url, crawl-upload), upload/ (config, optimizeImage), utils/ (ai-location, ai-gemini, ai-candidates, haversine-distance, calculate-halal-score, pagination, pwa-install), config/ (halal-readiness, map-categories)
prisma/
  schema.prisma (909 baris), migrations/ (18), seed.ts / seed.generated.ts / seed/* (aceshSeeder, destinationSeeder, umkmSeeder, facilitySeeder, importCsv, data/accommodations)
scripts/
  sync-images-to-cloudinary.ts, migrate-images-to-cloudinary.ts, crawl-destinations-to-cloudinary.ts, acesh-sample-situ-gede.ts, generate-pentest-report.cjs, import/ (import-all, import-coverage-cat, import-destinations, import-umkms, import-accommodations, import-facilities, import-hours, _utils)
tests/
  unit/ (10: travel-time, reachability, indicator, hyperlocal, evidence-derivation, evidence-confidence, ai-candidates, acesh-scoring, acesh-scoring-config-validation, acesh-classification) + integration/ (3: public-score, public-acesh-api, assessment-recalculation + mock-prisma)
public/ (icons 192/512/maskable, logo/*, Tag/*, uploads/*, hyperlocal.png)
docs/ (aces-h-*.md)
```

**`proxy.ts` (d/h `middleware.ts`):** `export default proxy(request)` — `config.matcher = ["/((?!api|_next/static|_next/image|favicon.ico).*)"]` + `isStaticPath` early return untuk `/_next`/`/api`/dotfile → **seluruh `/api` bypass proxy**. Klasifikasi `isPublicPath` (`/` , `/unauthorized`), `isAuthPath` (`/halal`, `/register`) → logged-in redirect `/dashboard` jika `role==="admin"` else `/`. `isAdminPath` 11 prefix (`/dashboard`, `/destinations`, `/halal-facilities`, `/umkms`, `/accommodations`, `/validations`, `/validasi`, `/statistics`, `/settings`) → `!isLoggedIn→/halal`, `role!=admin→/unauthorized`. Sesi via `auth.api.getSession({headers: request.headers})`.

**`next.config.ts`:** `allowedDevOrigins ["192.168.56.1"]`, `images.remotePatterns` 4 host (`images.unsplash.com`, `plus.unsplash.com`, `lh3.googleusercontent.com`, `res.cloudinary.com`), `redirects /login→/halal permanent`, `headers /sw.js no-cache`.

**`app/globals.css`:** `@import tailwindcss` + `tw-animate-css`, `@custom-variant dark`, `:root` light (`background #fafaf9 / primary #064e3b / radius 0.5rem / Inter+Montserrat`) vs `.dark` (`#1A1E1B / primary #306D29`), Leaflet z-index & dark overrides, `.admin-scale {font-size 14px}`.

## 4. Autentikasi & Otorisasi

**`lib/auth.ts`:** `betterAuth({baseURL: BETTER_AUTH_URL||localhost:3000, emailAndPassword:{enabled:true, requireEmailVerification:true, sendResetPassword, resetPasswordTokenExpiresIn:3600}, emailVerification:{sendOnSignUp:true, expiresIn:3600, autoSignInAfterVerification:true}, database: prismaAdapter(prisma,{provider:"postgresql"}), user:{additionalFields:{role:{type:"string", defaultValue:"user", input:true}}}, plugins:[fixUnverifiedReRegistration, verificationEmailCooldown, nextCookies()], advanced:{trustedProxyHeaders:true}})`. `admin()` plugin dikomentari — RBAC manual `session.user.role==="admin"` di proxy + handlers.

**`lib/auth-client.ts`:** `createAuthClient({baseURL: NEXT_PUBLIC_APP_URL, plugins:[inferAdditionalFields<typeof auth>()]})` — client tahu `role`.

**Plugin `fix-unverified`:** hook `POST /sign-up/email` — jika `findUserByEmail` ada & `!emailVerified`, `hash(password)` + `updatePassword` + `updateUser({name})` → cegah enumerasi takeover unverified, return sukses generik.

**Plugin `verification-cooldown`:** hook `/send-verification-email` cek `verification` row `verification-email:<email>` jika `expiresAt>now` (`isCooldownActive`) → fake `Response.json({status:true})`, else `markCooldown` (row `expiresAt=now+3600`). Juga untuk `/sign-up/email` new user.

**`lib/auth-email.ts`:** `getTransporter()` nodemailer Gmail (lazy verify, diagnose log sekali, `fallbackLog` dev), `sendWithRetry` 2 retry backoff 3s untuk rate-limit (`450`), templates Indonesia verification/reset link 1 jam.

**Sesi:** `auth.api.getSession({headers: await headers()})` (`next/headers`) — httpOnly cookie via `nextCookies()`, tanpa CSRF token / rate-limit middleware.

**Gap struktural (sanitasi high-level):** karena `proxy.ts` exclude `/api`, setiap `app/api/**` wajib self-guard. Sebagian admin route sudah `requireAdmin()` benar, sebagian masih cek `session?.user.id` saja atau tanpa cek — perlu pengetatan konsisten 401/403 + Zod sebelum DB.

## 5. Model Data (Prisma — ringkas tanpa dump schema penuh)

**Datasource:** `generator client provider prisma-client-js output ../lib/generated/prisma`, `provider postgresql`.

**Enum (14):** `UserRole {user,admin}`, `CertificationStatus {PENDING,VALID,EXPIRED,REVOKED}`, `ValidationStatus {PENDING,APPROVED,REJECTED}`, `CategoryType {DESTINATION,UMKM,ACCOMMODATION}`, `TargetType {DESTINASI,UMKM}`, `ReportTargetType {DESTINATION,UMKM,ACCOMMODATION}`, `ActionType {CLICK_ROUTE,CLICK_WHATSAPP,BOOKMARK}`, `InteractionType {VIEW,SEARCH,CLICK,SAVE,SHARE,ROUTE}`, `SentimentLabel {POSITIVE,NEUTRAL,NEGATIVE}`, `ReportStatus {PENDING,INVESTIGATING,RESOLVED,REJECTED}`, `AceshIndicatorGroup` (9 — lihat §6), `AceshEvidenceType {SOURCE,DOCUMENT,PHOTO,GEOLOCATION,MANAGEMENT_CONFIRMATION,FIELD_VALIDATION,OTHER}`, `AceshTravelMode {WALKING,DRIVING,CYCLING}`, `AceshVerificationStatus {PENDING,VERIFIED}`, `RecommendationActionType {BUILD,IMPROVE,VERIFY,MAINTAIN}`, `RecommendationTimeline {QUICK,MEDIUM,STRATEGIC}`, `RecommendationStatus {OPEN,IN_PROGRESS,SUBMITTED,VALIDATING,VERIFIED}`.

**Inti:**

- `User/Session/Account/Verification` — better-auth, `User @@unique([email])` relasi ke `Review`, `AceshEvidenceRecord`, `DestinationInteraction`, `UserInteraction`, `Itinerary`, `Report`. `User.role String default "user"` (enum `UserRole` tidak dipakai kolom).
- `CoverageArea {name, level, geoJsonData Json, colorHex?, isActive}` → `destinations[]/umkms[]`.
- `Category {name, slug, type CategoryType, description} @@unique([slug,type])` → `destinations[]/umkms[]`.
- `Destination {categoryId, coverageAreaId?, name, slug@unique, description Json (Tiptap), address/city/province, latitude/longitude Decimal(10,7), status ValidationStatus, rating/reviewCount, openingHours Json, halalScore/validatedScore/categoryScores Json, externalId/externalSource} + relasi images/reviews/umkms/destinationHalalFacilities/halalValidations/interactions/trends/itineraryItems/acesh* /recommendationActions`.
- `Umkm {destinationId?/categoryId?/coverageAreaId? (SetNull), name/slug@unique, description, address/phone, estimatedCost Decimal(15,2), lat/lng, rating/reviewCount, openingHours, externalId/Source, owner, validationStatus String PENDING, surveyorNote} + images/reviews/certifications/umkmHalalFacilities`.
- `Accommodation {name/slug@unique, description Json, address/city/province, lat/lng, phone/website, estimatedCost, rating/reviewCount, validationStatus PENDING, surveyorNote, validatedScore} + images/facilities/reviews`.
- `HalalFacility {name, description, facilityType String?, lat/lng Decimal(10,7) (ditambah migrasi ACES-H), externalId/Source, weight Int, maxDistance Float 5.0} → M:N via `DestinationHalalFacility {destinationId, facilityId @@unique, lat/lng Float?, name?, distanceMeters?, travelMinutes?, travelMode?} + DestinationFacilityEvidence[]`, `UmkmHalalFacility`, `AccommodationHalalFacility`.
- `HalalCertification {umkmId, certificateNo@unique?, issuer, issuedAt/expiredAt, status CertificationStatus, documentUrl}` → `HalalValidation {certificationId?/destinationId?/validatorId? (User SetNull), status, adminScore, categoryScores Json, notes, validatedAt} → ValidationEvidence[]`. `ExternalPlaceSource {entityType/vendor/vendorPlaceId @@unique, entityId?, rawPayload Json}` dedup vendor.
- `Review {userId, destinationId?/umkmId?/accommodationId? (polymorphic), rating Int 1-5, comment}` → `ReviewSentiment {reviewId@unique, label SentimentLabel, score, keywords String[], summary?, analyzedAt}`.
- `DestinationInteraction {destinationId, userId? (SetNull), type InteractionType, keyword?, source?, metadata Json?}` + `UserInteraction {userId?, targetId, targetType TargetType, actionType ActionType}` — CTA sink BOOKMARK/ROUTE/WHATSAPP. `DestinationTrend {destinationId, period (daily/weekly/monthly), periodStart, view/search/click/save/share/routeCount, trendScore} @@unique([destinationId,period,periodStart])`. `AiIntentLog {userQuery, intent, redirectTo, payload Json?, isValid, errorMessage}`. `Itinerary {userId? (SetNull), title, city/province, startDate/endDate} → ItineraryItem {itineraryId/destinationId, dayNumber, orderIndex, estimatedTime, notes}`. `HalalReadinessScore {regionName/regionType, destinationCount, halalFacilityScore/halalFoodScore/worshipAccessScore/totalScore, recommendation}`. `Report {reporterId? (SetNull), targetId, targetType ReportTargetType, reason, description, status ReportStatus}`.

**ACES-H (§6 detail):** `AceshIndicator {code@unique, name, group AceshIndicatorGroup (9), weight Float 1.0, isActive}`, `AceshIndicatorScore {destinationId+indicatorId @@unique, value Int 0-4, convertedScore Float value*25, notes, assessedBy/At}`, `AceshEvidenceRecord {destinationId, evidenceType, source/sourceReliabilityScore 0-100, documentUrl/photoUrl, lat/lng, managementConfirmed, fieldValidated, dataDate/validatedAt/validatorId? (SetNull)}`, `AceshAssessment {destinationId@unique, acesScore/hyperlocalScore/baseScore/evidenceConfidenceScore/evidenceFactor, verifiedScore? (null saat PENDING), classification?, verificationStatus PENDING/VERIFIED, calculationVersion, calculatedAt}`, `AceshAssessmentHistory` (append-only + `calculatedBy/notes`), `AceshScoringConfig {id="default", version "ACES-H-1.0", 18 bobot Float 0-100 — lihat §6}`, `ReachabilityConfig {facilityType@unique, label?, maxDistanceMeters?, maxTravelMinutes?, travelMode WALKING|DRIVING|CYCLING, isActive}`, `RecommendationAction {destinationId, indicatorId? (SetNull), ruleId?, actionType, timeline, title, description?, priorityScore, ris/gap, reason Json, beforeAfter Json, prerequisite Json, status OPEN default, completedAt/verifiedBy/At}`.

## 6. ACES-H Scoring — Formula Mendalam

**Spesifikasi:** `docs/aces-h-specification.md` v1.0 — 9 grup, 27 indikator, 6 komponen evidence, `factor=0.70+0.30*confidence` (dok: `docs/aces-h-formula.md`, `docs/aces-h-data-model.md`, `docs/aces-h-api.md`).

**Grup & bobot default (0-100 di DB → 0-1 di kode):**
- ACES (4 dim): `ACCESS 20, COMMUNICATION 15, ENVIRONMENT 20, SERVICES 45` — `lib/services/acesh/constants.ts` `ACES_DIMENSION_WEIGHTS` + `AceshScoringConfig.accessWeight…servicesWeight`.
- Hyperlocal (5 dim): `SPATIAL_ACCESSIBILITY 30, FUNCTIONAL_AVAILABILITY 25, HALAL_ASSURANCE 20, ECOSYSTEM_CONNECTIVITY 15, EMBEDDEDNESS_CONTINUITY 10`.
- Evidence (6 komp): `sourceReliability 15, documentEvidence 20, photoGeolocation 15, managementConfirmation 10, fieldValidation 25, dataFreshness 15`.
- Komposisi: `baseAcesWeight 65, baseHyperlocal 35, evidenceFactorBase 70, evidenceFactorRange 30`.

**Nilai indikator:** `value 0..4` → `convertedScore = value*25` (`lib/services/acesh/indicator.ts` `toIndicatorScore`, `assertIndicatorValue`).

**Per-dim:** `groupScore = round1( Σ(weight*value*25)/Σweight )` else 0 (`calculateGroupScore`), `round1 = Math.round((v+EPSILON)*10)/10`, `round3` untuk factor, clamp 0-100.

**Per-kategori:**
- `acesScore = Σ(groupScore*dimWeight)/ΣdimWeight → round1 clamp` (`aces-readiness-service.ts`).
- `hyperlocalScore` identik (`hyperlocal-scoring-service.ts`).
- `evidenceConfidenceScore`: 6 komponen `Σ(component*weight)/Σweight → round1` (`evidence-confidence-service.ts`).

**Derivasi evidence (`evidence-derivation.ts` `deriveEvidenceConfidence(records, now)`):** `sourceReliability=avg(sourceReliabilityScore)`, `documentEvidence=% dengan documentUrl`, `photoGeolocation=% dengan photoUrl+lat+lng`, `managementConfirmation=% managementConfirmed`, `fieldValidation=% fieldValidated`, `dataFreshness=avg bucket validatedAt??dataDate??createdAt → ≤90d=100, ≤180=75, ≤365=50, >365=25`. Kosong → semua 0. Ambang verifikasi `MIN_VERIFIED_CONFIDENCE=60 && MIN_VERIFIED_RECORDS=1` → `shouldMarkVerified`.

**Pipeline pusat (`acesh-scoring-service.ts` `calculateAceshScores({acesScore,hyperlocalScore,evidenceConfidenceScore}, weights)`):**
```
aces = round1(clamp(acesScore))
hyperlocal = round1(clamp(hyperlocalScore))
base = round1(clamp(aces*0.65 + hyperlocal*0.35))
factor = round3(0.7 + 0.3*confidence/100)  // 0.7..1.0
verified = round1(clamp(base*factor))
classification = classifyScore(verified) // ≥85 SANGAT_SIAP, ≥70 SIAP, ≥55 BERKEMBANG, ≥40 PERLU_PENGEMBANGAN, ≥0 BELUM_SIAP
```
Dipakai `scoring-config-service.ts` `storedConfigToWeights` (`/100`) + fallback `DEFAULT_SCORING_WEIGHTS`.

**Assessment snapshot (`assessment-recalculation-service.ts`):**
- `calculateAssessmentSnapshot(destinationId, now)` parallel fetch `indicators active ordered code`, `scores`, `evidenceRecords`, `scoringWeights`; `buildGroupInputs` skip null; hitung `acesScore/hyperlocalScore` dengan weights dinamis; derive evidence → `calculateAceshScores`; `verificationStatus = shouldMarkVerified ? VERIFIED : PENDING`; `verifiedScore = VERIFIED ? result.verifiedScore : null`; `classification = verifiedScore!=null ? result.classification : classifyScore(baseScore).key`.
- `calculateAndSaveAssessment(destinationId, calculatedBy?, notes?)` → `snapshot` + `prisma.$transaction([aceshAssessment.upsert({calculatedAt:now}), aceshAssessmentHistory.create({...,calculatedBy,notes})])` — idempoten assess ulang.

**Gap & prioritas:**
- `gap-engine.ts` `calculateGroupGaps` → `groupScore`, `gap=100-score`, `gapWeighted=gap*dimW`, `baseImpact=gap*dimW*baseWeight` sorted desc.
- `evidence-engine.ts` `calculateEvidenceGaps` → gaps per komponen `gap=100-value, priority=gap*weight`.

**Publik:** `public-score-service.ts` `getPublicAceshScores(ids)` hanya `verifiedScore/baseScore/classification/verificationStatus`; `publicDisplayScore(score,fallback)` → `VERIFIED ? verifiedScore : baseScore` — `PENDING` tidak pernah bocorkan `verifiedScore` (diuji `tests/integration/public-score-service.test.ts`).

**Reachability & jarak:**
- `reachability-config-service.ts` `getReachabilityConfig(type)` DB `ReachabilityConfig` else `DEFAULT_REACHABILITY` (MOSQUE/MUSALA 500 m 10 min WALKING; RESTAURANT/HALAL_FOOD/KULINER 1000 m 15 min DRIVING; LODGING/PENGINAPAN 5000 m 30 min DRIVING); `checkReachability(distance, travelMinutes)` null/≤0 dianggap terpenuhi.
- `travel-time-service.ts` `estimateTravelTime(from→to, mode)` validasi koordinat, `haversineDistance R=6371` km → `distanceMeters`; jika `OSRM_BASE_URL` coba `GET /route/v1/{foot|driving|cycling}/{lng,lat};{lng,lat}?overview=false` 3s, else fallback `travelMinutes=ceil(distanceKm/speed*60)` min 1 (`TRAVEL_SPEED_KMH`: WALKING 4.8, DRIVING 40, CYCLING 15). `lib/utils/haversine-distance.ts`.

**Rekomendasi — RIS & simulator:**
- `recommendation-types.ts` `DESTINATION_MULTIPLIERS` Nature/Heritage/Shopping/Religious/Beach/Urban × grup (mis. Religious `HALAL_ASSURANCE 1.5`) via `resolveDestinationType` regex `slug+categoryName`.
- `recommendation-rules.ts` 13 aturan per grup: ACES BUILD_TOILET/BUILD_MOSQUE/UPGRADE_ACCESS/IMPROVE_INFO/ENVIRON_CLEAN; Hyperlocal SPATIAL_FIX/HOURS_ALIGN/HALAL_CERT/ECOSYSTEM_UMKM/SOP_CONTINUITY; Evidence VERIFY_EVIDENCE/UPLOAD_DOC/PHOTO_GEO — fields `actionType BUILD/IMPROVE/VERIFY/MAINTAIN`, `timeline QUICK/MEDIUM/STRATEGIC`, `feasibility 0.4..0.95`, `impact 2..5`, prereq `FACILITY_EXISTS`.
- `recommendation-engine.ts` `calculateRIS({indicator,dimensionWeight,groupScore,baseWeight,evidenceConfidence,profile,feasibility,visitorImpact})`: `gap=100-value*25`, `gapSeverity=gap/100`, `evidenceConfidenceFactor=0.5+evidence/200 (0.5..1.0)`, `destMult` tabel, `ris=gapSeverity*weight*dimWeight*evidenceFactor*visitorImpact*feasibility*destMult`, `priority=ris*baseWeight`, `reason` tags gap≥60/dim≥0.3/impact≥4/evidence<60/destMult>1. `classifyActionType(value,evidence,freshnessLow)` → `≥3&&evidence<60 VERIFY`, `<2 BUILD`, `2-3+freshness IMPROVE`, `≥3 MAINTAIN` else IMPROVE. `timelineFromFeasibility(feas,ris)` → `≥0.85&&≥0.08 QUICK`, `≤0.5 STRATEGIC` else MEDIUM.
- `recommendation-simulator.ts`: `simulateImprovement` delta `indicatorWeight*(target-current)/sumW` apply `dimW`, `baseBefore/After = round1(clamp(aces*0.65+hyper*0.35))`, `factor` `0.7+0.3*evc`, `verified = round1(clamp(base*factor))`. `annotated-tree.ts` `buildAnnotatedTree` → `aces/hyperlocal/evidence` map + top 3 gaps + 5 priority insights.

**Legacy halalScore:** `lib/utils/calculate-halal-score.ts` + `lib/config/halal-readiness.ts` `ACES_FACILITY_MAP` 6 type (ibadah 0.40, kuliner 0.10 dsb), `MAX_ACES_COVERAGE 0.45`, `calculateHalalScoreFromWeights` max quality per type → `Σ(maxQ/100*acesWeight)/0.45*100` — dipakai `createDestination/updateDestination` bersama ACES-H.

## 7. Inventaris API (65 `route.ts`)

**Pola:** `lib/validations/*` Zod sebelum DB; sesi `auth.api.getSession({headers: await headers()})`; admin `requireAdmin()` helper (tidak semua route konsisten — hardening di §12).

**Admin — `api/admin/**` (31 file, ekspektasi `role==="admin"`):**
`acesh/dashboard` GET, `acesh/indicators` GET+POST (Zod), `acesh/indicators/[id]` PATCH+DELETE, `acesh/scoring-config` GET+PUT (Zod), `ai-test` GET (Groq), `analytics/dashboard` GET, `analytics/gap-analysis` GET, `analytics/halal-readiness` GET, `analytics/recalculate-halal-readiness` POST, `analytics/recalculate-trends` POST, `analytics/trends` GET, `analytics/route` GET, `coverage-areas` GET+POST, `coverage-areas/[id]` GET+PUT+DELETE, `destinations/[id]/acesh-assessment` GET+PUT (batch 200), `destinations/[id]/acesh/recalculate` POST, `destinations/[id]/acesh/recommendations` GET+POST, `destinations/[id]/evidence` POST, `evidence/[id]` PATCH+DELETE, `import` POST (xlsx 10 MB), `import/template` GET, `reachability` GET+POST, `reachability/[id]` PATCH+DELETE, `reports` GET, `reports/[id]` GET+PATCH, `reports/generate` POST (csv/xlsx), `reviews/[id]/analyze-sentiment` POST, `validasi/umkm/[id]` PATCH, `validasi/penginapan/[id]` PATCH.

**Publik read-only (tanpa sesi, sengaja):**
`accommodations` GET (paginated `scope public|admin`) + `[id]` GET, `categories` GET + `[id]` GET, `coverage-areas` GET (`isActive=true`) + `[id]` GET, `dashboard` GET (`getAllMapDestinations`), `destinations` GET paginated + `[id]` GET (`getDestination(id,"public")`), `destinations/[id]/acesh` GET publik (`verifiedScore` null saat PENDING), `destinations/[id]/sentiment` GET, `destinations/hottest` GET (`hottestQuerySchema`), `facilities` GET (paginated/all) + `[id]` GET, `umkms` GET + `[id]` GET, `destinasi/facility-verify` GET (`by slug+facility`), `search-trends` GET.

**Mutasi terproteksi (butuh sesi admin):**
`accommodations` POST + `[id]` PATCH+DELETE (`accommodationSchema`), `categories` POST + `[id]` PATCH+DELETE, `destinations` POST (cek `coverageArea isActive`) + `[id]` PATCH+DELETE, `facilities` POST (`facilitySchema` weight 0-100) + `[id]` PATCH+DELETE, `umkms` POST + `[id]` PATCH+DELETE.

**AI/Rekomendasi (publik compute-heavy):**
`explore` GET (`exploreQuerySchema {q, lat/lng?}` → Gemini), `assistant/route-finder` POST (`{query}` → `findDestinationByName` + `mapToCandidateData` + Groq `aiIntentLog`), `recommendations` POST (`{preferences[], limit 1-20}`), `itineraries/recommend` POST (`recommendItinerarySchema`).

**Interaksi/Tracking:**
`destinations/[id]/interactions` POST (opsional `session?.user.id`, `interactionSchema`), `track` POST (`userInteractionSchema` → `userInteraction+destinationInteraction`), `reviews` POST (`session` wajib + `createReviewSchema`), `bookmarks` GET (opsional), `user/saved-items` POST (wajib sesi + `savedItemSchema` toggle `$transaction`), `user/profile/saved` GET (wajib sesi), `itineraries` GET (wajib sesi) vs POST (anon `userId null` — spam surface), `itineraries/[id]` DELETE (cek `userId===session.user.id`), `reports` POST (`session?` opsional), `routes/osrm` GET (`{fromLat/lng/toLat/lng, profile driving|walking|cycling}` → OSRM 8s).

**Upload:**
`upload` POST (wajib `session`, `UPLOAD_CONFIG` 5 MB `jpeg/png/webp` 1920 webp 80, `validFolders` 8 → `FOLDER_MAPPING hyperlocal/*`, `optimizeImage` sharp) + DELETE (`extractPublicId` regex → `cloudinary.uploader.destroy`) — tak butuh `admin`.

**Validasi Halal (permukaan sensitif):**
`validations` GET (filter `status`) + POST (`createValidationSchema` → `HalalValidation PENDING`), `validations/[id]` GET + PATCH (transaksi `destination.status/validatedScore` + `calculateAndSaveAssessment`) + DELETE — butuh pengetatan konsisten `role==="admin"` + Zod.

## 8. Frontend — Layout, Peta, Editor

**Layout nesting:** `app/layout.tsx` (root `force-dynamic`, Geist/Mono/Inter/Montserrat `cn()`, `ThemeProvider attribute=class`, `ServiceWorkerRegistration`, `NextTopLoader`, `Toaster`) → group layout: `(admin)` server guard, `(public)` `Navbar` (items Beranda `/`, Destinasi `/destinasi`, UMKM `/umkm`, Penginapan `/penginapan`, Peta `/peta` + `ThemeToggle`/`InstallButton` + `authClient.useSession()` dropdown) + `BottomNav` mobile 5-kolom (Home/Map/Store/Compass/User) + `InstallPrompt`, `(auth)` split.

**Admin shell:** `components/admin/admin-layout.tsx` → `AdminSidebar lg:block w-64 sticky h-dvh bg-sidebar` (BrandLogo + `ScrollArea>AdminNav` + logout `Dialog`) + `AdminTopbar sticky h-14` (Sheet mobile + ThemeToggle + AdminGuide + avatar `DropdownMenu`) + main `mx-auto max-w-dvw px-4 py-5 md:px-5 lg:px-6`. `AdminNav` `navItems[]` ~14 (Dashboard, Area Cakupan, Destinasi (+Daftar+Kategori), Fasilitas, UMKM, Penginapan, Validasi (+3), Dashboard ACES-H, Statistik, Kelola Laporan, Generate Laporan, Import Data, Rekomendasi & Laporan, Pengaturan) expand `usePathname` active.

**Halaman admin:** `dashboard` + `dashboard/acesh`, `destinations` (list/new/[id]/[id]/edit/categories + `destination-form` `facility-array-list`), `facilities` (`facility-table/dialog`), `umkms`, `accommodations` (`accommodation-form`), `validasi/destinasi` (+`acesh-assessment-tabs/evidence-panel/indicator-group/reachability-panel`), `validasi/umkm|penginapan`, `coverage-areas` (`coverage-area-list-dynamic` ssr:false), `import` (`import-form`), `statistics` (`AnalyticsCharts`, `TrendVisualization`, `ViewTrendAnalytics`, `KpiStatCards`), `reports`, `laporan` (`laporan-generator`), `rekomendasi`, `settings` (+`profile`, `acesh/acesh-scoring-settings-form`).

**Halaman publik:** `page.tsx` `getLandingData()` → HeroSection (stats totalDestinations/totalUmkms/verifiedPercent) + WhyChooseUs/Categories/Popular/Verified/Nearby/RouteInspiration/HowItWorks/FacilitiesHighlights/Testimonials/Faq/Cta/Footer. `destinasi/[id]` + `umkm/[id]` + `penginapan/[id]` pakai `RichTextRenderer` + `DynamicContextMap`. `peta/page.tsx` → `peta-map-client` + `peta-map-dynamic` (`ssr:false`) + `peta-sidebar` + `facility-route-polyline` (OSRM) + `user-location-marker`.

**Peta — `lib/maps/*` + `components/maps/*`:**
- `leaflet-fix.ts` `fixLeafletIcons()` merge `marker-icon.png` untuk webpack.
- `geo-utils.ts` `parseCoordinate`/`isValidCoordinate(-90..90,-180..180)` + `DEFAULT_CENTER [-7.3274,108.2207]` Tasikmalaya/Banjar `DEFAULT_ZOOM 13`.
- `theme-tile-layer.tsx` `ThemeTileLayer({lightUrl, darkUrl})` `useTheme`+mounted `key=url` remount Carto `light_all/dark_all`.
- `map-picker-client.tsx` `LocationMarker` (`useMapEvents click→onChange+flyTo`, `draggable dragend`) + `ChangeView`.
- `readonly-map-client.tsx` `scrollWheelZoom false` + Popup.
- `destination-context-map-client.tsx` custom `L.divIcon` destinasi 40px oranye vs fasilitas 28px biru + `FitBoundsControl` (`fitBounds padding 50`).
- `components/maps/index.tsx` `MapPicker`/`ReadonlyMap` dynamic ssr:false + `MapSkeleton`.

**Editor — `lib/editor/*`:**
- `extensions.ts` `StarterKit (heading 1-3)`, `Image (rounded-lg border shadow)`, `Link (openOnClick false text-primary underline)`, `Underline`, `TextAlign (heading,paragraph)`, `Placeholder "Mulai menulis artikel destinasi..."`.
- `tiptap-editor.tsx` `useEditor({extensions, content:value, onUpdate=>onChange(getJSON())})` sync via JSON string compare.
- `tiptap-toolbar.tsx` Bold/Italic/Underline, H1-3, Bullet/Ordered/Blockquote, Align, Link prompt, Image upload `POST /api/upload?folder=editor` → `setImage`, Undo/Redo.
- `rich-text-renderer.tsx` `useMemo generateHTML(content,extensions)` → `dangerouslySetInnerHTML` `prose prose-sm md:prose-base dark:prose-invert`.

**Hooks:** `hooks/use-cursor-pagination.ts` generic `useCursorPagination<T>({url, limit=20, params})` — `axios` + `AbortController` + `requestIdRef`, `paramsKey=JSON.stringify(params)`, `fetchData(cursor,isInitial)` merge `params+limit+cursor` → `PaginatedResponse<T>{success,data,pagination:{next_cursor,has_more}}`, `loadMore()`/`refresh()`.

**Styling & PWA:** `app/globals.css` sudah di §3. `manifest.ts` `name "SAFAR - Priangan Halal" start_url "/" display standalone theme_color "#0f766e" lang "id" icons 192/512+maskable`.

## 9. Services & Domain Logic (pilihan)

**`destination-service.ts`:** `computeFacilityMetrics` `parseCoordinate`+`estimateTravelTime`, `validateDestinationCategory type==DESTINATION`, `serializeDestination` Decimal→Number, `getPaginatedDestinations` cursor + `minScore` OR `validated/halal` + scope `public` filter `coverageArea.isActive` + 5 sort (newest/rating/score/name), `getDestination(idOrSlug uuid check)`, `create/updateDestination` transaction validasi kategori + haversine `dist>maxDistance` throw ID, `calculateHalalScoreFromWeights`, `computeFacilityMetrics` → `destinationHalalFacilities+evidences` + `HalalValidation PENDING` (triage `halalScore<50`), `calculateAndSaveAssessment` pasca-commit.

**`umkm-service.ts` / `accommodation-service.ts` / `category-service.ts` / `facility-service.ts` / `validation-service.ts` / `report-service.ts` / `review-service.ts`:** CRUD serupa; `review create` transaksi agregasi `rating=avg, reviewCount`; `category` `@@unique slug+type`; `umkm` `halalScore` dari facility weights triage `surveyorNote`.

**`analytics-service.ts`:** `trackInteraction`, `getHottestDestinations({period,limit})` coba `destinationTrend` fallback `groupBy destinationInteraction` bobot `VIEW1 SEARCH3 CLICK2 SAVE4 SHARE5 ROUTE4`, `recalculateTrends` upsert `trendScore=Σ counts*weights`, `getSearchTrends` group `SEARCH` keyword, `analyzeReviewSentiment` bag kata `bagus/indah/bersih +0.1 / buruk/kotor -0.1` clamp → `>0.6 POSITIVE <0.4 NEGATIVE`, `getDestinationSentimentSummary` counts+top10, `getDetailedStatistics` KPI, `umkmHalalStatus = totalUmkms-certTotal`, topRegions (auto `recalculateHalalReadiness` jika kosong), `halalCategoryDistribution` bucket `≥80 Sangat Siap… null Unscored`, `mapData heat halalScore/100`, `recalculateHalalReadiness` per city/province `halalFacilityScore=avg facility count`, `halalFoodScore=avg valid umkms`, `worshipAccessScore=avg ibadah`, `totalScore=avg(3)`.

**`import-service.ts` / `export-service.ts`:**
- `generateTemplate(type, categories[], coverageAreas[])` ExcelJS header `#065F46` teal, frozen, sample italic, sheet hidden `_Kategori/_Wilayah` validasi 500 baris ID.
- `parseAndImport(buffer,type)` sheet `Data`, kolom DESTINATION 8/UMKM 11/ACCOMMODATION 9/FACILITY 5, skip sample, `cleanString`, `parseCoordinate`, `slug` dedup `toSlug`+`makeUniqueSlug` `-2`, `createMany skipDuplicates`.
- `export getReportData(startDate,endDate,categories)` `startOfDay/endOfDay` + 6 fetcher, `generateCsv` escape `""`, `generateExcel` header bold `#065F46` width cap 50, `generateReport` `{Buffer, contentType, filename:laporan-halal-tourism-YYYY-MM-DD.{csv,xlsx}}` (pdf throw).

**`itinerary-service.ts`:** `createItinerary` transaksi, `generateItineraryRecommendation({city,province,durationDays,halalOnly,categoryIds,maxDestinations})` filter APPROVED, sort halal facilities jika halalOnly lalu `trendScore`, `dayNumber=floor(idx/(max/days))+1`.

**`dashboard-service.ts`:** `getDashboardOverview` 16 query parallel, 7-day chart `DAY_LABELS [Min,Sen...]`, `normalizeScore(value/3*100)`, `readiness` facility/food/worship avg, `acesh {totalAssessed,verifiedCount,pendingCount,averageVerifiedScore/base/confidence,classificationDistribution 5 bucket}`, `getAllMapDestinations` id/name/slug/status/lat/lng/category/image primary.

## 10. Import / Seed / Scripts

**`archives/` (4):** `Amenity.xlsx` (Destinasi/Tempat_Ibadah/Toilet_Wudhu), `Koordinat.xlsx` (Destinasi), `jam operasional destinasi, resto dan uMKM.xlsx` (Jam_Terverifikasi/Hotel/Restoran_UMKM_Master), `data usaha kab pangandaran.xlsx` (Master_Halal_Assurance/UMKM_Kuliner_Source).

**`scripts/import/`:** `import-all.ts` orchestrator `importCoverageAndCategories→Destinations→Accommodations→Facilities→Umkms→OperationalHours→validateAll` set APPROVED/VALID; `import-coverage-cat.ts` upsert `coverage-pangandaran` `#0D9488` + 9 kategori; `import-destinations.ts` merge Amenity+Koordinat by name lowercase; `import-umkms.ts` slug `${baseSlug}-${id}` kuliner/oleh-oleh; `import-accommodations.ts`; `import-facilities.ts` ibadah 25 2.0km / sanitasi 20 0.5km → `DestinationHalalFacility WALKING`; `import-hours.ts` patch `openingHours` by slug/name/externalId; `_utils.ts` `createSlug`/`cleanString`/`parseCoordinate`/`readExcelSheet`.

**`prisma/seed/*`:** `seed.ts` (20k baris generated, `deleteMany` FK order → `auth.api.signUpEmail` 2 user admin+user → 10 kategori DESTINATION 4/UMKM 3/ACCOMMODATION 3 → 11 fasilitas → destinasi/umkm dari `lib/crawled_data/raw/*.csv` terbaru + image `place-photos`); `seed/seed.ts` runtime `importCsv→seedAcesh→seedAccommodations`; `seed/aceshSeeder.ts` 27 indikator 9 grup weight 0.40/0.35/0.25 + `REACHABILITY_SEEDS` 8 type + 20 evidence rekayasa confidence 69 factor 0.907; `destinationSeeder/umkmSeeder/facilitySeeder/externalSourceSeeder/categoryMapper/utils`.

**`scripts/` lain:** `sync-images-to-cloudinary.ts` / `migrate-images-to-cloudinary.ts` / `crawl-destinations-to-cloudinary.ts` (Google Places `textsearch→details→photo` → `hyperlocal/destinations/<slug>/crawl-<hash>` `quality auto` idempoten `--dry-run --limit --concurrency=3`), `acesh-sample-situ-gede.ts` seed 27 skor + 20 evidence → base 64.2 factor 0.907 verified 58.2 BERKEMBANG, `generate-pentest-report.cjs` docx.

**`prisma/migrations` (18):** `20260526152019` base 5 enum + 10 tabel, `20260526160212`+`20260527024835` validasi shuffle, `20260527065736_refactor_facility_master` `destination_halal_facilities` PK+ `destination_facility_evidences`, `20260527080706_add_admin_score`, `20260527095433_add_halal_score_columns`, `20260527114120_add_max_distance`, `20260529084035`+`20260529155000_add_category_type` `CategoryType`, `20260529105856` drop `view_count`, `20260530145553` `ACCOMMODATION` + `accommodations`/`accommodation_*`/`umkm_*`, `20260531072301` `user_interactions` + `Target/Action`, `20260531120909_add_report_model`, `20260602033020_add_ai_intent_log`, `20260608030344`+`20260608052056` `coverage_areas`+`is_active`, `20260625080943_add_estimated_cost`, `20260731210000_acesh_hyperlocal` (4 type 6 tabel ACES-H + `halal_facilities.lat/lng` + `distanceMeters/travelMinutes/travelMode`), `20260819090000_acesh_dynamic_scoring_config` `acesh_scoring_configs singleton default`, `20260906070000_add_recommendation_actions`. `prisma.config.ts` `defineConfig schema prisma/schema.prisma url env(DATABASE_URL)`.

## 11. Testing, Build, Deploy, PWA

**Vitest (`vitest.config.ts`):** `globals:true`, `environment:node`, `include tests/**/*.test.ts` exclude `.next`, coverage `v8` include `lib/services/acesh/**` + `haversine-distance`, alias `@→.` 60 test: `tests/unit/` 10 (travel-time, reachability, indicator `round1/round3` 76.3/68.8/56.3, hyperlocal 59.5, evidence-derivation 70/75/70/65/70/60, evidence-confidence 69/0.907, ai-candidates, acesh-scoring 58.2, config-validation, classification batas 39.9/40/54.9/55/69.9/70/84.9/85) + `tests/integration/` 3 (public-score `PENDING` tak bocor verifiedScore, public-acesh-api 404, assessment-recalculation 58.2 VERIFIED upsert anti-dupe) + `mock-prisma`.

**Docker (`Dockerfile` 3 stage alpine):** deps `node:alpine + libc6-compat/openssl npm ci` → builder `prisma generate + NEXT_TELEMETRY_DISABLED=1 npm run build` → runner `NODE_ENV=production addgroup 1001 adduser nextjs:nodejs, COPY public/.next/node_modules/package.json/prisma/lib/tsconfig.json chown, USER nextjs PORT 3000 HOSTNAME 0.0.0.0 CMD ["npm","start"]`. `.dockerignore` `node_modules .next .git .env*.local`.

**PWA:** `app/manifest.ts` + `ServiceWorkerRegistration` + `InstallPrompt`/`InstallButton` (stash `beforeinstallprompt`), header `/sw.js no-cache`.

**ESLint/TS:** `eslint.config.mjs` `defineConfig nextVitals nextTs globalIgnores .next/out/build/lib/generated/next-env.d.ts scratch`, `tsconfig.json` target ES2023 strict `paths @/* → ./*`.

## 12. Keamanan — Ringkasan Terenkripsi & Hardening Checklist

> Tidak ada nilai rahasia, skrip exploit, atau payload pentest yang disalin. Rincian mentah ada di `vuln.md` / `SAFAR-Penetration-Test-Report-*.docx` (tidak dipublikasikan).

**Kategori temuan high-level:**
- Eskalasi peran via field `role` pada sign-up bila `input:true`.
- Rute `validations` & beberapa `admin`/`AI` tanpa/lemah `requireAdmin`/rate-limit — struktur `proxy.ts` exclude `/api` memperbesar permukaan.
- `lib/actions/*` tanpa guard internal (percaya guard halaman).
- Header keamanan (`CSP`, `HSTS`, `X-Frame-Options`, `X-Content-Type-Options`) belum di `next.config.headers` selain `/sw.js`.
- `advanced.trustedProxyHeaders:true` — aman hanya di balik proxy terpercaya.
- `dangerouslySetInnerHTML` Tiptap — admin-authored, tetap perlu sanitasi output.
- Prompt injection (concatenate user→system prompt) & log error verbose.

**Positif tercatat:** `.env` di `.gitignore` & tidak terlacak di git, `/api/upload` validasi mime/size/folder, `images.remotePatterns` tanpa `**`, layanan map field eksplisit (tanpa `...body` mass assignment), Prisma parameterized (tanpa SQLi), bcrypt via better-auth.

**Checklist hardening (tanpa bocor secret):**
- [ ] `lib/auth.ts` `user.additionalFields.role.input → false` (set role server-side).
- [ ] `lib/auth-guard.ts` `requireAdmin()/requireSession()` untuk route + varian action (return `{error}` shape).
- [ ] Pasang guard di `api/validations/**`, `api/admin/**`, AI (`explore`, `assistant/route-finder`, `recommendations`).
- [ ] Tambah `requireAdmin()` di setiap mutating `lib/actions/*`.
- [ ] Perbaiki cek `session.user.role==="admin"` di `analytics/trends|route`.
- [ ] Rate-limit auth/AI/upload (in-memory/Upstash).
- [ ] Security headers di `next.config.ts`, pisah prompt role AI, sanitasi `RichTextRenderer` (mis. DOMPurify), rapikan log prod, validasi Zod `coverage-areas PUT`.

## 13. Appendix

**Env (nama saja dari `.env.example`):** `DATABASE_URL`, `BETTER_AUTH_SECRET`, `NEXT_PUBLIC_APP_URL`, `BETTER_AUTH_URL`, `GOOGLE_MAPS_API_KEY`, `MAPBOX_ACCESS_TOKEN`, `FOURSQUARE_API_KEY`, `GEOAPIFY_API_KEY`, `GEMINI_API_KEY`, `GEMINI_API_MODEL`, `GROQ_API_KEY`, `GMAIL_USER`, `GMAIL_APP_PASSWORD`, `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `CLOUDINARY_UPLOAD_PRESET` (duplikat baris di example — rapikan).

**Cara jalan:**
```bash
npm ci
npx prisma generate
npx prisma migrate deploy   # 18 migrasi; Neon: env DATABASE_URL
npm run dev                 # :3000 — admin login via /halal → /dashboard
npm run seed:dev            # seed generated; atau npm run seed:tourism / npm run import:data (archives/*.xlsx)
npm run acesh:sample        # Situ Gede demo 58.2 BERKEMBANG
npm test                    # vitest; test:acesh / test:integration / coverage
npm run sync:images:dry -- --limit=3 --dry-run  # cek Cloudinary tanpa tulis
npm run build && npm start  # prod; Docker: docker build -t safar . && docker run -p 3000:3000
```

**Dok terkait:** `docs/aces-h-specification.md`, `aces-h-api.md`, `aces-h-data-model.md`, `aces-h-formula.md`, `aces-h-migration.md`, `aces-h-testing.md`, `feasibility-study-teknis-safar.md`, `ACESH_AUDIT_TRACE.md`.

*Dokumen `docs/SAFAR.md` dihasilkan read-only dari analisis repo — distribusi `.env`/kredensial ke publik dilarang.*
