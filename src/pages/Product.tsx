import React, { useEffect, useState } from 'react';
import Cookies from 'js-cookie';

const Product = () => {
  const url = new URL(window.location.href);
  const pathname = url.pathname;
  const id = pathname.split('/').pop();

  const [productData, setProductData] = useState({});
  const [trackingId, setTrackingId] = useState('');
  const [trackingDocId, setTrackingDocId] = useState('');
  const [fbp, setFbp] = useState('');
  const [fbc, setFbc] = useState('');

  /* ================= UTILS ================= */

  const isTelegram = () => /Telegram/i.test(navigator.userAgent);

  const normalizeAmazonUrl = url => {
    if (!url) return '#';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `https://${url}`;
  };

  const openAmazon = () => {
    if (!productData?.link || !trackingId) return;

    const baseUrl = normalizeAmazonUrl(productData.link);
    const finalUrl = `${baseUrl}&tag=${trackingId}-20`;

    // LEAD
    if (fbc && fbp && id && trackingId) {
      fetch('https://dev.nice-advice.info/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: id,
          fbc,
          fbp,
          trackingId,
          trackingDocId,
          country: productData.country,
        }),
      }).catch(console.error);
    }

    // TELEGRAM FIX
    if (isTelegram()) {
      window.location.href = finalUrl;
    } else {
      window.open(finalUrl, '_blank', 'noopener,noreferrer');
    }
  };

  /* ================= COOKIES ================= */

  useEffect(() => {
    setFbp(Cookies.get('_fbp'));
    setFbc(Cookies.get('_fbc'));
  }, []);

  /* ================= FETCH PRODUCT ================= */

  useEffect(() => {
    fetch(`https://dev.nice-advice.info/get-product/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch product');
        return res.json();
      })
      .then(data => setProductData(data.data))
      .catch(console.error);
  }, [id]);

  /* ================= TRACKING ================= */

  useEffect(() => {
    if (!productData.country) return;

    fetch('https://dev.nice-advice.info/get-trackingId', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ country: productData.country }),
    })
      .then(res => res.json())
      .then(data => {
        setTrackingId(data.name);
        setTrackingDocId(data.documentId);
      });
  }, [productData]);

  if (!productData?.title) return null;

  return (
    <div className="flex flex-col justify-center items-center p-5">
      {/* IMAGE */}
      <img
        src={productData?.image?.url}
        onClick={openAmazon}
        className="
          w-[90vw] md:w-[40vw]
          rounded-xl cursor-pointer
          transition-transform duration-300
          hover:-translate-y-2 hover:shadow-xl
        "
        alt={productData.title}
      />

      {/* TITLE */}
      <h1 className="text-2xl md:text-3xl text-center font-bold w-[90%] mt-4">
        {productData.title}
      </h1>

      {/* BADGE */}
      <h2 className="text-xl text-center font-bold text-red-400">
        Up to 50% OFF
      </h2>

      {/* DESCRIPTION */}
      <p className="w-[90%] md:w-[40%]">{productData.descriptionfield1}</p>
      <p className="w-[90%] md:w-[40%]">{productData.descriptionfield2}</p>
      <p className="w-[90%] md:w-[40%]">{productData.descriptionfield3}</p>
      <p className="w-[90%] md:w-[40%]">{productData.descriptionfield4}</p>

      {/* CTA */}
      <button
        onClick={openAmazon}
        className="
          w-[90vw] md:w-[40vw]
          p-5 m-5
          bg-[rgb(3,145,133)]
          hover:bg-[rgb(2,120,110)]
          text-white
          text-xl font-extrabold
          border border-black
          rounded-lg
          transition-all
          overflow-hidden
          relative
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

      {/* DISCLAIMER */}
      <p className="border p-2 md:w-[40vw] text-sm text-gray-600 text-center">
        Editorial Note: We independently review all products. If you make a
        purchase through our links, we may receive a commission.
      </p>
    </div>
  );
};

export default Product;
