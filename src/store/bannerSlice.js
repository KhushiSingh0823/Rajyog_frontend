import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Async thunk to fetch banners from backend
export const fetchBanners = createAsyncThunk(
  "banner/fetchBanners",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/banners`);
      const bannersWithFullImage = res.data.map((b) => ({
        ...b,
        image: `${import.meta.env.VITE_API_URL}/uploads/banners/${b.image}`,
      }));
      return bannersWithFullImage;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

const bannerSlice = createSlice({
  name: "banner",
  initialState: {
    banners: [],
    loading: false,
    error: null,
  },
  reducers: {
    setBanners: (state, action) => {
      state.banners = action.payload;
    },
    addBanner: (state, action) => {
      state.banners.push(action.payload);
    },
    updateBanner: (state, action) => {
      state.banners = state.banners.map((b) =>
        b._id === action.payload._id ? action.payload : b
      );
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBanners.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBanners.fulfilled, (state, action) => {
        state.loading = false;
        state.banners = action.payload;
      })
      .addCase(fetchBanners.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// ✅ Export reducers for BannerList.jsx
export const { setBanners, addBanner, updateBanner } = bannerSlice.actions;

export default bannerSlice.reducer;
