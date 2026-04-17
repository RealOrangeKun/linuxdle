import React from 'react';
import { Box, Chip, Container, Divider, Paper, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { SEO } from './SEO';

interface TocItem {
  id: string;
  label: string;
}

interface GuideArticleLayoutProps {
  title: string;
  description: string;
  updatedOn: string;
  author: string;
  keywords: string;
  toc: TocItem[];
  children: React.ReactNode;
  showGuidesHubLink?: boolean;
}

const GuideArticleLayout: React.FC<GuideArticleLayoutProps> = ({
  title,
  description,
  updatedOn,
  author,
  keywords,
  toc,
  children,
  showGuidesHubLink = true,
}) => {
  return (
    <>
      <SEO
        title={`${title} | Linuxdle Guides`}
        description={description}
        keywords={keywords}
      />
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={0} sx={{ p: { xs: 2, md: 4 }, border: 1, borderColor: 'divider' }}>
          <Typography variant="h4" component="h1" fontWeight="bold" sx={{ color: 'primary.main' }}>
            {title}
          </Typography>
          <Typography variant="body1" sx={{ mt: 2 }}>
            {description}
          </Typography>

          <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip label={`Author: ${author}`} size="small" />
            <Chip label={`Updated: ${updatedOn}`} size="small" />
            <Chip label="Original Linuxdle Editorial" size="small" color="primary" />
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
              Table of contents
            </Typography>
            <Box component="ul" sx={{ pl: 3, mt: 0 }}>
              {toc.map((item) => (
                <li key={item.id}>
                  <Typography component="a" href={`#${item.id}`} sx={{ color: 'primary.main' }}>
                    {item.label}
                  </Typography>
                </li>
              ))}
            </Box>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box sx={{ '& h2': { mt: 3, mb: 1 }, '& p': { mb: 2 } }}>
            {children}
          </Box>

          <Divider sx={{ mt: 4, mb: 2 }} />

          {showGuidesHubLink && (
            <Typography variant="body2" color="text.secondary">
              Read more in the <Typography component={RouterLink} to="/guides" sx={{ color: 'primary.main' }}>Linuxdle Guides Hub</Typography>.
            </Typography>
          )}
        </Paper>
      </Container>
    </>
  );
};

export default GuideArticleLayout;
