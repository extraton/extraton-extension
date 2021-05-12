import {paramRepository} from "@/db/repository/paramRepository";

export default {
  name: 'setPage',
  handle: async function (i18n, task) {
    await paramRepository.createOrUpdate('page', task.data);
  }
}
