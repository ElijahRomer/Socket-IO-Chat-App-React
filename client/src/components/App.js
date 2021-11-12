import React from 'react';
import Login from './Login';
import useLocalStorage from '../hooks/useLocalStorage';
import Dashboard from './Dashboard';
import { ContactsProvider } from '../contexts/ContactsProvider';
import { ConversationsProvider } from '../contexts/ConversationsProvider';
import { SocketProvider } from '../contexts/SocketProvider';

function App() {
  // you can rename variables with array destructuring because unlike an object, they dont have fixed names, just index positions. Thus, in array destructuring, the array values are assigned to the variable names passed to the desctructuring in the same order as they appear in the value array. This is why you can make custom names for the useState hook destructured variables in the first place.
  const [id, setId] = useLocalStorage('id');

  const dashboard = (
    <SocketProvider id={id}>
      <ContactsProvider>
        {/* including id as a prop so we can access the currently logged in user to provide as sender param for sendMessage function. */}
        <ConversationsProvider id={id}>
          <Dashboard id={id} />
        </ConversationsProvider>
      </ContactsProvider>
    </SocketProvider>
  );

  return id ? dashboard : <Login onIdSubmit={setId} />;
}

export default App;
