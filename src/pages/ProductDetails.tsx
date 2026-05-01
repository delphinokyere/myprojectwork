import { useState, useEffect, FormEvent } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { storage } from '../lib/storage';
import { Product, Review, UserProfile } from '../types';
import { useAuth } from '../components/AuthProvider';
import { useCart } from '../components/CartProvider';
import { motion } from 'motion/react';
import { Star, ShoppingCart, ArrowLeft, Send, CheckCircle2, AlertCircle, Trash2, MessageCircle } from 'lucide-react';

export default function ProductDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [seller, setSeller] = useState<UserProfile | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchProductData = async () => {
      try {
        const prod = await storage.getProduct(id);
        if (prod) {
          setProduct(prod);
          
          const sellerData = await storage.getUser(prod.sellerId);
          if (sellerData) {
            setSeller(sellerData);
          }
        }
        
        const prodReviews = await storage.getReviews(id);
        setReviews(prodReviews);
      } catch (error) {
        console.error("Error fetching product details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
  }, [id]);

  const handleMessageSeller = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!product || !seller) return;
    if (user.uid === seller.uid) {
      alert("You cannot message yourself.");
      return;
    }
    
    // Check if chat already exists
    let chat = await storage.findChatByProduct(user.uid, seller.uid, product.id);
    
    if (!chat) {
      chat = {
        id: Math.random().toString(36).substring(7),
        participants: [user.uid, seller.uid],
        productId: product.id,
        lastMessageAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await storage.saveChat(chat);
    }
    
    navigate(`/messages?chatId=${chat.id}`);
  };

  const handleDeleteListing = async () => {
    if (!id) return;
    if (window.confirm('Are you sure you want to delete this listing permanently?')) {
      await storage.deleteProduct(id);
      navigate('/');
    }
  };

  const handleAddReview = async (e: FormEvent) => {
    e.preventDefault();
    if (!user || !id || !newComment.trim()) return;

    setSubmittingReview(true);
    try {
      const newReview: Review = {
        id: Math.random().toString(36).substring(7),
        productId: id,
        buyerId: user.uid,
        rating: newRating,
        comment: newComment,
        createdAt: new Date().toISOString(),
      };
      
      await storage.saveReview(newReview);
      setReviews(prev => [newReview, ...prev]);
      setNewComment('');
      setNewRating(5);
    } catch (error) {
      console.error("Error adding review:", error);
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-20 px-4">
        <h2 className="text-2xl font-bold mb-4">Product not found</h2>
        <button onClick={() => navigate('/')} className="text-primary underline font-bold">Back to Marketplace</button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 mb-8 text-gray-500 hover:text-primary font-medium transition-colors"
      >
        <ArrowLeft size={18} />
        Back to Results
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 mb-20">
        {/* Left: Gallery */}
        <div className="space-y-4 md:space-y-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="aspect-square rounded-[24px] md:rounded-[32px] overflow-hidden bg-gray-100 relative group shadow-xl md:shadow-2xl"
          >
            <img 
              src={product.imageUrls[selectedImage]} 
              alt={product.name}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </motion.div>
          <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
            {product.imageUrls.map((url, index) => (
              <button 
                key={index}
                onClick={() => setSelectedImage(index)}
                className={`w-16 h-16 md:w-24 md:h-24 shrink-0 rounded-xl md:rounded-2xl overflow-hidden border-2 transition-all ${selectedImage === index ? 'border-primary scale-105 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'}`}
              >
                <img src={url} alt={`View ${index}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </button>
            ))}
          </div>
        </div>

        {/* Right: Info */}
        <div className="flex flex-col">
          <div className="mb-4 md:mb-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 md:px-4 md:py-1.5 bg-gray-100 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider text-gray-700">{product.category}</span>
              {user?.uid === product.sellerId && (
                <button 
                  onClick={handleDeleteListing}
                  className="flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-600 rounded-full text-[10px] md:text-xs font-bold hover:bg-red-100 transition-colors"
                >
                  <Trash2 size={12} />
                  Delete Listing
                </button>
              )}
            </div>
            <div className={`flex items-center gap-2 text-xs md:text-sm font-bold ${product.stockStatus === 'in_stock' ? 'text-green-600' : 'text-red-600'}`}>
              {product.stockStatus === 'in_stock' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              {product.stockStatus === 'in_stock' ? 'In Stock' : 'Out of Stock'}
            </div>
          </div>
          
          <h1 className="text-3xl md:text-5xl font-display font-bold text-gray-900 mb-4">{product.name}</h1>
          <div className="flex items-center gap-2 mb-6 md:mb-8">
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map(s => (
                <Star key={s} size={16} className={s <= 4 ? "text-yellow-400 fill-current" : "text-gray-200"} />
              ))}
            </div>
            <span className="text-xs md:text-sm font-bold text-gray-700 ml-1 md:ml-2">4.8 / 5.0</span>
            <span className="text-xs md:text-sm text-gray-400 font-medium whitespace-nowrap">({reviews.length} reviews)</span>
          </div>

          <div className="text-3xl md:text-4xl font-display font-bold text-primary mb-6 md:mb-8">GH₵{product.price}</div>
          
          <p className="text-gray-600 leading-relaxed text-base md:text-lg mb-8 md:mb-12 flex-1">
            {product.description}
          </p>

          <div className="bg-gray-50 rounded-2xl md:rounded-3xl p-5 md:p-6 mb-6 md:mb-8 flex items-center gap-4">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-full flex items-center justify-center font-display font-bold text-base md:text-lg shadow-sm shrink-0">
              {seller?.name?.[0] || 'S'}
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Sold by</p>
              <p className="font-bold text-gray-900 truncate">{seller?.name || 'Loading Seller...'}</p>
              {seller?.studentId && <p className="text-[10px] text-blue-600 font-medium truncate">Verified Student entrepreneur</p>}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={() => product && addToCart(product)}
              disabled={product.stockStatus === 'out_of_stock'}
              className="flex-1 py-5 bg-primary text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-primary-dark transition-all shadow-xl hover:shadow-2xl active:scale-[0.98] disabled:opacity-50 disabled:grayscale disabled:scale-100"
            >
              <ShoppingCart size={20} />
              {product.stockStatus === 'in_stock' ? 'Add to Shopping Cart' : 'Out of Stock'}
            </button>
            <button 
              onClick={handleMessageSeller}
              className="flex-1 py-5 bg-white text-primary border-2 border-primary rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-gray-50 transition-all active:scale-[0.98]"
            >
              <MessageCircle size={20} />
              Message Seller
            </button>
          </div>
        </div>
      </div>

      <hr className="border-gray-100 mb-16" />

      {/* Review Section */}
      <div className="max-w-3xl">
        <h2 className="text-3xl font-display font-bold text-gray-900 mb-10">Customer Reviews</h2>
        
        {user ? (
          <form onSubmit={handleAddReview} className="mb-16 bg-white rounded-3xl p-8 border border-gray-100 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12 transition-transform group-focus-within:scale-150 duration-700" />
            <p className="font-bold mb-4">Share your feedback</p>
            <div className="flex gap-1 mb-6">
              {[1, 2, 3, 4, 5].map(r => (
                <button 
                  key={r} 
                  type="button"
                  onClick={() => setNewRating(r)}
                  className={`transition-all hover:scale-110 active:scale-95`}
                >
                  <Star className={`w-8 h-8 ${r <= newRating ? 'text-yellow-400 fill-current' : 'text-gray-200'}`} />
                </button>
              ))}
            </div>
            <textarea 
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Tell others about your experience with this product..." 
              className="w-full h-32 p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all placeholder:text-gray-400 resize-none mb-4"
              required
            />
            <button 
              type="submit" 
              disabled={submittingReview}
              className="px-8 py-3 bg-primary text-white rounded-xl font-bold flex items-center gap-2 hover:bg-primary-dark transition-colors disabled:opacity-50"
            >
              {submittingReview ? 'Posting...' : 'Post Review'}
              <Send size={16} />
            </button>
          </form>
        ) : (
          <div className="mb-16 p-8 bg-gray-50 rounded-3xl text-center border-2 border-dashed border-gray-200">
            <p className="text-gray-600 mb-4 font-medium">Log in to share your thoughts on this product.</p>
            <Link to="/login" className="inline-block px-8 py-3 bg-primary text-white rounded-xl font-bold">Login to Review</Link>
          </div>
        )}

        <div className="space-y-8">
          {reviews.length > 0 ? (
            reviews.map((review) => (
              <motion.div 
                key={review.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="pb-8 border-b border-gray-100"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-500 text-sm">
                      {review.buyerId.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex gap-0.5 mb-0.5">
                        {[1, 2, 3, 4, 5].map(s => (
                          <Star key={s} size={12} className={s <= review.rating ? "text-yellow-400 fill-current" : "text-gray-200"} />
                        ))}
                      </div>
                      <p className="text-sm font-bold">Verified Buyer</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400 font-medium">May 20, 2024</span>
                </div>
                <p className="text-gray-600 leading-relaxed font-medium pl-13">
                  {review.comment}
                </p>
              </motion.div>
            ))
          ) : (
            <p className="text-gray-400 font-medium italic">No reviews yet. Be the first to share your experience!</p>
          )}
        </div>
      </div>
    </div>
  );
}
