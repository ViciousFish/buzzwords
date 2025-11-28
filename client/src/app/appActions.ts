import { refresh } from "../features/gamelist/gamelistActions";
import { refreshTokenIfEnabled } from "../features/settings/settingsActions";
import { getUser } from "../features/user/userActions";
import { subscribeToMessages } from "./firebase";
import { subscribeSocket } from "./socket";
import { AppThunk } from "./store";
import { initializeFirstTutorialIfNeeded } from "../features/bgio-board/localBotThunks";

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
    // Initialize first tutorial game if needed (only creates one if none exists)
    dispatch(initializeFirstTutorialIfNeeded());
    return cleanup;
  };
