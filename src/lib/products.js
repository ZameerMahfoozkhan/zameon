import { getProductsFromFirestore, getProductByIdFromFirestore } from './firestore';

export async function getAllProducts() {
  return await getProductsFromFirestore();
}

export async function getProductById(id) {
  return await getProductByIdFromFirestore(id);
}

export async function getProductsByCategory(category) {
  const products = await getAllProducts();
  return products.filter((p) => p.category === category);
}

export async function getProductsByCollection(collection) {
  const products = await getAllProducts();
  return products.filter((p) => p.collection === collection);
}

export async function getFeaturedProducts(count = 8) {
  const products = await getAllProducts();
  return products.slice(0, count);
}

export async function getRelatedProducts(productId, count = 4) {
  const product = await getProductById(productId);
  if (!product) return [];
  const products = await getAllProducts();
  return products
    .filter((p) => p.id !== productId && p.category === product.category)
    .slice(0, count);
}

export async function searchProducts(query) {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  const products = await getAllProducts();
  return products.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q)
  );
}

export async function getCategories() {
  const products = await getAllProducts();
  const cats = [...new Set(products.map((p) => p.category))];
  const icons = {
    Audio: '🎧',
    Wearables: '⌚',
    Workspace: '💻',
    Accessories: '🔌',
    Lifestyle: '🎒',
    Home: '💡',
  };
  return cats.map((c) => ({
    name: c,
    slug: c.toLowerCase(),
    count: products.filter((p) => p.category === c).length,
    icon: icons[c] || '📦',
  }));
}

export async function getBrands() {
  const products = await getAllProducts();
  return [...new Set(products.map((p) => p.brand))];
}

export async function getCollections() {
  const products = await getAllProducts();
  return [...new Set(products.map((p) => p.collection))];
}

export function formatPrice(price) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price);
}
