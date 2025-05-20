import { jwtDecode } from "jwt-decode";

export const isTokenExpired = (token) => {
    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000; // in seconds
      return decoded.exp < currentTime;
    } catch (err) {
      return true; // if token can't be decoded, treat it as expired
    }
};

export default isTokenExpired; 

