// Import/Export utility functions

export const parseCSV = (csvText) => {
  const lines = csvText.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  const entries = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
    const entry = {};
    headers.forEach((header, index) => {
      entry[header] = values[index] || '';
    });
    entries.push(entry);
  }
  
  return entries;
};

export const parse1PasswordCSV = (csvText) => {
  const entries = parseCSV(csvText);
  return entries.map(entry => ({
    site: entry.title || entry.name || '',
    user: entry.username || entry.email || '',
    pass: entry.password || '',
    category: 'other',
    tags: []
  }));
};

export const parseLastPassCSV = (csvText) => {
  const entries = parseCSV(csvText);
  return entries.map(entry => ({
    site: entry.name || entry.url || '',
    user: entry.username || entry.email || '',
    pass: entry.password || '',
    category: 'other',
    tags: []
  }));
};

export const parseKeeperCSV = (csvText) => {
  const lines = csvText.trim().split('\n');
  const entries = [];
  
  // Skip header row and process each line
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
    
    // Keeper format: "", "TITLE", "USERNAME", "PASSWORD", "URL", "", ""
    if (values.length >= 5) {
      const entry = {
        site: values[1] || '', // Title
        user: values[2] || '', // Username
        pass: values[3] || '', // Password
        category: 'other',
        tags: []
      };
      
      // Only add if we have at least a site and password
      if (entry.site && entry.pass) {
        entries.push(entry);
      }
    }
  }
  
  return entries;
};

export const parseGenericCSV = (csvText) => {
  const entries = parseCSV(csvText);
  return entries.map(entry => ({
    site: entry.site || entry.title || entry.name || entry.url || '',
    user: entry.user || entry.username || entry.email || '',
    pass: entry.pass || entry.password || '',
    category: entry.category || 'other',
    tags: entry.tags ? entry.tags.split(',').map(t => t.trim()) : []
  }));
};

export const exportToCSV = (vault) => {
  const headers = ['site', 'user', 'pass', 'category', 'tags'];
  const csvRows = [headers.join(',')];
  
  vault.forEach(entry => {
    const row = [
      `"${entry.site || ''}"`,
      `"${entry.user || ''}"`,
      `"${entry.pass || ''}"`,
      `"${entry.category || 'other'}"`,
      `"${(entry.tags || []).join(', ')}"`
    ];
    csvRows.push(row.join(','));
  });
  
  return csvRows.join('\n');
};

export const downloadFile = (content, filename, mimeType) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}; 