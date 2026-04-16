import fs from 'node:fs/promises';
import path from 'node:path';

const distDir = path.resolve('dist');
const indexPath = path.join(distDir, 'index.html');
const baseUrl = 'https://linuxdle.site';

const defaultSeo = {
  title: 'Linuxdle - Daily Linux Puzzle Games for Enthusiasts',
  description:
    'Test your Linux knowledge with daily puzzle games! Guess Linux commands, distros, and desktop environments. Three engaging game modes for Linux enthusiasts.',
  keywords:
    'linux, puzzle game, wordle, linux commands, linux distros, desktop environments, daily puzzle, linux quiz, linux game, open source',
};

const routes = [
  {
    path: '/commands',
    title: 'Daily Commands - Guess the Linux Command | Linuxdle',
    description:
      'Challenge yourself to identify the Linux command of the day based on hints. Test your terminal knowledge with this daily puzzle game.',
    keywords:
      'linux commands, terminal, bash, shell commands, command line, linux puzzle, daily challenge',
  },
  {
    path: '/distros',
    title: 'Daily Distros - Identify the Linux Distribution | Linuxdle',
    description:
      'Can you recognize the Linux distro from its blurred logo? A fun daily puzzle for Linux distribution enthusiasts.',
    keywords: 'linux distributions, distros, ubuntu, debian, arch, fedora, linux logos, distro quiz',
  },
  {
    path: '/des',
    title: 'Daily Desktop Environments - Recognize the DE | Linuxdle',
    description:
      'Guess the Linux desktop environment from screenshots and hints. Test your knowledge of GNOME, KDE, XFCE, and more!',
    keywords: 'desktop environments, gnome, kde, xfce, linux DE, desktop screenshots, linux interface',
  },
  {
    path: '/about',
    title: 'About | Linuxdle',
    description:
      'Learn more about Linuxdle, the daily puzzle suite for Linux enthusiasts. Discover how to play our command, distribution, and desktop environment guessing games.',
  },
  {
    path: '/man',
    title: 'man linuxdle | Manual Page',
    description:
      'The official manual page for Linuxdle. Learn about the rules, essential Linux commands, distributions, and desktop environments.',
  },
  {
    path: '/privacy',
    title: 'Privacy Policy | Linuxdle',
    description: 'Privacy policy and data collection practices for Linuxdle.',
    noindex: true,
  },
  {
    path: '/terms',
    title: 'Terms of Service | Linuxdle',
    description: 'Terms of Service and legal agreements for using Linuxdle.',
    noindex: true,
  },
  {
    path: '/contact',
    title: 'Contact Us | Linuxdle',
    description:
      'Contact the Linuxdle team to submit a bug, request a new command, distribution, or desktop environment.',
    noindex: true,
  },
  {
    path: '/guides',
    title: 'Linux Guides Hub | Linuxdle',
    description: 'Original Linuxdle editorial guides on commands, distros, and desktop environments.',
    keywords: 'linux guides, command line tutorials, distro comparison, desktop environment tuning',
  },
  {
    path: '/guides/command-pipelines',
    title: 'grep vs sed vs awk: choosing the right text tool | Linuxdle Guides',
    description:
      'A practical guide for Linux users who want fast, readable command pipelines instead of fragile one-liners.',
  },
  {
    path: '/guides/distro-release-models',
    title: 'Ubuntu vs Fedora vs Arch: release models that fit your workflow | Linuxdle Guides',
    description:
      'How to choose a Linux distribution by operational constraints, update cadence, and risk tolerance.',
  },
  {
    path: '/guides/desktop-tuning',
    title: 'Desktop environment tuning: GNOME, KDE, XFCE without guesswork | Linuxdle Guides',
    description:
      'A practical tuning checklist for Linux desktop responsiveness, battery life, and lower resource usage.',
  },
  {
    path: '/guides/journalctl',
    title: 'journalctl guide: read Linux logs fast without noise | Linuxdle Guides',
    description:
      'A practical journalctl workflow for filtering, tracing incidents, and exporting logs cleanly.',
  },
  {
    path: '/guides/systemctl',
    title: 'systemctl guide: manage services with confidence | Linuxdle Guides',
    description:
      'A practical systemctl playbook for service lifecycle, startup policy, and safe production changes.',
  },
  {
    path: '/releases',
    title: 'Linuxdle Releases | Linuxdle Guides',
    description: 'A dated, clickable archive of Linuxdle releases and the changes shipped in each one.',
  },
];

const escapeHtml = (value) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

const replaceTag = (html, pattern, replacement) => {
  if (pattern.test(html)) {
    return html.replace(pattern, replacement);
  }

  return html;
};

const buildRouteHtml = (template, route) => {
  const seoTitle = route.title ?? defaultSeo.title;
  const seoDescription = route.description ?? defaultSeo.description;
  const seoKeywords = route.keywords ?? defaultSeo.keywords;
  const seoUrl = `${baseUrl}${route.path}`;
  const robots = route.noindex ? 'noindex, nofollow' : 'index, follow';

  let html = template;

  html = replaceTag(html, /<title>.*?<\/title>/is, `<title>${escapeHtml(seoTitle)}</title>`);
  html = replaceTag(
    html,
    /<meta\s+name="title"\s+content="[^"]*"\s*\/?\s*>/i,
    `<meta name="title" content="${escapeHtml(seoTitle)}" />`,
  );
  html = replaceTag(
    html,
    /<meta\s+name="description"\s+content="[^"]*"\s*\/?\s*>/i,
    `<meta name="description" content="${escapeHtml(seoDescription)}" />`,
  );
  html = replaceTag(
    html,
    /<meta\s+name="keywords"\s+content="[^"]*"\s*\/?\s*>/i,
    `<meta name="keywords" content="${escapeHtml(seoKeywords)}" />`,
  );
  html = replaceTag(
    html,
    /<meta\s+name="robots"\s+content="[^"]*"\s*\/?\s*>/i,
    `<meta name="robots" content="${robots}" />`,
  );

  html = replaceTag(
    html,
    /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?\s*>/i,
    `<meta property="og:title" content="${escapeHtml(seoTitle)}" />`,
  );
  html = replaceTag(
    html,
    /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?\s*>/i,
    `<meta property="og:description" content="${escapeHtml(seoDescription)}" />`,
  );
  html = replaceTag(
    html,
    /<meta\s+property="og:url"\s+content="[^"]*"\s*\/?\s*>/i,
    `<meta property="og:url" content="${escapeHtml(seoUrl)}" />`,
  );

  html = replaceTag(
    html,
    /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?\s*>/i,
    `<meta name="twitter:title" content="${escapeHtml(seoTitle)}" />`,
  );
  html = replaceTag(
    html,
    /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?\s*>/i,
    `<meta name="twitter:description" content="${escapeHtml(seoDescription)}" />`,
  );
  html = replaceTag(
    html,
    /<meta\s+name="twitter:url"\s+content="[^"]*"\s*\/?\s*>/i,
    `<meta name="twitter:url" content="${escapeHtml(seoUrl)}" />`,
  );

  html = replaceTag(
    html,
    /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?\s*>/i,
    `<link rel="canonical" href="${escapeHtml(seoUrl)}" />`,
  );

  return html;
};

const writeRouteHtml = async (template, route) => {
  const html = buildRouteHtml(template, route);
  const routeDir = route.path.replace(/^\//, '');
  const outputDir = path.join(distDir, routeDir);
  const outputPath = path.join(outputDir, 'index.html');

  await fs.mkdir(outputDir, { recursive: true });
  await fs.writeFile(outputPath, html, 'utf8');
};

const main = async () => {
  const template = await fs.readFile(indexPath, 'utf8');

  await Promise.all(routes.map((route) => writeRouteHtml(template, route)));

  console.log(`Generated prerendered SEO HTML for ${routes.length} routes.`);
};

main().catch((error) => {
  console.error('Failed to generate prerendered route HTML:', error);
  process.exitCode = 1;
});
