const generateShippingCost = (price) => +(price * 0.012).toFixed(2);
const generateTax = (price) => +(price * 0.0725).toFixed(2);
module.exports.calculateOrderSummary = (lineItems) => {
  return lineItems.reduce(
    (prev, next) => {
      const subtotal = prev.subtotal + next.price;
      const shippingCost = prev.shippingCost + generateShippingCost(next.price);
      const tax = prev.tax + generateTax(next.price);
      const total = prev.total + subtotal + shippingCost + tax;
      const itemCount = prev.itemCount + 1;

      return {
        subtotal,
        shippingCost,
        tax,
        total,
        itemCount,
      };
    },
    {
      subtotal: 0,
      shippingCost: 0,
      tax: 0,
      total: 0,
      itemCount: 0,
    }
  );
};

const mockData = require("./staticConfig.json");
module.exports.getRandomCartItem = () =>
  mockData[Math.floor(Math.random() * mockData.length)];

module.exports.updateLineItems = (lineItems, item) => { 
  if (lineItems.length === 0) {
    return [{item}];
  }

  const map = new Map();
  map.set(item.itemNumber, 1);

  const newLineItems = lineItems.map(curItem => {
    if (curItem.itemNumber === item.itemNumber) {
      map.set(item.itemNumber, 0);
      return {
        ...curItem,
        quantity: curItem.quantity + 1
      };
    }
    return {
      ...curItem
    }
  });

  return !map.get(item.itemNumber) ? newLineItems : [...newLineItems, item];
}
