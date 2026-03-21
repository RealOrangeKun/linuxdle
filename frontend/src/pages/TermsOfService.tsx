import React from 'react';
import { Container, Typography, Box, Divider, Paper } from '@mui/material';
import { SEO } from '../components/SEO';

const TermsOfService: React.FC = () => {
  return (
    <>
      <SEO 
        title="Terms of Service | Linuxdle" 
        description="Terms of Service and legal agreements for using Linuxdle." 
      />
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={0} sx={{ p: { xs: 2, md: 4 }, bgcolor: 'background.paper', border: 1, borderColor: 'divider', wordBreak: 'break-word' }}>
          <Box mb={4}>
            <Typography variant="h4" component="h1" fontWeight="bold" sx={{ color: 'primary.main', mb: 2 }}>
              {`_ > TERMS_OF_SERVICE`}
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            <Typography variant="body2" color="text.secondary" paragraph>
              Last updated: {new Date().toLocaleDateString()}
            </Typography>
            
            <Typography variant="body1" paragraph>
              These Terms of Service constitute a legally binding agreement made between you, whether personally or on behalf of an entity ("you") and Linuxdle ("we," "us" or "our"), concerning your access to and use of the website as well as any other media form, media channel, mobile website or mobile application related, linked, or otherwise connected thereto.
            </Typography>
            <Typography variant="body1" paragraph>
              You agree that by accessing the site, you have read, understood, and agree to be bound by all of these Terms of Service. If you do not agree with all of these Terms of Service, then you are expressly prohibited from using the site and you must discontinue use immediately.
            </Typography>
          </Box>

          <Box mb={4}>
            <Typography variant="h6" component="h2" fontWeight="bold" sx={{ color: 'secondary.main', mb: 2 }}>
              1. INTELLECTUAL PROPERTY RIGHTS
            </Typography>
            <Typography variant="body1" paragraph>
              Linuxdle is an open-source project. The codebase is released under the MIT License and is available on our GitHub repository. You are free to view, fork, and contribute to the source code under the terms of this license.
            </Typography>
            <Typography variant="body1" paragraph>
              However, the specific daily puzzle configurations, database of clues, and compiled assets served directly from this website are our proprietary property. The Linux distribution logos, desktop environment screenshots, and man page excerpts used within the puzzles are the property of their respective creators and are used here under fair use principles for educational and transformative puzzle game purposes.
            </Typography>
          </Box>

          <Box mb={4}>
            <Typography variant="h6" component="h2" fontWeight="bold" sx={{ color: 'secondary.main', mb: 2 }}>
              2. USER REPRESENTATIONS
            </Typography>
            <Typography variant="body1" paragraph>
              By using the site, you represent and warrant that:
            </Typography>
            <ul>
              <li><Typography variant="body1">You have the legal capacity and you agree to comply with these Terms of Service.</Typography></li>
              <li><Typography variant="body1">You are not a minor in the jurisdiction in which you reside.</Typography></li>
              <li><Typography variant="body1">You will not access the site through automated or non-human means, whether through a bot, script, or otherwise for the purpose of scraping answers or overwhelming the server.</Typography></li>
              <li><Typography variant="body1">You will not use the site for any illegal or unauthorized purpose.</Typography></li>
            </ul>
          </Box>

          <Box mb={4}>
            <Typography variant="h6" component="h2" fontWeight="bold" sx={{ color: 'secondary.main', mb: 2 }}>
              3. PROHIBITED ACTIVITIES
            </Typography>
            <Typography variant="body1" paragraph>
              You may not access or use the site for any purpose other than that for which we make the site available. The site may not be used in connection with any commercial endeavors except those that are specifically endorsed or approved by us.
            </Typography>
            <Typography variant="body1" paragraph>
              As a user of the site, you agree not to:
            </Typography>
            <ul>
              <li><Typography variant="body1">Systematically retrieve data or other content from the site to create or compile, directly or indirectly, a collection, compilation, database, or directory without written permission from us.</Typography></li>
              <li><Typography variant="body1">Trick, defraud, or mislead us and other users, especially in any attempt to learn sensitive account information or game solutions.</Typography></li>
              <li><Typography variant="body1">Circumvent, disable, or otherwise interfere with security-related features of the site.</Typography></li>
              <li><Typography variant="body1">Disparage, tarnish, or otherwise harm, in our opinion, us and/or the site.</Typography></li>
            </ul>
          </Box>

          <Box>
            <Typography variant="h6" component="h2" fontWeight="bold" sx={{ color: 'secondary.main', mb: 2 }}>
              4. DISCLAIMER
            </Typography>
            <Typography variant="body1" paragraph>
              THE SITE IS PROVIDED ON AN AS-IS AND AS-AVAILABLE BASIS. YOU AGREE THAT YOUR USE OF THE SITE AND OUR SERVICES WILL BE AT YOUR SOLE RISK. TO THE FULLEST EXTENT PERMITTED BY LAW, WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, IN CONNECTION WITH THE SITE AND YOUR USE THEREOF.
            </Typography>
          </Box>

        </Paper>
      </Container>
    </>
  );
};

export default TermsOfService;
