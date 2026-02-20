import React, { useEffect, useState, useRef } from 'react';
import Cookies from 'js-cookie';
import amazonImg from '../assets/img/amazon.png';

interface ProductV2Data {
  image?: { url: string };
  headerText?: string;
  title?: string;
  descriptionMini1?: string;
  descriptionMini2?: string;
  isTimerOn?: boolean;
  descriptionfield1?: string;
  descriptionfield2?: string;
  descriptionfield3?: string;
  descriptionfield4?: string;
  link?: string;
  country?: string;
}

const ProductV2 = () => {
  const url = new URL(window.location.href);
  const pathname = url.pathname;
  const id = pathname.split('/').pop();
  const [productData, setProductData] = useState<ProductV2Data>({});
  const [trackingId, setTrackingId] = useState('');
  const [trackingDocId, setTrackingDocId] = useState('');
  const [fbp, setFbp] = useState('');
  const [fbc, setFbc] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isLocked = useRef(false);

  // Calculate seconds until next midnight
  const getSecondsUntilMidnight = () => {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0); // Next midnight
    return Math.floor((midnight.getTime() - now.getTime()) / 1000);
  };

  // Timer state
  const [timeLeft, setTimeLeft] = useState(getSecondsUntilMidnight());

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
  }, []);

  useEffect(() => {
    try {
      fetch(`https://dev.nice-advice.info/get-product-v2/${id}`, {
        headers: { 'Content-Type': 'application/json' },
        method: 'GET',
      })
        .then(res => {
          if (!res.ok) {
            throw new Error('Failed to fetch products');
          }
          return res.json();
        })
        .then(data => {
          setProductData(data.data);
          console.log(data.data);
        });
    } catch (err) {
      console.error('❌ Error:', err);
    }
  }, [id]);

  useEffect(() => {
    if (productData?.country) {
      console.log(
        'Sending trackingId request for country:',
        productData.country,
      );
      fetch('https://dev.nice-advice.info/get-trackingId', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ country: productData.country }),
      })
        .then(res => res.json())
        .then(data => {
          console.log('Got Tracking ID response:', data);
          if (data && data.name) {
            setTrackingId(data.name);
            setTrackingDocId(data.documentId);
            console.log('Set Tracking ID to state:', data.name);
          }
        })
        .catch(err => console.error('Error fetching tracking id:', err));
    } else {
      console.log(
        'Skipping trackingId fetch, no country in productData:',
        productData,
      );
    }
  }, [productData]);

  // Timer effect
  useEffect(() => {
    if (!productData?.isTimerOn) return;
    const interval = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [productData?.isTimerOn]);

  const handleCtaClick = async () => {
    if (id && trackingId && !isSubmitting && !isLocked.current) {
      isLocked.current = true;
      setIsSubmitting(true);
      try {
        const response = await fetch('https://dev.nice-advice.info/lead', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            productId: id,
            fbc: fbc,
            fbp: fbp,
            trackingId: trackingId,
            trackingDocId: trackingDocId,
            country: productData.country,
            external_id: trackingId, // Passing trackingId as external_id
          }),
        });

        if (!response.ok) {
          throw new Error('Request failed');
        }

        const data = await response.json();
        console.log('Lead response:', data);

        // Если сервер вернул другой тег (из-за конфликта), используем его
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
        console.error('❌ Error:', err);
        setIsSubmitting(false);
        isLocked.current = false;
        return trackingId; // Возвращаем текущий в случае ошибки
      }
    }
    return trackingId;
  };

  const renderMiniDesc1 = (text?: string) => {
    if (!text) return null;
    const parts = text.split(/(HIGH)/i);
    return parts.map((part, i) =>
      part.toUpperCase() === 'HIGH' ? (
        <span
          key={i}
          className="text-red-500 font-bold uppercase transition-colors"
        >
          {part}
        </span>
      ) : (
        part
      ),
    );
  };

  const renderMiniDesc2 = (text?: string) => {
    if (!text) return null;
    const parts = text.split(/(FREE)/i);
    return parts.map((part, i) =>
      part.toUpperCase() === 'FREE' ? (
        <span key={i} className="text-[#0b7b3c] font-bold uppercase">
          {part}
        </span>
      ) : (
        part
      ),
    );
  };

  return (
    <div
      className={`flex flex-col justify-center items-center p-5 gap-4 md:gap-8 max-w-[1000px] mx-auto min-h-screen ${isSubmitting ? 'pointer-events-none opacity-80' : ''}`}
    >
      <div className="flex flex-col justify-center items-center w-full">
        {/* Top Amazon Logo moved outside the border */}
        <div className="flex flex-col items-center justify-center mb-4 w-[160px] md:w-[200px]">
          <img src={amazonImg} alt="Amazon" className="w-full object-contain" />
        </div>

        {/* Main Content Container with special Dashed Border matching screenshot */}
        <div className="w-full bg-[#f2f4f8] rounded-xl border-[2px] border-dashed border-[#1f2937] pt-4 px-2 pb-2 md:py-6 md:px-3 lg:px-6 flex flex-col items-center">
          <div className="flex flex-col md:flex-row w-full gap-3 lg:gap-5 mt-2 items-stretch">
            {/* Left Image Section */}
            <div className="w-full md:flex-1 flex justify-center items-center">
              <img
                id="cta-image"
                src={productData?.image?.url}
                onClick={async () => {
                  if (isSubmitting) return;
                  const finalTrackingId = await handleCtaClick();
                  window.open(
                    `${productData?.link}&tag=${finalTrackingId}-20`,
                    '_blank',
                  );
                }}
                className={`w-full aspect-square object-cover rounded-xl transition-transform duration-300 ease-in-out hover:-translate-y-2 hover:shadow-xl ${isSubmitting ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'}`}
                alt="Product"
              />
            </div>

            {/* Right Info Section */}
            <div className="w-full md:flex-1 flex flex-col justify-center items-center text-center mt-4 md:mt-0 px-2 lg:px-4">
              {productData?.headerText && (
                <p className="text-[#e11d48] font-bold text-sm md:text-base uppercase tracking-wider mb-2">
                  {productData.headerText} 🚨
                </p>
              )}

              {productData?.title && (
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-6 leading-snug">
                  {productData.title}
                </h1>
              )}

              <a
                onClick={async e => {
                  e.preventDefault();
                  if (isSubmitting) return;
                  const finalTrackingId = await handleCtaClick();
                  window.open(
                    `${productData?.link}&tag=${finalTrackingId}-20`,
                    '_blank',
                  );
                }}
                className={`w-full p-4 rounded bg-[#0b7b3c] hover:bg-[#07592b] text-white text-lg md:text-xl font-bold relative border border-transparent flex justify-center items-center transition-colors duration-300 overflow-hidden mb-6 uppercase tracking-wide
                  before:content-[''] before:absolute before:top-[-150%] before:left-[-150%] before:w-full before:h-[50%] before:bg-[rgba(255,255,255,0.3)] before:-rotate-45 before:animate-myshine font-inter ${isSubmitting ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
              >
                {isSubmitting ? 'PROCESSING...' : 'VIEW ON AMAZON'}
              </a>

              <div className="w-full bg-[#e2e8f0] rounded-md py-3 px-2 flex justify-center items-center text-sm md:text-base text-gray-700 shadow-inner mb-6">
                <span className="text-center w-[45%]">
                  {renderMiniDesc1(productData?.descriptionMini1)}
                </span>
                <span className="text-gray-400 mx-2">|</span>
                <span className="text-center w-[45%]">
                  {renderMiniDesc2(productData?.descriptionMini2)}
                </span>
              </div>

              {productData?.isTimerOn && (
                <div className="flex flex-col items-center mt-2 w-full">
                  <p className="text-gray-700 text-sm md:text-base mb-3 font-medium">
                    Offer ends soon
                  </p>
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="text-gray-900 font-bold text-xl md:text-2xl py-1 px-2 border-b-2 border-transparent bg-gray-100 rounded min-w-[45px]">
                        {String(Math.floor(timeLeft / 3600)).padStart(2, '0')}
                      </div>
                      <span className="text-xs text-gray-500 mt-1">hrs</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="text-gray-900 font-bold text-xl md:text-2xl py-1 px-2 border-b-2 border-transparent bg-gray-100 rounded min-w-[45px]">
                        {String(Math.floor((timeLeft % 3600) / 60)).padStart(
                          2,
                          '0',
                        )}
                      </div>
                      <span className="text-xs text-gray-500 mt-1">min</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="text-gray-900 font-bold text-xl md:text-2xl py-1 px-2 border-b-2 border-transparent bg-gray-100 rounded min-w-[45px]">
                        {String(timeLeft % 60).padStart(2, '0')}
                      </div>
                      <span className="text-xs text-gray-500 mt-1">sec</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Descriptions Section below the dotted box */}
        <div className="w-full flex flex-col items-center mt-8 text-base md:text-lg text-gray-800 leading-relaxed px-2 md:px-0">
          <div className="inline-flex flex-col items-start mx-auto w-[95%] md:w-fit max-w-full">
            {productData?.descriptionfield1 && (
              <p className="mb-5 text-left">{productData.descriptionfield1}</p>
            )}
            {productData?.descriptionfield2 && (
              <p className="mb-5 text-left">{productData.descriptionfield2}</p>
            )}
            {productData?.descriptionfield3 && (
              <p className="mb-5 text-left">{productData.descriptionfield3}</p>
            )}
            {productData?.descriptionfield4 && (
              <p className="mb-5 text-left">{productData.descriptionfield4}</p>
            )}
          </div>

          <a
            href={`${productData?.link}&tag=${trackingId}-20`}
            onClick={async e => {
              e.preventDefault();
              if (isSubmitting) return;
              const finalTrackingId = await handleCtaClick();
              window.open(
                `${productData?.link}&tag=${finalTrackingId}-20`,
                '_blank',
              );
            }}
            target="_blank"
            rel="noopener noreferrer"
            className={`w-full p-5 mt-4 rounded-lg bg-[#0b7b3c] hover:bg-[#07592b] text-white text-xl md:text-2xl font-bold relative border border-transparent flex justify-center items-center transition-colors duration-300 overflow-hidden mb-6 uppercase tracking-wide
              before:content-[''] before:absolute before:top-[-150%] before:left-[-150%] before:w-full before:h-[50%] before:bg-[rgba(255,255,255,0.3)] before:-rotate-45 before:animate-myshine font-inter ${isSubmitting ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
          >
            {isSubmitting ? 'PROCESSING...' : 'VIEW ON AMAZON'}
          </a>

          <p className="border p-3 w-full text-center text-sm md:text-base text-gray-600 bg-gray-50">
            Editorial Note: We independently review all products. If you make a
            purchase through our links, we may receive a commission
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProductV2;
