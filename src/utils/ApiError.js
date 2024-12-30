class ApiError extends Error {
    constructor(
        satusCode,
        message = "Something went wrong",
        errors = [],
        stack = ""
    ){
        super(message)
        this.satusCode = satusCode
        this.data = null
        this.message = message
        this.success = false;
        this.errors = errors

        if(stack){
            this.stack = stack
        }else{
            Error.captureStackTrace(this,this.constructor)
        }
    }
}

export { ApiError }