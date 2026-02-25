import { Component, Suspense, lazy } from "react";

const ResumeBuilder = lazy(() => import("./components/ResumeBuilder"));

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("App crash:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 40, fontFamily: "sans-serif" }}>
          <h1 style={{ color: "#DC2626" }}>Something went wrong</h1>
          <pre style={{ background: "#F3F4F6", padding: 20, borderRadius: 8, overflow: "auto" }}>
            {this.state.error?.toString()}
          </pre>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            style={{ marginTop: 16, padding: "8px 16px", cursor: "pointer" }}
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function Loading() {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      height: "100vh",
      fontFamily: "sans-serif",
      color: "#6B7280",
    }}>
      Loading Application Builder...
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<Loading />}>
        <ResumeBuilder />
      </Suspense>
    </ErrorBoundary>
  );
}

export default App;
