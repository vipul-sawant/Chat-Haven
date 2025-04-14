import socket from "./socket";

const updateSocketAuth = (accessToken) => {
    socket.auth = {
      token: accessToken,
    };
  };

export default updateSocketAuth;