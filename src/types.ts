export type UserRole = 'buyer' | 'seller' | 'admin';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  studentId?: string;
  studentIdImageUrl?: string;
  verificationStatus?: 'pending' | 'verified' | 'rejected';
  rejectionReason?: string;
  avatarUrl?: string;
  isVerified?: boolean;
  createdAt: string;
}

export interface Product {
  id: string;
  sellerId: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrls: string[];
  stockStatus: 'in_stock' | 'out_of_stock';
  createdAt: string;
  updatedAt?: string;
}

export interface Order {
  id: string;
  buyerId: string;
  sellerId: string;
  productId: string;
  quantity: number;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
}

export interface Review {
  id: string;
  productId: string;
  buyerId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  timestamp: string;
  read: boolean;
}

export interface Chat {
  id: string;
  participants: string[];
  productId: string;
  lastMessage?: string;
  lastMessageAt: string;
  updatedAt: string;
}

export type SortOption = 'relevance' | 'price_low' | 'price_high' | 'newest';
