const Ticket = require("../../models/Ticket");

const createNewTicket = async (req, res) => {
  const userId = req.userId;
  const { subject, email, message } = req.body;

  if (!subject || !email || !message)
    return res.status(400).json({ message: "Bad request!" });
  try {
    const ticketData = {
      subject,
      email,
      message,
      userId,
    };

    await Ticket.createTicket(ticketData);
    res.status(201).json({ message: "Ticket created." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMyTickets = async (req, res) => {
  const userId = req.userId;
  try {
    const tickets = await Ticket.getUserTickets(userId);
    res.status(200).json({ tickets });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const replyTicket = async (req, res) => {
  const userId = req.userId;
  const { message, ticketId } = req.body;
  try {
    const ticketData = { userId, ticketId, message };
    await Ticket.replyTicket(ticketData);
    res.status(200).json({ message: "Message sent." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getTicketById = async (req, res) => {
  const { ticketId } = req.params;
  try {
    const ticket = await Ticket.getTicketById(ticketId);
    res.status(200).json({ ticket });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getTicketById, getMyTickets, createNewTicket, replyTicket };
