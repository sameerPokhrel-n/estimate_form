// lib/email-gmail.ts
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER, // your-email@gmail.com
        pass: process.env.GMAIL_APP_PASSWORD, // Generate at myaccount.google.com/apppasswords
    },
});

export async function sendQuoteEmail(data: any) {
    const {
        fullName,
        emailAddress,
        phoneNumber,
        streetAddress,
        estimate,
        yardSize,
        servicesNeeded,
        yardCondition,
        howOften,
        additionalNotes,
        photos,
    } = data;

    // const servicesList = servicesNeeded.length > 0
    //     ? servicesNeeded.map((s: string) => s.replace(/-/g, ' ')).join(', ')
    //     : 'Grass cutting only';

    const photoCount = photos.length;
    // Convert base64 photos to attachments
    // const attachments = photos.map((photo: string, index: number) => {
    //     // Extract base64 data (remove data:image/jpeg;base64, prefix)
    //     const matches = photo.match(/^data:(.+);base64,(.+)$/);
    //     if (!matches) return null;

    //     return {
    //         filename: `yard-photo-${index + 1}.jpg`,
    //         content: matches[2], // Base64 content
    //     };
    // }).filter(Boolean);

    // Convert base64 photos to attachments
    const attachments = photos && photos.length > 0
        ? photos.map((photo: string, index: number) => {
            // Extract MIME type and base64 data
            const matches = photo.match(/^data:(.+);base64,(.+)$/);
            if (!matches) return null;

            const mimeType = matches[1]; // e.g., 'image/jpeg', 'image/png', 'video/mp4'
            const base64Data = matches[2];

            // Determine file extension from MIME type
            let extension = 'jpg';
            if (mimeType.includes('png')) extension = 'png';
            else if (mimeType.includes('mp4')) extension = 'mp4';
            else if (mimeType.includes('jpeg')) extension = 'jpg';

            return {
                filename: `yard-photo-${index + 1}.${extension}`,
                content: base64Data,
                encoding: 'base64',
                contentType: mimeType,
            };
        }).filter(Boolean)
        : [];

    // Format services list properly
    const formatServiceName = (service: string) => {
        return service
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    const servicesList = servicesNeeded && servicesNeeded.length > 0
        ? servicesNeeded.map((s: string) => formatServiceName(s)).join(', ')
        : 'Grass cutting only';

    // Format yard size
    const formatYardSize = (size: string) => {
        return size.charAt(0).toUpperCase() + size.slice(1);
    };

    // Format frequency
    const formatFrequency = (freq: string) => {
        const frequencyMap: Record<string, string> = {
            'one-time': 'One-time',
            'every-2-weeks': 'Every 2 weeks',
            'weekly': 'Weekly',
        };
        return frequencyMap[freq] || freq;
    };

    // Format condition
    const formatCondition = (condition: string) => {
        const conditionMap: Record<string, string> = {
            'well-maintained': 'Well maintained',
            'overgrown': 'Overgrown',
        };
        return conditionMap[condition] || condition;
    };


    const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            margin: 0; 
            padding: 0; 
            background: #f5f5f5; 
          }
          .container { 
            max-width: 600px; 
            margin: 20px auto; 
            background: white; 
          }
          .header { 
            background: linear-gradient(135deg, #10b981 0%, #059669 100%); 
            color: white; 
            padding: 40px 30px; 
            text-align: center; 
          }
          .header h1 { 
            margin: 0; 
            font-size: 28px; 
            font-weight: 700; 
          }
          .header p { 
            margin: 10px 0 0 0; 
            opacity: 0.9; 
          }
          .content { 
            padding: 40px 30px; 
          }
          .content p {
            margin: 0 0 15px 0;
            line-height: 1.6;
          }
          .quote-box { 
            background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); 
            border-left: 4px solid #10b981; 
            padding: 25px; 
            margin: 30px 0; 
            border-radius: 8px; 
          }
          .estimate-label { 
            font-size: 14px; 
            color: #666; 
            margin: 0 0 5px 0; 
          }
          .estimate { 
            font-size: 36px; 
            font-weight: 800; 
            color: #059669; 
            margin: 10px 0; 
            line-height: 1;
          }
          .estimate-note {
            margin: 15px 0 0 0; 
            font-size: 13px; 
            color: #666;
            line-height: 1.5;
          }
          .section { 
            margin: 30px 0; 
          }
          .section-title { 
            font-size: 12px; 
            font-weight: 700; 
            color: #999; 
            text-transform: uppercase; 
            letter-spacing: 0.5px; 
            margin: 0 0 15px 0; 
          }
          .detail-row { 
            padding: 12px 0; 
            border-bottom: 1px solid #f0f0f0; 
            display: table;
            width: 100%;
          }
          .detail-row:last-child { 
            border-bottom: none; 
          }
          .detail-label { 
            font-weight: 600; 
            color: #666;
            display: table-cell;
            width: 40%;
            padding-right: 15px;
          }
          .detail-value { 
            color: #111; 
            font-weight: 500;
            display: table-cell;
            width: 60%;
            word-wrap: break-word;
          }
          .breakdown { 
            background: #fafafa; 
            padding: 20px; 
            border-radius: 8px; 
            margin: 20px 0; 
          }
          .breakdown-row { 
            display: table;
            width: 100%;
            padding: 8px 0; 
            font-size: 15px; 
          }
          .breakdown-label {
            display: table-cell;
            width: 70%;
          }
          .breakdown-value {
            display: table-cell;
            width: 30%;
            text-align: right;
          }
          .breakdown-total { 
            border-top: 2px solid #ddd; 
            margin-top: 10px; 
            padding-top: 15px; 
            font-weight: 700; 
            font-size: 16px; 
          }
          .info-box {
            background: #f0f9ff; 
            border-left: 4px solid #3b82f6; 
            padding: 20px; 
            margin: 30px 0; 
            border-radius: 6px;
          }
          .info-box-title {
            margin: 0 0 10px 0; 
            font-weight: 600; 
            color: #1e40af;
          }
          .info-box-text {
            margin: 0; 
            color: #666; 
            font-size: 14px; 
            line-height: 1.6;
          }
          .footer { 
            background: #fafafa; 
            padding: 30px; 
            text-align: center; 
            color: #999; 
            font-size: 13px; 
          }
          .footer p {
            margin: 5px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🌿 Your Lawn Care Quote</h1>
            <p>Oshawa's trusted lawn care service</p>
          </div>
          
          <div class="content">
            <p style="font-size: 16px; margin: 0 0 10px 0;">
              Hi <strong>${fullName}</strong>,
            </p>
            <p style="color: #666; margin: 0 0 30px 0;">
              Thank you for requesting a quote! Based on your yard details, here's your personalized estimate:
            </p>
            
            <div class="quote-box">
              <p class="estimate-label">Estimated Total</p>
              <div class="estimate">$${estimate.total.min}–$${estimate.total.max}</div>
              <p class="estimate-note">
                ✓ ${formatFrequency(howOften)}${howOften === 'weekly' ? ' (15% discount applied)' : howOften === 'every-2-weeks' ? ' (10% discount applied)' : ''}
              </p>
            </div>

            <div class="breakdown">
              <div class="breakdown-row">
                <span class="breakdown-label">Base service (${formatYardSize(yardSize)} yard)</span>
                <span class="breakdown-value">$${estimate.base}</span>
              </div>
              ${estimate.addons > 0 ? `
              <div class="breakdown-row">
                <span class="breakdown-label">Add-on services</span>
                <span class="breakdown-value">+$${estimate.addons}</span>
              </div>
              ` : ''}
              <div class="breakdown-row breakdown-total">
                <span class="breakdown-label">Estimated Total Range</span>
                <span class="breakdown-value" style="color: #059669;">$${estimate.total.min}–$${estimate.total.max}</span>
              </div>
            </div>

            <div class="section">
              <div class="section-title">Service Details</div>
              
              <div class="detail-row">
                <span class="detail-label">Property Address</span>
                <span class="detail-value">${streetAddress}</span>
              </div>
              
              <div class="detail-row">
                <span class="detail-label">Yard Size</span>
                <span class="detail-value">${formatYardSize(yardSize)}</span>
              </div>
              
              <div class="detail-row">
                <span class="detail-label">Services</span>
                <span class="detail-value">${servicesList}</span>
              </div>
              
              <div class="detail-row">
                <span class="detail-label">Yard Condition</span>
                <span class="detail-value">${formatCondition(yardCondition)}</span>
              </div>
              
              <div class="detail-row">
                <span class="detail-label">Service Frequency</span>
                <span class="detail-value">${formatFrequency(howOften)}</span>
              </div>
              
              <div class="detail-row">
                <span class="detail-label">Photos Uploaded</span>
                <span class="detail-value">${photoCount} photo${photoCount !== 1 ? 's' : ''}</span>
              </div>
              
              ${additionalNotes && additionalNotes.trim() ? `
              <div class="detail-row">
                <span class="detail-label">Special Notes</span>
                <span class="detail-value">${additionalNotes}</span>
              </div>
              ` : ''}
            </div>

            <div class="info-box">
              <p class="info-box-title">📅 Next Steps</p>
              <p class="info-box-text">
                Our team will review your photos and property details within 24 hours. 
                We'll contact you at <strong>${phoneNumber}</strong> to confirm the final quote and schedule your service.
              </p>
            </div>

            <p style="margin: 30px 0 10px 0; color: #666;">
              Questions? Reply to this email or call us anytime!
            </p>
            
            <p style="margin: 0; color: #111; font-weight: 600;">
              The Lawn Care Team<br>
              <span style="color: #666; font-weight: 400; font-size: 14px;">Oshawa &amp; Durham Region</span>
            </p>
          </div>
          
          <div class="footer">
            <p>This is an automated quote estimate.</p>
            <p>Final pricing confirmed after property review • No hidden fees • Satisfaction guaranteed</p>
          </div>
        </div>
      </body>
    </html>
  `;

    //     const htmlContent = `
    //     <!DOCTYPE html>
    //     <html>
    //       <head>
    //         <style>
    //           body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f5f5f5; }
    //           .container { max-width: 600px; margin: 20px auto; background: white; }
    //           .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 40px 30px; text-align: center; }
    //           .header h1 { margin: 0; font-size: 28px; font-weight: 700; }
    //           .header p { margin: 10px 0 0 0; opacity: 0.9; }
    //           .content { padding: 40px 30px; }
    //           .quote-box { background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border-left: 4px solid #10b981; padding: 25px; margin: 30px 0; border-radius: 8px; }
    //           .estimate { font-size: 36px; font-weight: 800; color: #059669; margin: 10px 0; }
    //           .estimate-label { font-size: 14px; color: #666; margin: 0; }
    //           .section { margin: 30px 0; }
    //           .section-title { font-size: 12px; font-weight: 700; color: #999; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 15px; }
    //           .detail-row { padding: 12px 0; border-bottom: 1px solid #f0f0f0; display: flex; justify-content: space-between; }
    //           .detail-row:last-child { border-bottom: none; }
    //           .label { font-weight: 600; color: #666; }
    //           .value { color: #111; font-weight: 500; }
    //           .breakdown { background: #fafafa; padding: 20px; border-radius: 8px; margin: 20px 0; }
    //           .breakdown-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 15px; }
    //           .breakdown-total { border-top: 2px solid #ddd; margin-top: 10px; padding-top: 15px; font-weight: 700; font-size: 16px; }
    //           .footer { background: #fafafa; padding: 30px; text-align: center; color: #999; font-size: 13px; }
    //           .button { display: inline-block; background: #10b981; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
    //         </style>
    //       </head>
    //       <body>
    //         <div class="container">
    //           <div class="header">
    //             <h1>🌿 Your Lawn Care Quote</h1>
    //             <p>Oshawa's trusted lawn care service</p>
    //           </div>

    //           <div class="content">
    //             <p style="font-size: 16px; margin: 0 0 10px 0;">Hi <strong>${fullName}</strong>,</p>
    //             <p style="color: #666; margin: 0 0 30px 0;">
    //               Thank you for requesting a quote! Based on your yard details, here's your personalized estimate:
    //             </p>

    //             <div class="quote-box">
    //               <p class="estimate-label">Estimated Total</p>
    //               <div class="estimate">$${estimate.total.min}–$${estimate.total.max}</div>
    //               <p style="margin: 15px 0 0 0; font-size: 13px; color: #666;">
    //                 ✓ ${howOften === 'weekly' ? 'Weekly service (15% discount applied)' : howOften === 'every-2-weeks' ? 'Bi-weekly service (10% discount applied)' : 'One-time service'}
    //               </p>
    //             </div>

    //             <div class="breakdown">
    //               <div class="breakdown-row">
    //                 <span>Base service (${yardSize} yard) </span>
    //                 <span>$${estimate.base}</span>
    //               </div>
    //               ${estimate.addons > 0 ? `
    //               <div class="breakdown-row">
    //                 <span>Add-on services </span>
    //                 <span> "+$${estimate.addons}"</span>
    //               </div>
    //               ` : ''}
    //               <div class="breakdown-row breakdown-total">
    //                 <span>Estimated Total Range </span>
    //                 <span style="color: #059669;">$${estimate.total.min}–$${estimate.total.max}</span>
    //               </div>
    //             </div>

    //             <div class="section">
    //               <div class="section-title">Service Details</div>
    //               <div class="detail-row">
    //                 <span class="label">Property Address </span>
    //                 <span class="value">${streetAddress}</span>
    //               </div>
    //               <div class="detail-row">
    //                 <span class="label">Yard Size </span>
    //                 <span class="value">${yardSize.charAt(0).toUpperCase() + yardSize.slice(1)}</span>
    //               </div>
    //               <div class="detail-row">
    //                 <span class="label">Services </span>
    //                 <span class="value">${servicesList}</span>
    //               </div>
    //               <div class="detail-row">
    //                 <span class="label">Yard Condition </span>
    //                 <span class="value">${yardCondition === 'well-maintained' ? 'Well maintained' : 'Overgrown'}</span>
    //               </div>
    //               <div class="detail-row">
    //                 <span class="label">Service Frequency </span>
    //                 <span class="value">${howOften === 'one-time' ? 'One-time' : howOften === 'every-2-weeks' ? 'Every 2 weeks' : 'Weekly'}</span>
    //               </div>
    //               <div class="detail-row">
    //                 <span class="label">Photos Uploaded </span>
    //                 <span class="value">${photoCount} photo(s)</span>
    //               </div>
    //               ${additionalNotes ? `
    //               <div class="detail-row">
    //                 <span class="label">Special Notes </span>
    //                 <span class="value">${additionalNotes}</span>
    //               </div>
    //               ` : ''}
    //             </div>

    //             <div style="background: #f0f9ff; border-left: 4px solid #3b82f6; padding: 20px; margin: 30px 0; border-radius: 6px;">
    //               <p style="margin: 0 0 10px 0; font-weight: 600; color: #1e40af;">📅 Next Steps</p>
    //               <p style="margin: 0; color: #666; font-size: 14px; line-height: 1.6;">
    //                 Our team will review your photos and property details within 24 hours. 
    //                 We'll contact you at <strong>${phoneNumber}</strong> to confirm the final quote and schedule your service.
    //               </p>
    //             </div>

    //             <p style="margin: 30px 0 10px 0; color: #666;">
    //               Questions? Reply to this email or call us anytime!
    //             </p>

    //             <p style="margin: 0; color: #111; font-weight: 600;">
    //               The Lawn Care Team<br>
    //               <span style="color: #666; font-weight: 400; font-size: 14px;">Oshawa & Durham Region</span>
    //             </p>
    //           </div>

    //           <div class="footer">
    //             <p style="margin: 0 0 5px 0;">This is an automated quote estimate.</p>
    //             <p style="margin: 0;">Final pricing confirmed after property review • No hidden fees • Satisfaction guaranteed</p>
    //           </div>
    //         </div>
    //       </body>
    //     </html>
    //   `;

    try {
        // Send to customer - WORKS IMMEDIATELY
        await transporter.sendMail({
            from: `"Yard Cleaning and Lawn Care Oshawa" <${process.env.GMAIL_USER}>`,
            to: emailAddress,
            subject: `Your Lawn Care Quote: $${estimate.total.min}–$${estimate.total.max}`,
            html: htmlContent,
        });

        // Send to business
        await transporter.sendMail({
            from: `"Yard Cleaning and Lawn Care Oshawa" <${process.env.GMAIL_USER}>`,
            to: process.env.BUSINESS_EMAIL,
            subject: `New Quote: ${fullName}`,
            html: htmlContent,
            attachments: attachments, // Include photos as attachments
        });

        console.log('✅ Emails sent via Gmail');
    } catch (error) {
        console.error('❌ Gmail error:', error);
        throw error;
    }
}