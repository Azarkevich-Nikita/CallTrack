(() => {
    const STORAGE_KEYS = ['clientId', 'clientData', 'clientEmail', 'authToken'];

    function initAuthHeader() {
        const navRight = document.querySelector('.site-header .nav .right');
        if (!navRight) {
            // Повторяем попытку через небольшую задержку
            setTimeout(initAuthHeader, 100);
            return;
        }

        const isAuthenticated = Boolean(localStorage.getItem('clientId'));
        const guestElements = navRight.querySelectorAll('[data-auth="guest"]');
        const userElements = navRight.querySelectorAll('[data-auth="user"]');

        // Скрываем элементы для гостей, если пользователь авторизован
        guestElements.forEach((el) => {
            if (isAuthenticated) {
                el.style.display = 'none';
                el.classList.add('hidden');
            } else {
                el.style.display = '';
                el.classList.remove('hidden');
            }
        });

        // Показываем элементы для пользователей, если пользователь авторизован
        userElements.forEach((el) => {
            if (isAuthenticated) {
                el.style.display = '';
                el.classList.remove('hidden');
            } else {
                el.style.display = 'none';
                el.classList.add('hidden');
            }
        });

        if (isAuthenticated) {
            updateDashboardLink(navRight);
            bindLogout(navRight);
        }
    }

    // Запускаем сразу, если DOM уже загружен
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(initAuthHeader, 50);
        });
    } else {
        setTimeout(initAuthHeader, 50);
    }

    function updateDashboardLink(navRight) {
        const dashboardLink = navRight.querySelector('[data-role="dashboard-link"]');
        if (!dashboardLink) {
            return;
        }

        if (!dashboardLink.getAttribute('href')) {
            dashboardLink.setAttribute('href', 'dashboard.html');
        }

        const info = getClientDisplayInfo();
        const nameEl = dashboardLink.querySelector('[data-role="user-name"]');
        const avatarEl = dashboardLink.querySelector('[data-role="user-initial"]');

        if (nameEl) {
            nameEl.textContent = info.label;
        } else {
            dashboardLink.textContent = info.label;
        }

        if (avatarEl) {
            avatarEl.textContent = info.initial;
        }

        dashboardLink.setAttribute('title', info.tooltip);
    }

    function bindLogout(navRight) {
        const logoutLink = navRight.querySelector('[data-role="logout-link"]');
        if (!logoutLink || logoutLink.dataset.bound === 'true' || logoutLink.id === 'logoutBtn') {
            return;
        }

        logoutLink.addEventListener('click', (event) => {
            event.preventDefault();
            STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
            window.location.href = 'login.html';
        });

        logoutLink.dataset.bound = 'true';
    }

    function toggleHidden(element, shouldHide) {
        if (!element) {
            return;
        }

        if (shouldHide) {
            element.classList.add('hidden');
        } else {
            element.classList.remove('hidden');
        }
    }

    function getClientDisplayInfo() {
        const info = {
            label: 'Личный кабинет',
            initial: 'ЛК',
            tooltip: 'Перейти в личный кабинет'
        };

        const clientDataRaw = localStorage.getItem('clientData');
        if (clientDataRaw) {
            try {
                const clientData = JSON.parse(clientDataRaw);
                const fullName = (clientData?.fullName || '').trim();
                if (fullName) {
                    const parts = fullName.split(/\s+/);
                    info.label = parts[0];
                    info.initial = parts[0].charAt(0).toUpperCase();
                    if (parts.length > 1) {
                        info.label = `${parts[0]} ${parts[1].charAt(0).toUpperCase()}.`;
                    }
                    info.tooltip = fullName;
                    return info;
                }

                if (clientData?.email) {
                    info.label = clientData.email;
                    info.initial = clientData.email.charAt(0).toUpperCase();
                    info.tooltip = clientData.email;
                    return info;
                }
            } catch (error) {
                console.warn('Не удалось разобрать clientData из localStorage', error);
            }
        }

        const email = localStorage.getItem('clientEmail');
        if (email) {
            info.label = email;
            info.initial = email.charAt(0).toUpperCase();
            info.tooltip = email;
        }

        return info;
    }
})();

