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

  const isTelegram = () => /Telegram/i.test(navigator.userAgent);

  const normalizeAmazonUrl = url => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `https://${url}`;
  };

  const openAmazon = (link, productItemId) => {
    if (!trackingId) return;

    const finalUrl = `${normalizeAmazonUrl(link)}&tag=${trackingId}-20`;

    // LEAD
    if (fbc && fbp) {
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
      }).catch(() => {});
    }

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

  if (!pageData) return null;

  return (
    <div className="bg-[#f5f6f7] min-h-screen p-4">
      <h1 className="text-3xl font-extrabold text-center mb-10">
        {pageData.title}
      </h1>

      <div className="flex flex-col items-center gap-12">
        {pageData.product.map((item, index) => (
          <div
            key={item.id}
            className="bg-white max-w-[560px] w-full rounded-2xl shadow-xl overflow-hidden"
          >
            <img
              src={item.image?.url}
              alt={item.title}
              className="cursor-pointer hover:scale-105 transition"
              onClick={() => openAmazon(item.link, item.id)}
            />

            <div className="p-6 space-y-3">
              <h2 className="text-2xl font-bold text-center">{item.title}</h2>

              <div className="text-center text-red-500 font-bold">
                Up to 50% OFF
              </div>

              <p>{item.descriptionfield1}</p>
              <p>{item.descriptionfield2}</p>
              <p>{item.descriptionfield3}</p>
              <p>{item.descriptionfield4}</p>

              <button
                onClick={() => openAmazon(item.link, item.id)}
                className="
                  w-full mt-4 py-4
                  bg-[rgb(3,145,133)]
                  hover:bg-[rgb(2,120,110)]
                  text-white font-extrabold
                  rounded-xl border border-black
                "
              >
                VIEW ON AMAZON →
              </button>
            </div>
          </div>
        ))}
      </div>

      <p className="text-center text-sm text-gray-500 mt-16">
        Amazon opens in your browser for security. We may earn a commission.
      </p>
    </div>
  );
};

export default MultiProduct;
