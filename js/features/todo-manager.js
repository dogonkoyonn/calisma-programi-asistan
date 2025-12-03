// ==================== TODO MANAGER ====================
// Günlük görev yönetimi sistemi

class TodoManager {
  constructor() {
    this.items = [];
    this.filters = {
      category: 'all',
      priority: 'all',
      status: 'all'
    };
    this.load();
  }

  /**
   * Verileri yükle
   */
  load() {
    const data = DataManager.load(DataManager.KEYS.TODO_ITEMS);
    this.items = data?.items || [];
  }

  /**
   * Verileri kaydet
   */
  save() {
    DataManager.save(DataManager.KEYS.TODO_ITEMS, { items: this.items });
  }

  /**
   * Yeni görev ekle
   */
  addItem(item) {
    const newItem = {
      id: `todo_${Date.now()}`,
      title: item.title,
      description: item.description || '',
      category: item.category || 'personal',
      priority: item.priority || 'medium',
      dueDate: item.dueDate || null,
      dueTime: item.dueTime || null,
      completed: false,
      completedAt: null,
      recurring: item.recurring || null, // { type: 'daily'|'weekly'|'monthly', interval: 1 }
      reminders: item.reminders || [],
      tags: item.tags || [],
      createdAt: new Date().toISOString()
    };

    this.items.push(newItem);
    this.save();

    // Hatırlatıcıları zamanla
    if (newItem.reminders.length > 0 && newItem.dueDate) {
      this.scheduleReminders(newItem);
    }

    // Badge'leri güncelle
    if (window.categoryManager) {
      categoryManager.updateBadges();
    }

    return newItem;
  }

  /**
   * Görev güncelle
   */
  updateItem(id, updates) {
    const index = this.items.findIndex(item => item.id === id);
    if (index !== -1) {
      this.items[index] = { ...this.items[index], ...updates };
      this.save();

      // Hatırlatıcıları yeniden zamanla
      if (updates.reminders || updates.dueDate) {
        this.cancelReminders(id);
        this.scheduleReminders(this.items[index]);
      }

      return this.items[index];
    }
    return null;
  }

  /**
   * Görev sil
   */
  deleteItem(id) {
    const index = this.items.findIndex(item => item.id === id);
    if (index !== -1) {
      this.cancelReminders(id);
      this.items.splice(index, 1);
      this.save();

      if (window.categoryManager) {
        categoryManager.updateBadges();
      }

      return true;
    }
    return false;
  }

  /**
   * Görev tamamla/tamamlanmadı olarak işaretle
   */
  toggleComplete(id) {
    const item = this.items.find(i => i.id === id);
    if (item) {
      item.completed = !item.completed;
      item.completedAt = item.completed ? new Date().toISOString() : null;

      // Tekrarlayan görevse yeni görev oluştur
      if (item.completed && item.recurring) {
        this.createRecurringItem(item);
      }

      this.save();

      if (window.categoryManager) {
        categoryManager.updateBadges();
      }

      return item;
    }
    return null;
  }

  /**
   * Tekrarlayan görev için yeni görev oluştur
   */
  createRecurringItem(originalItem) {
    const nextDate = this.calculateNextDate(originalItem.dueDate, originalItem.recurring);

    const newItem = {
      ...originalItem,
      id: `todo_${Date.now()}`,
      dueDate: nextDate,
      completed: false,
      completedAt: null,
      createdAt: new Date().toISOString()
    };

    this.items.push(newItem);

    if (newItem.reminders.length > 0) {
      this.scheduleReminders(newItem);
    }
  }

  /**
   * Tekrar için sonraki tarihi hesapla
   */
  calculateNextDate(currentDate, recurring) {
    const date = new Date(currentDate);

    switch (recurring.type) {
      case 'daily':
        date.setDate(date.getDate() + (recurring.interval || 1));
        break;
      case 'weekly':
        date.setDate(date.getDate() + (7 * (recurring.interval || 1)));
        break;
      case 'monthly':
        date.setMonth(date.getMonth() + (recurring.interval || 1));
        break;
    }

    return date.toISOString().split('T')[0];
  }

  /**
   * Bugünün görevlerini al
   */
  getTodayItems() {
    const today = new Date().toISOString().split('T')[0];
    return this.items.filter(item =>
      !item.completed && item.dueDate === today
    ).sort((a, b) => {
      // Önceliğe göre sırala
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }

  /**
   * Gecikmiş görevleri al
   */
  getOverdueItems() {
    const today = new Date().toISOString().split('T')[0];
    return this.items.filter(item =>
      !item.completed && item.dueDate && item.dueDate < today
    );
  }

  /**
   * Yaklaşan görevleri al (önümüzdeki X gün)
   */
  getUpcomingItems(days = 7) {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + days);

    const todayStr = today.toISOString().split('T')[0];
    const futureDateStr = futureDate.toISOString().split('T')[0];

    return this.items.filter(item =>
      !item.completed &&
      item.dueDate &&
      item.dueDate > todayStr &&
      item.dueDate <= futureDateStr
    ).sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  }

  /**
   * Kategoriye göre görevleri al
   */
  getByCategory(category) {
    if (category === 'all') return this.items;
    return this.items.filter(item => item.category === category);
  }

  /**
   * Filtrele
   */
  getFiltered() {
    let result = [...this.items];

    // Kategori filtresi
    if (this.filters.category !== 'all') {
      result = result.filter(item => item.category === this.filters.category);
    }

    // Öncelik filtresi
    if (this.filters.priority !== 'all') {
      result = result.filter(item => item.priority === this.filters.priority);
    }

    // Durum filtresi
    if (this.filters.status !== 'all') {
      if (this.filters.status === 'completed') {
        result = result.filter(item => item.completed);
      } else if (this.filters.status === 'pending') {
        result = result.filter(item => !item.completed);
      }
    }

    return result;
  }

  /**
   * Filtre ayarla
   */
  setFilter(filterType, value) {
    this.filters[filterType] = value;
  }

  /**
   * Hatırlatıcıları zamanla
   */
  scheduleReminders(item) {
    if (!item.dueDate || !item.reminders || item.reminders.length === 0) return;

    item.reminders.forEach((reminderTime, index) => {
      const reminderId = `${item.id}_reminder_${index}`;
      const reminderDateTime = new Date(`${item.dueDate}T${reminderTime}`);

      // Geçmişte kalan hatırlatıcıları atlat
      if (reminderDateTime <= new Date()) return;

      // Notification Manager varsa kullan
      if (window.notificationManager) {
        window.notificationManager.scheduleNotification(
          reminderId,
          reminderDateTime.getTime(),
          `Görev Hatırlatması: ${item.title}`,
          {
            body: item.description || `${item.dueTime || ''} tarihinde yapılacak`,
            type: 'todo',
            itemId: item.id
          }
        );
      }
    });
  }

  /**
   * Hatırlatıcıları iptal et
   */
  cancelReminders(itemId) {
    if (window.notificationManager) {
      window.notificationManager.cancelNotificationsByPrefix(itemId);
    }
  }

  /**
   * Görev sayılarını al (istatistik)
   */
  getStats() {
    const today = new Date().toISOString().split('T')[0];
    const thisWeekStart = new Date();
    thisWeekStart.setDate(thisWeekStart.getDate() - thisWeekStart.getDay());

    return {
      total: this.items.length,
      completed: this.items.filter(i => i.completed).length,
      pending: this.items.filter(i => !i.completed).length,
      overdue: this.getOverdueItems().length,
      today: this.getTodayItems().length,
      completedToday: this.items.filter(i =>
        i.completed &&
        i.completedAt &&
        i.completedAt.startsWith(today)
      ).length
    };
  }

  /**
   * Arama
   */
  search(query) {
    const lowerQuery = query.toLowerCase();
    return this.items.filter(item =>
      item.title.toLowerCase().includes(lowerQuery) ||
      (item.description && item.description.toLowerCase().includes(lowerQuery)) ||
      (item.tags && item.tags.some(tag => tag.toLowerCase().includes(lowerQuery)))
    );
  }

  /**
   * Görev detay modal HTML
   */
  renderAddModal() {
    return `
      <div class="todo-modal-overlay" id="todoModalOverlay">
        <div class="todo-modal">
          <div class="todo-modal-header">
            <h2>Yeni Görev Ekle</h2>
            <button class="modal-close" onclick="todoManager.closeModal()">×</button>
          </div>
          <div class="todo-modal-body">
            <div class="form-group">
              <label>Görev Başlığı *</label>
              <input type="text" id="todoTitle" placeholder="Ne yapılacak?" required>
            </div>

            <div class="form-group">
              <label>Açıklama</label>
              <textarea id="todoDescription" placeholder="Detaylar (opsiyonel)"></textarea>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Kategori</label>
                <select id="todoCategory">
                  <option value="personal">✅ Kişisel</option>
                  <option value="study">📚 Çalışma</option>
                  <option value="health">💊 Sağlık</option>
                </select>
              </div>
              <div class="form-group">
                <label>Öncelik</label>
                <select id="todoPriority">
                  <option value="low">Düşük</option>
                  <option value="medium" selected>Orta</option>
                  <option value="high">Yüksek</option>
                </select>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Tarih</label>
                <input type="date" id="todoDueDate">
              </div>
              <div class="form-group">
                <label>Saat</label>
                <input type="time" id="todoDueTime">
              </div>
            </div>

            <div class="form-group">
              <label>Hatırlatıcılar</label>
              <div class="reminder-list" id="reminderList">
                <button type="button" class="btn-add-reminder" onclick="todoManager.addReminderField()">
                  + Hatırlatıcı Ekle
                </button>
              </div>
            </div>

            <div class="form-group">
              <label>
                <input type="checkbox" id="todoRecurring">
                Tekrarlayan görev
              </label>
              <div class="recurring-options" id="recurringOptions" style="display: none;">
                <select id="recurringType">
                  <option value="daily">Her gün</option>
                  <option value="weekly">Her hafta</option>
                  <option value="monthly">Her ay</option>
                </select>
              </div>
            </div>
          </div>
          <div class="todo-modal-footer">
            <button class="btn-secondary" onclick="todoManager.closeModal()">İptal</button>
            <button class="btn-primary" onclick="todoManager.saveFromModal()">Kaydet</button>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Modal aç
   */
  openAddModal() {
    // Modal zaten varsa kaldır
    const existing = document.getElementById('todoModalOverlay');
    if (existing) existing.remove();

    // Yeni modal ekle
    document.body.insertAdjacentHTML('beforeend', this.renderAddModal());

    // Bugünün tarihini varsayılan yap
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('todoDueDate').value = today;

    // Tekrarlayan checkbox dinleyici
    document.getElementById('todoRecurring').addEventListener('change', (e) => {
      document.getElementById('recurringOptions').style.display = e.target.checked ? 'block' : 'none';
    });
  }

  /**
   * Modal kapat
   */
  closeModal() {
    const modal = document.getElementById('todoModalOverlay');
    if (modal) modal.remove();
  }

  /**
   * Hatırlatıcı alanı ekle
   */
  addReminderField() {
    const list = document.getElementById('reminderList');
    const addBtn = list.querySelector('.btn-add-reminder');

    const field = document.createElement('div');
    field.className = 'reminder-field';
    field.innerHTML = `
      <input type="time" class="reminder-time">
      <button type="button" class="btn-remove-reminder" onclick="this.parentElement.remove()">×</button>
    `;

    list.insertBefore(field, addBtn);
  }

  /**
   * Modal'dan kaydet
   */
  saveFromModal() {
    const title = document.getElementById('todoTitle').value.trim();
    if (!title) {
      alert('Görev başlığı gerekli!');
      return;
    }

    // Hatırlatıcıları topla
    const reminders = [];
    document.querySelectorAll('.reminder-time').forEach(input => {
      if (input.value) reminders.push(input.value);
    });

    // Tekrarlayan ayarı
    let recurring = null;
    if (document.getElementById('todoRecurring').checked) {
      recurring = {
        type: document.getElementById('recurringType').value,
        interval: 1
      };
    }

    const item = {
      title: title,
      description: document.getElementById('todoDescription').value.trim(),
      category: document.getElementById('todoCategory').value,
      priority: document.getElementById('todoPriority').value,
      dueDate: document.getElementById('todoDueDate').value || null,
      dueTime: document.getElementById('todoDueTime').value || null,
      reminders: reminders,
      recurring: recurring
    };

    this.addItem(item);
    this.closeModal();

    // UI güncelle
    this.renderTodoList();

    // Başarı mesajı
    if (window.showToast) {
      showToast('Görev eklendi!', 'success');
    }
  }

  /**
   * Görev listesi HTML
   */
  renderTodoList(containerId = 'todoListContainer') {
    const container = document.getElementById(containerId);
    if (!container) return;

    const items = this.getFiltered();
    const grouped = this.groupByDate(items.filter(i => !i.completed));

    let html = `
      <div class="todo-list-header">
        <h3>Görevler</h3>
        <button class="btn-add-todo" onclick="todoManager.openAddModal()">+ Yeni Görev</button>
      </div>
      <div class="todo-filters">
        <select onchange="todoManager.setFilter('priority', this.value); todoManager.renderTodoList();">
          <option value="all">Tüm Öncelikler</option>
          <option value="high">Yüksek</option>
          <option value="medium">Orta</option>
          <option value="low">Düşük</option>
        </select>
        <select onchange="todoManager.setFilter('status', this.value); todoManager.renderTodoList();">
          <option value="pending">Bekleyenler</option>
          <option value="completed">Tamamlananlar</option>
          <option value="all">Tümü</option>
        </select>
      </div>
    `;

    // Gecikmiş görevler
    const overdue = this.getOverdueItems();
    if (overdue.length > 0) {
      html += `
        <div class="todo-group overdue">
          <h4 class="group-title">⚠️ Gecikmiş (${overdue.length})</h4>
          <div class="todo-items">
            ${overdue.map(item => this.renderTodoItem(item)).join('')}
          </div>
        </div>
      `;
    }

    // Bugün
    const today = this.getTodayItems();
    if (today.length > 0) {
      html += `
        <div class="todo-group today">
          <h4 class="group-title">📅 Bugün (${today.length})</h4>
          <div class="todo-items">
            ${today.map(item => this.renderTodoItem(item)).join('')}
          </div>
        </div>
      `;
    }

    // Yaklaşan
    const upcoming = this.getUpcomingItems(7);
    if (upcoming.length > 0) {
      html += `
        <div class="todo-group upcoming">
          <h4 class="group-title">📆 Yaklaşan (${upcoming.length})</h4>
          <div class="todo-items">
            ${upcoming.map(item => this.renderTodoItem(item)).join('')}
          </div>
        </div>
      `;
    }

    // Tamamlananlar (son 10)
    const completed = items.filter(i => i.completed).slice(-10).reverse();
    if (completed.length > 0 && this.filters.status !== 'pending') {
      html += `
        <div class="todo-group completed">
          <h4 class="group-title">✅ Tamamlanan (${completed.length})</h4>
          <div class="todo-items">
            ${completed.map(item => this.renderTodoItem(item)).join('')}
          </div>
        </div>
      `;
    }

    if (items.length === 0) {
      html += `
        <div class="todo-empty">
          <div class="empty-icon">📝</div>
          <p>Henüz görev yok</p>
          <button class="btn-primary" onclick="todoManager.openAddModal()">İlk Görevi Ekle</button>
        </div>
      `;
    }

    container.innerHTML = html;
  }

  /**
   * Tek görev item HTML
   */
  renderTodoItem(item) {
    const priorityColors = {
      high: '#FF6B6B',
      medium: '#FFE66D',
      low: '#4ECDC4'
    };

    const priorityLabels = {
      high: 'Yüksek',
      medium: 'Orta',
      low: 'Düşük'
    };

    return `
      <div class="todo-item ${item.completed ? 'completed' : ''}" data-id="${item.id}">
        <div class="todo-checkbox" onclick="todoManager.toggleComplete('${item.id}'); todoManager.renderTodoList();">
          ${item.completed ? '✓' : ''}
        </div>
        <div class="todo-content">
          <div class="todo-title">${item.title}</div>
          ${item.description ? `<div class="todo-description">${item.description}</div>` : ''}
          <div class="todo-meta">
            ${item.dueDate ? `<span class="todo-date">📅 ${this.formatDate(item.dueDate)}</span>` : ''}
            ${item.dueTime ? `<span class="todo-time">🕐 ${item.dueTime}</span>` : ''}
            <span class="todo-priority" style="background: ${priorityColors[item.priority]}">${priorityLabels[item.priority]}</span>
            ${item.recurring ? '<span class="todo-recurring">🔄</span>' : ''}
          </div>
        </div>
        <div class="todo-actions">
          <button class="btn-icon" onclick="todoManager.deleteItem('${item.id}'); todoManager.renderTodoList();" title="Sil">🗑️</button>
        </div>
      </div>
    `;
  }

  /**
   * Tarihe göre grupla
   */
  groupByDate(items) {
    const groups = {};
    items.forEach(item => {
      const date = item.dueDate || 'no-date';
      if (!groups[date]) groups[date] = [];
      groups[date].push(item);
    });
    return groups;
  }

  /**
   * Tarih formatla
   */
  formatDate(dateStr) {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (dateStr === today.toISOString().split('T')[0]) {
      return 'Bugün';
    } else if (dateStr === tomorrow.toISOString().split('T')[0]) {
      return 'Yarın';
    }

    return date.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'short'
    });
  }
}

// Global instance
const todoManager = new TodoManager();
window.todoManager = todoManager;
