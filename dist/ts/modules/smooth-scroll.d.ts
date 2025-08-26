import { SmoothScrollOptions } from '../types.js';
export declare class SmoothScroll {
    private defaultDuration;
    private defaultHeaderOffset;
    constructor();
    private initSmoothScroll;
    private handleAnchorClick;
    scrollToElement(element: HTMLElement, options?: SmoothScrollOptions): void;
    scrollToTop(duration?: number): void;
    private smoothScrollTo;
    private easeInOutQuad;
    scrollToElementWithDelay(element: HTMLElement, delay?: number, duration?: number): void;
}
//# sourceMappingURL=smooth-scroll.d.ts.map