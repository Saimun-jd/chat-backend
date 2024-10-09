import Conversation from "../models/conversations.model.js";
import Message from "../models/messages.model.js";
import User from "../models/user.model.js";
import { createAndSendMessage } from "../utils/messageSender.js";


export const sendMessage = async (req, res) => {
	try {
		const { message } = req.body;
		const { id: receiverID } = req.params;
		const senderID = req.user._id;

		const result = await createAndSendMessage(senderID, receiverID, message);
		res.status(result.status).json(result.data);
	} catch (error) {
		console.log("Error in sendMessage controller", error.message);
		res.status(500).json({ error: "Internal server error send message" });
	}
};


export const sendNewMessage = async (req, res) => {
	try {
		const { username, message } = req.body;
		const senderID = req.user._id;

		let user = await User.findOne({ username });
		if (!user) {
			return res.status(400).json({ error: "No user exists with such name" });
		}

		const receiverID = user._id;

		if (senderID.toString() === receiverID.toString()) {
			return res.status(400).json({ error: "Cannot send message to self" });
		}

		const result = await createAndSendMessage(senderID, receiverID, message);

		return res.status(result.status).json(result.data);
	} catch (error) {
		console.log("Error in sendNewMessage controller", error.message);
		return res.status(500).json({ error: "Internal server error send new message" });
	}
};


export const getMessage = async (req, res) => {
	try {
		const { id: receiverID } = req.params;
		const senderID = req.user._id;
		const conversation = await Conversation.findOne({
			participants: { $all: [senderID, receiverID] },
		}).populate({path: "messages", populate: {
                path: 'senderID receiverID', // Populate senderID and receiverID fields in messages
            },});
		if (!conversation) {
			return res.status(200).json([]);
		}
		console.log("the length of array ",conversation.messages.length)
		const allconversations = conversation.messages.map((conv) => {
			return {
				_id: conv._id,
				sender: {
					_id: conv.senderID._id,
					username: conv.senderID.username
				},
				receiver: {
					_id: conv.receiverID!==null? conv.receiverID._id: 'unknownid',
					username: conv.receiverID!==null ? conv.receiverID.username: 'unknown user'
				},
				message: conv.message,
				createdAt: conv.createdAt,
				updatedAt: conv.updatedAt
			}
		})
		console.log(allconversations);
		res.status(200).json(allconversations);
	} catch (error) {
		console.log("Error in send message controller", error.message);
		res.status(500).json({
			error: "Internal server error get all message",
		});
	}
};

export const getLastMessage = async (req, res) => {
    const senderID = req.user._id;
    try {
        // Fetch all conversations that include the logged-in user
        const conversations = await Conversation.find({
            participants: senderID,
        }).populate({
            path: 'messages',
            options: { sort: { 'updatedAt': -1 }}, // Sort messages by updatedAt in descending order and limit to 1
            populate: {
                path: 'senderID receiverID', // Populate senderID and receiverID fields in messages
            },
        })

        // Find the most recent message and the other participant in each conversation
        const lastMessages = conversations.map(conversation => {
            if (conversation.messages.length > 0) {
                // Retrieve the most recent message (first message after sorting)
                const lastMessage = conversation.messages[0];

                // Find the other participant
                // const otherParticipant = conversation.participants.find(
                //     participant => participant._id.toString() !== senderID.toString()
                // );
				// console.log("lastMessage is ");
				console.log(lastMessage);

                return {
						_id: lastMessage._id,
						sender: lastMessage.senderID.username,
						receiver: lastMessage.receiverID !== null? lastMessage.receiverID.username: 'unknown user',
						message: lastMessage.message,
						createdAt: lastMessage.createdAt !== undefined ?lastMessage.createdAt: Date.now(),
						updatedAt: lastMessage.updatedAt !== undefined ?lastMessage.updatedAt: Date.now(),
						senderID: lastMessage.senderID._id,
						receiverID: lastMessage.receiverID !== null? lastMessage.receiverID._id: 'no id'
                };
            }
            return null;
        }).filter(entry => entry !== null); // Filter out conversations without messages

        // Sort the results by the updatedAt timestamp of the most recent message
        lastMessages.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
		// console.log(lastMessages);
        // Now lastMessages contains the most recent message for each conversation, sorted by the most recent message across all conversations
        return res.status(200).json(lastMessages);
    } catch (error) {
        console.log("Error in get last messages controller", error.message);
        res.status(500).json({
            error: "Internal server error while getting last messages",
        });
    }
};
