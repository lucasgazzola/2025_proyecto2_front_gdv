export const API_ENDPOINTS = {
  auth: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    FORGOT_PASSWORD: "/auth/forgot-password",
    RESET_PASSWORD: (email: string, tokenPass: string) =>
      `/auth/reset-password?email=${encodeURIComponent(
        email
      )}&tokenPass=${encodeURIComponent(tokenPass)}`,
    LOGOUT: "/auth/logout",
    VERIFY_ACCOUNT: "/auth/verify-account",
    RESEND_VERIFICATION: "/auth/resend-verification",
    CHANGE_DATA: "/auth/change-data",
    REGENERATE_OTP: (email: string) =>
      `/auth/regenerate-otp?email=${encodeURIComponent(email)}`,
    VALIDATE_TOKEN: "/auth/validate-token",
    CHANGE_PASSWORD: "/auth/change-password",
  },

  brands: {
    GET_ALL: "/brands",
    GET_BRAND: (id: string) => `/brands/${id}`,
    CREATE_BRAND: "/brands",
    UPDATE_BRAND: (id: string) => `/brands/${id}`,
    DELETE_BRAND: (id: string) => `/brands/${id}`,
  },

  providers: {
    GET_ALL: "/providers",
    GET_PROVIDER: (id: string) => `/providers/${id}`,
  },

  categories: {
    GET_ALL: "/categories",
    GET_CATEGORY: (id: string) => `/categories/${id}`,
  },

  users: {
    GET_ALL: "/users",
    GET_PROFILE: "/users/profile",
    GET_USER_BY_EMAIL: (email: string) => `/users/${encodeURIComponent(email)}`,
    UPDATE_USER_BY_EMAIL: (email: string) => `/users/${email}`,
    DELETE_USER_BY_EMAIL: (email: string) => `/users/${email}`,
    UPDATE_PROFILE: "/users/profile",
  },

  logs: {
    GET_ALL_BY_LEVEL_PAGINATED: (level: string, params: string) =>
      `/log/getLogsByLevel/${level}?${params}`,
    GET_ALL_PAGINATED: (params: string) => `/log/getAllLogs?${params}`,
    GET_ALL_BY_USER_PAGINATED: (params: string) =>
      `/log/getLogsByUser?${params}`,
    GET_ALL_BY_LEVEL_BY_USER_PAGINATED: (level: string, params: string) =>
      `/log/getLogsByUser/${level}?${params}`,
  },

  products: {
    GET_ALL: "/product/",
    GET_PRODUCT: (id: string) => `/product/${id}`,
    ADD_PRODUCT: "/product/add",
    UPDATE_PRODUCT: "/product/update",
    // CREATE_PRODUCT: "/product/createProduct",
    // UPDATE_PRODUCT: "/product/updateProduct",
    DELETE_PRODUCT: (id: string) => `/product/${id}`,
  },
};

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

type EndpointValue = string | ((...args: any[]) => string) | EndpointsObject;
type EndpointsObject = { [key: string]: EndpointValue };

function wrapEndpoints<T extends EndpointsObject>(obj: T): T {
  return new Proxy(obj, {
    get(target, prop, receiver) {
      const value = Reflect.get(target, prop, receiver);
      if (typeof value === "string") {
        return `${API_BASE_URL}${value}`;
      }
      if (typeof value === "function") {
        // Devuelve una función que acepta cualquier argumento
        return (...args: any[]) => `${API_BASE_URL}${value(...args)}`;
      }
      if (typeof value === "object" && value !== null) {
        return wrapEndpoints(value);
      }
      return value;
    },
  }) as T;
}

export const apiEndpoints = wrapEndpoints(API_ENDPOINTS);
