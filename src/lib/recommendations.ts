const PRODUCTS = [
  { name: "Spicy Chicken Wings", category: "Spicy", price: 12.99 },
  { name: "Mango Habanero Tacos", category: "Spicy", price: 10.99 },
  { name: "Szechuan Noodles", category: "Spicy", price: 11.49 },
  { name: "Classic Cheeseburger", category: "Savory", price: 9.99 },
  { name: "Truffle Mac & Cheese", category: "Savory", price: 13.49 },
  { name: "BBQ Pulled Pork Bowl", category: "Savory", price: 12.49 },
  { name: "Matcha Latte", category: "Sweet", price: 5.99 },
  { name: "Strawberry Cheesecake", category: "Sweet", price: 7.99 },
  { name: "Chocolate Lava Cake", category: "Sweet", price: 8.49 },
  { name: "Caesar Salad", category: "Healthy", price: 8.99 },
  { name: "Acai Bowl", category: "Healthy", price: 10.99 },
  { name: "Grilled Salmon", category: "Healthy", price: 15.99 },
];

const SAMPLE_ORDERS = [
  { product_name: "Spicy Chicken Wings", category: "Spicy", price: 12.99 },
  { product_name: "Mango Habanero Tacos", category: "Spicy", price: 10.99 },
  { product_name: "Szechuan Noodles", category: "Spicy", price: 11.49 },
  { product_name: "Classic Cheeseburger", category: "Savory", price: 9.99 },
  { product_name: "Spicy Chicken Wings", category: "Spicy", price: 12.99 },
];

export function getRecommendation(orders?: { product_name: string; category: string }[]) {
  const history = orders && orders.length > 0 ? orders : SAMPLE_ORDERS;

  if (history.length === 0) {
    const random = PRODUCTS[Math.floor(Math.random() * PRODUCTS.length)];
    return {
      text: `Chef's Recommendation: Try our amazing ${random.name}! 🍽️`,
      product: random,
      isChefPick: true,
    };
  }

  const catCount: Record<string, number> = {};
  for (const o of history) {
    catCount[o.category] = (catCount[o.category] || 0) + 1;
  }
  const topCat = Object.entries(catCount).sort((a, b) => b[1] - a[1])[0][0];

  const ordered = new Set(history.map((o) => o.product_name));
  const suggestions = PRODUCTS.filter(
    (p) => p.category === topCat && !ordered.has(p.name)
  );

  const pick =
    suggestions.length > 0
      ? suggestions[Math.floor(Math.random() * suggestions.length)]
      : PRODUCTS.filter((p) => !ordered.has(p.name))[0] || PRODUCTS[0];

  return {
    text: `Since you love ${topCat} food, you should try our ${pick.name}! 🌶️`,
    product: pick,
    isChefPick: false,
  };
}

export function getSampleOrders() {
  return SAMPLE_ORDERS;
}

export { PRODUCTS };