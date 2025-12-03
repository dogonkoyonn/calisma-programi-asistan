// ==================== ONBOARDING MANAGER ====================
// Life Manager - Yeni Kullanıcı Hoşgeldin Wizard'ı
// Versiyon: 1.0.0

class OnboardingManager {
    constructor() {
        this.currentStep = 0;
        this.totalSteps = 4;
        this.userData = {
            displayName: '',
            avatar: '🎓',
            categories: {
                study: true,
                personal: true,
                health: false,
                expenses: false
            },
            addSampleData: false
        };
        this.avatarOptions = ['🎓', '👨‍💻', '👩‍💻', '🧑‍🎓', '👨‍🔬', '👩‍🔬', '🧑‍💼', '👨‍🎨', '👩‍🎨', '🦸', '🧙', '🌟'];
    }

    // Wizard'ı başlat
    async start() {
        console.log('[Onboarding] Wizard başlatılıyor');
        this.currentStep = 0;
        this.showModal();
        this.renderStep();
    }

    // Modal'ı göster
    showModal() {
        const modal = document.getElementById('onboardingModal');
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    // Modal'ı kapat
    closeModal() {
        const modal = document.getElementById('onboardingModal');
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    // Adım render et
    renderStep() {
        const container = document.getElementById('onboardingContent');
        if (!container) return;

        switch (this.currentStep) {
            case 0:
                this.renderWelcome(container);
                break;
            case 1:
                this.renderProfile(container);
                break;
            case 2:
                this.renderCategories(container);
                break;
            case 3:
                this.renderSampleData(container);
                break;
        }

        this.updateProgress();
    }

    // Progress bar güncelle
    updateProgress() {
        const progressFill = document.querySelector('.onboarding-progress-fill');
        const progressText = document.querySelector('.onboarding-progress-text');

        if (progressFill) {
            const percent = ((this.currentStep + 1) / this.totalSteps) * 100;
            progressFill.style.width = `${percent}%`;
        }

        if (progressText) {
            progressText.textContent = `${this.currentStep + 1} / ${this.totalSteps}`;
        }
    }

    // Adım 1: Hoşgeldin
    renderWelcome(container) {
        container.innerHTML = `
            <div class="onboarding-step welcome-step">
                <div class="welcome-icon">🎉</div>
                <h2>Life Manager'a Hoş Geldin!</h2>
                <p class="welcome-subtitle">Hayatını organize etmeye hazır mısın?</p>
                <div class="welcome-features">
                    <div class="feature-item">
                        <span class="feature-icon">📋</span>
                        <span>Görevlerini takip et</span>
                    </div>
                    <div class="feature-item">
                        <span class="feature-icon">📚</span>
                        <span>Çalışma programı oluştur</span>
                    </div>
                    <div class="feature-item">
                        <span class="feature-icon">💊</span>
                        <span>Sağlığını izle</span>
                    </div>
                    <div class="feature-item">
                        <span class="feature-icon">💰</span>
                        <span>Harcamalarını yönet</span>
                    </div>
                </div>
                <button class="btn-onboarding-next" onclick="onboardingManager.nextStep()">
                    Başlayalım
                    <span class="btn-icon">→</span>
                </button>
            </div>
        `;
    }

    // Adım 2: Profil
    renderProfile(container) {
        const user = authManager?.getCurrentUser();
        const currentName = this.userData.displayName || user?.displayName || '';

        container.innerHTML = `
            <div class="onboarding-step profile-step">
                <h2>Profilini Oluştur</h2>
                <p class="step-subtitle">Sana nasıl hitap edelim?</p>

                <div class="profile-form">
                    <div class="form-group">
                        <label>Adın</label>
                        <input type="text" id="onboardingName"
                               value="${currentName}"
                               placeholder="Adını gir..."
                               maxlength="30">
                    </div>

                    <div class="form-group">
                        <label>Profil Avatarı</label>
                        <div class="avatar-grid">
                            ${this.avatarOptions.map(avatar => `
                                <button class="avatar-option ${this.userData.avatar === avatar ? 'selected' : ''}"
                                        data-avatar="${avatar}"
                                        onclick="onboardingManager.selectAvatar('${avatar}')">
                                    ${avatar}
                                </button>
                            `).join('')}
                        </div>
                    </div>
                </div>

                <div class="onboarding-buttons">
                    <button class="btn-onboarding-back" onclick="onboardingManager.prevStep()">
                        <span class="btn-icon">←</span>
                        Geri
                    </button>
                    <button class="btn-onboarding-next" onclick="onboardingManager.nextStep()">
                        Devam
                        <span class="btn-icon">→</span>
                    </button>
                </div>
            </div>
        `;
    }

    // Avatar seç
    selectAvatar(avatar) {
        this.userData.avatar = avatar;
        document.querySelectorAll('.avatar-option').forEach(btn => {
            btn.classList.toggle('selected', btn.dataset.avatar === avatar);
        });
    }

    // Adım 3: Kategoriler
    renderCategories(container) {
        container.innerHTML = `
            <div class="onboarding-step categories-step">
                <h2>Hangi Alanları Takip Etmek İstersin?</h2>
                <p class="step-subtitle">Daha sonra değiştirebilirsin</p>

                <div class="category-options">
                    <label class="category-option">
                        <input type="checkbox"
                               ${this.userData.categories.study ? 'checked' : ''}
                               onchange="onboardingManager.toggleCategory('study', this.checked)">
                        <div class="category-card">
                            <span class="category-icon">📚</span>
                            <span class="category-name">Çalışma / Eğitim</span>
                            <span class="category-desc">Ders programı, sınavlar, ödevler</span>
                        </div>
                    </label>

                    <label class="category-option">
                        <input type="checkbox"
                               ${this.userData.categories.personal ? 'checked' : ''}
                               onchange="onboardingManager.toggleCategory('personal', this.checked)">
                        <div class="category-card">
                            <span class="category-icon">✅</span>
                            <span class="category-name">Kişisel Görevler</span>
                            <span class="category-desc">Yapılacaklar, hatırlatıcılar</span>
                        </div>
                    </label>

                    <label class="category-option">
                        <input type="checkbox"
                               ${this.userData.categories.health ? 'checked' : ''}
                               onchange="onboardingManager.toggleCategory('health', this.checked)">
                        <div class="category-card">
                            <span class="category-icon">💊</span>
                            <span class="category-name">Sağlık Takibi</span>
                            <span class="category-desc">İlaçlar, vitaminler, su tüketimi</span>
                        </div>
                    </label>

                    <label class="category-option">
                        <input type="checkbox"
                               ${this.userData.categories.expenses ? 'checked' : ''}
                               onchange="onboardingManager.toggleCategory('expenses', this.checked)">
                        <div class="category-card">
                            <span class="category-icon">💰</span>
                            <span class="category-name">Harcama Takibi</span>
                            <span class="category-desc">Bütçe, gelir-gider</span>
                        </div>
                    </label>
                </div>

                <div class="onboarding-buttons">
                    <button class="btn-onboarding-back" onclick="onboardingManager.prevStep()">
                        <span class="btn-icon">←</span>
                        Geri
                    </button>
                    <button class="btn-onboarding-next" onclick="onboardingManager.nextStep()">
                        Devam
                        <span class="btn-icon">→</span>
                    </button>
                </div>
            </div>
        `;
    }

    // Kategori toggle
    toggleCategory(category, checked) {
        this.userData.categories[category] = checked;
    }

    // Adım 4: Örnek Veri
    renderSampleData(container) {
        container.innerHTML = `
            <div class="onboarding-step sample-data-step">
                <h2>Hemen Başlayalım mı?</h2>
                <p class="step-subtitle">Sana başlangıç için örnek görevler ekleyelim mi?</p>

                <div class="sample-data-preview">
                    <div class="sample-item">
                        <span class="sample-check">✓</span>
                        <span>Uygulamayı keşfet</span>
                    </div>
                    <div class="sample-item">
                        <span class="sample-check">✓</span>
                        <span>İlk görevini ekle</span>
                    </div>
                    <div class="sample-item">
                        <span class="sample-check">✓</span>
                        <span>Ayarları incele</span>
                    </div>
                </div>

                <div class="sample-data-options">
                    <button class="btn-sample-yes ${this.userData.addSampleData ? 'selected' : ''}"
                            onclick="onboardingManager.setSampleData(true)">
                        <span class="option-icon">✨</span>
                        Evet, ekle
                    </button>
                    <button class="btn-sample-no ${!this.userData.addSampleData ? 'selected' : ''}"
                            onclick="onboardingManager.setSampleData(false)">
                        <span class="option-icon">📝</span>
                        Boş başla
                    </button>
                </div>

                <div class="onboarding-buttons">
                    <button class="btn-onboarding-back" onclick="onboardingManager.prevStep()">
                        <span class="btn-icon">←</span>
                        Geri
                    </button>
                    <button class="btn-onboarding-finish" onclick="onboardingManager.finish()">
                        Tamamla
                        <span class="btn-icon">🚀</span>
                    </button>
                </div>
            </div>
        `;
    }

    // Örnek veri seçimi
    setSampleData(value) {
        this.userData.addSampleData = value;
        document.querySelector('.btn-sample-yes')?.classList.toggle('selected', value);
        document.querySelector('.btn-sample-no')?.classList.toggle('selected', !value);
    }

    // Sonraki adım
    nextStep() {
        // Profil adımındaysa ismi kaydet
        if (this.currentStep === 1) {
            const nameInput = document.getElementById('onboardingName');
            if (nameInput) {
                this.userData.displayName = nameInput.value.trim();
            }
        }

        if (this.currentStep < this.totalSteps - 1) {
            this.currentStep++;
            this.renderStep();
        }
    }

    // Önceki adım
    prevStep() {
        if (this.currentStep > 0) {
            this.currentStep--;
            this.renderStep();
        }
    }

    // Wizard'ı tamamla
    async finish() {
        console.log('[Onboarding] Tamamlanıyor...', this.userData);

        try {
            // Loading göster
            const finishBtn = document.querySelector('.btn-onboarding-finish');
            if (finishBtn) {
                finishBtn.disabled = true;
                finishBtn.innerHTML = 'Hazırlanıyor... <span class="btn-icon">⏳</span>';
            }

            // Kullanıcı profilini güncelle
            await this.saveUserProfile();

            // Örnek veri ekle (istediyse)
            if (this.userData.addSampleData) {
                await this.addSampleData();
            }

            // Onboarding tamamlandı olarak işaretle
            await this.markOnboardingComplete();

            // Modal'ı kapat
            this.closeModal();

            // Başarı mesajı
            this.showWelcomeMessage();

            // Sayfayı yenile (verileri yüklemek için)
            setTimeout(() => {
                window.location.reload();
            }, 2000);

        } catch (error) {
            console.error('[Onboarding] Hata:', error);
            alert('Bir hata oluştu. Lütfen tekrar deneyin.');
        }
    }

    // Kullanıcı profilini kaydet
    async saveUserProfile() {
        const user = authManager?.getCurrentUser();
        if (!user) return;

        try {
            // Firebase Auth profil güncelle
            if (this.userData.displayName) {
                await user.updateProfile({
                    displayName: this.userData.displayName
                });
            }

            // Firestore'da güncelle
            await db.collection(FirestoreCollections.USERS).doc(user.uid).update({
                displayName: this.userData.displayName || user.displayName,
                avatar: this.userData.avatar,
                'settings.categories': this.userData.categories,
                updatedAt: FirestoreHelpers.timestamp()
            });

            console.log('[Onboarding] Profil kaydedildi');
        } catch (error) {
            console.error('[Onboarding] Profil kaydetme hatası:', error);
        }
    }

    // Örnek veri ekle
    async addSampleData() {
        const user = authManager?.getCurrentUser();
        if (!user) return;

        const sampleTodos = [
            {
                title: 'Uygulamayı keşfet',
                description: 'Life Manager\'ın özelliklerini incele',
                priority: 'high',
                category: 'personal',
                completed: false,
                createdAt: FirestoreHelpers.timestamp(),
                userId: user.uid
            },
            {
                title: 'İlk görevini ekle',
                description: 'Sol alttaki + butonuna tıklayarak yeni görev ekle',
                priority: 'medium',
                category: 'personal',
                completed: false,
                createdAt: FirestoreHelpers.timestamp(),
                userId: user.uid
            },
            {
                title: 'Ayarları incele',
                description: 'Tema, bildirimler ve diğer ayarları özelleştir',
                priority: 'low',
                category: 'personal',
                completed: false,
                createdAt: FirestoreHelpers.timestamp(),
                userId: user.uid
            }
        ];

        try {
            const batch = db.batch();

            sampleTodos.forEach(todo => {
                const docRef = db.collection(FirestoreCollections.TODOS).doc();
                batch.set(docRef, todo);
            });

            await batch.commit();
            console.log('[Onboarding] Örnek veriler eklendi');
        } catch (error) {
            console.error('[Onboarding] Örnek veri ekleme hatası:', error);
        }
    }

    // Onboarding tamamlandı işaretle
    async markOnboardingComplete() {
        const user = authManager?.getCurrentUser();
        if (!user) return;

        try {
            await db.collection(FirestoreCollections.USERS).doc(user.uid).update({
                onboardingCompleted: true,
                onboardingCompletedAt: FirestoreHelpers.timestamp()
            });
            console.log('[Onboarding] Tamamlandı olarak işaretlendi');
        } catch (error) {
            console.error('[Onboarding] İşaretleme hatası:', error);
        }
    }

    // Hoşgeldin mesajı göster
    showWelcomeMessage() {
        const name = this.userData.displayName || 'Kullanıcı';

        // Toast notification göster
        if (window.showToast) {
            window.showToast(`Hoş geldin ${name}! 🎉`, 'success');
        } else {
            // Fallback
            const toast = document.createElement('div');
            toast.className = 'welcome-toast';
            toast.innerHTML = `
                <span class="toast-icon">🎉</span>
                <span>Hoş geldin ${name}!</span>
            `;
            document.body.appendChild(toast);

            setTimeout(() => toast.classList.add('show'), 100);
            setTimeout(() => {
                toast.classList.remove('show');
                setTimeout(() => toast.remove(), 300);
            }, 3000);
        }
    }
}

// Global instance
let onboardingManager;

// DOM yüklendiğinde başlat
document.addEventListener('DOMContentLoaded', () => {
    onboardingManager = new OnboardingManager();
    window.onboardingManager = onboardingManager;
});

console.log('[Onboarding Manager] Yüklendi');
