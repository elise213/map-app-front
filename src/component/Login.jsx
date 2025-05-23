import React, { useState, useEffect, useContext } from "react";
import { Context } from "../store/appContext";
import {
  Avatar,
  Menu,
  MenuItem,
  IconButton,
  Button,
  Tooltip,
} from "@mui/material";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import styles from "../styles/loginModal.css";
import Register from "./Register";

const Login = ({ setLayout }) => {
  const { store, actions } = useContext(Context);
  const [log, setLog] = useState("1");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(
    store.loginModalIsOpen
  );
  const userId2 = parseInt(sessionStorage.getItem("user_id"), 10);
  const isLoggedIn = !!store.token;

  useEffect(() => {
    setIsLoginModalOpen(store.loginModalIsOpen);
  }, [store.loginModalIsOpen]);

  const handleLogin = async (e) => {
    e.preventDefault();
    const loginSuccessful = await actions.login(email, password);
    if (loginSuccessful) {
      actions.closeLoginModal();
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    const forgotEmail = email;
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recipient_email: forgotEmail }),
    };
    try {
      const response = await fetch(
        `${store.current_back_url}/api/forgot-password`,
        requestOptions
      );
      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: "Email Sent",
          text: "Please check your email to reset your password",
        }).then(() => {
          actions.closeLoginModal();
        });
      } else {
        const errorDetails = await response.json();
        Swal.fire({
          icon: "error",
          title: "Error",
          text: errorDetails.error || "An unexpected error occurred.",
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Something went wrong",
        text: "Network error. Please check your internet connection and try again.",
      });
    }
  };

  const handleLogout = () => {
    actions.logout();
    setAnchorEl(null);
    setLayout("fullscreen-sidebar");
  };
  let field = null;
  if (log === "2") {
    field = <Register setLog={setLog} log={log} />;
  } else if (log === "3") {
    field = (
      <div className="login-modal-content">
        <div className="login-modal-body">
          <form onSubmit={handleForgotPassword}>
            <div className="form-section">
              <label htmlFor="forgotPasswordEmail" className="form-label">
                Email
              </label>
              <input
                type="email"
                className="form-input"
                id="forgotPasswordEmail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="password-submit-div">
              <Button
                variant="contained"
                color="primary"
                type="submit"
                className="form-button"
              >
                Reset Password
              </Button>
            </div>
          </form>
          <span className="forgot-password" onClick={() => setLog("1")}>
            Return to Login
          </span>
        </div>
      </div>
    );
  } else {
    field = (
      <div className="login-modal-content">
        <div className="login-modal-body">
          <form>
            <div className="form-section">
              <label htmlFor="inputEmail1" className="form-label">
                Email
              </label>
              <input
                type="text"
                className="form-input"
                id="inputEmail1"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="form-section">
              <label htmlFor="inputPassword1" className="form-label">
                Password
              </label>
              <input
                type="password"
                className="form-input"
                id="inputPassword1"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button
              variant="contained"
              color="primary"
              type="submit"
              className="form-button"
              onClick={(e) => handleLogin(e)}
            >
              Log In
            </Button>
          </form>
        </div>
        <div className="login-modal-footer">
          <div className="forgot-password" onClick={() => setLog("2")}>
            Register for an account
          </div>
          <div className="forgot-password" onClick={() => setLog("3")}>
            Recover lost password
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {!isLoginModalOpen && isLoggedIn ? (
        <>
          <Tooltip title="Account tools" arrow>
            <IconButton
              onClick={(e) => setAnchorEl(e.currentTarget)}
              style={{ padding: "0" }}
            >
              <Avatar alt="Profile" sx={{ width: 30, height: 30, margin: 0 }} />
            </IconButton>
          </Tooltip>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
          >
            <MenuItem onClick={() => setAnchorEl(null)}>
              <Link
                to={`/profilesettings/${userId2}`}
                className="profile-links"
              >
                Account
              </Link>
            </MenuItem>
            <MenuItem onClick={() => setAnchorEl(null)}>
              <Link
                className="profile-links"
                to={`/favorites`}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                Favorites
              </Link>
            </MenuItem>
            <MenuItem onClick={() => setAnchorEl(null)}>
              <Link
                className="profile-links"
                to={`/profile/${userId2}`}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                Profile
              </Link>
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <p className="profile-links">Log out</p>
            </MenuItem>
          </Menu>
        </>
      ) : (
        <button
          className="login-button-resilio"
          onClick={() => {
            actions.openLoginModal();
            actions.closeModal();
            setLayout("fullscreen-sidebar");
          }}
        >
          Log in
        </button>
      )}
      {isLoginModalOpen && (
        <>
          <div
            className="resilio-overlay"
            onClick={() => {
              actions.closeLoginModal();
              setLog("1");
              document.body.classList.remove("modal-open");
            }}
          ></div>
          <div className="login-div">{field}</div>
        </>
      )}
    </>
  );
};

export default Login;
