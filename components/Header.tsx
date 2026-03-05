import { Trophy } from "lucide-react";

export default function Header() {
  return (
    <header className="bg-gray-800 border-b border-gray-700">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center gap-3">
          <Trophy className="w-8 h-8 text-yellow-500" />
          <h1 className="text-2xl font-bold text-white">BGMI Point Table Maker</h1>
        </div>
      </div>
    </header>
  );
}


