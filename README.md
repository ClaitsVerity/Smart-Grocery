# 🛒 Smart Grocery & Budget Safety Tracker (PWA)

Aplikasi web mobile (**Progressive Web App - PWA**) berarsitektur *mobile-first* bergaya aplikasi *native* smartphone yang dirancang khusus untuk seorang **siswa rantau / anak kos** saat belanja bulanan di supermarket sambil mendorong troli belanja.

---

## 📱 Standar Arsitektur & Antarmuka Mobile

1. **Format Layar Smartphone (Mobile-First)**:
   - Dibatasi secara presisi dengan `max-width: 430px` (ukuran smartphone modern seperti iPhone 14 Pro Max / Flagship Android).
   - Ditengahkan secara elegan (*centered*) saat dibuka pada browser desktop dengan bingkai *device mockup* dan latar belakang ambient glow.
   - Menggunakan unit viewport modern (`100dvh`) dan `viewport-fit=cover` untuk tampilan *edge-to-edge* tanpa celah.

2. **Floating Bottom Navigation Bar**:
   - Menu navigasi melayang di bagian bawah dengan ikon Lucide untuk 3 tab utama:
     - 🛍️ **Belanja**: Keranjang aktif, kartu *budget safety*, stepper kuantitas instan, filter & search.
     - 📜 **Riwayat**: Struk transaksi bulanan, arsip pembelanjaan, database patokan harga bulan lalu.
     - 🛡️ **Anggaran**: *Radial progress gauge*, slider *safety buffer* (dana darurat kasir), pengaturan limit.

3. **Ergonomi Sentuh Ramah Jempol (Thumb-Friendly)**:
   - Tombol aksi utama (CTA) berada di zona jangkauan jempol bawah (*thumb zone*).
   - Tombol stepper kuantitas (`+` / `-`) langsung di kartu barang untuk kemudahan menambah/mengurangi barang hanya dengan satu tangan sambil memegang gagang troli.
   - Checklist kotak centang untuk menandai barang yang sudah masuk troli fisik vs masih dicari di rak.
   - Tidak menggunakan tabel horizontal desktop yang melebar ke samping; seluruh daftar menggunakan *card-based vertical list* dengan *bottom sheet slide-up* yang intuitif.

4. **Dukungan Progressive Web App (PWA)**:
   - `manifest.json` lengkap dengan mode `standalone`, orientasi `portrait-primary`, tema `#059669`, dan ikon PNG/SVG.
   - `sw.js` (Service Worker) dengan *caching strategy* agar aplikasi tetap berjalan 100% cepat dan responsif saat berada di *basement* supermarket tanpa sinyal internet.
   - Dukungan *Add to Home Screen*.

---

## 📋 Pemenuhan Kebutuhan Fungsional (SRS Checklist)

| Kode SRS | Kebutuhan Fungsional | Status | Implementasi & File Teknis |
| :--- | :--- | :---: | :--- |
| **F-01** | **Pencatatan Item Belanja** | ✅ Selesai | Input nama produk (dengan *quick chips* sembako), kategori produk (*chips* warna-warni), satuan (`kg`, `liter`, `pcs`, `pack`, `botol`, `dus`), kuantitas, harga satuan, dan catatan. Didukung di [`js/cart.js`](file:///c:/ICT-Kelas12/P12-Smart-Grocery/js/cart.js) & [`index.html`](file:///c:/ICT-Kelas12/P12-Smart-Grocery/index.html). |
| **F-02** | **Perhitungan Kuantitas Otomatis** | ✅ Selesai | Perhitungan otomatis `subtotal = kuantitas * harga_satuan` secara *realtime*. Menggunakan stepper kuantitas langsung di kartu barang dengan pembaruan instan pada total keranjang dan *budget bar*. Diatur di [`js/cart.js`](file:///c:/ICT-Kelas12/P12-Smart-Grocery/js/cart.js). |
| **F-03** | **Kalkulator Diskon Bertingkat** | ✅ Selesai | Mendukung diskon tunggal (misal 20%), diskon bertingkat (misal **50% + 20%** atau **30% + 10%**), dan potongan tunai langsung. Perhitungan bertingkat dihitung **secara berurutan** terhadap harga setelah diskon sebelumnya: <br>`Tahap 1 = Harga * (1 - D1%)`<br>`Tahap 2 = Tahap 1 * (1 - D2%)`<br>Bukan sekadar penjumlahan naif! Disertai rincian penghematan di [`js/discount.js`](file:///c:/ICT-Kelas12/P12-Smart-Grocery/js/discount.js). |
| **F-04** | **Komparator Harga Realtime** | ✅ Selesai | Membandingkan harga yang diinput dengan database bulan sebelumnya: <br>🔴 **Panah Merah ke Atas (↑)** jika harga naik (misal: *Naik Rp 2.500 (+3.6%)*).<br>🟢 **Panah Hijau ke Bawah (↓)** jika harga turun (misal: *Turun Rp 2.000 (-5.3%)*).<br>⚪ **Tanda Sama Dengan (=)** jika harga stabil/sama.<br>🔵 **Badge Item Baru (+)** jika belum ada data bulan lalu. Diatur di [`js/comparator.js`](file:///c:/ICT-Kelas12/P12-Smart-Grocery/js/comparator.js). |
| **F-05** | **Pengendali Anggaran (Budget Safety)** | ✅ Selesai | Input limit batas maksimal uang. Total keranjang terus dipantau secara *realtime* dengan indikator 3 tahap visual: <br>• **Aman (Hijau)**: < 75% budget.<br>• **Waspada (Kuning/Oranye)**: 75% - 90% budget.<br>• **Bahaya / Over Budget (Merah)**: > 90% atau melampaui limit, disertai banner peringatan dan getaran haptic. Termasuk fitur *Safety Buffer* cadangan kasir. Diatur di [`js/budget.js`](file:///c:/ICT-Kelas12/P12-Smart-Grocery/js/budget.js). |
| **F-06** | **Riwayat & Database Belanja** | ✅ Selesai | Penyimpanan data lokal terstruktur menggunakan `localStorage` dan tersinkronisasi realtime dengan **Firebase Cloud Firestore**. Fitur **"Selesaikan Belanja"** menyimpan struk ke tab Riwayat dan **otomatis memperbarui database harga patokan** barang untuk perbandingan transaksi bulan berikutnya. Dilengkapi fitur *Backup JSON*, *Repeat Order*, dan *Cloud Sync* di [`js/history.js`](file:///c:/ICT-Kelas12/P12-Smart-Grocery/js/history.js) & [`js/firebase-config.js`](file:///c:/ICT-Kelas12/P12-Smart-Grocery/js/firebase-config.js). |

---

## 🔥 Integrasi Firebase SDK & Cloud Firestore Database

Aplikasi telah terintegrasi penuh dengan **Firebase Modular JavaScript SDK v11 / v13** dan database realtime **Cloud Firestore**:

- **Project ID**: `smart-brocery`
- **Konfigurasi SDK**: Tersedia dalam mode `npm install firebase` dan browser native via `<script type="importmap">` + `<script type="module" src="./js/firebase-config.js">`.
- **Koleksi Database Firestore**:
  1. `cart_items`: Menyimpan item troli belanja aktif (nama, kuantitas, harga, diskon, status troli).
  2. `settings/budget`: Menyimpan limit anggaran bulanan, persentase *safety buffer*, dan nama periode belanja.
  3. `price_history`: Database patokan harga bulan lalu untuk komparator harga otomatis (F-04).
  4. `transactions`: Arsip struk pembelanjaan setiap kali pengguna menyelesaikan belanja (F-06).
- **Fitur Sinkronisasi Realtime**:
  - Menggunakan `onSnapshot` Firestore sehingga perubahan data di satu perangkat atau langsung di Firebase Console akan langsung ter-update di aplikasi tanpa perlu *refresh*.
  - Dilengkapi *badge status* indikator di status bar (`Cloud Synced` / `Offline`) dan kartu kontrol sinkronisasi manual di Tab Riwayat.
  - Tetap mendukung mode offline penuh (*offline caching* PWA + `localStorage`) saat berada di *basement* supermarket tanpa sinyal.

---

## 🛠️ Struktur Proyek

```text
c:\ICT-Kelas12\P12-Smart-Grocery\
│
├── index.html            # Shell aplikasi web mobile PWA dengan viewport smartphone & Firebase importmap
├── manifest.json         # Konfigurasi PWA standalone & shortcuts
├── sw.js                 # Service worker untuk offline caching
├── server.js             # Server HTTP lokal zero-dependency
├── package.json          # Konfigurasi dependensi npm (Firebase SDK)
├── README.md             # Dokumentasi teknis proyek
│
├── css/
│   └── style.css         # Styling mobile-first, glassmorphism, responsive 430px
│
├── js/
│   ├── firebase-config.js# Inisialisasi Firebase SDK & integrasi Cloud Firestore
│   ├── data.js           # Database awal, kategori, satuan, & handler sync data
│   ├── discount.js       # Engine kalkulator diskon bertingkat (F-03)
│   ├── comparator.js     # Engine komparator harga bulan lalu ↑, ↓, = (F-04)
│   ├── budget.js         # Engine budget safety controller (F-05)
│   ├── cart.js           # State keranjang belanja & kuantitas stepper (F-01, F-02)
│   ├── history.js        # Log transaksi & updater database harga (F-06)
│   └── app.js            # Controller utama, bottom sheet, tab routing, & haptic
│
└── icons/
    ├── icon.svg          # Ikon vektor resolusi tinggi
    ├── icon-192.png      # Ikon PWA 192x192
    └── icon-512.png      # Ikon PWA 512x512
```

---

## 🚀 Live Demo & Cara Menjalankan Aplikasi

### 🌐 Akses Live di Internet:
Aplikasi sudah ter-deploy langsung di Firebase Hosting:
👉 **[https://gro-pilot.web.app](https://gro-pilot.web.app)** (atau `https://gro-pilot.firebaseapp.com`)

### 💻 Jalankan di Server Lokal:
```bash
# Jalankan server lokal
node server.js
```

Buka URL berikut pada browser Google Chrome / Safari / Edge di komputer atau smartphone Anda:
```
http://localhost:8080/
```

> **Tips Uji PWA**:
> Buka Google Chrome DevTools (`F12`), aktifkan **Device Toolbar** (`Ctrl + Shift + M`), dan pilih profil smartphone (misal *iPhone 14 Pro Max* atau *Samsung Galaxy S20*). Anda juga dapat membuka menu *Application* > *Manifest* & *Service Workers* untuk menguji pemasangan PWA.
