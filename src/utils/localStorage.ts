export const clearLoggedUserDataFromLocalStorage = () => {
  // TODO: Refactorizar esto para hacerlod de una mejor manera
  // Elimina todos los elementos del localStorage excepto configuraciones específicas
  const language = localStorage.getItem("language");
  const isSidebarOpen = localStorage.getItem("isSidebarOpen");

  localStorage.clear();
  if (language) {
    localStorage.setItem("language", language);
  }
  if (isSidebarOpen) {
    localStorage.setItem("isSidebarOpen", isSidebarOpen);
  }
};

export const getStoredAccessToken = (): {
  accessToken: string | null;
} => {
  return {
    accessToken: localStorage.getItem("access_token"),
  };
};

export const storeNewAccessToken = (accessToken: string): void => {
  localStorage.setItem("access_token", accessToken);
};

type LoggedInUserData = {
  email: string;
  name: string;
  lastname: string;
  role: string;
};

export const storeLoggedUserData = ({
  email,
  name,
  lastname,
  role,
}: LoggedInUserData): void => {
  localStorage.setItem("email", email);
  localStorage.setItem("name", name);
  localStorage.setItem("lastname", lastname);
  localStorage.setItem("role", role);
};

export const removeLoggedUserData = (): void => {
  localStorage.removeItem("email");
  localStorage.removeItem("name");
  localStorage.removeItem("lastname");
  localStorage.removeItem("role");
  localStorage.removeItem("access_token");
};
