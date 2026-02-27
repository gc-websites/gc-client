import React, { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { useParams } from 'react-router-dom';
import Page404 from './Page404';
import SkeletonLoader from '../components/SkeletonLoader';

const MultiProduct = () => {
  const { id } = useParams();

  const [pageData, setPageData] = useState<any>(null);
  const [trackingId, setTrackingId] = useState('');
  const [trackingDocId, setTrackingDocId] = useState('');
  const [fbp, setFbp] = useState('');
  const [fbc, setFbc] = useState('');
  const [gclid, setGclid] = useState('');
  const [wbraid, setWbraid] = useState('');
  const [gbraid, setGbraid] = useState('');
  const [secondsLeft, setSecondsLeft] = useState(600);
  const [isNotFound, setIsNotFound] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const isLocked = React.useRef(false);

  /* ========= FIX DOMAIN ========= */
  const normalizeUrl = url => {
    if (!url) return '#';
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return `https://${url}`;
  };

  /* ========== COOKIES ========== */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fbclid = params.get('fbclid');

    let currentFbp = Cookies.get('_fbp');
    let currentFbc = Cookies.get('_fbc');

    // Restoration logic for FBC
    if (!currentFbc || currentFbc.includes('fbclid')) {
      if (fbclid && fbclid !== 'fbclid') {
        currentFbc = `fb.1.${Date.now()}.${fbclid}`;
      }
    }

    // Restoration logic for FBP
    if (!currentFbp) {
      const timestamp = Date.now();
      const randomPart = Math.floor(Math.random() * 2147483647);
      currentFbp = `fb.1.${timestamp}.${randomPart}`;
    }

    setFbp(currentFbp || '');
    setFbc(currentFbc || '');

    // Restore or get Google Click IDs
    const currentGclid = params.get('gclid') || Cookies.get('gclid') || '';
    const currentWbraid = params.get('wbraid') || Cookies.get('wbraid') || '';
    const currentGbraid = params.get('gbraid') || Cookies.get('gbraid') || '';
    const currentCampaignId =
      params.get('campaign_id') || Cookies.get('campaign_id') || '';

    if (currentGclid) Cookies.set('gclid', currentGclid, { expires: 90 });
    if (currentWbraid) Cookies.set('wbraid', currentWbraid, { expires: 90 });
    if (currentGbraid) Cookies.set('gbraid', currentGbraid, { expires: 90 });
    if (currentCampaignId)
      Cookies.set('campaign_id', currentCampaignId, { expires: 90 });

    setGclid(currentGclid);
    setWbraid(currentWbraid);
    setGbraid(currentGbraid);
  }, []);

  /* ========== FETCH ========== */
  useEffect(() => {
    fetch(`https://dev.nice-advice.info/get-multiproduct/${id}`)
      .then(res => {
        if (res.status === 404) {
          setIsNotFound(true);
          throw new Error('404');
        }
        if (!res.ok) {
          throw new Error('Failed to fetch multiproduct');
        }
        return res.json();
      })
      .then(res => setPageData(res.data))
      .catch(err => {
        if (err.message !== '404') {
          console.error(err);
        }
      });
  }, [id]);

  /* ========== TRACKING ========== */
  useEffect(() => {
    if (!pageData?.country) return;

    fetch('https://dev.nice-advice.info/get-trackingId', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ country: pageData.country }),
    })
      .then(res => res.json())
      .then(data => {
        setTrackingId(data.name);
        setTrackingDocId(data.documentId);
      });
  }, [pageData]);

  /* ========== COUNTDOWN ========== */
  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = () => {
    const m = Math.floor(secondsLeft / 60);
    const s = secondsLeft % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  /* ========== LEAD ========== */
  const handleCtaClick = async productItemId => {
    if (!trackingId || isSubmitting || isLocked.current) return trackingId;

    isLocked.current = true;
    setIsSubmitting(true);
    try {
      const res = await fetch('https://dev.nice-advice.info/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          multiproductId: id,
          productId: id, // So the backend doesn't save empty productId
          productItemId,
          fbc,
          fbp,
          trackingId,
          trackingDocId,
          country: pageData.country,
          event_source_url: window.location.href, // Capturing exact URL
          external_id: trackingId, // Passing trackingId as external_id
          gclid,
          wbraid,
          gbraid,
          campaign_id: Cookies.get('campaign_id') || '',
        }),
      });

      if (!res.ok) throw new Error('Lead request failed');

      const data = await res.json();
      console.log('Lead response:', data);

      if (data.trackingId) {
        setTrackingId(data.trackingId);
        setTrackingDocId(data.trackingDocId);
        setIsSubmitting(false);
        isLocked.current = false;
        return data.trackingId;
      }
      setIsSubmitting(false);
      isLocked.current = false;
      return trackingId;
    } catch (err) {
      console.error('❌ Lead error:', err);
      setIsSubmitting(false);
      isLocked.current = false;
      return trackingId;
    }
  };

  if (isNotFound) return <Page404 />;

  return (
    <div
      className={`bg-[#f5f6f7] min-h-screen pb-28 ${isSubmitting ? 'pointer-events-none' : ''}`}
    >
      {/* ================= HERO ================= */}
      <section className="px-4 pt-10 pb-12 text-center max-w-3xl mx-auto">
        <span className="inline-block mb-3 px-4 py-1 rounded-full bg-green-100 text-green-800 text-sm font-semibold">
          🔥 Trending on Amazon Today
        </span>

        <h1 className="text-3xl md:text-4xl font-extrabold mb-3">
          {pageData ? (
            pageData.title
          ) : (
            <SkeletonLoader className="h-10 w-3/4 mx-auto" />
          )}
        </h1>

        <p className="text-gray-600 text-lg">
          Editor-tested • Best value • Limited-time deals
        </p>
      </section>

      {/* ================= PRODUCTS ================= */}
      <section className="flex flex-col items-center gap-14 px-4">
        {pageData
          ? pageData.product.map((item: any, index: number) => {
              return (
                <div
                  key={item.id}
                  className="w-full max-w-[560px] bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden"
                >
                  {/* IMAGE */}
                  <div className="relative group">
                    {index === 0 && (
                      <span className="absolute top-4 left-4 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                        ⭐ Editor’s Choice
                      </span>
                    )}

                    <img
                      src={
                        item.image?.formats?.large?.url ||
                        item?.image?.formats?.medium?.url ||
                        item.image?.url
                      }
                      alt={item.title}
                      // @ts-ignore
                      fetchPriority={index === 0 ? 'high' : 'auto'}
                      loading={index === 0 ? 'eager' : 'lazy'}
                      className={`w-full transition-transform duration-500 group-hover:scale-105 ${isSubmitting ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'}`}
                      onClick={async () => {
                        if (isSubmitting) return;
                        const finalTrackingId = await handleCtaClick(item.id);
                        const link = `${normalizeUrl(item.link)}&tag=${finalTrackingId}-20`;
                        window.open(link, '_blank', 'noopener,noreferrer');
                      }}
                    />
                  </div>

                  {/* CONTENT */}
                  <div className="p-6 space-y-3">
                    <h2 className="text-2xl font-bold text-center">
                      {item.title}
                    </h2>

                    <div className="flex justify-center gap-1 text-yellow-400">
                      ⭐⭐⭐⭐⭐
                    </div>

                    <div className="text-gray-700 space-y-1">
                      <p>{item.descriptionfield1}</p>
                      <p>{item.descriptionfield2}</p>
                      <p>{item.descriptionfield3}</p>
                      <p>{item.descriptionfield4}</p>
                    </div>

                    <div className="flex justify-center gap-2 text-sm text-gray-500">
                      🚚 Fast Shipping • 🔒 Secure Checkout
                    </div>

                    {/* CTA */}
                    <a
                      href={`${normalizeUrl(item.link)}&tag=${trackingId}-20`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={async e => {
                        e.preventDefault();
                        if (isSubmitting) return;
                        const finalTrackingId = await handleCtaClick(item.id);
                        const link = `${normalizeUrl(item.link)}&tag=${finalTrackingId}-20`;
                        window.open(link, '_blank', 'noopener,noreferrer');
                      }}
                      className={`mt-4 w-full bg-[rgb(3,145,133)] hover:bg-[rgb(2,120,110)] text-white font-extrabold text-lg py-[16px] rounded-xl border border-black flex justify-center items-center relative overflow-hidden animate-pulseCTA before:content-[''] before:absolute before:top-[-150%] before:left-[-150%] before:w-full before:h-[50%] before:bg-[rgba(255,255,255,0.3)] before:-rotate-45 before:animate-myshine ${isSubmitting ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                    >
                      {isSubmitting ? 'PROCESSING...' : 'VIEW ON AMAZON →'}
                    </a>
                  </div>
                </div>
              );
            })
          : [1, 2].map(i => (
              <div
                key={i}
                className="w-full max-w-[560px] bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden"
              >
                <SkeletonLoader className="w-full aspect-square" />
                <div className="p-6 space-y-3">
                  <SkeletonLoader className="h-8 w-3/4 mx-auto" />
                  <SkeletonLoader className="h-4 w-full" />
                  <SkeletonLoader className="h-4 w-full" />
                  <SkeletonLoader className="h-4 w-full" />
                  <SkeletonLoader className="h-14 w-full mt-4 rounded-xl" />
                </div>
              </div>
            ))}
      </section>

      {/* ================= STICKY CTA ================= */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t shadow-lg md:hidden">
        {pageData?.product?.[0] && (
          <a
            href={`${normalizeUrl(pageData.product[0].link)}&tag=${trackingId}-20`}
            onClick={async e => {
              e.preventDefault();
              if (isSubmitting) return;
              const finalTrackingId = await handleCtaClick(
                pageData.product[0].id,
              );
              const link = `${normalizeUrl(
                pageData.product[0].link,
              )}&tag=${finalTrackingId}-20`;
              window.open(link, '_blank', 'noopener,noreferrer');
            }}
            className={`m-3 bg-[rgb(3,145,133)] hover:bg-[rgb(2,120,110)] text-white font-extrabold py-4 rounded-xl flex justify-center items-center border border-black animate-pulseCTA ${isSubmitting ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
          >
            {isSubmitting ? 'PROCESSING...' : '🔥 View Best Deal on Amazon'}
          </a>
        )}
      </div>

      {/* ================= DISCLAIMER ================= */}
      <section className="px-4 pt-16 text-center text-sm text-gray-500">
        Editorial Note: We independently review all products. If you make a
        purchase through our links, we may receive a commission.
      </section>
    </div>
  );
};

export default MultiProduct;
