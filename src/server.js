import express from "express"
import path, {dirname} from "path"
import { fileURLToPath } from "url"
import companyRoutes from "./Routes/company"
import authRoutes from "./Routes/auth"
import authMiddleware from "./Middleware/authMiddleware"

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

// Serving up the HTML file from the current directory
app.get('/', (_, res) => {
    res.sendFile(path.join(__dirname, '', 'index.html'))
})

// Routes
app.use('/auth', authRoutes)
app.use('/api', authMiddleware, companyRoutes)


app.listen(PORT, () => {
    console.log(`Server has started on port: ${PORT}`)
})