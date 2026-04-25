import { useEffect, useState } from "react";
import "./App.css";

function getMagnitude(x, y) {
  return Math.sqrt(x * x + y * y);
}

function StickPanel({ title, x, y }) {
  const magnitude = getMagnitude(x, y);

  const dotx = 100 + x * 90;
  const doty = 100 + y * 90;

  return (
    <div className="stick-panel">
      <h2>{title}</h2>

      <div className="stick-visual">
        <div className="stick-dot"
          style={{ left: `${dotx}px`, top: `${doty}px` }}
        />
      </div>

      <div className="stick-info">
        <p>X: {x.toFixed(4)}</p>
        <p>Y: {y.toFixed(4)}</p>
        <p>Magnitude: {magnitude.toFixed(4)}</p>
      </div>
    </div>
  );
}

export default function App() {
  const [controller, setController] = useState(null);
  const [axes, setAxes] = useState([0, 0, 0, 0]);

  useEffect(() => {
    let animationFrameId;

    function readController() {
      const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
      const connectedController = Array.from(gamepads).find(Boolean);

      if (connectedController) {
        setController({
          id: connectedController.id,
          index: connectedController.index,
          axesCount: connectedController.axes.length,
          buttonCount: connectedController.buttons.length,
        });

        setAxes(connectedController.axes);
      } else {
        setController(null);
        setAxes([0, 0, 0, 0]);
      }
      
      animationFrameId = requestAnimationFrame(readController);
    }

    readController();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const leftStickX = axes[0] ?? 0;
  const leftStickY = axes[1] ?? 0;
  const rightStickX = axes[2] ?? 0;
  const rightStickY = axes[3] ?? 0;

  return (
    <main className="app">
      <header className="header">
        <h1>Driftly</h1>
        <p>Controller diagnostics tool</p>
      </header>

      {!controller ? (
        <section className="empty-state">
          <h2>No controller detected</h2>
          <p>Connect a controller to see its status.</p>
        </section>
      ) : (<>
          <section className="controller-card">
            <p>
              <strong>Controller:</strong> {controller.id}
            </p>
            <p>
              <strong>Axes:</strong> {controller.axesCount}
            </p>
            <p>
              <strong>Buttons:</strong> {controller.buttonCount}
            </p>
          </section>

          <section className="stick-grid">
            <StickPanel title="Left Stick" x={leftStickX} y={leftStickY} />
            <StickPanel title="Right Stick" x={rightStickX} y={rightStickY} />
          </section>
        </>
      )}
    </main>
  );
}