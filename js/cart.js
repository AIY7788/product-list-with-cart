

export let cart = [];

export function addToCart(quantity, productName, productPrice) {
  const name = productName.replaceAll("-", " ");
  const index = cart.findIndex(item => item.productName === name);
  const price = Number(productPrice);

  if (index !== -1) {
    if (quantity <= 0) {
      cart.splice(index, 1);
    } else {
      cart[index].quantity = quantity ;
    }
  } else if (quantity > 0) {
    cart.push({
      quantity,
      productName: name,
      productPrice: price
    });
  }

}

export function clearCart() {
  cart = []
}