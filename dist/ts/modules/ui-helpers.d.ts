export declare class UIHelpers {
    static initFAQAccordion(): void;
    static initPricingToggle(): void;
    static initBackToTop(): void;
    static initScrollToTop(): void;
    static initLazyLoading(): void;
    private static loadAllImagesImmediately;
    static initTermsAnimations(): void;
    static initPrintSupport(): void;
    static formatPrice(amount: number): string;
    static formatGeorgianDate(date?: Date): string;
    static getElementById<T extends HTMLElement>(id: string): T | null;
    static querySelector<T extends HTMLElement>(selector: string): T | null;
    static setButtonLoading(button: HTMLButtonElement, loading: boolean, loadingText?: string): void;
    static toggleElementVisibility(element: HTMLElement, show: boolean, animationClass?: string): void;
}
//# sourceMappingURL=ui-helpers.d.ts.map