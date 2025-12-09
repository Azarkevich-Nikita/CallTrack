
class RegistrationManager {
    constructor() {
        this.form = document.getElementById('registrationForm');
        this.submitBtn = document.getElementById('submitBtn');
        this.fullNameInput = document.getElementById('fullNameInput');
        this.emailInput = document.getElementById('emailInput');
        this.birthDateInput = document.getElementById('birthDateInput');
        this.passwordInput = document.getElementById('passwordInput');
        this.confirmPasswordInput = document.getElementById('confirmPasswordInput');
        this.passwordToggle = document.getElementById('passwordToggle');
        this.confirmPasswordToggle = document.getElementById('confirmPasswordToggle');
        this.strengthFill = document.getElementById('strengthFill');
        this.strengthText = document.getElementById('strengthText');
        this.notificationModal = document.getElementById('notificationModal');
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupPasswordStrength();
        this.setupPasswordToggles();
    }

    setupEventListeners() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));

        const googleAuthBtn = document.getElementById('googleAuthBtn');
        if (googleAuthBtn) {
            googleAuthBtn.addEventListener('click', () => this.handleGoogleAuth());
        }

        this.fullNameInput.addEventListener('input', () => this.validateFullName());
        this.emailInput.addEventListener('input', () => this.validateEmail());
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


    togglePasswordVisibility(input, toggle) {
        const isPassword = input.type === 'password';
        input.type = isPassword ? 'text' : 'password';
        
        const icon = toggle.querySelector('svg');
        if (isPassword) {
            icon.innerHTML = `
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            `;
        } else {
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
        
        return isValid;
    }

    validatePasswordMatch() {
        const password = this.passwordInput.value;
        const confirmPassword = this.confirmPasswordInput.value;
        const isValid = password === confirmPassword && confirmPassword.length > 0;

        return isValid;
    }

    validateFullName() {
        const fullName = this.fullNameInput.value.trim();
        return fullName.length >= 2;
    }

    validateEmail() {
        const email = this.emailInput.value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    validateForm() {
        let isValid = true;

        this.clearErrors();

        const fullName = this.fullNameInput.value.trim();
        const email = this.emailInput.value.trim();
        const birthDate = this.birthDateInput.value;
        const password = this.passwordInput.value;
        const confirmPassword = this.confirmPasswordInput.value;
        const agreeTerms = document.getElementById('agreeTerms').checked;

        if (!fullName) {
            this.showError('fullNameInput', 'Введите полное имя');
            isValid = false;
        } else if (!this.validateFullName()) {
            this.showError('fullNameInput', 'Полное имя должно содержать минимум 2 символа');
            isValid = false;
        }

        if (!email) {
            this.showError('emailInput', 'Введите email');
            isValid = false;
        } else if (!this.validateEmail()) {
            this.showError('emailInput', 'Неверный формат email');
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

    showError(fieldId, message) {
        const field = document.getElementById(fieldId);
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message show';
        errorDiv.textContent = message;
        errorDiv.id = `error-${fieldId}`;
        
        field.parentNode.appendChild(errorDiv);
    }

    clearErrors() {
        const errorMessages = document.querySelectorAll('.error-message');
        errorMessages.forEach(msg => msg.remove());

    }

    async handleSubmit(e) {
        e.preventDefault();
        e.stopPropagation();

        if (!this.validateForm()) {
            return false;
        }

        this.setLoading(true);

        try {
            const message = await this.submitStandardRegistration();
            
            // После успешной регистрации автоматически входим
            this.showNotification('Регистрация успешна! Выполняется вход...', true);
            
            // Выполняем автоматический вход (не сбрасываем loading, так как идет перенаправление)
            await this.autoLogin();
        } catch (error) {
            console.error('Ошибка регистрации:', error);
            
            let errorMessage = 'Произошла ошибка при регистрации. Попробуйте еще раз.';
            
            if (error.message) {
                errorMessage = error.message;
            } else if (typeof error === 'string') {
                errorMessage = error;
            }
            
            this.showNotification(errorMessage, false);
            this.setLoading(false);
        }
        
        return false;
    }

    async submitStandardRegistration() {
        const fullName = this.fullNameInput.value.trim();
        const email = this.emailInput.value.trim();
        const birthDate = this.birthDateInput.value || null;
        const password = this.passwordInput.value;
        
        const formData = {
            fullName: fullName,
            email: email,
            password: password,
            birthDate: birthDate
        };

        const response = await fetch('/api/v1/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        const responseText = await response.text();
        const contentType = response.headers.get('content-type');
        const isJson = contentType && contentType.includes('application/json');
        
        if (!response.ok) {
            let errorMessage = `Ошибка регистрации. Код: ${response.status}`;
            
            try {
                if (isJson && responseText) {
                    const errorData = JSON.parse(responseText);
                    errorMessage = errorData.message || (typeof errorData === 'string' ? errorData : errorMessage);
                } else if (responseText) {
                    errorMessage = responseText;
                }
            } catch (e) {
                if (responseText) {
                    errorMessage = responseText;
                }
            }
            
            throw new Error(errorMessage);
        }

        if (isJson && responseText) {
            try {
                const data = JSON.parse(responseText);
                return typeof data === 'string' ? data : (data.message || 'Регистрация успешно завершена!');
            } catch (e) {
                return responseText || 'Регистрация успешно завершена!';
            }
        } else {
            return responseText || 'Регистрация успешно завершена!';
        }
    }

    async autoLogin() {
        const email = this.emailInput.value.trim();
        const password = this.passwordInput.value;

        const formData = {
            email: email,
            password: password
        };

        try {
            let response = await fetch('/api/v1/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (response.status === 404) {
                response = await fetch('/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });
            }

            const responseText = await response.text();
            let responseData;
            const contentType = response.headers.get('content-type') || '';
            
            if (contentType.includes('application/json') && responseText.trim()) {
                try {
                    responseData = JSON.parse(responseText);
                } catch (e) {
                    throw new Error('Ошибка при автоматическом входе');
                }
            } else {
                throw new Error('Ошибка при автоматическом входе');
            }

            if (!response.ok) {
                throw new Error('Не удалось выполнить автоматический вход');
            }

            // Сохраняем данные пользователя
            if (responseData && responseData.clientId) {
                localStorage.setItem('clientId', responseData.clientId);
                localStorage.setItem('clientData', JSON.stringify({
                    clientId: responseData.clientId,
                    fullName: responseData.fullName,
                    email: responseData.email,
                    balance: responseData.balance,
                    status: responseData.status
                }));
                if (responseData.email) {
                    localStorage.setItem('clientEmail', responseData.email);
                }
                if (responseData.status) {
                    localStorage.setItem('clientStatus', responseData.status);
                }
            } else if (responseData && Object.keys(responseData).length > 0) {
                localStorage.setItem('clientId', responseData.clientId || responseData.id);
                localStorage.setItem('clientData', JSON.stringify(responseData));
                if (responseData.email) {
                    localStorage.setItem('clientEmail', responseData.email);
                }
                if (responseData.status) {
                    localStorage.setItem('clientStatus', responseData.status);
                }
            }

            // Перенаправляем в личный кабинет
            setTimeout(() => {
                const status = (responseData?.status || localStorage.getItem('clientStatus') || '').toString().trim().toUpperCase();
                const redirectUrl = status === 'ADMIN' ? 'admin.html' : 'dashboard.html';
                window.location.href = redirectUrl;
            }, 1000);
        } catch (error) {
            console.error('Ошибка автоматического входа:', error);
            // Если автоматический вход не удался, просто показываем сообщение об успешной регистрации
            this.showNotification('Регистрация успешна! Теперь вы можете войти в систему.', true);
            this.setLoading(false);
        }
    }

    async submitGoogleRegistration(role) {
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

    showNotification(message, isSuccess) {
        const modal = document.getElementById('notificationModal');
        if (!modal) {
            console.error('Модальное окно не найдено!');
            return;
        }
        
        const content = modal.querySelector('.notification-content');
        const messageDiv = modal.querySelector('.notification-message');
        const closeBtn = document.getElementById('notificationClose');

        if (!content || !messageDiv) {
            console.error('Элементы модального окна не найдены!');
            return;
        }

        // Убираем старые классы
        content.classList.remove('success', 'error');
        
        // Добавляем нужный класс
        content.classList.add(isSuccess ? 'success' : 'error');
        
        // Устанавливаем сообщение
        messageDiv.textContent = message || (isSuccess ? 'Операция выполнена успешно' : 'Произошла ошибка');
        
        // Показываем модальное окно
        modal.classList.add('show');

        // Функция закрытия
        const closeHandler = () => {
            modal.classList.remove('show');
        };

        // Удаляем старые обработчики и добавляем новый
        if (closeBtn) {
            const newCloseBtn = closeBtn.cloneNode(true);
            closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn);
            newCloseBtn.addEventListener('click', closeHandler);
        }

        // Автоматически скрыть через 5 секунд (если успех) или 7 секунд (если ошибка)
        const timeout = isSuccess ? 5000 : 7000;
        const timeoutId = setTimeout(() => {
            if (modal.classList.contains('show')) {
                closeHandler();
            }
        }, timeout);

        // Сохраняем timeout ID для возможной очистки
        modal._timeoutId = timeoutId;
    }

    showSuccess(message) {
        this.showNotification(message, true);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new RegistrationManager();
});

window.RegistrationManager = RegistrationManager;
