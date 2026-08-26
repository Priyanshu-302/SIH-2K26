import { Message } from '../models/message.model.js';
import { Session } from '../models/session.model.js';

/**
 * Service to manage session chat histories in MongoDB
 */
export const historyService = {
  /**
   * Retrieves messages for a given session, ordered by creation time (ascending)
   * Supports pagination using limit and offset
   * 
   * @param {string} sessionId - Mongoose Session ObjectId string
   * @param {number} [limit=50] - Maximum messages to return
   * @param {number} [offset=0] - Number of messages to skip
   * @returns {Promise<Array<Object>>} List of messages
   */
  async getMessagesBySessionId(sessionId, limit = 50, offset = 0) {
    return Message.find({ sessionId })
      .sort({ createdAt: 1 })
      .skip(offset)
      .limit(limit)
      .lean();
  },

  /**
   * Adds a message to the database
   * 
   * @param {Object} messageData
   * @param {string} messageData.sessionId - Session ObjectId
   * @param {string} messageData.role - 'user' | 'assistant'
   * @param {string} messageData.content - Message content
   * @param {Array<Object>} [messageData.citations] - Optional citations list
   * @returns {Promise<Object>} The created message
   */
  async addMessage({ sessionId, role, content, citations = [] }) {
    const message = new Message({
      sessionId,
      role,
      content,
      citations,
    });
    return message.save();
  },

  /**
   * Deletes all messages for a session and the session itself
   * 
   * @param {string} sessionId - Session ObjectId
   * @returns {Promise<void>}
   */
  async deleteSession(sessionId) {
    await Message.deleteMany({ sessionId });
    await Session.findByIdAndDelete(sessionId);
  },
};
