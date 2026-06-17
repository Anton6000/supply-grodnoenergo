import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiAbsoluteUrl } from "../utils/apiOrigin";
import "./catalog.css";
import "./HomePage.css";

export default function HomePage() {
  const navigate = useNavigate();
  const [catalogSummary, setCatalogSummary] = useState(null);
  const [catalogError, setCatalogError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const url = apiAbsoluteUrl("/api/supply-goods/catalog-summary");
    fetch(url, { credentials: "include" })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`Не удалось загрузить каталог (${res.status})`);
        }
        return res.json();
      })
      .then((body) => {
        if (!cancelled) {
          setCatalogSummary(body);
          setCatalogError(null);
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setCatalogError(e.message || String(e));
          setCatalogSummary(null);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const catalogRows =
    catalogSummary?.rows?.map((row) => ({
      category: row.category ?? "",
      subcategory: row.subcategory ?? "",
      productCount:
        typeof row.productCount === "number" ? row.productCount : Number(row.productCount ?? 0),
    })) ?? [];

  return (
    <div className="catalog-page home-landing">
      {/* Баннер на всю ширину */}
      <section className="catalog-banner" aria-hidden="true">
        <div className="home-hero-content">
          <p className="home-hero-kicker">Гродноэнерго · Платформа снабжения подразделений</p>
          <h1 className="home-hero-title">
            Цифровое управление заявками
          </h1>
          <p className="home-hero-lead">
            Каталог товаров, оформление заказов и складская обработка объединены в едином корпоративном интерфейсе.
          </p>
          <div className="home-hero-actions">
            <button
              type="button"
              className="home-hero-btn home-hero-btn-primary"
              onClick={() => navigate("/sign-in-sign-up")}
            >
              Войти в систему
            </button>
          </div>
        </div>
      </section>

      {/* Блок информации о Гродноэнерго — общий обзор */}
      <section className="home-info-block">
        <div className="home-info-inner">
          <h2 className="home-info-title">О Гродноэнерго</h2>
          <p className="home-info-lead">
            Гродненское республиканское унитарное предприятие электроэнергетики
            «Гродноэнерго» — единый технологический комплекс по производству,
            передаче и распределению электрической и тепловой энергии в
            Принеманском регионе.
          </p>
          <div className="home-info-stats">
            <div className="home-info-stat">
              <div className="home-info-stat-value">крупнейшая</div>
              <div className="home-info-stat-label">
                энергосистема Гродненской области
              </div>
            </div>
            <div className="home-info-stat">
              <div className="home-info-stat-value">единый</div>
              <div className="home-info-stat-label">
                технологический комплекс производства и сетей
              </div>
            </div>
            <div className="home-info-stat">
              <div className="home-info-stat-value">24/7</div>
              <div className="home-info-stat-label">
                ответственность за надёжное энергоснабжение региона
              </div>
            </div>
            <div className="home-info-stat">
              <div className="home-info-stat-value">14 филиалов</div>
              <div className="home-info-stat-label">
                электростанции, сетевые и тепловые организации в составе системы
              </div>
            </div>
            <div className="home-info-stat">
              <div className="home-info-stat-value">инфраструктура</div>
              <div className="home-info-stat-label">
                источники генерации, линии электропередачи и тепловые сети
              </div>
            </div>
          </div>
          <div className="home-info-grid">
            <div className="home-info-col">
              <h3 className="home-info-subtitle">Миссия и задачи</h3>
              <p>
                Основная задача предприятия — надежное и бесперебойное
                энергоснабжение населения, социальной сферы и предприятий
                региона на основе современных технических решений и строгого
                соблюдения требований промышленной и энергетической безопасности.
              </p>
              <p>
                «Гродноэнерго» обеспечивает сбалансированное развитие
                генерирующих мощностей и сетевой инфраструктуры, уделяя особое
                внимание энергоэффективности, цифровизации процессов и
                повышению качества предоставляемых услуг.
              </p>
              <p>
                Предприятие выстраивает взаимодействие с промышленными
                потребителями, коммунальными службами и социальными объектами,
                обеспечивая для каждого сегмента устойчивые условия
                энергоснабжения, понятные правила подключения и прозрачную
                систему сервисной поддержки.
              </p>
            </div>
            <div className="home-info-col">
              <h3 className="home-info-subtitle">Энергетическая инфраструктура</h3>
              <p>
                В составе энергосистемы — теплоэлектроцентрали, гидро- и
                ветроэлектростанции, а также разветвлённая сеть линий
                электропередачи различного класса напряжения и тепловые сети,
                связывающие источники энергии с потребителями.
              </p>
              <p>
                Эксплуатация и развитие этой инфраструктуры требуют точной
                координации процессов снабжения: планирования потребностей,
                формирования заказов на оборудование и материалы, контроля
                материальных запасов и своевременной логистики.
              </p>
              <p>
                Важно не только своевременно закупать и доставлять оборудование,
                но и обеспечивать его полное соответствие техническим условиям,
                проектным решениям и требованиям по надёжности. Поэтому процессы
                снабжения и управления запасами рассматриваются как часть общей
                системы управления качеством предприятия.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Каталог из БД: категории (слева) · подкатегории · количество позиций */}
      <div className="catalog-content">
        <h1 className="catalog-title">Каталог снабжения организации</h1>

        {catalogError && (
          <p className="home-supply-catalog-error" role="alert">
            {catalogError}. Проверьте, что backend запущен и в PostgreSQL есть таблица supply_goods с данными.
          </p>
        )}

        <div className="home-supply-catalog-card">
          {catalogRows.length === 0 && !catalogError && (
            <p className="home-supply-muted">Загрузка каталога…</p>
          )}
          {!catalogError && catalogRows.length > 0 && (
            <div className="home-supply-table-scroll">
              <div className="home-supplyTriple" role="table" aria-label="Каталог по таблице supply_goods">
                <div className="home-supplyTripleHead" role="row">
                  <div role="columnheader">Категория</div>
                  <div role="columnheader">Подкатегория</div>
                  <div role="columnheader">Товаров в подкатегории</div>
                </div>
                {catalogRows.map((row, idx) => (
                  <div key={`${row.category}-${row.subcategory}-${idx}`} className="home-supplyTripleRow" role="row">
                    <div role="cell" className="home-supplyTripleCell home-supplyTripleCat">{row.category}</div>
                    <div role="cell" className="home-supplyTripleCell">{row.subcategory}</div>
                    <div role="cell" className="home-supplyTripleCell home-supplyTripleNum">{row.productCount}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Подробная информация о предприятии и преимуществах системы снабжения */}
      <section className="home-info-block home-info-block-bottom">
        <div className="home-info-inner">
          <h2 className="home-info-title">
            Предприятие, ориентированное на надёжность и развитие
          </h2>
          <div className="home-info-grid">
            <div className="home-info-col">
              <h3 className="home-info-subtitle">Структура и ответственность</h3>
              <p>
                В состав энергосистемы входят электростанции, электросетевые и
                тепловые филиалы, ремонтные и сервисные подразделения. Каждый
                филиал отвечает за конкретную зону обслуживания и взаимодействует
                со службами снабжения при формировании потребностей в ресурсах.
              </p>
              <p>
                Централизованная система снабжения позволяет унифицировать
                номенклатуру оборудования и материалов, контролировать
                соответствие продукции стандартам и техническим требованиям,
                а также обеспечивать прозрачность закупочных процедур.
              </p>
              <p>
                Важнейшая задача — поддерживать баланс между гарантированной
                наличием критически важных запасов и экономически обоснованным
                уровнем материальных остатков, избегая как дефицита, так и
                избыточного замораживания средств.
              </p>
            </div>
            <div className="home-info-col">
              <h3 className="home-info-subtitle">Преимущества современной системы снабжения</h3>
              <ul className="home-info-list">
                <li>
                  <strong>Повышение надёжности энергоснабжения.</strong> Точная
                  координация поставок сокращает время подготовки и проведения
                  ремонтных работ, уменьшает риск простоев и незапланированных
                  отключений.
                </li>
                <li>
                  <strong>Прозрачность и управляемость процессов.</strong>{" "}
                  Централизованный учёт заказов, поставок и материальных запасов
                  обеспечивает единое информационное пространство для служб
                  предприятия.
                </li>
                <li>
                  <strong>Поддержка развития и модернизации.</strong> Система
                  снабжения обеспечивает ресурсами проекты по строительству новых
                  объектов, реконструкции подстанций, внедрению интеллектуальных
                  систем учёта и автоматизации управления.
                </li>
                <li>
                  <strong>Оперативная реакция на нештатные ситуации.</strong>{" "}
                  Наличие отработанных процедур резервного снабжения и
                  перераспределения ресурсов между филиалами позволяет быстро
                  реагировать на аварийные события и восстанавливать
                  энергоснабжение потребителей.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <footer className="home-mini-footer">
        <div className="home-mini-footer-inner">
          <p className="home-mini-footer-copy">
            © {new Date().getFullYear()} Гродноэнерго · Корпоративная система снабжения
          </p>
        </div>
      </footer>
    </div>
  );
}
