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

                <p>If you accidentally lost access to the verification page, don't worry! Just login with your credentials and if your account isn't verified, it will bring you back to the same page.</p>
                                                                    
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

const sendNewPassword = (body) => {

};

const requestPasswordChange = (email, code) => {
    let html = `
    <tr style="margin: 0; padding: 0; font-family: Helvetica; box-sizing: border-box; font-size: 14px;">
        <td class="content-block" style="margin: 0; padding: 0 0 20px; font-family: Helvetica; box-sizing: border-box; font-size: 14px; vertical-align: top;">
            <p>A request has been made to change your master password.</p>

            <p>Please use the following code to verify that this is you: ${code}</p>
            
            <p>If this was not you, please login to your account and change your master password</p>
        </td>
    </tr>`;

const msg = {
    to: email,
    from: 'safwachyece@gmail.com',
    subject: 'ValtPass Master Password Change',
    html,
};
sgMail.send(msg);
}

module.exports = {
    sendVerificationCode,
    requestPasswordChange,
    sendNewPassword
};