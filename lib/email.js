const nodemailer = require('nodemailer')
const credentials = require('./credentials')

module.exports = () => {
    const from = credentials.gmail.user
    const transporter = nodemailer.createTransport({
        // host: 'smtp.ethereal.email',
        service: 'qq', // 使用了内置传输发送邮件 查看支持列表：https://nodemailer.com/smtp/well-known/
        port: 465, // SMTP 端口
        secureConnection: true, // 使用了 SSL
        auth: {
            user: credentials.gmail.user,
            pass: credentials.gmail.password,
        }
    })

    return {
        send: (to, subject, text, html) => {
            transporter.sendMail({
                from: from,
                to: to,
                subject: subject,
                html: html,
                text: text,
                generateTextFromHtml: true
            }, function (err, info) {
                if (err) console.error('Unable to send email: ', info.messageId);
            })
        }
    }
}