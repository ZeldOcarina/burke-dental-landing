module.exports = function ({
    first_name, last_name, email, phone_number, service, message, offer
}) {
    return `<!DOCTYPE html>
    <html xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="en">
    
    <head>
        <title></title>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <!--[if mso]><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch><o:AllowPNG/></o:OfficeDocumentSettings></xml><![endif]-->
        <!--[if !mso]><!-->
        <link href="https://fonts.googleapis.com/css?family=Bitter" rel="stylesheet" type="text/css">
        <link href="https://fonts.googleapis.com/css?family=Oxygen" rel="stylesheet" type="text/css">
        <link href="https://fonts.googleapis.com/css?family=Oswald" rel="stylesheet" type="text/css">
        <link href="https://fonts.googleapis.com/css?family=Open+Sans" rel="stylesheet" type="text/css">
        <link href="https://fonts.googleapis.com/css?family=Abril+Fatface" rel="stylesheet" type="text/css">
        <link href="https://fonts.googleapis.com/css?family=Montserrat" rel="stylesheet" type="text/css">
        <!--<![endif]-->
        <style>
            * {
                box-sizing: border-box;
            }
    
            body {
                margin: 0;
                padding: 0;
            }
    
            a[x-apple-data-detectors] {
                color: inherit !important;
                text-decoration: inherit !important;
            }
    
            #MessageViewBody a {
                color: inherit;
                text-decoration: none;
            }
    
            p {
                line-height: inherit
            }
    
            .desktop_hide,
            .desktop_hide table {
                mso-hide: all;
                display: none;
                max-height: 0px;
                overflow: hidden;
            }
    
            @media (max-width:670px) {
    
                .image_block img.big,
                .row-content {
                    width: 100% !important;
                }
    
                .mobile_hide {
                    display: none;
                }
    
                .stack .column {
                    width: 100%;
                    display: block;
                }
    
                .mobile_hide {
                    min-height: 0;
                    max-height: 0;
                    max-width: 0;
                    overflow: hidden;
                    font-size: 0px;
                }
    
                .desktop_hide,
                .desktop_hide table {
                    display: table !important;
                    max-height: none !important;
                }
            }
        </style>
    </head>
    
    <body style="background-color: #FFFFFF; margin: 0; padding: 0; -webkit-text-size-adjust: none; text-size-adjust: none;">
        <table class="nl-container" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #FFFFFF;">
            <tbody>
                <tr>
                    <td>
                        <table class="row row-1" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                            <tbody>
                                <tr>
                                    <td>
                                        <table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; color: #000000; width: 650px;" width="650">
                                            <tbody>
                                                <tr>
                                                    <td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; vertical-align: top; padding-top: 0px; padding-bottom: 0px; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                                                        <div class="spacer_block mobile_hide" style="height:40px;line-height:40px;font-size:1px;">&#8202;</div>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                        <table class="row row-2" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #ffffff;">
                            <tbody>
                                <tr>
                                    <td>
                                        <table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #242729; color: #000000; width: 650px;" width="650">
                                            <tbody>
                                                <tr>
                                                    <td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; vertical-align: top; padding-top: 25px; padding-bottom: 25px; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                                                        <table class="text_block block-1" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
                                                            <tr>
                                                                <td class="pad" style="padding-left:10px;padding-right:10px;">
                                                                    <div style="font-family: sans-serif">
                                                                        <div class="txtTinyMce-wrapper" style="font-size: 12px; font-family: Arial, Helvetica Neue, Helvetica, sans-serif; mso-line-height-alt: 14.399999999999999px; color: #ffffff; line-height: 1.2;">
                                                                            <p style="margin: 0; text-align: center;"><span style="font-size:42px;">We Have a New </span></p>
                                                                            <p style="margin: 0; text-align: center;"><span style="font-size:42px;">${offer ? "Offer Request!" : "Appointment Request!"}</span></p>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        </table>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                        <table class="row row-3" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                            <tbody>
                                <tr>
                                    <td>
                                        <table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #f0f0f0; color: #000000; width: 650px;" width="650">
                                            <tbody>
                                                <tr>
                                                    <td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; border-left: 0px solid #F0F0F0; border-right: 0px solid #F0F0F0; vertical-align: top; padding-top: 0px; padding-bottom: 0px; border-top: 0px; border-bottom: 0px;">
                                                        <table class="image_block block-1" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                                            <tr>
                                                                <td class="pad" style="width:100%;padding-right:0px;padding-left:0px;">
                                                                    <div class="alignment" align="center" style="line-height:10px"><img class="big" src="https://d15k2d11r6t6rl.cloudfront.net/public/users/Integrators/BeeProAgency/549121_530277/Nu-Dentistry-Submit-Form.jpg" style="display: block; height: auto; border: 0; width: 650px; max-width: 100%;" width="650"></div>
                                                                </td>
                                                            </tr>
                                                        </table>
                                                        <table class="text_block block-2" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
                                                            <tr>
                                                                <td class="pad" style="padding-bottom:40px;padding-left:40px;padding-right:40px;padding-top:20px;">
                                                                    <div style="font-family: 'Trebuchet MS', Tahoma, sans-serif">
                                                                        <div class="txtTinyMce-wrapper" style="font-size: 12px; mso-line-height-alt: 18px; color: #5d5d5d; line-height: 1.5; font-family: 'Montserrat', 'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif;">
                                                                            <p style="margin: 0; mso-line-height-alt: 24px;"><span style="font-size:16px;">Hello!</span></p>
                                                                            <p style="margin: 0; mso-line-height-alt: 18px;">&nbsp;</p>
                                                                            <p style="margin: 0; mso-line-height-alt: 24px;"><span style="font-size:16px;">We just got a new ${offer ? "dental offer request" : "contact request"} from the website!</span></p>
                                                                            <p style="margin: 0; mso-line-height-alt: 18px;">&nbsp;</p>
                                                                            <p style="margin: 0; mso-line-height-alt: 24px;"><span style="font-size:16px;">Here is all the related data:</span></p>
                                                                            <p style="margin: 0; mso-line-height-alt: 18px;">&nbsp;</p>
                                                                            <p style="margin: 0; mso-line-height-alt: 24px;"><span style="font-size:16px;">First Name:&nbsp;${first_name}</span><br><span style="font-size:16px;">Last Name:&nbsp;${last_name}</span><br><span style="font-size:16px;">Email:&nbsp;${email}</span><br><span style="font-size:16px;">Phone Number:&nbsp;${phone_number}</span></p>
                                                                            <p style="margin: 0; mso-line-height-alt: 24px;"><span style="font-size:16px;">Service:&nbsp;${service}</span></p>
                                                                            ${!offer ? `<p style="margin: 0; mso-line-height-alt: 24px;"><span style="font-size:16px;">Message:&nbsp;${message}</span></p>` : ""}
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        </table>
                                                        <table class="text_block block-3" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
                                                            <tr>
                                                                <td class="pad" style="padding-bottom:40px;padding-left:40px;padding-right:40px;padding-top:20px;">
                                                                    <div style="font-family: 'Trebuchet MS', Tahoma, sans-serif">
                                                                        <div class="txtTinyMce-wrapper" style="font-size: 12px; mso-line-height-alt: 18px; color: #5d5d5d; line-height: 1.5; font-family: 'Montserrat', 'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif;">
                                                                            <p style="margin: 0; mso-line-height-alt: 24px;"><span style="font-size:16px;">Yours,</span></p>
                                                                            <p style="margin: 0; mso-line-height-alt: 24px;"><span style="font-size:16px;">Dental Game Plan Team</span></p>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        </table>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                        <table class="row row-4" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                            <tbody>
                                <tr>
                                    <td>
                                        <table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; color: #000000; width: 650px;" width="650">
                                            <tbody>
                                                <tr>
                                                    <td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; vertical-align: top; padding-top: 0px; padding-bottom: 0px; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                                                        <div class="spacer_block mobile_hide" style="height:40px;line-height:40px;font-size:1px;">&#8202;</div>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </td>
                </tr>
            </tbody>
        </table><!-- End -->
    </body>
    
    </html>`
}