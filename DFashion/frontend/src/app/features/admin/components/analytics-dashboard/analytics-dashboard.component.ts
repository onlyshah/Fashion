import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

import { AnalyticsService, AnalyticsData, SocialMediaMetrics, SearchEngineData, CompetitorAnalysis } from '../../../../core/services/analytics.service';

@Component({
  selector: 'app-analytics-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './analytics-dashboard.component.html',
  styleUrls: ['./analytics-dashboard.component.scss']
})
export class AnalyticsDashboardComponent implements OnInit, OnDestroy {
  analyticsData: AnalyticsData | null = null;
  socialMetrics: SocialMediaMetrics[] = [];
  searchData: SearchEngineData | null = null;
  competitorData: CompetitorAnalysis[] = [];
  
  isLoading = true;
  selectedTab = 'overview';
  selectedDateRange = '30d';
  
  // Scraping inputs
  instagramUsername = '';
  googleTrendsKeyword = '';
  isScrapingInstagram = false;
  isScrapingTrends = false;
  
  private subscriptions: Subscription[] = [];

  constructor(private analyticsService: AnalyticsService) {}

  ngOnInit() {
    this.loadAllAnalytics();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  loadAllAnalytics() {
    this.isLoading = true;
    
    // Load overview analytics
    this.subscriptions.push(
      this.analyticsService.getAnalyticsOverview().subscribe({
        next: (data) => {
          this.analyticsData = data;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading analytics overview:', error);
          this.isLoading = false;
        }
      })
    );

    // Load social media metrics
    this.subscriptions.push(
      this.analyticsService.getSocialMediaMetrics().subscribe({
        next: (data) => {
          this.socialMetrics = data;
        },
        error: (error) => {
          console.error('Error loading social metrics:', error);
        }
      })
    );

    // Load search engine data
    this.subscriptions.push(
      this.analyticsService.getSearchEngineData().subscribe({
        next: (data) => {
          this.searchData = data;
        },
        error: (error) => {
          console.error('Error loading search data:', error);
        }
      })
    );

    // Load competitor analysis
    this.subscriptions.push(
      this.analyticsService.getCompetitorAnalysis().subscribe({
        next: (data) => {
          this.competitorData = data;
        },
        error: (error) => {
          console.error('Error loading competitor data:', error);
        }
      })
    );
  }

  selectTab(tab: string) {
    this.selectedTab = tab;
  }

  changeDateRange(range: string) {
    this.selectedDateRange = range;
    this.loadAllAnalytics();
  }

  // Social Media Scraping
  scrapeInstagramData() {
    if (!this.instagramUsername.trim()) return;
    
    this.isScrapingInstagram = true;
    this.subscriptions.push(
      this.analyticsService.scrapeInstagramData(this.instagramUsername).subscribe({
        next: (data) => {
          console.log('Instagram data scraped:', data);
          this.isScrapingInstagram = false;
          // Update social metrics with scraped data
          this.loadAllAnalytics();
        },
        error: (error) => {
          console.error('Error scraping Instagram:', error);
          this.isScrapingInstagram = false;
        }
      })
    );
  }

  scrapeGoogleTrends() {
    if (!this.googleTrendsKeyword.trim()) return;
    
    this.isScrapingTrends = true;
    this.subscriptions.push(
      this.analyticsService.scrapeGoogleTrends(this.googleTrendsKeyword).subscribe({
        next: (data) => {
          console.log('Google Trends data scraped:', data);
          this.isScrapingTrends = false;
          // Update search data with scraped trends
          this.loadAllAnalytics();
        },
        error: (error) => {
          console.error('Error scraping Google Trends:', error);
          this.isScrapingTrends = false;
        }
      })
    );
  }

  // Export Functions
  exportData(format: 'csv' | 'excel' | 'pdf') {
    const dateRange = this.getDateRange();
    this.subscriptions.push(
      this.analyticsService.exportAnalyticsData(format, dateRange).subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `analytics-${format}-${new Date().toISOString().split('T')[0]}.${format}`;
          link.click();
          window.URL.revokeObjectURL(url);
        },
        error: (error) => {
          console.error('Error exporting data:', error);
        }
      })
    );
  }

  private getDateRange() {
    const end = new Date();
    const start = new Date();
    
    switch (this.selectedDateRange) {
      case '7d':
        start.setDate(start.getDate() - 7);
        break;
      case '30d':
        start.setDate(start.getDate() - 30);
        break;
      case '90d':
        start.setDate(start.getDate() - 90);
        break;
      default:
        start.setDate(start.getDate() - 30);
    }
    
    return { start, end };
  }

  // Utility Functions
  formatNumber(num: number): string {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  }

  formatPercentage(value: number): string {
    return value.toFixed(1) + '%';
  }

  getTrendIcon(trend: 'up' | 'down' | 'stable'): string {
    switch (trend) {
      case 'up': return 'fas fa-arrow-up';
      case 'down': return 'fas fa-arrow-down';
      case 'stable': return 'fas fa-minus';
      default: return 'fas fa-minus';
    }
  }

  getTrendColor(trend: 'up' | 'down' | 'stable'): string {
    switch (trend) {
      case 'up': return '#28a745';
      case 'down': return '#dc3545';
      case 'stable': return '#6c757d';
      default: return '#6c757d';
    }
  }

  getSentimentIcon(sentiment: 'positive' | 'negative' | 'neutral'): string {
    switch (sentiment) {
      case 'positive': return 'fas fa-smile';
      case 'negative': return 'fas fa-frown';
      case 'neutral': return 'fas fa-meh';
      default: return 'fas fa-meh';
    }
  }

  getSentimentColor(sentiment: 'positive' | 'negative' | 'neutral'): string {
    switch (sentiment) {
      case 'positive': return '#28a745';
      case 'negative': return '#dc3545';
      case 'neutral': return '#ffc107';
      default: return '#6c757d';
    }
  }

  getEngagementLevel(rate: number): string {
    if (rate >= 8) return 'Excellent';
    if (rate >= 6) return 'Good';
    if (rate >= 4) return 'Average';
    if (rate >= 2) return 'Poor';
    return 'Very Poor';
  }

  getEngagementColor(rate: number): string {
    if (rate >= 8) return '#28a745';
    if (rate >= 6) return '#20c997';
    if (rate >= 4) return '#ffc107';
    if (rate >= 2) return '#fd7e14';
    return '#dc3545';
  }

  trackByIndex(index: number): number {
    return index;
  }
}
