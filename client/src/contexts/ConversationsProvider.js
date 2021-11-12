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
export function ConversationsProvider({ id, children }) {
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

  // including sender to ensure that this function is flexible enough to take in messages from our server, as well as take in our own messages
  function addMessageToConversation({ recipients, text, sender }) {
    // all we have is an array of recipients- so we need to figure out which conversation to add the message to, OR if we need to create a brand new conversation.
    setConversations((prevConversations) => {
      let madeChange = false;
      const newMessage = { sender, text };

      const newConversations = prevConversations.map((conversation) => {
        // if the recipient arrays are equal, set madeChange to true, and return the conversation but with a new updated messages array, with the newMessage appended to the end..
        if (arrayEquality(conversation.recipients, recipients)) {
          madeChange = true;
          return {
            ...conversation,
            messages: [...conversation.messages, newMessage],
          };
        }
        // if the recipient arrays are NOT equal, just return the conversation unchanged.
        return conversation;
      });

      if (madeChange) {
        // if we modified an existing conversation, just return the newConversation.
        return newConversations;
      } else {
        // if we need to create a new conversation, return a new array with all the previous conversations but with the newly created conversation on the end.
        return [...prevConversations, { recipients, message: [newMessage] }];
      }
    });
  }

  function sendMessage(recipients, text) {
    addMessageToConversation({ recipients, text, sender: id });
  }

  const formattedConversations = conversations.map((conversation, index) => {
    // adds/ sets up the name property for each recipient
    const recipients = conversation.recipients.map((recipientId) => {
      // for each contact (recipient) in a conversation, do the following:
      const contact = contacts.find((contact) => {
        return contact.id === recipientId;
      });
      // if there is a contact, return the contact.name, otherwise if there is not a contact, return the recipientId
      const name = (contact && contact.name) || recipientId;
      return { id: recipientId, name };
    });

    // adds/ sets up the senderName, as well as the fromMe property in each message
    const messages = conversation.messages.map((message) => {
      const contact = contacts.find((contact) => {
        return contact.id === message.sender;
      });
      // if contact, set name equal to the contact name, or default to the sender ID
      const name = (contact && contact.name) || message.sender;

      // if the sender ID matched the logged in users ID, set fromMe variable to true.
      const fromMe = id === message.sender;
      return { ...message, senderName: name, fromMe };
    });

    // return T/F depending on if the current iteration index# matches the selectedConversationIndex state
    const selected = index === selectedConversationIndex;

    // return for formattedConversations.map(): for each conversation, return all the previous conversation info, but also add formatted messages, formatted recipients, and if the conversation is currently selected.
    return { ...conversation, messages, recipients, selected };
  });

  const contextValuesToBroadcast = {
    conversations: formattedConversations,
    // selectedConversation;s value is actually the entire conversation object from the formattedConversations array, with the index of the selectedConversationIndex. Thus the bracket notation.
    selectedConversation: formattedConversations[selectedConversationIndex],
    sendMessage,
    selectConversationIndex: setSelectedConversationIndex,
    createConversation,
  };

  return (
    <ConversationsContext.Provider value={contextValuesToBroadcast}>
      {children}
    </ConversationsContext.Provider>
  );
}

// putting this function down here because it actually does not depend on anything in the component
function arrayEquality(a, b) {
  // if the arrays are not the same length we immediately know they are not equal
  if (a.length !== b.length) return false;

  // sort the arrays in the same way in case they are out of order
  a.sort();
  b.sort();

  // if every element in the a array is equal to every element in the b array at the same index, the arrays are exactly equal, so return true.
  return a.every((element, index) => {
    return element === b[index];
  });
}
