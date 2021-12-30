import { subscribeSocket } from "../../app/socket";
import { AppThunk } from "../../app/store";
import { User, userReceived } from "./userSlice";

export const getUser = (): AppThunk => async (dispatch) => {
  const user: User = await fetch('/api/user').then(res => res.json());
  console.log('user', user);

  subscribeSocket(dispatch);
  dispatch(userReceived(user));
}