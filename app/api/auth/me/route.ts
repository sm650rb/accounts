import { getCurrentMember } from '@/lib/auth';
import { errorResponse, jsonResponse } from '@/lib/http';

export async function GET() {
  const member = await getCurrentMember();
  if (!member) {
    return errorResponse('Not authenticated', 401);
  }

  return jsonResponse({ member });
}
