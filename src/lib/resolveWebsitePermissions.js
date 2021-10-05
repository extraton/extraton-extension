import {siteRepository} from "../db/repository/siteRepository";
import {interactiveTaskRepository, interactiveTaskType} from "../db/repository/interactiveTaskRepository";
import {paramRepository} from "../db/repository/paramRepository";
import {sleep} from "./sleep";
import popupLib from '@/lib/popup';
import permitSite from "./task/interactive/callback/permitSite";

async function resolvePermissions(site) {
  if (null !== site.isPermitted) {
    return site;
  }
  const siteId = site.id;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const site = await siteRepository.getById(siteId);
    if (null !== site.isPermitted) {
      return site;
    }
    await sleep(1000);
  }
}

export async function resolveWebsitePermissions(sender) {
  const networkId = await paramRepository.get('network');
  const walletId = await paramRepository.find('wallet');
  const url = new URL(sender.origin);
  const {isCreated, site} = await siteRepository.getOrCreateIgnore(url.host, networkId, walletId);
  if (isCreated) {
    const callback = {name: permitSite.name, params: []};
    await interactiveTaskRepository.createTask(interactiveTaskType.permitSite, networkId, null, {}, {
      siteId: site.id,
      host: url.host,
      callback,
    });
    await popupLib.callPopup();
  }
  return await resolvePermissions(site);
}
