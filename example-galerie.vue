<template>
  <b-container>
    <b-col md="12">
      <!-- Menu galerie en ligne-->
      <menu-ligne :menuGallery="menuGallery" :pageName="pageName"></menu-ligne>

      <!-- Galerie thumbnails -->
      <thumbnails :medias="mediasGallery"></thumbnails>
      <!-- Galerie slide with thubnails -->
      <slide-with-tn :medias="mediasGallery" v-if="loadGallery"></slide-with-tn>
    </b-col>
  </b-container>
</template>

<script>
import slideWithTn from "./slideWithTn.vue";
import thumbnails from "./thumbnails.vue";

import jsonConfigBuilder from "@/config-data/config-products.json";
import menuLigne from "./menuLigne.vue";
const URL_API = process.env.VUE_APP_URL_DISTANT_API;
const URL_DATAS_ACTIV = URL_API + "api/galerie/list/activ/";
const URL_CATEGORIES_LIST_FROM = URL_API + "api/categories-from-name/";

export default {
  props: ["moduleName"],
  components: {
    menuLigne,
    thumbnails,
    slideWithTn,
  },

  created: function () {
    this.getCurrentPage();
    this.getCat();
  },

  data() {
    return {
      loadGallery: false,
      urlFTP: process.env.VUE_APP_URL_UPLOAD_FOLDER + process.env.VUE_APP_SITE_ALIAS + "/",

      // variables module
      nbImages: 0,
      dataList: [],
      contentRaw: [],
      pageName: null,

      catName: null,
      scat1Name: null,
      scat2Name: null,
      scat3Name: null,
      tableCat: [],
      itemsAriane: [],
      jsonConfigBuilder,
      mediasGallery: [],
      menuGallery: [],
    };
  },
  methods: {
    fetchDatas(moduleName) {
      let payLoad = {
        categorie: this.tableCat[0],
        scat1: this.tableCat[1],
        scat2: this.tableCat[2],
        scat3: this.tableCat[3],
      };

      this.$axios
        .post(URL_DATAS_ACTIV + moduleName, payLoad)
        .then((response) => {
          this.contentRaw = response.data.data;
          this.structureData();
        })
        .catch((error) => {
          console.log("error", error);
        });
    },
    structureData() {
      this.dataList = this.contentRaw
        .filter((mod) => {
          mod.data = JSON.parse(mod.data);
          return mod;
        })

        // classement par ordre
        .sort(function (a, b) {
          return parseFloat(a.ordre) - parseFloat(b.ordre);
        });

      this.structureMediasGallery(this.dataList);
      this.constructMenuGallery(this.dataList);
    },
    // on structure l'objets media avec des propriétés utilisables par le slideshow
    structureMediasGallery(dataList) {
      dataList.forEach((elm) => {
        let newMedia = {};
        newMedia.thumb = this.urlFTP + "tn/tn2-" + elm.data.image1;
        newMedia.src = this.urlFTP + "tn/tn1-" + elm.data.image1;
        newMedia.caption = elm.data.titre1;
        this.mediasGallery.push(newMedia);
      });
      this.loadGallery = true;
    },

    constructMenuGallery() {
      // récupération de la bonne config du module
      let configCat = this.jsonConfigBuilder.filter((mod) => {
        return mod.module == this.moduleName;
      });

      // fetch data module catégories
      this.$axios
        .get(URL_CATEGORIES_LIST_FROM + configCat[0].confCatSlug)
        .then((response) => {
          let tempRep = JSON.parse(response.data.data[0].data);
          this.menuGallery = JSON.parse(tempRep.categories);
          // console.log("menuGallery", this.menuGallery);
        })
        .catch((error) => {
          console.log("error", error);
        });
    },

    getCurrentPage() {
      this.pageName = this.$router.currentRoute.name;
    },

    getCat() {
      // console.log("ALLPARAMS", this.$route.params);
      this.tableCat.push(this.$route.params.categorie);
      this.tableCat.push(this.$route.params.scat1);
      this.tableCat.push(this.$route.params.scat2);
      this.tableCat.push(this.$route.params.scat3);
      // this.constructAriane();
      this.fetchDatas(this.moduleName);
    },
    constructAriane() {
      let configCat = this.jsonConfigBuilder.filter((mod) => {
        return mod.module == this.moduleName;
      });
      this.nbImages = configCat[0].medias.images;

      let nodeCat = [];
      this.$axios
        .get(URL_CATEGORIES_LIST_FROM + configCat[0].confCatSlug)
        .then((response) => {
          // construction de la liste des données du module (news)
          nodeCat = JSON.parse(response.data.data[0].data);
          nodeCat = JSON.parse(nodeCat.categories);

          // let arianePath = "";
          let arianePath = "/" + this.$router.currentRoute.name;

          this.tableCat.forEach((lvl, idx) => {
            arianePath += "/" + this.tableCat[idx];
            if (lvl !== "" && lvl !== undefined) {
              let elm = {
                text: lvl,
                href: arianePath,
              };

              for (let i = 0; i < nodeCat.length; i++) {
                if (nodeCat[i].slug == lvl) {
                  elm.text = nodeCat[i].title;
                  if (nodeCat[i].children.length > 0) {
                    nodeCat = nodeCat[i].children;
                  }
                  break;
                }
              }
              this.itemsAriane.push(elm);
            }
          });
        })
        .catch((error) => {
          console.log("error = ", error);
        });
    },
  },
};
</script>
