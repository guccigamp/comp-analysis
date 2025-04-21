import express from "express"
import path, {dirname} from "path"
import { fileURLToPath } from "url"
import companyRoutes from "./routes/company.js"
import facilityRoutes from "./routes/facility.js"
import authRoutes from "./routes/auth.js"
import authMiddleware from "./middleware/authMiddleware.js"

const app = express()

// Importing port from .env (default port: 8000)
const PORT = process.env.PORT || 8000

// Setting the project directory path to keep the file paths relative
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(dirname(__filename))

// Middleware
// Tells express to serve all files from the public folder as static assets / file. 
// Any requests for the css files will be resolved to the public directory.
app.use(express.static(path.join(__dirname, '../public')))
// Allowing express to return json responses
app.use(express.json())
app.use(express.urlencoded({ extended: true }));


// Routes
app.use('/auth', authRoutes)
app.use('/api', authMiddleware, companyRoutes)
app.use('/api', authMiddleware, facilityRoutes)


app.listen(PORT, () => {
    console.log(`Server has started on port: ${PORT}`)
})