import React, { useEffect } from 'react';

interface GoogleAdProps {
  adSlot: string;
  className?: string;
  style?: React.CSSProperties;
}

const GoogleAd: React.FC<GoogleAdProps> = ({
  adSlot,
  className = '',
  style = { display: 'block' },
}) => {
  useEffect(() => {
    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.error('AdSense error:', e);
    }
  }, []);

  return (
    <div className={`ad-container ${className}`}>
      <ins
        className="adsbygoogle"
        style={style}
        data-ad-client="ca-pub-1088654265590051"
        data-ad-slot={adSlot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
};

export default GoogleAd;
