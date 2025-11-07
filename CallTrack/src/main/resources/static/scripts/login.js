/**
 * Скрипт для страницы входа
 * Обрабатывает валидацию формы и отправку данных на API
 */

class LoginManager {
    constructor() {
        this.form = document.getElementById('loginForm');
        this.submitBtn = document.getElementById('submitBtn');
        this.passwordInput = document.getElementById('passwordInput');
        this.passwordToggle = document.getElementById('passwordToggle');
        this.googleLoginBtn = document.getElementById('googleLoginBtn');
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupPasswordToggle();
    }

    setupEventListeners() {
        // Отправка формы
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));

        // Google OAuth
        if (this.googleLoginBtn) {
            this.googleLoginBtn.addEventListener('click', () => this.handleGoogleLogin());
        }
    }

    setupPasswordToggle() {
        this.passwordToggle.addEventListener('click', () => {
            this.togglePasswordVisibility(this.passwordInput, this.passwordToggle);
        });
    }

    togglePasswordVisibility(input, toggle) {
        const isPassword = input.type === 'password';
        input.type = isPassword ? 'text' : 'password';
        
        const icon = toggle.querySelector('svg');
        if (isPassword) {
            // Показать иконку "скрыть"
            icon.innerHTML = `
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            `;
        } else {
            // Показать иконку "показать"
            icon.innerHTML = `
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" stroke-width="2"/>
                <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
            `;
        }
    }

    validateForm() {
        const login = document.getElementById('loginInput').value.trim();
        const password = this.passwordInput.value;

        // Очистка предыдущих ошибок
        this.clearErrors();

        let isValid = true;

        if (!login) {
            this.showError('loginInput', 'Введите логин, email или номер телефона');
            isValid = false;
        } else if (!this.validateLoginFormat(login)) {
            this.showError('loginInput', 'Неверный формат логина, email или номера телефона');
            isValid = false;
        }

        if (!password) {
            this.showError('passwordInput', 'Введите пароль');
            isValid = false;
        }

        return isValid;
    }

    validateLoginFormat(login) {
        // Проверка на email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        // Проверка на номер телефона (российский формат)
        const phoneRegex = /^(\+7|7|8)?[\s\-]?\(?[489][0-9]{2}\)?[\s\-]?[0-9]{3}[\s\-]?[0-9]{2}[\s\-]?[0-9]{2}$/;
        // Проверка на логин (буквы, цифры, подчеркивания, минимум 3 символа)
        const loginRegex = /^[a-zA-Z0-9_]{3,}$/;

        return emailRegex.test(login) || phoneRegex.test(login) || loginRegex.test(login);
    }

    showError(fieldId, message) {
        const field = document.getElementById(fieldId);
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message show';
        errorDiv.textContent = message;
        errorDiv.id = `error-${fieldId}`;
        
        field.parentNode.appendChild(errorDiv);
        // Убрал добавление класса invalid для полей
    }

    clearErrors() {
        // Удаление всех сообщений об ошибках
        const errorMessages = document.querySelectorAll('.error-message');
        errorMessages.forEach(msg => msg.remove());

        // Убрал удаление класса invalid с полей
    }

    async handleSubmit(e) {
        e.preventDefault();

        if (!this.validateForm()) {
            return;
        }

        this.setLoading(true);

        try {
            const response = await this.submitLogin();

            if (response.success) {
                this.showSuccess('Вход выполнен успешно! Перенаправление...');
                // Сохранение токена в localStorage
                if (response.token) {
                    localStorage.setItem('authToken', response.token);
                }
                // Перенаправление на главную страницу через 1 секунду
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1000);
            } else {
                this.showError('submitBtn', response.message || 'Ошибка при входе');
            }
        } catch (error) {
            console.error('Ошибка входа:', error);
            this.showError('submitBtn', 'Произошла ошибка при входе. Попробуйте еще раз.');
        } finally {
            this.setLoading(false);
        }
    }

    async submitLogin() {
        const formData = {
            login: document.getElementById('loginInput').value.trim(),
            password: this.passwordInput.value,
            rememberMe: document.getElementById('rememberMe').checked
        };

        // TODO: Заменить на реальный URL API
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        return await response.json();
    }

    async handleGoogleLogin() {
        // TODO: Реализовать Google OAuth вход
        console.log('Google OAuth (login) не реализован');
        alert('Вход через Google пока не реализован.');
    }

    setLoading(loading) {
        const btnText = this.submitBtn.querySelector('.btn-text');
        const btnLoading = this.submitBtn.querySelector('.btn-loading');
        
        if (loading) {
            btnText.style.display = 'none';
            btnLoading.style.display = 'flex';
            this.submitBtn.disabled = true;
        } else {
            btnText.style.display = 'block';
            btnLoading.style.display = 'none';
            this.submitBtn.disabled = false;
        }
    }

    showSuccess(message) {
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message show';
        successDiv.textContent = message;
        
        this.form.appendChild(successDiv);
        
        // Автоматически скрыть через 3 секунды
        setTimeout(() => {
            successDiv.remove();
        }, 3000);
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    new LoginManager();
});

// Экспорт для возможного использования в других модулях
window.LoginManager = LoginManager;
