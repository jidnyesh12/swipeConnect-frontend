import { createSlice } from "@reduxjs/toolkit";

const requestSlice = createSlice({
  name: "request",
  initialState: {
    received: null,
    sent: null,
    loading: false,
    refreshing: false,
    error: "",
    actionLoading: {},
  },
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setRefreshing: (state, action) => {
      state.refreshing = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    setActionLoading: (state, action) => {
      const { requestId, loading } = action.payload;
      if (loading) {
        state.actionLoading[requestId] = true;
      } else {
        delete state.actionLoading[requestId];
      }
    },
    addReceivedRequests: (state, action) => {
      state.received = action.payload;
    },
    addSentRequests: (state, action) => {
      state.sent = action.payload;
    },
    removeReceivedRequest: (state, action) => {
      if (state.received) {
        state.received = state.received.filter(
          (req) => req._id !== action.payload
        );
      }
    },
    removeSentRequest: (state, action) => {
      if (state.sent) {
        state.sent = state.sent.filter((req) => req._id !== action.payload);
      }
    },
    clearRequests: (state) => {
      state.received = null;
      state.sent = null;
      state.error = "";
      state.actionLoading = {};
    },
    // Legacy actions for backward compatibility
    addRequest: (state, action) => {
      state.received = action.payload;
    },
    removeRequests: (state) => {
      state.received = null;
      state.sent = null;
    },
    removeRequest: (state, action) => {
      if (state.received) {
        state.received = state.received.filter(
          (req) => req._id !== action.payload
        );
      }
    },
  },
});

export const {
  setLoading,
  setRefreshing,
  setError,
  setActionLoading,
  addReceivedRequests,
  addSentRequests,
  removeReceivedRequest,
  removeSentRequest,
  clearRequests,
  // Legacy exports
  addRequest,
  removeRequests,
  removeRequest,
} = requestSlice.actions;

export default requestSlice.reducer;
