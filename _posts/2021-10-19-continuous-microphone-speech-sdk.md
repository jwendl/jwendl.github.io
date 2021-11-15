---
layout: post
title:  "Continuous Microphone Azure Speech SDK"
date:   2021-10-19 13:11:00
categories:
 - Azure SDK
tags:
 - speech
 - azure
---
## Running the Azure Speech to Text Service from Docker

The steps that I will use are based on the following [article](https://docs.microsoft.com/en-us/azure/cognitive-services/speech-service/speech-container-howto?tabs=stt%2Ccsharp%2Csimple-format#run-the-container-with-docker-run).

I run docker out of WSL and used the following [setup](https://github.com/frcs6/DockerWSL-Tutorial#:~:text=Docker%20Engine%20on%20WSL%20%2B%20Visual%20Studio%202019,...%206%20Visual%20Studio%202019.%20...%207%20References).

To get this docker container to run for me inside WSL I just ran the following bash command

``` bash
docker run --rm -it -p 5000:5000 --memory 4g --cpus 4 \
    mcr.microsoft.com/azure-cognitive-services/speechservices/speech-to-text \
    Eula=accept \
    Billing=https://westus2.api.cognitive.microsoft.com/sts/v1.0/issuetoken \
    ApiKey={speech service api key}
```

> Where the {speech service api key} is the value from the speech portal where your speech service is setup.

## Connecting to the Azure Speech to Text Service and Continuously Run the Microphone

So to get the [Azure Speech SDK](https://docs.microsoft.com/en-us/azure/cognitive-services/speech-service/get-started-speech-to-text?tabs=windowsinstall&pivots=programming-language-csharp) to connect to the locally running docker container, all I did was use the following code in C#.

``` csharp
using Microsoft.CognitiveServices.Speech;
using Microsoft.CognitiveServices.Speech.Audio;
using System;
using System.Threading.Tasks;

namespace ContinuousSpeechDemo
{
    class Program
    {
        static async Task Main()
        {
            var speechConfiguration = SpeechConfig.FromHost(new Uri("ws://localhost:5000"));

            using var audioConfiguration = AudioConfig.FromDefaultMicrophoneInput();
            using var speechRecognizeer = new SpeechRecognizer(speechConfiguration, audioConfiguration);

            Console.WriteLine("Say Stuff");
            speechRecognizeer.Recognized += SpeechRecognizeer_Recognized;
            await speechRecognizeer.StartContinuousRecognitionAsync();

            Console.WriteLine("Please press <Return> to continue.");
            Console.ReadLine();
        }

        private static void SpeechRecognizeer_Recognized(object sender, SpeechRecognitionEventArgs e)
        {
            Console.WriteLine($"I recognized the text: {e.Result.Text}");
        }
    }
}
```

This code above is essentially creating an event handler on speechRecognizer and having it's configuration pointed at ws://localhost:5000 (which is our docker container). So every time the Speech SDK recognizes that it is a complete phrase, it will send the text off to the Azure Speech to Text service and then call the SpeechRecognizer_Recognized event handler with the result.
