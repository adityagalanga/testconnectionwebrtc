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
		LocalConnection = new RTCPeerConnection();
		dataChannel = LocalConnection.createDataChannel("channel");

		//set callback
		dataChannel.onopen = () => runtime.callFunction("OnOpenClient");
		dataChannel.onmessage = e => runtime.callFunction("OnMessageClient",[e.data]);
		dataChannel.onerror = (error) => runtime.callFunction("OnErrorClient",[error]);
		dataChannel.onclose = (close) => runtime.callFunction("OnCloseClient",[close]);
		
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
		.then(offer => 
		{
			LocalConnection.setLocalDescription(offer);
			runtime.callFunction("SendOffer",[JSON.stringify(offer)]);
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

export function AddIceCandidate(data)
{
	LocalConnection.addIceCandidate(JSON.parse(data)).then(() => console.log("SUCCESS ADD ICE"), (e) => console.add("ERROR"));
	console.log(LocalConnection.connectionState);
}