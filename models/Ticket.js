const { Schema, default: mongoose } = require("mongoose");
const User = require("./User");
const { format } = require("date-fns");

const ticketSchema = new Schema(
  {
    creator: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    subject: {
      type: String,
    },
    email: {
      type: String,
    },
    messages: {
      type: Array,
    },
    status: {
      type: String,
    },
    lastUpdated: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

ticketSchema.statics.createTicket = async function (ticketData) {
  try {
    const user = await User.findById(ticketData.userId);

    if (!user) {
      throw new Error("User not found");
    }

    const currentDate = new Date();

    const userTicket = {
      creator: user._id,
      subject: ticketData.subject,
      email: ticketData.email,
      status: "open",
      lastUpdated: currentDate,
    };

    const createNewTicket = await Ticket.create(userTicket);

    const msgData = {
      sender: user._id,
      ticketId: createNewTicket._id,
      msg: ticketData.message,
    };

    createNewTicket.messages.push(msgData);

    await createNewTicket.save();
  } catch (error) {
    console.log(error);
    throw error;
  }
};

ticketSchema.statics.getAllTickets = async function () {
  try {
    const tickets = await Ticket.find();
    return tickets;
  } catch (error) {
    throw error;
  }
};

ticketSchema.statics.getUserTickets = async function (userId) {
  try {
    const userTickets = await Ticket.find({ creator: userId });
    return userTickets;
  } catch (error) {
    throw error;
  }
};

ticketSchema.statics.getTicketById = async function (ticketId) {
  try {
    const ticket = await Ticket.findById(ticketId);

    if (!ticket) {
      throw new Error("Ticket not found!");
    }
    return ticket;
  } catch (error) {
    throw error;
  }
};

ticketSchema.statics.replyTicket = async function (ticketData) {
  try {
    const ticket = await Ticket.findById(ticketData.ticketId);

    if (!ticket) {
      throw new Error("Ticket not found!");
    }

    const msgData = {
      sender: ticketData.userId,
      ticketId: ticketData.ticketId,
      msg: ticketData.message,
    };

    ticket.messages.push(msgData);

    await ticket.save();
    return ticket;
  } catch (error) {
    throw error;
  }
};

ticketSchema.statics.adminReply = async function (ticketData) {
  try {
    const ticket = await Ticket.findById(ticketData.ticketId);

    if (!ticket) {
      throw new Error("Ticket not found!");
    }

    const msgData = {
      sender: ticketData.adminId,
      ticketId: ticketData.ticketId,
      msg: ticketData.message,
    };

    ticket.messages.push(msgData);

    await ticket.save();
    return ticket;
  } catch (error) {
    throw error;
  }
};

const Ticket = mongoose.model("Ticket", ticketSchema);

module.exports = Ticket;
