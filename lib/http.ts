import { NextResponse } from 'next/server';

export function jsonResponse(payload: unknown, status = 200) {
  return NextResponse.json(payload, { status });
}

export function errorResponse(message: string, status: number) {
  return jsonResponse({ error: message }, status);
}

export async function readJson<T extends Record<string, unknown>>(
  request: Request,
): Promise<T> {
  try {
    const data = await request.json();
    return (typeof data === 'object' && data !== null ? data : {}) as T;
  } catch {
    return {} as T;
  }
}

export function isValidEmail(email: string): boolean {
  return email !== '' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
