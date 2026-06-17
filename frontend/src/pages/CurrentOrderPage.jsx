import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAppData } from "../context/AppDataContext";

function LogoutFloatingButton() {
  const navigate = useNavigate();
  const { logout } = useAppData();
  const [logoutHovered, setLogoutHovered] = useState(false);

  const onLogout = () => {
    logout();
    navigate("/sign-in-sign-up");
  };

  return (
    <div style={logoutFloatingStyles.actions}>
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
  iconWrap: { width: "22px", height: "22px", borderRadius: "999px", display: "inline-flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.16)", border: "1px solid rgba(255,255,255,0.26)", flexShrink: 0 },
  icon: { width: "15px", height: "15px" },
};

export default function CurrentOrderPage() {
  const navigate = useNavigate();
  const { id: routeCartSlug } = useParams();
  const { currentUser, cartItems, changeCartQty, removeCartItems, placeOrderFromCart, activeCartCount } = useAppData();

  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    if (routeCartSlug !== "draft") {
      navigate("/current-order/draft", { replace: true });
    }
  }, [navigate, routeCartSlug]);

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleRemoveSelected = async () => {
    await removeCartItems(selectedIds);
    setSelectedIds([]);
  };

  const totalPositions = cartItems.length;
  const totalQty = cartItems.reduce((sum, item) => sum + item.qty, 0);
  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.qty * (item.price || 0),
    0
  );

  const handlePlaceOrder = async () => {
    const created = await placeOrderFromCart();
    if (created) {
      navigate(`/profile/${created.customerId || currentUser?.id || "SU-1001"}`);
    }
  };

  const orderPageFxCss = `
  .order-page-pro .order-hero-pro,
  .order-page-pro .order-table-pro,
  .order-page-pro .order-summary-pro {
    animation: orderFadeUp 0.55s ease both;
  }

  .order-page-pro .order-table-pro { animation-delay: 0.06s; }
  .order-page-pro .order-summary-pro { animation-delay: 0.12s; }

  .order-page-pro .order-btn-pro {
    transition: transform 0.18s ease, box-shadow 0.2s ease, filter 0.2s ease;
  }

  .order-page-pro .order-btn-pro:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 24px rgba(29, 78, 216, 0.26);
    filter: brightness(1.03);
  }

  .order-page-pro .order-table-pro table tbody tr {
    transition: background-color 0.2s ease;
  }

  .order-page-pro .order-table-pro table tbody tr:hover {
    background-color: #f8fbff;
  }

  .order-page-pro .order-hero-pro {
    position: relative;
    overflow: hidden;
  }

  .order-page-pro .order-hero-pro::before,
  .order-page-pro .order-hero-pro::after {
    content: "";
    position: absolute;
    border-radius: 999px;
    pointer-events: none;
  }

  .order-page-pro .order-hero-pro::before {
    width: 260px;
    height: 260px;
    top: -120px;
    right: -90px;
    background: radial-gradient(circle, rgba(245, 158, 11, 0.4), transparent 72%);
    animation: orderGlow 8.5s ease-in-out infinite;
  }

  .order-page-pro .order-hero-pro::after {
    width: 320px;
    height: 320px;
    bottom: -160px;
    left: -120px;
    background: radial-gradient(circle, rgba(14, 165, 233, 0.35), transparent 75%);
    animation: orderGlow 9.5s ease-in-out infinite reverse;
  }

  @keyframes orderFadeUp {
    from {
      opacity: 0;
      transform: translateY(12px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes orderGlow {
    0%,
    100% {
      transform: scale(1);
      opacity: 1;
    }
    50% {
      transform: scale(1.14);
      opacity: 0.72;
    }
  }
  `;

  return (
    <div style={styles.pageWrapper} className="order-page-pro">
      <LogoutFloatingButton />
      <style>{orderPageFxCss}</style>
      <main style={styles.main}>
        <section style={styles.heroCard} className="order-hero-pro">
          <span style={styles.heroBadge}>Заявка на снабжение</span>
          <h1 style={styles.title}>Ваш текущий заказ</h1>
          <p style={styles.subtitle}>
            Проверьте товары, уточните количество и оформите заявку для складской обработки.
          </p>
          <div style={styles.kpiRow}>
            <div style={styles.kpiCard}>
              <div style={styles.kpiLabel}>Позиции</div>
              <div style={styles.kpiValue}>{totalPositions}</div>
            </div>
            <div style={styles.kpiCard}>
              <div style={styles.kpiLabel}>Единицы</div>
              <div style={styles.kpiValue}>{totalQty}</div>
            </div>
            <div style={styles.kpiCard}>
              <div style={styles.kpiLabel}>Сумма</div>
              <div style={styles.kpiValue}>{totalPrice.toLocaleString("ru-BY")} Br</div>
            </div>
          </div>
        </section>

        {cartItems.length === 0 ? (
          <div style={styles.emptyCard} className="order-table-pro">
            <p style={styles.emptyText}>
              Сейчас в заказе нет товаров. Выберите позиции в каталоге и сформируйте поставку.
            </p>
            <button
              style={styles.primaryButton}
              className="order-btn-pro"
              onClick={() => navigate("/catalog")}
            >
              Перейти в каталог
            </button>
          </div>
        ) : (
          <>
            <div style={styles.tableTopBar}>
              <span style={styles.tableTopBarInfo}>Выбрано позиций: {selectedIds.length}</span>
              <button
                style={{
                  ...styles.deleteSelectedBtn,
                  opacity: selectedIds.length === 0 ? 0.4 : 1,
                  cursor: selectedIds.length === 0 ? "default" : "pointer",
                }}
                onClick={handleRemoveSelected}
                disabled={selectedIds.length === 0}
              >
                Удалить выбранное
              </button>
            </div>

            <div style={styles.tableWrapper} className="order-table-pro">
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.thCheck}></th>
                    <th style={styles.th}>Фото</th>
                    <th style={styles.th}>Товар</th>
                    <th style={styles.th}>Ед. изм.</th>
                    <th style={styles.th}>Количество</th>
                    <th style={styles.th}>Цена</th>
                    <th style={styles.th}>Сумма</th>
                  </tr>
                </thead>
                <tbody>
                  {cartItems.map((item) => {
                    const imageUrl = (item.imageUrl || "").trim();
                    const category =
                      (typeof item.category === "string" && item.category.trim()) ||
                      (typeof item.categoryName === "string" && item.categoryName.trim()) ||
                      "";
                    const subcategory =
                      (typeof item.subcategory === "string" && item.subcategory.trim()) ||
                      (typeof item.subcategoryName === "string" && item.subcategoryName.trim()) ||
                      "";
                    const isSelected = selectedIds.includes(item.id);
                    return (
                      <tr key={item.id} style={isSelected ? styles.trSelected : {}}>
                        <td style={styles.tdCheck}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelect(item.id)}
                            style={styles.checkbox}
                          />
                        </td>
                        <td style={styles.tdImage}>
                          {imageUrl ? (
                            <img src={imageUrl} alt={item.name} style={styles.productThumb} />
                          ) : (
                            <div style={styles.productThumbPlaceholder}>Фото</div>
                          )}
                        </td>
                        <td style={styles.tdName}>
                          <div style={styles.tdNameTitle}>{item.name}</div>
                          {category ? (
                            <div style={styles.tdNameSub}>
                              Категория: <span style={styles.tdNameSubValue}>{category}</span>
                            </div>
                          ) : null}
                          {subcategory ? (
                            <div style={styles.tdNameSub}>
                              Подкатегория: <span style={styles.tdNameSubValue}>{subcategory}</span>
                            </div>
                          ) : null}
                        </td>
                        <td style={styles.td}>{item.unit || "шт"}</td>
                        <td style={styles.tdQty}>
                          <div style={styles.qtyControl}>
                            <button
                              style={styles.qtyBtn}
                              onClick={() => changeCartQty(item.id, -1)}
                            >
                              −
                            </button>
                            <span style={styles.qtyValue}>{item.qty}</span>
                            <button
                              style={styles.qtyBtn}
                              onClick={() => changeCartQty(item.id, 1)}
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td style={styles.tdRight}>{item.price?.toLocaleString("ru-BY") || 0} Br</td>
                        <td style={styles.tdRight}>{(item.price * item.qty).toLocaleString("ru-BY")} Br</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div style={styles.actionsRow}>
              <button style={styles.secondaryButton} onClick={() => navigate("/catalog")}>
                Продолжить выбор
              </button>
              <button
                style={{
                  ...styles.primaryButton,
                  opacity: activeCartCount === 0 ? 0.6 : 1,
                  cursor: activeCartCount === 0 ? "default" : "pointer",
                }}
                className="order-btn-pro"
                onClick={handlePlaceOrder}
                disabled={activeCartCount === 0}
              >
                Оформить заказ
              </button>
            </div>
          </>
        )}

        <footer style={styles.pageFooter}>
          <div style={styles.pageFooterInner}>
            <p style={styles.pageFooterCopy}>
              © {new Date().getFullYear()} Гродноэнерго · Корпоративная система снабжения
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}

const styles = {
  pageWrapper: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    background:
      "radial-gradient(1000px 380px at 10% -10%, rgba(14,165,233,0.2), transparent 60%), radial-gradient(1000px 380px at 100% 0%, rgba(29,78,216,0.24), transparent 62%), linear-gradient(180deg, #f4f8ff 0%, #eaf2ff 55%, #f8fbff 100%)",
  },
  main: {
    flex: 1,
    maxWidth: "1500px",
    width: "100%",
    margin: "0 auto",
    padding: "20px 20px 46px",
    fontFamily: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
  },
  heroCard: {
    borderRadius: "22px",
    padding: "22px 24px",
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
  title: {
    fontSize: "34px",
    fontWeight: 800,
    margin: "10px 0 8px",
    color: "#f8fbff",
    letterSpacing: "-0.6px",
  },
  subtitle: {
    margin: 0,
    fontSize: "15px",
    color: "rgba(248, 251, 255, 0.9)",
  },
  kpiRow: {
    marginTop: "16px",
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: "12px",
  },
  kpiCard: {
    borderRadius: "14px",
    padding: "12px 14px",
    backgroundColor: "rgba(255,255,255,0.12)",
    border: "1px solid rgba(255,255,255,0.2)",
  },
  kpiLabel: {
    fontSize: "11px",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: "rgba(232, 242, 255, 0.9)",
    marginBottom: "6px",
  },
  kpiValue: {
    fontSize: "22px",
    fontWeight: 800,
    color: "#ffffff",
  },
  tableTopBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "10px",
    padding: "10px 14px",
    borderRadius: "14px",
    border: "1px solid #dbe7f6",
    backgroundColor: "rgba(255,255,255,0.92)",
    boxShadow: "0 8px 18px rgba(15,39,80,0.08)",
  },
  tableTopBarInfo: {
    fontSize: "17px",
    fontWeight: 700,
    color: "#334155",
  },
  deleteSelectedBtn: {
    padding: "9px 18px",
    fontSize: "14px",
    fontWeight: 600,
    borderRadius: "999px",
    border: "none",
    background: "linear-gradient(135deg, #f87171 0%, #dc2626 85%)",
    color: "#ffffff",
    boxShadow: "0 8px 16px rgba(239,68,68,0.3)",
    letterSpacing: "0.01em",
  },
  emptyCard: {
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: "18px",
    padding: "34px",
    border: "1px solid #dce8f8",
    boxShadow: "0 18px 34px rgba(15, 39, 80, 0.13)",
    textAlign: "center",
  },
  emptyText: {
    marginBottom: "18px",
    color: "#475569",
    fontSize: "16px",
  },
  tableWrapper: {
    overflowX: "auto",
    backgroundColor: "rgba(255,255,255,0.96)",
    borderRadius: "18px",
    boxShadow: "0 14px 28px rgba(15, 39, 80, 0.12)",
    width: "100%",
    border: "1px solid #dce8f8",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "1120px",
  },
  thCheck: {
    padding: "14px 10px 14px 18px",
    width: "44px",
    borderBottom: "1px solid #e2e8f0",
    backgroundColor: "#f8fbff",
  },
  th: {
    textAlign: "left",
    padding: "14px 16px",
    fontSize: "12px",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: "#5b6d88",
    borderBottom: "1px solid #e2e8f0",
    backgroundColor: "#f8fbff",
    whiteSpace: "nowrap",
    fontWeight: 600,
  },
  trSelected: {
    backgroundColor: "#e8f1ff",
  },
  tdCheck: {
    padding: "12px 10px 12px 18px",
    borderBottom: "1px solid #eaf0f7",
    verticalAlign: "middle",
    width: "44px",
  },
  checkbox: {
    width: "18px",
    height: "18px",
    cursor: "pointer",
    accentColor: "#2563eb",
  },
  td: {
    padding: "13px 16px",
    fontSize: "17px",
    borderBottom: "1px solid #eaf0f7",
    verticalAlign: "middle",
    color: "#334155",
  },
  tdName: {
    padding: "13px 16px",
    fontSize: "17px",
    borderBottom: "1px solid #eaf0f7",
    verticalAlign: "top",
    color: "#111827",
  },
  tdNameTitle: {
    fontWeight: 700,
    fontSize: "17px",
    lineHeight: 1.35,
    color: "#111827",
  },
  tdNameSub: {
    marginTop: "6px",
    fontSize: "13px",
    lineHeight: 1.35,
    fontWeight: 600,
    color: "#64748b",
  },
  tdNameSubValue: {
    fontWeight: 600,
    color: "#334155",
  },
  tdQty: {
    padding: "13px 16px",
    borderBottom: "1px solid #eaf0f7",
    verticalAlign: "middle",
  },
  tdRight: {
    padding: "13px 16px",
    fontSize: "17px",
    borderBottom: "1px solid #eaf0f7",
    textAlign: "left",
    whiteSpace: "nowrap",
    verticalAlign: "middle",
    fontWeight: 600,
    color: "#111827",
  },
  tdImage: {
    padding: "10px 14px",
    borderBottom: "1px solid #eaf0f7",
    width: "90px",
    verticalAlign: "middle",
  },
  productThumb: {
    width: "78px",
    height: "78px",
    objectFit: "cover",
    borderRadius: "10px",
    backgroundColor: "#e5e7eb",
    display: "block",
    border: "1px solid #dbe7f6",
    boxShadow: "0 6px 12px rgba(15,39,80,0.08)",
  },
  productThumbPlaceholder: {
    width: "78px",
    height: "78px",
    borderRadius: "10px",
    backgroundColor: "#e5e7eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "13px",
    color: "#6b7280",
  },
  qtyControl: {
    display: "inline-flex",
    alignItems: "center",
    borderRadius: "999px",
    border: "1px solid #d1ddee",
    overflow: "hidden",
    height: "36px",
  },
  qtyBtn: {
    border: "none",
    backgroundColor: "#eaf1fc",
    padding: "0 12px",
    cursor: "pointer",
    fontSize: "18px",
    fontWeight: 700,
    color: "#374151",
    height: "36px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    lineHeight: 1,
    transform: "none",
  },
  qtyValue: {
    minWidth: "38px",
    textAlign: "center",
    fontSize: "17px",
    fontWeight: 600,
    backgroundColor: "#ffffff",
    height: "36px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderLeft: "1px solid #e5e7eb",
    borderRight: "1px solid #e5e7eb",
  },
  summaryRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "16px",
    marginTop: "14px",
    marginBottom: "16px",
    padding: "16px",
    backgroundColor: "rgba(255,255,255,0.94)",
    borderRadius: "16px",
    border: "1px solid #dce8f8",
    boxShadow: "0 10px 24px rgba(15,39,80,0.1)",
  },
  summaryCell: {
    flex: 1,
    minWidth: "0",
  },
  summaryLabel: {
    fontSize: "11px",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: "#9ca3af",
    marginBottom: "4px",
    fontWeight: 600,
  },
  summaryValue: {
    fontSize: "18px",
    fontWeight: 700,
    color: "#111827",
  },
  summaryTotal: {
    fontSize: "24px",
    fontWeight: 800,
    color: "#1d4ed8",
    letterSpacing: "-0.5px",
  },
  actionsRow: {
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    marginTop: "14px",
    gap: "14px",
  },
  primaryButton: {
    background:
      "linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 52%, #0e7490 100%)",
    border: "none",
    color: "#ffffff",
    padding: "12px 32px",
    borderRadius: "999px",
    fontSize: "15px",
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 14px 28px rgba(29,78,216,0.38)",
    letterSpacing: "0.03em",
  },
  secondaryButton: {
    borderRadius: "999px",
    border: "1px solid #cbd8ec",
    backgroundColor: "rgba(255,255,255,0.95)",
    padding: "12px 28px",
    fontSize: "15px",
    fontWeight: 600,
    cursor: "pointer",
    color: "#374151",
    boxShadow: "0 10px 20px rgba(15,39,80,0.1)",
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
};

