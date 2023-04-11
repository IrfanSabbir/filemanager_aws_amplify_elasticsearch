import React, { useState } from 'react';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import Grid from '@mui/material/Grid';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import IconButton from '@mui/material/IconButton';

import { elabList, categories, subMenu } from './category';
import { DateRangePicker } from 'react-dates';

import 'react-dates/initialize';
import 'react-dates/lib/css/_datepicker.css';

export default function ItemFIlter({
  filterParams,
  setFilterParams,
  handleRefresh,
  setFrom,
  setPage,
}) {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [focusedInput, setFocusedInput] = useState(null);

  const handleDatesChange = ({ startDate, endDate }) => {
    setStartDate(startDate);
    setEndDate(endDate);
    setFilterParams({
      ...filterParams,
      startDate: startDate?.format('YYYY-MM-DD'),
      endDate: endDate?.format('YYYY-MM-DD'),
    })
  };
  return(
    <div style={{ margin: '10px' }}>
      <Grid container spacing={2} style={{ width: '100%' }} size='small'>
      <Grid item xs={12} sm={6} md={4} lg={4}>
        <DateRangePicker
          startDate={startDate}
          endDate={endDate}
          onDatesChange={handleDatesChange}
          focusedInput={focusedInput}
          onFocusChange={(focusedInput) => setFocusedInput(focusedInput)}
          isOutsideRange={() => false} // allow any date to be selected
        />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={3}>
          <FormControl sx={{ m: 1, minWidth: '100%' }} size='small'>
            <InputLabel id="demo-simple-select-autowidth-label">Category</InputLabel>
            <Select
              labelId="demo-simple-select-autowidth-label"
              id="demo-simple-select-autowidth"
              value={filterParams.category}
              onChange={(e) => setFilterParams({...filterParams, category: e.target.value})}
              width="100%"
              label="category"
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {
                categories.map((item, index) => {
                  return <MenuItem key={index} value={item.value}>{item.name}</MenuItem>
                })
              }
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={4} md={3} lg={2}>
          <FormControl sx={{ m: 1, minWidth: '100%' }} size='small'>
            <InputLabel id="demo-simple-select-autowidth-label">Sub Manu</InputLabel>
            <Select
              labelId="demo-simple-select-autowidth-label"
              id="demo-simple-select-autowidth"
              value={filterParams.subCategory}
              onChange={(e) => setFilterParams({...filterParams, subCategory: e.target.value})}
              width="100%"
              label="subMenu"
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {
                filterParams.category && subMenu[filterParams.category].map((item, index) => {
                  return <MenuItem key={index} value={item.value}>{item.name}</MenuItem>
                })
              }
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={6} sm={4} md={3} lg={3}>
          <FormControl sx={{ m: 1, minWidth: '40%' }} size='small'>
            <InputLabel id="demo-simple-select-autowidth-label">Elab</InputLabel>
            <Select
              
              labelId="demo-simple-select-autowidth-label"
              id="demo-simple-select-autowidth"
              value={filterParams.elab }
              onChange={(e) => setFilterParams({...filterParams, elab: e.target.value})}
              width="40%"
              
              label="elab"
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {
                elabList.map((item, index) => {
                  return <MenuItem key={index} value={item.value}>{item.name}</MenuItem>
                })
              }
            </Select>
          </FormControl>
          <IconButton
            onClick={() => {
              setFilterParams({
                category: '',
                subCategory: '',
                elab: '',
                startDate: null,
                endDate: null,
              });
              setStartDate(null);
              setEndDate(null);
              setFocusedInput(null);
              setFrom(0);
              setPage(1);
              handleRefresh();
            }} 
          >
          <CloseIcon color='warning' fontSize='large'/>
          </IconButton>
          <IconButton onClick={() => {
            setFrom(0);
            setPage(1);
            handleRefresh();
          }} >
            <SearchIcon color='primary' fontSize='large'/>
          </IconButton>
        </Grid>
       

      </Grid>
    </div>
  )
}