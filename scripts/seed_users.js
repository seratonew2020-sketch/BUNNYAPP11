import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load environment variables from .env and .env.local
const envFiles = ['.env', '.env.local'];
for (const file of envFiles) {
  const envPath = path.resolve(process.cwd(), file);
  if (fs.existsSync(envPath)) {
    const envConfig = dotenv.parse(fs.readFileSync(envPath));
    for (const k in envConfig) {
      process.env[k] = envConfig[k];
    }
  }
}

const supabaseUrl = process.env.VITE_SUPABASE_URL;
// NOTE: creating users requires the SERVICE_ROLE_KEY, NOT the anon key.
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: Must provide VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local or environment');
  console.log('Please add SUPABASE_SERVICE_ROLE_KEY=... to your .env.local file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const userIds = [
  '20001', '20002', '20004', '20005', '20006', '20007', '20009', '20011', '20014', '20016',
  '20017', '20018', '20019', '20020', '20021', '20022', '20023', '20024', '20025', '20028',
  '20032', '20034', '20035', '20036', '20038', '20039', '20040', '20044', '20046', '20047',
  '20049', '20051', '20055', '20057', '20058', '20061', '20062', '20064', '20065', '20066',
  '20068', '20071', '20072', '20074', '20075', '20076', '20078', '20079', '20080', '20081',
  '20082', '20083', '20085', '20086', '20087', '20088', '20094', '20095', '20096', '91003'
];

async function seedUsers() {
  console.log(`Starting seed for ${userIds.length} users...`);

  for (const id of userIds) {
    const email = `${id}@worksync.com`;
    const password = '123456';

    try {
      // 1. Create Auth User
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { employee_id: id }
      });

      if (authError) {
        console.error(`Failed to create auth user ${id}: ${authError.message}`);
        continue;
      }

      const userId = authData.user.id;
      console.log(`Created Auth User: ${id} (${userId})`);

      // 2. Create Employee Record (if not using trigger)
      const { error: dbError } = await supabase
        .from('employees')
        .upsert({
          id: userId,
          employee_id: id
        });

      if (dbError) {
        console.error(`Failed to create employee record ${id}: ${dbError.message}`);
      } else {
        console.log(`Linked Employee Table: ${id}`);
      }

    } catch (e) {
      console.error(`Unexpected error for ${id}:`, e);
    }
  }

  console.log('Seeding complete.');
}

seedUsers();
