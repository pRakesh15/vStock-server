function parseERPNextErrorMessage(
  serverMessages: any,
  defaultMessage: string
): string {
  if (serverMessages) {
    try {
      const messages = JSON.parse(serverMessages);
      if (Array.isArray(messages) && messages.length > 0) {
        const firstMessage = JSON.parse(messages[0]);
        return firstMessage.message || defaultMessage;
      }
    } catch (parseError) {
      console.log("Failed to parse _server_messages:", parseError);
    }
  }
  return defaultMessage;
}

export default parseERPNextErrorMessage;

