import NavBar from "@/components/NavBar";
import RouteGuard from "@/components/RouteGuard";
import AuthProvider from "@/contexts/AuthContext";
import StoreProvider from "@/contexts/StoreContext";
import "@/styles/globals.css";
import type { AppProps } from "next/app";

// import Font Awesome CSS
import "@fortawesome/fontawesome-svg-core/styles.css"; 

import { config } from "@fortawesome/fontawesome-svg-core";
// Tell Font Awesome to skip adding the CSS automatically 
// since it's already imported above
config.autoAddCss = false;

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <StoreProvider>
        <NavBar />
        <RouteGuard>
          <Component {...pageProps} />
        </RouteGuard>
      </StoreProvider>
    </AuthProvider>
  );
}
