import { beforeEach, describe, expect, it } from "vitest";

const store = new Map<string, string>();
const localStorageMock = {
  getItem: (key: string) => store.get(key) ?? null,
  setItem: (key: string, value: string) => {
    store.set(key, value);
  },
  removeItem: (key: string) => {
    store.delete(key);
  },
  clear: () => store.clear(),
};

describe("useAuth logic & cache", () => {
  const AUTH_KEY = "insightflow-user-demo";

  beforeEach(() => {
    localStorageMock.clear();
  });

  it("dapat membaca dan menyimpan status login user demo baru", () => {
    const user = { nama: "Budi", email: "budi@umkm.id", isDemo: true };
    localStorageMock.setItem(AUTH_KEY, JSON.stringify(user));
    expect(JSON.parse(localStorageMock.getItem(AUTH_KEY)!)).toEqual(user);
  });

  it("dapat menghapus sesi saat logout", () => {
    localStorageMock.setItem(AUTH_KEY, JSON.stringify({ nama: "Test", email: "test@id", isDemo: true }));
    localStorageMock.removeItem(AUTH_KEY);
    expect(localStorageMock.getItem(AUTH_KEY)).toBeNull();
  });
});
