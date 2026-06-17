import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAppData } from "../context/AppDataContext";

function LogoutFloatingButton() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAppData();
  const [logoutHovered, setLogoutHovered] = useState(false);
  const [catalogHovered, setCatalogHovered] = useState(false);
  const isCatalogPage = location.pathname === "/catalog";

  const onLogout = () => {
    logout();
    navigate("/sign-in-sign-up");
  };

  return (
    <div style={logoutFloatingStyles.actions}>
      {!isCatalogPage && (
        <button
          type="button"
          onClick={() => navigate("/catalog")}
          onMouseEnter={() => setCatalogHovered(true)}
          onMouseLeave={() => setCatalogHovered(false)}
          style={{ ...logoutFloatingStyles.btn, ...logoutFloatingStyles.catalogBtn, ...(catalogHovered ? logoutFloatingStyles.catalogBtnHover : {}) }}
          title="Вернуться в каталог"
          aria-label="Вернуться в каталог"
        >
          <span style={logoutFloatingStyles.iconWrap} aria-hidden="true">
            <svg viewBox="0 0 24 24" style={logoutFloatingStyles.icon} fill="none">
              <path d="M4.75 7.75h14.5M7.75 4.75h8.5A2.5 2.5 0 0 1 18.75 7.25v11A1.75 1.75 0 0 1 17 20H7a1.75 1.75 0 0 1-1.75-1.75v-11A2.5 2.5 0 0 1 7.75 4.75Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M9 11h6M9 15h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </span>
          <span>Вернуться в каталог</span>
        </button>
      )}
      <button
        type="button"
        onClick={onLogout}
        onMouseEnter={() => setLogoutHovered(true)}
        onMouseLeave={() => setLogoutHovered(false)}
        style={{ ...logoutFloatingStyles.btn, ...logoutFloatingStyles.logoutBtn, ...(logoutHovered ? logoutFloatingStyles.logoutBtnHover : {}) }}
        title="Выйти из учётной записи"
        aria-label="Выйти из учётной записи"
      >
        <span style={logoutFloatingStyles.iconWrap} aria-hidden="true">
          <svg viewBox="0 0 24 24" style={logoutFloatingStyles.icon} fill="none">
            <path d="M9 4.5H6.75A1.75 1.75 0 0 0 5 6.25v11.5A1.75 1.75 0 0 0 6.75 19.5H9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M14 8l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M18 12H10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <span>Выйти из учётной записи</span>
      </button>
    </div>
  );
}

const logoutFloatingStyles = {
  actions: { position: "fixed", top: "16px", right: "16px", zIndex: 12000, display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", justifyContent: "flex-end" },
  btn: { border: "none", borderRadius: "999px", padding: "10px 14px 10px 12px", fontSize: "13px", fontWeight: 700, color: "#ffffff", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "8px", letterSpacing: "0.01em", borderWidth: "1px", borderStyle: "solid", borderColor: "rgba(255,255,255,0.28)", backdropFilter: "blur(4px)", transition: "transform 0.18s ease, box-shadow 0.2s ease, filter 0.2s ease, background 0.2s ease" },
  logoutBtn: { background: "linear-gradient(135deg, rgba(220,38,38,0.96) 0%, rgba(185,28,28,0.96) 60%, rgba(127,29,29,0.98) 100%)", boxShadow: "0 10px 22px rgba(127,29,29,0.35), inset 0 1px 0 rgba(255,255,255,0.25)" },
  logoutBtnHover: { transform: "translateY(-2px)", filter: "brightness(1.05)", boxShadow: "0 14px 26px rgba(127,29,29,0.42), inset 0 1px 0 rgba(255,255,255,0.28)" },
  catalogBtn: { background: "linear-gradient(135deg, rgba(30,58,138,0.96) 0%, rgba(29,78,216,0.96) 58%, rgba(14,116,144,0.98) 100%)", boxShadow: "0 10px 22px rgba(29,78,216,0.32), inset 0 1px 0 rgba(255,255,255,0.25)" },
  catalogBtnHover: { transform: "translateY(-2px)", filter: "brightness(1.06)", boxShadow: "0 14px 26px rgba(29,78,216,0.4), inset 0 1px 0 rgba(255,255,255,0.28)" },
  iconWrap: { width: "22px", height: "22px", borderRadius: "999px", display: "inline-flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.16)", border: "1px solid rgba(255,255,255,0.26)", flexShrink: 0 },
  icon: { width: "15px", height: "15px" },
};

const HISTORY_PAGE_SIZE = 10;

function statusMeta(status) {
  const s = String(status || "").toLowerCase();
  if (["готов", "готов к получению"].includes(s)) {
    return {
      group: "ready",
      label: "Готов к получению",
      color: "#15803d",
      border: "#22c55e",
      cardBg:
        "linear-gradient(145deg, rgba(236,253,245,0.99) 0%, rgba(187,247,208,0.92) 100%)",
      ring: "rgba(34,197,94,0.34)",
      progressFrom: "#22c55e",
      progressTo: "#16a34a",
      badgeBg: "#ecfdf5",
    };
  }
  if (["собирается"].includes(s)) {
    return {
      group: "assembling",
      label: "Собирается",
      color: "#0e7490",
      border: "#22d3ee",
      cardBg:
        "linear-gradient(145deg, rgba(236,254,255,0.99) 0%, rgba(165,243,252,0.9) 100%)",
      ring: "rgba(34,211,238,0.34)",
      progressFrom: "#06b6d4",
      progressTo: "#0891b2",
      badgeBg: "#ecfeff",
    };
  }
  if (["в обработке", "едет"].includes(s)) {
    return {
      group: "processing",
      label: "В обработке",
      color: "#1d4ed8",
      border: "#3b82f6",
      cardBg:
        "linear-gradient(145deg, rgba(239,246,255,0.99) 0%, rgba(191,219,254,0.92) 100%)",
      ring: "rgba(59,130,246,0.34)",
      progressFrom: "#3b82f6",
      progressTo: "#2563eb",
      badgeBg: "#eff6ff",
    };
  }
  if (["принят"].includes(s)) {
    return {
      group: "accepted",
      label: "Принят",
      color: "#7c3aed",
      border: "#a78bfa",
      cardBg:
        "linear-gradient(145deg, rgba(245,243,255,0.99) 0%, rgba(221,214,254,0.92) 100%)",
      ring: "rgba(167,139,250,0.34)",
      progressFrom: "#8b5cf6",
      progressTo: "#7c3aed",
      badgeBg: "#f5f3ff",
    };
  }
  if (["получен", "доставлен"].includes(s)) {
    return {
      group: "history",
      label: s === "получен" ? "Получен" : "Доставлен",
      color: "#64748b",
      border: "#94a3b8",
      cardBg:
        "linear-gradient(145deg, rgba(248,250,252,0.98) 0%, rgba(241,245,249,0.92) 100%)",
      ring: "rgba(100,116,139,0.2)",
      progressFrom: "#94a3b8",
      progressTo: "#64748b",
      badgeBg: "#f8fafc",
    };
  }
  return {
    group: "waiting",
    label: "В ожидании",
    color: "#b45309",
    border: "#f59e0b",
    cardBg:
      "linear-gradient(145deg, rgba(255,251,235,0.99) 0%, rgba(253,230,138,0.92) 100%)",
    ring: "rgba(245,158,11,0.36)",
    progressFrom: "#f59e0b",
    progressTo: "#ea580c",
    badgeBg: "#fff7ed",
  };
}

function statusStepIndex(status) {
  const group = statusMeta(status).group;
  if (group === "waiting") return 0;
  if (group === "accepted") return 1;
  if (group === "processing") return 2;
  if (group === "assembling") return 3;
  if (group === "ready") return 4;
  return 4;
}

function statusProgressWidth(status) {
  const idx = statusStepIndex(status);
  if (idx <= 0) return "4%";
  if (idx === 1) return "27%";
  if (idx === 2) return "50%";
  if (idx === 3) return "75%";
  return "100%";
}

function progressStepGlyph(stepIndex) {
  const glyphs = ["○", "◔", "◑", "◕", "⬤"];
  return glyphs[stepIndex] || "○";
}

function orderTotal(order) {
  if (typeof order.totalSum === "number") return order.totalSum;
  return (order.items || []).reduce(
    (sum, item) => sum + (item.qty || 0) * (item.price || 0),
    0
  );
}

function productNames(order) {
  return (order.items || [])
    .map((item) => item.name)
    .filter(Boolean)
    .join("; ");
}

function getNameInitials(fullName) {
  const parts = String(fullName || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0] || ""}${parts[1][0] || ""}`.toUpperCase();
  }
  if (parts.length === 1) {
    return (parts[0][0] || "").toUpperCase();
  }
  return "КЛ";
}

function splitHighlight(text, query) {
  const full = String(text || "");
  const q = String(query || "").trim();
  if (!q) return [{ t: full, h: false }];
  const lower = full.toLowerCase();
  const lq = q.toLowerCase();
  const out = [];
  let start = 0;
  let idx = lower.indexOf(lq, start);
  while (idx !== -1) {
    if (idx > start) out.push({ t: full.slice(start, idx), h: false });
    out.push({ t: full.slice(idx, idx + q.length), h: true });
    start = idx + q.length;
    idx = lower.indexOf(lq, start);
  }
  if (start < full.length) out.push({ t: full.slice(start), h: false });
  return out.length ? out : [{ t: full, h: false }];
}

function HighlightedMatch({ text, query }) {
  const parts = splitHighlight(text, query);
  return (
    <>
      {parts.map((p, i) =>
        p.h ? (
          <mark key={i} style={styles.searchHighlight}>
            {p.t}
          </mark>
        ) : (
          <span key={i}>{p.t}</span>
        )
      )}
    </>
  );
}

export default function AccountPage() {
  const navigate = useNavigate();
  const { currentUser, profileInfo: dbProfileInfo, orders, pickUpOrders } =
    useAppData();
  const isClient = Boolean(currentUser && currentUser.role === "client");
  const effectiveClientId = isClient ? currentUser.id : "SU-1001";
  const effectiveClientName = isClient ? currentUser.name : "ООО «СтройИнвест»";

  const [selectedOrderIds, setSelectedOrderIds] = useState([]);
  const [historySearch, setHistorySearch] = useState("");
  const [historySort, setHistorySort] = useState({
    key: "pickedUpAt",
    dir: "desc",
  });
  const [historyPageIndex, setHistoryPageIndex] = useState(0);
  const [toast, setToast] = useState(null);
  const [hoveredOrderId, setHoveredOrderId] = useState(null);

  const userOrders = useMemo(() => {
    return orders.filter((o) => o.customerId === effectiveClientId);
  }, [orders, effectiveClientId]);

  const profileInfo = useMemo(() => {
    return {
      fullName: dbProfileInfo?.fullName || effectiveClientName || "—",
      employeeId: dbProfileInfo?.employeeId || currentUser?.tabNumber || "—",
      position: dbProfileInfo?.position || "—",
      phone: dbProfileInfo?.phone || "—",
      email: dbProfileInfo?.email || currentUser?.email || "—",
    };
  }, [dbProfileInfo, effectiveClientName, currentUser]);

  const activeOrders = useMemo(() => {
    const list = userOrders.filter(
      (o) => statusMeta(o.status).group !== "history"
    );
    const rank = {
      ready: 0,
      assembling: 1,
      processing: 2,
      accepted: 3,
      waiting: 4,
    };
    return [...list].sort((a, b) => {
      const ra = rank[statusMeta(a.status).group] ?? 99;
      const rb = rank[statusMeta(b.status).group] ?? 99;
      if (ra !== rb) return ra - rb;
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
  }, [userOrders]);

  const historyOrders = useMemo(() => {
    const list = userOrders.filter((o) => statusMeta(o.status).group === "history");
    const query = historySearch.trim().toLowerCase();
    let filtered = list;
    if (query) {
      filtered = filtered.filter((o) => {
        const names = productNames(o).toLowerCase();
        return names.includes(query);
      });
    }

    const mul = historySort.dir === "asc" ? 1 : -1;
    const sorted = [...filtered].sort((a, b) => {
      if (historySort.key === "number") {
        return (
          mul *
          String(a.number).localeCompare(String(b.number), "ru", {
            numeric: true,
          })
        );
      }
      if (historySort.key === "names") {
        return mul * productNames(a).localeCompare(productNames(b), "ru", {
          sensitivity: "base",
        });
      }
      if (historySort.key === "items") {
        return mul * ((a.itemsCount || 0) - (b.itemsCount || 0));
      }
      if (historySort.key === "qty") {
        return mul * ((a.totalQty || 0) - (b.totalQty || 0));
      }
      if (historySort.key === "sum") {
        return mul * (orderTotal(a) - orderTotal(b));
      }
      const ta = new Date(a.pickedUpAt || a.createdAt).getTime();
      const tb = new Date(b.pickedUpAt || b.createdAt).getTime();
      return mul * (ta - tb);
    });
    return sorted;
  }, [userOrders, historySearch, historySort]);

  const historyPaged = useMemo(() => {
    const start = historyPageIndex * HISTORY_PAGE_SIZE;
    return historyOrders.slice(start, start + HISTORY_PAGE_SIZE);
  }, [historyOrders, historyPageIndex]);

  useEffect(() => {
    const maxIdx =
      historyOrders.length === 0
        ? 0
        : Math.ceil(historyOrders.length / HISTORY_PAGE_SIZE) - 1;
    setHistoryPageIndex((i) => Math.min(i, maxIdx));
  }, [historyOrders.length]);

  const canPickSelected =
    selectedOrderIds.length > 0 &&
    selectedOrderIds.every((id) => {
      const order = activeOrders.find((o) => o.id === id);
      return order && statusMeta(order.status).group === "ready";
    });

  const toggleOrder = (id) => {
    setSelectedOrderIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const pickSelected = async () => {
    if (!canPickSelected) return;
    const changed = await pickUpOrders(selectedOrderIds);
    if (changed > 0) {
      setToast(`Заказов перемещено в историю: ${changed}`);
      setTimeout(() => setToast(null), 2500);
      setSelectedOrderIds([]);
    }
  };

  const sortArrow = (key) => {
    if (historySort.key !== key) return "↕";
    return historySort.dir === "asc" ? "▲" : "▼";
  };

  const toggleHistorySort = (key) => {
    setHistorySort((prev) =>
      prev.key === key
        ? { key, dir: prev.dir === "asc" ? "desc" : "asc" }
        : { key, dir: "asc" }
    );
  };

  const resetHistoryFilters = () => {
    setHistorySearch("");
    setHistorySort({ key: "pickedUpAt", dir: "desc" });
    setHistoryPageIndex(0);
  };

  const historyDirty =
    historySearch.trim() ||
    historySort.key !== "pickedUpAt" ||
    historySort.dir !== "desc";

  return (
    <div style={styles.pageWrapper}>
      <style>{`
        @keyframes accountProgressDashLR {
          from { background-position: 0 0; }
          to { background-position: 22px 0; }
        }
        @keyframes accountProgressConnectorGlow {
          0%, 100% {
            opacity: 0.92;
            filter: drop-shadow(0 0 6px rgba(192, 132, 252, 0.9))
              drop-shadow(0 0 14px rgba(56, 189, 248, 0.65))
              drop-shadow(0 0 22px rgba(236, 72, 153, 0.45));
          }
          50% {
            opacity: 1;
            filter: drop-shadow(0 0 10px rgba(244, 114, 182, 0.85))
              drop-shadow(0 0 20px rgba(99, 102, 241, 0.8))
              drop-shadow(0 0 32px rgba(34, 211, 238, 0.5));
          }
        }
        @keyframes accountProgressFillShine {
          0% { transform: translateX(-95%) skewX(-18deg); opacity: 0; }
          12% { opacity: 0.95; }
          100% { transform: translateX(220%) skewX(-18deg); opacity: 0; }
        }
        @keyframes accountProgressFillShine2 {
          0% { transform: translateX(-120%) skewX(-12deg); opacity: 0; }
          25% { opacity: 0.55; }
          100% { transform: translateX(200%) skewX(-12deg); opacity: 0; }
        }
        @keyframes accountProgressFillHue {
          0%, 100% { filter: saturate(1.1) brightness(1.03); }
          50% { filter: saturate(1.35) brightness(1.12); }
        }
        @keyframes accountProgressAura {
          0%, 100% { opacity: 0.48; transform: translateY(-50%) scaleX(0.985); }
          50% { opacity: 0.82; transform: translateY(-50%) scaleX(1.015); }
        }
        @keyframes accountProgressLiquid {
          from { background-position: 0 0; }
          to { background-position: 64px 0; }
        }
        @keyframes accountProgressMicroSpark {
          0% { transform: translateX(-25%) scaleX(0.65); opacity: 0; }
          18% { opacity: 0.9; }
          100% { transform: translateX(265%) scaleX(1); opacity: 0; }
        }
        @keyframes accountConnectorFlowBG {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
        @keyframes accountConnectorBloom {
          0%, 100% { opacity: 0.55; transform: translateY(-50%) scaleX(1); }
          50% { opacity: 0.95; transform: translateY(-50%) scaleX(1.03); }
        }
        @keyframes accountConnectorSweep {
          0% { transform: translate(-100%, -50%); opacity: 0; }
          15% { opacity: 1; }
          100% { transform: translate(320%, -50%); opacity: 0; }
        }
        @keyframes accountConnectorPulseCore {
          0%, 100% { opacity: 0.72; transform: translateY(-50%) scaleY(0.85); }
          45% { opacity: 1; transform: translateY(-50%) scaleY(1.08); }
        }
        @keyframes accountCurrentDotPulse {
          0%, 100% { transform: scale(1); opacity: 0.58; }
          50% { transform: scale(1.22); opacity: 0.18; }
        }
      `}</style>
      <LogoutFloatingButton />
      <main style={styles.main}>
        <section style={styles.hero}>
          <span style={styles.heroBadge}>Личный кабинет пользователя</span>
          <h1 style={styles.heroTitle}>Ваши заявки и статусы</h1>
          <p style={styles.heroLead}>
            Отслеживайте этапы обработки заявок и историю заказов в удобном виде.
          </p>
        </section>

        <section style={styles.section}>
          <div style={styles.profileCard}>
            <div style={styles.profileTop}>
              <div style={styles.profileAvatar}>
                {getNameInitials(profileInfo.fullName)}
              </div>
              <div>
                <div style={styles.profileMainName}>{profileInfo.fullName}</div>
                <div style={styles.profileSubLine}>{profileInfo.position}</div>
              </div>
            </div>
            <div style={styles.profileInfoLine}>
              <span style={styles.profileInfoItem}>
                Почта: <strong>{profileInfo.email}</strong>
              </span>
              <span style={styles.profileInfoDot}>•</span>
              <span style={styles.profileInfoItem}>
                Телефон: <strong>{profileInfo.phone}</strong>
              </span>
              <span style={styles.profileInfoDot}>•</span>
              <span style={styles.profileInfoItem}>
                Табельный номер: <strong>{profileInfo.employeeId}</strong>
              </span>
            </div>
          </div>
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Ваши текущие заказы</h2>

          {activeOrders.length === 0 ? (
            <div style={styles.emptyCard}>
              <p style={styles.emptyText}>
                Сейчас нет активных заказов. Перейдите в каталог и оформите
                новый заказ.
              </p>
              <button
                style={styles.secondaryBtn}
                onClick={() => navigate("/catalog")}
              >
                Перейти в каталог
              </button>
            </div>
          ) : (
            <>
              <div style={styles.ordersList}>
                {activeOrders.map((order) => {
                  const meta = statusMeta(order.status);
                  const selected = selectedOrderIds.includes(order.id);
                  const currentStep = statusStepIndex(order.status);
                  return (
                    <article
                      key={order.id}
                      style={{
                        ...styles.orderCard,
                        borderColor: meta.border,
                        background: meta.cardBg,
                        boxShadow: `0 14px 30px rgba(15,39,80,0.12), inset 0 0 0 1px ${meta.ring}`,
                        ...(selected ? styles.orderCardSelected : {}),
                        ...(hoveredOrderId === order.id
                          ? selected
                            ? styles.orderCardHoverSelected
                            : styles.orderCardHover
                          : {}),
                      }}
                      onMouseEnter={() => setHoveredOrderId(order.id)}
                      onMouseLeave={() => setHoveredOrderId(null)}
                    >
                      <div style={styles.orderTop}>
                        <label style={styles.cardCheckWrap}>
                          <input
                            type="checkbox"
                            checked={selected}
                            onChange={() => toggleOrder(order.id)}
                            style={styles.checkbox}
                          />
                        </label>
                        <div style={styles.orderHeadMain}>
                          <div style={styles.orderDate}>
                            Оформлен:{" "}
                            {new Date(order.createdAt).toLocaleString("ru-RU")}
                          </div>
                          <div style={styles.orderUpdated}>
                            Последнее обновление:{" "}
                            {new Date(order.updatedAt || order.createdAt).toLocaleString(
                              "ru-RU"
                            )}
                          </div>
                        </div>
                      </div>

                      <div style={styles.orderMetaRow}>
                        <span>
                          Позиций:{" "}
                          <strong>
                            {order.itemsCount || (order.items || []).length}
                          </strong>
                        </span>
                        <span>
                          Единиц: <strong>{order.totalQty || 0}</strong>
                        </span>
                        <span>
                          Сумма:{" "}
                          <strong>
                            {orderTotal(order).toLocaleString("ru-BY")} Br
                          </strong>
                        </span>
                      </div>

                      <div
                        style={{
                          ...styles.progressWrap,
                          borderColor: meta.border,
                          background: `linear-gradient(180deg, #ffffff 0%, ${meta.badgeBg} 100%)`,
                        }}
                      >
                        <div
                          style={{
                            ...styles.progressTrackAura,
                            background: `radial-gradient(ellipse at center, ${meta.ring} 0%, rgba(255,255,255,0) 72%)`,
                          }}
                          aria-hidden
                        />
                        <div
                          style={{
                            ...styles.progressLineTrack,
                            background: `${meta.ring}`,
                          }}
                        >
                          <div
                            style={{
                              ...styles.progressLineFill,
                              width: statusProgressWidth(order.status),
                              background: `linear-gradient(90deg, ${meta.progressFrom} 0%, ${meta.progressTo} 100%)`,
                              boxShadow: `0 0 14px ${meta.progressFrom}66, 0 0 26px ${meta.progressTo}44, inset 0 1px 0 rgba(255,255,255,0.5), inset 0 -1px 0 rgba(15,23,42,0.12)`,
                            }}
                          >
                            <span
                              style={{
                                ...styles.progressLineFillInner,
                                background: `linear-gradient(180deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0) 52%, rgba(15,23,42,0.12) 100%)`,
                              }}
                              aria-hidden
                            />
                            <span style={styles.progressLineFillShine} aria-hidden />
                            <span style={styles.progressLineFillShineSoft} aria-hidden />
                            <span style={styles.progressLineFillTexture} aria-hidden />
                            <span style={styles.progressLineFillMicroSpark} aria-hidden />
                          </div>
                        </div>
                        {currentStep < 4 ? (
                          <div
                            style={{
                              ...styles.progressConnectorPending,
                              left: `calc(10% + ${currentStep} * 20%)`,
                            }}
                            aria-hidden
                          >
                            <span style={styles.progressConnectorPendingBloom} />
                            <span style={styles.progressConnectorPendingRail} />
                            <span style={styles.progressConnectorPendingFlow} />
                            <span style={styles.progressConnectorPendingCore} />
                            <span style={styles.progressConnectorPendingDash} />
                            <span style={styles.progressConnectorPendingSweep} />
                          </div>
                        ) : null}
                        <div style={styles.progressStepsRow}>
                          {[
                            "В ожидании",
                            "Принят",
                            "В обработке",
                            "Собирается",
                            "Готов к получению",
                          ].map((step, idx) => (
                            <div key={step} style={styles.progressStep}>
                              <span
                                style={{
                                  ...styles.progressDot,
                                  ...(idx <= currentStep
                                    ? styles.progressDotActive
                                    : {}),
                                  ...(idx === currentStep
                                    ? styles.progressDotCurrent
                                    : {}),
                                  ...(idx <= currentStep
                                    ? {
                                        background: `linear-gradient(135deg, ${meta.progressFrom} 0%, ${meta.progressTo} 100%)`,
                                      }
                                    : {}),
                                  ...(idx === currentStep
                                    ? { boxShadow: `0 0 0 5px ${meta.ring}` }
                                    : {}),
                                  ...(idx === currentStep ? styles.progressDotCurrentStrong : {}),
                                  ...(idx === currentStep
                                    ? {
                                        boxShadow: `0 0 0 5px ${meta.ring}, 0 0 22px ${meta.progressFrom}88, 0 0 36px ${meta.progressTo}55`,
                                      }
                                    : {}),
                                }}
                              >
                                {idx === currentStep ? (
                                  <span style={styles.progressDotHalo} aria-hidden />
                                ) : null}
                                {progressStepGlyph(idx)}
                              </span>
                              <span
                                style={{
                                  ...(idx <= currentStep
                                    ? styles.progressTextActive
                                    : styles.progressTextPassive),
                                  ...(idx === currentStep
                                    ? styles.progressTextCurrentStrong
                                    : {}),
                                }}
                              >
                                {step}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div style={styles.itemsTableWrap}>
                        <table style={styles.itemsTable}>
                          <thead>
                            <tr>
                              <th style={styles.iTh}>Товар</th>
                              <th style={styles.iTh}>Ед.</th>
                              <th style={styles.iTh}>Кол-во</th>
                              <th style={styles.iTh}>Цена</th>
                              <th style={styles.iTh}>Сумма</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(order.items || []).map((item) => (
                              <tr key={`${order.id}-${item.id}`}>
                                <td style={styles.iTd}>{item.name}</td>
                                <td style={styles.iTd}>{item.unit || "шт."}</td>
                                <td style={styles.iTdRight}>{item.qty || 0}</td>
                                <td style={styles.iTdRight}>
                                  {(item.price || 0).toLocaleString("ru-BY")} Br
                                </td>
                                <td style={styles.iTdRight}>
                                  {(
                                    (item.price || 0) * (item.qty || 0)
                                  ).toLocaleString("ru-BY")}{" "}
                                  Br
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </article>
                  );
                })}
              </div>

              <div style={styles.pickupBar}>
                <span style={styles.pickupInfo}>
                  Можно забирать только заказы со статусом «Готов к получению».
                </span>
                <button
                  type="button"
                  style={{ ...styles.primaryBtn, opacity: canPickSelected ? 1 : 0.45 }}
                  disabled={!canPickSelected}
                  onClick={pickSelected}
                >
                  Забрать выбранные заказы
                </button>
              </div>
            </>
          )}
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>История заказов</h2>
          <div style={styles.historyFiltersRow}>
            <div style={styles.searchWrap}>
              <input
                type="search"
                style={styles.searchInput}
                value={historySearch}
                onChange={(e) => {
                  setHistorySearch(e.target.value);
                  setHistoryPageIndex(0);
                }}
                placeholder="Поиск по товарам в заказе"
              />
            </div>
            {historyDirty && (
              <button type="button" style={styles.resetBtn} onClick={resetHistoryFilters}>
                Сбросить
              </button>
            )}
          </div>

          <div style={styles.historyTableWrap}>
            <table style={styles.historyTable}>
              <thead>
                <tr>
                  <th style={styles.hTh}>
                    <button
                      type="button"
                      style={styles.hSortBtn}
                      onClick={() => toggleHistorySort("number")}
                    >
                      № {sortArrow("number")}
                    </button>
                  </th>
                  <th style={styles.hTh}>
                    <button
                      type="button"
                      style={styles.hSortBtn}
                      onClick={() => toggleHistorySort("pickedUpAt")}
                    >
                      Дата {sortArrow("pickedUpAt")}
                    </button>
                  </th>
                  <th style={styles.hTh}>
                    <button
                      type="button"
                      style={styles.hSortBtn}
                      onClick={() => toggleHistorySort("names")}
                    >
                      Товары {sortArrow("names")}
                    </button>
                  </th>
                  <th style={styles.hTh}>
                    <button
                      type="button"
                      style={styles.hSortBtn}
                      onClick={() => toggleHistorySort("items")}
                    >
                      Позиций {sortArrow("items")}
                    </button>
                  </th>
                  <th style={styles.hTh}>
                    <button
                      type="button"
                      style={styles.hSortBtn}
                      onClick={() => toggleHistorySort("qty")}
                    >
                      Единиц {sortArrow("qty")}
                    </button>
                  </th>
                  <th style={styles.hTh}>
                    <button
                      type="button"
                      style={styles.hSortBtn}
                      onClick={() => toggleHistorySort("sum")}
                    >
                      Сумма {sortArrow("sum")}
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {historyPaged.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={styles.hTdEmpty}>
                      В истории нет заказов по текущим фильтрам.
                    </td>
                  </tr>
                ) : (
                  historyPaged.map((o) => (
                    <tr key={o.id}>
                      <td style={styles.hTd}>{o.number}</td>
                      <td style={styles.hTd}>
                        {new Date(o.pickedUpAt || o.createdAt).toLocaleString("ru-RU")}
                      </td>
                      <td style={styles.hTdNames}>
                        <HighlightedMatch
                          text={productNames(o) || "—"}
                          query={historySearch}
                        />
                      </td>
                      <td style={styles.hTdRight}>
                        {o.itemsCount || (o.items || []).length}
                      </td>
                      <td style={styles.hTdRight}>{o.totalQty || 0}</td>
                      <td style={styles.hTdRight}>
                        {orderTotal(o).toLocaleString("ru-BY")} Br
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {historyOrders.length > 0 && (
            <div style={styles.paginationBar}>
              <span style={styles.paginationInfo}>
                Показано {historyPageIndex * HISTORY_PAGE_SIZE + 1}-
                {Math.min(
                  (historyPageIndex + 1) * HISTORY_PAGE_SIZE,
                  historyOrders.length
                )}{" "}
                из {historyOrders.length}
              </span>
              <div style={styles.paginationNav}>
                <button
                  type="button"
                  style={{
                    ...styles.paginationBtn,
                    opacity: historyPageIndex === 0 ? 0.45 : 1,
                  }}
                  disabled={historyPageIndex === 0}
                  onClick={() => setHistoryPageIndex((i) => Math.max(0, i - 1))}
                >
                  Назад
                </button>
                <button
                  type="button"
                  style={{
                    ...styles.paginationBtn,
                    opacity:
                      (historyPageIndex + 1) * HISTORY_PAGE_SIZE >=
                      historyOrders.length
                        ? 0.45
                        : 1,
                  }}
                  disabled={
                    (historyPageIndex + 1) * HISTORY_PAGE_SIZE >=
                    historyOrders.length
                  }
                  onClick={() => setHistoryPageIndex((i) => i + 1)}
                >
                  Вперёд
                </button>
              </div>
            </div>
          )}
        </section>

        <footer style={styles.pageFooter}>
          <div style={styles.pageFooterInner}>
            <p style={styles.pageFooterCopy}>
              © {new Date().getFullYear()} Гродноэнерго · Корпоративная система
              снабжения
            </p>
          </div>
        </footer>
      </main>

      {toast && <div style={styles.toast}>{toast}</div>}
    </div>
  );
}

const styles = {
  pageWrapper: {
    minHeight: "100vh",
    background:
      "radial-gradient(1000px 380px at 10% -10%, rgba(14,165,233,0.18), transparent 60%), radial-gradient(1000px 380px at 100% 0%, rgba(29,78,216,0.2), transparent 62%), linear-gradient(180deg, #f4f8ff 0%, #eaf2ff 55%, #f8fbff 100%)",
  },
  main: {
    maxWidth: "1500px",
    width: "100%",
    margin: "0 auto",
    padding: "20px 18px 40px",
    fontFamily: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
    boxSizing: "border-box",
  },
  hero: {
    borderRadius: "22px",
    padding: "22px 26px",
    marginBottom: "16px",
    border: "1px solid #dce8f8",
    boxShadow: "0 18px 36px rgba(15,39,80,0.16)",
    background:
      "linear-gradient(130deg, rgba(10,31,69,0.96) 0%, rgba(21,64,138,0.95) 54%, rgba(11,110,143,0.95) 100%)",
    color: "#f8fbff",
  },
  heroBadge: {
    display: "inline-flex",
    padding: "5px 12px",
    borderRadius: "999px",
    fontSize: "11px",
    letterSpacing: "0.09em",
    textTransform: "uppercase",
    fontWeight: 700,
    backgroundColor: "rgba(255,255,255,0.16)",
  },
  heroTitle: {
    fontSize: "30px",
    fontWeight: 800,
    margin: "10px 0 8px",
    letterSpacing: "-0.4px",
  },
  heroLead: {
    margin: 0,
    fontSize: "15px",
    color: "rgba(248,251,255,0.9)",
    lineHeight: 1.5,
  },
  kpiRow: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: "12px",
    marginBottom: "22px",
  },
  kpiCard: {
    borderRadius: "16px",
    padding: "14px 16px",
    background: "rgba(255,255,255,0.94)",
    border: "1px solid #dce8f8",
    boxShadow: "0 10px 24px rgba(15,39,80,0.1)",
  },
  kpiLabel: {
    fontSize: "11px",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: "#64748b",
    fontWeight: 600,
    marginBottom: "6px",
  },
  kpiValue: { fontSize: "26px", fontWeight: 800, color: "#0f2748" },
  section: { marginBottom: "28px" },
  sectionTitle: {
    fontSize: "20px",
    fontWeight: 700,
    color: "#0f2748",
    marginBottom: "12px",
  },
  profileCard: {
    borderRadius: "18px",
    padding: "16px 18px",
    background:
      "linear-gradient(145deg, rgba(255,255,255,0.98) 0%, rgba(240,247,255,0.95) 100%)",
    border: "1px solid #cfe0f7",
    boxShadow: "0 14px 30px rgba(15,39,80,0.12)",
    position: "relative",
    overflow: "hidden",
  },
  profileTop: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "10px",
  },
  profileAvatar: {
    width: "44px",
    height: "44px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "14px",
    fontWeight: 800,
    color: "#ffffff",
    background:
      "linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 52%, #0e7490 100%)",
    boxShadow: "0 8px 18px rgba(29,78,216,0.35)",
    flexShrink: 0,
  },
  profileMainName: {
    fontSize: "17px",
    fontWeight: 800,
    color: "#0f2748",
    lineHeight: 1.2,
  },
  profileSubLine: {
    marginTop: "2px",
    fontSize: "14px",
    color: "#64748b",
    fontWeight: 600,
  },
  profileInfoLine: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: "10px",
    marginTop: "2px",
    paddingTop: "10px",
    borderTop: "1px dashed #cbd5e1",
  },
  profileInfoItem: {
    fontSize: "14px",
    fontWeight: 700,
    color: "#1e293b",
    background: "#ffffff",
    border: "1px solid #dbe7f6",
    borderRadius: "999px",
    padding: "6px 10px",
  },
  profileInfoDot: {
    display: "none",
  },
  ordersList: { display: "grid", gap: "12px" },
  orderCard: {
    borderRadius: "18px",
    border: "2px solid #cbd5e1",
    background: "rgba(255,255,255,0.97)",
    boxShadow: "0 14px 30px rgba(15,39,80,0.12)",
    padding: "14px",
    transition: "transform 0.16s ease, box-shadow 0.2s ease",
  },
  orderCardSelected: {
    boxShadow:
      "0 0 0 6px rgba(37,99,235,0.28), 0 24px 44px rgba(15,39,80,0.24), inset 0 0 0 2px rgba(255,255,255,0.95)",
    transform: "translateY(-3px) scale(1.005)",
    filter: "saturate(1.08)",
  },
  orderCardHover: {
    transform: "translateY(-3px)",
    boxShadow:
      "0 22px 40px rgba(15,39,80,0.22), inset 0 0 0 1px rgba(255,255,255,0.9)",
    filter: "saturate(1.05)",
  },
  orderCardHoverSelected: {
    transform: "translateY(-5px) scale(1.008)",
    boxShadow:
      "0 0 0 7px rgba(37,99,235,0.34), 0 30px 52px rgba(15,39,80,0.28), inset 0 0 0 2px rgba(255,255,255,0.98)",
    filter: "saturate(1.12)",
  },
  orderTop: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "10px",
  },
  cardCheckWrap: { display: "flex", alignItems: "center" },
  checkbox: { width: "20px", height: "20px", accentColor: "#2563eb", cursor: "pointer" },
  orderHeadMain: { display: "flex", flexDirection: "column", gap: "2px" },
  orderDate: { fontSize: "15px", color: "#64748b", fontWeight: 600 },
  orderUpdated: { fontSize: "14px", color: "#94a3b8", fontWeight: 600 },
  orderMetaRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "16px",
    marginBottom: "10px",
    color: "#334155",
    fontSize: "14px",
  },
  progressWrap: {
    display: "block",
    marginBottom: "10px",
    padding: "18px 14px 14px",
    borderRadius: "16px",
    border: "1px solid #cfe0f7",
    background: "linear-gradient(180deg, #fbfdff 0%, #f1f7ff 100%)",
    boxShadow:
      "inset 0 1px 0 rgba(255,255,255,0.88), inset 0 -18px 42px rgba(15,23,42,0.035), 0 10px 28px rgba(15,39,80,0.08)",
    position: "relative",
    overflow: "hidden",
  },
  progressTrackAura: {
    position: "absolute",
    left: "7%",
    right: "7%",
    top: "33px",
    height: "34px",
    transform: "translateY(-50%)",
    borderRadius: "999px",
    filter: "blur(16px)",
    opacity: 0.62,
    pointerEvents: "none",
    animation: "accountProgressAura 3.2s ease-in-out infinite",
    zIndex: 0,
  },
  progressLineTrack: {
    position: "absolute",
    left: "10%",
    right: "10%",
    top: "28px",
    height: "10px",
    borderRadius: "999px",
    background: "#dbe4f0",
    zIndex: 0,
    boxShadow:
      "inset 0 2px 8px rgba(15,23,42,0.2), inset 0 -1px 0 rgba(255,255,255,0.76), 0 2px 8px rgba(15,23,42,0.08), 0 1px 0 rgba(255,255,255,0.98)",
    border: "1px solid rgba(255,255,255,0.72)",
    boxSizing: "border-box",
    overflow: "hidden",
  },
  progressLineFill: {
    height: "100%",
    borderRadius: "999px",
    background: "linear-gradient(90deg, #60a5fa 0%, #22c55e 100%)",
    transition: "width 260ms ease",
    position: "relative",
    overflow: "hidden",
    animation: "accountProgressFillHue 2.9s ease-in-out infinite",
  },
  progressLineFillInner: {
    position: "absolute",
    inset: 0,
    borderRadius: "999px",
    pointerEvents: "none",
  },
  progressLineFillShine: {
    position: "absolute",
    top: "-40%",
    left: 0,
    width: "42%",
    height: "180%",
    borderRadius: "999px",
    pointerEvents: "none",
    background:
      "linear-gradient(105deg, transparent 0%, rgba(255,255,255,0.08) 35%, rgba(255,255,255,0.92) 50%, rgba(255,255,255,0.15) 65%, transparent 100%)",
    animation: "accountProgressFillShine 2.4s ease-in-out infinite",
  },
  progressLineFillShineSoft: {
    position: "absolute",
    top: "-25%",
    left: 0,
    width: "55%",
    height: "150%",
    borderRadius: "999px",
    pointerEvents: "none",
    background:
      "linear-gradient(98deg, transparent 0%, rgba(255,255,255,0.06) 40%, rgba(255,255,255,0.35) 50%, rgba(255,255,255,0.06) 60%, transparent 100%)",
    animation: "accountProgressFillShine2 4.2s ease-in-out infinite",
    animationDelay: "0.6s",
  },
  progressLineFillTexture: {
    position: "absolute",
    inset: 0,
    borderRadius: "999px",
    pointerEvents: "none",
    opacity: 0.42,
    background:
      "repeating-linear-gradient(110deg, rgba(255,255,255,0.26) 0 1px, rgba(255,255,255,0) 1px 9px)",
    backgroundSize: "64px 100%",
    animation: "accountProgressLiquid 3.2s linear infinite",
    mixBlendMode: "soft-light",
  },
  progressLineFillMicroSpark: {
    position: "absolute",
    top: "12%",
    left: 0,
    width: "34%",
    height: "76%",
    borderRadius: "999px",
    pointerEvents: "none",
    opacity: 0,
    background:
      "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 30%, rgba(255,255,255,0.92) 48%, rgba(255,255,255,0.16) 68%, transparent 100%)",
    filter: "blur(0.2px)",
    animation: "accountProgressMicroSpark 1.9s ease-in-out infinite",
    animationDelay: "0.25s",
  },
  progressConnectorPending: {
    position: "absolute",
    left: 0,
    width: "20%",
    top: "28px",
    height: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 0,
    pointerEvents: "none",
    boxSizing: "border-box",
    overflow: "hidden",
    borderRadius: "999px",
    WebkitMaskImage:
      "linear-gradient(90deg, transparent 0%, #000 10%, #000 90%, transparent 100%)",
    maskImage:
      "linear-gradient(90deg, transparent 0%, #000 10%, #000 90%, transparent 100%)",
  },
  progressConnectorPendingBloom: {
    position: "absolute",
    left: "-8%",
    right: "-8%",
    top: "50%",
    height: "22px",
    transform: "translateY(-50%)",
    borderRadius: "999px",
    pointerEvents: "none",
    background:
      "radial-gradient(ellipse 85% 95% at 50% 50%, rgba(192,132,252,0.55) 0%, rgba(99,102,241,0.35) 42%, rgba(56,189,248,0.25) 72%, transparent 88%)",
    filter: "blur(12px)",
    opacity: 0.85,
    animation: "accountConnectorBloom 2.4s ease-in-out infinite",
    zIndex: 0,
  },
  progressConnectorPendingRail: {
    position: "absolute",
    left: 0,
    right: 0,
    top: "50%",
    transform: "translateY(-50%)",
    height: "7px",
    borderRadius: "999px",
    zIndex: 1,
    background:
      "linear-gradient(90deg, rgba(76,29,149,0.64) 0%, rgba(91,33,182,0.68) 18%, rgba(99,102,241,0.82) 45%, rgba(14,165,233,0.74) 72%, rgba(190,24,93,0.56) 100%)",
    boxShadow:
      "inset 0 1px 2px rgba(255,255,255,0.72), inset 0 -1px 2px rgba(15,23,42,0.24), 0 0 22px rgba(99,102,241,0.52), 0 0 42px rgba(56,189,248,0.32)",
    border: "1px solid rgba(255,255,255,0.46)",
    boxSizing: "border-box",
  },
  progressConnectorPendingFlow: {
    position: "absolute",
    left: 0,
    right: 0,
    top: "50%",
    transform: "translateY(-50%)",
    height: "7px",
    borderRadius: "999px",
    zIndex: 2,
    pointerEvents: "none",
    opacity: 0.85,
    backgroundImage:
      "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 15%, rgba(244,114,182,0.75) 28%, rgba(167,139,250,0.9) 42%, rgba(56,189,248,0.85) 58%, rgba(192,132,252,0.75) 72%, rgba(255,255,255,0.12) 85%, transparent 100%)",
    backgroundSize: "220% 100%",
    animation: "accountConnectorFlowBG 2.2s linear infinite",
    mixBlendMode: "screen",
  },
  progressConnectorPendingCore: {
    position: "absolute",
    left: "3%",
    right: "3%",
    top: "50%",
    transform: "translateY(-50%)",
    height: "2px",
    borderRadius: "999px",
    zIndex: 3,
    pointerEvents: "none",
    background:
      "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.9) 26%, #e0f2fe 50%, rgba(255,255,255,0.78) 74%, transparent 100%)",
    boxShadow:
      "0 0 10px rgba(224,242,254,0.9), 0 0 18px rgba(56,189,248,0.5)",
    opacity: 0.8,
    animation: "accountConnectorPulseCore 1.45s ease-in-out infinite",
  },
  progressConnectorPendingDash: {
    position: "absolute",
    left: 0,
    right: 0,
    top: "50%",
    transform: "translateY(-50%)",
    height: "7px",
    borderRadius: "999px",
    zIndex: 4,
    backgroundImage:
      "repeating-linear-gradient(90deg, rgba(255,255,255,0) 0 6px, rgba(255,255,255,0.65) 6px 6.5px, #e9d5ff 6.5px 7.5px, #818cf8 7.5px 10px, #38bdf8 10px 12px, #f472b6 12px 13px, #c4b5fd 13px 14px, rgba(255,255,255,0) 14px 22px)",
    backgroundSize: "22px 100%",
    animation:
      "accountProgressDashLR 0.65s linear infinite, accountProgressConnectorGlow 1.6s ease-in-out infinite",
  },
  progressConnectorPendingSweep: {
    position: "absolute",
    top: "50%",
    left: 0,
    width: "38%",
    height: "7px",
    borderRadius: "999px",
    zIndex: 5,
    pointerEvents: "none",
    background:
      "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.85) 45%, rgba(255,255,255,0.95) 50%, rgba(255,255,255,0.75) 55%, transparent 100%)",
    filter: "blur(0.5px)",
    opacity: 0.9,
    mixBlendMode: "soft-light",
    animation: "accountConnectorSweep 1.85s ease-in-out infinite",
  },
  progressStepsRow: {
    display: "grid",
    gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
    gap: "8px",
    position: "relative",
    zIndex: 1,
  },
  progressStep: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "8px",
    padding: "0 2px",
    fontSize: "13px",
    fontWeight: 600,
    textAlign: "center",
  },
  progressDot: {
    width: "30px",
    height: "30px",
    borderRadius: "999px",
    background: "#cbd5e1",
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px",
    fontWeight: 700,
    color: "#fff",
    position: "relative",
    isolation: "isolate",
    boxShadow:
      "inset 0 1px 0 rgba(255,255,255,0.58), inset 0 -2px 5px rgba(15,23,42,0.18), 0 6px 14px rgba(15,23,42,0.12)",
  },
  progressDotActive: {
    background: "linear-gradient(135deg, #1d4ed8 0%, #0ea5e9 100%)",
  },
  progressDotCurrent: {
    boxShadow: "0 0 0 6px rgba(59,130,246,0.24)",
  },
  progressDotCurrentStrong: {
    transform: "scale(1.2)",
    border: "2px solid rgba(255,255,255,0.98)",
  },
  progressDotHalo: {
    position: "absolute",
    inset: "-9px",
    borderRadius: "999px",
    background:
      "radial-gradient(circle, rgba(255,255,255,0.45) 0%, rgba(125,211,252,0.28) 34%, rgba(99,102,241,0.16) 55%, rgba(255,255,255,0) 72%)",
    zIndex: -1,
    pointerEvents: "none",
    animation: "accountCurrentDotPulse 1.8s ease-in-out infinite",
  },
  progressTextPassive: {
    color: "#94a3b8",
    lineHeight: 1.3,
  },
  progressTextActive: {
    color: "#0f3e96",
    fontWeight: 700,
    lineHeight: 1.3,
  },
  progressTextCurrentStrong: {
    color: "#0b3b92",
    textShadow: "0 1px 0 rgba(255,255,255,0.75)",
    fontWeight: 800,
  },
  itemsTableWrap: {
    overflowX: "auto",
    borderRadius: "12px",
    border: "1px solid #dbe7f6",
  },
  itemsTable: { width: "100%", minWidth: "860px", borderCollapse: "collapse" },
  iTh: {
    textAlign: "left",
    padding: "10px 12px",
    fontSize: "11px",
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    color: "#64748b",
    background: "#f8fbff",
    borderBottom: "1px solid #e2e8f0",
  },
  iTd: {
    padding: "9px 12px",
    fontSize: "14px",
    borderBottom: "1px solid #eef2f7",
    color: "#334155",
  },
  iTdRight: {
    padding: "9px 12px",
    fontSize: "14px",
    textAlign: "left",
    borderBottom: "1px solid #eef2f7",
    color: "#334155",
    whiteSpace: "nowrap",
  },
  pickupBar: {
    marginTop: "12px",
    padding: "10px 14px",
    borderRadius: "14px",
    border: "1px solid #dbe7f6",
    background: "rgba(255,255,255,0.93)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
    flexWrap: "wrap",
  },
  pickupInfo: { fontSize: "13px", color: "#475569" },
  primaryBtn: {
    border: "none",
    borderRadius: "999px",
    padding: "10px 20px",
    color: "#fff",
    fontWeight: 700,
    fontSize: "14px",
    cursor: "pointer",
    background:
      "linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 52%, #0e7490 100%)",
    boxShadow: "0 10px 22px rgba(29,78,216,0.35)",
  },
  secondaryBtn: {
    border: "1px solid #2563eb",
    borderRadius: "999px",
    padding: "10px 18px",
    color: "#1d4ed8",
    fontWeight: 600,
    background: "#fff",
    cursor: "pointer",
  },
  emptyCard: {
    borderRadius: "16px",
    padding: "20px",
    background: "rgba(255,255,255,0.95)",
    border: "1px solid #dbe7f6",
    boxShadow: "0 10px 24px rgba(15,39,80,0.08)",
  },
  emptyText: { margin: "0 0 12px", color: "#475569" },
  historyFiltersRow: {
    display: "flex",
    gap: "10px",
    alignItems: "stretch",
    flexWrap: "wrap",
    marginBottom: "12px",
  },
  searchWrap: {
    flex: 1,
    minWidth: 0,
    height: "48px",
    display: "flex",
    alignItems: "center",
    border: "1px solid #dae0e7",
    borderRadius: "10px",
    background: "#fafbfc",
  },
  searchInput: {
    flex: 1,
    minWidth: 0,
    height: "48px",
    padding: "14px 18px",
    border: "none",
    outline: "none",
    fontSize: "15px",
    lineHeight: 1.2,
    color: "#1a1a1a",
    background: "transparent",
    boxSizing: "border-box",
  },
  statusFilterSelect: {
    height: "48px",
    borderRadius: "10px",
    border: "1px solid #cbd5e1",
    padding: "0 12px",
    background: "#fff",
    color: "#334155",
    fontSize: "14px",
  },
  resetBtn: {
    height: "48px",
    borderRadius: "10px",
    border: "1px solid #94a3b8",
    padding: "0 16px",
    background: "#fff",
    color: "#334155",
    fontWeight: 600,
    cursor: "pointer",
  },
  searchHighlight: {
    backgroundColor: "#fde047",
    color: "#713f12",
    padding: "1px 4px",
    borderRadius: "4px",
    fontWeight: 700,
  },
  historyTableWrap: {
    maxHeight: "460px",
    overflow: "auto",
    borderRadius: "16px",
    border: "1px solid #dce8f8",
    background: "rgba(255,255,255,0.96)",
    boxShadow: "0 12px 28px rgba(15,39,80,0.1)",
  },
  historyTable: {
    width: "100%",
    minWidth: "1050px",
    borderCollapse: "separate",
    borderSpacing: 0,
  },
  hTh: {
    position: "sticky",
    top: 0,
    zIndex: 2,
    background: "#f8fbff",
    borderBottom: "1px solid #e2e8f0",
    padding: 0,
  },
  hSortBtn: {
    width: "100%",
    margin: 0,
    padding: "12px 14px",
    textAlign: "left",
    border: "none",
    background: "transparent",
    color: "#64748b",
    fontSize: "11px",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    fontWeight: 600,
    cursor: "pointer",
    display: "flex",
    justifyContent: "space-between",
    gap: "8px",
  },
  hTd: {
    padding: "10px 14px",
    borderBottom: "1px solid #eef2f7",
    fontSize: "14px",
    color: "#334155",
  },
  hTdRight: {
    padding: "10px 14px",
    borderBottom: "1px solid #eef2f7",
    fontSize: "14px",
    color: "#334155",
    textAlign: "left",
  },
  hTdNames: {
    padding: "10px 14px",
    borderBottom: "1px solid #eef2f7",
    fontSize: "13px",
    color: "#334155",
    maxWidth: "380px",
  },
  hTdEmpty: { padding: "24px 14px", textAlign: "center", color: "#64748b", fontSize: "14px" },
  paginationBar: {
    marginTop: "12px",
    padding: "10px 14px",
    borderRadius: "14px",
    border: "1px solid #dbe7f6",
    background: "rgba(255,255,255,0.93)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
    flexWrap: "wrap",
  },
  paginationInfo: { fontSize: "14px", color: "#475569", fontWeight: 600 },
  paginationNav: { display: "flex", gap: "10px" },
  paginationBtn: {
    padding: "8px 20px",
    borderRadius: "10px",
    border: "1px solid #2563eb",
    color: "#1d4ed8",
    background: "#fff",
    fontWeight: 600,
    cursor: "pointer",
  },
  pageFooter: {
    marginTop: "26px",
    borderRadius: "18px",
    border: "1px solid #d9e5f7",
    background:
      "linear-gradient(135deg, rgba(10,31,69,0.96) 0%, rgba(21,64,138,0.95) 55%, rgba(11,110,143,0.95) 100%)",
    boxShadow: "0 18px 36px rgba(15,23,42,0.2)",
    overflow: "hidden",
  },
  pageFooterInner: {
    padding: "18px 22px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "16px",
    flexWrap: "wrap",
  },
  pageFooterCopy: {
    margin: 0,
    color: "#edf3ff",
    fontSize: "13px",
    fontWeight: 600,
    textAlign: "center",
  },
  toast: {
    position: "fixed",
    right: "20px",
    bottom: "20px",
    zIndex: 40,
    background: "#ecfdf5",
    color: "#065f46",
    border: "1px solid #a7f3d0",
    borderRadius: "12px",
    padding: "12px 16px",
    fontSize: "14px",
    fontWeight: 700,
    boxShadow: "0 10px 22px rgba(15,23,42,0.2)",
  },
};
