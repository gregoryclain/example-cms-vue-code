//...
// Pour des raisons de confidentialités, seul une partie du code est visible

/* eslint-disable handle-callback-err */
/* eslint-disable no-unused-vars */
/* eslint-disable quotes */
/* eslint-disable space-before-function-paren */
/* eslint-disable semi */

function minPrice(product) {
  if (typeof(product.dataprix) == "string") {
    product.dataprix = JSON.parse(product.dataprix)
  }
  console.log("product in cartService", product)
  let miniMumPrice = 0

  if (product.dataprix.typePrix == "declinaisons") {
    miniMumPrice = Math.min(...product.variant.prices.filter(price => {
      return price > 0;
    }))
    // miniMumPrice = Math.min(...product.variant.prices)
  }
  if (product.dataprix.typePrix == "simple") {
    let tabPrices = []
    // on récupère les valeurs des prix1, prix2 etc...
    for (let i=0; i < product.dataprix.simplePrice.length; i++){
      let obj = product.dataprix.simplePrice[i]
      tabPrices.push(obj[Object.keys(obj)[0]])
    }
    miniMumPrice = Math.min(...tabPrices)
  }

  return miniMumPrice
}

export const cartService = {
  minPrice
}
