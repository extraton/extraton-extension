import {siteRepository} from "@/db/repository/siteRepository";
import permitSite from "@/lib/task/interactive/frontPostApply/permitSite";

export default {
  name: 'permitSite',
  handle: async function () {
    const sites = await siteRepository.getAll();
    const frontPostApply = {name: permitSite.name, params: [sites]};

    return frontPostApply;
  }
}
