import { Route, Routes, useLocation } from 'react-router-dom';
import { Suspense, lazy, useEffect, useState } from 'react';
import { getCategories } from './services/postsAPI';

import Layout from './layout/Layout';
import Loader from './components/Loader';
import Page404 from './pages/Page404';
import ScrollToTop from './utils/ScrollToTop';
import PrivateRouteWithPassword from './components/PrivateRouteWithPassword';

const Home = lazy(() => import('./pages/Home'));
const Post = lazy(() => import('./pages/Post'));
const Category = lazy(() => import('./pages/Category'));
const Search = lazy(() => import('./pages/Search'));
const Author = lazy(() => import('./pages/Author'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const Terms = lazy(() => import('./pages/Terms'));
const Generation = lazy(() => import('./pages/Generation'));
const Product = lazy(() => import('./pages/Product'));
const ProductV2 = lazy(() => import('./pages/ProductV2'));
const ProductV3 = lazy(() => import('./pages/ProductV3'));
const ProductGeneration = lazy(() => import('./pages/ProductGeneration'));
const Multiproduct = lazy(() => import('./pages/Multiproduct'));

const App = () => {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    if (window.cookieconsent) {
      window.cookieconsent.initialise({
        palette: {
          popup: { background: '#000' },
          button: { background: '#f1d600', text: '#000' },
        },
        theme: 'classic',
        type: 'opt-in',
        revokable: false, // Hide the revoke button after acceptance
        content: {
          message: 'We use cookies to improve website performance.',
          allow: 'Allow',
          deny: 'Deny',
          link: 'Details',
          href: '/privacy',
        },
      });
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const data = await getCategories();
        setCategories(data.data);
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) {
    return <Loader />;
  }

  if (categories.length === 0) {
    return <Page404 />;
  }

  return (
    <Suspense fallback={<Loader />}>
      <Layout categories={categories}>
        <ScrollToTop trigger={location} />
        <Routes>
          <Route path="/" element={<Home categories={categories} />} />
          <Route path="/post/:postId" element={<Post />} />
          <Route path="/category/:categoryId" element={<Category />} />
          <Route path="/search" element={<Search categories={categories} />} />
          <Route path="/author/:authorId" element={<Author />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<Terms />} />
          <Route
            path="/generation"
            element={
              <PrivateRouteWithPassword>
                <Generation />
              </PrivateRouteWithPassword>
            }
          />
          <Route path="*" element={<Page404 />} />
          <Route path="/product/:productId" element={<Product />} />
          <Route path="/product-v2/:id" element={<ProductV2 />} />
          <Route path="/product-v3/:id" element={<ProductV3 />} />
          <Route path="/multiproduct/:id" element={<Multiproduct />} />
          <Route
            path="/generation/product"
            element={
              <PrivateRouteWithPassword>
                <ProductGeneration />
              </PrivateRouteWithPassword>
            }
          />
        </Routes>
      </Layout>
    </Suspense>
  );
};

export default App;
