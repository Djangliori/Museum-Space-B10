// UI helper functions and utilities
import { IntersectionObserverOptions } from '../types.js';

export class UIHelpers {
  
  // FAQ Accordion functionality
  public static initFAQAccordion(): void {
    document.querySelectorAll('.faq-question').forEach(question => {
      question.addEventListener('click', () => {
        const answer = question.nextElementSibling as HTMLElement;
        const isActive = question.classList.contains('active');
        
        // Close all other FAQs
        document.querySelectorAll('.faq-question').forEach(q => {
          q.classList.remove('active');
          (q.nextElementSibling as HTMLElement).classList.remove('active');
          q.setAttribute('aria-expanded', 'false');
        });
        
        // Toggle current FAQ
        if (!isActive) {
          question.classList.add('active');
          answer.classList.add('active');
          question.setAttribute('aria-expanded', 'true');
        }
      });

      // Keyboard support
      question.addEventListener('keydown', (e: Event) => {
        const keyEvent = e as KeyboardEvent;
        if (keyEvent.key === 'Enter' || keyEvent.key === ' ') {
          e.preventDefault();
          (question as HTMLElement).click();
        }
      });
    });
  }

  // Pricing toggle functionality
  public static initPricingToggle(): void {
    const toggle = document.getElementById('spaceToggle');
    const summary = document.getElementById('pricingSummary');
    
    if (!toggle || !summary) return;
    
    toggle.addEventListener('click', () => {
      const isActive = toggle.classList.contains('active');
      toggle.classList.toggle('active');
      toggle.setAttribute('aria-checked', (!isActive).toString());
      
      // Update pricing summary (placeholder calculation)
      const adultPrice = '{{ADULT_PRICE}}'; // This would be replaced by actual config
      if (!isActive) {
        summary.textContent = `ორივე სივრცე: ${adultPrice} × 1.5 = ${Math.round(Number(adultPrice) * 1.5)} ლ მოზრდილისთვის`;
      } else {
        summary.textContent = `ერთი სივრცე: ${adultPrice} ლ მოზრდილისთვის`;
      }
    });

    // Keyboard support for toggle
    toggle.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggle.click();
      }
    });
  }

  // Back to top button functionality
  public static initBackToTop(): void {
    const backToTop = document.getElementById('backToTop');
    if (!backToTop) return;
    
    // Show/hide button based on scroll position
    window.addEventListener('scroll', () => {
      if (window.pageYOffset > 300) {
        backToTop.classList.add('visible');
      } else {
        backToTop.classList.remove('visible');
      }
    });

    // Handle click to scroll to top
    backToTop.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  // Scroll to top functionality for terms page
  public static initScrollToTop(): void {
    const scrollToTopBtn = document.getElementById('scrollToTop');
    if (!scrollToTopBtn) return;
    
    window.addEventListener('scroll', () => {
      if (window.pageYOffset > 300) {
        scrollToTopBtn.classList.add('visible');
      } else {
        scrollToTopBtn.classList.remove('visible');
      }
    });

    scrollToTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  // Lazy loading for images using Intersection Observer
  public static initLazyLoading(): void {
    if (!('IntersectionObserver' in window)) {
      // Fallback for browsers without IntersectionObserver
      this.loadAllImagesImmediately();
      return;
    }

    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.classList.remove('lazy');
            observer.unobserve(img);
          }
        }
      });
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
      imageObserver.observe(img);
    });
  }

  private static loadAllImagesImmediately(): void {
    document.querySelectorAll('img[data-src]').forEach(img => {
      const imgElement = img as HTMLImageElement;
      if (imgElement.dataset.src) {
        imgElement.src = imgElement.dataset.src;
        imgElement.classList.remove('lazy');
      }
    });
  }

  // Initialize animations for terms page sections
  public static initTermsAnimations(): void {
    const observerOptions: IntersectionObserverOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    if (!('IntersectionObserver' in window)) {
      // Fallback: show all sections immediately
      document.querySelectorAll('.terms-section').forEach(section => {
        const sectionElement = section as HTMLElement;
        sectionElement.style.opacity = '1';
        sectionElement.style.transform = 'translateY(0)';
      });
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const target = entry.target as HTMLElement;
          target.style.opacity = '1';
          target.style.transform = 'translateY(0)';
        }
      });
    }, observerOptions);

    // Observe all terms sections
    document.querySelectorAll('.terms-section').forEach(section => {
      const sectionElement = section as HTMLElement;
      sectionElement.style.opacity = '0';
      sectionElement.style.transform = 'translateY(20px)';
      sectionElement.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      observer.observe(sectionElement);
    });
  }

  // Print functionality for terms page
  public static initPrintSupport(): void {
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.key === 'p') {
        e.preventDefault();
        window.print();
      }
    });
  }

  // Utility function to format Georgian currency
  public static formatPrice(amount: number): string {
    return `${amount}₾`;
  }

  // Utility function to format Georgian date
  public static formatGeorgianDate(date: Date = new Date()): string {
    return date.toLocaleDateString('ka-GE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Utility function to safely get element by ID with error handling
  public static getElementById<T extends HTMLElement>(id: string): T | null {
    try {
      return document.getElementById(id) as T;
    } catch (error) {
      console.warn(`Element with ID "${id}" not found:`, error);
      return null;
    }
  }

  // Utility function to safely query selector with error handling
  public static querySelector<T extends HTMLElement>(selector: string): T | null {
    try {
      return document.querySelector(selector) as T;
    } catch (error) {
      console.warn(`Element with selector "${selector}" not found:`, error);
      return null;
    }
  }

  // Utility function to add loading states to buttons
  public static setButtonLoading(button: HTMLButtonElement, loading: boolean, loadingText: string = 'Loading...'): void {
    if (loading) {
      button.dataset.originalText = button.textContent || '';
      button.textContent = loadingText;
      button.disabled = true;
      button.classList.add('loading');
    } else {
      button.textContent = button.dataset.originalText || 'Submit';
      button.disabled = false;
      button.classList.remove('loading');
      delete button.dataset.originalText;
    }
  }

  // Utility function to show/hide elements with animation
  public static toggleElementVisibility(element: HTMLElement, show: boolean, animationClass: string = 'fade'): void {
    if (show) {
      element.style.display = 'block';
      element.classList.add(animationClass);
    } else {
      element.classList.remove(animationClass);
      setTimeout(() => {
        element.style.display = 'none';
      }, 300); // Wait for animation to complete
    }
  }
}