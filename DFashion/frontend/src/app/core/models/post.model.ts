export interface Post {
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
  caption: string;
  media: PostMedia[];
  products: PostProduct[];
  hashtags: string[];
  mentions: string[];
  likes: PostLike[];
  comments: PostComment[];
  shares: PostShare[];
  saves: PostSave[];
  isActive: boolean;
  visibility: 'public' | 'followers' | 'private';
  analytics: {
    views: number;
    likes: number;
    comments: number;
    shares: number;
    saves: number;
    productClicks: number;
    purchases: number;
  };
  settings: {
    allowComments: boolean;
    allowSharing: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface PostMedia {
  type: 'image' | 'video';
  url: string;
  thumbnail?: string;
  alt?: string;
}

export interface PostProduct {
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

export interface PostLike {
  user: string;
  likedAt: Date;
}

export interface PostComment {
  _id: string;
  user: {
    _id: string;
    username: string;
    fullName: string;
    avatar: string;
  };
  text: string;
  likes: string[];
  replies: PostCommentReply[];
  createdAt: Date;
}

export interface PostCommentReply {
  _id: string;
  user: {
    _id: string;
    username: string;
    fullName: string;
    avatar: string;
  };
  text: string;
  createdAt: Date;
}

export interface PostShare {
  user: string;
  sharedAt: Date;
}

export interface PostSave {
  user: string;
  savedAt: Date;
}

export interface PostsResponse {
  posts: Post[];
  pagination: {
    current: number;
    pages: number;
    total: number;
  };
}

export interface CreatePostRequest {
  caption: string;
  media: PostMedia[];
  products?: PostProduct[];
  hashtags?: string[];
  mentions?: string[];
  visibility?: 'public' | 'followers' | 'private';
  settings?: {
    allowComments: boolean;
    allowSharing: boolean;
  };
}
