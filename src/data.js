export const readProducts = () => {
  try {
    const saved = localStorage.getItem("prime_products");
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

export const writeProducts = (products) =>
  localStorage.setItem("prime_products", JSON.stringify(products));

export const money = (value) =>
  `EGP ${Number(value || 0).toLocaleString("en-EG")}`;
