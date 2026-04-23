import React from 'react';
import { Container, Typography, Box, Divider, Paper, Stack, Chip } from '@mui/material';
import { SEO } from '../components/SEO';

const modules = [
  {
    flag: '--module commands',
    title: 'Daily Commands',
    borderColor: '#4caf50',
    description:
      'Deduce a Linux command from property feedback: package, release year, manual section, built-in status, POSIX support, and categories.',
    details: 'Use color feedback and year direction hints (HIGHER or LOWER) to narrow your next guess quickly.'
  },
  {
    flag: '--module distros',
    title: 'Daily Distros',
    borderColor: '#1793D1',
    description:
      'Identify a Linux distribution from a progressively deblurred logo. Wrong guesses reveal more of the image.',
    details: 'Optional LINUS_TORVALDS_MODE applies grayscale and horizontal flip for a harder challenge.'
  },
  {
    flag: '--module des',
    title: 'Daily Desktop Environments',
    borderColor: '#ff9800',
    description:
      'Identify a desktop environment from a screenshot. Additional metadata appears at guess thresholds.',
    details: 'Hints reveal DE family, configuration language, release year, and primary language over time.'
  }
];

const ManPage: React.FC = () => {
  return (
    <>
      <SEO 
        title="man linuxdle | Manual Page" 
        description="The official manual page for Linuxdle. Learn about the rules, essential Linux commands, distributions, and desktop environments." 
      />
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Paper
          variant="outlined"
          sx={{
            p: { xs: 2, md: 4 },
            bgcolor: 'background.paper',
            fontFamily: 'monospace',
            color: 'text.primary'
          }}
        >
          <Box mb={4}>
            <Typography
              variant="h6"
              fontWeight="bold"
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 1
              }}
            >
              <span>LINUXDLE(1)</span>
              <span>General Commands Manual</span>
              <span>LINUXDLE(1)</span>
            </Typography>
            <Divider sx={{ my: 2 }} />
          </Box>

          <Box mb={4}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>NAME</Typography>
            <Typography variant="body1" sx={{ ml: { xs: 0, sm: 4 } }}>
              <strong>linuxdle</strong> - a daily interactive guessing game for linux enthusiasts
            </Typography>
          </Box>

          <Box mb={4}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>SYNOPSIS</Typography>
            <Typography variant="body1" sx={{ ml: { xs: 0, sm: 4 } }}>
              <strong>linuxdle</strong> [<strong>--module</strong> <em>name</em>]
            </Typography>
          </Box>

          <Box mb={4}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>DESCRIPTION</Typography>
            <Typography variant="body1" sx={{ ml: { xs: 0, sm: 4 }, mb: 2 }}>
              The <strong>linuxdle</strong> utility opens a daily challenge for the GNU/Linux ecosystem. The target changes at midnight,
              and each module emphasizes a different skill: command knowledge, distro recognition, or desktop environment familiarity.
            </Typography>

            <Typography variant="subtitle2" sx={{ ml: { xs: 0, sm: 4 }, mb: 1, opacity: 0.85 }}>
              COMMAND FEEDBACK LEGEND
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ ml: { xs: 0, sm: 4 }, mb: 2 }}>
              <Chip size="small" label="GREEN = exact match" sx={{ bgcolor: '#4caf50', color: '#fff', fontWeight: 'bold' }} />
              <Chip size="small" label="YELLOW = partial match" sx={{ bgcolor: '#ff9800', color: '#fff', fontWeight: 'bold' }} />
              <Chip size="small" label="RED = no match" sx={{ bgcolor: '#f44336', color: '#fff', fontWeight: 'bold' }} />
              <Chip size="small" label="YEAR: HIGHER / LOWER" variant="outlined" sx={{ fontWeight: 'bold' }} />
            </Stack>

            <Typography variant="subtitle2" sx={{ ml: { xs: 0, sm: 4 }, mb: 1, opacity: 0.85 }}>
              MODULES
            </Typography>
            <Stack spacing={1.5} sx={{ ml: { xs: 0, sm: 4 } }}>
              {modules.map((module) => (
                <Paper
                  key={module.flag}
                  variant="outlined"
                  sx={{
                    p: 1.5,
                    borderLeft: `4px solid ${module.borderColor}`,
                    bgcolor: 'background.default'
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'primary.main', mb: 0.5 }}>
                    {module.flag}
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                    {module.title}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    {module.description}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    {module.details}
                  </Typography>
                </Paper>
              ))}
            </Stack>
          </Box>

          <Box mb={4}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>THEORY OF OPERATION</Typography>
            <Typography variant="body1" sx={{ ml: { xs: 0, sm: 4 }, mb: 2 }}>
              To succeed at <strong>linuxdle</strong>, it helps to know basic filesystem hierarchy and terminal mechanics.
            </Typography>
            <Stack spacing={0.75} sx={{ ml: { xs: 0, sm: 4 } }}>
              <Typography variant="body2"><strong>ls</strong> - list directory contents quickly.</Typography>
              <Typography variant="body2"><strong>cd</strong> - change directories efficiently.</Typography>
              <Typography variant="body2"><strong>grep</strong> - locate matching lines in output and logs.</Typography>
              <Typography variant="body2"><strong>cat</strong> - inspect file contents fast.</Typography>
              <Typography variant="body2"><strong>chmod</strong> - control file permissions for user/group/others.</Typography>
            </Stack>
            <Typography variant="body1" sx={{ ml: { xs: 0, sm: 4 }, mt: 2 }}>
              For the distros module, understanding upstream vs downstream distributions (for example Debian vs Ubuntu, Arch vs Manjaro)
              helps narrow guesses based on release cadence and ecosystem lineage.
            </Typography>
          </Box>

          <Box mb={4}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>AUTHOR</Typography>
            <Typography variant="body1" sx={{ ml: { xs: 0, sm: 4 } }}>
              Written by orangekun and open-source contributors.
            </Typography>
          </Box>

          <Divider sx={{ my: 4 }} />
          <Typography variant="body2" align="center" sx={{ opacity: 0.5 }}>
            Linuxdle {new Date().getFullYear()}
          </Typography>
        </Paper>
      </Container>
    </>
  );
};

export default ManPage;
