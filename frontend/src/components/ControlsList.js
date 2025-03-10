import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import ErrorIcon from "@mui/icons-material/Error";
import InfoIcon from "@mui/icons-material/Info";
import SearchIcon from "@mui/icons-material/Search";
import WarningIcon from "@mui/icons-material/Warning";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import axios from "axios";
import React, { useEffect, useState } from "react";
import ControlAddModal from "./ControlAddModal";
import ControlModal from "./ControlModal";

const API_URL = "http://localhost:8000";

// API functions
const getControls = async (profileId) => {
  return await axios.get(`${API_URL}/controls/profile/${profileId}`);
};

const getControl = async (controlId) => {
  return await axios.get(`${API_URL}/controls/${controlId}`);
};

const updateControl = async (controlId, updatedControl) => {
  return await axios.put(`${API_URL}/controls/${controlId}`, { code: updatedControl });
};

const impactIcons = {
  0: <InfoIcon color="info" />,
  0.5: <WarningIcon color="warning" />,
  1: <ErrorIcon color="error" />,
};

const impactColors = {
  0: "info",
  0.5: "warning",
  1: "error",
};

const ControlsList = ({ selectedProfile }) => {
  const [controls, setControls] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("id");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingControl, setEditingControl] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);

  const theme = useTheme();

  useEffect(() => {
    const fetchControls = async () => {
      if (!selectedProfile) return;

      setLoading(true);
      try {
        const response = await getControls(selectedProfile.id);
        setControls(response.data);
      } catch (err) {
        console.error("Error fetching controls:", err);
        setError("Error fetching controls");
      } finally {
        setLoading(false);
      }
    };
    fetchControls();
  }, [selectedProfile]);

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleEditControl = async (controlId) => {
    setLoading(true);
    try {
      const response = await getControl(controlId);
      setEditingControl({
        id: response.data.id,
        title: response.data.title,
        code: response.data.code,
      });
      setModalOpen(true);
    } catch (err) {
      console.error(err);
      setError("Error fetching control");
    } finally {
      setLoading(false);
    }
  };

  const handleAddControl = async (newControl) => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/controls/`, {
        ...newControl,
        profile_id: selectedProfile.id,
      });
      setControls((prevControls) => [...prevControls, response.data]);
      setAddModalOpen(false);
    } catch (err) {
      console.error(err);
      setError("Error adding control");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveControl = async (updatedControl) => {
    setLoading(true);
    try {
      await updateControl(editingControl.id, updatedControl);
      setControls((prevControls) =>
        prevControls.map((control) =>
          control.id === editingControl.id
            ? { ...control, ...updatedControl }
            : control
        )
      );
      setModalOpen(false);
    } catch (err) {
      console.error(err);
      setError("Error saving control");
    } finally {
      setLoading(false);
    }
  };

  const filteredControls = controls.filter(
    (control) =>
      control.id.toString().includes(searchQuery) ||
      control.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      control.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedControls = filteredControls.sort((a, b) => {
    if (orderBy === "id") {
      return order === "asc"
        ? a.id - b.id
        : b.id - a.id;
    }
    return 0;
  });

  if (!selectedProfile) return <Typography>Please select a profile</Typography>;
  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Paper elevation={3} sx={{ p: 3, backgroundColor: theme.palette.background.paper }}>
      <Typography variant="h5" sx={{ mb: 3, color: theme.palette.primary.main, fontWeight: 'bold' }}>
        Controls for {selectedProfile.name}
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setAddModalOpen(true)}
          sx={{
            backgroundColor: theme.palette.secondary.main,
            '&:hover': {
              backgroundColor: theme.palette.secondary.dark,
            },
          }}
        >
          Add Control
        </Button>
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={() => setAddModalOpen(true)}
          sx={{
            borderColor: theme.palette.secondary.main,
            color: theme.palette.secondary.main,
            '&:hover': {
              borderColor: theme.palette.secondary.dark,
              color: theme.palette.secondary.dark,
            },
          }}
        >
          Add Templated Control
        </Button>
      </Box>
      <TextField
        placeholder="Search controls..."
        variant="outlined"
        size="small"
        sx={{ mb: 3, width: "100%" }}
        onChange={(e) => setSearchQuery(e.target.value)}
        InputProps={{
          startAdornment: <SearchIcon sx={{ color: "action.active", mr: 1 }} />,
        }}
      />
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>
                <TableSortLabel
                  active={orderBy === "id"}
                  direction={orderBy === "id" ? order : "asc"}
                  onClick={() => handleRequestSort("id")}
                >
                  ID
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === "title"}
                  direction={orderBy === "title" ? order : "asc"}
                  onClick={() => handleRequestSort("title")}
                >
                  Title
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === "impact"}
                  direction={orderBy === "impact" ? order : "asc"}
                  onClick={() => handleRequestSort("impact")}
                >
                  Impact
                </TableSortLabel>
              </TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedControls.map((control) => (
              <TableRow key={control.id}>
                <TableCell>{control.id}</TableCell>
                <TableCell>{control.title}</TableCell>
                <TableCell>
                  <Chip
                    label={`Impact ${control.impact}`}
                    icon={impactIcons[control.impact]}
                    color={impactColors[control.impact]}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Tooltip title={control.description} arrow>
                    <Typography
                      variant="body2"
                      sx={{
                        maxWidth: 200,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {control.description}
                    </Typography>
                  </Tooltip>
                </TableCell>
                <TableCell>
                  <Button
                    variant="outlined"
                    startIcon={<EditIcon />}
                    onClick={() => handleEditControl(control.id)}
                    sx={{
                      borderColor: theme.palette.primary.main,
                      color: theme.palette.primary.main,
                      '&:hover': {
                        borderColor: theme.palette.primary.dark,
                        color: theme.palette.primary.dark,
                      },
                    }}
                  >
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {editingControl && (
        <ControlModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          controlCode={editingControl.code}
          onSave={handleSaveControl}
        />
      )}
      <ControlAddModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onAdd={handleAddControl}
      />
    </Paper>
  );
};

export default ControlsList;
