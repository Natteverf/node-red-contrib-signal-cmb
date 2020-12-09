
module.exports = function(RED) {

	/**
	 * Define Constanten
	 */
    const RootLink= "https://api.callmebot.com/whatsapp.php?";
    
    /**
	 * Function WhatsAppAccount
	 * @param {Config} config 
	 */
	function WhatsAppAccount(config) {
		RED.nodes.createNode(this, config);
        var node = this;
        node.key = this.credentials.key; 	
        node.phonenumber = this.credentials.phonenumber; 
	}




    /**
	 * Function SendMessage
	 * @param {Config} config 
	 */
	function SendMessage(config) {
		RED.nodes.createNode(this, config);
        var node = this;
        this.credentials = RED.nodes.getNode(config.account);
        
		this.on('input', function(msg) {
            var sendText = msg.text || config.text;
            //Build Request-Link
            var reqUrl = RootLink + "phone=" + this.credentials.phonenumber +"&text=" + encodeURIComponent(sendText)+ "&apikey=" + this.credentials.key + "&source=nodered";
            //Run Request
            var request;
            if(config.rejectssl){
                request = require('request').defaults({rejectUnauthorized:false});
            }else{
                request = require('request')
            }
            request(reqUrl, function(error, response, body) {
                try {
                    if (error) {
                        node.error(msg)
                    } else {
                        if (body.includes('APIKey is invalid')){
                            node.error("API-KEY not valid!")
                        }else{
                            msg.text = sendText;
                            msg.payload = "Message was send successfully";
                            node.send(msg);
                        }
                    }
                } catch(error) {
                        node.error(error)
                }
            })
        })
    }


    
    /**
	 * Register Nodes
	 */
    RED.nodes.registerType('node-red-whatsapp-account', WhatsAppAccount,{
        credentials: {
            key: {type:"password"},
            phonenumber: {type:"text"}
        }
    });
    RED.nodes.registerType('node-red-whatsapp-send-message', SendMessage);
}