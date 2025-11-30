/**
 * PDF Export Module
 * Program ve konuları PDF formatında dışa aktarır
 */

class PDFExporter {
  constructor() {
    this.jsPDF = window.jspdf?.jsPDF;
    console.log('PDF Exporter initialized');
  }

  /**
   * Programı PDF olarak dışa aktar
   * @param {Object} program - Program objesi
   */
  exportProgram(program) {
    if (!this.jsPDF) {
      console.error('jsPDF kütüphanesi yüklenemedi');
      this.showError('PDF kütüphanesi yüklenemedi. Sayfayı yenileyin.');
      return;
    }

    try {
      const doc = new this.jsPDF();
      let y = 20;

      // Başlık
      doc.setFontSize(24);
      doc.setTextColor(102, 126, 234);
      doc.text(program.name, 105, y, { align: 'center' });
      y += 15;

      // Tarih
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Olusturulma: ${new Date(program.createdAt).toLocaleDateString('tr-TR')}`, 105, y, { align: 'center' });
      y += 20;

      // Program bilgileri
      doc.setFontSize(12);
      doc.setTextColor(0);
      doc.text(`Konu: ${program.subject}`, 20, y);
      y += 8;
      doc.text(`Seviye: ${program.level}`, 20, y);
      y += 8;
      doc.text(`Mod: ${program.mode}`, 20, y);
      y += 8;
      doc.text(`Gunluk Calisma: ${program.schedule?.dailyHours || '-'} saat`, 20, y);
      y += 15;

      // Ayraç çizgisi
      doc.setDrawColor(200);
      doc.line(20, y, 190, y);
      y += 10;

      // İstatistikler
      const stats = this.calculateStats(program);
      doc.setFontSize(14);
      doc.setTextColor(102, 126, 234);
      doc.text('Ilerleme Ozeti', 20, y);
      y += 10;

      doc.setFontSize(11);
      doc.setTextColor(0);
      doc.text(`Toplam Konu: ${stats.total}`, 20, y);
      y += 7;
      doc.text(`Tamamlanan: ${stats.completed}`, 20, y);
      y += 7;
      doc.text(`Devam Eden: ${stats.inProgress}`, 20, y);
      y += 7;
      doc.text(`Bekleyen: ${stats.pending}`, 20, y);
      y += 7;
      doc.text(`Tamamlanma: %${stats.percentage}`, 20, y);
      y += 15;

      // Ayraç çizgisi
      doc.line(20, y, 190, y);
      y += 10;

      // Konular başlığı
      doc.setFontSize(14);
      doc.setTextColor(102, 126, 234);
      doc.text('Konular', 20, y);
      y += 10;

      // Konuları listele
      doc.setFontSize(10);
      const topics = program.topics || [];

      topics.forEach((topic, index) => {
        // Sayfa kontrolü
        if (y > 270) {
          doc.addPage();
          y = 20;
        }

        const status = this.getStatusIcon(topic.status);
        const topicName = topic.name || topic.topic || `Konu ${index + 1}`;

        doc.setTextColor(0);
        doc.text(`${index + 1}. ${topicName}`, 20, y);

        // Durum
        doc.setTextColor(this.getStatusColor(topic.status));
        doc.text(`[${status}]`, 170, y);

        y += 7;

        // Alt konular varsa
        if (topic.subtopics && topic.subtopics.length > 0) {
          doc.setTextColor(100);
          topic.subtopics.forEach(sub => {
            if (y > 270) {
              doc.addPage();
              y = 20;
            }
            doc.text(`   - ${sub.name || sub}`, 25, y);
            y += 5;
          });
        }
      });

      // Footer
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(`StudyPlan - Sayfa ${i}/${pageCount}`, 105, 290, { align: 'center' });
      }

      // Dosya adı
      const fileName = `${program.name.replace(/[^a-z0-9]/gi, '_')}_program.pdf`;
      doc.save(fileName);

      this.showSuccess(`PDF kaydedildi: ${fileName}`);
    } catch (error) {
      console.error('PDF export hatası:', error);
      this.showError('PDF oluşturulurken hata oluştu.');
    }
  }

  /**
   * Haftalık program takvimini PDF olarak dışa aktar
   * @param {Object} program - Program objesi
   */
  exportWeeklySchedule(program) {
    if (!this.jsPDF) {
      this.showError('PDF kütüphanesi yüklenemedi.');
      return;
    }

    try {
      const doc = new this.jsPDF('l', 'mm', 'a4'); // Landscape
      let y = 20;

      // Başlık
      doc.setFontSize(20);
      doc.setTextColor(102, 126, 234);
      doc.text(`${program.name} - Haftalik Program`, 148, y, { align: 'center' });
      y += 20;

      // Günler
      const days = ['Pazartesi', 'Sali', 'Carsamba', 'Persembe', 'Cuma', 'Cumartesi', 'Pazar'];
      const schedule = program.schedule?.weekly || {};

      const colWidth = 38;
      const startX = 15;

      // Gün başlıkları
      doc.setFontSize(10);
      doc.setTextColor(255);
      doc.setFillColor(102, 126, 234);

      days.forEach((day, i) => {
        doc.rect(startX + (i * colWidth), y, colWidth - 2, 10, 'F');
        doc.text(day, startX + (i * colWidth) + colWidth / 2 - 1, y + 7, { align: 'center' });
      });

      y += 15;

      // İçerikler
      doc.setTextColor(0);
      doc.setFontSize(8);

      const maxRows = 10;
      for (let row = 0; row < maxRows; row++) {
        days.forEach((day, i) => {
          const daySchedule = schedule[day.toLowerCase()] || [];
          if (daySchedule[row]) {
            const text = daySchedule[row].topic || daySchedule[row];
            const truncated = text.length > 20 ? text.substring(0, 18) + '...' : text;
            doc.rect(startX + (i * colWidth), y, colWidth - 2, 8);
            doc.text(truncated, startX + (i * colWidth) + 2, y + 5);
          } else {
            doc.setDrawColor(200);
            doc.rect(startX + (i * colWidth), y, colWidth - 2, 8);
          }
        });
        y += 10;
      }

      const fileName = `${program.name.replace(/[^a-z0-9]/gi, '_')}_takvim.pdf`;
      doc.save(fileName);

      this.showSuccess(`Takvim PDF kaydedildi: ${fileName}`);
    } catch (error) {
      console.error('PDF export hatası:', error);
      this.showError('PDF oluşturulurken hata oluştu.');
    }
  }

  calculateStats(program) {
    const topics = program.topics || [];
    const total = topics.length;
    const completed = topics.filter(t => t.status === 'completed').length;
    const inProgress = topics.filter(t => t.status === 'in-progress').length;
    const pending = total - completed - inProgress;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { total, completed, inProgress, pending, percentage };
  }

  getStatusIcon(status) {
    switch (status) {
      case 'completed': return 'Tamamlandi';
      case 'in-progress': return 'Devam Ediyor';
      default: return 'Bekliyor';
    }
  }

  getStatusColor(status) {
    switch (status) {
      case 'completed': return [76, 175, 80]; // Green
      case 'in-progress': return [255, 152, 0]; // Orange
      default: return [158, 158, 158]; // Gray
    }
  }

  showSuccess(message) {
    const toast = document.createElement('div');
    toast.className = 'toast toast-success';
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      bottom: 24px;
      right: 24px;
      padding: 16px 24px;
      border-radius: 12px;
      background: #4CAF50;
      color: white;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      z-index: 10001;
      animation: slideInUp 0.3s ease;
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }

  showError(message) {
    const toast = document.createElement('div');
    toast.className = 'toast toast-error';
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      bottom: 24px;
      right: 24px;
      padding: 16px 24px;
      border-radius: 12px;
      background: #f44336;
      color: white;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      z-index: 10001;
      animation: slideInUp 0.3s ease;
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }
}

// Global instance
const pdfExporter = new PDFExporter();
window.pdfExporter = pdfExporter;

console.log('PDF Exporter ready');
