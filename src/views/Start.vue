<template>
  <div class="startView">
    <create-or-restore :route-create="routes.walletCreate" :route-restore="routes.walletRestore"/>
    <select-language/>
  </div>
</template>

<script>
import CreateOrRestore from "@/components/CreateOrRestore";
import {routes} from '@/plugins/router'
import SelectLanguage from "@/components/SelectLanguage";

export default {
  components: {SelectLanguage, CreateOrRestore},
  data: () => ({
    routes,
  }),
}
</script>

<style lang="scss">
.startView {
  padding-top: 110px;
}
</style>
