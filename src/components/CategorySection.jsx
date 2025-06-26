import React from 'react';
import {
  Box,
  Typography,
  Chip,
  Divider,
  Grid,
  List,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  AccountBalance as BankingIcon,
  Work as WorkIcon,
  ShoppingCart as ShoppingIcon,
  Email as EmailIcon,
  SportsEsports as GamingIcon,
  Public as SocialIcon,
  Category as OtherIcon
} from '@mui/icons-material';
import PasswordCard from './PasswordCard';
import PasswordListItem from './PasswordListItem';

const CategorySection = ({ 
  category, 
  entries, 
  view, 
  onEdit, 
  onDelete, 
  isPasswordVisible, 
  onTogglePassword 
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  if (entries.length === 0) {
    return null;
  }

  const getCategoryIcon = (categoryId) => {
    const iconProps = { 
             sx: { 
         color: category?.color || theme.palette.neutral[500],
        fontSize: 20,
        mr: 1
      } 
    };
    
    switch (categoryId) {
      case 'banking': return <BankingIcon {...iconProps} />;
      case 'work': return <WorkIcon {...iconProps} />;
      case 'shopping': return <ShoppingIcon {...iconProps} />;
      case 'email': return <EmailIcon {...iconProps} />;
      case 'gaming': return <GamingIcon {...iconProps} />;
      case 'social': return <SocialIcon {...iconProps} />;
      default: return <OtherIcon {...iconProps} />;
    }
  };

  return (
    <Box sx={{ mb: 4 }}>
      {/* Category Header */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        mb: 2,
        pb: 1,
        borderBottom: 2,
        borderColor: category?.color || theme.palette.divider
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {getCategoryIcon(category?.id)}
          <Typography 
            variant="h6" 
            component="h3"
            sx={{ 
              fontWeight: 600,
              color: category?.color || 'text.primary'
            }}
          >
            {category?.name || 'Other'}
          </Typography>
        </Box>
        
        <Chip
          label={`${entries.length} ${entries.length === 1 ? 'entry' : 'entries'}`}
          size="small"
          variant="outlined"
          sx={{ 
            borderColor: category?.color || 'divider',
            color: category?.color || 'text.secondary'
          }}
        />
      </Box>

      {/* Entries Display */}
      {view === 'card' ? (
        <Grid container spacing={2}>
          {entries.map((entry, localIndex) => (
            <Grid 
              size={{ xs: 12, sm: 6, md: 4, lg: 3 }}
              key={entry.id || localIndex}
            >
              <PasswordCard
                entry={entry}
                index={localIndex}
                onEdit={onEdit}
                onDelete={onDelete}
                isPasswordVisible={isPasswordVisible(localIndex)}
                onTogglePassword={onTogglePassword}
              />
            </Grid>
          ))}
        </Grid>
      ) : (
        <List disablePadding>
          {entries.map((entry, localIndex) => (
            <PasswordListItem
              key={entry.id || localIndex}
              entry={entry}
              index={localIndex}
              onEdit={onEdit}
              onDelete={onDelete}
              isPasswordVisible={isPasswordVisible(localIndex)}
              onTogglePassword={onTogglePassword}
            />
          ))}
        </List>
      )}
    </Box>
  );
};

export default CategorySection; 