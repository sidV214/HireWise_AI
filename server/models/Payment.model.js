import mongooose from 'mongoose'

const paymentSchema = new mongooose.Schema({
    userId:{
        type:mongooose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    planId: String,
    amount: Number,
    credits: Number,
    razorpayOrderId: String,
    razorpayPaymentId: String,
    status:{
        type: String,
        enum: ["created", "paid", "failed"],
        default: "created"
    }
}, {timestamps:true})

const Payment = mongooose.model("Payment", paymentSchema)

export default Payment