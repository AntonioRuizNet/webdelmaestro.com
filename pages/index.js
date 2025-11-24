import CardList from "@/components/CardList";
import Nav from "@/components/Nav";

export default function Home() {
  return (
    <div>
      <Nav />
      <main className="container">
        <h1>Últimos posts</h1>
        <CardList
          term="" // opcional
          column="title" // "title" | "slug" | "body" | "excerpt" | "url"
          limit={16}
          random={true}
          exclude={["educacion/"]}
        />
      </main>
    </div>
  );
}
