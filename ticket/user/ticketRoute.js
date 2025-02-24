const { Router } = require("express");
const {
  getMyTickets,
  createNewTicket,
  getTicketById,
  replyTicket,
} = require("./ticketHandler");
const router = Router();

router.route("/").get(getMyTickets).post(createNewTicket);
router.route("/:ticketId").get(getTicketById);
router.route("/reply").post(replyTicket);

module.exports = router;
