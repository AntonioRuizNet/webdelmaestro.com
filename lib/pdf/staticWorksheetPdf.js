import { createWorksheetPdf } from "@/lib/pdf/worksheetPdf";
import { ACTIVITY_RENDERERS, renderTextLines } from "@/lib/pdf/activities";

function getWorksheetActivities(worksheet) {
  return Array.isArray(worksheet?.activities) ? worksheet.activities : [];
}

function renderActivity(activity, contentLines, helpers, y, activityNumber) {
  if (!activity?.type) {
    return y;
  }

  const renderer = ACTIVITY_RENDERERS[activity.type];

  if (!renderer) {
    return renderTextLines(
      {
        title: `Actividad no reconocida: ${activity.type}`,
        lines: ["Revisa el campo type de esta actividad en el JSON del tema."],
      },
      contentLines,
      helpers,
      y,
      activityNumber,
    );
  }

  return renderer(activity, contentLines, helpers, y, activityNumber);
}

export async function createStaticWorksheetPdf(worksheet) {
  const activities = getWorksheetActivities(worksheet);

  return createWorksheetPdf({
    title: worksheet.title,
    instruction: worksheet.description || "Completa la ficha con buena letra.",
    renderContent(contentLines, helpers) {
      let y = helpers.contentStartY;

      if (!activities.length) {
        renderTextLines(
          {
            title: "Ficha sin actividades",
            lines: ["Añade actividades en el array activities del JSON de este tema."],
          },
          contentLines,
          helpers,
          y,
          1,
        );
        return;
      }

      activities.forEach((activity, index) => {
        y = renderActivity(activity, contentLines, helpers, y, index + 1);
      });
    },
  });
}
