import React from 'react';
import { Container, Typography, Box, Divider, Paper } from '@mui/material';
import { SEO } from '../components/SEO';

const About: React.FC = () => {
  return (
    <>
      <SEO 
        title="About | Linuxdle" 
        description="Learn more about Linuxdle, the daily puzzle suite for Linux enthusiasts. Discover how to play our command, distribution, and desktop environment guessing games." 
      />
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={0} sx={{ p: { xs: 2, md: 4 }, bgcolor: 'background.paper', border: 1, borderColor: 'divider' }}>
          <Box mb={4}>
            <Typography variant="h4" component="h1" fontWeight="bold" sx={{ color: 'primary.main', mb: 2 }}>
              {`_ > ABOUT_LINUXDLE`}
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            <Typography variant="body1" paragraph>
              Welcome to <strong>Linuxdle</strong>, the ultimate daily puzzle destination designed specifically for Linux users, sysadmins, and open-source enthusiasts. 
              Our goal is to provide a fun, engaging, and educational experience that tests your knowledge of the Linux ecosystem.
            </Typography>
            
            <Typography variant="body1" paragraph>
              Whether you are a seasoned shell wizard who dreams in bash scripts, or a newcomer just starting to explore the vast world of open-source operating systems, 
              Linuxdle offers a unique challenge every single day.
            </Typography>
          </Box>

          <Box mb={4}>
            <Typography variant="h5" component="h2" fontWeight="bold" sx={{ color: 'secondary.main', mb: 2 }}>
              [+] MODULES_AND_GAMEPLAY
            </Typography>
            
            <Typography variant="h6" component="h3" sx={{ mt: 2, mb: 1, color: 'text.primary' }}>
              ./daily-commands
            </Typography>
            <Typography variant="body1" paragraph>
              The Commands module challenges you to identify a specific Linux command line utility. You will be provided with progressive clues based on the command's manual (man page) section, 
              general category, and its original year of release. With each incorrect guess, more information is revealed to help you pinpoint the exact tool. 
              It's an excellent way to discover new utilities and solidify your knowledge of the core GNU/Linux toolset.
            </Typography>

            <Typography variant="h6" component="h3" sx={{ mt: 2, mb: 1, color: 'text.primary' }}>
              ./daily-distros
            </Typography>
            <Typography variant="body1" paragraph>
              How well do you know your Linux distributions by their logos? The Distros module tests your visual recognition skills. 
              You start with a highly pixelated or obscured image of a distribution's logo. As you make guesses, the visual clarity improves, 
              making the logo easier to identify. From mainstream giants to niche, specialized distributions, this module covers the entire spectrum of the Linux family tree.
            </Typography>

            <Typography variant="h6" component="h3" sx={{ mt: 2, mb: 1, color: 'text.primary' }}>
              ./daily-desktop-environments
            </Typography>
            <Typography variant="body1" paragraph>
              The Desktop Environments (DE) module requires you to identify a graphical user interface based on a partially blurred screenshot. 
              You'll need to look closely at window decorations, panel layouts, default icons, and overall aesthetic cues to guess correctly. 
              This is a great test for those who frequently "distro-hop" or love customizing their user experience.
            </Typography>
          </Box>

          <Box mb={4}>
            <Typography variant="h5" component="h2" fontWeight="bold" sx={{ color: 'secondary.main', mb: 2 }}>
              [+] OPEN_SOURCE
            </Typography>
            <Typography variant="body1" paragraph>
              Linuxdle is proudly open-source software. We believe in the principles of free software and community collaboration. 
              The entire source code for this project is available on GitHub. You are welcome to review the code, suggest improvements, 
              report bugs, or even contribute new modules and features.
            </Typography>
            <Typography variant="body1" paragraph>
              This project is built using modern web technologies including React, TypeScript, and Material UI, designed to look and feel 
              like a classic terminal environment.
            </Typography>
          </Box>

          <Box>
            <Typography variant="h5" component="h2" fontWeight="bold" sx={{ color: 'secondary.main', mb: 2 }}>
              [+] FREQUENTLY_ASKED_QUESTIONS
            </Typography>
            
            <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 2 }}>
              When do the puzzles reset?
            </Typography>
            <Typography variant="body2" paragraph color="text.secondary">
              All puzzles reset daily at midnight local time. A countdown timer on the homepage indicates exactly when the next set of challenges will be available.
            </Typography>

            <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 2 }}>
              Are my scores saved?
            </Typography>
            <Typography variant="body2" paragraph color="text.secondary">
              Yes, your game progress and daily streaks are saved locally in your browser leveraging LocalStorage. Additionally, the guesses you make are stored in our database under a unique anonymous identifier to help us track puzzle difficulty and global statistics, while still respecting your privacy.
            </Typography>

            <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 2 }}>
              How can I support Linuxdle?
            </Typography>
            <Typography variant="body2" color="text.secondary">
              The best way to support the project is by playing daily, sharing it with other Linux enthusiasts, and contributing to our open-source repository. We may display relevant, high-quality advertisements to help cover server and development costs.
            </Typography>
          </Box>

        </Paper>
      </Container>
    </>
  );
};

export default About;
