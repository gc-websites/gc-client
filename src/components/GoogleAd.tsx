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
  adFormat = 'auto',
  fullWidthResponsive = 'true',
}) => {
  useEffect(() => {
    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.error('AdSense error:', e);
    }
  }, [adSlot]); // Re-run if adSlot changes, but usually won't

  return (
    <div className={`ad-container ${className}`}>
      <ins
        className="adsbygoogle"
        style={style}
        data-ad-client="ca-pub-1088654265590051"
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive={fullWidthResponsive}
      />
    </div>
  );
};

export default GoogleAd;
