import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  MSG_TAB_TEMPLATE,
  buildTabMaskVisual,
  isTabMaskComplete,
  isValidTabNumberNormalized,
  normalizeTabParts,
  tabApplyParsedText,
  tabKeyDownPhoneStyle,
} from "../../utils/tabNumberInput";
import { apiAbsoluteUrl } from "../../utils/apiOrigin";
import { validateEmailFormat, validatePasswordFormat } from "../../utils/authValidators";

const MSG_ROLE = "Выберите роль в системе";

const MSG_BACKEND = "Неверные данные или пользователь не найден";

function extractBackendErrorMessage(data, fallback) {
  if (!data || typeof data !== "object") return fallback;
  if (typeof data.message === "string" && data.message.trim()) return data.message.trim();
  if (typeof data.detail === "string" && data.detail.trim()) return data.detail.trim();
  const errs = data.errors;
  if (Array.isArray(errs) && errs.length > 0) {
    const first = errs[0];
    const msg =
      typeof first === "string"
        ? first
        : first?.defaultMessage || first?.message || first?.detail;
    if (typeof msg === "string" && msg.trim()) return msg.trim();
  }
  return fallback;
}

const ERR_TAB_REQUIRED =
  "Заполните табельный номер полностью: 1 буква и 4 цифры после дефиса (пример T 1111)";

export default function SignInForm({ onSuccess }) {
  const [tab, setTab] = useState({ l: "", d: "" });
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [fieldErrors, setFieldErrors] = useState({
    tabNumber: null,
    email: null,
    password: null,
    role: null,
  });
  const [submitError, setSubmitError] = useState(null);

  const patchTab = React.useCallback((next) => {
    setTab(next);
    setFieldErrors((prev) => ({ ...prev, tabNumber: null }));
    setSubmitError(null);
  }, []);

  const tabInputRef = useRef(null);

  const tabMaskVisual = useMemo(
    () => buildTabMaskVisual(tab.l, tab.d),
    [tab.l, tab.d]
  );

  const tabNormalized = useMemo(() => normalizeTabParts(tab.l, tab.d), [tab.l, tab.d]);

  useEffect(() => {
    const el = tabInputRef.current;
    if (!el || document.activeElement !== el) return;
    const len = el.value.length;
    requestAnimationFrame(() => {
      try {
        el.setSelectionRange(len, len);
      } catch (_) {
        /* игнорируем типы, где selection недоступен */
      }
    });
  }, [tabMaskVisual]);

  const handleTabKeyDown = (e) => {
    tabKeyDownPhoneStyle(e, patchTab);
  };

  const handleTabPaste = (e) => {
    e.preventDefault();
    tabApplyParsedText(e.clipboardData.getData("text"), patchTab);
  };

  /** Мобильные клавиатуры и вставка целой строки */
  const handleTabChangeSync = (e) => {
    tabApplyParsedText(e.target.value, patchTab);
  };

  const handleTabFocus = (ev) => {
    const el = ev.target;
    requestAnimationFrame(() => {
      try {
        const len = el.value.length;
        el.setSelectionRange(len, len);
      } catch (_) {}
    });
  };

  /**
   * Уровень 1: всё заполнено.
   * Уровень 2: форматы.
   */
  const runClientValidation = () => {
    const next = {
      tabNumber: null,
      email: null,
      password: null,
      role: null,
    };

    if (!isTabMaskComplete(tab.l, tab.d)) {
      next.tabNumber = ERR_TAB_REQUIRED;
    }
    if (!email.trim()) {
      next.email = "Обязательное поле";
    }
    if (!password) {
      next.password = "Обязательное поле";
    }
    if (!role) {
      next.role = MSG_ROLE;
    }

    const level1Fail =
      next.tabNumber || next.email || next.password || next.role;

    if (level1Fail) {
      setFieldErrors(next);
      return false;
    }

    if (!isValidTabNumberNormalized(tabNormalized)) {
      next.tabNumber = MSG_TAB_TEMPLATE;
    }

    next.email = validateEmailFormat(email);
    next.password = validatePasswordFormat(password);

    setFieldErrors(next);
    return !next.tabNumber && !next.email && !next.password && !next.role;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);

    if (!runClientValidation()) {
      return;
    }

    const backendRole =
      role === "client"
        ? "client"
        : role === "warehouse"
          ? "storekeeper"
          : role === "admin"
            ? "admin"
            : "";

    setLoading(true);
    try {
      const res = await fetch(apiAbsoluteUrl("/api/auth/login"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          tabNumber: `${tab.l}-${tab.d}`,
          email: email.trim(),
          password,
          role: backendRole,
        }),
      });

      let data = {};
      const text = await res.text();
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        data = {};
      }

      if (res.status === 404) {
        setSubmitError(
          "Сервер вернул 404: проверьте, что запущен backend Spring Boot на порту 8080 и доступен POST /api/auth/login."
        );
        return;
      }

      if (!res.ok || !data.success) {
        setSubmitError(extractBackendErrorMessage(data, MSG_BACKEND));
        return;
      }

      alert(`Добро пожаловать, ${data.fullName}!`);
      onSuccess({
        email: email.trim(),
        fullName: data.fullName,
        clientId: data.clientId,
        role: data.role,
        tabNumber: tabNormalized,
      });
    } catch (err) {
      console.error("Sign-in error:", err);
      setSubmitError(
        "Не удалось связаться с сервером. Убедитесь, что backend запущен (порт 8080)."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container sign-in-container">
      <form onSubmit={handleSubmit} className="auth-form" noValidate>
        <h2 className="form-title">Вход в систему</h2>
        <p className="form-subtitle">Система снабжения Гродноэнерго</p>

        <div className="input-group">
          <label className="input-label" htmlFor="signin-tab">
            Табельный номер
          </label>
          <input
            ref={tabInputRef}
            id="signin-tab"
            type="text"
            inputMode="text"
            autoComplete="off"
            spellCheck={false}
            placeholder="_-____"
            value={tabMaskVisual}
            onKeyDown={handleTabKeyDown}
            onPaste={handleTabPaste}
            onChange={handleTabChangeSync}
            onFocus={handleTabFocus}
            className={`form-input tab-mask-input ${fieldErrors.tabNumber ? "input-invalid" : ""}`}
            aria-invalid={Boolean(fieldErrors.tabNumber)}
            aria-describedby={fieldErrors.tabNumber ? "signin-tab-err" : undefined}
          />
          {fieldErrors.tabNumber && (
            <div id="signin-tab-err" className="field-error" role="alert">
              {fieldErrors.tabNumber}
            </div>
          )}
        </div>

        <div className="input-group">
          <label className="input-label" htmlFor="signin-email">
            Email
          </label>
          <input
            id="signin-email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="name@domain.by"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setFieldErrors((prev) => ({ ...prev, email: null }));
              setSubmitError(null);
            }}
            className={`form-input ${fieldErrors.email ? "input-invalid" : ""}`}
            aria-invalid={Boolean(fieldErrors.email)}
            aria-describedby={fieldErrors.email ? "signin-email-err" : undefined}
          />
          {fieldErrors.email && (
            <div id="signin-email-err" className="field-error" role="alert">
              {fieldErrors.email}
            </div>
          )}
        </div>

        <div className="input-group">
          <label className="input-label" htmlFor="signin-password">
            Пароль
          </label>
          <div className="password-field">
            <input
              id="signin-password"
              type={showPassword ? "text" : "password"}
              placeholder="Латиница и цифры, минимум 6 символов"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setFieldErrors((prev) => ({ ...prev, password: null }));
                setSubmitError(null);
              }}
              className={`form-input password-input ${fieldErrors.password ? "input-invalid" : ""}`}
              aria-invalid={Boolean(fieldErrors.password)}
              aria-describedby={fieldErrors.password ? "signin-password-err" : undefined}
              autoComplete="current-password"
            />
            <button
              type="button"
              className="password-toggle-btn"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
              title={showPassword ? "Скрыть пароль" : "Показать пароль"}
            >
              👁️
            </button>
          </div>
          {fieldErrors.password && (
            <div id="signin-password-err" className="field-error" role="alert">
              {fieldErrors.password}
            </div>
          )}
        </div>

        <div className="input-group">
          <label className="input-label" htmlFor="signin-role">
            Роль в системе
          </label>
          <select
            id="signin-role"
            className={`form-input form-select-like ${fieldErrors.role ? "input-invalid" : ""}`}
            value={role}
            onChange={(e) => {
              setRole(e.target.value);
              setFieldErrors((prev) => ({ ...prev, role: null }));
              setSubmitError(null);
            }}
            aria-invalid={Boolean(fieldErrors.role)}
            aria-describedby={fieldErrors.role ? "signin-role-err" : undefined}
          >
            <option value="" disabled>
              — Выберите роль —
            </option>
            <option value="client">Клиент</option>
            <option value="warehouse">Кладовщик</option>
            <option value="admin">Администратор</option>
          </select>
          {fieldErrors.role && (
            <div id="signin-role-err" className="field-error" role="alert">
              {fieldErrors.role}
            </div>
          )}
        </div>

        {submitError && (
          <div className="error-message error-message-submit" role="alert">
            {submitError}
          </div>
        )}

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? (
            <span className="loading-spinner">⏳ Вход...</span>
          ) : (
            "Войти в систему"
          )}
        </button>
      </form>
    </div>
  );
}
