import database from '@/db';
import {extensionEvent, extensionEventType} from "@/lib/extensionEvent";

export default {
  name: 'changeNetwork',
  handle: async function (task) {
    const {network} = task.data;
    const db = await database.getClient();
    await db.param.update('network', {value: network});
    extensionEvent.emit(extensionEventType.changeNetwork).then();
  }
}
