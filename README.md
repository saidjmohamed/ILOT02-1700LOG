# 1700Log-ilt02

نظام ويب لإدارة سكان حي 1700 مسكن بوعنقود — البليدة إيلو 02.

## التقنية

Next.js + TypeScript + Supabase + PostgreSQL + Vercel.

## التشغيل المحلي

انسخ `.env.example` إلى `.env.local` وضع:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

ثم:

```bash
npm install
npm run build
npm start
```

## البيانات

التطبيق لا يعتمد على بيانات تجريبية أو أرقام ثابتة. جميع الأرقام المالية وعدد الجيران تُقرأ من Supabase.

## الأمان

لا يتم وضع `service_role` في الواجهة. العمليات المالية الحساسة محمية عبر RLS ودور `admin` أو `treasurer`.
