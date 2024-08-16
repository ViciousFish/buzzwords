import { refresh } from "../features/gamelist/gamelistActions";
import { getUser } from "../features/user/userActions";
import { subscribeSocket } from "./socket";
import { AppThunk } from "./store";

export const initAction = (): AppThunk<Promise<() => void>> => async (dispatch) => {
  await dispatch(getUser());
  const cleanup = subscribeSocket(dispatch);
  dispatch(refresh());
  return cleanup;
}