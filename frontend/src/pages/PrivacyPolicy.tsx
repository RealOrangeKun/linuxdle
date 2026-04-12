import React from 'react';
import { Container, Typography, Box, Divider, Paper } from '@mui/material';
import { SEO } from '../components/SEO';

const PrivacyPolicy: React.FC = () => {
  return (
    <>
      <SEO 
        title="Privacy Policy | Linuxdle" 
        description="Privacy policy and data collection practices for Linuxdle."
        noindex
      />
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={0} sx={{ p: { xs: 2, md: 4 }, bgcolor: 'background.paper', border: 1, borderColor: 'divider', wordBreak: 'break-word' }}>
          <Box mb={4}>
            <Typography variant="h4" component="h1" fontWeight="bold" sx={{ color: 'primary.main', mb: 2 }}>
              {`_ > PRIVACY_POLICY`}
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            <Typography variant="body2" color="text.secondary" paragraph>
              Last updated: April 12, 2026
            </Typography>
            
            <Typography variant="body1" paragraph>
              Thank you for choosing to be part of our community at Linuxdle. We are committed to protecting your personal information and your right to privacy. 
              If you have any questions or concerns about this privacy notice, or our practices with regards to your personal information, please contact us via our GitHub repository.
            </Typography>
            
            <Typography variant="body1" paragraph>
              When you visit our website https://linuxdle.site, and more generally, use any of our services, we appreciate that you are trusting us with your personal information. 
              We take your privacy very seriously. In this privacy notice, we seek to explain to you in the clearest way possible what information we collect, how we use it and what rights you have in relation to it.
            </Typography>
          </Box>

          <Box mb={4}>
            <Typography variant="h6" component="h2" fontWeight="bold" sx={{ color: 'secondary.main', mb: 2 }}>
              1. WHAT INFORMATION DO WE COLLECT?
            </Typography>
            <Typography variant="body1" paragraph>
              <strong>Personal information you disclose to us:</strong> We do not collect any personally identifiable information (PII) directly from our users. You do not need to create an account, provide an email address, or share your name to play Linuxdle.
            </Typography>
            <Typography variant="body1" paragraph>
              <strong>Information automatically collected:</strong> We automatically collect certain information when you visit, use or navigate the site. This information does not reveal your specific identity (like your name or contact information) but may include device and usage information, such as your IP address, browser and device characteristics, operating system, language preferences, referring URLs, device name, country, location, information about how and when you use our site and other technical information. 
            </Typography>
          </Box>

          <Box mb={4}>
            <Typography variant="h6" component="h2" fontWeight="bold" sx={{ color: 'secondary.main', mb: 2 }}>
              2. DO WE USE COOKIES AND OTHER TRACKING TECHNOLOGIES?
            </Typography>
            <Typography variant="body1" paragraph>
              We may use cookies and similar tracking technologies (like web beacons and pixels) to access or store information.
            </Typography>
            <Typography variant="body1" paragraph>
              <strong>Game Data and Storage:</strong> Linuxdle generates a unique anonymous identifier when you first visit the site. We store the guesses you make for each daily puzzle in our database associated with this identifier. This helps us track puzzle difficulty and player performance without collecting personally identifiable information. Your browser's Local Storage is used to save this anonymous access token, your streaks, and your preferences (such as dark/light mode).
            </Typography>
            <Typography variant="body1" paragraph>
              <strong>Third-Party Advertisements:</strong> We use third-party advertising companies, such as Google AdSense, to serve ads when you visit our website. These companies may use information (not including your name, address, email address, or telephone number) about your visits to this and other websites in order to provide advertisements about goods and services of interest to you. 
            </Typography>
            <Typography variant="body1" paragraph>
              Google, as a third-party vendor, uses cookies to serve ads on our site. Google's use of the DART cookie enables it to serve ads to our users based on previous visits to our site and other sites on the Internet. Users may opt-out of the use of the DART cookie by visiting the Google Ad and Content Network privacy policy.
            </Typography>
          </Box>

          <Box mb={4}>
            <Typography variant="h6" component="h2" fontWeight="bold" sx={{ color: 'secondary.main', mb: 2 }}>
              3. WILL YOUR INFORMATION BE SHARED WITH ANYONE?
            </Typography>
            <Typography variant="body1" paragraph>
              We only share information with your consent, to comply with laws, to provide you with services, to protect your rights, or to fulfill business obligations.
            </Typography>
            <Typography variant="body1" paragraph>
              Specifically, we may need to process your data or share your personal information to comply with applicable laws, governmental requests, a judicial proceeding, court order, or legal process, such as in response to a court order or a subpoena.
            </Typography>
          </Box>

          <Box>
            <Typography variant="h6" component="h2" fontWeight="bold" sx={{ color: 'secondary.main', mb: 2 }}>
              4. HOW LONG DO WE KEEP YOUR INFORMATION?
            </Typography>
            <Typography variant="body1" paragraph>
              We keep your information for as long as necessary to fulfill the purposes outlined in this privacy notice unless otherwise required by law.
            </Typography>
            <Typography variant="body1" paragraph>
              Game data stored in Local Storage remains on your device until you clear your browser data or cache.
            </Typography>
          </Box>

        </Paper>
      </Container>
    </>
  );
};

export default PrivacyPolicy;
