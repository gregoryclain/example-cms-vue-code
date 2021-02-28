<template>
  <div>
    <!-- Slide -->
    <agile class="main" ref="main" :options="options1" :as-nav-for="asNavFor1">
      <div class="slide" v-for="(slide, index) in medias" :key="index" :class="`slide--${index}`"><img :src="slide.src" /></div>
    </agile>

    <!-- Thumbnails nav -->
    <agile class="thumbnails" ref="thumbnails" :options="options2" :as-nav-for="asNavFor2">
      <div class="slide slide--thumbniail" v-for="(media, index) in medias" :key="index" :class="`slide--${index}`" @click="$refs.thumbnails.goTo(index)"><img :src="media.thumb" /></div>
      <template slot="prevButton"><i class="fas fa-chevron-left"></i></template>
      <template slot="nextButton"><i class="fas fa-chevron-right"></i></template>
    </agile>
  </div>
</template>

<script>
import "vue-agile/dist/VueAgile.css";
import { VueAgile } from "vue-agile";
export default {
  props: ["medias"],
  components: {
    agile: VueAgile,
  },
  mounted: function () {
    this.asNavFor1.push(this.$refs.thumbnails);
    this.asNavFor2.push(this.$refs.main);
  },
  data() {
    return {
      // vue-agile

      asNavFor1: [],
      asNavFor2: [],
      options1: {
        dots: false,
        fade: true,
        navButtons: false,
      },

      options2: {
        autoplay: true,
        centerMode: true,
        dots: false,
        navButtons: false,
        slidesToShow: 3,
        responsive: [
          {
            breakpoint: 600,
            settings: {
              slidesToShow: 5,
            },
          },

          {
            breakpoint: 1000,
            settings: {
              navButtons: true,
            },
          },
        ],
      },
    };
  },
};
</script>
<style scoped>
.main {
  margin-bottom: 30px;
}

.thumbnails {
  margin: 0 -5px;
  width: calc(100% + 10px);
}

.agile__nav-button {
  background: transparent;
  border: none;
  color: #ccc;
  cursor: pointer;
  font-size: 24px;
  transition-duration: 0.3s;
}
.thumbnails .agile__nav-button {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
}
.thumbnails .agile__nav-button--prev {
  left: -45px;
}
.thumbnails .agile__nav-button--next {
  right: -45px;
}
.agile__nav-button:hover {
  color: #888;
}
.agile__dot {
  margin: 0 10px;
}
.agile__dot button {
  background-color: #eee;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: block;
  height: 10px;
  font-size: 0;
  line-height: 0;
  margin: 0;
  padding: 0;
  transition-duration: 0.3s;
  width: 10px;
}
.agile__dot--current button,
.agile__dot:hover button {
  background-color: #888;
}

.slide {
  align-items: center;
  box-sizing: border-box;
  color: #fff;
  display: flex;
  height: 600px;
  justify-content: center;
}
.slide--thumbniail {
  cursor: pointer;
  height: 100px;
  padding: 0 5px;
  transition: opacity 0.3s;
}
.slide--thumbniail:hover {
  opacity: 0.75;
}
.slide img {
  height: 100%;
  -o-object-fit: cover;
  object-fit: cover;
  -o-object-position: center;
  object-position: center;
  width: 100%;
}
</style>
