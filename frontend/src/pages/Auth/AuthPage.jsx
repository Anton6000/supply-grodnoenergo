import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./auth.css";
import SignInForm from "./SignIn";
import SignUpForm from "./SignUp";
import { useAppData } from "../../context/AppDataContext";

export default function AuthPage() {
  const [type, setType] = useState("signIn");
  const navigate = useNavigate();
  const { loginDemo } = useAppData();

  const handleAuthSuccess = (from, payload) => {
    if (from === "signup") {
      setType("signIn");
      alert("Регистрация прошла успешно! Теперь войдите в систему.");
    } else if (from === "signin") {
      const { email, role, fullName, clientId, tabNumber } = payload || {};
      const user = loginDemo({
        email,
        name: fullName,
        role,
        clientId,
        tabNumber,
      });

      if (user.role === "admin") {
        navigate("/admin-dashboard");
      } else if (user.role === "warehouse") {
        navigate("/warehouse-dashboard");
      } else {
        navigate("/catalog");
      }
    }
  };

  const containerClass = `container ${type === "signUp" ? "right-panel-active" : ""}`;

  return (
    <div className="auth-page">
      <div className="auth-header">
        <div className="logo-section">
          <div className="logo-icon">⚡</div>
          <div className="logo-text">
            <h1>Гродноэнерго</h1>
            <span>Система снабжения</span>
          </div>
        </div>
      </div>

      <div className="auth-features">
        <div className="feature-card">
          <div className="feature-icon purple">📝</div>
          <h3>Заявки подразделений</h3>
          <p>Сотрудники выбирают товары из каталога и оформляют заявки на снабжение организации.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon blue">🏭</div>
          <h3>Складская обработка</h3>
          <p>Кладовщик принимает заказы в работу, контролирует сборку и обновляет текущий статус.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon green">🛠️</div>
          <h3>Панель управления</h3>
          <p>Администратор ведёт справочники товаров, пользователей и контролирует ключевые показатели.</p>
        </div>
      </div>

      <div className={containerClass} id="authContainer">
        <SignUpForm onSuccess={(payload) => handleAuthSuccess("signup", payload)} />
        <SignInForm onSuccess={(payload) => handleAuthSuccess("signin", payload)} />

        <div className="overlay-container">
          <div className="overlay">
            <div className="overlay-panel overlay-left">
              <div className="overlay-content">
                <h2>Уже есть аккаунт?</h2>
                <p>
                  Войдите в систему для доступа к заказам и управлению поставками
                </p>
                <button className="ghost" onClick={() => setType("signIn")}>
                  Войти
                </button>
              </div>
            </div>

            <div className="overlay-panel overlay-right">
              <div className="overlay-content">
                <h2>Новый пользователь?</h2>
                <p>
                  Создайте аккаунт для доступа к системе снабжения 
                  Гродноэнерго и управления заказами
                </p>
                <button className="ghost" onClick={() => setType("signUp")}>
                  Зарегистрироваться
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="auth-footer">
        <div className="auth-footer-inner">
          <p className="auth-footer-copy">
            © {new Date().getFullYear()} Гродноэнерго · Корпоративная система снабжения
          </p>
        </div>
      </footer>
    </div>
  );
}