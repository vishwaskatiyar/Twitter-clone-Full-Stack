import Notification from "../model/notification.model.js";
import User from "../model/user.model.js";
import Post from "../model/post.model.js";
import { v2 as cloudinary } from "cloudinary";

export const createPost = async (req, res) => {
    try {
        const { text } = req.body;
        let { img } = req.body;
        const userId = req.user._id.toString();

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });
        if (!text && !img)
            return res.status(400).json({ message: "post must have text or image" });

        if (img) {
            const uploadedResponse = await cloudinary.uploader.upload(img);
            img = uploadedResponse.secure_url;
        }
        const newPost = new Post({
            text,
            img,
            user: userId,
        });

        await newPost.save();
        res.status(201).json(newPost);
    } catch (e) {
        console.error(e);
        return res.status(500).json({ message: "Server Error" });
    }
};

export const deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: "Post not found" });
        if (post.user.toString() !== req.user._id.toString()) {
            return res
                .status(401)
                .json({ message: "you are not authorize to delete this post" });
        }
        if (post.img) {
            const imgId = post.img.split("/").pop().split(".")[0];
            await cloudinary.uploader.destroy(imgId);
        }
        await Post.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Post deleted Successfully" });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ message: "Server Error" });
    }
};

export const commentOnPost = async (req, res) => {
    try {
        const { text } = req.body;
        const postId = req.params.id;
        const userId = req.user._id;

        if (!text) {
            return res.status(400).json({ message: "Comment must have text" });
        }
        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ message: "Post not found" });

        const comment = {
            text,
            user: userId,
        };
        post.comments.push(comment);
        await post.save();
        res.status(201).json(post);
    } catch (e) {
        console.error(e);
        return res.status(500).json({ message: "Server Error" });
    }
};

export const likeUnlikePost = async (req, res) => {
    try {
        const { id: postId } = req.params;
        const userId = req.user._id;

        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ message: "Post not found" });

        const userLikedPost = post.likes.includes(userId);
        if (userLikedPost) {
            await Post.updateOne({ _id: postId }, { $pull: { likes: userId } });
            await User.updateOne({ _id: userId }, { $pull: { likedPosts: postId } });

            const updatedLikes = post.likes.filter((id) => id.toString() !== userId.toString());
            return res.status(200).json({ message: "Post unliked successfully", updatedLikes });
        } else {
            post.likes.push(userId);
            await User.updateOne({ _id: userId }, { $push: { likedPosts: postId } });
            await post.save();

            if (post.user.toString() !== userId.toString()) {
                const notification = new Notification({
                    from: userId,
                    to: post.user,
                    type: "like",
                });
                await notification.save();
            }

            const updatedLikes = post.likes;
            return res.status(200).json({ message: "Post liked successfully", updatedLikes });
        }
    } catch (error) {
        console.error("Error in likeUnlikePost controller: ", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

export const getAllPost = async (req, res) => {
    try {
        const posts = await Post.find().sort({ createdAt: -1 }).populate({
            path: "user",
            select: "-password",
        }).populate({
            path: "comments.user",
            select: "-password",
        });
        if (posts.length === 0) {
            return res.status(200).json([]);
        }
        res.status(200).json(posts);

    } catch (err) {
        console.log("Error in getAllPost controller: ", err);
        res.status(500).json({ error: "Internal server error" });
    }


}

export const getLikedPost = async (req, res) => {
    const userId = req.params.id
    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const likedPosts = await Post.find({ _id: { $in: user.likedPosts } }).populate({
            path: "user",
            select: "-password",
        }).populate({
            path: "comments.user",
            select: "-password",
        });
        res.status(200).json(likedPosts);

    } catch (err) {
        console.log("Error in getLikedPost controller: ", err);
        res.status(500).json({ error: "Internal server error" });
    }

};


export const getfollowingPost = async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const followingUsers = user.following;
        const feedPost = await Post.find({ user: { $in: followingUsers } }).sort({ createdAt: -1 }).populate({
            path: "user",
            select: "-password",
        }).populate({
            path: "comments.user",
            select: "-password",

        });
        res.status(200).json(feedPost);


    } catch (e) {
        console.error(e);
        return res.status(500).json({ message: "Internal Server Error" });

    }
}

export const getUserPost = async (req, res) => {
    try {
        const { username } = req.params;
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const posts = await Post.find({ user: user._id }).sort({ createdAt: -1 }).populate({
            path: "user",
            select: "-password",
        }).populate({
            path: "comments.user",
            select: "-password",
        });
        res.status(200).json(posts);


    } catch (err) {
        console.log("Error in getUserPost controller: ", err);
        res.status(500).json({ error: "Internal server error" });
    }
}