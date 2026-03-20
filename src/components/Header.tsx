import { Link } from '@tanstack/react-router'
import ThemeToggle from './ThemeToggle'

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 px-4 backdrop-blur-lg">
      <nav className="max-w-5xl mx-auto flex items-center justify-between py-4">
        <div className="flex items-center gap-8">
          <Link
            to="/"
            className="text-xl font-bold text-gray-900 no-underline flex items-center gap-2"
          >
            <div className="w-2 h-6 bg-blue-600 rounded-full" />
            Task Tracker
          </Link>

          <div className="flex items-center gap-6 text-sm font-medium">
            <Link
              to="/"
              className="text-gray-600 hover:text-blue-600 transition"
              activeProps={{ className: 'text-blue-600' }}
            >
              Dashboard
            </Link>
            <Link
              to="/preview"
              className="text-gray-600 hover:text-blue-600 transition"
              activeProps={{ className: 'text-blue-600' }}
            >
              Excel Preview
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <ThemeToggle />
        </div>
      </nav>
    </header>
  )
}
