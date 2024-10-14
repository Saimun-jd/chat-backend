import mongoose from "mongoose";

 const ImageSchema = new mongoose.Schema({
    image: String
 })

 const ImageModel = mongoose.model('image', ImageSchema);
 export default ImageModel;