import { useEffect, useState } from 'react';
import Page404 from './Page404';
import SkeletonLoader from '../components/SkeletonLoader';

interface ProductData {
  image?: { url: string; formats?: any };
  title?: string;
  descriptionfield1?: string;
  descriptionfield2?: string;
  descriptionfield3?: string;
  descriptionfield4?: string;
}

const TemuProduct = () => {
  const url = new URL(window.location.href);
  const pathname = url.pathname;
  const id = pathname.split('/').pop();
  const [productData, setProductData] = useState<ProductData>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isNotFound, setIsNotFound] = useState(false);

  const TEMU_LINK = 'https://temu.to/k/ppbbwjampjt';

  useEffect(() => {
    fetch(`https://dev.nice-advice.info/get-product-temu/${id}`, {
      headers: { 'Content-Type': 'application/json' },
      method: 'GET',
    })
      .then(res => {
        if (res.status === 404) {
          setIsNotFound(true);
          throw new Error('404');
        }
        if (!res.ok) {
          throw new Error('Failed to fetch product');
        }
        return res.json();
      })
      .then(data => {
        setProductData(data.data);
        setIsLoading(false);
      })
      .catch(err => {
        setIsLoading(false);
        if (err.message !== '404') {
          console.error('❌ Error:', err);
        }
      });
  }, [id]);

  if (isNotFound) {
    return <Page404 />;
  }

  return (
    <div className="flex flex-col md:flex-row justify-center items-start p-5 gap-4 md:gap-8 max-w-[1440px] mx-auto">
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
            onClick={() => window.open(TEMU_LINK, '_blank')}
            className="w-full aspect-video object-cover rounded-xl transition-transform duration-300 ease-in-out hover:-translate-y-2 hover:shadow-xl cursor-pointer"
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
            onClick={e => {
              e.preventDefault();
              window.open(TEMU_LINK, '_blank');
            }}
            className="text-red-600 font-bold text-xl md:text-2xl hover:underline mb-6 block text-center uppercase tracking-wider cursor-pointer"
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
          href={TEMU_LINK}
          onClick={e => {
            e.preventDefault();
            window.open(TEMU_LINK, '_blank');
          }}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full p-5 m-5 rounded text-2xl relative bg-[#eaa31e] border border-black rounded-lg py-[15px] px-[20px] mb-[10px] flex justify-center items-center transition-colors duration-300 font-bold overflow-hidden text-[17px] hover:bg-[#c47f00] before:content-[''] before:absolute before:top-[-150%] before:left-[-150%] before:w-full before:h-[50%] before:bg-[rgba(255,255,255,0.3)] before:-rotate-45 before:animate-myshine font-inter cursor-pointer"
        >
          VIEW ON TEMU
        </a>
        <p className="border p-2 w-full">
          Editorial Note: We independently review all products. If you make a
          purchase through our links, we may receive a commission
        </p>
      </div>
    </div>
  );
};

export default TemuProduct;
