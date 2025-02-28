const Ticket = require("../../models/Ticket");

const getAllTickets = async (req, res) => {
  const isAdmin = req.isAdmin;
  if (!isAdmin) return res.status(400).json({ message: "Not allowed!" });

  try {
    const tickets = await Ticket.getAllTickets();
    res.status(200).json({ tickets });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const replyUser = async (req, res) => {
  const adminId = req.adminId;
  const isAdmin = req.isAdmin;
  if (!isAdmin) return res.status(400).json({ message: "Not allowed!" });

  const { message, ticketId } = req.body;
  try {
    const ticketData = { adminId, ticketId, message };
    await Ticket.adminReply(ticketData);
    res.status(200).json({ message: "Message sent." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getTicket = async (req, res) => {
  const { ticketId } = req.params;
  try {
    const ticket = await Ticket.getTicketById(ticketId);
    res.status(200).json({ ticket });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getAllTickets, replyUser, getTicket };
