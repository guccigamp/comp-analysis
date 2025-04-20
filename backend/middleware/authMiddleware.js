import jwt from "jsonwebtoken"

export default function authMiddleware(req, res, next){
    const token = req.headers['authorization']

    // Checking if user has a token
    if (!token) { return res.status(401).json({ message: "No token provided" }) }

    // Validating token
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) { return res.status(401).json({ message: "Invalid token" }) }
        // Sends the userId in the request object
        req.userId = decoded.id
        next()
    })
}
