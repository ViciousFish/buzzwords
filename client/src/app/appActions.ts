import { refresh } from "../features/gamelist/gamelistActions";
import { setOffline } from "../features/settings/settingsSlice";
import { getUser } from "../features/user/userActions";
import { subscribeSocket } from "./socket";
import { AppThunk } from "./store";

export const initAction = (): AppThunk => async (dispatch) => {
  try {
    await dispatch(getUser());
    subscribeSocket(dispatch);
    dispatch(refresh());
  } catch (e) {
    console.log('failed initAction',e);
    dispatch(setOffline(true));
  }
}