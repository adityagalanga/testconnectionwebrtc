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

export let LocalConnection;
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
	if(LocalConnection == null)
	{
		LocalConnection = new RTCPeerConnection(iceConfiguration);
		dataChannel = LocalConnection.createDataChannel("channel");

		dataChannel.onmessage = e => console.log(e.data);
		dataChannel.onopen = () => console.log("masuk");
		dataChannel.onerror = (error) => {
  			console.log("Data Channel Error:", error);
		};
		
		//ini diubah jadi ngirim data ice candidate
		LocalConnection.onicecandidate = (event) => 
		{
			if(event.candidate != null)
			{
				runtime.callFunction("SignalIceCandidate",[JSON.stringify(event.candidate)]);
			}
		};
		
		//ini yang nanti dikirim buat answer
		LocalConnection.createOffer()
		.then(offer => LocalConnection.setLocalDescription(offer))
		.then(() => 
		{
			runtime.callFunction("SendOffer",[JSON.stringify(LocalConnection.localDescription)]);
		});
	}
}

export function SetRemoteDescription(data)
{
	LocalConnection.setRemoteDescription(JSON.parse(data));
	console.log(JSON.parse(data));
}

export function SendMessage(data)
{
	dataChannel.send(data);
}

export function CheckState()
{
	console.log(LocalConnection.signalingState);
	console.log(LocalConnection.connectionState);
	console.log(LocalConnection.iceConnectionState);
	console.log(LocalConnection.iceGatheringState);
	console.log(LocalConnection.currentLocalDescription);
	console.log(LocalConnection.currentRemoteDescription);
}

export function AddIceCandidate(data)
{
	LocalConnection.addIceCandidate(JSON.parse(data)).then(() => console.log("SUCCESS ADD ICE"), (e) => console.add("ERROR"));
	console.log(LocalConnection.connectionState);
}