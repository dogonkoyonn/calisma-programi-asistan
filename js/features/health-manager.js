// ==================== HEALTH MANAGER ====================
// Life Manager - Sağlık Takibi Yöneticisi
// İlaç, vitamin ve su tüketimi takibi
// Versiyon: 1.0.0

class HealthManager {
    constructor() {
        this.medications = [];
        this.waterIntake = {
            dailyGoal: 8,
            history: {}
        };
        this.dayNames = ['pazar', 'pazartesi', 'sali', 'carsamba', 'persembe', 'cuma', 'cumartesi'];
        this.dayLabels = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
        this.load();
    }

    // ==================== DATA MANAGEMENT ====================

    load() {
        const data = DataManager.load(DataManager.KEYS.HEALTH_TRACKING);
        if (data) {
            this.medications = data.medications || [];
            this.waterIntake = data.waterIntake || { dailyGoal: 8, history: {} };
        }
        console.log('[HealthManager] Yüklendi:', this.medications.length, 'ilaç');
    }

    save() {
        DataManager.save(DataManager.KEYS.HEALTH_TRACKING, {
            medications: this.medications,
            waterIntake: this.waterIntake
        });
        // Badge güncelle
        if (window.categoryManager) {
            categoryManager.updateBadges();
        }
    }

    // ==================== MEDICATION CRUD ====================

    addMedication(med) {
        const medication = {
            id: `med_${Date.now()}`,
            name: med.name || '',
            type: med.type || 'medication', // medication, vitamin, supplement
            dosage: med.dosage || '',
            active: true,
            days: med.days || this.dayNames, // Varsayılan: her gün
            times: med.times || ['09:00'],
            startDate: med.startDate || new Date().toISOString().split('T')[0],
            endDate: med.endDate || null,
            notes: med.notes || '',
            withFood: med.withFood || false,
            history: [],
            createdAt: new Date().toISOString()
        };

        this.medications.push(medication);
        this.save();
        this.scheduleReminders(medication);

        console.log('[HealthManager] İlaç eklendi:', medication.name);
        return medication;
    }

    updateMedication(id, updates) {
        const index = this.medications.findIndex(m => m.id === id);
        if (index === -1) return null;

        // Eski hatırlatıcıları iptal et
        this.cancelReminders(id);

        // Güncelle
        this.medications[index] = {
            ...this.medications[index],
            ...updates,
            updatedAt: new Date().toISOString()
        };

        this.save();

        // Yeni hatırlatıcıları ayarla
        if (this.medications[index].active) {
            this.scheduleReminders(this.medications[index]);
        }

        return this.medications[index];
    }

    deleteMedication(id) {
        this.cancelReminders(id);
        this.medications = this.medications.filter(m => m.id !== id);
        this.save();
        console.log('[HealthManager] İlaç silindi:', id);
    }

    getMedication(id) {
        return this.medications.find(m => m.id === id);
    }

    // ==================== MEDICATION HISTORY ====================

    toggleTaken(medicationId, date, time) {
        const med = this.getMedication(medicationId);
        if (!med) return;

        const historyEntry = med.history.find(h => h.date === date && h.time === time);

        if (historyEntry) {
            // Toggle mevcut kayıt
            historyEntry.taken = !historyEntry.taken;
            historyEntry.takenAt = historyEntry.taken ? new Date().toISOString() : null;
        } else {
            // Yeni kayıt ekle
            med.history.push({
                date,
                time,
                taken: true,
                takenAt: new Date().toISOString()
            });
        }

        this.save();
        return med;
    }

    isTaken(medicationId, date, time) {
        const med = this.getMedication(medicationId);
        if (!med) return false;

        const entry = med.history.find(h => h.date === date && h.time === time);
        return entry?.taken || false;
    }

    // ==================== QUERIES ====================

    getTodaysMedications() {
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        const dayName = this.dayNames[today.getDay()];

        return this.medications.filter(med => {
            if (!med.active) return false;
            if (!med.days.includes(dayName)) return false;
            if (med.startDate && med.startDate > todayStr) return false;
            if (med.endDate && med.endDate < todayStr) return false;
            return true;
        });
    }

    getTodaysSchedule() {
        const today = new Date().toISOString().split('T')[0];
        const todaysMeds = this.getTodaysMedications();
        const schedule = [];

        todaysMeds.forEach(med => {
            med.times.forEach(time => {
                schedule.push({
                    medication: med,
                    time,
                    taken: this.isTaken(med.id, today, time)
                });
            });
        });

        // Zamana göre sırala
        schedule.sort((a, b) => a.time.localeCompare(b.time));
        return schedule;
    }

    getNotTakenCount() {
        const schedule = this.getTodaysSchedule();
        const now = new Date();
        const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

        return schedule.filter(s => !s.taken && s.time <= currentTime).length;
    }

    getUpcomingMedications(hours = 2) {
        const schedule = this.getTodaysSchedule();
        const now = new Date();
        const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

        const futureTime = new Date(now.getTime() + hours * 60 * 60 * 1000);
        const futureTimeStr = `${String(futureTime.getHours()).padStart(2, '0')}:${String(futureTime.getMinutes()).padStart(2, '0')}`;

        return schedule.filter(s => !s.taken && s.time > currentTime && s.time <= futureTimeStr);
    }

    // ==================== WATER INTAKE ====================

    addWater(glasses = 1) {
        const today = new Date().toISOString().split('T')[0];
        this.waterIntake.history[today] = (this.waterIntake.history[today] || 0) + glasses;
        this.save();
        return this.getTodayWater();
    }

    removeWater(glasses = 1) {
        const today = new Date().toISOString().split('T')[0];
        this.waterIntake.history[today] = Math.max(0, (this.waterIntake.history[today] || 0) - glasses);
        this.save();
        return this.getTodayWater();
    }

    getTodayWater() {
        const today = new Date().toISOString().split('T')[0];
        return this.waterIntake.history[today] || 0;
    }

    setWaterGoal(goal) {
        this.waterIntake.dailyGoal = goal;
        this.save();
    }

    getWaterProgress() {
        const current = this.getTodayWater();
        const goal = this.waterIntake.dailyGoal;
        return {
            current,
            goal,
            percentage: Math.min(100, Math.round((current / goal) * 100))
        };
    }

    // ==================== REMINDERS ====================

    scheduleReminders(medication) {
        if (!medication.active || !medication.times?.length) return;

        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        const dayName = this.dayNames[today.getDay()];

        // Bugün alınması gerekiyorsa
        if (medication.days.includes(dayName)) {
            medication.times.forEach((time, index) => {
                const [hours, minutes] = time.split(':').map(Number);
                const reminderTime = new Date(today);
                reminderTime.setHours(hours, minutes, 0, 0);

                // Geçmiş zamanları atla
                if (reminderTime <= new Date()) return;

                // Zaten alındıysa atla
                if (this.isTaken(medication.id, todayStr, time)) return;

                const reminderId = `${medication.id}_${todayStr}_${index}`;

                if (window.notificationManager) {
                    window.notificationManager.scheduleNotification(
                        reminderId,
                        reminderTime.getTime(),
                        `${medication.name} Zamanı`,
                        {
                            body: `${medication.dosage}${medication.withFood ? ' - Yemekle birlikte' : ''}`,
                            type: 'health',
                            itemId: medication.id
                        }
                    );
                }
            });
        }
    }

    cancelReminders(medicationId) {
        if (window.notificationManager) {
            window.notificationManager.cancelNotificationsByPrefix(medicationId);
        }
    }

    // Tüm aktif ilaçlar için hatırlatıcıları yeniden ayarla
    refreshAllReminders() {
        this.medications.forEach(med => {
            this.cancelReminders(med.id);
            if (med.active) {
                this.scheduleReminders(med);
            }
        });
    }

    // ==================== UI RENDERING ====================

    renderHealthList() {
        const container = document.getElementById('healthContent');
        if (!container) return;

        const schedule = this.getTodaysSchedule();
        const waterProgress = this.getWaterProgress();

        if (this.medications.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">💊</div>
                    <h3>Sağlık Takibi</h3>
                    <p>İlaç ve vitamin hatırlatıcılarınızı buradan yönetin</p>
                    <button class="btn-primary" onclick="healthManager.openAddModal()">İlk İlacı Ekle</button>
                </div>
            `;
            return;
        }

        const today = new Date().toLocaleDateString('tr-TR', {
            day: 'numeric',
            month: 'long',
            weekday: 'long'
        });

        container.innerHTML = `
            <div class="health-schedule">
                <div class="schedule-header">
                    <h3>📅 ${today}</h3>
                </div>

                <div class="medication-list">
                    ${schedule.length > 0 ? schedule.map(item => this.renderScheduleItem(item)).join('') : `
                        <div class="no-meds-today">
                            <p>Bugün için planlanmış ilaç yok</p>
                        </div>
                    `}
                </div>
            </div>

            <div class="water-tracker">
                <div class="water-header">
                    <h3>💧 Su Tüketimi</h3>
                    <span class="water-count">${waterProgress.current}/${waterProgress.goal} bardak</span>
                </div>
                <div class="water-progress-bar">
                    <div class="water-progress-fill" style="width: ${waterProgress.percentage}%"></div>
                </div>
                <div class="water-buttons">
                    <button class="btn-water-remove" onclick="healthManager.removeWater(); healthManager.renderHealthList();">-</button>
                    <button class="btn-water-add" onclick="healthManager.addWater(); healthManager.renderHealthList();">+1 Bardak</button>
                </div>
            </div>

            <div class="all-medications">
                <div class="section-header">
                    <h3>📋 Tüm İlaçlar</h3>
                </div>
                <div class="medication-cards">
                    ${this.medications.map(med => this.renderMedicationCard(med)).join('')}
                </div>
            </div>
        `;
    }

    renderScheduleItem(item) {
        const { medication, time, taken } = item;
        const now = new Date();
        const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        const isPast = time < currentTime;
        const today = new Date().toISOString().split('T')[0];

        const typeIcon = {
            medication: '💊',
            vitamin: '🌟',
            supplement: '💪'
        }[medication.type] || '💊';

        let statusClass = '';
        let statusText = '';

        if (taken) {
            statusClass = 'taken';
            const historyEntry = medication.history.find(h => h.date === today && h.time === time);
            const takenTime = historyEntry?.takenAt ? new Date(historyEntry.takenAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) : '';
            statusText = `✅ Alındı${takenTime ? ' - ' + takenTime : ''}`;
        } else if (isPast) {
            statusClass = 'missed';
            statusText = '⚠️ Atlandı';
        } else {
            const [h, m] = time.split(':').map(Number);
            const medTime = new Date();
            medTime.setHours(h, m, 0, 0);
            const diffMs = medTime - now;
            const diffMins = Math.round(diffMs / 60000);

            if (diffMins < 60) {
                statusText = `⏰ ${diffMins} dakika sonra`;
            } else {
                statusText = `⏰ ${Math.round(diffMins / 60)} saat sonra`;
            }
        }

        return `
            <div class="schedule-item ${statusClass}" onclick="healthManager.toggleTaken('${medication.id}', '${today}', '${time}'); healthManager.renderHealthList();">
                <div class="schedule-checkbox">
                    ${taken ? '✓' : ''}
                </div>
                <div class="schedule-time">${time}</div>
                <div class="schedule-info">
                    <div class="schedule-name">${typeIcon} ${medication.name}</div>
                    <div class="schedule-dosage">${medication.dosage}</div>
                    ${medication.withFood ? '<div class="schedule-note">🍽️ Yemekle birlikte</div>' : ''}
                </div>
                <div class="schedule-status">${statusText}</div>
            </div>
        `;
    }

    renderMedicationCard(med) {
        const typeLabel = {
            medication: 'İlaç',
            vitamin: 'Vitamin',
            supplement: 'Takviye'
        }[med.type] || 'İlaç';

        const typeIcon = {
            medication: '💊',
            vitamin: '🌟',
            supplement: '💪'
        }[med.type] || '💊';

        return `
            <div class="medication-card ${!med.active ? 'inactive' : ''}">
                <div class="med-card-header">
                    <div class="med-card-icon">${typeIcon}</div>
                    <div class="med-card-title">
                        <h4>${med.name}</h4>
                        <span class="med-card-type">${typeLabel}</span>
                    </div>
                    <div class="med-card-actions">
                        <button class="btn-icon" onclick="event.stopPropagation(); healthManager.openEditModal('${med.id}');">✏️</button>
                        <button class="btn-icon" onclick="event.stopPropagation(); healthManager.confirmDelete('${med.id}');">🗑️</button>
                    </div>
                </div>
                <div class="med-card-body">
                    <div class="med-card-info">
                        <span class="med-dosage">💊 ${med.dosage}</span>
                        <span class="med-times">🕐 ${med.times.join(', ')}</span>
                    </div>
                    <div class="med-card-days">
                        ${this.dayLabels.map((day, i) => `
                            <span class="day-badge ${med.days.includes(this.dayNames[i]) ? 'active' : ''}">${day.substring(0, 2)}</span>
                        `).join('')}
                    </div>
                    ${med.notes ? `<div class="med-card-notes">📝 ${med.notes}</div>` : ''}
                </div>
            </div>
        `;
    }

    // ==================== MODAL ====================

    openAddModal() {
        const modal = this.renderModal();
        document.body.insertAdjacentHTML('beforeend', modal);
        document.getElementById('healthModal').classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    openEditModal(id) {
        const med = this.getMedication(id);
        if (!med) return;

        const modal = this.renderModal(med);
        document.body.insertAdjacentHTML('beforeend', modal);
        document.getElementById('healthModal').classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeModal() {
        const modal = document.getElementById('healthModal');
        if (modal) {
            modal.remove();
            document.body.style.overflow = '';
        }
    }

    renderModal(medication = null) {
        const isEdit = !!medication;
        const med = medication || {
            name: '',
            type: 'medication',
            dosage: '',
            days: this.dayNames,
            times: ['09:00'],
            startDate: new Date().toISOString().split('T')[0],
            endDate: '',
            notes: '',
            withFood: false
        };

        return `
            <div class="health-modal" id="healthModal">
                <div class="health-modal-content">
                    <div class="modal-header">
                        <h2>${isEdit ? 'İlaç Düzenle' : 'Yeni İlaç/Vitamin Ekle'}</h2>
                        <button class="modal-close" onclick="healthManager.closeModal()">✕</button>
                    </div>

                    <form id="healthForm" class="health-form">
                        <input type="hidden" id="medId" value="${med.id || ''}">

                        <div class="form-group">
                            <label for="medName">İlaç/Vitamin Adı *</label>
                            <input type="text" id="medName" value="${med.name}" placeholder="Örn: Aspirin, Vitamin D" required>
                        </div>

                        <div class="form-row">
                            <div class="form-group">
                                <label for="medType">Tip</label>
                                <select id="medType">
                                    <option value="medication" ${med.type === 'medication' ? 'selected' : ''}>💊 İlaç</option>
                                    <option value="vitamin" ${med.type === 'vitamin' ? 'selected' : ''}>🌟 Vitamin</option>
                                    <option value="supplement" ${med.type === 'supplement' ? 'selected' : ''}>💪 Takviye</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="medDosage">Dozaj</label>
                                <input type="text" id="medDosage" value="${med.dosage}" placeholder="Örn: 500mg, 2 tablet">
                            </div>
                        </div>

                        <div class="form-group">
                            <label>Hangi Günler</label>
                            <div class="day-selector">
                                ${this.dayLabels.map((day, i) => `
                                    <label class="day-checkbox">
                                        <input type="checkbox" name="medDays" value="${this.dayNames[i]}"
                                            ${med.days.includes(this.dayNames[i]) ? 'checked' : ''}>
                                        <span>${day.substring(0, 2)}</span>
                                    </label>
                                `).join('')}
                            </div>
                        </div>

                        <div class="form-group">
                            <label>Alım Zamanları</label>
                            <div class="times-container" id="timesContainer">
                                ${med.times.map((time, i) => `
                                    <div class="time-input-row">
                                        <input type="time" name="medTimes" value="${time}">
                                        ${i > 0 ? `<button type="button" class="btn-remove-time" onclick="this.parentElement.remove()">✕</button>` : ''}
                                    </div>
                                `).join('')}
                            </div>
                            <button type="button" class="btn-add-time" onclick="healthManager.addTimeInput()">+ Zaman Ekle</button>
                        </div>

                        <div class="form-row">
                            <div class="form-group">
                                <label for="medStartDate">Başlangıç Tarihi</label>
                                <input type="date" id="medStartDate" value="${med.startDate}">
                            </div>
                            <div class="form-group">
                                <label for="medEndDate">Bitiş Tarihi (Opsiyonel)</label>
                                <input type="date" id="medEndDate" value="${med.endDate || ''}">
                            </div>
                        </div>

                        <div class="form-group">
                            <label class="checkbox-label">
                                <input type="checkbox" id="medWithFood" ${med.withFood ? 'checked' : ''}>
                                <span>🍽️ Yemekle birlikte alınmalı</span>
                            </label>
                        </div>

                        <div class="form-group">
                            <label for="medNotes">Notlar</label>
                            <textarea id="medNotes" rows="2" placeholder="Ek notlar...">${med.notes}</textarea>
                        </div>

                        <div class="form-actions">
                            <button type="button" class="btn-secondary" onclick="healthManager.closeModal()">İptal</button>
                            <button type="submit" class="btn-primary">${isEdit ? 'Güncelle' : 'Ekle'}</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
    }

    addTimeInput() {
        const container = document.getElementById('timesContainer');
        const newInput = document.createElement('div');
        newInput.className = 'time-input-row';
        newInput.innerHTML = `
            <input type="time" name="medTimes" value="12:00">
            <button type="button" class="btn-remove-time" onclick="this.parentElement.remove()">✕</button>
        `;
        container.appendChild(newInput);
    }

    saveFromModal() {
        const id = document.getElementById('medId').value;
        const name = document.getElementById('medName').value.trim();

        if (!name) {
            alert('İlaç adı gerekli!');
            return;
        }

        const daysInputs = document.querySelectorAll('input[name="medDays"]:checked');
        const timesInputs = document.querySelectorAll('input[name="medTimes"]');

        const medData = {
            name,
            type: document.getElementById('medType').value,
            dosage: document.getElementById('medDosage').value.trim(),
            days: Array.from(daysInputs).map(i => i.value),
            times: Array.from(timesInputs).map(i => i.value).filter(t => t),
            startDate: document.getElementById('medStartDate').value,
            endDate: document.getElementById('medEndDate').value || null,
            notes: document.getElementById('medNotes').value.trim(),
            withFood: document.getElementById('medWithFood').checked
        };

        if (id) {
            this.updateMedication(id, medData);
        } else {
            this.addMedication(medData);
        }

        this.closeModal();
        this.renderHealthList();
        this.updateHomeReminders();
    }

    confirmDelete(id) {
        const med = this.getMedication(id);
        if (!med) return;

        if (confirm(`"${med.name}" ilacını silmek istediğinize emin misiniz?`)) {
            this.deleteMedication(id);
            this.renderHealthList();
            this.updateHomeReminders();
        }
    }

    // ==================== HOME DASHBOARD ====================

    updateHomeReminders() {
        const container = document.getElementById('homeHealthReminders');
        if (!container) return;

        const schedule = this.getTodaysSchedule().slice(0, 3);

        if (schedule.length === 0) {
            container.innerHTML = `
                <div class="empty-state mini">
                    <p>Bugün için ilaç hatırlatması yok</p>
                </div>
            `;
            return;
        }

        container.innerHTML = schedule.map(item => {
            const { medication, time, taken } = item;
            return `
                <div class="home-health-item ${taken ? 'taken' : ''}" onclick="categoryManager.setActive('health')">
                    <div class="health-item-time">${time}</div>
                    <div class="health-item-info">
                        <span class="health-item-name">${medication.name}</span>
                        <span class="health-item-dosage">${medication.dosage}</span>
                    </div>
                    <div class="health-item-status">${taken ? '✅' : '⏰'}</div>
                </div>
            `;
        }).join('');
    }
}

// Global instance
let healthManager;

// DOM yüklendiğinde başlat
document.addEventListener('DOMContentLoaded', () => {
    healthManager = new HealthManager();
    window.healthManager = healthManager;

    // Form submit handler
    document.addEventListener('submit', (e) => {
        if (e.target.id === 'healthForm') {
            e.preventDefault();
            healthManager.saveFromModal();
        }
    });

    // Kategori değişikliğinde health listesini render et
    document.addEventListener('categoryChanged', (e) => {
        if (e.detail.category === 'health') {
            healthManager.renderHealthList();
        }
    });

    // Her saat başı hatırlatıcıları yenile
    setInterval(() => {
        healthManager.refreshAllReminders();
    }, 60 * 60 * 1000);
});

// Eski fonksiyon için uyumluluk (index.html'de kullanılıyor)
function openHealthModal() {
    if (healthManager) {
        healthManager.openAddModal();
    }
}

console.log('[Health Manager] Yüklendi');
