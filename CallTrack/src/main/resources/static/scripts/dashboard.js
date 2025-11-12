/**
 * Скрипт для страницы личного кабинета
 * Загружает данные пользователя, номера телефонов, последние операции и статистику
 */

class DashboardManager {
    constructor() {
        this.clientId = localStorage.getItem('clientId');
        this.clientData = this.getClientDataFromStorage();
        this.userData = null;
        this.phoneNumbers = [];
        this.selectedPhone = null;

        this.phoneModal = document.getElementById('phoneDetailsModal');
        this.phoneDetailsClose = document.getElementById('phoneDetailsClose');
        this.phoneDetailsTitle = document.getElementById('phoneDetailsTitle');
        this.phoneDetailsSubtitle = document.getElementById('phoneDetailsSubtitle');
        this.phoneDetailsBalance = document.getElementById('phoneDetailsBalance');
        this.phoneDetailsStatus = document.getElementById('phoneDetailsStatus');
        this.phoneDetailsNumber = document.getElementById('phoneDetailsNumber');
        this.phoneDetailsFooter = document.getElementById('phoneDetailsFooter');
        this.phoneTopUpForm = document.getElementById('phoneTopUpForm');
        this.phoneTopUpSubmit = document.getElementById('phoneTopUpSubmit');
        this.topUpAmountInput = document.getElementById('topUpAmount');
        this.topUpMethodSelect = document.getElementById('topUpMethod');

        this.init();
    }

    init() {
        if (!this.clientId) {
            window.location.href = 'login.html';
            return;
        }

        this.setupEventListeners();
        this.bindModalEvents();
        this.loadDashboardData();
    }

    getClientDataFromStorage() {
        const clientDataStr = localStorage.getItem('clientData');
        if (clientDataStr) {
            try {
                return JSON.parse(clientDataStr);
            } catch (e) {
                return null;
            }
        }
        return null;
    }

    setupEventListeners() {
        // Кнопка выхода
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.handleLogout());
        }

        // Кнопка перевода средств
        const transferBtn = document.getElementById('transferBtn');
        if (transferBtn) {
            transferBtn.addEventListener('click', () => {
                alert('Функция перевода средств будет реализована позже');
            });
        }

        // Кнопка привязки счетов
        const linkAccountsBtn = document.getElementById('linkAccountsBtn');
        if (linkAccountsBtn) {
            linkAccountsBtn.addEventListener('click', () => {
                alert('Функция привязки счетов будет реализована позже');
            });
        }

        // Кнопка управления тарифами
        const manageTariffsBtn = document.getElementById('manageTariffsBtn');
        if (manageTariffsBtn) {
            manageTariffsBtn.addEventListener('click', () => {
                window.location.href = 'tariffs.html';
            });
        }

        // Изменение периода статистики
        const statisticsPeriod = document.getElementById('statisticsPeriod');
        if (statisticsPeriod) {
            statisticsPeriod.addEventListener('change', () => {
                this.loadStatistics();
            });
        }
    }

    bindModalEvents() {
        if (!this.phoneModal) {
            return;
        }

        if (this.phoneDetailsClose) {
            this.phoneDetailsClose.addEventListener('click', () => this.closePhoneDetails());
        }

        this.phoneModal.addEventListener('click', (event) => {
            if (event.target === this.phoneModal) {
                this.closePhoneDetails();
            }
        });

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && !this.phoneModal.classList.contains('hidden')) {
                this.closePhoneDetails();
            }
        });

        if (this.phoneTopUpForm) {
            this.phoneTopUpForm.addEventListener('submit', (event) => this.handlePhoneTopUp(event));
        }
    }

    async loadDashboardData() {
        try {
            // Загружаем данные параллельно
            await Promise.all([
                this.loadUserData(),
                this.loadPhoneNumbers(),
                this.loadRecentTransactions(),
                this.loadStatistics()
            ]);
        } catch (error) {
            console.error('Ошибка загрузки данных dashboard:', error);
            this.showError('Не удалось загрузить данные. Пожалуйста, обновите страницу.');
        }
    }

    async loadUserData() {
        try {
            if (this.clientData) {
                this.userData = {
                    id: this.clientData.clientId,
                    clientId: this.clientData.clientId,
                    fullName: this.clientData.fullName,
                    email: this.clientData.email,
                    balance: this.clientData.balance || 0,
                    status: this.clientData.status
                };
                this.renderUserData();
                return;
            }

            let response = await fetch(`/api/v1/clients/${this.clientId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.status === 401 || response.status === 404) {
                this.handleLogout();
                return;
            }

            if (!response.ok) {
                if (this.clientData) {
                    this.userData = {
                        id: this.clientData.clientId,
                        clientId: this.clientData.clientId,
                        fullName: this.clientData.fullName,
                        email: this.clientData.email,
                        balance: this.clientData.balance || 0,
                        status: this.clientData.status
                    };
                    this.renderUserData();
                    return;
                }
                throw new Error('Не удалось загрузить данные пользователя');
            }

            const clientData = await response.json();
            this.userData = {
                id: clientData.clientId,
                clientId: clientData.clientId,
                fullName: clientData.fullName,
                email: clientData.email,
                balance: clientData.balance || 0,
                status: clientData.status
            };
            
            localStorage.setItem('clientData', JSON.stringify(this.userData));
            this.renderUserData();
        } catch (error) {
            console.error('Ошибка загрузки данных пользователя:', error);
            if (this.clientData) {
                this.userData = {
                    id: this.clientData.clientId,
                    clientId: this.clientData.clientId,
                    fullName: this.clientData.fullName,
                    email: this.clientData.email,
                    balance: this.clientData.balance || 0,
                    status: this.clientData.status
                };
                this.renderUserData();
            }
        }
    }

    renderUserData() {
        if (!this.userData) return;

        const accountNumber = document.getElementById('accountNumber');
        if (accountNumber) {
            if (this.userData.email) {
                accountNumber.textContent = this.userData.email;
            } else if (this.userData.clientId) {
                accountNumber.textContent = `ID: ${this.userData.clientId}`;
            } else {
                accountNumber.textContent = 'Личный счет';
            }
        }

        const availableFunds = document.getElementById('availableFunds');
        if (availableFunds) {
            const balance = this.userData.balance || 0;
            availableFunds.textContent = this.formatCurrency(balance);
        }

        if (this.userData.fullName) {
            document.title = `${this.userData.fullName} - Личный кабинет - CallTrack`;
        }
    }

    async loadPhoneNumbers() {
        try {
            const clientId = this.clientId || this.userData?.clientId;
            if (!clientId) {
                this.renderPhoneNumbers([]);
                return;
            }

            const response = await fetch(`/api/v1/phoneNumber/${clientId}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });

            if (!response.ok) {
                this.renderPhoneNumbers([]);
                return;
            }

            const phones = await response.json();
            this.renderPhoneNumbers(Array.isArray(phones) ? phones : [phones]);
        } catch (error) {
            console.error('Ошибка загрузки номеров телефонов:', error);
            this.renderPhoneNumbers([]);
        }
    }

    renderPhoneNumbers(phones) {
        const grid = document.getElementById('phoneNumbersGrid');
        if (!grid) return;

        const phoneArray = Array.isArray(phones) ? phones : [];
        this.phoneNumbers = phoneArray;

        const phoneCards = phoneArray.map((phone, index) => {
            const phoneNumber = phone.number || phone.phoneNumber || phone.phone || 'N/A';
            return `
            <div class="phone-card" data-phone-id="${phone.id}" data-phone-index="${index}">
                <div class="phone-card-header">
                    <div>
                        <div class="phone-number">${phone.numberName || phoneNumber}</div>
                        <div class="phone-masked">${this.maskPhoneNumber(phoneNumber)}</div>
                    </div>
                    <div class="phone-menu">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="12" cy="5" r="2" fill="currentColor"/>
                            <circle cx="12" cy="12" r="2" fill="currentColor"/>
                            <circle cx="12" cy="19" r="2" fill="currentColor"/>
                        </svg>
                    </div>
                </div>
                <div class="phone-balance">${this.formatCurrency(phone.balance || 0)}</div>
                <div class="phone-status ${(phone.status || 'active') === 'active' ? 'active' : 'inactive'}">
                    ${(phone.status || 'active') === 'active' ? 'Активен' : 'Неактивен'}
                </div>
            </div>
        `;
        }).join('');

        // Добавляем карточку "Добавить новый телефон"
        const addPhoneCard = `
            <div class="phone-card phone-card-add" id="addPhoneCard">
                <div class="phone-card-header">
                    <div>
                        <div class="phone-number">Добавить новый</div>
                        <div class="phone-masked">Нажмите, чтобы зарегистрировать</div>
                    </div>
                    <div class="phone-add-icon">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                            <path d="M12 8v8M8 12h8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                        </svg>
                    </div>
                </div>
                <div class="phone-balance" style="color: var(--brand);">+</div>
                <div class="phone-status active">
                    Новый номер
                </div>
            </div>
        `;

        if (phoneArray.length === 0) {
            grid.innerHTML = `
                <div class="empty-state">
                    <h3>Номера телефонов не найдены</h3>
                    <p>Добавьте номер телефона, чтобы начать работу</p>
                </div>
                ${addPhoneCard}
            `;
        } else {
            grid.innerHTML = phoneCards + addPhoneCard;
        }

        // Добавляем обработчик для карточки добавления
        const addPhoneCardElement = document.getElementById('addPhoneCard');
        if (addPhoneCardElement) {
            addPhoneCardElement.addEventListener('click', () => {
                window.location.href = 'register-phone.html';
            });
        }

        this.bindPhoneCardEvents(grid);
    }

    bindPhoneCardEvents(grid) {
        const cards = grid.querySelectorAll('.phone-card[data-phone-index]');
        cards.forEach(card => {
            if (card.id === 'addPhoneCard') {
                return;
            }

            card.addEventListener('click', () => {
                const index = Number(card.getAttribute('data-phone-index'));
                const phone = this.phoneNumbers[index];
                if (phone) {
                    this.openPhoneDetails(phone);
                }
            });

            const menu = card.querySelector('.phone-menu');
            if (menu) {
                menu.addEventListener('click', (event) => {
                    event.stopPropagation();
                    const index = Number(card.getAttribute('data-phone-index'));
                    const phone = this.phoneNumbers[index];
                    if (phone) {
                        this.openPhoneDetails(phone);
                    }
                });
            }
        });
    }

    openPhoneDetails(phone) {
        if (!this.phoneModal) {
            return;
        }

        this.selectedPhone = phone;
        this.populatePhoneDetails(phone);
        this.setModalFooter('');

        this.phoneModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        if (this.topUpAmountInput) {
            this.topUpAmountInput.focus({ preventScroll: true });
        }
    }

    closePhoneDetails() {
        if (!this.phoneModal) {
            return;
        }

        this.phoneModal.classList.add('hidden');
        document.body.style.overflow = '';
        if (this.phoneTopUpForm) {
            this.phoneTopUpForm.reset();
        }
        this.selectedPhone = null;
        this.setModalFooter('');
    }

    populatePhoneDetails(phone) {
        const phoneNumber = phone.number || phone.phoneNumber || phone.phone || 'N/A';
        const displayName = phone.numberName || phoneNumber;

        if (this.phoneDetailsTitle) {
            this.phoneDetailsTitle.textContent = displayName;
        }

        if (this.phoneDetailsSubtitle) {
            const subtitlePieces = [];
            if (phoneNumber) {
                subtitlePieces.push(this.maskPhoneNumber(phoneNumber));
            }
            if (phone.id) {
                subtitlePieces.push(`ID: ${phone.id}`);
            }
            this.phoneDetailsSubtitle.textContent = subtitlePieces.join(' · ');
        }

        if (this.phoneDetailsBalance) {
            this.phoneDetailsBalance.textContent = this.formatCurrency(phone.balance || 0);
        }

        if (this.phoneDetailsStatus) {
            const status = (phone.status || 'active').toLowerCase();
            this.phoneDetailsStatus.textContent = status === 'active' ? 'Активен' : 'Неактивен';
            this.phoneDetailsStatus.classList.toggle('inactive', status !== 'active');
        }

        if (this.phoneDetailsNumber) {
            this.phoneDetailsNumber.textContent = phoneNumber;
        }
    }

    async handlePhoneTopUp(event) {
        event.preventDefault();
        if (!this.selectedPhone || !this.phoneTopUpForm) {
            return;
        }

        const amountValue = parseFloat(this.topUpAmountInput?.value || '0');
        const methodValue = this.topUpMethodSelect?.value || '';

        if (!Number.isFinite(amountValue) || amountValue <= 0) {
            this.setModalFooter('Введите корректную сумму для пополнения', 'error');
            return;
        }

        if (!methodValue) {
            this.setModalFooter('Выберите способ пополнения', 'error');
            return;
        }

        this.setTopUpLoading(true);
        this.setModalFooter('Выполняем пополнение...', 'info');

        const phoneId = this.selectedPhone.id || this.selectedPhone.phoneId || this.selectedPhone.phoneNumberId;
        const clientId = this.clientId || this.userData?.clientId || this.selectedPhone.clientId;

        const payload = {
            amount: amountValue,
            method: methodValue,
            phoneNumber: this.selectedPhone.number || this.selectedPhone.phoneNumber || this.selectedPhone.phone,
            phoneId,
            clientId
        };

        try {
            let response;

            if (phoneId) {
                response = await fetch(`/api/v1/phoneNumber/${phoneId}/payments`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
            }

            if (!response || !response.ok) {
                response = await fetch('/api/v1/payments', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        phoneNumberId: phoneId,
                        clientId,
                        amount: amountValue,
                        paymentType: methodValue,
                        description: 'Пополнение через личный кабинет'
                    })
                });
            }

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Не удалось выполнить пополнение');
            }

            this.setModalFooter('Баланс успешно пополнен', 'success');
            this.phoneTopUpForm.reset();

            const updatedBalance = (this.selectedPhone.balance || 0) + amountValue;
            this.selectedPhone.balance = updatedBalance;
            this.populatePhoneDetails(this.selectedPhone);
            this.renderPhoneNumbers(this.phoneNumbers);

            await this.loadRecentTransactions();
            await this.loadStatistics();
        } catch (error) {
            console.error('Ошибка пополнения баланса:', error);
            this.setModalFooter(error.message || 'Не удалось выполнить пополнение', 'error');
        } finally {
            this.setTopUpLoading(false);
        }
    }

    setTopUpLoading(isLoading) {
        if (!this.phoneTopUpSubmit) {
            return;
        }

        if (!this.phoneTopUpSubmit.dataset.originalText) {
            this.phoneTopUpSubmit.dataset.originalText = this.phoneTopUpSubmit.textContent.trim();
        }

        this.phoneTopUpSubmit.disabled = isLoading;
        this.phoneTopUpSubmit.textContent = isLoading ? 'Пополнение...' : this.phoneTopUpSubmit.dataset.originalText;
    }

    setModalFooter(message, type = '') {
        if (!this.phoneDetailsFooter) {
            return;
        }

        this.phoneDetailsFooter.textContent = message;
        this.phoneDetailsFooter.classList.remove('success', 'error');

        if (type === 'success') {
            this.phoneDetailsFooter.classList.add('success');
        } else if (type === 'error') {
            this.phoneDetailsFooter.classList.add('error');
        }
    }

    async loadRecentTransactions() {
        try {
            const clientId = this.clientId || this.userData?.clientId;
            if (!clientId) {
                this.renderTransactions([]);
                return;
            }

            let response = await fetch(`/api/v1/clients/${clientId}/payments/recent`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                response = await fetch(`/api/v1/payments/recent?clientId=${clientId}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    this.renderTransactions([]);
                    return;
                }
            }

            const transactions = await response.json();
            const formattedTransactions = Array.isArray(transactions) 
                ? transactions.map(t => this.formatTransaction(t))
                : [this.formatTransaction(transactions)];
            
            this.renderTransactions(formattedTransactions);
        } catch (error) {
            console.error('Ошибка загрузки транзакций:', error);
            this.renderTransactions([]);
        }
    }

    formatTransaction(transaction) {
        // Преобразуем транзакцию в унифицированный формат
        return {
            id: transaction.id,
            date: this.formatTransactionDate(transaction.date || transaction.paymentDate || transaction.createdAt),
            description: transaction.description || transaction.paymentType || transaction.type || 'Операция',
            type: transaction.type || transaction.paymentType || 'Операция',
            amount: transaction.amount || transaction.sum || 0,
            category: transaction.category || this.detectCategory(transaction)
        };
    }

    formatTransactionDate(dateString) {
        if (!dateString) return 'N/A';
        
        try {
            const date = new Date(dateString);
            const now = new Date();
            const diffTime = Math.abs(now - date);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays === 0) return 'Сегодня';
            if (diffDays === 1) return 'Вчера';
            if (diffDays <= 7) return `${diffDays} дня назад`;
            
            return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' });
        } catch (e) {
            return dateString;
        }
    }

    detectCategory(transaction) {
        // Определяем категорию на основе типа транзакции
        const type = (transaction.type || transaction.paymentType || '').toLowerCase();
        if (type.includes('пополнение') || type.includes('payment')) return 'Пополнение';
        if (type.includes('абонент') || type.includes('subscription')) return 'Абонплата';
        if (type.includes('звонок') || type.includes('call')) return 'Звонки';
        if (type.includes('sms')) return 'SMS';
        if (type.includes('интернет') || type.includes('internet')) return 'Интернет';
        return 'Другое';
    }

    renderTransactions(transactions) {
        const list = document.getElementById('transactionsList');
        if (!list) return;

        if (!transactions || transactions.length === 0) {
            list.innerHTML = '<div class="empty-state"><h3>Операций не найдено</h3><p>Здесь будут отображаться ваши последние операции</p></div>';
            return;
        }

        // Ограничиваем до 5 последних транзакций
        const recentTransactions = transactions.slice(0, 5);

        const categoryColors = {
            'Пополнение': '#10b981',
            'Абонплата': '#3b82f6',
            'Звонки': '#f59e0b',
            'SMS': '#8b5cf6',
            'Интернет': '#ec4899'
        };

        list.innerHTML = recentTransactions.map(transaction => {
            const category = transaction.category || 'Другое';
            const color = categoryColors[category] || '#6b7280';
            const amount = transaction.amount || 0;
            const isPositive = amount > 0;

            return `
                <div class="transaction-item">
                    <div class="transaction-date">${transaction.date || 'N/A'}</div>
                    <div class="transaction-description">${transaction.description || transaction.type || 'Операция'}</div>
                    <div class="transaction-type">${transaction.type || 'Операция'}</div>
                    <div class="transaction-category">
                        <span class="category-dot" style="background-color: ${color}"></span>
                        <span>${category}</span>
                    </div>
                    <div class="transaction-amount ${isPositive ? 'positive' : 'negative'}">
                        ${isPositive ? '+' : ''}${this.formatCurrency(amount)}
                    </div>
                    <div class="transaction-expand">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </div>
                </div>
            `;
        }).join('');
    }

    async loadStatistics() {
        try {
            const period = document.getElementById('statisticsPeriod')?.value || 'month';
            const clientId = this.clientId || this.userData?.clientId;
            if (!clientId) {
                this.renderStatistics({
                    daily: 0,
                    weekly: 0,
                    monthly: 0,
                    categories: []
                });
                return;
            }

            let response = await fetch(`/api/v1/clients/${clientId}/statistics?period=${period}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                response = await fetch(`/api/v1/reports/statistics?clientId=${clientId}&period=${period}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    this.renderStatistics({
                        daily: 0,
                        weekly: 0,
                        monthly: 0,
                        categories: []
                    });
                    return;
                }
            }

            const statistics = await response.json();
            const formattedStats = this.formatStatistics(statistics, period);
            this.renderStatistics(formattedStats);
        } catch (error) {
            console.error('Ошибка загрузки статистики:', error);
            this.renderStatistics({
                daily: 0,
                weekly: 0,
                monthly: 0,
                categories: []
            });
        }
    }

    formatStatistics(statistics, period) {
        // Преобразуем статистику в унифицированный формат
        return {
            daily: statistics.daily || statistics.day || statistics.today || 0,
            weekly: statistics.weekly || statistics.week || statistics.thisWeek || 0,
            monthly: statistics.monthly || statistics.month || statistics.thisMonth || 0,
            categories: statistics.categories || statistics.expenses || statistics.byCategory || []
        };
    }

    renderStatistics(statistics) {
        // Обновляем краткую статистику
        const statDaily = document.getElementById('statDaily');
        const statWeekly = document.getElementById('statWeekly');
        const statMonthly = document.getElementById('statMonthly');

        if (statDaily) statDaily.textContent = this.formatCurrency(statistics.daily || 0);
        if (statWeekly) statWeekly.textContent = this.formatCurrency(statistics.weekly || 0);
        if (statMonthly) statMonthly.textContent = this.formatCurrency(statistics.monthly || 0);

        // Отображаем легенду графика
        const chartLegend = document.getElementById('chartLegend');
        if (chartLegend && statistics.categories) {
            if (statistics.categories.length === 0) {
                chartLegend.innerHTML = '<p>Нет данных для отображения</p>';
                return;
            }

            chartLegend.innerHTML = statistics.categories.map(category => `
                <div class="legend-item">
                    <span class="legend-dot" style="background-color: ${category.color || '#6b7280'}"></span>
                    <span>${category.name || 'Категория'}</span>
                    <span style="margin-left: auto; font-weight: 600;">${this.formatCurrency(category.amount || 0)}</span>
                </div>
            `).join('');
        }
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    }

    maskPhoneNumber(phone) {
        if (!phone) return '';
        // Маскируем номер телефона, оставляя только первые и последние 4 цифры
        const cleaned = phone.replace(/\D/g, '');
        if (cleaned.length <= 8) return phone;
        return `${cleaned.slice(0, 4)} **** ${cleaned.slice(-4)}`;
    }

    showError(message) {
        // Можно добавить отображение ошибки на странице
        console.error(message);
        alert(message);
    }

    handleLogout() {
        localStorage.removeItem('clientId');
        localStorage.removeItem('clientData');
        localStorage.removeItem('clientEmail');
        localStorage.removeItem('authToken');
        window.location.href = 'login.html';
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    new DashboardManager();
});

// Экспорт для возможного использования в других модулях
window.DashboardManager = DashboardManager;
