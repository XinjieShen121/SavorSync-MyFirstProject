// Adds a free-licensed Wikimedia Commons photo to every recipe that has no image yet,
// and stores the credit (author, license, link) that the recipe page shows under the photo.
// Usage, from savorsync-api:
//   npm run add-photos -- --dry-run   picks photos and writes photos-preview.html to look at; changes nothing
//   npm run add-photos                saves the picks to the recipe database
// A bad pick can be fixed by adding the recipe to OVERRIDES below with a better Commons file name.
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

if (!process.env.MONGODB_URI || !process.env.RECIPE_MONGODB_URI) {
  console.error('❌ MONGODB_URI and RECIPE_MONGODB_URI must both be set in savorsync-api/.env');
  process.exit(1);
}

const { userDb, recipeDb } = require('../config/mongoose');

const DRY_RUN = process.argv.includes('--dry-run');
const API = 'https://commons.wikimedia.org/w/api.php';
// Wikimedia asks every script to identify itself
const HEADERS = { 'User-Agent': 'SavorSync recipe photos (https://github.com/XinjieShen121/SavorSync-MyFirstProject)' };
const WIDTH = 1200;

// recipe_name -> exact Commons file name, for when the search picks the wrong photo
const OVERRIDES = {
  // 'Spaghetti Carbonara': 'File:Spaghetti alla carbonara.jpg',
};

// Only licenses that allow reuse on a website with credit (no "non-commercial" or "no derivatives")
const FREE_LICENSE = /^(cc0|public domain|pd|cc by(-sa)? \d(\.\d)?)/i;

const strip = (html = '') => html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();

const commons = async (params) => {
  const url = `${API}?${new URLSearchParams({ format: 'json', origin: '*', ...params })}`;
  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) throw new Error(`Wikimedia Commons answered ${res.status}`);
  return res.json();
};

const IMAGE_INFO = { prop: 'imageinfo', iiprop: 'url|mime|size|extmetadata', iiurlwidth: String(WIDTH) };

const toPhoto = (page) => {
  const info = page.imageinfo && page.imageinfo[0];
  if (!info) return null;
  const meta = info.extmetadata || {};
  const license = strip(meta.LicenseShortName && meta.LicenseShortName.value);
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(info.mime)) return null;
  if (info.width < 800 || !FREE_LICENSE.test(license)) return null;
  return {
    image_url: info.thumburl || info.url,
    image_credit: {
      author: strip(meta.Artist && meta.Artist.value) || 'Unknown author',
      license,
      license_url: (meta.LicenseUrl && meta.LicenseUrl.value) || '',
      source_url: info.descriptionurl,
      source: 'Wikimedia Commons',
    },
  };
};

const findPhoto = async (recipe) => {
  if (OVERRIDES[recipe.recipe_name]) {
    const data = await commons({ action: 'query', titles: OVERRIDES[recipe.recipe_name], ...IMAGE_INFO });
    return toPhoto(Object.values(data.query.pages)[0]);
  }
  const data = await commons({
    action: 'query',
    generator: 'search',
    gsrsearch: `${recipe.recipe_name} filetype:bitmap`,
    gsrnamespace: '6',
    gsrlimit: '15',
    ...IMAGE_INFO,
  });
  const pages = Object.values((data.query && data.query.pages) || {}).sort((a, b) => a.index - b.index);
  for (const page of pages) {
    const photo = toPhoto(page);
    if (photo) return photo;
  }
  return null;
};

const escapeHtml = (s = '') => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

const writePreview = (picks) => {
  const cards = picks.map(({ recipe, photo }) => `
    <figure>
      ${photo ? `<img src="${escapeHtml(photo.image_url)}" alt="">` : '<div class="none">No free photo found</div>'}
      <figcaption><strong>${escapeHtml(recipe.recipe_name)}</strong>
      ${photo ? `<br><a href="${escapeHtml(photo.image_credit.source_url)}">${escapeHtml(photo.image_credit.author)}, ${escapeHtml(photo.image_credit.license)}</a>` : ''}</figcaption>
    </figure>`).join('');
  const file = path.join(__dirname, '..', 'photos-preview.html');
  fs.writeFileSync(file, `<!doctype html><meta charset="utf-8"><title>Recipe photo picks</title>
<style>body{font:15px system-ui;margin:24px;background:#fdf8f2}main{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:16px}
figure{margin:0;background:#fff;border-radius:12px;overflow:hidden}img,.none{width:100%;aspect-ratio:4/3;object-fit:cover;display:block}
.none{display:grid;place-items:center;background:#eee;color:#888}figcaption{padding:8px 12px 12px}a{color:#a0461b;font-size:13px}</style>
<h1>Recipe photo picks (nothing saved yet)</h1><main>${cards}</main>`);
  return file;
};

const main = async () => {
  await recipeDb.asPromise();
  console.log(`✅ Connected to recipe database "${recipeDb.name}" on ${recipeDb.host}`);
  const collection = recipeDb.db.collection('recipes');

  const missing = await collection
    .find({ $or: [{ image_url: { $in: [null, ''] } }, { image_url: { $exists: false } }], generated: { $ne: true } })
    .project({ recipe_name: 1 })
    .toArray();
  console.log(`🔎 ${missing.length} recipes have no photo. Searching Wikimedia Commons...\n`);

  const picks = [];
  for (const recipe of missing) {
    const photo = await findPhoto(recipe).catch((error) => {
      console.log(`   ⚠️ ${recipe.recipe_name}: ${error.message}`);
      return null;
    });
    picks.push({ recipe, photo });
    console.log(photo
      ? `   ✓ ${recipe.recipe_name}: ${photo.image_credit.author} (${photo.image_credit.license})`
      : `   – ${recipe.recipe_name}: no free photo found`);
  }

  if (DRY_RUN) {
    const file = writePreview(picks);
    console.log(`\n🔎 Dry run, nothing was saved. Open the picks with:\n   open ${file}`);
    return;
  }

  let saved = 0;
  for (const { recipe, photo } of picks) {
    if (!photo) continue;
    await collection.updateOne({ _id: recipe._id }, { $set: { ...photo, updatedAt: new Date() } });
    saved += 1;
  }
  console.log(`\n🎉 Saved photos for ${saved} of ${picks.length} recipes.`);
};

main()
  .catch((error) => {
    console.error('❌ Adding photos failed:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await Promise.all([recipeDb.close(), userDb.close()]);
  });
