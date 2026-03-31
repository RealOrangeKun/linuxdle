import React from 'react';
import { Container, Typography, Box, Divider, Paper } from '@mui/material';
import { SEO } from '../components/SEO';

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
            <Typography variant="h6" fontWeight="bold" sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>LINUXDLE(1)</span>
              <span>General Commands Manual</span>
              <span>LINUXDLE(1)</span>
            </Typography>
            <Divider sx={{ my: 2 }} />
          </Box>

          <Box mb={4}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>NAME</Typography>
            <Typography variant="body1" sx={{ ml: 4 }}>
              <strong>linuxdle</strong> - a daily interactive guessing game for linux enthusiasts
            </Typography>
          </Box>

          <Box mb={4}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>SYNOPSIS</Typography>
            <Typography variant="body1" sx={{ ml: 4 }}>
              <strong>linuxdle</strong> [<strong>--module</strong> <em>name</em>]
            </Typography>
          </Box>

          <Box mb={4}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>DESCRIPTION</Typography>
            <Typography variant="body1" sx={{ ml: 4, mb: 2 }}>
              The <strong>linuxdle</strong> utility opens an interactive web-based daily challenge designed to test your knowledge of the sprawling GNU/Linux ecosystem. It is divided into three distinct modules, each requiring a different set of debugging intuition and historical trivia to solve. The target changes precisely at midnight local time.
            </Typography>
            <Typography variant="body1" sx={{ ml: 4 }}>
              The modules are as follows:
            </Typography>
            <Box sx={{ ml: 8, mt: 2 }}>
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>--module commands</strong><br />
                Tests your knowledge of standard POSIX and common GNU utilities. You deduce the command via a grid showing color-coded feedback (Green/Yellow/Red) for properties like package, release year, manual section, whether it is built-in, POSIX compliance, and categories. The release year provides directional hints (Higher/Lower).
              </Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>--module distros</strong><br />
                Tests your visual knowledge of operating system logos. A heavily blurred logo of a Linux distribution is presented, and as you guess, the blur is progressively removed. Includes a difficult "LINUS_TORVALDS_MODE" that renders the image in grayscale and flipped for absolute purists.
              </Typography>
              <Typography variant="body1">
                <strong>--module des</strong><br />
                Tests your visual pattern recognition. You are provided with a screenshot of a Desktop Environment (DE). As incorrect guesses are made at specific thresholds (2, 4, 6, 8 tries), textual metadata regarding the DE's underlying family, configuration language, release year, and primary language are leaked to stdout.
              </Typography>
            </Box>
          </Box>

          <Box mb={4}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>THEORY OF OPERATION</Typography>
            <Typography variant="body1" sx={{ ml: 4, mb: 2 }}>
              To succeed at <strong>linuxdle</strong>, it is highly recommended to understand basic filesystem hierarchy and terminal mechanics. For instance:
            </Typography>
            <Box sx={{ ml: 8 }}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                * <strong>ls</strong>: lists directory contents. Essential for understanding where you are.<br />
                * <strong>cd</strong>: changes the current working directory. The absolute basic motion.<br />
                * <strong>grep</strong>: prints lines that match patterns. The lifeblood of log analysis.<br />
                * <strong>cat</strong>: concatenates files and prints on the standard output.<br />
                * <strong>chmod</strong>: changes file mode bits, controlling permissions for User, Group, and Others.
              </Typography>
            </Box>
            <Typography variant="body1" sx={{ ml: 4, mt: 2 }}>
              Furthermore, when playing the 'distros' module, an understanding of the difference between an upstream provider (like Debian or Arch) and a downstream derivative (like Ubuntu or Manjaro) is crucial, as the package managers and release cycles are deeply intertwined. 
            </Typography>
          </Box>

          <Box mb={4}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>AUTHOR</Typography>
            <Typography variant="body1" sx={{ ml: 4 }}>
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
