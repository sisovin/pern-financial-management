import '../styles/App.css'; // Change to correct relative path

const HomePage = () => {
  return (
    <div className="content">
      <h1 className="app-title">Rsbuild with React Lynx</h1>
      <p>Start building amazing things with Rsbuild for ReactLynx.</p>
      <footer>
        {/* // Display the current year */}
        <p>© {new Date().getFullYear()} - Rsbuild. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default HomePage;