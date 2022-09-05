import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Move } from "buzzwords-shared/Game";

interface DictionarySidebarProps {
  move: Move;
  index: number;
}

export enum RightSidebarPages {
  Closed = 'closed',
  Dictionary = 'dictionary',
  Tutorial = 'tutorial'
}
// Define a type for the slice state
interface RightSidebarState {
  page: RightSidebarPages,
  props: DictionarySidebarProps | null;
}

// Define the initial state using that type
const initialState: RightSidebarState = {
  page: RightSidebarPages.Closed,
  props: null,
};

export const rightSidebarSlice = createSlice({
  name: "rightSidebar",
  initialState,
  reducers: {
  },
});

// Action creators are generated for each case reducer function
export const {
} = rightSidebarSlice.actions;

// Other code such as selectors can use the imported `RootState` type
// export const selectCount = (state: RootState) => state.counter.value;

export default rightSidebarSlice.reducer;
