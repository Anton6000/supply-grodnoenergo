import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppData } from "../context/AppDataContext";
import { getPasswordDiagnostics } from "../utils/passwordDiagnostics";
import { validatePasswordFormat } from "../utils/authValidators";
import { apiAbsoluteUrl } from "../utils/apiOrigin";
import "../pages/Auth/auth.css";

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

const ADMIN_PAGE_SIZE = 10;

/** Типичные русские имена папок профиля / OneDrive → английские (как в `C:\Users\…\Pictures\…`). */
const WIN_FOLDER_RU_TO_EN = {
  Изображения: "Pictures",
  "Снимки экрана": "Screenshots",
  Документы: "Documents",
  Загрузки: "Downloads",
  Видео: "Videos",
  Музыка: "Music",
  "Рабочий стол": "Desktop",
  Контакты: "Contacts",
  Избранное: "Favorites",
  "Сохранённые игры": "Saved Games",
  Общие: "Public",
};

/**
 * Возвращает путь с теми же компонентами, но стандартные папки по-английски; `http(s):` и `data:` не трогаем.
 * Пример: `…\OneDrive\Изображения\Снимки экрана\1.png` → `…\OneDrive\Pictures\Screenshots\1.png`
 */
function toEnglishWindowsPath(absPath) {
  if (absPath == null || absPath === "") return absPath;
  const raw = String(absPath).trim();
  if (!raw || /^https?:\/\//i.test(raw) || /^data:/i.test(raw)) return raw;
  const norm = raw.replace(/\//g, "\\");
  const parts = norm.split("\\");
  const mapped = parts.map((segment) => WIN_FOLDER_RU_TO_EN[segment] ?? segment);
  return mapped.join("\\");
}

const emptyProductDraft = () => ({
  name: "",
  description: "",
  categoryName: "",
  subcategoryName: "",
  price: "",
  unit: "шт.",
  imageUrl: "/demo/p1.jpg",
  brand: "",
  country: "",
});

/** Поля, которых нет в форме: для нового товара задаём разумные умолчания. */
const NEW_PRODUCT_DEFAULT_SPECS = {
  voltage: "",
  nominalCurrent: "",
  bodyMaterial: "",
  rating: 4.5,
  reviewCount: 0,
};

function getLocalDigits(value) {
  const onlyDigits = value.replace(/\D/g, "");
  const withoutCountry = onlyDigits.startsWith("375")
    ? onlyDigits.slice(3)
    : onlyDigits;
  return withoutCountry.slice(0, 9);
}

function buildPhoneMask(localDigits) {
  const d = localDigits.padEnd(9, "_");
  return `+375 (${d.slice(0, 2)}) ${d.slice(2, 5)}-${d.slice(5, 7)}-${d.slice(7, 9)}`;
}

/** Категория товара в таблице — строка из БД (`category`). */
function productCategoryDisplay(p) {
  const t = String(p?.categoryLabel ?? "").trim();
  return t || "—";
}

/** Числовой суффикс id пользователя SU-1001, AD-1001, ST-1001. */
function parseClientIdNum(id) {
  const m = String(id).match(/-(\d+)\s*$/);
  return m ? parseInt(m[1], 10) : 0;
}

/** Сортировка по id товара: SG-1001, числовые id каталога и т.п. */
function parseProductIdSortKey(id) {
  const m = String(id ?? "").match(/(\d+)\s*$/);
  return m ? parseInt(m[1], 10) : 0;
}

function normalizeApiDateTime(raw) {
  if (raw == null || raw === "") return new Date().toISOString();
  if (typeof raw === "string") return raw;
  if (Array.isArray(raw)) {
    const [y, M = 1, d = 1, h = 0, min = 0, s = 0, frac = 0] = raw;
    const ms = typeof frac === "number" ? Math.floor(frac / 1_000_000) : 0;
    const dt = new Date(y, M - 1, d, h, min, s, ms);
    return Number.isFinite(dt.getTime()) ? dt.toISOString() : new Date().toISOString();
  }
  return new Date().toISOString();
}

function mapSystemUserDto(u) {
  return {
    id: u?.id ?? "",
    fullName: u?.fullName ?? "",
    position: u?.position ?? "",
    employeeId: u?.employeeId ?? "",
    phone: u?.phone ?? "",
    email: u?.email ?? "",
    passwordHashDisplay: u?.passwordDisplay ?? "—",
    role: u?.role ?? "client",
    createdAt: normalizeApiDateTime(u?.createdAt),
  };
}

function mapSupplyGoodToAdminProduct(g) {
  const priceRaw = g?.price;
  const priceNum = priceRaw != null && priceRaw !== "" ? Number(priceRaw) : 0;
  const categoryLabel = String(g?.category ?? "").trim();
  return {
    ...NEW_PRODUCT_DEFAULT_SPECS,
    id: g?.id ?? "",
    name: g?.goodName ?? "",
    description: g?.description ?? "",
    categoryLabel,
    subcategoryName: g?.subcategory ?? "",
    price: Number.isFinite(priceNum) ? priceNum : 0,
    unit: (g?.unit ?? "шт.").trim() || "шт.",
    imageUrl: g?.imageUrl ?? "",
    brand: g?.brand ?? "",
    country: g?.country ?? "",
  };
}

/**
 * Табельный номер: буквенный префикс + число (Т-4521, А 1111) —
 * сортировка: сначала буквы по алфавиту, внутри группы — по числу.
 */
function parseTabNumber(s) {
  const str = String(s || "").trim();
  const m = str.match(/^([A-Za-zА-Яа-яЁё]+)\s*[-–]?\s*(\d+)/);
  if (m) {
    return { prefix: m[1].toUpperCase(), num: parseInt(m[2], 10) };
  }
  const digits = str.match(/^\d+$/);
  if (digits) return { prefix: "", num: parseInt(str, 10) };
  const letters = str.match(/^([A-Za-zА-Яа-яЁё]+)$/);
  if (letters) return { prefix: letters[1].toUpperCase(), num: 0 };
  return { prefix: str.toUpperCase(), num: 0 };
}

/** Длина пароля из демо-строки API (`…·12симв.`). */
function passwordDisplayLength(passwordDisplay) {
  if (passwordDisplay == null || passwordDisplay === "" || passwordDisplay === "—") return 0;
  const m = String(passwordDisplay).match(/(\d+)\s*симв\.\s*$/);
  return m ? parseInt(m[1], 10) : 0;
}

/** Отображение в таблице: маска точками (без строки-демохэша). Tooltip — число символов. */
function tablePasswordDots(passwordDisplay) {
  const raw =
    passwordDisplay == null ? "" : String(passwordDisplay).trim();
  if (!raw || raw === "—") return { dots: "—", title: "" };
  let len = passwordDisplayLength(passwordDisplay);
  if (!len && /PBKDF2/i.test(raw)) len = 8;
  if (!len) return { dots: "—", title: "" };
  const n = Math.min(Math.max(len, 1), 40);
  return { dots: "●".repeat(n), title: `Пароль скрыт · ${len} симв.` };
}

/** Подпись роли (БД: client · storekeeper · admin). */
function systemUserRoleLabel(role) {
  const r = String(role || "").trim().toLowerCase();
  if (r === "storekeeper") return "Кладовщик";
  if (r === "admin") return "Администратор";
  if (r === "client") return "Клиент";
  return role ? String(role) : "—";
}

/** Роль из API → значение формы редактирования (радиокнопки). */
function dbRoleToFormRole(role) {
  const r = String(role || "").trim().toLowerCase();
  if (r === "storekeeper") return "warehouse";
  return r === "admin" ? "admin" : "client";
}

function phoneDigitsForSort(phone) {
  return String(phone || "").replace(/\D/g, "");
}

function splitHighlight(text, query) {
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

function HighlightedMatch({ text, query, markStyle }) {
  const parts = splitHighlight(text, query);
  if (!(query || "").trim()) return <>{text}</>;
  return (
    <>
      {parts.map((p, i) =>
        p.h ? (
          <mark key={i} style={markStyle}>
            {p.t}
          </mark>
        ) : (
          <span key={i}>{p.t}</span>
        )
      )}
    </>
  );
}

function sortClientsRows(rows, sort) {
  if (!sort?.key) return rows;
  const mul = sort.dir === "asc" ? 1 : -1;
  return [...rows].sort((a, b) => {
    switch (sort.key) {
      case "id":
        return mul * (parseClientIdNum(a.id) - parseClientIdNum(b.id));
      case "fullName":
        return (
          mul *
          (a.fullName || "").localeCompare(b.fullName || "", "ru", { sensitivity: "base" })
        );
      case "position":
        return (
          mul *
          (a.position || "").localeCompare(b.position || "", "ru", { sensitivity: "base" })
        );
      case "employeeId": {
        const pa = parseTabNumber(a.employeeId);
        const pb = parseTabNumber(b.employeeId);
        const c = pa.prefix.localeCompare(pb.prefix, "ru");
        if (c !== 0) return mul * c;
        return mul * (pa.num - pb.num);
      }
      case "createdAt": {
        const ta = new Date(a.createdAt).getTime();
        const tb = new Date(b.createdAt).getTime();
        return mul * (ta - tb);
      }
      case "phone": {
        const da = phoneDigitsForSort(a.phone);
        const db = phoneDigitsForSort(b.phone);
        if (da.length !== db.length) return mul * (da.length - db.length);
        return mul * da.localeCompare(db, undefined, { numeric: true });
      }
      case "email":
        return mul * (a.email || "").localeCompare(b.email || "", "ru", { sensitivity: "base" });
      case "password": {
        const la = passwordDisplayLength(a.passwordHashDisplay);
        const lb = passwordDisplayLength(b.passwordHashDisplay);
        if (la !== lb) return mul * (la - lb);
        return mul *
          String(a.passwordHashDisplay || "").localeCompare(String(b.passwordHashDisplay || ""), "ru");
      }
      case "role":
        return (
          mul *
          systemUserRoleLabel(a.role).localeCompare(systemUserRoleLabel(b.role), "ru", {
            sensitivity: "base",
          })
        );
      default:
        return 0;
    }
  });
}

function sortProductRows(rows, sort) {
  if (!sort?.key) return rows;
  const mul = sort.dir === "asc" ? 1 : -1;
  return [...rows].sort((a, b) => {
    switch (sort.key) {
      case "id":
        return mul * (parseProductIdSortKey(a.id) - parseProductIdSortKey(b.id));
      case "name":
        return mul * (a.name || "").localeCompare(b.name || "", "ru", { sensitivity: "base" });
      case "category":
        return (
          mul *
          productCategoryDisplay(a).localeCompare(productCategoryDisplay(b), "ru", {
            sensitivity: "base",
          })
        );
      case "subcategory":
        return (
          mul *
          (a.subcategoryName || "").localeCompare(b.subcategoryName || "", "ru", {
            sensitivity: "base",
          })
        );
      case "price":
        return mul * ((Number(a.price) || 0) - (Number(b.price) || 0));
      case "unit": {
        const ua = a.unit || "";
        const ub = b.unit || "";
        if (
          /[A-Za-zА-Яа-яЁё]/.test(ua) &&
          /\d/.test(ua) &&
          /[A-Za-zА-Яа-яЁё]/.test(ub) &&
          /\d/.test(ub)
        ) {
          const pa = parseTabNumber(ua);
          const pb = parseTabNumber(ub);
          const c = pa.prefix.localeCompare(pb.prefix, "ru");
          if (c !== 0) return mul * c;
          return mul * (pa.num - pb.num);
        }
        return mul * ua.localeCompare(ub, "ru", { sensitivity: "base" });
      }
      case "brand":
        return mul * (a.brand || "").localeCompare(b.brand || "", "ru", { sensitivity: "base" });
      default:
        return 0;
    }
  });
}

export default function AdminDashboard() {
  const { currentUser, orders } = useAppData();

  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]);
  const [listsLoading, setListsLoading] = useState(true);
  const [listsError, setListsError] = useState(null);
  /** Имена категорий из БД (GET /api/supply-goods/meta) — подсказка в форме товара. */
  const [dbCategoryNames, setDbCategoryNames] = useState([]);

  const [selectedClientIds, setSelectedClientIds] = useState([]);
  const [selectedProductIds, setSelectedProductIds] = useState([]);

  const [showClientForm, setShowClientForm] = useState(false);
  const [showProductForm, setShowProductForm] = useState(false);
  const [productFormMode, setProductFormMode] = useState("add"); // add | edit

  const [cFullName, setCFullName] = useState("");
  const [cPosition, setCPosition] = useState("");
  const [cEmployeeId, setCEmployeeId] = useState("");
  const [cPhoneDigits, setCPhoneDigits] = useState("");
  const [cEmail, setCEmail] = useState("");
  const [cPassword, setCPassword] = useState("");
  const [cRole, setCRole] = useState("client");
  const [showCPw, setShowCPw] = useState(false);
  const [clientFormError, setClientFormError] = useState(null);

  const [productDraft, setProductDraft] = useState(emptyProductDraft);
  const [productFormError, setProductFormError] = useState(null);

  const [clientSearchQuery, setClientSearchQuery] = useState("");
  const [productSearchQuery, setProductSearchQuery] = useState("");
  const [clientSort, setClientSort] = useState({ key: null, dir: "asc" });
  const [productSort, setProductSort] = useState({ key: null, dir: "asc" });
  const [clientPageIndex, setClientPageIndex] = useState(0);
  const [productPageIndex, setProductPageIndex] = useState(0);

  const [modal, setModal] = useState(null);

  /** @type {{ id: number, message: string, type: 'success' | 'error' }[]} */
  const [toasts, setToasts] = useState([]);
  const toastIdRef = useRef(0);
  const pushToast = useCallback((message, type = "success") => {
    const id = ++toastIdRef.current;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  }, []);

  const reloadAdminLists = useCallback(async () => {
    setListsLoading(true);
    setListsError(null);
    try {
      const usersUrl = apiAbsoluteUrl("/api/system-users");
      const goodsUrl = apiAbsoluteUrl("/api/supply-goods");
      const metaUrl = apiAbsoluteUrl("/api/supply-goods/meta");
      const [uRes, gRes, mRes] = await Promise.all([
        fetch(usersUrl, { credentials: "include" }),
        fetch(goodsUrl, { credentials: "include" }),
        fetch(metaUrl, { credentials: "include" }),
      ]);
      if (!uRes.ok) throw new Error(`Пользователи системы: HTTP ${uRes.status}`);
      if (!gRes.ok) throw new Error(`Товары: HTTP ${gRes.status}`);
      const rawUsers = await uRes.json();
      const rawGoods = await gRes.json();
      setClients(Array.isArray(rawUsers) ? rawUsers.map(mapSystemUserDto) : []);
      setProducts(Array.isArray(rawGoods) ? rawGoods.map(mapSupplyGoodToAdminProduct) : []);
      if (mRes.ok) {
        const meta = await mRes.json();
        const cats = Array.isArray(meta?.categories) ? meta.categories.map((c) => String(c || "").trim()).filter(Boolean) : [];
        setDbCategoryNames(cats);
      } else {
        setDbCategoryNames([]);
      }
    } catch (e) {
      setListsError(e?.message || String(e));
      setClients([]);
      setProducts([]);
      setDbCategoryNames([]);
    } finally {
      setListsLoading(false);
    }
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setModal(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    reloadAdminLists();
  }, [reloadAdminLists]);

  const cPhoneMasked = buildPhoneMask(cPhoneDigits);
  const cPasswordState = getPasswordDiagnostics(cPassword, {
    shortThreshold: 6,
    recommendSymbols: true,
  });

  const isAdmin = currentUser?.role === "admin";

  const clientsCount = clients.length;
  const ordersCount = orders.length;
  const productsCount = products.length;

  const clientSearchPlaceholder = useMemo(() => {
    const samples = clients
      .slice(0, 5)
      .map((c) => (c.fullName || "").split(/\s+/).filter(Boolean)[0])
      .filter(Boolean);
    const uniq = [...new Set(samples)].slice(0, 3);
    const tail = uniq.length ? uniq.join(", ") : "Иванов, Козлова";
    return `Поиск по ФИО… Например: ${tail}`;
  }, [clients]);

  const productSearchPlaceholder = useMemo(() => {
    const samples = products.slice(0, 2).map((p) => {
      const name = p.name || "";
      return name.length > 40 ? `${name.slice(0, 40)}…` : name;
    });
    const txt = samples.filter(Boolean).join(" · ");
    return txt ? `Поиск по названию… Например: ${txt}` : "Поиск по названию…";
  }, [products]);

  const displayedClients = useMemo(() => {
    const q = clientSearchQuery.trim().toLowerCase();
    const filtered = q
      ? clients.filter((c) => (c.fullName || "").toLowerCase().includes(q))
      : clients;
    return sortClientsRows(filtered, clientSort);
  }, [clients, clientSearchQuery, clientSort]);

  const displayedProducts = useMemo(() => {
    const q = productSearchQuery.trim().toLowerCase();
    const filtered = q
      ? products.filter((p) => (p.name || "").toLowerCase().includes(q))
      : products;
    return sortProductRows(filtered, productSort);
  }, [products, productSearchQuery, productSort]);

  useEffect(() => {
    setClientPageIndex(0);
  }, [clientSearchQuery, clientSort.key, clientSort.dir]);

  useEffect(() => {
    setProductPageIndex(0);
  }, [productSearchQuery, productSort.key, productSort.dir]);

  useEffect(() => {
    const total = displayedClients.length;
    const maxIdx = total === 0 ? 0 : Math.ceil(total / ADMIN_PAGE_SIZE) - 1;
    setClientPageIndex((i) => Math.min(i, maxIdx));
  }, [displayedClients.length]);

  useEffect(() => {
    const total = displayedProducts.length;
    const maxIdx = total === 0 ? 0 : Math.ceil(total / ADMIN_PAGE_SIZE) - 1;
    setProductPageIndex((i) => Math.min(i, maxIdx));
  }, [displayedProducts.length]);

  const pagedClients = useMemo(() => {
    const start = clientPageIndex * ADMIN_PAGE_SIZE;
    return displayedClients.slice(start, start + ADMIN_PAGE_SIZE);
  }, [displayedClients, clientPageIndex]);

  const pagedProducts = useMemo(() => {
    const start = productPageIndex * ADMIN_PAGE_SIZE;
    return displayedProducts.slice(start, start + ADMIN_PAGE_SIZE);
  }, [displayedProducts, productPageIndex]);

  const sortArrow = (key, sort) => {
    if (sort.key !== key) return "↕";
    return sort.dir === "asc" ? "▲" : "▼";
  };

  const toggleClientSort = (key) => {
    setClientSort((prev) =>
      prev.key === key
        ? { key, dir: prev.dir === "asc" ? "desc" : "asc" }
        : { key, dir: "asc" }
    );
  };

  const toggleProductSort = (key) => {
    setProductSort((prev) =>
      prev.key === key
        ? { key, dir: prev.dir === "asc" ? "desc" : "asc" }
        : { key, dir: "asc" }
    );
  };

  const toggleClient = (id) => {
    setSelectedClientIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleProduct = (id) => {
    setSelectedProductIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const openEditClient = () => {
    if (selectedClientIds.length !== 1) return;
    const c = clients.find((x) => x.id === selectedClientIds[0]);
    if (!c) return;
    setShowProductForm(false);
    setProductFormMode("add");
    setShowClientForm(true);
    setClientFormError(null);
    setCFullName(c.fullName || "");
    setCPosition(c.position || "");
    setCEmployeeId(c.employeeId || "");
    setCPhoneDigits(getLocalDigits(c.phone || ""));
    setCEmail(c.email || "");
    setCPassword("");
    setCRole(dbRoleToFormRole(c.role));
  };

  const validateClientForm = () => {
    const wantsPw = Boolean(cPassword.trim());
    if (wantsPw) {
      const pwdErr = validatePasswordFormat(cPassword.trim());
      if (pwdErr) return pwdErr;
    }
    if (!cEmployeeId.trim()) return "Введите табельный номер";
    if (cPhoneDigits.length !== 9) return "Введите номер в формате +375 33 664-92-10";
    if (!cFullName.trim()) return "Введите ФИО";
    if (!cPosition.trim()) return "Введите должность";
    return null;
  };

  const requestSaveClientEdit = (e) => {
    e.preventDefault();
    setClientFormError(null);
    const err = validateClientForm();
    if (err) {
      setClientFormError(err);
      pushToast(err, "error");
      return;
    }
    setModal({ type: "confirmEditClient" });
  };

  const performEditClient = async () => {
    if (selectedClientIds.length !== 1) return;
    const err = validateClientForm();
    if (err) {
      setClientFormError(err);
      pushToast(err, "error");
      setModal(null);
      return;
    }
    const id = selectedClientIds[0];
    const pwTrim = cPassword.trim();
    try {
      const res = await fetch(apiAbsoluteUrl(`/api/system-users/${encodeURIComponent(id)}`), {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          fullName: cFullName.trim(),
          position: cPosition.trim(),
          employeeId: cEmployeeId.trim(),
          phone: buildPhoneMask(cPhoneDigits),
          email: cEmail.trim(),
          password: pwTrim || undefined,
          role: cRole,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await reloadAdminLists();
      setShowClientForm(false);
      setSelectedClientIds([]);
      setModal(null);
      pushToast("Данные пользователя сохранены", "success");
    } catch (e) {
      setModal(null);
      pushToast(`Не удалось сохранить пользователя: ${e?.message || e}`, "error");
    }
  };

  const requestDeleteClients = () => {
    if (selectedClientIds.length === 0) return;
    setModal({ type: "confirmDeleteClients", count: selectedClientIds.length });
  };

  const performDeleteClients = async () => {
    const n = selectedClientIds.length;
    try {
      const query = selectedClientIds.map((id) => `ids=${encodeURIComponent(id)}`).join("&");
      const res = await fetch(apiAbsoluteUrl(`/api/system-users?${query}`), {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await reloadAdminLists();
      setSelectedClientIds([]);
      setModal(null);
      pushToast(n === 1 ? "Пользователь удалён" : `Удалено пользователей: ${n}`, "success");
    } catch (e) {
      setModal(null);
      pushToast(`Не удалось удалить пользователей: ${e?.message || e}`, "error");
    }
  };

  const openAddProduct = () => {
    setShowClientForm(false);
    setProductFormMode("add");
    setProductDraft(emptyProductDraft());
    setProductFormError(null);
    setShowProductForm(true);
  };

  const openEditProduct = () => {
    if (selectedProductIds.length !== 1) return;
    const p = products.find((x) => x.id === selectedProductIds[0]);
    if (!p) return;
    setShowClientForm(false);
    setProductFormMode("edit");
    setProductDraft({
      name: p.name || "",
      description: p.description || "",
      categoryName: productCategoryDisplay(p),
      subcategoryName: p.subcategoryName || "",
      price: String(p.price ?? ""),
      unit: p.unit || "шт.",
      imageUrl: p.imageUrl || "",
      brand: p.brand || "",
      country: p.country || "",
    });
    setProductFormError(null);
    setShowProductForm(true);
  };

  const buildProductPayload = () => {
    const priceNum = Number(productDraft.price);
    if (!productDraft.name.trim()) return { error: "Укажите название товара" };
    if (Number.isNaN(priceNum) || priceNum < 0) return { error: "Укажите корректную цену" };
    const name = productDraft.name.trim();
    const description = productDraft.description.trim();
    const categoryNameTrim = productDraft.categoryName.trim();
    const shortDescription =
      description.slice(0, 280) || name;
    const brand = productDraft.brand.trim();
    const payload = {
      name,
      shortDescription,
      description,
      categoryLabel: categoryNameTrim,
      subcategoryName: productDraft.subcategoryName.trim(),
      price: priceNum,
      unit: productDraft.unit.trim() || "шт.",
      imageUrl: productDraft.imageUrl.trim() || "/demo/p1.jpg",
      brand,
      manufacturer: brand,
      country: productDraft.country.trim(),
    };
    return { payload };
  };

  const requestSaveProduct = (e) => {
    e.preventDefault();
    setProductFormError(null);
    const built = buildProductPayload();
    if (built.error) {
      setProductFormError(built.error);
      pushToast(built.error, "error");
      return;
    }
    setModal({
      type: productFormMode === "add" ? "confirmAddProduct" : "confirmEditProduct",
    });
  };

  const performSaveProduct = async () => {
    const built = buildProductPayload();
    if (built.error) {
      setProductFormError(built.error);
      pushToast(built.error, "error");
      setModal(null);
      return;
    }
    const { payload } = built;
    const body = {
      goodName: payload.name,
      imageUrl: payload.imageUrl,
      category: payload.categoryLabel,
      subcategory: payload.subcategoryName,
      description: payload.description,
      brand: payload.brand,
      country: payload.country,
      unit: payload.unit,
      price: payload.price,
    };
    try {
      const isAdd = productFormMode === "add";
      const id = selectedProductIds[0];
      const res = await fetch(apiAbsoluteUrl(isAdd ? "/api/supply-goods" : `/api/supply-goods/${encodeURIComponent(id)}`), {
        method: isAdd ? "POST" : "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await reloadAdminLists();
      if (!isAdd) setSelectedProductIds([]);
      pushToast(isAdd ? "Товар добавлен в каталог" : "Изменения товара сохранены", "success");
      setShowProductForm(false);
      setModal(null);
    } catch (e) {
      setModal(null);
      pushToast(`Не удалось сохранить товар: ${e?.message || e}`, "error");
    }
  };

  const requestDeleteProducts = () => {
    if (selectedProductIds.length === 0) return;
    setModal({ type: "confirmDeleteProducts", count: selectedProductIds.length });
  };

  const performDeleteProducts = async () => {
    const n = selectedProductIds.length;
    try {
      const query = selectedProductIds.map((id) => `ids=${encodeURIComponent(id)}`).join("&");
      const res = await fetch(apiAbsoluteUrl(`/api/supply-goods?${query}`), {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await reloadAdminLists();
      setSelectedProductIds([]);
      setModal(null);
      pushToast(n === 1 ? "Товар удалён" : `Удалено товаров: ${n}`, "success");
    } catch (e) {
      setModal(null);
      pushToast(`Не удалось удалить товары: ${e?.message || e}`, "error");
    }
  };

  const clientsFilterDirty =
    clientSearchQuery.trim() !== "" || clientSort.key != null;
  const productsFilterDirty =
    productSearchQuery.trim() !== "" || productSort.key != null;

  const resetClientsFilters = () => {
    setClientSearchQuery("");
    setClientSort({ key: null, dir: "asc" });
  };

  const resetProductsFilters = () => {
    setProductSearchQuery("");
    setProductSort({ key: null, dir: "asc" });
  };

  const clientsSectionTitle = clientSearchQuery.trim()
    ? `Пользователи системы (${displayedClients.length} из ${clients.length})`
    : "Пользователи системы";

  const productsSectionTitle = productSearchQuery.trim()
    ? `Товары каталога (${displayedProducts.length} из ${products.length})`
    : "Товары каталога";

  const handlePhoneKeyDown = (e, setDigits) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      setDigits((prev) => prev.slice(0, -1));
      return;
    }
    if (/^\d$/.test(e.key)) {
      e.preventDefault();
      setDigits((prev) => (prev.length < 9 ? `${prev}${e.key}` : prev));
      return;
    }
    if (["Tab", "ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) return;
    e.preventDefault();
  };

  const adminFxCss = `
    .admin-page-pro .admin-hero-pro { animation: adminFadeUp 0.55s ease both; }
    .admin-page-pro .admin-kpi-pro { animation: adminFadeUp 0.55s ease 0.06s both; }
    .admin-page-pro .admin-section-pro { animation: adminFadeUp 0.55s ease 0.1s both; }
    @keyframes adminFadeUp {
      from { opacity: 0; transform: translateY(12px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .admin-table-scroll {
      max-height: 420px;
      overflow: auto;
      border-radius: 16px;
      border: 1px solid #dce8f8;
      background-color: rgba(255,255,255,0.96);
      box-shadow: 0 12px 28px rgba(15,39,80,0.1);
    }
    .admin-table-scroll table {
      border-collapse: separate;
      border-spacing: 0;
      width: 100%;
      min-width: 960px;
    }
    .admin-table-scroll thead th {
      position: sticky;
      top: 0;
      z-index: 3;
      background-color: #f8fbff !important;
      box-shadow: 0 1px 0 #e2e8f0;
    }
    .admin-table-scroll thead th.admin-th-check {
      z-index: 4;
    }
    .admin-search-wrap {
      margin-bottom: 12px;
      height: 48px;
      display: flex;
      align-items: center;
      border: 1px solid #dae0e7;
      border-radius: 10px;
      background: #fafbfc;
      transition: border-color 0.2s, box-shadow 0.2s;
      box-sizing: border-box;
    }
    .admin-search-wrap:focus-within {
      border-color: #3182ce;
      box-shadow: 0 0 0 3px rgba(49, 130, 206, 0.12);
      background: #fff;
    }
    .admin-search-input {
      flex: 1;
      min-width: 0;
      height: 48px;
      padding: 14px 18px;
      border: none;
      outline: none;
      font-size: 15px;
      line-height: 1.2;
      color: #1a1a1a;
      background: transparent;
      box-sizing: border-box;
    }
    .admin-search-input::placeholder {
      color: #718096;
    }
    .admin-modal-overlay {
      position: fixed;
      inset: 0;
      z-index: 10000;
      background: rgba(15, 23, 42, 0.45);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      box-sizing: border-box;
    }
    .admin-toast-stack {
      position: fixed;
      z-index: 10001;
      bottom: 24px;
      right: 24px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      max-width: min(360px, calc(100vw - 32px));
      pointer-events: none;
    }
    .admin-toast-stack > * {
      pointer-events: auto;
    }
  `;

  return (
    <div style={styles.pageWrapper} className="admin-page-pro">
      <LogoutFloatingButton />
      <style>{adminFxCss}</style>
      <main style={styles.main}>
        <section style={styles.hero} className="admin-hero-pro">
          <span style={styles.heroBadge}>Панель управления</span>
          <h1 style={styles.heroTitle}>Администрирование каталога и доступа</h1>
          <p style={styles.heroLead}>
            Управляйте товарами, ролями пользователей и актуальностью данных.
          </p>
        </section>

        {!isAdmin && (
          <div style={styles.warning}>
            Для полного доступа войдите как администратор на странице авторизации. Списки
            пользователей системы и каталога товаров подгружаются с сервера.
          </div>
        )}

        {listsError && (
          <div style={styles.warning}>
            Не удалось загрузить данные: {listsError}. Проверьте запуск backend (порт 8080)
            или переменную окружения <code style={{ wordBreak: "break-all" }}>REACT_APP_API_ORIGIN</code>.
          </div>
        )}

        <section style={styles.kpiRow} className="admin-kpi-pro">
          <div style={styles.kpiCard}>
            <div style={styles.kpiLabel}>Учётных записей</div>
            <div style={styles.kpiValue}>{listsLoading ? "…" : clientsCount}</div>
          </div>
          <div style={styles.kpiCard}>
            <div style={styles.kpiLabel}>Заказов</div>
            <div style={styles.kpiValue}>{ordersCount}</div>
          </div>
          <div style={styles.kpiCard}>
            <div style={styles.kpiLabel}>Товаров в каталоге</div>
            <div style={styles.kpiValue}>{listsLoading ? "…" : productsCount}</div>
          </div>
        </section>

        {/* ——— Пользователи системы ——— */}
        <section style={styles.section} className="admin-section-pro">
          <h2 style={styles.sectionTitle}>{clientsSectionTitle}</h2>
          <div style={styles.searchRow}>
            <div
              className="admin-search-wrap"
              style={{ flex: 1, minWidth: 0, marginBottom: 0 }}
            >
              <input
                type="search"
                className="admin-search-input"
                value={clientSearchQuery}
                onChange={(e) => setClientSearchQuery(e.target.value)}
                placeholder={clientSearchPlaceholder}
                aria-label="Поиск пользователя по ФИО"
              />
            </div>
            {clientsFilterDirty && (
              <button
                type="button"
                style={styles.resetFiltersBtn}
                onClick={resetClientsFilters}
              >
                Сбросить фильтр и сортировку
              </button>
            )}
          </div>
          <div className="admin-table-scroll">
            <table>
              <thead>
                <tr>
                  <th className="admin-th-check" style={styles.thCheck} />
                  <th style={{ ...styles.th, ...styles.thSortable }} scope="col">
                    <button
                      type="button"
                      style={styles.thSortBtn}
                      onClick={() => toggleClientSort("id")}
                    >
                      ID <span style={styles.sortGlyph}>{sortArrow("id", clientSort)}</span>
                    </button>
                  </th>
                  <th style={{ ...styles.th, ...styles.thSortable }} scope="col">
                    <button
                      type="button"
                      style={styles.thSortBtn}
                      onClick={() => toggleClientSort("fullName")}
                    >
                      ФИО <span style={styles.sortGlyph}>{sortArrow("fullName", clientSort)}</span>
                    </button>
                  </th>
                  <th style={{ ...styles.th, ...styles.thSortable }} scope="col">
                    <button
                      type="button"
                      style={styles.thSortBtn}
                      onClick={() => toggleClientSort("position")}
                    >
                      Должность{" "}
                      <span style={styles.sortGlyph}>{sortArrow("position", clientSort)}</span>
                    </button>
                  </th>
                  <th style={{ ...styles.th, ...styles.thSortable }} scope="col">
                    <button
                      type="button"
                      style={styles.thSortBtn}
                      onClick={() => toggleClientSort("employeeId")}
                    >
                      Таб. №{" "}
                      <span style={styles.sortGlyph}>{sortArrow("employeeId", clientSort)}</span>
                    </button>
                  </th>
                  <th style={{ ...styles.th, ...styles.thSortable }} scope="col">
                    <button
                      type="button"
                      style={styles.thSortBtn}
                      onClick={() => toggleClientSort("phone")}
                    >
                      Телефон{" "}
                      <span style={styles.sortGlyph}>{sortArrow("phone", clientSort)}</span>
                    </button>
                  </th>
                  <th style={{ ...styles.th, ...styles.thSortable }} scope="col">
                    <button
                      type="button"
                      style={styles.thSortBtn}
                      onClick={() => toggleClientSort("email")}
                    >
                      Почта{" "}
                      <span style={styles.sortGlyph}>{sortArrow("email", clientSort)}</span>
                    </button>
                  </th>
                  <th style={{ ...styles.th, ...styles.thSortable }} scope="col">
                    <button
                      type="button"
                      style={styles.thSortBtn}
                      onClick={() => toggleClientSort("password")}
                    >
                      Пароль{" "}
                      <span style={styles.sortGlyph}>{sortArrow("password", clientSort)}</span>
                    </button>
                  </th>
                  <th style={{ ...styles.th, ...styles.thSortable }} scope="col">
                    <button
                      type="button"
                      style={styles.thSortBtn}
                      onClick={() => toggleClientSort("createdAt")}
                    >
                      Дата создания{" "}
                      <span style={styles.sortGlyph}>{sortArrow("createdAt", clientSort)}</span>
                    </button>
                  </th>
                  <th style={{ ...styles.th, ...styles.thSortable }} scope="col">
                    <button
                      type="button"
                      style={styles.thSortBtn}
                      onClick={() => toggleClientSort("role")}
                    >
                      Роль <span style={styles.sortGlyph}>{sortArrow("role", clientSort)}</span>
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {displayedClients.length === 0 ? (
                  <tr>
                    <td colSpan={10} style={styles.tdEmpty}>
                      {listsLoading
                        ? "Загрузка…"
                        : listsError
                          ? "Список не загружен (см. сообщение выше)."
                          : clientSearchQuery.trim()
                            ? `Нет пользователей по запросу «${clientSearchQuery.trim()}»`
                            : "В базе нет пользователей, соответствующих запросу."}
                    </td>
                  </tr>
                ) : (
                  pagedClients.map((c) => {
                    const sel = selectedClientIds.includes(c.id);
                    const pwdCell = tablePasswordDots(c.passwordHashDisplay);
                    return (
                      <tr key={c.id} style={sel ? styles.trSelected : {}}>
                        <td style={styles.tdCheck}>
                          <input
                            type="checkbox"
                            checked={sel}
                            onChange={() => toggleClient(c.id)}
                            style={styles.checkbox}
                          />
                        </td>
                        <td style={styles.td}>{c.id}</td>
                        <td style={styles.td}>
                          <HighlightedMatch
                            text={c.fullName}
                            query={clientSearchQuery}
                            markStyle={styles.searchHighlight}
                          />
                        </td>
                        <td style={styles.td}>{c.position}</td>
                        <td style={styles.td}>{c.employeeId}</td>
                        <td style={styles.td}>{c.phone}</td>
                        <td style={styles.td}>{c.email}</td>
                        <td style={styles.tdPasswordMask} title={pwdCell.title}>
                          {pwdCell.dots}
                        </td>
                        <td style={styles.td}>
                          {new Date(c.createdAt).toLocaleString("ru-RU")}
                        </td>
                        <td style={styles.td}>{systemUserRoleLabel(c.role)}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {displayedClients.length > 0 && (
            <div style={styles.paginationBar}>
              <span style={styles.paginationInfo}>
                Показано{" "}
                {clientPageIndex * ADMIN_PAGE_SIZE + 1}
                –
                {Math.min(
                  (clientPageIndex + 1) * ADMIN_PAGE_SIZE,
                  displayedClients.length
                )}{" "}
                из {displayedClients.length}
              </span>
              <div style={styles.paginationNav}>
                <button
                  type="button"
                  style={{
                    ...styles.paginationBtn,
                    opacity: clientPageIndex === 0 ? 0.45 : 1,
                  }}
                  disabled={clientPageIndex === 0}
                  onClick={() => setClientPageIndex((i) => Math.max(0, i - 1))}
                >
                  Назад
                </button>
                <button
                  type="button"
                  style={{
                    ...styles.paginationBtn,
                    opacity:
                      (clientPageIndex + 1) * ADMIN_PAGE_SIZE >=
                      displayedClients.length
                        ? 0.45
                        : 1,
                  }}
                  disabled={
                    (clientPageIndex + 1) * ADMIN_PAGE_SIZE >=
                    displayedClients.length
                  }
                  onClick={() => setClientPageIndex((i) => i + 1)}
                >
                  Вперёд
                </button>
              </div>
            </div>
          )}

          <div style={styles.actionBar}>
            <span style={styles.actionBarInfo}>
              Выбрано: {selectedClientIds.length}
            </span>
            <button
              type="button"
              style={{
                ...styles.btnSecondary,
                opacity: selectedClientIds.length !== 1 ? 0.45 : 1,
              }}
              disabled={selectedClientIds.length !== 1}
              onClick={openEditClient}
            >
              Изменить пользователя
            </button>
            <button
              type="button"
              style={{
                ...styles.btnDanger,
                opacity: selectedClientIds.length === 0 ? 0.45 : 1,
              }}
              disabled={selectedClientIds.length === 0}
              onClick={requestDeleteClients}
            >
              Удалить выбранных пользователей
            </button>
          </div>

          {showClientForm && (
            <form style={styles.formCard} onSubmit={requestSaveClientEdit}>
              <h3 style={styles.formTitle}>Изменение пользователя</h3>
              {clientFormError && (
                <div style={styles.formError}>{clientFormError}</div>
              )}
              <div style={styles.formGrid}>
                <div>
                  <label style={styles.formLabel}>Табельный номер</label>
                  <input
                    className="form-input"
                    value={cEmployeeId}
                    onChange={(e) => setCEmployeeId(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label style={styles.formLabel}>Телефон</label>
                  <input
                    className="form-input"
                    value={cPhoneMasked}
                    onChange={(e) => setCPhoneDigits(getLocalDigits(e.target.value))}
                    onKeyDown={(e) => handlePhoneKeyDown(e, setCPhoneDigits)}
                    onPaste={(e) => {
                      e.preventDefault();
                      setCPhoneDigits(getLocalDigits(e.clipboardData.getData("text")));
                    }}
                    inputMode="numeric"
                    required
                  />
                </div>
                <div style={styles.formFullRow}>
                  <label style={styles.formLabel}>ФИО</label>
                  <input
                    className="form-input"
                    value={cFullName}
                    onChange={(e) => setCFullName(e.target.value)}
                    required
                  />
                </div>
                <div style={styles.formFullRow}>
                  <label style={styles.formLabel}>Должность</label>
                  <input
                    className="form-input"
                    value={cPosition}
                    onChange={(e) => setCPosition(e.target.value)}
                    required
                  />
                </div>
                <div style={styles.formFullRow}>
                  <label style={styles.formLabel}>Email</label>
                  <input
                    type="email"
                    className="form-input"
                    value={cEmail}
                    onChange={(e) => setCEmail(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label style={styles.formLabel}>Пароль</label>
                  <div className="password-field">
                    <input
                      type={showCPw ? "text" : "password"}
                      className="form-input password-input"
                      value={cPassword}
                      onChange={(e) => setCPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => setShowCPw((v) => !v)}
                      aria-label={showCPw ? "Скрыть" : "Показать"}
                    >
                      {showCPw ? "🙈" : "👁️"}
                    </button>
                  </div>
                  <div className={`password-strength password-strength--${cPasswordState.tier}`} aria-live="polite">
                    <div className="password-strength-head">
                      <span className="password-strength-label">Уровень сложности:</span>
                      <strong style={{ color: cPasswordState.color }}>
                        {cPasswordState.label}
                      </strong>
                    </div>
                    <div className="password-strength-track">
                      <div
                        className="password-strength-fill"
                        style={{
                          width: `${cPasswordState.progress}%`,
                          backgroundColor: cPasswordState.color,
                        }}
                      />
                    </div>
                    {cPasswordState.recommendations.length > 0 && (
                      <ul className="password-strength-tips">
                        {cPasswordState.recommendations.map((tip) => (
                          <li key={tip}>{tip}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
                <div style={styles.formFullRow}>
                  <label style={styles.formLabel}>Роль в системе</label>
                  <div style={styles.roleRow}>
                    {[
                      { v: "client", t: "Клиент" },
                      { v: "warehouse", t: "Кладовщик" },
                      { v: "admin", t: "Администратор" },
                    ].map((r) => (
                      <label
                        key={r.v}
                        style={{
                          ...styles.roleChip,
                          ...(cRole === r.v ? styles.roleChipActive : {}),
                        }}
                      >
                        <input
                          type="radio"
                          name="admin-edit-role"
                          value={r.v}
                          checked={cRole === r.v}
                          onChange={() => setCRole(r.v)}
                          style={{ display: "none" }}
                        />
                        {r.t}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div style={styles.formActions}>
                <button type="submit" style={styles.btnPrimary}>
                  Сохранить изменения пользователя
                </button>
                <button
                  type="button"
                  style={styles.btnGhost}
                  onClick={() => setShowClientForm(false)}
                >
                  Отмена
                </button>
              </div>
            </form>
          )}
        </section>

        {/* ——— Товары ——— */}
        <section style={styles.section} className="admin-section-pro">
          <h2 style={styles.sectionTitle}>{productsSectionTitle}</h2>
          <div style={styles.searchRow}>
            <div
              className="admin-search-wrap"
              style={{ flex: 1, minWidth: 0, marginBottom: 0 }}
            >
              <input
                type="search"
                className="admin-search-input"
                value={productSearchQuery}
                onChange={(e) => setProductSearchQuery(e.target.value)}
                placeholder={productSearchPlaceholder}
                aria-label="Поиск товара по названию"
              />
            </div>
            {productsFilterDirty && (
              <button
                type="button"
                style={styles.resetFiltersBtn}
                onClick={resetProductsFilters}
              >
                Сбросить фильтр и сортировку
              </button>
            )}
          </div>
          <div className="admin-table-scroll">
            <table>
              <thead>
                <tr>
                  <th className="admin-th-check" style={styles.thCheck} />
                  <th style={{ ...styles.th, ...styles.thSortable }} scope="col">
                    <button
                      type="button"
                      style={styles.thSortBtn}
                      onClick={() => toggleProductSort("id")}
                    >
                      ID <span style={styles.sortGlyph}>{sortArrow("id", productSort)}</span>
                    </button>
                  </th>
                  <th style={{ ...styles.th, ...styles.thSortable }} scope="col">
                    <button
                      type="button"
                      style={styles.thSortBtn}
                      onClick={() => toggleProductSort("name")}
                    >
                      Название{" "}
                      <span style={styles.sortGlyph}>{sortArrow("name", productSort)}</span>
                    </button>
                  </th>
                  <th style={{ ...styles.th, ...styles.thSortable }} scope="col">
                    <button
                      type="button"
                      style={styles.thSortBtn}
                      onClick={() => toggleProductSort("category")}
                    >
                      Категория{" "}
                      <span style={styles.sortGlyph}>{sortArrow("category", productSort)}</span>
                    </button>
                  </th>
                  <th style={{ ...styles.th, ...styles.thSortable }} scope="col">
                    <button
                      type="button"
                      style={styles.thSortBtn}
                      onClick={() => toggleProductSort("subcategory")}
                    >
                      Подкатегория{" "}
                      <span style={styles.sortGlyph}>{sortArrow("subcategory", productSort)}</span>
                    </button>
                  </th>
                  <th style={{ ...styles.th, ...styles.thSortable }} scope="col">
                    <button
                      type="button"
                      style={styles.thSortBtn}
                      onClick={() => toggleProductSort("price")}
                    >
                      Цена <span style={styles.sortGlyph}>{sortArrow("price", productSort)}</span>
                    </button>
                  </th>
                  <th style={{ ...styles.th, ...styles.thSortable }} scope="col">
                    <button
                      type="button"
                      style={styles.thSortBtn}
                      onClick={() => toggleProductSort("unit")}
                    >
                      Ед. <span style={styles.sortGlyph}>{sortArrow("unit", productSort)}</span>
                    </button>
                  </th>
                  <th style={{ ...styles.th, ...styles.thSortable }} scope="col">
                    <button
                      type="button"
                      style={styles.thSortBtn}
                      onClick={() => toggleProductSort("brand")}
                    >
                      Бренд <span style={styles.sortGlyph}>{sortArrow("brand", productSort)}</span>
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {displayedProducts.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={styles.tdEmpty}>
                      {listsLoading
                        ? "Загрузка…"
                        : listsError
                          ? "Список не загружен (см. сообщение выше)."
                          : productSearchQuery.trim()
                            ? `Нет товаров по запросу «${productSearchQuery.trim()}»`
                            : "В каталоге (БД) нет товаров, соответствующих запросу."}
                    </td>
                  </tr>
                ) : (
                  pagedProducts.map((p) => {
                    const sel = selectedProductIds.includes(p.id);
                    return (
                      <tr key={p.id} style={sel ? styles.trSelected : {}}>
                        <td style={styles.tdCheck}>
                          <input
                            type="checkbox"
                            checked={sel}
                            onChange={() => toggleProduct(p.id)}
                            style={styles.checkbox}
                          />
                        </td>
                        <td style={styles.td}>{p.id}</td>
                        <td style={styles.td}>
                          <HighlightedMatch
                            text={p.name}
                            query={productSearchQuery}
                            markStyle={styles.searchHighlight}
                          />
                        </td>
                        <td style={styles.td}>{productCategoryDisplay(p)}</td>
                        <td style={styles.tdSmall}>{p.subcategoryName}</td>
                        <td style={styles.tdRight}>{p.price?.toLocaleString("ru-BY")} Br</td>
                        <td style={styles.td}>{p.unit}</td>
                        <td style={styles.td}>{p.brand}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {displayedProducts.length > 0 && (
            <div style={styles.paginationBar}>
              <span style={styles.paginationInfo}>
                Показано{" "}
                {productPageIndex * ADMIN_PAGE_SIZE + 1}
                –
                {Math.min(
                  (productPageIndex + 1) * ADMIN_PAGE_SIZE,
                  displayedProducts.length
                )}{" "}
                из {displayedProducts.length}
              </span>
              <div style={styles.paginationNav}>
                <button
                  type="button"
                  style={{
                    ...styles.paginationBtn,
                    opacity: productPageIndex === 0 ? 0.45 : 1,
                  }}
                  disabled={productPageIndex === 0}
                  onClick={() => setProductPageIndex((i) => Math.max(0, i - 1))}
                >
                  Назад
                </button>
                <button
                  type="button"
                  style={{
                    ...styles.paginationBtn,
                    opacity:
                      (productPageIndex + 1) * ADMIN_PAGE_SIZE >=
                      displayedProducts.length
                        ? 0.45
                        : 1,
                  }}
                  disabled={
                    (productPageIndex + 1) * ADMIN_PAGE_SIZE >=
                    displayedProducts.length
                  }
                  onClick={() => setProductPageIndex((i) => i + 1)}
                >
                  Вперёд
                </button>
              </div>
            </div>
          )}

          <div style={styles.actionBar}>
            <span style={styles.actionBarInfo}>
              Выбрано: {selectedProductIds.length}
            </span>
            <button
              type="button"
              style={{
                ...styles.btnSecondary,
                opacity: selectedProductIds.length !== 1 ? 0.45 : 1,
              }}
              disabled={selectedProductIds.length !== 1}
              onClick={openEditProduct}
            >
              Изменить товар
            </button>
            <button
              type="button"
              style={{
                ...styles.btnDanger,
                opacity: selectedProductIds.length === 0 ? 0.45 : 1,
              }}
              disabled={selectedProductIds.length === 0}
              onClick={requestDeleteProducts}
            >
              Удалить выбранные товары
            </button>
          </div>

          <div style={styles.wideBtnWrap}>
            <button type="button" style={styles.wideBtn} onClick={openAddProduct}>
              Добавить новый товар
            </button>
          </div>

          {showProductForm && (
            <form style={styles.formCard} onSubmit={requestSaveProduct}>
              <h3 style={styles.formTitle}>
                {productFormMode === "add" ? "Новый товар" : "Изменение товара"}
              </h3>
              {productFormError && (
                <div style={styles.formError}>{productFormError}</div>
              )}
              <div style={styles.formGrid}>
                <div style={styles.formFullRow}>
                  <label style={styles.formLabel}>Название</label>
                  <input
                    className="form-input"
                    value={productDraft.name}
                    onChange={(e) =>
                      setProductDraft((d) => ({ ...d, name: e.target.value }))
                    }
                    required
                  />
                </div>
                <div style={styles.formFullRow}>
                  <label style={styles.formLabel}>Описание</label>
                  <textarea
                    className="form-input"
                    rows={3}
                    value={productDraft.description}
                    onChange={(e) =>
                      setProductDraft((d) => ({ ...d, description: e.target.value }))
                    }
                    style={{ resize: "vertical", fontFamily: "inherit" }}
                  />
                </div>
                <div style={{ minWidth: 0 }}>
                  <label style={styles.formLabel}>Категория</label>
                  <input
                    type="text"
                    className="form-input"
                    style={{ width: "100%", boxSizing: "border-box" }}
                    value={productDraft.categoryName}
                    onChange={(e) =>
                      setProductDraft((d) => ({ ...d, categoryName: e.target.value }))
                    }
                    placeholder={dbCategoryNames[0] || "Как в каталоге (из БД)"}
                    autoComplete="off"
                    spellCheck={false}
                  />
                </div>
                <div style={{ minWidth: 0 }}>
                  <label style={styles.formLabel}>Подкатегория</label>
                  <input
                    type="text"
                    className="form-input"
                    style={{ width: "100%", boxSizing: "border-box" }}
                    value={productDraft.subcategoryName}
                    onChange={(e) =>
                      setProductDraft((d) => ({ ...d, subcategoryName: e.target.value }))
                    }
                    autoComplete="off"
                    spellCheck={false}
                  />
                </div>
                <div>
                  <label style={styles.formLabel}>Цена, Br</label>
                  <input
                    type="number"
                    inputMode="decimal"
                    min={0}
                    step="any"
                    className="form-input"
                    value={productDraft.price}
                    onChange={(e) =>
                      setProductDraft((d) => ({ ...d, price: e.target.value }))
                    }
                    required
                  />
                </div>
                <div>
                  <label style={styles.formLabel}>Единица</label>
                  <input
                    className="form-input"
                    value={productDraft.unit}
                    onChange={(e) =>
                      setProductDraft((d) => ({ ...d, unit: e.target.value }))
                    }
                  />
                </div>
                <div style={{ minWidth: 0 }}>
                  <label style={styles.formLabel}>Путь к фото</label>
                  <input
                    type="text"
                    className="form-input"
                    style={{ width: "100%", boxSizing: "border-box" }}
                    value={productDraft.imageUrl}
                    onChange={(e) =>
                      setProductDraft((d) => ({ ...d, imageUrl: e.target.value }))
                    }
                    onBlur={(e) => {
                      const v = e.target.value.trim();
                      if (!v || /^https?:\/\//i.test(v) || /^data:/i.test(v)) return;
                      const en = toEnglishWindowsPath(v);
                      if (en !== e.target.value.trim()) {
                        setProductDraft((d) => ({ ...d, imageUrl: en }));
                      }
                    }}
                    placeholder="C:\\Users\\30100\\OneDrive\\Pictures\\Screenshots\\1.png"
                    autoComplete="off"
                    spellCheck={false}
                  />
                </div>
                <div>
                  <label style={styles.formLabel}>Бренд</label>
                  <input
                    className="form-input"
                    value={productDraft.brand}
                    onChange={(e) =>
                      setProductDraft((d) => ({ ...d, brand: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label style={styles.formLabel}>Страна-производитель</label>
                  <input
                    className="form-input"
                    value={productDraft.country}
                    onChange={(e) =>
                      setProductDraft((d) => ({ ...d, country: e.target.value }))
                    }
                  />
                </div>
              </div>
              <div style={styles.formActions}>
                <button type="submit" style={styles.btnPrimary}>
                  {productFormMode === "add"
                    ? "Сохранить новый товар"
                    : "Сохранить изменения товара"}
                </button>
                <button
                  type="button"
                  style={styles.btnGhost}
                  onClick={() => setShowProductForm(false)}
                >
                  Отмена
                </button>
              </div>
            </form>
          )}
        </section>

        {modal && (
          <div
            className="admin-modal-overlay"
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-modal-title"
            onClick={(e) => {
              if (e.target === e.currentTarget) setModal(null);
            }}
          >
            <div style={styles.modalBox} onClick={(e) => e.stopPropagation()}>
              <h3 id="admin-modal-title" style={styles.modalTitle}>
                {modal.type === "confirmDeleteClients" ||
                modal.type === "confirmDeleteProducts"
                  ? "Подтверждение удаления"
                  : modal.type === "confirmAddProduct"
                      ? "Подтверждение добавления"
                      : "Подтверждение изменений"}
              </h3>
              <p style={styles.modalText}>
                {modal.type === "confirmDeleteClients" &&
                  (() => {
                    const n = modal.count;
                    const m10 = n % 10;
                    const m100 = n % 100;
                    let phrase;
                    if (m100 >= 11 && m100 <= 14) phrase = `Удалить ${n} записей`;
                    else if (m10 === 1) phrase = `Удалить ${n} запись`;
                    else if (m10 >= 2 && m10 <= 4) phrase = `Удалить ${n} записи`;
                    else phrase = `Удалить ${n} записей`;
                    return `${phrase} (учётные записи)?`;
                  })()}
                {modal.type === "confirmDeleteProducts" &&
                  (() => {
                    const n = modal.count;
                    const m10 = n % 10;
                    const m100 = n % 100;
                    let phrase;
                    if (m100 >= 11 && m100 <= 14) phrase = `Удалить ${n} записей`;
                    else if (m10 === 1) phrase = `Удалить ${n} запись`;
                    else if (m10 >= 2 && m10 <= 4) phrase = `Удалить ${n} записи`;
                    else phrase = `Удалить ${n} записей`;
                    return `${phrase} (товары)?`;
                  })()}
                {modal.type === "confirmEditClient" &&
                  `Сохранить изменения пользователя «${cFullName.trim() || "…"}»?`}
                {modal.type === "confirmAddProduct" &&
                  `Добавить товар «${productDraft.name.trim() || "…"}» в каталог?`}
                {modal.type === "confirmEditProduct" &&
                  `Сохранить изменения товара «${productDraft.name.trim() || "…"}»?`}
              </p>
              <p style={styles.modalHint}>Это действие в демо-режиме применяется сразу.</p>
              <div style={styles.modalActions}>
                <button
                  type="button"
                  style={styles.btnGhost}
                  onClick={() => setModal(null)}
                >
                  Отмена
                </button>
                {modal.type === "confirmDeleteClients" && (
                  <button
                    type="button"
                    style={styles.btnDanger}
                    onClick={performDeleteClients}
                  >
                    Удалить
                  </button>
                )}
                {modal.type === "confirmDeleteProducts" && (
                  <button
                    type="button"
                    style={styles.btnDanger}
                    onClick={performDeleteProducts}
                  >
                    Удалить
                  </button>
                )}
                {modal.type === "confirmEditClient" && (
                  <button
                    type="button"
                    style={styles.btnPrimary}
                    onClick={performEditClient}
                  >
                    Сохранить
                  </button>
                )}
                {(modal.type === "confirmAddProduct" ||
                  modal.type === "confirmEditProduct") && (
                  <button
                    type="button"
                    style={styles.btnPrimary}
                    onClick={performSaveProduct}
                  >
                    {modal.type === "confirmAddProduct" ? "Добавить" : "Сохранить"}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="admin-toast-stack" aria-live="polite">
          {toasts.map((t) => (
            <div
              key={t.id}
              style={{
                ...styles.toast,
                ...(t.type === "error" ? styles.toastError : styles.toastSuccess),
              }}
            >
              {t.message}
            </div>
          ))}
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
    display: "flex",
    flexDirection: "column",
    background:
      "radial-gradient(1000px 380px at 10% -10%, rgba(14,165,233,0.18), transparent 60%), radial-gradient(1000px 380px at 100% 0%, rgba(29,78,216,0.2), transparent 62%), linear-gradient(180deg, #f4f8ff 0%, #eaf2ff 55%, #f8fbff 100%)",
  },
  main: {
    flex: 1,
    maxWidth: "1500px",
    width: "100%",
    margin: "0 auto",
    padding: "20px 18px 40px",
    fontFamily: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
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
    fontSize: "32px",
    fontWeight: 800,
    margin: "10px 0 8px",
    letterSpacing: "-0.5px",
  },
  heroLead: {
    margin: 0,
    fontSize: "15px",
    color: "rgba(248, 251, 255, 0.9)",
    maxWidth: "720px",
    lineHeight: 1.5,
  },
  warning: {
    marginBottom: "14px",
    padding: "10px 14px",
    borderRadius: "12px",
    backgroundColor: "#fef3c7",
    color: "#92400e",
    fontSize: "13px",
    border: "1px solid #fcd34d",
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
    backgroundColor: "rgba(255,255,255,0.94)",
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
  kpiValue: {
    fontSize: "26px",
    fontWeight: 800,
    color: "#0f2748",
  },
  section: {
    marginBottom: "28px",
  },
  sectionTitle: {
    fontSize: "20px",
    fontWeight: 700,
    color: "#0f2748",
    marginBottom: "12px",
  },
  searchRow: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "stretch",
    gap: "10px",
    marginBottom: "12px",
  },
  resetFiltersBtn: {
    flexShrink: 0,
    padding: "0 16px",
    minHeight: "48px",
    fontSize: "13px",
    fontWeight: 600,
    borderRadius: "10px",
    border: "1px solid #94a3b8",
    background: "#fff",
    color: "#334155",
    cursor: "pointer",
    whiteSpace: "nowrap",
    alignSelf: "center",
  },
  paginationBar: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
    marginTop: "12px",
    marginBottom: "10px",
    padding: "10px 14px",
    borderRadius: "14px",
    border: "1px solid #dbe7f6",
    backgroundColor: "rgba(255,255,255,0.92)",
  },
  paginationInfo: {
    fontSize: "14px",
    fontWeight: 600,
    color: "#475569",
  },
  paginationNav: {
    display: "flex",
    gap: "10px",
  },
  paginationBtn: {
    padding: "8px 20px",
    fontSize: "14px",
    fontWeight: 600,
    borderRadius: "10px",
    border: "1px solid #2563eb",
    background: "#fff",
    color: "#1d4ed8",
    cursor: "pointer",
  },
  modalBox: {
    width: "100%",
    maxWidth: "420px",
    borderRadius: "18px",
    padding: "22px 24px",
    background: "#fff",
    border: "1px solid #e2e8f0",
    boxShadow: "0 24px 48px rgba(15,23,42,0.25)",
    boxSizing: "border-box",
  },
  modalTitle: {
    margin: "0 0 12px",
    fontSize: "18px",
    fontWeight: 800,
    color: "#0f2748",
  },
  modalText: {
    margin: "0 0 8px",
    fontSize: "15px",
    lineHeight: 1.5,
    color: "#334155",
  },
  modalHint: {
    margin: "0 0 20px",
    fontSize: "12px",
    color: "#64748b",
  },
  modalActions: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "flex-end",
    gap: "10px",
  },
  toast: {
    padding: "12px 16px",
    borderRadius: "12px",
    fontSize: "14px",
    fontWeight: 600,
    boxShadow: "0 10px 28px rgba(15,23,42,0.2)",
    border: "1px solid transparent",
  },
  toastSuccess: {
    background: "#ecfdf5",
    color: "#065f46",
    borderColor: "#a7f3d0",
  },
  toastError: {
    background: "#fef2f2",
    color: "#991b1b",
    borderColor: "#fecaca",
  },
  thSortable: {
    padding: 0,
    verticalAlign: "middle",
  },
  thSortBtn: {
    width: "100%",
    margin: 0,
    padding: "12px 14px",
    border: "none",
    background: "transparent",
    cursor: "pointer",
    font: "inherit",
    fontSize: "11px",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    color: "#64748b",
    textAlign: "left",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "8px",
    boxSizing: "border-box",
  },
  sortGlyph: {
    fontSize: "10px",
    opacity: 0.75,
    flexShrink: 0,
  },
  searchHighlight: {
    backgroundColor: "#fde047",
    color: "#713f12",
    padding: "1px 4px",
    borderRadius: "4px",
    fontWeight: 700,
  },
  tdEmpty: {
    padding: "28px 16px",
    textAlign: "center",
    color: "#64748b",
    fontSize: "14px",
    borderBottom: "1px solid #eef2f7",
  },
  thCheck: {
    width: "44px",
    padding: "12px 10px 12px 16px",
    borderBottom: "1px solid #e2e8f0",
    backgroundColor: "#f8fbff",
  },
  th: {
    textAlign: "left",
    padding: "12px 14px",
    fontSize: "11px",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    color: "#64748b",
    borderBottom: "1px solid #e2e8f0",
    backgroundColor: "#f8fbff",
    fontWeight: 600,
    whiteSpace: "nowrap",
  },
  tdCheck: {
    padding: "10px 10px 10px 16px",
    borderBottom: "1px solid #eef2f7",
    verticalAlign: "middle",
  },
  checkbox: {
    width: "18px",
    height: "18px",
    cursor: "pointer",
    accentColor: "#2563eb",
  },
  td: {
    padding: "10px 14px",
    fontSize: "14px",
    borderBottom: "1px solid #eef2f7",
    color: "#334155",
    verticalAlign: "middle",
  },
  tdSmall: {
    padding: "10px 14px",
    fontSize: "13px",
    borderBottom: "1px solid #eef2f7",
    color: "#334155",
    maxWidth: "220px",
  },
  tdMono: {
    padding: "10px 14px",
    fontSize: "12px",
    borderBottom: "1px solid #eef2f7",
    fontFamily: "ui-monospace, monospace",
    color: "#475569",
    maxWidth: "200px",
    wordBreak: "break-all",
  },
  tdPasswordMask: {
    padding: "10px 14px",
    fontSize: "15px",
    lineHeight: 1,
    borderBottom: "1px solid #eef2f7",
    color: "#94a3b8",
    fontFamily: "ui-monospace, monospace",
    letterSpacing: "0.14em",
    userSelect: "none",
    maxWidth: "200px",
  },
  tdRight: {
    padding: "10px 14px",
    fontSize: "14px",
    borderBottom: "1px solid #eef2f7",
    textAlign: "left",
    fontWeight: 600,
  },
  trSelected: {
    backgroundColor: "#e8f1ff",
  },
  actionBar: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: "12px",
    marginTop: "12px",
    marginBottom: "12px",
    padding: "10px 14px",
    borderRadius: "14px",
    border: "1px solid #dbe7f6",
    backgroundColor: "rgba(255,255,255,0.92)",
  },
  actionBarInfo: {
    fontSize: "14px",
    fontWeight: 700,
    color: "#334155",
    marginRight: "auto",
  },
  wideBtnWrap: {
    display: "flex",
    justifyContent: "center",
    marginBottom: "14px",
  },
  wideBtn: {
    width: "100%",
    maxWidth: "520px",
    padding: "14px 24px",
    fontSize: "15px",
    fontWeight: 700,
    borderRadius: "14px",
    border: "none",
    cursor: "pointer",
    color: "#fff",
    background: "linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 52%, #0e7490 100%)",
    boxShadow: "0 12px 28px rgba(29,78,216,0.35)",
  },
  btnDanger: {
    padding: "10px 18px",
    fontSize: "13px",
    fontWeight: 600,
    borderRadius: "999px",
    border: "none",
    background: "linear-gradient(135deg, #f87171 0%, #dc2626 85%)",
    color: "#fff",
    cursor: "pointer",
    boxShadow: "0 6px 14px rgba(239,68,68,0.25)",
  },
  btnSecondary: {
    padding: "10px 18px",
    fontSize: "13px",
    fontWeight: 600,
    borderRadius: "999px",
    border: "1px solid #2563eb",
    background: "#fff",
    color: "#1d4ed8",
    cursor: "pointer",
  },
  formCard: {
    marginTop: "8px",
    padding: "20px 22px 22px",
    borderRadius: "18px",
    border: "1px solid #dce8f8",
    backgroundColor: "rgba(255,255,255,0.98)",
    boxShadow: "0 14px 32px rgba(15,39,80,0.12)",
  },
  formTitle: {
    margin: "0 0 14px",
    fontSize: "18px",
    fontWeight: 700,
    color: "#0f2748",
  },
  formError: {
    marginBottom: "12px",
    padding: "10px 12px",
    borderRadius: "10px",
    background: "#fef2f2",
    border: "1px solid #fecaca",
    color: "#b91c1c",
    fontSize: "13px",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "12px 16px",
  },
  formFullRow: {
    gridColumn: "1 / -1",
  },
  formLabel: {
    display: "block",
    fontSize: "11px",
    fontWeight: 700,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    color: "#475569",
    marginBottom: "6px",
  },
  formActions: {
    display: "flex",
    flexWrap: "wrap",
    gap: "12px",
    marginTop: "18px",
  },
  btnPrimary: {
    padding: "12px 28px",
    fontSize: "14px",
    fontWeight: 700,
    borderRadius: "999px",
    border: "none",
    color: "#fff",
    cursor: "pointer",
    background: "linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 52%, #0e7490 100%)",
    boxShadow: "0 10px 22px rgba(29,78,216,0.35)",
  },
  btnGhost: {
    padding: "12px 22px",
    fontSize: "14px",
    fontWeight: 600,
    borderRadius: "999px",
    border: "1px solid #cbd5e1",
    background: "#fff",
    color: "#475569",
    cursor: "pointer",
  },
  roleRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
  },
  roleChip: {
    padding: "8px 14px",
    borderRadius: "10px",
    border: "1px solid #dbeafe",
    background: "#f8fafc",
    fontSize: "13px",
    fontWeight: 600,
    color: "#1e3a8a",
    cursor: "pointer",
  },
  roleChipActive: {
    borderColor: "#2563eb",
    background: "#dbeafe",
    boxShadow: "inset 0 0 0 1px #2563eb",
  },
};
