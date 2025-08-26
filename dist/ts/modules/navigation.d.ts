import { SmoothScroll } from './smooth-scroll.js';
export declare class NavigationManager {
    private elements;
    private smoothScroll;
    private isMenuOpen;
    constructor(smoothScroll: SmoothScroll);
    private initNavigation;
    private findElements;
    private bindEvents;
    private openMobileMenu;
    private closeMobileMenu;
    private handleMobileNavClick;
    openMenu(): void;
    closeMenu(): void;
    toggleMenu(): void;
    isOpen(): boolean;
    destroy(): void;
}
//# sourceMappingURL=navigation.d.ts.map