/**
 * Subtask Breakdown Engine (100% Offline Rule-Based)
 * Specifically crafted for Indonesian SMA/SMK students.
 * Automatically decomposes daunting academic tasks into 3-4 bite-sized 15-25 min action steps.
 */

export interface GeneratedSubtask {
  title: string;
  orderIdx: number;
}

export function autoGenerateSubtasks(taskTitle: string, subjectName?: string): GeneratedSubtask[] {
  const lower = (taskTitle + ' ' + (subjectName || '')).toLowerCase();

  // 1. Math / Exact Sciences / Problem Sets
  if (
    lower.includes('soal') ||
    lower.includes('bab') ||
    lower.includes('latihan') ||
    lower.includes('hal') ||
    lower.includes('halaman') ||
    lower.includes('hitung') ||
    lower.includes('matematika') ||
    lower.includes('fisika') ||
    lower.includes('kimia')
  ) {
    return [
      { title: 'Pelajari rumus & contoh soal di catatan (15m)', orderIdx: 0 },
      { title: 'Kerjakan 3-5 nomor soal dasar / nomor ganjil (20m)', orderIdx: 1 },
      { title: 'Selesaikan soal lanjutan & periksa ketelitian hitungan (20m)', orderIdx: 2 },
      { title: 'Salin jawaban akhir ke buku tugas dengan rapi (10m)', orderIdx: 3 },
    ];
  }

  // 2. Papers / Reports / Essays
  if (
    lower.includes('makalah') ||
    lower.includes('laporan') ||
    lower.includes('praktikum') ||
    lower.includes('essay') ||
    lower.includes('karya') ||
    lower.includes('tulis') ||
    lower.includes('analisis')
  ) {
    return [
      { title: 'Cari referensi bacaan & buat kerangka outline (20m)', orderIdx: 0 },
      { title: 'Tulis bagian pendahuluan & teori dasar (25m)', orderIdx: 1 },
      { title: 'Uraikan isi pembahasan utama & kesimpulan (30m)', orderIdx: 2 },
      { title: 'Periksa format, kerapian, typo & daftar pustaka (15m)', orderIdx: 3 },
    ];
  }

  // 3. Reading / Memorization / Social Sciences / Languages
  if (
    lower.includes('baca') ||
    lower.includes('rangkum') ||
    lower.includes('resume') ||
    lower.includes('hapal') ||
    lower.includes('vocab') ||
    lower.includes('biologi') ||
    lower.includes('sejarah') ||
    lower.includes('geografi') ||
    lower.includes('ekonomi') ||
    lower.includes('inggris') ||
    lower.includes('indonesia')
  ) {
    return [
      { title: 'Membaca cepat (skimming) & tandai poin-poin kunci (15m)', orderIdx: 0 },
      { title: 'Tulis rangkuman poin penting dalam bentuk mind-map (20m)', orderIdx: 1 },
      { title: 'Uji daya ingat dengan menjawab kuis latihan sendiri (15m)', orderIdx: 2 },
    ];
  }

  // 4. Presentations / Group Projects
  if (
    lower.includes('presentasi') ||
    lower.includes('slide') ||
    lower.includes('ppt') ||
    lower.includes('kelompok')
  ) {
    return [
      { title: 'Tentukan poin utama materi & pembagian peran (20m)', orderIdx: 0 },
      { title: 'Buat 5-7 slide visual yang padat & mudah dipahami (30m)', orderIdx: 1 },
      { title: 'Latihan penyampaian materi & antisipasi pertanyaan (15m)', orderIdx: 2 },
    ];
  }

  // 5. Default General Study Task
  return [
    { title: 'Siapkan buku catatan, materi & ruang belajar kondusif (10m)', orderIdx: 0 },
    { title: 'Kerjakan inti tugas tahap awal secara fokus (25m)', orderIdx: 1 },
    { title: 'Tuntaskan bagian akhir tugas & evaluasi hasil (20m)', orderIdx: 2 },
  ];
}

