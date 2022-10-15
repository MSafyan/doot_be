var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');

const sendMail = async (options) => {
    const transporter = nodemailer.createTransport(smtpTransport({
        service: process.env.MAIL_SERVICE,
        host: process.env.MAIL_HOST,
		port: 465,
		secure: true,
        pool: true,
        auth: {
            user: process.env.MAIL_USERNAME,
            pass: process.env.MAIL_PASSWORD,
        }
    }));
    const mailOptions = {
        from: process.env.MAIL_USERNAME,
        to: options.email,
        subject: options.subject,
        text: options.text
    };
    await transporter.sendMail(mailOptions);
};

module.exports = sendMail;