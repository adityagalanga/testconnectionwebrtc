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
		Client = new RTCPeerConnection(iceConfiguration);
		Client.onicecandidate = () => {runtime.callFunction("SignalIceCandidate",[JSON.stringify(Client.localDescription)])};
		
		Client.ondatachannel = e => 
		{
			dataChannel = e.channel;
			dataChannel.onmessage = e => console.log(e.data);
			dataChannel.onopen = e => console.log("masuk");
		}
		
		Client.setRemoteDescription(offer);
		Client.createAnswer().then(answer => Client.setLocalDescription(answer));
	}
	else
	{
		Client.addIceCandidate(offer);
	}
}