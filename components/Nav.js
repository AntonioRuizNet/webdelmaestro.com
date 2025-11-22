import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function Nav() {
  const menu = [
    { name: "NEAE", href: "/" },
    { name: "INFANTIL", href: "/" },
    { name: "1º y 2º CURSO", href: "/" },
    { name: "3º y 4º CURSO", href: "/" },
    { name: "5º y 6º CURSO", href: "/" },
    { name: "ED.ARTÍSTICA", href: "/" },
    { name: "RECURSOS", href: "/" },
    { name: "TABLAS DE MULTIPLICAR", href: "https://app.webdelmaestro.com/" },
  ];
  return (
    <nav>
      <Link href="/">web del maestro</Link>
      <>
        {menu.map((link, indexLink) => (
          <Link style={indexLink === 0 ? { marginLeft: "auto" } : {}} key={indexLink} href={link.href}>
            {link.name}
          </Link>
        ))}
      </>
    </nav>
  );
}
