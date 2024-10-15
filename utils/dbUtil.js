import User from "../models/user.model.js";

export const deleteUnverifiedUsersJob = async() => {
    console.log("cron schedule running");
    const onehourago = new Date(Date.now() - 60*60*1000);
    try{
        const result = await User.deleteMany({
            isVerified: false,
            createdAt: {$lt: onehourago}
        });
        console.log(`deleted ${result.deletedCount} unverified users.`);
    } catch(err) {
        console.log('error deleting unverified users ', err);
    }
}