import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function loadViteEnvLocal() {
  const envPath = resolve(__dirname, '..', '.env.local');
  let content = '';
  try {
    content = readFileSync(envPath, 'utf8');
  } catch (e) {
    throw new Error(`Failed to read .env.local at ${envPath}: ${e.message}`);
  }
  const lines = content.split(/\r?\n/);
  const kv = {};
  for (const line of lines) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*"?([^"\n\r]+)"?\s*$/);
    if (m) kv[m[1]] = m[2];
  }
  const url = kv.VITE_SUPABASE_URL;
  const key = kv.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env.local');
  return { url, key };
}

async function main() {
  const { url, key } = loadViteEnvLocal();
  const supabase = createClient(url, key);

  const result = {
    envLoaded: true,
    canSelect: false,
    canInsert: false,
    canUpdate: false,
    canDelete: false,
    errors: [],
    testRowId: null,
  };

  // SELECT test
  try {
    const { data, error } = await supabase.from('enquiries').select('id').limit(1);
    if (error) throw error;
    result.canSelect = true;
  } catch (e) {
    result.errors.push(`SELECT failed: ${e.message}`);
  }

  // INSERT test
  try {
    const payload = {
      service: 'Mason',
      category: 'New',
      phone: '9999999999',
      name: 'Smoke Test',
      address: 'Test Address',
      notes: 'Automated connectivity test',
      status: 'New',
    };
    const { data, error } = await supabase.from('enquiries').insert(payload).select('id').single();
    if (error) throw error;
    result.canInsert = true;
    result.testRowId = data.id;
  } catch (e) {
    result.errors.push(`INSERT failed: ${e.message}`);
  }

  // UPDATE test
  if (result.testRowId) {
    try {
      const { error } = await supabase.from('enquiries').update({ status: 'Contacted' }).eq('id', result.testRowId);
      if (error) throw error;
      result.canUpdate = true;
    } catch (e) {
      result.errors.push(`UPDATE failed: ${e.message}`);
    }
  }

  // DELETE test
  if (result.testRowId) {
    try {
      const { error } = await supabase.from('enquiries').delete().eq('id', result.testRowId);
      if (error) throw error;
      result.canDelete = true;
    } catch (e) {
      result.errors.push(`DELETE failed: ${e.message}`);
    }
  }

  console.log(JSON.stringify(result, null, 2));
}

main().catch(err => {
  console.error('Smoke test crashed:', err);
  process.exit(1);
});
