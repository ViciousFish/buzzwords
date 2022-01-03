import { AppThunk } from "../../app/store";
import { nicknameSet, opponentReceived, User, userReceived } from "./userSlice";

export const getUser = (): AppThunk => async (dispatch) => {
  const user: User = await fetch("/api/user").then((res) => res.json());
  console.log("user", user);

  dispatch(userReceived(user));
};

export const setNickname =
  (nickname: string): AppThunk =>
  async (dispatch, getState) => {
    const id = getState().user.user?.id;
    if (!id) {
      console.error("couldn't set nickname on user without ID");
      return;
    }
    await fetch(`/api/user/nickname`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nickname,
      }),
    });

    dispatch(nicknameSet(nickname));
  };

export const fetchOpponent =
  (id: string): AppThunk =>
  async (dispatch) => {
    const opponent: User = await fetch(`/api/user/${id}`).then((res) =>
      res.json()
    );
    console.log('opponent', opponent)
    dispatch(opponentReceived(opponent))
  };
