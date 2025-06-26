import { Injectable } from '@angular/core';
import { BehaviorSubject, fromEvent, Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';

export interface DeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  screenWidth: number;
  screenHeight: number;
  orientation: 'portrait' | 'landscape';
  devicePixelRatio: number;
  touchSupport: boolean;
  platform: string;
  userAgent: string;
}

export interface ViewportBreakpoints {
  xs: boolean; // < 576px
  sm: boolean; // >= 576px
  md: boolean; // >= 768px
  lg: boolean; // >= 992px
  xl: boolean; // >= 1200px
  xxl: boolean; // >= 1400px
}

@Injectable({
  providedIn: 'root'
})
export class MobileOptimizationService {
  private deviceInfo$ = new BehaviorSubject<DeviceInfo>(this.getDeviceInfo());
  private viewportBreakpoints$ = new BehaviorSubject<ViewportBreakpoints>(this.getViewportBreakpoints());
  private isKeyboardOpen$ = new BehaviorSubject<boolean>(false);

  constructor() {
    this.initializeListeners();
  }

  // Device Information
  getDeviceInfo(): DeviceInfo {
    const userAgent = navigator.userAgent;
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    
    return {
      isMobile: this.isMobileDevice(),
      isTablet: this.isTabletDevice(),
      isDesktop: this.isDesktopDevice(),
      screenWidth,
      screenHeight,
      orientation: screenWidth > screenHeight ? 'landscape' : 'portrait',
      devicePixelRatio: window.devicePixelRatio || 1,
      touchSupport: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
      platform: this.getPlatform(),
      userAgent
    };
  }

  // Viewport Breakpoints
  getViewportBreakpoints(): ViewportBreakpoints {
    const width = window.innerWidth;
    
    return {
      xs: width < 576,
      sm: width >= 576 && width < 768,
      md: width >= 768 && width < 992,
      lg: width >= 992 && width < 1200,
      xl: width >= 1200 && width < 1400,
      xxl: width >= 1400
    };
  }

  // Observable Streams
  getDeviceInfo$(): Observable<DeviceInfo> {
    return this.deviceInfo$.asObservable();
  }

  getViewportBreakpoints$(): Observable<ViewportBreakpoints> {
    return this.viewportBreakpoints$.asObservable();
  }

  getIsKeyboardOpen$(): Observable<boolean> {
    return this.isKeyboardOpen$.asObservable();
  }

  // Device Detection Methods
  private isMobileDevice(): boolean {
    const userAgent = navigator.userAgent;
    const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
    return mobileRegex.test(userAgent) || window.innerWidth <= 768;
  }

  private isTabletDevice(): boolean {
    const userAgent = navigator.userAgent;
    const tabletRegex = /iPad|Android(?!.*Mobile)/i;
    return tabletRegex.test(userAgent) || (window.innerWidth > 768 && window.innerWidth <= 1024);
  }

  private isDesktopDevice(): boolean {
    return !this.isMobileDevice() && !this.isTabletDevice();
  }

  private getPlatform(): string {
    const userAgent = navigator.userAgent;
    
    if (/iPhone|iPad|iPod/i.test(userAgent)) return 'iOS';
    if (/Android/i.test(userAgent)) return 'Android';
    if (/Windows/i.test(userAgent)) return 'Windows';
    if (/Mac/i.test(userAgent)) return 'macOS';
    if (/Linux/i.test(userAgent)) return 'Linux';
    
    return 'Unknown';
  }

  // Touch and Gesture Support
  isTouchDevice(): boolean {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }

  supportsHover(): boolean {
    return window.matchMedia('(hover: hover)').matches;
  }

  // Viewport Utilities
  getViewportWidth(): number {
    return window.innerWidth;
  }

  getViewportHeight(): number {
    return window.innerHeight;
  }

  getScrollbarWidth(): number {
    const outer = document.createElement('div');
    outer.style.visibility = 'hidden';
    outer.style.overflow = 'scroll';
    (outer.style as any).msOverflowStyle = 'scrollbar';
    document.body.appendChild(outer);

    const inner = document.createElement('div');
    outer.appendChild(inner);

    const scrollbarWidth = outer.offsetWidth - inner.offsetWidth;
    outer.parentNode?.removeChild(outer);

    return scrollbarWidth;
  }

  // Safe Area Support (for iOS notch)
  getSafeAreaInsets(): { top: number; right: number; bottom: number; left: number } {
    const style = getComputedStyle(document.documentElement);
    
    return {
      top: parseInt(style.getPropertyValue('--sat') || '0', 10),
      right: parseInt(style.getPropertyValue('--sar') || '0', 10),
      bottom: parseInt(style.getPropertyValue('--sab') || '0', 10),
      left: parseInt(style.getPropertyValue('--sal') || '0', 10)
    };
  }

  // Performance Optimization
  enableGPUAcceleration(element: HTMLElement): void {
    element.style.transform = 'translateZ(0)';
    element.style.willChange = 'transform';
  }

  disableGPUAcceleration(element: HTMLElement): void {
    element.style.transform = '';
    element.style.willChange = '';
  }

  // Scroll Management
  disableBodyScroll(): void {
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
  }

  enableBodyScroll(): void {
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.width = '';
  }

  // Touch Event Helpers
  getTouchCoordinates(event: TouchEvent): { x: number; y: number } {
    const touch = event.touches[0] || event.changedTouches[0];
    return {
      x: touch.clientX,
      y: touch.clientY
    };
  }

  // Responsive Image Loading
  getOptimalImageSize(containerWidth: number): string {
    const devicePixelRatio = window.devicePixelRatio || 1;
    const targetWidth = containerWidth * devicePixelRatio;
    
    if (targetWidth <= 400) return 'w=400';
    if (targetWidth <= 800) return 'w=800';
    if (targetWidth <= 1200) return 'w=1200';
    if (targetWidth <= 1600) return 'w=1600';
    return 'w=2000';
  }

  // Keyboard Detection (for mobile)
  private detectKeyboard(): void {
    const initialViewportHeight = window.innerHeight;
    
    fromEvent(window, 'resize')
      .pipe(
        debounceTime(100),
        map(() => window.innerHeight),
        distinctUntilChanged()
      )
      .subscribe(currentHeight => {
        const heightDifference = initialViewportHeight - currentHeight;
        const isKeyboardOpen = heightDifference > 150; // Threshold for keyboard detection
        this.isKeyboardOpen$.next(isKeyboardOpen);
      });
  }

  // Initialize Event Listeners
  private initializeListeners(): void {
    // Resize listener
    fromEvent(window, 'resize')
      .pipe(debounceTime(250))
      .subscribe(() => {
        this.deviceInfo$.next(this.getDeviceInfo());
        this.viewportBreakpoints$.next(this.getViewportBreakpoints());
      });

    // Orientation change listener
    fromEvent(window, 'orientationchange')
      .pipe(debounceTime(500))
      .subscribe(() => {
        this.deviceInfo$.next(this.getDeviceInfo());
        this.viewportBreakpoints$.next(this.getViewportBreakpoints());
      });

    // Keyboard detection for mobile
    if (this.isMobileDevice()) {
      this.detectKeyboard();
    }

    // Add CSS custom properties for safe area
    this.updateSafeAreaProperties();
  }

  // Update CSS Custom Properties for Safe Area
  private updateSafeAreaProperties(): void {
    const root = document.documentElement;
    
    // Set safe area inset properties
    root.style.setProperty('--sat', 'env(safe-area-inset-top)');
    root.style.setProperty('--sar', 'env(safe-area-inset-right)');
    root.style.setProperty('--sab', 'env(safe-area-inset-bottom)');
    root.style.setProperty('--sal', 'env(safe-area-inset-left)');
  }

  // Utility Methods
  isCurrentBreakpoint(breakpoint: keyof ViewportBreakpoints): boolean {
    return this.viewportBreakpoints$.value[breakpoint];
  }

  getCurrentBreakpoint(): string {
    const breakpoints = this.viewportBreakpoints$.value;
    
    if (breakpoints.xxl) return 'xxl';
    if (breakpoints.xl) return 'xl';
    if (breakpoints.lg) return 'lg';
    if (breakpoints.md) return 'md';
    if (breakpoints.sm) return 'sm';
    return 'xs';
  }

  // Performance Monitoring
  measurePerformance(name: string, fn: () => void): number {
    const start = performance.now();
    fn();
    const end = performance.now();
    const duration = end - start;
    
    console.log(`${name} took ${duration.toFixed(2)} milliseconds`);
    return duration;
  }

  // Memory Management
  cleanupEventListeners(): void {
    // This would be called in component ngOnDestroy
    // Implementation depends on specific use case
  }
}
