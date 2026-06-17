import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppData } from "../context/AppDataContext";
import { apiAbsoluteUrl } from "../utils/apiOrigin";
import { backendAssetUrl } from "../utils/backendAssetUrl";

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
        style={{
          ...logoutFloatingStyles.btn,
          ...logoutFloatingStyles.logoutBtn,
          ...(logoutHovered ? logoutFloatingStyles.logoutBtnHover : {}),
        }}
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

const productPageFxCss = `
.product-page-pro .product-banner-pro {
  position: relative;
  overflow: hidden;
}

.product-page-pro .product-banner-pro::before,
.product-page-pro .product-banner-pro::after {
  content: "";
  position: absolute;
  border-radius: 999px;
  pointer-events: none;
}

.product-page-pro .product-banner-pro::before {
  width: 300px;
  height: 300px;
  top: -140px;
  right: -120px;
  background: radial-gradient(circle, rgba(245, 158, 11, 0.45), transparent 70%);
  animation: productGlow 8s ease-in-out infinite;
}

.product-page-pro .product-banner-pro::after {
  width: 340px;
  height: 340px;
  bottom: -180px;
  left: -140px;
  background: radial-gradient(circle, rgba(14, 165, 233, 0.35), transparent 72%);
  animation: productGlow 9s ease-in-out infinite reverse;
}

.product-page-pro .product-breadcrumbs-pro,
.product-page-pro .product-image-pro,
.product-page-pro .product-info-pro {
  animation: productFadeUp 0.55s ease both;
}

.product-page-pro .product-image-pro { animation-delay: 0.08s; }
.product-page-pro .product-info-pro { animation-delay: 0.12s; }

.product-page-pro .product-main-image-pro {
  transition: transform 0.28s ease;
}

.product-page-pro .product-secondary-btn-pro:hover {
  transform: translateY(-2px);
}

.product-page-pro .product-primary-btn-pro,
.product-page-pro .product-secondary-btn-pro {
  transition: transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease;
}

.product-page-pro .product-primary-btn-pro:hover {
  box-shadow: 0 16px 30px rgba(29, 78, 216, 0.42);
  filter: brightness(1.05);
}

.product-page-pro .product-secondary-btn-pro:hover {
  box-shadow: 0 10px 22px rgba(30, 64, 175, 0.2);
}

@keyframes productFadeUp {
  from {
    opacity: 0;
    transform: translateY(14px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes productGlow {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.14);
    opacity: 0.75;
  }
}

`;

export default function ProductPage() {
  const params = useParams();
  const productId = decodeURIComponent(params.productId || "").trim();
  const navigate = useNavigate();
  const { addToCart } = useAppData();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadErr, setLoadErr] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadErr(null);
    if (!productId) {
      setProduct(null);
      setLoading(false);
      return undefined;
    }
    const url = apiAbsoluteUrl(`/api/supply-goods/item/${encodeURIComponent(productId)}`);
    fetch(url, { credentials: "include" })
      .then((r) => {
        if (!r.ok) throw new Error(r.status === 404 ? "not-found" : `HTTP ${r.status}`);
        return r.json();
      })
      .then((body) => {
        if (!cancelled) {
          setProduct(body);
          setLoadErr(null);
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setLoadErr(e.message || String(e));
          setProduct(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [productId]);

  const [lineComment] = useState("");

  const categoryName = product?.category?.trim() || "Категория";

  if (loading) {
    return (
      <div style={styles.pageWrapper}>
        <LogoutFloatingButton />
        <main style={styles.main}>
          <section style={styles.banner}>
            <div style={styles.bannerInner}>Место для баннера товара</div>
          </section>
          <div style={styles.notFound}>
            <p style={styles.text}>Загрузка карточки товара…</p>
          </div>
        </main>
      </div>
    );
  }

  if (loadErr || !product) {
    return (
      <div style={styles.pageWrapper}>
        <LogoutFloatingButton />
        <main style={styles.main}>
          <section style={styles.banner}>
            <div style={styles.bannerInner}>Место для баннера товара</div>
          </section>
          <div style={styles.notFound}>
            <h1 style={styles.title}>Товар не найден</h1>
            <p style={styles.text}>
              Такой позиции нет в каталоге снабжения (supply_goods).
              {(loadErr && loadErr !== "not-found" && (
                <>
                  {" "}
                  Ошибка: {loadErr}
                </>
              )) ||
                ""}{" "}
              Проверьте код товара (например SG-1001) и что backend подключён к PostgreSQL.
            </p>
            <button style={styles.primaryButton} onClick={() => navigate("/catalog")}>
              В каталог
            </button>
          </div>
        </main>
      </div>
    );
  }

  const numericPrice =
    typeof product.price === "number" ? product.price : Number(product.price);

  const handleAdd = () => {
    const options = { comment: lineComment.trim() };

    addToCart(
      {
        id: product.id,
        name: product.goodName,
        price: Number.isFinite(numericPrice) ? numericPrice : 0,
        unit: product.unit,
        category: typeof product.category === "string" ? product.category.trim() : "",
        subcategory:
          typeof product.subcategory === "string" ? product.subcategory.trim() : "",
        shortDescription:
          product.description && typeof product.description === "string"
            ? product.description.slice(0, 280)
            : product.goodName,
        imageUrl: backendAssetUrl(product.imageUrl || ""),
      },
      options
    );
    navigate("/current-order/draft");
  };

  const catalogHref = () => {
    const p = new URLSearchParams();
    if (product.category) p.set("category", product.category);
    return `/catalog${p.toString() ? `?${p}` : ""}`;
  };

  const catalogSubHref = () => {
    const p = new URLSearchParams();
    if (product.category) p.set("category", product.category);
    if (product.subcategory) p.set("subcategory", product.subcategory);
    return `/catalog${p.toString() ? `?${p}` : ""}`;
  };

  return (
    <div style={styles.pageWrapper} className="product-page-pro">
      <LogoutFloatingButton />
      <style>{productPageFxCss}</style>
      <main style={styles.main}>
        <section style={styles.banner}>
          <div style={styles.bannerInner} className="product-banner-pro">
            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{ fontSize: "13px", letterSpacing: "0.14em", textTransform: "uppercase", opacity: 0.88 }}>
                Гродноэнерго · Описание товара
                                    </div>
              <div style={{ fontSize: "26px", fontWeight: 800, marginTop: "8px", lineHeight: 1.25 }}>
                Карточка товара для оформления заявки
                                </div>
              <div style={{ marginTop: "10px", fontSize: "15px", opacity: 0.9 }}>
                Характеристики, цена и добавление товара в текущий заказ в одном окне.
                        </div>
            </div>
          </div>
        </section>

        <nav style={styles.breadcrumbs} className="product-breadcrumbs-pro">
          <button
            type="button"
            style={styles.breadcrumbLink}
            onClick={() => navigate("/")}
            onMouseEnter={(e) => { e.currentTarget.style.color = "#1d4ed8"; e.currentTarget.style.textDecoration = "underline"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "#4b6a9b"; e.currentTarget.style.textDecoration = "none"; }}
          >
            Главная
          </button>
          <span style={styles.breadcrumbSeparator}>›</span>
          <button
            type="button"
            style={styles.breadcrumbLink}
            onClick={() => navigate(catalogHref())}
            onMouseEnter={(e) => { e.currentTarget.style.color = "#1d4ed8"; e.currentTarget.style.textDecoration = "underline"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "#4b6a9b"; e.currentTarget.style.textDecoration = "none"; }}
          >
            {categoryName}
          </button>
          <span style={styles.breadcrumbSeparator}>›</span>
          <button
            type="button"
            style={styles.breadcrumbLink}
            onClick={() => navigate(catalogSubHref())}
            onMouseEnter={(e) => { e.currentTarget.style.color = "#1d4ed8"; e.currentTarget.style.textDecoration = "underline"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "#4b6a9b"; e.currentTarget.style.textDecoration = "none"; }}
          >
            {product.subcategory}
          </button>
          <span style={styles.breadcrumbSeparator}>›</span>
          <span style={styles.breadcrumbCurrent}>{product.goodName}</span>
        </nav>

        <section style={styles.layout} className="product-layout-pro">
          <div style={styles.imageBlock} className="product-image-pro">
            <div style={styles.imageGallery}>
              <div style={styles.mainImageWrapper}>
                {product.imageUrl ? (
                  <img
                    src={backendAssetUrl(product.imageUrl)}
                    alt={product.goodName}
                    style={styles.mainImage}
                    className="product-main-image-pro"
                  />
                ) : (
                  <div style={styles.imagePlaceholder}>
                    <span>Фото товара</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div style={styles.infoBlock} className="product-info-pro">
            <h1 style={styles.title}>{product.goodName}</h1>
            <p style={styles.categoryPath}>
              <span>
                Категория: <strong>{categoryName}</strong>
              </span>
              <span style={styles.categoryDot}>·</span>
              <span>
                Подкатегория: <strong>{product.subcategory}</strong>
              </span>
            </p>
            <p style={styles.text}>{product.description}</p>

            <ul style={styles.metaList}>
              <li>
                Бренд:{" "}
                <strong>{product.brand || "—"}</strong>
              </li>
              <li>
                Страна-производитель:{" "}
                <strong>{product.country || "—"}</strong>
              </li>
              <li>
                Единица измерения:{" "}
                <strong>{typeof product.unit === "string" ? product.unit.trim() : "—"}</strong>
              </li>
            </ul>

            <div style={styles.priceRow}>
              <div>
                <div style={styles.priceLabel}>Цена</div>
                <div style={styles.priceValue}>
                  {(Number.isFinite(numericPrice) ? numericPrice : 0).toLocaleString("ru-BY")} Br
                </div>
              </div>
            </div>

            <div style={styles.actions}>
              <button style={styles.secondaryButton} onClick={() => navigate("/catalog")}>
                Продолжить выбор
              </button>
              <button style={styles.primaryButton} className="product-primary-btn-pro" onClick={handleAdd}>
                Добавить в заказ
              </button>
            </div>
          </div>
        </section>
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
    background:
      "radial-gradient(1200px 420px at 10% -10%, rgba(14,165,233,0.18), transparent 60%), radial-gradient(1000px 380px at 100% 0%, rgba(29,78,216,0.22), transparent 62%), linear-gradient(180deg, #f4f8ff 0%, #e9f2ff 52%, #f8fbff 100%)",
  },
  main: {
    maxWidth: "1500px",
    margin: "0 auto",
    padding: "0 18px 40px",
    fontFamily: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
  },
    backButton: {
        border: "none",
    background: "none",
    color: "#1f4b99",
    fontWeight: 600,
        cursor: "pointer",
    marginBottom: "16px",
  },
  breadcrumbs: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: "6px",
    fontSize: "14px",
    marginBottom: "18px",
    padding: "14px 18px",
    background:
      "linear-gradient(135deg, rgba(255,255,255,0.96) 0%, rgba(241,247,255,0.92) 100%)",
    borderRadius: "18px",
    border: "1px solid rgba(191,211,238,0.9)",
    boxShadow:
      "0 14px 30px rgba(15,39,80,0.12), inset 0 1px 0 rgba(255,255,255,0.85)",
    backdropFilter: "blur(8px)",
  },
  breadcrumbHomeIcon: {
    fontSize: "16px",
    color: "#6b7280",
    marginRight: "4px",
    lineHeight: 1,
  },
  breadcrumbLink: {
    background: "rgba(255,255,255,0.58)",
    padding: "6px 10px",
    margin: 0,
    color: "#1d4ed8",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: 700,
    borderRadius: "999px",
    border: "1px solid rgba(191,219,254,0.85)",
    textDecoration: "none",
    transition: "color 0.15s ease, background 0.15s ease, border-color 0.15s ease",
    letterSpacing: "0.01em",
  },
  breadcrumbSeparator: {
    color: "#60a5fa",
    padding: "0 2px",
    fontSize: "18px",
    fontWeight: 800,
    userSelect: "none",
  },
  breadcrumbCurrent: {
    fontWeight: 800,
    color: "#0f2748",
    fontSize: "14px",
    letterSpacing: "0.01em",
    maxWidth: "420px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    padding: "6px 12px",
    borderRadius: "999px",
    background:
      "linear-gradient(135deg, rgba(219,234,254,0.95) 0%, rgba(224,242,254,0.95) 100%)",
    border: "1px solid rgba(125,211,252,0.75)",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.72)",
  },
  layout: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 7fr) minmax(0, 18fr)",
    gap: "24px",
    alignItems: "stretch",
  },
  imageBlock: {
    width: "100%",
    display: "flex",
    alignItems: "stretch",
    justifyContent: "center",
    paddingLeft: "0",
    height: "100%",
    minHeight: 0,
  },
  banner: {
            width: "100%",
    marginBottom: "12px",
  },
  bannerInner: {
    width: "100%",
    minHeight: "152px",
    borderRadius: "20px",
    background:
      "linear-gradient(130deg, #0a1f45 0%, #15408a 50%, #0b6e8f 100%)",
    display: "flex",
            alignItems: "center",
    justifyContent: "flex-start",
    color: "#f8fbff",
    fontSize: "14px",
    padding: "22px 28px",
    boxShadow: "0 20px 40px rgba(15,39,80,0.22)",
  },
  imageGallery: {
    display: "flex",
    flexDirection: "column",
    gap: "0",
    alignItems: "stretch",
    width: "100%",
    height: "100%",
    flex: 1,
    minHeight: 0,
  },
  mainImageWrapper: {
    width: "100%",
    borderRadius: "18px",
    backgroundColor: "#ffffff",
    boxShadow: "0 14px 30px rgba(15, 39, 80, 0.16)",
    border: "1px solid #dce8f8",
    overflow: "hidden",
    minHeight: "0",
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr)",
    gridTemplateRows: "minmax(0, 1fr)",
    alignSelf: "center",
    flex: "1 1 auto",
  },
  mainImage: {
    gridColumn: 1,
    gridRow: 1,
    maxWidth: "100%",
    maxHeight: "100%",
    width: "auto",
    height: "auto",
    margin: "auto",
    objectFit: "contain",
    backgroundColor: "#f3f4f6",
    display: "block",
  },
  imagePlaceholder: {
    boxSizing: "border-box",
    gridColumn: 1,
    gridRow: 1,
    width: "100%",
    height: "100%",
    minHeight: 0,
    borderRadius: "16px",
    background:
      "repeating-linear-gradient(45deg, #e1e7f0, #e1e7f0 10px, #f4f7fb 10px, #f4f7fb 20px)",
        display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#65728a",
    fontSize: "14px",
    position: "relative",
    overflow: "hidden",
  },
  infoBlock: {
    backgroundColor: "rgba(255,255,255,0.98)",
    borderRadius: "18px",
    padding: "24px 24px 28px",
    boxShadow: "0 14px 30px rgba(15, 39, 80, 0.12)",
    border: "1px solid #dce8f8",
    minHeight: "420px",
    height: "100%",
    background:
      "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(247,251,255,0.98) 100%)",
  },
  title: {
    fontSize: "30px",
    fontWeight: 700,
    marginBottom: "10px",
    marginTop: 0,
    color: "#132645",
  },
  categoryPath: {
    fontSize: "15px",
    color: "#4b5563",
    marginBottom: "14px",
    marginTop: 0,
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: "6px 10px",
  },
  categoryDot: {
    color: "#9ca3af",
    fontWeight: 600,
    userSelect: "none",
  },
  text: {
    fontSize: "16px",
    lineHeight: 1.6,
    color: "#4b5563",
        marginBottom: "18px",
  },
  metaList: {
    margin: "0 0 20px 0",
    paddingLeft: "18px",
    fontSize: "15px",
    lineHeight: 1.65,
    color: "#374151",
  },
  requestLabel: {
    display: "block",
    fontSize: "16px",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: "#6b7280",
    marginBottom: "4px",
  },
  requestHint: {
    fontSize: "12px",
    color: "#6b7280",
    marginTop: "4px",
  },
  priceRow: {
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "center",
    marginBottom: "20px",
  },
  priceLabel: {
    fontSize: "17px",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: "#9ca3af",
    marginBottom: "4px",
  },
  priceValue: {
    fontSize: "26px",
    fontWeight: 700,
    color: "#1d4ed8",
  },
  actions: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    justifyContent: "center",
    marginTop: "10px",
  },
  primaryButton: {
    background:
      "linear-gradient(135deg, #2563eb 0%, #1d4ed8 40%, #0f766e 100%)",
    border: "none",
    color: "#ffffff",
    padding: "11px 30px",
    borderRadius: "999px",
    fontSize: "15px",
    fontWeight: 800,
    cursor: "pointer",
    minWidth: "182px",
    boxShadow: "0 16px 32px rgba(37, 99, 235, 0.42)",
    transition: "transform 0.18s ease, filter 0.18s ease",
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
  checkLabel: {
    fontSize: "13px",
    color: "#374151",
    display: "flex",
    alignItems: "center",
  },
  requestBarTitle: {
    fontSize: "20px",
    fontWeight: 600,
    color: "#111827",
    marginBottom: "6px",
  },
  requestBarRow: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    flexWrap: "wrap",
  },
  requestBarGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    minWidth: "160px",
  },
  requestBarGroupWide: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    flex: 1,
    minWidth: "220px",
  },
  requestInput: {
        width: "100%",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
    padding: "8px 12px",
    fontSize: "16px",
        outline: "none",
        },
  requestBar: {
    marginTop: "12px",
    padding: "10px 16px 14px",
    borderTop: "1px solid rgba(209, 213, 219, 0.7)",
    backgroundColor: "#f9fafb",
    width: "100%",
    boxSizing: "border-box",
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

