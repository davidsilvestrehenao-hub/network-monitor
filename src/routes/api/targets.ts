import { getAppContext, initializeContainer } from "~/lib/container/container";

export async function GET() {
  try {
    await initializeContainer();
    const ctx = await getAppContext();

    if (!ctx.services.monitor) {
      throw new Error("Monitor service not available");
    }

    const targets = await ctx.services.monitor.getTargets("anonymous");

    return new Response(JSON.stringify(targets), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Get targets failed:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

export async function POST({ request }: { request: Request }) {
  try {
    await initializeContainer();
    const ctx = await getAppContext();

    if (!ctx.services.monitor) {
      throw new Error("Monitor service not available");
    }

    const body = await request.json();
    const { name, address } = body;

    if (!name || !address) {
      return new Response(
        JSON.stringify({
          error: "Name and address are required",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const target = await ctx.services.monitor.createTarget({
      name,
      address,
      ownerId: "anonymous",
    });

    return new Response(JSON.stringify(target), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Create target failed:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
