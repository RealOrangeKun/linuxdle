import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  noindex?: boolean;
}

const defaultSEO = {
  title: 'Linuxdle - Daily Linux Puzzle Games for Enthusiasts',
  description: 'Test your Linux knowledge with daily puzzle games! Guess Linux commands, distros, and desktop environments. Three engaging game modes for Linux enthusiasts.',
  keywords: 'linux, puzzle game, wordle, linux commands, linux distros, desktop environments, daily puzzle, linux quiz, linux game, open source',
  image: 'https://linuxdle.site/og-image.png',
  baseUrl: 'https://linuxdle.site',
};

export function SEO({ title, description, keywords, image, url, noindex = false }: SEOProps) {
  const location = useLocation();

  const seoTitle = title || defaultSEO.title;
  const seoDescription = description || defaultSEO.description;
  const seoKeywords = keywords || defaultSEO.keywords;
  const seoImage = image || defaultSEO.image;
  const seoUrl = url || `${defaultSEO.baseUrl}${location.pathname}`;

  useEffect(() => {
    // Update document title
    document.title = seoTitle;

    // Helper function to update meta tags
    const updateMetaTag = (selector: string, content: string) => {
      let element = document.querySelector<HTMLMetaElement>(selector);
      if (element) {
        element.content = content;
      } else {
        // Create meta tag if it doesn't exist
        element = document.createElement('meta');
        const attributeName = selector.includes('property') ? 'property' : 'name';
        const attributeValue = selector.match(/["']([^"']+)["']/)?.[1] || '';
        element.setAttribute(attributeName, attributeValue);
        element.content = content;
        document.head.appendChild(element);
      }
    };

    // Update primary meta tags
    updateMetaTag('meta[name="description"]', seoDescription);
    updateMetaTag('meta[name="keywords"]', seoKeywords);
    updateMetaTag('meta[name="robots"]', noindex ? 'noindex, nofollow' : 'index, follow');

    // Update Open Graph tags
    updateMetaTag('meta[property="og:title"]', seoTitle);
    updateMetaTag('meta[property="og:description"]', seoDescription);
    updateMetaTag('meta[property="og:image"]', seoImage);
    updateMetaTag('meta[property="og:url"]', seoUrl);

    // Update Twitter Card tags
    updateMetaTag('meta[name="twitter:title"]', seoTitle);
    updateMetaTag('meta[name="twitter:description"]', seoDescription);
    updateMetaTag('meta[name="twitter:image"]', seoImage);
    updateMetaTag('meta[name="twitter:url"]', seoUrl);

    // Update canonical link
    let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (canonical) {
      canonical.href = seoUrl;
    } else {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      canonical.href = seoUrl;
      document.head.appendChild(canonical);
    }
  }, [seoTitle, seoDescription, seoKeywords, seoImage, seoUrl, noindex]);

  return null; // This component doesn't render anything
}

// Page-specific SEO configurations
export const pageSEO = {
  home: {
    title: 'Linuxdle - Daily Linux Puzzle Games for Enthusiasts',
    description: 'Test your Linux knowledge with daily puzzle games! Choose from three game modes: Daily Commands, Daily Distros, and Daily Desktop Environments.',
    keywords: 'linux, puzzle game, wordle, linux commands, linux distros, desktop environments, daily puzzle',
  },
  dailyCommands: {
    title: 'Daily Commands - Guess the Linux Command | Linuxdle',
    description: 'Challenge yourself to identify the Linux command of the day based on hints. Test your terminal knowledge with this daily puzzle game.',
    keywords: 'linux commands, terminal, bash, shell commands, command line, linux puzzle, daily challenge',
  },
  dailyDistros: {
    title: 'Daily Distros - Identify the Linux Distribution | Linuxdle',
    description: 'Can you recognize the Linux distro from its blurred logo? A fun daily puzzle for Linux distribution enthusiasts.',
    keywords: 'linux distributions, distros, ubuntu, debian, arch, fedora, linux logos, distro quiz',
  },
  dailyDesktopEnvironments: {
    title: 'Daily Desktop Environments - Recognize the DE | Linuxdle',
    description: 'Guess the Linux desktop environment from screenshots and hints. Test your knowledge of GNOME, KDE, XFCE, and more!',
    keywords: 'desktop environments, gnome, kde, xfce, linux DE, desktop screenshots, linux interface',
  },
};
