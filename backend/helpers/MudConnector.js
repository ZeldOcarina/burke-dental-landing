const axios = require("axios");
const url = require('url');

/* *************
* MudConnector *
* **************/

class MudConnector {
    constructor({ handshakeKey, clientId, clientName, CampaignID, lead }) {
        this.endpointUrl = "https://agent.dentalgameplan.com/marketing/marketingtracking";
        this.HandshakeKey = handshakeKey;
        this.client_id = clientId;
        this.client_name = clientName;
        this.CampaignID = CampaignID;
        this.lead = lead;
        this.createRequest();
    }

    createRequest() {
        this.params = {
            formdata: 1,
            HandshakeKey: this.HandshakeKey,
            // ClientID: this.client_id,
            CampaignID: this.CampaignID,
            // client_name: this.client_name,
            First_Name: `${this.lead.first_name} ${this.lead.last_name}`,
            Email: this.lead.email,
            Phone_Number: this.lead.phone_number,
            selectService: this.lead.service,
            checkReceiveOffer: this.lead.checkReceiveOffer ? "Yes" : "No",
            dr_notes: this.lead.surveyAnswers
        };
    }

    async connectLeadWithMud() {
        const axiosInstance = axios({
            url: this.endpointUrl,
            method: "POST",
            data: this.params,
            headers: { 'Content-Type': 'application/json' },
        });

        return axiosInstance;
    }
}

module.exports = MudConnector
