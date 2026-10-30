DEPLOY NEXORA SETINGS
1. Upload folder ini ke GitHub, lalu Netlify > Add new site > Import from Git (agar Function log Discord aktif).
   (Drag & drop biasa TIDAK menjalankan Functions.) Atau pakai: netlify deploy --prod
2. Site settings > Environment variables > tambah DISCORD_WEBHOOK = URL webhook Discord kamu.
3. Ganti nama site jadi "nexorasetings" (Site configuration > Change site name).
