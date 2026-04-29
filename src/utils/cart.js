const cartKey = (farmId) => `farm_cart_${farmId}`;

export const getCartItems = (farmId) => {
  if (!farmId || typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(cartKey(farmId));
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const saveCartItems = (farmId, items) => {
  if (!farmId || typeof window === 'undefined') return;
  window.localStorage.setItem(cartKey(farmId), JSON.stringify(items));
  window.dispatchEvent(new CustomEvent('poultry-cart-updated', { detail: { farmId, items } }));
};

export const clearCartItems = (farmId) => saveCartItems(farmId, []);

export const addCartItem = (farmId, productId, quantity = 1) => {
  const current = getCartItems(farmId);
  const existing = current.find((item) => item.product_id === productId);
  const next = existing
    ? current.map((item) =>
        item.product_id === productId
          ? { ...item, quantity: item.quantity + quantity }
          : item
      )
    : [...current, { product_id: productId, quantity }];
  saveCartItems(farmId, next);
  return next;
};

export const updateCartItemQuantity = (farmId, productId, quantity) => {
  const sanitized = Math.max(1, quantity || 1);
  const next = getCartItems(farmId).map((item) =>
    item.product_id === productId ? { ...item, quantity: sanitized } : item
  );
  saveCartItems(farmId, next);
  return next;
};

export const removeCartItem = (farmId, productId) => {
  const next = getCartItems(farmId).filter((item) => item.product_id !== productId);
  saveCartItems(farmId, next);
  return next;
};

export const getCartCount = (farmId) =>
  getCartItems(farmId).reduce((sum, item) => sum + Math.max(1, Number(item.quantity) || 1), 0);
