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
        reportTab: 'calls'
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
            button.addEventListener('click', () => showPanel(button.dataset.panel));
        });

        refs.dashboardBtns.forEach((btn) => {
            btn.addEventListener('click', () => showPanel(btn.dataset.panelTarget));
        });

        showPanel(document.querySelector('#adminTabs .nav-link.active')?.dataset.panel || 'dashboard');
    }

    function showPanel(panelName) {
        const targetId = `panel-${panelName}`;
        refs.tabs.forEach((tab) => tab.classList.toggle('active', tab.dataset.panel === panelName));
        refs.panels.forEach((panel) => panel.classList.toggle('active', panel.id === targetId));
    }

    function bindForms() {
        refs.paymentForm?.addEventListener('submit', (event) => {
            event.preventDefault();
            const fd = new FormData(refs.paymentForm);
            const payment = {
                id: Date.now(),
                msisdn: fd.get('msisdn'),
                amount: Number(fd.get('amount')),
                method: fd.get('method'),
                date: fd.get('date'),
                comment: fd.get('comment') || ''
            };
            state.payments.unshift(payment);
            addLogEntry('Платеж', `${payment.msisdn} · ${currencyFormatter.format(payment.amount)}`);
            refs.paymentForm.reset();
            renderAll();
            showToast('Платеж сохранен');
        });

        refs.callForm?.addEventListener('submit', (event) => {
            event.preventDefault();
            const fd = new FormData(refs.callForm);
            const type = fd.get('type');
            const duration = Number(fd.get('duration'));
            const cost = type === 'international'
                ? duration * tariffs.internationalRate
                : duration * tariffs.localRate;

            const call = {
                id: Date.now(),
                msisdn: fd.get('msisdn'),
                type,
                duration,
                timestamp: fd.get('timestamp'),
                cost,
                note: fd.get('note') || ''
            };
            state.calls.unshift(call);
            addLogEntry('Звонок', `${call.msisdn} · ${type === 'international' ? 'Международный' : 'Местный'} · ${duration} мин`);
            refs.callForm.reset();
            renderAll();
            showToast('Звонок сохранен');
        });

        refs.debtorForm?.addEventListener('submit', (event) => {
            event.preventDefault();
            const fd = new FormData(refs.debtorForm);
            const debtor = {
                id: Date.now(),
                msisdn: fd.get('msisdn'),
                debt: Number(fd.get('debt')),
                creditUsed: Number(fd.get('creditUsed')),
                status: fd.get('status') || 'warning'
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

        refs.exportReport?.addEventListener('click', () => {
            const rows = getReportSource();
            if (!rows.length) return showToast('Нет данных для экспорта', true);
            const csv = rowsToCsv(rows);
            downloadCsv(csv, `report-${state.reportTab}.csv`);
        });
    }

    function bindAlerts() {
        refs.alertForm?.addEventListener('submit', (event) => {
            event.preventDefault();
            const fd = new FormData(refs.alertForm);
            const target = fd.get('target');
            const type = fd.get('alertType');
            const message = fd.get('message') || '';
            const targetLabel = target === 'all'
                ? 'всем должникам'
                : state.debtors.find((d) => d.msisdn === target)?.msisdn || 'клиенту';
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
        const totalPayments = state.payments.reduce((s, i) => s + i.amount, 0);
        const totalCalls = state.calls.length;
        const internationalCost = state.calls.filter((c) => c.type === 'international').reduce((s, c) => s + c.cost, 0);

        refs.overviewPayments.textContent = currencyFormatter.format(totalPayments);
        refs.overviewCalls.textContent = totalCalls;
        refs.overviewInternational.textContent = currencyFormatter.format(internationalCost);
        refs.overviewDebtors.textContent = state.debtors.length;
    }

    function renderPaymentsTable() {
        if (!state.payments.length) {
            refs.paymentsTable.innerHTML = `<tr><td colspan="4" class="table-placeholder">Нет платежей</td></tr>`;
            return;
        }
        refs.paymentsTable.innerHTML = state.payments.slice(0, 6).map((p) => `
            <tr>
                <td>${formatDate(p.date)}</td>
                <td>${p.msisdn}</td>
                <td>${mapMethod(p.method)}</td>
                <td>${currencyFormatter.format(p.amount)}</td>
            </tr>
        `).join('');
    }

    function renderCallsTable() {
        if (!state.calls.length) {
            refs.callsTable.innerHTML = `<tr><td colspan="5" class="table-placeholder">Звонков пока нет</td></tr>`;
            return;
        }
        refs.callsTable.innerHTML = state.calls.slice(0, 6).map((c) => `
            <tr>
                <td>${formatDateTime(c.timestamp)}</td>
                <td>${c.msisdn}</td>
                <td>${c.type === 'international' ? 'Международный' : 'Местный'}</td>
                <td>${c.duration}</td>
                <td>${currencyFormatter.format(c.cost)}</td>
            </tr>
        `).join('');
    }

    function renderDebtorsTable() {
        if (!state.debtors.length) {
            refs.debtorsTable.innerHTML = `<tr><td colspan="4" class="table-placeholder">Нет записей</td></tr>`;
            return;
        }
        refs.debtorsTable.innerHTML = state.debtors.map((d) => `
            <tr>
                <td>${d.msisdn}</td>
                <td>${currencyFormatter.format(d.debt)}</td>
                <td>${d.creditUsed} / ${tariffs.creditLimit}</td>
                <td><span class="status-badge ${d.status === 'critical' ? 'critical' : 'warning'}">${mapDebtorStatus(d.status)}</span></td>
            </tr>
        `).join('');
    }

    function renderReports() {
        const source = getReportSource();
        const headers = getHeadersForReport();
        refs.reportsTableHead.innerHTML = `<tr>${headers.map((h) => `<th>${h}</th>`).join('')}</tr>`;

        if (!source.length) {
            refs.reportsTableBody.innerHTML = `<tr><td colspan="${headers.length}" class="table-placeholder">Нет данных</td></tr>`;
            return;
        }
        refs.reportsTableBody.innerHTML = source.map((row) => formatReportRow(row)).join('');
    }

    function getReportSource() {
        if (state.reportTab === 'calls') return state.calls;
        if (state.reportTab === 'payments') return state.payments;
        return state.debtors;
    }

    function getHeadersForReport() {
        if (state.reportTab === 'calls') return ['Дата/время', 'Номер', 'Тип', 'Минуты', 'Стоимость', 'Комментарий'];
        if (state.reportTab === 'payments') return ['Дата', 'Номер', 'Метод', 'Сумма', 'Комментарий'];
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
        const base = '<option value="all">Все должники</option>';
        refs.alertTarget.innerHTML = base + state.debtors.map((d) => `<option value="${d.msisdn}">${d.msisdn}</option>`).join('');
    }

    function renderLog() {
        if (!state.activity.length) {
            refs.activityLog.innerHTML = '<li class="log-empty">Нет записей — добавьте платеж или звонок.</li>';
            return;
        }
        refs.activityLog.innerHTML = state.activity.slice(0, 6).map((e) => `
            <li class="log-item">
                <span>${e.title}</span>
                <span>${dateFormatter.format(new Date(e.timestamp))}</span>
            </li>
        `).join('');
    }

    function addLogEntry(title, details) {
        state.activity.unshift({
            title: `${title}: ${details}`,
            timestamp: new Date().toISOString()
        });
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
        refs.toast.textContent = message;
        refs.toast.style.background = isError ? '#b91c1c' : '#0f172a';
        refs.toast.classList.add('show');
        setTimeout(() => refs.toast.classList.remove('show'), 2200);
    }

    init();
})();
