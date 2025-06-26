import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface AnalyticsData {
  totalUsers: number;
  activeUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  conversionRate: number;
  averageOrderValue: number;
  topCategories: Array<{
    name: string;
    count: number;
    revenue: number;
  }>;
  userGrowth: Array<{
    date: string;
    users: number;
    orders: number;
    revenue: number;
  }>;
  searchTrends: Array<{
    query: string;
    count: number;
    trend: 'up' | 'down' | 'stable';
  }>;
  engagementMetrics: {
    pageViews: number;
    sessionDuration: number;
    bounceRate: number;
    clickThroughRate: number;
  };
}

export interface SocialMediaMetrics {
  platform: string;
  followers: number;
  engagement: number;
  reach: number;
  impressions: number;
  mentions: number;
  sentiment: 'positive' | 'negative' | 'neutral';
  topPosts: Array<{
    id: string;
    content: string;
    likes: number;
    shares: number;
    comments: number;
  }>;
}

export interface SearchEngineData {
  keywords: Array<{
    keyword: string;
    position: number;
    searchVolume: number;
    difficulty: number;
    trend: 'up' | 'down' | 'stable';
  }>;
  organicTraffic: number;
  clickThroughRate: number;
  averagePosition: number;
  impressions: number;
  clicks: number;
}

export interface CompetitorAnalysis {
  competitor: string;
  marketShare: number;
  priceComparison: number;
  trafficEstimate: number;
  topKeywords: string[];
  socialFollowing: number;
  engagementRate: number;
}

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private apiUrl = 'http://localhost:5000/api';
  private analyticsData$ = new BehaviorSubject<AnalyticsData | null>(null);

  constructor(private http: HttpClient) {}

  // Core Analytics
  getAnalyticsOverview(): Observable<AnalyticsData> {
    return this.http.get<any>(`${this.apiUrl}/analytics/overview`)
      .pipe(
        map(response => response.success ? response.data : this.getFallbackAnalytics()),
        catchError(error => {
          console.error('Error fetching analytics:', error);
          return [this.getFallbackAnalytics()];
        })
      );
  }

  // Social Media Analytics
  getSocialMediaMetrics(): Observable<SocialMediaMetrics[]> {
    return this.http.get<any>(`${this.apiUrl}/analytics/social-media`)
      .pipe(
        map(response => response.success ? response.data : this.getFallbackSocialMetrics()),
        catchError(error => {
          console.error('Error fetching social media metrics:', error);
          return [this.getFallbackSocialMetrics()];
        })
      );
  }

  // Search Engine Analytics
  getSearchEngineData(): Observable<SearchEngineData> {
    return this.http.get<any>(`${this.apiUrl}/analytics/search-engine`)
      .pipe(
        map(response => response.success ? response.data : this.getFallbackSearchData()),
        catchError(error => {
          console.error('Error fetching search engine data:', error);
          return [this.getFallbackSearchData()];
        })
      );
  }

  // Competitor Analysis
  getCompetitorAnalysis(): Observable<CompetitorAnalysis[]> {
    return this.http.get<any>(`${this.apiUrl}/analytics/competitors`)
      .pipe(
        map(response => response.success ? response.data : this.getFallbackCompetitorData()),
        catchError(error => {
          console.error('Error fetching competitor analysis:', error);
          return [this.getFallbackCompetitorData()];
        })
      );
  }

  // Real-time Data Scraping
  scrapeInstagramData(username: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/analytics/scrape/instagram`, { username })
      .pipe(
        map(response => response.success ? response.data : null),
        catchError(error => {
          console.error('Error scraping Instagram data:', error);
          return [null];
        })
      );
  }

  scrapeGoogleTrends(keyword: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/analytics/scrape/google-trends`, { keyword })
      .pipe(
        map(response => response.success ? response.data : null),
        catchError(error => {
          console.error('Error scraping Google Trends:', error);
          return [null];
        })
      );
  }

  // User Behavior Analytics
  trackUserBehavior(event: string, data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/analytics/track`, { event, data, timestamp: new Date() })
      .pipe(
        catchError(error => {
          console.error('Error tracking user behavior:', error);
          return [];
        })
      );
  }

  // Export Analytics Data
  exportAnalyticsData(format: 'csv' | 'excel' | 'pdf', dateRange: { start: Date; end: Date }): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/analytics/export`, 
      { format, dateRange }, 
      { responseType: 'blob' }
    ).pipe(
      catchError(error => {
        console.error('Error exporting analytics data:', error);
        throw error;
      })
    );
  }

  // Fallback Data Methods
  private getFallbackAnalytics(): AnalyticsData {
    return {
      totalUsers: 15847,
      activeUsers: 3421,
      totalProducts: 1250,
      totalOrders: 2847,
      totalRevenue: 1247500,
      conversionRate: 3.2,
      averageOrderValue: 438,
      topCategories: [
        { name: 'Women', count: 1247, revenue: 547200 },
        { name: 'Men', count: 892, revenue: 389400 },
        { name: 'Accessories', count: 634, revenue: 278100 },
        { name: 'Footwear', count: 521, revenue: 228700 },
        { name: 'Beauty', count: 387, revenue: 169800 }
      ],
      userGrowth: this.generateGrowthData(),
      searchTrends: [
        { query: 'summer dress', count: 1247, trend: 'up' },
        { query: 'casual wear', count: 892, trend: 'stable' },
        { query: 'ethnic wear', count: 634, trend: 'up' },
        { query: 'formal shoes', count: 521, trend: 'down' },
        { query: 'handbags', count: 387, trend: 'up' }
      ],
      engagementMetrics: {
        pageViews: 45672,
        sessionDuration: 4.2,
        bounceRate: 32.5,
        clickThroughRate: 2.8
      }
    };
  }

  private getFallbackSocialMetrics(): SocialMediaMetrics[] {
    return [
      {
        platform: 'Instagram',
        followers: 125000,
        engagement: 8.5,
        reach: 89000,
        impressions: 234000,
        mentions: 1247,
        sentiment: 'positive',
        topPosts: [
          { id: '1', content: 'Summer collection launch', likes: 2847, shares: 234, comments: 156 },
          { id: '2', content: 'Behind the scenes', likes: 1923, shares: 189, comments: 98 },
          { id: '3', content: 'Customer spotlight', likes: 1654, shares: 145, comments: 87 }
        ]
      },
      {
        platform: 'Facebook',
        followers: 89000,
        engagement: 6.2,
        reach: 67000,
        impressions: 178000,
        mentions: 892,
        sentiment: 'positive',
        topPosts: [
          { id: '1', content: 'New arrivals showcase', likes: 1847, shares: 167, comments: 123 },
          { id: '2', content: 'Style tips and tricks', likes: 1234, shares: 134, comments: 89 },
          { id: '3', content: 'Flash sale announcement', likes: 987, shares: 98, comments: 67 }
        ]
      },
      {
        platform: 'Twitter',
        followers: 45000,
        engagement: 4.8,
        reach: 34000,
        impressions: 89000,
        mentions: 567,
        sentiment: 'neutral',
        topPosts: [
          { id: '1', content: 'Fashion week highlights', likes: 892, shares: 234, comments: 67 },
          { id: '2', content: 'Sustainable fashion tips', likes: 634, shares: 156, comments: 45 },
          { id: '3', content: 'Trend predictions', likes: 521, shares: 123, comments: 34 }
        ]
      }
    ];
  }

  private getFallbackSearchData(): SearchEngineData {
    return {
      keywords: [
        { keyword: 'online fashion store', position: 3, searchVolume: 12000, difficulty: 65, trend: 'up' },
        { keyword: 'women clothing', position: 7, searchVolume: 8900, difficulty: 72, trend: 'stable' },
        { keyword: 'ethnic wear online', position: 5, searchVolume: 5600, difficulty: 58, trend: 'up' },
        { keyword: 'designer clothes', position: 12, searchVolume: 4300, difficulty: 78, trend: 'down' },
        { keyword: 'fashion accessories', position: 8, searchVolume: 3200, difficulty: 62, trend: 'stable' }
      ],
      organicTraffic: 23456,
      clickThroughRate: 3.2,
      averagePosition: 7.2,
      impressions: 156789,
      clicks: 5023
    };
  }

  private getFallbackCompetitorData(): CompetitorAnalysis[] {
    return [
      {
        competitor: 'Myntra',
        marketShare: 28.5,
        priceComparison: 105,
        trafficEstimate: 2500000,
        topKeywords: ['online fashion', 'ethnic wear', 'designer clothes'],
        socialFollowing: 1200000,
        engagementRate: 6.8
      },
      {
        competitor: 'Ajio',
        marketShare: 18.2,
        priceComparison: 98,
        trafficEstimate: 1800000,
        topKeywords: ['trendy fashion', 'casual wear', 'footwear'],
        socialFollowing: 890000,
        engagementRate: 5.4
      },
      {
        competitor: 'Nykaa Fashion',
        marketShare: 12.7,
        priceComparison: 112,
        trafficEstimate: 1200000,
        topKeywords: ['beauty fashion', 'luxury brands', 'accessories'],
        socialFollowing: 650000,
        engagementRate: 7.2
      }
    ];
  }

  private generateGrowthData() {
    const data = [];
    const today = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      data.push({
        date: date.toISOString().split('T')[0],
        users: Math.floor(Math.random() * 200) + 100,
        orders: Math.floor(Math.random() * 50) + 20,
        revenue: Math.floor(Math.random() * 10000) + 5000
      });
    }
    
    return data;
  }

  // Update analytics data locally
  updateAnalyticsData(data: AnalyticsData): void {
    this.analyticsData$.next(data);
  }

  // Get current analytics data
  getCurrentAnalyticsData(): Observable<AnalyticsData | null> {
    return this.analyticsData$.asObservable();
  }
}
