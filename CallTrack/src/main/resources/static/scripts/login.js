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
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));

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

    validateForm() {
        const login = document.getElementById('loginInput').value.trim();
        const password = this.passwordInput.value;

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
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^(\+7|7|8)?[\s\-]?\(?[489][0-9]{2}\)?[\s\-]?[0-9]{3}[\s\-]?[0-9]{2}[\s\-]?[0-9]{2}$/;
        const loginRegex = /^[a-zA-Z0-9_]{3,}$/;

        return emailRegex.test(login) || phoneRegex.test(login) || loginRegex.test(login);
    }

    showError(fieldId, message) {
        const existingError = document.getElementById(`error-${fieldId}`);
        if (existingError) {
            existingError.remove();
        }

        const field = document.getElementById(fieldId);
        if (!field) {
            const form = document.getElementById('loginForm');
            if (form) {
                const errorDiv = document.createElement('div');
                errorDiv.className = 'error-message show';
                errorDiv.style.cssText = 'margin-top: 16px; padding: 12px; background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; color: #991b1b;';
                errorDiv.textContent = message;
                errorDiv.id = `error-${fieldId}`;
                form.appendChild(errorDiv);
                
                setTimeout(() => {
                    errorDiv.remove();
                }, 5000);
            }
            return;
        }

        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message show';
        errorDiv.textContent = message;
        errorDiv.id = `error-${fieldId}`;
        
        field.parentNode.appendChild(errorDiv);
        
        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }

    clearErrors() {
        const errorMessages = document.querySelectorAll('.error-message');
        errorMessages.forEach(msg => msg.remove());
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
                if (response.client) {
                    localStorage.setItem('clientId', response.client.clientId);
                    localStorage.setItem('clientData', JSON.stringify(response.client));
                    if (response.client.email) {
                        localStorage.setItem('clientEmail', response.client.email);
                    }
                }
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1000);
            } else {
                this.showError('submitBtn', response.message || 'Ошибка при входе');
            }
        } catch (error) {
            const errorMessage = error.message || 'Произошла ошибка при входе. Попробуйте еще раз.';
            this.showError('submitBtn', errorMessage);
        } finally {
            this.setLoading(false);
        }
    }

    async submitLogin() {
        const login = document.getElementById('loginInput').value.trim();
        const password = this.passwordInput.value;

        const formData = {
            email: login,
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
                    responseData = { 
                        message: responseText || `Ошибка сервера: ${response.status} ${response.statusText}`,
                        rawResponse: responseText 
                    };
                }
            } else {
                responseData = { 
                    message: responseText || `Ошибка сервера: ${response.status} ${response.statusText}`,
                    rawResponse: responseText 
                };
            }

            if (!response.ok) {
                let errorMessage = 'Ошибка при входе';
                
                if (response.status === 401) {
                    if (responseData.rawResponse && responseData.rawResponse.includes('Some think wrong!')) {
                        errorMessage = 'Неверный пароль. Проверьте введенные данные.';
                    } else {
                        errorMessage = responseData.message || responseData.error || responseData.rawResponse || 'Неверный email или пароль. Проверьте введенные данные.';
                    }
                } else if (response.status === 400) {
                    errorMessage = responseData.message || responseData.error || 'Некорректные данные. Проверьте формат введенных данных (используйте email).';
                } else if (response.status === 404) {
                    errorMessage = 'Endpoint не найден. Проверьте конфигурацию сервера. Убедитесь, что endpoint /api/v1/auth/login или /login существует.';
                } else if (response.status === 500) {
                    errorMessage = 'Ошибка сервера. Попробуйте позже.';
                } else {
                    errorMessage = responseData.message || responseData.error || responseData.rawResponse || `Ошибка: ${response.status} ${response.statusText}`;
                }

                throw new Error(errorMessage);
            }

            if (response.status === 200 || response.status === 201) {
                if (responseData && responseData.clientId) {
                    return {
                        success: true,
                        client: {
                            clientId: responseData.clientId,
                            fullName: responseData.fullName,
                            email: responseData.email,
                            balance: responseData.balance,
                            status: responseData.status
                        },
                        message: 'Вход выполнен успешно'
                    };
                } else if (responseData && Object.keys(responseData).length > 0) {
                    return {
                        success: true,
                        client: responseData,
                        message: 'Вход выполнен успешно'
                    };
                } else {
                    return {
                        success: true,
                        client: null,
                        message: 'Вход выполнен успешно'
                    };
                }
            }

            if (response.ok) {
                if (responseData && responseData.clientId) {
                    return {
                        success: true,
                        client: {
                            clientId: responseData.clientId,
                            fullName: responseData.fullName,
                            email: responseData.email,
                            balance: responseData.balance,
                            status: responseData.status
                        },
                        message: 'Вход выполнен успешно'
                    };
                }
                return {
                    success: true,
                    client: responseData || null,
                    message: 'Вход выполнен успешно'
                };
            }

            return responseData;
        } catch (error) {
            if (error.message && error.message !== 'Failed to fetch') {
                throw error;
            }
            
            throw new Error('Не удалось подключиться к серверу. Проверьте подключение к интернету и попробуйте снова.');
        }
    }

    async handleGoogleLogin() {
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
        
        setTimeout(() => {
            successDiv.remove();
        }, 3000);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new LoginManager();
});

window.LoginManager = LoginManager;