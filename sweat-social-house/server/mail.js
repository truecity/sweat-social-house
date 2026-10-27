import { Resend } from 'resend';
import { settings } from './config.js';
import { HttpError } from './security.js';
export async function sendLink(email,token,purpose,id) {
  const cfg=settings();
  if(!cfg.ready)throw new HttpError(503,'Signup is not open yet. Please check back soon.');
  const url=cfg.origin+'/preferences.html#'+new URLSearchParams({token,purpose});
  const confirming=purpose==='confirm';
  const text=confirming?
    `Welcome to Sweat Social House!\n\nConfirm your email to join our Summer 2027 launch list:\n${url}\n\nOpen the link and select Confirm signup. It expires in 24 hours. Joining is not a ticket or reservation. Optional marketing is separate from launch-list emails.\n\nIf you did not request this, ignore this email. Unconfirmed requests expire after 7 days.\n\nManage your preferences or request removal at ${cfg.origin}/preferences.html\nQuestions? ${cfg.contact}`:
    `Use this private link to manage Sweat Social House email preferences or remove your subscriber record:\n${url}\n\nThe link expires in 30 minutes. Opening it does not change or delete anything; you must confirm your choice on the page. If you did not request it, ignore this email.\n\nQuestions? ${cfg.contact}`;
  const {error}=await new Resend(process.env.RESEND_API_KEY).emails.send({from:cfg.from,to:[email],replyTo:cfg.contact,subject:confirming?'Confirm your Sweat Social House signup':'Your Sweat Social House preferences link',text},{idempotencyKey:'ssh-'+purpose+'-'+id});
  if(error)throw new HttpError(503,'We could not send the email. Please try again shortly or contact hello@sweatsocialhouse.com.');
}
