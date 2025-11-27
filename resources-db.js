// ==================== GENEL ÇALIŞMA KAYNAK VERİTABANI ====================
// Herkes için: Üniversite, Lise, Sertifika, Dil Öğrenme, vb.

const RESOURCES_DB = {
  subjects: {
    // ===== YKS HAZ IRLIK (TYT + AYT) =====
    yks: {
      name: 'YKS Hazırlık (TYT/AYT)',
      icon: '🎓',
      category: 'Sınav Hazırlık',
      youtube: {
        temel: [
          { name: 'Şenol Hoca (Matematik)', description: 'TYT mat temelden', url: 'https://www.youtube.com/@senolhoca' },
          { name: 'Fizikfinito', description: 'TYT fizik başlangıç', url: 'https://www.youtube.com/@fizikfinito' },
          { name: 'Kimya Adası', description: 'TYT kimya temel', url: 'https://www.youtube.com/@kimyaadasi' }
        ],
        orta: [
          { name: 'Rehber Matematik', description: 'TYT/AYT matematik, 1M+ abone', url: 'https://www.youtube.com/@rehbermatematik' },
          { name: 'Hocalara Geldik', description: 'Eğlenceli matematik', url: 'https://www.youtube.com/@hocaarageldik' },
          { name: 'VIP Fizik', description: 'TYT/AYT fizik', url: 'https://www.youtube.com/@vipfizik' },
          { name: 'Benim Hocam', description: 'Kimya anlatım', url: 'https://www.youtube.com/@benimhocam' },
          { name: 'Senin Biyolojin', description: 'Detaylı biyoloji', url: 'https://www.youtube.com/@seninbiyolojin' }
        ],
        ileri: [
          { name: 'Sml Hoca', description: 'AYT zor matematik', url: 'https://www.youtube.com/@smlhoca' },
          { name: 'Özcan Aykın', description: 'AYT fizik deney odaklı', url: 'https://www.youtube.com/@ozcanaykin' },
          { name: 'Kimya Özel', description: 'AYT kimya ileri', url: 'https://www.youtube.com/@kimyaozel' },
          { name: 'Dr. Biyoloji', description: 'AYT biyoloji ÖSYM dili', url: 'https://www.youtube.com/@drbiyoloji' }
        ]
      },
      books: [
        { name: '3D Yayınları', description: 'Video çözümlü zorlu sorular', level: 'ileri' },
        { name: 'Limit Yayınları', description: 'AYT zor sorular', level: 'ileri' },
        { name: 'Palme Yayınları', description: 'Orta-zor kapsamlı', level: 'orta' },
        { name: 'Karekök Yayınları', description: 'Temel-orta seviye', level: 'temel' }
      ]
    },

    // ===== AKADEMİK DERSLER =====
    matematik: {
      name: 'Matematik (Genel)',
      icon: '🔢',
      category: 'Akademik',
      youtube: {
        temel: [
          { name: 'Khan Academy Türkçe', description: 'Temelden ileri seviyeye tüm matematik', url: 'https://www.youtube.com/@KhanAcademyTurkce' },
          { name: 'Şenol Hoca', description: 'Lise matematiği, sıfırdan başlayanlara ideal', url: 'https://www.youtube.com/@senolhoca' }
        ],
        orta: [
          { name: 'Rehber Matematik', description: 'Popüler, kapsamlı anlatım', url: 'https://www.youtube.com/@rehbermatematik' },
          { name: '3Blue1Brown', description: 'Görselleştirme ile matematik (İngilizce)', url: 'https://www.youtube.com/@3blue1brown' }
        ],
        ileri: [
          { name: 'MIT OpenCourseWare', description: 'Üniversite seviyesi matematik', url: 'https://www.youtube.com/@mitocw' },
          { name: 'Sml Hoca', description: 'İleri seviye problem çözme', url: 'https://www.youtube.com/@smlhoca' }
        ]
      }
    },

    programlama: {
      name: 'Programlama',
      icon: '💻',
      category: 'Teknoloji',
      youtube: {
        temel: [
          { name: 'Sadık Turan', description: 'Python, JavaScript, web development', url: 'https://www.youtube.com/@sadikturan' },
          { name: 'Engin Demiroğ', description: 'C#, Java, yazılım geliştirme', url: 'https://www.youtube.com/@engindemirog' },
          { name: 'Murat Yücedağ', description: 'C#, ASP.NET, proje örnekleri', url: 'https://www.youtube.com/@muratyucedag' }
        ],
        orta: [
          { name: 'freeCodeCamp', description: 'Full stack development (İngilizce)', url: 'https://www.youtube.com/@freecodecamp' },
          { name: 'Traversy Media', description: 'Web development tutorials', url: 'https://www.youtube.com/@TraversyMedia' },
          { name: 'Kablosuz Kedi', description: 'Yazılım mimarisi, clean code', url: 'https://www.youtube.com/@kablosuzkedi' }
        ],
        ileri: [
          { name: 'ArjanCodes', description: 'Software design patterns', url: 'https://www.youtube.com/@ArjanCodes' },
          { name: 'Hussein Nasser', description: 'Backend engineering', url: 'https://www.youtube.com/@hnasr' }
        ]
      },
      books: [
        { name: 'Head First Python', description: 'Görsel, eğlenceli Python kitabı', level: 'temel' },
        { name: 'Clean Code', description: 'Temiz kod yazma prensipleri', level: 'orta' },
        { name: 'Design Patterns', description: 'Gang of Four tasarım desenleri', level: 'ileri' }
      ]
    },

    ingilizce: {
      name: 'İngilizce',
      icon: '🇬🇧',
      category: 'Dil',
      youtube: {
        temel: [
          { name: 'English with Lucy', description: 'Temel İngilizce, telaffuz', url: 'https://www.youtube.com/@EnglishwithLucy' },
          { name: 'Learn English with TV Series', description: 'Dizilerle İngilizce', url: 'https://www.youtube.com/@LearnEnglishWithTVSeries' }
        ],
        orta: [
          { name: 'BBC Learning English', description: 'Orta-ileri seviye İngilizce', url: 'https://www.youtube.com/@bbclearningenglish' },
          { name: 'English Addict with Mr Duncan', description: 'Akıcı konuşma pratiği', url: 'https://www.youtube.com/@duncaninchina' }
        ],
        ileri: [
          { name: 'TED-Ed', description: 'Akademik İngilizce, zengin vocabulary', url: 'https://www.youtube.com/@TEDEd' },
          { name: 'Rachel\'s English', description: 'İleri telaffuz ve aksan', url: 'https://www.youtube.com/@rachelsenglish' }
        ]
      },
      books: [
        { name: 'English Grammar in Use', description: 'Cambridge klasiği', level: 'orta' },
        { name: 'The Great Gatsby', description: 'İngilizce roman okuma', level: 'ileri' }
      ]
    },

    veri_bilimi: {
      name: 'Veri Bilimi & AI',
      icon: '📊',
      category: 'Teknoloji',
      youtube: {
        temel: [
          { name: 'Atıl Samancıoğlu', description: 'Python, veri bilimi, makine öğrenmesi', url: 'https://www.youtube.com/@atilsamancioglu' },
          { name: 'Veri Bilimi Okulu', description: 'Türkçe veri bilimi eğitimleri', url: 'https://www.youtube.com/@veribilimiokulu' }
        ],
        orta: [
          { name: 'StatQuest', description: 'İstatistik ve ML görselleştirme', url: 'https://www.youtube.com/@statquest' },
          { name: 'Sentdex', description: 'Python data science tutorials', url: 'https://www.youtube.com/@sentdex' }
        ],
        ileri: [
          { name: 'Two Minute Papers', description: 'AI research paper incelemeleri', url: 'https://www.youtube.com/@TwoMinutePapers' },
          { name: 'Yannic Kilcher', description: 'Derin öğrenme araştırmaları', url: 'https://www.youtube.com/@YannicKilcher' }
        ]
      }
    },

    grafik_tasarim: {
      name: 'Grafik Tasarım',
      icon: '🎨',
      category: 'Yaratıcı',
      youtube: {
        temel: [
          { name: 'Fevzi Gökmen', description: 'Photoshop, Illustrator Türkçe', url: 'https://www.youtube.com/@fevzigokmen' },
          { name: 'Tutor Baran', description: 'Grafik tasarım dersleri', url: 'https://www.youtube.com/@tutorbaran' }
        ],
        orta: [
          { name: 'Spoon Graphics', description: 'Illustrator & design tutorials', url: 'https://www.youtube.com/@spoonographics' },
          { name: 'Will Paterson', description: 'Logo design, branding', url: 'https://www.youtube.com/@WillPaterson' }
        ],
        ileri: [
          { name: 'The Futur', description: 'Profesyonel tasarım iş dünyası', url: 'https://www.youtube.com/@thefutur' },
          { name: 'Aaron Draplin', description: 'Logo design masterclass', url: 'https://www.youtube.com/@Draplin' }
        ]
      }
    },

    muzik: {
      name: 'Müzik & Enstrüman',
      icon: '🎵',
      category: 'Yaratıcı',
      youtube: {
        temel: [
          { name: 'Gitar Dersleri', description: 'Gitar öğrenme, akorlar', url: 'https://www.youtube.com/@gitardersleri' },
          { name: 'Piano Lessons', description: 'Piyano başlangıç dersleri', url: 'https://www.youtube.com/@pianolessons' }
        ],
        orta: [
          { name: 'Andrew Huang', description: 'Müzik prodüksiyon, yaratıcılık', url: 'https://www.youtube.com/@andrewhuang' },
          { name: 'Adam Neely', description: 'Müzik teorisi, jazz', url: 'https://www.youtube.com/@AdamNeely' }
        ],
        ileri: [
          { name: 'Rick Beato', description: 'İleri müzik teorisi, prodüksiyon', url: 'https://www.youtube.com/@RickBeato' },
          { name: 'Jacob Collier', description: 'Müzik harmonisi ve arrangement', url: 'https://www.youtube.com/@jacobcollier' }
        ]
      }
    },

    is_gelistirme: {
      name: 'Kişisel Gelişim & İş',
      icon: '💼',
      category: 'Kariyer',
      youtube: {
        temel: [
          { name: 'Ali Biçim', description: 'Verimlilik, zaman yönetimi', url: 'https://www.youtube.com/@alibicim' },
          { name: 'Barış Özcan', description: 'Teknoloji, bilim, toplum', url: 'https://www.youtube.com/@barisozcann' }
        ],
        orta: [
          { name: 'Thomas Frank', description: 'Productivity, study tips', url: 'https://www.youtube.com/@Thomasfrank' },
          { name: 'Ali Abdaal', description: 'Productivity, career growth', url: 'https://www.youtube.com/@aliabdaal' }
        ],
        ileri: [
          { name: 'Y Combinator', description: 'Startup, entrepreneurship', url: 'https://www.youtube.com/@ycombinator' },
          { name: 'Naval', description: 'Wealth, philosophy', url: 'https://www.youtube.com/@NavalRavikant' }
        ]
      }
    }
  },

  // ===== ÇALIŞMA MODLARI =====
  studyModes: {
    sprint: {
      name: 'Sprint Mode',
      icon: '⚡',
      description: 'Kısa süreli yoğun çalışma (Sınav/Sunum yaklaşıyor!)',
      pomodoro: { work: 45, break: 10 },
      dailyHours: [5, 7],
      intensity: 'Çok Yüksek'
    },
    marathon: {
      name: 'Marathon Mode',
      icon: '🔥',
      description: 'Uzun süreli yoğun çalışma (Büyük proje)',
      pomodoro: { work: 50, break: 10 },
      dailyHours: [4, 6],
      intensity: 'Yüksek'
    },
    balanced: {
      name: 'Balanced Mode',
      icon: '⚖️',
      description: 'Dengeli ve sürdürülebilir',
      pomodoro: { work: 25, break: 5 },
      dailyHours: [2, 4],
      intensity: 'Orta'
    },
    casual: {
      name: 'Casual Mode',
      icon: '🌱',
      description: 'Rahat tempo, hobi amaçlı',
      pomodoro: { work: 30, break: 10 },
      dailyHours: [1, 2],
      intensity: 'Düşük'
    }
  },

  // ===== HAZIR ŞABLONLAR =====
  templates: {
    uni_final: {
      name: 'Üniversite Final Hazırlık',
      subject: null,
      level: 'orta',
      mode: 'sprint',
      duration: 14,
      daysPerWeek: 7,
      hoursPerDay: 5,
      description: '2 hafta yoğun final hazırlığı',
      topics: ['Geçmiş sınavlar', 'Ders notları', 'Konu özetleri', 'Soru çözümü']
    },

    coding_bootcamp: {
      name: 'Web Development Bootcamp',
      subject: 'programlama',
      level: 'temel',
      mode: 'marathon',
      duration: 90,
      daysPerWeek: 5,
      hoursPerDay: 4,
      description: '3 aylık yoğun web development',
      topics: ['HTML/CSS', 'JavaScript', 'React', 'Node.js', 'Proje']
    },

    language_learning: {
      name: 'İngilizce Akıcılık Programı',
      subject: 'ingilizce',
      level: 'orta',
      mode: 'balanced',
      duration: 120,
      daysPerWeek: 6,
      hoursPerDay: 2,
      description: '4 ay dengeli İngilizce çalışması',
      topics: ['Vocabulary', 'Grammar', 'Listening', 'Speaking', 'Reading']
    },

    hobby_learning: {
      name: 'Hobi Öğrenme (Gitar/Çizim/vb)',
      subject: 'muzik',
      level: 'temel',
      mode: 'casual',
      duration: 180,
      daysPerWeek: 3,
      hoursPerDay: 1,
      description: '6 ay rahat tempolu hobi öğrenme',
      topics: []
    },

    cert_prep: {
      name: 'Sertifika Sınavı Hazırlık',
      subject: null,
      level: 'ileri',
      mode: 'marathon',
      duration: 60,
      daysPerWeek: 6,
      hoursPerDay: 4,
      description: '2 ay yoğun sertifika hazırlığı (AWS, Google, vb.)',
      topics: ['Teori', 'Lab çalışmaları', 'Mock exams', 'Zayıf konular']
    }
  },

  // ===== BOOTCAMP PROGRAMLARI =====
  // Sistematik, yoğun, adım adım ilerleyen kurslar
  bootcamps: [
    {
      id: 'web-dev-bootcamp',
      name: 'Full Stack Web Development Bootcamp',
      provider: 'Sadık Turan',
      subject: 'programlama',
      url: 'https://www.youtube.com/@SadikTuran',
      totalHours: 120,
      weeks: 12,
      daysPerWeek: 5,
      hoursPerDay: 4,
      topics: ['HTML/CSS', 'JavaScript', 'React', 'Node.js', 'MongoDB', 'Proje'],
      systematic: true,
      difficulty: 'temel',
      description: "0'dan full-stack developer olun!",
      features: ['Adım adım video serisi', 'Gerçek projeler', 'Sertifika']
    },
    {
      id: 'data-science-bootcamp',
      name: 'Veri Bilimi Bootcamp',
      provider: 'Atıl Samancıoğlu',
      subject: 'veri-bilimi',
      url: 'https://www.youtube.com/@AtilSamancioglu',
      totalHours: 100,
      weeks: 10,
      daysPerWeek: 5,
      hoursPerDay: 4,
      topics: ['Python', 'Pandas', 'NumPy', 'Matplotlib', 'Machine Learning'],
      systematic: true,
      difficulty: 'orta',
      description: 'Sıfırdan veri bilimci olun!',
      features: ['Uygulamalı projeler', 'Dataset analizi', 'Gerçek vakalar']
    },
    {
      id: 'english-bootcamp',
      name: '90 Günde İngilizce Akıcılık Bootcamp',
      provider: 'EnglishWithLucy',
      subject: 'ingilizce',
      url: 'https://www.youtube.com/@EnglishWithLucy',
      totalHours: 90,
      weeks: 13,
      daysPerWeek: 7,
      hoursPerDay: 1,
      topics: ['Günlük Konuşma', 'Grammar', 'Vocabulary', 'Listening', 'Speaking'],
      systematic: true,
      difficulty: 'orta',
      description: 'Her gün 1 saat, 90 günde akıcı İngilizce!',
      features: ['Günlük video', 'Pratik odaklı', 'Altyazılı']
    }
  ]
};

// ===== YARDIMCI FONKSİYONLAR =====

function getResourcesByLevel(subject, level) {
  const subjectData = RESOURCES_DB.subjects[subject];
  if (!subjectData) return { youtube: [], books: [] };

  return {
    youtube: subjectData.youtube[level] || [],
    books: (subjectData.books || []).filter(book => book.level === level)
  };
}

function getAllResources(subject) {
  const subjectData = RESOURCES_DB.subjects[subject];
  if (!subjectData) return { youtube: [], books: [] };

  const allYoutube = [
    ...(subjectData.youtube.temel || []),
    ...(subjectData.youtube.orta || []),
    ...(subjectData.youtube.ileri || [])
  ];

  return {
    youtube: allYoutube,
    books: subjectData.books || []
  };
}

function getTemplate(templateId) {
  return RESOURCES_DB.templates[templateId] || null;
}

function getStudyMode(modeId) {
  return RESOURCES_DB.studyModes[modeId] || null;
}

function getAllSubjects() {
  return Object.keys(RESOURCES_DB.subjects).map(key => ({
    id: key,
    name: RESOURCES_DB.subjects[key].name,
    icon: RESOURCES_DB.subjects[key].icon,
    category: RESOURCES_DB.subjects[key].category
  }));
}

function getAllBootcamps() {
  return RESOURCES_DB.bootcamps || [];
}

function getBootcamp(bootcampId) {
  return RESOURCES_DB.bootcamps.find(b => b.id === bootcampId) || null;
}

function isBootcamp(url) {
  // URL bir bootcamp'e ait mi kontrol et
  return RESOURCES_DB.bootcamps.some(b => url.includes(b.provider.toLowerCase()));
}
