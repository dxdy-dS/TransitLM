import { NextRequest, NextResponse } from "next/server";
import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

const SCRIPT_MAP: Record<number, string> = {
  1: "transitlm-review/single_route/evaluate.py",
  2: "transitlm-review/personalized/evaluate.py",
  3: "transitlm-review/diversity/evaluate.py",
  4: "transitlm-review/general_llm/evaluate.py",
  5: "transitlm-review/single_route/evaluate.py",
  6: "transitlm-review/personalized/evaluate.py",
  7: "transitlm-review/diversity/evaluate.py",
  8: "transitlm-review/general_llm/evaluate.py",
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { benchmark, inputField } = body;

    if (!benchmark || ![1, 2, 3, 4, 5, 6, 7, 8].includes(Number(benchmark))) {
      return NextResponse.json(
        { error: "Invalid benchmark. Must be 1-8." },
        { status: 400 }
      );
    }

    const benchmarkId = Number(benchmark);
    const script = SCRIPT_MAP[benchmarkId];

    if (!script) {
      return NextResponse.json(
        { error: `No script found for benchmark ${benchmarkId}` },
        { status: 400 }
      );
    }

    const args: string[] = [];
    if (inputField) {
      args.push("--input_field", inputField);
    }

    // For benchmark 4 or 8, we need to provide a default input path
    if (benchmarkId === 4 || benchmarkId === 8) {
      args.push("--input", "transitlm-review/data/general_llm_example.csv");
    }

    const { stdout, stderr } = await execFileAsync("python3", [script, ...args], {
      cwd: "/home/z/my-project",
      timeout: 120000,
      maxBuffer: 10 * 1024 * 1024,
    });

    return NextResponse.json({
      benchmark: benchmarkId,
      script,
      stdout: stdout.trim(),
      stderr: stderr.trim() || null,
      timestamp: new Date().toISOString(),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const stderr =
      error && typeof error === "object" && "stderr" in error
        ? (error as { stderr: string }).stderr
        : null;

    return NextResponse.json(
      {
        error: "Evaluation failed",
        details: message,
        stderr: stderr?.trim() || null,
      },
      { status: 500 }
    );
  }
}
