Auth
POST
Login
https://apiv2.unipay.com/v3/auth
HEADERS
Accept
application/json

Body
raw (json)
json
{
    "merchant_id": "5005046002931",
    "api_key": "e05dd67b-2e79-4b8e-9989-280bf98ac556"
}

EXAMPLE:
var axios = require('axios');
var data = '{\r\n    "merchant_id": "5005046002931",\r\n    "api_key": "e05dd67b-2e79-4b8e-9989-280bf98ac556"\r\n}';

var config = {
  method: 'post',
maxBodyLength: Infinity,
  url: 'https://apiv2.unipay.com/v3/auth',
  headers: { 
    'Accept': 'application/json'
  },
  data : data
};

axios(config)
.then(function (response) {
  console.log(JSON.stringify(response.data));
})
.catch(function (error) {
  console.log(error);
});


POST
Logout
https://apiv2.unipay.com/v3/auth/logout
AUTHORIZATION
Bearer Token
Token
{{access_token}}

Example Request: 
var axios = require('axios');
var data = '';

var config = {
  method: 'post',
maxBodyLength: Infinity,
  url: 'https://apiv2.unipay.com/v3/auth/logout',
  headers: { },
  data : data
};

axios(config)
.then(function (response) {
  console.log(JSON.stringify(response.data));
})
.catch(function (error) {
  console.log(error);
});

Order
POST
Create Order
https://apiv2.unipay.com/v3/api/order/create
AUTHORIZATION
Bearer Token
Token
{{access_token}}

HEADERS
Accept
application/json

Body
raw (json)

{
    "MerchantUser": "U7RF0G@gmail.com",
    "MerchantOrderID": "LJ6UYC4FKPI038B-29",
    "OrderPrice": 0.5,
    "OrderCurrency": "GEL",
    "OrderName": "ACVNJSIWPM",
    "OrderDescription": "AKXU0BJ5LEV97HN",
    "SuccessRedirectUrl": "aHR0cHM6Ly9zdWNjZXNzX3JlZGlyZWN0X3VybC51bmlwYXkuY29tLw==",
    "CancelRedirectUrl": "aHR0cHM6Ly9jYW5jZWxfcmVkaXJlY3RfdXJsLnVuaXBheS5jb20v",
    "CallBackUrl": "aHR0cDovL2luZm8udW5pcGF5LmNvbS8=",
    "SubscriptionPlanID": "06H7AB8YY0C4EYADZCBJY37121",
    "Mlogo": "",
    "InApp": 1,
    "Language": "GE"
}

EXAMPLE:
var axios = require('axios');
var data = '{\n    "MerchantUser": "U7RF0G@gmail.com",\n    "MerchantOrderID": "LJ6UYC4FKPI038B-29",\n    "OrderPrice": 0.5,\n    "OrderCurrency": "GEL",\n    "OrderName": "ACVNJSIWPM",\n    "OrderDescription": "AKXU0BJ5LEV97HN",\n    "SuccessRedirectUrl": "aHR0cHM6Ly9zdWNjZXNzX3JlZGlyZWN0X3VybC51bmlwYXkuY29tLw==",\n    "CancelRedirectUrl": "aHR0cHM6Ly9jYW5jZWxfcmVkaXJlY3RfdXJsLnVuaXBheS5jb20v",\n    "CallBackUrl": "aHR0cDovL2luZm8udW5pcGF5LmNvbS8=",\n    "SubscriptionPlanID": "06H7AB8YY0C4EYADZCBJY37121",\n    "Mlogo": "",\n    "InApp": 1,\n    "Language": "GE"\n}';

var config = {
  method: 'post',
maxBodyLength: Infinity,
  url: 'https://apiv2.unipay.com/v3/api/order/create',
  headers: { 
    'Accept': 'application/json'
  },
  data : data
};

axios(config)
.then(function (response) {
  console.log(JSON.stringify(response.data));
})
.catch(function (error) {
  console.log(error);
});


POST
Confirm Preauth
https://apiv2.unipay.com/v3/api/order/confirm
AUTHORIZATION
Bearer Token
Token
{{access_token}}

HEADERS
Accept
application/json

Body
raw (json)
json
{
    "OrderHashID": "MP500500163DA29A38C395",
    "Amount": 0
}

EXAMPLE:
var axios = require('axios');
var data = '{\n    "OrderHashID": "MP500500163DA29A38C395",\n    "Amount": 0\n}';

var config = {
  method: 'post',
maxBodyLength: Infinity,
  url: 'https://apiv2.unipay.com/v3/api/order/confirm',
  headers: { 
    'Accept': 'application/json'
  },
  data : data
};

axios(config)
.then(function (response) {
  console.log(JSON.stringify(response.data));
})
.catch(function (error) {
  console.log(error);
});


POST
Refund Order
https://apiv2.unipay.com/v3/api/order/refund
AUTHORIZATION
Bearer Token
Token
{{access_token}}

HEADERS
Accept
application/json

Body
raw (json)
json
{
    "OrderHashID": "MP500510664DCAB60A05B1",
    "Amount" : "10.00",
    "Reason" : "System Reversal",
    "Note": ""
}

EXAMPLE:
var axios = require('axios');
var data = '{\n    "OrderHashID": "MP500510664DCAB60A05B1",\n    "Amount" : "10.00",\n    "Reason" : "System Reversal",\n    "Note": ""\n}';

var config = {
  method: 'post',
maxBodyLength: Infinity,
  url: 'https://apiv2.unipay.com/v3/api/order/refund',
  headers: { 
    'Accept': 'application/json'
  },
  data : data
};

axios(config)
.then(function (response) {
  console.log(JSON.stringify(response.data));
})
.catch(function (error) {
  console.log(error);
});

POST
Card Details
https://apiv2.unipay.com/v3/card/get-details
AUTHORIZATION
Bearer Token
Token
{{access_token}}

HEADERS
Accept
application/json

Body
raw (json)
json
{
    "RegularpaymentID": "test"
}

EXAMPLE:
var axios = require('axios');
var data = '{\n    "RegularpaymentID": "test"\n}';

var config = {
  method: 'post',
maxBodyLength: Infinity,
  url: 'https://apiv2.unipay.com/v3/card/get-details',
  headers: { 
    'Accept': 'application/json'
  },
  data : data
};

axios(config)
.then(function (response) {
  console.log(JSON.stringify(response.data));
})
.catch(function (error) {
  console.log(error);
});

Subscription Crud
GET
list
https://apiv2.unipay.com/v3/subscription/plan-editor/
AUTHORIZATION
Bearer Token
Token
{{access_token}}

EXAMPLE:  
var axios = require('axios');

var config = {
  method: 'get',
maxBodyLength: Infinity,
  url: 'https://apiv2.unipay.com/v3/subscription/plan-editor/',
  headers: { }
};

axios(config)
.then(function (response) {
  console.log(JSON.stringify(response.data));
})
.catch(function (error) {
  console.log(error);
});

POST
create
https://apiv2.unipay.com/v3/subscription/plan-editor
AUTHORIZATION
Bearer Token
Token
{{access_token}}

Body
raw (json)

{
    "title": "new title",
    "description": "new desc",
    "price": "20.00",
    "currency": "GEL",
    "anchor_day": 15,
    "billing_interval_value": 1,
    "billing_interval_type": "monthly",
    "error_interval_value": 1,
    "error_interval_type": "daily",
    "maximum_billing_cycles": 5,
    "callback_url": "callback_url"
}

EXAMPLE: 
var axios = require('axios');
var data = '{\r\n    "title": "new title",\r\n    "description": "new desc",\r\n    "price": "20.00",\r\n    "currency": "GEL",\r\n    "anchor_day": 15,\r\n    "billing_interval_value": 1,\r\n    "billing_interval_type": "monthly",\r\n    "error_interval_value": 1,\r\n    "error_interval_type": "daily",\r\n    "maximum_billing_cycles": 5,\r\n    "callback_url": "callback_url"\r\n}';

var config = {
  method: 'post',
maxBodyLength: Infinity,
  url: 'https://apiv2.unipay.com/v3/subscription/plan-editor',
  headers: { },
  data : data
};

axios(config)
.then(function (response) {
  console.log(JSON.stringify(response.data));
})
.catch(function (error) {
  console.log(error);
});

GET
show
https://apiv2.unipay.com/v3/subscription/plan-editor/2
AUTHORIZATION
Bearer Token
Token
{{access_token}}

EXAMPLE: 
var axios = require('axios');

var config = {
  method: 'get',
maxBodyLength: Infinity,
  url: 'https://apiv2.unipay.com/v3/subscription/plan-editor/2',
  headers: { }
};

axios(config)
.then(function (response) {
  console.log(JSON.stringify(response.data));
})
.catch(function (error) {
  console.log(error);
});

PUT
update
https://apiv2.unipay.com/v3/subscription/plan-editor/3
AUTHORIZATION
Bearer Token
Token
{{access_token}}

Body
raw (json)

{
    "title": "new title updated",
    "description": "new desc updated",
    "price": "20.00",
    "currency": "GEL",
    "anchor_day": 15,
    "billing_interval_value": 1,
    "billing_interval_type": "monthly",
    "error_interval_value": 1,
    "error_interval_type": "daily",
    "maximum_billing_cycles": 5,
    "callback_url": "callback_url"
}

EXAMPLE:
var axios = require('axios');
var data = '{\r\n    "title": "new title updated",\r\n    "description": "new desc updated",\r\n    "price": "20.00",\r\n    "currency": "GEL",\r\n    "anchor_day": 15,\r\n    "billing_interval_value": 1,\r\n    "billing_interval_type": "monthly",\r\n    "error_interval_value": 1,\r\n    "error_interval_type": "daily",\r\n    "maximum_billing_cycles": 5,\r\n    "callback_url": "callback_url"\r\n}';

var config = {
  method: 'put',
maxBodyLength: Infinity,
  url: 'https://apiv2.unipay.com/v3/subscription/plan-editor/3',
  headers: { },
  data : data
};

axios(config)
.then(function (response) {
  console.log(JSON.stringify(response.data));
})
.catch(function (error) {
  console.log(error);
});


DELETE
delete
https://apiv2.unipay.com/v3/subscription/plan-editor/3
AUTHORIZATION
Bearer Token
Token
{{access_token}}

EXAMPLE:

var axios = require('axios');

var config = {
  method: 'delete',
maxBodyLength: Infinity,
  url: 'https://apiv2.unipay.com/v3/subscription/plan-editor/3',
  headers: { }
};

axios(config)
.then(function (response) {
  console.log(JSON.stringify(response.data));
})
.catch(function (error) {
  console.log(error);
});

Info
GET
Error List
https://apiv2.unipay.com/v3/info/error-list
AUTHORIZATION
Bearer Token
Token
{{access_token}}

HEADERS
Accept
application/json

Body
raw (json)
json
{
    "RegularpaymentID": "test"
}

EXAMPLE:
var axios = require('axios');
var data = '{\n    "RegularpaymentID": "test"\n}';

var config = {
  method: 'get',
maxBodyLength: Infinity,
  url: 'https://apiv2.unipay.com/v3/info/error-list',
  headers: { 
    'Accept': 'application/json'
  },
  data : data
};

axios(config)
.then(function (response) {
  console.log(JSON.stringify(response.data));
})
.catch(function (error) {
  console.log(error);
});

GET
Status List
https://apiv2.unipay.com/v3/info/status-list
AUTHORIZATION
Bearer Token
Token
{{access_token}}

HEADERS
Accept
application/json

Body
raw (json)
json
{
    "RegularpaymentID": "test"
}

EXAMPLE: 

var axios = require('axios');
var data = '{\n    "RegularpaymentID": "test"\n}';

var config = {
  method: 'get',
maxBodyLength: Infinity,
  url: 'https://apiv2.unipay.com/v3/info/status-list',
  headers: { 
    'Accept': 'application/json'
  },
  data : data
};

axios(config)
.then(function (response) {
  console.log(JSON.stringify(response.data));
})
.catch(function (error) {
  console.log(error);
});





