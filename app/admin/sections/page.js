'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Button,
  IconButton,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  RadioGroup,
  FormControlLabel,
  Radio,
  Paper,
  Chip,
  Avatar,
  Tooltip,
  Skeleton,
} from '@mui/material';
import {
  ArrowBack,
  Add,
  Delete,
  DragHandle,
  Movie,
  LocalMovies,
  Category,
  Save,
} from '@mui/icons-material';
import { motion } from 'motion/react';
import { toast } from 'react-hot-toast';

export default function SectionsManagementPage() {
  const router = useRouter();
  const [sections, setSections] = useState([]);
  const [industries, setIndustries] = useState([]);
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [sectionToDelete, setSectionToDelete] = useState(null);
  const [draggedItem, setDraggedItem] = useState(null);

  // Form states
  const [sectionName, setSectionName] = useState('');
  const [sectionType, setSectionType] = useState('industry');
  const [selectedValue, setSelectedValue] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [sectionsRes, industriesRes, genresRes] = await Promise.all([
        fetch('/api/admin/sections'),
        fetch('/api/admin/industries'),
        fetch('/api/admin/genres'),
      ]);

      if (sectionsRes.ok) {
        const sectionsData = await sectionsRes.json();
        setSections(sectionsData);
      }

      if (industriesRes.ok) {
        const industriesData = await industriesRes.json();
        setIndustries(industriesData.industries || []);
      }

      if (genresRes.ok) {
        const genresData = await genresRes.json();
        setGenres(genresData.genres || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Error fetching data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSection = async () => {
    if (!sectionName || !selectedValue) {
      toast.error('Please fill in all fields');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/admin/sections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: sectionName,
          section_type: sectionType,
          filter_value: selectedValue,
        }),
      });

      if (res.ok) {
        const newSection = await res.json();
        setSections([...sections, newSection]);
        setCreateModalOpen(false);
        resetForm();
        toast.success('Section created successfully');
      } else {
        const error = await res.json();
        toast.error('Error creating section: ' + error.message);
      }
    } catch (error) {
      console.error('Error creating section:', error);
      toast.error('Error creating section: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSection = async () => {
    if (!sectionToDelete) return;

    try {
      const res = await fetch(`/api/admin/sections/${sectionToDelete.id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setSections(sections.filter((s) => s.id !== sectionToDelete.id));
        setDeleteModalOpen(false);
        setSectionToDelete(null);
        toast.success('Section deleted successfully');
      } else {
        toast.error('Error deleting section: ' + error.message);
      }
    } catch (error) {
      console.error('Error deleting section:', error);
      toast.error('Error deleting section: ' + error.message);
    }
  };

  const handleDragStart = (e, index) => {
    setDraggedItem(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedItem === null || draggedItem === index) return;

    const newSections = [...sections];
    const draggedSection = newSections[draggedItem];
    newSections.splice(draggedItem, 1);
    newSections.splice(index, 0, draggedSection);

    // Update sort_order
    newSections.forEach((section, i) => {
      section.sort_order = i + 1;
    });

    setSections(newSections);
    setDraggedItem(index);
  };

  const handleSaveOrder = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/sections', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sections: sections.map((s, index) => ({
            id: s.id,
            sort_order: index + 1,
          })),
        }),
      });

      if (res.ok) {
        toast.success('Section order saved successfully');
      } else {
        toast.error('Failed to save section order');
      }
    } catch (error) {
      console.error('Error saving order:', error);
      toast.error('Failed to save section order');
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setSectionName('');
    setSectionType('industry');
    setSelectedValue('');
  };

  const getSectionIcon = (type) => {
    return type === 'industry' ? <LocalMovies /> : <Category />;
  };

  const getSectionLabel = (type, value) => {
    if (type === 'industry') {
      const industry = industries.find((i) => i.name === value);
      return industry?.name || value;
    } else {
      const genre = genres.find((g) => g.name === value);
      return genre?.name || value;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Link href="/admin" passHref style={{ textDecoration: 'none' }}>
              <IconButton sx={{ color: 'text.secondary' }}>
                <ArrowBack />
              </IconButton>
            </Link>
            <Box>
              <Typography variant="h5" fontWeight="bold">
                Home Page Sections
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Manage dynamic sections displayed on the home page
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<Save />}
              onClick={handleSaveOrder}
              disabled={saving || sections.length === 0}
              sx={{ borderRadius: 3 }}
            >
              {saving ? 'Saving...' : 'Save Order'}
            </Button>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setCreateModalOpen(true)}
              sx={{ borderRadius: 3 }}
            >
              Create Section
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Sections List */}
      <Box sx={{ maxWidth: 900, mx: 'auto' }}>
        {loading ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} variant="rectangular" height={80} sx={{ borderRadius: 3 }} />
            ))}
          </Box>
        ) : sections.length === 0 ? (
          <Card sx={{ textAlign: 'center', py: 8 }}>
            <CardContent>
              <Movie sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No sections created yet
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Create sections to display industry or genre-based movie collections on the home
                page
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setCreateModalOpen(true)}
                sx={{ borderRadius: 3 }}
              >
                Create Your First Section
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {sections.map((section, index) => (
              <motion.div
                key={section.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Card
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragEnd={handleDragEnd}
                  onDragOver={(e) => handleDragOver(e, index)}
                  sx={{
                    cursor: 'move',
                    border: draggedItem === index ? '2px dashed' : '1px solid transparent',
                    borderColor: draggedItem === index ? 'primary.main' : 'divider',
                    borderRadius: 3,
                    '&:hover': { borderColor: 'primary.main', border: '1px solid' },
                    transition: 'all 0.2s ease',
                    opacity: draggedItem === index ? 0.7 : 1,
                  }}
                >
                  <CardContent
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      py: 2,
                      '&:last-child': { pb: 2 },
                    }}
                  >
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      <DragHandle sx={{ color: 'white' }} />
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" fontWeight="medium">
                        {section.name}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                        <Chip
                          icon={getSectionIcon(section.section_type)}
                          label={section.section_type === 'industry' ? 'Industry Based' : 'Genre Based'}
                          size="small"
                          color={section.section_type === 'industry' ? 'primary' : 'secondary'}
                        />
                        <Chip
                          label={getSectionLabel(section.section_type, section.filter_value)}
                          size="small"
                          variant="outlined"
                        />
                        <Chip
                          label={`Max: ${section.max_items} items`}
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                    </Box>
                    <Tooltip title="Delete Section">
                      <IconButton
                        color="error"
                        onClick={() => {
                          setSectionToDelete(section);
                          setDeleteModalOpen(true);
                        }}
                      >
                        <Delete />
                      </IconButton>
                    </Tooltip>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </Box>
        )}
      </Box>

      {/* Create Section Modal */}
      <Dialog
        open={createModalOpen}
        onClose={() => {
          setCreateModalOpen(false);
          resetForm();
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create New Section</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
            <TextField
              fullWidth
              label="Section Name"
              placeholder="e.g., Hollywood Movies, Action Films"
              value={sectionName}
              onChange={(e) => setSectionName(e.target.value)}
              required
            />

            <FormControl component="fieldset">
              <Typography variant="subtitle2" gutterBottom>
                Section Type
              </Typography>
              <RadioGroup
                row
                value={sectionType}
                onChange={(e) => {
                  setSectionType(e.target.value);
                  setSelectedValue('');
                }}
              >
                <FormControlLabel
                  value="industry"
                  control={<Radio />}
                  label="Industry Based"
                />
                <FormControlLabel value="genre" control={<Radio />} label="Genre Based" />
              </RadioGroup>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>
                {sectionType === 'industry' ? 'Select Industry' : 'Select Genre'}
              </InputLabel>
              <Select
                value={selectedValue}
                onChange={(e) => setSelectedValue(e.target.value)}
                label={sectionType === 'industry' ? 'Select Industry' : 'Select Genre'}
              >
                {sectionType === 'industry'
                  ? industries.map((industry) => (
                      <MenuItem key={industry.id} value={industry.name}>
                        {industry.name}
                      </MenuItem>
                    ))
                  : genres.map((genre) => (
                      <MenuItem key={genre.id} value={genre.name}>
                        {genre.name}
                      </MenuItem>
                    ))}
              </Select>
            </FormControl>

            <Typography variant="body2" color="text.secondary">
              {sectionType === 'industry'
                ? `This section will display up to 12 movies from the "${selectedValue || 'selected'}" industry.`
                : `This section will display up to 10 movies with the "${selectedValue || 'selected'}" genre.`}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setCreateModalOpen(false);
              resetForm();
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleCreateSection}
            disabled={saving || !sectionName || !selectedValue}
          >
            {saving ? 'Creating...' : 'Create Section'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)}>
        <DialogTitle>Delete Section</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the section &quot;{sectionToDelete?.name}&quot;? This
            action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteModalOpen(false)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleDeleteSection}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
}
