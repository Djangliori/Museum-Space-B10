// Smooth scrolling module
import { SmoothScrollOptions } from '../types.js';

export class SmoothScroll {
  private defaultDuration: number = 300;
  private defaultHeaderOffset: number = 100;

  constructor() {
    this.initSmoothScroll();
  }

  private initSmoothScroll(): void {
    // Handle all anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e: Event) => this.handleAnchorClick(e));
    });

    // Respect user's motion preferences
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.documentElement.style.scrollBehavior = 'auto';
    }
  }

  private handleAnchorClick(e: Event): void {
    const anchor = e.target as HTMLAnchorElement;
    
    // Skip mobile nav links as they have their own handler
    if (anchor.classList.contains('mobile-nav-link')) {
      return;
    }
    
    e.preventDefault();
    const targetId = anchor.getAttribute('href');
    
    if (targetId && targetId.startsWith('#')) {
      const target = document.querySelector(targetId);
      if (target) {
        this.scrollToElement(target as HTMLElement, {
          duration: this.defaultDuration,
          headerOffset: this.defaultHeaderOffset
        });
      }
    }
  }

  public scrollToElement(element: HTMLElement, options: SmoothScrollOptions = {}): void {
    const duration = options.duration ?? this.defaultDuration;
    const headerOffset = options.headerOffset ?? this.defaultHeaderOffset;
    
    const targetPosition = element.offsetTop - headerOffset;
    this.smoothScrollTo(targetPosition, duration);
  }

  public scrollToTop(duration: number = 300): void {
    this.smoothScrollTo(0, duration);
  }

  private smoothScrollTo(targetPosition: number, duration: number = 300): void {
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;
    let startTime: number | null = null;

    const animation = (currentTime: number): void => {
      if (startTime === null) startTime = currentTime;
      const timeElapsed = currentTime - startTime;
      const run = this.easeInOutQuad(timeElapsed, startPosition, distance, duration);
      window.scrollTo(0, run);
      if (timeElapsed < duration) {
        requestAnimationFrame(animation);
      }
    };

    requestAnimationFrame(animation);
  }

  // Easing function for smooth animation
  private easeInOutQuad(t: number, b: number, c: number, d: number): number {
    t /= d / 2;
    if (t < 1) return c / 2 * t * t + b;
    t--;
    return -c / 2 * (t * (t - 2) - 1) + b;
  }

  // Handle mobile navigation with fast timing
  public scrollToElementWithDelay(element: HTMLElement, delay: number = 50, duration: number = 300): void {
    setTimeout(() => {
      this.scrollToElement(element, { duration });
    }, delay);
  }
}