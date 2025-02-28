const { Router } = require("express");
const { getAllTickets, replyUser, getTicket } = require("./adminTicketHanlder");
const router = Router();

router.route("/").get(getAllTickets).post(replyUser);
router.route("/:ticketId").get(getTicket);

module.exports = router;
