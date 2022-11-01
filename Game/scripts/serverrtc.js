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
			urls: "stun:openrelay.metered.ca:80",
		},
		{
			urls: "turn:openrelay.metered.ca:80",
			username: "openrelayproject",
			credential: "openrelayproject",
		},
		{
			urls: "turn:openrelay.metered.ca:443",
			username: "openrelayproject",
			credential: "openrelayproject",
		},
		{
			urls: "turn:openrelay.metered.ca:443?transport=tcp",
			username: "openrelayproject",
			credential: "openrelayproject",
		},
	],
}

export function CreateAnswer(offer)
{
	if(Client == null)
	{
		Client = new RTCPeerConnection();
		
		//ini diubah jadi ngirim data ice candidate
		Client.onicecandidate = () => {runtime.callFunction("SignalIceCandidate",[JSON.stringify(Client.localDescription)])};
		
		Client.ondatachannel = e => 
		{
			dataChannel = e.channel;
			dataChannel.onmessage = e => console.log(e.data);
			dataChannel.onopen = e => console.log("masuk");
		}
		
		Client.setRemoteDescription(JSON.parse(offer));
		
		//ini yang nanti dikirim buat answer
		Client.createAnswer()
		.then(answer => Client.setLocalDescription(answer))
		.then(() => 
		{
			runtime.callFunction("SendAnswer",[JSON.stringify(Client.localDescription)]);
		});
	}
}


export function SendMessage(data)
{
	dataChannel.send(data);
}

export function AddIceCandidate(data)
{
	Client.addIceCandidate(JSON.parse(data));
	console.log(Client.connectionState);
}