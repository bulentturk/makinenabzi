# Makine Nabzı

İş makinaları, tarım, maden, liman ve mobil ekipman teknolojileri için sektörel haber + teknik blog projesi.

## Teknoloji
- Astro
- Statik üretim
- GitHub Pages + GitHub Actions
- Özel alan adı için `SITE_URL` repository variable

## Yerel geliştirme
```bash
npm install
npm run dev
```

## Yayın
`main` dalına gelen değişiklikler GitHub Pages'e yayınlanır.

Özel alan adı tanımlandıktan sonra repository variable olarak `SITE_URL=https://alanadiniz.com` değeri girilir. DNS ve GitHub Pages Custom Domain ayarı ayrıca yapılır.
