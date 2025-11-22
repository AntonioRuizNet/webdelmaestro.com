# Next.js + NextAuth (Credentials) + Prisma + PostgreSQL + Redux + REST

## Copiar proyecto en destino (terminal del proyecto destino)

- robocopy "E:\template" "." /E /XD ".next" "node_modules"

## Getting Started

```bash
cp .env.example .env
# set DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL, SMTP_*

npm install
npx prisma generate
npx prisma migrate dev --name init

npm run dev
```

Deploy on Vercel and set the same env vars.
Neon DB works by setting its connection string in `DATABASE_URL`.
