import axios from "axios";

export const fetchModrinth = axios.create({baseURL: "https://api.modrinth.com/v2"})

export async function fetchProgress(response: FetchResponse, do_progress: (props: { loaded: number, total: number }) => void) {
    const contentLength = response.headers.get('content-length');
    const total = parseInt(contentLength, 10);
    let loaded = 0;

    const res = new Response(new ReadableStream({
        async start(controller) {
            const reader = response.body.getReader();
            while (true) {
                const {done, value} = await reader.read();
                if (done) break;
                loaded += value.byteLength;
                do_progress({loaded, total})
                controller.enqueue(value);
            }
            controller.close();
        },
    }));
    return res.blob();
}

export enum ModrinthMod {
    FabricAPI = "P7dR8mSH",
    Sodium = "AANobbMI"
}