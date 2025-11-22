import { getSession } from "next-auth/react";

/**
 * Higher-order getServerSideProps that enforces authentication.
 * Usage:
 * export const getServerSideProps = withAuthGSSP(async (ctx, session) => {
 *   // fetch data here using session.user.id, etc.
 *   return { props: {} };
 * });
 */
export function withAuthGSSP(gssp) {
  return async function (ctx) {
    const session = await getSession(ctx);
    if (!session) {
      const callbackUrl = encodeURIComponent(ctx.resolvedUrl || "/dashboard");
      return {
        redirect: { destination: `/login?callbackUrl=${callbackUrl}`, permanent: false }
      };
    }
    if (typeof gssp === "function") {
      return await gssp(ctx, session);
    }
    return { props: {} };
  };
}
