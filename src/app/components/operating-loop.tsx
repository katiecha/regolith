const OPERATING_LOOP = [
  { verb: "Observe", question: "What can I measure?" },
  { verb: "Trust", question: "Which signals should I believe?" },
  { verb: "Estimate", question: "What is actually happening?" },
  { verb: "Remember", question: "Have I seen this before?" },
  { verb: "Predict", question: "What will happen next?" },
  { verb: "Decide", question: "What should I do?" },
  { verb: "Act", question: "Execute control" },
];

export function OperatingLoop() {
  return (
    <div className="max-w-md mx-auto">
      <ol className="space-y-6">
        {OPERATING_LOOP.map((step, index) => (
          <li key={step.verb} className="flex gap-5">
            <span className="text-xs uppercase tracking-widest text-foreground opacity-40 tabular-nums pt-1">
              {String(index + 1).padStart(2, "0")}
            </span>
            <div>
              <p className="text-base text-foreground">{step.verb}</p>
              <p className="text-sm text-foreground opacity-60">{step.question}</p>
            </div>
          </li>
        ))}
      </ol>
      <div className="flex gap-5 mt-6 text-xs uppercase tracking-widest text-foreground opacity-40">
        <span aria-hidden="true">↻</span>
        <span>back to Observe</span>
      </div>
    </div>
  );
}
