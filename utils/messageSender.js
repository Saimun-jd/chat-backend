import Conversation from "../models/conversations.model.js";
import Message from "../models/messages.model.js";

export const createAndSendMessage = async (senderID, receiverID, message) => {
	try {
		if (senderID.toString() === receiverID.toString()) {
			return { status: 400, data: { error: "Cannot send message to self" } };
		}

		let conversation = await Conversation.findOne({
			participants: { $all: [senderID, receiverID] },
		});

		if (!conversation) {
			conversation = await Conversation.create({
				participants: [senderID, receiverID],
			});
		}

		const newMessage = new Message({
			senderID,
			receiverID,
			message,
		});

		if (newMessage) {
			conversation.messages.push(newMessage._id);
		}

		await Promise.all([conversation.save(), newMessage.save()]);

		return { status: 201, data: { newMessage } };
	} catch (error) {
		console.log("Error in createAndSendMessage helper", error.message);
		return { status: 500, data: { error: "Internal server error" } };
	}
};