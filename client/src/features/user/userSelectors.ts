import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "../../app/store";

export const getAllUsers = createSelector(
  (state: RootState) => state.user.opponents,
  (state: RootState) => state.user.user,
  (opponents, selfUser) => {
    const allUsers = {
      ...opponents
    }
    if (selfUser) {
      allUsers[selfUser.id] = selfUser
    }
    return allUsers;
  }
)