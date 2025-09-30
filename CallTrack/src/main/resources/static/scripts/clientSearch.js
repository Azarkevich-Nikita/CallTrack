document.addEventListener("DOMContentLoaded", () => {
    const searchBtn = document.getElementById("searchBtn");
    const phoneInput = document.getElementById("phoneInput");
    const clientInfo = document.getElementById("clientInfo");

    searchBtn.addEventListener("click", async () => {
        const number = phoneInput.value.trim();

        if (!number) {
            alert("Введите номер телефона!");
            return;
        }

        try {
            const response = await fetch(`/api/v1/clients/${number}`);

            if (!response.ok) {
                throw new Error(`Ошибка: ${response.status}`);
            }

            const data = await response.json();
            console.log("Ответ сервера:", data);

            clientInfo.innerHTML = `
                <strong>ФИО:</strong> ${data.fullName || "—"}<br>
                <strong>Email:</strong> ${data.email || "—"}<br>
                <strong>Баланс:</strong> ${data.balance ?? "—"} ₽
            `;

        } catch (error) {
            console.error("Ошибка при запросе:", error);
            clientInfo.innerHTML = "<span style='color:red;'>Клиент не найден</span>";
        }
    });
});
