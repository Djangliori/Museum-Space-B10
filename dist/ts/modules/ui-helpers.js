export class UIHelpers {
    // FAQ Accordion functionality
    static initFAQAccordion() {
        document.querySelectorAll('.faq-question').forEach(question => {
            question.addEventListener('click', () => {
                const answer = question.nextElementSibling;
                const isActive = question.classList.contains('active');
                // Close all other FAQs
                document.querySelectorAll('.faq-question').forEach(q => {
                    q.classList.remove('active');
                    q.nextElementSibling.classList.remove('active');
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
            question.addEventListener('keydown', (e) => {
                const keyEvent = e;
                if (keyEvent.key === 'Enter' || keyEvent.key === ' ') {
                    e.preventDefault();
                    question.click();
                }
            });
        });
    }
    // Pricing toggle functionality
    static initPricingToggle() {
        const toggle = document.getElementById('spaceToggle');
        const summary = document.getElementById('pricingSummary');
        if (!toggle || !summary)
            return;
        toggle.addEventListener('click', () => {
            const isActive = toggle.classList.contains('active');
            toggle.classList.toggle('active');
            toggle.setAttribute('aria-checked', (!isActive).toString());
            // Update pricing summary (placeholder calculation)
            const adultPrice = '{{ADULT_PRICE}}'; // This would be replaced by actual config
            if (!isActive) {
                summary.textContent = `ორივე სივრცე: ${adultPrice} × 1.5 = ${Math.round(Number(adultPrice) * 1.5)} ლ მოზრდილისთვის`;
            }
            else {
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
    static initBackToTop() {
        const backToTop = document.getElementById('backToTop');
        if (!backToTop)
            return;
        // Show/hide button based on scroll position
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) {
                backToTop.classList.add('visible');
            }
            else {
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
    static initScrollToTop() {
        const scrollToTopBtn = document.getElementById('scrollToTop');
        if (!scrollToTopBtn)
            return;
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) {
                scrollToTopBtn.classList.add('visible');
            }
            else {
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
    static initLazyLoading() {
        if (!('IntersectionObserver' in window)) {
            // Fallback for browsers without IntersectionObserver
            this.loadAllImagesImmediately();
            return;
        }
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
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
    static loadAllImagesImmediately() {
        document.querySelectorAll('img[data-src]').forEach(img => {
            const imgElement = img;
            if (imgElement.dataset.src) {
                imgElement.src = imgElement.dataset.src;
                imgElement.classList.remove('lazy');
            }
        });
    }
    // Initialize animations for terms page sections
    static initTermsAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        if (!('IntersectionObserver' in window)) {
            // Fallback: show all sections immediately
            document.querySelectorAll('.terms-section').forEach(section => {
                const sectionElement = section;
                sectionElement.style.opacity = '1';
                sectionElement.style.transform = 'translateY(0)';
            });
            return;
        }
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const target = entry.target;
                    target.style.opacity = '1';
                    target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);
        // Observe all terms sections
        document.querySelectorAll('.terms-section').forEach(section => {
            const sectionElement = section;
            sectionElement.style.opacity = '0';
            sectionElement.style.transform = 'translateY(20px)';
            sectionElement.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(sectionElement);
        });
    }
    // Print functionality for terms page
    static initPrintSupport() {
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'p') {
                e.preventDefault();
                window.print();
            }
        });
    }
    // Utility function to format Georgian currency
    static formatPrice(amount) {
        return `${amount}₾`;
    }
    // Utility function to format Georgian date
    static formatGeorgianDate(date = new Date()) {
        return date.toLocaleDateString('ka-GE', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    // Utility function to safely get element by ID with error handling
    static getElementById(id) {
        try {
            return document.getElementById(id);
        }
        catch (error) {
            console.warn(`Element with ID "${id}" not found:`, error);
            return null;
        }
    }
    // Utility function to safely query selector with error handling
    static querySelector(selector) {
        try {
            return document.querySelector(selector);
        }
        catch (error) {
            console.warn(`Element with selector "${selector}" not found:`, error);
            return null;
        }
    }
    // Utility function to add loading states to buttons
    static setButtonLoading(button, loading, loadingText = 'Loading...') {
        if (loading) {
            button.dataset.originalText = button.textContent || '';
            button.textContent = loadingText;
            button.disabled = true;
            button.classList.add('loading');
        }
        else {
            button.textContent = button.dataset.originalText || 'Submit';
            button.disabled = false;
            button.classList.remove('loading');
            delete button.dataset.originalText;
        }
    }
    // Utility function to show/hide elements with animation
    static toggleElementVisibility(element, show, animationClass = 'fade') {
        if (show) {
            element.style.display = 'block';
            element.classList.add(animationClass);
        }
        else {
            element.classList.remove(animationClass);
            setTimeout(() => {
                element.style.display = 'none';
            }, 300); // Wait for animation to complete
        }
    }
}
//# sourceMappingURL=ui-helpers.js.map