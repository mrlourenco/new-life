import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  error: Error | null
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  render() {
    if (this.state.error) {
      return (
        <div className="h-full flex flex-col items-center justify-center px-6 text-center bg-[#0f0f0f]">
          <h1 className="text-lg font-bold text-white mb-2">Algo correu mal</h1>
          <p className="text-sm text-[#737373] mb-6">
            Ocorreu um erro inesperado. Os teus dados estão guardados no dispositivo.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-[#f97316] rounded-xl text-white font-semibold"
          >
            Recarregar
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
