class PhoneRegistrationManager {
    constructor() {
        this.form = document.getElementById('phoneRegistrationForm');
        this.submitBtn = document.getElementById('submitBtn');
        this.phoneNumberInput = document.getElementById('phoneNumberInput');
        this.phoneNameInput = document.getElementById('phoneNameInput');
        this.tariffSelect = document.getElementById('tariffSelect');
        this.notificationModal = document.getElementById('notificationModal');
        this.clientId = localStorage.getItem('clientId');
        
        this.init();
    }

    init() {
        if (!this.clientId) {
            window.location.href = 'login.html';
            return;
        }

        this.setupEventListeners();
        this.loadTariffs();
    }

    setupEventListeners() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    normalizePhone(phone) {
        if (!phone) return '';
        let normalized = phone.replace(/[^\d+]/g, '').trim();
        if (!normalized) return '';
        if (normalized.startsWith('8')) {
            normalized = `+7${normalized.slice(1)}`;
        } else if (!normalized.startsWith('+')) {
            normalized = `+${normalized}`;
        }
        return normalized;
    }

    async loadTariffs() {
        try {
            const response = await fetch('/api/v1/tariffs', {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });

            if (response.ok) {
                const tariffs = await response.json();
                const tariffArray = Array.isArray(tariffs) ? tariffs : [tariffs];
                
                if (tariffArray.length > 0) {
                    this.tariffSelect.innerHTML = '<option value="">Выберите тариф</option>';
                    tariffArray.forEach(tariff => {
                        const option = document.createElement('option');
                        option.value = tariff.tariffId || tariff.id;
                        const tariffName = tariff.tariffName || tariff.name || 'Тариф';
                        const price = tariff.pricePerMinute || tariff.price || 0;
                        option.textContent = `${tariffName} - ${this.formatCurrency(price)}`;
                        this.tariffSelect.appendChild(option);
                    });
                }
            }
        } catch (error) {
            console.error('Ошибка загрузки тарифов:', error);
        }
    }

    validateForm() {
        const phoneNumber = this.normalizePhone(this.phoneNumberInput.value);
        if (!phoneNumber) {
            this.showFieldError('phoneNumberInput', 'Введите номер телефона');
            return false;
        }
        this.clearErrors();
        return true;
    }

    showFieldError(fieldId, message) {
        const field = document.getElementById(fieldId);
        if (!field) return;
        
        this.clearFieldError(fieldId);
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message show';
        errorDiv.textContent = message;
        errorDiv.id = `error-${fieldId}`;
        
        field.parentNode.appendChild(errorDiv);
    }

    clearFieldError(fieldId) {
        const errorDiv = document.getElementById(`error-${fieldId}`);
        if (errorDiv) errorDiv.remove();
    }

    clearErrors() {
        document.querySelectorAll('.error-message').forEach(msg => msg.remove());
    }

    async handleSubmit(e) {
        e.preventDefault();
        if (!this.validateForm()) return false;

        this.setLoading(true);

        try {
            const message = await this.submitPhoneRegistration();
            this.showNotification(message, true);
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 500);
        } catch (error) {
            const errorMessage = error.message || 'Произошла ошибка при регистрации номера';
            this.showNotification(errorMessage, false);
        } finally {
            this.setLoading(false);
        }
        
        return false;
    }

    async submitPhoneRegistration() {
        const formattedNumber = this.normalizePhone(this.phoneNumberInput.value);
        if (!formattedNumber) {
            throw new Error('Введите корректный номер телефона');
        }

        const formData = {
            phone: formattedNumber,
            phoneName: this.phoneNameInput.value.trim() || null,
            clientId: this.clientId,
        };

        const response = await fetch('/api/v1/registerNewPhone', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        if (!response.ok) {
            const errorText = await response.text();
            let errorMessage = `Ошибка регистрации номера. Код: ${response.status}`;
            
            try {
                const errorData = JSON.parse(errorText);
                errorMessage = errorData.message || errorData.error || errorMessage;
            } catch {
                if (errorText) errorMessage = errorText;
            }
            
            throw new Error(errorMessage);
        }

        const responseText = await response.text();
        try {
            const data = JSON.parse(responseText);
            return data.message || 'Номер телефона успешно зарегистрирован!';
        } catch {
            return responseText || 'Номер телефона успешно зарегистрирован!';
        }
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
        if (!modal) return;
        
        const content = modal.querySelector('.notification-content');
        const messageDiv = modal.querySelector('.notification-message');
        const closeBtn = document.getElementById('notificationClose');

        if (!content || !messageDiv) return;

        content.classList.remove('success', 'error');
        content.classList.add(isSuccess ? 'success' : 'error');
        messageDiv.textContent = message || (isSuccess ? 'Операция выполнена успешно' : 'Произошла ошибка');
        modal.classList.add('show');

        const closeHandler = () => modal.classList.remove('show');

        if (closeBtn) {
            const newCloseBtn = closeBtn.cloneNode(true);
            closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn);
            newCloseBtn.addEventListener('click', closeHandler);
        }

        setTimeout(() => {
            if (modal.classList.contains('show')) closeHandler();
        }, isSuccess ? 5000 : 7000);
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('ru-RU', {
            style: 'currency',
            currency: 'RUB',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new PhoneRegistrationManager();
});

window.PhoneRegistrationManager = PhoneRegistrationManager;
