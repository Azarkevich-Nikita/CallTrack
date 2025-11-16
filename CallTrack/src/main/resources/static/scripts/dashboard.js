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
        const normalizedPhones = phoneArray.map((phone, index) => {
            if (phone && phone.__uid && phone.__backendId !== undefined) {
                return phone;
            }
            const backendId = phone.numberId ?? phone.id ?? phone.phoneId ?? phone.phoneNumberId ?? phone.phoneIdNumber ?? null;
            const fallbackSeed = phone.number || phone.phoneNumber || phone.phone || `phone-${index}`;
            const uid = String(backendId ?? `${fallbackSeed}-${index}`);
            return {
                ...phone,
                __backendId: backendId,
                __uid: uid
            };
        });

        this.phoneNumbers = normalizedPhones;

        const phoneCards = normalizedPhones.map((phone, index) => {
            const phoneNumber = phone.number || phone.phoneNumber || phone.phone || 'N/A';
            const phoneUid = phone.__uid;
            const backendIdAttr = phone.__backendId != null ? String(phone.__backendId) : '';
            return `
            <div class="phone-card" data-phone-uid="${phoneUid}" data-phone-index="${index}">
                <div class="phone-card-header">
                    <div class="phone-card-info">
                        <div class="phone-number">${phone.numberName || phoneNumber}</div>
                        <div class="phone-masked">+${this.maskPhoneNumber(phoneNumber)}</div>
                    </div>
                    <div class="phone-menu-container" data-phone-uid="${phoneUid}">
                        <button type="button" class="phone-menu" data-action="toggle-dropdown" data-phone-uid="${phoneUid}" aria-haspopup="true" aria-expanded="false" aria-label="Дополнительные действия">
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="12" cy="5" r="2" fill="currentColor"/>
                                <circle cx="12" cy="12" r="2" fill="currentColor"/>
                                <circle cx="12" cy="19" r="2" fill="currentColor"/>
                            </svg>
                        </button>
                        <div class="phone-dropdown hidden" data-dropdown-uid="${phoneUid}" role="menu">
                            <button type="button" class="dropdown-item delete-item" data-action="delete-phone" data-phone-uid="${phoneUid}" data-phone-backend-id="${backendIdAttr}" role="menuitem">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                                Удалить номер
                            </button>
                        </div>
                    </div>
                </div>
                <div class="phone-balance">${this.formatCurrency(phone.numberBalance || 0)}</div>
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

        if (normalizedPhones.length === 0) {
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

        const addPhoneCardElement = document.getElementById('addPhoneCard');
        if (addPhoneCardElement) {
            addPhoneCardElement.addEventListener('click', () => {
                window.location.href = 'register-phone.html';
            });
        }

        this.bindPhoneCardEvents(grid);
    }

    bindPhoneCardEvents(grid) {
        if (!grid) {
            return;
        }

        if (this.phoneGrid && this.phoneGridClickHandler) {
            this.phoneGrid.removeEventListener('click', this.phoneGridClickHandler);
        }

        this.phoneGrid = grid;
        this.phoneGridClickHandler = (event) => {
            const toggleButton = event.target.closest('[data-action="toggle-dropdown"]');
            if (toggleButton) {
                event.preventDefault();
                event.stopPropagation();
                const phoneUid = toggleButton.getAttribute('data-phone-uid');
                this.togglePhoneDropdown(phoneUid);
                return;
            }

            const deleteButton = event.target.closest('[data-action="delete-phone"]');
            if (deleteButton) {
                event.preventDefault();
                event.stopPropagation();
                const phoneUid = deleteButton.getAttribute('data-phone-uid');
                if (phoneUid) {
                    this.closeAllPhoneDropdowns();
                    this.deletePhoneNumber(phoneUid);
                }
                return;
            }

            const card = event.target.closest('.phone-card[data-phone-index]');
            if (card && !event.target.closest('.phone-menu-container')) {
                const index = Number(card.getAttribute('data-phone-index'));
                const phone = this.phoneNumbers[index];
                if (phone) {
                    this.openPhoneDetails(phone);
                }
            }
        };

        this.phoneGrid.addEventListener('click', this.phoneGridClickHandler);

        if (!this.documentClickHandler) {
            this.documentClickHandler = (event) => {
                if (!event.target.closest('.phone-menu-container')) {
                    this.closeAllPhoneDropdowns();
                }
            };
            document.addEventListener('click', this.documentClickHandler);
        }
    }

    togglePhoneDropdown(phoneUid) {
        if (!phoneUid || !this.phoneGrid) {
            return;
        }

        const dropdown = this.phoneGrid.querySelector(`[data-dropdown-uid="${phoneUid}"]`);
        if (!dropdown) {
            return;
        }

        const isHidden = dropdown.classList.contains('hidden');
        this.closeAllPhoneDropdowns();

        if (isHidden) {
            dropdown.classList.remove('hidden');
        }
    }

    closeAllPhoneDropdowns() {
        if (!this.phoneGrid) {
            return;
        }
        const dropdowns = this.phoneGrid.querySelectorAll('.phone-dropdown');
        dropdowns.forEach(dd => dd.classList.add('hidden'));
    }

    async deletePhoneNumber(phoneUid) {
        if (!phoneUid) {
            return;
        }

        const phone = this.phoneNumbers.find(p => p.__uid === String(phoneUid));

        if (!phone) {
            alert('Не удалось определить номер телефона для удаления.');
            return;
        }

        const backendId = phone.__backendId ?? phone.numberId ?? phone.id;
        if (backendId == null) {
            alert('У выбранного номера отсутствует идентификатор для удаления.');
            return;
        }

        const phoneNumber = phone.number || phone.phoneNumber || phone.phone || 'номер';
        if (!confirm(`Вы уверены, что хотите удалить номер ${this.maskPhoneNumber(phoneNumber)}?`)) {
            return;
        }

        try {
            const response = await fetch(`/api/v1/phone/${backendId}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                const errorText = await response.text().catch(() => '');
                throw new Error(`Ошибка удаления: ${response.status} ${response.statusText}${errorText ? ' - ' + errorText : ''}`);
            }

            this.phoneNumbers = this.phoneNumbers.filter(p => p.__uid !== String(phoneUid));

            this.renderPhoneNumbers(this.phoneNumbers);
        } catch (error) {
            console.error('Ошибка удаления номера:', error);
            alert(`Не удалось удалить номер: ${error.message}`);
        }
    }

    showSuccessMessage(message) {
        console.log(message);
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

        const phoneId = this.selectedPhone.__backendId || this.selectedPhone.id || this.selectedPhone.phoneId || this.selectedPhone.phoneNumberId || this.selectedPhone.numberId;
        const clientId = this.clientId || this.userData?.clientId || this.selectedPhone.clientId;

        if (!phoneId) {
            this.setTopUpLoading(false);
            this.setModalFooter('Не удалось определить идентификатор номера телефона', 'error');
            return;
        }

        const payload = {
            amount: amountValue,
            paymentType: methodValue,
            phoneId,
            clientId: +clientId
        };

        try {
            const response = await fetch(`/api/v1/payments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

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

            const response = await fetch(`/api/v1/clients/${clientId}/payments/recent`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                this.renderTransactions([]);
                return;
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
            date: this.formatTransactionDate(transaction.createdAt || transaction.date || transaction.paymentDate),
            description: transaction.amount > 0 ? 'Пополенение' : 'Списание',
            type: transaction.amount > 0 ? 'Пополенение' : 'Списание',
            amount: transaction.amount || transaction.sum || 0,
            paymentMethod: transaction.paymentMethod || transaction.payment_method || 'Не указан',
            balanceAfter: transaction.balanceAfter || transaction.balance_after || null,
            category: transaction.category || this.detectCategory(transaction)
        };
    }

    formatTransactionDate(dateString) {
        if (!dateString) return 'N/A';
        
        try {
            const date = new Date(dateString);
            const now = new Date();
            
            // Сравниваем только даты (без времени)
            const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            const nowOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            
            const diffTime = nowOnly - dateOnly;
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays === 0) return 'Сегодня';
            if (diffDays === 1) return 'Вчера';
            if (diffDays === -1) return 'Завтра';
            if (diffDays > 0 && diffDays <= 7) return `${diffDays} дня назад`;
            if (diffDays < 0 && diffDays >= -7) return `Через ${Math.abs(diffDays)} дня`;
            
            return date.toLocaleDateString('ru-RU', { 
                day: '2-digit', 
                month: '2-digit',
                year: 'numeric'
            });
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

        list.innerHTML = recentTransactions.map(transaction => {
            const amount = transaction.amount || 0;
            const isPositive = amount > 0;
            const paymentMethod = this.formatPaymentMethod(transaction.paymentMethod);
            const balanceAfter = transaction.balanceAfter;

            return `
                <div class="transaction-item">
                    <div class="transaction-main">
                        <div class="transaction-info">
                            <div class="transaction-description">${transaction.description || transaction.type || 'Операция'}</div>
                            <div class="transaction-details">
                                <span class="transaction-method">${paymentMethod}</span>
                                ${balanceAfter !== null && balanceAfter !== undefined ? `<span class="transaction-balance">Баланс: ${this.formatCurrency(balanceAfter)}</span>` : ''}
                            </div>
                        </div>
                        <div class="transaction-right">
                            <div class="transaction-amount ${isPositive ? 'positive' : 'negative'}">
                                ${isPositive ? '+' : ''}${this.formatCurrency(amount)}
                            </div>
                            <div class="transaction-date">${transaction.date || 'N/A'}</div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    formatPaymentMethod(method) {
        if (!method) return 'Не указан';
        
        const methodMap = {
            'card': 'Банковская карта',
            'transfer': 'Банковский перевод',
            'cash': 'Наличные',
            'bank_card': 'Банковская карта',
            'bank_transfer': 'Банковский перевод',
            'наличные': 'Наличные',
            'карта': 'Банковская карта',
            'перевод': 'Банковский перевод'
        };
        
        const lowerMethod = method.toLowerCase();
        return methodMap[lowerMethod] || method;
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
