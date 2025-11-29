import 'dotenv/config';
import { MailerSend, EmailParams, Sender, Recipient } from "mailersend";
import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import type { RequestHandler } from './$types';

// MailerSend Config
// check if env.MAILERSEND_API_KEY is set
if (!env.MAILERSEND_API_KEY) {
    throw new Error('MAILERSEND_API_KEY is not set');
}

const mailerSend = new MailerSend({
    apiKey: env.MAILERSEND_API_KEY,
});

// const PDF_GUIDE_URL = 'https://narrify-public.s3.eu-central-1.amazonaws.com/sample.pdf';

export const POST: RequestHandler = async ({ request }) => {
    // const requestBody = await request.json();
    // const { email, name, bookName } = requestBody;

    // const sentFrom = new Sender("MS_0aZPYE@test-yxj6lj9250x4do2r.mlsender.net", "Book Bidding");

    // const recipients = [
    //     // new Recipient(email, name)
    //     new Recipient('rabbit.bot@outlook.com', name)
    // ];

    // // const personalization = [
    // //     {
    // //         email: "nawongsak@gmail.com",
    // //         data: {
    // //             name,
    // //             bookName,
    // //         },
    // //     }
    // // ];

    // const emailParams = new EmailParams()
    //     .setFrom(sentFrom)
    //     .setTo(recipients)
    //     .setReplyTo(sentFrom)
    //     // .setPersonalization(personalization)
    //     .setSubject("Purchase Confirmation, {{ name }}")
    //     .setHtml("This is the HTML content, {{ name }} purchased {{ bookName }}")
    //     .setText("This is the text content, {{ name }} purchased {{ bookName }}");

    // try {
    //     await mailerSend.email.send(emailParams);
    //     return json({ message: 'Email sent successfully' });
    // } catch (error) {
    //     console.error(error);
    //     return json({ message: 'Error sending email' }, { status: 500 });
    // }

    return json({ message: 'Purchase Confirmation sent successfully' });
}
