//...
// Pour des raisons de confidentialités, seul une partie du code est visible

/* eslint-disable quotes */
/* eslint-disable space-before-function-paren */
/* eslint-disable semi */
// import axios from "axios";
import configTarifsFPJson from "@/config-data/config-fp-tarifs.json";
import { cartService } from "@/_services/cart.service";
import { commit } from "vuex-pathify";
const state = {
  cart: [],
  cartVariant: [],
  totalCart: 0,
  totalHT: 0,
  totalTTC: 0,
  arrayTVA: [],
  costTVA:0,
  tauxTVA:20,
  etape: 1,
  nbArticles: 0,
  idCart: null,
  cartWeight: 0,
  selectedDelivery: null,
  delivery: {
    cost: 0,
    initialCost:0,
    name: "",
    franco: 0
  },
  remiseCodePromo: 0,
  calculCodePromo: null,
  presenceCodePromo: false,
  supFP: false,
  libelleCodePromo: "",
  minimumCommandeCodePromo: 0,
  cgv: false,
  politique:false

}
const getters = {
  // getTva: (state, getters) => {
  // }
}
const mutations = {
  ADD_TO_CART(state, { product, quantity, variant }) {
    if (state.nbArticles == 0) {
      this.dispatch("initCart");
    }

    // construction de l'article dans le panier
    let data;
    let dataprix;
    if (typeof (product.data) == "string") {
      data = JSON.parse(product.data);
    } else {
      data = product.data
    }
    if (typeof (product.dataprix) == "string") {
      dataprix = JSON.parse(product.dataprix);
    } else {
      dataprix = product.dataprix
    }

    let newProduct = {
        id: product.id,
        variant: variant,
        name: data.titre2,
        data: data,
        dataprix: dataprix
    };
    let tempoMinPrice = cartService.minPrice(newProduct)
    let priceByQuant = tempoMinPrice;
    newProduct.minPrice = tempoMinPrice;
    newProduct.priceByQuant = priceByQuant;

    // update des quantités si articles déja présent
    let isUpdate = false;
    state.cart.forEach(article => {
      if (newProduct.dataprix.typePrix == "simple") {
        if (parseInt(article.product.id) == parseInt(newProduct.id)) {
          article.quantity += quantity;
          article.product.priceByQuant = article.product.minPrice * article.quantity
          isUpdate = true;
        }
      } else if (newProduct.dataprix.typePrix == "declinaisons") {
        if (parseInt(article.product.id) == parseInt(newProduct.id) && article.product.variant.properties.toString() == newProduct.variant.properties.toString() ) {
          article.quantity += quantity;
          article.priceByQuant = article.product.minPrice * article.quantity
          isUpdate = true;
        }
      }
    });

    if (isUpdate == false) {
      state.cart.push({ product : newProduct, quantity })
    }
    this.dispatch("calculTotalCart")
  },


  CALCUL_TOTAL_CART(state) {
    let _calculTotal = 0
    let _nbArticles = 0
    let _totalHT = 0
    let _weight = 0
    let _calculWeight = 0
    state.cart.forEach(elm => {
      _weight += parseFloat(elm.product.dataprix.poidsProduit)
      _nbArticles += parseInt(elm.quantity);
      _calculTotal += parseFloat(elm.product.minPrice) * elm.quantity
      _calculWeight += parseFloat(elm.product.dataprix.poidsProduit) * elm.quantity
      _totalHT = parseFloat(_calculTotal * 100 / ( 100 + state.tauxTVA))
    });

    // reduction code promo
    if (state.presenceCodePromo == true) {
      if (_totalHT >= state.minimumCommandeCodePromo) {
        _calculTotal -= parseFloat(state.remiseCodePromo)
        _totalHT = parseFloat(_calculTotal * 100 / ( 100 + state.tauxTVA))
      } else {
        this.dispatch("removeCodePromo")
      }
    }



    state.totalCart = _calculTotal
    state.cartWeight = _calculWeight
    state.nbArticles = _nbArticles

    // reduction code promo
    // if (state.presenceCodePromo == true) {
    //   if (_totalHT >= state.minimumCommandeCodePromo) {
    //     _totalHT = parseFloat(_totalHT - state.remiseCodePromo);
    //   } else {
    //     this.dispatch("removeCodePromo")
    //   }
    // }

    // calcul total TTC
    state.totalHT = _totalHT
    state.costTVA = state.totalCart - state.totalHT

    // check franco
    if (state.delivery.franco > 0 && parseFloat(state.totalHT) >= parseFloat(state.delivery.franco)){
      state.delivery.cost = 0;
    }
    // if sup Fp with code promo
    if (state.supFP == true){
      state.delivery.cost = 0;
    }
    state.totalTTC = state.totalCart + state.delivery.cost

  },

  DELETE_TO_CART(state, { index }) {
    state.cart.splice(index, 1)
    this.dispatch("calculTotalCart");
  },

  UPDATE_QUANTITY(state, { index, quantity, mode }) {
    // mod = new/add/substract
    switch (mode) {
      case 'add':
        state.cart[index].quantity++
        break;
      case 'substract':
        state.cart[index].quantity--
        if (state.cart[index].quantity < 0) {
          state.cart[index].quantity = 0;
        }
        break;
      default:
        state.cart[index].quantity = quantity;
    }
    state.cart[index].product.priceByQuant = state.cart[index].product.minPrice * state.cart[index].quantity
    if (state.cart[index].quantity == 0) {
      this.dispatch("deleteToCart", { index });
    }

    // this.dispatch("calculTotalCart");
    this.dispatch("checkDelivery");

  },

  UPDATE_ETAPE(state, { numEtape }) {
    state.etape = numEtape
  },
  INIT_CART(state) {
    state.idCart = Date.now() + "-" + Math.floor(Math.random() * 10000)
  },

  CHECK_DELIVERY(state) {
    if (state.selectedDelivery != null) {
      this.dispatch("setDelivery", { delivery: state.selectedDelivery });
    } else {
      this.dispatch("calculTotalCart");
    }
  },

  SET_DELIVERY(state, { delivery }) {
    state.selectedDelivery = delivery
    let _tarifsFP = configTarifsFPJson.filter(tarif => {
      return tarif.type.toString() == delivery.type.toString();
    });

    _tarifsFP = _tarifsFP[0].tarifs.filter(zoneTarif => {
      return zoneTarif.libelle.toString() == delivery.libelle.toString();
    });
    _tarifsFP = _tarifsFP[0];

    // init payload  for cartStore
    let infoDelivery = {
      cost: 0,
      name: "Non défini"
    };

    // check POIDS et franco
    let _calculTotal = 0
    let _nbArticles = 0
    let _totalHT = 0
    let _weight = 0
    let _calculWeight = 0
    state.cart.forEach(elm => {
      _weight += parseFloat(elm.product.dataprix.poidsProduit)
      _nbArticles += parseInt(elm.quantity);
      _calculTotal += parseFloat(elm.product.minPrice) * elm.quantity
      _calculWeight += parseFloat(elm.product.dataprix.poidsProduit) * elm.quantity
      _totalHT = parseFloat(_calculTotal * 100 / ( 100 + state.tauxTVA))
    });

    state.totalCart = _calculTotal
    state.cartWeight = _calculWeight
    state.nbArticles = _nbArticles
    state.totalHT = _totalHT

    let _franco = _tarifsFP.franco;
    if (delivery.zone == "pays" && delivery.calcul == "poids") {
      // TRAITEMENT LIVRAISON TYPE COLISSIMO
      _tarifsFP = _tarifsFP.poids.filter(weight => {
        return parseFloat(state.cartWeight) >= parseFloat(weight.min) && parseFloat(state.cartWeight) < parseFloat(weight.max);
      });

      if (_tarifsFP.length > 0) {
        _tarifsFP = _tarifsFP[0].prix;
        infoDelivery.cost = _tarifsFP;
        infoDelivery.name = delivery.libelle;
      }
    } else if (delivery.calcul == "") {
      // TRAITEMENT LIVRAISON SANS CALCUL
      infoDelivery.cost = _tarifsFP.prix;
      infoDelivery.name = delivery.libelle;
    } else if (delivery.zone == "cp") {
      // TRAITEMENT LIVRAISON CODE POSTAUX
    } else if (delivery.zone == "transporteur") {
      // TRAITEMENT LIVRAISON TRANSPORTEURS
    } else if (delivery.zone == "special") {
      // TRAITEMENT CALCUL SPECIAL
    }

    state.delivery.cost = infoDelivery.cost;
    state.delivery.name = infoDelivery.name;
    state.delivery.franco = _franco;

    this.dispatch("calculTotalCart");
  },

  SET_NO_FP(state, {minimumCommande}) {
    state.supFP = true
    state.libelleCodePromo = "Frais de port offert"
    state.presenceCodePromo = true
    state.minimumCommandeCodePromo = minimumCommande;
    this.dispatch("calculTotalCart");
  },

  ADD_CODE_PROMO(state, { isPourcentage, valueReduc, minimumCommande }) {
    state.presenceCodePromo = true;
    state.libelleCodePromo = "Réduction code Promo";
    state.minimumCommandeCodePromo = minimumCommande;

    // si calcul pourcentage
    if (isPourcentage == true) {
      state.remiseCodePromo = parseFloat((state.totalHT * valueReduc) / 100);
    } else {
      state.remiseCodePromo = parseFloat(valueReduc);
    }
    this.dispatch("calculTotalCart");
  },
  REMOVE_CODE_PROMO(state) {
    state.remiseCodePromo = 0;
    state.presenceCodePromo = false;
    state.libelleCodePromo = "";
    state.supFP = false;
    state.minimumCommandeCodePromo = 0;
    this.dispatch("calculTotalCart");
  },
  SET_CGV(state) {
    state.cgv = !state.cgv
    console.log("etat cgv:", state.cgv)
  },
  SET_POLITIQUE(state) {
    state.politique = !state.politique
    console.log("etat politique:", state.politique)
  },
  RESET_CART(state) {
    state.cart= [];
    state.cartVariant= [];
    state.totalCart= 0;
    state.totalHT= 0;
    state.totalTTC= 0;
    state.arrayTVA= [];
    state.costTVA= 0;
    state.tauxTVA= 20;
    state.etape= 1;
    state.nbArticles= 0;
    state.idCart= null;
    state.cartWeight= 0;
    state.selectedDelivery= null;
    state.delivery = {
      cost: 0,
      initialCost:0,
      name: "",
      franco: 0
    };
    state.remiseCodePromo= 0;
    state.calculCodePromo= null;
    state.presenceCodePromo= false;
    state.supFP= false;
    state.libelleCodePromo= "";
    state.minimumCommandeCodePromo= 0;
    state.cgv= false;
    state.politique= false;
  }


}
const actions = {
  addProductToCart: ({ commit }, { product, quantity, variant }) => {
    commit("ADD_TO_CART", { product, quantity, variant });
  },
  calculTotalCart: ({ commit }) => {
    commit("CALCUL_TOTAL_CART");
  },
  deleteToCart: ({ commit }, { index}) => {
    commit("DELETE_TO_CART", {index});
  },
  updateQuantity: ({ commit }, { index, quantity, mode }) => {
    commit("UPDATE_QUANTITY", {index, quantity, mode });
  },
  updateEtape:({ commit }, { numEtape }) => {
    commit("UPDATE_ETAPE", { numEtape })
  },
  initCart: ({ commit }) => {
    commit("INIT_CART")
  },
  setDelivery: ({ commit }, { delivery }) => {
    commit("SET_DELIVERY", { delivery })
  },
  checkDelivery: ({ commit }) => {
    commit("CHECK_DELIVERY")
  },
  setNoFP: ({ commit }, { minimumCommande }) => {
    commit("SET_NO_FP", { minimumCommande })
  },
  addCodePromo: ({ commit }, { isPourcentage, valueReduc, minimumCommande }) => {
    commit("ADD_CODE_PROMO", { isPourcentage, valueReduc, minimumCommande })
  },
  removeCodePromo: ({ commit }) => {
    commit("REMOVE_CODE_PROMO")
  },
  setCgv: ({ commit }) => {
    commit("SET_CGV")
  },
  setPolitique: ({ commit }) => {
    commit("SET_POLITIQUE")
  },
  resetCart: ({ commit }) => {
    commit( "RESET_CART")
  }

}
export default {
  state,
  getters,
  mutations,
  actions
}

// 
