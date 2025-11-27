// ==================== GELİŞMİŞ AKILLI ÖĞRENME ASİSTANI v2.0 ====================
// Tüm özellikleri içeren gelişmiş versiyon

// API Configuration
const API_URL = 'http://localhost:3000'; // Değiştirilecek: Production'da cloud URL

// Not: Type tanımları kaldırıldı - artık resources-db.js kullanılıyor
    profile: UserProfile;
    programData: ProgramData;
    resourceDB: ResourceDatabase;
    programManager: StudyProgramManager;  // Program Yöneticisi

    chatMessages;
    userInput;
    sendBtn;
    detailPanel;
    panelContent;

    readonly DAYS = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
    readonly POMODORO_WORK = 50;
    readonly POMODORO_BREAK = 10;

    // AI Conversation History (son 8 mesaj)
    conversationHistory = [];
    useAI = true; // AI kullanılsın mı?

    constructor() {
        this.resourceDB = new ResourceDatabase();
        this.programManager = new StudyProgramManager();  // Program Yöneticisi başlat

        this.profile = {
            learningProfile: 'other',
            skillLevel: 'beginner',
            dailyHours: 0,
            programDuration: 0,
            subjects: [],
            includeBreaks: true
        };
        this.programData = {
            ...this.profile,
            schedule: [],
            tasks: [],
            createdAt: new Date()
        };

        this.chatMessages = document.getElementById('chatMessages')!;
        this.userInput = document.getElementById('userInput') as HTMLTextAreaElement;
        this.sendBtn = document.getElementById('sendBtn') as HTMLButtonElement;
        this.detailPanel = document.getElementById('detailPanel')!;
        this.panelContent = document.getElementById('panelContent')!;

        this.initializeUI();
        this.showWelcomeMessage();
    }

    initializeUI() {
        this.sendBtn.addEventListener('click', () => this.handleUserMessage());

        this.userInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.handleUserMessage();
            }
        });

        document.querySelectorAll('.quick-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = (e.target as HTMLElement).getAttribute('data-action');
                this.handleQuickAction(action!);
            });
        });

        document.getElementById('newChatBtn')?.addEventListener('click', () => this.resetChat());
        document.getElementById('programPanelBtn')?.addEventListener('click', () => this.showProgramPanel());
        document.getElementById('loadProgramBtn')?.addEventListener('click', () => this.loadProgram());
        document.getElementById('saveProgramBtn')?.addEventListener('click', () => this.saveProgram());
        document.getElementById('exportProgramBtn')?.addEventListener('click', () => this.exportProgram());
        document.getElementById('closeDetailBtn')?.addEventListener('click', () => {
            this.detailPanel.style.display = 'none';
        });
    }

    async handleUserMessage() {
        const message = this.userInput.value.trim();
        if (!message) return;

        this.addUserMessage(message);
        this.userInput.value = '';
        this.userInput.style.height = 'auto';

        await this.showTypingIndicator();

        const intent = this.detectIntent(message);
        await this.processIntent(intent, message);
    }

    detectIntent(message): AIIntent {
        const lower = message.toLowerCase();

        // Program oluşturma sadece açıkça istenirse
        if (lower.includes('başla') || lower.includes('program oluştur') ||
            lower.includes('program yap')) {
            return AIIntent.CREATE_PROGRAM;
        }

        if (lower.includes('düzenle') || lower.includes('değiştir') ||
            lower.includes('çalışma saatimi')) {
            return AIIntent.EDIT_PROGRAM;
        }

        if (lower.includes('görev ekle') || lower.includes('ödev')) {
            return AIIntent.ADD_TASK;
        }

        if (lower.includes('tamamladım') || lower.includes('bitirdim')) {
            return AIIntent.COMPLETE_TASK;
        }

        if (lower.includes('kaynak') || lower.includes('video') ||
            lower.includes('öner') || lower.includes('nereden')) {
            return AIIntent.GET_RESOURCES;
        }

        if (lower.includes('ilerleme') || lower.includes('durum') ||
            lower.includes('istatistik')) {
            return AIIntent.CHECK_PROGRESS;
        }

        if (lower.includes('yardım') || lower.includes('help') ||
            lower.includes('neler yapabilirsin')) {
            return AIIntent.HELP;
        }

        // Eğer program oluşturma aşamalarındaysak
        if (this.state === ConversationState.ASKING_PROFILE ||
            this.state === ConversationState.ASKING_LEVEL ||
            this.state === ConversationState.ASKING_HOURS ||
            this.state === ConversationState.ASKING_DURATION ||
            this.state === ConversationState.ASKING_SUBJECTS ||
            this.state === ConversationState.ASKING_BREAKS) {
            return AIIntent.CREATE_PROGRAM;
        }

        return AIIntent.GENERAL_CHAT;
    }

    async processIntent(intent: AIIntent, message) {
        switch (intent) {
            case AIIntent.CREATE_PROGRAM:
                this.handleProgramCreation(message);
                break;
            case AIIntent.EDIT_PROGRAM:
                this.handleProgramEdit(message);
                break;
            case AIIntent.ADD_TASK:
                this.handleTaskAdd(message);
                break;
            case AIIntent.COMPLETE_TASK:
                this.handleTaskComplete();
                break;
            case AIIntent.GET_RESOURCES:
                this.handleResourceRequest(message);
                break;
            case AIIntent.CHECK_PROGRESS:
                this.handleProgressCheck();
                break;
            case AIIntent.HELP:
                this.showHelp();
                break;
            case AIIntent.GENERAL_CHAT:
                await this.handleGeneralChat(message);
                break;
        }
    }

    // ==================== PROGRAM OLUŞTURMA ====================

    handleProgramCreation(message) {
        switch (this.state) {
            case ConversationState.INITIAL:
                this.startProgramCreation();
                break;
            case ConversationState.ASKING_PROFILE:
                this.handleProfileInput(message);
                break;
            case ConversationState.ASKING_LEVEL:
                this.handleLevelInput(message);
                break;
            case ConversationState.ASKING_HOURS:
                this.handleHoursInput(message);
                break;
            case ConversationState.ASKING_DURATION:
                this.handleDurationInput(message);
                break;
            case ConversationState.ASKING_SUBJECTS:
                this.handleSubjectsInput(message);
                break;
            case ConversationState.ASKING_BREAKS:
                this.handleBreaksInput(message);
                break;
        }
    }

    startProgramCreation() {
        this.state = ConversationState.ASKING_PROFILE;
        this.addAIMessage(`Harika! Sana özel bir program hazırlayacağım 🚀

**Hangi alanda çalışmak istiyorsun?**

1️⃣ **TYT-AYT Hazırlık**
2️⃣ **Yazılım Öğrenme**
3️⃣ **Dil Öğrenme**
4️⃣ **Üniversite Dersleri**
5️⃣ **Diğer**

Sadece numarasını veya adını yaz!`);
    }

    handleProfileInput(message) {
        const lower = message.toLowerCase();

        if (lower.includes('1') || lower.includes('tyt') || lower.includes('ayt')) {
            this.profile.learningProfile = 'tyt-ayt';
        } else if (lower.includes('2') || lower.includes('yazılım') || lower.includes('software')) {
            this.profile.learningProfile = 'software';
        } else if (lower.includes('3') || lower.includes('dil') || lower.includes('ingilizce')) {
            this.profile.learningProfile = 'language';
        } else if (lower.includes('4') || lower.includes('üniversite')) {
            this.profile.learningProfile = 'university';
        } else {
            this.profile.learningProfile = 'other';
        }

        this.state = ConversationState.ASKING_LEVEL;
        this.addAIMessage(`Süper! **${this.getProfileName()}** üzerinde çalışacağız 🎯

**Şu anki seviyeni nasıl tanımlarsın?**

📚 **Başlangıç** - Yeni başlıyorum
📘 **Orta** - Biraz bilgim var
📕 **İleri** - Deneyimliyim

Seviyeni yaz!`);
    }

    handleLevelInput(message) {
        const lower = message.toLowerCase();

        if (lower.includes('başlangıç') || lower.includes('yeni')) {
            this.profile.skillLevel = 'beginner';
        } else if (lower.includes('ileri') || lower.includes('deneyimli')) {
            this.profile.skillLevel = 'advanced';
        } else {
            this.profile.skillLevel = 'intermediate';
        }

        this.state = ConversationState.ASKING_HOURS;
        this.addAIMessage(`Anladım! Senin için **${this.getLevelName()}** seviyesinde kaynaklar önereceğim 💪

**Günde kaç saat çalışmak istiyorsun?**

1-16 arası bir sayı. Mesela "6 saat" veya "6"`);
    }

    handleHoursInput(message) {
        const hours = this.extractNumber(message);

        if (!hours || hours < 1 || hours > 16) {
            this.addAIMessage('1-16 arası bir sayı söyle. Örneğin "6" veya "8 saat"');
            return;
        }

        this.profile.dailyHours = hours;
        this.state = ConversationState.ASKING_DURATION;
        this.addAIMessage(`Harika! Günde **${hours} saat** çalışacaksın 📖

**Kaç haftalık program hazırlayalım?**

1-12 arası bir sayı.`);
    }

    handleDurationInput(message) {
        const weeks = this.extractNumber(message);

        if (!weeks || weeks < 1 || weeks > 12) {
            this.addAIMessage('1-12 arası bir hafta sayısı ver. Mesela "2" veya "4 hafta"');
            return;
        }

        this.profile.programDuration = weeks;
        this.state = ConversationState.ASKING_SUBJECTS;
        this.addAIMessage(`Mükemmel! **${weeks} haftalık** program oluşturacağım 📅

**Hangi konular üzerinde çalışacaksın?**

Konuları virgülle ayırarak yaz:
• **"Matematik, Fizik, Kimya"**
• **"Matematik - Yüksek, Fizik - Orta"** (öncelikli)

Bittiğinde **"tamam"** yaz.`);
    }

    handleSubjectsInput(message) {
        const lower = message.toLowerCase();

        if (lower === 'tamam' || lower === 'devam' || lower === 'bitti') {
            if (this.profile.subjects.length === 0) {
                this.addAIMessage('Henüz konu eklemedin. En az bir konu ekle!');
                return;
            }
            this.state = ConversationState.ASKING_BREAKS;
            this.askAboutBreaks();
            return;
        }

        const parsed = this.parseSubjects(message);

        if (parsed.length === 0) {
            this.addAIMessage('Anlayamadım. Şöyle dene: "Matematik, Fizik" veya "Matematik - Yüksek, Fizik - Orta"');
            return;
        }

        this.profile.subjects.push(...parsed);

        const list = this.profile.subjects.map(s => `• **${s.name}** (${s.priority})`).join('\n');

        this.addAIMessage(`Tamamdır! Şunları ekledim:

${list}

Başka konu var mı? Yoksa **"tamam"** yaz.`);
    }

    parseSubjects(message): Subject[] {
        const subjects: Subject[] = [];
        const parts = message.split(',').map(p => p.trim());

        for (const part of parts) {
            if (!part) continue;

            let name = '';
            let priority: PriorityLevel = 'Orta';

            if (part.includes('-')) {
                const [namePart, priorityPart] = part.split('-').map(p => p.trim());
                name = namePart;

                const pLower = priorityPart.toLowerCase();
                if (pLower.includes('yüksek') || pLower.includes('yuksek')) {
                    priority = 'Yüksek';
                } else if (pLower.includes('düşük') || pLower.includes('dusuk')) {
                    priority = 'Düşük';
                }
            } else {
                name = part;
            }

            if (name) {
                subjects.push({
                    name,
                    priority,
                    level: this.profile.skillLevel
                });
            }
        }

        return subjects;
    }

    askAboutBreaks() {
        this.addAIMessage(`**Mola Zamanları** ⏸️

Pomodoro tekniğini kullanayım mı? (50dk çalış + 10dk mola)

**"evet"** veya **"hayır"** yaz.`);
    }

    handleBreaksInput(message) {
        const lower = message.toLowerCase();

        if (lower.includes('evet') || lower.includes('istiyorum') || lower.includes('olsun')) {
            this.profile.includeBreaks = true;
        } else if (lower.includes('hayır') || lower.includes('hayir') || lower.includes('istemiyorum')) {
            this.profile.includeBreaks = false;
        } else {
            this.addAIMessage('"evet" veya "hayır" yazman yeterli 😊');
            return;
        }

        this.showSummaryAndGenerate();
    }

    showSummaryAndGenerate() {
        const list = this.profile.subjects.map(s => `• **${s.name}** (${s.priority})`).join('\n');
        const breaks = this.profile.includeBreaks ? '✅ Evet' : '❌ Hayır';

        this.addAIMessage(`Tamamdır! İşte özet:

**📊 Program Detayları**

🎯 **Profil:** ${this.getProfileName()}
📊 **Seviye:** ${this.getLevelName()}
🕐 **Günlük:** ${this.profile.dailyHours} saat
📅 **Süre:** ${this.profile.programDuration} hafta
📚 **Konular:**
${list}
⏸️ **Molalar:** ${breaks}

Programını hazırlıyorum... ⚡`);

        setTimeout(() => this.generateSchedule(), 1500);
    }

    generateSchedule() {
        this.programData = {
            ...this.profile,
            schedule: [],
            tasks: [],
            createdAt: new Date()
        };

        for (let week = 1; week <= this.profile.programDuration; week++) {
            const weekSchedule: WeekSchedule = {
                weekNumber: week,
                days: []
            };

            for (const day of this.DAYS) {
                weekSchedule.days.push({
                    day,
                    slots: this.generateDaySchedule()
                });
            }

            this.programData.schedule.push(weekSchedule);
        }

        this.state = ConversationState.ACTIVE;
        this.showScheduleMessage();
        this.displayPanel();

        document.getElementById('saveProgramBtn')!.style.display = 'flex';
        document.getElementById('exportProgramBtn')!.style.display = 'flex';
    }

    generateDaySchedule(): TimeSlot[] {
        const slots: TimeSlot[] = [];
        let currentTime = 9 * 60;
        let remaining = this.profile.dailyHours * 60;
        let subjectIndex = 0;

        const sorted = [...this.profile.subjects].sort((a, b) => {
            const order = { 'Yüksek': 1, 'Orta': 2, 'Düşük': 3 };
            return order[a.priority] - order[b.priority];
        });

        while (remaining > 0) {
            const subject = sorted[subjectIndex % sorted.length];

            if (this.profile.includeBreaks) {
                const work = Math.min(this.POMODORO_WORK, remaining);
                slots.push({
                    startTime: this.minutesToTime(currentTime),
                    endTime: this.minutesToTime(currentTime + work),
                    subject: subject.name,
                    isBreak: false,
                    priority: subject.priority
                });

                currentTime += work;
                remaining -= work;

                if (remaining > 0) {
                    slots.push({
                        startTime: this.minutesToTime(currentTime),
                        endTime: this.minutesToTime(currentTime + this.POMODORO_BREAK),
                        subject: 'Mola',
                        isBreak: true
                    });
                    currentTime += this.POMODORO_BREAK;
                }
            } else {
                const block = Math.min(60, remaining);
                slots.push({
                    startTime: this.minutesToTime(currentTime),
                    endTime: this.minutesToTime(currentTime + block),
                    subject: subject.name,
                    isBreak: false,
                    priority: subject.priority
                });

                currentTime += block;
                remaining -= block;
            }

            subjectIndex++;
        }

        return slots;
    }

    minutesToTime(minutes) {
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    }

    // ==================== KAYNAK ÖNERİSİ ====================

    handleResourceRequest(message) {
        const lower = message.toLowerCase();

        let requestedSubject = '';
        this.profile.subjects.forEach(subject => {
            if (lower.includes(subject.name.toLowerCase())) {
                requestedSubject = subject.name;
            }
        });

        if (requestedSubject) {
            const subject = this.profile.subjects.find(s => s.name === requestedSubject)!;
            const resources = this.resourceDB.getResources(requestedSubject, subject.level);

            if (resources.length > 0) {
                this.showResources(requestedSubject, resources);
            } else {
                this.addAIMessage(`${requestedSubject} için kaynak bulamadım. Genel kaynaklara panelden ulaş!`);
            }
        } else {
            const allResources = this.resourceDB.searchResources(lower);
            if (allResources.length > 0) {
                this.showResources('Bulunan Kaynaklar', allResources.slice(0, 5));
            } else {
                this.addAIMessage('Kaynak bulamadım. Daha spesifik bir konu söyle!');
            }
        }
    }

    showResources(title, resources: Resource[]) {
        let msg = `**📚 ${title} için Kaynaklar**\n\n`;

        resources.forEach((r, i) => {
            const emoji = r.type === 'youtube' ? '🎥' : r.type === 'course' ? '🎓' : '📄';
            const level = r.level === 'beginner' ? '📚 Başlangıç' :
                         r.level === 'intermediate' ? '📘 Orta' : '📕 İleri';

            msg += `${i + 1}. ${emoji} **${r.title}**\n`;
            msg += `   ${level} • ${r.description}\n`;
            if (r.url) msg += `   🔗 ${r.url}\n`;
            msg += `\n`;
        });

        msg += `Daha fazlası için yan paneldeki **"Kaynaklar"** sekmesine bak!`;
        this.addAIMessage(msg);
    }

    // ==================== GÖREV YÖNETİMİ ====================

    handleTaskAdd(message) {
        const text = message
            .replace(/görev ekle/gi, '')
            .replace(/ödev ekle/gi, '')
            .trim();

        if (!text) {
            this.addAIMessage('Hangi görevi eklememi istersin? Örnek: "Matematik soru çöz"');
            return;
        }

        let subject = 'Genel';
        this.profile.subjects.forEach(s => {
            if (text.toLowerCase().includes(s.name.toLowerCase())) {
                subject = s.name;
            }
        });

        const task: Task = {
            id: Date.now().toString(),
            title: text,
            subject,
            completed: false,
            priority: 'Orta'
        };

        this.programData.tasks.push(task);
        this.addAIMessage(`✅ Görevi ekledim: **"${text}"** (${subject})`);
        this.updatePanel();
    }

    handleTaskComplete() {
        const incomplete = this.programData.tasks.find(t => !t.completed);

        if (!incomplete) {
            this.addAIMessage('Tamamlanacak görev yok!');
            return;
        }

        incomplete.completed = true;
        this.addAIMessage(`🎉 Harika! **"${incomplete.title}"** tamamlandı!\n\nBöyle devam! 💪`);
        this.updatePanel();
    }

    // ==================== İLERLEME TAKİBİ ====================

    handleProgressCheck() {
        const completed = this.programData.tasks.filter(t => t.completed).length;
        const total = this.programData.tasks.length;
        const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

        this.addAIMessage(`📊 **İlerleme Raporu**

✅ **Görevler:** ${completed}/${total} (${rate}%)
📅 **Program:** ${this.profile.programDuration} hafta
⏰ **Toplam Saat:** ${this.profile.dailyHours * 7 * this.profile.programDuration}h

${rate >= 70 ? '🎉 Harika!' : rate >= 40 ? '💪 Güzel!' : '🔥 Daha çok çalış!'}

Detaylı istatistikler için paneldeki **"İstatistikler"** sekmesine bak!`);
    }

    // ==================== PROGRAM DÜZENLEME ====================

    handleProgramEdit(message) {
        const lower = message.toLowerCase();

        if (lower.includes('saat')) {
            const hours = this.extractNumber(message);
            if (hours && hours >= 1 && hours <= 16) {
                this.profile.dailyHours = hours;
                this.programData.dailyHours = hours;
                this.regenerateSchedule();
                this.addAIMessage(`✅ Günlük çalışma saatini **${hours} saat** yaptım!`);
            } else {
                this.addAIMessage('1-16 arası bir saat söyle.');
            }
        } else {
            this.addAIMessage('Programda neyi değiştirmek istersin? Örnek: "Çalışma saatimi 8 yap"');
        }
    }

    regenerateSchedule() {
        this.programData.schedule = [];

        for (let week = 1; week <= this.profile.programDuration; week++) {
            const weekSchedule: WeekSchedule = {
                weekNumber: week,
                days: []
            };

            for (const day of this.DAYS) {
                weekSchedule.days.push({
                    day,
                    slots: this.generateDaySchedule()
                });
            }

            this.programData.schedule.push(weekSchedule);
        }

        this.updatePanel();
    }

    // ==================== YAN PANEL SİSTEMİ ====================

    displayPanel() {
        this.renderTabs();
        this.showDashboard();
        this.detailPanel.style.display = 'flex';
    }

    renderTabs() {
        const tabs = `
            <div class="panel-tabs" style="display: flex; gap: 8px; margin-bottom: 20px; flex-wrap: wrap;">
                <button class="tab-btn active" data-tab="dashboard" style="padding: 8px 14px; background: var(--accent-gradient); border: none; border-radius: 8px; color: white; font-size: 12px; cursor: pointer;">📊 Dashboard</button>
                <button class="tab-btn" data-tab="schedule" style="padding: 8px 14px; background: var(--bg-tertiary); border: 1px solid var(--border); border-radius: 8px; color: var(--text-secondary); font-size: 12px; cursor: pointer;">📅 Program</button>
                <button class="tab-btn" data-tab="resources" style="padding: 8px 14px; background: var(--bg-tertiary); border: 1px solid var(--border); border-radius: 8px; color: var(--text-secondary); font-size: 12px; cursor: pointer;">📚 Kaynaklar</button>
                <button class="tab-btn" data-tab="tasks" style="padding: 8px 14px; background: var(--bg-tertiary); border: 1px solid var(--border); border-radius: 8px; color: var(--text-secondary); font-size: 12px; cursor: pointer;">✅ Görevler</button>
                <button class="tab-btn" data-tab="stats" style="padding: 8px 14px; background: var(--bg-tertiary); border: 1px solid var(--border); border-radius: 8px; color: var(--text-secondary); font-size: 12px; cursor: pointer;">📈 İstatistikler</button>
            </div>
            <div id="tabContent"></div>
        `;

        this.panelContent.innerHTML = tabs;

        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.tab-btn').forEach(b => {
                    (b as HTMLElement).style.background = 'var(--bg-tertiary)';
                    (b as HTMLElement).style.color = 'var(--text-secondary)';
                    (b as HTMLElement).style.border = '1px solid var(--border)';
                    b.classList.remove('active');
                });

                (e.target as HTMLElement).style.background = 'var(--accent-gradient)';
                (e.target as HTMLElement).style.color = 'white';
                (e.target as HTMLElement).style.border = 'none';
                (e.target as HTMLElement).classList.add('active');

                const tab = (e.target as HTMLElement).getAttribute('data-tab')!;
                this.switchTab(tab);
            });
        });
    }

    switchTab(tab) {
        switch (tab) {
            case 'dashboard': this.showDashboard(); break;
            case 'schedule': this.showSchedule(); break;
            case 'resources': this.showResourcesTab(); break;
            case 'tasks': this.showTasksTab(); break;
            case 'stats': this.showStatsTab(); break;
        }
    }

    showDashboard() {
        const content = document.getElementById('tabContent')!;
        const completed = this.programData.tasks.filter(t => t.completed).length;
        const total = this.programData.tasks.length;

        content.innerHTML = `
            <div class="summary-cards" style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px;">
                <div class="stat-card">
                    <div class="stat-icon">🎯</div>
                    <div class="stat-label">Profil</div>
                    <div class="stat-value" style="font-size: 14px;">${this.getProfileName()}</div>
                    <div class="stat-subtext">${this.getLevelName()}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">📚</div>
                    <div class="stat-label">Toplam Saat</div>
                    <div class="stat-value">${this.profile.dailyHours * 7 * this.profile.programDuration}h</div>
                    <div class="stat-subtext">${this.profile.programDuration} hafta</div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">📝</div>
                    <div class="stat-label">Konu</div>
                    <div class="stat-value">${this.profile.subjects.length}</div>
                    <div class="stat-subtext">Toplam</div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">✅</div>
                    <div class="stat-label">Görev</div>
                    <div class="stat-value">${completed}/${total}</div>
                    <div class="stat-subtext">Tamamlandı</div>
                </div>
            </div>

            <div style="background: var(--bg-tertiary); padding: 16px; border-radius: 12px; border: 1px solid var(--border); margin-bottom: 16px;">
                <h3 style="font-size: 16px; margin-bottom: 12px;">📚 Konularım</h3>
                ${this.profile.subjects.map(s => `
                    <div style="display: flex; justify-content: space-between; padding: 10px; margin: 6px 0; background: var(--bg-secondary); border-radius: 8px;">
                        <span style="color: var(--text-primary);">${s.name}</span>
                        <span style="padding: 4px 10px; border-radius: 12px; font-size: 11px; background: ${s.priority === 'Yüksek' ? 'var(--accent-primary)' : s.priority === 'Orta' ? 'var(--accent-secondary)' : 'var(--text-muted)'}; color: white;">${s.priority}</span>
                    </div>
                `).join('')}
            </div>

            <div style="background: var(--bg-tertiary); padding: 16px; border-radius: 12px; border: 1px solid var(--border);">
                <h3 style="font-size: 16px; margin-bottom: 12px;">⚡ Hızlı Bilgiler</h3>
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--border);">
                    <span style="color: var(--text-secondary);">Günlük:</span>
                    <strong>${this.profile.dailyHours} saat</strong>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--border);">
                    <span style="color: var(--text-secondary);">Pomodoro:</span>
                    <strong>${this.profile.includeBreaks ? '✅ Aktif' : '❌ Pasif'}</strong>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 8px 0;">
                    <span style="color: var(--text-secondary);">Başlangıç:</span>
                    <strong>09:00</strong>
                </div>
            </div>
        `;
    }

    showSchedule() {
        const content = document.getElementById('tabContent')!;
        let html = '';

        this.programData.schedule.forEach(week => {
            html += `<div class="week-section">
                <h3>📅 Hafta ${week.weekNumber}</h3>`;

            week.days.forEach(day => {
                html += `<div class="day-schedule">
                    <h4>${day.day}</h4>`;

                day.slots.forEach(slot => {
                    const cls = slot.isBreak ? 'time-slot break' : 'time-slot';
                    const badge = slot.priority
                        ? `<span class="priority">${slot.priority}</span>`
                        : '<span class="priority">⏸️ Mola</span>';

                    html += `
                        <div class="${cls}">
                            <span class="time">${slot.startTime} - ${slot.endTime}</span>
                            <span class="subject">${slot.subject}</span>
                            ${badge}
                        </div>
                    `;
                });

                html += '</div>';
            });

            html += '</div>';
        });

        content.innerHTML = html;
    }

    showResourcesTab() {
        const content = document.getElementById('tabContent')!;
        let html = '<div style="padding: 8px;"><h3 style="margin-bottom: 16px;">📚 Önerilen Kaynaklar</h3>';

        this.profile.subjects.forEach(subject => {
            const resources = this.resourceDB.getResources(subject.name, subject.level);

            if (resources.length > 0) {
                html += `<div style="margin-bottom: 24px;">
                    <h4 style="font-size: 16px; margin-bottom: 12px; color: var(--accent-secondary);">${subject.name}</h4>`;

                resources.forEach(r => {
                    const emoji = r.type === 'youtube' ? '🎥' : '🎓';
                    const level = r.level === 'beginner' ? '📚' : r.level === 'intermediate' ? '📘' : '📕';

                    html += `
                        <div style="background: var(--bg-tertiary); border: 1px solid var(--border); border-radius: 10px; padding: 14px; margin-bottom: 10px;">
                            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
                                <span style="font-size: 20px;">${emoji}</span>
                                <span style="font-weight: 600; flex: 1;">${r.title}</span>
                                <span style="font-size: 11px; padding: 4px 8px; border-radius: 8px; background: var(--bg-secondary);">${level}</span>
                            </div>
                            <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 8px;">${r.description}</p>
                            ${r.url ? `<a href="${r.url}" target="_blank" style="font-size: 12px; color: var(--accent-primary);">🔗 Kaynağa Git →</a>` : ''}
                        </div>
                    `;
                });

                html += '</div>';
            }
        });

        html += '</div>';
        content.innerHTML = html;
    }

    showTasksTab() {
        const content = document.getElementById('tabContent')!;
        let html = '<div style="padding: 8px;"><h3 style="margin-bottom: 16px;">✅ Görevlerim</h3>';

        if (this.programData.tasks.length === 0) {
            html += '<p style="text-align: center; color: var(--text-muted); padding: 40px;">Henüz görev yok!</p>';
        } else {
            const incomplete = this.programData.tasks.filter(t => !t.completed);
            const completed = this.programData.tasks.filter(t => t.completed);

            if (incomplete.length > 0) {
                html += '<h4 style="font-size: 14px; margin-bottom: 10px;">📝 Bekleyen</h4>';
                incomplete.forEach(t => {
                    html += `
                        <div style="display: flex; align-items: center; gap: 12px; background: var(--bg-tertiary); border: 1px solid var(--border); border-radius: 10px; padding: 14px; margin-bottom: 8px;">
                            <div style="width: 24px; height: 24px; border: 2px solid var(--accent-primary); border-radius: 6px; display: flex; align-items: center; justify-content: center;">☐</div>
                            <div style="flex: 1;">
                                <div style="font-weight: 500;">${t.title}</div>
                                <div style="font-size: 11px; color: var(--text-secondary);">${t.subject} • ${t.priority}</div>
                            </div>
                        </div>
                    `;
                });
            }

            if (completed.length > 0) {
                html += '<h4 style="font-size: 14px; margin: 20px 0 10px;">✅ Tamamlanan</h4>';
                completed.forEach(t => {
                    html += `
                        <div style="display: flex; align-items: center; gap: 12px; background: var(--bg-tertiary); border: 1px solid var(--border); border-radius: 10px; padding: 14px; margin-bottom: 8px; opacity: 0.7;">
                            <div style="width: 24px; height: 24px; background: var(--success); border-radius: 6px; display: flex; align-items: center; justify-content: center; color: white;">✓</div>
                            <div style="flex: 1;">
                                <div style="text-decoration: line-through; color: var(--text-secondary);">${t.title}</div>
                                <div style="font-size: 11px; color: var(--text-muted);">${t.subject}</div>
                            </div>
                        </div>
                    `;
                });
            }
        }

        html += '</div>';
        content.innerHTML = html;
    }

    showStatsTab() {
        const content = document.getElementById('tabContent')!;
        const completed = this.programData.tasks.filter(t => t.completed).length;
        const total = this.programData.tasks.length;
        const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

        content.innerHTML = `
            <div style="padding: 8px;">
                <h3 style="margin-bottom: 16px;">📈 İstatistikler</h3>

                <div style="background: var(--bg-tertiary); padding: 16px; border-radius: 12px; margin-bottom: 16px;">
                    <h4 style="font-size: 14px; margin-bottom: 12px;">Görev Tamamlama</h4>
                    <div style="width: 100%; height: 12px; background: var(--bg-secondary); border-radius: 6px; overflow: hidden; margin-bottom: 8px;">
                        <div style="width: ${rate}%; height: 100%; background: var(--accent-gradient);"></div>
                    </div>
                    <div style="text-align: center; font-size: 13px; color: var(--text-secondary);">${completed}/${total} (${rate}%)</div>
                </div>

                <div style="background: var(--bg-tertiary); padding: 16px; border-radius: 12px; margin-bottom: 16px;">
                    <h4 style="font-size: 14px; margin-bottom: 12px;">Konu Dağılımı</h4>
                    ${this.profile.subjects.map(s => `
                        <div style="display: flex; justify-content: space-between; padding: 8px; margin: 6px 0; background: var(--bg-secondary); border-radius: 8px;">
                            <span style="font-size: 13px;">${s.name}</span>
                            <span style="padding: 4px 10px; border-radius: 12px; font-size: 11px; background: ${s.priority === 'Yüksek' ? 'var(--accent-primary)' : s.priority === 'Orta' ? 'var(--accent-secondary)' : 'var(--text-muted)'}; color: white;">${s.priority}</span>
                        </div>
                    `).join('')}
                </div>

                <div style="background: var(--bg-tertiary); padding: 16px; border-radius: 12px;">
                    <h4 style="font-size: 14px; margin-bottom: 12px;">Planlanan Çalışma</h4>
                    <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--border);">
                        <span style="font-size: 13px;">Günlük:</span>
                        <strong style="font-size: 13px;">${this.profile.dailyHours} saat</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--border);">
                        <span style="font-size: 13px;">Haftalık:</span>
                        <strong style="font-size: 13px;">${this.profile.dailyHours * 7} saat</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 8px 0;">
                        <span style="font-size: 13px;">Toplam:</span>
                        <strong style="font-size: 13px;">${this.profile.dailyHours * 7 * this.profile.programDuration} saat</strong>
                    </div>
                </div>
            </div>
        `;
    }

    updatePanel() {
        const activeBtn = document.querySelector('.tab-btn.active');
        if (activeBtn) {
            const tab = activeBtn.getAttribute('data-tab')!;
            this.switchTab(tab);
        }
    }

    // ==================== UI HELPER ====================

    showScheduleMessage() {
        this.addAIMessage(`✨ **Programın Hazır!**

Sağ taraftaki paneli açtım. Şimdi şunları yapabilirsin:

💬 **Benimle Konuş:**
• "Matematik için kaynak öner"
• "Görev ekle: Fizik soru çöz"
• "İlerlemeyi göster"
• "Çalışma saatimi 8 yap"

📊 **Panel'i Kullan:**
5 farklı sekmede tüm detaylar var!

**"neler yapabilirsin"** yazarak tüm yeteneklerimi görebilirsin! 🚀`);
    }

    showWelcomeMessage() {
        this.addAIMessage(`Selam! Ben senin akıllı öğrenme asistanınım 🤖

Seninle beraber:
✨ Kişiselleştirilmiş program oluşturacağım
📚 Seviyene uygun kaynaklar önereceğim
✅ Görevlerini takip edeceğim
📊 İlerlemenizi analiz edeceğim

**"başlayalım"** diye yazarak başlayabiliriz!

Ya da **"neler yapabilirsin"** yazarak yeteneklerimi keşfedebilirsin 😊`);
    }

    handleQuickAction(action) {
        switch (action) {
            case 'start':
                this.addUserMessage('Başlayalım');
                this.startProgramCreation();
                break;
            case 'help':
                this.addUserMessage('Neler yapabilirsin?');
                this.showHelp();
                break;
            case 'example':
                this.addUserMessage('Örnek göster');
                this.showExample();
                break;
        }
    }

    showHelp() {
        this.addAIMessage(`🤖 **Neler Yapabilirim?**

**📚 Program Yönetimi**
• "Yeni program oluştur" - Sıfırdan program
• "Çalışma saatimi 8 yap" - Program düzenle

**✅ Görev Yönetimi**
• "Görev ekle: Matematik soru çöz" - Görev ekle
• "Bitirdim" - Görev tamamla

**📖 Kaynak Önerileri**
• "Matematik için kaynak öner" - Konu bazlı
• "Video öner" - YouTube kanalları

**📊 İlerleme Takibi**
• "İlerlemeyi göster" - Detaylı rapor
• "Durum ne?" - Hızlı bakış

Yan panelden de tüm özelliklere ulaşabilirsin! 👉`);
    }

    showExample() {
        this.addAIMessage(`💡 **Örnek Kullanım**

**Senaryo:** TYT-AYT'ye hazırlanan öğrenci

📋 **Ayarlar:**
• Profil: TYT-AYT Hazırlık
• Seviye: Orta
• Günlük: 6 saat
• Süre: 2 hafta
• Konular: Matematik (Yüksek), Fizik (Orta)
• Pomodoro: Aktif

✨ **Sonuç:**
• 3D Eyüp, Limit Yayınları kaynakları
• Otomatik günlük program
• İlerleme takibi

Hadi senin programını oluşturalım! **"başlayalım"** yaz! 🎯`);
    }

    async handleGeneralChat(message) {
        // AI kullanılıyorsa API'ye sor
        if (this.useAI) {
            await this.askAI(message);
        } else {
            // Fallback: Basit yanıtlar
            const lower = message.toLowerCase();
            if (lower.includes('merhaba') || lower.includes('selam')) {
                this.addAIMessage('Merhaba! 👋 Sana nasıl yardımcı olabilirim?');
            } else if (lower.includes('teşekkür') || lower.includes('sağol')) {
                this.addAIMessage('Rica ederim! 😊');
            } else {
                this.addAIMessage('Anlamadım. **"neler yapabilirsin"** yazarak yeteneklerimi görebilirsin!');
            }
        }
    }

    // ==================== AI ENTEGRASYONU ====================

    /**
     * AI'ya soru sor ve yanıt al
     */
    async askAI(userMessage) {
        try {
            // Kullanıcı mesajını history'ye ekle
            this.conversationHistory.push({
                role: 'user',
                content: userMessage
            });

            // Son 8 mesajı tut (4 user + 4 assistant)
            if (this.conversationHistory.length > 8) {
                this.conversationHistory = this.conversationHistory.slice(-8);
            }

            // Kullanıcı profilini hazırla
            const userProfile = {
                name: 'Kullanıcı',
                skillLevel: this.profile.skillLevel,
                goals: this.profile.subjects.map(s => s.name).join(', '),
                learningStyle: this.profile.learningProfile
            };

            // API'ye istek gönder
            const response = await fetch(`${API_URL}/api/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: userMessage,
                    conversationHistory: this.conversationHistory,
                    userProfile: userProfile
                })
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }

            const data = await response.json();
            const aiResponse = data.response;

            // AI yanıtını history'ye ekle
            this.conversationHistory.push({
                role: 'assistant',
                content: aiResponse
            });

            // Yanıtı göster
            this.addAIMessage(aiResponse);

        } catch (error) {
            console.error('AI Error:', error);

            // Hata durumunda fallback
            this.useAI = false; // AI'yı geçici devre dışı bırak
            this.addAIMessage(
                'Üzgünüm, şu anda AI bağlantısında sorun var. ' +
                'Temel özelliklerle devam edebilirsiniz. 😊\n\n' +
                '**"neler yapabilirsin"** yazarak yeteneklerimi görebilirsiniz!'
            );
        }
    }

    addUserMessage(text) {
        const div = document.createElement('div');
        div.className = 'message user';
        div.innerHTML = `
            <div class="message-avatar">👤</div>
            <div class="message-content">${this.escapeHtml(text)}</div>
        `;
        this.chatMessages.appendChild(div);
        this.scrollToBottom();
    }

    addAIMessage(text) {
        const div = document.createElement('div');
        div.className = 'message ai';
        div.innerHTML = `
            <div class="message-avatar">🤖</div>
            <div class="message-content">${this.formatMarkdown(text)}</div>
        `;
        this.chatMessages.appendChild(div);
        this.scrollToBottom();
    }

    async showTypingIndicator() {
        const div = document.createElement('div');
        div.className = 'message ai';
        div.id = 'typing-indicator';
        div.innerHTML = `
            <div class="message-avatar">🤖</div>
            <div class="message-content">
                <div class="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;
        this.chatMessages.appendChild(div);
        this.scrollToBottom();

        await new Promise(resolve => setTimeout(resolve, 800));
        div.remove();
    }

    scrollToBottom() {
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }

    extractNumber(text) | null {
        const match = text.match(/\d+/);
        return match ? parseInt(match[0]) : null;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    formatMarkdown(text) {
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\n/g, '<br>');
    }

    getProfileName() {
        const names: Record<LearningProfile, string> = {
            'tyt-ayt': 'TYT-AYT',
            'software': 'Yazılım',
            'language': 'Dil',
            'university': 'Üniversite',
            'other': 'Genel'
        };
        return names[this.profile.learningProfile];
    }

    getLevelName() {
        const names: Record<SkillLevel, string> = {
            'beginner': 'Başlangıç',
            'intermediate': 'Orta',
            'advanced': 'İleri'
        };
        return names[this.profile.skillLevel];
    }

    // ==================== KAYDET / YÜKLE ====================

    saveProgram() {
        if (this.programData.schedule.length === 0) {
            alert('Henüz program yok!');
            return;
        }

        localStorage.setItem('advancedStudyProgram', JSON.stringify(this.programData));
        this.addAIMessage('✅ Programını kaydettim!');
    }

    loadProgram() {
        const saved = localStorage.getItem('advancedStudyProgram');

        if (!saved) {
            this.addAIMessage('❌ Kayıtlı program bulamadım.');
            return;
        }

        try {
            this.programData = JSON.parse(saved);
            this.profile = {
                learningProfile: this.programData.learningProfile,
                skillLevel: this.programData.skillLevel,
                dailyHours: this.programData.dailyHours,
                programDuration: this.programData.programDuration,
                subjects: this.programData.subjects,
                includeBreaks: this.programData.includeBreaks
            };

            this.state = ConversationState.ACTIVE;
            this.addAIMessage('✅ Programını yükledim!');
            this.displayPanel();

            document.getElementById('saveProgramBtn')!.style.display = 'flex';
            document.getElementById('exportProgramBtn')!.style.display = 'flex';
        } catch (error) {
            this.addAIMessage('❌ Yüklerken hata oldu.');
        }
    }

    exportProgram() {
        if (this.programData.schedule.length === 0) {
            alert('Henüz program yok!');
            return;
        }

        const dataStr = JSON.stringify(this.programData, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `akilli-calisma-programi-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);

        this.addAIMessage('✅ İndirdim!');
    }

    // ==================== PROGRAM PANELİ UI ====================

    showProgramPanel() {
        this.detailPanel.style.display = 'block';
        this.renderProgramPanel();
    }

    showCreateProgramForm() {
        // Wizard'ı aç
        const wizardContainer = document.getElementById('wizardContainer');
        if (wizardContainer) {
            wizardContainer.style.display = 'block';
            wizard.start();
        }
    }

    renderProgramPanel() {
        const programs = this.programManager.getPrograms();

        let html = `
            <div class="program-panel">
                <div class="panel-header">
                    <h3>📚 Çalışma Programları</h3>
                    <button class="btn-primary" onclick="app.showCreateProgramForm()">
                        ➕ Yeni Program
                    </button>
                </div>

                <div class="programs-list">
        `;

        if (programs.length === 0) {
            html += `
                <div class="empty-state">
                    <p>Henüz program oluşturmadınız.</p>
                    <p>AI'a "Matematik için program hazırla" diyerek başlayın!</p>
                </div>
            `;
        } else {
            programs.forEach(program => {
                const stats = this.programManager.getStats(program.id);
                html += `
                    <div class="program-card">
                        <div class="program-header">
                            <h4>${program.name}</h4>
                            <button class="btn-danger-small" onclick="app.deleteProgram('${program.id}')">🗑️</button>
                        </div>
                        <div class="program-info">
                            <span>📖 ${program.subject}</span>
                            <span>📅 ${program.daysPerWeek} gün/hafta</span>
                            <span>⏰ ${program.hoursPerDay} saat/gün</span>
                        </div>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${stats.percentage}%"></div>
                        </div>
                        <p class="progress-text">${stats.completed}/${stats.total} konu tamamlandı (%${stats.percentage})</p>
                        <button class="btn-secondary" onclick="app.showProgramDetails('${program.id}')">
                            Detayları Gör →
                        </button>
                    </div>
                `;
            });
        }

        html += `
                </div>
            </div>
        `;

        this.panelContent.innerHTML = html;
    }

    showProgramDetails(programId) {
        this.programManager.setCurrentProgram(programId);
        const program = this.programManager.getCurrentProgram();
        if (!program) return;

        let html = `
            <div class="program-details">
                <button class="btn-back" onclick="app.showProgramPanel()">← Geri</button>

                <div class="program-detail-header">
                    <h3>${program.name}</h3>
                    <span class="program-subject">${program.subject}</span>
                </div>

                <div class="program-schedule">
                    <h4>📊 Program Bilgileri</h4>
                    <div class="schedule-grid">
                        <div class="schedule-item">
                            <span class="label">Haftada:</span>
                            <span class="value">${program.daysPerWeek} gün</span>
                        </div>
                        <div class="schedule-item">
                            <span class="label">Günlük:</span>
                            <span class="value">${program.hoursPerDay} saat</span>
                        </div>
                        <div class="schedule-item">
                            <span class="label">Konu:</span>
                            <span class="value">${program.schedule.topic} saat</span>
                        </div>
                        <div class="schedule-item">
                            <span class="label">Soru:</span>
                            <span class="value">${program.schedule.practice} saat</span>
                        </div>
                    </div>
                </div>

                <div class="program-resources">
                    <h4>📺 Kaynaklar</h4>
                    <div class="resources-list">
                        ${program.resources.youtube.map(yt => `<span class="resource-tag">🎥 ${yt}</span>`).join('')}
                        ${program.resources.books.map(book => `<span class="resource-tag">📚 ${book}</span>`).join('')}
                    </div>
                </div>

                <div class="program-topics">
                    <div class="topics-header">
                        <h4>📝 Konular</h4>
                        <button class="btn-primary-small" onclick="app.showAddTopicForm('${program.id}')">
                            ➕ Konu Ekle
                        </button>
                    </div>
                    <div class="topics-list">
        `;

        if (program.topics.length === 0) {
            html += `<p class="empty-topics">Henüz konu eklenmemiş.</p>`;
        } else {
            program.topics.forEach(topic => {
                html += `
                    <div class="topic-item ${topic.completed ? 'completed' : ''}">
                        <input
                            type="checkbox"
                            ${topic.completed ? 'checked' : ''}
                            onchange="app.toggleTopic('${program.id}', '${topic.id}')"
                        />
                        <span class="topic-name">${topic.name}</span>
                        <span class="topic-duration">${topic.duration} dk</span>
                    </div>
                `;
            });
        }

        html += `
                    </div>
                </div>
            </div>
        `;

        this.panelContent.innerHTML = html;
    }

    showAddTopicForm(programId) {
        const topicName = prompt('Konu adı:');
        const durationStr = prompt('Süre (dakika):');

        if (topicName && durationStr) {
            const duration = parseInt(durationStr);
            if (!isNaN(duration)) {
                this.programManager.addTopic(programId, topicName, duration);
                this.showProgramDetails(programId);
            }
        }
    }

    toggleTopic(programId, topicId) {
        this.programManager.toggleTopicComplete(programId, topicId);
        this.showProgramDetails(programId);
    }

    deleteProgram(programId) {
        if (confirm('Bu programı silmek istediğinize emin misiniz?')) {
            this.programManager.deleteProgram(programId);
            this.renderProgramPanel();
        }
    }

    resetChat() {
        this.profile = {
            learningProfile: 'other',
            skillLevel: 'beginner',
            dailyHours: 0,
            programDuration: 0,
            subjects: [],
            includeBreaks: true
        };
        this.programData = {
            ...this.profile,
            schedule: [],
            tasks: [],
            createdAt: new Date()
        };
        this.state = ConversationState.INITIAL;
        this.chatMessages.innerHTML = '';
        this.detailPanel.style.display = 'none';

        document.getElementById('saveProgramBtn')!.style.display = 'none';
        document.getElementById('exportProgramBtn')!.style.display = 'none';

        this.showWelcomeMessage();
    }
}

// ==================== PROGRAM YÖNETİCİSİ ====================

class StudyProgramManager {
    programs = [];
    currentProgram = null;
    storageKey = 'studyPrograms';

    constructor() {
        this.loadPrograms();
    }

    createProgram(name, subject, daysPerWeek, hoursPerDay,
                  resources,
                  schedule) {
        const program: StudyProgram = {
            id: this.generateId(),
            name,
            subject,
            daysPerWeek,
            hoursPerDay,
            resources,
            schedule,
            topics: [],
            createdAt: new Date(),
            lastModified: new Date()
        };

        this.programs.push(program);
        this.currentProgram = program;
        this.savePrograms();
        return program;
    }

    addTopic(programId, topicName, duration) {
        const program = this.programs.find(p => p.id === programId);
        if (program) {
            const topic: ProgramTopic = {
                id: this.generateId(),
                name: topicName,
                duration,
                completed: false,
                notes: ''
            };
            program.topics.push(topic);
            program.lastModified = new Date();
            this.savePrograms();
        }
    }

    toggleTopicComplete(programId, topicId) {
        const program = this.programs.find(p => p.id === programId);
        if (program) {
            const topic = program.topics.find(t => t.id === topicId);
            if (topic) {
                topic.completed = !topic.completed;
                program.lastModified = new Date();
                this.savePrograms();
            }
        }
    }

    deleteProgram(programId) {
        this.programs = this.programs.filter(p => p.id !== programId);
        if (this.currentProgram?.id === programId) {
            this.currentProgram = null;
        }
        this.savePrograms();
    }

    getPrograms() {
        return this.programs;
    }

    getCurrentProgram() {
        return this.currentProgram;
    }

    setCurrentProgram(programId) {
        this.currentProgram = this.programs.find(p => p.id === programId) || null;
    }

    savePrograms() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.programs));
    }

    loadPrograms() {
        const stored = localStorage.getItem(this.storageKey);
        if (stored) {
            this.programs = JSON.parse(stored);
        }
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    getStats(programId) {
        const program = this.programs.find(p => p.id === programId);
        if (!program) return {total: 0, completed: 0, percentage: 0};

        const total = program.topics.length;
        const completed = program.topics.filter(t => t.completed).length;
        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

        return {total, completed, percentage};
    }
}

// ==================== BAŞLAT ====================

let app;  // Global değişken onclick için

document.addEventListener('DOMContentLoaded', () => {
    app = new AdvancedStudyAI();
});
