import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getNewPosts, getPost, getRelatedPosts } from '../services/postsAPI';

import dot from '../assets/svg/dot.svg';

import Loader from '../components/Loader';
import Page404 from './Page404';
import Disclaimer from '../views/Disclaimer';
import HorizontalAdBanner from '../views/HorizontalAdBanner';
import RenderDescription from '../components/RenderDescription';
import AdList from '../components/AdList';
import InfinitePost from '../components/InfinitePost';
import { io } from 'socket.io-client';

const socket = io('https://vivid-triumph-4386b82e17.strapiapp.com');

const Post = () => {
  const [post, setPost] = useState({});
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { pathname } = useLocation();
  const postId = pathname.split('/').pop();
  const [postIds, setPostIds] = useState([]);

  const [activeUsers, setActiveUsers] = useState({});

  const [isEmail, setIsEmail] = useState(
    document.cookie.includes('email=true'),
  );
  const [email, setEmail] = useState('');
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [submitEmail, setSubmitEmail] = useState(false);
  const [hasConsent, setHasConsent] = useState(
    document.cookie.includes('cookieconsent_status=allow'),
  );

  const handleEmailModalOpen = () => setEmailModalOpen(true);
  const handleEmailModalClose = () => setEmailModalOpen(false);
  const handleEmailChange = value => setEmail(value);

  useEffect(() => {
    if (!submitEmail) return;

    fetch('https://dev.nice-advice.info/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email,
        source: 'nice-advice.info',
      }),
    })
      .then(res => {
        if (!res.ok) {
          throw new Error('Failed to send email');
        }
        return res.json();
      })
      .then(() => {
        setIsEmail(true);
        setEmailModalOpen(false);
        document.cookie = `email=true; path=/; max-age=31536000; SameSite=Lax`; // закрываем окно
      })
      .catch(err => {
        console.error('Email error:', err);
      })
      .finally(() => {
        setSubmitEmail(false);
        setEmailModalOpen(false); // сбрасываем флаг
      });
  }, [submitEmail]);

  useEffect(() => {
    // Если cookie уже стоит — активируем сразу
    if (document.cookie.includes('cookieconsent_status=allow')) {
      setHasConsent(true);
      return;
    }

    // Пуллинг каждые 300 ms — надёжно для мобильных браузеров
    const interval = setInterval(() => {
      if (document.cookie.includes('cookieconsent_status=allow')) {
        setHasConsent(true);
        clearInterval(interval); // прекращаем наблюдение
      }
    }, 300);

    return () => clearInterval(interval);
  }, []);

  const handleSubmit = event => {
    event.preventDefault();
    setSubmitEmail(true);
  };

  useEffect(() => {
    socket.on('updateAllActiveUsers', data => {
      setActiveUsers(data);
    });
    socket.on('updateActiveUsers', ({ postId, count }) => {
      setActiveUsers(prev => ({
        ...prev,
        [postId]: count,
      }));
    });

    return () => {
      socket.off('updateAllActiveUsers');
      socket.off('updateActiveUsers');
    };
  }, [postId]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const post = await getPost(postId);
        const related = await getRelatedPosts();
        const ids = await getNewPosts();
        setPostIds(ids.data.map(post => post.documentId));
        setRelatedPosts(related.data);
        setPost(post.data);
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();

    socket.emit('joinPost', postId);
    socket.on('updateActiveUsers', data => {
      if (data.postId === postId) {
        setActiveUsers(prevActiveUsers => ({
          ...prevActiveUsers,
          [postId]: data.count,
        }));
      }
    });

    return () => {
      socket.emit('leavePost', postId);
      socket.off('updateActiveUsers');
    };
  }, [postId]);

  if (isLoading) {
    return <Loader />;
  }

  if (!post || Object.keys(post).length === 0) {
    return <Page404 />;
  }

  const filteredPostIds = postIds?.filter(id => id !== postId);

  const getReadingCount = postId => activeUsers[postId] || 0;

  return (
    <div className="flex flex-col gap-8">
      {/* <HorizontalAdBanner
        image={post.firstAdBanner.image.url}
        url={post.firstAdBanner.url}
      /> */}

      <section className="container grid md:grid-cols-[70%_30%] gap-6 py-10">
        <div className="group p-4 rounded-lg h-full bg-white dark:bg-additionalText flex flex-col">
          <div className="flex items-center py-4 flex-wrap gap-4">
            <Link
              to={`/author/${post.author.documentId}`}
              className="flex items-center flex-wrap gap-4"
            >
              <img
                src={post.author.avatar.url}
                alt={post.author.name}
                className="rounded-full w-12 h-12"
              />
              <h5 className="section__title underline hover:text-main transition text-base font-bold">
                {post.author.name}
              </h5>
            </Link>
            <img src={dot} alt="dot" className="w-2 h-2" />
            <p className="section__description text-additionalText text-sm">
              {new Intl.DateTimeFormat('en-US', {
                month: 'short',
                day: '2-digit',
                year: 'numeric',
              }).format(new Date(post.createdAt))}
            </p>
          </div>

          <h2 className="section__title text-4xl text-mainText mb-4">
            {post.title}
          </h2>
          <span className="section__title block text-2xl text-main dark:text-main mb-6">
            {post.category.name}
          </span>

          <div className="w-full aspect-[4/3] overflow-hidden rounded-lg">
            <img
              src={post.image.url}
              alt={post.title}
              className="w-full h-full object-cover object-center transform"
            />
          </div>

          <div className="mt-6 flex flex-col gap-4 pb-4">
            <RenderDescription
              description={post.description}
              className="section__description text-base"
              truncate={false}
            />

            {/* <AdList ads={post.ads} /> */}

            <div className="pt-6 flex flex-col gap-4">
              <h3 className="section__title text-2xl text-mainText">
                {post.paragraphs[0].subtitle}
              </h3>

              <RenderDescription
                description={post.paragraphs[0].description}
                className="section__description text-base"
                truncate={false}
              />

              {/* <AdList ads={post.paragraphs[0].ads} /> */}

              <img
                src={post.paragraphs[0].image.url}
                alt={post.paragraphs[0].subtitle}
                className="w-full object-cover rounded"
              />
            </div>

            <div className="pt-6 flex flex-col gap-4">
              <h3 className="section__title text-2xl text-mainText">
                {post.paragraphs[1].subtitle}
              </h3>

              {isEmail && (
                <RenderDescription
                  description={post.paragraphs[1].description}
                  className="section__description text-base"
                  truncate={false}
                />
              )}

              {/* <AdList ads={post.paragraphs[1].ads} /> */}

              {isEmail && (
                <img
                  src={post.paragraphs[1].image.url}
                  alt={post.paragraphs[1].subtitle}
                  className="w-full object-cover rounded"
                />
              )}
              {!isEmail && (
                <div>
                  <p className="text-red-400">
                    Please allow cookies and share your email to access the full
                    version of the article.
                  </p>
                  {hasConsent && (
                    <button
                      onClick={handleEmailModalOpen}
                      className="block mx-auto mt-5 border rounded px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      Share 🗝️
                    </button>
                  )}
                </div>
              )}
              <AnimatePresence>
                {emailModalOpen && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm sm:p-6"
                  >
                    <motion.div
                      initial={{ scale: 0.95, opacity: 0, y: 20 }}
                      animate={{ scale: 1, opacity: 1, y: 0 }}
                      exit={{ scale: 0.95, opacity: 0, y: 20 }}
                      transition={{
                        type: 'spring',
                        damping: 25,
                        stiffness: 300,
                      }}
                      className="relative w-full max-w-sm overflow-hidden bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border border-white/20 dark:border-gray-700 shadow-2xl rounded-2xl md:rounded-3xl"
                    >
                      {/* Close Button Cross */}
                      <button
                        type="button"
                        onClick={handleEmailModalClose}
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

                      <div className="p-6 sm:p-8">
                        {/* Header */}
                        <div className="mb-6 text-center">
                          <h2 className="text-2xl font-bold font-merriweather text-gray-900 dark:text-white mb-2">
                            Unlock Article
                          </h2>
                          <p className="text-sm text-gray-600 dark:text-gray-400 font-inter">
                            Share your email with us to continue reading the
                            rest of this premium content.
                          </p>
                        </div>

                        {submitEmail ? (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center justify-center py-6"
                          >
                            <svg
                              className="animate-spin h-10 w-10 text-main2 mb-4"
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
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                              Unlocking...
                            </h3>
                          </motion.div>
                        ) : (
                          <form
                            onSubmit={handleSubmit}
                            className="flex flex-col gap-4"
                          >
                            <div className="flex flex-col gap-1.5">
                              <label
                                htmlFor="share-email"
                                className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1"
                              >
                                Email
                              </label>
                              <input
                                id="share-email"
                                onChange={event =>
                                  handleEmailChange(event.target.value)
                                }
                                type="email"
                                required
                                placeholder="john@example.com"
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-main2 focus:border-main2 outline-none transition-all placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-white"
                              />
                            </div>

                            <div className="flex flex-col-reverse sm:flex-row gap-3 mt-4">
                              <button
                                type="button"
                                onClick={handleEmailModalClose}
                                className="w-full sm:w-1/3 px-4 py-3 rounded-xl font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors focus:ring-2 focus:ring-gray-200 dark:focus:ring-gray-700 outline-none"
                              >
                                Cancel
                              </button>
                              <div className="flex-1 w-full">
                                <motion.button
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                  type="submit"
                                  className="w-full h-full px-4 py-3 rounded-xl font-medium text-white bg-main2 hover:bg-main3 shadow-lg shadow-main2/30 transition-all focus:ring-2 focus:ring-main2 focus:ring-offset-2 dark:focus:ring-offset-gray-900 outline-none flex items-center justify-center"
                                >
                                  Share Email
                                </motion.button>
                              </div>
                            </div>
                          </form>
                        )}
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6 h-full">
          {/* <div className="bg-white dark:bg-additionalText p-4 rounded-lg">
            <h3 className="section__title text-xl font-bold mb-4">
              Advertisements
            </h3>
            <a href={post.secondAdBanner.url} target="_blank" rel="noreferrer">
              <img
                src={post.secondAdBanner.image.url}
                alt="advertisement"
                className="w-full border-gray-400 border-[1px] rounded"
              />
            </a>
          </div> */}

          {relatedPosts.slice(0, 4).map(post => (
            <Link
              key={post.documentId}
              to={`/post/${post.documentId}`}
              className="group p-4 hover:shadow-lg rounded-lg bg-white dark:bg-additionalText transition duration-300 flex flex-col"
            >
              <div className="flex items-center pb-2 flex-wrap gap-3">
                <img
                  src={post.author.avatar.url}
                  alt={post.author.name}
                  className="rounded-full w-9 h-9"
                />
                <h5 className="section__title text-sm font-bold">
                  {post.author.name}
                </h5>
                <img src={dot} alt="dot" className="w-2 h-2" />
                <p className="section__description text-additionalText text-xs">
                  {new Intl.DateTimeFormat('en-US', {
                    month: 'short',
                    day: '2-digit',
                    year: 'numeric',
                  }).format(new Date(post.createdAt))}
                </p>
              </div>
              <div className="w-full aspect-[4/3] overflow-hidden rounded-lg mb-3">
                <img
                  src={post.image.url}
                  alt={post.title}
                  className="w-full h-full object-cover object-center transform group-hover:scale-105 transition duration-300"
                />
              </div>
              <div className="flex flex-col gap-2 flex-grow">
                <p className="section__description text-sm text-main dark:text-main">
                  {getReadingCount(post.documentId)} reading now
                </p>
                <h3 className="section__title text-lg text-mainText">
                  {post.title}
                </h3>
                <RenderDescription
                  description={post.description}
                  className="section__description text-sm"
                  truncate={true}
                />
                <p className="section__description text-main dark:text-main text-sm mt-auto">
                  Read more
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <Disclaimer />

      <InfinitePost
        postIds={filteredPostIds}
        getReadingCount={getReadingCount}
      />
    </div>
  );
};

export default Post;
