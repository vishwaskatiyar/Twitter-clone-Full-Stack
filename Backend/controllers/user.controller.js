import bcrypt from "bcryptjs";
import { v2 as cloudinary } from "cloudinary";
import Notification from "../model/notification.model.js";
import User from "../model/user.model.js";

export const getUserProfile = async (req, res) => {
    const { username } = req.params;
    try {
        const user = await User.findOne({ username }).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json(user);
    } catch (e) {
        console.error("Error in getUserProfile", e);
        res.status(500).json({ error: e });
    }
};

export const followUnfollowUser = async (req, res) => {
    try {
        const { id } = req.params;
        const userToModify = await User.findById(id);

        const currentUser = await User.findById(req.user._id);

        if (id === req.user._id.toString()) {
            return res
                .status(400)
                .json({ error: "You can't follow/unfollow yourself" });
        }
        if (!userToModify || !currentUser) {
            return res.status(400).json({ error: "User not found" });
        }
        const isFollowing = currentUser.following.includes(id);
        if (isFollowing) {
            await User.findByIdAndUpdate(id, { $pull: { following: req.user._id } });
            await User.findByIdAndUpdate(req.user._id, { $pull: { following: id } });
            res.status(200).json({ message: "User unfollowed succesfully" });
        } else {
            await User.findByIdAndUpdate(id, { $push: { followers: req.user._id } });
            await User.findByIdAndUpdate(req.user._id, { $push: { following: id } });
            const newNotificaton = new Notification({
                to: userToModify._id,
                from: req.user._id,
                type: "follow",
            });
            await newNotificaton.save();
            res.status(200).json({ message: "User followed succesfully" });
        }
    } catch (e) {
        console.error("Error in followUnfollowUser", e);
        res.status(500).json({ error: e });
    }
};

export const getSuggestedUser = async (req, res) => {
    try {
        const userId = req.user._id;
        const usersFollowesByMe = await User.findById(userId).select("following");
        const users = await User.aggregate([
            {
                $match: {
                    _id: { $ne: userId },
                },
            },
            {
                $sample: { size: 10 },
            },
        ]);

        const filteredUsers = users.filter(
            (user) => !usersFollowesByMe.following.includes(user._id)
        );
        const suggestedUsers = filteredUsers.slice(0, 5);
        suggestedUsers.forEach((user) => (users.password = null));
        res.status(200).json(suggestedUsers);
    } catch (e) {
        console.error("Error in getSuggestedUser", e);
        res.status(500).json({ error: e });
    }
};

export const updateUser = async (req, res) => {
    const { fullName, email, username, currentPassword, newPassword, bio, link } =
        req.body;
    let { profileImg, coverImg } = req.body;
    const userId = req.user._id;
    try {
        let user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        if (
            (!newPassword && currentPassword) ||
            (!currentPassword && newPassword)
        ) {
            return res.status(400).json({
                message: "You must provide both current and new passwords or neither.",
            });
        }
        if (currentPassword && newPassword) {
            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isMatch) {
                return res
                    .status(401)
                    .json({ message: "Current password is incorrect." });
            }
            if (newPassword.length < 6) {
                return res
                    .status(400)
                    .json({ message: "Password must be at least 6 characters long." });
            }
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(newPassword, 10);
        }
        if (profileImg) {
            if (user.profileImg) {
                await cloudinary.uploader.destroy(
                    user.profileImg.split("/").pop().split(".")[0]
                );
            }

            const uploadedResponse = await cloudinary.uploader.upload(profileImg);
            profileImg = uploadedResponse.secure_url;
        }
        if (coverImg) {
            if (user.coverImg) {
                await cloudinary.uploader.destroy(
                    user.coverImg.split("/").pop().split(".")[0]
                );
            }
            const uploadedResponse = await cloudinary.uploader.upload(coverImg);
            coverImg = uploadedResponse.secure_url;
        }
        user.fullName = fullName || user.fullName;
        user.email = email || user.email;
        user.username = username || user.username;
        user.bio = bio || user.bio;
        user.link = link || user.link;
        user.profileImg = profileImg || user.profileImg;
        user.coverImg = coverImg || user.coverImg;
        user = await user.save();
        user.password = null; // to prevent exposing user's password in response

        return res.status(200).json(user);
    } catch (e) {
        console.error("Error in updateUser", e);
        res.status(500).json({ error: e });
    }
};
