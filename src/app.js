import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"


const app = express()

// learn cors 
app.use(cors({
    orgin:process.env.CORS_ORIGIN,
     credentials:true
}))

// ye json data accepet karega limit ke sath request me json data handle kar sakte 
// ye form se data ayyega usko handle kar lega 
app.use(express.json({
    limit:"16kb"
}))

// ye mera url se data aayga tu usko handle karega like https://www.youtube.com/watch?v=7fjOw8ApZ1I&t=35701s
app.use(express.urlencoded({extended:true,limit:"16kb"}))

//kuch file or floder store karna chate hai meri hi server me store rhkna chata hu tu eak public floder bana deta hu 
app.use(express.static("public"))

// jo mere server hai na ushe user ka brower hai na  ushe cookie access karo or ushme cokkie set kar sake   
app.use(cookieParser())


// routes import
import userRoutes from "./routes/user.routes.js"


// routes declaration 
// here we have to use the userRoutes as a middleware because we have to use the userRoutes in the app.js file 
// so we have to use the userRoutes as a middleware in the app.js file
// so we can not use get or post method here we have to use the use method get or post method we can use in the user.routes.js file because here we can not use because get or post method is not available in the app.js file
app.use("/api/v1/users",userRoutes)
//
export { app }