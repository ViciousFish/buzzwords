import { refresh } from "../features/gamelist/gamelistActions";
import { refreshTokenIfEnabled } from "../features/settings/settingsActions";
import { getUser } from "../features/user/userActions";
import { subscribeToMessages } from "./firebase";
import { subscribeSocket } from "./socket";
import { AppThunk } from "./store";

const ELECTRON = window.versions;

export const initAction =
  (): AppThunk<Promise<() => void>> => async (dispatch) => {
    await dispatch(getUser());
    const cleanup = subscribeSocket(dispatch);
    dispatch(refresh());
    if (!ELECTRON) {
      dispatch(subscribeToMessages());
    }
    refreshTokenIfEnabled();
    return cleanup;
  };
