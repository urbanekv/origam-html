import { flow } from "mobx";
import { handleError } from "model/actions/handleError";
import { getChatrooms } from "model/selectors/Chatrooms/getChatrooms";

export function onRefreshChatrooms(ctx: any) {
  return function *onRefreshChatrooms(){
    try {
      yield* getChatrooms(ctx).getChatroomsList();
    } catch (e) {
      yield* handleError(ctx)(e);
      console.log("Error during getChatroomsList call ignored.");
    };
  }
}
