// src/components/PrivateRoute.tsx
import { Route, Redirect } from "react-router-dom";

const isTokenValid = () => {
  const token = localStorage.getItem("accessToken");
  if (!token) return false;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const exp = payload.exp * 1000;
    return Date.now() < exp;
  } catch {
    return false;
  }
};

const PrivateRoute = ({ component: Component, ...rest }: any) => (
  <Route
    {...rest}
    render={(props) =>
      isTokenValid() ? (
        <Component {...props} />
      ) : (
        (() => {
          localStorage.clear();
          return <Redirect to="/" />;
        })()
      )
    }
  />
);

export default PrivateRoute;
