// Test UniPay page functionality - API testing interface
import { TestPaymentData, TestEnvironmentResponse } from '../types.js';
import { ApiClient } from '../modules/api-client.js';
import { AnalyticsManager } from '../modules/analytics.js';

export class TestUniPayPage {
  private apiClient: ApiClient;
  private analytics: AnalyticsManager;
  
  // UI Elements
  private authBtn!: HTMLButtonElement;
  private authStatus!: HTMLElement;
  private authResponse!: HTMLElement;
  private paymentBtn!: HTMLButtonElement;
  private paymentStatus!: HTMLElement;
  private paymentResponse!: HTMLElement;

  // Form Elements
  private ticketTypeSelect!: HTMLSelectElement;
  private customerNameInput!: HTMLInputElement;
  private customerEmailInput!: HTMLInputElement;
  private customerPhoneInput!: HTMLInputElement;

  constructor(apiClient: ApiClient, analytics: AnalyticsManager) {
    this.apiClient = apiClient;
    this.analytics = analytics;
    this.init();
  }

  private init(): void {
    this.findElements();
    this.bindEvents();
    this.logEnvironmentInfo();
    this.trackPageView();
  }

  private findElements(): void {
    // UI Elements
    this.authBtn = document.querySelector('button[onclick="testAuth()"]') as HTMLButtonElement;
    this.authStatus = document.getElementById('authStatus') as HTMLElement;
    this.authResponse = document.getElementById('authResponse') as HTMLElement;
    this.paymentBtn = document.querySelector('button[onclick="testPayment()"]') as HTMLButtonElement;
    this.paymentStatus = document.getElementById('paymentStatus') as HTMLElement;
    this.paymentResponse = document.getElementById('paymentResponse') as HTMLElement;

    // Form Elements
    this.ticketTypeSelect = document.getElementById('ticketType') as HTMLSelectElement;
    this.customerNameInput = document.getElementById('customerName') as HTMLInputElement;
    this.customerEmailInput = document.getElementById('customerEmail') as HTMLInputElement;
    this.customerPhoneInput = document.getElementById('customerPhone') as HTMLInputElement;
  }

  private bindEvents(): void {
    // Bind test functions to window for onclick compatibility
    (window as any).testAuth = () => this.testAuth();
    (window as any).testPayment = () => this.testPayment();

    // Add modern event listeners as well
    if (this.authBtn) {
      this.authBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.testAuth();
      });
    }

    if (this.paymentBtn) {
      this.paymentBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.testPayment();
      });
    }
  }

  public async testAuth(): Promise<void> {
    if (!this.authBtn || !this.authStatus || !this.authResponse) return;

    this.authBtn.disabled = true;
    this.authBtn.textContent = '🔄 Testing Environment...';
    
    this.authStatus.innerHTML = '<div class="status info">🔄 ვამოწმებთ Environment Variables...</div>';
    this.authResponse.style.display = 'none';

    try {
      // Track test attempt
      this.analytics.trackFormInteraction('unipay_test', 'auth_test_started');

      const envData = await this.apiClient.testEnvironment();
      
      // Display response
      this.authResponse.textContent = JSON.stringify(envData, null, 2);
      this.authResponse.style.display = 'block';

      // Update status based on result
      if (envData.status === 'READY') {
        this.authStatus.innerHTML = '<div class="status success">✅ Environment Variables მზადაა! API Key კონფიგურირებულია.</div>';
        this.analytics.trackFormInteraction('unipay_test', 'auth_test_success');
      } else {
        const errorMsg = this.buildEnvironmentErrorMessage(envData);
        this.authStatus.innerHTML = `<div class="status error">❌ ${errorMsg}</div>`;
        this.analytics.trackError(errorMsg, 'unipay_test');
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.authStatus.innerHTML = `<div class="status error">❌ Environment Test Error: ${errorMessage}</div>`;
      this.authResponse.textContent = 'Error: ' + errorMessage;
      this.authResponse.style.display = 'block';
      
      this.analytics.trackError(errorMessage, 'unipay_test_auth');
    }

    // Reset button
    this.authBtn.disabled = false;
    this.authBtn.textContent = 'Test Environment & API';
  }

  public async testPayment(): Promise<void> {
    if (!this.paymentBtn || !this.paymentStatus || !this.paymentResponse) return;

    this.paymentBtn.disabled = true;
    this.paymentBtn.textContent = '🔄 Testing Payment...';
    
    this.paymentStatus.innerHTML = '<div class="status info">🔄 ვქმნით ტესტის ორდერს...</div>';
    this.paymentResponse.style.display = 'none';

    try {
      // Track payment test attempt
      this.analytics.trackFormInteraction('unipay_test', 'payment_test_started');

      const testData = this.getTestPaymentData();
      const result = await this.apiClient.createTestPayment(testData);
      
      // Display response
      this.paymentResponse.textContent = JSON.stringify(result, null, 2);
      this.paymentResponse.style.display = 'block';

      // Update status based on result
      if (result.success && result.paymentUrl) {
        this.paymentStatus.innerHTML = `
          <div class="status success">
            ✅ Payment creation წარმატებულია!<br>
            🔗 Payment URL: <a href="${result.paymentUrl}" target="_blank" style="color: #FFD34D;">${result.paymentUrl}</a><br>
            📝 Order ID: ${result.orderId || 'N/A'}
          </div>
        `;
        this.analytics.trackFormInteraction('unipay_test', 'payment_test_success');
      } else {
        const errorMsg = result.error || 'Unknown error';
        this.paymentStatus.innerHTML = `<div class="status error">❌ Payment creation failed: ${errorMsg}</div>`;
        this.analytics.trackError(errorMsg, 'unipay_test_payment');
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.paymentStatus.innerHTML = `<div class="status error">❌ Network Error: ${errorMessage}</div>`;
      this.paymentResponse.textContent = 'Error: ' + errorMessage;
      this.paymentResponse.style.display = 'block';
      
      this.analytics.trackError(errorMessage, 'unipay_test_payment');
    }

    // Reset button
    this.paymentBtn.disabled = false;
    this.paymentBtn.textContent = 'Test Payment Creation';
  }

  private getTestPaymentData(): TestPaymentData {
    const ticketPrices: Record<string, number> = {
      'combo-adult': 50,
      'combo-student': 30,
      'illusions-adult': 25,
      'test': 1
    };

    const ticketNames: Record<string, string> = {
      'combo-adult': 'კომბო ბილეთი (ზრდასრული)',
      'combo-student': 'კომბო ბილეთი (სტუდენტი)',
      'illusions-adult': 'ილუზიების მუზეუმი (ზრდასრული)',
      'test': 'ტესტის გადახდა'
    };

    const ticketType = this.ticketTypeSelect.value;
    
    return {
      amount: ticketPrices[ticketType] || 1,
      userDetails: {
        name: this.customerNameInput.value || 'Test User',
        email: this.customerEmailInput.value || 'test@example.com',
        phone: this.customerPhoneInput.value || '+995555123456'
      },
      ticketInfo: {
        name: ticketNames[ticketType] || 'Test Ticket',
        type: ticketType
      }
    };
  }

  private buildEnvironmentErrorMessage(envData: TestEnvironmentResponse): string {
    let errorMsg = 'Environment Variables არ არის კონფიგურირებული';
    
    if (envData.environment_variables) {
      const issues: string[] = [];
      
      if (!envData.environment_variables.UNIPAY_MERCHANT_ID?.configured) {
        issues.push('UNIPAY_MERCHANT_ID');
      }
      if (!envData.environment_variables.UNIPAY_API_KEY?.configured) {
        issues.push('UNIPAY_API_KEY');
      }
      
      if (issues.length > 0) {
        errorMsg += ': ' + issues.join(', ');
      }
    }
    
    return errorMsg;
  }

  private logEnvironmentInfo(): void {
    console.log('UniPay Test Environment:', {
      hostname: window.location.hostname,
      apiBase: this.apiClient.getBaseUrl(),
      timestamp: new Date().toISOString()
    });
  }

  private trackPageView(): void {
    this.analytics.trackPageView('UniPay API Test Page');
  }

  // Utility method to clear test results
  public clearTestResults(): void {
    if (this.authResponse) {
      this.authResponse.style.display = 'none';
      this.authResponse.textContent = '';
    }
    if (this.paymentResponse) {
      this.paymentResponse.style.display = 'none';
      this.paymentResponse.textContent = '';
    }
    if (this.authStatus) {
      this.authStatus.innerHTML = '';
    }
    if (this.paymentStatus) {
      this.paymentStatus.innerHTML = '';
    }
  }

  // Reset form to default values
  public resetForm(): void {
    if (this.ticketTypeSelect) this.ticketTypeSelect.selectedIndex = 0;
    if (this.customerNameInput) this.customerNameInput.value = 'Test User';
    if (this.customerEmailInput) this.customerEmailInput.value = 'test@example.com';
    if (this.customerPhoneInput) this.customerPhoneInput.value = '+995555123456';
  }

  // Destroy method for cleanup
  public destroy(): void {
    // Remove global functions
    delete (window as any).testAuth;
    delete (window as any).testPayment;
  }
}