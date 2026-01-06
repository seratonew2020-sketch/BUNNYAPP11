# Setup Instructions for WorkSync Pro

เพื่อเริ่มต้นใช้งานระบบและสร้างข้อมูลผู้ใช้งานตามที่ระบุ กรุณาทำตามขั้นตอนต่อไปนี้:

## 1. ตั้งค่าฐานข้อมูล (Database Setup)

1. เข้าไปที่ [Supabase Dashboard](https://supabase.com/dashboard).
2. เปิด Project ของคุณ และไปที่เมนู **SQL Editor**.
3. เปิดไฟล์ `SUPABASE_SETUP.sql` ในโปรเจคของคุณ หรือคัดลอกโค้ด SQL ด้านล่างไปรันใน SQL Editor:

```sql
-- Create Employees Table (ตารางพนักงาน)
create table if not exists public.employees (
  id uuid references auth.users not null primary key,
  employee_id text not null unique,
  first_name text,
  last_name text,
  department text,
  is_first_login boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table public.employees enable row level security;

-- Create Login History Table (ประวัติการเข้าสู่ระบบ)
create table if not exists public.login_history (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  login_at timestamptz default now(),
  ip_address text,
  user_agent text
);

-- Enable RLS
alter table public.login_history enable row level security;
```

## 2. สร้างบัญชีผู้ใช้ (Seed Users)

เนื่องจากต้องใช้สิทธิ์ Admin ในการสร้าง User ให้ทำตามนี้:

1. ค้นหา **Service Role Key** (secret) จาก Supabase Dashboard > Project Settings > API
2. เพิ่ม Key นี้ลงในไฟล์ `.env.local` (ไฟล์นี้จะไม่ถูกแชร์):
   ```
   SUPABASE_SERVICE_ROLE_KEY=eyJh...... (ใส่คีย์ของคุณที่นี่)
   ```
3. รันคำสั่งสร้างข้อมูล:
   ```bash
   node scripts/seed_users.js
   ```
   *ระบบจะทำการสร้าง User IDs 20001 - 91003 และตั้งรหัสผ่านเป็น '123456'*

## 3. การทดสอบ (Testing)

หลังจากสร้าง User แล้ว สามารถทดสอบระบบได้ดังนี้:

### รันผ่านหน้าเว็บ
1. `npm run dev`
2. เข้าเว็บและลองล็อกอินด้วย `20001` / `123456`

### รันทดสอบอัตโนมัติ
เราได้เตรียม Test script ไว้สำหรับตรวจสอบบัญชีต่างๆ
```bash
npx playwright test tests/auth_users.spec.ts
```

## หมายเหตุ
- ไฟล์ `Login.tsx` ได้รับการปรับปรุงให้รองรับ "รหัสพนักงาน" โดยอัตโนมัติ (ระบบจะเติม @worksync.com ให้เองหลังบ้าน)
- หากต้องการแก้ไข Logic เพิ่มเติม ดูที่ `views/Login.tsx`
