export class SmoothScroll {
    constructor() {
        this.defaultDuration = 1000;
        this.defaultHeaderOffset = 100;
        this.initSmoothScroll();
    }
    initSmoothScroll() {
        // Handle all anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => this.handleAnchorClick(e));
        });
        // Respect user's motion preferences
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            document.documentElement.style.scrollBehavior = 'auto';
        }
    }
    handleAnchorClick(e) {
        const anchor = e.target;
        // Skip mobile nav links as they have their own handler
        if (anchor.classList.contains('mobile-nav-link')) {
            return;
        }
        e.preventDefault();
        const targetId = anchor.getAttribute('href');
        if (targetId && targetId.startsWith('#')) {
            const target = document.querySelector(targetId);
            if (target) {
                this.scrollToElement(target, {
                    duration: this.defaultDuration,
                    headerOffset: this.defaultHeaderOffset
                });
            }
        }
    }
    scrollToElement(element, options = {}) {
        const duration = options.duration ?? this.defaultDuration;
        const headerOffset = options.headerOffset ?? this.defaultHeaderOffset;
        const targetPosition = element.offsetTop - headerOffset;
        this.smoothScrollTo(targetPosition, duration);
    }
    scrollToTop(duration = 1000) {
        this.smoothScrollTo(0, duration);
    }
    smoothScrollTo(targetPosition, duration = 1000) {
        const startPosition = window.pageYOffset;
        const distance = targetPosition - startPosition;
        let startTime = null;
        const animation = (currentTime) => {
            if (startTime === null)
                startTime = currentTime;
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
    easeInOutQuad(t, b, c, d) {
        t /= d / 2;
        if (t < 1)
            return c / 2 * t * t + b;
        t--;
        return -c / 2 * (t * (t - 2) - 1) + b;
    }
    // Handle mobile navigation with custom timing
    scrollToElementWithDelay(element, delay = 400, duration = 1200) {
        setTimeout(() => {
            this.scrollToElement(element, { duration });
        }, delay);
    }
}
//# sourceMappingURL=smooth-scroll.js.map