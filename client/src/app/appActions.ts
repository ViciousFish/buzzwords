import { refresh } from "../features/gamelist/gamelistActions";
import { refreshTokenIfEnabled } from "../features/settings/settingsActions";
import { getUser } from "../features/user/userActions";
import { subscribeToMessages } from "./firebase";
import { subscribeSocket } from "./socket";
import { AppThunk } from "./store";

export const initAction = (): AppThunk => async (dispatch) => {
  await dispatch(getUser());
  subscribeSocket(dispatch);
  dispatch(refresh());
  dispatch(subscribeToMessages());
  refreshTokenIfEnabled();
}