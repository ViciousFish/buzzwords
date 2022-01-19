import axios from "axios";
import * as R from "ramda";
import { Api } from "../../app/Api";

import { getApiUrl } from "../../app/apiPrefix";
import { AppThunk } from "../../app/store";
import { nicknameSet, opponentReceived, User, userReceived } from "./userSlice";

interface ApiUser extends User {
  authToken: string | null;
}

export const getUser = (): AppThunk => async (dispatch) => {
  const { data: user } = await Api.get<ApiUser>(getApiUrl("/user"));

  if (user.authToken) {
    storeAuthToken(user.authToken);
  }

  dispatch(userReceived(R.omit(["authToken"], user)));
};

export const setNickname =
  (nickname: string): AppThunk =>
  async (dispatch, getState) => {
    const id = getState().user.user?.id;
    if (!id) {
      console.error("couldn't set nickname on user without ID");
      return;
    }
    try {
      await Api.post(getApiUrl("/user/nickname"), {
        nickname,
      });
    } catch (e) {
      throw e.response?.data?.message ?? e.toString();
    }
    dispatch(nicknameSet(nickname));
  };

export const fetchOpponent =
  (id: string): AppThunk =>
  async (dispatch) => {
    const opponent = await Api.get<User>(getApiUrl("/user", id));
    console.log("opponent", opponent.data);
    dispatch(opponentReceived(opponent.data));
  };

export const storeAuthToken = (token: string) =>
  localStorage.setItem("authToken", token);
export const retrieveAuthToken = () => localStorage.getItem("authToken");
