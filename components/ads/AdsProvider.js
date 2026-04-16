'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import Script from 'next/script';

const AdsContext = createContext();

// Ad configuration
const AD_CONFIG = {
  googleAdSense: {
    script: 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3803830609004288',
    enabled: true,
    crossorigin: 'anonymous'
  },
  popUp: {
    enabled: false, // Disabled
  },
  nativeBar: {
    enabled: false, // Disabled
  },
  banner: {
    enabled: false, // Disabled
  },
  socialBar: {
    enabled: false, // Disabled
  },
  smartLink: {
    enabled: false, // Disabled
  }
};

// Pages where ads should be disabled
const NO_ADS_PAGES = ['/admin', '/admin/'];

// Google AdSense component
export function GoogleAdSenseScript({ enabled = true }) {
  if (!enabled) return null;

  return (
    <Script
      id="google-adsense"
      src={AD_CONFIG.googleAdSense.script}
      strategy="afterInteractive"
      crossOrigin={AD_CONFIG.googleAdSense.crossorigin}
      onLoad={() => {
        console.log('Google AdSense script loaded');
      }}
      onError={(e) => {
        console.error('Google AdSense script failed to load:', e);
      }}
    />
  );
}

// Social bar component
export function SocialBarAd({ enabled = true }) {
  if (!enabled) return null;

  return (
    <div id="social-bar-container" style={{ width: '100%', height: 'auto' }}>
      <Script
        id="social-bar-ad"
        src={AD_CONFIG.socialBar.script}
        strategy="afterInteractive"
        onLoad={() => {
          console.log('Social bar ad script loaded');
        }}
        onError={() => {
          console.error('Social bar ad script failed to load');
        }}
      />
    </div>
  );
}

export function AdsProvider({ children }) {
  const pathname = usePathname();
  const [adsEnabled, setAdsEnabled] = useState(true);
  const [popUpShown, setPopUpShown] = useState(false);
  const [scriptsLoaded, setScriptsLoaded] = useState({});

  // Check if current page should show ads
  const shouldShowAds = useCallback(() => {
    if (typeof window === 'undefined') return false;
    
    // Disable ads on admin pages
    if (NO_ADS_PAGES.some(page => pathname.startsWith(page))) {
      return false;
    }
    
    // Check user preference
    const userPref = localStorage.getItem('ads-preference');
    if (userPref === 'disabled') return false;
    
    return true;
  }, [pathname]);

  // Initialize ads
  useEffect(() => {
    const enabled = shouldShowAds();
    setAdsEnabled(enabled);

    if (enabled) {
      // Check if popup was already shown this session
      const alreadyShown = sessionStorage.getItem('popup-shown');
      if (alreadyShown) {
        setPopUpShown(true);
      }
    }
  }, [shouldShowAds]);

  // Load native bar script component
  const loadNativeBar = useCallback((position) => {
    if (!adsEnabled || !AD_CONFIG.nativeBar.enabled) return null;
    
    return (
      <div className={`ad-native-bar ad-${position}`}>
        <div className="ad-label text-xs text-gray-500 mb-1 text-center">Advertisement</div>
        <div id={AD_CONFIG.nativeBar.container}></div>
        <Script
          src={AD_CONFIG.nativeBar.script}
          strategy="afterInteractive"
          data-cfasync="false"
        />
      </div>
    );
  }, [adsEnabled]);

  // Load banner ad component
  const loadBanner = useCallback((position) => {
    if (!adsEnabled || !AD_CONFIG.banner.enabled) return null;
    
    return (
      <div className={`ad-banner ad-${position}`}>
        <div className="ad-label text-xs text-gray-500 mb-1 text-center">Advertisement</div>
        <Script
          id={`banner-${position}`}
          dangerouslySetInnerHTML={{
            __html: `
              atOptions = ${JSON.stringify(AD_CONFIG.banner.options)};
            `
          }}
        />
        <Script
          src={AD_CONFIG.banner.script}
          strategy="afterInteractive"
        />
      </div>
    );
  }, [adsEnabled]);

  // Get smart link
  const getSmartLink = useCallback(() => {
    if (!adsEnabled || !AD_CONFIG.smartLink.enabled) return null;
    return AD_CONFIG.smartLink.url;
  }, [adsEnabled]);

  // Toggle ads preference
  const toggleAds = useCallback(() => {
    const newState = !adsEnabled;
    setAdsEnabled(newState);
    localStorage.setItem('ads-preference', newState ? 'enabled' : 'disabled');
  }, [adsEnabled]);

  const value = {
    adsEnabled,
    loadNativeBar,
    loadBanner,
    getSmartLink,
    toggleAds,
    AD_CONFIG
  };

  return (
    <AdsContext.Provider value={value}>
      {children}
    </AdsContext.Provider>
  );
}

export function useAds() {
  const context = useContext(AdsContext);
  if (!context) {
    throw new Error('useAds must be used within AdsProvider');
  }
  return context;
}
