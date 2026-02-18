import React, { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { useParams } from 'react-router-dom';

const MultiProduct = () => {
  const { id } = useParams();

  const [pageData, setPageData] = useState(null);
  const [trackingId, setTrackingId] = useState('');
  const [trackingDocId, setTrackingDocId] = useState('');
  const [fbp, setFbp] = useState('');
  const [fbc, setFbc] = useState('');
  const [secondsLeft, setSecondsLeft] = useState(600);

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
    setFbp(Cookies.get('_fbp'));
    setFbc(Cookies.get('_fbc'));
  }, []);

  /* ========== FETCH ========== */
  useEffect(() => {
    fetch(`https://dev.nice-advice.info/get-multiproduct/${id}`)
      .then(res => res.json())
      .then(res => setPageData(res.data))
      .catch(console.error);
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
    if (!trackingId) return trackingId;

    try {
      const res = await fetch('https://dev.nice-advice.info/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          multiproductId: id,
          productItemId,
          fbc,
          fbp,
          trackingId,
          trackingDocId,
          country: pageData.country,
        }),
      });

      if (!res.ok) throw new Error('Lead request failed');

      const data = await res.json();
      console.log('Lead response:', data);

      if (data.trackingId) {
        setTrackingId(data.trackingId);
        setTrackingDocId(data.trackingDocId);
        return data.trackingId;
      }
      return trackingId;
    } catch (err) {
      console.error('❌ Lead error:', err);
      return trackingId;
    }
  };

  if (!pageData) return null;

  return (
    <div className="bg-[#f5f6f7] min-h-screen pb-28">
      {/* ================= HERO ================= */}
      <section className="px-4 pt-10 pb-12 text-center max-w-3xl mx-auto">
        <span className="inline-block mb-3 px-4 py-1 rounded-full bg-green-100 text-green-800 text-sm font-semibold">
          🔥 Trending on Amazon Today
        </span>

        <h1 className="text-3xl md:text-4xl font-extrabold mb-3">
          {pageData.title}
        </h1>

        <p className="text-gray-600 text-lg">
          Editor-tested • Best value • Limited-time deals
        </p>
      </section>

      {/* ================= PRODUCTS ================= */}
      <section className="flex flex-col items-center gap-14 px-4">
        {pageData.product.map((item, index) => {
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
                  src={item.image?.url}
                  alt={item.title}
                  className="w-full cursor-pointer transition-transform duration-500 group-hover:scale-105"
                  onClick={async () => {
                    const finalTrackingId = await handleCtaClick(item.id);
                    const link = `${normalizeUrl(item.link)}&tag=${finalTrackingId}-20`;
                    window.open(link, '_blank', 'noopener,noreferrer');
                  }}
                />
              </div>

              {/* CONTENT */}
              <div className="p-6 space-y-3">
                <h2 className="text-2xl font-bold text-center">{item.title}</h2>

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
                    const finalTrackingId = await handleCtaClick(item.id);
                    const link = `${normalizeUrl(item.link)}&tag=${finalTrackingId}-20`;
                    window.open(link, '_blank', 'noopener,noreferrer');
                  }}
                  className="mt-4 w-full bg-[rgb(3,145,133)] hover:bg-[rgb(2,120,110)] text-white font-extrabold text-lg py-[16px] rounded-xl border border-black flex justify-center items-center relative overflow-hidden animate-pulseCTA before:content-[''] before:absolute before:top-[-150%] before:left-[-150%] before:w-full before:h-[50%] before:bg-[rgba(255,255,255,0.3)] before:-rotate-45 before:animate-myshine"
                >
                  VIEW ON AMAZON →
                </a>
              </div>
            </div>
          );
        })}
      </section>

      {/* ================= STICKY CTA ================= */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t shadow-lg md:hidden">
        {pageData.product?.[0] && (
          <a
            href={`${normalizeUrl(pageData.product[0].link)}&tag=${trackingId}-20`}
            onClick={async e => {
              e.preventDefault();
              const finalTrackingId = await handleCtaClick(
                pageData.product[0].id,
              );
              const link = `${normalizeUrl(
                pageData.product[0].link,
              )}&tag=${finalTrackingId}-20`;
              window.open(link, '_blank', 'noopener,noreferrer');
            }}
            className="m-3 bg-[rgb(3,145,133)] hover:bg-[rgb(2,120,110)] text-white font-extrabold py-4 rounded-xl flex justify-center items-center border border-black animate-pulseCTA"
          >
            🔥 View Best Deal on Amazon
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
