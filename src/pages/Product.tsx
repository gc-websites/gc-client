import React, { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import Page404 from './Page404';
import SkeletonLoader from '../components/SkeletonLoader';

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
  const [isLoading, setIsLoading] = useState(true);
  const [trackingId, setTrackingId] = useState('');
  const [trackingDocId, setTrackingDocId] = useState('');
  const [fbp, setFbp] = useState('');
  const [fbc, setFbc] = useState('');
  const [gclid, setGclid] = useState('');
  const [wbraid, setWbraid] = useState('');
  const [gbraid, setGbraid] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isNotFound, setIsNotFound] = useState(false);
  const isLocked = React.useRef(false);

  const buildAmazonUrl = (url: string | undefined, tag: string) => {
    if (!url) return '#';
    const cleanUrl = url.startsWith('http') ? url : `https://${url}`;
    try {
      const urlObj = new URL(cleanUrl);
      urlObj.searchParams.set('tag', tag);
      return urlObj.toString();
    } catch (e) {
      const separator = cleanUrl.includes('?') ? '&' : '?';
      return `${cleanUrl}${separator}tag=${tag}`;
    }
  };

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

  useEffect(() => {
    fetch(`https://dev.nice-advice.info/get-product/${id}`, {
      headers: { 'Content-Type': 'application/json' },
      method: 'GET',
    })
      .then(res => {
        if (res.status === 404) {
          setIsNotFound(true);
          throw new Error('404');
        }
        if (!res.ok) {
          throw new Error('Failed to fetch products');
        }
        return res.json();
      })
      .then(data => {
        setProductData(data.data);
        setIsLoading(false);
        console.log(data);
      })
      .catch(err => {
        setIsLoading(false);
        if (err.message !== '404') {
          console.error('❌ Error:', err);
        }
      });
  }, [id]);

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
            event_source_url: window.location.href, // Capturing exact URL
            external_id: trackingId, // Passing trackingId as external_id
            gclid: gclid,
            wbraid: wbraid,
            gbraid: gbraid,
            campaign_id: Cookies.get('campaign_id') || '',
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

  if (isNotFound) {
    return <Page404 />;
  }

  return (
    <div
      className={`flex flex-col md:flex-row justify-center items-start p-5 gap-4 md:gap-8 max-w-[1440px] mx-auto ${isSubmitting ? 'pointer-events-none opacity-80' : ''}`}
    >
      <div className="flex flex-col justify-center items-center w-full md:w-[50vw] lg:w-[40vw]">
        {isLoading ? (
          <SkeletonLoader className="w-full aspect-video rounded-xl" />
        ) : (
          <img
            id="cta-image"
            // @ts-ignore
            fetchPriority="high"
            src={
              productData?.image?.formats?.large?.url ||
              productData?.image?.formats?.medium?.url ||
              productData?.image?.url
            }
            onClick={async () => {
              if (isSubmitting) return;
              const finalTrackingId = await handleCtaClick();
              window.open(
                buildAmazonUrl(productData?.link, `${finalTrackingId}-20`),
                '_blank',
              );
            }}
            className={`w-full aspect-video object-cover rounded-xl transition-transform duration-300 ease-in-out hover:-translate-y-2 hover:shadow-xl ${isSubmitting ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'}`}
          />
        )}
        {isLoading ? (
          <SkeletonLoader className="h-10 w-3/4 mb-[1rem] mt-[1rem]" />
        ) : (
          <h1 className="text-2xl md:text-3xl text-center font-bold w-full mb-[1rem] mt-[1rem]">
            {productData?.title}
          </h1>
        )}
        {isLoading ? (
          <SkeletonLoader className="h-8 w-1/2 mb-6" />
        ) : (
          <a
            onClick={async e => {
              e.preventDefault();
              if (isSubmitting) return;
              const finalTrackingId = await handleCtaClick();
              window.open(
                buildAmazonUrl(productData?.link, `${finalTrackingId}-20`),
                '_blank',
              );
            }}
            className={`text-red-600 font-bold text-xl md:text-2xl hover:underline mb-6 block text-center uppercase tracking-wider ${isSubmitting ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
          >
            EXPLORE DEALS
          </a>
        )}
        <div className="w-full flex flex-col items-center">
          {isLoading ? (
            <>
              <SkeletonLoader className="h-4 w-full md:w-[90%] mb-4" />
              <SkeletonLoader className="h-4 w-full md:w-[90%] mb-4" />
              <SkeletonLoader className="h-4 w-full md:w-[90%] mb-4" />
              <SkeletonLoader className="h-4 w-full md:w-[90%] mb-4" />
            </>
          ) : (
            <>
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
            </>
          )}
        </div>
        <a
          href={buildAmazonUrl(productData?.link, `${trackingId}-20`)}
          onClick={async e => {
            e.preventDefault();
            if (isSubmitting) return;
            const finalTrackingId = await handleCtaClick();
            window.open(
              buildAmazonUrl(productData?.link, `${finalTrackingId}-20`),
              '_blank',
            );
          }}
          target="_blank"
          rel="noopener noreferrer"
          className={`w-full p-5 m-5 rounded bg-[rgb(3,145,133)] text-2xl font-bold relative bg-[#eaa31e] border border-black rounded-lg py-[15px] px-[20px] mb-[10px] flex justify-center items-center transition-colors duration-300 font-bold overflow-hidden text-[17px] hover:bg-[#c47f00]
              before:content-[''] before:absolute before:top-[-150%] before:left-[-150%] before:w-full before:h-[50%] before:bg-[rgba(255,255,255,0.3)] before:-rotate-45 before:animate-myshine font-inter ${isSubmitting ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
        >
          {isSubmitting ? 'PROCESSING...' : 'VIEW ON AMAZON'}
        </a>
        <p className="border p-2 w-full">
          Editorial Note: We independently review all products. If you make a
          purchase through our links, we may receive a commission
        </p>
      </div>
    </div>
  );
};

export default Product;
