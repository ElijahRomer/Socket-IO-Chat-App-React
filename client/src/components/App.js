import React from 'react';
import Login from './Login';
import useLocalStorage from '../hooks/useLocalStorage';
import Dashboard from './Dashboard';
import { ContactsProvider } from '../contexts/ContactsProvider';

function App() {
  // you can rename variables with array destructuring because unlike an object, they dont have fixed names, just index positions. Thus, in array destructuring, the array values are assigned to the variable names passed to the desctructuring in the same order as they appear in the value array. This is why you can make custom names for the useState hook destructured variables in the first place.
  const [id, setId] = useLocalStorage('id');

  const dashboard = (
    <ContactsProvider>
      <Dashboard id={id} />
    </ContactsProvider>
  );

  return id ? dashboard : <Login onIdSubmit={setId} />;
}

export default App;
