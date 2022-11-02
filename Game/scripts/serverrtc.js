let runtime;

runOnStartup(async runtime =>
{
	runtime.addEventListener("beforeprojectstart", () => OnBeforeProjectStart(runtime));
});

async function OnBeforeProjectStart(run)
{
	// Now the runtime is ready, get the TextInput and ResultText instances
	runtime = run;
}

export let Client = null;
export let dataChannel;

export const iceConfiguration = {
	iceServers: [
		{
        urls: [
          "stun:stun1.l.google.com:19302",
          "stun:stun2.l.google.com:19302",
        ],
      },
	],
}

export function CreateAnswer(offer)
{
	if(Client == null)
	{
		Client = new RTCPeerConnection(iceConfiguration);
		
		//ini diubah jadi ngirim data ice candidate
		Client.onicecandidate = (event) => {
			if(event.candidate != null)
			{
				runtime.callFunction("SignalIceCandidate",[JSON.stringify(event.candidate)]);
			}
		};
		
		Client.ondatachannel = e => 
		{
			dataChannel = e.channel;
			dataChannel.onmessage = e => console.log(e.data);
			dataChannel.onopen = () => console.log("masuk");		
			dataChannel.onerror = (error) => 
			{
  				console.log("Data Channel Error:", error);
			};
		}
		
		Client.setRemoteDescription(JSON.parse(offer));
		console.log(JSON.parse(offer));
		
		//ini yang nanti dikirim buat answer
		Client.createAnswer()
		.then(answer => Client.setLocalDescription(answer))
		.then(() => 
		{
			runtime.callFunction("SendAnswer",[JSON.stringify(Client.localDescription)]);
		});
	}
}

export function CheckState()
{
	console.log(Client.signalingState);
	console.log(Client.connectionState);
	console.log(Client.iceConnectionState);
	console.log(Client.iceGatheringState);
	console.log(Client.currentLocalDescription);
	console.log(Client.currentRemoteDescription);
}

export function SendMessage(data)
{
	dataChannel.send(data);
}

export function AddIceCandidate(data)
{	
	Client.addIceCandidate(JSON.parse(data)).then(() => console.log("SUCCESS ADD"), (e) => console.log("ERROR"));
	console.log(Client.connectionState);
}