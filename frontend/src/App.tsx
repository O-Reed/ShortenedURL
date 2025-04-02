import UrlShortener from "./components/UrlShortener";

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <div className="max-w-md mx-auto">
          <header className="text-center mb-6">
            <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800 mb-1">
              URL Shortener
            </h1>
            <p className="text-sm text-gray-600">
              Create shorter links instantly
            </p>
          </header>
          <UrlShortener />
        </div>
      </div>
    </div>
  );
}

export default App;
