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

export let Server;
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

export function CreateOffer()
{
	if(Server == null)
	{
		Server = new RTCPeerConnection(iceConfiguration);
		dataChannel = Server.createDataChannel("channel");

		dataChannel.onmessage = e => console.log(e.data);
		dataChannel.onopen = e => console.log("KONEKSI MASUK");
		
		//ini diubah jadi ngirim data ice candidate
		Server.onicecandidate = () => {runtime.callFunction("SignalIceCandidate",[JSON.stringify(Server.localDescription)])};
		
		//ini yang nanti dikirim buat answer
		Server.createOffer().then(offer =>Server.setLocalDescription(offer));
	}
}

export function SetRemoteDescription(data)
{
	Server.setRemoteDescription(data);
}

export function SendMessage(data)
{
	dataChannel.send(data);
}

export function AddIceCandidate(data)
{
	Server.addIceCandidate(offer);
}