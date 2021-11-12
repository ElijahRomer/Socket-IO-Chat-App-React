// second parameter passed is the port we want to listen on
const io = require('socket.io')(5000);

io.on('connection', (socket) => {
  // socket.io would ordinarily give a new socket ID every time you connect, but we are using static ID's. So setting the id to a variable allows us to keep static ids... example: if every time you closed your phone and opened it you had a new phone number, it would be pretty useless phone.
  const id = socket.handshake.query.id;
  socket.join(id);

  socket.on('send-message', ({ recipients, text }) => {
    recipients.forEach((currentIterationrecipient) => {
      // need to change the recipients, because when I send a message, the recipient is you, but when YOU send a message, the recipient is me. So we need to swap out the recipients.
      // removes the current recipient from the list of recipients, and appends the id of the sender, so that when a message is sent, the list of recipients will match the conversation on the receivers side.
      const newRecipients = recipients.filter(
        (recipient) => recipient !== currentIterationrecipient
      );
      newRecipients.push(id);
      socket.broadcast.to(currentIterationrecipient).emit('receive-message', {
        recipients: newRecipients,
        sender: id,
        text,
      });
    });
  });
});
