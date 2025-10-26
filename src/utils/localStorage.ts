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
    accessToken: localStorage.getItem("accessToken"),
  };
};

export const storeNewAccessToken = (accessToken: string): void => {
  localStorage.setItem("accessToken", accessToken);
};

type LoggedInUserData = {
  email: string;
  firstName: string;
  lastName: string;
  role: string;
};

export const storeLoggedUserData = ({
  email,
  firstName,
  lastName,
  role,
}: LoggedInUserData): void => {
  localStorage.setItem("email", email);
  localStorage.setItem("firstName", firstName);
  localStorage.setItem("lastName", lastName);
  localStorage.setItem("role", role);
};

export const removeLoggedUserData = (): void => {
  localStorage.removeItem("email");
  localStorage.removeItem("name");
  localStorage.removeItem("lastname");
  localStorage.removeItem("role");
  localStorage.removeItem("accessToken");
};
