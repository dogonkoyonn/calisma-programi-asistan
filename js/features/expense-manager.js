// ==================== EXPENSE MANAGER ====================
// Life Manager - Harcama Takibi Yöneticisi
// Nakit harcama, bütçe ve streak takibi
// Versiyon: 1.0.0

class ExpenseManager {
    constructor() {
        this.transactions = [];
        this.accounts = [];
        this.categories = [];
        this.budget = {
            monthly: 0,
            categories: {}
        };
        this.streak = {
            currentStreak: 0,
            longestStreak: 0,
            lastEntryDate: null
        };
        this.badges = [];
        this.quickTemplates = [];

        this.defaultCategories = [
            { id: 'food', name: 'Yemek', icon: '🍔', color: '#FF6B6B' },
            { id: 'transport', name: 'Ulaşım', icon: '🚗', color: '#4ECDC4' },
            { id: 'entertainment', name: 'Eğlence', icon: '🎬', color: '#95E1D3' },
            { id: 'bills', name: 'Fatura', icon: '📄', color: '#FFE66D' },
            { id: 'shopping', name: 'Alışveriş', icon: '🛍️', color: '#FF8B94' },
            { id: 'health', name: 'Sağlık', icon: '💊', color: '#A8E6CF' },
            { id: 'education', name: 'Eğitim', icon: '📚', color: '#667eea' },
            { id: 'income', name: 'Gelir', icon: '💰', color: '#2ECC71' },
            { id: 'other', name: 'Diğer', icon: '📦', color: '#DCEDC1' }
        ];

        this.badgeDefinitions = {
            streak7: { id: 'streak7', name: 'Başlangıç', icon: '🥉', description: '7 gün streak', requirement: 7 },
            streak30: { id: 'streak30', name: 'Düzenli', icon: '🥈', description: '30 gün streak', requirement: 30 },
            streak90: { id: 'streak90', name: 'Uzman', icon: '🥇', description: '90 gün streak', requirement: 90 },
            streak365: { id: 'streak365', name: 'Efsane', icon: '🏆', description: '365 gün streak', requirement: 365 },
            saver: { id: 'saver', name: 'Tasarrufçu', icon: '💵', description: 'Bütçenin altında kaldı' },
            frugal: { id: 'frugal', name: 'Tutumlu', icon: '📉', description: 'Geçen aya göre %20 az harcadı' },
            recorder50: { id: 'recorder50', name: 'Kayıt Tutucu', icon: '📝', description: '50 işlem girdi' },
            recorder100: { id: 'recorder100', name: 'Kayıt Ustası', icon: '📚', description: '100 işlem girdi' },
            categoryMaster: { id: 'categoryMaster', name: 'Kategori Ustası', icon: '🎯', description: 'Tüm kategorilerde harcama' }
        };

        this.load();
    }

    // ==================== DATA MANAGEMENT ====================

    load() {
        const data = DataManager.load(DataManager.KEYS.EXPENSES);
        if (data) {
            this.transactions = data.transactions || [];
            this.accounts = data.accounts || [
                { id: 'acc_cash', name: 'Nakit', balance: 0, type: 'cash', isDefault: true }
            ];
            this.categories = data.categories || this.defaultCategories;
            this.budget = data.budget || { monthly: 0, categories: {} };
            this.streak = data.streak || { currentStreak: 0, longestStreak: 0, lastEntryDate: null };
            this.badges = data.badges || [];
            this.quickTemplates = data.quickTemplates || [];
        } else {
            // İlk kez yükleniyor, varsayılanları ayarla
            this.accounts = [{ id: 'acc_cash', name: 'Nakit', balance: 0, type: 'cash', isDefault: true }];
            this.categories = [...this.defaultCategories];
        }

        // Streak'i güncelle (gün değişmiş olabilir)
        this.updateStreak();

        console.log('[ExpenseManager] Yüklendi:', this.transactions.length, 'işlem');
    }

    save() {
        DataManager.save(DataManager.KEYS.EXPENSES, {
            transactions: this.transactions,
            accounts: this.accounts,
            categories: this.categories,
            budget: this.budget,
            streak: this.streak,
            badges: this.badges,
            quickTemplates: this.quickTemplates
        });

        // Badge güncelle
        if (window.categoryManager) {
            categoryManager.updateBadges();
        }
    }

    // ==================== TRANSACTION CRUD ====================

    addTransaction(tx) {
        const transaction = {
            id: `exp_${Date.now()}`,
            type: tx.type || 'expense', // expense | income
            amount: parseFloat(tx.amount) || 0,
            category: tx.category || 'other',
            account: tx.account || 'acc_cash',
            description: tx.description || '',
            date: tx.date || new Date().toISOString().split('T')[0],
            tags: tx.tags || [],
            createdAt: new Date().toISOString()
        };

        this.transactions.push(transaction);

        // Hesap bakiyesini güncelle
        this.updateAccountBalance(transaction.account, transaction.type === 'income' ? transaction.amount : -transaction.amount);

        // Streak güncelle
        this.recordEntry();

        // Hızlı şablon güncelle
        this.updateQuickTemplates(transaction);

        // Bütçe kontrolü
        this.checkBudgetAlerts();

        // Rozet kontrolü
        this.checkBadges();

        this.save();

        console.log('[ExpenseManager] İşlem eklendi:', transaction.type, transaction.amount);
        return transaction;
    }

    updateTransaction(id, updates) {
        const index = this.transactions.findIndex(t => t.id === id);
        if (index === -1) return null;

        const oldTx = this.transactions[index];

        // Eski işlemi hesaptan geri al
        const oldAmount = oldTx.type === 'income' ? -oldTx.amount : oldTx.amount;
        this.updateAccountBalance(oldTx.account, oldAmount);

        // Güncelle
        this.transactions[index] = {
            ...oldTx,
            ...updates,
            updatedAt: new Date().toISOString()
        };

        const newTx = this.transactions[index];

        // Yeni işlemi hesaba ekle
        const newAmount = newTx.type === 'income' ? newTx.amount : -newTx.amount;
        this.updateAccountBalance(newTx.account, newAmount);

        this.save();
        return newTx;
    }

    deleteTransaction(id) {
        const tx = this.transactions.find(t => t.id === id);
        if (!tx) return false;

        // Hesaptan geri al
        const amount = tx.type === 'income' ? -tx.amount : tx.amount;
        this.updateAccountBalance(tx.account, amount);

        this.transactions = this.transactions.filter(t => t.id !== id);
        this.save();

        console.log('[ExpenseManager] İşlem silindi:', id);
        return true;
    }

    getTransaction(id) {
        return this.transactions.find(t => t.id === id);
    }

    // ==================== ACCOUNT MANAGEMENT ====================

    updateAccountBalance(accountId, amount) {
        const account = this.accounts.find(a => a.id === accountId);
        if (account) {
            account.balance = (account.balance || 0) + amount;
        }
    }

    addAccount(acc) {
        const account = {
            id: `acc_${Date.now()}`,
            name: acc.name || 'Hesap',
            balance: parseFloat(acc.balance) || 0,
            type: acc.type || 'cash', // cash | card | bank
            isDefault: false
        };
        this.accounts.push(account);
        this.save();
        return account;
    }

    getDefaultAccount() {
        return this.accounts.find(a => a.isDefault) || this.accounts[0];
    }

    getTotalBalance() {
        return this.accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);
    }

    // ==================== FILTERING & QUERIES ====================

    getTransactionsByDateRange(startDate, endDate) {
        return this.transactions.filter(t => {
            return t.date >= startDate && t.date <= endDate;
        });
    }

    getTransactionsByCategory(categoryId) {
        return this.transactions.filter(t => t.category === categoryId);
    }

    getTransactionsByType(type) {
        return this.transactions.filter(t => t.type === type);
    }

    getTransactionsByMonth(year, month) {
        const monthStr = `${year}-${String(month).padStart(2, '0')}`;
        return this.transactions.filter(t => t.date.startsWith(monthStr));
    }

    getTodayTransactions() {
        const today = new Date().toISOString().split('T')[0];
        return this.transactions.filter(t => t.date === today);
    }

    getThisWeekTransactions() {
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        const startStr = startOfWeek.toISOString().split('T')[0];
        const endStr = today.toISOString().split('T')[0];
        return this.getTransactionsByDateRange(startStr, endStr);
    }

    getThisMonthTransactions() {
        const today = new Date();
        return this.getTransactionsByMonth(today.getFullYear(), today.getMonth() + 1);
    }

    // ==================== BUDGET MANAGEMENT ====================

    setBudget(monthly, categories = {}) {
        this.budget = {
            monthly: parseFloat(monthly) || 0,
            categories: categories
        };
        this.save();
    }

    setCategoryBudget(categoryId, amount) {
        this.budget.categories[categoryId] = parseFloat(amount) || 0;
        this.save();
    }

    getBudgetStatus() {
        const thisMonth = this.getThisMonthTransactions();
        const totalExpenses = thisMonth
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);

        const totalIncome = thisMonth
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);

        const remaining = this.budget.monthly - totalExpenses;
        const percentage = this.budget.monthly > 0
            ? Math.round((totalExpenses / this.budget.monthly) * 100)
            : 0;

        return {
            budget: this.budget.monthly,
            spent: totalExpenses,
            income: totalIncome,
            remaining: remaining,
            percentage: Math.min(percentage, 100),
            overBudget: remaining < 0
        };
    }

    getCategoryBudgetStatus(categoryId) {
        const categoryBudget = this.budget.categories[categoryId] || 0;
        if (categoryBudget === 0) return null;

        const thisMonth = this.getThisMonthTransactions();
        const categoryExpenses = thisMonth
            .filter(t => t.type === 'expense' && t.category === categoryId)
            .reduce((sum, t) => sum + t.amount, 0);

        const remaining = categoryBudget - categoryExpenses;
        const percentage = Math.round((categoryExpenses / categoryBudget) * 100);

        return {
            budget: categoryBudget,
            spent: categoryExpenses,
            remaining: remaining,
            percentage: Math.min(percentage, 100),
            overBudget: remaining < 0
        };
    }

    checkBudgetAlerts() {
        const status = this.getBudgetStatus();

        if (status.budget > 0) {
            if (status.percentage >= 100 && !this._budgetExceededNotified) {
                this._budgetExceededNotified = true;
                this.showNotification('Bütçe Aşımı!', 'Bu ay bütçeni aştın!', 'warning');
            } else if (status.percentage >= 80 && status.percentage < 100 && !this._budget80Notified) {
                this._budget80Notified = true;
                this.showNotification('Bütçe Uyarısı', 'Bütçenin %80\'ine ulaştın!', 'info');
            }
        }

        // Her ay başında reset
        const today = new Date();
        if (today.getDate() === 1) {
            this._budgetExceededNotified = false;
            this._budget80Notified = false;
        }
    }

    // ==================== STREAK SYSTEM ====================

    recordEntry() {
        const today = new Date().toISOString().split('T')[0];

        if (this.streak.lastEntryDate === today) {
            // Bugün zaten kayıt var
            return;
        }

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        if (this.streak.lastEntryDate === yesterdayStr) {
            // Streak devam ediyor
            this.streak.currentStreak++;
        } else if (this.streak.lastEntryDate !== today) {
            // Streak kırıldı, yeniden başla
            this.streak.currentStreak = 1;
        }

        this.streak.lastEntryDate = today;

        // En uzun streak güncelle
        if (this.streak.currentStreak > this.streak.longestStreak) {
            this.streak.longestStreak = this.streak.currentStreak;
        }

        // Streak rozetlerini kontrol et
        this.checkStreakBadges();
    }

    updateStreak() {
        if (!this.streak.lastEntryDate) return;

        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        // Eğer dün veya bugün kayıt yoksa streak sıfırlanır
        if (this.streak.lastEntryDate !== today && this.streak.lastEntryDate !== yesterdayStr) {
            this.streak.currentStreak = 0;
            this.save();
        }
    }

    checkStreakBadges() {
        const streakBadges = ['streak7', 'streak30', 'streak90', 'streak365'];

        for (const badgeId of streakBadges) {
            const badge = this.badgeDefinitions[badgeId];
            if (this.streak.currentStreak >= badge.requirement && !this.hasBadge(badgeId)) {
                this.awardBadge(badgeId);
            }
        }
    }

    getStreakInfo() {
        return {
            current: this.streak.currentStreak,
            longest: this.streak.longestStreak,
            lastEntry: this.streak.lastEntryDate,
            nextMilestone: this.getNextStreakMilestone()
        };
    }

    getNextStreakMilestone() {
        const milestones = [7, 30, 90, 365];
        for (const m of milestones) {
            if (this.streak.currentStreak < m) {
                return { target: m, remaining: m - this.streak.currentStreak };
            }
        }
        return null;
    }

    // ==================== BADGE SYSTEM ====================

    hasBadge(badgeId) {
        return this.badges.some(b => b.id === badgeId);
    }

    awardBadge(badgeId) {
        if (this.hasBadge(badgeId)) return;

        const badge = this.badgeDefinitions[badgeId];
        if (!badge) return;

        this.badges.push({
            id: badgeId,
            awardedAt: new Date().toISOString()
        });

        this.save();
        this.showBadgeNotification(badge);

        console.log('[ExpenseManager] Rozet kazanıldı:', badge.name);
    }

    checkBadges() {
        // Kayıt sayısı rozetleri
        const totalCount = this.transactions.length;
        if (totalCount >= 50 && !this.hasBadge('recorder50')) {
            this.awardBadge('recorder50');
        }
        if (totalCount >= 100 && !this.hasBadge('recorder100')) {
            this.awardBadge('recorder100');
        }

        // Kategori ustası rozeti
        const usedCategories = new Set(this.transactions.map(t => t.category));
        const expenseCategories = this.categories.filter(c => c.id !== 'income');
        if (usedCategories.size >= expenseCategories.length && !this.hasBadge('categoryMaster')) {
            this.awardBadge('categoryMaster');
        }

        // Tasarrufçu rozeti (ay sonunda kontrol edilir)
        this.checkMonthlyBadges();
    }

    checkMonthlyBadges() {
        const today = new Date();
        const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();

        if (today.getDate() === lastDayOfMonth) {
            const status = this.getBudgetStatus();

            // Tasarrufçu: Bütçenin altında kaldı
            if (status.budget > 0 && !status.overBudget && !this.hasBadge('saver')) {
                this.awardBadge('saver');
            }

            // Tutumlu: Geçen aya göre %20 az harcadı
            const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
            const lastMonthTx = this.getTransactionsByMonth(lastMonth.getFullYear(), lastMonth.getMonth() + 1);
            const lastMonthExpenses = lastMonthTx
                .filter(t => t.type === 'expense')
                .reduce((sum, t) => sum + t.amount, 0);

            if (lastMonthExpenses > 0 && status.spent <= lastMonthExpenses * 0.8 && !this.hasBadge('frugal')) {
                this.awardBadge('frugal');
            }
        }
    }

    getAllBadges() {
        return Object.values(this.badgeDefinitions).map(def => ({
            ...def,
            earned: this.hasBadge(def.id),
            earnedAt: this.badges.find(b => b.id === def.id)?.awardedAt
        }));
    }

    // ==================== QUICK TEMPLATES ====================

    updateQuickTemplates(transaction) {
        if (transaction.type !== 'expense') return;

        // Aynı açıklama ve kategori varsa güncelle
        const existingIndex = this.quickTemplates.findIndex(
            t => t.description === transaction.description && t.category === transaction.category
        );

        if (existingIndex !== -1) {
            this.quickTemplates[existingIndex].useCount++;
            this.quickTemplates[existingIndex].lastUsed = new Date().toISOString();
            this.quickTemplates[existingIndex].amount = transaction.amount; // Son tutarı güncelle
        } else {
            this.quickTemplates.push({
                description: transaction.description,
                category: transaction.category,
                amount: transaction.amount,
                useCount: 1,
                lastUsed: new Date().toISOString()
            });
        }

        // En çok kullanılan 5 şablonu tut
        this.quickTemplates.sort((a, b) => b.useCount - a.useCount);
        this.quickTemplates = this.quickTemplates.slice(0, 5);
    }

    getQuickTemplates() {
        return this.quickTemplates;
    }

    // ==================== STATISTICS ====================

    getStatistics(period = 'month') {
        let transactions;

        switch (period) {
            case 'today':
                transactions = this.getTodayTransactions();
                break;
            case 'week':
                transactions = this.getThisWeekTransactions();
                break;
            case 'month':
            default:
                transactions = this.getThisMonthTransactions();
                break;
        }

        const expenses = transactions.filter(t => t.type === 'expense');
        const income = transactions.filter(t => t.type === 'income');

        const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);
        const totalIncome = income.reduce((sum, t) => sum + t.amount, 0);

        // Kategori bazlı dağılım
        const categoryBreakdown = {};
        expenses.forEach(t => {
            if (!categoryBreakdown[t.category]) {
                categoryBreakdown[t.category] = 0;
            }
            categoryBreakdown[t.category] += t.amount;
        });

        // Günlük ortalama
        const dayCount = period === 'today' ? 1 : period === 'week' ? 7 : 30;
        const dailyAverage = totalExpenses / dayCount;

        return {
            period,
            totalExpenses,
            totalIncome,
            netBalance: totalIncome - totalExpenses,
            transactionCount: transactions.length,
            categoryBreakdown,
            dailyAverage: Math.round(dailyAverage),
            topCategory: this.getTopCategory(categoryBreakdown)
        };
    }

    getTopCategory(breakdown) {
        let topId = null;
        let topAmount = 0;

        for (const [id, amount] of Object.entries(breakdown)) {
            if (amount > topAmount) {
                topAmount = amount;
                topId = id;
            }
        }

        if (!topId) return null;

        const category = this.categories.find(c => c.id === topId);
        return category ? { ...category, amount: topAmount } : null;
    }

    getWeeklyTrend() {
        const today = new Date();
        const days = [];

        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];

            const dayTransactions = this.transactions.filter(t => t.date === dateStr && t.type === 'expense');
            const total = dayTransactions.reduce((sum, t) => sum + t.amount, 0);

            days.push({
                date: dateStr,
                dayName: ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'][date.getDay()],
                total: total
            });
        }

        return days;
    }

    getCategoryChartData() {
        const stats = this.getStatistics('month');
        const data = [];

        for (const [categoryId, amount] of Object.entries(stats.categoryBreakdown)) {
            const category = this.categories.find(c => c.id === categoryId);
            if (category) {
                data.push({
                    label: category.name,
                    value: amount,
                    color: category.color,
                    icon: category.icon
                });
            }
        }

        return data.sort((a, b) => b.value - a.value);
    }

    // ==================== NOTIFICATIONS ====================

    showNotification(title, body, type = 'info') {
        if (window.notificationManager) {
            notificationManager.show(title, body, type);
        } else {
            console.log(`[ExpenseManager] ${type}: ${title} - ${body}`);
        }
    }

    showBadgeNotification(badge) {
        this.showNotification(
            `${badge.icon} Rozet Kazandın!`,
            `${badge.name}: ${badge.description}`,
            'success'
        );

        // Konfeti efekti (varsa)
        if (window.confetti) {
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            });
        }
    }

    scheduleReminders() {
        if (!window.notificationManager) return;

        // Günlük hatırlatma (21:00)
        const now = new Date();
        const reminderTime = new Date(now);
        reminderTime.setHours(21, 0, 0, 0);

        if (reminderTime < now) {
            reminderTime.setDate(reminderTime.getDate() + 1);
        }

        const msUntilReminder = reminderTime - now;

        setTimeout(() => {
            const todayTx = this.getTodayTransactions();
            if (todayTx.length === 0) {
                this.showNotification(
                    '💰 Harcama Hatırlatması',
                    'Bugünkü harcamalarını ekledin mi?',
                    'info'
                );
            }
            // Bir sonraki gün için tekrar planla
            this.scheduleReminders();
        }, msUntilReminder);
    }

    // ==================== UI HELPERS ====================

    formatCurrency(amount) {
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'TRY',
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        }).format(amount);
    }

    getCategory(categoryId) {
        return this.categories.find(c => c.id === categoryId) ||
               { id: 'other', name: 'Diğer', icon: '📦', color: '#DCEDC1' };
    }

    getRelativeDate(dateStr) {
        const date = new Date(dateStr);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const dateOnly = dateStr;
        const todayOnly = today.toISOString().split('T')[0];
        const yesterdayOnly = yesterday.toISOString().split('T')[0];

        if (dateOnly === todayOnly) return 'Bugün';
        if (dateOnly === yesterdayOnly) return 'Dün';

        const diffDays = Math.floor((today - date) / (1000 * 60 * 60 * 24));
        if (diffDays < 7) return `${diffDays} gün önce`;

        return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
    }

    // ==================== UI RENDERING ====================

    renderExpensesList(containerId = 'expensesList') {
        const container = document.getElementById(containerId);
        if (!container) return;

        const transactions = this.getThisMonthTransactions()
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 10);

        if (transactions.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <span class="empty-icon">💰</span>
                    <p>Henüz harcama kaydı yok</p>
                    <p class="empty-hint">İlk harcamanı ekleyerek başla!</p>
                </div>
            `;
            return;
        }

        container.innerHTML = transactions.map(tx => {
            const category = this.getCategory(tx.category);
            const isExpense = tx.type === 'expense';

            return `
                <div class="expense-item ${tx.type}" data-id="${tx.id}">
                    <div class="expense-icon" style="background-color: ${category.color}20; color: ${category.color}">
                        ${category.icon}
                    </div>
                    <div class="expense-info">
                        <div class="expense-description">${tx.description || category.name}</div>
                        <div class="expense-category">${category.name}</div>
                    </div>
                    <div class="expense-amount ${isExpense ? 'negative' : 'positive'}">
                        ${isExpense ? '-' : '+'}${this.formatCurrency(tx.amount)}
                    </div>
                    <div class="expense-date">${this.getRelativeDate(tx.date)}</div>
                    <button class="expense-delete" onclick="expenseManager.handleDeleteClick('${tx.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
        }).join('');
    }

    renderBudgetProgress(containerId = 'budgetProgress') {
        const container = document.getElementById(containerId);
        if (!container) return;

        const status = this.getBudgetStatus();

        if (status.budget === 0) {
            container.innerHTML = `
                <div class="budget-empty">
                    <p>Aylık bütçe belirlenmedi</p>
                    <button class="btn-small" onclick="expenseManager.showBudgetModal()">
                        Bütçe Belirle
                    </button>
                </div>
            `;
            return;
        }

        const progressColor = status.percentage >= 100 ? '#FF6B6B' :
                             status.percentage >= 80 ? '#FFE66D' : '#4ECDC4';

        container.innerHTML = `
            <div class="budget-header">
                <span>Bu Ay</span>
                <span class="budget-remaining ${status.overBudget ? 'over' : ''}">
                    ${status.overBudget ? 'Aşım: ' : 'Kalan: '}${this.formatCurrency(Math.abs(status.remaining))}
                </span>
            </div>
            <div class="budget-amounts">
                <span class="spent">${this.formatCurrency(status.spent)}</span>
                <span class="total">/ ${this.formatCurrency(status.budget)}</span>
            </div>
            <div class="budget-bar">
                <div class="budget-fill" style="width: ${status.percentage}%; background-color: ${progressColor}"></div>
            </div>
            <div class="budget-percentage">${status.percentage}%</div>
        `;
    }

    renderStreakWidget(containerId = 'streakWidget') {
        const container = document.getElementById(containerId);
        if (!container) return;

        const info = this.getStreakInfo();
        const milestone = info.nextMilestone;

        container.innerHTML = `
            <div class="streak-display">
                <span class="streak-fire">🔥</span>
                <span class="streak-count">${info.current}</span>
                <span class="streak-label">Gün Streak</span>
            </div>
            ${milestone ? `
                <div class="streak-milestone">
                    Sonraki rozet için ${milestone.remaining} gün kaldı!
                </div>
            ` : `
                <div class="streak-milestone legendary">
                    🏆 Efsane seviyeye ulaştın!
                </div>
            `}
        `;
    }

    renderQuickTemplates(containerId = 'quickTemplates') {
        const container = document.getElementById(containerId);
        if (!container) return;

        const templates = this.getQuickTemplates();

        if (templates.length === 0) {
            container.innerHTML = '<p class="templates-empty">Hızlı şablonlar için harcama ekleyin</p>';
            return;
        }

        container.innerHTML = templates.map(t => {
            const category = this.getCategory(t.category);
            return `
                <button class="quick-template" onclick="expenseManager.useTemplate('${t.description}', '${t.category}', ${t.amount})">
                    ${category.icon} ${t.description} ${this.formatCurrency(t.amount)}
                </button>
            `;
        }).join('');
    }

    renderCategoryButtons(containerId = 'categoryButtons') {
        const container = document.getElementById(containerId);
        if (!container) return;

        const expenseCategories = this.categories.filter(c => c.id !== 'income');

        container.innerHTML = expenseCategories.map(cat => `
            <button class="category-btn" data-category="${cat.id}" style="--cat-color: ${cat.color}">
                <span class="cat-icon">${cat.icon}</span>
                <span class="cat-name">${cat.name}</span>
            </button>
        `).join('');

        // Event listeners
        container.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                container.querySelectorAll('.category-btn').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                const input = document.getElementById('expenseCategory');
                if (input) input.value = btn.dataset.category;
            });
        });
    }

    // ==================== MODAL HANDLERS ====================

    showAddModal(type = 'expense') {
        const modal = document.getElementById('expenseModal');
        if (!modal) return;

        // Reset form
        const form = document.getElementById('expenseForm');
        if (form) form.reset();

        // Set type
        document.getElementById('expenseType').value = type;

        // Set today's date
        document.getElementById('expenseDate').value = new Date().toISOString().split('T')[0];

        // Render category buttons
        this.renderCategoryButtons('expenseCategoryButtons');

        // Render quick templates
        this.renderQuickTemplates('expenseQuickTemplates');

        // Update modal title
        const title = modal.querySelector('.modal-title');
        if (title) {
            title.textContent = type === 'income' ? 'Gelir Ekle' : 'Harcama Ekle';
        }

        modal.classList.add('show');
    }

    hideModal() {
        const modal = document.getElementById('expenseModal');
        if (modal) modal.classList.remove('show');
    }

    showBudgetModal() {
        const modal = document.getElementById('budgetModal');
        if (!modal) return;

        // Fill current budget
        document.getElementById('monthlyBudget').value = this.budget.monthly || '';

        // Fill category budgets
        this.categories.filter(c => c.id !== 'income').forEach(cat => {
            const input = document.getElementById(`budget_${cat.id}`);
            if (input) {
                input.value = this.budget.categories[cat.id] || '';
            }
        });

        modal.classList.add('show');
    }

    hideBudgetModal() {
        const modal = document.getElementById('budgetModal');
        if (modal) modal.classList.remove('show');
    }

    // ==================== FORM HANDLERS ====================

    handleFormSubmit(event) {
        event.preventDefault();

        const form = event.target;
        const formData = new FormData(form);

        const transaction = {
            type: formData.get('type') || 'expense',
            amount: formData.get('amount'),
            category: formData.get('category') || 'other',
            description: formData.get('description') || '',
            date: formData.get('date') || new Date().toISOString().split('T')[0],
            account: formData.get('account') || 'acc_cash'
        };

        this.addTransaction(transaction);
        this.hideModal();
        this.renderAll();

        // Başarı mesajı
        this.showNotification(
            transaction.type === 'income' ? '💰 Gelir Eklendi' : '💸 Harcama Eklendi',
            `${this.formatCurrency(transaction.amount)} kaydedildi`,
            'success'
        );
    }

    handleBudgetSubmit(event) {
        event.preventDefault();

        const monthly = document.getElementById('monthlyBudget').value;
        const categories = {};

        this.categories.filter(c => c.id !== 'income').forEach(cat => {
            const input = document.getElementById(`budget_${cat.id}`);
            if (input && input.value) {
                categories[cat.id] = parseFloat(input.value);
            }
        });

        this.setBudget(monthly, categories);
        this.hideBudgetModal();
        this.renderAll();

        this.showNotification('✅ Bütçe Güncellendi', 'Aylık bütçeniz kaydedildi', 'success');
    }

    handleDeleteClick(id) {
        if (confirm('Bu işlemi silmek istediğinize emin misiniz?')) {
            this.deleteTransaction(id);
            this.renderAll();
        }
    }

    useTemplate(description, category, amount) {
        document.getElementById('expenseDescription').value = description;
        document.getElementById('expenseAmount').value = amount;

        // Select category button
        const btn = document.querySelector(`.category-btn[data-category="${category}"]`);
        if (btn) btn.click();
    }

    // ==================== RENDER ALL ====================

    renderAll() {
        this.renderExpensesList();
        this.renderBudgetProgress();
        this.renderStreakWidget();
    }

    // ==================== INITIALIZATION ====================

    init() {
        console.log('[ExpenseManager] Başlatılıyor...');

        // İlk render
        this.renderAll();

        // Hatırlatıcıları planla
        this.scheduleReminders();

        // Form event listener
        const form = document.getElementById('expenseForm');
        if (form) {
            form.addEventListener('submit', (e) => this.handleFormSubmit(e));
        }

        const budgetForm = document.getElementById('budgetForm');
        if (budgetForm) {
            budgetForm.addEventListener('submit', (e) => this.handleBudgetSubmit(e));
        }

        console.log('[ExpenseManager] Hazır');
    }
}

// ==================== GLOBAL INSTANCE ====================
let expenseManager;

document.addEventListener('DOMContentLoaded', () => {
    // DataManager hazır olduktan sonra başlat
    setTimeout(() => {
        expenseManager = new ExpenseManager();
        window.expenseManager = expenseManager;

        // Eğer expenses sayfasındaysak init et
        if (document.getElementById('expensesList')) {
            expenseManager.init();
        }
    }, 100);
});
