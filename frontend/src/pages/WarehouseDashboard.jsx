import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ORDER_STATUSES, useAppData } from "../context/AppDataContext";

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

const PAGE_SIZE = 10;
const DEFAULT_CURRENT_SORT = Object.freeze({ key: "number", dir: "asc" });

/** Последняя группа цифр в табельном номере (напр. T-4521 → 4521). */
function tabNumberDigits(tab) {
  const s = String(tab ?? "").trim();
  const m = s.match(/(\d+)\s*$/);
  return m ? parseInt(m[1], 10) : 0;
}

const STATUS_FLOW = ORDER_STATUSES.filter(
  (s) => !["доставлен", "получен"].includes(String(s).toLowerCase())
);

function statusMeta(status) {
  const s = String(status || "").toLowerCase();
  if (["готов", "готов к получению"].includes(s)) {
    return { label: "Готов к получению", color: "#15803d", progress: 100 };
  }
  if (s === "собирается") return { label: "Собирается", color: "#0e7490", progress: 80 };
  if (s === "в обработке") return { label: "В обработке", color: "#1d4ed8", progress: 60 };
  if (s === "принят") return { label: "Принят", color: "#7c3aed", progress: 35 };
  if (["доставлен", "получен"].includes(s)) {
    return { label: s === "получен" ? "Получен" : "Доставлен", color: "#475569", progress: 100 };
  }
  return { label: "В ожидании", color: "#b45309", progress: 10 };
}

function splitHighlight(text, query) {
  const full = String(text || "");
  const q = String(query || "").trim();
  if (!q) return [{ t: full, h: false }];
  const low = full.toLowerCase();
  const qLow = q.toLowerCase();
  const out = [];
  let start = 0;
  let idx = low.indexOf(qLow, start);
  while (idx !== -1) {
    if (idx > start) out.push({ t: full.slice(start, idx), h: false });
    out.push({ t: full.slice(idx, idx + q.length), h: true });
    start = idx + q.length;
    idx = low.indexOf(qLow, start);
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

function nextStatus(currentStatus) {
  const idx = STATUS_FLOW.indexOf(currentStatus);
  if (idx === -1 || idx >= STATUS_FLOW.length - 1) return null;
  return STATUS_FLOW[idx + 1];
}

export default function WarehouseDashboard() {
  const { currentUser, orders, updateOrderStatus, refreshOrders } = useAppData();
  const isWarehouse = currentUser?.role === "warehouse";
  const pollWorkspaceOrders =
    Boolean(currentUser?.id) &&
    (currentUser?.role === "warehouse" || currentUser?.role === "admin");
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [nextStatusChoice, setNextStatusChoice] = useState("");
  const [liveTick, setLiveTick] = useState(Date.now());
  const [toast, setToast] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);

  const [currentSearch, setCurrentSearch] = useState("");
  const [currentSort, setCurrentSort] = useState({ key: DEFAULT_CURRENT_SORT.key, dir: DEFAULT_CURRENT_SORT.dir });
  const [currentPage, setCurrentPage] = useState(0);

  const clientMetaById = useMemo(() => {
    const map = {};
    orders.forEach((o) => {
      if (!map[o.customerId]) {
        const pos = (o.customerPosition && String(o.customerPosition).trim()) || "";
        const tab = (o.customerTabNumber && String(o.customerTabNumber).trim()) || "";
        map[o.customerId] = {
          fullName: o.customerName || "—",
          position: pos || "—",
          employeeId: tab || "—",
        };
      }
    });
    return map;
  }, [orders]);

  useEffect(() => {
    if (!pollWorkspaceOrders) return undefined;
    const run = () => {
      refreshOrders()
        .then(() => setLiveTick(Date.now()))
        .catch((e) => console.error("Обновление заказов (склад):", e));
    };
    run();
    const timer = setInterval(run, 5000);
    return () => clearInterval(timer);
  }, [pollWorkspaceOrders, refreshOrders]);

  const currentOrders = useMemo(() => {
    const active = orders.filter((o) => {
      const s = String(o.status || "").toLowerCase();
      return !["готов", "готов к получению", "доставлен", "получен"].includes(s);
    });
    const query = currentSearch.trim().toLowerCase();
    let filtered = active;
    if (query) {
      filtered = active.filter((o) => {
        const cm = clientMetaById[o.customerId] || {};
        const fio = (cm.fullName || o.customerName || "").toLowerCase();
        const pos = String(cm.position || "").toLowerCase();
        const eid = String(cm.employeeId || "").toLowerCase();
        return fio.includes(query) || pos.includes(query) || eid.includes(query);
      });
    }
    const mul = currentSort.dir === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => {
      if (currentSort.key === "position") {
        const pa = String(clientMetaById[a.customerId]?.position || "").trim();
        const pb = String(clientMetaById[b.customerId]?.position || "").trim();
        return mul * pa.localeCompare(pb, "ru", { sensitivity: "base" });
      }
      if (currentSort.key === "tabNumber") {
        const ta = tabNumberDigits(clientMetaById[a.customerId]?.employeeId);
        const tb = tabNumberDigits(clientMetaById[b.customerId]?.employeeId);
        return mul * (ta - tb);
      }
      if (currentSort.key === "fio") {
        const fa = clientMetaById[a.customerId]?.fullName || a.customerName || "";
        const fb = clientMetaById[b.customerId]?.fullName || b.customerName || "";
        return mul * fa.localeCompare(fb, "ru", { sensitivity: "base" });
      }
      if (currentSort.key === "status") {
        return (
          mul *
          String(a.status).localeCompare(String(b.status), "ru", {
            sensitivity: "base",
          })
        );
      }
      if (currentSort.key === "itemsCount") {
        return mul * ((a.itemsCount || 0) - (b.itemsCount || 0));
      }
      if (currentSort.key === "qty") {
        return mul * ((a.totalQty || 0) - (b.totalQty || 0));
      }
      if (currentSort.key === "createdAt") {
        return mul * (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      }
      return (
        mul *
        String(a.number).localeCompare(String(b.number), "ru", {
          numeric: true,
          sensitivity: "base",
        })
      );
    });
  }, [orders, currentSearch, currentSort, clientMetaById]);

  const selectedOrder = useMemo(
    () => currentOrders.find((o) => o.id === selectedOrderId) || null,
    [currentOrders, selectedOrderId]
  );

  const currentPaged = useMemo(() => {
    const start = currentPage * PAGE_SIZE;
    return currentOrders.slice(start, start + PAGE_SIZE);
  }, [currentOrders, currentPage]);

  useEffect(() => {
    if (!selectedOrder) {
      setSelectedOrderId(null);
      setNextStatusChoice("");
      return;
    }
    const next = nextStatus(selectedOrder.status);
    setNextStatusChoice(next || "");
  }, [selectedOrder]);

  useEffect(() => {
    const max = currentOrders.length === 0 ? 0 : Math.ceil(currentOrders.length / PAGE_SIZE) - 1;
    setCurrentPage((p) => Math.min(p, max));
  }, [currentOrders.length]);

  const resetCurrentOrdersFilters = () => {
    setCurrentSearch("");
    setCurrentSort({ key: DEFAULT_CURRENT_SORT.key, dir: DEFAULT_CURRENT_SORT.dir });
    setCurrentPage(0);
  };

  const currentFiltersDirty =
    Boolean(currentSearch.trim()) ||
    currentSort.key !== DEFAULT_CURRENT_SORT.key ||
    currentSort.dir !== DEFAULT_CURRENT_SORT.dir ||
    currentPage !== 0;

  const setSort = (setter, key) => {
    setter((prev) =>
      prev.key === key
        ? { key, dir: prev.dir === "asc" ? "desc" : "asc" }
        : { key, dir: "asc" }
    );
  };
  const arrow = (sort, key) => (sort.key !== key ? "↕" : sort.dir === "asc" ? "▲" : "▼");

  const applyStatus = () => {
    if (!selectedOrder || !nextStatusChoice) return;
    const expected = nextStatus(selectedOrder.status);
    if (!expected || expected !== nextStatusChoice) {
      setToast("Можно установить только следующий статус по этапам.");
      setTimeout(() => setToast(null), 2500);
      return;
    }
    setConfirmModal({
      orderId: selectedOrder.id,
      orderNumber: selectedOrder.number,
      from: selectedOrder.status,
      to: nextStatusChoice,
    });
  };

  const confirmApplyStatus = async () => {
    if (!confirmModal) return;
    await updateOrderStatus(confirmModal.orderId, confirmModal.to);
    setToast(`Заказ №${confirmModal.orderNumber}: статус обновлён -> ${confirmModal.to}`);
    setTimeout(() => setToast(null), 2500);
    setSelectedOrderId(null);
    setNextStatusChoice("");
    setConfirmModal(null);
  };

  return (
    <div style={styles.pageWrapper}>
      <LogoutFloatingButton />
      <main style={styles.main}>
        <section style={styles.hero}>
          <span style={styles.heroBadge}>Кабинет кладовщика</span>
          <h1 style={styles.heroTitle}>Контроль сборки и отгрузки</h1>
          <p style={styles.heroLead}>
            Управляйте заказами в работе, проверяйте комплектацию и фиксируйте каждый этап обработки.
          </p>
          <div style={styles.liveInfo}>
            Последнее обновление: {new Date(liveTick).toLocaleTimeString("ru-RU")}
          </div>
        </section>

        {!isWarehouse && (
          <div style={styles.warning}>
            Для рабочей роли используйте вход как «кладовщик». В демо-режиме функционал открыт.
          </div>
        )}

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>
            Текущие заказы {currentSearch.trim() ? `(${currentOrders.length})` : ""}
          </h2>
          <div style={styles.filtersRow}>
            <input
              type="search"
              style={{ ...styles.searchInput, flex: 1, minWidth: "220px" }}
              value={currentSearch}
              onChange={(e) => {
                setCurrentSearch(e.target.value);
                setCurrentPage(0);
              }}
              placeholder="Поиск по ФИО, должности, табельному номеру"
            />
            {currentFiltersDirty ? (
              <button type="button" style={styles.resetBtn} onClick={resetCurrentOrdersFilters}>
                Сбросить
              </button>
            ) : null}
          </div>

          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Выбрать</th>
                  <th style={styles.th}>
                    <button type="button" style={styles.sortBtn} onClick={() => setSort(setCurrentSort, "number")}>
                      ID {arrow(currentSort, "number")}
                    </button>
                  </th>
                  <th style={styles.th}>
                    <button type="button" style={styles.sortBtn} onClick={() => setSort(setCurrentSort, "fio")}>
                      ФИО {arrow(currentSort, "fio")}
                    </button>
                  </th>
                  <th style={styles.th}>
                    <button type="button" style={styles.sortBtn} onClick={() => setSort(setCurrentSort, "position")}>
                      Должность {arrow(currentSort, "position")}
                    </button>
                  </th>
                  <th style={styles.th}>
                    <button type="button" style={styles.sortBtn} onClick={() => setSort(setCurrentSort, "tabNumber")}>
                      Таб. номер {arrow(currentSort, "tabNumber")}
                    </button>
                  </th>
                  <th style={styles.th}>
                    <button type="button" style={styles.sortBtn} onClick={() => setSort(setCurrentSort, "itemsCount")}>
                      Позиций {arrow(currentSort, "itemsCount")}
                    </button>
                  </th>
                  <th style={styles.th}>
                    <button type="button" style={styles.sortBtn} onClick={() => setSort(setCurrentSort, "qty")}>
                      Единиц {arrow(currentSort, "qty")}
                    </button>
                  </th>
                  <th style={styles.th}>
                    <button type="button" style={styles.sortBtn} onClick={() => setSort(setCurrentSort, "status")}>
                      Статус {arrow(currentSort, "status")}
                    </button>
                  </th>
                  <th style={styles.th}>Прогресс</th>
                </tr>
              </thead>
              <tbody>
                {currentPaged.length === 0 ? (
                  <tr>
                    <td colSpan={9} style={styles.emptyTd}>Нет заказов по текущему фильтру.</td>
                  </tr>
                ) : (
                  currentPaged.map((o) => {
                    const client = clientMetaById[o.customerId] || {};
                    const selected = selectedOrderId === o.id;
                    const meta = statusMeta(o.status);
                    return (
                      <tr key={o.id} style={selected ? styles.rowSelected : undefined}>
                        <td style={styles.td}>
                          <input
                            type="checkbox"
                            checked={selected}
                            onChange={() => setSelectedOrderId(selected ? null : o.id)}
                            style={styles.checkbox}
                          />
                        </td>
                        <td style={styles.td}>{o.number}</td>
                        <td style={styles.td}><HighlightedMatch text={client.fullName || o.customerName || "—"} query={currentSearch} /></td>
                        <td style={styles.td}><HighlightedMatch text={client.position || "—"} query={currentSearch} /></td>
                        <td style={styles.td}><HighlightedMatch text={client.employeeId || "—"} query={currentSearch} /></td>
                        <td style={styles.tdRight}>{o.itemsCount || (o.items || []).length}</td>
                        <td style={styles.tdRight}>{o.totalQty || 0}</td>
                        <td style={styles.td}>
                          <span style={{ ...styles.statusBadge, borderColor: meta.color, color: meta.color }}>
                            {meta.label}
                          </span>
                        </td>
                        <td style={styles.td}>
                          <div style={styles.progressTrack}>
                            <div style={{ ...styles.progressFill, width: `${meta.progress}%`, background: meta.color }} />
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {currentOrders.length > 0 && (
            <div style={styles.paginationBar}>
              <span style={styles.paginationInfo}>
                Показано {currentPage * PAGE_SIZE + 1}-{Math.min((currentPage + 1) * PAGE_SIZE, currentOrders.length)} из {currentOrders.length}
              </span>
              <div style={styles.paginationNav}>
                <button type="button" style={styles.paginationBtn} disabled={currentPage === 0} onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}>
                  Назад
                </button>
                <button
                  type="button"
                  style={styles.paginationBtn}
                  disabled={(currentPage + 1) * PAGE_SIZE >= currentOrders.length}
                  onClick={() => setCurrentPage((p) => p + 1)}
                >
                  Вперёд
                </button>
              </div>
            </div>
          )}
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Состав выбранного заказа</h2>
          {!selectedOrder ? (
            <div style={styles.emptyPanel}>Выберите один заказ в верхней таблице.</div>
          ) : (
            <>
              <div style={styles.selectedOrderMeta}>
                <span>ID: <strong>{selectedOrder.number}</strong></span>
                <span>ФИО: <strong>{clientMetaById[selectedOrder.customerId]?.fullName || selectedOrder.customerName || "—"}</strong></span>
                <span>Должность: <strong>{clientMetaById[selectedOrder.customerId]?.position || "—"}</strong></span>
                <span>Таб. номер: <strong>{clientMetaById[selectedOrder.customerId]?.employeeId || "—"}</strong></span>
              </div>
              <div style={styles.tableWrap}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>ID заказа</th>
                      <th style={styles.th}>ФИО</th>
                      <th style={styles.th}>Должность</th>
                      <th style={styles.th}>Таб. номер</th>
                      <th style={styles.th}>Товар</th>
                      <th style={styles.th}>Ед.</th>
                      <th style={styles.th}>Кол-во</th>
                      <th style={styles.th}>Цена</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(selectedOrder.items || []).map((it, idx) => (
                      <tr key={`${selectedOrder.id}-${it.id}-${idx}`}>
                        <td style={styles.td}>{selectedOrder.number}</td>
                        <td style={styles.td}>{clientMetaById[selectedOrder.customerId]?.fullName || selectedOrder.customerName || "—"}</td>
                        <td style={styles.td}>{clientMetaById[selectedOrder.customerId]?.position || "—"}</td>
                        <td style={styles.td}>{clientMetaById[selectedOrder.customerId]?.employeeId || "—"}</td>
                        <td style={styles.td}>{it.name || "—"}</td>
                        <td style={styles.td}>{it.unit || "шт."}</td>
                        <td style={styles.tdRight}>{it.qty || 0}</td>
                        <td style={styles.tdRight}>{(it.price || 0).toLocaleString("ru-BY")} Br</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div style={styles.statusBar}>
                <div style={styles.statusChoices}>
                  <span style={styles.statusTitle}>Следующий этап:</span>
                  {nextStatus(selectedOrder.status) ? (
                    <span style={{ fontSize: "14px", fontWeight: 700, color: "#334155" }}>
                      {nextStatus(selectedOrder.status)}
                    </span>
                  ) : (
                    <span style={styles.noNext}>Для этого заказа следующий этап недоступен.</span>
                  )}
                </div>
                <button
                  type="button"
                  style={{ ...styles.applyBtn, opacity: nextStatusChoice ? 1 : 0.5 }}
                  disabled={!nextStatusChoice}
                  onClick={applyStatus}
                >
                  Изменить статус заказа
                </button>
              </div>
            </>
          )}
        </section>

        <footer style={styles.pageFooter}>
          <div style={styles.pageFooterInner}>
            <p style={styles.pageFooterCopy}>
              © {new Date().getFullYear()} Гродноэнерго · Корпоративная система снабжения
            </p>
          </div>
        </footer>
      </main>

      {toast && <div style={styles.toast}>{toast}</div>}
      {confirmModal && (
        <div
          style={styles.modalOverlay}
          role="dialog"
          aria-modal="true"
          onClick={(e) => {
            if (e.target === e.currentTarget) setConfirmModal(null);
          }}
        >
          <div style={styles.modalBox} onClick={(e) => e.stopPropagation()}>
            <h3 style={styles.modalTitle}>Подтверждение смены статуса</h3>
            <p style={styles.modalText}>
              Заказ №{confirmModal.orderNumber}: изменить статус с «{confirmModal.from}» на «
              {confirmModal.to}»?
            </p>
            <div style={styles.modalActions}>
              <button type="button" style={styles.modalBtnGhost} onClick={() => setConfirmModal(null)}>
                Отмена
              </button>
              <button type="button" style={styles.modalBtnPrimary} onClick={confirmApplyStatus}>
                Подтвердить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  pageWrapper: {
    minHeight: "100vh",
    background:
      "radial-gradient(1000px 380px at 10% -10%, rgba(14,165,233,0.16), transparent 60%), radial-gradient(1000px 380px at 100% 0%, rgba(29,78,216,0.18), transparent 62%), linear-gradient(180deg, #f4f8ff 0%, #eaf2ff 55%, #f8fbff 100%)",
  },
  main: {
    maxWidth: "1500px",
    margin: "0 auto",
    padding: "20px 18px 40px",
    fontFamily: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
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
  heroTitle: { fontSize: "30px", fontWeight: 800, margin: "10px 0 8px" },
  heroLead: { margin: 0, fontSize: "15px", color: "rgba(248,251,255,0.9)", lineHeight: 1.5 },
  liveInfo: { marginTop: "10px", fontSize: "14.3px", color: "#dbeafe", fontWeight: 700 },
  warning: {
    marginBottom: "18px",
    padding: "10px 14px",
    borderRadius: "10px",
    backgroundColor: "#e0f2fe",
    color: "#0b4f6c",
    fontSize: "13px",
    border: "1px solid #bae6fd",
  },
  section: { marginBottom: "28px" },
  sectionTitle: { fontSize: "20px", fontWeight: 700, color: "#0f2748", marginBottom: "12px" },
  filtersRow: {
    display: "flex",
    gap: "10px",
    marginBottom: "12px",
    alignItems: "stretch",
    flexWrap: "wrap",
  },
  searchInput: {
    width: "100%",
    height: "46px",
    border: "1px solid #d6dfeb",
    borderRadius: "10px",
    padding: "0 14px",
    fontSize: "14px",
    color: "#0f172a",
    background: "#ffffff",
    outline: "none",
    boxSizing: "border-box",
  },
  resetBtn: {
    height: "46px",
    borderRadius: "10px",
    border: "1px solid #94a3b8",
    padding: "0 16px",
    background: "#fff",
    color: "#334155",
    fontWeight: 600,
    cursor: "pointer",
    whiteSpace: "nowrap",
    alignSelf: "stretch",
  },
  tableWrap: {
    maxHeight: "420px",
    overflow: "auto",
    borderRadius: "16px",
    border: "1px solid #dce8f8",
    background: "rgba(255,255,255,0.96)",
    boxShadow: "0 12px 28px rgba(15,39,80,0.1)",
  },
  table: { width: "100%", minWidth: "1100px", borderCollapse: "separate", borderSpacing: 0 },
  th: {
    position: "sticky",
    top: 0,
    zIndex: 2,
    background: "#f8fbff",
    borderBottom: "1px solid #e2e8f0",
    padding: "12px 12px",
    textAlign: "left",
    color: "#64748b",
    fontSize: "11px",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    fontWeight: 700,
    whiteSpace: "nowrap",
  },
  sortBtn: {
    border: "none",
    background: "transparent",
    padding: 0,
    margin: 0,
    color: "#64748b",
    fontSize: "11px",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    fontWeight: 700,
    cursor: "pointer",
  },
  td: { padding: "10px 12px", borderBottom: "1px solid #eef2f7", fontSize: "14px", color: "#334155" },
  tdRight: {
    padding: "10px 12px",
    borderBottom: "1px solid #eef2f7",
    fontSize: "14px",
    color: "#334155",
    textAlign: "left",
    whiteSpace: "nowrap",
  },
  emptyTd: { padding: "24px 12px", textAlign: "center", color: "#64748b", fontSize: "14px" },
  rowSelected: { background: "rgba(59,130,246,0.08)" },
  checkbox: { width: "18px", height: "18px", accentColor: "#2563eb", cursor: "pointer" },
  statusBadge: {
    display: "inline-flex",
    alignItems: "center",
    border: "1px solid",
    borderRadius: "999px",
    padding: "3px 9px",
    fontSize: "12px",
    fontWeight: 700,
    background: "#fff",
  },
  progressTrack: { width: "150px", height: "7px", borderRadius: "999px", background: "#dbe4f0", overflow: "hidden" },
  progressFill: { height: "100%" },
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
  selectedOrderMeta: {
    display: "flex",
    flexWrap: "wrap",
    gap: "14px",
    marginBottom: "10px",
    border: "1px solid #dbe7f6",
    borderRadius: "12px",
    background: "#ffffff",
    padding: "10px 12px",
    color: "#334155",
    fontSize: "14px",
  },
  statusBar: {
    marginTop: "12px",
    border: "1px solid #dbe7f6",
    borderRadius: "12px",
    background: "#ffffff",
    padding: "12px",
    display: "flex",
    gap: "14px",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
  },
  statusChoices: { display: "flex", alignItems: "center", gap: "14px", flexWrap: "wrap" },
  statusTitle: { fontSize: "14px", fontWeight: 700, color: "#0f2748" },
  radioLabel: { display: "inline-flex", alignItems: "center", gap: "8px", fontSize: "14px", color: "#334155" },
  noNext: { fontSize: "13px", color: "#64748b" },
  applyBtn: {
    border: "none",
    borderRadius: "999px",
    padding: "10px 20px",
    color: "#fff",
    fontWeight: 700,
    fontSize: "14px",
    cursor: "pointer",
    background: "linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 52%, #0e7490 100%)",
  },
  emptyPanel: {
    border: "1px dashed #bfd3ee",
    borderRadius: "12px",
    background: "#ffffff",
    color: "#64748b",
    padding: "18px 14px",
    fontSize: "14px",
  },
  searchHighlight: {
    backgroundColor: "#fde047",
    color: "#713f12",
    padding: "1px 4px",
    borderRadius: "4px",
    fontWeight: 700,
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
  pageFooterCopy: { margin: 0, color: "#edf3ff", fontSize: "13px", fontWeight: 600, textAlign: "center" },
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
  modalOverlay: {
    position: "fixed",
    inset: 0,
    zIndex: 10000,
    background: "rgba(15, 23, 42, 0.45)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    boxSizing: "border-box",
  },
  modalBox: {
    width: "100%",
    maxWidth: "440px",
    borderRadius: "18px",
    padding: "22px 24px",
    background: "#fff",
    border: "1px solid #e2e8f0",
    boxShadow: "0 24px 48px rgba(15,23,42,0.25)",
    boxSizing: "border-box",
  },
  modalTitle: {
    margin: "0 0 10px",
    fontSize: "18px",
    fontWeight: 800,
    color: "#0f2748",
  },
  modalText: {
    margin: "0 0 18px",
    fontSize: "15px",
    lineHeight: 1.5,
    color: "#334155",
  },
  modalActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    flexWrap: "wrap",
  },
  modalBtnGhost: {
    padding: "10px 16px",
    borderRadius: "999px",
    border: "1px solid #cbd5e1",
    background: "#fff",
    color: "#475569",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
  },
  modalBtnPrimary: {
    padding: "10px 16px",
    borderRadius: "999px",
    border: "none",
    background: "linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 52%, #0e7490 100%)",
    color: "#fff",
    fontSize: "14px",
    fontWeight: 700,
    cursor: "pointer",
  },
};

