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

export async function CreateOffer()
{
	if(Server == null)
	{
		Server = new RTCPeerConnection();
		dataChannel = Server.createDataChannel("channel");

		dataChannel.onmessage = e => console.log(e.data);
		dataChannel.onopen = e => console.log("masuk");
		
		//ini diubah jadi ngirim data ice candidate
		Server.onicecandidate = () => {runtime.callFunction("SignalIceCandidate",[JSON.stringify(Server.localDescription)])};
		
		//ini yang nanti dikirim buat answer
		Server.createOffer()
		.then(offer => Server.setLocalDescription(offer))
		.then(() => 
		{
			runtime.callFunction("SendOffer",[JSON.stringify(Server.localDescription)]);
		});
	}
}

export function SetRemoteDescription(data)
{
	Server.setRemoteDescription(JSON.parse(data));
}

export function SendMessage(data)
{
	dataChannel.send(data);
}

export function CheckState()
{
	console.log(Server.signalingState);
	console.log(Server.connectionState);
}

export function AddIceCandidate(data)
{
	Server.addIceCandidate(JSON.parse(data));
	console.log(Server.connectionState);
}