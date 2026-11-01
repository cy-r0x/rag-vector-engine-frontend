import { CopyButton } from "./copy-button";

function nodeExample(wsUrl: string) {
  return `import WebSocket from "ws"; // npm install ws

const socket = new WebSocket("${wsUrl}", {
  headers: { Authorization: \`Bearer \${process.env.RVE_SOCKET_TOKEN}\` },
});

socket.on("open", () => {
  socket.send(JSON.stringify({ query: "What was revenue growth last quarter?", session_id: "customer-42" }));
});

let answer = "";
socket.on("message", (raw) => {
  const frame = JSON.parse(raw.toString());
  if (frame.type === "delta") answer += frame.content;     // streamed answer text
  if (frame.type === "done") console.log(answer, frame.sources);
  if (frame.type === "error") console.error(frame.detail);
});`;
}

function pythonExample(wsUrl: string) {
  return `import asyncio, json, os
import websockets  # pip install websockets

async def ask(question: str) -> None:
    headers = {"Authorization": f"Bearer {os.environ['RVE_SOCKET_TOKEN']}"}
    async with websockets.connect("${wsUrl}", additional_headers=headers) as socket:
        await socket.send(json.dumps({"query": question, "session_id": "customer-42"}))
        answer = ""
        async for raw in socket:
            frame = json.loads(raw)
            if frame["type"] == "delta":
                answer += frame["content"]
            elif frame["type"] == "done":
                print(answer, frame["sources"])
                break
            elif frame["type"] == "error":
                raise RuntimeError(frame["detail"])

asyncio.run(ask("What was revenue growth last quarter?"))`;
}

export function IntegrationGuide({ wsUrl }: { wsUrl: string }) {
  const examples = [
    { title: "Node.js", code: nodeExample(wsUrl) },
    { title: "Python", code: pythonExample(wsUrl) },
  ];

  return (
    <section className="rounded-[12px] border border-hairline bg-canvas p-8 shadow-level-1">
      <h2 className="text-[22px] leading-[1.1] font-light tracking-[-0.22px] text-ink">Integrate from your backend</h2>
      <ul className="mt-4 list-disc space-y-1.5 pl-5 text-[15px] leading-[1.5] text-ink-secondary">
        <li>
          Send the token in an <code className="font-mono text-[13px]">Authorization: Bearer &lt;token&gt;</code>{" "}
          header (or a <code className="font-mono text-[13px]">?token=</code> query parameter if your client can&apos;t
          set headers).
        </li>
        <li>
          Send <code className="font-mono text-[13px]">{'{"query": "...", "session_id": "optional"}'}</code>; you
          receive <code className="font-mono text-[13px]">delta</code> frames with the streamed answer, then a{" "}
          <code className="font-mono text-[13px]">done</code> frame with the sources, or an{" "}
          <code className="font-mono text-[13px]">error</code> frame.
        </li>
        <li>Answers only use your business&apos;s indexed documents.</li>
        <li>
          After a rotation, open sockets using the old token are closed (code 4401) on their next message: reconnect
          with the new token.
        </li>
      </ul>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {examples.map((example) => (
          <div key={example.title} className="min-w-0">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-[15px] font-normal text-ink">{example.title}</h3>
              <CopyButton value={example.code} />
            </div>
            <pre className="overflow-x-auto rounded-[8px] bg-brand-dark p-4 font-mono text-[12px] leading-[1.55] text-white">
              {example.code}
            </pre>
          </div>
        ))}
      </div>
    </section>
  );
}
