import { refresh } from "../features/gamelist/gamelistActions";
import { getUser } from "../features/user/userActions";
import { subscribeSocket } from "./socket";
import { AppThunk } from "./store";

export const initAction = (): AppThunk => async (dispatch) => {
  await dispatch(getUser());
  subscribeSocket(dispatch);
  dispatch(refresh());

}