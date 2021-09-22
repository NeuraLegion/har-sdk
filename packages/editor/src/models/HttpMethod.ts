export enum HttpMethod {
  GET = 'GET',
  PUT = 'PUT',
  POST = 'POST',
  DELETE = 'DELETE',
  OPTIONS = 'OPTIONS',
  HEAD = 'HEAD',
  PATCH = 'PATCH',
  TRACE = 'TRACE'
}

export function isHttpMethod(method: string): boolean {
  return Object.values(HttpMethod).includes(
    method?.toUpperCase() as HttpMethod
  );
}
