<template>
  <div class="startView">
    <create-or-restore :route-create="routes.walletCreate" :route-restore="routes.walletRestore"/>
  </div>
</template>

<script>
import CreateOrRestore from "@/components/CreateOrRestore";
import {routes} from '@/plugins/router'

export default {
  components: {CreateOrRestore},
  data: () => ({
    routes,
  }),
}
</script>

<style lang="scss">
.startView {
  padding-top: 50px;
}
</style>
