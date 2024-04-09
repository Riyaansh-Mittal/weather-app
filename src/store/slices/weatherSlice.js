import {createAsyncThunk} from '@reduxjs/toolkit';
import axios from 'axios';
import { appId, hostName } from '../../config/config';
import { createSlice } from '@reduxjs/toolkit';

export const getCityData = createAsyncThunk("city", async (obj) => {
    try {
      const request = await axios.get(
        `${hostName}/data/2.5/weather?q=${obj.city}&units=${obj.unit}&APPID=${appId}`
      );
      const response = await request.data;
      return {
        data: response,
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: error.response.data.message,
      };
    }
  });

  const weatherSlice = createSlice({
    name: "weather",
    initialState: {
      citySearchLoading: false,
      citySearchData: null,
    },
    extraReducers: (builder) => {
      builder
        // city search
        .addCase(getCityData.pending, (state) => {
          state.citySearchLoading = true;
          state.citySearchData = null;
        })
        .addCase(getCityData.fulfilled, (state, action) => {
          state.citySearchLoading = false;
          state.citySearchData = action.payload;
        })
    },
  });
  
  export default weatherSlice.reducer;
