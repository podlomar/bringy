import { RequestBody } from "./body.js";

interface FetchParams {
  readonly url: URL;
  readonly method: string;
  readonly headers: Record<string, string>;
  readonly body: RequestBody | null;
}

export const triggerFetch = async (fetchParams: FetchParams): Promise<unknown> => {
  const { url, method, headers, body } = fetchParams;
  const response = await fetch(url, {
    method,
    headers,
    body: body?.init ?? null,
  });
  return response.json();
}

export class Brings<TData> {
  private readonly fetchParams: FetchParams;

  public constructor(fetchParams: FetchParams) {
    this.fetchParams = fetchParams;
  }

  public async trigger(): Promise<TData> {
    const data = await triggerFetch(this.fetchParams);
    return data as TData;
  }
}

export class RequestBuilder {
  private fetchParams: FetchParams;

  private constructor(fetchParams: FetchParams) {
    this.fetchParams = fetchParams;
  }

  public static create(url: string): RequestBuilder {
    return new RequestBuilder({
      url: new URL(url),
      method: 'GET',
      headers: {},
      body: null,
    });
  }

  public method(method: string): RequestBuilder {
    return new RequestBuilder({ ...this.fetchParams, method });
  }

  public body(requestBody: RequestBody): RequestBuilder {
    return new RequestBuilder({ ...this.fetchParams, body: requestBody });
  }

  public header(name: string, value: string): RequestBuilder {
    return new RequestBuilder({
      ...this.fetchParams,
      headers: { ...this.fetchParams.headers, [name]: value },
    });
  }

  public param(name: string, value: string): RequestBuilder {
    const newUrl = new URL(this.fetchParams.url.toString());
    newUrl.searchParams.append(name, value);
    return new RequestBuilder({ ...this.fetchParams, url: newUrl });
  }

  public async trigger(): Promise<unknown> {
    return triggerFetch(this.fetchParams);
  }
}

export class ResponseBuilder {
  private fetchParams: FetchParams;

  public constructor(fetchParams: FetchParams) {
    this.fetchParams = fetchParams;
  }

  public receiveJson(): Brings<unknown> {
    return new Brings<unknown>(this.fetchParams);
  }

  public trigger(): Promise<unknown> {
    return triggerFetch(this.fetchParams);
  }
}

export const brings = (url: string): RequestBuilder => RequestBuilder.create(url);
