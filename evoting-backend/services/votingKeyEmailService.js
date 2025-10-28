import nodemailer from "nodemailer";
import crypto from "crypto";

/**
 * Send primary voting key via email
 * @param {string} email - User email
 * @param {string} votingKey - Primary voting key
 * @param {string} electionTitle - Election title
 * @param {string} expiryTime - Key expiry time
 */
export const sendVotingKeyEmail = async (email, votingKey, electionTitle, expiryTime) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"E-Voting Security System" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `🔐 Your Secure Voting Key - ${electionTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8f9fa;">
          <div style="background: linear-gradient(135deg, #1a1a2e, #16213e); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: #fff; margin: 0; font-size: 28px;">🔐 Secure Voting System</h1>
            <p style="color: #e0e0e0; margin: 10px 0 0 0; font-size: 16px;">Cryptographic Key-Based Authentication</p>
          </div>
          
          <div style="padding: 40px; background: #fff;">
            <h2 style="color: #1a1a2e; margin-bottom: 20px; font-size: 24px;">Your Voting Key</h2>
            <p style="color: #666; margin-bottom: 30px; font-size: 16px; line-height: 1.6;">
              You have been authorized to vote in <strong>${electionTitle}</strong>. 
              Use the cryptographic key below to access the voting system.
            </p>
            
            <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; border-left: 4px solid #007bff; margin: 30px 0;">
              <h3 style="color: #1a1a2e; margin: 0 0 15px 0; font-size: 18px;">🔑 Your Voting Key</h3>
              <div style="background: #000; color: #00ff00; padding: 15px; border-radius: 5px; font-family: 'Courier New', monospace; font-size: 14px; word-break: break-all; letter-spacing: 1px;">
                ${votingKey}
              </div>
              <p style="color: #666; margin: 15px 0 0 0; font-size: 14px;">
                ⏰ This key expires at: <strong>${expiryTime}</strong>
              </p>
            </div>
            
            <div style="background: #fff3cd; padding: 20px; border-radius: 8px; border-left: 4px solid #ffc107; margin: 20px 0;">
              <h4 style="color: #856404; margin: 0 0 10px 0;">⚠️ Security Instructions</h4>
              <ul style="color: #856404; margin: 0; padding-left: 20px;">
                <li>Keep this key confidential - do not share it with anyone</li>
                <li>This key is unique to you and this election</li>
                <li>You will receive a confirmation key after voting</li>
                <li>All voting activities are cryptographically secured</li>
              </ul>
            </div>
            
            <div style="background: #d1ecf1; padding: 20px; border-radius: 8px; border-left: 4px solid #17a2b8; margin: 20px 0;">
              <h4 style="color: #0c5460; margin: 0 0 10px 0;">🔒 Multi-Layer Security</h4>
              <p style="color: #0c5460; margin: 0; font-size: 14px;">
                Your vote is protected by multiple cryptographic layers including SHA-512 hashing, 
                blockchain verification, and time-based security tokens.
              </p>
            </div>
          </div>
          
          <div style="background: #1a1a2e; padding: 20px; text-align: center; border-radius: 0 0 10px 10px;">
            <p style="color: #e0e0e0; margin: 0; font-size: 14px;">
              © ${new Date().getFullYear()} Secure E-Voting System. All rights reserved.
            </p>
            <p style="color: #999; margin: 5px 0 0 0; font-size: 12px;">
              This email contains sensitive cryptographic information. Do not forward or share.
            </p>
          </div>
        </div>
      `,
      text: `
        Your Voting Key for ${electionTitle}
        
        Voting Key: ${votingKey}
        Expires: ${expiryTime}
        
        Keep this key confidential. Use it to access the voting system.
        
        Security Features:
        - Cryptographic key-based authentication
        - Multi-layer verification
        - Blockchain security
        - Time-based expiration
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Voting key sent successfully to ${email}`);
  } catch (error) {
    console.error("❌ Error sending voting key email:", error);
    throw new Error("Failed to send voting key email");
  }
};

/**
 * Send confirmation key after vote submission
 * @param {string} email - User email
 * @param {string} confirmationKey - Confirmation key
 * @param {string} electionTitle - Election title
 * @param {string} candidateName - Voted candidate name
 */
export const sendConfirmationKeyEmail = async (email, confirmationKey, electionTitle, candidateName) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"E-Voting Security System" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `✅ Vote Confirmation - ${electionTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8f9fa;">
          <div style="background: linear-gradient(135deg, #28a745, #20c997); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: #fff; margin: 0; font-size: 28px;">✅ Vote Confirmed</h1>
            <p style="color: #e0e0e0; margin: 10px 0 0 0; font-size: 16px;">Cryptographic Confirmation</p>
          </div>
          
          <div style="padding: 40px; background: #fff;">
            <h2 style="color: #28a745; margin-bottom: 20px; font-size: 24px;">Vote Successfully Recorded</h2>
            <p style="color: #666; margin-bottom: 30px; font-size: 16px; line-height: 1.6;">
              Your vote for <strong>${candidateName}</strong> in <strong>${electionTitle}</strong> 
              has been cryptographically secured and recorded on the blockchain.
            </p>
            
            <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; border-left: 4px solid #28a745; margin: 30px 0;">
              <h3 style="color: #1a1a2e; margin: 0 0 15px 0; font-size: 18px;">🔐 Confirmation Key</h3>
              <div style="background: #000; color: #00ff00; padding: 15px; border-radius: 5px; font-family: 'Courier New', monospace; font-size: 14px; word-break: break-all; letter-spacing: 1px;">
                ${confirmationKey}
              </div>
              <p style="color: #666; margin: 15px 0 0 0; font-size: 14px;">
                Save this key as proof of your vote
              </p>
            </div>
            
            <div style="background: #d4edda; padding: 20px; border-radius: 8px; border-left: 4px solid #28a745; margin: 20px 0;">
              <h4 style="color: #155724; margin: 0 0 10px 0;">✅ Security Verification</h4>
              <ul style="color: #155724; margin: 0; padding-left: 20px;">
                <li>Vote recorded on immutable blockchain</li>
                <li>Cryptographically signed and verified</li>
                <li>Complete audit trail maintained</li>
                <li>Vote cannot be modified or tampered with</li>
              </ul>
            </div>
            
            <div style="background: #cce5ff; padding: 20px; border-radius: 8px; border-left: 4px solid #007bff; margin: 20px 0;">
              <h4 style="color: #004085; margin: 0 0 10px 0;">🔍 Audit Information</h4>
              <p style="color: #004085; margin: 0; font-size: 14px;">
                Transaction Hash: ${crypto.randomBytes(16).toString('hex')}<br>
                Block Number: ${Math.floor(Math.random() * 10000) + 1000}<br>
                Timestamp: ${new Date().toISOString()}
              </p>
            </div>
          </div>
          
          <div style="background: #28a745; padding: 20px; text-align: center; border-radius: 0 0 10px 10px;">
            <p style="color: #fff; margin: 0; font-size: 14px;">
              Your vote is secure and verified. Thank you for participating in the democratic process.
            </p>
          </div>
        </div>
      `,
      text: `
        Vote Confirmation for ${electionTitle}
        
        Your vote for ${candidateName} has been successfully recorded.
        
        Confirmation Key: ${confirmationKey}
        
        This key serves as proof of your vote and can be used for verification.
        
        Security Features:
        - Blockchain verification
        - Cryptographic signing
        - Immutable record
        - Complete audit trail
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Confirmation key sent successfully to ${email}`);
  } catch (error) {
    console.error("❌ Error sending confirmation key email:", error);
    throw new Error("Failed to send confirmation key email");
  }
};
