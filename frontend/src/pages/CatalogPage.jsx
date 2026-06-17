import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAppData } from "../context/AppDataContext";
import { apiAbsoluteUrl } from "../utils/apiOrigin";
import { backendAssetUrl } from "../utils/backendAssetUrl";

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

const catalogSearchHighlightMark = {
  backgroundColor: "#fde047",
  color: "#713f12",
  padding: "1px 4px",
  borderRadius: "4px",
  fontWeight: 700,
};

function splitCatalogNameHighlight(text, query) {
  if (text == null) return [];
  const q = (query || "").trim();
  if (!q) return [{ t: String(text), h: false }];
  const full = String(text);
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

function CatalogNameHighlight({ text, query }) {
  const parts = splitCatalogNameHighlight(text, query);
  if (!(query || "").trim()) return <>{text}</>;
  return (
    <>
      {parts.map((p, i) =>
        p.h ? (
          <mark key={i} style={catalogSearchHighlightMark}>
            {p.t}
          </mark>
        ) : (
          <span key={i}>{p.t}</span>
        )
      )}
    </>
  );
}

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

const CATALOG_PAGE_SIZE = 10;

const catalogPageFxCss = `
.catalog-page-pro {
  position: relative;
}

.catalog-page-pro .catalog-banner-inner-pro {
  position: relative;
  overflow: hidden;
}

.catalog-page-pro .catalog-banner-inner-pro::before,
.catalog-page-pro .catalog-banner-inner-pro::after {
  content: "";
  position: absolute;
  border-radius: 999px;
  pointer-events: none;
}

.catalog-page-pro .catalog-banner-inner-pro::before {
  width: 320px;
  height: 320px;
  right: -120px;
  top: -140px;
  background: radial-gradient(circle, rgba(245, 158, 11, 0.45), transparent 70%);
  animation: catalogPulse 8s ease-in-out infinite;
}

.catalog-page-pro .catalog-banner-inner-pro::after {
  width: 280px;
  height: 280px;
  left: -100px;
  bottom: -120px;
  background: radial-gradient(circle, rgba(14, 165, 233, 0.32), transparent 72%);
  animation: catalogPulse 9s ease-in-out infinite reverse;
}

.catalog-page-pro .catalog-toolbar-pro,
.catalog-page-pro .catalog-sidebar-pro,
.catalog-page-pro .catalog-content-pro {
  animation: catalogFadeUp 0.55s ease both;
}

.catalog-page-pro .catalog-toolbar-pro {
  animation-delay: 0.08s;
}

.catalog-page-pro .catalog-sidebar-pro {
  animation-delay: 0.12s;
}

.catalog-page-pro .catalog-content-pro {
  animation-delay: 0.16s;
}

.catalog-page-pro .catalog-sidebar-pro form > div {
  animation: filterFadeIn 0.5s ease both;
}

.catalog-page-pro .catalog-sidebar-pro form > div:nth-child(1) { animation-delay: 0.08s; }
.catalog-page-pro .catalog-sidebar-pro form > div:nth-child(2) { animation-delay: 0.12s; }
.catalog-page-pro .catalog-sidebar-pro form > div:nth-child(3) { animation-delay: 0.16s; }
.catalog-page-pro .catalog-sidebar-pro form > div:nth-child(4) { animation-delay: 0.2s; }
.catalog-page-pro .catalog-sidebar-pro form > div:nth-child(5) { animation-delay: 0.24s; }
.catalog-page-pro .catalog-sidebar-pro form > div:nth-child(6) { animation-delay: 0.28s; }
.catalog-page-pro .catalog-sidebar-pro form > div:nth-child(7) { animation-delay: 0.32s; }
.catalog-page-pro .catalog-sidebar-pro form > div:nth-child(8) { animation-delay: 0.36s; }
.catalog-page-pro .catalog-sidebar-pro form > div:nth-child(9) { animation-delay: 0.4s; }

.catalog-page-pro .catalog-content-pro {
  position: relative;
  overflow: hidden;
}

.catalog-page-pro .catalog-card-pro:hover {
  transform: translateY(-6px) scale(1.004);
  box-shadow: 0 20px 36px rgba(15, 23, 42, 0.18);
}

.catalog-page-pro .catalog-card-pro {
  animation: cardSlideUp 0.52s ease both;
}

.catalog-page-pro .catalog-card-pro:nth-child(1) { animation-delay: 0.05s; }
.catalog-page-pro .catalog-card-pro:nth-child(2) { animation-delay: 0.09s; }
.catalog-page-pro .catalog-card-pro:nth-child(3) { animation-delay: 0.13s; }
.catalog-page-pro .catalog-card-pro:nth-child(4) { animation-delay: 0.17s; }
.catalog-page-pro .catalog-card-pro:nth-child(5) { animation-delay: 0.21s; }
.catalog-page-pro .catalog-card-pro:nth-child(6) { animation-delay: 0.25s; }

.catalog-page-pro .catalog-card-button-pro:hover {
  filter: brightness(1.06);
  transform: translateY(-2px);
}

.catalog-page-pro .catalog-card-button-pro {
  position: relative;
  overflow: hidden;
}

.catalog-page-pro .catalog-card-button-pro::before {
  content: "";
  position: absolute;
  top: 0;
  left: -120%;
  width: 80%;
  height: 100%;
  background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.35) 50%, transparent 100%);
  transition: left 0.4s ease;
}

.catalog-page-pro .catalog-card-button-pro:hover::before {
  left: 130%;
}

.catalog-page-pro .catalog-account-btn-pro:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 24px rgba(29, 78, 216, 0.4);
}

.catalog-page-pro .catalog-sort-select-pro:focus,
.catalog-page-pro .catalog-sidebar-pro input:focus,
.catalog-page-pro .catalog-sidebar-pro select:focus {
  outline: none;
  border-color: #1d4ed8 !important;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.18);
  background: #ffffff !important;
}

.catalog-page-pro .catalog-show-more-pro:hover {
  background: #1d4ed8;
  color: #ffffff;
}

.catalog-page-pro .catalog-scroll-btn-pro:hover {
  background: linear-gradient(135deg, #0d56cc, #0f7ca0);
  color: #ffffff;
}

@keyframes catalogFadeUp {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes catalogPulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.15);
    opacity: 0.78;
  }
}

@keyframes filterFadeIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes cardSlideUp {
  from {
    opacity: 0;
    transform: translateY(14px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

`;

export default function CatalogPage() {
  const query = useQuery();
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, activeCartCount, activeClientOrdersCount } = useAppData();

  const searchFromUrl = query.get("search") || "";

  const [searchTerm, setSearchTerm] = useState(searchFromUrl);
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [brand, setBrand] = useState("");
  const [country, setCountry] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortMode, setSortMode] = useState("default");
  const [catalogPageIndex, setCatalogPageIndex] = useState(0);

  const [supplyMeta, setSupplyMeta] = useState(null);
  const [metaError, setMetaError] = useState(null);
  const [supplyItems, setSupplyItems] = useState([]);
  const [itemsLoading, setItemsLoading] = useState(true);
  const [itemsError, setItemsError] = useState(null);

  const applyCategoryRoute = useCallback(
    (nextCategory, nextSubcategory) => {
      const p = new URLSearchParams(location.search || "");
      if (nextCategory) {
        p.set("category", nextCategory);
      } else {
        p.delete("category");
      }
      if (nextSubcategory) {
        p.set("subcategory", nextSubcategory);
      } else {
        p.delete("subcategory");
      }
      const qs = p.toString();
      navigate(`/catalog${qs ? `?${qs}` : ""}`, { replace: true });
    },
    [location.search, navigate]
  );

  useEffect(() => {
    const p = new URLSearchParams(location.search || "");
    setCategory(decodeURIComponent((p.get("category") || "").replace(/\+/g, " ")));
    setSubcategory(decodeURIComponent((p.get("subcategory") || "").replace(/\+/g, " ")));
  }, [location.search]);

  useEffect(() => {
    let cancelled = false;
    fetch(apiAbsoluteUrl("/api/supply-goods/meta"), { credentials: "include" })
      .then((r) => {
        if (!r.ok) throw new Error(`Не удалось загрузить фильтры каталога (${r.status}).`);
        return r.json();
      })
      .then((meta) => {
        if (!cancelled) {
          setSupplyMeta(meta);
          setMetaError(null);
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setMetaError(e.message || String(e));
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setItemsLoading(true);
    setItemsError(null);
    const qp = new URLSearchParams();
    if (category.trim()) qp.set("category", category.trim());
    if (subcategory.trim()) qp.set("subcategory", subcategory.trim());
    if (searchTerm.trim()) qp.set("search", searchTerm.trim());
    if (brand.trim()) qp.set("brand", brand.trim());
    if (country.trim()) qp.set("country", country.trim());
    if (minPrice.trim()) qp.set("minPrice", minPrice.trim());
    if (maxPrice.trim()) qp.set("maxPrice", maxPrice.trim());
    if (sortMode && sortMode !== "default") qp.set("sort", sortMode);

    const url = `${apiAbsoluteUrl("/api/supply-goods")}${qp.toString() ? `?${qp}` : ""}`;
    fetch(url, { credentials: "include" })
      .then((r) => {
        if (!r.ok) throw new Error(`Не удалось загрузить товары (${r.status}).`);
        return r.json();
      })
      .then((arr) => {
        if (!cancelled) {
          setSupplyItems(Array.isArray(arr) ? arr : []);
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setItemsError(e.message || String(e));
          setSupplyItems([]);
        }
      })
      .finally(() => {
        if (!cancelled) setItemsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [category, subcategory, searchTerm, brand, country, minPrice, maxPrice, sortMode]);

  const brandOptions = supplyMeta?.brands ?? [];
  const countryOptions = supplyMeta?.countries ?? [];
  const categoryOptions = supplyMeta?.categories ?? [];

  const subcategoryOptions = useMemo(() => {
    const map = supplyMeta?.subcategoriesByCategory;
    if (!map) return [];
    if (category.trim()) {
      return map[category] || [];
    }
    const uniq = new Set();
    Object.values(map).forEach((arr) => (arr || []).forEach((s) => uniq.add(s)));
    return Array.from(uniq).sort((a, b) => a.localeCompare(b, "ru", { sensitivity: "base" }));
  }, [supplyMeta, category]);

  const filteredProducts = supplyItems;

  useEffect(() => {
    setCatalogPageIndex(0);
  }, [searchTerm, sortMode, category, subcategory, brand, country, minPrice, maxPrice]);

  useEffect(() => {
    const total = filteredProducts.length;
    const maxIdx = total === 0 ? 0 : Math.ceil(total / CATALOG_PAGE_SIZE) - 1;
    setCatalogPageIndex((i) => Math.min(i, maxIdx));
  }, [filteredProducts.length]);

  const pagedCatalogProducts = useMemo(() => {
    const start = catalogPageIndex * CATALOG_PAGE_SIZE;
    return filteredProducts.slice(start, start + CATALOG_PAGE_SIZE);
  }, [filteredProducts, catalogPageIndex]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
  };

  const handleCardClick = (id) => {
    navigate(`/catalog/product/${encodeURIComponent(id)}`);
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (searchTerm.trim()) count += 1;
    if (category.trim()) count += 1;
    if (subcategory) count += 1;
    if (brand) count += 1;
    if (country) count += 1;
    if (minPrice !== "") count += 1;
    if (maxPrice !== "") count += 1;
    return count;
  }, [
    searchTerm,
    category,
    subcategory,
    brand,
    country,
    minPrice,
    maxPrice,
  ]);

  const handleResetFilters = () => {
    setSearchTerm("");
    setBrand("");
    setCountry("");
    setMinPrice("");
    setMaxPrice("");
    navigate("/catalog");
  };

  const handleScrollTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleScrollBottom = () => {
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  };

  return (
    <div style={styles.pageWrapper} className="catalog-page-pro">
      <LogoutFloatingButton />
      <style>{catalogPageFxCss}</style>
      <main style={styles.main}>
        <section style={styles.banner}>
          <div style={styles.bannerInner} className="catalog-banner-inner-pro">
            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.14em", opacity: 0.88 }}>
                Гродноэнерго · Каталог снабжения
              </div>
              <div style={{ fontSize: "24px", fontWeight: 800, marginTop: "8px", lineHeight: 1.25 }}>
                Материалы и оборудование для подразделений
              </div>
              <div style={{ marginTop: "10px", fontSize: "14px", opacity: 0.88 }}>
                Поиск по названию товара, фильтры и переход к карточке перед оформлением заявки.
              </div>
            </div>
          </div>
        </section>

        <section style={styles.topToolbar} className="catalog-toolbar-pro">
          <div style={styles.sortGroup}>
            <label style={styles.sortLabel}>Сортировка:</label>
            <select
              value={sortMode}
              onChange={(e) => setSortMode(e.target.value)}
              style={styles.sortSelect}
              className="catalog-sort-select-pro"
            >
              <option value="default">По умолчанию</option>
              <option value="priceAsc">Сначала дешевле</option>
              <option value="priceDesc">Сначала дороже</option>
              <option value="nameAsc">По алфавиту (А → Я)</option>
              <option value="nameDesc">По алфавиту (Я → А)</option>
            </select>
          </div>

          <div style={styles.topSearchGroup}>
            <label style={styles.topSearchLabel}>Поиск по названию</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Введите фрагмент названия..."
              style={styles.topSearchInput}
            />
          </div>

          <div style={styles.accountGroup}>
            <div style={styles.accountButtonWrapper}>
              <span style={styles.accountCountBadge}>
                {currentUser ? activeCartCount : 0}
              </span>
              <button
                type="button"
                style={styles.accountButton}
                className="catalog-account-btn-pro"
                onClick={() => navigate("/current-order/draft")}
              >
                <svg style={styles.accountIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z"/>
                  <path d="M9 21V12h6v9"/>
                </svg>
                <span>Текущий заказ</span>
              </button>
            </div>
            <div style={styles.accountButtonWrapper}>
              <span style={styles.accountCountBadge}>
                {currentUser ? activeClientOrdersCount : 0}
              </span>
              <button
                type="button"
                style={styles.accountButton}
                className="catalog-account-btn-pro"
                onClick={() => navigate(`/profile/${currentUser?.id || "SU-1001"}`)}
              >
                <svg style={styles.accountIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="9" cy="21" r="1"/>
                  <circle cx="20" cy="21" r="1"/>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                </svg>
                <span>Личный кабинет</span>
              </button>
            </div>
          </div>
        </section>

        <section style={styles.layout}>
          {/* Левая часть: фильтры */}
          <aside style={styles.sidebar} className="catalog-sidebar-pro">
            <h2 style={styles.sidebarTitle}>Фильтры</h2>

            <form onSubmit={handleSearchSubmit}>
              <div style={styles.filterBlock}>
                <label style={styles.label}>Бренд</label>
                <select
                  style={styles.select}
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                >
                  <option value="">Все</option>
                  {brandOptions.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              <div style={styles.filterBlock}>
                <label style={styles.label}>Страна производителя</label>
                <select
                  style={styles.select}
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                >
                  <option value="">Все</option>
                  {countryOptions.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div style={styles.filterBlock}>
                <label style={styles.label}>Цена, Br</label>
                <div style={styles.rangeRow}>
                  <input
                    type="number"
                    min={0}
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    placeholder="от"
                    style={{ ...styles.input, ...styles.inputRange }}
                  />
                  <span style={styles.rangeDash}>—</span>
                  <input
                    type="number"
                    min={0}
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    placeholder="до"
                    style={{ ...styles.input, ...styles.inputRange }}
                  />
                </div>
              </div>

              <div style={styles.filterBlock}>
                <label style={styles.label}>Категория</label>
                <select
                  style={styles.select}
                  value={category}
                  onChange={(e) => applyCategoryRoute(e.target.value || "", "")}
                >
                  <option value="">Все категории</option>
                  {categoryOptions.map((cName) => (
                    <option key={cName} value={cName}>
                      {cName}
                    </option>
                  ))}
                </select>
              </div>

              <div style={styles.filterBlock}>
                <label style={styles.label}>Подкатегория</label>
                <select
                  style={styles.select}
                  value={subcategory}
                  onChange={(e) => applyCategoryRoute(category, e.target.value || "")}
                >
                  <option value="">Все подкатегории</option>
                  {subcategoryOptions.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>

              <div style={styles.filtersSummary}>
                <div style={styles.filtersSummaryRow}>
                  <span>Выбрано фильтров:</span>
                  <strong>{activeFiltersCount}</strong>
                </div>
                <div style={styles.filtersSummaryRow}>
                  <span>Найдено товаров:</span>
                  <strong>{filteredProducts.length}</strong>
                </div>
                <button
                  type="button"
                  style={styles.resetButton}
                  onClick={handleResetFilters}
                >
                  Сбросить фильтры
                </button>
              </div>
            </form>
          </aside>

          {/* Правая часть: карточки товаров */}
          <section style={styles.content} className="catalog-content-pro">
            <div style={styles.contentHeader}>
              <div>
                <div style={styles.breadcrumbTitle}>
                  Результаты по каталогу организации
                </div>
                <div style={styles.resultInfo}>
                  Найдено товаров: {filteredProducts.length}
                  {(metaError || itemsError || itemsLoading) &&
                    ` · ${itemsLoading ? "загрузка…" : ""}${metaError ? ` ошибка фильтров: ${metaError}` : ""}${itemsError ? ` ошибка каталога: ${itemsError}` : ""}`}
                </div>
              </div>
            </div>

            <div style={styles.cardsGrid}>
              {pagedCatalogProducts.map((p) => (
                <article
                  key={p.id}
                  style={styles.card}
                  className="catalog-card-pro"
                  onClick={() => handleCardClick(p.id)}
                >
                  <div style={styles.cardImageWrapper}>
                    {p.imageUrl ? (
                      <img
                        src={backendAssetUrl(p.imageUrl)}
                        alt={p.goodName}
                        style={styles.cardImage}
                      />
                    ) : (
                      <div style={styles.cardImagePlaceholder}>
                        <span>Фото</span>
                      </div>
                    )}
                  </div>
                  <div style={styles.cardBody}>
                    <div style={styles.cardMeta}>
                      <span style={styles.cardCategory}>
                        {p.category || "Категория"}
                      </span>
                      <span style={styles.cardDivider}>•</span>
                      <span style={styles.cardSubcategory}>{p.subcategory}</span>
                    </div>
                    <h3 style={styles.cardTitle}>
                      <CatalogNameHighlight text={p.goodName} query={searchTerm} />
                    </h3>
                    <p style={styles.cardDescription}>{p.description}</p>
                    <div style={styles.cardFooter}>
                      <div style={styles.cardPriceBlock}>
                        <span style={styles.cardPrice}>
                          {(typeof p.price === "number"
                            ? p.price
                            : Number(p.price)
                          ).toLocaleString("ru-BY")}{" "}
                          Br
                        </span>
                      </div>
                      <button
                        type="button"
                        style={styles.cardButton}
                        className="catalog-card-button-pro"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCardClick(p.id);
                        }}
                      >
                        Перейти к описанию
                      </button>
                    </div>
                  </div>
                </article>
              ))}

              {!itemsLoading && filteredProducts.length === 0 && (
                <div style={styles.emptyState}>
                  По выбранным фильтрам товаров нет. Попробуйте ослабить условия
                  фильтрации.
                </div>
              )}
            </div>
            {filteredProducts.length > 0 && (
              <div style={styles.catalogPaginationBar}>
                <span style={styles.catalogPaginationInfo}>
                  Показано{" "}
                  {catalogPageIndex * CATALOG_PAGE_SIZE + 1}
                  –
                  {Math.min(
                    (catalogPageIndex + 1) * CATALOG_PAGE_SIZE,
                    filteredProducts.length
                  )}{" "}
                  из {filteredProducts.length}
                </span>
                <div style={styles.catalogPaginationNav}>
                  <button
                    type="button"
                    style={{
                      ...styles.catalogPaginationBtn,
                      opacity: catalogPageIndex === 0 ? 0.45 : 1,
                    }}
                    disabled={catalogPageIndex === 0}
                    onClick={() =>
                      setCatalogPageIndex((i) => Math.max(0, i - 1))
                    }
                  >
                    Назад
                  </button>
                  <button
                    type="button"
                    style={{
                      ...styles.catalogPaginationBtn,
                      opacity:
                        (catalogPageIndex + 1) * CATALOG_PAGE_SIZE >=
                        filteredProducts.length
                          ? 0.45
                          : 1,
                    }}
                    disabled={
                      (catalogPageIndex + 1) * CATALOG_PAGE_SIZE >=
                      filteredProducts.length
                    }
                    onClick={() => setCatalogPageIndex((i) => i + 1)}
                  >
                    Вперёд
                  </button>
                </div>
              </div>
            )}
          </section>
        </section>

        <div style={styles.scrollControls}>
          <button
            type="button"
            style={styles.scrollButton}
            className="catalog-scroll-btn-pro"
            onClick={handleScrollTop}
            aria-label="Прокрутить вверх"
          >
            ↑
          </button>
          <button
            type="button"
            style={styles.scrollButton}
            className="catalog-scroll-btn-pro"
            onClick={handleScrollBottom}
            aria-label="Прокрутить вниз"
          >
            ↓
          </button>
        </div>

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
      "radial-gradient(1300px 420px at 10% -12%, rgba(14,165,233,0.22), transparent 60%), radial-gradient(1100px 380px at 100% 0%, rgba(29,78,216,0.24), transparent 62%), linear-gradient(180deg, #f2f8ff 0%, #e8f2ff 52%, #f7fbff 100%)",
  },
  main: {
    maxWidth: "1500px",
    margin: "0 auto",
    padding: "0 18px 40px",
    fontFamily: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
  },
  pageTitle: {
    fontSize: "24px",
    fontWeight: 700,
    marginBottom: "10px",
    color: "#0f2748",
  },
  banner: {
    width: "100%",
    marginBottom: "12px",
  },
  bannerInner: {
    width: "100%",
    minHeight: "176px",
    borderRadius: "22px",
    background:
      "linear-gradient(130deg, #0a1f45 0%, #15408a 50%, #0b6e8f 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
    padding: "24px 30px",
    color: "#f8fbff",
    fontSize: "14px",
    boxShadow: "0 26px 44px rgba(15,23,42,0.3)",
  },
  topToolbar: {
    display: "grid",
    gridTemplateColumns: "minmax(220px, 1fr) minmax(320px, 560px) minmax(220px, 1fr)",
    alignItems: "center",
    marginBottom: "14px",
    gap: "16px",
    borderRadius: "18px",
    border: "1px solid #dbe7f8",
    background: "rgba(255,255,255,0.96)",
    padding: "14px 16px",
    boxShadow: "0 16px 34px rgba(15,23,42,0.13)",
    backdropFilter: "blur(6px)",
  },
  sortGroup: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    justifySelf: "start",
  },
  sortLabel: {
    fontSize: "12px",
    fontWeight: 600,
    color: "#475569",
    whiteSpace: "nowrap",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
  },
  sortSelect: {
    padding: "7px 32px 7px 12px",
    fontSize: "13px",
    fontWeight: 500,
    borderRadius: "10px",
    border: "1px solid #cfddf3",
    backgroundColor: "#f8fbff",
    color: "#111827",
    cursor: "pointer",
    outline: "none",
    appearance: "auto",
  },
  topSearchGroup: {
    width: "100%",
    justifySelf: "center",
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  topSearchLabel: {
    fontSize: "12px",
    fontWeight: 700,
    color: "#475569",
    whiteSpace: "nowrap",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
  },
  topSearchInput: {
    width: "100%",
    minWidth: 0,
    padding: "10px 14px",
    borderRadius: "12px",
    border: "1px solid #cfddf3",
    background: "#f8fbff",
    fontSize: "14px",
    color: "#111827",
    outline: "none",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.85)",
  },
  accountGroup: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    justifySelf: "end",
  },
  accountButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: "7px",
    borderRadius: "11px",
    border: "none",
    background: "linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 60%, #0e7490 100%)",
    padding: "9px 16px",
    fontSize: "13px",
    fontWeight: 600,
    cursor: "pointer",
    color: "#ffffff",
    boxShadow: "0 7px 18px rgba(29,78,216,0.34)",
    letterSpacing: "0.02em",
    transition: "opacity 0.18s, transform 0.18s, box-shadow 0.18s",
  },
  accountIcon: {
    width: "18px",
    height: "18px",
    flexShrink: 0,
  },
  accountCountBadge: {
    position: "absolute",
    top: "-18px",
    right: "-10px",
    minWidth: "32px",
    height: "32px",
    borderRadius: "999px",
    backgroundColor: "#ef4444",
    color: "#ffffff",
    fontSize: "12px",
    fontWeight: 700,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0 5px",
    border: "2px solid #ffffff",
    boxShadow: "0 3px 10px rgba(239,68,68,0.55)",
    zIndex: 1,
  },
  accountButtonWrapper: {
    position: "relative",
    display: "inline-flex",
    alignItems: "center",
  },
  layout: {
    display: "grid",
    gridTemplateColumns: "300px minmax(0, 1fr)",
    gap: "20px",
    alignItems: "flex-start",
  },
  sidebar: {
    backgroundColor: "rgba(255,255,255,0.98)",
    borderRadius: "20px",
    padding: "20px 20px 22px",
    boxShadow: "0 16px 34px rgba(15, 23, 42, 0.12)",
    border: "1px solid #d9e6f8",
    position: "sticky",
    top: "16px",
    alignSelf: "flex-start",
  },
  sidebarTitle: {
    fontSize: "17px",
    fontWeight: 700,
    marginBottom: "12px",
    color: "#111827",
  },
  filterBlock: {
    marginBottom: "14px",
  },
  label: {
    display: "block",
    fontSize: "12px",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: "#6b7280",
    marginBottom: "4px",
  },
  input: {
    width: "100%",
    padding: "8px 10px",
    borderRadius: "10px",
    border: "1px solid #d2dff2",
    background: "#f8fbff",
    fontSize: "14px",
    outline: "none",
  },
  select: {
    width: "100%",
    padding: "8px 10px",
    borderRadius: "10px",
    border: "1px solid #d2dff2",
    fontSize: "14px",
    outline: "none",
    backgroundColor: "#f8fbff",
  },
  rangeRow: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  inputRange: {
    flex: 1,
  },
  rangeDash: {
    fontSize: "12px",
    color: "#64748b",
  },
  filterHint: {
    marginTop: "6px",
    fontSize: "12px",
    color: "#6b7280",
  },
  content: {
    backgroundColor: "rgba(255,255,255,0.98)",
    borderRadius: "20px",
    padding: "18px 18px 20px",
    boxShadow: "0 14px 34px rgba(15, 23, 42, 0.1)",
    border: "1px solid #d9e6f8",
    minHeight: "400px",
  },
  contentHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: "12px",
  },
  breadcrumbTitle: {
    fontSize: "20px",
    fontWeight: 700,
    color: "#102747",
  },
  resultInfo: {
    fontSize: "14px",
    color: "#6b7280",
    marginTop: "2px",
  },
  cardsGrid: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    marginTop: "8px",
  },
  card: {
    borderRadius: "20px",
    border: "1px solid #e5e7eb",
    backgroundColor: "#ffffff",
    display: "flex",
    flexDirection: "row",
    cursor: "pointer",
    overflow: "hidden",
    transition: "transform 0.18s ease, box-shadow 0.18s ease",
    alignItems: "stretch",
    minHeight: "152px",
    boxShadow: "0 10px 22px rgba(15,23,42,0.12)",
    borderLeft: "4px solid #0e63da",
  },
  cardImageWrapper: {
    padding: "0",
    width: "220px",
    flexShrink: 0,
  },
  cardImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    borderRadius: "14px 0 0 14px",
    display: "block",
    backgroundColor: "#e5e7eb",
  },
  cardImagePlaceholder: {
    width: "100%",
    height: "100%",
    minHeight: "130px",
    borderRadius: "14px 0 0 14px",
    background:
      "repeating-linear-gradient(45deg, #e5e7eb, #e5e7eb 10px, #f3f4f6 10px, #f3f4f6 20px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#6b7280",
    fontSize: "12px",
  },
  cardBody: {
    padding: "14px 20px 14px 18px",
    display: "flex",
    flexDirection: "column",
    gap: "5px",
    flex: 1,
    minWidth: 0,
  },
  cardMeta: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: "4px",
    fontSize: "16px",
    color: "#6b7280",
  },
  cardCategory: {
    fontWeight: 600,
  },
  cardDivider: {
    opacity: 0.6,
  },
  cardSubcategory: {},
  cardTitle: {
    fontSize: "22px",
    fontWeight: 700,
    color: "#0f2748",
    lineHeight: "1.3",
    marginTop: "0",
    overflow: "hidden",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
  },
  cardDescription: {
    fontSize: "14px",
    color: "#5d708d",
    lineHeight: "1.45",
    maxHeight: "200px",
    overflowY: "auto",
  },
  cardTech: {
    fontSize: "14px",
    color: "#334155",
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: "4px",
    marginTop: "2px",
    fontWeight: 500,
  },
  cardExtra: {
    display: "flex",
    flexWrap: "wrap",
    gap: "5px",
    marginTop: "4px",
  },
  cardBadge: {
    fontSize: "13px",
    color: "#1d4ed8",
    backgroundColor: "#eff6ff",
    border: "1px solid #bfdbfe",
    borderRadius: "20px",
    padding: "2px 10px",
    whiteSpace: "nowrap",
    fontWeight: 500,
  },
  cardFooter: {
    marginTop: "auto",
    paddingTop: "10px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "8px",
    borderTop: "1px solid #f3f4f6",
  },
  cardPriceBlock: {
    display: "flex",
    alignItems: "baseline",
    gap: "5px",
  },
  cardPrice: {
    fontSize: "25px",
    fontWeight: 800,
    color: "#0b56cb",
    letterSpacing: "-0.5px",
  },
  cardUnit: {
    fontSize: "14px",
    color: "#9ca3af",
    fontWeight: 400,
  },
  cardButton: {
    borderRadius: "11px",
    border: "none",
    padding: "9px 20px",
    fontSize: "14px",
    fontWeight: 600,
    background:
      "linear-gradient(135deg, #2563eb 0%, #1d4ed8 50%, #0f766e 100%)",
    color: "#ffffff",
    cursor: "pointer",
    whiteSpace: "nowrap",
    letterSpacing: "0.02em",
    boxShadow: "0 10px 22px rgba(37,99,235,0.34)",
    transition: "transform 0.18s ease, filter 0.18s ease",
  },
  emptyState: {
    gridColumn: "1 / -1",
    padding: "24px",
    textAlign: "center",
    fontSize: "13px",
    color: "#6b7280",
  },
  catalogPaginationBar: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
    marginTop: "18px",
    marginBottom: "10px",
    padding: "12px 16px",
    borderRadius: "14px",
    border: "1px solid #dbe7f6",
    backgroundColor: "rgba(255,255,255,0.96)",
    boxShadow: "0 8px 20px rgba(15,39,80,0.08)",
  },
  catalogPaginationInfo: {
    fontSize: "14px",
    fontWeight: 600,
    color: "#475569",
  },
  catalogPaginationNav: {
    display: "flex",
    gap: "10px",
  },
  catalogPaginationBtn: {
    padding: "9px 22px",
    fontSize: "14px",
    fontWeight: 600,
    borderRadius: "10px",
    border: "1px solid #2563eb",
    background: "#fff",
    color: "#1d4ed8",
    cursor: "pointer",
  },
  showMoreWrapper: {
    display: "flex",
    justifyContent: "center",
    marginTop: "16px",
    marginBottom: "8px",
  },
  showMoreButton: {
    padding: "11px 36px",
    fontSize: "15px",
    fontWeight: 600,
    borderRadius: "12px",
    border: "2px solid #2563eb",
    background: "#ffffff",
    color: "#2563eb",
    cursor: "pointer",
    transition: "background 0.18s, color 0.18s",
    letterSpacing: "0.01em",
  },
  checkLabel: {
    fontSize: "13px",
    color: "#374151",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  checkbox: {
    margin: 0,
  },
  filtersSummary: {
    marginTop: "12px",
    paddingTop: "12px",
    borderTop: "1px solid #dce6f5",
    fontSize: "16px",
    color: "#102747",
  },
  filtersSummaryRow: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "8px",
  },
  resetButton: {
    marginTop: "8px",
    width: "100%",
    borderRadius: "999px",
    border: "1px solid #1d4ed8",
    background:
      "linear-gradient(135deg, #eef2ff 0%, #dbeafe 40%, #bfdbfe 100%)",
    padding: "9px 10px",
    fontSize: "13px",
    fontWeight: 600,
    cursor: "pointer",
    color: "#0b4fc2",
  },
  scrollControls: {
    position: "fixed",
    right: "20px",
    bottom: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "0px",
    zIndex: 1500,
  },
  scrollButton: {
    width: "40px",
    height: "40px",
    borderRadius: "10px",
    border: "1px solid #1d4ed8",
    background: "linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 60%, #0e7490 100%)",
    boxShadow: "0 8px 20px rgba(15, 23, 42, 0.28)",
    fontSize: "18px",
    fontWeight: 600,
    cursor: "pointer",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: 0,
    transition: "background 0.18s ease, transform 0.18s ease",
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

