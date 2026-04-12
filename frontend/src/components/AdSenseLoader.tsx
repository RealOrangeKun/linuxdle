import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ADSENSE_CLIENT_ID = 'ca-pub-1020249705879951';
const ADSENSE_SCRIPT_ID = 'linuxdle-adsense-script';

// Keep ads off low-content utility routes (privacy/terms/contact) to reduce policy risk.
const ELIGIBLE_ROUTES = new Set(['/', '/commands', '/distros', '/des', '/about', '/man']);

const AdSenseLoader: React.FC = () => {
  const { pathname } = useLocation();
  const isEligibleRoute = ELIGIBLE_ROUTES.has(pathname) || pathname.startsWith('/guides');

  useEffect(() => {
    if (!isEligibleRoute) {
      return;
    }

    if (document.getElementById(ADSENSE_SCRIPT_ID)) {
      return;
    }

    const script = document.createElement('script');
    script.id = ADSENSE_SCRIPT_ID;
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`;

    document.head.appendChild(script);
  }, [isEligibleRoute]);

  return null;
};

export default AdSenseLoader;
