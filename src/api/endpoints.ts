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
    GET_ALL: "/marcas",
    GET_BRAND: (id: string) => `/marcas/${id}`,
    CREATE_BRAND: "/marcas",
    UPDATE_BRAND: (id: string) => `/marcas/${id}`,
    DELETE_BRAND: (id: string) => `/marcas/${id}`,
  },

  providers: {
    GET_ALL: "/proveedores",
    GET_PROVIDER: (id: string) => `/proveedores/${id}`,
    CREATE_PROVIDER: "/proveedores",
    UPDATE_PROVIDER: (id: string) => `/proveedores/${id}`,
    DELETE_PROVIDER: (id: string) => `/proveedores/${id}`,
  },

  categories: {
    GET_ALL: "/categorias",
    GET_CATEGORY: (id: string) => `/categorias/${id}`,
    CREATE_CATEGORY: "/categorias",
    UPDATE_CATEGORY: (id: string) => `/categorias/${id}`,
    DELETE_CATEGORY: (id: string) => `/categorias/${id}`,
  },

  users: {
    GET_ALL: "/usuarios",
    GET_PROFILE: "/usuarios/profile",
    GET_USER_BY_EMAIL: (email: string) =>
      `/usuarios/${encodeURIComponent(email)}`,
    UPDATE_USER_BY_EMAIL: (email: string) => `/usuarios/${email}`,
    DELETE_USER_BY_EMAIL: (email: string) => `/usuarios/${email}`,
    UPDATE_PROFILE: "/usuarios/profile",
  },

  locations: {
    GET_PROVINCES: "/locations/provinces",
    GET_CITIES: (province?: string) =>
      province
        ? `/locations/cities?province=${encodeURIComponent(province)}`
        : `/locations/cities`,
  },

  logs: {
    GET_ALL_LOGS: "/logs",
  },

  products: {
    GET_ALL: "/productos",
    GET_PRODUCT: (id: string) => `/productos/${id}`,
    ADD_PRODUCT: "/productos/add",
    UPDATE_PRODUCT: "/productos/update",
    // CREATE_PRODUCT: "/productos/createProduct",
    // UPDATE_PRODUCT: "/productos/updateProduct",
    DELETE_PRODUCT: (id: string) => `/productos/${id}`,
  },
  // Customers
  customers: {
    GET_ALL: "/clientes",
    CREATE_CUSTOMER: "/clientes",
    GET_BY_ID: (id: string) => `/clientes/${encodeURIComponent(id)}`,
    UPDATE_BY_ID: (id: string) => `/clientes/${encodeURIComponent(id)}`,
  },
  //Facturas
  invoices: {
    GET_ALL: "/facturas",
    GET_INVOICE: (id: string) => `/facturas/${id}`,
    CREATE_INVOICE: "/facturas",
    DELETE_INVOICE: (id: string) => `/facturas/${id}`,
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
