// Booking page functionality - form validation and payment processing
import { FormField, ValidationResult, BookingFormData } from '../types.js';
import { AnalyticsManager } from '../modules/analytics.js';
import { PaymentManager } from '../modules/payment.js';
import { ApiClient } from '../modules/api-client.js';

export class BookingPage {
  private analytics: AnalyticsManager;
  private paymentManager: PaymentManager;
  private apiClient: ApiClient;
  private form: HTMLFormElement;
  private cardPaymentBtn: HTMLButtonElement;
  private bankTransferBtn: HTMLButtonElement;
  private successMessage: HTMLElement;

  constructor(analytics: AnalyticsManager, paymentManager: PaymentManager, apiClient: ApiClient) {
    this.analytics = analytics;
    this.paymentManager = paymentManager;
    this.apiClient = apiClient;
    
    this.form = document.getElementById('bookingForm') as HTMLFormElement;
    this.cardPaymentBtn = document.getElementById('cardPayment') as HTMLButtonElement;
    this.bankTransferBtn = document.getElementById('bankTransfer') as HTMLButtonElement;
    this.successMessage = document.getElementById('successMessage') as HTMLElement;
    
    if (this.form) {
      this.init();
    }
  }

  private init(): void {
    this.loadSelectedTicket();
    this.initEventListeners();
    this.updatePaymentButtons();
    this.trackPageView();
  }

  private loadSelectedTicket(): void {
    const selectedTicket = this.paymentManager.getSelectedTicket();
    if (selectedTicket) {
      try {
        // Update page subtitle with ticket info
        const subtitleElement = document.querySelector('.booking-subtitle');
        if (subtitleElement) {
          subtitleElement.textContent = `შერჩეული: ${selectedTicket.name} - ${selectedTicket.price}₾`;
        }
        
        // Auto-fill ticket type field if it exists
        const ticketTypeField = document.getElementById('ticketType') as HTMLInputElement;
        if (ticketTypeField) {
          ticketTypeField.value = selectedTicket.name;
        }
        
      } catch (error) {
        console.error('Error loading selected ticket:', error);
        this.analytics.trackError('Failed to load selected ticket', 'booking_page');
      }
    }
  }

  private initEventListeners(): void {
    // Real-time validation for required inputs
    const inputs = this.form.querySelectorAll('input[required]') as NodeListOf<FormField>;
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

  private validateField(field: FormField): ValidationResult {
    const errorElement = document.getElementById(field.id + 'Error') as HTMLElement;
    let result: ValidationResult;

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

  private validateName(value: string): ValidationResult {
    const trimmed = value.trim();
    if (trimmed.length < 2) {
      return { 
        isValid: false, 
        errorMessage: 'სახელი უნდა იყოს მინიმუმ 2 სიმბოლო' 
      };
    }
    return { isValid: true };
  }

  private validatePhone(value: string): ValidationResult {
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

  private updateFieldUI(field: FormField, result: ValidationResult, errorElement: HTMLElement): void {
    if (result.isValid) {
      field.style.borderColor = '#28a745';
      errorElement.style.display = 'none';
    } else {
      field.style.borderColor = '#e74c3c';
      if (result.errorMessage) {
        errorElement.textContent = result.errorMessage;
      }
      errorElement.style.display = 'block';
    }
  }

  private isFormValid(): boolean {
    const inputs = this.form.querySelectorAll('input[required]') as NodeListOf<FormField>;
    return Array.from(inputs).every(input => this.validateField(input).isValid);
  }

  private updatePaymentButtons(): void {
    const isValid = this.isFormValid();
    this.cardPaymentBtn.disabled = !isValid;
    this.bankTransferBtn.disabled = !isValid;
  }

  private getFormData(): BookingFormData {
    return {
      firstName: (document.getElementById('firstName') as HTMLInputElement).value.trim(),
      lastName: (document.getElementById('lastName') as HTMLInputElement).value.trim(),
      phone: (document.getElementById('phone') as HTMLInputElement).value.trim(),
      orderId: this.paymentManager.generateOrderId(),
      timestamp: new Date().toLocaleString('ka-GE')
    };
  }

  private async handleCardPayment(): Promise<void> {
    if (!this.isFormValid()) return;

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

      } else {
        throw new Error(result.details || 'Payment initialization failed');
      }

    } catch (error) {
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

  private handleBankTransfer(): void {
    if (!this.isFormValid()) return;

    const data = this.getFormData();
    this.proceedToNextStep('bank', data);
    
    // Track bank transfer selection
    this.analytics.trackFormInteraction('booking', 'bank_transfer_selected');
  }

  private proceedToNextStep(paymentMethod: string, data: BookingFormData): void {
    // Update step indicator
    this.updateStepIndicator(2);

    // Show success message with next step info
    let message = '';
    if (paymentMethod === 'card') {
      message = `✅ შეკვეთა რეგისტრირებულია!\n🆔 შეკვეთის კოდი: ${data.orderId}\n👤 ${data.firstName} ${data.lastName}\n📞 ${data.phone}\n\nშემდეგი ნაბიჯი: ბარათით გადახდა\nგთხოვთ დაელოდოთ, მალე გადაგიყვანთ გადახდის გვერდზე...`;
    } else {
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

  private updateStepIndicator(activeStep: number): void {
    const steps = document.querySelectorAll('.step');
    steps.forEach((step, index) => {
      if (index + 1 <= activeStep) {
        step.classList.remove('inactive');
        step.classList.add('active');
      }
    });
  }

  private simulateNextStep(paymentMethod: string, data: BookingFormData): void {
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

  private trackPageView(): void {
    this.analytics.trackPageView('Booking - ბილეთების შეკვეთა');
  }

  // Public method for external form reset
  public resetForm(): void {
    this.form.reset();
    this.updatePaymentButtons();
    this.successMessage.style.display = 'none';
    this.form.style.display = 'block';
    this.updateStepIndicator(1);
  }

  // Destroy method for cleanup
  public destroy(): void {
    // Clean up event listeners if needed
    this.paymentManager.clearSelectedTicket();
  }
}