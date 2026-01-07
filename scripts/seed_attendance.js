import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });
if (!process.env.VITE_SUPABASE_URL) {
  dotenv.config({ path: path.resolve(__dirname, '../.env') });
}

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const rawData = `
20001   01-12-2025 04:18
20001   01-12-2025 17:54
20001   02-12-2025 04:06
20001   02-12-2025 04:40
20001   02-12-2025 17:59
20001   03-12-2025 03:03
20001   03-12-2025 03:25
20001   05-12-2025 17:58
20001   06-12-2025 03:41
20001   06-12-2025 03:58
20001   06-12-2025 04:52
20001   06-12-2025 17:48
20001   07-12-2025 04:50
20001   07-12-2025 17:57
20001   08-12-2025 03:11
20001   08-12-2025 17:54
20001   09-12-2025 03:28
20001   09-12-2025 05:17
20001   09-12-2025 05:19
20001   09-12-2025 17:57
20001   10-12-2025 03:38
20001   14-12-2025 17:44
20001   15-12-2025 03:10
20001   16-12-2025 03:16
20001   17-12-2025 17:54
20001   18-12-2025 03:02
20001   19-12-2025 17:50
20001   20-12-2025 03:23
20001   20-12-2025 04:05
20001   20-12-2025 17:49
20001   21-12-2025 04:54
20001   21-12-2025 17:58
20001   22-12-2025 03:07
20001   22-12-2025 17:53
20001   23-12-2025 03:10
20001   23-12-2025 03:33
20001   23-12-2025 17:49
20001   24-12-2025 03:13
20001   25-12-2025 17:49
20001   26-12-2025 03:39
20001   26-12-2025 04:10
20001   26-12-2025 18:00
20001   27-12-2025 03:59
20001   27-12-2025 17:50
20001   28-12-2025 03:17
20001   28-12-2025 03:44
20001   28-12-2025 17:47
20001   29-12-2025 03:12
20001   29-12-2025 05:35
20001   29-12-2025 17:55
20001   30-12-2025 03:04
20001   31-12-2025 17:46
20001   01-01-2026 06:40
20001   01-01-2026 06:45
20001   01-01-2026 17:57
20001   02-01-2026 03:07
`;

async function seedAttendance() {
  console.log('Seeding attendance data...');

  const lines = rawData.trim().split('\n');
  const records = [];

  for (const line of lines) {
    // Split by tab or multiple spaces
    const parts = line.trim().split(/\s+/);
    if (parts.length >= 3) {
      const empId = parts[0];
      const dateStr = parts[1]; // DD-MM-YYYY
      const timeStr = parts[2]; // HH:MM

      // Convert to ISO timestamp (assuming local time / GMT+7 context or UTC? Let's aim for ISO)
      // Format: YYYY-MM-DDTHH:MM:00Z
      const [day, month, year] = dateStr.split('-');
      // Creating date object. Note: Month in JS is 0-indexed.
      // Assuming user data implies local time (e.g., Thailand GMT+7).
      // For simplicity/consistency in DB, we'll store as UTC or ISO string.
      // If we treat it as UTC for simplicity:
      const isoString = `${year}-${month}-${day}T${timeStr}:00.000Z`;

      records.push({
        employee_id: empId,
        timestamp: isoString,
      });
    }
  }

  // Batch insert to avoid limitations
  const BATCH_SIZE = 100;
  for (let i = 0; i < records.length; i += BATCH_SIZE) {
    const batch = records.slice(i, i + BATCH_SIZE);
    const { error } = await supabase.from('time_attendance').insert(batch);

    if (error) {
      console.error('Error inserting batch:', error);
    } else {
      console.log(`Inserted batch ${i/BATCH_SIZE + 1} (${batch.length} records)`);
    }
  }

  console.log('Seeding complete!');
}

seedAttendance();
