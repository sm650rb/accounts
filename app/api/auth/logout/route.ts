import { logoutMember } from '@/lib/session-store';
import { errorResponse, jsonResponse } from '@/lib/http';

export async function POST() {
  try {
    await logoutMember();
    return jsonResponse({ message: 'Signed out' });
  } catch (err) {
    console.error('[logout]', err);
    return errorResponse('Sign out failed', 500);
  }
}
