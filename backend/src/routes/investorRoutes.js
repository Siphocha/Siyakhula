const router = require("express").Router();

//Investor can access these routes basically.
const auth =
    require("../middleware/authMiddleware");

const role =
    require("../middleware/roleMiddleware");

const controller =
    require("../controllers/investorController");

router.get(
    "/policy/:id",
    auth,
    role("investor"),
    controller.getPolicy
);

module.exports = router;