import axios from "axios";

const instance = axios.create({
  baseURL: "/ws/",
  withCredentials: true,
  crossdomain: true,
  headers: {
    "Accept": "application/json",
    "Content-Type": "application/json"
  }
});

export default instance
