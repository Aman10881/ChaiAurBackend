import multer from "multer";
// multer is used for uploading files on the server 
// cloudinary takes a file from the server and upload it on cloudinary server and return the url of the file

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./public/temp");
    },
    filename: function (req, file, cb) {
        cb(null,file.originalname)
    }
})
export const upload = multer({
     storage ,
    })
// multer takes the file from the client and save it on the server
// it takes two arguments
// 1. storage : it is the storage configuration for saving the file on the server
// 2. fileFilter : it is the file filter configuration for filtering the file which is uploaded by the client   
// storage configuration has two properties
// 1. destination : it is the destination folder where the file will be saved
// 2. filename : it is the filename configuration for saving the file on the server
// fileFilter configuration has two properties
// 1. fileFilter : it is the file filter configuration for filtering the file which is uploaded by the client
// 2. limits : it is the limit configuration for limiting the file size which is uploaded by the client


// multer has three methods
// 1. single : it is used for uploading a single file on the server
// 2. array : it is used for uploading multiple files on the server
// 3. fields : it is used for uploading multiple files on the server with different names
// multer has two events
// 1. file : it is the file event for uploading the file on the server
// 2. field : it is the field event for uploading the file on the server with different names
