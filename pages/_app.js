// pages/_app.js
import "@/styles/globals.css";
import { Provider } from "react-redux";
import { store } from "@/store";
import { brand } from "@/styles/fonts";
import Head from "next/head";

export default function App({ Component, pageProps: { session, ...pageProps } }) {
  return (
    <Provider store={store}>
      <Head>
        <link rel="manifest" href="/manifest.json" />
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
