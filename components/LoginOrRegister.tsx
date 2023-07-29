import { AuthContext } from "@/contexts/AuthContext";
import React, { useContext, useRef, useState } from "react";

import styles from "./LoginOrRegister.module.css";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

function LoginOrRegister({ type }: { type: "login" | "register" }) {
  const { login, register } = useContext(AuthContext);
  const [errors, setErrors] = useState<object>({});
  const password = useRef<HTMLInputElement>(null);
  const password2 = useRef<HTMLInputElement>(null);

  async function submitHandler(e: any) {
    e.preventDefault();

    let data: any = {
      username: e.target.username.value,
      password: e.target.password.value,
    };

    if (type == "register") {
      data.password2 = e.target.password2.value;
    }

    const func = type == "login" ? login : register;
    const errObj = await func(data);
    setErrors(errObj);
  }

  function toggleVisibility(e: any) {
    let inputType = password.current?.type;
    let targetType = inputType == "text" ? "password" : "text";

    if (password.current) password.current.type = targetType;
    if (password2.current) password2.current.type = targetType;
  }

  return (
    <div className={styles.container}>
      <form className={styles.form} onSubmit={(e) => submitHandler(e)}>
        <h1>{type.toLocaleUpperCase()}</h1>

        <div className={styles.inputForm}>
          <input
            type="text"
            name="username"
            aria-label="username"
            placeholder="username"
          />
        </div>
        <div className={styles.inputForm}>
          <span>
            <FontAwesomeIcon
              onClick={toggleVisibility}
              icon={faEye}
              className={styles.icon}
            />
          </span>
          <input
            type="password"
            name="password"
            aria-label="password"
            placeholder="password"
            ref={password}
          />
        </div>
        {type == "register" && (
          <div className={styles.inputForm}>
            <span>
              <FontAwesomeIcon
                onClick={toggleVisibility}
                icon={faEye}
                className={styles.icon}
              />
            </span>
            <input
              className={styles.inputForm}
              type="password"
              name="password2"
              aria-label="password2"
              placeholder="password again"
              ref={password2}
            />
          </div>
        )}
        <input
          className={styles.submitBtn}
          type="submit"
          value={type.toLocaleUpperCase()}
        />

        {type == "login" ? (
          <p>
            Don&apos;t have an Account?
            <Link href="/register">Sign Up here</Link>
          </p>
        ) : (
          <p>
            Already have an Account?
            <Link href="/login">Sign In here</Link>
          </p>
        )}

        <div className={styles.errList}>
          {Object.entries(errors).map(([key, val], i) => (
            <p key={i}>
              <span>{key}</span>: {val}
            </p>
          ))}
        </div>
      </form>
    </div>
  );
}

export default LoginOrRegister;
