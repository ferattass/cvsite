# Ferat Taş — Portfolio / CV Sitesi

Modern, iki dilli (TR / EN), build gerektirmeyen kişisel CV sitesi.
Açık + koyu tema, **3D hero sahnesi (Three.js)**, **yönetim paneli (admin)**,
scroll-reveal animasyonları, tam responsive ve SEO hazır.

## Klasör yapısı

```
cvsite/
├── index.html              ← ana sayfa
├── contact.php             ← (opsiyonel) iletişim formu mail gönderici
├── css/styles.css          ← tüm site stilleri (açık/koyu tema)
├── js/main.js              ← içerik render + dil + etkileşimler
├── js/hero3d.js            ← 3D hero sahnesi (Three.js)
├── data/
│   ├── content.json        ← TÜM site içeriği (panel buraya yazar, site buradan okur)
│   └── backups/            ← panelin aldığı otomatik yedekler
├── admin/                  ← YÖNETİM PANELİ (PHP)
│   ├── index.php           ← giriş / ilk kurulum / editör kabuğu
│   ├── api.php             ← içerik kaydetme API'si (CSRF korumalı)
│   ├── bootstrap.php       ← oturum + güvenlik + kimlik yardımcıları
│   ├── app.js / admin.css  ← editör arayüzü
│   └── .auth.php           ← (otomatik oluşur) panel şifresinin hash'i
├── assets/favicon.svg      ← site ikonu (FT monogram)
├── assets/head.glb         ← (opsiyonel) 3D yüz modelin — koyarsan hero'da görünür
├── Ferat_Tas_CV_TR.pdf     ← Türkçe CV (indirilebilir)
└── Ferat_Tas_CV_EN.pdf     ← İngilizce CV (indirilebilir)
```

## 🗂 Yönetim Paneli (içeriği koda dokunmadan düzenle)

1. Siteyi PHP destekli hostinge yükle (cPanel/shared hosting çoğunlukla destekler).
2. Tarayıcıda **`https://senin-alanadin.com/admin/`** adresine git.
3. **İlk girişte bir şifre belirle** (en az 8 karakter). Bu şifre `admin/.auth.php`
   içinde hash'lenerek saklanır — düz metin tutulmaz.
4. Sekmelerden (Projeler, Deneyim, Yetenekler, Sertifikalar…) içeriği düzenle,
   üstten **Kaydet**'e bas (veya `Ctrl/Cmd + S`). Değişiklik anında siteye yansır.
5. Her kayıtta otomatik yedek alınır (`data/backups/`, son 20 sürüm).

> **Şifreni unutursan:** hostingden `admin/.auth.php` dosyasını sil → panel
> tekrar "ilk kurulum" ekranını açar ve yeni şifre belirleyebilirsin.

## 🎯 3D Yüz (opsiyonel ama efsane)

Hero bölümündeki 3D obje, `assets/head.glb` dosyası varsa **onu yükler**.
Kendi 3D yüzünü oluşturmak için:

- **Telefonla tarama (en gerçekçi):** KIRI Engine / Polycam / RealityScan
  uygulamalarından biriyle yüzünü tara → `.glb` olarak dışa aktar.
- **Tek selfie'den:** Avaturn veya Ready Player Me ile stilize 3D kafa üret.
- Çıkan dosyayı **`assets/head.glb`** olarak koy — başka hiçbir şey yapmana gerek yok.
- Dosya yoksa: yerine prosedürel, mouse'a tepki veren kristal obje görünür.

## İletişim formu

- **PHP destekli hosting:** Form mesajı doğrudan e-posta olarak gönderilir.
  `contact.php` içindeki `$to` adresini değiştirmen yeterli.
- **PHP yoksa:** Form otomatik olarak ziyaretçinin kendi e-posta uygulamasını
  açar (`mailto` fallback). Site her hostingde çalışır.

## Özelleştirme

- **İçerik / metinler:** Panelden (`/admin/`) veya doğrudan `data/content.json`.
- **Arayüz metinleri (menü, butonlar):** `js/main.js` → `I18N` nesnesi.
- **Renkler / tema:** `css/styles.css` en üstteki `:root` değişkenleri.

## Yerelde önizleme

PHP ile (panel + form dahil tam çalışır):
```
php -S localhost:8000
```
Sonra tarayıcıda `http://localhost:8000/` (panel için `/admin/`).

> Not: 3D sahne ve panel `http(s)` ister. `index.html`'i çift tıklayıp `file://`
> olarak açarsan içerik gömülü yedekten yüklenir (panel/JSON devre dışı kalır).
