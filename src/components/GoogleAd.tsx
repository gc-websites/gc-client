import React, { useEffect } from 'react';

interface GoogleAdProps {
  adSlot: string;
  className?: string;
  style?: React.CSSProperties;
  adFormat?: string;
  fullWidthResponsive?: string;
}

const GoogleAd: React.FC<GoogleAdProps> = ({
  adSlot,
  className = '',
  style = { display: 'block' },
  adFormat,
  fullWidthResponsive,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        // @ts-ignore
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (e) {
        console.error('AdSense error:', e);
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [adSlot]);

  return (
    <div key={adSlot} className={`ad-container ${className}`}>
      <ins
        className="adsbygoogle"
        style={{ ...style, maxWidth: '100%' }}
        data-ad-client="ca-pub-1088654265590051"
        data-ad-slot={adSlot}
        {...(adFormat ? { 'data-ad-format': adFormat } : {})}
        {...(fullWidthResponsive
          ? { 'data-full-width-responsive': fullWidthResponsive }
          : {})}
      />
    </div>
  );
};

export default GoogleAd;
