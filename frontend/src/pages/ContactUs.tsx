import React, { useState } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Divider, 
  Paper, 
  TextField, 
  Button, 
  MenuItem, 
  Alert,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
  FormLabel
} from '@mui/material';
import { SEO } from '../components/SEO';

const ContactUs: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [commandName, setCommandName] = useState('');
  const [distroName, setDistroName] = useState('');
  const [deName, setDeName] = useState('');
  const [deRequestType, setDeRequestType] = useState('existing');
  
  // File states
  const [bugFile, setBugFile] = useState<File | null>(null);
  const [distroFile, setDistroFile] = useState<File | null>(null);
  const [deFile, setDeFile] = useState<File | null>(null);
  
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate successful submission without talking to backend
    setSubmitted(true);
    // Reset form
    setEmail('');
    setSubject('');
    setDescription('');
    setCommandName('');
    setDistroName('');
    setDeName('');
    setDeRequestType('existing');
    
    // Clear files
    setBugFile(null);
    setDistroFile(null);
    setDeFile(null);
  };

  const ThemedFileInput = ({ label, file, onChange, id }: { label: string, file: File | null, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, id: string }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
      <Button
        component="label"
        variant="outlined"
        htmlFor={id}
        sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}
      >
        [+] {label}
        <input
          id={id}
          type="file"
          hidden
          accept="image/*"
          onChange={onChange}
        />
      </Button>
      <Typography variant="body2" sx={{ fontFamily: 'monospace', color: file ? 'text.primary' : 'text.secondary', wordBreak: 'break-all' }}>
        {file ? file.name : 'no_file_chosen.png'}
      </Typography>
    </Box>
  );

  return (
    <>
      <SEO 
        title="Contact Us | Linuxdle" 
        description="Contact the Linuxdle team to submit a bug, request a new command, distribution, or desktop environment." 
      />
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={0} sx={{ p: { xs: 2, md: 4 }, bgcolor: 'background.paper', border: 1, borderColor: 'divider' }}>
          <Box mb={4}>
            <Typography variant="h4" component="h1" fontWeight="bold" sx={{ color: 'primary.main', mb: 2 }}>
              {`_ > CONTACT_US`}
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            <Typography variant="body1" paragraph>
              Have feedback, found a bug, or want to suggest a new entry for our daily puzzles? Fill out the form below.
            </Typography>
          </Box>

          {submitted && (
            <Alert severity="success" sx={{ mb: 4, fontFamily: 'monospace' }}>
              Message successfully transmitted to /dev/null. (Kidding! We got it. Thanks for your feedback.)
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              required
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
              variant="outlined"
            />

            <TextField
              required
              select
              label="Subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              fullWidth
              variant="outlined"
            >
              <MenuItem value="bug">Submit a Bug</MenuItem>
              <MenuItem value="command">Command Request</MenuItem>
              <MenuItem value="distro">Distro Request</MenuItem>
              <MenuItem value="de">DE Request</MenuItem>
            </TextField>

            {subject === 'bug' && (
              <>
                <TextField
                  required
                  label="Bug Description"
                  multiline
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  fullWidth
                  variant="outlined"
                />
                
                <ThemedFileInput 
                  id="bug-file-input"
                  label="CHOOSE_SCREENSHOT"
                  file={bugFile}
                  onChange={(e) => setBugFile(e.target.files ? e.target.files[0] : null)}
                />
              </>
            )}

            {subject === 'command' && (
              <TextField
                required
                label="Suggested Command Name"
                value={commandName}
                onChange={(e) => setCommandName(e.target.value)}
                fullWidth
                variant="outlined"
                placeholder="e.g. grep, ls, awk"
              />
            )}

            {subject === 'distro' && (
              <>
                <TextField
                  required
                  label="Suggested Distro Name"
                  value={distroName}
                  onChange={(e) => setDistroName(e.target.value)}
                  fullWidth
                  variant="outlined"
                  placeholder="e.g. Ubuntu, Arch, Fedora"
                />
                
                <ThemedFileInput 
                  id="distro-file-input"
                  label="CHOOSE_DISTRO_LOGO"
                  file={distroFile}
                  onChange={(e) => setDistroFile(e.target.files ? e.target.files[0] : null)}
                />
              </>
            )}

            {subject === 'de' && (
              <>
                <FormControl component="fieldset" sx={{ mt: 1 }}>
                  <FormLabel component="legend" sx={{ fontFamily: 'monospace' }}>DE Request Type</FormLabel>
                  <RadioGroup
                    row
                    value={deRequestType}
                    onChange={(e) => setDeRequestType(e.target.value)}
                  >
                    <FormControlLabel value="existing" control={<Radio color="primary" />} label="Submit screenshot for existing DE" />
                    <FormControlLabel value="new" control={<Radio color="primary" />} label="Ask to add whole new DE" />
                  </RadioGroup>
                </FormControl>

                {deRequestType === 'new' && (
                  <TextField
                    required
                    label="Desktop Environment Name"
                    value={deName}
                    onChange={(e) => setDeName(e.target.value)}
                    fullWidth
                    variant="outlined"
                    placeholder="e.g. KDE Plasma, GNOME, XFCE"
                  />
                )}

                {deRequestType === 'existing' && (
                  <Box>
                    <ThemedFileInput 
                      id="de-file-input"
                      label="CHOOSE_DE_SCREENSHOT"
                      file={deFile}
                      onChange={(e) => setDeFile(e.target.files ? e.target.files[0] : null)}
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1, ml: 1, fontFamily: 'monospace' }}>
                      * Please provide a high-quality unedited screenshot image.
                    </Typography>
                  </Box>
                )}
              </>
            )}

            <Button 
              type="submit" 
              variant="contained" 
              color="primary" 
              size="large"
              sx={{ mt: 2, alignSelf: 'flex-start', fontFamily: 'monospace', fontWeight: 'bold' }}
            >
              [+] SUBMIT
            </Button>
          </Box>
        </Paper>
      </Container>
    </>
  );
};

export default ContactUs;
