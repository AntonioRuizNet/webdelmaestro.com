// pages/404.js
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function Custom404() {
  const router = useRouter();

  useEffect(() => {
    if (router?.asPath) {
      const term = router.asPath.replace("/", "");
      router.replace(`/buscar?q=${encodeURIComponent(term)}`);
    }
  }, [router]);

  return null;
}
