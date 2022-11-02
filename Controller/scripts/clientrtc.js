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
        urls: [
          "stun:stun1.l.google.com:19302",
          "stun:stun2.l.google.com:19302",
        ],
      },
	],
}

export async function CreateOffer()
{
	if(Server == null)
	{
		Server = new RTCPeerConnection(iceConfiguration);
		dataChannel = Server.createDataChannel("channel");

		dataChannel.onmessage = e => console.log(e.data);
		dataChannel.onopen = () => console.log("masuk");
		dataChannel.onerror = (error) => {
  			console.log("Data Channel Error:", error);
		};
		
		//ini diubah jadi ngirim data ice candidate
		Server.onicecandidate = (event) => 
		{
			if(event.candidate != null)
			{
				runtime.callFunction("SignalIceCandidate",[JSON.stringify(event.candidate)]);
			}
		};
		
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
	console.log(JSON.parse(data));
}

export function SendMessage(data)
{
	dataChannel.send(data);
}

export function CheckState()
{
	console.log(Server.signalingState);
	console.log(Server.connectionState);
	console.log(Server.iceConnectionState);
	console.log(Server.iceGatheringState);
	console.log(Server.currentLocalDescription);
	console.log(Server.currentRemoteDescription);
}

export function AddIceCandidate(data)
{
	Server.addIceCandidate(JSON.parse(data)).then(() => console.log("SUCCESS ADD ICE"), (e) => console.add("ERROR"));
	console.log(Server.connectionState);
}