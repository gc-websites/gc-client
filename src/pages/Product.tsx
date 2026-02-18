import React, { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import GoogleAd from '../components/GoogleAd';

interface ProductData {
  image?: { url: string };
  title?: string;
  descriptionfield1?: string;
  descriptionfield2?: string;
  descriptionfield3?: string;
  descriptionfield4?: string;
  link?: string;
  country?: string;
}

const Product = () => {
  // const params = new URLSearchParams(window.location.search);
  // const fbclid = params.get('fbclid');
  const url = new URL(window.location.href);
  const pathname = url.pathname;
  const id = pathname.split('/').pop();
  const [productData, setProductData] = useState<ProductData>({});
  const [trackingId, setTrackingId] = useState('');
  const [trackingDocId, setTrackingDocId] = useState('');
  const [fbp, setFbp] = useState('');
  const [fbc, setFbc] = useState('');

  useEffect(() => {
    setFbp(Cookies.get('_fbp'));
    setFbc(Cookies.get('_fbc'));
  }, []);

  useEffect(() => {
    try {
      fetch(`https://dev.nice-advice.info/get-product/${id}`, {
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
          console.log(productData);
        });
    } catch (err) {
      console.error('❌ Error:', err);
    }
  }, []);

  useEffect(() => {
    if (productData.country) {
      console.log('prcountry+');
      fetch('https://dev.nice-advice.info/get-trackingId', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ country: productData.country }),
      })
        .then(res => res.json())
        .then(data => {
          setTrackingId(data.name);
          console.log(trackingId);
          setTrackingDocId(data.documentId);
        });
    }
  }, [productData]);

  const handleCtaClick = async () => {
    if (id && trackingId) {
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
          return data.trackingId;
        }
        return trackingId;
      } catch (err) {
        console.error('❌ Error:', err);
        return trackingId; // Возвращаем текущий в случае ошибки
      }
    }
    return trackingId;
  };

  // useEffect(() => {
  //   if (fbclid && id && productData.tag && fbclid !== 'fbclid') {
  //     const send = async () => {
  //       try {
  //         const res = await fetch(`https://dev.nice-advice.info/fbclid`, {
  //           headers: { 'Content-Type': 'application/json' },
  //           method: 'POST',
  //           body: JSON.stringify({
  //             fbclid,
  //             productId: id,
  //             tag: productData.tag,
  //           }),
  //         });

  //         if (!res.ok) {
  //           throw new Error('Failed to send fbclid');
  //         }

  //         const data = await res.json(); // ← ЖДЁМ
  //         console.log(data);
  //       } catch (err) {
  //         console.error('❌ Error:', err);
  //       }
  //     };

  //     send();
  //   }
  // }, [productData.tag]);

  // useEffect(() => {
  //   if (fbclid) {
  //     try {
  //       fetch(`https://dev.nice-advice.info/get-product/ads/${id}`, {
  //         headers: { 'Content-Type': 'application/json' },
  //         method: 'POST',
  //         body: JSON.stringify({ fbclid: fbclid }),
  //       })
  //         .then(res => {
  //           if (!res.ok) {
  //             throw new Error('Failed to fetch products');
  //           }
  //           return res.json();
  //         })
  //         .then(data => {
  //           setClickId(data.data);
  //         });
  //     } catch (err) {
  //       console.error('❌ Error:', err);
  //     }
  //   }
  // }, []);

  // useEffect(() => {
  //   if (productData && clickId) {
  //     setUrlWithSubtag(productData?.link);
  //     console.log(urlWithSubtag);
  //   } else {
  //     setUrlWithSubtag(productData?.link);
  //     console.log(urlWithSubtag);
  //   }
  // }, [clickId, productData]);

  return (
    <div className="flex flex-col md:flex-row justify-center items-start p-5 gap-4 md:gap-8 max-w-[1440px] mx-auto">
      {/* Left Ad Block (Desktop Only) */}
      <div className="hidden md:block w-[160px] lg:w-[200px] sticky top-20 min-h-[600px]">
        <GoogleAd adSlot="5670764383" />
      </div>

      <div className="flex flex-col justify-center items-center w-full md:w-[50vw] lg:w-[40vw]">
        {/* Mobile Ad Block (Mobile Only) */}
        <div className="block md:hidden w-[90%] mb-10 border-b border-gray-100 pb-6 mx-auto">
          <GoogleAd
            adSlot="3102119406"
            adFormat="horizontal"
            fullWidthResponsive="true"
            style={{ display: 'block', width: '100%' }}
          />
        </div>

        <img
          id="cta-image"
          src={productData?.image?.url}
          onClick={async () => {
            const finalTrackingId = await handleCtaClick();
            window.open(
              `${productData?.link}&tag=${finalTrackingId}-20`,
              '_blank',
            );
          }}
          className="w-full rounded-xl cursor-pointer transition-transform duration-300 ease-in-out hover:-translate-y-2 hover:shadow-xl"
        />
        <h1 className="text-2xl md:text-3xl text-center font-bold w-full mb-[2rem] mt-[1rem]">
          {productData?.title}
        </h1>
        <div className="w-full flex flex-col items-center">
          <p className="w-full md:w-[90%] mb-4">
            {productData?.descriptionfield1}
          </p>
          <p className="w-full md:w-[90%] mb-4">
            {productData?.descriptionfield2}
          </p>
          <p className="w-full md:w-[90%] mb-4">
            {productData?.descriptionfield3}
          </p>
          <p className="w-full md:w-[90%] mb-4">
            {productData?.descriptionfield4}
          </p>
        </div>
        <a
          href={`${productData?.link}&tag=${trackingId}-20`}
          onClick={async e => {
            e.preventDefault();
            const finalTrackingId = await handleCtaClick();
            window.open(
              `${productData?.link}&tag=${finalTrackingId}-20`,
              '_blank',
            );
          }}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full p-5 m-5 rounded bg-[rgb(3,145,133)] text-2xl font-bold relative bg-[#eaa31e] border border-black rounded-lg py-[15px] px-[20px] mb-[10px] flex justify-center items-center cursor-pointer transition-colors duration-300 font-bold overflow-hidden text-[17px] hover:bg-[#c47f00]
              before:content-[''] before:absolute before:top-[-150%] before:left-[-150%] before:w-full before:h-[50%] before:bg-[rgba(255,255,255,0.3)] before:-rotate-45 before:animate-myshine font-inter"
        >
          VIEW ON AMAZON
        </a>
        <p className="border p-2 w-full">
          Editorial Note: We independently review all products. If you make a
          purchase through our links, we may receive a commission
        </p>
      </div>

      {/* Right Ad Block (Desktop Only) */}
      <div className="hidden md:block w-[160px] lg:w-[200px] sticky top-20 min-h-[600px]">
        <GoogleAd adSlot="5670764383" />
      </div>
    </div>
  );
};

export default Product;
