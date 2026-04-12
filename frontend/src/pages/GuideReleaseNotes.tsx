import React, { useState } from 'react';
import { Accordion, AccordionDetails, AccordionSummary, Box, Chip, Stack, Typography } from '@mui/material';
import { ExpandMore } from '@mui/icons-material';
import GuideArticleLayout from '../components/GuideArticleLayout';

const releases = [
  {
    id: 'release-2026-04',
    date: '2026-04-12',
    title: 'Release 2026.04',
    summary: 'Deployment strategy and content asset updates',
    bullets: [
      'Implemented blue-green deployment strategy for backend services and updated nginx configuration (3104fe6).',
      'Added new screenshots for Cinnamon and KDE Plasma desktop environments (940e7ad).',
      'Refined terminal presentation by blurring desktop environment names where needed (3460c94).',
    ],
  },
  {
    id: 'release-2026-04-08',
    date: '2026-04-08',
    title: 'Release 2026.04.08',
    summary: 'UI polish, auth handling, and gameplay fixes',
    bullets: [
      'Updated theme icons and improved responsive behavior for header and footer components (205bf3f).',
      'Streamlined refresh token generation and handling in user services (bf9900e).',
      'Fixed screenshot extension mismatch for LXQt assets (.jpg to .png) (24c1386).',
      'Improved autocomplete submit behavior to prefer highlighted options (e8061af).',
    ],
  },
  {
    id: 'release-2026-03-31',
    date: '2026-03-31',
    title: 'Release 2026.03.31',
    summary: 'Publisher-content and SEO improvements',
    bullets: [
      'Added the /man route and expanded noscript publisher-content fallback in index.html (a560bf9).',
      'Appended SEO-optimized module descriptions for AdSense readiness (6f4c807).',
      'Added Contact Us page and integrated footer navigation updates (eef99ad).',
      'Adjusted Docker development composition by removing admin-console from dev build (426d9d2).',
    ],
  },
  {
    id: 'release-2026-03-27',
    date: '2026-03-27',
    title: 'Release 2026.03.27',
    summary: 'Caching, support UX, and interaction flow updates',
    bullets: [
      'Implemented cache-control headers for frontend assets and daily image API responses (2364d6b, 14f90ce).',
      'Added support dialog flow with Ko-fi and GitHub star links (622d354, c89f125, c46ce1d).',
      'Improved all-games-complete flow persistence using localStorage behavior fixes (a069a17).',
      'Improved input keyboard UX and autocomplete constraints for guessing flows (1b32d0b, 5906953).',
    ],
  },
  {
    id: 'release-2026-03-25',
    date: '2026-03-25',
    title: 'Release 2026.03.25',
    summary: 'Seed data expansion and infrastructure cleanup',
    bullets: [
      'Added and updated Linux distro assets and seed records, including 15 new distros (d101762, 6e18eb7).',
      'Improved seeding flow to preserve active daily puzzles and clear related Redis cache keys (2bad3de, 40ce364, 095a4fd).',
      'Removed observability stack from development compose for a leaner local environment (2702db2).',
      'Moved frontend tests to src/__tests__ and updated imports for consistency (d6e833e).',
    ],
  },
];

const GuideReleaseNotes: React.FC = () => {
  const [expanded, setExpanded] = useState<string | false>('release-2026-04');

  return (
    <GuideArticleLayout
      title="Linuxdle Releases"
      description="A dated, clickable archive of Linuxdle releases and the changes shipped in each one."
      updatedOn="April 12, 2026"
      author="Linuxdle Editorial"
      keywords="linuxdle releases, changelog, release archive, product updates"
      toc={releases.map((release) => ({ id: release.id, label: `${release.date} - ${release.title}` }))}
    >
      <Typography sx={{ mb: 3 }}>
        Each release below is clickable. Open one to see the dated change set, grouped by the work that shipped in that version.
      </Typography>

      <Stack spacing={2}>
        {releases.map((release) => (
          <Accordion
            key={release.id}
            expanded={expanded === release.id}
            onChange={(_, isExpanded) => setExpanded(isExpanded ? release.id : false)}
            disableGutters
            sx={{ border: 1, borderColor: 'divider', '&:before': { display: 'none' } }}
          >
            <AccordionSummary expandIcon={<ExpandMore />} id={`${release.id}-header`}>
              <Box sx={{ width: '100%' }}>
                <Stack direction="row" spacing={1} sx={{ mb: 1, flexWrap: 'wrap' }}>
                  <Chip label={release.date} size="small" color="primary" />
                  <Chip label={release.title} size="small" />
                </Stack>
                <Typography variant="h6" component="h2" fontWeight="bold">
                  {release.summary}
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails id={release.id}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Released on {release.date}.
              </Typography>
              <Box component="ul" sx={{ pl: 3, m: 0 }}>
                {release.bullets.map((bullet) => (
                  <li key={bullet}>
                    <Typography>{bullet}</Typography>
                  </li>
                ))}
              </Box>
            </AccordionDetails>
          </Accordion>
        ))}
      </Stack>
    </GuideArticleLayout>
  );
};

export default GuideReleaseNotes;
