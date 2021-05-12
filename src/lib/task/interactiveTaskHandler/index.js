import deployWalletContract from "@/lib/task/interactiveTaskHandler/deployWalletContract";
import uiTransfer from "@/lib/task/interactiveTaskHandler/uiTransfer";

const handlers = [deployWalletContract, uiTransfer];
export default {
  get(id) {
    for (const handler of handlers) {
      if (handler.id === id) {
        return handler;
      }
    }
    throw `Interactive task handler #${id} isn't found.`;
  }
}
