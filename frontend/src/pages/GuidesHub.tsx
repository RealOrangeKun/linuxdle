import React from 'react';
import { Box, Card, CardActionArea, CardContent, Container, Divider, Grid, Stack, Typography } from '@mui/material';
import { AutoStories } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { SEO } from '../components/SEO';

const guides = [
  {
    title: 'XDG Desktop Portals: the hidden plumbing of modern Linux apps',
    path: '/guides/xdg-desktop-portals',
    summary: 'Learn how portals power file pickers, screen sharing, and sandbox permissions across Wayland sessions.',
  },
  {
    title: 'grep vs sed vs awk in real workflows',
    path: '/guides/command-pipelines',
    summary: 'Learn when each tool shines, where teams usually overcomplicate text processing, and how to keep pipelines maintainable.',
  },
  {
    title: 'Ubuntu vs Fedora vs Arch release models',
    path: '/guides/distro-release-models',
    summary: 'Choose a distro by update cadence, package freshness, rollback strategy, and operational risk instead of memes.',
  },
  {
    title: 'GNOME, KDE, XFCE tuning for performance',
    path: '/guides/desktop-tuning',
    summary: 'Practical desktop environment tuning for battery, RAM, startup speed, and focus while preserving usability.',
  },
  {
    title: 'journalctl guide for real incident response',
    path: '/guides/journalctl',
    summary: 'Filter systemd journal logs by service, boot, and priority to find root causes faster with less noise.',
  },
  {
    title: 'systemctl service management playbook',
    path: '/guides/systemctl',
    summary: 'Operate Linux services safely with clear startup policy, restart discipline, and reliable rollback habits.',
  },
];

const GuidesHub: React.FC = () => {
  const navigate = useNavigate();

  return (
    <>
      <SEO
        title="Linux Guides Hub | Linuxdle"
        description="Original Linuxdle editorial guides on commands, distros, and desktop environments."
        keywords="linux guides, command line tutorials, distro comparison, desktop environment tuning"
      />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box mb={4}>
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1, flexWrap: 'wrap' }}>
            <Box
              sx={{
                width: 56,
                height: 56,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: 1,
                borderColor: 'divider',
                bgcolor: 'background.paper',
                flexShrink: 0,
              }}
            >
              <AutoStories sx={{ color: 'primary.main', fontSize: 32 }} />
            </Box>
            <Typography variant="h3" component="h1" fontWeight="bold" sx={{ color: 'primary.main' }}>
              Linux Guides
            </Typography>
          </Stack>
          <Divider sx={{ mb: 2 }} />
          <Typography variant="body1">
            Editorial guides written for Linuxdle players who want deeper context than puzzle hints can provide.
            Every page is original, practical, and updated as the ecosystem changes.
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {guides.map((guide) => (
            <Grid size={{ xs: 12, md: 6 }} key={guide.path}>
              <Card variant="outlined">
                <CardActionArea onClick={() => navigate(guide.path)} sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ color: 'primary.main', mb: 1 }}>
                      {`[GUIDE] ${guide.title}`}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {guide.summary}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </>
  );
};

export default GuidesHub;
