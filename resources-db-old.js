// Kaynak Veritabanı - 2024-2025 Güncel
// System.txt'den alınmış, frontend için optimize edilmiş

const RESOURCES_DB = {
  subjects: {
    matematik: {
      name: 'Matematik',
      icon: '🔢',
      youtube: {
        temel: [
          { name: 'Şenol Hoca', description: 'Temelden anlatır, matematiği zayıf olanlar için ideal', url: 'https://www.youtube.com/@senolhoca' },
          { name: 'Bıyıklı Matematik (Selim Hoca)', description: 'Sade ve anlaşılır', url: 'https://www.youtube.com/@biyiklimatematik' }
        ],
        orta: [
          { name: 'Rehber Matematik', description: '1M+ abone, çok popüler, 49 Günde TYT serisi', url: 'https://www.youtube.com/@rehbermatematik' },
          { name: 'Hocalara Geldik', description: '1M+ abone, eğlenceli (Vural & Koray Hoca)', url: 'https://www.youtube.com/@hocaarageldik' },
          { name: 'Mert Hoca', description: 'Her seviye, sınav kampları, canlı yayınlar', url: 'https://www.youtube.com/@merthoca' },
          { name: 'Şifreli Matematik', description: 'Kısa yollar ve taktikler', url: 'https://www.youtube.com/@sifrelimatematik' },
          { name: 'Moz Akademi', description: 'Soru çözümü odaklı', url: 'https://www.youtube.com/@mozakademi' }
        ],
        ileri: [
          { name: 'Sml Hoca (İsmail Kocabaş)', description: 'Yeni nesil zorlu sorular', url: 'https://www.youtube.com/@smlhoca' },
          { name: 'Eyüp B. Matematik', description: 'AYT Geometri için güçlü', url: 'https://www.youtube.com/@eyupbmatematik' },
          { name: 'Yaşar Hoca MathMan', description: 'AYT kampları, hızlı yükseliyor', url: 'https://www.youtube.com/@yasarhocamathman' }
        ]
      },
      books: [
        { name: '3D Yayınları', description: 'Video çözümlü (Eyüp Boncuk hoca), zorlu sorular', level: 'ileri' },
        { name: 'Limit Yayınları', description: 'AYT için zor sorular', level: 'ileri' },
        { name: 'Palme Yayınları', description: 'Orta-zor seviye, kapsamlı', level: 'orta' },
        { name: 'Karekök Yayınları', description: 'Temel-orta seviye', level: 'temel' }
      ]
    },
    fizik: {
      name: 'Fizik',
      icon: '⚛️',
      youtube: {
        temel: [
          { name: 'Fizikfinito', description: 'TYT için ideal', url: 'https://www.youtube.com/@fizikfinito' },
          { name: 'Fizikle Barış', description: 'Akıcı konu anlatımı', url: 'https://www.youtube.com/@fiziklebaris' }
        ],
        orta: [
          { name: 'VIP Fizik', description: 'Popüler, Özcan Aykın\'a alternatif', url: 'https://www.youtube.com/@vipfizik' },
          { name: 'Umut Öncül Akademi', description: 'Kaliteli içerik', url: 'https://www.youtube.com/@umutonculakademi' },
          { name: 'Ertan Sinan Şahin', description: 'Deneyimli hoca', url: 'https://www.youtube.com/@ertansinansahin' }
        ],
        ileri: [
          { name: 'Özcan Aykın Fizik', description: 'Deneylerle anlatım, çok bilgili', url: 'https://www.youtube.com/@ozcanaykin' },
          { name: 'Altuğ Güneş Fizik', description: 'ÖSYM hedefli sorular', url: 'https://www.youtube.com/@altuggunesfizik' }
        ]
      },
      books: [
        { name: 'Palme Yayınları', description: 'Kapsamlı soru bankası', level: 'orta' },
        { name: 'Limit Yayınları', description: 'Zorlu sorular', level: 'ileri' }
      ]
    },
    kimya: {
      name: 'Kimya',
      icon: '🧪',
      youtube: {
        temel: [
          { name: 'Kimya Adası', description: 'Özel ders tadında anlatım', url: 'https://www.youtube.com/@kimyaadasi' },
          { name: 'Ferrum', description: 'MEB kitabı odaklı', url: 'https://www.youtube.com/@ferrum' }
        ],
        orta: [
          { name: 'Benim Hocam', description: '2016\'dan beri, kaliteli anlatım', url: 'https://www.youtube.com/@benimhocam' },
          { name: 'Kimya Hocam', description: '9-12 tüm konular, deneme çözümleri', url: 'https://www.youtube.com/@kimyahocam' },
          { name: 'Bizim Hocalar', description: 'Detaylı konu anlatımı', url: 'https://www.youtube.com/@bizimhocalar' },
          { name: 'Kimyacı Gülçin Hoca', description: 'Popüler', url: 'https://www.youtube.com/@kimyacigulcin' }
        ],
        ileri: [
          { name: 'Kimya Özel', description: 'Köklü kanal, eski ama çok faydalı', url: 'https://www.youtube.com/@kimyaozel' },
          { name: 'Erdem\'li Kimya', description: 'Güncel içerik', url: 'https://www.youtube.com/@erdemlikimya' }
        ]
      },
      books: [
        { name: 'Palme Yayınları', description: 'Kapsamlı', level: 'orta' },
        { name: 'Limit Yayınları', description: 'Zor sorular', level: 'ileri' }
      ]
    },
    biyoloji: {
      name: 'Biyoloji',
      icon: '🧬',
      youtube: {
        temel: [
          { name: 'Selin Hoca', description: 'Eğlenceli ve kaliteli', url: 'https://www.youtube.com/@selinhoca' }
        ],
        orta: [
          { name: 'Senin Biyolojin', description: 'Dokümanlı anlatım, çok detaylı', url: 'https://www.youtube.com/@seninbiyolojin' },
          { name: 'Bekir Avşar', description: 'Yayınevi kitapları çözümlü', url: 'https://www.youtube.com/@bekiravsar' },
          { name: 'FUNDAmentals Biyoloji', description: 'Güçlü konu anlatımı', url: 'https://www.youtube.com/@fundamentalsbiyoloji' },
          { name: 'Biosem', description: 'Popüler kanal', url: 'https://www.youtube.com/@biosem' }
        ],
        ileri: [
          { name: 'Dr. Biyoloji (Barış Hoca)', description: 'Çok popüler, ÖSYM diline hakim', url: 'https://www.youtube.com/@drbiyoloji' }
        ]
      },
      books: [
        { name: 'Palme Yayınları', description: 'Kapsamlı', level: 'orta' },
        { name: 'Limit Yayınları', description: 'Zor sorular', level: 'ileri' }
      ]
    }
  },

  // Çalışma Modları
  studyModes: {
    marathon: {
      name: 'Marathon Mode',
      icon: '🔥',
      description: 'Yoğun tempolu çalışma (Sınav yakın!)',
      pomodoro: { work: 50, break: 10 },
      dailyHours: [6, 8],
      intensity: 'Yüksek'
    },
    balanced: {
      name: 'Balanced Mode',
      icon: '⚖️',
      description: 'Dengeli ve sürdürülebilir',
      pomodoro: { work: 25, break: 5 },
      dailyHours: [3, 4],
      intensity: 'Orta'
    },
    chill: {
      name: 'Chill Mode',
      icon: '🌱',
      description: 'Rahat ve stressiz',
      pomodoro: { work: 60, break: 15 },
      dailyHours: [1, 2],
      intensity: 'Düşük'
    }
  },

  // Hazır Program Şablonları
  templates: {
    tyt_mat: {
      name: 'TYT Matematik Hazırlık',
      subject: 'matematik',
      level: 'orta',
      mode: 'balanced',
      duration: 90, // gün
      daysPerWeek: 5,
      hoursPerDay: 3,
      description: '3 ay boyunca TYT matematiği sıfırdan sağlam öğren',
      topics: [
        'Temel Kavramlar',
        'Sayı Basamakları',
        'Bölme-Bölünebilme',
        'EBOB-EKOK',
        'Rasyonel Sayılar',
        'Basit Eşitsizlikler',
        'Mutlak Değer',
        'Üslü Sayılar',
        'Köklü Sayılar',
        'Çarpanlara Ayırma',
        'Oran-Orantı',
        'Denklem Çözme',
        'Problemler'
      ]
    },
    ayt_fizik: {
      name: 'AYT Fizik Yoğunlaştırma',
      subject: 'fizik',
      level: 'ileri',
      mode: 'marathon',
      duration: 60,
      daysPerWeek: 6,
      hoursPerDay: 4,
      description: '2 ay yoğun fizik çalışması, zor sorulara odaklan',
      topics: [
        'Kuvvet ve Hareket',
        'Newton Kanunları',
        'İş-Güç-Enerji',
        'İtme-Çarpma',
        'Tork',
        'Basit Makineler',
        'Elektrik ve Manyetizma',
        'Optik',
        'Modern Fizik'
      ]
    },
    final_sprint: {
      name: 'Vize/Final Sprint',
      subject: null, // Kullanıcı seçer
      level: 'orta',
      mode: 'marathon',
      duration: 14,
      daysPerWeek: 7,
      hoursPerDay: 5,
      description: '2 haftalık yoğun sınav hazırlığı',
      topics: [] // Kullanıcı ekler
    }
  }
};

// Yardımcı Fonksiyonlar

/**
 * Seviyeye göre kaynakları filtrele
 */
function getResourcesByLevel(subject, level) {
  const subjectData = RESOURCES_DB.subjects[subject];
  if (!subjectData) return { youtube: [], books: [] };

  return {
    youtube: subjectData.youtube[level] || [],
    books: subjectData.books.filter(book => book.level === level)
  };
}

/**
 * Tüm kaynakları getir (seviye fark etmeksizin)
 */
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
    books: subjectData.books
  };
}

/**
 * Şablon bilgilerini getir
 */
function getTemplate(templateId) {
  return RESOURCES_DB.templates[templateId] || null;
}

/**
 * Çalışma modu bilgilerini getir
 */
function getStudyMode(modeId) {
  return RESOURCES_DB.studyModes[modeId] || null;
}

/**
 * Tüm dersleri listele
 */
function getAllSubjects() {
  return Object.keys(RESOURCES_DB.subjects).map(key => ({
    id: key,
    name: RESOURCES_DB.subjects[key].name,
    icon: RESOURCES_DB.subjects[key].icon
  }));
}
