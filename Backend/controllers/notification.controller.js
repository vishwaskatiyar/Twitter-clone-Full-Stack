import Notification from "../model/notification.model.js";

export const getNotifications = async (req, res) => {
    try {
        const userId = req.user._id;
        const notifications = await Notification.find({ to: userId }).populate({
            path: "from",
            select: "username profileImg",
        });
        await Notification.updateMany({ to: userId }, { read: true });
        res.status(200).json(notifications);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: " Internal Server Error" });
    }
};

export const deleteNotifications = async (req, res) => {
    try {
        const userId = req.user._id;
        await Notification.deleteMany({ to: userId });
        res.status(200).json({ message: "Notifications deleted successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
};

export const deleteOneNotifications = async (req, res) => {
    try {
        const notificationsId = req.params.id;
        const userId = req.params._id;
        const notification = await Notification.findById(notificationsId);
        if (!notification)
            return res.status(404).json({ message: "Notification not found" });
        if (notification.to.toString() !== userId.toString())
            return res
                .status(403)
                .json({ message: "You are not allowed to delete notification" });

        await Notification.findByIdAndDelete(notificationsId);
        res.status(200).json({ message: "Notification deleted successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
};
