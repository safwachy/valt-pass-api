const sgMail = require('@sendgrid/mail');
require('dotenv').config();
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendVerificationCode = (email, code) => {
    let html = `
        <tr style="margin: 0; padding: 0; font-family: Helvetica; box-sizing: border-box; font-size: 14px;">
            <td class="content-block" style="margin: 0; padding: 0 0 20px; font-family: Helvetica; box-sizing: border-box; font-size: 14px; vertical-align: top;">
                Hi There!
                                                                        
                <p>Your ValtPass account has been created successfully!</p>
                <p>Here is your verification code: ${code}.</p>
                <p>**DO NOT LOSE THIS CODE OR SHARE IT WITH ANYONE**</p>
                                                                    
                <p>Thank you for supporting my project!</p>

                <p>Regards,</p>
                <p>Safwachy</p>
                                                                        
            </td>
        </tr>`;
    
    const msg = {
        to: email,
        from: 'safwachyece@gmail.com',
        subject: 'Welcome to ValtPass!',
        html,
    };
    sgMail.send(msg);
};

module.exports = {
    sendVerificationCode,
};