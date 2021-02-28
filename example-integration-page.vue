<template>
  <!-- Pour des raisons de confidentialités, seul une partie du code est visible-->
  <layout-default>
    <h1>Galerie photo</h1>
    <!-- ############ INCLUDES MODULES ############ -->
    <galerie moduleName="galerie1"></galerie>
  </layout-default>
</template>
<script>
import LayoutDefault from "@/layouts/LayoutDefault.vue";
// ############ IMPORT MODULES ############ -->
import galerie from "@/components/AppGalerie/galerie";
export default {
  components: {
    "layout-default": LayoutDefault,
    galerie,
  },
};
</script>
