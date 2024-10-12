import Conversation from "../models/conversations.model.js";
import Message from "../models/messages.model.js";

export const createAndSendMessage = async (senderID, receiverID, message) => {
	try {
		if (senderID.toString() === receiverID.toString()) {
			return {
				status: 400,
				data: { error: "Cannot send message to self" },
			};
		}

		let conversation = await Conversation.findOne({
			participants: { $all: [senderID, receiverID] },
		})

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
		const populatedMessage = await Message.findById(newMessage._id)
			.populate("senderID", "username email") // Add any other fields you need from User
			.populate("receiverID", "username email");
		// console.log("populated message, ", populatedMessage)

		return { status: 201, data: { newMessage: populatedMessage } };
	} catch (error) {
		console.log("Error in createAndSendMessage helper", error.message);
		return { status: 500, data: { error: "Internal server error" } };
	}
};
