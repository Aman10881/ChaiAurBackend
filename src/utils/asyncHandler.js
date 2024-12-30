// A utility folder contains helper functions or reusable code to 
//simplify tasks used throughout the project.

const asyncHandler = (requestHandler) => {
   return (req,res,next)=>{
        Promise.resolve(requestHandler(req,res,next)).
        catch((err) => next(err))
    }
    
}




export {asyncHandler}

// higher order function wo function jo function ko parmaeter ke traha treat karte hai 
// ya tu return kar sakte haai


// const asyncHandler = (fn) => async(req,res,next) =>{
//     try{
//         await fn(req,res,next)
//     } catch(error){
//         res.status(err.code || 500).json({
//             success:false,
//             message:err.message
//         })
//     }
// } 