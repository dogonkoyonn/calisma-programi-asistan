// ==================== MOTİVASYON SÖZLERİ ====================
// Rastgele motivasyon sözleri sistemi

const MOTIVATIONAL_QUOTES = [
  // Çalışma & Başarı
  { text: "Başarı, her gün tekrarlanan küçük çabaların toplamıdır.", author: "Robert Collier" },
  { text: "Bugün yapabileceğini yarına bırakma.", author: "Benjamin Franklin" },
  { text: "Zor olan doğru olandır.", author: "Anonim" },
  { text: "Başlamak için harika olmak zorunda değilsin, ama harika olmak için başlamak zorundasın.", author: "Zig Ziglar" },
  { text: "Küçük adımlar büyük yolculukları başlatır.", author: "Anonim" },

  // Öğrenme
  { text: "Öğrenmenin yaşı yoktur.", author: "Anonim" },
  { text: "Her gün öğrendiğin bir şey, seni dünkü halinden daha iyi yapar.", author: "Anonim" },
  { text: "Bilgi güçtür.", author: "Francis Bacon" },
  { text: "Eğitim en güçlü silahtır.", author: "Nelson Mandela" },
  { text: "Okumak, zihni besler.", author: "Seneca" },

  // Azim & Kararlılık
  { text: "Pes etme! Başarı genellikle bir sonraki denemede gelir.", author: "Anonim" },
  { text: "Başarısızlık, başarının basamaklarından biridir.", author: "Anonim" },
  { text: "Yılmadan çalışan kazanır.", author: "Anonim" },
  { text: "Zorluklar, seni güçlendirir.", author: "Anonim" },
  { text: "Hedefine odaklan, engellere değil.", author: "Anonim" },

  // Zaman & Verimlilik
  { text: "Zaman, en değerli varlığındır. Onu akıllıca kullan.", author: "Anonim" },
  { text: "Bugün ektiğini yarın biçersin.", author: "Anonim" },
  { text: "Her dakika değerlidir.", author: "Anonim" },
  { text: "Erteleme, başarının düşmanıdır.", author: "Anonim" },
  { text: "Disiplin, özgürlüğe giden yoldur.", author: "Jocko Willink" },

  // Motivasyon
  { text: "Kendine inan, yarısını başardın bile!", author: "Theodore Roosevelt" },
  { text: "Hayallerin büyüklüğü, başarının sınırlarını belirler.", author: "Anonim" },
  { text: "Yapamam deme, nasıl yaparım de.", author: "Anonim" },
  { text: "Bugün zor, yarın daha zor, ama ertesi gün harika olacak.", author: "Jack Ma" },
  { text: "Motivasyon seni başlatır, alışkanlık seni devam ettirir.", author: "Jim Rohn" },

  // Türk Atasözleri
  { text: "Damlaya damlaya göl olur.", author: "Türk Atasözü" },
  { text: "Sakla samanı, gelir zamanı.", author: "Türk Atasözü" },
  { text: "Emek olmadan yemek olmaz.", author: "Türk Atasözü" },
  { text: "Düşe kalka yürünür.", author: "Türk Atasözü" },
  { text: "Ağaç yaşken eğilir.", author: "Türk Atasözü" },

  // İlham Verici
  { text: "Her uzman bir zamanlar yeni başlayandı.", author: "Helen Hayes" },
  { text: "Tek sınır, kendi zihnimizdir.", author: "Napoleon Hill" },
  { text: "Bugün imkansız görünen, yarın mümkün olabilir.", author: "Anonim" },
  { text: "Başarıya giden yolda engellerle karşılaşmak normaldir.", author: "Anonim" },
  { text: "Her yeni gün, yeni bir başlangıçtır.", author: "Anonim" },

  // Kısa & Güçlü
  { text: "Şimdi başla!", author: "Anonim" },
  { text: "Yapabilirsin!", author: "Anonim" },
  { text: "Odaklan ve çalış.", author: "Anonim" },
  { text: "Başarı seni bekliyor.", author: "Anonim" },
  { text: "Bugün harika bir gün!", author: "Anonim" },

  // Ekstra
  { text: "Bilgi paylaştıkça çoğalır.", author: "Anonim" },
  { text: "Öğrenmeyi seven, öğretmeyi de sever.", author: "Anonim" },
  { text: "Sabır acıdır, meyvesi tatlıdır.", author: "Jean-Jacques Rousseau" },
  { text: "Çalışmak ibadettir.", author: "Hz. Mevlana" },
  { text: "Hayat kısa, öğrenecek çok şey var.", author: "Anonim" }
];

class MotivationalQuotes {
  constructor() {
    this.quotes = MOTIVATIONAL_QUOTES;
    this.currentQuote = null;
    this.popupVisible = false;
    this.init();
  }

  init() {
    this.showRandomQuote();
    this.createPopupContainer();
    this.startRandomPopups();
    console.log('💬 Motivasyon Sözleri yüklendi');
  }

  /**
   * Popup container oluştur
   */
  createPopupContainer() {
    if (document.getElementById('motivationPopup')) return;

    const popup = document.createElement('div');
    popup.id = 'motivationPopup';
    popup.className = 'motivation-popup';
    popup.innerHTML = `
      <div class="popup-content">
        <button class="popup-close" onclick="motivationalQuotes.hidePopup()">×</button>
        <div class="popup-icon">💡</div>
        <p class="popup-text"></p>
        <span class="popup-author"></span>
      </div>
    `;
    document.body.appendChild(popup);
  }

  /**
   * Rastgele zamanlarda popup göster
   */
  startRandomPopups() {
    // İlk popup 1-3 dakika sonra
    const firstDelay = this.getRandomDelay(1, 3);
    setTimeout(() => {
      this.showPopup();
      this.scheduleNextPopup();
    }, firstDelay);
  }

  /**
   * Sonraki popup'ı planla (3-8 dakika arası rastgele)
   */
  scheduleNextPopup() {
    const delay = this.getRandomDelay(3, 8);
    setTimeout(() => {
      this.showPopup();
      this.scheduleNextPopup();
    }, delay);
  }

  /**
   * Rastgele gecikme süresi (dakika cinsinden)
   */
  getRandomDelay(minMinutes, maxMinutes) {
    const min = minMinutes * 60 * 1000;
    const max = maxMinutes * 60 * 1000;
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Popup göster
   */
  showPopup() {
    if (this.popupVisible) return;

    const quote = this.getRandomQuote();
    const popup = document.getElementById('motivationPopup');
    if (!popup) return;

    const textEl = popup.querySelector('.popup-text');
    const authorEl = popup.querySelector('.popup-author');

    if (textEl) textEl.textContent = `"${quote.text}"`;
    if (authorEl) authorEl.textContent = `— ${quote.author}`;

    // Rastgele pozisyon (sol üst veya sağ üst)
    const position = Math.random() > 0.5 ? 'top-left' : 'top-right';
    popup.className = `motivation-popup ${position} show`;
    this.popupVisible = true;

    // 8 saniye sonra otomatik kapat
    setTimeout(() => {
      this.hidePopup();
    }, 8000);
  }

  /**
   * Popup gizle
   */
  hidePopup() {
    const popup = document.getElementById('motivationPopup');
    if (popup) {
      popup.classList.remove('show');
      this.popupVisible = false;
    }
  }

  /**
   * Rastgele söz getir
   */
  getRandomQuote() {
    const index = Math.floor(Math.random() * this.quotes.length);
    return this.quotes[index];
  }

  /**
   * Rastgele sözü göster
   */
  showRandomQuote() {
    this.currentQuote = this.getRandomQuote();
    this.renderQuote();
  }

  /**
   * Sözü render et
   */
  renderQuote() {
    // Footer'a ekle veya mevcut elementi güncelle
    let container = document.getElementById('motivationalQuote');

    if (!container) {
      // Footer yoksa oluştur
      this.createFooter();
      container = document.getElementById('motivationalQuote');
    }

    if (container && this.currentQuote) {
      container.innerHTML = `
        <div class="quote-content">
          <span class="quote-icon">💡</span>
          <p class="quote-text">"${this.currentQuote.text}"</p>
          <span class="quote-author">— ${this.currentQuote.author}</span>
        </div>
        <button class="quote-refresh" onclick="motivationalQuotes.showRandomQuote()" title="Yeni söz">
          🔄
        </button>
      `;
    }
  }

  /**
   * Footer oluştur
   */
  createFooter() {
    const mainContent = document.querySelector('.main-content');
    if (!mainContent) {
      setTimeout(() => this.createFooter(), 500);
      return;
    }

    // Footer zaten varsa ekleme
    if (document.getElementById('appFooter')) return;

    const footer = document.createElement('footer');
    footer.id = 'appFooter';
    footer.className = 'app-footer';
    footer.innerHTML = `
      <div class="footer-content">
        <div id="motivationalQuote" class="motivational-quote"></div>
      </div>
    `;

    mainContent.appendChild(footer);
  }

  /**
   * Belirli bir süre sonra yeni söz göster
   */
  autoRefresh(intervalMinutes = 5) {
    setInterval(() => {
      this.showRandomQuote();
    }, intervalMinutes * 60 * 1000);
  }
}

// Global instance
const motivationalQuotes = new MotivationalQuotes();
window.motivationalQuotes = motivationalQuotes;

// 5 dakikada bir yeni söz
motivationalQuotes.autoRefresh(5);
