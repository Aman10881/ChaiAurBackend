// import v2 from cloudinary v2 is used for uploading files on cloudinary server v2 stands for version 2 of cloudinary
import { v2 as cloudinary } from "cloudinary";
import fs from "fs"

// what is cloudinary? 
// cloudinary is a cloud-based image and video management service. 
// It enables users to upload, store, manage, manipulate, and deliver images and video for websites and apps.
// cloudinary is used for uploding files on cloudinary server
// cloudinary gives us the url of the file which is uploaded on cloudinary server
// we can use this url to show the image on the front end
// we can also use this url to store in the database
// for this we have to create the account on cloudinary
// we have to install the cloudinary package by using npm install cloudinary
// we have to require the cloudinary package in the file where we want to use it


// cloudinary is used for uploding files on cloudinary server 
// cloudinary gives us the url of the file which is uploaded on cloudinary server
// we can use this url to show the image on the front end
// we can also use this url to store in the database
// for this we have to create the account on cloudinary
// we have to install the cloudinary package by using npm install cloudinary
// we have to require the cloudinary package in the file where we want to use it
// we have to configure the cloudinary by using the cloudinary.config method
// we have to use the cloudinary.uploader.upload method to upload the file on cloudinary server
// this method will return the url of the file which is uploaded on cloudinary server


 // Configuration
    cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET
    });
    // Function to upload a file on cloudinary
    // this function will take the local file path as input and return the url of the file which is uploaded on cloudinary server
    // if the file is uploaded successfully then it will return the url of the file
    // if the file is not uploaded successfully then it will return null
    
    const uploadOnCloudinary =  async (localFilePath) => {
        try {
            if(!localFilePath)return null 
            // upload the file on cloudinary 
            const response = await cloudinary.uploader.upload
            (localFilePath,{
                resource_type:"auto"
            })
            //file has been uploaded successfull 
            //console.log("file is uploaded on cloudinary",response.url);
            // remove the locally saved temporary file as the upload operation succeeded
            fs.unlinkSync(localFilePath)
            return response;

        }catch(error){
            // if file is not upload in cloudinary but we know that it is present in server so first unlink these file form the server because melicous activity will start 
            fs.unlinkSync(localFilePath) // remove the locally saved temporary file as the upload operation failed
            return null; 
        }
    }
    export {uploadOnCloudinary}
