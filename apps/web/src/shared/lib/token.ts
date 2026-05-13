const KEY = 'accessToken';

export const token = {
  get: (): string | null => sessionStorage.getItem(KEY),
  set: (value: string): void => sessionStorage.setItem(KEY, value),
  clear: (): void => sessionStorage.removeItem(KEY),
};
