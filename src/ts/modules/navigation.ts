// Navigation module for mobile menu and general navigation
import { NavigationElements } from '../types.js';
import { SmoothScroll } from './smooth-scroll.js';

export class NavigationManager {
  private elements: NavigationElements = {};
  private smoothScroll: SmoothScroll;
  private isMenuOpen: boolean = false;

  constructor(smoothScroll: SmoothScroll) {
    this.smoothScroll = smoothScroll;
    this.initNavigation();
  }

  private initNavigation(): void {
    this.findElements();
    this.bindEvents();
  }

  private findElements(): void {
    this.elements = {
      mobileMenuBtn: document.getElementById('mobileMenuBtn') || undefined,
      mobileCloseBtn: document.getElementById('mobileCloseBtn') || undefined,
      mobileNav: document.getElementById('mobileNav') || undefined,
      mobileOverlay: document.getElementById('mobileOverlay') || undefined,
      mobileNavLinks: document.querySelectorAll('.mobile-nav-link')
    };
  }

  private bindEvents(): void {
    // Mobile menu open
    if (this.elements.mobileMenuBtn) {
      this.elements.mobileMenuBtn.addEventListener('click', () => {
        this.openMobileMenu();
      });
    }

    // Mobile menu close
    if (this.elements.mobileCloseBtn) {
      this.elements.mobileCloseBtn.addEventListener('click', () => {
        this.closeMobileMenu();
      });
    }

    // Overlay click to close
    if (this.elements.mobileOverlay) {
      this.elements.mobileOverlay.addEventListener('click', () => {
        this.closeMobileMenu();
      });
    }

    // Mobile navigation links
    if (this.elements.mobileNavLinks) {
      this.elements.mobileNavLinks.forEach(link => {
        link.addEventListener('click', (e) => this.handleMobileNavClick(e));
      });
    }

    // Escape key to close menu
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isMenuOpen) {
        this.closeMobileMenu();
      }
    });
  }

  private openMobileMenu(): void {
    if (!this.elements.mobileNav || !this.elements.mobileOverlay) return;

    this.elements.mobileNav.classList.add('active');
    this.elements.mobileOverlay.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
    this.isMenuOpen = true;

    // Update aria attributes for accessibility
    if (this.elements.mobileMenuBtn) {
      this.elements.mobileMenuBtn.setAttribute('aria-expanded', 'true');
    }
  }

  private closeMobileMenu(): void {
    if (!this.elements.mobileNav || !this.elements.mobileOverlay) return;

    this.elements.mobileNav.classList.remove('active');
    this.elements.mobileOverlay.classList.remove('active');
    document.body.style.overflow = ''; // Restore scrolling
    this.isMenuOpen = false;

    // Update aria attributes for accessibility
    if (this.elements.mobileMenuBtn) {
      this.elements.mobileMenuBtn.setAttribute('aria-expanded', 'false');
    }
  }

  private handleMobileNavClick(e: Event): void {
    const link = e.target as HTMLAnchorElement;
    const href = link.getAttribute('href');

    if (href && href.startsWith('#')) {
      // Internal link - handle smooth scrolling
      e.preventDefault();
      const target = document.querySelector(href);
      
      if (target) {
        this.closeMobileMenu();
        
        // Fast scroll with minimal delay
        this.smoothScroll.scrollToElementWithDelay(
          target as HTMLElement,
          50, // minimal delay
          300 // fast duration
        );
      }
    } else {
      // External link - just close the menu
      this.closeMobileMenu();
    }
  }

  // Public methods for external control
  public openMenu(): void {
    this.openMobileMenu();
  }

  public closeMenu(): void {
    this.closeMobileMenu();
  }

  public toggleMenu(): void {
    if (this.isMenuOpen) {
      this.closeMobileMenu();
    } else {
      this.openMobileMenu();
    }
  }

  public isOpen(): boolean {
    return this.isMenuOpen;
  }

  // Destroy method for cleanup
  public destroy(): void {
    // Remove all event listeners and reset state
    document.body.style.overflow = '';
    this.isMenuOpen = false;
  }
}