// ==================== AUTH MANAGER ====================
// Life Manager - Kullanıcı Kimlik Doğrulama Yönetimi
// Versiyon: 1.0.0

class AuthManager {
    constructor() {
        this.user = null;
        this.isInitialized = false;
        this.listeners = [];
        this.errorMessages = {
            'auth/email-already-in-use': 'Bu e-posta adresi zaten kullanılıyor.',
            'auth/invalid-email': 'Geçersiz e-posta adresi.',
            'auth/operation-not-allowed': 'E-posta/şifre girişi etkin değil.',
            'auth/weak-password': 'Şifre en az 6 karakter olmalıdır.',
            'auth/user-disabled': 'Bu hesap devre dışı bırakılmış.',
            'auth/user-not-found': 'Kullanıcı bulunamadı.',
            'auth/wrong-password': 'Hatalı şifre.',
            'auth/invalid-credential': 'Geçersiz kimlik bilgileri.',
            'auth/too-many-requests': 'Çok fazla başarısız deneme. Lütfen daha sonra tekrar deneyin.',
            'auth/network-request-failed': 'Ağ bağlantısı hatası. İnternet bağlantınızı kontrol edin.',
            'auth/popup-closed-by-user': 'Giriş penceresi kapatıldı.',
            'auth/requires-recent-login': 'Bu işlem için yeniden giriş yapmanız gerekiyor.'
        };
    }

    // Başlat
    async init() {
        if (this.isInitialized) return;

        try {
            // Firebase'in hazır olmasını bekle
            if (!isFirebaseReady()) {
                initializeFirebase();
            }

            // Auth durumu değişikliklerini dinle
            auth.onAuthStateChanged((user) => {
                this.user = user;
                this.notifyListeners(user);

                if (user) {
                    console.log('[Auth] Kullanıcı giriş yaptı:', user.email);
                    this.onUserLoggedIn(user);
                } else {
                    console.log('[Auth] Kullanıcı çıkış yaptı');
                    this.onUserLoggedOut();
                }
            });

            this.isInitialized = true;
            console.log('[Auth] Manager başlatıldı');
        } catch (error) {
            console.error('[Auth] Başlatma hatası:', error);
        }
    }

    // Listener ekle
    addListener(callback) {
        this.listeners.push(callback);
        // Mevcut durumu hemen bildir
        if (this.user !== null) {
            callback(this.user);
        }
    }

    // Listener'ları bilgilendir
    notifyListeners(user) {
        this.listeners.forEach(callback => callback(user));
    }

    // Email/Şifre ile kayıt ol
    async register(email, password, displayName) {
        try {
            this.showLoading(true);

            const userCredential = await auth.createUserWithEmailAndPassword(email, password);
            const user = userCredential.user;

            // Kullanıcı adını güncelle
            if (displayName) {
                await user.updateProfile({ displayName });
            }

            // Firestore'a kullanıcı dokümanı oluştur
            await this.createUserDocument(user, displayName);

            console.log('[Auth] Kayıt başarılı:', email);
            this.closeAuthModal();
            return { success: true, user };
        } catch (error) {
            console.error('[Auth] Kayıt hatası:', error);
            return { success: false, error: this.getErrorMessage(error.code) };
        } finally {
            this.showLoading(false);
        }
    }

    // Email/Şifre ile giriş yap
    async login(email, password) {
        try {
            this.showLoading(true);

            const userCredential = await auth.signInWithEmailAndPassword(email, password);
            console.log('[Auth] Giriş başarılı:', email);
            this.closeAuthModal();
            return { success: true, user: userCredential.user };
        } catch (error) {
            console.error('[Auth] Giriş hatası:', error);
            return { success: false, error: this.getErrorMessage(error.code) };
        } finally {
            this.showLoading(false);
        }
    }

    // Çıkış yap
    async logout() {
        try {
            await auth.signOut();
            // localStorage'ı temizle (güvenlik için)
            // Sadece kullanıcıya özel verileri temizle
            console.log('[Auth] Çıkış yapıldı');
            return { success: true };
        } catch (error) {
            console.error('[Auth] Çıkış hatası:', error);
            return { success: false, error: this.getErrorMessage(error.code) };
        }
    }

    // Şifre sıfırlama e-postası gönder
    async sendPasswordResetEmail(email) {
        try {
            this.showLoading(true);
            await auth.sendPasswordResetEmail(email);
            console.log('[Auth] Şifre sıfırlama e-postası gönderildi:', email);
            return { success: true, message: 'Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.' };
        } catch (error) {
            console.error('[Auth] Şifre sıfırlama hatası:', error);
            return { success: false, error: this.getErrorMessage(error.code) };
        } finally {
            this.showLoading(false);
        }
    }

    // Firestore'da kullanıcı dokümanı oluştur
    async createUserDocument(user, displayName) {
        try {
            const userRef = db.collection(FirestoreCollections.USERS).doc(user.uid);
            const doc = await userRef.get();

            if (!doc.exists) {
                await userRef.set({
                    email: user.email,
                    displayName: displayName || user.displayName || '',
                    avatar: '🎓',
                    createdAt: FirestoreHelpers.timestamp(),
                    onboardingCompleted: false,
                    settings: {
                        theme: 'light',
                        language: 'tr',
                        notifications: true
                    }
                });
                console.log('[Auth] Kullanıcı dokümanı oluşturuldu');
            }
        } catch (error) {
            console.error('[Auth] Kullanıcı dokümanı oluşturma hatası:', error);
        }
    }

    // Kullanıcı giriş yaptığında
    async onUserLoggedIn(user) {
        // UI'ı güncelle
        this.updateUserUI(user);

        // Onboarding kontrolü
        const needsOnboarding = await this.checkOnboarding(user.uid);
        if (needsOnboarding && window.onboardingManager) {
            window.onboardingManager.start();
        }
    }

    // Kullanıcı çıkış yaptığında
    onUserLoggedOut() {
        this.updateUserUI(null);
        this.showAuthModal();
    }

    // Onboarding kontrolü
    async checkOnboarding(userId) {
        try {
            const userDoc = await db.collection(FirestoreCollections.USERS).doc(userId).get();
            if (userDoc.exists) {
                return !userDoc.data().onboardingCompleted;
            }
            return true;
        } catch (error) {
            console.error('[Auth] Onboarding kontrolü hatası:', error);
            return false;
        }
    }

    // UI güncelle
    updateUserUI(user) {
        const userMenu = document.getElementById('userMenu');
        const userAvatar = document.getElementById('userAvatar');
        const userName = document.getElementById('userDisplayName');
        const userEmail = document.getElementById('userEmailDisplay');
        const loginBtn = document.getElementById('loginBtn');

        if (user) {
            // Giriş yapılmış
            if (userMenu) userMenu.style.display = 'flex';
            if (loginBtn) loginBtn.style.display = 'none';
            if (userAvatar) {
                userAvatar.textContent = user.displayName ? user.displayName.charAt(0).toUpperCase() : '👤';
            }
            if (userName) userName.textContent = user.displayName || 'Kullanıcı';
            if (userEmail) userEmail.textContent = user.email;
        } else {
            // Çıkış yapılmış
            if (userMenu) userMenu.style.display = 'none';
            if (loginBtn) loginBtn.style.display = 'flex';
        }
    }

    // Auth modal'ı göster
    showAuthModal(tab = 'login') {
        const modal = document.getElementById('authModal');
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
            this.switchTab(tab);
        }
    }

    // Auth modal'ı kapat
    closeAuthModal() {
        const modal = document.getElementById('authModal');
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
            this.clearForms();
        }
    }

    // Tab değiştir
    switchTab(tab) {
        const tabs = document.querySelectorAll('.auth-tab');
        const forms = document.querySelectorAll('.auth-form');

        tabs.forEach(t => {
            t.classList.toggle('active', t.dataset.tab === tab);
        });

        forms.forEach(f => {
            f.classList.toggle('active', f.id === `${tab}Form`);
        });

        // Reset password formunu gizle
        const resetForm = document.getElementById('resetPasswordForm');
        if (resetForm) {
            resetForm.classList.remove('active');
        }
    }

    // Şifre sıfırlama formunu göster
    showResetPassword() {
        const forms = document.querySelectorAll('.auth-form');
        forms.forEach(f => f.classList.remove('active'));

        const resetForm = document.getElementById('resetPasswordForm');
        if (resetForm) {
            resetForm.classList.add('active');
        }
    }

    // Formları temizle
    clearForms() {
        const inputs = document.querySelectorAll('.auth-modal input');
        inputs.forEach(input => input.value = '');

        const errors = document.querySelectorAll('.auth-error');
        errors.forEach(err => err.textContent = '');
    }

    // Hata mesajı göster
    showError(formId, message) {
        const errorEl = document.querySelector(`#${formId} .auth-error`);
        if (errorEl) {
            errorEl.textContent = message;
        }
    }

    // Loading göster/gizle
    showLoading(show) {
        const buttons = document.querySelectorAll('.auth-modal .btn-primary');
        buttons.forEach(btn => {
            btn.disabled = show;
            if (show) {
                btn.dataset.originalText = btn.textContent;
                btn.textContent = 'Yükleniyor...';
            } else if (btn.dataset.originalText) {
                btn.textContent = btn.dataset.originalText;
            }
        });
    }

    // Hata kodunu Türkçe mesaja çevir
    getErrorMessage(code) {
        return this.errorMessages[code] || 'Bir hata oluştu. Lütfen tekrar deneyin.';
    }

    // Mevcut kullanıcıyı al
    getCurrentUser() {
        return this.user;
    }

    // Kullanıcı giriş yapmış mı?
    isLoggedIn() {
        return this.user !== null;
    }
}

// Form handler'lar
function handleLoginSubmit(event) {
    event.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    authManager.login(email, password).then(result => {
        if (!result.success) {
            authManager.showError('loginForm', result.error);
        }
    });
}

function handleRegisterSubmit(event) {
    event.preventDefault();
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('registerConfirmPassword').value;

    if (password !== confirmPassword) {
        authManager.showError('registerForm', 'Şifreler eşleşmiyor.');
        return;
    }

    authManager.register(email, password, name).then(result => {
        if (!result.success) {
            authManager.showError('registerForm', result.error);
        }
    });
}

function handleResetPasswordSubmit(event) {
    event.preventDefault();
    const email = document.getElementById('resetEmail').value;

    authManager.sendPasswordResetEmail(email).then(result => {
        if (result.success) {
            alert(result.message);
            authManager.switchTab('login');
        } else {
            authManager.showError('resetPasswordForm', result.error);
        }
    });
}

// Global instance
let authManager;

// DOM yüklendiğinde başlat
document.addEventListener('DOMContentLoaded', () => {
    authManager = new AuthManager();
    window.authManager = authManager;

    // Firebase hazır olduğunda auth'u başlat
    setTimeout(() => {
        if (isFirebaseReady()) {
            authManager.init();
        } else {
            initializeFirebase();
            authManager.init();
        }
    }, 100);
});

console.log('[Auth Manager] Yüklendi');
