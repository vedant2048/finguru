import { toUserFacingError } from "./errors";
import type { Emit } from "./pipeline";

/**
 * Runs a pipeline and streams its progress events to the client as NDJSON
 * (one JSON object per line), so the UI can show real per-stage progress.
 */
export function streamPipeline(run: (emit: Emit) => Promise<void>): Response {
  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const emit: Emit = (event) => controller.enqueue(encoder.encode(JSON.stringify(event) + "\n"));
      try {
        await run(emit);
      } catch (err) {
        emit({ type: "error", ...toUserFacingError(err) });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Accel-Buffering": "no",
    },
  });
}
