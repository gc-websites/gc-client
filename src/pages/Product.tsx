import React, { useEffect, useState } from 'react';
import Cookies from 'js-cookie';

const Product = () => {
  const id = window.location.pathname.split('/').pop();

  const [productData, setProductData] = useState(null);
  const [trackingId, setTrackingId] = useState('');
  const [trackingDocId, setTrackingDocId] = useState('');
  const [fbp, setFbp] = useState('');
  const [fbc, setFbc] = useState('');

  /* ================= UTILS ================= */

  const isTelegram = () => /Telegram/i.test(navigator.userAgent);

  const normalizeAmazonUrl = url => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `https://${url}`;
  };

  const openAmazon = () => {
    if (!productData?.link || !trackingId) return;

    const finalUrl = `${normalizeAmazonUrl(productData.link)}&tag=${trackingId}-20`;

    // SEND LEAD
    if (fbc && fbp && trackingId) {
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
      }).catch(() => {});
    }

    if (isTelegram()) {
      // Telegram → Open in browser dialog
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

  /* ================= FETCH PRODUCT ================= */

  useEffect(() => {
    fetch(`https://dev.nice-advice.info/get-product/${id}`)
      .then(res => res.json())
      .then(res => setProductData(res.data))
      .catch(console.error);
  }, [id]);

  /* ================= TRACKING ================= */

  useEffect(() => {
    if (!productData?.country) return;

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

  if (!productData) return null;

  return (
    <div className="flex flex-col items-center p-5">
      <img
        src={productData.image?.url}
        alt={productData.title}
        onClick={openAmazon}
        className="w-[90vw] md:w-[40vw] rounded-xl cursor-pointer hover:shadow-xl transition"
      />

      <h1 className="text-2xl md:text-3xl font-bold text-center mt-4">
        {productData.title}
      </h1>

      <h2 className="text-xl font-bold text-red-500">Up to 50% OFF</h2>

      <p className="md:w-[40vw]">{productData.descriptionfield1}</p>
      <p className="md:w-[40vw]">{productData.descriptionfield2}</p>
      <p className="md:w-[40vw]">{productData.descriptionfield3}</p>
      <p className="md:w-[40vw]">{productData.descriptionfield4}</p>

      <button
        onClick={openAmazon}
        className="
          w-[90vw] md:w-[40vw]
          mt-6 py-4
          bg-[rgb(3,145,133)]
          hover:bg-[rgb(2,120,110)]
          text-white font-extrabold text-lg
          rounded-xl border border-black
        "
      >
        VIEW ON AMAZON →
      </button>

      <p className="mt-4 text-sm text-gray-500 md:w-[40vw] text-center">
        Amazon opens in your browser for security. We may earn a commission.
      </p>
    </div>
  );
};

export default Product;
