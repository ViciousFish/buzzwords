import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface User {
  id: string;
}

// Define a type for the slice state
interface UserState {
  user: User | null;
}

// Define the initial state using that type
const initialState: UserState = {
  user: null,
};

export const gamelistSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    userReceived: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const { userReceived } = gamelistSlice.actions;

// Other code such as selectors can use the imported `RootState` type
// export const selectCount = (state: RootState) => state.counter.value;

export default gamelistSlice.reducer;
