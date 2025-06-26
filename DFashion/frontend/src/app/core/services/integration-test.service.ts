import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { DataFlowService } from './data-flow.service';
import { RecommendationService } from './recommendation.service';
import { AnalyticsService } from './analytics.service';
import { MobileOptimizationService } from './mobile-optimization.service';

export interface IntegrationTestResult {
  testName: string;
  passed: boolean;
  message: string;
  duration: number;
  data?: any;
}

@Injectable({
  providedIn: 'root'
})
export class IntegrationTestService {
  constructor(
    private dataFlowService: DataFlowService,
    private recommendationService: RecommendationService,
    private analyticsService: AnalyticsService,
    private mobileService: MobileOptimizationService
  ) {}

  runAllTests(): Observable<IntegrationTestResult[]> {
    const tests = [
      this.testDataFlowService(),
      this.testRecommendationService(),
      this.testAnalyticsService(),
      this.testMobileOptimization(),
      this.testUserInteractions(),
      this.testResponsiveDesign()
    ];

    return new Promise(async (resolve) => {
      const results: IntegrationTestResult[] = [];
      
      for (const test of tests) {
        try {
          const result = await test.toPromise();
          results.push(result);
        } catch (error) {
          results.push({
            testName: 'Unknown Test',
            passed: false,
            message: `Test failed: ${error}`,
            duration: 0
          });
        }
      }
      
      resolve(results);
    }) as any;
  }

  private testDataFlowService(): Observable<IntegrationTestResult> {
    const startTime = performance.now();
    
    return this.dataFlowService.getAppState$().pipe(
      map(state => {
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        const hasRequiredProperties = state && 
          typeof state.user !== 'undefined' &&
          typeof state.recommendations !== 'undefined' &&
          typeof state.userCounts !== 'undefined' &&
          typeof state.ui !== 'undefined';

        return {
          testName: 'Data Flow Service',
          passed: hasRequiredProperties,
          message: hasRequiredProperties ? 
            'Data flow service is working correctly' : 
            'Data flow service missing required properties',
          duration,
          data: state
        };
      }),
      catchError(error => of({
        testName: 'Data Flow Service',
        passed: false,
        message: `Data flow service error: ${error.message}`,
        duration: performance.now() - startTime
      }))
    );
  }

  private testRecommendationService(): Observable<IntegrationTestResult> {
    const startTime = performance.now();
    
    return this.recommendationService.getSuggestedProducts(undefined, 5).pipe(
      map(products => {
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        const isValid = Array.isArray(products) && products.length > 0;
        
        return {
          testName: 'Recommendation Service',
          passed: isValid,
          message: isValid ? 
            `Loaded ${products.length} recommended products` : 
            'Failed to load recommended products',
          duration,
          data: { productCount: products.length }
        };
      }),
      catchError(error => of({
        testName: 'Recommendation Service',
        passed: false,
        message: `Recommendation service error: ${error.message}`,
        duration: performance.now() - startTime
      }))
    );
  }

  private testAnalyticsService(): Observable<IntegrationTestResult> {
    const startTime = performance.now();
    
    return this.analyticsService.getAnalyticsOverview().pipe(
      map(analytics => {
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        const hasRequiredData = analytics && 
          typeof analytics.totalUsers === 'number' &&
          typeof analytics.totalRevenue === 'number' &&
          Array.isArray(analytics.topCategories);

        return {
          testName: 'Analytics Service',
          passed: hasRequiredData,
          message: hasRequiredData ? 
            'Analytics service providing valid data' : 
            'Analytics service missing required data',
          duration,
          data: {
            totalUsers: analytics?.totalUsers,
            totalRevenue: analytics?.totalRevenue,
            categoriesCount: analytics?.topCategories?.length
          }
        };
      }),
      catchError(error => of({
        testName: 'Analytics Service',
        passed: false,
        message: `Analytics service error: ${error.message}`,
        duration: performance.now() - startTime
      }))
    );
  }

  private testMobileOptimization(): Observable<IntegrationTestResult> {
    const startTime = performance.now();
    
    return this.mobileService.getDeviceInfo$().pipe(
      map(deviceInfo => {
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        const hasValidInfo = deviceInfo && 
          typeof deviceInfo.isMobile === 'boolean' &&
          typeof deviceInfo.screenWidth === 'number' &&
          typeof deviceInfo.orientation === 'string';

        return {
          testName: 'Mobile Optimization',
          passed: hasValidInfo,
          message: hasValidInfo ? 
            `Device detected: ${deviceInfo.isMobile ? 'Mobile' : 'Desktop'} (${deviceInfo.screenWidth}x${deviceInfo.screenHeight})` : 
            'Mobile optimization service not providing valid device info',
          duration,
          data: deviceInfo
        };
      }),
      catchError(error => of({
        testName: 'Mobile Optimization',
        passed: false,
        message: `Mobile optimization error: ${error.message}`,
        duration: performance.now() - startTime
      }))
    );
  }

  private testUserInteractions(): Observable<IntegrationTestResult> {
    const startTime = performance.now();
    
    // Test tracking user actions
    try {
      this.dataFlowService.trackUserAction('test_action', { testData: 'integration_test' });
      this.dataFlowService.performSearch('test query', 'test category');
      this.dataFlowService.trackProductView('test-product-id', 'test-category', 5);
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      return of({
        testName: 'User Interactions',
        passed: true,
        message: 'User interaction tracking working correctly',
        duration,
        data: { actionsTracked: 3 }
      });
    } catch (error) {
      return of({
        testName: 'User Interactions',
        passed: false,
        message: `User interaction tracking error: ${error}`,
        duration: performance.now() - startTime
      });
    }
  }

  private testResponsiveDesign(): Observable<IntegrationTestResult> {
    const startTime = performance.now();
    
    return this.mobileService.getViewportBreakpoints$().pipe(
      map(breakpoints => {
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        const hasValidBreakpoints = breakpoints && 
          typeof breakpoints.xs === 'boolean' &&
          typeof breakpoints.sm === 'boolean' &&
          typeof breakpoints.md === 'boolean' &&
          typeof breakpoints.lg === 'boolean' &&
          typeof breakpoints.xl === 'boolean';

        const currentBreakpoint = this.mobileService.getCurrentBreakpoint();
        
        return {
          testName: 'Responsive Design',
          passed: hasValidBreakpoints,
          message: hasValidBreakpoints ? 
            `Responsive breakpoints working, current: ${currentBreakpoint}` : 
            'Responsive breakpoints not working correctly',
          duration,
          data: { breakpoints, currentBreakpoint }
        };
      }),
      catchError(error => of({
        testName: 'Responsive Design',
        passed: false,
        message: `Responsive design error: ${error.message}`,
        duration: performance.now() - startTime
      }))
    );
  }

  // Performance Tests
  testPerformance(): Observable<IntegrationTestResult> {
    const startTime = performance.now();
    
    // Test multiple operations
    const operations = [
      () => this.dataFlowService.getAppState$().toPromise(),
      () => this.recommendationService.getSuggestedProducts(undefined, 3).toPromise(),
      () => this.analyticsService.getAnalyticsOverview().toPromise(),
      () => this.mobileService.getDeviceInfo$().toPromise()
    ];

    return new Promise(async (resolve) => {
      const results = [];
      
      for (const operation of operations) {
        const opStart = performance.now();
        try {
          await operation();
          results.push(performance.now() - opStart);
        } catch (error) {
          results.push(-1); // Error indicator
        }
      }
      
      const endTime = performance.now();
      const totalDuration = endTime - startTime;
      const averageTime = results.filter(r => r > 0).reduce((a, b) => a + b, 0) / results.length;
      
      const passed = averageTime < 1000 && totalDuration < 5000; // Less than 1s average, 5s total
      
      resolve({
        testName: 'Performance Test',
        passed,
        message: passed ? 
          `Performance acceptable: ${averageTime.toFixed(2)}ms average` : 
          `Performance issues: ${averageTime.toFixed(2)}ms average`,
        duration: totalDuration,
        data: { averageTime, totalDuration, operationTimes: results }
      });
    }) as any;
  }

  // Generate Test Report
  generateTestReport(results: IntegrationTestResult[]): string {
    const passedTests = results.filter(r => r.passed).length;
    const totalTests = results.length;
    const totalDuration = results.reduce((sum, r) => sum + r.duration, 0);
    
    let report = `
=== DFashion Integration Test Report ===
Date: ${new Date().toISOString()}
Tests Passed: ${passedTests}/${totalTests}
Total Duration: ${totalDuration.toFixed(2)}ms
Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%

=== Test Results ===
`;

    results.forEach(result => {
      const status = result.passed ? '✅ PASS' : '❌ FAIL';
      report += `
${status} ${result.testName}
Duration: ${result.duration.toFixed(2)}ms
Message: ${result.message}
`;
      
      if (result.data) {
        report += `Data: ${JSON.stringify(result.data, null, 2)}\n`;
      }
    });

    return report;
  }
}
