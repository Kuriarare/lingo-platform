const Message = require('../models/Chat');  

module.exports = {
  chatsService: async (room) => {
    try {
      const messages = await Message.find({ room })
        .sort({ timestamp: - 1 }) 
        .limit(50); 
      return messages; 
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error; 
    }
  }
};
