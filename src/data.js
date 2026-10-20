
export const readProducts = () => {
  try {
    const saved = localStorage.getItem("prime_products");
    if (saved)
      return JSON.parse(saved).map((product) => {
        const existingImages = Array.isArray(product.images)
          ? product.images
          : product.image &&
              !String(product.image).includes("images.unsplash.com")
            ? [product.image]
            : [];
        return {
          ...product,
          images: existingImages,
          image: existingImages[0] || "",
        };
      });
    localStorage.setItem("prime_products", JSON.stringify(starterProducts));
    return starterProducts;
  } catch {
    return starterProducts;
  }
};
export const writeProducts = (products) =>
  localStorage.setItem("prime_products", JSON.stringify(products));
export const money = (value) =>
  `EGP ${Number(value || 0).toLocaleString("en-EG")}`;
