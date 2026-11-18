export type RequestContext = {
  requestId: string;
};

export type RequestWithContext = {
  method?: string;
  originalUrl?: string;
  requestId?: string;
  url?: string;
};

export type ResponseWithContext = {
  setHeader(name: string, value: string): void;
  statusCode: number;
};
