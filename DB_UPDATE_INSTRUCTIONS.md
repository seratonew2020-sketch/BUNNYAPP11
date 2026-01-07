### อัปเดตโครงสร้างฐานข้อมูล (Database Update)

เนื่องจากมีการเพิ่มฟีเจอร์จัดการข้อมูลส่วนตัว (CRUD) จำเป็นต้องรันคำสั่ง SQL เพื่อเพิ่มคอลัมน์ `phone_number` และ `email` ในตาราง `employees`

1. ไปที่ [Supabase Dashboard > SQL Editor](https://supabase.com/dashboard/project/_/sql)
2. รันคำสั่งต่อไปนี้:

```sql
do $$
begin
  if not exists (select 1 from information_schema.columns where table_name = 'employees' and column_name = 'phone_number') then
    alter table public.employees add column phone_number text;
  end if;

  if not exists (select 1 from information_schema.columns where table_name = 'employees' and column_name = 'email') then
    alter table public.employees add column email text;
  end if;
end $$;
```

หรือเปิดไฟล์ `MIGRATE_EMPLOYEES.sql` แล้วนำไปรัน

### ฟีเจอร์ที่เพิ่มเข้ามา
- **Read**: ดึงข้อมูล ชื่อ, นามสกุล, เบอร์โทร, รหัสพนักงาน จากฐานข้อมูลจริง
- **Update**: แก้ไข ชื่อ, นามสกุล, เบอร์โทร, ตำแหน่งงาน และบันทึกลง Supabase
- **Create**: หากข้อมูลยังไม่มีในตาราง `employees` ระบบจะสร้างให้เมื่อกดบันทึก
- **Logout**: เชื่อมต่อระบบ Logout ของ Supabase จริง
