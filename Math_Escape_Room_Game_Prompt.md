# PROMPT — Math Escape Room: Edukasi Matematika Dasar

## 1. ROLE

Kamu adalah **full-stack game developer profesional**, game designer, UI/UX designer, dan educational game designer. Buat sebuah game edukasi **2D Top-Down Escape Room** yang interaktif, menarik, responsif, dan dapat dimainkan langsung di browser.

Prioritaskan:
- gameplay yang jelas dan menyenangkan;
- kontrol yang responsif;
- UI yang mudah dipahami;
- soal matematika yang sesuai tingkat kesulitan;
- sistem progres dan level yang berfungsi dengan benar;
- kode yang terstruktur, modular, dan mudah dikembangkan.

---

# 2. KONSEP GAME

Buat game edukasi bertema **Escape Room**.

Player berada di dalam sebuah ruangan yang terkunci. Di dalam ruangan terdapat **5 soal matematika** yang tersebar di beberapa lokasi.

Untuk dapat keluar:

1. Player harus menjelajahi ruangan.
2. Player menemukan dan mengerjakan 5 soal matematika.
3. Setiap soal yang dijawab **benar** memberikan **1 angka hint**.
4. Semua angka hint otomatis ditampilkan dan disimpan pada bagian atas layar.
5. Urutan angka hint **tidak berdasarkan urutan soal dikerjakan**.
6. Setiap soal memiliki **nomor soal (1–5)**.
7. Urutan hint mengikuti **nomor soal**.
8. Setelah kelima soal selesai, player harus menuju pintu.
9. Player harus menyusun/memasukkan angka hint sesuai urutan nomor soal untuk membuka pintu.
10. Jika kode benar, pintu terbuka dan level selesai.
11. Player kemudian kembali ke menu pemilihan level untuk membuka level berikutnya.

Contoh:

- Player mengerjakan Soal 3 → mendapatkan hint `7`
- Player mengerjakan Soal 1 → mendapatkan hint `4`
- Player mengerjakan Soal 5 → mendapatkan hint `2`
- Player mengerjakan Soal 2 → mendapatkan hint `9`
- Player mengerjakan Soal 4 → mendapatkan hint `6`

Maka kode pintu harus otomatis disusun berdasarkan nomor soal:

`4 - 9 - 7 - 6 - 2`

Bukan berdasarkan urutan player mengerjakan soal:

`7 - 4 - 2 - 9 - 6`

---

# 3. GENRE & VISUAL

## Genre
- Educational
- Puzzle
- Escape Room
- Top-Down Adventure

## Perspektif
Gunakan **2D Top-Down View**.

Player dapat melihat ruangan dari atas dan bergerak ke berbagai area di dalamnya.

## Tema Ruangan

Gunakan ruangan yang terasa seperti tempat nyata, bukan dungeon fantasi.

Setiap level harus memiliki ruangan berbeda:

| Level | Ruangan | Tema |
|---|---|---|
| 1 | Kamar Tidur | Bedroom |
| 2 | Ruang Tamu | Living Room |
| 3 | Kantor | Office |
| 4 | Perpustakaan | Library |
| 5 | Ruang Kelas | Classroom |

Setiap ruangan harus memiliki furniture dan dekorasi yang sesuai.

Contoh:
- Kamar: tempat tidur, meja belajar, lemari, lampu, karpet.
- Ruang tamu: sofa, meja, TV, rak, tanaman.
- Kantor: meja kerja, komputer, kursi, lemari arsip.
- Perpustakaan: rak buku, meja baca, kursi, lampu.
- Kelas: papan tulis, meja siswa, kursi, meja guru.

Pastikan setiap level terasa berbeda secara visual.

---

# 4. PLAYER & KONTROL

Buat karakter 2D sederhana yang terlihat jelas dari perspektif top-down.

Gunakan kontrol:

- `W` / `Arrow Up` → bergerak ke atas
- `A` / `Arrow Left` → bergerak ke kiri
- `S` / `Arrow Down` → bergerak ke bawah
- `D` / `Arrow Right` → bergerak ke kanan

Tambahkan collision agar player tidak dapat menembus:
- dinding;
- furniture;
- objek dekorasi;
- benda lain yang seharusnya menjadi penghalang.

Jika memungkinkan, dukung juga kontrol touch/mobile sederhana.

---

# 5. SISTEM SOAL

Setiap level memiliki tepat:

**5 soal matematika.**

Soal harus berkaitan dengan **matematika dasar**, hanya menggunakan:

- Penjumlahan `+`
- Pengurangan `-`
- Perkalian `*`
- Pembagian `/`

Jangan menggunakan:
- persamaan kompleks;
- akar;
- pangkat;
- trigonometri;
- pecahan rumit;
- aljabar tingkat lanjut;
- kalkulus.

## Tingkat Kesulitan

### Level 1 — Easy
Gunakan operasi sederhana dengan angka kecil.

Contoh:
- `7 + 5 = ?`
- `15 - 8 = ?`
- `4 × 3 = ?`

### Level 2 — Easy+
Gunakan angka sedikit lebih besar dan kombinasi operasi sederhana.

### Level 3 — Medium
Mulai gunakan soal dengan dua operasi.

Contoh:
- `8 + 4 × 2 = ?`
- `30 - 6 × 3 = ?`

Tetap pastikan soal dapat diselesaikan oleh pelajar dengan matematika dasar.

### Level 4 — Medium+
Gunakan angka yang lebih besar dan kombinasi operasi yang lebih menantang.

### Level 5 — Challenging
Gunakan kombinasi beberapa operasi dasar dengan angka yang masih masuk akal.

Tetap gunakan hanya `+`, `-`, `*`, `/`.

---

# 6. ATURAN HINT

Setiap soal memiliki:

- Nomor soal: `1–5`
- Pertanyaan
- Jawaban benar
- Satu angka hint

Contoh data:

```text
Soal 1 → Jawaban: 12 → Hint: 4
Soal 2 → Jawaban: 15 → Hint: 8
Soal 3 → Jawaban: 9  → Hint: 2
Soal 4 → Jawaban: 20 → Hint: 7
Soal 5 → Jawaban: 6  → Hint: 1
```

Kode pintu:

`4 8 2 7 1`

## PENTING

Hint harus selalu dikaitkan dengan **nomor soal**, bukan urutan penyelesaian.

Jika player menyelesaikan:
`3 → 5 → 1 → 4 → 2`

maka sistem tetap menyusun kode:
`Hint Soal 1 → Hint Soal 2 → Hint Soal 3 → Hint Soal 4 → Hint Soal 5`

---

# 7. UI HINT DI ATAS LAYAR

Di bagian atas layar, buat panel:

**HINT CODE**

Tampilkan 5 slot:

`[ ? ] [ ? ] [ ? ] [ ? ] [ ? ]`

Setiap soal yang berhasil dijawab:

- slot sesuai nomor soal berubah dari `?` menjadi angka;
- angka langsung tersimpan;
- slot diberi indikator bahwa soal sudah selesai.

Contoh setelah Soal 3 selesai:

`[ ? ] [ ? ] [ 7 ] [ ? ] [ ? ]`

Setelah Soal 1 selesai:

`[ 4 ] [ ? ] [ 7 ] [ ? ] [ ? ]`

Setelah semua selesai:

`[ 4 ] [ 9 ] [ 7 ] [ 6 ] [ 2 ]`

Jangan mengurutkan berdasarkan waktu player menyelesaikan soal.

---

# 8. INTERAKSI SOAL

Tempatkan 5 soal pada lokasi berbeda di dalam ruangan.

Setiap soal dapat direpresentasikan sebagai:
- meja;
- papan catatan;
- komputer;
- buku;
- papan tulis;
- dokumen;
- atau objek interaktif lain yang sesuai dengan tema ruangan.

Ketika player mendekati objek:

Tampilkan indikator:

**"Press E to interact"**

Saat player menekan `E`, buka panel soal.

Panel soal berisi:

- Nomor soal
- Pertanyaan
- Input jawaban
- Tombol Submit

Contoh:

```text
┌─────────────────────────────┐
│         SOAL #3             │
│                             │
│        12 + 8 = ?           │
│                             │
│     [ Input Jawaban ]       │
│                             │
│          [SUBMIT]           │
└─────────────────────────────┘
```

---

# 9. SISTEM JAWABAN

Jika jawaban benar:

- tampilkan feedback positif;
- berikan angka hint;
- simpan hint berdasarkan nomor soal;
- update panel hint di bagian atas;
- tandai soal sebagai selesai;
- jangan biarkan soal yang sama memberikan hint berkali-kali.

Jika jawaban salah:

- tampilkan feedback bahwa jawaban belum benar;
- jangan berikan hint;
- player boleh mencoba lagi.

Jangan memberikan jawaban secara langsung setelah player salah.

---

# 10. PINTU & SISTEM KODE

Setiap level memiliki satu pintu keluar.

Pintu harus terlihat jelas di dalam ruangan.

Jika player mendekati pintu sebelum semua soal selesai:

Tampilkan pesan:

**"You haven't solved all the puzzles yet!"**

Jika semua soal selesai:

**"All hints collected! Enter the code to escape."**

Buka panel kode.

Panel harus menampilkan 5 slot angka.

Player harus memasukkan angka sesuai urutan:

**Soal 1 → Soal 2 → Soal 3 → Soal 4 → Soal 5**

Contoh:

```text
┌─────────────────────────────┐
│        ESCAPE CODE          │
│                             │
│      [ 4 ][ 9 ][ 7 ][ 6 ][ 2 ]│
│                             │
│       [ UNLOCK DOOR ]       │
└─────────────────────────────┘
```

Jika benar:
- tampilkan animasi pintu terbuka;
- tampilkan pesan kemenangan;
- lanjutkan ke layar Level Complete.

Jika salah:
- tampilkan feedback;
- kode dapat dicoba kembali.

---

# 11. LEVEL SYSTEM

Buat **5 level**.

Setiap level:
- memiliki ruangan berbeda;
- memiliki layout berbeda;
- memiliki 5 soal;
- memiliki 5 hint;
- memiliki kode pintu berbeda;
- memiliki tingkat kesulitan yang meningkat.

## Level 1
**Bedroom Escape**
- Ruangan: kamar tidur
- Kesulitan: mudah

## Level 2
**Living Room Escape**
- Ruangan: ruang tamu
- Kesulitan: mudah+

## Level 3
**Office Escape**
- Ruangan: kantor
- Kesulitan: sedang

## Level 4
**Library Escape**
- Ruangan: perpustakaan
- Kesulitan: sedang+

## Level 5
**Classroom Escape**
- Ruangan: ruang kelas
- Kesulitan: menantang

---

# 12. LEVEL SELECTION MENU

Setelah game dibuka, tampilkan:

## MAIN MENU

```text
MATH ESCAPE ROOM

[ PLAY ]
[ LEVELS ]
[ HOW TO PLAY ]
```

Buat juga menu pemilihan level:

```text
SELECT LEVEL

[ LEVEL 1 ]
[ LEVEL 2 🔒 ]
[ LEVEL 3 🔒 ]
[ LEVEL 4 🔒 ]
[ LEVEL 5 🔒 ]

[ BACK ]
```

### Unlock System

Awalnya:
- Level 1 → unlocked
- Level 2–5 → locked

Setelah menyelesaikan Level 1:
- Level 2 terbuka

Setelah menyelesaikan Level 2:
- Level 3 terbuka

Dan seterusnya.

Level yang sudah pernah diselesaikan tetap terbuka.

Jika memungkinkan, simpan progres menggunakan `localStorage` sehingga progress tidak hilang ketika browser di-refresh.

---

# 13. HOW TO PLAY

Buat halaman **How to Play** yang menjelaskan:

1. Jelajahi ruangan.
2. Cari 5 puzzle matematika.
3. Dekati puzzle dan tekan `E`.
4. Jawab soal matematika.
5. Jawaban benar memberikan 1 angka hint.
6. Hint akan muncul di bagian atas layar.
7. Perhatikan nomor soal karena menentukan urutan kode.
8. Setelah semua soal selesai, pergi ke pintu.
9. Masukkan kode sesuai urutan Soal 1 → 5.
10. Buka pintu dan lanjutkan ke level berikutnya.

---

# 14. LEVEL COMPLETE SCREEN

Setelah pintu berhasil dibuka:

```text
╔══════════════════════════╗
       LEVEL COMPLETE!
╚══════════════════════════╝

You escaped the room!

Code:
4 - 9 - 7 - 6 - 2

[ NEXT LEVEL ]
[ LEVEL SELECT ]
[ MAIN MENU ]
```

Jika player menyelesaikan Level 5:

```text
╔══════════════════════════╗
       CONGRATULATIONS!
╚══════════════════════════╝

You escaped all 5 rooms!

[ PLAY AGAIN ]
[ LEVEL SELECT ]
[ MAIN MENU ]
```

---

# 15. GAME FEEL & ANIMATION

Tambahkan animasi sederhana agar game terasa hidup:

- player movement animation;
- objek interaktif memiliki indikator;
- panel soal muncul dengan smooth transition;
- feedback benar/salah;
- hint muncul dengan animasi;
- pintu memiliki animasi membuka;
- level complete memiliki animasi sederhana.

Tambahkan sound effect sederhana jika memungkinkan:
- interaction;
- correct answer;
- wrong answer;
- hint unlocked;
- door unlock;
- level complete.

Jangan membuat audio terlalu keras atau mengganggu.

---

# 16. RESPONSIVE DESIGN

Game harus dapat dimainkan pada:
- desktop;
- laptop;
- tablet;
- mobile browser jika memungkinkan.

Untuk desktop gunakan keyboard.

Untuk mobile, jika memungkinkan tambahkan virtual D-pad.

UI harus tetap terbaca pada layar kecil.

---

# 17. GAME STATE

Pastikan game memiliki state yang jelas, misalnya:

```text
MAIN_MENU
LEVEL_SELECT
HOW_TO_PLAY
PLAYING
QUESTION_MODAL
DOOR_CODE
LEVEL_COMPLETE
GAME_COMPLETE
```

Pastikan perpindahan antar-state tidak menyebabkan bug.

Saat membuka modal soal:
- player tidak dapat bergerak.

Saat membuka panel kode:
- player tidak dapat bergerak.

Saat kembali ke gameplay:
- kontrol player aktif kembali.

---

# 18. DATA STRUCTURE

Gunakan struktur data yang jelas untuk level.

Contoh:

```javascript
{
  id: 1,
  name: "Bedroom Escape",
  difficulty: "Easy",
  room: "bedroom",
  puzzles: [
    {
      id: 1,
      question: "7 + 5 = ?",
      answer: 12,
      hint: 4
    },
    {
      id: 2,
      question: "15 - 8 = ?",
      answer: 7,
      hint: 9
    }
  ]
}
```

Gunakan sistem yang scalable sehingga menambah level baru tidak membutuhkan perubahan besar pada kode utama.

---

# 19. VALIDASI PENTING

Pastikan:

- setiap level memiliki tepat 5 soal;
- setiap soal memiliki nomor unik 1–5;
- setiap soal memiliki satu hint angka;
- semua hint berupa angka yang jelas;
- kode pintu dibuat otomatis berdasarkan ID soal;
- urutan pengerjaan soal tidak memengaruhi urutan kode;
- satu soal tidak dapat memberikan hint dua kali;
- pintu tidak dapat dibuka sebelum semua soal selesai;
- level berikutnya tidak dapat dimainkan sebelum level sebelumnya selesai;
- progress level tersimpan;
- soal Level 1 lebih mudah daripada Level 5;
- semua soal hanya menggunakan `+`, `-`, `*`, `/`.

---

# 20. ACCESSIBILITY & USABILITY

Gunakan:
- teks yang cukup besar;
- kontras UI yang jelas;
- tombol yang mudah diklik;
- feedback visual yang jelas;
- jangan mengandalkan warna saja untuk menunjukkan status;
- gunakan ikon/teks tambahan untuk status benar, salah, selesai, dan terkunci.

---

# 21. TEKNIS IMPLEMENTASI

Jika membuat game menggunakan HTML/CSS/JavaScript:

Gunakan struktur:

```text
index.html
style.css
script.js
```

Jika membutuhkan file tambahan, buat struktur yang tetap sederhana dan jelaskan fungsinya.

Gunakan JavaScript untuk:
- player movement;
- collision;
- puzzle interaction;
- question system;
- hint system;
- door code;
- level system;
- localStorage;
- UI state.

Jangan menggunakan backend/database jika tidak diperlukan.

Game harus dapat dijalankan secara lokal dengan mudah.

---

# 22. KUALITAS KODE

Kode harus:
- bersih;
- modular;
- mudah dibaca;
- memiliki komentar pada bagian penting;
- tidak memiliki fungsi yang tidak digunakan;
- tidak memiliki error JavaScript;
- tidak menggunakan placeholder yang membuat game tidak dapat dimainkan;
- tidak membuat fitur hanya berupa tampilan palsu.

Semua tombol harus benar-benar berfungsi.

Semua level harus benar-benar dapat dimainkan.

---

# 23. OUTPUT YANG DIHARAPKAN

Buat game yang **langsung playable**, bukan sekadar mockup.

Prioritas utama:

1. Gameplay Escape Room benar-benar berfungsi.
2. Player dapat bergerak dalam perspektif top-down.
3. Player dapat menemukan 5 soal.
4. Soal matematika dapat dijawab.
5. Hint tersimpan berdasarkan nomor soal.
6. Hint ditampilkan di bagian atas layar.
7. Kode pintu tersusun berdasarkan nomor soal.
8. Pintu hanya dapat dibuka setelah semua soal selesai.
9. Terdapat 5 level dengan ruangan berbeda.
10. Kesulitan matematika meningkat secara bertahap.
11. Terdapat level selection.
12. Progress level tersimpan.
13. UI menarik dan bertema Escape Room.
14. Game responsif dan nyaman dimainkan.

---

# 24. ATURAN KHUSUS UNTUK AI

Jangan hanya menjelaskan bagaimana cara membuat game.

**Bangun implementasinya.**

Jika environment Google AI Studio memungkinkan pembuatan dan preview aplikasi secara langsung, implementasikan game sampai dapat dimainkan.

Jika terdapat keterbatasan teknis, pilih solusi paling sederhana yang tetap menghasilkan gameplay nyata.

Jangan mengurangi fitur utama berikut:

**2D Top-Down + 5 Level + 5 Soal per Level + Hint berdasarkan nomor soal + Door Code + Level Selection.**

Pastikan seluruh sistem terintegrasi dan dapat dimainkan dari awal sampai selesai.
