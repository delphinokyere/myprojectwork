import { UserProfile, Product, Review, Order, Chat, Message } from '../types';

const KEYS = {
  USERS: 'upsa_users',
  PRODUCTS: 'upsa_products',
  ORDERS: 'upsa_orders',
  REVIEWS: 'upsa_reviews',
  CHATS: 'upsa_chats',
  MESSAGES: 'upsa_messages',
  SESSION: 'upsa_session'
};

const getLocal = <T>(key: string): T[] => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};

const setLocal = <T>(key: string, data: T[]) => {
  localStorage.setItem(key, JSON.stringify(data));
};

export const storage = {
  // Users
  getUsers: async (): Promise<UserProfile[]> => {
    return getLocal<UserProfile>(KEYS.USERS);
  },
  getUser: async (uid: string): Promise<UserProfile | null> => {
    const users = getLocal<UserProfile>(KEYS.USERS);
    return users.find(u => u.uid === uid) || null;
  },
  saveUser: async (user: UserProfile) => {
    const users = getLocal<UserProfile>(KEYS.USERS);
    const index = users.findIndex(u => u.uid === user.uid);
    if (index >= 0) {
      users[index] = user;
    } else {
      users.push(user);
    }
    setLocal(KEYS.USERS, users);
  },
  updateUser: async (uid: string, updates: Partial<UserProfile>) => {
    const users = getLocal<UserProfile>(KEYS.USERS);
    const index = users.findIndex(u => u.uid === uid);
    if (index >= 0) {
      users[index] = { ...users[index], ...updates };
      setLocal(KEYS.USERS, users);
      
      // Update session if it's the current user
      const session = storage.getSession();
      if (session && session.uid === uid) {
        storage.setSession({ ...session, ...updates });
      }
    }
  },
  verifyUser: async (uid: string) => {
    await storage.updateUser(uid, { isVerified: true, verificationStatus: 'verified' });
  },
  rejectUser: async (uid: string, reason: string) => {
    await storage.updateUser(uid, { isVerified: false, verificationStatus: 'rejected', rejectionReason: reason });
  },
  submitForVerification: async (uid: string, imageUrl: string) => {
    await storage.updateUser(uid, { studentIdImageUrl: imageUrl, verificationStatus: 'pending' });
  },

  // Products
  getProducts: async (): Promise<Product[]> => {
    const products = getLocal<Product>(KEYS.PRODUCTS);
    return products.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },
  getProduct: async (id: string): Promise<Product | null> => {
    const products = getLocal<Product>(KEYS.PRODUCTS);
    return products.find(p => p.id === id) || null;
  },
  saveProduct: async (product: Product) => {
    const products = getLocal<Product>(KEYS.PRODUCTS);
    const index = products.findIndex(p => p.id === product.id);
    if (index >= 0) {
      products[index] = product;
    } else {
      products.push(product);
    }
    setLocal(KEYS.PRODUCTS, products);
  },
  updateProduct: async (id: string, updates: Partial<Product>) => {
    const products = getLocal<Product>(KEYS.PRODUCTS);
    const index = products.findIndex(p => p.id === id);
    if (index >= 0) {
      products[index] = { ...products[index], ...updates };
      setLocal(KEYS.PRODUCTS, products);
    }
  },
  deleteProduct: async (id: string) => {
    const products = getLocal<Product>(KEYS.PRODUCTS);
    const filtered = products.filter(p => p.id !== id);
    setLocal(KEYS.PRODUCTS, filtered);
  },

  // Orders
  getOrders: async (): Promise<Order[]> => {
    const orders = getLocal<Order>(KEYS.ORDERS);
    return orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },
  saveOrder: async (order: Order) => {
    const orders = getLocal<Order>(KEYS.ORDERS);
    orders.push(order);
    setLocal(KEYS.ORDERS, orders);
  },
  updateOrder: async (id: string, updates: Partial<Order>) => {
    const orders = getLocal<Order>(KEYS.ORDERS);
    const index = orders.findIndex(o => o.id === id);
    if (index >= 0) {
      orders[index] = { ...orders[index], ...updates };
      setLocal(KEYS.ORDERS, orders);
    }
  },
  deleteOrder: async (id: string) => {
    const orders = getLocal<Order>(KEYS.ORDERS);
    const filtered = orders.filter(o => o.id !== id);
    setLocal(KEYS.ORDERS, filtered);
  },
  getOrdersByBuyer: async (buyerId: string): Promise<Order[]> => {
    const orders = getLocal<Order>(KEYS.ORDERS);
    return orders
      .filter(o => o.buyerId === buyerId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },
  getOrdersBySeller: async (sellerId: string): Promise<Order[]> => {
    const orders = getLocal<Order>(KEYS.ORDERS);
    return orders
      .filter(o => o.sellerId === sellerId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  // Reviews
  getReviews: async (productId: string): Promise<Review[]> => {
    const reviews = getLocal<Review>(KEYS.REVIEWS);
    return reviews
      .filter(r => r.productId === productId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },
  saveReview: async (review: Review) => {
    const reviews = getLocal<Review>(KEYS.REVIEWS);
    reviews.push(review);
    setLocal(KEYS.REVIEWS, reviews);
  },

  // Messaging
  getChats: async (userId: string): Promise<Chat[]> => {
    const chats = getLocal<Chat>(KEYS.CHATS);
    return chats
      .filter(c => c.participants.includes(userId))
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  },
  getChat: async (chatId: string): Promise<Chat | null> => {
    const chats = getLocal<Chat>(KEYS.CHATS);
    return chats.find(c => c.id === chatId) || null;
  },
  findChatByProduct: async (buyerId: string, sellerId: string, productId: string): Promise<Chat | null> => {
    const chats = getLocal<Chat>(KEYS.CHATS);
    return chats.find(c => 
      c.productId === productId && 
      c.participants.includes(buyerId) && 
      c.participants.includes(sellerId)
    ) || null;
  },
  saveChat: async (chat: Chat) => {
    const chats = getLocal<Chat>(KEYS.CHATS);
    chats.push(chat);
    setLocal(KEYS.CHATS, chats);
  },
  updateChat: async (chatId: string, updates: Partial<Chat>) => {
    const chats = getLocal<Chat>(KEYS.CHATS);
    const index = chats.findIndex(c => c.id === chatId);
    if (index >= 0) {
      chats[index] = { ...chats[index], ...updates, updatedAt: new Date().toISOString() };
      setLocal(KEYS.CHATS, chats);
    }
  },
  getMessages: async (chatId: string): Promise<Message[]> => {
    const messages = getLocal<Message>(KEYS.MESSAGES);
    return messages
      .filter(m => m.chatId === chatId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  },
  saveMessage: async (message: Message) => {
    const messages = getLocal<Message>(KEYS.MESSAGES);
    messages.push(message);
    setLocal(KEYS.MESSAGES, messages);
    
    // Update chat last message
    await storage.updateChat(message.chatId, { 
      lastMessage: message.content,
      lastMessageAt: message.timestamp 
    });
  },

  // Session
  getSession: (): UserProfile | null => {
    const session = localStorage.getItem(KEYS.SESSION);
    return session ? JSON.parse(session) : null;
  },
  setSession: (user: UserProfile | null) => {
    if (user) {
      localStorage.setItem(KEYS.SESSION, JSON.stringify(user));
    } else {
      localStorage.removeItem(KEYS.SESSION);
    }
  }
};
