FROM node:20-slim

RUN apt-get update && apt-get install -y postgresql-client openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY prisma ./prisma
RUN npx prisma generate

COPY . .
RUN npm run build

# Create upload and backup directories
RUN mkdir -p /app/uploads /app/backups

EXPOSE 3001

# Run migrations, seed, and start
CMD npx prisma migrate deploy && npx tsx prisma/seed.ts && node dist/index.js
