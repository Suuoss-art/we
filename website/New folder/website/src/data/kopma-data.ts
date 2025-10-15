export const kopmaData = {
  organization: {
    name: "KOPMA UNNES",
    fullName: "Koperasi Mahasiswa Universitas Negeri Semarang",
    tagline: "Dari Anggota, Oleh Anggota, Untuk Anggota",
    established: "1982",
    registration: "Badan Hukum No. 10397/BH/VI/1982",
    address: {
      street: "Gedung PKM Universitas Negeri Semarang",
      city: "Semarang",
      province: "Jawa Tengah",
      postalCode: "50229",
      country: "Indonesia"
    },
    contact: {
      phone: "+62-24-8508015",
      email: "info@kopmaukmunnes.com",
      website: "https://kopmaukmunnes.com"
    },
    socialMedia: {
      instagram: "https://www.instagram.com/kopmaunnes",
      facebook: "https://www.facebook.com/kopmaunnes",
      youtube: "https://www.youtube.com/kopmaunnes",
      twitter: "https://www.twitter.com/kopmaunnes"
    }
  },
  
  hero: {
    title: "KOPMA UNNES",
    subtitle: "Koperasi Mahasiswa Universitas Negeri Semarang",
    tagline: "Dari Anggota, Oleh Anggota, Untuk Anggota",
    description: "Melayani kebutuhan mahasiswa UNNES dengan layanan terbaik dan harga terjangkau",
    image: "/images/hero-bg.jpg",
    cta: {
      primary: {
        text: "Pelajari Lebih Lanjut",
        href: "#tentang"
      },
      secondary: {
        text: "Hubungi Kami",
        href: "#kontak"
      }
    }
  },
  
  about: {
    title: "Tentang KOPMA UNNES",
    subtitle: "Sejarah dan Visi Misi",
    content: `
      <p>KOPMA UNNES didirikan pada tahun 1982 dengan semangat untuk melayani kebutuhan mahasiswa Universitas Negeri Semarang. Sebagai koperasi mahasiswa yang berbadan hukum, kami berkomitmen untuk memberikan layanan terbaik dengan harga yang terjangkau.</p>
      
      <p>Selama lebih dari 40 tahun, KOPMA UNNES telah berkembang menjadi koperasi mahasiswa yang solid dan terpercaya. Kami melayani berbagai kebutuhan mahasiswa mulai dari fotokopi, ATK, makanan, hingga jasa konsultasi bisnis.</p>
      
      <p>Dengan prinsip "Dari Anggota, Oleh Anggota, Untuk Anggota", kami terus berinovasi untuk memberikan pelayanan yang lebih baik dan mengikuti perkembangan zaman.</p>
    `,
    vision: "Menjadi koperasi mahasiswa terdepan yang melayani kebutuhan mahasiswa dengan profesional dan inovatif",
    mission: [
      "Menyediakan layanan berkualitas dengan harga terjangkau",
      "Mengembangkan jiwa kewirausahaan mahasiswa",
      "Membangun kemandirian ekonomi mahasiswa",
      "Menciptakan lingkungan bisnis yang sehat dan berkelanjutan"
    ],
    values: [
      "Integritas",
      "Profesionalisme", 
      "Inovasi",
      "Pelayanan Prima",
      "Kebersamaan"
    ],
    image: "/images/about-kopma.jpg"
  },
  
  stats: {
    title: "Pencapaian KOPMA UNNES",
    items: [
      {
        number: "40+",
        label: "Tahun Berpengalaman",
        icon: "📅"
      },
      {
        number: "5000+",
        label: "Anggota Aktif",
        icon: "👥"
      },
      {
        number: "15+",
        label: "Jenis Layanan",
        icon: "🛠️"
      },
      {
        number: "24/7",
        label: "Layanan Online",
        icon: "🌐"
      }
    ]
  },
  
  services: {
    title: "Layanan KOPMA UNNES",
    subtitle: "Berbagai layanan untuk memenuhi kebutuhan mahasiswa",
    items: [
      {
        id: "fotokopi",
        name: "Fotokopi & Print",
        icon: "🖨️",
        description: "Layanan fotokopi dan print dokumen dengan harga terjangkau untuk mahasiswa",
        features: [
          "Hitam Putih",
          "Warna", 
          "A4/F4/A3",
          "Jilid Spiral",
          "Laminating"
        ],
        location: "Gedung PKM Lt. 2",
        hours: "08:00 - 16:00",
        price: "Mulai dari Rp 200",
        image: "/images/services/fotokopi.jpg"
      },
      {
        id: "atk",
        name: "ATK & Perlengkapan Kuliah",
        icon: "📚",
        description: "Menyediakan alat tulis kantor dan perlengkapan kuliah lengkap",
        features: [
          "Buku Tulis",
          "Pulpen",
          "Map",
          "Kertas HVS",
          "Perlengkapan Gambar"
        ],
        location: "Gedung PKM Lt. 2",
        hours: "08:00 - 16:00",
        price: "Harga Mahasiswa",
        image: "/images/services/atk.jpg"
      },
      {
        id: "kantin",
        name: "Kantin & Snack",
        icon: "🍔",
        description: "Makanan dan minuman sehat dengan harga mahasiswa",
        features: [
          "Makanan Berat",
          "Snack",
          "Minuman",
          "Catering Event",
          "Pre-Order"
        ],
        location: "Gedung PKM Lt. 1",
        hours: "07:00 - 17:00",
        price: "Mulai dari Rp 5.000",
        image: "/images/services/kantin.jpg"
      },
      {
        id: "jasa",
        name: "Jasa Konsultasi Bisnis",
        icon: "💡",
        description: "Konsultasi bisnis dan kewirausahaan untuk mahasiswa",
        features: [
          "Business Plan",
          "Pelatihan Kewirausahaan",
          "Mentoring",
          "Inkubasi Bisnis"
        ],
        location: "Gedung PKM Lt. 2",
        hours: "By Appointment",
        price: "Gratis untuk Anggota",
        image: "/images/services/jasa.jpg"
      },
      {
        id: "pulsa",
        name: "Pulsa & Token Listrik",
        icon: "📱",
        description: "Isi ulang pulsa all operator dan token listrik",
        features: [
          "Pulsa All Operator",
          "Paket Data",
          "Token PLN",
          "E-Money",
          "PPOB"
        ],
        location: "Gedung PKM Lt. 2",
        hours: "08:00 - 16:00",
        price: "Harga Terjangkau",
        image: "/images/services/pulsa.jpg"
      },
      {
        id: "rental",
        name: "Rental & Penyewaan",
        icon: "🎪",
        description: "Penyewaan perlengkapan event dan kegiatan kampus",
        features: [
          "Sound System",
          "Tenda",
          "Kursi",
          "Meja",
          "Dekorasi"
        ],
        location: "Gedung PKM Lt. 2",
        hours: "By Appointment",
        price: "Harga Mahasiswa",
        image: "/images/services/rental.jpg"
      }
    ]
  },
  
  structure: {
    title: "Struktur Organisasi",
    subtitle: "Tim Pengurus KOPMA UNNES",
    description: "Struktur organisasi yang solid dan profesional untuk melayani anggota dengan baik",
    positions: [
      {
        title: "Ketua Umum",
        name: "Ahmad Rizki Pratama",
        image: "/images/structure/ketua.jpg",
        description: "Memimpin dan mengkoordinasikan seluruh kegiatan KOPMA UNNES"
      },
      {
        title: "Wakil Ketua",
        name: "Siti Nurhaliza",
        image: "/images/structure/wakil-ketua.jpg",
        description: "Membantu ketua dalam menjalankan tugas-tugas organisasi"
      },
      {
        title: "Sekretaris",
        name: "Muhammad Fauzi",
        image: "/images/structure/sekretaris.jpg",
        description: "Mengelola administrasi dan dokumentasi organisasi"
      },
      {
        title: "Bendahara",
        name: "Dewi Sartika",
        image: "/images/structure/bendahara.jpg",
        description: "Mengelola keuangan dan laporan keuangan organisasi"
      },
      {
        title: "Bidang Usaha",
        name: "Rizki Aditya",
        image: "/images/structure/bidang-usaha.jpg",
        description: "Mengembangkan dan mengelola unit-unit usaha"
      },
      {
        title: "Bidang Sumber Daya Manusia",
        name: "Nurul Hidayati",
        image: "/images/structure/bidang-sdm.jpg",
        description: "Mengelola pengembangan dan pelatihan anggota"
      }
    ]
  },
  
  testimonials: {
    title: "Testimoni Anggota",
    subtitle: "Apa kata mereka tentang KOPMA UNNES",
    items: [
      {
        name: "Sarah Putri",
        role: "Mahasiswa Pendidikan Matematika",
        content: "KOPMA UNNES sangat membantu kebutuhan kuliah saya. Layanan fotokopi dan ATK-nya lengkap dengan harga yang terjangkau.",
        rating: 5,
        image: "/images/testimonials/sarah.jpg"
      },
      {
        name: "Ahmad Fauzi",
        role: "Mahasiswa Teknik Informatika",
        content: "Konsultasi bisnis di KOPMA UNNES sangat membantu saya dalam mengembangkan startup. Mentornya berpengalaman dan sabar.",
        rating: 5,
        image: "/images/testimonials/ahmad.jpg"
      },
      {
        name: "Maya Sari",
        role: "Mahasiswa Psikologi",
        content: "Kantin KOPMA UNNES menyediakan makanan sehat dengan harga mahasiswa. Menu-nya bervariasi dan rasanya enak.",
        rating: 5,
        image: "/images/testimonials/maya.jpg"
      }
    ]
  },
  
  news: {
    title: "Berita & Informasi",
    subtitle: "Update terbaru dari KOPMA UNNES",
    items: [
      {
        title: "Program Beasiswa KOPMA UNNES 2024",
        excerpt: "KOPMA UNNES membuka program beasiswa untuk mahasiswa berprestasi dengan kriteria tertentu.",
        content: "Program beasiswa ini ditujukan untuk membantu mahasiswa yang berprestasi namun memiliki keterbatasan ekonomi...",
        date: "2024-01-15",
        author: "Tim KOPMA UNNES",
        image: "/images/news/beasiswa.jpg",
        category: "Program",
        tags: ["Beasiswa", "Prestasi", "Mahasiswa"]
      },
      {
        title: "Pelatihan Kewirausahaan Batch 2",
        excerpt: "KOPMA UNNES mengadakan pelatihan kewirausahaan untuk mengembangkan jiwa entrepreneur mahasiswa.",
        content: "Pelatihan ini akan membahas berbagai aspek kewirausahaan mulai dari ide bisnis hingga implementasi...",
        date: "2024-01-10",
        author: "Bidang Usaha KOPMA",
        image: "/images/news/pelatihan.jpg",
        category: "Pelatihan",
        tags: ["Kewirausahaan", "Pelatihan", "Entrepreneur"]
      },
      {
        title: "Layanan Online KOPMA UNNES",
        excerpt: "KOPMA UNNES meluncurkan layanan online untuk memudahkan akses anggota.",
        content: "Dengan layanan online ini, anggota dapat mengakses berbagai layanan KOPMA UNNES kapan saja dan di mana saja...",
        date: "2024-01-05",
        author: "Tim IT KOPMA",
        image: "/images/news/online.jpg",
        category: "Teknologi",
        tags: ["Online", "Digital", "Akses"]
      }
    ]
  },
  
  contact: {
    title: "Hubungi Kami",
    subtitle: "Kami siap melayani Anda",
    description: "Untuk informasi lebih lanjut tentang layanan KOPMA UNNES, silakan hubungi kami melalui kontak di bawah ini.",
    info: {
      address: "Gedung PKM Universitas Negeri Semarang, Jl. Sekaran, Gunungpati, Semarang 50229",
      phone: "+62-24-8508015",
      email: "info@kopmaukmunnes.com",
      hours: "Senin - Jumat: 08:00 - 16:00 WIB"
    },
    form: {
      title: "Kirim Pesan",
      fields: [
        {
          name: "name",
          label: "Nama Lengkap",
          type: "text",
          required: true
        },
        {
          name: "email",
          label: "Email",
          type: "email",
          required: true
        },
        {
          name: "phone",
          label: "No. Telepon",
          type: "tel",
          required: false
        },
        {
          name: "subject",
          label: "Subjek",
          type: "text",
          required: true
        },
        {
          name: "message",
          label: "Pesan",
          type: "textarea",
          required: true
        }
      ]
    },
    map: {
      embed: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3960.123456789!2d110.123456789!3d-7.123456789!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zN8KwMDcnMjQuNCJTIDExMMKwMDcnMjQuNCJF!5e0!3m2!1sen!2sid!4v1234567890123!5m2!1sen!2sid",
      center: {
        lat: -7.123456789,
        lng: 110.123456789
      }
    }
  },
  
  footer: {
    organization: {
      name: "KOPMA UNNES",
      description: "Koperasi Mahasiswa Universitas Negeri Semarang - Dari Anggota, Oleh Anggota, Untuk Anggota",
      established: "1982"
    },
    links: {
      quick: [
        { name: "Tentang Kami", href: "/tentang" },
        { name: "Layanan", href: "/layanan" },
        { name: "Struktur", href: "/struktur" },
        { name: "Kontak", href: "/kontak" }
      ],
      services: [
        { name: "Fotokopi & Print", href: "/layanan#fotokopi" },
        { name: "ATK", href: "/layanan#atk" },
        { name: "Kantin", href: "/layanan#kantin" },
        { name: "Konsultasi Bisnis", href: "/layanan#jasa" }
      ],
      resources: [
        { name: "Berita", href: "/berita" },
        { name: "Download", href: "/download" },
        { name: "FAQ", href: "/faq" },
        { name: "Bantuan", href: "/bantuan" }
      ]
    },
    contact: {
      address: "Gedung PKM Universitas Negeri Semarang",
      city: "Semarang, Jawa Tengah 50229",
      phone: "+62-24-8508015",
      email: "info@kopmaukmunnes.com"
    },
    social: {
      instagram: "https://www.instagram.com/kopmaunnes",
      facebook: "https://www.facebook.com/kopmaunnes",
      youtube: "https://www.youtube.com/kopmaunnes",
      twitter: "https://www.twitter.com/kopmaunnes"
    },
    copyright: "© 2024 KOPMA UNNES. All rights reserved.",
    disclaimer: "Website ini dikembangkan dengan teknologi modern dan keamanan tinggi."
  }
};
