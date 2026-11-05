DEPLOY NEXORA SETINGS (tanpa Firebase)
1. Upload folder ini ke GitHub -> Netlify > Add new site > Import from Git. (atau: npm i -g netlify-cli && netlify deploy --prod)
   Drag & drop biasa TIDAK menjalankan Functions, jadi admin & log tidak jalan.
2. GANTI SANDI ADMIN: buka netlify/functions/api.mjs, ubah ADMIN_PASSWORD di baris atas.
3. (Opsional) Site settings > Environment variables > DISCORD_WEBHOOK = URL webhook Discord.
4. Ubah nama site jadi "nexorasetings".
Admin: buka /admin.html  (atau ketuk logo NEXORA 5x di halaman utama). Tidak ada tombol admin yang terlihat.
Data user/blokir/pesan disimpan di Netlify Blobs (gratis, otomatis, tanpa setup).
