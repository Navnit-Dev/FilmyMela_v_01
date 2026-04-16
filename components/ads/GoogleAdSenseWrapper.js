'use client';

import { useAds } from './AdsProvider';
import { GoogleAdSenseScript } from './AdsProvider';

export function GoogleAdSenseWrapper() {
  const { adsEnabled } = useAds();
  
  return <GoogleAdSenseScript enabled={adsEnabled} />;
}
