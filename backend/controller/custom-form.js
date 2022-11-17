const axios = require("axios").default;
const MudConnector = require("../helpers/MudConnector");
const { sendEmail } = require("../config/emailConfig");

exports.handleCustomFormSubmit = async (req, res) => {
    try {
        // console.log(req.body.leadData);
        // return res.status(200).json({ message: "success" });

        // This is to check what has been placed as an url in the config is a valid url
        const _ = new URL(req.body.zapierWebhookUrl);

        // console.log(req.body.zapierWebhookUrl);

        // return res.status(200).json({ message: "success" });

        const zapierPromise = axios.post(req.body.zapierWebhookUrl, req.body);

        const mudConnectorOptions = {
            handshakeKey: process.env.MUD_HANDSHAKE_KEY,
            CampaignID: parseInt(req.body.mudCampaignId),
            clientName: process.env.MUD_CLIENT_NAME,
            lead: {
                first_name: req.body.leadData.firstName,
                last_name: req.body.leadData.lastName,
                email: req.body.leadData.email,
                phone_number: req.body.leadData.phone,
                checkReceiveOffer: req.body.leadData.checkReceiveOffer,
                surveyAnswers: JSON.stringify(req.body.questions)
            },
        }

        // Send form to MUD
        const mudConnector = new MudConnector(mudConnectorOptions)

        const mudPromise = mudConnector.connectLeadWithMud();

        const responses = await Promise.all([zapierPromise, mudPromise]);
        console.log(responses[0]);
        return res.status(200).send("Form submitted successfully");

    } catch (err) {
        console.error(err);
        if (err.message === "Invalid URL") {
            return res.status(400).send("Invalid endpoint URL. Please update the Code column on the CustomForm row and make it a valid url.");
        }

        await sendEmail({
            to: "mattia@monarchy.io",
            subject: `One of the services for ${process.env.BUSINESS_NAME} failed`,
            text: `One of the services for ${process.env.BUSINESS_NAME} failed.\n\n${JSON.stringify(err)}`,
        });

        res.status(500).send("Error submitting form");
    }

}