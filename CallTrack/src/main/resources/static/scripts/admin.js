(() => {
    const currencyFormatter = new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' });
    const dateFormatter = new Intl.DateTimeFormat('ru-RU', { day: '2-digit', month: 'short' });
    const dateTimeFormatter = new Intl.DateTimeFormat('ru-RU', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
    });

    const tariffs = {
        localRate: 1.5,
        internationalRate: 12,
        creditLimit: 60
    };

    const state = {
        payments: [],
        calls: [],
        debtors: [],
        activity: [],
        reportTab: 'calls',
        month: getCurrentMonth()
    };

    const refs = {
        tabs: document.querySelectorAll('#adminTabs .nav-link'),
        panels: document.querySelectorAll('.panel'),
        dashboardBtns: document.querySelectorAll('[data-panel-target]'),
        overviewPayments: document.getElementById('overviewPayments'),
        overviewCalls: document.getElementById('overviewCalls'),
        overviewInternational: document.getElementById('overviewInternational'),
        overviewDebtors: document.getElementById('overviewDebtors'),
        activityLog: document.getElementById('activityLog'),
        paymentForm: document.getElementById('paymentForm'),
        paymentsTable: document.getElementById('paymentsTableBody'),
        callForm: document.getElementById('callForm'),
        callsTable: document.getElementById('callsTableBody'),
        debtorForm: document.getElementById('debtorForm'),
        debtorsTable: document.getElementById('debtorsTableBody'),
        alertForm: document.getElementById('alertForm'),
        alertTarget: document.getElementById('alertTarget'),
        reportTabs: document.querySelectorAll('.report-tab'),
        reportsTableHead: document.getElementById('reportsTableHead'),
        reportsTableBody: document.getElementById('reportsTableBody'),
        reportMonth: document.getElementById('reportMonth'),
        exportReport: document.getElementById('exportReport'),
        toast: document.getElementById('adminToast')
    };

    function init() {
        initNavigation();
        bindForms();
        bindReports();
        bindAlerts();
        renderAll();
    }

    function initNavigation() {
        refs.tabs.forEach((button) => {
            button.addEventListener('click', () => {
                showPanel(button.dataset.panel);
            });
        });

        refs.dashboardBtns.forEach((btn) => {
            btn.addEventListener('click', () => showPanel(btn.dataset.panelTarget));
        });

        showPanel(document.querySelector('#adminTabs .nav-link.active')?.dataset.panel || 'dashboard');
    }

    function showPanel(panelName) {
        const targetId = `panel-${panelName}`;
        refs.tabs.forEach((tab) => {
            tab.classList.toggle('active', tab.dataset.panel === panelName);
        });
        refs.panels.forEach((panel) => {
            panel.classList.toggle('active', panel.id === targetId);
        });
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
                comment: formData.get('comment') || '',
                createdAt: new Date().toISOString()
            };
            state.payments.unshift(payment);
            addLogEntry('Платеж', `${payment.msisdn} · ${currencyFormatter.format(payment.amount)}`);
            refs.paymentForm.reset();
            renderAll();
            showToast('Платеж сохранен');
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
                note: formData.get('note') || '',
                createdAt: new Date().toISOString()
            };
            state.calls.unshift(call);
            addLogEntry('Звонок', `${call.msisdn} · ${type === 'international' ? 'Международный' : 'Местный'} · ${duration} мин`);
            refs.callForm.reset();
            renderAll();
            showToast('Звонок сохранен');
        });

        refs.debtorForm?.addEventListener('submit', (event) => {
            event.preventDefault();
            const formData = new FormData(refs.debtorForm);
            const debtor = {
                id: Date.now(),
                msisdn: formData.get('msisdn'),
                debt: Number(formData.get('debt')),
                creditUsed: Number(formData.get('creditUsed')),
                status: formData.get('status') || 'warning'
            };
            state.debtors.unshift(debtor);
            addLogEntry('Должник', `${debtor.msisdn} · задолженность ${currencyFormatter.format(debtor.debt)}`);
            refs.debtorForm.reset();
            renderAll();
            showToast('Должник добавлен');
        });
    }

    function bindReports() {
        refs.reportTabs.forEach((button) => {
            button.addEventListener('click', () => {
                state.reportTab = button.dataset.report;
                refs.reportTabs.forEach((tab) => tab.classList.toggle('active', tab === button));
                renderReports();
            });
        });

        if (refs.reportMonth) {
            refs.reportMonth.value = state.month;
            refs.reportMonth.addEventListener('change', (event) => {
                state.month = event.target.value;
                renderReports();
            });
        }

        refs.exportReport?.addEventListener('click', () => {
            const rows = getReportSource();
            if (!rows.length) {
                showToast('Нет данных для экспорта', true);
                return;
            }
            const csv = rowsToCsv(rows);
            downloadCsv(csv, `report-${state.reportTab}-${state.month || 'all'}.csv`);
        });
    }

    function bindAlerts() {
        refs.alertForm?.addEventListener('submit', (event) => {
            event.preventDefault();
            const formData = new FormData(refs.alertForm);
            const target = formData.get('target');
            const type = formData.get('alertType');
            const message = formData.get('message') || '';
            const targetLabel = target === 'all'
                ? 'всем должникам'
                : state.debtors.find((debtor) => debtor.msisdn === target)?.msisdn || 'клиенту';
            const typeLabel = mapAlertType(type);
            addLogEntry('Уведомление', `${typeLabel} · ${targetLabel}`);
            refs.alertForm.reset();
            refs.alertTarget.value = 'all';
            showToast('Уведомление отправлено');
        });
    }

    function renderAll() {
        updateOverview();
        renderPaymentsTable();
        renderCallsTable();
        renderDebtorsTable();
        renderReports();
        updateAlertOptions();
        renderLog();
    }

    function updateOverview() {
        const totalPayments = state.payments.reduce((sum, item) => sum + item.amount, 0);
        const totalCalls = state.calls.length;
        const internationalCost = state.calls
            .filter((call) => call.type === 'international')
            .reduce((sum, call) => sum + call.cost, 0);

        refs.overviewPayments.textContent = currencyFormatter.format(totalPayments);
        refs.overviewCalls.textContent = totalCalls.toString();
        refs.overviewInternational.textContent = currencyFormatter.format(internationalCost);
        refs.overviewDebtors.textContent = state.debtors.length.toString();
    }

    function renderPaymentsTable() {
        if (!refs.paymentsTable) return;
        if (!state.payments.length) {
            refs.paymentsTable.innerHTML = `
                <tr>
                    <td colspan="4" class="table-placeholder">Нет платежей</td>
                </tr>
            `;
            return;
        }
        refs.paymentsTable.innerHTML = state.payments.slice(0, 6).map((payment) => `
            <tr>
                <td>${formatDate(payment.date)}</td>
                <td>${payment.msisdn}</td>
                <td>${mapMethod(payment.method)}</td>
                <td>${currencyFormatter.format(payment.amount)}</td>
            </tr>
        `).join('');
    }

    function renderCallsTable() {
        if (!refs.callsTable) return;
        if (!state.calls.length) {
            refs.callsTable.innerHTML = `
                <tr>
                    <td colspan="5" class="table-placeholder">Звонков пока нет</td>
                </tr>
            `;
            return;
        }

        refs.callsTable.innerHTML = state.calls.slice(0, 6).map((call) => `
            <tr>
                <td>${formatDateTime(call.timestamp)}</td>
                <td>${call.msisdn}</td>
                <td>${call.type === 'international' ? 'Международный' : 'Местный'}</td>
                <td>${call.duration}</td>
                <td>${currencyFormatter.format(call.cost)}</td>
            </tr>
        `).join('');
    }

    function renderDebtorsTable() {
        if (!refs.debtorsTable) return;
        if (!state.debtors.length) {
            refs.debtorsTable.innerHTML = `
                <tr>
                    <td colspan="4" class="table-placeholder">Нет записей</td>
                </tr>
            `;
            return;
        }

        refs.debtorsTable.innerHTML = state.debtors.map((debtor) => `
            <tr>
                <td>${debtor.msisdn}</td>
                <td>${currencyFormatter.format(debtor.debt)}</td>
                <td>${debtor.creditUsed} / ${tariffs.creditLimit}</td>
                <td><span class="status-badge ${debtor.status === 'critical' ? 'critical' : 'warning'}">${mapDebtorStatus(debtor.status)}</span></td>
            </tr>
        `).join('');
    }

    function renderReports() {
        if (!refs.reportsTableBody || !refs.reportsTableHead) return;
        const source = getReportSource();
        const headers = getHeadersForReport();

        refs.reportsTableHead.innerHTML = `
            <tr>
                ${headers.map((header) => `<th>${header}</th>`).join('')}
            </tr>
        `;

        if (!source.length) {
            refs.reportsTableBody.innerHTML = `
                <tr>
                    <td class="table-placeholder" colspan="${headers.length}">Нет данных за выбранный период</td>
                </tr>
            `;
            return;
        }

        refs.reportsTableBody.innerHTML = source.map((row) => formatReportRow(row)).join('');
    }

    function getReportSource() {
        if (state.reportTab === 'calls') {
            return state.calls.filter((call) => matchesMonth(call.timestamp));
        }
        if (state.reportTab === 'payments') {
            return state.payments.filter((payment) => matchesMonth(payment.date));
        }
        return state.debtors;
    }

    function getHeadersForReport() {
        if (state.reportTab === 'calls') {
            return ['Дата/время', 'Номер', 'Тип', 'Минуты', 'Стоимость', 'Комментарий'];
        }
        if (state.reportTab === 'payments') {
            return ['Дата', 'Номер', 'Метод', 'Сумма', 'Комментарий'];
        }
        return ['Номер', 'Задолженность', 'Кредитные минуты', 'Статус'];
    }

    function formatReportRow(row) {
        if (state.reportTab === 'calls') {
            return `
                <tr>
                    <td>${formatDateTime(row.timestamp)}</td>
                    <td>${row.msisdn}</td>
                    <td>${row.type === 'international' ? 'Международный' : 'Местный'}</td>
                    <td>${row.duration}</td>
                    <td>${currencyFormatter.format(row.cost)}</td>
                    <td>${row.note || '—'}</td>
                </tr>
            `;
        }
        if (state.reportTab === 'payments') {
            return `
                <tr>
                    <td>${formatDate(row.date)}</td>
                    <td>${row.msisdn}</td>
                    <td>${mapMethod(row.method)}</td>
                    <td>${currencyFormatter.format(row.amount)}</td>
                    <td>${row.comment || '—'}</td>
                </tr>
            `;
        }
        return `
            <tr>
                <td>${row.msisdn}</td>
                <td>${currencyFormatter.format(row.debt)}</td>
                <td>${row.creditUsed} / ${tariffs.creditLimit}</td>
                <td>${mapDebtorStatus(row.status)}</td>
            </tr>
        `;
    }

    function updateAlertOptions() {
        if (!refs.alertTarget) return;
        const baseOption = '<option value="all">Все должники</option>';
        if (!state.debtors.length) {
            refs.alertTarget.innerHTML = baseOption;
            return;
        }
        const options = state.debtors.map((debtor) => `<option value="${debtor.msisdn}">${debtor.msisdn}</option>`).join('');
        refs.alertTarget.innerHTML = baseOption + options;
    }

    function renderLog() {
        if (!refs.activityLog) return;
        if (!state.activity.length) {
            refs.activityLog.innerHTML = '<li class="log-empty">Нет записей — добавьте платеж или звонок.</li>';
            return;
        }

        refs.activityLog.innerHTML = state.activity.slice(0, 6).map((entry) => `
            <li class="log-item">
                <span>${entry.title}</span>
                <span>${dateFormatter.format(new Date(entry.timestamp))}</span>
            </li>
        `).join('');
    }

    function addLogEntry(title, details) {
        state.activity.unshift({
            title: `${title}: ${details}`,
            timestamp: new Date().toISOString()
        });
    }

    function matchesMonth(dateString) {
        if (!state.month || !dateString) return true;
        return dateString.slice(0, 7) === state.month;
    }

    function formatDate(dateString) {
        if (!dateString) return '—';
        return dateFormatter.format(new Date(dateString));
    }

    function formatDateTime(dateString) {
        if (!dateString) return '—';
        return dateTimeFormatter.format(new Date(dateString));
    }

    function mapMethod(method) {
        switch (method) {
            case 'card': return 'Карта';
            case 'transfer': return 'Перевод';
            case 'cash': return 'Наличные';
            default: return method;
        }
    }

    function mapDebtorStatus(status) {
        return status === 'critical' ? 'Критично' : 'Ожидание оплаты';
    }

    function mapAlertType(type) {
        switch (type) {
            case 'limit': return 'Кредитные минуты на исходе';
            case 'block': return 'Блокировка исходящих';
            default: return 'Напоминание';
        }
    }

    function rowsToCsv(rows) {
        const headers = getHeadersForReport();
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
                    row.method,
                    row.amount,
                    row.comment || ''
                ];
            }
            return [
                row.msisdn,
                row.debt,
                row.creditUsed,
                row.status
            ];
        });
        return [headers, ...csvRows].map((line) => line.join(';')).join('\n');
    }

    function downloadCsv(csv, filename) {
        const blob = new Blob([csv], { type: 'text/csv' });
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
        refs.toast.style.background = isError ? '#b91c1c' : '#0f172a';
        refs.toast.classList.add('show');
        setTimeout(() => refs.toast.classList.remove('show'), 2200);
    }

    function getCurrentMonth() {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    }

    init();
})();
