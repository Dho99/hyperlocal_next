# === STAGE 1: Install Dependencies ===
# Menggunakan versi Node.js latest berbasis Alpine Linux
FROM node:alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package management files
COPY package.json package-lock.json* ./
RUN npm ci

# === STAGE 2: Build Aplikasi ===
FROM node:alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Matikan telemetry Next.js
ENV NEXT_TELEMETRY_DISABLED=1

# Jalankan proses kompilasi/build
RUN npm run build

# === STAGE 3: Production Runner (Image Akhir) ===
FROM node:alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Setup user non-root untuk keamanan
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy hasil kompilasi dari stage sebelumnya
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

USER nextjs

# Set environment bawaan
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Perintah utama saat kontainer menyala
CMD ["npm", "start"]