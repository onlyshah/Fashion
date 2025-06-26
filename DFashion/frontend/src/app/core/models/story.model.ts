export interface Story {
  _id: string;
  user: {
    _id: string;
    username: string;
    fullName: string;
    avatar: string;
    socialStats: {
      followersCount: number;
    };
  };
  media: {
    type: 'image' | 'video';
    url: string;
    thumbnail?: string;
    duration?: number;
  };
  caption?: string;
  products: StoryProduct[];
  viewers: StoryViewer[];
  likes: StoryLike[];
  shares: StoryShare[];
  isActive: boolean;
  expiresAt: Date;
  analytics: {
    views: number;
    likes: number;
    shares: number;
    productClicks: number;
    purchases: number;
  };
  settings: {
    allowComments: boolean;
    allowSharing: boolean;
    visibility: 'public' | 'followers' | 'private';
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface StoryProduct {
  product: {
    _id: string;
    name: string;
    price: number;
    images: { url: string; isPrimary: boolean }[];
    brand: string;
  };
  position: {
    x: number;
    y: number;
  };
  size?: string;
  color?: string;
}

export interface StoryViewer {
  user: {
    _id: string;
    username: string;
    fullName: string;
    avatar: string;
  };
  viewedAt: Date;
}

export interface StoryLike {
  user: string;
  likedAt: Date;
}

export interface StoryShare {
  user: string;
  sharedAt: Date;
}

export interface StoryGroup {
  user: {
    _id: string;
    username: string;
    fullName: string;
    avatar: string;
    socialStats: {
      followersCount: number;
    };
  };
  stories: Story[];
}

export interface StoriesResponse {
  storyGroups: StoryGroup[];
}

export interface CreateStoryRequest {
  media: {
    type: 'image' | 'video';
    url: string;
    thumbnail?: string;
    duration?: number;
  };
  caption?: string;
  products?: StoryProduct[];
  settings?: {
    allowComments: boolean;
    allowSharing: boolean;
    visibility: 'public' | 'followers' | 'private';
  };
}
