import {siteRepository} from "../../../db/repository/siteRepository";

export default {
  name: 'removeSite',
  handle: async function (task) {
    const {id} = task.data;
    await siteRepository.remove(id);
    const sites = await siteRepository.getAll();
    return {sites};
  }
}
