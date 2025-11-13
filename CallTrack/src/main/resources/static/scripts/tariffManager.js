/**
 * Менеджер тарифов - управление отображением, фильтрацией и сортировкой тарифов
 */
class TariffManager {
    constructor() {
        this.container = document.getElementById('tariffsContainer');
        this.resultsInfo = document.getElementById('resultsInfo');
        this.resultsCount = document.getElementById('resultsCount');
        this.allTariffs = [];
        this.filteredTariffs = [];
        this.initializeControls();
        this.loadTariffs();
    }

    /**
     * Инициализация элементов управления
     */
    initializeControls() {
        // Получаем элементы управления
        this.searchInput = document.getElementById('searchInput');
        this.typeFilter = document.getElementById('typeFilter');
        this.statusFilter = document.getElementById('statusFilter');
        this.priceFrom = document.getElementById('priceFrom');
        this.priceTo = document.getElementById('priceTo');
        this.sortBy = document.getElementById('sortBy');
        this.clearFiltersBtn = document.getElementById('clearFiltersBtn');
        this.sortLabel = document.getElementById('sortLabel');

        // Добавляем обработчики событий
        this.searchInput.addEventListener('input', () => this.applyFilters());
        this.typeFilter.addEventListener('change', () => this.applyFilters());
        this.statusFilter.addEventListener('change', () => this.applyFilters());
        this.priceFrom.addEventListener('input', () => this.applyFilters());
        this.priceTo.addEventListener('input', () => this.applyFilters());
        this.sortBy.addEventListener('change', () => {
            this.updateSortLabel();
            this.applyFilters();
        });
        this.clearFiltersBtn.addEventListener('click', () => this.clearFilters());

        // Закрытие выпадающих меню при клике вне их
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.dropdown-button')) {
                this.closeAllDropdowns();
            }
        });
    }

    /**
     * Обновление лейбла сортировки
     */
    updateSortLabel() {
        const selectedOption = this.sortBy.options[this.sortBy.selectedIndex];
        this.sortLabel.textContent = selectedOption.text;
    }

    /**
     * Переключение выпадающего меню
     * @param {string} dropdownName - имя выпадающего меню
     */
    toggleDropdown(dropdownName) {
        const dropdown = document.getElementById(`${dropdownName}Dropdown`);
        const button = document.getElementById(`${dropdownName}Btn`);
        
        // Закрываем все остальные выпадающие меню
        this.closeAllDropdowns();
        
        // Переключаем текущее меню
        if (dropdown.classList.contains('show')) {
            dropdown.classList.remove('show');
            button.classList.remove('active');
        } else {
            dropdown.classList.add('show');
            button.classList.add('active');
        }
    }

    /**
     * Закрытие всех выпадающих меню
     */
    closeAllDropdowns() {
        const dropdowns = document.querySelectorAll('.dropdown-content');
        const buttons = document.querySelectorAll('.dropdown-btn');
        
        dropdowns.forEach(dropdown => dropdown.classList.remove('show'));
        buttons.forEach(button => button.classList.remove('active'));
    }

    /**
     * Загрузка тарифов с сервера
     */
    async loadTariffs() {
        try {
            const response = await fetch('/api/v1/tariffs');
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const tariffs = await response.json();
            this.allTariffs = tariffs;
            this.applyFilters();
        } catch (error) {
            console.error('Ошибка загрузки тарифов:', error);
            this.showError('Не удалось загрузить тарифы. Проверьте подключение к серверу.');
        }
    }

    /**
     * Применение фильтров и сортировки
     */
    applyFilters() {
        if (!this.allTariffs || this.allTariffs.length === 0) {
            return;
        }

        // Применяем фильтры
        this.filteredTariffs = this.allTariffs.filter(tariff => {
            return this.matchesSearch(tariff) &&
                   this.matchesType(tariff) &&
                   this.matchesStatus(tariff) &&
                   this.matchesPriceRange(tariff);
        });

        // Применяем сортировку
        this.sortTariffs();

        // Обновляем отображение
        this.updateResultsInfo();
        this.renderTariffs(this.filteredTariffs);
    }

    /**
     * Проверка соответствия поисковому запросу
     * @param {Object} tariff - тариф для проверки
     * @returns {boolean}
     */
    matchesSearch(tariff) {
        const searchTerm = this.searchInput.value.toLowerCase().trim();
        if (!searchTerm) return true;
        
        const typeLabel = this.getTypeLabel(tariff.tariffName).toLowerCase();
        return typeLabel.includes(searchTerm);
    }

    /**
     * Проверка соответствия типу тарифа
     * @param {Object} tariff - тариф для проверки
     * @returns {boolean}
     */
    matchesType(tariff) {
        const selectedType = this.typeFilter.value;
        if (!selectedType) return true;
        return tariff.tariffType === selectedType;
    }

    /**
     * Проверка соответствия статусу
     * @param {Object} tariff - тариф для проверки
     * @returns {boolean}
     */
    matchesStatus(tariff) {
        const selectedStatus = this.statusFilter.value;
        if (!selectedStatus) return true;
        
        const isActive = this.isTariffActive(tariff);
        return (selectedStatus === 'active' && isActive) || 
               (selectedStatus === 'inactive' && !isActive);
    }

    /**
     * Проверка соответствия диапазону цен
     * @param {Object} tariff - тариф для проверки
     * @returns {boolean}
     */
    matchesPriceRange(tariff) {
        const priceFrom = parseFloat(this.priceFrom.value) || 0;
        const priceTo = parseFloat(this.priceTo.value) || Infinity;
        const price = parseFloat(tariff.pricePerMinute);
        
        return price >= priceFrom && price <= priceTo;
    }

    /**
     * Сортировка тарифов
     */
    sortTariffs() {
        const sortOption = this.sortBy.value;
        
        switch (sortOption) {
            case 'price-asc':
                this.filteredTariffs.sort((a, b) => parseFloat(a.pricePerMinute) - parseFloat(b.pricePerMinute));
                break;
            case 'price-desc':
                this.filteredTariffs.sort((a, b) => parseFloat(b.pricePerMinute) - parseFloat(a.pricePerMinute));
                break;
            case 'type':
                this.filteredTariffs.sort((a, b) => a.tariffType.localeCompare(b.tariffType));
                break;
            case 'startDate-desc':
                this.filteredTariffs.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
                break;
            case 'startDate-asc':
                this.filteredTariffs.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
                break;
            default:
                // Сортировка по умолчанию - по ID
                this.filteredTariffs.sort((a, b) => a.tariffId - b.tariffId);
                break;
        }
    }

    /**
     * Обновление информации о результатах
     */
    updateResultsInfo() {
        const count = this.filteredTariffs.length;
        this.resultsCount.textContent = count;
        this.resultsInfo.style.display = count > 0 ? 'flex' : 'none';
    }

    /**
     * Очистка всех фильтров
     */
    clearFilters() {
        this.searchInput.value = '';
        this.typeFilter.value = '';
        this.statusFilter.value = '';
        this.priceFrom.value = '';
        this.priceTo.value = '';
        this.sortBy.value = 'default';
        this.updateSortLabel();
        this.closeAllDropdowns();
        this.applyFilters();
    }

    /**
     * Отображение тарифов
     * @param {Array} tariffs - массив тарифов для отображения
     */
    renderTariffs(tariffs) {
        if (!tariffs || tariffs.length === 0) {
            this.showEmptyState();
            return;
        }

        const grid = document.createElement('div');
        grid.className = 'tariffs-grid';

        tariffs.forEach(tariff => {
            const card = this.createTariffCard(tariff);
            grid.appendChild(card);
        });

        this.container.innerHTML = '';
        this.container.appendChild(grid);
    }

    /**
     * Создание карточки тарифа
     * @param {Object} tariff - данные тарифа
     * @returns {HTMLElement}
     */
    createTariffCard(tariff) {
        const card = document.createElement('div');
        card.className = 'tariff-card';

        const tariffName = tariff.tariffName;
        const typeLabel = this.getTypeLabel(tariff.tariffType);
        const isActive = this.isTariffActive(tariff);

        card.innerHTML = `
            <div class="tariff-header">
                <h3 class="tariff-type">${tariffName}</h3>
            </div>
            
            <div class="tariff-price">
                ${tariff.pricePerMinute} <span class="tariff-currency">${tariff.currency}/мин</span>
            </div>
            
            <div class="tariff-details">
                <div class="tariff-detail">
                    <span class="detail-label">Тип тарифа</span>
                    <span class="detail-value">${typeLabel}</span>
                </div>
                <div class="tariff-detail">
                    <span class="detail-label">Стоимость за минуту</span>
                    <span class="detail-value">${tariff.pricePerMinute} ${tariff.currency}</span>
                </div>
                <div class="tariff-detail">
                    <span class="detail-label">Статус</span>
                    <span class="detail-value" style="color: ${isActive ? 'var(--success)' : 'var(--warning)'}">
                        ${isActive ? 'Активен' : 'Неактивен'}
                    </span>
                </div>
            </div>
            
            <div class="tariff-dates">
                <div class="date-range">
                    <span class="date-label">Действует с:</span>
                    <span class="date-value">${this.formatDate(tariff.startDate)}</span>
                </div>
                <div class="date-range">
                    <span class="date-label">Действует до:</span>
                    <span class="date-value">${this.formatDate(tariff.endDate)}</span>
                </div>
            </div>
        `;

        return card;
    }

    /**
     * Получение читаемого названия типа тарифа
     * @param {string} type - тип тарифа
     * @returns {string}
     */
    getTypeLabel(type) {
        const labels = {
            'local': 'Местные звонки',
            'international': 'Международные звонки',
            'premium': 'Премиум тариф',
            'basic': 'Базовый тариф'
        };
        return labels[type] || type;
    }

    /**
     * Проверка активности тарифа
     * @param {Object} tariff - тариф для проверки
     * @returns {boolean}
     */
    isTariffActive(tariff) {
        const now = new Date();
        const startDate = new Date(tariff.startDate);
        const endDate = new Date(tariff.endDate);
        return now >= startDate && now <= endDate;
    }

    /**
     * Форматирование даты
     * @param {string} dateString - строка даты
     * @returns {string}
     */
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }

    /**
     * Отображение ошибки
     * @param {string} message - сообщение об ошибке
     */
    showError(message) {
        this.container.innerHTML = `
            <div class="error">
                <p>${message}</p>
                <button class="refresh-btn" onclick="location.reload()">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8M3 3v5h5M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16M21 21v-5h-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    Обновить
                </button>
            </div>
        `;
    }

    showEmptyState() {
        const hasFilters = this.hasActiveFilters();
        const title = hasFilters ? 'Тарифы не найдены' : 'Тарифы не найдены';
        const message = hasFilters 
            ? 'По заданным критериям поиска тарифы не найдены. Попробуйте изменить параметры фильтрации.'
            : 'В системе пока нет настроенных тарифов';
        
        this.container.innerHTML = `
            <div class="empty-state">
                <h3>${title}</h3>
                <p>${message}</p>
                ${hasFilters ? `
                    <button class="refresh-btn" onclick="tariffManager.clearFilters()">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M10 11v6M14 11v6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        Сбросить фильтры
                    </button>
                ` : `
                    <button class="refresh-btn" onclick="location.reload()">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8M3 3v5h5M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16M21 21v-5h-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        Обновить
                    </button>
                `}
            </div>
        `;
    }

    /**
     * Проверка наличия активных фильтров
     * @returns {boolean}
     */
    hasActiveFilters() {
        return this.searchInput.value.trim() !== '' ||
               this.typeFilter.value !== '' ||
               this.statusFilter.value !== '' ||
               this.priceFrom.value !== '' ||
               this.priceTo.value !== '' ||
               this.sortBy.value !== 'default';
    }
}

let tariffManager;
document.addEventListener('DOMContentLoaded', () => {
    tariffManager = new TariffManager();
});
