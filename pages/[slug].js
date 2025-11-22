"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Nav from "@/components/Nav";
import getArticleContent from "@/lib/getArticleContent";

export default function BlogPost() {
  const pathname = usePathname();
  const [article, setArticle] = useState({
    title: "",
    body: "",
  });

  useEffect(() => {
    if (!pathname) return;

    const remoteUrl = new URL(pathname, "https://webdelmaestro.com").toString();
    console.log("URL que mando al back:", remoteUrl);

    getArticleContent(remoteUrl)
      .then((data) => {
        setArticle(data);
      })
      .catch((err) => {
        console.error("Error en getArticleContent:", err);
      });
  }, [pathname]);

  return (
    <div>
      <Nav />
      <div className="container">
        <h1>{article.title}</h1>
        <article className="container" dangerouslySetInnerHTML={{ __html: article.body || "" }} />
      </div>
    </div>
  );
}
