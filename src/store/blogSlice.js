import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = "http://localhost:4000/api/blog";

// -------------------------------
//  FETCH ALL BLOGS
// -------------------------------
export const fetchBlogs = createAsyncThunk(
  "blogs/fetchBlogs",
  async (_, thunkAPI) => {
    try {
      const res = await axios.get(API_URL);
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data || "Error");
    }
  }
);

// -------------------------------
//  FETCH SINGLE BLOG BY ID
// -------------------------------
export const fetchBlogById = createAsyncThunk(
  "blogs/fetchBlogById",
  async (id, thunkAPI) => {
    try {
      const res = await axios.get(`${API_URL}/${id}`);
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data || "Error");
    }
  }
);

// -------------------------------
//  CREATE BLOG
// -------------------------------
export const createBlog = createAsyncThunk(
  "blogs/createBlog",
  async (formData, thunkAPI) => {
    try {
      const res = await axios.post(API_URL, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data || "Error");
    }
  }
);

// -------------------------------
//  UPDATE BLOG
// -------------------------------
export const updateBlog = createAsyncThunk(
  "blogs/updateBlog",
  async ({ id, formData }, thunkAPI) => {
    try {
      const res = await axios.put(`${API_URL}/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data || "Error");
    }
  }
);

// -------------------------------
//  DELETE BLOG
// -------------------------------
export const deleteBlog = createAsyncThunk(
  "blogs/deleteBlog",
  async (id, thunkAPI) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      return id;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data || "Error");
    }
  }
);

// -------------------------------
//  ENABLE / DISABLE BLOG
// -------------------------------
export const toggleBlogStatus = createAsyncThunk(
  "blogs/toggleBlogStatus",
  async ({ id, isEnabled }, thunkAPI) => {
    try {
      const res = await axios.patch(`${API_URL}/${id}/status`, {
        isEnabled,
      });
      return res.data; // updated blog
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data || "Error");
    }
  }
);

const blogSlice = createSlice({
  name: "blogs",
  initialState: {
    blogs: [],
    blog: null,
    loading: false,
    error: null,
  },

  reducers: {},

  extraReducers: (builder) => {
    builder

      // FETCH ALL
      .addCase(fetchBlogs.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchBlogs.fulfilled, (state, action) => {
        state.loading = false;
        state.blogs = action.payload;
        state.error = null;
      })
      .addCase(fetchBlogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // FETCH BY ID
      .addCase(fetchBlogById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchBlogById.fulfilled, (state, action) => {
        state.loading = false;
        state.blog = action.payload;
        state.error = null;
      })
      .addCase(fetchBlogById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // CREATE
      .addCase(createBlog.fulfilled, (state, action) => {
        state.blogs.push(action.payload);
      })

      // UPDATE
      .addCase(updateBlog.fulfilled, (state, action) => {
        state.blogs = state.blogs.map((b) =>
          b._id === action.payload._id ? action.payload : b
        );
      })

      // DELETE
      .addCase(deleteBlog.fulfilled, (state, action) => {
        state.blogs = state.blogs.filter((b) => b._id !== action.payload);
      })

      // TOGGLE ENABLE/DISABLE
      .addCase(toggleBlogStatus.fulfilled, (state, action) => {
        state.blogs = state.blogs.map((b) =>
          b._id === action.payload._id ? action.payload : b
        );
      });
  },
});

export default blogSlice.reducer;
