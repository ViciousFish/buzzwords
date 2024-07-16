import { AppThunk } from "../../app/store";
import { endlessActions } from "./endlessSlice";

export const endlessInitThunk = (): AppThunk => async (dispatch, getState) => {
  dispatch(
    endlessActions.createEndlessGame({
      radius: 3,
      initialLetters: ["h", "e", "l", "l", "o", "s"],
    })
  );

  import("../../assets/most-common-words.txt?raw").then((module) => {
    const words = module.default.split("\n");
    dispatch(endlessActions.setWords({ words, wordSet: "common" }));
  });

  import("../../assets/all-words.txt?raw").then((module) => {
    const words = module.default.split("\n");
    dispatch(endlessActions.setWords({words, wordSet: "all"}));
  });

  // fetch words list
  // init endless game
};
