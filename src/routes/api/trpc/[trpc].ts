// tRPC route handler - placeholder file
// This project uses PRPC instead of tRPC, but this file is needed for compatibility

export const GET = async () => {
  return new Response("tRPC not implemented - using PRPC instead", {
    status: 501,
  });
};

export const POST = GET;
