const chatsService = require('../services/chatsService');

module.exports = {
  chatsController: async (req, res) => {
    try {
      const room = req.params.room;
      const messages = await chatsService.chatsService(room); // Correct usage
      return res.status(200).json(messages);
    } catch (error) {
      return res.status(404).json({ error: 'No messages found' });
    }
  },
};
