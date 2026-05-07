import type { ReactNode } from "react";
import { Component } from "react";

interface ErrorBoundaryState {
  message: string | undefined;
}

export class ErrorBoundary extends Component<
  { children: ReactNode },
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { message: undefined };

  static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    return {
      message: error instanceof Error ? error.message : "Unknown application error",
    };
  }

  render() {
    if (this.state.message) {
      return (
        <main className="fatal-error" role="alert">
          <h1>Slime Mold Pathfinding</h1>
          <p>{this.state.message}</p>
          <a href={__REPOSITORY_URL__}>Open repository</a>
        </main>
      );
    }

    return this.props.children;
  }
}
