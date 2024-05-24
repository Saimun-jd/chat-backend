import jwt from "jsonwebtoken";

const generateTokenAndSetCookies = (userID, res) => {
    const token = jwt.sign({userID}, process.env.JWT_SECRET, {
        expiresIn: '15d'
    });
    res.cookie("jwt", token, {
        maxAge: 15 * 24 * 60 * 60 * 1000,
        httpOnly: true, //prevent xss attackd
        sameSite: "strict" // csrf attack
    })
    return token;
}

export default generateTokenAndSetCookies;