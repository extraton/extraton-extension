import database from '@/db';
import {extensionEvent, extensionEventType} from "@/lib/extensionEvent";

export default {
  name: 'logout',
  handle: async function () {
    extensionEvent.emit(extensionEventType.logout).then();
    await database.fresh();
  }
}
