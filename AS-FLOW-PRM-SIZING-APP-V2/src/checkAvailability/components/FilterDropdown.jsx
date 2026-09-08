import React, { useState } from "react";
import {
  Box,
  Button,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Popover,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import IconButton from "@mui/material/IconButton";

export default function FilterDropdown(prop) {
  const {
    ParentSapNumber,
    LeacyMaterialNumber,
    Availabilty,
    filters,
    setFilters,
  } = prop;
  const [anchorEl, setAnchorEl] = useState(null);

  const open = Boolean(anchorEl);

  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const clearAllFilters = () => {
    setFilters((prev) => ({
      materials: [],
      lmaterials: [],
      availability: [],
    }));
  };

  const handleDeleteChip = (key, valueToDelete) => {
    setFilters((prev) => ({
      ...prev,
      [key]: prev[key].filter((item) => item !== valueToDelete),
    }));
  };

  return (
    <Box>
      {/* <FilterAltIcon sx={{ marginLeft: "20px" }} onClick={handleOpen} /> */}

      <IconButton
        onClick={handleOpen}
        sx={{
          ml: "20px",
          borderRadius: "8px", // makes it square (not round)
          boxShadow: 2, // depth
          width: 40,
          height: 40,
          bgcolor: "background.paper",
          "&:hover": {
            boxShadow: 6,
            bgcolor: "action.hover",
          },
          transition: "all 0.2s ease-in-out",
        }}
      >
        <FilterAltIcon />
      </IconButton>

      <Stack
        sx={{ marginLeft: "20px" }}
        direction="row"
        spacing={1}
        flexWrap="wrap"
        useFlexGap
      >
        {/* Add clear all button */}
        {(filters.materials.length > 0 || filters.lmaterials.length > 0) && (
          <Chip label={`Clear All`} onClick={() => clearAllFilters()} />
        )}
        {filters.materials
          .sort((a, b) => String(a).localeCompare(String(b)))
          .map((item) => (
            <Chip
              key={item}
              label={`${item}`}
              onDelete={() => handleDeleteChip("materials", item)}
            />
          ))}
        {filters.lmaterials
          .sort((a, b) => String(a).localeCompare(String(b)))
          .map((item) => (
            <Chip
              key={item}
              label={`${item}`}
              onDelete={() => handleDeleteChip("lmaterials", item)}
            />
          ))}
        {filters.availability
          .sort((a, b) => String(a).localeCompare(String(b)))
          .map((item) => (
            <Chip
              key={item}
              label={`${item}`}
              onDelete={() => handleDeleteChip("availability", item)}
            />
          ))}
      </Stack>
      <Stack
        direction="row"
        spacing={1}
        flexWrap="wrap"
        mt={2}
        useFlexGap
      ></Stack>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
      >
        <Box p={3} width={"150vh"}>
          <Typography variant="h6" mb={2}>
            Apply Filters
          </Typography>

          <Stack direction="row" spacing={2}>
            {/* Materials */}
            <FormControl fullWidth size="small" sx={{ flex: 1 }}>
              <InputLabel>Materials</InputLabel>
              <Select
                multiple
                value={filters.materials}
                label="Materials"
                onChange={(e) => handleChange("materials", e.target.value)}
              >
                {ParentSapNumber != null &&
                  [...ParentSapNumber]
                    .sort((a, b) => a.localeCompare(b))
                    .map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
              </Select>
            </FormControl>

            {/* Legacy Material */}
            <FormControl fullWidth size="small" sx={{ flex: 1 }}>
              <InputLabel>Legacy Material</InputLabel>
              <Select
                multiple
                value={filters.lmaterials}
                label="Legacy Material"
                onChange={(e) => handleChange("lmaterials", e.target.value)}
              >
                {LeacyMaterialNumber != null &&
                  [...LeacyMaterialNumber]
                    .sort((a, b) => a.localeCompare(b))
                    .map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
              </Select>
            </FormControl>

            {/* Availabilty */}
            <FormControl fullWidth size="small" sx={{ flex: 1 }}>
              <InputLabel>Availability</InputLabel>
              <Select
                multiple
                value={filters.availability}
                label="Availability"
                onChange={(e) => handleChange("availability", e.target.value)}
              >
                {Availabilty != null &&
                  [...Availabilty]
                    .sort((a, b) => a.localeCompare(b))
                    .map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
              </Select>
            </FormControl>
          </Stack>
        </Box>
      </Popover>
    </Box>
  );
}
