(() => {
    const currencyFormatter = new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        maximumFractionDigits: 2
    });
    const shortDateFormatter = new Intl.DateTimeFormat('ru-RU', { day: '2-digit', month: 'short' });
    const longDateFormatter = new Intl.DateTimeFormat('ru-RU', { day: '2-digit', month: 'long', year: 'numeric' });

    const tariffs = {
        includedMinutes: 300,
        creditMinutes: 60,
        localRate: 1.5,
        internationalRate: 12,
        monthlyFee: 750
    };

    const callsData = [
        { id: 1, msisdn: '+7 911 204-33-44', type: 'local', duration: 18, timestamp: '2025-02-17T09:35', cost: 27, note: 'В пределах лимита' },
        { id: 2, msisdn: '+7 921 555-66-77', type: 'local', duration: 62, timestamp: '2025-02-17T11:10', cost: 93, note: 'Сверх лимита' },
        { id: 3, msisdn: '+7 963 120-45-78', type: 'international', duration: 12, timestamp: '2025-02-16T21:18', cost: 144, note: 'Канада' },
        { id: 4, msisdn: '+7 911 204-33-44', type: 'local', duration: 45, timestamp: '2025-02-15T08:12', cost: 67.5, note: 'Кредитные минуты' },
        { id: 5, msisdn: '+7 999 243-77-11', type: 'international', duration: 6, timestamp: '2025-02-14T19:02', cost: 72, note: 'Испания' }
    ];

    const paymentsData = [
        { id: 1, msisdn: '+7 911 204-33-44', amount: 1500, method: 'card', date: '2025-02-01', comment: 'Списание абонплаты' },
        { id: 2, msisdn: '+7 921 555-66-77', amount: 600, method: 'transfer', date: '2025-02-10', comment: 'Пополнение баланса' },
        { id: 3, msisdn: '+7 963 120-45-78', amount: 2100, method: 'card', date: '2025-02-12', comment: 'Оплата международных вызовов' }
    ];

    const debtorsData = [
        { id: 1, msisdn: '+7 921 555-66-77', debt: 430, creditUsed: 45, limit: tariffs.creditMinutes, status: 'warning' },
        { id: 2, msisdn: '+7 963 120-45-78', debt: 1180, creditUsed: 60, limit: tariffs.creditMinutes, status: 'critical' }
    ];

    const stockAssets = [
        { name: 'Логотип', path: 'assets/images/logo-operator.svg' },
        { name: 'Иконка звонков', path: 'assets/images/call.svg' },
        { name: 'Иконка отчетов', path: 'assets/images/report.svg' },
        { name: 'Иконка платежей', path: 'assets/images/payment.svg' },
        { name: 'Иконка уведомлений', path: 'assets/images/notify.svg' }
    ];

    const state = {
        reportTab: 'calls',
        page: 0,
        pageSize: 6,
        month: '2025-02',
        assets: [...stockAssets]
    };

    const refs = {
        overviewFees: document.getElementById('overviewFees'),
        overviewOverLimit: document.getElementById('overviewOverLimit'),
        overviewInternational: document.getElementById('overviewInternational'),
        overviewCreditClients: document.getElementById('overviewCreditClients'),
        planIncludedMinutes: document.getElementById('planIncludedMinutes'),
        creditLimit: document.getElementById('creditLimit'),
        nextBillingDate: document.getElementById('nextBillingDate'),
        paymentForm: document.getElementById('paymentForm'),
        callForm: document.getElementById('callForm'),
        notifyDebtorsBtn: document.getElementById('notifyDebtorsBtn'),
        tabs: document.querySelectorAll('.reports-tabs .tab'),
        reportsHead: document.getElementById('reportsTableHead'),
        reportsBody: document.getElementById('reportsTableBody'),
        prevPage: document.getElementById('prevPage'),
        nextPage: document.getElementById('nextPage'),
        reportMonth: document.getElementById('reportMonth'),
        exportReport: document.getElementById('exportReport'),
        toast: document.getElementById('adminToast'),
        balanceAmount: document.getElementById('sidebarBalance'),
        balanceRefresh: document.getElementById('balanceRefresh'),
        uploadArea: document.getElementById('uploadArea'),
        assetInput: document.getElementById('assetInput'),
        selectAssetsBtn: document.getElementById('selectAssetsBtn'),
        assetsList: document.getElementById('assetsList'),
        downloadAllAssets: document.getElementById('downloadAllAssets'),
        adminName: document.getElementById('adminName'),
        adminInitials: document.getElementById('adminInitials'),
        overviewGrid: document.getElementById('overviewGrid')
    };

    function init() {
        fillInitialData();
        bindForms();
        bindReportControls();
        bindAssets();
        updateOverview();
        renderReports();
        renderAssets();
    }

    function fillInitialData() {
        refs.planIncludedMinutes.textContent = tariffs.includedMinutes;
        refs.creditLimit.textContent = tariffs.creditMinutes;
        refs.nextBillingDate.textContent = getNextMonthStart();

        const storedAdmin = JSON.parse(localStorage.getItem('clientData') || '{}');
        if (storedAdmin.fullName) {
            refs.adminName.textContent = storedAdmin.fullName;
            refs.adminInitials.textContent = getInitials(storedAdmin.fullName);
        }

        if (refs.overviewGrid) {
            refs.overviewGrid.setAttribute('aria-live', 'polite');
        }
    }

    function getInitials(name) {
        return name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase();
    }

    function getNextMonthStart() {
        const now = new Date();
        const next = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        return longDateFormatter.format(next);
    }

    function bindForms() {
        refs.paymentForm?.addEventListener('submit', (event) => {
            event.preventDefault();
            const formData = new FormData(refs.paymentForm);
            const payment = {
                id: Date.now(),
                msisdn: formData.get('msisdn'),
                amount: Number(formData.get('amount')),
                method: formData.get('method'),
                date: formData.get('date'),
                comment: 'Ручной ввод администратором'
            };

            paymentsData.unshift(payment);
            refs.paymentForm.reset();
            showToast('Платеж зарегистрирован');
            updateOverview();
            renderReports();
        });

        refs.callForm?.addEventListener('submit', (event) => {
            event.preventDefault();
            const formData = new FormData(refs.callForm);
            const type = formData.get('type');
            const duration = Number(formData.get('duration'));
            const cost = type === 'international'
                ? duration * tariffs.internationalRate
                : duration * tariffs.localRate;

            const call = {
                id: Date.now(),
                msisdn: formData.get('msisdn'),
                type,
                duration,
                timestamp: formData.get('timestamp'),
                cost,
                note: formData.get('note') || 'Ручной ввод'
            };

            callsData.unshift(call);
            refs.callForm.reset();
            showToast('Звонок зарегистрирован');
            updateOverview();
            renderReports();
        });

        refs.notifyDebtorsBtn?.addEventListener('click', () => {
            showToast(`Отправлено уведомлений: ${debtorsData.length}`);
        });
    }

    function bindReportControls() {
        refs.tabs.forEach((tab) => {
            tab.addEventListener('click', () => {
                if (tab.classList.contains('active')) return;
                refs.tabs.forEach((btn) => btn.classList.remove('active'));
                tab.classList.add('active');
                state.reportTab = tab.dataset.tab;
                state.page = 0;
                renderReports();
            });
        });

        refs.prevPage?.addEventListener('click', () => {
            if (state.page > 0) {
                state.page -= 1;
                renderReports();
            }
        });

        refs.nextPage?.addEventListener('click', () => {
            const total = getReportSource().length;
            const maxPage = Math.ceil(total / state.pageSize) - 1;
            if (state.page < maxPage) {
                state.page += 1;
                renderReports();
            }
        });

        refs.reportMonth?.addEventListener('change', (event) => {
            state.month = event.target.value;
            renderReports();
            updateOverview();
        });

        refs.exportReport?.addEventListener('click', () => {
            const rows = getReportSource();
            if (!rows.length) {
                showToast('Нет данных для экспорта');
                return;
            }
            const csv = rowsToCsv(rows);
            downloadBlob(csv, `calltrack-${state.reportTab}-${state.month}.csv`, 'text/csv');
        });

        refs.balanceRefresh?.addEventListener('click', () => {
            if (!refs.balanceAmount) return;
            refs.balanceRefresh.classList.add('spinning');
            setTimeout(() => {
                const random = 100000 + Math.random() * 50000;
                refs.balanceAmount.textContent = currencyFormatter.format(random);
                refs.balanceRefresh.classList.remove('spinning');
            }, 600);
        });
    }

    function bindAssets() {
        refs.selectAssetsBtn?.addEventListener('click', () => {
            refs.assetInput?.click();
        });

        refs.assetInput?.addEventListener('change', (event) => {
            const files = Array.from(event.target.files || []);
            files.forEach(addAssetFromFile);
            event.target.value = '';
        });

        ['dragenter', 'dragover'].forEach((eventName) => {
            refs.uploadArea?.addEventListener(eventName, (event) => {
                event.preventDefault();
                refs.uploadArea.classList.add('dragging');
            });
        });

        ['dragleave', 'drop'].forEach((eventName) => {
            refs.uploadArea?.addEventListener(eventName, (event) => {
                event.preventDefault();
                refs.uploadArea.classList.remove('dragging');
            });
        });

        refs.uploadArea?.addEventListener('drop', (event) => {
            const files = Array.from(event.dataTransfer?.files || []);
            files.forEach(addAssetFromFile);
        });

        refs.downloadAllAssets?.addEventListener('click', () => {
            state.assets.forEach(downloadAsset);
            showToast('Иконки отправлены на загрузку');
        });
    }

    function addAssetFromFile(file) {
        if (!file.type.includes('image')) {
            showToast(`Файл ${file.name} не является изображением`, true);
            return;
        }

        const objectUrl = URL.createObjectURL(file);
        state.assets.unshift({ name: file.name, path: objectUrl, dynamic: true, file });
        renderAssets();
        showToast(`Добавлен файл ${file.name}`);
    }

    function downloadAsset(asset) {
        const link = document.createElement('a');
        link.href = asset.path;
        link.download = asset.name.replace(/\s+/g, '-').toLowerCase();
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    function renderAssets() {
        if (!refs.assetsList) return;
        if (!state.assets.length) {
            refs.assetsList.innerHTML = '<li>Нет доступных иконок</li>';
            return;
        }

        refs.assetsList.innerHTML = state.assets.map((asset, index) => `
            <li>
                <span>${asset.name}</span>
                <div class="asset-actions">
                    <button type="button" data-action="preview" data-index="${index}">Просмотр</button>
                    <button type="button" data-action="download" data-index="${index}">Скачать</button>
                </div>
            </li>
        `).join('');

        refs.assetsList.querySelectorAll('button').forEach((btn) => {
            btn.addEventListener('click', () => {
                const index = Number(btn.dataset.index);
                const asset = state.assets[index];
                if (!asset) return;
                if (btn.dataset.action === 'preview') {
                    window.open(asset.path, '_blank');
                } else {
                    downloadAsset(asset);
                }
            });
        });
    }

    function getReportSource() {
        const monthFilter = state.month;
        const matchesMonth = (dateString) => dateString.startsWith(monthFilter);

        if (state.reportTab === 'calls') {
            return callsData.filter((row) => row.timestamp?.startsWith(monthFilter));
        }
        if (state.reportTab === 'payments') {
            return paymentsData.filter((row) => row.date && matchesMonth(row.date));
        }
        return debtorsData;
    }

    function renderReports() {
        if (!refs.reportsBody || !refs.reportsHead) return;

        const source = getReportSource();
        if (!source.length) {
            refs.reportsHead.innerHTML = '';
            refs.reportsBody.innerHTML = `
                <tr>
                    <td class="table-placeholder">Нет данных за выбранный период</td>
                </tr>
            `;
            return;
        }

        const headers = getHeadersForTab(state.reportTab);
        refs.reportsHead.innerHTML = `
            <tr>
                ${headers.map((header) => `<th>${header}</th>`).join('')}
            </tr>
        `;

        const start = state.page * state.pageSize;
        const rows = source.slice(start, start + state.pageSize);
        refs.reportsBody.innerHTML = rows.map((row) => formatRow(state.reportTab, row)).join('');
    }

    function getHeadersForTab(tab) {
        if (tab === 'calls') {
            return ['Дата/время', 'Номер', 'Тип', 'Минуты', 'Стоимость', 'Комментарий'];
        }
        if (tab === 'payments') {
            return ['Дата', 'Номер', 'Сумма', 'Метод', 'Комментарий'];
        }
        return ['Номер', 'Задолженность', 'Использовано минут', 'Лимит', 'Статус'];
    }

    function formatRow(tab, row) {
        if (tab === 'calls') {
            return `
                <tr>
                    <td>${formatDateTime(row.timestamp)}</td>
                    <td>${row.msisdn}</td>
                    <td>${row.type === 'local' ? 'Местный' : 'Международный'}</td>
                    <td>${row.duration}</td>
                    <td>${currencyFormatter.format(row.cost)}</td>
                    <td>${row.note || '—'}</td>
                </tr>
            `;
        }

        if (tab === 'payments') {
            return `
                <tr>
                    <td>${formatDate(row.date)}</td>
                    <td>${row.msisdn}</td>
                    <td>${currencyFormatter.format(row.amount)}</td>
                    <td>${mapMethod(row.method)}</td>
                    <td>${row.comment}</td>
                </tr>
            `;
        }

        return `
            <tr>
                <td>${row.msisdn}</td>
                <td>${currencyFormatter.format(row.debt)}</td>
                <td>${row.creditUsed} мин</td>
                <td>${row.limit} мин</td>
                <td>${row.status === 'critical' ? 'Критично' : 'Требует оплаты'}</td>
            </tr>
        `;
    }

    function mapMethod(code) {
        switch (code) {
            case 'card': return 'Карта';
            case 'transfer': return 'Перевод';
            case 'cash': return 'Наличные';
            default: return code;
        }
    }

    function formatDate(date) {
        return longDateFormatter.format(new Date(date));
    }

    function formatDateTime(dateTime) {
        const date = new Date(dateTime);
        return `${shortDateFormatter.format(date)} · ${date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`;
    }

    function updateOverview() {
        const month = state.month;
        const monthCalls = callsData.filter((call) => call.timestamp.startsWith(month));
        const monthPayments = paymentsData.filter((payment) => payment.date.startsWith(month));
        const overLimitMinutes = monthCalls
            .filter((call) => call.type === 'local' && call.duration > 0)
            .reduce((sum, call) => sum + Math.max(call.duration - 10, 0), 0);
        const internationalCost = monthCalls
            .filter((call) => call.type === 'international')
            .reduce((sum, call) => sum + call.cost, 0);

        const totalFees = monthPayments.reduce((sum, payment) => sum + payment.amount, 0);

        refs.overviewFees.textContent = currencyFormatter.format(totalFees);
        refs.overviewOverLimit.textContent = `${Math.round(overLimitMinutes)} мин`;
        refs.overviewInternational.textContent = currencyFormatter.format(internationalCost);
        refs.overviewCreditClients.textContent = debtorsData.length;
    }

    function rowsToCsv(rows) {
        const headers = getHeadersForTab(state.reportTab);
        const csvRows = rows.map((row) => {
            if (state.reportTab === 'calls') {
                return [
                    formatDateTime(row.timestamp),
                    row.msisdn,
                    row.type,
                    row.duration,
                    row.cost,
                    row.note || ''
                ];
            }
            if (state.reportTab === 'payments') {
                return [
                    formatDate(row.date),
                    row.msisdn,
                    row.amount,
                    row.method,
                    row.comment
                ];
            }
            return [
                row.msisdn,
                row.debt,
                row.creditUsed,
                row.limit,
                row.status
            ];
        });

        return [headers, ...csvRows].map((line) => line.join(';')).join('\n');
    }

    function downloadBlob(content, filename, type) {
        const blob = new Blob([content], { type });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        URL.revokeObjectURL(url);
    }

    function showToast(message, isError = false) {
        if (!refs.toast) return;
        refs.toast.textContent = message;
        refs.toast.style.background = isError ? '#dc2626' : '#1f2937';
        refs.toast.classList.add('show');
        setTimeout(() => {
            refs.toast?.classList.remove('show');
        }, 2500);
    }

    init();
})();
