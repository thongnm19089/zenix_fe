import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface collapseState {
  isCollapse: boolean;
}

const getInitialState = (): collapseState => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem("sidebarCollapsed");
    if (saved !== null) {
      try {
        return { isCollapse: JSON.parse(saved) };
      } catch {
        return { isCollapse: false };
      }
    }
  }
  return { isCollapse: false };
};

const initialState: collapseState = getInitialState();

export const collapseSlice = createSlice({
  name: "sideCollapse",
  initialState,
  reducers: {
    setIsCollapse: (state, action: PayloadAction<boolean>) => {
      state.isCollapse = action.payload;
    },
  },
});

export const { setIsCollapse } = collapseSlice.actions;
export default collapseSlice.reducer;
