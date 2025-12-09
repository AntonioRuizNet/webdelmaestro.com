// pages/_app.js
import "@/styles/globals.css";
import { Provider } from "react-redux";
import { store } from "@/store";
import { brand } from "@/styles/fonts";
import Head from "next/head";
import Script from "next/script";

export default function App({ Component, pageProps: { session, ...pageProps } }) {
  return (
    <Provider store={store}>
      <Head>
        <link rel="manifest" href="/manifest.json" />

        {/* Google Analytics */}
        <Script strategy="afterInteractive" src="https://www.googletagmanager.com/gtag/js?id=G-J0M0G5CRTG" />

        <Script id="gtag-init" strategy="afterInteractive">
          {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-J0M0G5CRTG', {
            page_path: window.location.pathname,
          });
        `}
        </Script>

        <meta name="theme-color" content="#46a28d" />

        {/* Favicon por compatibilidad */}
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={`${brand.className}`}>
        <Component {...pageProps} />
      </div>
    </Provider>
  );
}
