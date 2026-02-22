import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const mockProduct = {
  title: 'Premium Wireless Noise-Cancelling Headphones Pro',
  price: '$199.99',
  originalPrice: '$299.99',
  rating: 4.9,
  reviewsCount: 12453,
  image:
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1200&auto=format&fit=crop',
  stock: 14,
};

const StarIcon = ({ className = 'w-4 h-4' }) => (
  <svg
    className={className}
    fill="currentColor"
    viewBox="0 0 20 20"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

const CheckCircleIcon = ({ className = 'w-5 h-5' }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2.5}
      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const AmazonLogo = ({ className = 'h-6' }) => (
  // SVG Approximation of Amazon wordmark
  <svg
    className={className}
    viewBox="0 0 100 30"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M63.7,13.8c0-5.8-3.4-8.1-7.8-8.1c-4.4,0-8.2,3-8.2,8.6c0,4.8,3,8.4,7.8,8.4c2.8,0,5.2-1.2,6.5-2.9l-1.9-2.3 c-1.1,1.3-2.6,2.1-4.5,2.1c-3.1,0-4.6-2.1-4.8-4.8h11.7C63.2,14.6,63.7,14.5,63.7,13.8z M50.7,12.5c0.3-2.6,2.2-4.1,4.7-4.1 c2.3,0,4.4,1.4,4.6,4.1H50.7z" />
    <path d="M41.8,22.2L34.6,6h3.4l5.3,12L48.6,6h3.4l-7.2,16.2H41.8z" />
    <path d="M29.1,6v16.2h-3V16c-1.2,1.6-3.1,2.5-5.3,2.5c-4,0-7.3-3.1-7.3-8.4c0-5,3.1-8.6,7.4-8.6c2.5,0,4.4,1.1,5.5,2.9V6H29.1z  M16.5,14.3c0,3.3,1.9,5.5,4.8,5.5c2.9,0,4.9-2.1,4.9-5.5V14c0-3.3-1.9-5.5-4.8-5.5C18.6,8.6,16.5,10.8,16.5,14.3z" />
    <path d="M78.6,6h-3.2l-5.7,8.6V6h-3v16.2h3v-7.8l5.8,7.8h3.5L72,12.8L78.6,6z" />
    {/* Smile Arrow path purely conceptual for vibe */}
    <path
      d="M12.9,23.3C18.1,26.5,26.2,28,34.2,28c11,0,21-3.6,28.3-9.5c1.1-0.9,1-2.6-0.2-3.4c-1.1-0.8-2.7-0.7-3.8,0.2 c-6.4,5-15,8.2-24.3,8.2c-7.3,0-14.7-1.4-19.4-4.2c-1.3-0.8-3-0.3-3.7,1C10.5,21.6,11.3,22.5,12.9,23.3z"
      fill="#FF9900"
    />
  </svg>
);

const ProductV3 = () => {
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes urgency

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleAmazonClick = () => {
    // In real app, this would use tracking ID and real product link
    console.log('Redirecting to Amazon...');
    window.open('https://amazon.com', '_blank');
  };

  // 100vh Layout forces everything to fit perfectly
  return (
    <div className="h-screen w-full overflow-hidden bg-gradient-to-br from-teal-900 via-teal-800 to-green-900 text-white font-sans flex flex-col">
      {/* Top Partnership Trust Bar */}
      <div className="bg-black/40 backdrop-blur-md px-4 py-2 flex justify-center items-center gap-3 text-xs sm:text-sm font-semibold tracking-wider text-teal-100 z-10 shrink-0">
        <CheckCircleIcon className="w-4 h-4 text-green-400" />
        <span>EXCLUSIVE AMAZON PARTNER OFFER</span>
        <div className="h-4 w-px bg-white/20 mx-1"></div>
        <AmazonLogo className="h-4 sm:h-5 text-white" />
      </div>

      {/* Main Content Area - Split on Desktop, Stacked tight on Mobile */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0 relative">
        {/* Left/Top: Image Section */}
        <div className="flex-1 md:w-1/2 relative bg-black/20 flex items-center justify-center min-h-[40vh] md:min-h-0 p-4 sm:p-8">
          {/* Ambient Glow */}
          <div className="absolute inset-0 bg-green-500/10 blur-[100px] rounded-full"></div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="w-full h-full max-h-[50vh] md:max-h-full relative z-10 rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl shadow-green-900/50 border border-white/10"
          >
            <img
              src={mockProduct.image}
              alt={mockProduct.title}
              className="w-full h-full object-cover"
            />
            {/* Overlay Gradient for contrast */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>

            {/* Floating Badges on Image */}
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="absolute bottom-4 left-4 right-4 flex justify-between items-end"
            >
              <div className="bg-green-500 text-black font-extrabold px-3 py-1 rounded-full text-sm shadow-lg flex items-center gap-1">
                🔥 IN HIGH DEMAND
              </div>
              <div className="flex items-center gap-1 bg-black/50 backdrop-blur-md px-2 py-1 rounded-lg text-yellow-400 text-xs sm:text-sm font-bold border border-white/10">
                <StarIcon /> {mockProduct.rating} ({mockProduct.reviewsCount})
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Right/Bottom: Content & Action Section */}
        <div className="flex-[0.8] md:w-1/2 flex flex-col justify-center p-5 sm:p-8 md:p-12 min-h-0 z-10 bg-gradient-to-t md:bg-gradient-to-l from-black/40 to-transparent">
          <div className="flex flex-col h-full justify-between max-w-lg mx-auto md:mx-0 w-full">
            {/* Title & Price Body */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="mt-auto mb-auto md:mt-0"
            >
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black leading-tight text-white mb-2 sm:mb-4 line-clamp-3">
                {mockProduct.title}
              </h1>

              <div className="flex items-end gap-3 mb-4 sm:mb-6">
                <span className="text-4xl sm:text-5xl font-extrabold text-green-400 drop-shadow-lg">
                  {mockProduct.price}
                </span>
                <span className="text-xl text-teal-200/50 line-through decoration-red-500/80 decoration-2 pb-1">
                  {mockProduct.originalPrice}
                </span>
                <span className="bg-red-500/20 text-red-300 border border-red-500/30 text-xs font-bold px-2 py-1 rounded mb-2">
                  SAVE 33%
                </span>
              </div>

              {/* Urgency Progress */}
              <div className="bg-white/5 border border-white/10 p-3 sm:p-4 rounded-xl backdrop-blur-sm mb-4">
                <div className="flex justify-between items-center text-sm font-bold text-teal-100 mb-2">
                  <span className="flex items-center gap-1.5 align-middle">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-ping absolute"></span>
                    <span className="w-2 h-2 rounded-full bg-red-500 relative"></span>
                    Only {mockProduct.stock} left
                  </span>
                  <span className="text-yellow-400 tabular-nums">
                    Ends in: {formatTime(timeLeft)}
                  </span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '85%' }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="h-full bg-gradient-to-r from-teal-400 to-green-400"
                  ></motion.div>
                </div>
              </div>
            </motion.div>

            {/* CTA Section - Always visible at bottom */}
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, type: 'spring', stiffness: 100 }}
              className="mt-auto pt-2 pb-2"
            >
              <button
                onClick={handleAmazonClick}
                className="group relative w-full w-full bg-gradient-to-r from-green-500 to-emerald-400 hover:from-green-400 hover:to-emerald-300 text-black font-black text-xl sm:text-2xl py-4 sm:py-5 px-6 rounded-2xl shadow-[0_0_40px_rgba(16,185,129,0.4)] hover:shadow-[0_0_60px_rgba(16,185,129,0.6)] transform hover:-translate-y-1 transition-all overflow-hidden focus:outline-none focus:ring-4 focus:ring-green-300"
              >
                {/* Shine Animation overlay */}
                <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12"></div>

                <div className="relative flex items-center justify-center gap-3">
                  <span className="hidden sm:inline">Secure Deal On</span>
                  <span className="sm:hidden">View On</span>
                  <AmazonLogo className="h-6 sm:h-7 text-black drop-shadow-sm mb-1" />
                  <svg
                    className="w-6 h-6 sm:w-8 sm:h-8 animate-bounce"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </div>
              </button>

              <div className="text-center mt-3 text-xs text-teal-200/70 font-medium flex items-center justify-center gap-1.5">
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
                Guaranteed Safe Checkout by Amazon
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      {/* Global styles for animations if needed */}
      <style>{`
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

export default ProductV3;
