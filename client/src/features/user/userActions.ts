import * as R from "ramda";
import { toast } from "react-toastify";
import { Api } from "../../app/Api";

import { getApiUrl } from "../../app/apiPrefix";
import { AppThunk } from "../../app/store";
import { nicknameSet, opponentReceived, User, userReceived } from "./userSlice";

interface ApiUser extends User {
  authToken: string | null;
}

export const getUser = (): AppThunk => async (dispatch) => {
  const { data: user } = await Api.get<ApiUser>(getApiUrl("/user"));

  dispatch(userReceived(user));
};

const ELECTRON = Boolean(window.versions);

export const getGoogleLoginURL = (): AppThunk => async (dispatch) => {
  const { data } = await Api.post<{ url: string }>(
    getApiUrl(`/login/google`),
    null,
    {
      headers: {
        "x-context": ELECTRON ? "electron" : "web",
      },
    }
  );

  if (ELECTRON) {
    window.open(data.url);
  } else {
    window.location.href = data.url;
  }
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
    dispatch(opponentReceived(opponent.data));
  };

export const storeAuthToken = (token: string) =>
  localStorage.setItem("authToken", token);
export const retrieveAuthToken = () => localStorage.getItem("authToken");
export const deleteAuthToken = () => localStorage.removeItem("authToken");

export const logout = (): AppThunk => async () => {
  try {
    await Api.post(getApiUrl("/logout"));
    deleteAuthToken();
    window.location.reload();
  } catch (e) {
    toast(e.response?.data?.message ?? e.toString(), { type: "error" });
  }
};
