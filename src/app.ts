import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import morgan from "morgan";
import path from "path";
import './utils/NamespaceOverrides'
import userRoutes from "./routes/userRoutes"
import tableRoutes from "./routes/tableRoutes"
import menuRoutes from "./routes/menuRoutes"
export const app = express();

app.set('trust proxy', 1)
app.disable('x-powered-by')


app.use(cors({
  // origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH', 'HEAD'],
}))

app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(express.static(path.join(__dirname, 'public')))

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'hbs')

app.use(morgan(':method :url :status :response-time ms - :res[content-length]',{
  skip: req => {
      if (req.originalUrl === '/health-check' || req.originalUrl.startsWith('/public/') || req.method === 'OPTIONS') {
        return true
      }
      return false
  },
}))



app.use("/auth", userRoutes)
app.use("/table", tableRoutes)
app.use("/menu", menuRoutes)




app.use((err: Error, req: Request, res: Response, next: NextFunction)=>{
console.log(err);
res.status(500).send({
    message: err.message,
})
})