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
import {
  validateEmailFormat,
  validatePasswordFormat,
  validatePersonName,
  validatePosition,
} from "../../utils/authValidators";
import { getPasswordDiagnostics } from "../../utils/passwordDiagnostics";

const CONF_FIELD_LABEL = {
  fullName: "ФИО",
  position: "должность",
  tabNumber: "табельный номер",
  phone: "телефон",
  email: "email",
  password: "пароль",
};

const ERR_TAB_REQUIRED =
  "Заполните табельный номер полностью: 1 буква и 4 цифры после дефиса (пример T 1111)";

function extractRegisterError(data) {
  const msg =
    typeof data?.message === "string" && data.message.trim()
      ? data.message.trim()
      : "Не удалось зарегистрироваться.";
  const c = data?.conflicts;
  if (!Array.isArray(c) || c.length === 0) return msg;
  const parts = c.map((k) => CONF_FIELD_LABEL[k] || k);
  return `${msg} Уже занято: ${parts.join(", ")}.`;
}

/** 9 цифр оператора после кода страны → для отображения в маске */
function buildPhoneMasked(localDigits9) {
  const d = String(localDigits9).replace(/\D/g, "").slice(0, 9).padEnd(9, "_");
  return `+375 (${d.slice(0, 2)}) ${d.slice(2, 5)}-${d.slice(5, 7)}-${d.slice(7, 9)}`;
}

function normalizeLocalNineFromPaste(text) {
  let only = String(text).replace(/\D/g, "");
  if (only.startsWith("375")) only = only.slice(3);
  return only.slice(0, 9);
}

export default function SignUpForm({ onSuccess }) {
  const [tab, setTab] = useState({ l: "", d: "" });
  const [fullName, setFullName] = useState("");
  const [position, setPosition] = useState("");
  const [phoneDigits9, setPhoneDigits9] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [roleUi, setRoleUi] = useState("client");
  const [loading, setLoading] = useState(false);

  const [fieldErrors, setFieldErrors] = useState({
    tabNumber: null,
    fullName: null,
    position: null,
    phone: null,
    email: null,
    password: null,
    role: null,
  });
  const [submitError, setSubmitError] = useState(null);

  const patchTab = React.useCallback((next) => {
    setTab(next);
    setFieldErrors((p) => ({ ...p, tabNumber: null }));
    setSubmitError(null);
  }, []);

  const tabInputRef = useRef(null);

  const tabMaskVisual = useMemo(
    () => buildTabMaskVisual(tab.l, tab.d),
    [tab.l, tab.d]
  );
  const tabNormalized = useMemo(
    () => normalizeTabParts(tab.l, tab.d),
    [tab.l, tab.d]
  );

  useEffect(() => {
    const el = tabInputRef.current;
    if (!el || document.activeElement !== el) return;
    const len = el.value.length;
    requestAnimationFrame(() => {
      try {
        el.setSelectionRange(len, len);
      } catch (_) {}
    });
  }, [tabMaskVisual]);

  const phoneMasked = buildPhoneMasked(phoneDigits9);

  const pwStrength = useMemo(
    () =>
      getPasswordDiagnostics(password, {
        shortThreshold: 6,
        recommendSymbols: true,
      }),
    [password],
  );

  const backendRole =
    roleUi === "client"
      ? "client"
      : roleUi === "warehouse"
        ? "storekeeper"
        : roleUi === "admin"
          ? "admin"
          : "";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);

    const fn = fullName.trim().replace(/\s+/g, " ");
    const pos = position.trim().replace(/\s+/g, " ");

    const next = {
      tabNumber: null,
      fullName: null,
      position: null,
      phone: null,
      email: null,
      password: null,
      role: null,
    };

    if (!isTabMaskComplete(tab.l, tab.d)) next.tabNumber = ERR_TAB_REQUIRED;
    else if (!isValidTabNumberNormalized(tabNormalized)) next.tabNumber = MSG_TAB_TEMPLATE;

    if (!fn) next.fullName = "Обязательное поле";
    else next.fullName = validatePersonName(fn, 5);

    if (!pos) next.position = "Обязательное поле";
    else next.position = validatePosition(pos, 3);

    if (phoneDigits9.length !== 9) next.phone = "Введите 9 цифр номера после +375";

    if (!email.trim()) next.email = "Обязательное поле";
    else next.email = validateEmailFormat(email);

    if (!password) next.password = "Обязательное поле";
    else next.password = validatePasswordFormat(password);

    if (!backendRole) next.role = "Выберите роль";

    setFieldErrors(next);

    if (Object.values(next).some(Boolean)) return;

    setLoading(true);
    try {
      const payload = {
        fullName: fn,
        position: pos,
        tabNumber: `${tab.l}-${tab.d}`,
        phone: `375${phoneDigits9}`,
        email: email.trim(),
        password,
        role: backendRole,
      };

      const res = await fetch(apiAbsoluteUrl("/api/auth/register"), {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      });

      const text = await res.text();
      let data = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch (_) {
        data = {};
      }

      if (!res.ok || data.success !== true) {
        setSubmitError(extractRegisterError(data));
        return;
      }

      onSuccess?.({ clientId: data.clientId, email: payload.email });
    } catch (err) {
      console.error("sign-up:", err);
      setSubmitError("Не удалось связаться с сервером (backend на порту 8080).");
    } finally {
      setLoading(false);
    }
  };

  const handleTabKeyDown = (e) => {
    tabKeyDownPhoneStyle(e, patchTab);
  };

  const handleTabPaste = (e) => {
    e.preventDefault();
    tabApplyParsedText(e.clipboardData.getData("text"), patchTab);
  };

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

  const handlePhoneKeyDown = (e) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      setPhoneDigits9((prev) => prev.slice(0, -1));
      setFieldErrors((p) => ({ ...p, phone: null }));
      setSubmitError(null);
      return;
    }
    if (/^\d$/.test(e.key)) {
      e.preventDefault();
      setPhoneDigits9((prev) => (prev.length < 9 ? `${prev}${e.key}` : prev));
      setFieldErrors((p) => ({ ...p, phone: null }));
      setSubmitError(null);
      return;
    }
    if (["Tab", "ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) return;
    e.preventDefault();
  };

  const handlePhonePaste = (e) => {
    e.preventDefault();
    setPhoneDigits9(normalizeLocalNineFromPaste(e.clipboardData.getData("text")));
    setFieldErrors((p) => ({ ...p, phone: null }));
    setSubmitError(null);
  };

  return (
    <div className="form-container sign-up-container">
      <form onSubmit={handleSubmit} className="auth-form" noValidate>
        <h2 className="form-title">Регистрация</h2>
        <p className="form-subtitle">Создайте аккаунт в системе Гродноэнерго</p>

        <div className="input-group">
          <label className="input-label" htmlFor="signup-tab">
            Табельный номер
          </label>
          <input
            ref={tabInputRef}
            id="signup-tab"
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
          />
          {fieldErrors.tabNumber && (
            <div className="field-error" role="alert">
              {fieldErrors.tabNumber}
            </div>
          )}
        </div>

        <div className="input-group">
          <label className="input-label" htmlFor="signup-phone">
            Телефон (только цифры оператора после +375)
          </label>
          <input
            id="signup-phone"
            type="tel"
            inputMode="numeric"
            placeholder="+375 (__) ___-__-__"
            value={phoneMasked}
            onChange={(e) => setPhoneDigits9(normalizeLocalNineFromPaste(e.target.value))}
            onKeyDown={handlePhoneKeyDown}
            onPaste={handlePhonePaste}
            className={`form-input ${fieldErrors.phone ? "input-invalid" : ""}`}
          />
          <div className="field-hint" style={{ marginTop: 4, opacity: 0.75, fontSize: 13 }}>
            В базу сохраняется 12 цифр: 375XXXXXXXXX
          </div>
          {fieldErrors.phone && (
            <div className="field-error" role="alert">
              {fieldErrors.phone}
            </div>
          )}
        </div>

        <div className="input-group">
          <label className="input-label">ФИО</label>
          <input
            type="text"
            placeholder="Только русские или латинские буквы, минимум 5 символов"
            value={fullName}
            onChange={(e) => {
              setFullName(e.target.value);
              setFieldErrors((p) => ({ ...p, fullName: null }));
              setSubmitError(null);
            }}
            className={`form-input ${fieldErrors.fullName ? "input-invalid" : ""}`}
          />
          {fieldErrors.fullName && (
            <div className="field-error" role="alert">
              {fieldErrors.fullName}
            </div>
          )}
        </div>

        <div className="input-group">
          <label className="input-label">Должность</label>
          <input
            type="text"
            placeholder="Только русские или латинские буквы, минимум 3 символа"
            value={position}
            onChange={(e) => {
              setPosition(e.target.value);
              setFieldErrors((p) => ({ ...p, position: null }));
              setSubmitError(null);
            }}
            className={`form-input ${fieldErrors.position ? "input-invalid" : ""}`}
          />
          {fieldErrors.position && (
            <div className="field-error" role="alert">
              {fieldErrors.position}
            </div>
          )}
        </div>

        <div className="input-group">
          <label className="input-label">Email</label>
          <input
            type="email"
            placeholder="name@domain.by"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setFieldErrors((p) => ({ ...p, email: null }));
              setSubmitError(null);
            }}
            className={`form-input ${fieldErrors.email ? "input-invalid" : ""}`}
          />
          {fieldErrors.email && (
            <div className="field-error" role="alert">
              {fieldErrors.email}
            </div>
          )}
        </div>

        <div className="input-group">
          <label className="input-label">Пароль</label>
          <div className="password-field">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Латиница и цифры, минимум 6"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setFieldErrors((p) => ({ ...p, password: null }));
                setSubmitError(null);
              }}
              className={`form-input password-input ${fieldErrors.password ? "input-invalid" : ""}`}
            />
            <button
              type="button"
              className="password-toggle-btn"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>
          {fieldErrors.password && (
            <div className="field-error" role="alert">
              {fieldErrors.password}
            </div>
          )}
          <div className={`password-strength password-strength--${pwStrength.tier}`} aria-live="polite">
            <div className="password-strength-head">
              <span className="password-strength-label">Уровень сложности:</span>
              <strong style={{ color: pwStrength.color }}>{pwStrength.label}</strong>
            </div>
            <div className="password-strength-track">
              <div
                className="password-strength-fill"
                style={{
                  width: `${pwStrength.progress}%`,
                  backgroundColor: pwStrength.color,
                }}
              />
            </div>
            {pwStrength.recommendations.length > 0 && (
              <ul className="password-strength-tips">
                {pwStrength.recommendations.map((tip) => (
                  <li key={tip}>{tip}</li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="input-group">
          <label className="input-label">Роль в системе</label>
          <div className="role-selector">
            {[
              ["client", "Клиент", "👤"],
              ["warehouse", "Кладовщик", "📦"],
              ["admin", "Администратор", "⚙️"],
            ].map(([val, lab, ic]) => (
              <label
                key={val}
                className={`role-option ${roleUi === val ? "active" : ""}`}
              >
                <input
                  type="radio"
                  name="role-signup"
                  value={val}
                  checked={roleUi === val}
                  onChange={() => {
                    setRoleUi(val);
                    setFieldErrors((p) => ({ ...p, role: null }));
                    setSubmitError(null);
                  }}
                />
                <span className="role-icon">{ic}</span>
                <span className="role-text">{lab}</span>
              </label>
            ))}
          </div>
          {fieldErrors.role && (
            <div className="field-error" role="alert">
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
          {loading ? <span className="loading-spinner">⏳ Регистрация...</span> : "Зарегистрироваться"}
        </button>

        <div className="form-terms">
          <p>
            Регистрируясь, вы соглашаетесь с{" "}
            <button type="button" className="help-link">
              условиями использования
            </button>
          </p>
        </div>
      </form>
    </div>
  );
}
