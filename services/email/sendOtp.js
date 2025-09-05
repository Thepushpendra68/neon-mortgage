const transporter = require('../transporter');

const sendOtp = async (email, otp) => {
    const message = `Your OTP is ${otp} to verify on Homes BOQ.`;

    try {
        await transporter.sendMail({
            from: "homeboq1983@gmail.com",
            to: email,
            subject: "OTP from BOQ Homes.",
            html: message
        })
    } catch (error) {
        console.log(error);
    }
}

module.exports = sendOtp;