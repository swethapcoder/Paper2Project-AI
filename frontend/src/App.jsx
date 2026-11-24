
import { useState } from "react";
import "./App.css";

const API_URL = "http://127.0.0.1:8000";

function App() {
  const [query, setQuery] = useState("");
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  const searchPapers = async (event) => {
    event.preventDefault();

    if (!query.trim()) return;

    setLoading(true);
    setError("");
    setPapers([]);
    setSearched(false);

    try {
      const response = await fetch(
        `${API_URL}/api/search?query=${encodeURIComponent(query)}&limit=10`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Search failed");
      }

      setPapers(data.papers);
      setSearched(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <header className="navbar">
        <div className="logo">
          <span className="logo-icon">P</span>
          Paper2Project <span className="ai">AI</span>
        </div>

        <nav>
          <a href="#home">Home</a>
          <a href="#features">Features</a>
          <a href="#results">Research</a>
        </nav>

        <div className="nav-tag">AI RESEARCH PLATFORM</div>
      </header>

      <main>
        <section className="hero" id="home">
          <div className="hero-content">
            <div className="tag">
              ✦ AI-POWERED RESEARCH DISCOVERY
            </div>

            <h1>
              Turn Research
              <br />
              Into <span>Innovation.</span>
            </h1>

            <p className="hero-description">
              Discover research papers, explore existing studies,
              identify research gaps and transform your ideas
              into meaningful projects with AI.
            </p>

            <form className="search-box" onSubmit={searchPapers}>
              <span className="search-icon">⌕</span>

              <input
                type="text"
                placeholder="Enter your research topic or project title..."
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />

              <button type="submit" disabled={loading || !query.trim()}>
                {loading ? "Searching..." : "Search Papers →"}
              </button>
            </form>

            <p className="search-hint">
              Try: Artificial Intelligence in Healthcare
            </p>

            <div className="hero-stats">
              <div>
                <strong>Multi-domain</strong>
                <span>Research discovery</span>
              </div>
              <div>
                <strong>AI-powered</strong>
                <span>Research assistance</span>
              </div>
              <div>
                <strong>OpenAlex</strong>
                <span>Academic data source</span>
              </div>
            </div>
          </div>
        </section>

        {loading && (
          <div className="status">
            <div className="loader"></div>
            Searching academic research papers...
          </div>
        )}

        {error && (
          <div className="error">
            {error}
          </div>
        )}

        {searched && (
          <section className="results-section" id="results">
            <div className="section-heading">
              <div>
                <span className="eyebrow">DISCOVERED KNOWLEDGE</span>
                <h2>Research Papers</h2>
                <p>Search results for "{query}"</p>
              </div>

              <span className="result-count">
                {papers.length} papers retrieved
              </span>
            </div>

            {papers.length === 0 ? (
              <p>No papers found. Try another topic.</p>
            ) : (
              <div className="paper-list">
                {papers.map((paper, index) => (
                  <article className="paper-card" key={paper.id || index}>
                    <div className="paper-top">
                      <span className="paper-label">
                        PAPER {index + 1}
                      </span>
                      <span className="paper-year">
                        {paper.year || "Year unavailable"}
                      </span>
                    </div>

                    <h3>{paper.title}</h3>

                    <p className="authors">
                      {paper.authors.join(", ") || "Authors unavailable"}
                    </p>

                    <p className="abstract">
                      {paper.abstract}
                    </p>

                    <div className="paper-meta">
                      <span>✦ {paper.citations} citations</span>
                      {paper.journal && <span>{paper.journal}</span>}
                      <span>
                        {paper.is_open_access
                          ? "Open Access"
                          : "Access status unavailable"}
                      </span>
                    </div>

                    <div className="paper-links">
                      {paper.paper_url && (
                        <a
                          href={paper.paper_url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          View Research Paper ↗
                        </a>
                      )}

                      {paper.pdf_url && (
                        <a
                          href={paper.pdf_url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          View PDF ↗
                        </a>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}

        <section className="features-section" id="features">
          <div className="section-heading centered">
            <span className="eyebrow">YOUR RESEARCH COMPANION</span>
            <h2>From Papers to Projects</h2>
            <p>
              One platform to explore knowledge and discover new opportunities.
            </p>
          </div>

          <div className="feature-grid">
            <article className="feature-card">
              <div className="feature-icon">⌕</div>
              <h3>Research Discovery</h3>
              <p>
                Find relevant academic papers across research domains.
              </p>
              <span className="feature-status active">Available now</span>
            </article>

            <article className="feature-card">
              <div className="feature-icon">▤</div>
              <h3>Paper Analysis</h3>
              <p>
                Understand and compare research papers using AI.
              </p>
              <span className="feature-status">Coming next</span>
            </article>

            <article className="feature-card">
              <div className="feature-icon">✧</div>
              <h3>Research Gap Detection</h3>
              <p>
                Discover potential opportunities for further research.
              </p>
              <span className="feature-status">Coming next</span>
            </article>

            <article className="feature-card">
              <div className="feature-icon">◇</div>
              <h3>Project Idea Generator</h3>
              <p>
                Transform research insights into practical project ideas.
              </p>
              <span className="feature-status">Coming next</span>
            </article>
          </div>
        </section>
      </main>

      <footer>
        <div className="logo">
          <span className="logo-icon">P</span>
          Paper2Project <span className="ai">AI</span>
        </div>
        <p>Discover Research. Identify Gaps. Build Innovation.</p>
        <span>© 2026 Paper2Project AI</span>
      </footer>
    </div>
  );
}

export default App;
