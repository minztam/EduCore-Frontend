import axiosClient from "./axiosClient";

export const login = async (email, password) => {
  try {
    const res = await axiosClient.post("/users/login", {
      email,
      password,
    });

    const token = res.data.data.token;

    localStorage.setItem("token", token);

    return res.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};