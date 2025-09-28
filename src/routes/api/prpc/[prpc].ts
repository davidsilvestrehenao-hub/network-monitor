import { getAppContext, initializeContainer } from "~/lib/container/container";

export async function GET({ params, request }: { params: { prpc: string }, request: Request }) {
  try {
    console.log("PRPC GET handler called for:", params.prpc);
    await initializeContainer();
    const ctx = await getAppContext();
    
    if (!ctx.services.monitor) {
      throw new Error("Monitor service not available");
    }
    
    if (params.prpc === "getTargets") {
      const targets = await ctx.services.monitor.getTargets("anonymous");
      return new Response(JSON.stringify(targets), {
        headers: { "Content-Type": "application/json" }
      });
    }
    
    if (params.prpc === "targets.get") {
      const url = new URL(request.url);
      const id = url.searchParams.get("id");
      if (!id) {
        return new Response(JSON.stringify({ error: "Target ID is required" }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }
      const target = await ctx.services.monitor.getTarget(id);
      return new Response(JSON.stringify(target), {
        headers: { "Content-Type": "application/json" }
      });
    }
    
    if (params.prpc === "targets.getResults") {
      const url = new URL(request.url);
      const targetId = url.searchParams.get("targetId");
      const limit = url.searchParams.get("limit");
      
      if (!targetId) {
        return new Response(JSON.stringify({ error: "Target ID is required" }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }
      
      const results = await ctx.services.monitor.getTargetResults(
        targetId, 
        limit ? parseInt(limit) : undefined
      );
      
      return new Response(JSON.stringify(results), {
        headers: { "Content-Type": "application/json" }
      });
    }
    
    if (params.prpc === "targets.getActive") {
      const activeTargets = await ctx.services.monitor.getActiveTargets();
      return new Response(JSON.stringify(activeTargets), {
        headers: { "Content-Type": "application/json" }
      });
    }
    
    return new Response(JSON.stringify({ error: "Unknown endpoint" }), {
      status: 404,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Error in PRPC GET handler:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : String(error)
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}

export async function POST({ params, request }: { params: { prpc: string }, request: Request }) {
  try {
    console.log("PRPC POST handler called for:", params.prpc);
    await initializeContainer();
    const ctx = await getAppContext();
    
    if (!ctx.services.monitor) {
      throw new Error("Monitor service not available");
    }
    
    if (params.prpc === "createTarget") {
      const body = await request.json();
      const { name, address } = body;
      
      if (!name || !address) {
        return new Response(JSON.stringify({ 
          error: "Name and address are required" 
        }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }
      
      const target = await ctx.services.monitor.createTarget({
        name,
        address,
        ownerId: "anonymous",
      });
      
      return new Response(JSON.stringify(target), {
        headers: { "Content-Type": "application/json" }
      });
    }
    
    if (params.prpc === "targets.update") {
      const body = await request.json();
      const { id, ...updateData } = body;
      
      if (!id) {
        return new Response(JSON.stringify({ 
          error: "Target ID is required" 
        }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }
      
      const target = await ctx.services.monitor.updateTarget(id, updateData);
      
      return new Response(JSON.stringify(target), {
        headers: { "Content-Type": "application/json" }
      });
    }
    
    if (params.prpc === "targets.delete") {
      const body = await request.json();
      const { id } = body;
      
      if (!id) {
        return new Response(JSON.stringify({ 
          error: "Target ID is required" 
        }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }
      
      await ctx.services.monitor.deleteTarget(id);
      
      return new Response(JSON.stringify({ success: true }), {
        headers: { "Content-Type": "application/json" }
      });
    }
    
    return new Response(JSON.stringify({ error: "Unknown endpoint" }), {
      status: 404,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Error in PRPC POST handler:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : String(error)
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
