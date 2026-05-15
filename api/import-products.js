// Vercel Serverless Function — import produktów z CSV do GitHuba.
// Wymaga env vars: GW_IMPORT_PASSWORD, GW_IMPORT_TOKEN (GitHub PAT z scope `repo`)
//
// POST body warianty:
//   { action: "auth", password }     — weryfikuje hasło
//   { action: "import", password, rows: [...] } — importuje produkty

import { Octokit } from '@octokit/rest';
import { stringify as stringifyYaml, parse as parseYaml } from 'yaml';

const REPO_OWNER = 'marek-grvbowski';
const REPO_NAME = 'gary-wrotka';
const BRANCH = 'main';
const PRODUCTS_DIR = 'src/content/products';

const CSV_KEY_MAP = {
  slug: 'slug',
  name: 'name',
  category: 'category',
  category_label: 'categoryLabel',
  flavor: 'flavor',
  volume: 'volume',
  short_description: 'shortDescription',
  shortdescription: 'shortDescription',
  description: '__body__',
  meta_title: 'metaTitle',
  metatitle: 'metaTitle',
  meta_description: 'metaDescription',
  metadescription: 'metaDescription',
  available: 'available',
  featured: 'featured',
  order: 'order',
  tag: 'tag',
  edition: 'edition',
};

function coerceBool(v) {
  if (typeof v === 'boolean') return v;
  if (!v) return undefined;
  const s = String(v).trim().toLowerCase();
  if (['true', 'tak', '1', 'yes', 'y'].includes(s)) return true;
  if (['false', 'nie', '0', 'no', 'n'].includes(s)) return false;
  return undefined;
}

function coerceNumber(v) {
  if (v === '' || v == null) return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

function slugify(s) {
  return String(s)
    .toLowerCase()
    .replace(/ą/g, 'a').replace(/ć/g, 'c').replace(/ę/g, 'e').replace(/ł/g, 'l')
    .replace(/ń/g, 'n').replace(/ó/g, 'o').replace(/ś/g, 's').replace(/ż|ź/g, 'z')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function applyCsvRowToData(row, existing) {
  const data = { ...existing };
  let body;
  for (const [csvKey, fieldKey] of Object.entries(CSV_KEY_MAP)) {
    const v = row[csvKey];
    if (v == null || v === '') continue;
    if (fieldKey === '__body__') { body = String(v).trim(); continue; }
    if (fieldKey === 'available' || fieldKey === 'featured') {
      const b = coerceBool(v);
      if (b !== undefined) data[fieldKey] = b;
      continue;
    }
    if (fieldKey === 'order') {
      const n = coerceNumber(v);
      if (n !== undefined) data[fieldKey] = n;
      continue;
    }
    data[fieldKey] = String(v).trim();
  }
  return { data, body };
}

async function readExistingFile(octokit, path) {
  try {
    const { data } = await octokit.repos.getContent({
      owner: REPO_OWNER, repo: REPO_NAME, path, ref: BRANCH,
    });
    if (Array.isArray(data) || data.type !== 'file') return null;
    const content = Buffer.from(data.content, 'base64').toString('utf-8');
    const m = content.match(/^---\n([\s\S]+?)\n---\n?([\s\S]*)$/);
    return {
      sha: data.sha,
      data: m ? (parseYaml(m[1]) || {}) : {},
      body: m ? m[2].trim() : content,
    };
  } catch (err) {
    if (err.status === 404) return null;
    throw err;
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, error: 'Method not allowed' });
    return;
  }

  const password = req.body?.password;
  const expectedPass = process.env.GW_IMPORT_PASSWORD;

  if (!expectedPass) {
    res.status(500).json({ ok: false, error: 'GW_IMPORT_PASSWORD nie jest ustawione w Vercel env.' });
    return;
  }
  if (!password || password !== expectedPass) {
    res.status(401).json({ ok: false, error: 'Niepoprawne hasło.' });
    return;
  }

  if (req.body.action === 'auth') {
    res.status(200).json({ ok: true });
    return;
  }

  if (req.body.action !== 'import') {
    res.status(400).json({ ok: false, error: 'Nieznana akcja.' });
    return;
  }

  const githubToken = process.env.GW_IMPORT_TOKEN;
  if (!githubToken) {
    res.status(500).json({ ok: false, error: 'GW_IMPORT_TOKEN nie jest ustawione w Vercel env.' });
    return;
  }

  const rows = Array.isArray(req.body.rows) ? req.body.rows : [];
  if (rows.length === 0) {
    res.status(400).json({ ok: false, error: 'Brak wierszy do importu.' });
    return;
  }

  const octokit = new Octokit({ auth: githubToken });
  let created = 0, updated = 0, skipped = 0;
  const errors = [];

  for (const row of rows) {
    const name = row.name?.trim();
    if (!name) { skipped++; continue; }
    const slug = (row.slug?.trim()) || slugify(name);
    const path = `${PRODUCTS_DIR}/${slug}.md`;

    try {
      const existing = await readExistingFile(octokit, path);
      const baseData = existing?.data ?? {
        name,
        category: 'kombucha',
        flavor: '',
        volume: '',
        shortDescription: '',
        images: ['/images/photos/placeholder.svg'],
        available: true,
        featured: false,
        order: 100,
      };
      const baseBody = existing?.body ?? '';

      const { data: mergedData, body: csvBody } = applyCsvRowToData(row, baseData);
      const finalBody = csvBody !== undefined ? csvBody : baseBody;

      if (!mergedData.category) mergedData.category = 'kombucha';
      if (!mergedData.flavor) mergedData.flavor = '';
      if (!mergedData.volume) mergedData.volume = '';
      if (!mergedData.shortDescription) mergedData.shortDescription = '';
      if (!Array.isArray(mergedData.images) || mergedData.images.length === 0) {
        mergedData.images = ['/images/photos/placeholder.svg'];
      }

      const yamlBlock = stringifyYaml(mergedData, { lineWidth: 0 });
      const fileContent = `---\n${yamlBlock}---\n\n${finalBody}\n`;
      const contentBase64 = Buffer.from(fileContent, 'utf-8').toString('base64');

      await octokit.repos.createOrUpdateFileContents({
        owner: REPO_OWNER,
        repo: REPO_NAME,
        path,
        branch: BRANCH,
        message: existing ? `CMS import: aktualizacja ${slug}` : `CMS import: nowy produkt ${slug}`,
        content: contentBase64,
        sha: existing?.sha,
      });

      if (existing) updated++;
      else created++;
    } catch (err) {
      errors.push({ slug, error: err.message });
      skipped++;
    }
  }

  res.status(200).json({ ok: true, created, updated, skipped, errors: errors.length ? errors : undefined });
}
