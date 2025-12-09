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
      {/* Google Analytics: SIEMPRE fuera de <Head> */}
      <Script src="https://www.googletagmanager.com/gtag/js?id=G-J0M0G5CRTG" strategy="afterInteractive" />

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

      <Head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#46a28d" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className={brand.className}>
        <Component {...pageProps} />
      </div>
    </Provider>
  );
}
