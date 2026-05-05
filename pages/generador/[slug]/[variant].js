import Nav from "@/components/Nav";
import GeneratorLayout from "@/components/Generadores/GeneratorLayout/GeneratorLayout";
import MathWorksheetGenerator from "@/components/Generadores/FichasMatematicas/MathWorksheetGenerator";
import PrintableTraceGenerator from "@/components/Generadores/PrintableListGenerator/PrintableTraceGenerator";
import PrintableCopyGenerator from "@/components/Generadores/PrintableListGenerator/PrintableCopyGenerator";
import InteractiveMultiplicationPractice from "@/components/Generadores/InteractiveMultiplicationPractice/InteractiveMultiplicationPractice";
import GuessWordGame from "@/components/Generadores/GuessWordGame/GuessWordGame";
import PlaceholderVariant from "@/components/Generadores/PlaceholderVariant/PlaceholderVariant";
import { getGeneratorBySlug, getVariantBySlug } from "@/data/generadores";

function renderVariant(slug, variantSlug, variantTitle) {
  if (slug === "fichas-matematicas" && ["sumas", "restas", "multiplicaciones"].includes(variantSlug)) {
    return <MathWorksheetGenerator operationType={variantSlug} />;
  }

  if (slug === "caligrafia" && ["trazos"].includes(variantSlug)) {
    return <PrintableTraceGenerator type={slug} variantSlug={variantSlug} variantTitle={variantTitle} />;
  }

  if (slug === "caligrafia" && ["copiados"].includes(variantSlug)) {
    return <PrintableCopyGenerator type={slug} variantSlug={variantSlug} variantTitle={variantTitle} />;
  }

  if (slug === "multiplicaciones") {
    return <InteractiveMultiplicationPractice variantSlug={variantSlug} />;
  }

  if (slug === "adivina-palabra") {
    return <GuessWordGame variantSlug={variantSlug} />;
  }

  return <PlaceholderVariant title={variantTitle || "Variante no encontrada"} />;
}

export default function GeneratorVariantPage({ slug, variantSlug }) {
  const generator = getGeneratorBySlug(slug);
  const variant = getVariantBySlug(generator, variantSlug);

  return (
    <>
      <Nav />
      <GeneratorLayout slug={slug} variantSlug={variantSlug}>
        {renderVariant(slug, variantSlug, variant?.title)}
      </GeneratorLayout>
    </>
  );
}

export async function getServerSideProps({ params }) {
  return {
    props: {
      slug: params.slug,
      variantSlug: params.variant,
    },
  };
}
