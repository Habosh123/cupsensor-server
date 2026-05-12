export function GET() {
  return new Response('CupSensor API works', {
    status: 200
  });
}

export async function POST(request) {
  const body = await request.json();

  return Response.json({
    ok: true,
    received: body
  });
}