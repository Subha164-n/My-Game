# 🚀 Space Shooter

A visually engaging arcade-style space shooter game built with React, TypeScript, and Canvas. Features retro sound effects, background music, particle effects, and smooth gameplay.

![Space Shooter Game](https://img.shields.io/badge/Game-Space%20Shooter-blue)
![React](https://img.shields.io/badge/React-18.2.0-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2.2-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4.0-06B6D4)

## 🎮 Features

- **Smooth Gameplay**: 60fps canvas-based rendering with fluid animations
- **Retro Audio**: Procedural sound effects and background music using Web Audio API
- **Particle Effects**: Explosion particles and visual feedback
- **Progressive Difficulty**: Game speed increases as score grows
- **Local High Scores**: Persistent high score tracking
- **Responsive Design**: Works on desktop and mobile devices
- **Mute Controls**: Toggle audio on/off with persistent settings

## 🎯 How to Play

- **Movement**: Use WASD keys or Arrow keys to move your spaceship
- **Shooting**: Press Spacebar to shoot bullets
- **Objective**: Destroy enemies to earn points while avoiding collisions
- **Scoring**: Each enemy destroyed gives you 10 points

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/space-shooter-game.git
cd space-shooter-game
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:3000`

## 🛠️ Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

### Tech Stack

- **Frontend**: React 18, TypeScript
- **Styling**: Tailwind CSS v4
- **Build Tool**: Vite
- **UI Components**: Custom shadcn/ui components
- **Audio**: Web Audio API
- **Graphics**: HTML5 Canvas

## 📦 Deployment

### Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory, ready for deployment to any static hosting service.

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Deploy to Netlify

1. Build the project: `npm run build`
2. Drag and drop the `dist/` folder to [Netlify Deploy](https://app.netlify.com/drop)

### Deploy to GitHub Pages

1. Build the project: `npm run build`
2. Push the `dist/` folder to a `gh-pages` branch
3. Enable GitHub Pages in repository settings

## 🎨 Customization

### Audio System

The game uses a custom audio manager with procedural sound generation:

- **Shooting**: Square wave with frequency sweep
- **Explosions**: Filtered noise with envelope
- **Background Music**: Simple melody loop
- **Game Events**: Chord progressions for start/game over

### Game Parameters

Modify game settings in `SpaceShooterGame.tsx`:

```typescript
const CANVAS_WIDTH = 800;     // Game area width
const CANVAS_HEIGHT = 600;    // Game area height
enemySpawnRate: 1000,         // Enemy spawn interval (ms)
```

### Styling

The game uses Tailwind CSS with custom design tokens. Modify colors and spacing in `styles/globals.css`.

## 🏗️ Project Structure

```
├── components/
│   ├── AudioManager.tsx      # Audio system hook
│   ├── SpaceShooterGame.tsx  # Main game component
│   └── ui/                   # Reusable UI components
├── styles/
│   └── globals.css           # Global styles and Tailwind config
├── public/                   # Static assets
├── App.tsx                   # Root component
├── main.tsx                  # React entry point
└── index.html                # HTML template
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -am 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Vite](https://vitejs.dev/) for fast development
- UI components based on [shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide React](https://lucide.dev/)
- Styling with [Tailwind CSS](https://tailwindcss.com/)

## 🐛 Bug Reports

If you find a bug, please create an issue with:
- Description of the bug
- Steps to reproduce
- Expected behavior
- Browser and OS information

---

**Enjoy playing Space Shooter! 🎮✨**