import { createContext, useState, useEffect, FC } from "react";
import jwt_decode from "jwt-decode";
import { useRouter } from "next/router";
import { Token } from "@/types/Token";

import { getCookie, setCookie, deleteCookie } from "cookies-next";
import { fetchData } from "@/utils/fetchData";
import { MyUser } from "@/types/MyUser";

type contextType = {
  myUser: MyUser | undefined;
  token: Token | undefined;
  login: (inputData: object) => Promise<object>;
  logout: () => Promise<void>;
  register: (inputData: object) => Promise<object>;
};

const initialValue = {
  myUser: undefined,
  token: undefined,
  login: async () => { return {} },
  logout: async () => {},
  register: async () => { return {} },
};

export const AuthContext = createContext<contextType>(initialValue);

export const AuthProvider: FC<any> = ({ children }) => {
  const router = useRouter();

  const [myUser, setMyUser] = useState<MyUser>();
  const [token, setToken] = useState<Token>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const tokenData = getCookie("token");
    if (typeof tokenData == "string") {
      setToken(JSON.parse(tokenData));
      setMyUser(jwt_decode(tokenData));
    }
  }, []);

  async function login(inputData: object) {
    let errObj: object = {};

    await fetchData("token/", "POST", inputData, undefined)
      .then((data) => {
        setToken(data);
        setMyUser(jwt_decode(data.access));
        setCookie("token", JSON.stringify(data));
        router.push("/");
      })
      .catch((err) => (errObj = err.data));

    return errObj;
  }

  async function register(inputData: object) {
    let errObj: object = {};

    await fetchData("users/", "POST", inputData, undefined)
      .then((data) => router.push("/login"))
      .catch((err) => (errObj = err.data));

    return errObj;
  }

  async function logout() {
    setToken(undefined);
    setMyUser(undefined);
    deleteCookie("token");
    router.push("/login");
  }

  async function updateToken() {
    if (!token) return;

    fetchData("token/refresh/", "POST", { refresh: token.refresh }, undefined)
      .then((data) => {
        setToken(data);
        setMyUser(jwt_decode(data.access));
        setCookie("token", JSON.stringify(data));
      })
      .catch((err) => {
        console.log(err);
        logout();
      });
  }

  useEffect(() => {
    if (loading) {
      updateToken();
      setLoading(false);
    }

    const fourMinutes = 4 * 60 * 1000;
    const interval = setInterval(() => {
      if (token) {
        updateToken();
      }
    }, fourMinutes);

    return () => clearInterval(interval);
  }, [token, loading]);

  const contextData = {
    myUser: myUser,
    token: token,
    login: login,
    logout: logout,
    register: register,
  };

  return (
    <AuthContext.Provider value={contextData}>
      {loading ? null : children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
