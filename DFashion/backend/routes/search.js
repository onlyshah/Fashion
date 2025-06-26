const express = require('express');
const router = express.Router();
const { auth, optionalAuth } = require('../middleware/auth');
const searchEngine = require('../services/searchEngine');
const { SearchHistory, TrendingSearch, SearchSuggestion } = require('../models/SearchHistory');
const Product = require('../models/Product');

// @route   GET /api/search
// @desc    Advanced product search with filters and analytics
// @access  Public
router.get('/', optionalAuth, async (req, res) => {
  try {
    const {
      q: query,
      page = 1,
      limit = 12,
      sortBy = 'relevance',
      sortOrder = 'desc',
      category,
      subcategory,
      brand,
      minPrice,
      maxPrice,
      rating,
      inStock,
      onSale,
      colors,
      sizes,
      tags
    } = req.query;

    const userId = req.user ? req.user.id : null;

    // Prepare filters
    const filters = {
      category,
      subcategory,
      brand,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      rating: rating ? parseFloat(rating) : undefined,
      inStock: inStock === 'true',
      onSale: onSale === 'true',
      colors: colors ? colors.split(',') : undefined,
      sizes: sizes ? sizes.split(',') : undefined,
      tags: tags ? tags.split(',') : undefined
    };

    // Remove undefined values
    Object.keys(filters).forEach(key => {
      if (filters[key] === undefined) {
        delete filters[key];
      }
    });

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sortBy,
      sortOrder,
      userId
    };

    const searchResults = await searchEngine.searchProducts(query, filters, options);

    res.json({
      success: true,
      ...searchResults
    });

  } catch (error) {
    console.error('Advanced search error:', error);
    res.status(500).json({
      success: false,
      message: 'Search failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/search/suggestions
// @desc    Get search suggestions and autocomplete
// @access  Public
router.get('/suggestions', optionalAuth, async (req, res) => {
  try {
    const { q: query, limit = 10, type = 'all' } = req.query;
    const userId = req.user ? req.user.id : null;

    let suggestions = [];

    if (type === 'all' || type === 'autocomplete') {
      const autocompleteSuggestions = await searchEngine.getSearchSuggestions(query, parseInt(limit));
      suggestions.push(...autocompleteSuggestions);
    }

    if (type === 'all' || type === 'personalized') {
      if (userId) {
        const personalizedSuggestions = await searchEngine.getPersonalizedSuggestions(userId, 5);
        suggestions.push(...personalizedSuggestions);
      }
    }

    if (type === 'all' || type === 'trending') {
      const trendingSuggestions = await searchEngine.getTrendingSearches(5);
      suggestions.push(...trendingSuggestions.map(t => ({
        text: t.query,
        type: 'trending',
        popularity: t.searches
      })));
    }

    // Remove duplicates and limit results
    const uniqueSuggestions = suggestions
      .filter((suggestion, index, self) => 
        index === self.findIndex(s => s.text === suggestion.text)
      )
      .slice(0, parseInt(limit));

    res.json({
      success: true,
      suggestions: uniqueSuggestions,
      query: query || ''
    });

  } catch (error) {
    console.error('Get search suggestions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch search suggestions'
    });
  }
});

// @route   GET /api/search/trending
// @desc    Get trending searches
// @access  Public
router.get('/trending', async (req, res) => {
  try {
    const { limit = 10, timeframe = '24h' } = req.query;
    
    const trendingSearches = await searchEngine.getTrendingSearches(
      parseInt(limit), 
      timeframe
    );

    res.json({
      success: true,
      trending: trendingSearches,
      timeframe,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Get trending searches error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch trending searches'
    });
  }
});

// @route   GET /api/search/history
// @desc    Get user's search history
// @access  Private
router.get('/history', auth, async (req, res) => {
  try {
    const { limit = 20, type = 'recent' } = req.query;
    const userId = req.user.id;
    
    const searchHistory = await SearchHistory.findOne({ user: userId });
    
    if (!searchHistory) {
      return res.json({
        success: true,
        searches: [],
        analytics: {
          totalSearches: 0,
          uniqueQueries: 0
        }
      });
    }

    let searches = [];
    
    if (type === 'recent') {
      searches = searchHistory.searches
        .slice(0, parseInt(limit))
        .map(search => ({
          query: search.query,
          timestamp: search.timestamp,
          resultsCount: search.results.count,
          filters: search.filters
        }));
    } else if (type === 'popular') {
      searches = searchHistory.popularQueries
        .slice(0, parseInt(limit))
        .map(pq => ({
          query: pq.query,
          count: pq.count,
          lastSearched: pq.lastSearched,
          avgResultsCount: pq.avgResultsCount
        }));
    }

    res.json({
      success: true,
      searches,
      analytics: searchHistory.analytics,
      preferences: searchHistory.preferences
    });

  } catch (error) {
    console.error('Get search history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch search history'
    });
  }
});

// @route   DELETE /api/search/history
// @desc    Clear user's search history
// @access  Private
router.delete('/history', auth, async (req, res) => {
  try {
    const { type = 'all' } = req.query;
    const userId = req.user.id;
    
    const updateQuery = {};
    
    if (type === 'all') {
      updateQuery.$set = { 
        searches: [],
        popularQueries: [],
        'analytics.totalSearches': 0,
        'analytics.uniqueQueries': 0
      };
    } else if (type === 'recent') {
      updateQuery.$set = { searches: [] };
    } else if (type === 'popular') {
      updateQuery.$set = { popularQueries: [] };
    }
    
    await SearchHistory.findOneAndUpdate(
      { user: userId },
      updateQuery,
      { upsert: true }
    );

    res.json({
      success: true,
      message: `Search history (${type}) cleared successfully`
    });

  } catch (error) {
    console.error('Clear search history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear search history'
    });
  }
});

// @route   POST /api/search/track
// @desc    Track search interactions and analytics
// @access  Private
router.post('/track', auth, async (req, res) => {
  try {
    const { 
      searchQuery, 
      productId, 
      action, 
      position,
      metadata = {}
    } = req.body;
    const userId = req.user.id;
    
    if (!searchQuery || !action) {
      return res.status(400).json({
        success: false,
        message: 'Search query and action are required'
      });
    }
    
    // Find the user's search history
    let searchHistory = await SearchHistory.findOne({ user: userId });
    
    if (!searchHistory) {
      searchHistory = new SearchHistory({ user: userId });
    }
    
    // Find the recent search entry (within last hour)
    const recentSearch = searchHistory.searches.find(
      search => search.query === searchQuery && 
      Date.now() - search.timestamp.getTime() < 3600000
    );
    
    if (recentSearch) {
      // Track the interaction
      switch (action) {
        case 'click':
          recentSearch.results.clicked.push({
            productId,
            position: position || 0,
            clickedAt: new Date()
          });
          break;
          
        case 'purchase':
          recentSearch.results.purchased.push({
            productId,
            purchasedAt: new Date()
          });
          break;
          
        case 'view_duration':
          recentSearch.metadata.duration = metadata.duration || 0;
          break;
          
        case 'filter_change':
          recentSearch.metadata.refinements = (recentSearch.metadata.refinements || 0) + 1;
          break;
      }
      
      await searchHistory.save();
    }

    res.json({
      success: true,
      message: 'Search interaction tracked successfully'
    });

  } catch (error) {
    console.error('Track search interaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to track search interaction'
    });
  }
});

// @route   GET /api/search/analytics
// @desc    Get search analytics for admin/vendor dashboard
// @access  Private (Admin/Vendor)
router.get('/analytics', auth, async (req, res) => {
  try {
    const { timeframe = '7d', limit = 50 } = req.query;
    
    // Calculate date range
    const now = new Date();
    const timeframeMs = {
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000
    };
    
    const startDate = new Date(now.getTime() - timeframeMs[timeframe]);
    
    // Get trending searches
    const trendingSearches = await TrendingSearch.find({
      lastUpdated: { $gte: startDate }
    })
    .sort({ 'metrics.trendingScore': -1 })
    .limit(parseInt(limit))
    .select('query metrics');
    
    // Get search volume statistics
    const searchStats = await SearchHistory.aggregate([
      {
        $match: {
          'searches.timestamp': { $gte: startDate }
        }
      },
      {
        $unwind: '$searches'
      },
      {
        $match: {
          'searches.timestamp': { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          totalSearches: { $sum: 1 },
          uniqueQueries: { $addToSet: '$searches.query' },
          avgResultsCount: { $avg: '$searches.results.count' },
          totalClicks: { $sum: { $size: '$searches.results.clicked' } },
          totalPurchases: { $sum: { $size: '$searches.results.purchased' } }
        }
      },
      {
        $project: {
          totalSearches: 1,
          uniqueQueries: { $size: '$uniqueQueries' },
          avgResultsCount: { $round: ['$avgResultsCount', 2] },
          totalClicks: 1,
          totalPurchases: 1,
          clickThroughRate: {
            $round: [
              { $multiply: [{ $divide: ['$totalClicks', '$totalSearches'] }, 100] },
              2
            ]
          },
          conversionRate: {
            $round: [
              { $multiply: [{ $divide: ['$totalPurchases', '$totalSearches'] }, 100] },
              2
            ]
          }
        }
      }
    ]);

    res.json({
      success: true,
      analytics: {
        timeframe,
        period: {
          start: startDate.toISOString(),
          end: now.toISOString()
        },
        overview: searchStats[0] || {
          totalSearches: 0,
          uniqueQueries: 0,
          avgResultsCount: 0,
          totalClicks: 0,
          totalPurchases: 0,
          clickThroughRate: 0,
          conversionRate: 0
        },
        trendingSearches: trendingSearches.map(ts => ({
          query: ts.query,
          searches: ts.metrics.totalSearches,
          trendingScore: ts.metrics.trendingScore,
          growth: ts.metrics.searchesLast24h
        }))
      }
    });

  } catch (error) {
    console.error('Get search analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch search analytics'
    });
  }
});

module.exports = router;
