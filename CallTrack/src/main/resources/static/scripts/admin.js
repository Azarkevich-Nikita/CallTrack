 document.addEventListener("DOMContentLoaded", () => {
    const tabs = document.querySelectorAll("#adminTabs .nav-link");
    const panels = document.querySelectorAll(".panel");

    tabs.forEach(tab => {
        tab.addEventListener("click", () => {
            tabs.forEach(t => t.classList.remove("active"));
            panels.forEach(p => p.classList.remove("active"));

            tab.classList.add("active");
            document.getElementById(`panel-${tab.dataset.panel}`).classList.add("active");
        });
    });

    const toast = document.getElementById("adminToast");

    function showToast(message, type = "ok") {
        toast.textContent = message;
        toast.className = "toast show " + type;

        setTimeout(() => toast.classList.remove("show"), 2600);
    }

    const callForm = document.getElementById("callForm");
    const callsTable = document.getElementById("callsTableBody");

    if (callForm) {
        callForm.addEventListener("submit", async (e) => {
            e.preventDefault();
        
            const formData = new FormData(callForm);

            const payload = {
                phoneNumber: formData.get("msisdn"),
                callType: formData.get("type"),
                durationMinutes: parseInt(formData.get("duration")),
                startDate: formData.get("timestamp").split("T")[0],
                comment: formData.get("note")
            };
        
            try {
                const res = await fetch("/api/v1/reg/call", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });
        
                if (!res.ok) throw new Error("Ошибка запроса");
        
                const data = await res.json();
                addCallRow(data);
                callForm.reset();
                showToast("Звонок сохранён");
        
            } catch (err) {
                console.error(err);
                showToast("Не удалось сохранить звонок", "error");
            }
        });
        
    }

    function addCallRow(call) {
        const placeholder = callsTable.querySelector(".table-placeholder");
        if (placeholder) placeholder.parentElement.remove();

        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${call.timestamp}</td>
            <td>${call.msisdn}</td>
            <td>${call.type}</td>
            <td>${call.duration}</td>
            <td>${call.cost ?? "-"}</td>
        `;
        callsTable.prepend(tr);
    }

    const debtorForm = document.getElementById("debtorForm");
    const debtorsTable = document.getElementById("debtorsTableBody");

    if (debtorForm) {
        debtorForm.addEventListener("submit", (e) => {
            e.preventDefault();

            const formData = new FormData(debtorForm);
            const d = Object.fromEntries(formData.entries());

            const placeholder = debtorsTable.querySelector(".table-placeholder");
            if (placeholder) placeholder.parentElement.remove();

            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${d.msisdn}</td>
                <td>${d.debt} ₽</td>
                <td>${d.creditUsed}</td>
                <td>${d.status}</td>
            `;

            debtorsTable.prepend(tr);
            debtorForm.reset();
            showToast("Должник добавлен");
            updateOverview();
        });
    }

    const alertForm = document.getElementById("alertForm");

    if (alertForm) {
        alertForm.addEventListener("submit", (e) => {
            e.preventDefault();
            showToast("Уведомление отправлено");
            alertForm.reset();
        });
    }

    const reportTabs = document.querySelectorAll(".report-tab");
    const reportsHead = document.getElementById("reportsTableHead");
    const reportsBody = document.getElementById("reportsTableBody");

    reportTabs.forEach(tab => {
        tab.addEventListener("click", () => {
            reportTabs.forEach(t => t.classList.remove("active"));
            tab.classList.add("active");

            loadMockReport(tab.dataset.report);
        });
    });

    function loadMockReport(type) {
        reportsHead.innerHTML = "";
        reportsBody.innerHTML = "";

        if (type === "calls") {
            reportsHead.innerHTML = `
                <tr>
                    <th>Дата</th><th>Номер</th><th>Тип</th><th>Мин</th><th>Стоимость</th>
                </tr>`;
            reportsBody.innerHTML = `<tr><td colspan="5" class="table-placeholder">Нет данных</td></tr>`;
        }

        if (type === "payments") {
            reportsHead.innerHTML = `
                <tr><th>Дата</th><th>Номер</th><th>Сумма</th></tr>`;
            reportsBody.innerHTML = `<tr><td colspan="3" class="table-placeholder">Нет данных</td></tr>`;
        }

        if (type === "debtors") {
            reportsHead.innerHTML = `
                <tr><th>Номер</th><th>Долг</th><th>Кредитные мин.</th></tr>`;
            reportsBody.innerHTML = `<tr><td colspan="3" class="table-placeholder">Нет данных</td></tr>`;
        }
    }

    const exportBtn = document.getElementById("exportReport");

    if (exportBtn) {
        exportBtn.addEventListener("click", () => {
            const rows = [...document.querySelectorAll("#reportsTableBody tr")].map(row =>
                [...row.children].map(td => td.innerText).join(";")
            );

            const csv = rows.join("\n");
            const blob = new Blob([csv], { type: "text/csv" });

            const a = document.createElement("a");
            a.href = URL.createObjectURL(blob);
            a.download = "report.csv";
            a.click();
        });
    }

    function updateOverview() {
        const payments = 0;
        const calls = document.querySelectorAll("#callsTableBody tr").length;
        const internationalCost = 0;
        const debtors = document.querySelectorAll("#debtorsTableBody tr").length;

        document.getElementById("overviewPayments").textContent = payments + " ₽";
        document.getElementById("overviewCalls").textContent = calls;
        document.getElementById("overviewInternational").textContent = internationalCost + " ₽";
        document.getElementById("overviewDebtors").textContent = debtors;
    }

    updateOverview();
});
