import Nav from "@/components/Nav";
import GeneratorLayout from "@/components/Generadores/GeneratorLayout/GeneratorLayout";
import PlaceholderVariant from "@/components/Generadores/PlaceholderVariant/PlaceholderVariant";
import { getGeneratorBySlug } from "@/data/generadores";

export default function GeneratorPage({ slug }) {
  const generator = getGeneratorBySlug(slug);

  return (
    <>
      <Nav />
      <GeneratorLayout slug={slug}>
        <PlaceholderVariant title={generator ? "Selecciona una variante para empezar" : "Generador no encontrado"} />
      </GeneratorLayout>
    </>
  );
}

export async function getServerSideProps({ params }) {
  return {
    props: {
      slug: params.slug,
    },
  };
}
