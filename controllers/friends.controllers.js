import Conversation from "../models/conversations.model.js";
import User from "../models/user.model.js"

export const getFriends = async (req, res) => {
    try {
        const senderID = req.user._id;
        const conversations = await Conversation.find({ participants: senderID }).populate('messages');
        if(conversations) {
            // Create a set to store unique user IDs
        const chattedUsers = new Set();

        // Loop through conversations and messages to find participants
        for (const conversation of conversations) {
            for (const message of conversation.messages) {
                if(message.senderID.toString() !== senderID.toString()) {
                    chattedUsers.add(message.senderID.toString());
                }
                if(message.receiverID.toString() !== senderID.toString()) {
                    chattedUsers.add(message.receiverID.toString());
                }
            }
        }

        // Convert Set to an array for further processing
        const chattedUserIds = Array.from(chattedUsers);
        
        // Find the actual user objects based on IDs
        const users = await User.find({ _id: { $in: chattedUserIds } });
        return res.status(200).json(users);

        } else {
            return res.status(404).json({error: "friends not found"});
        }
    } catch (error) {
         console.log("Error friends controller", error.message);
        res.status(500).json({error: "Internal server error friends"});
    }
}