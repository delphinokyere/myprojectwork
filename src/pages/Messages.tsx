import { useState, useEffect, useRef, FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { storage } from '../lib/storage';
import { Chat, Message, UserProfile, Product } from '../types';
import { useAuth } from '../components/AuthProvider';
import { motion } from 'motion/react';
import { Send, ArrowLeft, MoreVertical, Search, ShoppingBag, MessageSquare } from 'lucide-react';

interface ChatListItemProps {
  chat: Chat;
  currentUser: UserProfile;
  isActive: boolean;
  onClick: () => void;
  key?: string | number;
}

function ChatListItem({ 
  chat, 
  currentUser, 
  isActive, 
  onClick 
}: ChatListItemProps) {
  const [otherUser, setOtherUser] = useState<UserProfile | null>(null);
  const [product, setProduct] = useState<Product | null>(null);

  useEffect(() => {
    const fetchDetails = async () => {
      const otherUid = chat.participants.find(p => p !== currentUser.uid);
      if (otherUid) {
        const u = await storage.getUser(otherUid);
        setOtherUser(u);
      }
      if (chat.productId) {
        const p = await storage.getProduct(chat.productId);
        setProduct(p);
      }
    };
    fetchDetails();
  }, [chat, currentUser.uid]);

  return (
    <button
      onClick={onClick}
      className={`w-full p-6 text-left border-b border-border-custom transition-all flex items-center gap-4 hover:bg-bg-base/50 ${isActive ? 'bg-bg-base border-r-4 border-r-primary' : ''}`}
    >
      <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center font-bold text-primary shrink-0">
        {otherUser?.name?.[0] || 'U'}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex justify-between items-start mb-1">
          <h3 className="font-bold text-sm text-text-base truncate">{otherUser?.name || 'Unknown User'}</h3>
          <span className="text-[10px] text-text-muted font-bold uppercase">
            {new Date(chat.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        <p className="text-xs text-primary font-bold truncate mb-1">{product?.name}</p>
        <p className="text-xs text-text-secondary truncate">{chat.lastMessage || 'Start a conversation'}</p>
      </div>
    </button>
  );
}

export default function Messages() {
  const { user, profile } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [otherParticipant, setOtherParticipant] = useState<UserProfile | null>(null);
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchActiveDetails = async () => {
      const activeChat = chats.find(c => c.id === activeChatId);
      if (activeChat) {
        const otherUid = activeChat.participants.find(p => p !== user?.uid);
        if (otherUid) {
          const u = await storage.getUser(otherUid);
          setOtherParticipant(u);
        }
        if (activeChat.productId) {
          const p = await storage.getProduct(activeChat.productId);
          setActiveProduct(p);
        }
      } else {
        setOtherParticipant(null);
        setActiveProduct(null);
      }
    };
    fetchActiveDetails();
  }, [activeChatId, chats, user?.uid]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchChats = async () => {
      const userChats = await storage.getChats(user.uid);
      setChats(userChats);

      const params = new URLSearchParams(location.search);
      const chatIdParam = params.get('chatId');
      if (chatIdParam) {
        setActiveChatId(chatIdParam);
      } else if (userChats.length > 0 && !activeChatId) {
        setActiveChatId(userChats[0].id);
      }
      setLoading(false);
    };

    fetchChats();
    const interval = setInterval(fetchChats, 3000); // Poll for new chats/updates
    return () => clearInterval(interval);
  }, [user, location.search, navigate]);

  useEffect(() => {
    if (!activeChatId) return;

    const fetchMessages = async () => {
      const chatMessages = await storage.getMessages(activeChatId);
      setMessages(chatMessages);
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 2000); // Poll for new messages
    return () => clearInterval(interval);
  }, [activeChatId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChatId || !user) return;

    const msg: Message = {
      id: Math.random().toString(36).substring(7),
      chatId: activeChatId,
      senderId: user.uid,
      content: newMessage,
      timestamp: new Date().toISOString(),
      read: false,
    };

    await storage.saveMessage(msg);
    setMessages(prev => [...prev, msg]);
    setNewMessage('');
    
    // Force immediate chat list update
    const updatedChats = await storage.getChats(user.uid);
    setChats(updatedChats);
  };

  const product = activeProduct;

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-bg-base">
      <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 h-[calc(100vh-64px)] flex flex-col">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-all">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-3xl font-display font-bold text-primary">Messages</h1>
      </div>

      <div className="flex-1 bg-white rounded-[32px] border border-border-custom shadow-lg overflow-hidden flex flex-col md:flex-row">
        {/* Sidebar */}
        <div className={`w-full md:w-80 lg:w-96 border-r border-border-custom flex flex-col ${activeChatId ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-6 border-b border-border-custom">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
              <input 
                type="text" 
                placeholder="Search conversations..." 
                className="w-full pl-12 pr-4 py-3 bg-bg-base border border-border-custom rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all text-sm"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {chats.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-center text-text-muted">
                <MessageSquare size={48} className="mb-4 opacity-20" />
                <p className="font-medium">No messages yet</p>
                <p className="text-xs">Inquire about products to start a conversation.</p>
              </div>
            ) : (
              chats.map((chat) => (
                <ChatListItem 
                  key={chat.id}
                  chat={chat}
                  currentUser={profile!}
                  isActive={activeChatId === chat.id}
                  onClick={() => setActiveChatId(chat.id)}
                />
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className={`flex-1 flex flex-col min-w-0 ${!activeChatId ? 'hidden md:flex' : 'flex'}`}>
          {activeChatId && otherParticipant ? (
            <>
              {/* Header */}
              <div className="p-6 border-b border-border-custom flex items-center justify-between bg-white z-10">
                <div className="flex items-center gap-4 min-w-0">
                  <button onClick={() => setActiveChatId(null)} className="md:hidden p-2 hover:bg-gray-100 rounded-full transition-all">
                    <ArrowLeft size={18} />
                  </button>
                  <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center font-bold text-primary shrink-0">
                    {otherParticipant.name[0]}
                  </div>
                  <div className="min-w-0">
                    <h2 className="font-bold text-text-base truncate">{otherParticipant.name}</h2>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 bg-success-custom rounded-full"></div>
                      <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Active Now</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {product && (
                    <button 
                      onClick={() => navigate(`/product/${product.id}`)}
                      className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-bg-base border border-border-custom rounded-xl text-[10px] font-bold text-primary hover:bg-white transition-all uppercase tracking-wider"
                    >
                      <ShoppingBag size={14} />
                      View Product
                    </button>
                  )}
                  <button className="p-2 hover:bg-gray-100 rounded-full text-text-secondary">
                    <MoreVertical size={20} />
                  </button>
                </div>
              </div>

              {/* Messages List */}
              <div 
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-6 space-y-6 bg-bg-base/30"
              >
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center p-12">
                    <div className="w-20 h-20 bg-white rounded-[24px] shadow-sm flex items-center justify-center mb-6 border border-border-custom">
                      <MessageSquare size={32} className="text-primary/20" />
                    </div>
                    <h3 className="font-display font-bold text-lg mb-2">No messages here yet</h3>
                    <p className="text-text-secondary text-sm max-w-xs">Ask about specific features, availability, or negotiate the price.</p>
                  </div>
                ) : (
                  messages.map((m, i) => {
                    const isOwn = m.senderId === user?.uid;
                    const prevMsg = messages[i-1];
                    const showAvatar = !isOwn && (!prevMsg || prevMsg.senderId !== m.senderId);
                    
                    return (
                      <div key={m.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'} gap-3`}>
                        {!isOwn && (
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-[10px] shrink-0 ${showAvatar ? 'bg-primary text-white' : 'invisible'}`}>
                            {otherParticipant.name[0]}
                          </div>
                        )}
                        <div className={`max-w-[80%] md:max-w-[70%] space-y-1 ${isOwn ? 'items-end' : 'items-start'}`}>
                          <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className={`px-4 py-3 rounded-[20px] text-sm font-medium shadow-sm ${
                              isOwn 
                                ? 'bg-primary text-white rounded-tr-none' 
                                : 'bg-white text-text-base border border-border-custom rounded-tl-none'
                            }`}
                          >
                            {m.content}
                          </motion.div>
                          <span className="text-[9px] font-bold text-text-muted uppercase px-1">
                            {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        {isOwn && (
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-[10px] shrink-0 bg-accent text-primary ${showAvatar ? '' : 'invisible shadow-sm'}`}>
                            {profile?.name?.[0] || 'U'}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Input */}
              <div className="p-6 bg-white border-t border-border-custom">
                <form onSubmit={handleSendMessage} className="flex gap-4">
                  <div className="flex-1 relative">
                    <input 
                      type="text" 
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..." 
                      className="w-full px-6 py-4 bg-bg-base border border-border-custom rounded-[20px] focus:ring-2 focus:ring-primary outline-none transition-all pr-14 font-medium text-sm"
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                      {/* Placeholder for emoji/attachments */}
                    </div>
                  </div>
                  <button 
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="w-14 h-14 bg-primary text-white rounded-[20px] flex items-center justify-center hover:bg-primary-dark transition-all shadow-lg hover:shadow-primary/20 active:scale-[0.9] disabled:opacity-50 disabled:grayscale"
                  >
                    <Send size={20} className="ml-1" />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-bg-base/30">
              <div className="w-32 h-32 bg-white rounded-[40px] shadow-md flex items-center justify-center mb-8 border border-border-custom overflow-hidden relative group">
                <div className="absolute inset-0 bg-primary/5 group-hover:scale-150 transition-transform duration-700" />
                <MessageSquare size={48} className="text-primary relative z-10" />
              </div>
              <h2 className="text-2xl font-display font-bold text-text-base mb-4">Your Conversations</h2>
              <p className="text-text-secondary max-w-sm leading-relaxed mb-8">
                Select a conversation from the sidebar to view messages or start a new chat with a seller.
              </p>
              <button 
                onClick={() => navigate('/products')}
                className="px-8 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark transition-all"
              >
                Find something to buy
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
