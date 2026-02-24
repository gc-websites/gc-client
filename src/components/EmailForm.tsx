import { FC, FormEvent, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface EmailFormProps {
  handleFormClose: () => void;
}

const EmailForm: FC<EmailFormProps> = ({ handleFormClose }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleFormClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleFormClose]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate an API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setTimeout(() => {
        handleFormClose();
      }, 2000);
    }, 1500);
  };

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleFormClose}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm sm:p-6"
      >
        {/* Modal Container */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={e => e.stopPropagation()} // Prevent closing when clicking inside
          className="relative w-full max-w-lg overflow-hidden bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border border-white/20 dark:border-gray-700 shadow-2xl rounded-2xl md:rounded-3xl"
        >
          {/* Close Button Cross */}
          <button
            onClick={handleFormClose}
            className="absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-100 bg-gray-100/50 hover:bg-gray-200/50 dark:bg-gray-800/50 dark:hover:bg-gray-700/50 rounded-full transition-colors z-10"
            aria-label="Close"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          <div className="p-6 sm:p-10">
            {/* Header */}
            <div className="mb-8 text-center">
              <h2 className="text-3xl font-bold font-merriweather text-gray-900 dark:text-white mb-2">
                Get in Touch
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-inter">
                We'd love to hear from you. Send us a message and we'll respond
                as soon as possible.
              </p>
            </div>

            {isSuccess ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-10"
              >
                <div className="w-16 h-16 bg-main2/10 text-main2 rounded-full flex flex-col items-center justify-center mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Message Sent!
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mt-2">
                  Thank you for reaching out.
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                {/* Form Fields */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="name"
                    className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1"
                  >
                    Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    required
                    placeholder="John Doe"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-main2 focus:border-main2 outline-none transition-all placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-white"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="email"
                    className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1"
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    placeholder="john@example.com"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-main2 focus:border-main2 outline-none transition-all placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-white"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="message"
                    className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1"
                  >
                    Your request
                  </label>
                  <textarea
                    id="message"
                    required
                    placeholder="How can we help you?"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-main2 focus:border-main2 outline-none transition-all resize-none min-h-[120px] placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-white"
                  />
                </div>

                {/* Actions */}
                <div className="flex flex-col-reverse sm:flex-row gap-3 mt-4">
                  <button
                    type="button"
                    onClick={handleFormClose}
                    className="w-full sm:w-1/3 px-4 py-3 rounded-xl font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors focus:ring-2 focus:ring-gray-200 dark:focus:ring-gray-700 outline-none"
                  >
                    Cancel
                  </button>
                  <div className="flex-1 w-full">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full h-full px-4 py-3 rounded-xl font-medium text-white bg-main2 hover:bg-main3 shadow-lg shadow-main2/30 transition-all focus:ring-2 focus:ring-main2 focus:ring-offset-2 dark:focus:ring-offset-gray-900 outline-none flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <svg
                          className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                      ) : (
                        'Send Message'
                      )}
                    </motion.button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default EmailForm;
