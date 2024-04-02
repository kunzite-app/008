![008-Banner](https://user-images.githubusercontent.com/414967/286295040-fa676e0f-6ae8-4e7f-a2c1-432ac2596ea9.png)

# 008 Event-driven AI powered Open Source Softphone

008 is an open-source event-driven AI powered WebRTC Softphone compatible with macOS, Windows, and Linux.  
It is also accessible on the web (though official support for browser-related issues is not provided).

The name '008' or 'agent 008' reflects our ambition: beyond crafting the premier Open Source Softphone, we aim to introduce a programmable, event-driven AI agent. This agent utilizes embedded artificial intelligence models operating directly on the softphone, ensuring efficiency and reduced operational costs.

Here are the planned features [in our roadmap](https://github.com/DavidGOrtega/008/issues/1)

[:mega: Want to do a quick test it without having to install a SIP server?](#quick-test)

# Download

You can download the latest version from the [Releases](../../releases) page.

# Setup

This project is a WebRTC softphone, and communication is achieved via SIP over a socket. Leading PBX systems like Asterisk or Freeswitch support socket connections. If your provider does not offer this feature, consider using a SIP proxy such as Kamailio, Opensip or Routr.

## Configuration

The softphone is internally configured using a JSON definition (see details below). The configuration file can be loaded from either a server or a local file. 008 reads the file only once. To apply new settings, you must reload the configuration file as if it were new by clicking the green button in the configuration tab.
To do so, follow these steps:

1. Go to Settings -> Configuration (Gear Icon).
2. Fill in the 'Settings' input and 'Basic Auth' fields if needed.
3. Apply the changes by clicking the green button.

```json
{
  "sipUri": "sip:johndoe@example.com",
  "sipPassword": "securepass",
  "sipUser": "JohnDoe",
  "wsUri": "wss://example.com:8089/ws",
  "allowVideo": true,
  "allowTransfer": true,
  "allowBlindTransfer": true,
  "allowAutoanswer": false,
  "autoanswer": 5,
  "statuses": [
    { "value": "online", "text": "Online", "color": "#057e74" },
    { "value": "away", "text": "Away", "color": "#ff00ff" },
    { "value": "offline", "text": "Offline", "color": "#A9A9A9" }
  ],
  "numbers": [
    {
      "number": "+34917370224",
      "tags": ["Main"]
    },
    {
      "number": "+34917370225",
      "tags": ["Sec"]
    }
  ],
  "webhooks": [
    {
      "label": "mywebhook",
      "endpoint": "https://example.com/webhook"
    }
  ],
  "size": {
    "width": 360,
    "height": 500
  },
  "avatar": "https://example.com/avatar.jpg",
  "nickname": "John Doe" // used as Basic Auth user,
  "qTts": true, // enable transcription
  "qSummarization": true //enable summarization
}
```

### Quick test

Do you want to test it without having to install your SIP server? We have you covered!
Set `https://raw.githubusercontent.com/kunzite-app/008/master/packages/008/web/cfgDemo008.json` as your testing configuration.
Then, call the number `008`.

<img width="338" alt="Quick Test Config" src="https://github-production-user-asset-6210df.s3.amazonaws.com/414967/309506356-6ab9c32e-90a9-454c-993c-ade3046db7cd.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAVCODYLSA53PQK4ZA%2F20240302%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20240302T231629Z&X-Amz-Expires=300&X-Amz-Signature=3fa18349dd72fc4b6baed9042350685efef0bb3509d0e4d73fdab9fcb99713f3&X-Amz-SignedHeaders=host&actor_id=0&key_id=0&repo_id=0">

## Autoanswer

Autoanswer can be enabled via two options:

1.  Set `allowAutoanswer` to true and adjust `autoanswer` to the desired wait time (in seconds).
2.  Have the incoming request include the `X-Autoanswer` header with the desired wait time. This setting will override any prior setup.

## Numbers or Caller IDs

When these are specified under the field `numbers`, two fields `P-Asserted-Identity` and `X-Number` will be added to the SIP header.  
This helps identify the desired outgoing number or Caller ID in your PBX system.

# Events

One of the standout features is the event system. Every time an event is triggered, the corresponding data is dispatched to the designated webhooks or integrations in the configuration via a REST POST request.  
Most of these events also trigger the AI models that enhance the softphone in the Commercial version.  
Below, you'll find a detailed description of each event and sample payloads that you can expect at your endpoint.

<details>
  <summary>status:change</summary>

Triggered when the user changes the status within the settings.
:warning: This event does not determine the current phone network connectivity.

```json
{
  "type": "status:change",
  "data": {
    "status": "online",
    "context": {}
  }
}
```

</details>

<details>
  <summary> contact:click</summary>

Triggered when the contact link within the session screen is clicked. This link is available only if the contact can be found in the softphone's contacts.

```json
{
  "type": "phone:terminated",
  "data": {
    "contact": {
      "id": 1,
      "name": "John Doe",
      "phones": ["+1223456869"]
    },
    "context": {}
  }
}
```

</details>

<details>
  <summary>phone:ringing</summary>

Triggered after the call is emitted or received; this is determined by the `direction` field.

```json
{
  "type": "phone:ringing",
  "data": {
    "cdr": {
      "id": "uuid",
      "direction": "inbound|outbound",
      "from": "extension1",
      "to": "extension2",
      "headers": {},
      "video": false,
      "status": "ringing",
      "date": "ISO 8601 date",
      "wait": 0,
      "total": 0,
      "duration": 0
    },
    "context": {}
  }
}
```

</details>

<details>
  <summary>phone:accepted</summary>

Triggered once the call is accepted.

```json
{
  "type": "phone:ringing",
  "data": {
    "cdr": {
      "id": "uuid",
      "direction": "inbound|outbound",
      "from": "extension1",
      "to": "extension2",
      "headers": {},
      "video": false,
      "status": "answered",
      "date": "ISO 8601 date",
      "wait": 1,
      "total": 1,
      "duration": 0
    },
    "context": {}
  }
}
```

</details>

<details>
  <summary>phone:terminated</summary>

Triggered upon call termination. The status field can have one of two possible values at this point: `missed` or `answered`;

```json
{
  "type": "phone:terminated",
  "data": {
    "cdr": {
      "id": "uuid",
      "direction": "inbound|outbound",
      "from": "extension1",
      "to": "extension12",
      "headers": {},
      "video": false,
      "status": "missed|answered",
      "date": "ISO 8601 date",
      "wait": 1,
      "total": 2,
      "duration": 1
    },
    "context": {}
  }
}
```

</details>

<details>
  <summary>phone:recording</summary>

Triggered upon the recording is ready. It's sent as a base64 encoded webm file.

```json
{
  "type": "phone:recording",
  "data": {
    "id": "uuid", // the call id
    "audio": {
      "blob": "base64 webm audio file"
    },
    "context": {}
  }
}
```

</details>

<details>
  <summary>phone:transcript</summary>

Triggered upon the transcription is ready.

```json
{
  "type": "phone:transcript",
  "data": {
    "id": "uuid", // the call id
    "transcription": [
      {
        "channel": "remote|local",
        "start": 0,
        "end": 0,
        "text": ""
      }
    ],
    "context": {}
  }
}
```

</details>

<details>
  <summary>phone:summarization</summary>

Triggered upon the summarization is ready.

```json
{
  "type": "phone:summarization",
  "data": {
    "id": "uuid", // the call id
    "summarization": "text",
    "context": {}
  }
}
```

</details>

### Context

All events come with a `context` field. This includes various account details that help identify who is sending the event, among other common settings:

```json
{
  "nickname": "John Doe",
  "sipUri": "sip:johndoe@example.com",
  "sipUser": "JohnDoe",
  "language": "en",
  "device": "default",
  "status": "online",
  "size": { "width": 360, "height": 500 }
}
```

### Retry

If the http call fails the softphone will try the request 5 times delaying the request gradually up to 2.5 minutes.

### CDR payload

| Field     | Info                                                                                                                              |
| --------- | --------------------------------------------------------------------------------------------------------------------------------- |
| id        | ID obtained from SIP headers `X-Call-ID` or `Call-ID` in that order                                                               |
| direction | Determines the direction of the call: `inbound` or `outbound`                                                                     |
| from      | The initiator of the call. It is derived from the `P-Asserted-Identity` which is a `Number` if outbound or displayName if inbound |
| to        | The receiver of the call. Calculated as the opposite of the `from` field                                                          |
| video     | Indicates if the call used video: `true` or `false`                                                                               |
| status    | Possible statuses: `ringing` or `answered` or `missed`                                                                            |
| date      | ISO 8601 date format                                                                                                              |
| wait      | Number of seconds waited before the call is answered                                                                              |
| duration  | Duration of the call in seconds after it is answered                                                                              |
| total     | Total duration of the call in seconds. Calculated by adding the `wait` and `duration` values                                      |

# Community VS Commercial

We offer a commercial version that incorporates embedded AI models and provides integrations with widely recognized CRMs, Helpdesk, and analytics software. If you're interested, please [contact us](mailto:enquire@kunzite.app).

|                                   | Community      | Commercial           |
| --------------------------------- | -------------- | -------------------- |
| Support                           | `Github`       | `Dedicated`          |
| Desktop Softphone                 | :green_circle: | :green_circle:       |
| Mobile Softphone                  | sources        | :green_circle:       |
| Events                            | :green_circle: | :green_circle:       |
| Integrations                      | :red_circle:   | :green_circle:       |
| AI Speech2Text                    | :green_circle: | :green_circle:       |
| AI Summarization                  | :green_circle: | :green_circle:       |
| AI Sentiment Analysis             | :red_circle:   | :green_circle:       |
| AI KPI insights                   | :red_circle:   | :green_circle:       |
| Programmable conversational agent | `ChatGPT`      | `ChatGPT` `embedded` |

# Contributing

Every sort of contribution will be very helpful to enhance 008. How you’ll participate? All your ideas and code are welcome:

- :star: this repo! It helps us a lot.
- Report bugs
- Contribute to 008's code

# License

Released under the AGPL-3.0 license.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.

If you wish to use our software in a manner that does not allow for AGPL-3.0 compliance (e.g., incorporating our software into proprietary software), you can obtain a commercial license. This commercial license provides more flexibility in terms of integration and redistribution, but comes with its own terms and conditions. If you require a commercial license, please [send us an email](mailto:enquire@kunzite.app) directly for more information and pricing details.
