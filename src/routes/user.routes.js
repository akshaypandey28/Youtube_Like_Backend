import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js"; //aise import tbhi hoga jb export default na ho
//means sirf export ho 
import { upload } from "../middlewares/multer.middleware.js";

const router=Router()

router.route("/register").post(
    upload.fields([
        {
            name:"avatar",
            maxCount:1
        },
        {
            name:"coverImage",
            maxCount:1
        }
    ]),
    registerUser
)

export default router