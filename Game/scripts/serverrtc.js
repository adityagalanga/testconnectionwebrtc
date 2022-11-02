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

export let Peers = {};
export let dataChannel = {};

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

export function CreateAnswer(id,offer)
{
	Peers[id] = new RTCPeerConnection(iceConfiguration);

	//ini diubah jadi ngirim data ice candidate
	Peers[id].onicecandidate = (event) => {
		if(event.candidate != null)
		{
			runtime.callFunction("SignalIceCandidate",[id],[JSON.stringify(event.candidate)]);
		}
	};

	Peers[id].ondatachannel = e => 
	{
		dataChannel[id] = e.channel;
		dataChannel[id].onopen = () => runtime.callFunction("OnOpenClient",[id]);
		dataChannel[id].onmessage = e => runtime.callFunction("OnMessageClient",[id],[e.data]);
		dataChannel[id].onerror = (error) => runtime.callFunction("OnErrorClient",[id],[error]);
		dataChannel[id].onclose = (close) => runtime.callFunction("OnCloseClient",[id],[close]);
	}

	Peers[id].setRemoteDescription(JSON.parse(offer));

	//ini yang nanti dikirim buat answer
	Peers[id].createAnswer()
		.then(answer => Peers[id].setLocalDescription(answer))
		.then(() => 
			  {
		runtime.callFunction("SendAnswer",[id],[JSON.stringify(Peers[id].localDescription)]);
	});
}

export function SendMessage(id,data)
{
	dataChannel[id].send(data);
}

export function AddIceCandidate(id,data)
{	
	Peers[id].addIceCandidate(JSON.parse(data));
}