import Nav from "@/components/Nav";
import Sidebar from "@/components/Sidebar";

export default function ProtectedLayout({ children }) {
  return (
    <div>
      <Nav />
      <div className="container">
        <div className="protected-layout">
          <main className="protected-content">
            {children}
          </main>
          <aside className="protected-sidebar">
            <Sidebar />
          </aside>
        </div>
      </div>
    </div>
  );
}
