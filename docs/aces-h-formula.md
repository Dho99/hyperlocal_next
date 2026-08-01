# ACES-H — Rumus & Implementasi Kode

Dokumen ini memetakan setiap rumus ACES-H ke fungsi kode aktual.
Semua fungsi berada di `lib/services/acesh/`.

## Pembulatan

| Fungsi | Lokasi | Perilaku |
|---|---|---|
| `round1(v)` | `indicator.ts` | `Math.round((v + EPSILON) × 10) / 10` |
| `round3(v)` | `indicator.ts` | `Math.round((v + EPSILON) × 1000) / 1000` |
| `clampScore(v)` | `indicator.ts` | clamp ke rentang 0–100 |
| `toIndicatorScore(v)` | `indicator.ts` | `v × 25`, validasi integer 0–4 |
| `calculateGroupScore(inputs)` | `indicator.ts` | `round1(Σ(w × v × 25) / Σ(w))`; bobot negatif ditolak |

## Dimensi ACES Readiness

`aces-readiness-service.ts` — `calculateAcesScore(scoresByGroup)`:

```
acesScore = round1( (access × 0.20 + communication × 0.15
                   + environment × 0.20 + services × 0.45)
                   / Σ bobot_dimensi )
```

`ACES_DIMENSION_WEIGHTS` di `constants.ts` wajib berjumlah 1,0 (diverifikasi
`sumWeights`). Dimensi yang tidak memiliki skor dianggap 0.

## Dimensi Hyperlocal

`hyperlocal-scoring-service.ts` — `calculateHyperlocalScore(scoresByGroup)`:

```
hyperlocalScore = round1( (spatial × 0.30 + functional × 0.25
                         + halalAssurance × 0.20 + ecosystem × 0.15
                         + embeddedness × 0.10) / Σ bobot )
```

## Evidence Confidence & Factor

`evidence-confidence-service.ts`:

```
confidence = round1( sourceReliability × 0.15 + documentEvidence × 0.20
                   + photoGeolocation × 0.15 + managementConfirmation × 0.10
                   + fieldValidation × 0.25 + dataFreshness × 0.15 )
factor     = clamp( 0.70 + 0.30 × confidence / 100, 0.70, 1.00 )
```

Derivasi komponen dari rekaman evidence: `evidence-derivation.ts`
(`deriveEvidenceConfidence`). Referensi umur data:
`validatedAt ?? dataDate ?? createdAt`.

## Pipeline Pusat

`acesh-scoring-service.ts` — `calculateAceshScores(input)`:

```
aces       = round1(clamp(acesScore))        // sudah dibulatkan dari layanan dimensi
hyperlocal = round1(clamp(hyperlocalScore))
base       = round1(clamp(aces × 0.65 + hyperlocal × 0.35))
confidence = round1(clamp(evidenceConfidenceScore))
factor     = round3(0.70 + 0.30 × confidence/100)
verified   = round1(clamp(base × factor))
```

Klasifikasi: `acesh-classification-service.ts` — `classifyScore(verified)`.

## Snapshot & Penyimpanan

`assessment-recalculation-service.ts`:

- `calculateAssessmentSnapshot(destinationId)` — ambil indikator aktif,
  skor destinasi, evidence; hitung semua komponen; tentukan status
  `VERIFIED`/`PENDING` via `shouldMarkVerified(confidence, recordCount)`.
- `verifiedScore` **null saat PENDING**; klasifikasi fallback ke base score.
- `calculateAndSaveAssessment(...)` — `upsert` assessment (anti-duplikasi
  via `@@unique([destinationId])`) + `create` baris riwayat, satu transaksi.

## Skor Publik Traveller

`public-score-service.ts`:

```
publicDisplayScore(score, legacyFallback) =
    score?.verificationStatus === "VERIFIED" && score.verifiedScore != null
        ? score.verifiedScore
        : score?.baseScore ?? legacyFallback ?? 0
```

## Contoh Kode

```ts
// Verifikasi manual formula (hasil seed & test)
import { calculateAceshScores } from "@/lib/services/acesh/acesh-scoring-service";

const r = calculateAceshScores({
    acesScore: 66.8,          // hasil layanan ACES
    hyperlocalScore: 59.5,    // hasil layanan Hyperlocal
    evidenceConfidenceScore: 69,
});
// r.verifiedScore === 58.2, r.classification === "BERKEMBANG"
```
