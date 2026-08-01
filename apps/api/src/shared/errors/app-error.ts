export type AppErrorOptions = {
  code: string;
  message: string;
  statusCode: number;
  fieldErrors?: Record<string, string[]>;
};

export class AppError extends Error {
  constructor(readonly options: AppErrorOptions) {
    super(options.message);
    this.name = "AppError";
  }
}
