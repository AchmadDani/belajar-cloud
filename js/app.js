/**
 * CloudStudy: Interactive Engine for Distributed Systems & Cloud Computing
 * Handles Tabs, Accordions, Flashcards, and Quiz Functionality for Pekan 1 - 7
 */

document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  initAccordions();
  initFlashcards();
  initTocObserver();
  initPekan1Quiz();
  initPekan2Quiz();
  initPekan3Quiz();
  initPekan4Quiz();
  initPekan5Quiz();
  initPekan6Quiz();
  initPekan7Quiz();
  initKisiQuiz();
  initFullExam();
});

/* ==========================================================================
   1. Interactive Tabs
   ========================================================================== */
function initTabs() {
  const tabButtons = document.querySelectorAll('.tab-btn');
  if (!tabButtons.length) return;

  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const parentNav = button.closest('.tabs-nav');
      const targetGroup = button.getAttribute('data-tab-group') || 'default';
      const targetId = button.getAttribute('data-tab-target');

      parentNav.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');

      const contentContainer = parentNav.parentElement;
      const contents = contentContainer.querySelectorAll(`.tab-content[data-tab-group="${targetGroup}"]`);
      contents.forEach(content => {
        if (content.id === targetId) {
          content.classList.add('active');
        } else {
          content.classList.remove('active');
        }
      });
    });
  });
}

/* ==========================================================================
   2. Accordions (Expandable Deep Dives)
   ========================================================================== */
function initAccordions() {
  const accordionHeaders = document.querySelectorAll('.accordion-header');
  if (!accordionHeaders.length) return;

  accordionHeaders.forEach(header => {
    header.addEventListener('click', () => {
      const item = header.closest('.accordion-item');
      const isOpen = item.classList.contains('open');

      if (isOpen) {
        item.classList.remove('open');
        header.setAttribute('aria-expanded', 'false');
      } else {
        item.classList.add('open');
        header.setAttribute('aria-expanded', 'true');
      }
    });
  });
}

/* ==========================================================================
   3. Interactive Flashcards (Click to Reveal Concept)
   ========================================================================== */
function initFlashcards() {
  const flashcards = document.querySelectorAll('.flashcard');
  if (!flashcards.length) return;

  flashcards.forEach(card => {
    card.addEventListener('click', () => {
      card.classList.toggle('revealed');
      const tip = card.querySelector('.flashcard-tip');
      if (tip) {
        if (card.classList.contains('revealed')) {
          tip.textContent = 'Klik untuk sembunyikan penjelasan';
        } else {
          tip.textContent = 'Klik untuk melihat jawaban & kata kunci';
        }
      }
    });
  });
}

/* ==========================================================================
   4. Table of Contents Observer (Sticky Navigation Highlight)
   ========================================================================== */
function initTocObserver() {
  const tocLinks = document.querySelectorAll('.toc-link');
  const sections = document.querySelectorAll('.content-section');
  if (!tocLinks.length || !sections.length) return;

  const observerOptions = {
    root: null,
    rootMargin: '-80px 0px -60% 0px',
    threshold: 0
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        tocLinks.forEach(link => {
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    });
  }, observerOptions);

  sections.forEach(section => observer.observe(section));
}

/* ==========================================================================
   Generic Quiz Runner Builder
   ========================================================================== */
function runQuiz(containerId, quizData, moduleLabel) {
  const quizBox = document.getElementById(containerId);
  if (!quizBox) return;

  let currentQuestionIndex = 0;
  let score = 0;
  let answered = false;

  renderQuestion();

  function renderQuestion() {
    answered = false;
    const data = quizData[currentQuestionIndex];
    const total = quizData.length;

    quizBox.innerHTML = `
      <div class="quiz-header">
        <span class="quiz-step">Soal ${currentQuestionIndex + 1} dari ${total}</span>
        <span class="quiz-score-live">Skor Saat Ini: ${score}/${total}</span>
      </div>
      <h3 class="quiz-question-text">${data.question}</h3>
      <div class="quiz-options">
        ${data.options.map((opt, idx) => `
          <button class="quiz-opt-btn" data-index="${idx}">
            <span class="opt-letter">${String.fromCharCode(65 + idx)}</span>
            <span>${opt}</span>
          </button>
        `).join('')}
      </div>
      <div class="quiz-feedback" id="${containerId}-feedback-box"></div>
      <div class="quiz-actions" style="display: none;" id="${containerId}-action-bar">
        <span></span>
        <button class="btn-primary" id="${containerId}-btn-next">
          ${currentQuestionIndex === total - 1 ? 'Lihat Hasil Akhir' : 'Soal Berikutnya'}
        </button>
      </div>
    `;

    const optionButtons = quizBox.querySelectorAll('.quiz-opt-btn');
    const feedbackBox = quizBox.querySelector(`#${containerId}-feedback-box`);
    const actionBar = quizBox.querySelector(`#${containerId}-action-bar`);
    const nextBtn = quizBox.querySelector(`#${containerId}-btn-next`);

    optionButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        if (answered) return;
        answered = true;

        const selectedIndex = parseInt(btn.getAttribute('data-index'), 10);
        const isCorrect = selectedIndex === data.correct;

        optionButtons.forEach(b => b.disabled = true);

        if (isCorrect) {
          score++;
          btn.classList.add('correct');
          feedbackBox.className = 'quiz-feedback show success';
          feedbackBox.innerHTML = `<strong>Jawaban Anda Benar!</strong><p style="margin-top: 6px;">${data.explanation}</p>`;
        } else {
          btn.classList.add('incorrect');
          optionButtons[data.correct].classList.add('correct');
          feedbackBox.className = 'quiz-feedback show error';
          feedbackBox.innerHTML = `<strong>Jawaban Belum Tepat.</strong><p style="margin-top: 6px;">Jawaban yang benar adalah pilihan <strong>${String.fromCharCode(65 + data.correct)}</strong>.</p><p style="margin-top: 6px;">${data.explanation}</p>`;
        }

        actionBar.style.display = 'flex';
      });
    });

    nextBtn.addEventListener('click', () => {
      currentQuestionIndex++;
      if (currentQuestionIndex < total) {
        renderQuestion();
      } else {
        renderQuizResult();
      }
    });
  }

  function renderQuizResult() {
    const total = quizData.length;
    const percentage = Math.round((score / total) * 100);

    let message = "";
    if (percentage === 100) {
      message = `Luar biasa! Pemahaman Anda pada materi ${moduleLabel} sudah sangat matang untuk UTS.`;
    } else if (percentage >= 60) {
      message = `Bagus! Anda sudah menguasai sebagian besar konsep kunci. Silakan tinjau kembali poin-poin komparasi pada cheat sheet di atas.`;
    } else {
      message = `Perlu sedikit review lagi pada konsep utama sebelum menghadapi ujian.`;
    }

    quizBox.innerHTML = `
      <div class="quiz-result-card">
        <div class="quiz-step" style="margin-bottom: 12px;">Hasil Latihan Mandiri ${moduleLabel}</div>
        <div class="quiz-result-score">${percentage}%</div>
        <p style="font-weight: 600; color: var(--text-main); margin-bottom: 8px;">Skor Anda: ${score} dari ${total} benar</p>
        <p class="quiz-result-msg">${message}</p>
        <button class="btn-primary" id="${containerId}-btn-restart">Ulangi Kuis ${moduleLabel}</button>
      </div>
    `;

    quizBox.querySelector(`#${containerId}-btn-restart`).addEventListener('click', () => {
      currentQuestionIndex = 0;
      score = 0;
      renderQuestion();
    });
  }
}

/* ==========================================================================
   Quiz Datasets: Pekan 1 - 7
   ========================================================================== */
const pekan1QuizData = [
  {
    question: "Apa perbedaan fundamental antara Decentralized System dan Distributed System?",
    options: [
      "Decentralized tidak menggunakan jaringan komputer, sedangkan Distributed selalu memakai internet global.",
      "Decentralized hanya mengharuskan proses tersebar di beberapa mesin, sedangkan Distributed tersebar memadai sehingga membentuk satu kesatuan sistem utuh bagi pengguna.",
      "Decentralized memiliki master controller tunggal, sedangkan Distributed sama sekali tidak memiliki server.",
      "Decentralized adalah sistem lama, sedangkan Distributed adalah nama resmi cloud computing."
    ],
    correct: 1,
    explanation: "Tepat sekali. Sistem terdesentralisasi hanya mensyaratkan proses/resource tersebar di beberapa komputer. Sementara sistem terdistribusi mensyaratkan sebaran tersebut dikelola sedemikian rupa sehingga pengguna melihatnya sebagai satu kesatuan sistem (single coherent system)."
  },
  {
    question: "Manakah jenis transparansi distribusi yang menyembunyikan perpindahan resource ke server lain saat resource tersebut sedang aktif digunakan?",
    options: [
      "Access Transparency",
      "Migration Transparency",
      "Relocation Transparency",
      "Replication Transparency"
    ],
    correct: 2,
    explanation: "Benar. Migration Transparency menyembunyikan perpindahan resource secara umum. Namun ketika perpindahan terjadi saat resource SEDANG DIGUNAKAN oleh klien, itu adalah Relocation Transparency."
  },
  {
    question: "Dalam konsep Dependability, manakah urutan rantai anomali yang benar dari penyebab hingga kegagalan?",
    options: [
      "Error -> Fault -> Failure",
      "Failure -> Error -> Fault",
      "Fault -> Error -> Failure",
      "Fault -> Failure -> Error"
    ],
    correct: 2,
    explanation: "Tepat. Rantai anomali adalah Fault -> Error -> Failure. Fault adalah akar penyebab (misal bug kode programmer), menghasilkan Error (kondisi internal abnormal pada memori/state), yang jika tidak tertangani berujung pada Failure (layanan gagal memenuhi fungsinya)."
  },
  {
    question: "Mengapa Cluster Computing berbeda dengan Grid Computing dalam klasifikasi High-Performance Distributed Computing?",
    options: [
      "Cluster bersifat homogen pada jaringan LAN dan dikelola terikat erat, sedangkan Grid bersifat heterogen, lintas organisasi, dan berbasis WAN.",
      "Cluster hanya untuk penyimpanan file, sedangkan Grid hanya untuk pengolahan grafik komputer.",
      "Cluster tidak mendukung multiprocessor, sedangkan Grid membutuhkan superkomputer tunggal.",
      "Cluster menggunakan komunikasi asinkron murni, sedangkan Grid hanya menggunakan RPC."
    ],
    correct: 0,
    explanation: "Tepat sekali. Cluster terdiri dari mesin-mesin yang homogen (OS & hardware serupa) di jaringan LAN dengan satu otoritas manajemen. Grid menggabungkan node heterogen dari berbagai organisasi di jaringan geografis luas (WAN) melalui konsep Virtual Organization."
  },
  {
    question: "Manakah di bawah ini yang BUKAN merupakan salah satu dari 8 False Assumptions (Pitfalls) pengembangan sistem terdistribusi?",
    options: [
      "The network is secure (Jaringan selalu aman).",
      "Bandwidth is infinite (Bandwidth tidak terbatas).",
      "Middleware is always free (Middleware selalu bebas lisensi).",
      "Latency is zero (Latensi adalah nol)."
    ],
    correct: 2,
    explanation: "Benar. 'Middleware is always free' bukan bagian dari 8 False Assumptions klasik. Delapan asumsi keliru tersebut adalah: Network reliable, secure, homogeneous, topology doesn't change, latency zero, bandwidth infinite, transport cost zero, dan one administrator."
  }
];

const pekan2QuizData = [
  {
    question: "Pada model koordinasi Temporal dan Referential Coupling, model komunikasi manakah yang bersifat Decoupled in Time sekaligus Decoupled in Space?",
    options: [
      "Direct Communication",
      "Mailbox Communication",
      "Event-Based Communication",
      "Shared Data Space (contoh: Linda Tuple Space)"
    ],
    correct: 3,
    explanation: "Benar. Shared Data Space bersifat decoupled secara temporal (pengirim dan penerima tidak perlu aktif bersamaan) dan referential (pengirim tidak perlu tahu identitas/alamat penerima)."
  },
  {
    question: "Pada arsitektur Linda Tuple Space, apa perbedaan mendasar antara operasi in(t) dan rd(t)?",
    options: [
      "in(t) membaca tuple tanpa menghapusnya, sedangkan rd(t) menghapus tuple dari space.",
      "in(t) membaca sekaligus menghapus tuple dari space, sedangkan rd(t) hanya membaca salinan tuple tanpa menghapusnya.",
      "in(t) adalah operasi non-blocking, sedangkan rd(t) bersifat blocking.",
      "in(t) hanya untuk tipe data integer, sedangkan rd(t) untuk tipe data string."
    ],
    correct: 1,
    explanation: "Tepat. in(t) membaca dan mengambil (menghapus) tuple dari tuple space, sedangkan rd(t) mengambil salinannya saja tanpa menghapus tuple aslinya. Keduanya sama-sama bersifat blocking jika tuple yang dicari belum ada."
  },
  {
    question: "Mengapa pendekatan Broker lebih disukai daripada pendekatan 1-on-1 saat mengintegrasikan N aplikasi legacy melalui wrapper?",
    options: [
      "Karena broker tidak memerlukan koneksi jaringan sama sekali.",
      "Karena pendekatan 1-on-1 membutuhkan O(N²) wrapper sehingga sangat rumit dikelola, sedangkan broker hanya memerlukan O(N) wrapper (linear).",
      "Karena broker menghilangkan kebutuhan akan autentikasi dan keamanan.",
      "Karena pendekatan 1-on-1 hanya bisa digunakan pada protokol SOAP."
    ],
    correct: 1,
    explanation: "Tepat sekali. Pada pendekatan 1-on-1, setiap aplikasi butuh wrapper ke setiap aplikasi lain sehingga total wrapper adalah N * (N - 1) = O(N²). Pada Broker, setiap aplikasi hanya butuh wrapper ke broker, sehingga totalnya 2N = O(N)."
  },
  {
    question: "Dalam Structured P2P Chord Ring, bagaimana aturan penentuan node yang bertanggung jawab menyimpan data dengan key k?",
    options: [
      "Data disimpan pada node yang memiliki identifier tepat sama dengan k atau kelipatannya.",
      "Data disimpan pada node dengan identifier terbesar di dalam ring.",
      "Data disimpan pada node dengan identifier terkecil yang lebih besar atau sama dengan k (disebut successor dari key k).",
      "Data selalu dikirim ke super-peer terdekat."
    ],
    correct: 2,
    explanation: "Benar. Pada Chord, data dengan key k disimpan pada node dengan identifier terkecil yang memenuhi id >= k (disebut successor dari key k)."
  },
  {
    question: "Apa perbedaan pencarian data antara Flooding dan Random Walk pada Unstructured Peer-to-Peer Networks?",
    options: [
      "Flooding menyebarkan request ke seluruh tetangga sekaligus (cepat tapi boros pesan), sedangkan Random Walk meneruskan request ke satu tetangga acak bertahap (hemat pesan tapi bisa lebih lambat).",
      "Flooding menggunakan Distributed Hash Table, sedangkan Random Walk menggunakan central server tracker.",
      "Flooding hanya bisa dipakai di jaringan LAN, sedangkan Random Walk hanya untuk WAN.",
      "Flooding tidak membutuhkan Time-To-Live (TTL), sedangkan Random Walk selalu memiliki TTL = 1."
    ],
    correct: 0,
    explanation: "Tepat. Flooding meneruskan request pencarian ke banyak neighbor sekaligus sehingga menjangkau banyak node dengan cepat namun membebani bandwidth (butuh batas TTL). Sebaliknya, Random Walk hanya memilih 1 tetangga acak per langkah sehingga efisien komunikasi."
  }
];

const pekan3QuizData = [
  {
    question: "Apa perbedaan utama antara Thread Context Switching dan Process Context Switching?",
    options: [
      "Thread switching melibatkan pergantian register MMU dan tabel address space, sedangkan process switching tidak.",
      "Thread switching dapat dilakukan cepat di dalam address space bersama tanpa trap ke kernel, sedangkan process switching lebih berat karena melibatkan pergantian ruang memori dan instruksi trap ke OS.",
      "Thread switching hanya bisa dilakukan pada hardware single-core.",
      "Process switching tidak memerlukan penyimpanan program counter."
    ],
    correct: 1,
    explanation: "Tepat sekali. Semua thread dalam proses yang sama berbagi address space yang sama sehingga thread switching sangat ringan. Sebaliknya, process switching memerlukan pemindahan konteks MMU dan melibatkan kernel OS sehingga jauh lebih mahal."
  },
  {
    question: "Apa kelemahan mendasar dari User-Space Threads yang dikenal sebagai 'The Blocking Problem'?",
    options: [
      "User-space threads tidak bisa mengakses variabel global.",
      "Jika satu user thread melakukan blocking I/O system call, kernel menganggap seluruh proses terblokir sehingga thread-thread lain di dalamnya ikut berhenti.",
      "User-space threads membutuhkan memori fisik yang lebih besar daripada proses.",
      "User-space threads tidak mendukung komunikasi via socket."
    ],
    correct: 1,
    explanation: "Benar. Karena kernel OS tidak menyadari keberadaan thread-thread individual di user space, pemanggilan sistem yang memblokir oleh satu thread akan menyebabkan kernel menidurkan seluruh proses tersebut."
  },
  {
    question: "Menurut teorema Popek-Goldberg, syarat apa yang harus dipenuhi agar virtualisasi dapat dibangun secara efisien pada komputer konvensional?",
    options: [
      "Seluruh Privileged Instructions harus bisa dijalankan di User Mode.",
      "Seluruh Sensitive Instructions harus merupakan bagian dari Privileged Instructions (Sensitive Instructions ⊆ Privileged Instructions).",
      "Komputer harus memiliki minimal dua socket prosesor fisik.",
      "Host OS harus berbasis Linux dengan modul KVM."
    ],
    correct: 1,
    explanation: "Tepat. Teorema Popek-Goldberg mensyaratkan bahwa seluruh sensitive instructions (instruksi yang mengubah konfigurasi hardware) harus merupakan bagian dari privileged instructions (instruksi yang menyebabkan trap ke kernel jika dijalankan di user mode)."
  },
  {
    question: "Pada server cluster 3-tier, bagaimana mekanisme TCP Handoff membantu meningkatkan performa sistem?",
    options: [
      "TCP Handoff menghapus kebutuhan akan database di tier-3.",
      "TCP Handoff mengalihkan koneksi TCP langsung ke server pemroses di tier-2 sehingga respons dikirim langsung ke klien tanpa membebani switch tier-1.",
      "TCP Handoff mengubah protokol TCP menjadi UDP otomatis.",
      "TCP Handoff mengenkripsi data tanpa menggunakan CPU."
    ],
    correct: 1,
    explanation: "Benar. Dengan TCP Handoff, switch tier-1 hanya merutekan request masuk; koneksi lalu dialihkan sehingga server tier-2 langsung menjawab klien. Ini mencegah switch tier-1 menjadi bottleneck."
  },
  {
    question: "Apa perbedaan mendasar antara Weak Mobility dan Strong Mobility pada migrasi kode?",
    options: [
      "Weak mobility hanya memindahkan code dan data segment sehingga eksekusi dimulai dari awal, sedangkan Strong mobility memindahkan execution state sehingga eksekusi berlanjut tepat di titik jeda.",
      "Weak mobility membutuhkan jaringan fiber optic, sedangkan Strong mobility bisa lewat satelit.",
      "Weak mobility hanya untuk bahasa Java, sedangkan Strong mobility untuk bahasa C++.",
      "Weak mobility memindahkan hardware secara fisik, sedangkan Strong mobility memindahkan software."
    ],
    correct: 0,
    explanation: "Tepat. Weak mobility hanya memindahkan kode dan data (eksekusi di-reboot dari awal). Strong mobility memindahkan juga execution state (program counter, stack frame thread) sehingga proses dapat melanjutkan eksekusi secara mulus."
  }
];

const pekan4QuizData = [
  {
    question: "Apa karakteristik utama dari Persistent Asynchronous Communication?",
    options: [
      "Pesan dibuang jika penerima sedang offline, dan pengirim terblokir menunggu balasan.",
      "Pesan disimpan oleh middleware ke antrean persisten sampai berhasil diterima, sementara pengirim langsung melanjutkan pekerjaan tanpa menunggu respon.",
      "Pesan langsung dikirimkan ke hardware display pengguna secara real-time.",
      "Pesan hanya boleh berisi teks ASCII tanpa enkripsi."
    ],
    correct: 1,
    explanation: "Tepat. Persistent berarti pesan dijamin disimpan oleh sistem perantara (antrean buffer) sampai penerima mengambilnya. Asynchronous berarti pengirim tidak menunggu balasan dan bisa langsung melanjutkan eksekusinya."
  },
  {
    question: "Dalam Remote Procedure Call (RPC), apa tugas utama yang dijalankan oleh Client Stub?",
    options: [
      "Mengeksekusi logika fungsi komputasi secara lokal.",
      "Mengemas nama prosedur dan parameter menjadi paket pesan jaringan terstandarisasi (Marshaling) lalu mengirimkannya.",
      "Menggantikan fungsi router dan switch pada level fisik.",
      "Menyediakan antarmuka grafis bagi pengguna akhir."
    ],
    correct: 1,
    explanation: "Benar. Client Stub bertindak sebagai proxy lokal bagi fungsi server. Tugas utamanya mengemas nama prosedur dan parameter menjadi format biner jaringan (Marshaling) agar siap ditransmisikan."
  },
  {
    question: "Bagaimana cara kerja Asynchronous RPC dibandingkan RPC konvensional?",
    options: [
      "Klien tidak pernah menerima pesan apapun dari server.",
      "Klien hanya menunggu konfirmasi penerimaan pesan (ACK) dari server, lalu langsung melanjutkan pekerjaan lokal tanpa menunggu hasil komputasi fungsi selesai.",
      "Klien memproses RPC menggunakan protokol UDP murni tanpa port.",
      "Klien mengirimkan kode sumber fungsi ke server untuk dikompilasi ulang."
    ],
    correct: 1,
    explanation: "Tepat sekali. Pada Asynchronous RPC, klien hanya terblokir sampai server mengirimkan Acknowledgment (ACK) bahwa permintaan telah diterima, kemudian klien bebas melanjutkan tugasnya."
  },
  {
    question: "Apa peran utama Message Broker dalam sistem Message-Oriented Middleware (MOM)?",
    options: [
      "Menghapus pesan yang sudah berumur lebih dari 10 detik.",
      "Menjembatani heterogenitas antaraplikasi dengan mentransformasikan skema dan format pesan sehingga aplikasi berbeda teknologi dapat berkomunikasi.",
      "Menyediakan koneksi Bluetooth antarnode.",
      "Mengatur alokasi register prosesor fisik."
    ],
    correct: 1,
    explanation: "Benar. Message Broker memiliki aturan transformasi untuk mengubah struktur dan format pesan dari aplikasi pengirim ke format yang dipahami aplikasi penerima, mengatasi heterogenitas sistem enterprise."
  },
  {
    question: "Pada protokol penyebaran data Gossip (Epidemic Protocols), mengapa penanda Death Certificate (Tombstone) sangat diperlukan?",
    options: [
      "Untuk mematikan koneksi internet node yang lambat.",
      "Untuk mencatat penghapusan data secara resmi sehingga data yang telah dihapus tidak 'ditularkan' kembali oleh node tetangga yang masih menyimpan data lama.",
      "Untuk mempercepat proses enkripsi pesan.",
      "Untuk mengganti sertifikat SSL yang kedaluwarsa."
    ],
    correct: 1,
    explanation: "Tepat sekali. Tanpa Death Certificate, node tetangga yang masih menyimpan salinan data lama akan mengira node yang baru menghapus data tersebut ketinggalan informasi, lalu mengirimkan kembali data tersebut (kebangkitan data zombie)."
  }
];

const pekan5QuizData = [
  {
    question: "Apa perbedaan esensial antara Precision dan Accuracy pada sinkronisasi jam fisik?",
    options: [
      "Precision mengukur selisih waktu antarmesin di sistem lokal (internal sync), sedangkan Accuracy mengukur selisih waktu jam komputer terhadap standar waktu absolut UTC (external sync).",
      "Precision hanya untuk jam digital, sedangkan Accuracy untuk jam atomik.",
      "Precision diukur dalam milidetik, sedangkan Accuracy tidak memiliki satuan.",
      "Precision membutuhkan satelit GPS, sedangkan Accuracy hanya memakai kabel LAN."
    ],
    correct: 0,
    explanation: "Tepat sekali. Precision menjaga agar deviasi jam antarmesin dalam sistem tidak melebihi batas pi (Internal Synchronization). Accuracy menjaga agar jam komputer sesuai dengan waktu UTC matahari dunia nyata dalam batas alpha (External Synchronization)."
  },
  {
    question: "Mengapa Vector Clocks diciptakan untuk menyempurnakan Lamport Logical Clocks?",
    options: [
      "Karena Lamport Clocks membutuhkan memori 100 kali lebih besar.",
      "Karena pada Lamport Clocks, relasi C(a) < C(b) tidak menjamin bahwa a mendahului b secara kausal (bisa jadi a dan b konkuren), sedangkan Vector Clocks menjamin kausalitas dua arah: a -> b jika dan hanya jika V(a) < V(b).",
      "Karena Vector Clocks dapat menghitung waktu matahari UTC secara otomatis.",
      "Karena Lamport Clocks tidak bisa digunakan pada bahasa pemrograman modern."
    ],
    correct: 1,
    explanation: "Benar. Lamport Clocks hanya berlaku satu arah (a -> b maka C(a) < C(b)). Sebaliknya, Vector Clocks dapat mendeteksi apakah dua kejadian memiliki hubungan kausalitas sejati atau terjadi secara independen/konkuren."
  },
  {
    question: "Apa kelemahan paling fatal dari algoritma Distributed Mutual Exclusion karya Ricart dan Agrawala?",
    options: [
      "Membutuhkan perangkat keras prosesor kuantum.",
      "Setiap node harus menerima izin (OK) dari SELURUH node lain untuk masuk CS; jika salah satu node di jaringan crash, seluruh sistem akan lumpuh total menunggu respon.",
      "Hanya mengizinkan maksimal 2 node di jaringan.",
      "Jumlah pesan selalu bertambah secara eksponensial O(2^N)."
    ],
    correct: 1,
    explanation: "Tepat. Algoritma Ricart-Agrawala membutuhkan persetujuan mutlak dari semua N-1 node lain. Titik kegagalan berlipat ganda menjadi N titik kegagalan (*N-points of failure*); jika 1 node mati, proses lain tidak akan pernah bisa masuk ke Critical Section."
  },
  {
    question: "Bagaimana penentuan pemenang koordinator baru pada The Bully Algorithm?",
    options: [
      "Proses dengan alamat IP terkecil selalu menjadi koordinator.",
      "Proses aktif yang memiliki Identifier numerik terbesar yang memenangkan pemilihan dan mengumumkan dirinya via pesan COORDINATOR.",
      "Proses yang pertama kali menyalakan komputer saat booting.",
      "Koordinator dipilih secara acak menggunakan fungsi hash."
    ],
    correct: 1,
    explanation: "Tepat sekali. Pada Bully Algorithm, proses aktif dengan ID terbesar berhak 'mengintimidasi' (*bully*) proses dengan ID lebih rendah untuk menjadi koordinator tunggal sistem."
  },
  {
    question: "Dalam algoritma sinkronisasi Network Time Protocol (NTP), pasangan nilai offset waktu (θ) manakah yang dipilih oleh klien?",
    options: [
      "Pasangan nilai yang memiliki associated delay (δ) paling minimum.",
      "Pasangan nilai yang memiliki nilai timestamp terbesar.",
      "Pasangan nilai pertama yang diterima dari server.",
      "Rata-rata seluruh nilai tanpa memperhitungkan delay."
    ],
    correct: 0,
    explanation: "Benar. NTP mengumpulkan beberapa sampel nilai offset (theta) dan delay (delta), kemudian memilih offset dengan delay minimum untuk meminimalkan dampak fluktuasi dan jitter antrean jaringan."
  }
];

const pekan6QuizData = [
  {
    question: "Manakah di bawah ini yang merupakan 3 sifat wajib dari sebuah Identifier dalam sistem terdistribusi?",
    options: [
      "Harus berupa nama domain, tidak boleh memakai angka, dan selalu disimpan di DNS.",
      "Merujuk paling banyak satu entitas, setiap entitas memiliki paling banyak satu identifier, dan identifier tidak pernah digunakan kembali untuk entitas lain.",
      "Harus terikat dengan alamat MAC perangkat, panjangnya selalu 32-bit, dan dienkripsi SHA-256.",
      "Hanya berlaku selama 24 jam sebelum kedaluwarsa."
    ],
    correct: 1,
    explanation: "Tepat. Identifier adalah penanda unik mutlak: 1 identifier merujuk 1 entitas, 1 entitas punya 1 identifier, dan identifier tidak pernah didaur ulang seumur hidup sistem."
  },
  {
    question: "Apa yang dimaksud dengan prinsip Location Independence pada penamaan terdistribusi?",
    options: [
      "Nama entitas tidak bergantung pada lokasi fisik entitas, sehingga entitas dapat berpindah mesin tanpa harus mengubah namanya.",
      "Setiap server harus berada di lokasi geografis yang sama.",
      "Nama entitas hanya boleh diakses melalui jaringan nirkabel.",
      "Nama entitas dibuat secara lokal tanpa koneksi internet."
    ],
    correct: 0,
    explanation: "Benar. Location independence memastikan bahwa perpindahan entitas ke alamat IP atau server lain tidak memaksa entitas tersebut mengubah nama publiknya."
  },
  {
    question: "Apa perbedaan mendasar antara Iterative dan Recursive Name Resolution pada DNS?",
    options: [
      "Iterative dilakukan oleh server root saja, sedangkan Recursive oleh klien saja.",
      "Pada Iterative resolution, klien resolver yang secara mandiri menghubungi server tiap tingkatan hierarki, sedangkan pada Recursive resolution, server DNS yang meneruskan pertanyaan berantai atas nama klien.",
      "Iterative hanya untuk IPv4, sedangkan Recursive untuk IPv6.",
      "Iterative tidak mendukung caching sama sekali."
    ],
    correct: 1,
    explanation: "Tepat sekali. Iterative membebankan penelusuran berulang pada klien resolver. Recursive membebankan server DNS untuk mencari jawaban secara estafet sampai ketemu sebelum mengembalikan hasil ke klien."
  },
  {
    question: "Dalam hierarki Domain Name System (DNS), lapisan manakah yang berisi Root Server dan Top-Level Domain (TLD) seperti .com dan .id?",
    options: [
      "Managerial Layer",
      "Administrational Layer",
      "Global Layer",
      "Local Layer"
    ],
    correct: 2,
    explanation: "Benar. Global Layer adalah lapisan paling puncak pada DNS yang sangat stabil dan jarang berubah, menampung Root DNS servers dan Top-Level Domains (gTLD dan ccTLD)."
  },
  {
    question: "Dalam protokol direktori LDAP, apa perbedaan antara Relative Distinguished Name (RDN) dan Distinguished Name (DN)?",
    options: [
      "RDN adalah nama unik lokal pada satu level hierarki, sedangkan DN adalah jalur rantai lengkap dari akar pohon direktori (DIT) hingga entitas tersebut.",
      "RDN disimpan di memori RAM, sedangkan DN disimpan di harddisk.",
      "RDN untuk pengguna biasa, sedangkan DN untuk administrator.",
      "RDN adalah protokol enkripsi, sedangkan DN adalah protokol jaringan."
    ],
    correct: 0,
    explanation: "Tepat. RDN adalah pengenal atribut lokal (misal cn=Ahmad), sedangkan DN adalah rantai path hierarkis lengkapnya (misal cn=Ahmad, ou=Informatika, o=Universitas, c=ID)."
  }
];

const pekan7QuizData = [
  {
    question: "Menurut aturan Gifford's Quorum, mengapa syarat NR + NW > N wajib dipenuhi dalam sistem replikasi?",
    options: [
      "Agar seluruh replika dapat dimatikan saat malam hari.",
      "Untuk menjamin selalu ada minimal satu replika yang tumpang tindih (overlap) antara Read Quorum dan Write Quorum, sehingga operasi baca dijamin membaca data paling mutakhir.",
      "Agar operasi tulis selalu selesai dalam waktu kurang dari 1 detik.",
      "Untuk mencegah penggunaan memori melebihi 50%."
    ],
    correct: 1,
    explanation: "Tepat sekali. Syarat NR + NW > N memastikan bahwa kuorum baca dan kuorum tulis selalu beririsan minimal satu replika yang memegang versi data ber-timestamp terbaru, mencegah Read-Write Conflict."
  },
  {
    question: "Menurut aturan Gifford's Quorum, apa tujuan utama dari syarat NW > N / 2?",
    options: [
      "Mencegah terjadinya dua operasi tulis bersamaan oleh dua kelompok mayoritas yang berbeda (mencegah Write-Write Conflict dan split-brain).",
      "Memastikan bahwa pembacaan data selalu gratis tanpa biaya lisensi.",
      "Mengurangi konsumsi listrik server data center.",
      "Memastikan kuorum baca selalu bernilai genap."
    ],
    correct: 0,
    explanation: "Benar. Syarat NW > N/2 menjamin hanya ada satu kelompok mayoritas mutlak yang dapat melakukan operasi tulis pada waktu tertentu, mencegah benturan tulis ganda dan terbelahnya konsistensi sistem."
  },
  {
    question: "Model konsistensi Client-Centric manakah yang menjamin bahwa jika seorang pengguna mengubah foto profilnya, ia selalu melihat foto baru tersebut saat membuka kembali profilnya?",
    options: [
      "Monotonic Reads",
      "Monotonic Writes",
      "Read Your Writes Consistency",
      "Writes Follow Reads"
    ],
    correct: 2,
    explanation: "Tepat. Read Your Writes menjamin bahwa pembaruan data yang dilakukan oleh suatu proses akan selalu dapat dilihat langsung oleh operasi baca berikutnya oleh proses yang sama."
  },
  {
    question: "Apa definisi mendasar dari model konsistensi Eventual Consistency?",
    options: [
      "Data di seluruh replika dijamin identik setiap saat dalam waktu fisik instan.",
      "Jika tidak ada operasi update baru yang masuk dalam jangka waktu tertentu, pada akhirnya seluruh replika dijamin akan konvergen menjadi identik.",
      "Data hanya boleh dibaca satu kali oleh satu klien.",
      "Operasi tulis hanya diizinkan pada akhir pekan."
    ],
    correct: 1,
    explanation: "Benar. Eventual Consistency adalah model konsistensi lemah yang sangat populer (DNS, web cache): jika aliran update berhenti, seluruh salinan replika akhirnya akan berkonvergensi ke kondisi data yang sama persis."
  },
  {
    question: "Dalam protokol pembaruan replika, dalam kondisi apa Push-Based Protocol (server aktif kirim update) lebih unggul dibandingkan Pull-Based Protocol?",
    options: [
      "Ketika data sangat sering diubah tetapi hampir tidak pernah dibaca.",
      "Ketika rasio Read-to-Write tinggi (data sangat sering dibaca oleh banyak klien tetapi pembaruan data relatif jarang).",
      "Ketika koneksi jaringan antar-server sering terputus total.",
      "Ketika server tidak memiliki kapasitas penyimpanan harddisk."
    ],
    correct: 1,
    explanation: "Tepat. Pada kondisi Read-to-Write ratio tinggi, mendorong update sekali (*push*) langsung ke seluruh replika sangat efisien karena data yang diperbarui tersebut pasti akan segera dibaca oleh ribuan permintaan klien berikutnya."
  }
];

function initPekan5Quiz() {
  runQuiz('pekan5-quiz', pekan5QuizData, 'Pekan 5');
}

function initPekan6Quiz() {
  runQuiz('pekan6-quiz', pekan6QuizData, 'Pekan 6');
}

function initPekan7Quiz() {
  runQuiz('pekan7-quiz', pekan7QuizData, 'Pekan 7');
}

/* ==========================================================================
   Quiz Dataset: 7 Poin Kisi-Kisi Dosen
   ========================================================================== */
const kisiQuizData = [
  {
    question: "Kisi-Kisi 1: Sistem terdistribusi modern bertujuan menyembunyikan kompleksitas pembagian sumber daya dari pengguna melalui transparansi. Manakah pasangan jenis transparansi dan definisi operasionalnya yang paling tepat?",
    options: [
      "Access Transparency: menyembunyikan lokasi geografis fisik tempat sumber daya disimpan.",
      "Relocation Transparency: menyembunyikan fakta bahwa suatu sumber daya dipindahkan ke lokasi lain saat sedang aktif diakses oleh pengguna tanpa memutus koneksi.",
      "Replication Transparency: menyembunyikan fakta bahwa sistem mengalami kegagalan server dan reboot otomatis.",
      "Concurrency Transparency: menyembunyikan perbedaan arsitektur CPU 32-bit dan 64-bit pada mesin server."
    ],
    correct: 1,
    explanation: "Tepat. Relocation Transparency secara spesifik menyembunyikan pemindahan resource yang sedang aktif digunakan pengguna. Access Transparency menyembunyikan representasi data, Location Transparency menyembunyikan letak fisik, dan Failure Transparency menyembunyikan kegagalan."
  },
  {
    question: "Kisi-Kisi 2: Dalam arsitektur Publish-Subscribe (Pub-Sub), mengapa pola ini dikategorikan memiliki karakteristik 'Temporal Decoupling' dan 'Spatial (Referential) Decoupling' sekaligus?",
    options: [
      "Publisher dan Subscriber harus online bersamaan pada port TCP yang sama persis.",
      "Publisher tidak perlu mengetahui identitas atau alamat IP Subscriber (Spatial), serta Publisher dan Subscriber tidak perlu aktif atau online pada waktu bersamaan (Temporal).",
      "Pesan yang dikirimkan selalu dihapus seketika setelah 1 milidetik tanpa tersimpan di buffer broker.",
      "Hanya mendukung satu subscriber tunggal untuk setiap publisher yang terdaftar."
    ],
    correct: 1,
    explanation: "Benar sekali. Spatial/Referential decoupling membebaskan komponen dari keharusan mengetahui alamat penerima langsung. Temporal decoupling memungkinkan pengirim mengirim pesan meskipun penerima sedang offline (pesan ditampung broker/queue)."
  },
  {
    question: "Kisi-Kisi 3: Pada arsitektur virtualisasi berbasis Linux Container (Docker), mekanisme kernel manakah yang bertanggung jawab mengisolasi pandangan proses terhadap PID, Network Interface, dan Mount Point?",
    options: [
      "Control Groups (cgroups)",
      "Linux Namespaces",
      "Union File System (OverlayFS)",
      "Type-1 Hypervisor Bare-metal"
    ],
    correct: 1,
    explanation: "Tepat. Linux Namespaces bertanggung jawab menyediakan isolasi pandangan sistem (PID, NET, MNT, IPC, UTS, USER). Sementara cgroups bertugas membatasi kuota konsumsi sumber daya (CPU, RAM, I/O)."
  },
  {
    question: "Kisi-Kisi 4: Pada mekanisme Remote Procedure Call (RPC), apa tanggung jawab utama dari komponen Client Stub dan Server Stub?",
    options: [
      "Client stub dan server stub bertugas mematikan daya mesin ketika prosedur selesai dieksekusi.",
      "Client stub membungkus (marshaling) parameter pemanggilan ke dalam paket pesan jaringan, sedangkan Server stub membongkar (unmarshaling) paket tersebut dan memanggil prosedur aktual di server.",
      "Client stub bertindak sebagai server database, sedangkan Server stub bertindak sebagai switch jaringan.",
      "Keduanya hanya bertugas mengenkripsi password BIOS komputer."
    ],
    correct: 1,
    explanation: "Benar. Client stub membuat pemanggilan fungsi jarak jauh terasa seperti fungsi lokal bagi klien dengan melakukan marshaling parameter. Server stub menerima paket, melakukan unmarshaling, lalu memanggil fungsi implementasi yang sesungguhnya di mesin server."
  },
  {
    question: "Kisi-Kisi 5: Mengapa Vector Clock dianggap lebih superior dibandingkan Lamport Logical Clock dalam mendeteksi kejadian konkuren (tidak saling memengaruhi)?",
    options: [
      "Karena Vector Clock menggunakan baterai jam kuarsa perangkat keras komputer.",
      "Lamport Clock hanya menjamin relasi implikasi satu arah (a -> b maka C(a) < C(b)), sedangkan Vector Clock memiliki relasi ekuivalensi dua arah (a -> b <=> V(a) < V(b)) sehingga perbandingan vektor yang tidak mendominasi secara definitif membuktikan dua kejadian terjadi konkuren.",
      "Vector Clock hanya dapat digunakan pada jaringan nirkabel Bluetooth.",
      "Lamport Clock tidak bisa menangani lebih dari 2 proses secara bersamaan."
    ],
    correct: 1,
    explanation: "Tepat sekali. Pada Lamport Clock, jika C(a) < C(b), kita tidak bisa memastikan apakah a mendahului b atau keduanya independen/konkuren. Vector Clock menyimpan array pengetahuan seluruh proses, sehingga jika V(a) tidak lebih kecil dari V(b) dan sebaliknya, kedua event pasti independen/konkuren."
  },
  {
    question: "Kisi-Kisi 6: Pada protokol Distributed Hash Table (DHT) Chord berukuran m-bit, jika terdapat data dengan hash kunci k, node manakah yang bertanggung jawab menyimpan kunci tersebut?",
    options: [
      "Node pertama yang memiliki identifier node id >= k (dihitung searah jarum jam pada ring modulo 2^m), yang disebut sebagai successor(k).",
      "Node yang memiliki identifier terkecil yaitu node 0 secara absolut.",
      "Node yang sedang memiliki koneksi internet paling cepat.",
      "Node terakhir yang memiliki identifier node id <= k."
    ],
    correct: 0,
    explanation: "Benar. Aturan fundamental Chord ring menetapkan bahwa kunci k disimpan oleh node penerus terdekatnya, yaitu successor(k), yakni simpul pertama dengan identifier id >= k searah putaran jarum jam ring."
  },
  {
    question: "Kisi-Kisi 7: Apa perbedaan mendasar antara model konsistensi Sequentially Consistent dan Causally Consistent?",
    options: [
      "Sequential Consistency mengharuskan seluruh operasi tulis dibatalkan jika terjadi latency tinggi.",
      "Sequential Consistency menuntut seluruh replika melihat urutan operasi eksekusi global tunggal yang seragam (termasuk untuk operasi konkuren), sedangkan Causal Consistency hanya mewajibkan operasi yang memiliki relasi sebab-akibat dilihat dalam urutan seragam oleh semua replika.",
      "Causal Consistency membutuhkan sinkronisasi jam atom GPS presisi nanodetik.",
      "Sequential Consistency hanya boleh diterapkan pada basis data satu node tanpa replikasi."
    ],
    correct: 1,
    explanation: "Tepat. Sequential Consistency menuntut urutan sekuensial global yang sama persis di setiap replika. Causal Consistency melonggarkan aturan ini: hanya operasi yang berelasi sebab-akibat yang wajib urut, sedangkan operasi konkuren boleh dilihat dalam urutan berbeda di replika yang berbeda."
  }
];

function initKisiQuiz() {
  runQuiz('kisi-quiz-container', kisiQuizData, 'Kisi-Kisi Dosen');
}

/* ==========================================================================
   Quiz Dataset: Simulasi Komprehensif UTS (20 Soal Pilihan Ganda)
   ========================================================================== */
const fullExamData = [
  {
    question: "1. (Pekan 1) Menurut L. Peter Deutsch, manakah pernyataan berikut yang merupakan salah satu dari 'Fallacies of Distributed Computing' (kekeliruan asumsi yang sering dibuat programmer pemula)?",
    options: [
      "Jaringan selalu andal (The network is reliable) dan latensi bernilai nol (Latency is zero).",
      "Sistem terdistribusi selalu membutuhkan CPU multicore di setiap node server.",
      "Prosesor server tidak boleh dimatikan selama 10 tahun berturut-turut.",
      "Basis data terdistribusi tidak boleh menggunakan indeks pencarian biner."
    ],
    correct: 0,
    explanation: "Tepat. Fallacies of Distributed Computing mencakup 8 asumsi keliru: jaringan andal, latensi nol, bandwidth tak terbatas, jaringan aman, topologi tidak berubah, administrator tunggal, biaya transportasi nol, dan jaringan homogen."
  },
  {
    question: "2. (Pekan 1) Sistem terdistribusi menghadapi tantangan skalabilitas pada tiga dimensi utama: Size, Geographic, dan Administrative. Apa tantangan teknis mendasar pada Geographical Scalability?",
    options: [
      "Pertambahan jumlah file log yang memenuhi kapasitas partisi harddisk server lokal.",
      "Hukum fisika kecepatan rambat sinyal elektromagnetik (kecepatan cahaya) yang membatasi latensi komunikasi antar-benua, serta bandwidth WAN yang terbatas.",
      "Perbedaan format lisensi perangkat lunak antar-fakultas dalam universitas.",
      "Ketiadaan monitor fisik pada komputer rak server data center."
    ],
    correct: 1,
    explanation: "Benar. Geographical scalability dibatasi oleh batasan fisika: sinyal komunikasi melalui fiber optik antar-benua memiliki latensi propagasi minimum (ratusan milidetik) yang tidak dapat ditiadakan."
  },
  {
    question: "3. (Pekan 1) Tanenbaum mendefinisikan sistem terdistribusi sebagai kumpulan komputer mandiri yang tampak bagi pengguna sebagai satu sistem tunggal koheren. Lapisan perangkat lunak apa yang memfasilitasi integrasi ini?",
    options: [
      "Hypervisor Type-1 Bare-metal.",
      "Middleware yang berada di atas sistem operasi lokal dan di bawah aplikasi pengguna.",
      "Firmware BIOS motherboard server.",
      "Device Driver kartu grafis VGA."
    ],
    correct: 1,
    explanation: "Tepat. Middleware adalah lapisan abstraksi perangkat lunak logis yang menyembunyikan heterogenitas platform dan menyajikan antarmuka terpadu (*single coherent system*) bagi aplikasi."
  },
  {
    question: "4. (Pekan 2) Mengapa prinsip 'Stateless' pada arsitektur RESTful sangat menguntungkan untuk skalabilitas horizontal (load balancing) di infrastruktur cloud?",
    options: [
      "Karena server wajib menyimpan riwayat sesi semua pengguna di memori RAM internal secara permanen.",
      "Karena setiap request membawa seluruh konteks otentikasi dan data yang dibutuhkan, sehingga request dapat diproses oleh instans server mana pun secara independen tanpa perlu sinkronisasi status sesi.",
      "Karena metode POST dan PUT dilarang digunakan dalam arsitektur REST.",
      "Karena seluruh respon server diubah menjadi file teks berukuran nol byte."
    ],
    correct: 1,
    explanation: "Benar sekali. Statelessness memastikan tidak ada sesi klien yang tersandera di satu server (*session affinity/sticky session*). Load balancer bebas mengalihkan tiap request ke node mana pun yang paling luang."
  },
  {
    question: "5. (Pekan 2) Manakah komparasi arsitektural yang paling tepat antara Web Service berbasis SOAP dan RESTful API?",
    options: [
      "SOAP hanya berjalan di browser, sedangkan REST hanya berjalan di sistem operasi mobile.",
      "SOAP berorientasi pada tindakan/fungsi (RPC-style) dengan payload XML ketat berstandar WSDL, sedangkan REST berorientasi pada sumber daya (Resource-oriented) dengan kata kerja standar HTTP (GET, POST, PUT, DELETE).",
      "REST mewajibkan setiap pesan dienkripsi dengan standar XML Signature WS-Security.",
      "SOAP tidak menggunakan protokol TCP/IP sama sekali."
    ],
    correct: 1,
    explanation: "Tepat. SOAP berfokus pada pemanggilan remote function/action menggunakan XML envelope berstandar WSDL, sedangkan REST memandang dunia sebagai resource yang diakses via representasi URI dan HTTP verbs standar."
  },
  {
    question: "6. (Pekan 2) Dalam arsitektur Publish-Subscribe berbasis Content-Based Filtering, bagaimana broker menentukan tujuan pengiriman pesan?",
    options: [
      "Berdasarkan alamat IP statis yang ditentukan administrator secara manual.",
      "Berdasarkan nama channel statis yang didaftarkan secara hardcoded.",
      "Berdasarkan evaluasi isi pasangan atribut dan nilai aktual dari pesan terhadap kriteria ekspresi filter yang didaftarkan oleh subscriber.",
      "Berdasarkan nomor urut soket jaringan secara round-robin acak."
    ],
    correct: 2,
    explanation: "Benar. Content-based subscription memeriksa konten payload pesan (misal: 'suhu > 35 AND lokasi = GudangA') dan mencocokkannya secara dinamis dengan kriteria yang diinginkan subscriber."
  },
  {
    question: "7. (Pekan 3) Mengapa context switch antar-thread dalam satu proses yang sama jauh lebih ringan daripada context switch antar-proses terpisah?",
    options: [
      "Thread tidak menggunakan register CPU sama sekali.",
      "Thread dalam proses yang sama berbagi address space memori, page table, dan open files yang sama, sehingga CPU tidak perlu melakukan penggantian pemetaan virtual memory (TLB flush).",
      "Thread dijalankan langsung oleh chip grafis GPU tanpa penjadwalan OS.",
      "Proses tidak memiliki thread program counter."
    ],
    correct: 1,
    explanation: "Tepat. Context switch proses membutuhkan pembongkaran tabel halaman memori dan membersihkan Translation Lookaside Buffer (TLB cache). Antar-thread hanya perlu menyimpan register dan stack pointer lokal."
  },
  {
    question: "8. (Pekan 3) Apa perbedaan arsitektural utama antara Container (Docker) dan Virtual Machine tradisional (Hypervisor Type-2)?",
    options: [
      "Container mewajibkan instalasi sistem operasi tamu (Guest OS) lengkap beserta kernel terpisah di tiap instans.",
      "Container berjalan langsung di atas kernel host bersama melalui isolasi namespaces dan cgroups, sehingga boot instan dan overhead memori jauh lebih rendah.",
      "Virtual Machine tidak menggunakan memori fisik komputer host.",
      "Container hanya dapat berjalan pada arsitektur komputer mainframe IBM."
    ],
    correct: 1,
    explanation: "Benar. Container mengisolasi proses menggunakan fitur kernel host bawaan (namespaces & cgroups) tanpa mengemulasikan virtual hardware atau menjalankan kernel Guest OS terpisah."
  },
  {
    question: "9. (Pekan 3) Pada klaster server multi-tier, bagaimana teknik TCP Handoff mencegah switch front-end menjadi titik kemacetan (bottleneck)?",
    options: [
      "Switch front-end memutus koneksi dan menyuruh klien melakukan polling ulang via UDP.",
      "Koneksi TCP yang diinisiasi klien diserahterimakan ke back-end node sehingga node tersebut langsung mengirim balasan paket berukuran besar ke klien menggunakan alamat sumber switch front-end.",
      "Database back-end mengirimkan data langsung melalui satelit tanpa melalui jaringan kabel lokal.",
      "Switch front-end mengompres seluruh gambar menjadi 1 pixel sebelum dikirimkan."
    ],
    correct: 1,
    explanation: "Tepat. TCP Handoff memecahkan masalah lalu lintas asimetris: request klien berukuran kecil diterima front-end, namun paket respons berukuran megabyte langsung dikirim dari server back-end ke klien."
  },
  {
    question: "10. (Pekan 4) Komunikasi terdistribusi di mana pengirim dapat melanjutkan eksekusi setelah pesan disimpan dalam message queue persisten (tanpa menunggu penerima memproses) diklasifikasikan sebagai...",
    options: [
      "Transient Synchronous Communication",
      "Persistent Asynchronous Communication",
      "Transient Asynchronous Communication",
      "Isochronous Streaming Communication"
    ],
    correct: 1,
    explanation: "Benar. Persistent berarti pesan disimpan dalam antrean persisten yang bertahan meskipun pengirim/penerima crash. Asynchronous berarti pengirim tidak diblokir menunggu balasan."
  },
  {
    question: "11. (Pekan 4) Dalam implementasi RPC, mengapa representasi data kanonikal (seperti XDR atau Protobuf) dan proses marshaling sangat diperlukan?",
    options: [
      "Untuk mengatasi perbedaan arsitektur mesin komputer (seperti urutan byte Little-Endian vs Big-Endian serta format floating point) agar parameter dapat dipahami secara seragam di kedua sisi.",
      "Untuk mencegah kabel jaringan LAN mengalami panas berlebih.",
      "Untuk mengubah fungsi private menjadi fungsi publik secara otomatis.",
      "Untuk memastikan panggilan RPC selalu gratis tanpa biaya lisensi."
    ],
    correct: 0,
    explanation: "Tepat. Marshaling mengonversi struktur data kompleks memori lokal ke dalam aliran biner kanonikal terstandardisasi sehingga mesin dengan arsitektur CPU dan endianness berbeda dapat saling memahami."
  },
  {
    question: "12. (Pekan 4) Apa perbedaan mendasar antara Asynchronous RPC dan One-Way RPC?",
    options: [
      "Asynchronous RPC menunggu acknowledgement (ACK) penerimaan dari server dan klien tetap dapat menerima nilai hasil secara terpisah nanti, sedangkan One-Way RPC tidak menunggu ACK apa pun dan tidak pernah mengharapkan balasan.",
      "One-Way RPC selalu mengembalikan data biner berukuran 1 Gigabyte.",
      "Asynchronous RPC hanya berjalan pada sistem operasi Windows 98.",
      "Tidak ada perbedaan, keduanya adalah istilah identik untuk panggilan sinkron murni."
    ],
    correct: 0,
    explanation: "Benar. Asynchronous RPC mengembalikan kontrol ke klien setelah server menerima request (ada ACK), dan hasil komputasi diambil nanti melalui callback/polling. One-Way RPC sama sekali tidak mengharapkan ACK penerimaan."
  },
  {
    question: "13. (Pekan 5) Sebuah proses Pi memiliki jam lokal C_i = 14. Proses tersebut menerima pesan m dari Pj yang membawa nilai timestamp C_j = 20. Menurut algoritma Lamport Logical Clock, berapakah nilai C_i yang baru setelah menerima pesan tersebut?",
    options: [
      "14",
      "20",
      "21",
      "35"
    ],
    correct: 2,
    explanation: "Tepat sekali. Rumus aturan kedua Lamport: C_i = max(C_i, C_j) + 1. Di sini max(14, 20) = 20, ditambah 1 menjadi 21."
  },
  {
    question: "14. (Pekan 5) Pada algoritma sinkronisasi jam Cristian, klien mencatat waktu kirim T0 dan waktu terima balasan T1. Jika server menyematkan waktu server Tserver, perkiraan waktu jam saat balasan tiba dihitung dengan rumus...",
    options: [
      "Tserver + ((T1 - T0) / 2)",
      "Tserver - (T1 - T0)",
      "(T0 + T1) / 2",
      "Tserver * (T1 / T0)"
    ],
    correct: 0,
    explanation: "Benar. Waktu tempuh bolak-balik (Round-Trip Time / RTT) adalah (T1 - T0). Dengan asumsi latensi kirim dan latensi terima simetris, paket kembali ke klien membutuhkan waktu RTT/2, sehingga jam saat tiba diestimasi Tserver + ((T1 - T0)/2)."
  },
  {
    question: "15. (Pekan 5) Diberikan dua kejadian dalam sistem tiga proses: Event A memiliki vektor V(A) = [3, 2, 4] dan Event B memiliki vektor V(B) = [2, 5, 1]. Manakah relasi kausal yang benar antara kedua event tersebut?",
    options: [
      "Event A terjadi mendahului Event B secara kausal (A -> B).",
      "Event B terjadi mendahului Event A secara kausal (B -> A).",
      "Event A dan Event B bersifat konkuren (A || B) karena tidak ada satu vektor yang mendominasi seluruh komponen vektor lainnya.",
      "Kedua event terjadi pada waktu nanodetik fisik yang persis sama di jam dunia nyata."
    ],
    correct: 2,
    explanation: "Tepat. Komponen pertama V(A)[0] > V(B)[0] (3 > 2), tetapi komponen kedua V(A)[1] < V(B)[1] (2 < 5). Karena tidak memenuhi aturan dominasi parsial, kedua event dipastikan saling bebas/konkuren."
  },
  {
    question: "16. (Pekan 6) Pada sistem Chord Ring DHT berukuran 6-bit (modulo 2^6 = 64), berapa jumlah baris entri yang disimpan dalam Finger Table setiap node, dan berapa batas atas jumlah pesan (hop) untuk menemukan kunci?",
    options: [
      "6 entri Finger Table, dengan pencarian kunci membutuhkan paling banyak O(log N) hop.",
      "64 entri Finger Table, dengan pencarian kunci membutuhkan O(N) hop linier.",
      "1 entri Finger Table, dengan pencarian selalu O(1) instan.",
      "128 entri Finger Table, dengan pencarian membutuhkan O(N^2) hop."
    ],
    correct: 0,
    explanation: "Benar. Finger Table Chord berukuran m baris untuk ruang identifier m-bit (di sini m = 6 baris). Dengan melompati setengah jarak ring setiap langkah, waktu pencarian dijamin efisien sebesar O(log N) hop."
  },
  {
    question: "17. (Pekan 6) Mengapa server Root DNS di internet publik dikonfigurasi menolak kueri Rekursif dan hanya melayani pencarian secara Iteratif?",
    options: [
      "Karena kueri rekursif memaksa server root mempertahankan state soket terbuka dan menanggung seluruh beban kontak bertingkat, yang dapat menyebabkan kehabisan sumber daya (resource exhaustion) dan kelumpuhan sistem global.",
      "Karena server Root DNS tidak memiliki koneksi internet publik.",
      "Karena kueri iteratif hanya diizinkan untuk organisasi berlisensi khusus.",
      "Karena protokol UDP tidak mendukung kueri rekursif sama sekali."
    ],
    correct: 0,
    explanation: "Tepat sekali. Jika miliaran klien di seluruh dunia meminta Root DNS mencari rekursif hingga tuntas, jutaan koneksi akan menggantung di Root DNS. Dengan kueri iteratif, Root DNS cukup menjawab sekali (merujuk ke TLD) lalu langsung membebaskan memori."
  },
  {
    question: "18. (Pekan 7) Dalam sistem basis data terdistribusi dengan N = 9 replika, jika Read Quorum ditetapkan N_R = 4, berapakah nilai Write Quorum (N_W) minimum yang sah menurut aturan Gifford's Quorum?",
    options: [
      "N_W = 5",
      "N_W = 6",
      "N_W = 4",
      "N_W = 3"
    ],
    correct: 1,
    explanation: "Tepat. Syarat 1: NR + NW > N => 4 + NW > 9 => NW >= 6. Syarat 2: NW > N/2 => NW > 4.5 => NW >= 5. Irisan kondisi yang memenuhi kedua aturan secara mutlak adalah NW minimal 6."
  },
  {
    question: "19. (Pekan 7) Seorang pengguna media sosial mengunggah status baru. Ketika ia memuat ulang (refresh) halaman profilnya dan dilayani oleh server replika lain, sistem menjamin ia langsung melihat status barunya tersebut. Model konsistensi client-centric ini adalah...",
    options: [
      "Monotonic Writes",
      "Read Your Writes Consistency",
      "Writes Follow Reads",
      "Weak Random Consistency"
    ],
    correct: 1,
    explanation: "Benar. Read Your Writes menjamin efek dari operasi pembaruan yang dilakukan oleh suatu proses akan selalu terlihat secara langsung oleh pembacaan berikutnya yang dilakukan oleh proses yang sama."
  },
  {
    question: "20. (Pekan 7) Dalam pemeliharaan konsistensi replikasi data, kapan pendekatan Pull-based (klien/server meminta pembaruan saat butuh) lebih efisien dibandingkan Push-based (server aktif membroadcast update)?",
    options: [
      "Ketika rasio Read-to-Write sangat rendah (data di server sangat sering diubah, namun pembacaan data oleh klien sangat jarang terjadi).",
      "Ketika jutaan pengguna membaca data yang sama setiap detik tanpa henti.",
      "Ketika server tidak memiliki kapasitas penyimpanan memori RAM.",
      "Ketika seluruh node berada dalam satu ruangan laboratorium yang sama."
    ],
    correct: 0,
    explanation: "Tepat. Jika rasio Read-to-Write rendah (sering diubah tapi jarang dibaca), pendekatan Push akan membuang-buang bandwidth untuk membroadcast update yang mungkin tidak pernah dibaca. Pendekatan Pull hanya mengambil update saat benar-benar diminta membaca."
  }
];

function initFullExam() {
  runQuiz('full-exam-container', fullExamData, 'Simulasi Lengkap UTS');
}
