import sgMail from "@sendgrid/mail"

export const sendMail = async ({to, from, subject, text, html}) => {
    const msg = {to, from, subject, text, html};
    try{
        await sgMail.send(msg);
        console.log("email sent sucessfully");
    } catch(error) {
        console.log(error.message);
    }
}
