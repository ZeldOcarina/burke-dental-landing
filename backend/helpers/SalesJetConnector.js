const axios = require("axios");

class SalesJetConnector {
    constructor({ salesJetApiKey, eventName, lead }) {
        this.endpointUrl = "https://sj-api.com/externalapp/track";
        this.salesJetApiKey = salesJetApiKey;
        this.eventName = eventName;
        this.lead = lead;
        this.createWebhook();
    }

    createWebhook() {
        this.webhookData = {
            event_name: this.eventName, // YOUR EVENT NAME GOES HERE,
            contact: {
                email: this.lead.email,
                first_name: this.lead.first_name,
                last_name: this.lead.last_name,
                phone_number: this.lead.phone_number,
                custom_attributes: {
                    "message": this.lead.message,
                    "form_conversion": this.lead.form_conversion,
                    "current_page": this.lead.current_page,
                    "utm_campaign": this.lead.utm_campaign,
                    "utm_content": this.lead.utm_content,
                    "utm_id": this.lead.utm_id,
                    "utm_medium": this.lead.utm_medium,
                    "utm_source": this.lead.utm_source,
                    "utm_term": this.lead.utm_term,
                }
            }
        };
    }

    async connectLeadWithSalesJet() {
        const axiosPromise = axios({
            url: this.endpointUrl,
            headers: {
                "Content-Type": "application/json",
                Authorization: this.salesJetApiKey,
            },
            method: "POST",
            data: this.webhookData,
        });

        return axiosPromise;
    }
}

module.exports = SalesJetConnector
