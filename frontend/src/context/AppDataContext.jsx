import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { apiAbsoluteUrl } from "../utils/apiOrigin";
import { backendAssetUrl } from "../utils/backendAssetUrl";

// Роли: client | admin | warehouse

export const ORDER_STATUSES = [
  "в ожидании",
  "принят",
  "в обработке",
  "собирается",
  "готов к получению",
];

const AppDataContext = createContext(null);

function normalizeOrder(order) {
  if (!order) {
    return null;
  }
  const items = Array.isArray(order.items)
    ? order.items.map((item) => ({
        ...item,
        id: item.id ?? item.supplyGoodId ?? "",
        imageUrl: backendAssetUrl(item.imageUrl || ""),
        price: Number(item.price ?? 0),
        qty: Number(item.qty ?? 0),
        lineTotal: Number(item.lineTotal ?? 0),
      }))
    : [];
  return {
    ...order,
    id: order.id || order.orderId || "",
    number: order.number || String(order.id || "").replace(/^OR-/, ""),
    customerId: order.customerId || order.userId || "",
    customerName: order.customerName || "",
    customerPosition: order.customerPosition ?? "",
    customerTabNumber: order.customerTabNumber ?? "",
    items,
    itemsCount: Number(order.itemsCount ?? items.length),
    totalQty: Number(order.totalQty ?? items.reduce((sum, item) => sum + (item.qty || 0), 0)),
    totalSum: Number(
      order.totalSum ??
        items.reduce((sum, item) => sum + (item.price || 0) * (item.qty || 0), 0)
    ),
  };
}

function normalizeProfile(profile) {
  if (!profile) return null;
  return {
    id: profile.id || "",
    fullName: profile.fullName || "—",
    position: profile.position || "—",
    employeeId: profile.employeeId || "—",
    phone: profile.phone || "—",
    email: profile.email || "—",
    role: profile.role || "client",
  };
}

async function readJson(res) {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

async function apiFetch(path, options = {}) {
  const res = await fetch(apiAbsoluteUrl(path), {
    credentials: "include",
    ...options,
    headers: {
      Accept: "application/json",
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(options.headers || {}),
    },
  });
  const body = await readJson(res);
  if (!res.ok) {
    throw new Error(body?.message || `HTTP ${res.status}`);
  }
  return body;
}

function orderIdListParam(ids) {
  return ids.map((id) => `supplyGoodIds=${encodeURIComponent(id)}`).join("&");
}

export function AppDataProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [orders, setOrders] = useState([]);
  const [orderCounts, setOrderCounts] = useState({ cartItemsCount: 0, activeOrdersCount: 0 });
  const [profileInfo, setProfileInfo] = useState(null);

  const userId = currentUser?.id || "";

  const refreshCurrentOrder = useCallback(
    async (explicitUserId = userId) => {
      if (!explicitUserId) {
        setCurrentOrder(null);
        return null;
      }
      const data = await apiFetch(`/api/orders/current?userId=${encodeURIComponent(explicitUserId)}`);
      const normalized = normalizeOrder(data);
      setCurrentOrder(normalized);
      return normalized;
    },
    [userId]
  );

  const refreshOrders = useCallback(
    async (explicitUserId = userId) => {
      const staff =
        currentUser?.role === "warehouse" || currentUser?.role === "admin";
      if (staff) {
        const data = await apiFetch(`/api/orders/workspace`);
        const normalized = Array.isArray(data) ? data.map(normalizeOrder) : [];
        setOrders(normalized);
        return normalized;
      }
      if (!explicitUserId) {
        setOrders([]);
        return [];
      }
      const data = await apiFetch(`/api/orders?userId=${encodeURIComponent(explicitUserId)}`);
      const normalized = Array.isArray(data) ? data.map(normalizeOrder) : [];
      setOrders(normalized);
      return normalized;
    },
    [userId, currentUser?.role]
  );

  const refreshCounts = useCallback(
    async (explicitUserId = userId) => {
      if (!explicitUserId) {
        setOrderCounts({ cartItemsCount: 0, activeOrdersCount: 0 });
        return { cartItemsCount: 0, activeOrdersCount: 0 };
      }
      const data = await apiFetch(`/api/orders/counts?userId=${encodeURIComponent(explicitUserId)}`);
      const normalized = {
        cartItemsCount: Number(data?.cartItemsCount ?? 0),
        activeOrdersCount: Number(data?.activeOrdersCount ?? 0),
      };
      setOrderCounts(normalized);
      return normalized;
    },
    [userId]
  );

  const refreshProfile = useCallback(
    async (explicitUserId = userId) => {
      if (!explicitUserId) {
        setProfileInfo(null);
        return null;
      }
      const data = await apiFetch(`/api/system-users/${encodeURIComponent(explicitUserId)}`);
      const normalized = normalizeProfile(data);
      setProfileInfo(normalized);
      return normalized;
    },
    [userId]
  );

  const refreshAllOrders = useCallback(
    async (explicitUserId = userId) => {
      if (!explicitUserId) return;
      await Promise.all([
        refreshCurrentOrder(explicitUserId),
        refreshOrders(explicitUserId),
        refreshCounts(explicitUserId),
        refreshProfile(explicitUserId).catch(() => null),
      ]);
    },
    [refreshCounts, refreshCurrentOrder, refreshOrders, refreshProfile, userId]
  );

  useEffect(() => {
    if (!userId) {
      setCurrentOrder(null);
      setOrders([]);
      setOrderCounts({ cartItemsCount: 0, activeOrdersCount: 0 });
      setProfileInfo(null);
      return;
    }
    refreshAllOrders(userId).catch((e) => {
      console.error("Orders refresh failed:", e);
    });
  }, [refreshAllOrders, userId]);

  const loginDemo = ({ email, name, role, clientId, tabNumber }) => {
    const backendRole = role || "client";
    const uiRole = backendRole === "storekeeper" ? "warehouse" : backendRole;
    const resolvedName = name?.trim() || email?.split("@")[0] || "Пользователь";
    const id = clientId || (uiRole === "client" ? "SU-1001" : `u-${uiRole}-${Date.now()}`);
    const user = {
      id,
      email: email || "",
      name: resolvedName,
      role: uiRole,
      backendRole,
      tabNumber: tabNumber || "",
    };
    setCurrentUser(user);
    return user;
  };

  const logout = () => {
    setCurrentUser(null);
    setCurrentOrder(null);
    setOrders([]);
    setOrderCounts({ cartItemsCount: 0, activeOrdersCount: 0 });
    setProfileInfo(null);
  };

  const addToCart = async (product) => {
    if (!userId) return null;
    const data = await apiFetch(`/api/orders/current/items?userId=${encodeURIComponent(userId)}`, {
      method: "POST",
      body: JSON.stringify({ supplyGoodId: product.id }),
    });
    const normalized = normalizeOrder(data);
    setCurrentOrder(normalized);
    await refreshCounts(userId);
    return normalized;
  };

  const changeCartQty = async (productId, delta) => {
    if (!userId) return null;
    const data = await apiFetch(
      `/api/orders/current/items/${encodeURIComponent(productId)}?userId=${encodeURIComponent(userId)}`,
      {
        method: "PATCH",
        body: JSON.stringify({ delta }),
      }
    );
    const normalized = normalizeOrder(data);
    setCurrentOrder(normalized);
    await refreshCounts(userId);
    return normalized;
  };

  const removeFromCart = async (productId) => {
    if (!userId) return null;
    return removeCartItems([productId]);
  };

  const removeCartItems = async (productIds) => {
    if (!userId || !Array.isArray(productIds) || productIds.length === 0) return currentOrder;
    const query = orderIdListParam(productIds);
    const data = await apiFetch(`/api/orders/current/items?userId=${encodeURIComponent(userId)}&${query}`, {
      method: "DELETE",
    });
    const normalized = normalizeOrder(data);
    setCurrentOrder(normalized);
    await refreshCounts(userId);
    return normalized;
  };

  const placeOrderFromCart = async () => {
    if (!userId || !currentOrder?.items?.length) return null;
    const data = await apiFetch(`/api/orders/current/place?userId=${encodeURIComponent(userId)}`, {
      method: "POST",
    });
    const normalized = normalizeOrder(data);
    await Promise.all([refreshCurrentOrder(userId), refreshOrders(userId), refreshCounts(userId)]);
    return normalized;
  };

  const updateOrderStatus = async (orderId, status) => {
    const data = await apiFetch(`/api/orders/${encodeURIComponent(orderId)}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    const normalized = normalizeOrder(data);
    setOrders((prev) => prev.map((order) => (order.id === normalized.id ? normalized : order)));
    await refreshCounts(userId);
    return normalized;
  };

  const pickUpOrders = async (orderIds) => {
    if (!userId || !Array.isArray(orderIds) || orderIds.length === 0) return 0;
    const data = await apiFetch(`/api/orders/pickup?userId=${encodeURIComponent(userId)}`, {
      method: "POST",
      body: JSON.stringify({ orderIds }),
    });
    await Promise.all([refreshOrders(userId), refreshCounts(userId)]);
    return Number(data?.changed ?? 0);
  };

  const cartItems = currentOrder?.items || [];
  const activeCartCount = orderCounts.cartItemsCount;
  const activeClientOrdersCount = orderCounts.activeOrdersCount;

  const value = {
    currentUser,
    profileInfo,
    currentOrder,
    cartItems,
    orders,
    activeCartCount,
    activeClientOrdersCount,
    loginDemo,
    logout,
    addToCart,
    changeCartQty,
    removeFromCart,
    removeCartItems,
    placeOrderFromCart,
    updateOrderStatus,
    pickUpOrders,
    refreshOrders,
  };

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) {
    throw new Error("useAppData must be used within AppDataProvider");
  }
  return ctx;
}
