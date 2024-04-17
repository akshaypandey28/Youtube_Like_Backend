import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js"; //aise import tbhi hoga jb export default na ho
//means sirf export ho 

const router=Router()

router.route("/register").post(registerUser)

export default router