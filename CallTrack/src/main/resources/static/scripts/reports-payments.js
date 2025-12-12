class ReportsPaymentsManager {
    constructor() {
        this.clientId = localStorage.getItem('clientId');
        this.clientData = this.getClientDataFromStorage();
        this.allTransactions = []; // Все загруженные транзакции
        this.filteredTransactions = []; // Отфильтрованные транзакции
        this.currentPage = 1;
        this.pageSize = 20;
        this.totalPages = 1;
        this.filters = {
            dateFrom: '',
            dateTo: '',
            phoneFilter: ''
        };

        this.init();
    }

    init() {
        if (!this.clientId) {
            window.location.href = 'login.html';
            return;
        }

        this.setupEventListeners();
        this.setupDefaultDates();
        this.loadTransactions();
        this.setupLogout();
        this.setupExport();
    }

    setupLogout() {
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleLogout();
            });
        }
    }

    setupExport() {
        const exportBtn = document.getElementById('exportBtn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportReports());
        }
    }

    async exportReports() {
        try {
            // Используем отфильтрованные транзакции для экспорта
            if (this.filteredTransactions.length === 0) {
                this.showError('Нет данных для экспорта');
                return;
            }

            // Форматируем транзакции для экспорта
            const transactions = this.filteredTransactions.map(t => this.formatTransaction(t));
            
            // Формируем CSV
            this.exportToCSV(transactions);
        } catch (error) {
            console.error('Ошибка экспорта:', error);
            this.showError('Не удалось экспортировать отчеты');
        }
    }

    exportToCSV(transactions) {
        // Заголовки CSV
        const headers = ['Номер телефона', 'Дата операции', 'Сумма', 'Способ оплаты'];
        
        // Формируем строки данных
        const rows = transactions.map(t => {
            const transaction = this.formatTransaction(t);
            return [
                transaction.phone_number,
                transaction.date,
                transaction.amount.toFixed(2),
                transaction.paymentMethod
            ];
        });

        // Создаем CSV содержимое
        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
        ].join('\n');

        // Добавляем BOM для корректного отображения кириллицы в Excel
        const BOM = '\uFEFF';
        const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
        
        // Создаем ссылку для скачивания
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        
        // Формируем имя файла с датой
        const today = new Date().toISOString().split('T')[0];
        const dateFrom = this.filters.dateFrom ? this.filters.dateFrom.replace(/-/g, '') : 'all';
        const dateTo = this.filters.dateTo ? this.filters.dateTo.replace(/-/g, '') : 'all';
        const fileName = `payments_report_${dateFrom}_${dateTo}_${today}.csv`;
        link.setAttribute('download', fileName);
        
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        URL.revokeObjectURL(url);
    }

    handleLogout() {
        localStorage.removeItem('clientId');
        localStorage.removeItem('clientData');
        localStorage.removeItem('clientEmail');
        localStorage.removeItem('authToken');
        window.location.href = 'login.html';
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

    setupDefaultDates() {
        const today = new Date();
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

        const dateFromInput = document.getElementById('dateFrom');
        const dateToInput = document.getElementById('dateTo');

        if (dateFromInput && !dateFromInput.value) {
            dateFromInput.value = this.formatDateForInput(firstDayOfMonth);
        }

        if (dateToInput && !dateToInput.value) {
            dateToInput.value = this.formatDateForInput(lastDayOfMonth);
        }
    }

    formatDateForInput(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    setupEventListeners() {
        const applyFiltersBtn = document.getElementById('applyFilters');
        const resetFiltersBtn = document.getElementById('resetFilters');
        const dateFromInput = document.getElementById('dateFrom');
        const dateToInput = document.getElementById('dateTo');
        const phoneFilterInput = document.getElementById('phoneFilter');

        if (applyFiltersBtn) {
            applyFiltersBtn.addEventListener('click', () => this.applyFilters());
        }

        if (resetFiltersBtn) {
            resetFiltersBtn.addEventListener('click', () => this.resetFilters());
        }

        // Убрали автоматическое применение фильтров - только по кнопке
    }

    applyFilters() {
        const dateFromInput = document.getElementById('dateFrom');
        const dateToInput = document.getElementById('dateTo');
        const phoneFilterInput = document.getElementById('phoneFilter');

        this.filters.dateFrom = dateFromInput?.value || '';
        this.filters.dateTo = dateToInput?.value || '';
        this.filters.phoneFilter = phoneFilterInput?.value || '';

        // Применяем фильтры локально
        this.currentPage = 1;
        this.filterTransactions();
    }

    filterTransactions() {
        // Фильтруем все транзакции локально
        let filtered = [...this.allTransactions];

        // Фильтр по дате "с"
        if (this.filters.dateFrom) {
            const dateFrom = new Date(this.filters.dateFrom);
            dateFrom.setHours(0, 0, 0, 0);
            filtered = filtered.filter(t => {
                try {
                    const transactionDate = new Date(t.createdAt || t.date || t.paymentDate);
                    transactionDate.setHours(0, 0, 0, 0);
                    return transactionDate >= dateFrom;
                } catch (e) {
                    return false;
                }
            });
        }

        // Фильтр по дате "по"
        if (this.filters.dateTo) {
            const dateTo = new Date(this.filters.dateTo);
            dateTo.setHours(23, 59, 59, 999);
            filtered = filtered.filter(t => {
                try {
                    const transactionDate = new Date(t.createdAt || t.date || t.paymentDate);
                    return transactionDate <= dateTo;
                } catch (e) {
                    return false;
                }
            });
        }

        // Фильтр по номеру телефона
        if (this.filters.phoneFilter && this.filters.phoneFilter.trim()) {
            const phoneFilter = this.filters.phoneFilter.toLowerCase().replace(/\D/g, '');
            filtered = filtered.filter(t => {
                const phone = (t.phone_number || t.phoneNumber || t.phone || t.phoneId || '').toString().replace(/\D/g, '');
                return phone.includes(phoneFilter);
            });
        }

        this.filteredTransactions = filtered;
        this.renderPaginatedTransactions();
    }

    renderPaginatedTransactions() {
        // Применяем пагинацию к отфильтрованным транзакциям
        const startIndex = (this.currentPage - 1) * this.pageSize;
        const endIndex = startIndex + this.pageSize;
        const paginatedTransactions = this.filteredTransactions.slice(startIndex, endIndex);

        // Форматируем транзакции для отображения
        const formattedTransactions = paginatedTransactions.map(t => this.formatTransaction(t));
        this.renderTransactions(formattedTransactions);
        this.renderPagination(this.filteredTransactions.length);
    }

    resetFilters() {
        this.setupDefaultDates();
        const phoneFilterInput = document.getElementById('phoneFilter');
        if (phoneFilterInput) {
            phoneFilterInput.value = '';
        }

        this.filters = {
            dateFrom: '',
            dateTo: '',
            phoneFilter: ''
        };

        this.currentPage = 1;
        // Применяем фильтры локально (все транзакции будут показаны)
        this.filterTransactions();
    }

    async loadTransactions() {
        try {
            const clientId = this.clientId || this.clientData?.clientId;
            if (!clientId) {
                this.renderTransactions([]);
                return;
            }

            // Загружаем все транзакции без фильтров и пагинации
            const response = await fetch(`/api/v1/clients/${clientId}/payments/recent`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Не удалось загрузить операции');
            }

            const data = await response.json();
            this.processTransactionsData(data);
        } catch (error) {
            console.error('Ошибка загрузки операций:', error);
            this.showError('Не удалось загрузить операции. Пожалуйста, попробуйте позже.');
            this.renderTransactions([]);
        }
    }

    processTransactionsData(data) {
        // Обрабатываем разные форматы ответа
        let transactions = [];

        if (Array.isArray(data)) {
            transactions = data;
        } else if (data.content && Array.isArray(data.content)) {
            // Spring Data Page format
            transactions = data.content;
        } else if (data.transactions && Array.isArray(data.transactions)) {
            transactions = data.transactions;
        } else if (data.payments && Array.isArray(data.payments)) {
            transactions = data.payments;
        }

        // Сохраняем все транзакции в исходном формате (для фильтрации по датам)
        this.allTransactions = transactions;
        
        // Применяем фильтры и отображаем
        this.filterTransactions();
    }

    formatTransaction(transaction) {
        return {
            id: transaction.id || transaction.paymentId,
            phone_number: transaction.phone_number || 'N/A',
            date: this.formatTransactionDate(transaction.createdAt || transaction.date || transaction.paymentDate),
            amount: transaction.amount || transaction.sum || 0,
            paymentMethod: this.formatPaymentMethod(transaction.paymentMethod || transaction.paymentType || transaction.payment_method),
            balanceAfter: transaction.balanceAfter || transaction.balance_after || null
        };
    }

    formatTransactionDate(dateString) {
        if (!dateString) return 'N/A';
        
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('ru-RU', { 
                day: '2-digit', 
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (e) {
            return dateString;
        }
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

    renderTransactions(transactions) {
        const tbody = document.querySelector('.reports-table tbody');
        if (!tbody) return;

        if (!transactions || transactions.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="4" class="empty-state" style="text-align: center; padding: 40px;">
                        <h3>Операций не найдено</h3>
                        <p>Попробуйте изменить параметры фильтрации</p>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = transactions.map(transaction => {
            const amount = transaction.amount || 0;
            const isPositive = amount > 0;
            const amountClass = isPositive ? 'transaction-amount-positive' : 'transaction-amount-negative';
            const amountSign = isPositive ? '+' : '';

            return `
                <tr>
                    <td>${this.maskPhoneNumber(transaction.phone_number)}</td>
                    <td>${transaction.date}</td>
                    <td class="${amountClass}">${amountSign}${this.formatCurrency(amount)}</td>
                    <td>
                        <span class="payment-method-badge">${transaction.paymentMethod}</span>
                    </td>
                </tr>
            `;
        }).join('');
    }

    renderPagination(total) {
        const paginationContainer = document.getElementById('pagination');
        if (!paginationContainer) return;

        this.totalPages = Math.ceil(total / this.pageSize) || 1;

        if (this.totalPages <= 1) {
            paginationContainer.innerHTML = '';
            return;
        }

        const prevDisabled = this.currentPage === 1 ? 'disabled' : '';
        const nextDisabled = this.currentPage >= this.totalPages ? 'disabled' : '';

        let paginationHTML = `
            <button class="pagination-btn" ${prevDisabled} onclick="reportsPaymentsManager.goToPage(${this.currentPage - 1})">
                Назад
            </button>
            <span class="pagination-info">
                Страница ${this.currentPage} из ${this.totalPages}
            </span>
            <button class="pagination-btn" ${nextDisabled} onclick="reportsPaymentsManager.goToPage(${this.currentPage + 1})">
                Вперед
            </button>
        `;

        paginationContainer.innerHTML = paginationHTML;
    }

    goToPage(page) {
        if (page < 1 || page > this.totalPages) return;
        this.currentPage = page;
        this.renderPaginatedTransactions();
        window.scrollTo({ top: 0, behavior: 'smooth' });
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
        if (!phone) return 'N/A';
        const cleaned = phone.toString().replace(/\D/g, '');
        if (cleaned.length <= 8) return phone;
        return `+${cleaned.slice(0, 4)} **** ${cleaned.slice(-4)}`;
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error';
        errorDiv.textContent = message;
        
        const container = document.querySelector('.reports-container');
        if (container) {
            const existingError = container.querySelector('.error');
            if (existingError) {
                existingError.remove();
            }
            container.insertBefore(errorDiv, container.firstChild);
            
            setTimeout(() => {
                errorDiv.remove();
            }, 5000);
        }
    }
}

// Инициализация при загрузке страницы
let reportsPaymentsManager;
document.addEventListener('DOMContentLoaded', () => {
    reportsPaymentsManager = new ReportsPaymentsManager();
    window.reportsPaymentsManager = reportsPaymentsManager;
});

