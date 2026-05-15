#!/usr/bin/env node
// Import produktów z CSV do src/content/products/*.md
// Użycie: npm run import:products <plik.csv>
//
// CSV powinien mieć nagłówek z polami. Wymagane: slug, name.
// Opcjonalne: category, flavor, volume, short_description, description,
//             meta_title, meta_description, available, featured, order, tag.
//
// Tryb działania: MERGE. Jeśli produkt już istnieje, podmienia tylko pola
// które są w CSV, resztę (images, specs, flavorProfile, story itp.) zachowuje.
// Brak pliku = tworzy nowy z placeholder image.

import { readFile, writeFile, mkdir, access } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, basename } from 'node:path';
import { parse as parseCsv } from 'csv-parse/sync';
import { parse as parseYaml, stringify as stringifyYaml } from 'yaml';

const OUT_DIR = 'src/content/products';
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

async function readExistingMd(filePath) {
  try {
    const txt = await readFile(filePath, 'utf-8');
    const m = txt.match(/^---\n([\s\S]+?)\n---\n?([\s\S]*)$/);
    if (!m) return { data: {}, body: txt };
    return { data: parseYaml(m[1]) || {}, body: m[2].trim() };
  } catch {
    return null;
  }
}

function applyCsvRowToData(row, existing) {
  const data = { ...existing };
  let body;

  for (const [csvKey, fieldKey] of Object.entries(CSV_KEY_MAP)) {
    const v = row[csvKey];
    if (v == null || v === '') continue;

    if (fieldKey === '__body__') {
      body = String(v).trim();
      continue;
    }
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

async function main() {
  const csvPath = process.argv[2];
  if (!csvPath) {
    console.error('❌ Użycie: npm run import:products <plik.csv>');
    console.error('   Wymagane kolumny: slug, name');
    console.error('   Opcjonalne: category, flavor, volume, short_description,');
    console.error('              description, meta_title, meta_description,');
    console.error('              available, featured, order, tag, edition');
    process.exit(1);
  }
  if (!existsSync(csvPath)) {
    console.error(`❌ Plik nie istnieje: ${csvPath}`);
    process.exit(1);
  }

  const raw = await readFile(csvPath, 'utf-8');
  const rows = parseCsv(raw, {
    columns: (header) => header.map((h) => h.trim().toLowerCase().replace(/\s+/g, '_')),
    trim: true,
    skip_empty_lines: true,
    bom: true,
  });

  if (rows.length === 0) {
    console.error('❌ CSV jest pusty.');
    process.exit(1);
  }

  await mkdir(OUT_DIR, { recursive: true });

  let created = 0, updated = 0, skipped = 0;

  for (const row of rows) {
    const rawSlug = row.slug?.trim();
    const name = row.name?.trim();

    if (!name) {
      console.warn(`⚠️  Pominięto wiersz bez pola "name":`, row);
      skipped++;
      continue;
    }

    const slug = rawSlug || slugify(name);
    const filePath = join(OUT_DIR, `${slug}.md`);

    const existing = await readExistingMd(filePath);
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

    // Walidacja minimum
    if (!mergedData.category) mergedData.category = 'kombucha';
    if (!mergedData.flavor) mergedData.flavor = '';
    if (!mergedData.volume) mergedData.volume = '';
    if (!mergedData.shortDescription) mergedData.shortDescription = '';
    if (!mergedData.images || mergedData.images.length === 0) {
      mergedData.images = ['/images/photos/placeholder.svg'];
    }

    const yaml = stringifyYaml(mergedData, { lineWidth: 0 });
    const content = `---\n${yaml}---\n\n${finalBody}\n`;

    await writeFile(filePath, content, 'utf-8');

    if (existing) {
      console.log(`✓ Zaktualizowano: ${slug}.md`);
      updated++;
    } else {
      console.log(`+ Utworzono: ${slug}.md`);
      created++;
    }
  }

  console.log(`\n📊 Import zakończony: ${created} nowych, ${updated} zaktualizowanych, ${skipped} pominiętych`);
  console.log(`\nDalej:`);
  console.log(`  1. Sprawdź pliki w ${OUT_DIR}/`);
  console.log(`  2. Uzupełnij obrazki produktów w public/images/photos/`);
  console.log(`  3. Wgraj zmiany: git add -A && git commit -m "Import produktów" && git push`);
}

main().catch((err) => {
  console.error('❌ Błąd:', err.message);
  process.exit(1);
});
