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

export let Server = null;

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

export function CreateOffer()
{
	if(Server == null)
	{
		Server = new RTCPeerConnection(iceConfiguration);
		const dataChannel = Server.createDataChannel("channel");

		dataChannel.onmessage = e => console.log(e.data);
		dataChannel.onopen = e => console.log("KONEKSI MASUK");

		Server.onicecandidate = () => {runtime.callFunction("SignalIceCandidate",[JSON.stringify(Server.localDescription)])};

		Server.createOffer().then(offer =>Server.setLocalDescription(offer));
	}
}

export function SetRemoteDescription(data)
{
	Server.setRemoteDescription(data);
}