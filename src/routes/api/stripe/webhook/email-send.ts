import { MailerSend, EmailParams, Sender, Recipient } from 'mailersend'
import { env } from '$env/dynamic/private'

let mailerSend: MailerSend | null = null
if (env.MAILERSEND_API_KEY) {
    mailerSend = new MailerSend({ apiKey: env.MAILERSEND_API_KEY })
}

export const sendPurchaseConfirmationEmail = async (
    email: string,
    name: string,
    bookName: string,
    imageUrl?: string | null,
    receiptUrl?: string | null,
    invoiceUrl?: string | null,
) => {
    if (!mailerSend || !env.MAILERSEND_FROM_EMAIL) return;

    // console.log(env.MAILERSEND_FROM_EMAIL, env.MAILERSEND_FROM_NAME, 'env');

    const sentFrom = new Sender(env.MAILERSEND_FROM_EMAIL as string, (env.MAILERSEND_FROM_NAME as string) || 'Book Bidding')
    const recipients = [new Recipient(email, name)]
    const subject = `Your Purchase Confirmation – Book Bidding`
    const img = imageUrl ? `<p style="margin:16px 0"><img src="${imageUrl}" alt="${bookName}" style="max-width:520px;border-radius:8px" /></p>` : ''
    const receiptLink = receiptUrl ? `<p><strong>Receipt:</strong> <a href="${receiptUrl}">${receiptUrl}</a></p>` : ''
    const invoiceLink = invoiceUrl ? `<p><strong>Invoice:</strong> <a href="${invoiceUrl}">${invoiceUrl}</a></p>` : ''
    const html = `<div style="font-family:Segoe UI, Arial, sans-serif;color:#111">
    <p>Dear ${name},</p>
    <p>Thank you for your purchase. Your payment has been successfully processed.</p>
    <p><strong>Item:</strong> ${bookName}</p>
    ${img}
    ${receiptLink}
    ${invoiceLink}
    <p>If you have any questions, reply to this email.</p>
    <p>Best regards,<br/>Book Bidding Team</p>
  </div>`
    const text = `Dear ${name},\nThank you for your purchase. Your payment has been successfully processed.\nItem: ${bookName}\n${receiptUrl ? `Receipt: ${receiptUrl}\n` : ''}${invoiceUrl ? `Invoice: ${invoiceUrl}\n` : ''}Best regards, Book Bidding Team`

    const emailParams = new EmailParams()
        .setFrom(sentFrom)
        .setTo(recipients)
        .setReplyTo(sentFrom)
        .setSubject(subject)
        .setHtml(html)
        .setText(text)

    try {
        await mailerSend.email.send(emailParams)
        console.log('Purchase confirmation email sent successfully');
    } catch (error) {
        console.error('Error sending purchase confirmation email:', error)
    }
}
