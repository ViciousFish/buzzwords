import { refresh } from "../features/gamelist/gamelistActions";
import { refreshTokenIfEnabled } from "../features/settings/settingsActions";
import { getUser } from "../features/user/userActions";
import { subscribeToMessages } from "./firebase";
import { subscribeSocket } from "./socket";
import { AppThunk } from "./store";

export const initAction = (): AppThunk<Promise<() => void>> => async (dispatch) => {
  await dispatch(getUser());
  const cleanup = subscribeSocket(dispatch);
  dispatch(refresh());
  dispatch(subscribeToMessages());
  refreshTokenIfEnabled();
  return cleanup;
}