import { SpaceShooterGame } from "./components/SpaceShooterGame";

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-2">
            Space Shooter
          </h1>
          <p className="text-slate-300">A visually engaging arcade-style space game</p>
        </div>
        <SpaceShooterGame />
      </div>
    </div>
  );
}