type DashboardService = { get(): Promise<unknown> };

export function createDashboardController(service: DashboardService) {
  return { get: () => service.get() };
}
