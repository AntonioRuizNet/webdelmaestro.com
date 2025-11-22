import "@/styles/globals.css";
//import { SessionProvider } from "next-auth/react";
import { Provider } from "react-redux";
import { store } from "@/store";
//import { brand } from "@/styles/fonts";

export default function App({ Component, pageProps: { session, ...pageProps } }) {
  return (
    <Provider store={store}>
      <div>
        <Component {...pageProps} />
      </div>
    </Provider>
  );
}

/*<SessionProvider session={session}>
      <Provider store={store}>
        <div className={`${brand.className}`}>
          <Component {...pageProps} />
        </div>
      </Provider>
    </SessionProvider>*/
