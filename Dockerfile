# === STAGE 1: Install Dependencies ===
FROM node:alpine AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

# === STAGE 2: Build Aplikasi ===
FROM node:alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Wajib: Generate Prisma Client di sini, sebelum proses Next build!
# Hasil generate-nya akan masuk ke folder custom /app/lib
RUN npx prisma generate

ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# === STAGE 3: Production Runner ===
FROM node:alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy aset utama Next.js
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Copy nyawa Prisma v7 & Client Custom-nya
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder --chown=nextjs:nodejs /app/lib ./lib

COPY --from=builder /app/tsconfig.json ./tsconfig.json

USER nextjs

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["npm", "start"]