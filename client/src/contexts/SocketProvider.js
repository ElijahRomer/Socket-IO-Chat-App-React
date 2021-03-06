import React, { useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';

const SocketContext = React.createContext();

export function useSocketContext() {
  return useContext(SocketContext);
}

export function SocketProvider({ id, children }) {
  const [socket, setSocket] = useState();

  useEffect(() => {
    const newSocket = io(`http://localhost:5000`, { query: { id } });
    setSocket(newSocket);

    // must close the prev. socket if we start a new one, because otherwise we will get duplicated messages and slow down server.
    return () => newSocket.close();
  }, [id]);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
}
