import {Router} from 'express';
import {loginUser ,registerUser,logoutUser,refreshAccessToken,changeCurrentPassword, getCurrentUser,updateAccountDetails,updateUserAvatar,updateUserCoverImage, getUserChannelProfile,getWatchHistory} from '../controllers/user.controller.js';
import {upload} from '../middlewares/multer.middleware.js';
import {verifyJWT} from '../middlewares/auth.middleware.js';

const router = Router();

// here we have to use the userRoutes as a middleware because we have to use the userRoutes in the app.js file


router.route("/register").post(
    // here we have to use the upload as a middleware because we have to use the upload to upload the image in the app.js file
    // we have to use two images one is avatar and another is coverimage so we have to use the upload.fields method which help us to upload the multiple images of different fields
    upload.fields([
        {
            name: 'avatar',
            maxCount: 1
        },
        {
            name: 'coverImage',
            maxCount: 1
        }
    ]),
    registerUser
);
// here in above code we anyone goes to register route then registerUser function will be called and in the registerUser function we have to upload the images so we have to use the upload.fields method which help us to upload the multiple images of different fields

router.route("/login").post(loginUser);

// secured routes
router.route("/logout").post(verifyJWT,logoutUser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/change-password").post(verifyJWT,changeCurrentPassword);
router.route("/current-user").get(verifyJWT,getCurrentUser);
router.route("/update-account").patch(verifyJWT,updateAccountDetails);
router.route("/update-avatar").patch(verifyJWT,upload.single('avatar'),updateUserAvatar);
router.route("/update-cover-image").patch(verifyJWT,upload.single('coverImage'),updateUserCoverImage);
router.route("/channel-profile/:username").get(verifyJWT,getUserChannelProfile);
router.route("/watch-history").get(verifyJWT,getWatchHistory);


export default router;
// export default means we donot have to import in any other file it will be imported automatically