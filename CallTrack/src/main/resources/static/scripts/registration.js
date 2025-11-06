
class RegistrationManager {
    constructor() {
        this.form = document.getElementById('registrationForm');
        this.submitBtn = document.getElementById('submitBtn');
        this.passwordInput = document.getElementById('passwordInput');
        this.confirmPasswordInput = document.getElementById('confirmPasswordInput');
        this.passwordToggle = document.getElementById('passwordToggle');
        this.confirmPasswordToggle = document.getElementById('confirmPasswordToggle');
        this.strengthFill = document.getElementById('strengthFill');
        this.strengthText = document.getElementById('strengthText');
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupPasswordStrength();
        this.setupPasswordToggles();
    }

    setupEventListeners() {
        // Отправка формы
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));

        // Google OAuth
        const googleAuthBtn = document.getElementById('googleAuthBtn');
        if (googleAuthBtn) {
            googleAuthBtn.addEventListener('click', () => this.handleGoogleAuth());
        }

        // Валидация в реальном времени
        this.passwordInput.addEventListener('input', () => this.validatePassword());
        this.confirmPasswordInput.addEventListener('input', () => this.validatePasswordMatch());
    }

    setupPasswordStrength() {
        this.passwordInput.addEventListener('input', () => {
            const password = this.passwordInput.value;
            const strength = this.calculatePasswordStrength(password);
            this.updatePasswordStrength(strength);
        });
    }

    setupPasswordToggles() {
        this.passwordToggle.addEventListener('click', () => {
            this.togglePasswordVisibility(this.passwordInput, this.passwordToggle);
        });

        this.confirmPasswordToggle.addEventListener('click', () => {
            this.togglePasswordVisibility(this.confirmPasswordInput, this.confirmPasswordToggle);
        });
    }

    // тип регистрации убран

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

    calculatePasswordStrength(password) {
        let score = 0;
        const checks = {
            length: password.length >= 8,
            lowercase: /[a-z]/.test(password),
            uppercase: /[A-Z]/.test(password),
            numbers: /\d/.test(password),
            symbols: /[!@#$%^&*(),.?":{}|<>]/.test(password)
        };

        Object.values(checks).forEach(check => {
            if (check) score++;
        });

        if (score < 2) return { level: 'weak', text: 'Слабый пароль', percentage: 33 };
        if (score < 4) return { level: 'medium', text: 'Средний пароль', percentage: 66 };
        return { level: 'strong', text: 'Надежный пароль', percentage: 100 };
    }

    updatePasswordStrength(strength) {
        this.strengthFill.className = `strength-fill ${strength.level}`;
        this.strengthFill.style.width = `${strength.percentage}%`;
        this.strengthText.textContent = strength.text;
    }

    validatePassword() {
        const password = this.passwordInput.value;
        const isValid = password.length >= 8;
        
        // Убрал добавление класса invalid для полей
        return isValid;
    }

    validatePasswordMatch() {
        const password = this.passwordInput.value;
        const confirmPassword = this.confirmPasswordInput.value;
        const isValid = password === confirmPassword && confirmPassword.length > 0;
        
        // Убрал добавление класса invalid для полей
        return isValid;
    }

    validateForm() {
        let isValid = true;

        // Очистка предыдущих ошибок
        this.clearErrors();

        const login = document.getElementById('loginInput').value.trim();
        const password = this.passwordInput.value;
        const confirmPassword = this.confirmPasswordInput.value;
        const agreeTerms = document.getElementById('agreeTerms').checked;

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
        } else if (!this.validatePassword()) {
            this.showError('passwordInput', 'Пароль должен содержать минимум 8 символов');
            isValid = false;
        }

        if (!confirmPassword) {
            this.showError('confirmPasswordInput', 'Подтвердите пароль');
            isValid = false;
        } else if (!this.validatePasswordMatch()) {
            this.showError('confirmPasswordInput', 'Пароли не совпадают');
            isValid = false;
        }

        if (!agreeTerms) {
            this.showError('agreeTerms', 'Необходимо согласиться с условиями использования');
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
            let response = await this.submitStandardRegistration();

            if (response.success) {
                this.showSuccess('Регистрация успешно завершена! Перенаправление...');
                // Перенаправление на главную страницу через 2 секунды
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 2000);
            } else {
                this.showError('submitBtn', response.message || 'Ошибка при регистрации');
            }
        } catch (error) {
            console.error('Ошибка регистрации:', error);
            this.showError('submitBtn', 'Произошла ошибка при регистрации. Попробуйте еще раз.');
        } finally {
            this.setLoading(false);
        }
    }

    async submitStandardRegistration() {
        const formData = {
            login: document.getElementById('loginInput').value.trim(),
            password: this.passwordInput.value
        };

        // TODO: Заменить на реальный URL API
        const response = await fetch('/api/auth/register', {
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

    async submitGoogleRegistration(role) {
        // TODO: Реализовать Google OAuth
        // Пока что возвращаем заглушку
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    success: false,
                    message: 'Google OAuth пока не реализован'
                });
            }, 1000);
        });
    }

    async handleGoogleAuth() {
        // TODO: Реализовать Google OAuth
        console.log('Google OAuth не реализован');
        alert('Google OAuth пока не реализован. Используйте стандартную регистрацию.');
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
        
        // Автоматически скрыть через 5 секунд
        setTimeout(() => {
            successDiv.remove();
        }, 5000);
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    new RegistrationManager();
});

// Экспорт для возможного использования в других модулях
window.RegistrationManager = RegistrationManager;
