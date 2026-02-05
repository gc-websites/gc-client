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

  /* ================= UTILS ================= */

  const isTelegram = () => /Telegram/i.test(navigator.userAgent);

  const normalizeAmazonUrl = url => {
    if (!url) return '#';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `https://${url}`;
  };

  const openAmazon = (rawUrl, productItemId) => {
    const baseUrl = normalizeAmazonUrl(rawUrl);
    const finalUrl = `${baseUrl}&tag=${trackingId}-20`;

    // LEAD
    if (fbc && fbp && trackingId) {
      fetch('https://dev.nice-advice.info/lead', {
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
      }).catch(console.error);
    }

    // TELEGRAM FIX
    if (isTelegram()) {
      window.location.href = `https://t.me/share/url?url=${encodeURIComponent(finalUrl)}`;
    } else {
      window.open(finalUrl, '_blank', 'noopener,noreferrer');
    }
  };

  /* ================= COOKIES ================= */

  useEffect(() => {
    setFbp(Cookies.get('_fbp'));
    setFbc(Cookies.get('_fbc'));
  }, []);

  /* ================= FETCH ================= */

  useEffect(() => {
    fetch(`https://dev.nice-advice.info/get-multiproduct/${id}`)
      .then(res => res.json())
      .then(res => setPageData(res.data))
      .catch(console.error);
  }, [id]);

  /* ================= TRACKING ================= */

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

  /* ================= COUNTDOWN ================= */

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

  if (!pageData) return null;

  return (
    <div className="bg-[#f5f6f7] min-h-screen pb-32">
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

        <div className="mt-4 text-red-500 font-bold text-sm">
          ⏳ Deals refresh in {formatTime()}
        </div>
      </section>

      {/* ================= PRODUCTS ================= */}
      <section className="flex flex-col items-center gap-14 px-4">
        {pageData.product.map((item, index) => (
          <div
            key={item.id}
            className="w-full max-w-[560px] bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all overflow-hidden"
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
                onClick={() => openAmazon(item.link, item.id)}
              />
            </div>

            {/* CONTENT */}
            <div className="p-6 space-y-4">
              <h2 className="text-2xl font-bold text-center">{item.title}</h2>

              <div className="flex justify-center text-yellow-400">
                ⭐⭐⭐⭐⭐
              </div>

              <div className="text-center text-red-500 font-extrabold">
                Up to 50% OFF — Today Only
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
              <button
                onClick={() => openAmazon(item.link, item.id)}
                className="
                  mt-4 w-full
                  bg-[rgb(3,145,133)]
                  hover:bg-[rgb(2,120,110)]
                  text-white
                  font-extrabold
                  text-lg
                  py-4
                  rounded-xl
                  border border-black
                  flex justify-center items-center
                  relative overflow-hidden
                  animate-pulseCTA
                  before:content-['']
                  before:absolute
                  before:top-[-150%]
                  before:left-[-150%]
                  before:w-full
                  before:h-[50%]
                  before:bg-[rgba(255,255,255,0.3)]
                  before:-rotate-45
                  before:animate-myshine
                "
              >
                VIEW ON AMAZON →
              </button>
            </div>
          </div>
        ))}
      </section>

      {/* ================= STICKY CTA (MOBILE) ================= */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t shadow-lg md:hidden">
        <button
          onClick={() =>
            openAmazon(pageData.product?.[0]?.link, pageData.product?.[0]?.id)
          }
          className="
            m-3 w-[calc(100%-1.5rem)]
            bg-[rgb(3,145,133)]
            hover:bg-[rgb(2,120,110)]
            text-white
            font-extrabold
            py-4
            rounded-xl
            border border-black
            animate-pulseCTA
          "
        >
          🔥 View Best Deal on Amazon
        </button>
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
