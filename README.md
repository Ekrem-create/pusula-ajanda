# Pusula — Kişisel Ajanda & Not Defteri

Planlarını, görevlerini ve notlarını tek yerde takip etmek için tasarlanmış, **telefon öncelikli** bir ajanda uygulaması. Ana ekrandan dokunup açılır, çevrimdışı çalışır, hesap gerektirmez; verilerin yalnızca kendi cihazında saklanır.

> **Varsayılan ilke:** Aksini açıkça belirtmediğin sürece tüm çalışmalarımı telefonda çalışacak şekilde yapıyorum.

## Telefona kurulum

### Android — gerçek APK (önerilen)
1. `Pusula.apk` dosyasını telefona aktar (USB, WhatsApp, e-posta veya dosya paylaşımı).
2. Dosyaya dokun. Android "Bilinmeyen kaynaklardan yükleme" izni isterse izin ver.
3. Yüklendikten sonra **Pusula** simgesi ana ekranda görünür; internet olmadan açılır.

APK tamamen çevrimdışıdır: internet izni bile yoktur. Veriler uygulamanın kendi depolamasında kalır.

### iPhone / iPad — Ana Ekrana Ekle
1. Telefonda HTTPS adresi aç (şu an çalışan geçici adres: `https://match-conjunction-actress-bag.trycloudflare.com/` — QR: `telefon-qr.png`).
2. Safari → **Paylaş** → **Ana Ekrana Ekle**.
3. Ana ekrandaki Pusula simgesi bağımsız pencerede açılır; ilk yüklemeden sonra çevrimdışı çalışır.

Kalıcı bir HTTPS adresi için kendi GitHub hesabınla `./publish.sh` çalıştır; birkaç dakika sonra `https://<kullanıcı>.github.io/pusula-ajanda/` adresi oluşur.

### Aynı Wi-Fi ile hızlı deneme
```bash
./telefon.sh
```
Ağ IP'sini yazdırır, `telefon-qr.png` oluşturur ve sunucuyu başlatır. Telefon aynı Wi-Fi'deyse QR'ı tarayabilirsin. (Android'de HTTP üzerinden PWA yüklemesi yapılmaz; APK'yı kullan.)

### Tek dosya (yedek / acil durum)
`dist/Pusula.html` dosyasını telefona atıp Dosyalar uygulamasından açabilirsin. Çalışır, ancak bazı tarayıcılar `file://` adresinde veri saklamaya izin vermediği için kalıcılık garanti değildir; asıl kullanım için APK veya yüklü PWA'yı kullan.

## Uygulama olarak başlatma (masaüstü)

**Linux / masaüstü — tek komut:**

```bash
./start.sh
```

`start.sh` yerel sunucuyu açar ve Pusula'yı tarayıcının uygulama penceresinde (`--app`) başlatır. Kapatmak için terminalde `Ctrl+C` yeterli. İstersen `Pusula.desktop` dosyasını masaüstüne kopyalayıp çift tıklayarak da açabilirsin (dosyadaki yollar bu kuruluma göre ayarlıdır).

**Tarayıcıdan yükleme (PWA):**

1. Uygulamayı `http://localhost:8787` (veya herhangi bir HTTPS adresi) üzerinden aç.
2. Sol alttaki **Uygulamayı yükle** düğmesine tıkla — destekleyen tarayıcılarda yükleme penceresi açılır.
3. Chrome/Edge: adres çubuğundaki **Yükle** simgesi veya `⋮ → Yayınla, kaydet ve paylaş → Pusula'yı yükle`.
   Android Chrome: `⋮ → Uygulamayı yükle`. iPhone Safari: `Paylaş → Ana Ekrana Ekle`.
4. Yüklendikten sonra ana ekrandan/uygulama menüsünden bağımsız pencerede açılır; internet olmadan da çalışır.

> `file://` ile doğrudan dosya açıldığında tarayıcı PWA yüklemesine izin vermez. Bu yüzden `start.sh` veya yerel sunucu kullanılır.

**Yerel sunucu elle:**

```bash
python3 -m http.server 8787
# http://localhost:8787
```

## Öne çıkanlar

- **Doğal dilde hızlı ekleme:** `Raporu bitir yarın saat 16 #iş !1 @Çalışma` tek satırda tarih, saat, etiket, öncelik ve proje algılar.
- **Bugün görünümü:** Günün özeti, ilerleme halkası, gecikmiş işler ve 7 günlük şerit.
- **Görünümler:** Bugün, Yaklaşan, Tüm görevler, Takvim, Günlük notlar, Notlar, Tamamlananlar, projeler ve etiketler.
- **Takvim:** Aylık görünümde görev yoğunluğu; güne tıklayarak o günün planını görüntüleme.
- **Günlük notlar:** Bugün (veya takvimden seçilen gün) için yazdığın not yazarken otomatik kaydedilir; **Günlük notlar** ekranından geçmiş günlere dönüp düzenleyebilir/silebilirsin.
- **Not defteri:** Renkli, sabitlenebilir not kartları ve düzenleyici.
- **Telefon:** Alttaki sabit giriş çubuğuyla görev eklenir; ortadaki `+` düğmesi Bugün/Takvim/Günlük notlar ekranında günlük nota odaklanır, Notlar ekranında yeni not açar.
- **Projeler & etiketler:** Renk kodlu projeler, etiket bazlı filtreleme.
- **Sıralama & sürükle-bırak:** Elle, tarihe, önceliğe veya alfabetik sıralama.
- **Koyu tema, arama, klavye kısayolları, JSON yedek alma/yükleme, geri almalı silme.**

### Klavye kısayolları

| Tuş | İşlev |
| --- | --- |
| `N` | Yeni görev / not |
| `/` | Ara |
| `T` / `U` / `D` | Bugün / Yaklaşan / Notlar |
| `Enter` | Hızlı ekleme satırında görev oluştur |
| `Esc` | Açık pencereyi, menüyü veya aramayı kapat |

## En iyi örneklerle karşılaştırma

Pusula, tanınmış uygulamaların en beğenilen yönlerini tek bir hafif araçta birleştirir:

| Örnek | Güçlü yönü | Pusula'da karşılığı |
| --- | --- | --- |
| **Todoist** | Doğal dilde görev ekleme, proje/etiket yapısı | `yarın`, `3 gün sonra`, `pazartesi`, `#etiket`, `!1`, `@proje` ayrıştırma; renkli projeler |
| **Things 3** | Sakin, odaklı “Bugün” deneyimi ve zarif tipografi | Günün özeti, ilerleme halkası, gecikmiş işlerin ayrı gösterimi, sade görsel dil |
| **Notion** | Esnek not tutma, blok benzeri düzen | Renkli ve sabitlenebilir not kartları, görevlerle aynı yerde arama |
| **TickTick** | Takvim + görev birleşimi, öncelikler | Aylık takvim, gün detayı, dört kademeli öncelik ve haftalık şerit |
| **Apple Notes / Google Keep** | Hızlı yakalama, basitlik | Tek satırlık hızlı ekleme, kısayollar, not kartları |
| **Pusula'nın farkı** | Kurulum yok, hesap yok, veri sende | Tek HTML/CSS/JS dosya kümesi; çevrimdışı çalışır; JSON ile tam taşınabilirlik |

## Teknik notlar

- `index.html` — uygulama iskeleti ve PWA meta etiketleri
- `styles.css` — tasarım sistemi, açık/koyu tema, duyarlı yerleşim
- `app.js` — durum yönetimi, doğal dil ayrıştırma, görünümler, kalıcılık, yükleme akışı
- `manifest.webmanifest` — uygulama adı, ikonlar, bağımsız pencere ve kısayollar
- `sw.js` — çevrimdışı önbellek (service worker)
- `icons/` — uygulama, maskable, iOS ve Android ikonları (`tools/make_icons.py` ile üretilir)
- `android/` — WebView tabanlı Android projesi; `tools/build_apk.sh` ile `Pusula.apk` üretir
- `dist/Pusula.html` — tüm CSS/JS'si gömülü tek dosyalık sürüm (`tools/build_offline.py`)
- `site/` — GitHub Pages için yayına hazır web kopyası; `publish.sh` ile yayınlanır
- `tests/regression.js` — mobil giriş, günlük not ve not kaydı regresyon testi (`node tests/regression.js`)
- `start.sh` / `Pusula.desktop` — masaüstü başlatıcı; `telefon.sh` — aynı Wi-Fi'de telefon erişimi
- Kalıcılık: `localStorage` anahtarı `pusula.ajanda.v1`
- Harici kütüphane yok; yalnızca isteğe bağlı Google Fonts bağlantısı var (erişilemezse sistem yazı tipleri kullanılır).

### Uygulama kısayolları

Uygulama simgesine uzun basıldığında/sağ tıklandığında **Yeni görev**, **Bugün**, **Günlük notum**, **Notlar** ve **Günlük not arşivi** seçenekleri doğrudan ilgili ekranı açar.
