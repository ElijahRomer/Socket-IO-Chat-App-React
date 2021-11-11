import React, { useContext, useState } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { useContactsContext } from './ContactsProvider';

const ConversationsContext = React.createContext();

// custom reactHook
export function useConversationsContext() {
  // the export is basically a closure that provides access to the ContactsContext, returning the useContext method passed with the ContactsContext object.
  // useContext essentially reaches up the tree to the nearest context provider for the passed type of context and returns the value of that context. Very similar to state, but on a global level without requiring threading of props through multiple components.
  return useContext(ConversationsContext);
}

// actual functional component
export function ConversationsProvider({ children }) {
  const [conversations, setConversations] = useLocalStorage(
    `conversations`,
    []
  );
  const [selectedConversationIndex, setSelectedConversationIndex] = useState(0);
  const { contacts } = useContactsContext();

  function createConversation(recipients) {
    setConversations((prevConversations) => {
      return [...prevConversations, { recipients, messages: [] }];
    });
  }

  const formattedConversations = conversations.map((conversation, index) => {
    // for each conversation, do the following:
    const recipients = conversation.recipients.map((recipientId) => {
      // for each recipient in a conversation, do the following:
      const contact = contacts.find((contact) => {
        return contact.id === recipientId;
      });
      // if there is a contact, return the contact.name, otherwise if there is not a contact, return the recipientId
      const name = (contact && contact.name) || recipientId;
      return { id: recipientId, name };
    });
    // return T/F depending on if the current iteration index# matches the selectedConversationIndex state
    const selected = index === selectedConversationIndex;

    return { ...conversation, recipients, selected };
  });

  const value = {
    conversations: formattedConversations,
    selectedConversation: formattedConversations.selectConversationIndex,
    selectConversationIndex: setSelectedConversationIndex,
    createConversation,
  };

  return (
    <ConversationsContext.Provider value={value}>
      {children}
    </ConversationsContext.Provider>
  );
}
