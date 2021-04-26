import {extensionEvent} from '@/lib/extensionEvent';

export default {
  name: 'subscribeToEvents',
  handle: async function (task) {
    const {tabId} = task;
    await extensionEvent.subscribe(tabId);

    return {};
  }
}
