export default mongoose =>{
    const UserSchema = mongoose.Schema({
        login: String,
        password: String
    })
    return mongoose.model('User', UserSchema)
}