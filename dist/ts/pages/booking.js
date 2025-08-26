export class BookingPage {
    constructor(analytics, paymentManager, apiClient) {
        this.analytics = analytics;
        this.paymentManager = paymentManager;
        this.apiClient = apiClient;
        this.form = document.getElementById('bookingForm');
        this.cardPaymentBtn = document.getElementById('cardPayment');
        this.bankTransferBtn = document.getElementById('bankTransfer');
        this.successMessage = document.getElementById('successMessage');
        if (this.form) {
            this.init();
        }
    }
    init() {
        this.loadSelectedTicket();
        this.initEventListeners();
        this.updatePaymentButtons();
        this.trackPageView();
    }
    loadSelectedTicket() {
        const selectedTicket = this.paymentManager.getSelectedTicket();
        if (selectedTicket) {
            try {
                // Update page subtitle with ticket info
                const subtitleElement = document.querySelector('.booking-subtitle');
                if (subtitleElement) {
                    subtitleElement.textContent = `შერჩეული: ${selectedTicket.name} - ${selectedTicket.price}₾`;
                }
                // Auto-fill ticket type field if it exists
                const ticketTypeField = document.getElementById('ticketType');
                if (ticketTypeField) {
                    ticketTypeField.value = selectedTicket.name;
                }
            }
            catch (error) {
                console.error('Error loading selected ticket:', error);
                this.analytics.trackError('Failed to load selected ticket', 'booking_page');
            }
        }
    }
    initEventListeners() {
        // Real-time validation for required inputs
        const inputs = this.form.querySelectorAll('input[required]');
        inputs.forEach(input => {
            input.addEventListener('input', () => {
                this.validateField(input);
                this.updatePaymentButtons();
            });
            input.addEventListener('blur', () => {
                this.validateField(input);
            });
        });
        // Payment method handlers
        this.cardPaymentBtn.addEventListener('click', () => this.handleCardPayment());
        this.bankTransferBtn.addEventListener('click', () => this.handleBankTransfer());
    }
    validateField(field) {
        const errorElement = document.getElementById(field.id + 'Error');
        let result;
        switch (field.id) {
            case 'firstName':
            case 'lastName':
                result = this.validateName(field.value);
                break;
            case 'phone':
                result = this.validatePhone(field.value);
                break;
            default:
                result = { isValid: field.value.trim().length > 0 };
        }
        // Update UI based on validation result
        this.updateFieldUI(field, result, errorElement);
        return result;
    }
    validateName(value) {
        const trimmed = value.trim();
        if (trimmed.length < 2) {
            return {
                isValid: false,
                errorMessage: 'სახელი უნდა იყოს მინიმუმ 2 სიმბოლო'
            };
        }
        return { isValid: true };
    }
    validatePhone(value) {
        const phoneRegex = /^(\+995|995)?[0-9]{9}$/;
        const cleanPhone = value.replace(/\s/g, '');
        if (!phoneRegex.test(cleanPhone)) {
            return {
                isValid: false,
                errorMessage: 'შეავსეთ ვალიდური ტელეფონის ნომერი'
            };
        }
        return { isValid: true };
    }
    updateFieldUI(field, result, errorElement) {
        if (result.isValid) {
            field.style.borderColor = '#28a745';
            errorElement.style.display = 'none';
        }
        else {
            field.style.borderColor = '#e74c3c';
            if (result.errorMessage) {
                errorElement.textContent = result.errorMessage;
            }
            errorElement.style.display = 'block';
        }
    }
    isFormValid() {
        const inputs = this.form.querySelectorAll('input[required]');
        return Array.from(inputs).every(input => this.validateField(input).isValid);
    }
    updatePaymentButtons() {
        const isValid = this.isFormValid();
        this.cardPaymentBtn.disabled = !isValid;
        this.bankTransferBtn.disabled = !isValid;
    }
    getFormData() {
        return {
            firstName: document.getElementById('firstName').value.trim(),
            lastName: document.getElementById('lastName').value.trim(),
            phone: document.getElementById('phone').value.trim(),
            orderId: this.paymentManager.generateOrderId(),
            timestamp: new Date().toLocaleString('ka-GE')
        };
    }
    async handleCardPayment() {
        if (!this.isFormValid())
            return;
        const data = this.getFormData();
        // Show loading state
        this.cardPaymentBtn.disabled = true;
        this.cardPaymentBtn.textContent = '⏳ გადახდა მუშავდება...';
        try {
            // Process payment through PaymentManager
            const result = await this.paymentManager.processCardPayment(data, 10.0, 'სამუზეუმო სივრცის ბილეთი');
            if (result.success && result.paymentUrl) {
                // Show success message briefly
                this.updateStepIndicator(2);
                this.successMessage.textContent = '✅ შეკვეთა შექმნილია! გადამისამართება უნიფეის გვერდზე...';
                this.successMessage.style.display = 'block';
                this.form.style.display = 'none';
                // Redirect to UniPay
                this.paymentManager.redirectToPayment(result.paymentUrl, 2000);
            }
            else {
                throw new Error(result.details || 'Payment initialization failed');
            }
        }
        catch (error) {
            console.error('Payment error:', error);
            // Show error message
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this.successMessage.textContent = `❌ შეცდომა! ${errorMessage}. გთხოვთ კვლავ სცადოთ ან დაუკავშირდით მხარდაჭერას`;
            this.successMessage.style.display = 'block';
            // Reset button
            this.cardPaymentBtn.disabled = false;
            this.cardPaymentBtn.textContent = '💳 ბარათით გადახდა';
            // Track error
            this.analytics.trackError(errorMessage, 'booking_payment');
        }
    }
    handleBankTransfer() {
        if (!this.isFormValid())
            return;
        const data = this.getFormData();
        this.proceedToNextStep('bank', data);
        // Track bank transfer selection
        this.analytics.trackFormInteraction('booking', 'bank_transfer_selected');
    }
    proceedToNextStep(paymentMethod, data) {
        // Update step indicator
        this.updateStepIndicator(2);
        // Show success message with next step info
        let message = '';
        if (paymentMethod === 'card') {
            message = `✅ შეკვეთა რეგისტრირებულია!\n🆔 შეკვეთის კოდი: ${data.orderId}\n👤 ${data.firstName} ${data.lastName}\n📞 ${data.phone}\n\nშემდეგი ნაბიჯი: ბარათით გადახდა\nგთხოვთ დაელოდოთ, მალე გადაგიყვანთ გადახდის გვერდზე...`;
        }
        else {
            message = `✅ შეკვეთა რეგისტრირებულია!\n🆔 შეკვეთის კოდი: ${data.orderId}\n👤 ${data.firstName} ${data.lastName}\n📞 ${data.phone}\n\nშემდეგი ნაბიჯი: ბანკში გადარიცხვა\nმალე მიიღებთ ინსტრუქციებს...`;
        }
        this.successMessage.textContent = message;
        this.successMessage.style.display = 'block';
        this.form.style.display = 'none';
        // Simulate next step after 3 seconds for bank transfer
        if (paymentMethod === 'bank') {
            setTimeout(() => {
                this.simulateNextStep(paymentMethod, data);
            }, 3000);
        }
    }
    updateStepIndicator(activeStep) {
        const steps = document.querySelectorAll('.step');
        steps.forEach((step, index) => {
            if (index + 1 <= activeStep) {
                step.classList.remove('inactive');
                step.classList.add('active');
            }
        });
    }
    simulateNextStep(paymentMethod, data) {
        this.updateStepIndicator(3);
        if (paymentMethod === 'bank') {
            this.successMessage.innerHTML = `
        <strong>🏦 ბანკში გადარიცხვის ინსტრუქცია</strong><br>
        🆔 შეკვეთის კოდი: <strong>${data.orderId}</strong><br><br>
        <strong>ბანკის რეკვიზიტები:</strong><br>
        მიმღები: შპს სამუზეუმო სივრცე<br>
        ანგარიშის ნომერი: GE00TB0000000000000000<br>
        ბანკი: თიბისი ბანკი<br>
        დანიშნულება: ${data.orderId}<br><br>
        <strong>საკონტაქტო ინფორმაცია:</strong><br>
        📧 betlemi.museum@gmail.com<br>
        📞 +995 32 2 123 456
      `;
        }
    }
    trackPageView() {
        this.analytics.trackPageView('Booking - ბილეთების შეკვეთა');
    }
    // Public method for external form reset
    resetForm() {
        this.form.reset();
        this.updatePaymentButtons();
        this.successMessage.style.display = 'none';
        this.form.style.display = 'block';
        this.updateStepIndicator(1);
    }
    // Destroy method for cleanup
    destroy() {
        // Clean up event listeners if needed
        this.paymentManager.clearSelectedTicket();
    }
}
//# sourceMappingURL=booking.js.map