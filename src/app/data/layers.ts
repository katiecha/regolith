// Mermaid diagram source for the "Layers" section on the home page.
// Kept as editable mermaid text so the diagram can be revised in place.

// The equivalent block in the question-framed loop, shown when a Figure-1
// state is hovered. Keyed by the Figure-1 state's display label.
export type FigureBlock = { state: string; note: string };

export const LAYER_FIGURES: {
  id: string;
  title: string;
  chart: string;
  hoverMap?: Record<string, FigureBlock>;
}[] = [
  {
    id: "operating-system",
    title: "The operating system",
    chart: `stateDiagram-v2

    [*] --> Physical_System

    state "Physical System" as Physical_System
    state "Observable Signals" as Signals
    state "Trust Layer" as Trust
    state "State Estimation" as Estimate
    state "Industrial Memory" as Memory
    state "Prediction" as Prediction
    state "Planning & Control" as Control

    Physical_System --> Signals
    Signals --> Trust
    Trust --> Estimate
    Estimate --> Memory
    Memory --> Prediction
    Prediction --> Control
    Control --> Physical_System

    note right of Signals
        Temperature
        Pressure
        Voltage
        Current
        Vibration
        Acoustic
        Flow
    end note

    note right of Trust
        Sensor Health
        Calibration
        Drift Detection
        Outlier Detection
        Confidence Scores
    end note

    note right of Estimate
        Sensor Fusion
        Physics Models
        Hidden State
        Digital Twin
    end note

    note right of Memory
        Historical Runs
        Failure Signatures
        Maintenance
        Process Drift
        Similar Systems
    end note

    note right of Prediction
        Remaining Useful Life
        Fault Prediction
        Process Stability
        Future State
    end note

    note right of Control
        Planner
        MPC / PID
        Setpoint Optimization
        Autonomous Recovery
    end note`,
    hoverMap: {
      "Physical System": { state: "Act", note: "Execute control" },
      "Observable Signals": { state: "Observe", note: "What can I measure?" },
      "Trust Layer": { state: "Trust", note: "Which signals should I believe?" },
      "State Estimation": { state: "Estimate", note: "What is actually happening?" },
      "Industrial Memory": { state: "Remember", note: "Have I seen this before?" },
      Prediction: { state: "Predict", note: "What will happen next?" },
      "Planning & Control": { state: "Decide", note: "What should I do?" },
    },
  },
];
